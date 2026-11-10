import { useCallback, useMemo, useRef, useState } from 'react';

export type PaginationItemType =
  | 'page'
  | 'start-ellipsis'
  | 'end-ellipsis'
  | 'first'
  | 'previous'
  | 'next'
  | 'last';

export interface PaginationItem {
  /** Kind of item to render. */
  type: PaginationItemType;
  /** Page the item navigates to (for ellipses: `null`). */
  page: number | null;
  /** `true` when this item represents the current page. */
  selected: boolean;
  /** `true` when the item cannot be interacted with. */
  disabled: boolean;
  /** Navigate to `page`. No-op for ellipses and disabled items. */
  onClick: () => void;
}

export interface UsePaginationOptions {
  /** Total number of pages. Either this or `totalItems` is required. */
  totalPages?: number;
  /** Total number of items. Used together with `pageSize` to compute `totalPages`. */
  totalItems?: number;
  /** Items per page when `totalItems` is used. @default 10 */
  pageSize?: number;
  /** Current page (1-based). Makes the hook controlled. */
  page?: number;
  /** Initial page for uncontrolled usage. @default 1 */
  defaultPage?: number;
  /** Called whenever the page changes. */
  onChange?: (page: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Pages always shown at the start and end. @default 1 */
  boundaryCount?: number;
  /** Render "first" button. @default false */
  showFirstButton?: boolean;
  /** Render "last" button. @default false */
  showLastButton?: boolean;
  /** Hide "previous" button. @default false */
  hidePrevButton?: boolean;
  /** Hide "next" button. @default false */
  hideNextButton?: boolean;
  /** Disable every item. @default false */
  disabled?: boolean;
}

export interface UsePaginationResult {
  /** Items ready to render, in order. */
  items: PaginationItem[];
  /** Current page (1-based, clamped to `[1, totalPages]`). */
  page: number;
  /** Computed total number of pages (at least 1). */
  totalPages: number;
  /** Navigate to a page. Values are clamped. */
  setPage: (page: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Builds the ordered list of page numbers and ellipses for a pagination control.
 * Pure function – handy for custom renderers or server-side usage.
 */
export function getPageRange(
  page: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1,
): Array<number | 'start-ellipsis' | 'end-ellipsis'> {
  const count = Math.max(1, Math.floor(totalPages));
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundary = Math.max(0, Math.floor(boundaryCount));
  const current = clamp(Math.floor(page), 1, count);

  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  const result: Array<number | 'start-ellipsis' | 'end-ellipsis'> = [...startPages];

  if (siblingsStart > boundary + 2) {
    result.push('start-ellipsis');
  } else if (boundary + 1 < count - boundary) {
    result.push(boundary + 1);
  }

  result.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundary - 1) {
    result.push('end-ellipsis');
  } else if (count - boundary > boundary) {
    result.push(count - boundary);
  }

  result.push(...endPages);

  // Remove duplicates / out-of-range values that can appear with tiny page counts.
  const seen = new Set<number>();
  return result.filter((item) => {
    if (typeof item !== 'number') return true;
    if (item < 1 || item > count || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

/**
 * Headless pagination hook. Returns the items to render plus navigation helpers,
 * so you can build fully custom UIs.
 */
export function usePagination(options: UsePaginationOptions): UsePaginationResult {
  const {
    totalPages: totalPagesProp,
    totalItems,
    pageSize = 10,
    page: pageProp,
    defaultPage = 1,
    onChange,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstButton = false,
    showLastButton = false,
    hidePrevButton = false,
    hideNextButton = false,
    disabled = false,
  } = options;

  const totalPages = Math.max(
    1,
    totalPagesProp !== undefined
      ? Math.floor(totalPagesProp)
      : Math.ceil((totalItems ?? 0) / Math.max(1, pageSize)),
  );

  const isControlled = pageProp !== undefined;
  const [internalPage, setInternalPage] = useState(defaultPage);
  const page = clamp(Math.floor(isControlled ? pageProp : internalPage) || 1, 1, totalPages);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setPage = useCallback(
    (next: number) => {
      const target = clamp(Math.floor(next) || 1, 1, totalPages);
      if (target === page) return;
      if (!isControlled) setInternalPage(target);
      onChangeRef.current?.(target);
    },
    [isControlled, page, totalPages],
  );

  const items = useMemo<PaginationItem[]>(() => {
    const make = (
      type: PaginationItemType,
      target: number | null,
      selected = false,
      itemDisabled = false,
    ): PaginationItem => {
      const isDisabled = disabled || itemDisabled || target === null;
      return {
        type,
        page: target,
        selected,
        disabled: isDisabled,
        onClick: () => {
          if (!isDisabled && target !== null) setPage(target);
        },
      };
    };

    const list: PaginationItem[] = [];
    if (showFirstButton) list.push(make('first', 1, false, page <= 1));
    if (!hidePrevButton) list.push(make('previous', page - 1, false, page <= 1));

    for (const entry of getPageRange(page, totalPages, siblingCount, boundaryCount)) {
      if (typeof entry === 'number') list.push(make('page', entry, entry === page));
      else list.push(make(entry, null));
    }

    if (!hideNextButton) list.push(make('next', page + 1, false, page >= totalPages));
    if (showLastButton) list.push(make('last', totalPages, false, page >= totalPages));
    return list;
  }, [
    page,
    totalPages,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
    setPage,
  ]);

  return {
    items,
    page,
    totalPages,
    setPage,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}

import React, { forwardRef } from 'react';
import { usePagination } from './usePagination';
import type { PaginationItem, UsePaginationOptions } from './usePagination';

export type PaginationSize = 'sm' | 'md' | 'lg';
export type PaginationVariant = 'outlined' | 'filled' | 'text';
export type PaginationShape = 'rounded' | 'circular';

export interface PaginationLabels {
  first?: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
  last?: React.ReactNode;
  ellipsis?: React.ReactNode;
}

export interface PaginationProps
  extends UsePaginationOptions,
    Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /** Size of the buttons. @default 'md' */
  size?: PaginationSize;
  /** Visual style. @default 'outlined' */
  variant?: PaginationVariant;
  /** Button shape. @default 'rounded' */
  shape?: PaginationShape;
  /** Custom content for navigation buttons and ellipsis. */
  labels?: PaginationLabels;
  /** Accessible label for the `<nav>` element. @default 'Pagination' */
  ariaLabel?: string;
  /** Builds the accessible label of each button. */
  getItemAriaLabel?: (type: PaginationItem['type'], page: number | null, selected: boolean) => string;
  /** Fully custom item renderer. Return `null` to skip an item. */
  renderItem?: (item: PaginationItem, defaultNode: React.ReactElement) => React.ReactNode;
  /** Hide the component when there is only one page. @default false */
  hideOnSinglePage?: boolean;
}

const defaultLabels: Required<PaginationLabels> = {
  first: '«',
  previous: '‹',
  next: '›',
  last: '»',
  ellipsis: '…',
};

const defaultAriaLabel: NonNullable<PaginationProps['getItemAriaLabel']> = (type, page, selected) => {
  switch (type) {
    case 'first':
      return 'Go to first page';
    case 'previous':
      return 'Go to previous page';
    case 'next':
      return 'Go to next page';
    case 'last':
      return 'Go to last page';
    case 'page':
      return selected ? `Page ${page}` : `Go to page ${page}`;
    default:
      return 'More pages';
  }
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

/**
 * Accessible, themeable pagination component.
 *
 * ```tsx
 * <Pagination totalPages={20} page={page} onChange={setPage} />
 * ```
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(props, ref) {
  const {
    // hook options
    totalPages,
    totalItems,
    pageSize,
    page,
    defaultPage,
    onChange,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
    // view options
    size = 'md',
    variant = 'outlined',
    shape = 'rounded',
    labels,
    ariaLabel = 'Pagination',
    getItemAriaLabel = defaultAriaLabel,
    renderItem,
    hideOnSinglePage = false,
    className,
    ...rest
  } = props;

  const pagination = usePagination({
    totalPages,
    totalItems,
    pageSize,
    page,
    defaultPage,
    onChange,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  });

  if (hideOnSinglePage && pagination.totalPages <= 1) return null;

  const text = { ...defaultLabels, ...labels };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cx(
        'rp-pagination',
        `rp-pagination--${size}`,
        `rp-pagination--${variant}`,
        `rp-pagination--${shape}`,
        className,
      )}
      {...rest}
    >
      <ul className="rp-pagination__list">
        {pagination.items.map((item, index) => {
          const isEllipsis = item.type === 'start-ellipsis' || item.type === 'end-ellipsis';
          const key = isEllipsis ? item.type : `${item.type}-${item.page ?? index}`;

          const node = isEllipsis ? (
            <span className="rp-pagination__ellipsis" aria-hidden="true">
              {text.ellipsis}
            </span>
          ) : (
            <button
              type="button"
              className={cx(
                'rp-pagination__item',
                `rp-pagination__item--${item.type}`,
                item.selected && 'rp-pagination__item--selected',
              )}
              disabled={item.disabled}
              aria-current={item.selected ? 'page' : undefined}
              aria-label={getItemAriaLabel(item.type, item.page, item.selected)}
              onClick={item.onClick}
            >
              {item.type === 'page' ? item.page : text[item.type as keyof PaginationLabels]}
            </button>
          );

          const content = renderItem ? renderItem(item, node) : node;
          if (content === null || content === undefined || content === false) return null;
          return <li key={key}>{content}</li>;
        })}
      </ul>
    </nav>
  );
});

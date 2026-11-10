# react-paginate-ts

[![npm version](https://img.shields.io/npm/v/react-paginate-ts.svg)](https://www.npmjs.com/package/react-paginate-ts)
[![npm downloads](https://img.shields.io/npm/dm/react-paginate-ts.svg)](https://www.npmjs.com/package/react-paginate-ts)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-paginate-ts)](https://bundlephobia.com/package/react-paginate-ts)
[![CI](https://github.com/FeruzDev/react-paginate-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/FeruzDev/react-paginate-ts/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-paginate-ts.svg)](./LICENSE)

Lightweight, accessible and fully typed **pagination** for React — a ready-to-use `<Pagination />` component plus a headless `usePagination` hook.

- ⚛️ React 16.8+ (works with 17, 18 and 19)
- 🟦 Written in TypeScript, types included
- ♿ Accessible: `<nav>`, `aria-current="page"`, labelled buttons
- 🎨 Optional CSS theme with CSS variables, sizes, variants, shapes, dark theme
- 🧠 Headless hook for fully custom UIs
- 📦 ESM + CommonJS, tree-shakeable, zero dependencies

## Install

```bash
npm install react-paginate-ts
```

## Quick start

```tsx
import { useState } from 'react';
import { Pagination } from 'react-paginate-ts';
import 'react-paginate-ts/styles.css'; // optional default theme

export default function App() {
  const [page, setPage] = useState(1);

  return <Pagination totalPages={20} page={page} onChange={setPage} />;
}
```

Uncontrolled usage also works:

```tsx
<Pagination totalItems={450} pageSize={10} defaultPage={1} onChange={(p) => console.log(p)} />
```

## `<Pagination />` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `totalPages` | `number` | – | Total number of pages. Either this or `totalItems` is required. |
| `totalItems` | `number` | – | Total number of items (used with `pageSize`). |
| `pageSize` | `number` | `10` | Items per page when `totalItems` is used. |
| `page` | `number` | – | Current page (1-based). Makes the component controlled. |
| `defaultPage` | `number` | `1` | Initial page in uncontrolled mode. |
| `onChange` | `(page: number) => void` | – | Called when the page changes. |
| `siblingCount` | `number` | `1` | Pages shown on each side of the current page. |
| `boundaryCount` | `number` | `1` | Pages always shown at the start and the end. |
| `showFirstButton` | `boolean` | `false` | Show the "first page" button. |
| `showLastButton` | `boolean` | `false` | Show the "last page" button. |
| `hidePrevButton` | `boolean` | `false` | Hide the "previous" button. |
| `hideNextButton` | `boolean` | `false` | Hide the "next" button. |
| `disabled` | `boolean` | `false` | Disable all buttons. |
| `hideOnSinglePage` | `boolean` | `false` | Render nothing when there is only one page. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size. |
| `variant` | `'outlined' \| 'filled' \| 'text'` | `'outlined'` | Visual style. |
| `shape` | `'rounded' \| 'circular'` | `'rounded'` | Button shape. |
| `labels` | `{ first, previous, next, last, ellipsis }` | `« ‹ › » …` | Custom content (text or icons). |
| `ariaLabel` | `string` | `'Pagination'` | Accessible label of the `<nav>`. |
| `getItemAriaLabel` | `(type, page, selected) => string` | English labels | Localize button labels. |
| `renderItem` | `(item, defaultNode) => ReactNode` | – | Custom renderer for each item. Return `null` to skip. |

Any other prop (`className`, `style`, `id`, `data-*`…) is forwarded to the `<nav>` element, and `ref` is forwarded too.

### Localization example

```tsx
<Pagination
  totalPages={10}
  labels={{ previous: 'Oldingi', next: 'Keyingi' }}
  ariaLabel="Sahifalar"
  getItemAriaLabel={(type, page) =>
    type === 'page' ? `${page}-sahifa` : type === 'next' ? 'Keyingi sahifa' : 'Oldingi sahifa'
  }
/>
```

### Routing example (links instead of buttons)

```tsx
<Pagination
  totalPages={10}
  page={page}
  renderItem={(item, node) =>
    item.type === 'page' ? <a href={`?page=${item.page}`}>{item.page}</a> : node
  }
/>
```

## Theming

Import `react-paginate-ts/styles.css` and override CSS variables:

```css
.rp-pagination {
  --rp-active-bg: #16a34a;
  --rp-active-border: #16a34a;
  --rp-radius: 4px;
  --rp-gap: 8px;
}
```

Available variables: `--rp-color`, `--rp-bg`, `--rp-border`, `--rp-hover-bg`, `--rp-active-color`, `--rp-active-bg`, `--rp-active-border`, `--rp-focus-ring`, `--rp-disabled-opacity`, `--rp-gap`, `--rp-radius`, `--rp-size`, `--rp-font-size`, `--rp-font-family`.

Dark theme: add `data-theme="dark"` to the component or any parent element.

Prefer your own styles (Tailwind, CSS modules…)? Skip the CSS import and target the class names: `rp-pagination`, `rp-pagination__list`, `rp-pagination__item`, `rp-pagination__item--selected`, `rp-pagination__item--{first|previous|next|last|page}`, `rp-pagination__ellipsis` — or use the hook below.

## Headless: `usePagination`

```tsx
import { usePagination } from 'react-paginate-ts';

function MyPagination() {
  const { items } = usePagination({ totalPages: 10 });

  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          {item.type.endsWith('ellipsis') ? (
            '…'
          ) : (
            <button onClick={item.onClick} disabled={item.disabled}>
              {item.type === 'page' ? item.page : item.type}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
```

Accepts the same options as the component (`totalPages`, `totalItems`, `pageSize`, `page`, `defaultPage`, `onChange`, `siblingCount`, `boundaryCount`, `showFirstButton`, `showLastButton`, `hidePrevButton`, `hideNextButton`, `disabled`) and returns:

| Field | Type | Description |
| --- | --- | --- |
| `items` | `PaginationItem[]` | `{ type, page, selected, disabled, onClick }` in render order |
| `page` | `number` | Current page |
| `totalPages` | `number` | Computed total pages |
| `setPage` | `(page: number) => void` | Navigate to a page (clamped) |
| `hasPrevious` / `hasNext` | `boolean` | Navigation helpers |

There is also a pure helper `getPageRange(page, totalPages, siblingCount?, boundaryCount?)` returning e.g. `[1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]`.

## Releasing (maintainers)

1. Bump the version: `npm version patch` (or `minor` / `major`) - creates a commit and a `vX.Y.Z` tag.
2. Push with tags: `git push --follow-tags`.
3. The **Release** GitHub Action runs type checks, tests and the build, then publishes to npm with provenance, using [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) or the `NPM_TOKEN` repository secret.

## Development

```bash
npm install
npm test          # jest
npm run typecheck # tsc
npm run build     # tsup -> dist/
```

Open `example/index.html` through any static server (e.g. `npx http-server .`) after building to try the demo.

## Contributing

Issues and pull requests are welcome at [github.com/FeruzDev/react-paginate-ts](https://github.com/FeruzDev/react-paginate-ts).

## License

MIT

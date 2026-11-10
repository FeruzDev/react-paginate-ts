import { getPageRange } from '../src/usePagination';

describe('getPageRange', () => {
  it('shows all pages when they fit', () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('adds an end ellipsis near the start', () => {
    expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
  });

  it('adds a start ellipsis near the end', () => {
    expect(getPageRange(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('adds both ellipses in the middle', () => {
    expect(getPageRange(5, 10)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]);
  });

  it('respects siblingCount and boundaryCount', () => {
    expect(getPageRange(10, 20, 2, 2)).toEqual([
      1, 2, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 19, 20,
    ]);
    expect(getPageRange(5, 10, 0, 1)).toEqual([1, 'start-ellipsis', 5, 'end-ellipsis', 10]);
  });

  it('handles tiny and invalid inputs', () => {
    expect(getPageRange(1, 1)).toEqual([1]);
    expect(getPageRange(1, 0)).toEqual([1]);
    expect(getPageRange(99, 3)).toEqual([1, 2, 3]);
    expect(getPageRange(-4, 2)).toEqual([1, 2]);
  });

  it('never repeats or skips pages', () => {
    for (let total = 1; total <= 30; total++) {
      for (let page = 1; page <= total; page++) {
        for (const siblings of [0, 1, 2]) {
          for (const boundary of [0, 1, 2]) {
            const r = getPageRange(page, total, siblings, boundary);
            const nums = r.filter((x): x is number => typeof x === 'number');
            expect(new Set(nums).size).toBe(nums.length);
            expect(nums).toContain(page);
            expect([...nums].sort((a, b) => a - b)).toEqual(nums);
          }
        }
      }
    }
  });
});

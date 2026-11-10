import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../src';

const currentPage = () => screen.getByRole('button', { current: 'page' }).textContent;

describe('<Pagination />', () => {
  it('renders an accessible nav', () => {
    render(<Pagination totalPages={10} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy();
    expect(currentPage()).toBe('1');
    expect((screen.getByLabelText('Go to previous page') as HTMLButtonElement).disabled).toBe(true);
  });

  it('works uncontrolled', () => {
    const onChange = jest.fn();
    render(<Pagination totalPages={10} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(currentPage()).toBe('3');
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(currentPage()).toBe('4');
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it('works controlled', () => {
    function Demo() {
      const [page, setPage] = useState(5);
      return <Pagination totalPages={10} page={page} onChange={setPage} showFirstButton showLastButton />;
    }
    render(<Demo />);
    expect(currentPage()).toBe('5');
    fireEvent.click(screen.getByLabelText('Go to last page'));
    expect(currentPage()).toBe('10');
    expect((screen.getByLabelText('Go to next page') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Go to first page'));
    expect(currentPage()).toBe('1');
  });

  it('does not change when controlled page is not updated', () => {
    const onChange = jest.fn();
    render(<Pagination totalPages={10} page={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(currentPage()).toBe('2');
  });

  it('computes pages from totalItems and pageSize', () => {
    render(<Pagination totalItems={95} pageSize={20} />);
    expect(screen.getByLabelText('Go to page 5')).toBeTruthy();
    expect(screen.queryByLabelText('Go to page 6')).toBeNull();
  });

  it('supports hideOnSinglePage, disabled and custom labels', () => {
    const { container, rerender } = render(<Pagination totalPages={1} hideOnSinglePage />);
    expect(container.firstChild).toBeNull();

    rerender(<Pagination totalPages={5} disabled labels={{ next: 'Next' }} />);
    expect(screen.getByText('Next')).toBeTruthy();
    screen.getAllByRole('button').forEach((b) => expect((b as HTMLButtonElement).disabled).toBe(true));
  });

  it('supports renderItem', () => {
    render(
      <Pagination
        totalPages={3}
        renderItem={(item, node) => (item.type === 'previous' ? null : node)}
      />,
    );
    expect(screen.queryByLabelText('Go to previous page')).toBeNull();
    expect(screen.getByLabelText('Go to next page')).toBeTruthy();
  });
});

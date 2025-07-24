
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../../components/common/SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput onSearch={() => {}} placeholder="Search..." />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onSearch when typing', () => {
    const mockOnSearch = vi.fn();
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockOnSearch).toHaveBeenCalled();
  });
});

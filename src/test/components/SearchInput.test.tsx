
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/testUtils';
import SearchInput from '@/components/common/SearchInput';

describe('SearchInput', () => {
  it('should render with placeholder', () => {
    render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="Buscar productos..."
      />
    );

    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Buscar..."
      />
    );

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'test search' } });

    expect(mockOnChange).toHaveBeenCalledWith('test search');
  });

  it('should show loading spinner when isSearching is true', () => {
    render(
      <SearchInput
        value="test"
        onChange={vi.fn()}
        isSearching={true}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(
      <SearchInput
        value="current value"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('current value')).toBeInTheDocument();
  });
});


import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SearchInput from '../../components/common/SearchInput';

// Mock the SearchInput component props
const defaultProps = {
  value: '',
  onChange: vi.fn(),
  placeholder: 'Search...',
  className: '',
};

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<SearchInput {...defaultProps} />);
    expect(getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays the correct value', () => {
    const { getByDisplayValue } = render(
      <SearchInput {...defaultProps} value="test search" />
    );
    expect(getByDisplayValue('test search')).toBeInTheDocument();
  });
});

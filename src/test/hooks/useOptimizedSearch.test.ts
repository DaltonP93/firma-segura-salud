
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';

interface TestItem {
  id: string;
  name: string;
  email: string;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
  { id: '2', name: 'María García', email: 'maria@example.com' },
  { id: '3', name: 'Pedro López', email: 'pedro@example.com' },
];

describe('useOptimizedSearch', () => {
  it('should return all data when search term is empty', () => {
    const { result } = renderHook(() =>
      useOptimizedSearch({
        data: mockData,
        searchFields: ['name', 'email'],
      })
    );

    expect(result.current.filteredData).toEqual(mockData);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.isSearching).toBe(false);
  });

  it('should filter data based on search term', async () => {
    const { result } = renderHook(() =>
      useOptimizedSearch({
        data: mockData,
        searchFields: ['name', 'email'],
      })
    );

    act(() => {
      result.current.setSearchTerm('juan');
    });

    expect(result.current.searchTerm).toBe('juan');
    expect(result.current.isSearching).toBe(true);

    // Wait for debounced search
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Juan Pérez');
    expect(result.current.isSearching).toBe(false);
  });

  it('should use custom filter function when provided', async () => {
    const customFilter = (item: TestItem, searchTerm: string) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    const { result } = renderHook(() =>
      useOptimizedSearch({
        data: mockData,
        searchFields: ['name'],
        filterFn: customFilter,
      })
    );

    act(() => {
      result.current.setSearchTerm('maría');
    });

    // Wait for debounced search
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('María García');
  });

  it('should handle case-insensitive search', async () => {
    const { result } = renderHook(() =>
      useOptimizedSearch({
        data: mockData,
        searchFields: ['name', 'email'],
      })
    );

    act(() => {
      result.current.setSearchTerm('PEDRO');
    });

    // Wait for debounced search
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Pedro López');
  });
});


import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseOptimizedSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, searchTerm: string) => boolean;
}

export const useOptimizedSearch = <T>({
  data,
  searchFields,
  filterFn,
}: UseOptimizedSearchProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return data;
    }

    return data.filter((item) => {
      if (filterFn) {
        return filterFn(item, debouncedSearchTerm);
      }

      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [data, debouncedSearchTerm, searchFields, filterFn]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
};

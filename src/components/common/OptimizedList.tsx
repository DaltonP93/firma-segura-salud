
import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface OptimizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  width?: number | string;
  renderItem: ({ index, style }: { index: number; style: React.CSSProperties }) => React.ReactNode;
  className?: string;
}

const OptimizedList = <T,>({
  items,
  height,
  itemHeight,
  width = "100%",
  renderItem,
  className,
}: OptimizedListProps<T>) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No hay elementos para mostrar
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
      >
        {renderItem}
      </List>
    </div>
  );
};

export default memo(OptimizedList) as typeof OptimizedList;

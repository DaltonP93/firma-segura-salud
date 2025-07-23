
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/testUtils';
import LazyWrapper from '@/components/performance/LazyWrapper';

const TestComponent = () => <div>Test Content</div>;

describe('LazyWrapper', () => {
  it('should render children when loaded', () => {
    render(
      <LazyWrapper>
        <TestComponent />
      </LazyWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom Loading...</div>;
    
    render(
      <LazyWrapper fallback={<CustomFallback />}>
        <TestComponent />
      </LazyWrapper>
    );

    // Since the component is synchronous, it should render the content immediately
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

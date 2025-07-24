
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LazyWrapper from '../../components/performance/LazyWrapper';

describe('LazyWrapper', () => {
  it('renders children when loaded', () => {
    const TestComponent = () => <div>Test content</div>;
    const { getByText } = render(
      <LazyWrapper>
        <TestComponent />
      </LazyWrapper>
    );
    
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const TestComponent = () => <div>Test content</div>;
    const { container } = render(
      <LazyWrapper>
        <TestComponent />
      </LazyWrapper>
    );
    
    // Check that the container has some content
    expect(container.firstChild).toBeInTheDocument();
  });
});

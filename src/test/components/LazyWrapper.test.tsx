
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyWrapper from '../../components/performance/LazyWrapper';

describe('LazyWrapper', () => {
  it('renders children correctly', () => {
    render(
      <LazyWrapper>
        <div>Test content</div>
      </LazyWrapper>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});

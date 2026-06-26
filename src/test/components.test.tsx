import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const { ErrorBoundary } = await import('@/components/ErrorBoundary');
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

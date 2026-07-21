import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageWithLoader from './ImageWithLoader';

describe('ImageWithLoader Component', () => {
  it('initially displays loading skeleton and hides the loaded image opacity', () => {
    const { container } = render(
      <ImageWithLoader 
        src="https://example.com/test.png" 
        alt="Test Image" 
        className="w-16 h-16"
      />
    );

    // Verify loading skeleton is present
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Verify image has opacity-0 initially
    const img = screen.getByRole('img');
    expect(img).toHaveClass('opacity-0');
  });

  it('hides skeleton and updates opacity to opacity-100 when image loaded successfully', () => {
    const handleLoad = vi.fn();
    const { container } = render(
      <ImageWithLoader 
        src="https://example.com/test.png" 
        alt="Test Image" 
        onLoad={handleLoad}
      />
    );

    const img = screen.getByRole('img');
    fireEvent.load(img);

    // After loading, loading skeleton should be gone
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeNull();

    // Image should be visible
    expect(img).toHaveClass('opacity-100');
    expect(handleLoad).toHaveBeenCalled();
  });

  it('calls onError callback on load failure and stops displaying loading skeleton', () => {
    const handleError = vi.fn();
    const { container } = render(
      <ImageWithLoader 
        src="https://example.com/broken.png" 
        alt="Broken Image" 
        onError={handleError}
      />
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    // Skeleton should be removed
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeNull();

    expect(handleError).toHaveBeenCalled();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';

// Simple mock for motion to ensure no complex framer-motion setups break the component test
describe('AboutPage Component', () => {
  it('renders standard system manifest and main headers correctly', () => {
    render(<AboutPage />);

    // Check system manifest tag
    expect(screen.getByText('SYSTEM MANIFEST')).toBeInTheDocument();

    // Check titles
    expect(screen.getByText(/ABOUT StandardMMA/i)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM ARCHITECTURE & DATA PIPELINE/i)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM TECH STACK & ENGINE MODULES/i)).toBeInTheDocument();
  });

  it('contains correctly listed key features', () => {
    render(<AboutPage />);

    expect(screen.getByText('Synchronous Hash Routing')).toBeInTheDocument();
    expect(screen.getByText('Predictive Matchup Simulator')).toBeInTheDocument();
    expect(screen.getByText('Flawless Accessibility (a11y) Compliance')).toBeInTheDocument();
    expect(screen.getByText('Historical Title & Champion Analytics')).toBeInTheDocument();
  });

  it('renders correct database counters and archive statistics', () => {
    render(<AboutPage />);

    // 4,330 athletes and 1,319 event cards are key static counters
    expect(screen.getByText('4,330')).toBeInTheDocument();
    expect(screen.getByText('1,319')).toBeInTheDocument();
    expect(screen.getByText('Bios')).toBeInTheDocument();
  });

  it('triggers window location hash change when stat buttons are clicked', () => {
    render(<AboutPage />);

    const athletesBtn = screen.getByRole('button', { name: /view all fighters/i });
    expect(athletesBtn).toBeInTheDocument();
    
    athletesBtn.click();
    expect(window.location.hash).toBe('#fighters');
  });
});

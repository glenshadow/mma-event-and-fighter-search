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
    expect(screen.getByText('Bi-directional Trajectory Modeling')).toBeInTheDocument();
    expect(screen.getByText('Optimized Image Fallbacks')).toBeInTheDocument();
  });

  it('renders correct database counters and archive statistics', () => {
    render(<AboutPage />);

    // 4,330 athletes and 1,319 event cards are key static counters
    expect(screen.getByText('4,330')).toBeInTheDocument();
    expect(screen.getByText('1,319')).toBeInTheDocument();
    expect(screen.getByText(/Pre-linked bios/i)).toBeInTheDocument();
  });
});

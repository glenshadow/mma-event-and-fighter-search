import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FighterHeadshot from './FighterHeadshot';
import { FighterProfile } from '../../types';

// Mock the image-validator utility to return controlled headshots for testing
vi.mock('../../utils/image-validator', () => {
  return {
    getFighterHeadshotUrl: (fighter: FighterProfile) => {
      if (fighter.id === 1) return 'https://example.com/fighter1.png';
      if (fighter.id === 2) return null; // trigger fallback
      return null;
    },
  };
});

describe('FighterHeadshot Component', () => {
  const mockFighter: FighterProfile = {
    id: 1,
    firstName: 'Jon',
    lastName: 'Jones',
    nickName: 'Bones',
    fullName: 'Jon Jones',
    record: { wins: 27, losses: 1, draws: 0, noContests: 1 },
    age: 36,
    stance: 'Southpaw',
    height: 76,
    reach: 84,
    weight: 250,
    headshot: 'https://example.com/fighter1.png',
  };

  it('renders correctly with a valid verified headshot url', () => {
    render(<FighterHeadshot fighter={mockFighter} className="w-12 h-12" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/fighter1.png');
    expect(img).toHaveAttribute('alt', 'Jon Jones');
  });

  it('falls back to default silhouette headshot on initial getFighterHeadshotUrl failing', () => {
    const noUrlFighter = { ...mockFighter, id: 2, headshot: null };
    render(<FighterHeadshot fighter={noUrlFighter} />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('SILHOUETTE.png');
  });

  it('renders standard initials when even the fallback fails', () => {
    const failedFighter = { ...mockFighter, id: 3, firstName: 'Georges', lastName: 'St-Pierre', fullName: 'Georges St-Pierre' };
    render(<FighterHeadshot fighter={failedFighter} />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();

    // Fire onError on image once
    fireEvent.error(img);
    // Fire onError again to trigger evenFallbackFails state
    fireEvent.error(img);

    // The image should be replaced with an initials-rendering div
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('GS')).toBeInTheDocument();
  });
});

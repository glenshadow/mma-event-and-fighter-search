import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchupSimulationCard from './MatchupSimulationCard';
import { FighterProfile } from '../../types';

describe('MatchupSimulationCard Component', () => {
  const mockFighterA: FighterProfile = {
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
    headshot: null,
  };

  const mockFighterB: FighterProfile = {
    id: 2,
    firstName: 'Stipe',
    lastName: 'Miocic',
    nickName: null,
    fullName: 'Stipe Miocic',
    record: { wins: 20, losses: 4, draws: 0, noContests: 0 },
    age: 41,
    stance: 'Orthodox',
    height: 76,
    reach: 80,
    weight: 240,
    headshot: null,
  };

  const mockThemeRed = {
    text: 'text-red-500',
    textHover: 'hover:text-red-400',
    bgGlow: 'bg-red-500/20',
    bgGlowHalf: 'bg-red-500/10',
    bg500: 'bg-red-500',
    gradientRFrom: 'from-red-600',
    gradientRTo: 'to-red-400',
  };

  const mockThemeBlue = {
    text: 'text-blue-500',
    textHover: 'hover:text-blue-400',
    bgGlow: 'bg-blue-500/20',
    bgGlowHalf: 'bg-blue-500/10',
    bg500: 'bg-blue-500',
    gradientRFrom: 'from-blue-600',
    gradientRTo: 'to-blue-400',
  };

  const mockPrediction = {
    probA: 65,
    probB: 35,
    breakdown: [
      {
        label: 'Youth & Vitality',
        desc: 'Favors younger physical peak',
        valA: '36 yrs',
        valB: '41 yrs',
        scoreA: 8,
        scoreB: 0,
      },
      {
        label: 'Reach Advantage',
        desc: 'Distance and strike control control leverage',
        valA: '84.0"',
        valB: '80.0"',
        scoreA: 14,
        scoreB: 0,
      }
    ],
  };

  const mockOnSelectFighter = vi.fn();

  it('renders the matchup simulation probabilities correctly', () => {
    render(
      <MatchupSimulationCard
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        headshotA={null}
        headshotB={null}
        themeA={mockThemeRed}
        themeB={mockThemeBlue}
        prediction={mockPrediction}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    // Assert that the fighter names and their win probability ratios are displayed in the probability bar description
    expect(screen.getByText(/Jones \(65%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Miocic \(35%\)/i)).toBeInTheDocument();
  });

  it('initially hides the factor analysis breakdown', () => {
    render(
      <MatchupSimulationCard
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        headshotA={null}
        headshotB={null}
        themeA={mockThemeRed}
        themeB={mockThemeBlue}
        prediction={mockPrediction}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    // The breakdown container should not be in the document since showBreakdown state is false
    const breakdownContainer = document.querySelector('#factor-analysis-breakdown');
    expect(breakdownContainer).toBeNull();
  });

  it('expands and collapses the breakdown factors when clicking the expand button', async () => {
    render(
      <MatchupSimulationCard
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        headshotA={null}
        headshotB={null}
        themeA={mockThemeRed}
        themeB={mockThemeBlue}
        prediction={mockPrediction}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    const expandButton = screen.getByRole('button', { name: /expand simulated factor analysis/i });
    expect(expandButton).toBeInTheDocument();

    // Click to expand
    fireEvent.click(expandButton);

    // Now the breakdown container should exist and be visible
    const breakdownContainer = document.querySelector('#factor-analysis-breakdown');
    expect(breakdownContainer).not.toBeNull();
    expect(screen.getByText('Youth & Vitality')).toBeInTheDocument();
    expect(screen.getByText('Reach Advantage')).toBeInTheDocument();

    // Verify the button text changes to 'Hide...'
    expect(screen.getByRole('button', { name: /hide simulated factor analysis/i })).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByRole('button', { name: /hide simulated factor analysis/i }));

    // Container should be removed
    expect(document.querySelector('#factor-analysis-breakdown')).toBeNull();
  });

  it('triggers onSelectFighter callback when clicking on a fighter name/element', () => {
    render(
      <MatchupSimulationCard
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        headshotA={null}
        headshotB={null}
        themeA={mockThemeRed}
        themeB={mockThemeBlue}
        prediction={mockPrediction}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    const fighterAButton = screen.getByTitle('View Jon Jones profile');
    expect(fighterAButton).toBeInTheDocument();

    fireEvent.click(fighterAButton);
    expect(mockOnSelectFighter).toHaveBeenCalledWith(mockFighterA.id);
  });
});

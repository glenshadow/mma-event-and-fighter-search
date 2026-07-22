import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BoutOutcomeAnalytics from './BoutOutcomeAnalytics';
import { FighterProfile, FightHistoryItem } from '../../types';

describe('BoutOutcomeAnalytics Component', () => {
  const mockFighterA: FighterProfile = {
    id: 1,
    firstName: 'Jon',
    lastName: 'Jones',
    nickName: 'Bones',
    fullName: 'Jon Jones',
    record: { wins: 27, losses: 1, draws: 0, noContests: 1 },
    age: 36,
    stance: 'Orthodox',
    height: 76,
    weight: 205,
    headshot: null,
  };

  const mockFighterB: FighterProfile = {
    id: 2,
    firstName: 'Daniel',
    lastName: 'Cormier',
    nickName: 'DC',
    fullName: 'Daniel Cormier',
    record: { wins: 22, losses: 3, draws: 0, noContests: 1 },
    age: 45,
    stance: 'Orthodox',
    height: 71,
    weight: 205,
    headshot: null,
  };

  const mockMatch: FightHistoryItem = {
    eventId: 101,
    eventName: 'UFC 214',
    eventDate: '2017-07-29',
    fightId: 1,
    opponentId: 2,
    opponentName: 'Daniel Cormier',
    outcome: 'Win',
    weightClass: 'Light Heavyweight',
    method: 'KO/TKO',
    endingRound: 3,
    endingTime: '3:01',
  };

  const mockGetFighterOutcome = (isFighterA: boolean) => (isFighterA ? 'Win' : 'Loss');
  const mockOnSelectFighter = vi.fn();

  it('renders fight outcome details correctly', () => {
    render(
      <BoutOutcomeAnalytics
        match={mockMatch}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        getFighterOutcome={mockGetFighterOutcome}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    expect(screen.getByText('Bout Outcome & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Jon Jones')).toBeInTheDocument();
    expect(screen.getByText('Daniel Cormier')).toBeInTheDocument();
    expect(screen.getByText('Win')).toBeInTheDocument();
    expect(screen.getByText('Loss')).toBeInTheDocument();
    expect(screen.getByText('KO/TKO')).toBeInTheDocument();
    expect(screen.getByText(/Round 3 • 3:01/i)).toBeInTheDocument();
  });

  it('triggers onSelectFighter when fighter buttons are clicked', () => {
    render(
      <BoutOutcomeAnalytics
        match={mockMatch}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        getFighterOutcome={mockGetFighterOutcome}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    const btnA = screen.getByText('Jon Jones').closest('button');
    expect(btnA).not.toBeNull();
    fireEvent.click(btnA!);
    expect(mockOnSelectFighter).toHaveBeenCalledWith(1);

    const btnB = screen.getByText('Daniel Cormier').closest('button');
    expect(btnB).not.toBeNull();
    fireEvent.click(btnB!);
    expect(mockOnSelectFighter).toHaveBeenCalledWith(2);
  });

  it('renders championship belt accolade if present', () => {
    const titleMatch: FightHistoryItem = {
      ...mockMatch,
      accolades: [
        { Name: 'UFC Light Heavyweight Championship', Type: 'Belt' }
      ]
    };

    render(
      <BoutOutcomeAnalytics
        match={titleMatch}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        getFighterOutcome={mockGetFighterOutcome}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    expect(screen.getByText('WORLD TITLE BOUT')).toBeInTheDocument();
    expect(screen.getByText('UFC Light Heavyweight Championship')).toBeInTheDocument();
  });
});

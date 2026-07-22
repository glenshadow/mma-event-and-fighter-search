import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FightDetail from './FightDetail';
import { FighterProfile } from '../../types';

describe('FightDetail Component', () => {
  const mockFighterA: FighterProfile = {
    id: 1,
    firstName: 'Jon',
    lastName: 'Jones',
    fullName: 'Jon Jones',
    nickName: 'Bones',
    record: { wins: 27, losses: 1, draws: 0, noContests: 1 },
    age: 36,
    stance: 'Orthodox',
    height: 76,
    weight: 205,
    headshot: null,
    fightsParticipated: [
      {
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
      }
    ]
  };

  const mockFighterB: FighterProfile = {
    id: 2,
    firstName: 'Daniel',
    lastName: 'Cormier',
    fullName: 'Daniel Cormier',
    nickName: 'DC',
    record: { wins: 22, losses: 3, draws: 0, noContests: 1 },
    age: 45,
    stance: 'Orthodox',
    height: 71,
    weight: 205,
    headshot: null,
    fightsParticipated: [
      {
        eventId: 101,
        eventName: 'UFC 214',
        eventDate: '2017-07-29',
        fightId: 1,
        opponentId: 1,
        opponentName: 'Jon Jones',
        outcome: 'Loss',
        weightClass: 'Light Heavyweight',
        method: 'KO/TKO',
        endingRound: 3,
        endingTime: '3:01',
      }
    ]
  };

  const mockOnBack = vi.fn();
  const mockOnSelectFighter = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading indicator initially then fighter names on fetch success', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('fighters/1.json')) {
        return { ok: true, json: async () => mockFighterA } as Response;
      }
      if (urlStr.includes('fighters/2.json')) {
        return { ok: true, json: async () => mockFighterB } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <FightDetail
        fighterAId={1}
        fighterBId={2}
        fightId={101}
        onBack={mockOnBack}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jon Jones')).toBeInTheDocument();
      expect(screen.getByText('Daniel Cormier')).toBeInTheDocument();
    });
  });

  it('triggers onBack when back button is clicked', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('fighters/1.json')) {
        return { ok: true, json: async () => mockFighterA } as Response;
      }
      if (urlStr.includes('fighters/2.json')) {
        return { ok: true, json: async () => mockFighterB } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <FightDetail
        fighterAId={1}
        fighterBId={2}
        fightId={101}
        onBack={mockOnBack}
        onSelectFighter={mockOnSelectFighter}
        backLabel="Back to Events"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jon Jones')).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /Back to Events/i });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FighterDetail from './FighterDetail';
import { FighterProfile } from '../../types';

describe('FighterDetail Component', () => {
  const mockFighter: FighterProfile = {
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
  };

  const mockOnSelectFighter = vi.fn();
  const mockOnSelectEvent = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial summary fighter information', () => {
    render(
      <FighterDetail
        fighter={mockFighter}
        onSelectFighter={mockOnSelectFighter}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    expect(screen.getByText('Jon Jones')).toBeInTheDocument();
    expect(screen.getByText('"Bones"')).toBeInTheDocument();
  });

  it('renders full fighter details with fight history on fetch success', async () => {
    const mockDetailedFighter = {
      ...mockFighter,
      fightsParticipated: [
        {
          eventId: 200,
          eventName: 'UFC 285',
          eventDate: '2023-03-04',
          fightId: 10,
          opponentId: 15,
          opponentName: 'Ciryl Gane',
          outcome: 'Win',
          weightClass: 'Heavyweight',
          method: 'Submission',
          endingRound: 1,
          endingTime: '2:04',
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDetailedFighter,
    } as Response);

    render(
      <FighterDetail
        fighter={mockFighter}
        onSelectFighter={mockOnSelectFighter}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ciryl Gane')).toBeInTheDocument();
      expect(screen.getByText('UFC 285')).toBeInTheDocument();
    });
  });
});

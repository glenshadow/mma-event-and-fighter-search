import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventDetail from './EventDetail';
import { EventSummary } from '../../types';

describe('EventDetail Component', () => {
  const mockEventSummary: EventSummary = {
    id: 1300,
    name: 'UFC 300: Pereira vs. Hill',
    date: '2024-04-13',
    venue: 'T-Mobile Arena',
    location: 'Las Vegas, Nevada',
    fightsCount: 13,
    status: 'Final',
  };

  const mockOnSelectFighter = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders event summary header info', () => {
    render(
      <EventDetail
        eventSummary={mockEventSummary}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    expect(screen.getByText('UFC 300: Pereira vs. Hill')).toBeInTheDocument();
    expect(screen.getByText('T-MOBILE ARENA')).toBeInTheDocument();
  });

  it('renders fight cards when fetch succeeds', async () => {
    const mockDetailedData = {
      id: 1300,
      name: 'UFC 300: Pereira vs. Hill',
      fights: [
        {
          fightId: 1,
          fightOrder: 1,
          status: 'Final',
          weightClass: 'Light Heavyweight',
          cardSegment: 'Main',
          isTitleFight: true,
          fighters: [
            { fighterId: 2, name: 'Alex Pereira', corner: 'Red', outcome: 'Win', recordStr: '9-2-0' },
            { fighterId: 3, name: 'Jamahal Hill', corner: 'Blue', outcome: 'Loss', recordStr: '12-2-0' }
          ],
          result: {
            method: 'KO/TKO',
            endingRound: 1,
            endingTime: '3:14',
            endingNotes: null,
          }
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDetailedData,
    } as Response);

    render(
      <EventDetail
        eventSummary={mockEventSummary}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alex Pereira')).toBeInTheDocument();
      expect(screen.getByText('Jamahal Hill')).toBeInTheDocument();
    });
  });
});

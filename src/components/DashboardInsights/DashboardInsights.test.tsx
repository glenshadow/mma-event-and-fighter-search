import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardInsights from './DashboardInsights';
import { FighterProfile, EventSummary } from '../../types';

describe('DashboardInsights Component', () => {
  const mockFighters: FighterProfile[] = [
    {
      id: 1,
      firstName: 'Jon',
      lastName: 'Jones',
      nickName: 'Bones',
      fullName: 'Jon Jones',
      record: {
        wins: 27,
        losses: 1,
        draws: 0,
        noContests: 1,
      },
      age: 36,
      stance: 'Orthodox',
      height: 76,
      weight: 205,
      headshot: null,
    },
    {
      id: 2,
      firstName: 'Alex',
      lastName: 'Pereira',
      nickName: 'Poatan',
      fullName: 'Alex Pereira',
      record: {
        wins: 12,
        losses: 2,
        draws: 0,
        noContests: 0,
      },
      age: 36,
      stance: 'Orthodox',
      height: 76,
      weight: 205,
      headshot: null,
    },
  ];

  const mockEvents: EventSummary[] = [
    {
      id: 101,
      name: 'UFC 300: Pereira vs. Hill',
      date: '2024-04-13',
      venue: 'T-Mobile Arena',
      location: 'Las Vegas, NV',
      fightsCount: 13,
      status: 'Final',
    },
  ];

  const mockOnSelectFighter = vi.fn();
  const mockOnSelectEvent = vi.fn();

  it('renders dashboard hero and statistics metrics', () => {
    render(
      <DashboardInsights
        fighters={mockFighters}
        events={mockEvents}
        statsSummary={{
          finishList: [
            { name: 'KO/TKO', count: 500, percentage: 45 },
            { name: 'Submission', count: 300, percentage: 25 },
            { name: 'Decision', count: 350, percentage: 30 },
          ],
        }}
        onSelectFighter={mockOnSelectFighter}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    // Verify key hero headings and static numbers
    expect(screen.getByText(/High-Precision/i)).toBeInTheDocument();
    expect(screen.getAllByText('4,330')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^View all events$/i })).toBeInTheDocument();
  });

  it('triggers window location hash when stat cards are clicked', () => {
    render(
      <DashboardInsights
        fighters={mockFighters}
        events={mockEvents}
        statsSummary={{
          finishList: [],
        }}
        onSelectFighter={mockOnSelectFighter}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    const fightersStatBtn = screen.getByRole('button', { name: /view all fighters/i });
    expect(fightersStatBtn).toBeInTheDocument();
    
    fireEvent.click(fightersStatBtn);
    expect(window.location.hash).toBe('#fighters');
  });
});

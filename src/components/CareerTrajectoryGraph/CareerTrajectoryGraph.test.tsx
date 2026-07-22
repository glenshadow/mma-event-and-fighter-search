import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CareerTrajectoryGraph from './CareerTrajectoryGraph';
import { FightHistoryItem } from '../../types';

describe('CareerTrajectoryGraph Component', () => {
  const mockFights: FightHistoryItem[] = [
    {
      eventId: 101,
      eventName: 'UFC 128',
      eventDate: '2011-03-19',
      fightId: 1,
      opponentId: 10,
      opponentName: 'Mauricio Rua',
      outcome: 'Win',
      weightClass: 'Light Heavyweight',
      method: 'KO/TKO',
      endingRound: 3,
      endingTime: '2:37',
    },
    {
      eventId: 102,
      eventName: 'UFC 135',
      eventDate: '2011-09-24',
      fightId: 2,
      opponentId: 11,
      opponentName: 'Quinton Jackson',
      outcome: 'Win',
      weightClass: 'Light Heavyweight',
      method: 'Submission',
      endingRound: 4,
      endingTime: '1:14',
    },
    {
      eventId: 90,
      eventName: 'The Ultimate Fighter 10 Finale',
      eventDate: '2009-12-05',
      fightId: 3,
      opponentId: 12,
      opponentName: 'Matt Hamill',
      outcome: 'Loss',
      weightClass: 'Light Heavyweight',
      method: 'DQ',
      endingRound: 1,
      endingTime: '4:14',
    },
  ];

  it('renders fallback when no fights are provided', () => {
    render(<CareerTrajectoryGraph fights={[]} fighterName="Jon Jones" />);
    expect(screen.getByText(/No matches recorded to calculate career trajectory/i)).toBeInTheDocument();
  });

  it('renders graph component with career points header and stats', () => {
    render(<CareerTrajectoryGraph fights={mockFights} fighterName="Jon Jones" />);

    expect(screen.getByText('CAREER TRAJECTORY & MOMENTUM')).toBeInTheDocument();
    expect(screen.getByText(/Interactive trajectory vector mapping 3 professional bouts/i)).toBeInTheDocument();
  });

  it('handles clicking on trajectory node', () => {
    const onSelectEvent = vi.fn();
    render(
      <CareerTrajectoryGraph
        fights={mockFights}
        fighterName="Jon Jones"
        onSelectEvent={onSelectEvent}
      />
    );

    // Look for points / interactive elements
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);

    // Click a circle node
    fireEvent.click(circles[circles.length - 1]);
  });
});

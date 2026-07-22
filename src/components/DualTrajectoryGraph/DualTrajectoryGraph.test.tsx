import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DualTrajectoryGraph from './DualTrajectoryGraph';
import { FightHistoryItem } from '../../types';

describe('DualTrajectoryGraph Component', () => {
  const mockFightsA: FightHistoryItem[] = [
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
    },
  ];

  const mockFightsB: FightHistoryItem[] = [
    {
      eventId: 102,
      eventName: 'UFC 241',
      eventDate: '2019-08-17',
      fightId: 2,
      opponentId: 3,
      opponentName: 'Stipe Miocic',
      outcome: 'Loss',
      weightClass: 'Heavyweight',
      method: 'KO/TKO',
      endingRound: 4,
      endingTime: '4:09',
    },
  ];

  it('renders dual trajectory graph header with fighter names', () => {
    render(
      <DualTrajectoryGraph
        fightsA={mockFightsA}
        fightsB={mockFightsB}
        nameA="Jon Jones"
        nameB="Daniel Cormier"
      />
    );

    expect(screen.getByText('BI-DIRECTIONAL TRAJECTORY OVERLAY')).toBeInTheDocument();
    expect(screen.getByText('Jon Jones')).toBeInTheDocument();
    expect(screen.getByText('Daniel Cormier')).toBeInTheDocument();
  });

  it('renders fallback when fights are empty', () => {
    render(
      <DualTrajectoryGraph
        fightsA={[]}
        fightsB={[]}
        nameA="Fighter A"
        nameB="Fighter B"
      />
    );

    expect(screen.getByText(/Insufficient historical match data/i)).toBeInTheDocument();
  });
});

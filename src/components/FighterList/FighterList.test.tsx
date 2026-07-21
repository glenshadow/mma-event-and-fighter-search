import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FighterList from './FighterList';
import { FighterProfile } from '../../types';

describe('FighterList Component', () => {
  const mockFighters: FighterProfile[] = [
    {
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
    },
    {
      id: 2,
      firstName: 'Stipe',
      lastName: 'Miocic',
      nickName: 'The Silencer',
      fullName: 'Stipe Miocic',
      record: { wins: 20, losses: 4, draws: 0, noContests: 0 },
      age: 41,
      stance: 'Orthodox',
      height: 76,
      reach: 80,
      weight: 240,
      headshot: null,
    },
    {
      id: 3,
      firstName: 'Conor',
      lastName: 'McGregor',
      nickName: 'The Notorious',
      fullName: 'Conor McGregor',
      record: { wins: 22, losses: 6, draws: 0, noContests: 0 },
      age: 35,
      stance: 'Southpaw',
      height: 69,
      reach: 74,
      weight: 155,
      headshot: null,
    }
  ];

  const mockOnSelectFighter = vi.fn();

  beforeEach(() => {
    mockOnSelectFighter.mockClear();
    
    // Reset window.location mock parameters if needed
    const url = new URL('https://example.com');
    vi.stubGlobal('location', {
      ...window.location,
      href: url.href,
      search: url.search,
      hash: url.hash,
    });
  });

  it('renders the list of fighters and shows core details', () => {
    render(
      <FighterList
        fighters={mockFighters}
        selectedId={null}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    expect(screen.getAllByText('Jon Jones')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Stipe Miocic')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Conor McGregor')[0]).toBeInTheDocument();

    // Verify stats exist
    expect(screen.getAllByText('27')[0]).toBeInTheDocument();
    expect(screen.getAllByText('20')[0]).toBeInTheDocument();
  });

  it('filters fighters by search query', () => {
    render(
      <FighterList
        fighters={mockFighters}
        selectedId={null}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search fighters/i);
    expect(searchInput).toBeInTheDocument();

    // Type "Stipe"
    fireEvent.change(searchInput, { target: { value: 'Stipe' } });

    // Stipe Miocic should be in the list, Conor & Jon should not
    expect(screen.getAllByText('Stipe Miocic')[0]).toBeInTheDocument();
    expect(screen.queryByText('Jon Jones')).toBeNull();
    expect(screen.queryByText('Conor McGregor')).toBeNull();
  });

  it('filters fighters by stance', async () => {
    render(
      <FighterList
        fighters={mockFighters}
        selectedId={null}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    // Expand the filters section if collapsible
    const filterToggle = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filterToggle);

    // Click on Southpaw filter button
    const southpawBtn = screen.getByRole('button', { name: 'Southpaw' });
    fireEvent.click(southpawBtn);

    // Jon Jones and Conor McGregor are Southpaws, Stipe Miocic is Orthodox
    expect(screen.getAllByText('Jon Jones')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Conor McGregor')[0]).toBeInTheDocument();
    expect(screen.queryByText('Stipe Miocic')).toBeNull();
  });

  it('triggers onSelectFighter callback when clicking on a list item row/card', () => {
    render(
      <FighterList
        fighters={mockFighters}
        selectedId={null}
        onSelectFighter={mockOnSelectFighter}
      />
    );

    const matches = screen.getAllByText('Jon Jones');
    expect(matches.length).toBeGreaterThan(0);
    
    fireEvent.click(matches[0]);
    expect(mockOnSelectFighter).toHaveBeenCalledWith(1);
  });
});

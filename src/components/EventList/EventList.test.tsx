import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventList from './EventList';
import { EventSummary } from '../../types';

describe('EventList Component', () => {
  const mockEvents: EventSummary[] = [
    {
      id: 101,
      name: 'UFC 290: Volkanovski vs. Rodriguez',
      date: '2023-07-08',
      venue: 'T-Mobile Arena',
      location: 'Las Vegas, Nevada, USA',
      fightsCount: 13,
      status: 'Final',
    },
    {
      id: 102,
      name: 'UFC 200: Tate vs. Nunes',
      date: '2016-07-09',
      venue: 'T-Mobile Arena',
      location: 'Las Vegas, Nevada, USA',
      fightsCount: 12,
      status: 'Final',
    },
    {
      id: 103,
      name: 'UFC 100: Lesnar vs. Mir 2',
      date: '2009-07-11',
      venue: 'Mandalay Bay Events Center',
      location: 'Las Vegas, Nevada, USA',
      fightsCount: 11,
      status: 'Final',
    }
  ];

  const mockOnSelectEvent = vi.fn();

  beforeEach(() => {
    mockOnSelectEvent.mockClear();
    
    const url = new URL('https://example.com');
    vi.stubGlobal('location', {
      ...window.location,
      href: url.href,
      search: url.search,
      hash: url.hash,
    });
  });

  it('renders list of events and shows details like name and date', () => {
    render(
      <EventList
        events={mockEvents}
        selectedId={null}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    expect(screen.getAllByText('UFC 290: Volkanovski vs. Rodriguez')[0]).toBeInTheDocument();
    expect(screen.getAllByText('UFC 200: Tate vs. Nunes')[0]).toBeInTheDocument();
    expect(screen.getAllByText('UFC 100: Lesnar vs. Mir 2')[0]).toBeInTheDocument();

    // Check venues are rendered in the document
    expect(screen.getAllByText('T-Mobile Arena')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Mandalay Bay Events Center')[0]).toBeInTheDocument();
  });

  it('filters events based on query search input', () => {
    render(
      <EventList
        events={mockEvents}
        selectedId={null}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search events/i);
    expect(searchInput).toBeInTheDocument();

    // Search for UFC 200
    fireEvent.change(searchInput, { target: { value: 'UFC 200' } });

    expect(screen.getAllByText('UFC 200: Tate vs. Nunes')[0]).toBeInTheDocument();
    expect(screen.queryByText('UFC 290: Volkanovski vs. Rodriguez')).toBeNull();
    expect(screen.queryByText('UFC 100: Lesnar vs. Mir 2')).toBeNull();
  });

  it('filters events based on Era category selection', () => {
    render(
      <EventList
        events={mockEvents}
        selectedId={null}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    // Expand the filters section
    const filterToggle = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filterToggle);

    // Filter by "Zuffa Boom Era (2001-2010)"
    const eraBtn = screen.getByRole('button', { name: /Zuffa Boom Era/i });
    expect(eraBtn).toBeInTheDocument();
    fireEvent.click(eraBtn);

    // UFC 100 (2009) is in Zuffa Boom Era. UFC 200 (2016) and UFC 290 (2023) are not.
    expect(screen.getAllByText('UFC 100: Lesnar vs. Mir 2')[0]).toBeInTheDocument();
    expect(screen.queryByText('UFC 200: Tate vs. Nunes')).toBeNull();
    expect(screen.queryByText('UFC 290: Volkanovski vs. Rodriguez')).toBeNull();
  });

  it('triggers onSelectEvent when an event card or row is clicked', () => {
    render(
      <EventList
        events={mockEvents}
        selectedId={null}
        onSelectEvent={mockOnSelectEvent}
      />
    );

    const eventNameElements = screen.getAllByText('UFC 290: Volkanovski vs. Rodriguez');
    expect(eventNameElements.length).toBeGreaterThan(0);
    fireEvent.click(eventNameElements[0]);

    expect(mockOnSelectEvent).toHaveBeenCalledWith(101);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import { GeolocationRecord } from '../types';

const mockData: GeolocationRecord[] = [
  { id: '1', country: "US", name: 'City One', lat: 0, lng: 0 },
  { id: '2', country: "US", name: 'City Two', lat: 1, lng: 1 },
  { id: '3', country: "US", name: 'City Three', lat: 2, lng: 2 },
  { id: '4', country: "US", name: 'City Four', lat: 3, lng: 3 },
  { id: '5', country: "US", name: 'City Five', lat: 4, lng: 4 },
];

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockData),
  })
);

describe('App Component', () => {
  beforeEach(() => {
    render(<App />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the input box', () => {
    expect(screen.getByPlaceholderText('Write here...')).toBeInTheDocument();
  });

  it('fetches and displays geolocation records', async () => {
    await waitFor(() => {
      mockData.forEach((record) => {
        expect(screen.getByText(record.name)).toBeInTheDocument();
      });
    });
  });

  it('filters results based on search input', async () => {
    fireEvent.change(screen.getByPlaceholderText('Write here...'), {
      target: { value: 'City Two' },
    });

    await waitFor(() => {
      expect(screen.getByText('City Three')).toBeInTheDocument();
      expect(screen.getByText('City Four')).toBeInTheDocument();
      expect(screen.getByText('City Five')).toBeInTheDocument();
      expect(screen.queryByText('City Two')).not.toBeInTheDocument();
    });
  });

  it('displays loading indicator during fetch', async () => {
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toHaveClass('visible');
    });

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toHaveClass('invisible');
    });
  });

  it('handles click on a geolocation record and shows top four nearby cities', async () => {
    await waitFor(() => {
      fireEvent.click(screen.getByText('City One'));
    });

    const cercanos = screen.getByTestId('cercanos');
    const citiesWithinCercanos = within(cercanos);

    await waitFor(() => {
      expect(screen.getByText('Cercanos:')).toBeInTheDocument();
      mockData.slice(1).forEach((record) => {
        expect(citiesWithinCercanos.getByText(record.name)).toBeInTheDocument();
      });
    });
  });
});

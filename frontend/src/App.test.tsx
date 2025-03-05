import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock API service
jest.mock('./services/api', () => ({
  getStockData: jest.fn().mockResolvedValue({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prices: [
      { time: 1609459200, open: 132.5, high: 133.2, low: 131.7, close: 132.8, volume: 123456 }
    ],
    events: [
      {
        id: '1',
        title: 'Earnings Release',
        description: 'Company releases financial report',
        time: 1609459200,
        level: 5,
        durationType: 'point',
        source: 'Company News',
        sourceUrl: 'https://example.com/news/1'
      }
    ]
  }),
  lastDataSource: 'yahoo',
  searchStocks: jest.fn().mockResolvedValue([
    { symbol: 'AAPL', name: 'Apple Inc.' }
  ])
}));

describe('App Component', () => {
  // Basic rendering test
  it('renders app title', async () => {
    render(<App />);
    // Since the App component loads data asynchronously, use findByText
    expect(await screen.findByText(/Stock Event Tracker/i)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('displays stock data after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
      expect(screen.getByText(/Apple Inc/i)).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen } from '@testing-library/react';
import StockChart from './StockChart';
import { StockPrice, StockEvent, EventDurationType, EventCategory } from '../../types';

// Mock data
const mockPrices: StockPrice[] = [
  { time: 1612137600, open: 135.90, high: 136.39, low: 134.92, close: 135.73, volume: 2500000 },
  { time: 1612224000, open: 136.89, high: 137.42, low: 135.86, close: 136.73, volume: 2800000 },
  { time: 1612310400, open: 136.62, high: 136.99, low: 134.67, close: 134.99, volume: 3100000 },
];

const mockEvents: StockEvent[] = [
  {
    id: '1',
    title: 'Earnings Release',
    description: 'Company released Q1 2021 financial report',
    startTime: 1612224000,
    durationType: 'temporary' as EventDurationType,
    level: 4,
    sources: ['Company News'],
    urls: ['https://example.com/news/1'],
    category: 'company' as EventCategory
  }
];

// Mock callback function
const mockEventClick = jest.fn();

describe('StockChart Component', () => {
  beforeAll(() => {
    // Mock HTMLCanvasElement.prototype.getContext, because lightweight-charts uses canvas
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn(),
    });
  });
  
  it('renders without crashing', () => {
    render(
      <StockChart 
        prices={mockPrices} 
        events={mockEvents} 
        onEventClick={mockEventClick}
      />
    );
    // Successful rendering doesn't throw an error
    expect(true).toBeTruthy();
  });
  
  it('container is rendered correctly', () => {
    render(
      <StockChart 
        prices={mockPrices} 
        events={mockEvents} 
        onEventClick={mockEventClick}
      />
    );
    
    // Verify container is rendered
    const chartContainer = document.querySelector('.stock-chart-container');
    expect(chartContainer).toBeInTheDocument();
  });
}); 
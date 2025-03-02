import React from 'react';
import { render, screen } from '@testing-library/react';
import StockChart from './StockChart';
import { StockPrice, StockEvent, EventDurationType, EventCategory } from '../../types';

// 模拟数据
const mockPrices: StockPrice[] = [
  { time: 1612137600, open: 135.90, high: 136.39, low: 134.92, close: 135.73, volume: 2500000 },
  { time: 1612224000, open: 136.89, high: 137.42, low: 135.86, close: 136.73, volume: 2800000 },
  { time: 1612310400, open: 136.62, high: 136.99, low: 134.67, close: 134.99, volume: 3100000 },
];

const mockEvents: StockEvent[] = [
  {
    id: '1',
    title: '财报发布',
    description: '公司发布2021财年第一季度财务报告',
    startTime: 1612224000,
    durationType: 'temporary' as EventDurationType,
    level: 4,
    sources: ['Company News'],
    urls: ['https://example.com/news/1'],
    category: 'company' as EventCategory
  }
];

// 模拟回调函数
const mockEventClick = jest.fn();

describe('StockChart Component', () => {
  beforeAll(() => {
    // 模拟HTMLCanvasElement.prototype.getContext，因为lightweight-charts使用canvas
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn(),
    });
  });
  
  it('渲染不崩溃', () => {
    render(
      <StockChart 
        prices={mockPrices} 
        events={mockEvents} 
        onEventClick={mockEventClick}
      />
    );
    // 成功渲染不会抛出错误
    expect(true).toBeTruthy();
  });
  
  it('容器已正确渲染', () => {
    render(
      <StockChart 
        prices={mockPrices} 
        events={mockEvents} 
        onEventClick={mockEventClick}
      />
    );
    
    // 验证容器被渲染
    const chartContainer = document.querySelector('.stock-chart-container');
    expect(chartContainer).toBeInTheDocument();
  });
}); 
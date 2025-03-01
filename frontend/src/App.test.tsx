import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// 模拟API服务
jest.mock('./services/api', () => ({
  getStockData: jest.fn().mockResolvedValue({
    symbol: 'AAPL',
    name: '苹果公司',
    prices: [
      { time: 1612137600, open: 135.90, high: 136.39, low: 134.92, close: 135.73, volume: 2500000 }
    ],
    events: [
      {
        id: '1',
        title: '财报发布',
        description: '公司发布财务报告',
        time: 1612137600,
        level: 3,
        source: '公司新闻',
      }
    ]
  }),
  filterEvents: jest.fn().mockResolvedValue([]),
  searchStocks: jest.fn().mockResolvedValue([
    { symbol: 'AAPL', name: '苹果公司' }
  ])
}));

describe('App组件', () => {
  // 基础渲染测试
  it('渲染应用标题', async () => {
    render(<App />);
    // 因为App组件会异步加载数据，所以使用findByText
    expect(await screen.findByText(/股票事件追踪/i)).toBeInTheDocument();
  });
}); 
import { StockData, StockPrice, StockEvent } from '../types';
import Papa, { ParseResult } from 'papaparse';

// Generate mock stock price data
const generateMockPrices = (symbol: string, days: number = 365 * 3): StockPrice[] => {
  const prices: StockPrice[] = [];
  const now = new Date();
  let basePrice = getBasePrice(symbol);
  let volatility = getVolatility(symbol);
  
  // Generate data points for the specified number of days
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random price movement
    const changePercent = (Math.random() - 0.5) * volatility;
    basePrice = basePrice * (1 + changePercent);
    
    // Calculate high, low, open, close
    const high = basePrice * (1 + Math.random() * 0.02);
    const low = basePrice * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    
    // Generate volume
    const volume = Math.round(basePrice * 1000 * (0.5 + Math.random()));
    
    prices.push({
      time: Math.floor(date.getTime() / 1000),
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return prices;
};

// Generate mock events
export const generateMockEvents = (symbol: string, prices: StockPrice[]): StockEvent[] => {
  const events: StockEvent[] = [];
  
  // Only generate events if we have prices
  if (prices.length === 0) return events;
  
  // Generate approximately 10-20 events over the price range
  const numEvents = 10 + Math.floor(Math.random() * 10);
  const priceIndices = Array.from({ length: prices.length }, (_, i) => i);
  
  // Shuffle and take the first numEvents
  const selectedIndices = priceIndices
    .sort(() => Math.random() - 0.5)
    .slice(0, numEvents)
    .sort((a, b) => a - b); // Sort back to chronological order
  
  // Event types
  const eventTypes = [
    '财报发布', '产品发布', '管理层变动', '收购消息', 
    '股票分割', '派息公告', '战略合作', '监管调查'
  ];
  
  // Generate events at the selected indices
  selectedIndices.forEach(index => {
    const price = prices[index];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const level = Math.floor(Math.random() * 3) + 1 as 1 | 2 | 3;
    
    events.push({
      id: `${symbol}-event-${index}`,
      time: price.time,
      title: eventType,
      description: `${getStockName(symbol)}${eventType}事件`,
      level,
      impact: Math.random() > 0.5 ? 'positive' : 'negative'
    });
  });
  
  return events;
};

// Helper function to get base price for a stock
const getBasePrice = (symbol: string): number => {
  const priceMap: Record<string, number> = {
    'AAPL': 150,
    'MSFT': 300,
    'GOOG': 2500,
    'AMZN': 3000,
    'META': 250,
    'BABA': 80,
    'PDD': 120,
    'BIDU': 130,
    'JD': 35
  };
  
  return priceMap[symbol] || 100 + Math.random() * 200;
};

// Helper function to get volatility for a stock
const getVolatility = (symbol: string): number => {
  const volatilityMap: Record<string, number> = {
    'AAPL': 0.01,
    'MSFT': 0.01,
    'GOOG': 0.015,
    'AMZN': 0.02,
    'META': 0.025,
    'BABA': 0.03,
    'PDD': 0.04,
    'BIDU': 0.025,
    'JD': 0.03
  };
  
  return volatilityMap[symbol] || 0.02;
};


// 获取股票名称
const getStockName = (symbol: string): string => {
  // 中文名称映射表
  const nameMap: Record<string, string> = {
    'AAPL': '苹果公司',
    'MSFT': '微软公司',
    'GOOG': '谷歌公司',
    'GOOGL': '谷歌公司',
    'AMZN': '亚马逊公司',
    'META': 'Meta平台公司',
    'BABA': '阿里巴巴集团',
    'PDD': '拼多多',
    'BIDU': '百度公司',
    'NTES': '网易公司',
    'JD': '京东集团',
    'TCEHY': '腾讯控股',
    '0700.HK': '腾讯控股',
    '9988.HK': '阿里巴巴集团',
    '9999.HK': '网易公司',
    '1024.HK': '快手科技',
    '3690.HK': '美团点评'
  };
  
  return nameMap[symbol] || symbol;
};
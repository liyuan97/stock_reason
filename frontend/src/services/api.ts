import axios from 'axios';
import { StockData, StockPrice, StockEvent, EventLevel } from '../types';
// import { getMockStockData } from '../utils/mockData';
import { generateMockEvents, fetchEventsFromAPI } from '../utils/mockData';

// Define data source types
export type DataSource = 'yahoo' | 'alphavantage' | 'mock';

// Globally save the last used data source
// Other components can import this variable to check data source
export let lastDataSource: DataSource = 'yahoo';

// Yahoo Finance API URL
const YAHOO_API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// // Alpha Vantage API URL and key
// const ALPHA_VANTAGE_API_BASE_URL = 'https://www.alphavantage.co/query';
// const ALPHA_VANTAGE_API_KEY = '55TD120NE68ZMF3A'; // Please replace with your own API key

// Proxy server URL
const PROXY_SERVER_URL = 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate built-in mock events, not dependent on external CSV files
// Local generateMockEvents function has been removed, using function imported from mockData.ts

// Fetch stock prices from Yahoo Finance API through proxy server
const getStockPricesFromYahoo = async (symbol: string): Promise<StockPrice[]> => {
  console.log(`[API] Using Yahoo Finance API for stock prices: ${symbol}`);
  try {
    // Set time period to get historical data for the past 3 years
    const period1 = Math.floor((Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) / 1000); // 3 years ago in seconds
    const period2 = Math.floor(Date.now() / 1000); // now in seconds
    
    // Use proxy server to get data
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/chart/${symbol}`, {
      params: {
        period1,
        period2,
        interval: '1d',
        includePrePost: false,
        events: 'div,split',
      }
    });
    
    // Extract and transform price data
    if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result.length > 0) {
      const result = response.data.chart.result[0];
      const { timestamp, indicators } = result;
      const { quote } = indicators;
      
      if (timestamp && quote && quote[0]) {
        const { open, high, low, close, volume } = quote[0];
        
        // Convert to StockPrice format
        const stockPrices: StockPrice[] = timestamp.map((time: number, index: number) => ({
          time,
          open: open[index] || 0,
          high: high[index] || 0,
          low: low[index] || 0,
          close: close[index] || 0,
          volume: volume[index] || 0
        }));
        
        return stockPrices;
      }
    }
    
    throw new Error('Invalid Yahoo Finance API response format');
  } catch (error) {
    console.error('[API] Error fetching data from Yahoo Finance:', error);
    throw error;
  }
};

// Fetch stock data - supports specifying data source
export const getStockData = async (symbol: string, preferredSource?: DataSource): Promise<StockData> => {
  console.log(`[API] Fetching stock data: ${symbol}, Preferred source: ${preferredSource || 'default'}`);

  let prices: StockPrice[] = [];
  let events: StockEvent[] = [];

  // If no preferred source is specified, default to Yahoo
  const dataSource = preferredSource || 'yahoo';
  
  try {
    if (dataSource === 'yahoo') {
      prices = await getStockPricesFromYahoo(symbol);
      
      // Try to fetch real events from the backend API
      try {
        events = await fetchEventsFromAPI(symbol);
        console.log(`[API] Successfully fetched ${events.length} events from backend API for ${symbol}`);
      } catch (eventError) {
        console.error('[API] Error fetching events from backend:', eventError);
        // Fallback to mock events if the API request fails
        events = generateMockEvents(symbol, prices);
        console.log('[API] Using mock events as fallback');
      }
    } else if (dataSource === 'mock') {
      // Use mock data
      prices = generateMockPrices(symbol);
      events = generateMockEvents(symbol, prices);
    }
    
    lastDataSource = dataSource;
  } catch (error) {
    console.error(`[API] Failed to fetch data from ${dataSource}:`, error);
    
    // If Yahoo fails and it was the preferred source, try mock as fallback
    if (dataSource === 'yahoo') {
      console.warn('[API] Falling back to mock data');
      prices = generateMockPrices(symbol);
      events = generateMockEvents(symbol, prices);
      lastDataSource = 'mock';
    } else {
      throw error; // Re-throw if it wasn't Yahoo or already tried fallback
    }
  }

  return {
    symbol,
    name: getStockName(symbol),
    prices,
    events
  };
};

// Generate mock price data
const generateMockPrices = (symbol: string): StockPrice[] => {
  console.log(`[API] Generating mock prices for: ${symbol}`);
  
  const prices: StockPrice[] = [];
  const now = Math.floor(Date.now() / 1000);
  const startDate = now - 3 * 365 * 24 * 60 * 60; // 3 years ago
  
  // Generate initial price (based on stock code to generate a pseudo-random value)
  const symbolSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let price = 50 + (symbolSum % 200); // Base price between 50 and 250
  
  // Generate daily price data
  for (let time = startDate; time <= now; time += 24 * 60 * 60) {
    // Random price change (-3% to +3%)
    const change = price * (Math.random() * 0.06 - 0.03);
    price += change;
    
    // Ensure price doesn't become negative
    if (price < 1) price = 1;
    
    // Generate daily high and low prices
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    
    // Generate volume
    const volume = Math.floor(1000000 + Math.random() * 10000000);
    
    // Add to price array
    prices.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return prices;
};

// Get stock name
const getStockName = (symbol: string): string => {
  // Chinese name mapping table
  const nameMap: Record<string, string> = {
    'AAPL': 'Apple Company',
    'MSFT': 'Microsoft Company',
    'GOOG': 'Google Company',
    'GOOGL': 'Google Company',
    'AMZN': 'Amazon Company',
    'META': 'Meta Platform Company',
    'BABA': 'Alibaba Group',
    'PDD': 'Pinduoduo',
    'BIDU': 'Baidu Company',
    'NTES': 'NetEase Company',
    'JD': 'JD.com Group',
    'TCEHY': 'Tencent Holdings',
    '0700.HK': 'Tencent Holdings',
    '9988.HK': 'Alibaba Group',
    '9999.HK': 'NetEase Company',
    '1024.HK': 'Kuaishou Technology',
    '3690.HK': 'Meituan Dianping'
  };
  
  return nameMap[symbol] || symbol;
};

// Filter events API
export const filterEvents = async (symbol: string, level?: number): Promise<StockData> => {
  try {
    // Get complete stock data
    const stockData = await getStockData(symbol);
    
    if (level) {
      // If specified level, only return events of that level
      return {
        ...stockData,
        events: stockData.events.filter(event => event.level === level),
      };
    }
    
    return stockData;
  } catch (error: any) {
    console.error('Filter events failed:', error);
    throw error;
  }
};

// Search stocks API
export const searchStocks = async (query: string): Promise<string[]> => {
  console.log(`[API] Search stocks: ${query}`);
  try {
    // Use proxy server to search
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/search`, {
      params: {
        q: query,
        quotesCount: 10,
        lang: 'zh-CN'
      }
    });
    
    // If API call is successful, extract stock codes
    if (response.data && response.data.quotes) {
      const symbols = response.data.quotes
        .filter((quote: any) => quote.symbol) // Ensure there is a stock code
        .map((quote: any) => quote.symbol);   // Extract stock codes
      return symbols;
    }
    
    throw new Error('Unexpected data format from Yahoo Finance search API');
  } catch (error: any) {
    console.error('[API] Search stocks failed:', error);
    
    // If API call fails, return some popular stocks
    const fallbackStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'BABA', 'PDD', 'BIDU', 'JD'];
    return fallbackStocks.filter(stock => stock.toLowerCase().includes(query.toLowerCase()));
  }
}; 
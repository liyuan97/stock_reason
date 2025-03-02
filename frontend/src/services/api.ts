import axios from 'axios';
import { StockData, StockPrice, StockEvent, EventLevel } from '../types';
// import { getMockStockData } from '../utils/mockData';
import { generateMockEvents } from '../utils/mockData';

// 定义数据来源类型
export type DataSource = 'yahoo' | 'mock';

// 全局保存最后使用的数据源
// 其他组件可以导入这个变量来检查数据来源
export let lastDataSource: DataSource = 'yahoo';

// 雅虎财经API URL
const YAHOO_API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// // Alpha Vantage API URL和密钥
// const ALPHA_VANTAGE_API_BASE_URL = 'https://www.alphavantage.co/query';
// const ALPHA_VANTAGE_API_KEY = '55TD120NE68ZMF3A'; // 请替换为您自己的API密钥

// 代理服务器URL
const PROXY_SERVER_URL = 'http://localhost:3001';

// 创建axios实例
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生成内置的模拟事件，不依赖外部CSV文件
// 已移除本地定义的generateMockEvents函数，使用从mockData.ts导入的函数

// Fetch stock prices from Yahoo Finance API through proxy server
const getStockPricesFromYahoo = async (symbol: string): Promise<StockPrice[]> => {
  console.log(`[API] Using Yahoo Finance API for stock prices: ${symbol}`);
  try {
    // Set time period to get historical data for the past 3 years
    const period1 = Math.floor((Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) / 1000); // 3 years ago in seconds
    const period2 = Math.floor(Date.now() / 1000); // now in seconds
    
    // 使用代理服务器获取数据
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
      // Generate events based on the price data
      events = generateMockEvents(symbol, prices);
    } else if (dataSource === 'mock') {
      // 使用模拟数据
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

// 生成模拟价格数据
const generateMockPrices = (symbol: string): StockPrice[] => {
  console.log(`[API] Generating mock prices for: ${symbol}`);
  
  const prices: StockPrice[] = [];
  const now = Math.floor(Date.now() / 1000);
  const startDate = now - 3 * 365 * 24 * 60 * 60; // 3 years ago
  
  // 生成初始价格（根据股票代码生成一个伪随机值）
  const symbolSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let price = 50 + (symbolSum % 200); // 基础价格在50到250之间
  
  // 生成每日价格数据
  for (let time = startDate; time <= now; time += 24 * 60 * 60) {
    // 随机价格变动 (-3% 到 +3%)
    const change = price * (Math.random() * 0.06 - 0.03);
    price += change;
    
    // 确保价格不会变为负数
    if (price < 1) price = 1;
    
    // 生成当天的高低价
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    
    // 生成成交量
    const volume = Math.floor(1000000 + Math.random() * 10000000);
    
    // 添加到价格数组
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

// 筛选事件API
export const filterEvents = async (symbol: string, level?: number): Promise<StockData> => {
  try {
    // 获取完整的股票数据
    const stockData = await getStockData(symbol);
    
    if (level) {
      // 如果指定了等级，只返回该等级的事件
      return {
        ...stockData,
        events: stockData.events.filter(event => event.level === level),
      };
    }
    
    return stockData;
  } catch (error: any) {
    console.error('筛选事件失败:', error);
    throw error;
  }
};

// 搜索股票API
export const searchStocks = async (query: string): Promise<string[]> => {
  console.log(`[API] 搜索股票: ${query}`);
  try {
    // 使用代理服务器搜索
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/search`, {
      params: {
        q: query,
        quotesCount: 10,
        lang: 'zh-CN'
      }
    });
    
    // 如果API调用成功，提取股票代码
    if (response.data && response.data.quotes) {
      const symbols = response.data.quotes
        .filter((quote: any) => quote.symbol) // 确保有股票代码
        .map((quote: any) => quote.symbol);   // 提取股票代码
      return symbols;
    }
    
    throw new Error('雅虎财经搜索API返回意外数据格式');
  } catch (error: any) {
    console.error('[API] 搜索股票失败:', error);
    
    // 如果API调用失败，返回一些热门股票
    const fallbackStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'BABA', 'PDD', 'BIDU', 'JD'];
    return fallbackStocks.filter(stock => stock.toLowerCase().includes(query.toLowerCase()));
  }
}; 
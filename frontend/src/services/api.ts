import axios from 'axios';
import { StockData, StockPrice, StockEvent, EventLevel } from '../types';
import { getMockStockData } from '../utils/mockData';
import { getProxiedUrl, tryAllProxies } from './corsproxy';

// 定义数据来源类型
export type DataSource = 'yahoo' | 'mock';

// 全局保存最后使用的数据源
// 其他组件可以导入这个变量来检查数据来源
export let lastDataSource: DataSource = 'mock';

// 雅虎财经API URL
const YAHOO_API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// 创建axios实例
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    // 添加Referer以减少CORS错误风险
    'Referer': 'https://finance.yahoo.com',
  },
});

// 从雅虎财经获取股票数据
export const getStockData = async (symbol: string): Promise<StockData> => {
  console.log(`[API] 正在获取股票数据: ${symbol}`);
  try {
    // 使用代理工具尝试所有可能的方法
    const result = await tryAllProxies(async (proxyType: string) => {
      let apiUrl = '';
      
      // 确定API URL（是否使用代理）
      if (proxyType === 'direct') {
        apiUrl = `${YAHOO_API_BASE_URL}${symbol}`;
        console.log(`[API] 尝试直接请求: ${apiUrl}`);
      } else if (proxyType.startsWith('proxy:')) {
        // 从proxy:0, proxy:1等提取索引
        const proxyIndex = parseInt(proxyType.split(':')[1]);
        apiUrl = getProxiedUrl(`${YAHOO_API_BASE_URL}${symbol}`, proxyIndex);
        console.log(`[API] 尝试通过代理${proxyIndex}请求: ${apiUrl}`);
      } else {
        throw new Error('未知的代理类型');
      }
      
      const range = '3y'; // 获取3年的数据
      const interval = '1d'; // 日线数据
      
      // 发起API请求
      const response = await axios.get(apiUrl, {
        params: {
          range,
          interval,
          includePrePost: false, // 不包括盘前盘后数据
          events: 'div,split',   // 包括分红和拆股事件
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      // 如果API调用成功，处理响应数据
      if (response.data && response.data.chart && response.data.chart.result) {
        console.log(`[API] 雅虎财经API请求成功`);
        const result = response.data.chart.result[0];
        const meta = result.meta;
        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];
        
        // 转换价格数据
        const prices: StockPrice[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          // 跳过无效数据（可能包含null值）
          if (quote.open[i] === null || quote.close[i] === null) continue;
          
          prices.push({
            time: timestamps[i],
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i]
          });
        }
        
        // 确保价格数据按时间排序并记录数据范围
        prices.sort((a, b) => a.time - b.time);
        if (prices.length > 0) {
          const firstDate = new Date(prices[0].time * 1000);
          const lastDate = new Date(prices[prices.length - 1].time * 1000);
          console.log(`[API] 获取到${prices.length}个价格数据点，从${firstDate.toLocaleDateString()}到${lastDate.toLocaleDateString()}`);
          
          // 检查数据点数量是否符合预期
          if (prices.length < 700) {
            console.warn(`[API] 警告：从API获取的数据点数量(${prices.length})不足以覆盖3年的交易日`);
          }
        }
        
        // 生成事件数据（仍使用模拟事件数据）
        const mockData = getMockStockData(symbol);
        
        // 更新数据来源为雅虎财经
        lastDataSource = 'yahoo';
        
        return {
          symbol,
          name: getStockName(symbol),
          prices,
          events: mockData.events
        };
      }
      
      console.log(`[API] 雅虎财经API返回意外数据格式`);
      throw new Error('雅虎财经API返回意外数据格式');
    });
    
    return result;
  } catch (error: any) {
    console.error('[API] 获取雅虎财经数据失败:', error);
    console.warn('[API] 所有API调用方式都失败，回退到模拟数据');
    
    // 更新数据来源为模拟数据
    lastDataSource = 'mock';
    
    return getMockStockData(symbol);
  }
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
    // 尝试使用雅虎财经搜索建议API
    return await tryAllProxies(async (proxyType: string) => {
      let apiUrl = 'https://query1.finance.yahoo.com/v1/finance/search';
      
      // 确定API URL（是否使用代理）
      if (proxyType !== 'direct') {
        // 从proxy:0, proxy:1等提取索引
        const proxyIndex = parseInt(proxyType.split(':')[1]);
        apiUrl = getProxiedUrl(apiUrl, proxyIndex);
      }
      
      const response = await axios.get(apiUrl, {
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
    });
  } catch (error: any) {
    console.error('[API] 搜索股票失败:', error);
    
    // 如果API调用失败，返回一些热门股票
    const fallbackStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'BABA', 'PDD', 'BIDU', 'JD'];
    return fallbackStocks.filter(stock => stock.toLowerCase().includes(query.toLowerCase()));
  }
}; 
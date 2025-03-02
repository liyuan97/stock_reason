// 股票数据类型
export interface StockData {
  symbol: string;
  name: string;
  prices: StockPrice[];
  events: StockEvent[];
}

// 股票价格类型
export interface StockPrice {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// 事件等级 1-5
export type EventLevel = 1 | 2 | 3 | 4 | 5;

// 事件类型：持续性事件、临时事件、突发事件
export type EventDurationType = 'continuous' | 'temporary' | 'sudden';

// 事件分类：公司自身因素、行业因素、宏观经济政策、市场情绪或外部事件
export type EventCategory = 'company' | 'industry' | 'macroeconomic' | 'market_sentiment';

// 股票事件类型
export interface StockEvent {
  id: string;
  title: string;
  description: string;
  startTime: number; // Unix timestamp in seconds
  endTime?: number; // 可选的结束时间，对于持续性事件
  durationType: EventDurationType; // 事件持续类型
  level: EventLevel;
  sources?: string[]; // 更改为数组，可能有多个来源
  urls?: string[]; // 更改为数组，可能有多个链接
  impact?: 'positive' | 'negative' | 'neutral';
  category: EventCategory; // 事件分类
}

// 图表配置类型
export interface ChartConfig {
  width: number;
  height: number;
  timeScale?: {
    timeVisible?: boolean;
    secondsVisible?: boolean;
  };
} 
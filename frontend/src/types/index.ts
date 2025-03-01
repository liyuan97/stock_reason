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

// 股票事件类型
export interface StockEvent {
  id: string;
  title: string;
  description: string;
  time: number; // Unix timestamp in seconds
  level: EventLevel;
  source?: string;
  url?: string;
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
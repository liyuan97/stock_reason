import { Time, IChartApi, ISeriesApi, SeriesMarker, IPriceLine } from 'lightweight-charts';
import { StockPrice, StockEvent } from '../../../types';

// 可选的时间范围
export type TimeRange = '1m' | '3m' | '6m' | '1y' | '3y';

// 添加一个新的接口用于事件覆盖层信息
export interface EventOverlay extends HTMLDivElement {
  eventInfo?: StockEvent;
}

export interface StockChartProps {
  prices: StockPrice[];
  events: StockEvent[];
  onEventClick?: (event: StockEvent) => void;
}

export interface ChartContextType {
  chartRef: React.MutableRefObject<IChartApi | null>;
  seriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  setChartContainerRef: (ref: React.RefObject<HTMLDivElement>) => void;
  events: StockEvent[];
  currentTheme: string;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  onEventClick?: (event: StockEvent) => void;
  cleanupEventOverlays: () => void;
  eventOverlaysRef: React.MutableRefObject<EventOverlay[]>;
  activePointTooltipRef: React.MutableRefObject<HTMLDivElement | null>;
} 
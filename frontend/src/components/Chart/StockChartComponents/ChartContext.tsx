import React, { createContext, useContext, useRef, useState } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ChartContextType, EventOverlay, TimeRange } from './ChartTypes';
import { StockEvent } from '../../../types';

// Create the context
const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const ChartProvider: React.FC<{ children: React.ReactNode, events: StockEvent[], currentTheme: string, onEventClick?: (event: StockEvent) => void }> = ({ 
  children, 
  events, 
  currentTheme,
  onEventClick 
}) => {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const eventOverlaysRef = useRef<EventOverlay[]>([]);
  const activePointTooltipRef = useRef<HTMLDivElement | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3y');

  // 清理事件区域函数
  const cleanupEventOverlays = () => {
    eventOverlaysRef.current.forEach(overlay => {
      if (chartContainerRef.current?.contains(overlay)) {
        chartContainerRef.current?.removeChild(overlay);
      }
    });
    eventOverlaysRef.current = [];
  };

  // Function to set the chart container ref
  const setChartContainerRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      chartContainerRef.current = ref.current;
    }
  };

  return (
    <ChartContext.Provider value={{
      chartRef,
      seriesRef,
      chartContainerRef,
      setChartContainerRef,
      events,
      currentTheme,
      selectedRange,
      setSelectedRange,
      onEventClick,
      cleanupEventOverlays,
      eventOverlaysRef,
      activePointTooltipRef
    }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChartContext = (): ChartContextType => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
}; 
import React, { useState } from 'react';
import { StockPrice, StockEvent } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import './StockChart.css';

// Import components from the new modular structure
import {
  ChartProvider,
  ChartInitializer,
  RangeSelector,
  ChartStats,
  EventMarkerManager,
  EventRegionManager,
  PriceDataManager,
  ChartScaleManager,
  TimeRange,
  StockChartProps,
  ChartContainer
} from './StockChartComponents';

const StockChart: React.FC<StockChartProps> = ({ prices, events, onEventClick }) => {
  const { currentTheme } = useTheme();
  const [eventsState, setEventsState] = useState<StockEvent[]>(events);

  // 当props中的events变化时，更新eventsState
  React.useEffect(() => {
    setEventsState(events);
  }, [events]);

  return (
    <ChartProvider 
      events={eventsState} 
      currentTheme={currentTheme}
      onEventClick={onEventClick}
    >
      <div className="stock-chart-container">
        {/* Range selector controls */}
        <RangeSelector />
        
        {/* Chart container */}
        <ChartContainer />
        
        {/* Chart statistics */}
        <ChartStats prices={prices} />
        
        {/* Logic components (no UI) */}
        <ChartInitializer />
        <PriceDataManager prices={prices} />
        <EventMarkerManager />
        <EventRegionManager />
        <ChartScaleManager />
      </div>
    </ChartProvider>
  );
};

export default StockChart; 
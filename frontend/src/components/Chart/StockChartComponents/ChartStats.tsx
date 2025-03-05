import React from 'react';
import { useChartContext } from './ChartContext';
import { StockPrice } from '../../../types';

interface ChartStatsProps {
  prices: StockPrice[];
}

const ChartStats: React.FC<ChartStatsProps> = ({ prices }) => {
  const { currentTheme, selectedRange } = useChartContext();
  
  return (
    <div className="chart-stats" style={{ 
      marginTop: '10px', 
      fontSize: '12px', 
      color: currentTheme === 'dark' ? '#aaa' : '#666',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div>
        Data points: <b>{prices.length}</b>
      </div>
      {prices.length > 0 && (
        <div>
          Range: <b>{new Date(prices[0].time * 1000).toLocaleDateString()}</b> to <b>{new Date(prices[prices.length - 1].time * 1000).toLocaleDateString()}</b>
        </div>
      )}
      <div>
        Current view: <b>{selectedRange === '1m' ? '1 Month' : 
                   selectedRange === '3m' ? '3 Months' : 
                   selectedRange === '6m' ? '6 Months' : 
                   selectedRange === '1y' ? '1 Year' : '3 Years All'}</b>
      </div>
    </div>
  );
};

export default ChartStats; 
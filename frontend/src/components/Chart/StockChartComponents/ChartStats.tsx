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
        数据点: <b>{prices.length}</b>
      </div>
      {prices.length > 0 && (
        <div>
          范围: <b>{new Date(prices[0].time * 1000).toLocaleDateString()}</b> 至 <b>{new Date(prices[prices.length - 1].time * 1000).toLocaleDateString()}</b>
        </div>
      )}
      <div>
        当前显示: <b>{selectedRange === '1m' ? '1个月' : 
                   selectedRange === '3m' ? '3个月' : 
                   selectedRange === '6m' ? '6个月' : 
                   selectedRange === '1y' ? '1年' : '3年全部'}</b>
      </div>
    </div>
  );
};

export default ChartStats; 
import React from 'react';
import { Radio } from 'antd';
import { useChartContext } from './ChartContext';
import { TimeRange } from './ChartTypes';

const RangeSelector: React.FC = () => {
  const { selectedRange, setSelectedRange } = useChartContext();
  
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
  };
  
  return (
    <div className="chart-controls" style={{ marginBottom: '12px' }}>
      <Radio.Group 
        value={selectedRange} 
        onChange={(e) => handleRangeChange(e.target.value)} 
        buttonStyle="solid"
        style={{ marginBottom: '10px' }}
      >
        <Radio.Button value="1m">1个月</Radio.Button>
        <Radio.Button value="3m">3个月</Radio.Button>
        <Radio.Button value="6m">6个月</Radio.Button>
        <Radio.Button value="1y">1年</Radio.Button>
        <Radio.Button value="3y">3年</Radio.Button>
      </Radio.Group>
    </div>
  );
};

export default RangeSelector; 
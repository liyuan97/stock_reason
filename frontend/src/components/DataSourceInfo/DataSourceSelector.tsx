import React from 'react';
import { Radio, Space, Typography } from 'antd';
import { useTheme } from '../../context/ThemeContext';
import { DataSource } from '../../services/api';

const { Text } = Typography;

interface DataSourceSelectorProps {
  currentSource: DataSource;
  onSourceChange: (source: DataSource) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ 
  currentSource, 
  onSourceChange 
}) => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';

  return (
    <div className="data-source-selector">
      <Space direction="vertical" size="small">
        <Text strong style={{ color: isDarkTheme ? '#e0e0e0' : '#333' }}>
          数据源选择:
        </Text>
        <Radio.Group 
          value={currentSource} 
          onChange={(e) => onSourceChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="yahoo">雅虎财经</Radio.Button>
          <Radio.Button value="mock">模拟数据</Radio.Button>
        </Radio.Group>
      </Space>
    </div>
  );
};

export default DataSourceSelector; 
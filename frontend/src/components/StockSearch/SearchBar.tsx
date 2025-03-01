import React from 'react';
import { Select, Typography } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const { Option } = Select;
const { Text } = Typography;

// 预设的股票列表
const STOCK_OPTIONS = [
  { symbol: 'AAPL', name: '苹果公司' },
  { symbol: 'MSFT', name: '微软公司' },
  { symbol: 'GOOGL', name: '谷歌公司' },
  { symbol: 'AMZN', name: '亚马逊公司' },
  { symbol: 'TSLA', name: '特斯拉公司' },
  { symbol: 'BABA', name: '阿里巴巴' }
];

interface SearchBarProps {
  onSelect: (symbol: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';
  
  // 选择股票
  const handleSelectStock = (value: string) => {
    onSelect(value);
  };
  
  return (
    <div className="stock-select-container">
      <Text strong style={{ marginRight: '12px', color: isDarkTheme ? '#e0e0e0' : '#333' }}>
        选择股票：
      </Text>
      <Select
        defaultValue="AAPL"
        style={{ width: 240 }}
        onChange={handleSelectStock}
        optionLabelProp="label"
        dropdownStyle={{ 
          backgroundColor: isDarkTheme ? '#1e1e1e' : '#fff',
          color: isDarkTheme ? '#e0e0e0' : '#333'
        }}
      >
        {STOCK_OPTIONS.map(stock => (
          <Option 
            key={stock.symbol} 
            value={stock.symbol} 
            label={stock.symbol}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{stock.symbol}</span>
              <span style={{ color: isDarkTheme ? '#aaa' : '#888' }}>{stock.name}</span>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SearchBar; 
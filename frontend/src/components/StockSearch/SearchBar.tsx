import React from 'react';
import { Select, Typography } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const { Option } = Select;
const { Text } = Typography;

// Preset stock list
const STOCK_OPTIONS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Google (Alphabet Inc.)' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.' }
];

interface SearchBarProps {
  onSelect: (symbol: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';
  
  // Select stock
  const handleSelectStock = (value: string) => {
    onSelect(value);
  };
  
  return (
    <div className="stock-select-container">
      <Text strong style={{ marginRight: '12px', color: isDarkTheme ? '#e0e0e0' : '#333' }}>
        Select Stock:
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
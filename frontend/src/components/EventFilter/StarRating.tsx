import React, { useState } from 'react';
import { Rate, Typography, Tooltip } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const { Text } = Typography;

interface StarRatingProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';
  const [hoverValue, setHoverValue] = useState<number>(0);
  
  // 处理星级选择
  const handleChange = (newValue: number) => {
    // 如果点击当前选中的星级，则清除选择（全部事件）
    if (newValue === value) {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };
  
  // 获取提示文本
  const getTooltipText = (stars: number) => {
    switch(stars) {
      case 1: return '显示1星及以上事件';
      case 2: return '显示2星及以上事件';
      case 3: return '显示3星及以上事件';
      case 4: return '显示4星及以上事件';
      case 5: return '仅显示5星事件';
      default: return '移动鼠标选择星级';
    }
  };
  
  const tooltipText = getTooltipText(hoverValue || value || 0);
  
  return (
    <div className="star-rating-container">
      <Text strong style={{ marginRight: '12px', color: isDarkTheme ? '#e0e0e0' : '#333' }}>
        事件重要性：
      </Text>
      <Tooltip title={tooltipText} placement="bottom">
        <div>
          <Rate
            character={<StarFilled />}
            value={value}
            onChange={handleChange}
            onHoverChange={setHoverValue}
            style={{ 
              fontSize: '24px',
              color: isDarkTheme ? '#ffd700' : '#fadb14'
            }}
          />
        </div>
      </Tooltip>
      <Text type="secondary" style={{ marginLeft: '12px', color: isDarkTheme ? '#aaa' : '' }}>
        {value ? `${value}星及以上` : '全部事件'}
      </Text>
    </div>
  );
};

export default StarRating; 
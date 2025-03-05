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
  
  // Handle star rating selection
  const handleChange = (newValue: number) => {
    // If clicking the currently selected star level, clear the selection (all events)
    if (newValue === value) {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };
  
  // Get tooltip text
  const getTooltipText = (stars: number) => {
    switch(stars) {
      case 1: return 'Show events with 1 star or above';
      case 2: return 'Show events with 2 stars or above';
      case 3: return 'Show events with 3 stars or above';
      case 4: return 'Show events with 4 stars or above';
      case 5: return 'Show only 5 star events';
      default: return 'Move mouse to select star level';
    }
  };
  
  const tooltipText = getTooltipText(hoverValue || value || 0);
  
  return (
    <div className="star-rating-container">
      <Text strong style={{ marginRight: '12px', color: isDarkTheme ? '#e0e0e0' : '#333' }}>
        Event Importance:
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
        {value ? `${value} stars or above` : 'All events'}
      </Text>
    </div>
  );
};

export default StarRating; 
import React from 'react';
import { StockEvent, EventLevel } from '../../types';

interface EventMarkerProps {
  event: StockEvent;
  onClick: () => void;
  selected?: boolean;
}

// 根据事件级别返回颜色
const getLevelColor = (level: EventLevel): string => {
  switch (level) {
    case 1:
      return '#2196F3'; // 蓝色 - 信息
    case 2:
      return '#4CAF50'; // 绿色 - 积极
    case 3:
      return '#FFC107'; // 黄色 - 警告
    case 4:
      return '#FF9800'; // 橙色 - 重要
    case 5:
      return '#F44336'; // 红色 - 严重
    default:
      return '#2196F3'; // 默认蓝色
  }
};

const EventMarker: React.FC<EventMarkerProps> = ({ event, onClick, selected = false }) => {
  const markerColor = getLevelColor(event.level);
  
  return (
    <div 
      className={`event-marker ${selected ? 'selected' : ''}`}
      style={{ 
        backgroundColor: markerColor,
        opacity: selected ? 1 : 0.8,
        transform: selected ? 'scale(1.1)' : 'scale(1)',
      }}
      onClick={onClick}
      title={event.title}
    >
      <span className="event-marker-level">{event.level}</span>
    </div>
  );
};

export default EventMarker; 
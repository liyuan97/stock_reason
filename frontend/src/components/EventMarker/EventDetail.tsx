import React from 'react';
import { StockEvent } from '../../types';

interface EventDetailProps {
  event: StockEvent;
  onClose: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  // 格式化时间戳为可读的日期时间
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // 转换为毫秒
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 根据事件等级返回样式类名
  const getLevelClassName = (): string => {
    return `event-level event-level-${event.level}`;
  };
  
  return (
    <div className="event-detail">
      <div className="event-detail-header">
        <h3>{event.title}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="event-detail-content">
        <div className="event-meta">
          <span className={getLevelClassName()}>重要程度: {event.level}</span>
          <span className="event-date">{formatDate(event.time)}</span>
          {event.source && <span className="event-source">来源: {event.source}</span>}
        </div>
        
        <p className="event-description">{event.description}</p>
        
        {event.url && (
          <div className="event-link">
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              查看详情
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail; 
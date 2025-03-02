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
          <span className="event-date">{formatDate(event.startTime)}</span>
          {event.endTime && (
            <span className="event-duration">
              结束时间: {formatDate(event.endTime)}
            </span>
          )}
          {event.sources && event.sources.length > 0 && (
            <span className="event-source">来源: {event.sources.join(', ')}</span>
          )}
          {event.category && (
            <span className="event-category">分类: {getCategoryName(event.category)}</span>
          )}
        </div>
        
        <p className="event-description">{event.description}</p>
        
        {event.urls && event.urls.length > 0 && (
          <div className="event-links">
            <h4>相关链接:</h4>
            <ul>
              {event.urls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    查看详情 {event.urls && event.urls.length > 1 ? `(${index + 1})` : ''}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// 获取分类的中文名称
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'company': '公司自身因素',
    'industry': '行业因素',
    'macroeconomic': '宏观经济政策',
    'market_sentiment': '市场情绪/外部事件'
  };
  
  return categoryMap[category] || category;
};

export default EventDetail; 
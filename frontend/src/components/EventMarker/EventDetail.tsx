import React from 'react';
import { StockEvent } from '../../types';

interface EventDetailProps {
  event: StockEvent;
  onClose: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  // Format timestamp to readable date time
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Return style class name based on event level
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
          <span className={getLevelClassName()}>Importance: {event.level}</span>
          <span className="event-date">{formatDate(event.startTime)}</span>
          {event.endTime && (
            <span className="event-duration">
              End time: {formatDate(event.endTime)}
            </span>
          )}
          {event.sources && event.sources.length > 0 && (
            <span className="event-source">Source: {event.sources.join(', ')}</span>
          )}
          {event.category && (
            <span className="event-category">Category: {getCategoryName(event.category)}</span>
          )}
        </div>
        
        <p className="event-description">{event.description}</p>
        
        {event.urls && event.urls.length > 0 && (
          <div className="event-links">
            <h4>Related links:</h4>
            <ul>
              {event.urls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    View details {event.urls && event.urls.length > 1 ? `(${index + 1})` : ''}
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

// Get category name in English
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'company': 'Company Factors',
    'industry': 'Industry Factors',
    'macroeconomic': 'Macroeconomic Policies',
    'market_sentiment': 'Market Sentiment/External Events'
  };
  
  return categoryMap[category] || category;
};

export default EventDetail; 
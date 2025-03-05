import React from 'react';
import { StockEvent, EventLevel } from '../../types';

interface EventMarkerProps {
  event: StockEvent;
  onClick: () => void;
  selected?: boolean;
}

// Return color based on event level
const getLevelColor = (level: EventLevel): string => {
  switch (level) {
    case 1:
      return '#2196F3'; // Blue - Information
    case 2:
      return '#4CAF50'; // Green - Positive
    case 3:
      return '#FFC107'; // Yellow - Warning
    case 4:
      return '#FF9800'; // Orange - Important
    case 5:
      return '#F44336'; // Red - Critical
    default:
      return '#2196F3'; // Default blue
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
import React from 'react';
import { StockEvent } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Timeline, Card, Tag, Space } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface EventTimelineProps {
  events: StockEvent[];
  onEventSelect: (event: StockEvent) => void;
  selectedEvent?: StockEvent | null;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, onEventSelect, selectedEvent }) => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Group events by date
  const groupEventsByDate = (): { [date: string]: StockEvent[] } => {
    const grouped: { [date: string]: StockEvent[] } = {};
    
    events.forEach(event => {
      const dateStr = formatDate(event.startTime);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });
    
    return grouped;
  };
  
  const groupedEvents = groupEventsByDate();
  const dates = Object.keys(groupedEvents).sort((a, b) => {
    // Sort by date in descending order (newest date first)
    const timeA = new Date(a).getTime();
    const timeB = new Date(b).getTime();
    return timeB - timeA;
  });
  
  // Get color corresponding to event level
  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return 'blue';
      case 2: return 'green';
      case 3: return 'gold';
      case 4: return 'orange';
      case 5: return 'red';
      default: return 'blue';
    }
  };
  
  // Create Timeline items for each date group
  const createTimelineItems = (date: string) => {
    return groupedEvents[date].map(event => ({
      key: event.id,
      color: getLevelColor(event.level),
      children: (
        <Card
          size="small"
          style={{ 
            marginBottom: '8px',
            cursor: 'pointer',
            borderLeft: `2px solid ${getLevelColor(event.level)}`,
            backgroundColor: selectedEvent?.id === event.id 
              ? (isDarkTheme ? '#303030' : '#f0f7ff') 
              : (isDarkTheme ? '#262626' : '#fff'),
            color: isDarkTheme ? '#e0e0e0' : 'inherit'
          }}
          onClick={() => onEventSelect(event)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Tag color={getLevelColor(event.level)}>
                Level {event.level}
              </Tag>
              <Text type="secondary" style={{ color: isDarkTheme ? '#aaa' : '' }}>
                {new Date(event.startTime * 1000).toLocaleTimeString('en-US', {
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
                {event.endTime && (
                  <span> - {new Date(event.endTime * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                )}
              </Text>
              {event.durationType && (
                <Tag color={event.durationType === 'continuous' ? 'purple' : 
                           event.durationType === 'temporary' ? 'cyan' : 'volcano'}>
                  {event.durationType === 'continuous' ? 'Continuous' : 
                   event.durationType === 'temporary' ? 'Temporary' : 'Sudden'}
                </Tag>
              )}
            </Space>
            
            <Text 
              strong 
              style={{ 
                color: isDarkTheme ? '#e0e0e0' : '#333' 
              }}
            >
              {event.title}
            </Text>
            
            <Paragraph 
              ellipsis={{ rows: 2 }}
              style={{ 
                margin: 0,
                color: isDarkTheme ? '#bbb' : '#666' 
              }}
            >
              {event.description}
            </Paragraph>
          </Space>
        </Card>
      )
    }));
  };
  
  return (
    <div className="timeline-container">
      {dates.length === 0 ? (
        <div 
          className="no-events" 
          style={{ color: isDarkTheme ? '#bbb' : '#666' }}
        >
          No matching events
        </div>
      ) : (
        dates.map(date => (
          <div key={date} className="timeline-date-group" style={{ marginBottom: '20px' }}>
            <Title 
              level={5} 
              style={{ 
                margin: '16px 0 8px',
                color: isDarkTheme ? '#e0e0e0' : '#333' 
              }}
            >
              {date}
            </Title>
            
            <Timeline items={createTimelineItems(date)} />
          </div>
        ))
      )}
    </div>
  );
};

export default EventTimeline; 
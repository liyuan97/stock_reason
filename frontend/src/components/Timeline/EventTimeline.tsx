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
  
  // 格式化时间戳为可读的日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // 转换为毫秒
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // 按日期分组事件
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
    // 按日期倒序排列（最新日期在前）
    const timeA = new Date(a).getTime();
    const timeB = new Date(b).getTime();
    return timeB - timeA;
  });
  
  // 获取事件级别对应的颜色
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
  
  // 为每个日期组创建Timeline项目
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
                级别 {event.level}
              </Tag>
              <Text type="secondary" style={{ color: isDarkTheme ? '#aaa' : '' }}>
                {new Date(event.startTime * 1000).toLocaleTimeString('zh-CN', {
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
                {event.endTime && (
                  <span> - {new Date(event.endTime * 1000).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                )}
              </Text>
              {event.durationType && (
                <Tag color={event.durationType === 'continuous' ? 'purple' : 
                           event.durationType === 'temporary' ? 'cyan' : 'volcano'}>
                  {event.durationType === 'continuous' ? '持续性' : 
                   event.durationType === 'temporary' ? '临时' : '突发'}
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
          没有匹配的事件
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
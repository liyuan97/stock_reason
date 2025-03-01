import { useState, useCallback, useEffect } from 'react';
import { StockEvent, EventLevel } from '../types';

// 用于处理事件过滤的自定义Hook
const useEventFiltering = (
  events: StockEvent[], 
  initialLevel?: EventLevel
) => {
  const [filteredLevel, setFilteredLevel] = useState<EventLevel | undefined>(initialLevel);
  const [filteredEvents, setFilteredEvents] = useState<StockEvent[]>(events);
  
  // 过滤事件
  useEffect(() => {
    if (filteredLevel) {
      setFilteredEvents(events.filter(event => event.level === filteredLevel));
    } else {
      setFilteredEvents(events);
    }
  }, [events, filteredLevel]);
  
  // 设置过滤级别
  const setFilter = useCallback((level?: EventLevel) => {
    setFilteredLevel(level);
  }, []);
  
  // 重置过滤器
  const resetFilter = useCallback(() => {
    setFilteredLevel(undefined);
  }, []);
  
  return {
    filteredEvents,
    filteredLevel,
    setFilter,
    resetFilter
  };
};

export default useEventFiltering; 
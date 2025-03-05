import { useState, useCallback, useEffect } from 'react';
import { StockEvent, EventLevel } from '../types';

// Custom Hook for handling event filtering
const useEventFiltering = (
  events: StockEvent[], 
  initialLevel?: EventLevel
) => {
  const [filteredLevel, setFilteredLevel] = useState<EventLevel | undefined>(initialLevel);
  const [filteredEvents, setFilteredEvents] = useState<StockEvent[]>(events);
  
  // Filter events
  useEffect(() => {
    if (filteredLevel) {
      setFilteredEvents(events.filter(event => event.level === filteredLevel));
    } else {
      setFilteredEvents(events);
    }
  }, [events, filteredLevel]);
  
  // Set filter level
  const setFilter = useCallback((level?: EventLevel) => {
    setFilteredLevel(level);
  }, []);
  
  // Reset filter
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
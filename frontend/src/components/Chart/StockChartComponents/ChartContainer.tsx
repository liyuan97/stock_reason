import React, { useRef } from 'react';
import { useChartContext } from './ChartContext';
import useChartResize from '../../../hooks/useChartResize';

const ChartContainer: React.FC = () => {
  const { setChartContainerRef, currentTheme } = useChartContext();
  // Define the ref explicitly as non-null HTMLDivElement
  const containerRef = useRef<HTMLDivElement>(null);

  // Register the container ref with the context
  React.useEffect(() => {
    if (containerRef.current) {
      // Create a new ref object with the current DOM element
      const nonNullRef = { current: containerRef.current } as React.RefObject<HTMLDivElement>;
      setChartContainerRef(nonNullRef);
    }
  }, [setChartContainerRef]);

  // Use the resize hook to handle chart resizing
  useChartResize(containerRef, (width, height) => {
    // The actual resize logic is handled in ChartInitializer
  });

  return (
    <div 
      ref={containerRef} 
      className="chart-container"
      style={{ 
        height: '500px', 
        width: '100%', 
        backgroundColor: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff'
      }} 
    />
  );
};

export default ChartContainer; 
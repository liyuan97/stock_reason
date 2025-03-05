import { useEffect, useCallback, RefObject } from 'react';
import useWindowSize from './useWindowSize';

// Custom Hook for handling chart container size changes
const useChartResize = (
  containerRef: RefObject<HTMLDivElement | null>,
  onResize: (width: number, height: number) => void
): void => {
  const windowSize = useWindowSize();
  
  // Resize the chart
  const resizeChart = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      onResize(clientWidth, clientHeight);
    }
  }, [containerRef, onResize]);
  
  // Listen for window size changes
  useEffect(() => {
    resizeChart();
  }, [windowSize, resizeChart]);
  
  return;
};

export default useChartResize; 
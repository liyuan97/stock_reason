import { useEffect, useCallback, RefObject } from 'react';
import useWindowSize from './useWindowSize';

// 用于处理图表容器尺寸变化的自定义Hook
const useChartResize = (
  containerRef: RefObject<HTMLDivElement | null>,
  onResize: (width: number, height: number) => void
): void => {
  const windowSize = useWindowSize();
  
  // 重设图表尺寸
  const resizeChart = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      onResize(clientWidth, clientHeight);
    }
  }, [containerRef, onResize]);
  
  // 监听窗口尺寸变化
  useEffect(() => {
    resizeChart();
  }, [windowSize, resizeChart]);
  
  return;
};

export default useChartResize; 
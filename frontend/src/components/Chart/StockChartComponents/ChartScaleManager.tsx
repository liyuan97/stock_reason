import React, { useEffect } from 'react';
import { useChartContext } from './ChartContext';
import { createEventMarkers } from './EventMarkerManager';

const ChartScaleManager: React.FC = () => {
  const { 
    chartRef, 
    seriesRef, 
    events, 
    cleanupEventOverlays 
  } = useChartContext();

  // 处理图表缩放或平移时更新事件标记和连续事件区域
  useEffect(() => {
    // 创建一个跟踪变量，用于防止在组件卸载后的异步操作
    let isComponentMounted = true;
    
    if (chartRef.current && seriesRef.current) {
      const handleScaleChange = () => {
        // 如果组件已卸载或图表已处置，不要执行任何操作
        if (!isComponentMounted || !chartRef.current || !seriesRef.current) {
          return;
        }
        
        console.log('图表缩放或平移，重新渲染事件标记和区域');
        
        // 当图表缩放或平移时，重新计算并更新连续事件区域
        // 清理现有覆盖层
        cleanupEventOverlays();
        
        // 确保标记仍然可见
        if (events.length > 0 && seriesRef.current) {
          // 保存当前的series引用，避免在timeout内它变为null
          const currentSeries = seriesRef.current;
          
          // 使用延迟确保缩放操作已完成
          setTimeout(() => {
            // 再次检查组件和图表是否仍然存在
            if (!isComponentMounted || !chartRef.current) {
              return;
            }
            
            try {
              // 重新创建事件标记
              const markers = createEventMarkers(events);
              
              // 设置标记
              if (currentSeries) {
                currentSeries.setMarkers(markers);
                console.log(`缩放/平移后: 重新渲染了 ${markers.length} 个事件标记`);
              }
            } catch (e) {
              console.error('Error redrawing markers on scale change:', e);
            }
          }, 300); // 增加延迟以确保缩放完成
        }
      };
      
      // 订阅缩放事件
      chartRef.current.timeScale().subscribeVisibleTimeRangeChange(handleScaleChange);
      
      return () => {
        // 设置卸载标志
        isComponentMounted = false;
        
        // 取消订阅
        try {
          if (chartRef.current) {
            chartRef.current.timeScale().unsubscribeVisibleTimeRangeChange(handleScaleChange);
          }
        } catch (e) {
          console.error('Error unsubscribing from scale change:', e);
        }
      };
    }
  }, [events, cleanupEventOverlays, chartRef, seriesRef]);

  return null; // This is a logic-only component
};

export default ChartScaleManager; 
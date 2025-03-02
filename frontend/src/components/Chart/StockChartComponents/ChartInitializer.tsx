import React, { useEffect } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useChartContext } from './ChartContext';

const ChartInitializer: React.FC = () => {
  const { 
    chartRef, 
    seriesRef, 
    chartContainerRef, 
    cleanupEventOverlays, 
    currentTheme 
  } = useChartContext();

  // 创建图表 - 只创建一次，不随主题变化而重建
  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current) {
      console.log('Creating new chart instance');
      // 创建图表实例 - 使用适合日线显示的选项
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        crosshair: {
          mode: 1,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          // 确保时间刻度适合日线显示
          tickMarkFormatter: (time: number) => {
            const date = new Date(time * 1000);
            return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
          }
        },
        localization: {
          dateFormat: 'yyyy/MM/dd'
        }
      });
      
      // 添加K线图
      const newSeries = newChart.addCandlestickSeries();
      
      // 保存图表和数据系列到refs和状态
      chartRef.current = newChart;
      seriesRef.current = newSeries;
      
      // 处理窗口缩放
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        console.log('Disposing chart instance');
        window.removeEventListener('resize', handleResize);
        
        // 确保清理所有事件区域
        cleanupEventOverlays();
        
        // 确保在销毁图表之前取消所有订阅
        if (chartRef.current) {
          try {
            // 不需要手动取消这些订阅，remove()会清理所有订阅
            // 直接安全地销毁图表就足够了
            chartRef.current.remove();
          } catch (e) {
            console.log('Chart cleanup error:', e);
          }
          
          // 清空引用
          chartRef.current = null;
          seriesRef.current = null;
        }
      };
    }
  }, []); // 空依赖数组，确保只创建一次
  
  // 主题变化时更新图表样式，而不是重建图表
  useEffect(() => {
    if (chartRef.current && seriesRef.current) {
      const isDarkTheme = currentTheme === 'dark';
      
      // 更新图表样式
      chartRef.current.applyOptions({
        layout: {
          background: { 
            type: ColorType.Solid, 
            color: isDarkTheme ? '#1e1e1e' : '#ffffff' 
          },
          textColor: isDarkTheme ? '#d0d0d0' : '#333333',
        },
        grid: {
          vertLines: {
            color: isDarkTheme ? 'rgba(197, 203, 206, 0.2)' : 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: isDarkTheme ? 'rgba(197, 203, 206, 0.2)' : 'rgba(197, 203, 206, 0.5)',
          },
        },
        timeScale: {
          borderColor: isDarkTheme ? '#444' : '#D1D4DC',
        },
        rightPriceScale: {
          borderColor: isDarkTheme ? '#444' : '#D1D4DC',
        },
      });
      
      // 更新K线图样式
      seriesRef.current.applyOptions({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
    }
  }, [currentTheme, chartRef, seriesRef]);
  
  return null; // This is a logic-only component, no rendering
};

export default ChartInitializer; 
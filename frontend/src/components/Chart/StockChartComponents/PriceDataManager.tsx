import React, { useEffect } from 'react';
import { Time } from 'lightweight-charts';
import { useChartContext } from './ChartContext';
import { StockPrice } from '../../../types';
import { TimeRange } from './ChartTypes';
import { createEventMarkers } from './EventMarkerManager';

interface PriceDataManagerProps {
  prices: StockPrice[];
}

const PriceDataManager: React.FC<PriceDataManagerProps> = ({ prices }) => {
  const { 
    chartRef, 
    seriesRef, 
    currentTheme, 
    selectedRange,
    setSelectedRange,
    events,
    cleanupEventOverlays
  } = useChartContext();

  // 处理时间范围选择
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    
    if (!chartRef.current || !seriesRef.current || prices.length === 0) {
      console.log('无法设置范围：图表或数据未准备好');
      return;
    }
    
    try {
      // 确保使用排序后的数据
      const sortedPrices = [...prices].sort((a, b) => a.time - b.time);
      const firstTimestamp = sortedPrices[0].time;
      const lastTimestamp = sortedPrices[sortedPrices.length - 1].time;
      
      // 计算范围
      let fromTimestamp: number;
      const lastDate = new Date(lastTimestamp * 1000);
      
      // 根据选择的范围设置起始日期
      switch (range) {
        case '1m':
          const oneMonthAgo = new Date(lastDate);
          oneMonthAgo.setMonth(lastDate.getMonth() - 1);
          fromTimestamp = Math.max(firstTimestamp, Math.floor(oneMonthAgo.getTime() / 1000));
          break;
        case '3m':
          const threeMonthsAgo = new Date(lastDate);
          threeMonthsAgo.setMonth(lastDate.getMonth() - 3);
          fromTimestamp = Math.max(firstTimestamp, Math.floor(threeMonthsAgo.getTime() / 1000));
          break;
        case '6m':
          const sixMonthsAgo = new Date(lastDate);
          sixMonthsAgo.setMonth(lastDate.getMonth() - 6);
          fromTimestamp = Math.max(firstTimestamp, Math.floor(sixMonthsAgo.getTime() / 1000));
          break;
        case '1y':
          const oneYearAgo = new Date(lastDate);
          oneYearAgo.setFullYear(lastDate.getFullYear() - 1);
          fromTimestamp = Math.max(firstTimestamp, Math.floor(oneYearAgo.getTime() / 1000));
          break;
        case '3y':
        default:
          // 使用全部数据
          fromTimestamp = firstTimestamp;
          break;
      }
      
      const fromDate = new Date(fromTimestamp * 1000);
      
      // 设置图表可见范围
      console.log(`设置图表范围: ${fromDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`);
      
      const currentChart = chartRef.current;
      const currentSeries = seriesRef.current;
      
      if (!currentChart || !currentSeries) {
        console.warn('图表实例已不存在，无法设置范围');
        return;
      }
      
      try {
        currentChart.timeScale().setVisibleRange({
          from: fromTimestamp as Time,
          to: lastTimestamp as Time,
        });
      } catch (e) {
        console.error('设置图表可见范围时出错:', e);
        return; // 如果设置范围失败，不继续执行后续操作
      }
      
      // 在范围改变后，确保事件标记和覆盖层能够正确显示
      if (events.length > 0) {
        // 清除任何现有的覆盖层
        cleanupEventOverlays();
        
        // 添加延迟，确保在时间范围更改后重新渲染事件标记
        setTimeout(() => {
          // 再次检查图表实例是否仍然存在
          if (!chartRef.current || chartRef.current !== currentChart || !seriesRef.current || seriesRef.current !== currentSeries) {
            console.log('图表实例已变更，取消重绘标记');
            return;
          }
          
          try {
            // 生成事件标记
            const markers = createEventMarkers(events);
            
            // 设置事件标记
            currentSeries.setMarkers(markers);
            console.log(`范围变更: 重新渲染了 ${markers.length} 个事件标记`);
          } catch (e) {
            console.error('在范围变化后重绘标记时出错:', e);
          }
        }, 300);
      }
    } catch (e) {
      console.error('处理范围变化时出错:', e);
    }
  };

  // 更新价格数据并设置正确的日线显示
  useEffect(() => {
    // 创建一个跟踪变量，用于防止在组件卸载后的异步操作
    let isComponentMounted = true;
    
    if (seriesRef.current && prices.length > 0) {
      try {
        // 检查数据范围
        const firstDate = new Date(prices[0].time * 1000);
        const lastDate = new Date(prices[prices.length - 1].time * 1000);
        console.log(`正在渲染${prices.length}个数据点，从${firstDate.toLocaleDateString()}到${lastDate.toLocaleDateString()}`);
        
        // 克隆数据以避免引用问题
        const pricesCopy = [...prices];
        
        // 确保数据是按时间正确排序的（从早到晚）
        pricesCopy.sort((a, b) => a.time - b.time);
        
        // 转换数据格式
        const candleData = pricesCopy.map(price => ({
          time: price.time as Time,
          open: price.open,
          high: price.high,
          low: price.low,
          close: price.close,
        }));
        
        // 设置数据
        seriesRef.current.setData(candleData);
        
        // 确保显示完整的3年数据
        if (chartRef.current && pricesCopy.length > 0) {
          // 检查数据点数量
          if (pricesCopy.length < 700) {
            console.warn(`警告：数据点数量(${pricesCopy.length})不足以显示完整的3年日线数据，期望至少750个交易日数据点`);
          }
          
          // 保存当前的引用，避免在异步操作中引用被清空
          const currentChartRef = chartRef.current;
          const currentSeriesRef = seriesRef.current;
          
          // 设置时间刻度间隔适合3年日线显示
          try {
            currentChartRef.timeScale().applyOptions({
              timeVisible: true,
              secondsVisible: false,
              borderColor: currentTheme === 'dark' ? '#444' : '#D1D4DC',
              // 对于3年的日线数据，使用月刻度更合适
              tickMarkFormatter: (time: any) => {
                const date = new Date(time * 1000);
                return `${date.getFullYear()}/${date.getMonth() + 1}`;
              }
            });
          } catch (e) {
            console.error('Error applying time scale options:', e);
          }
          
          // 根据当前选择的范围设置可见区域（使用复制排序后的数据）
          // 将这个调用放到最后，因为它会触发渲染
          try {
            handleRangeChange(selectedRange);
          } catch (e) {
            console.error('Error handling range change:', e);
          }
        }
      } catch (e) {
        console.error('Error updating price data:', e);
      }
    }
    
    return () => {
      // 标记组件已卸载，防止异步操作
      isComponentMounted = false;
    };
  }, [prices, currentTheme, selectedRange, events, cleanupEventOverlays]);

  return null; // This is a logic-only component
};

export default PriceDataManager; 
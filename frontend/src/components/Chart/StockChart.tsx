import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, DeepPartial, ChartOptions, SeriesMarker, Time, MouseEventParams, ColorType } from 'lightweight-charts';
import { StockPrice, StockEvent } from '../../types';
import useChartResize from '../../hooks/useChartResize';
import { useTheme } from '../../context/ThemeContext';
import { Button, Space, Radio } from 'antd';

interface StockChartProps {
  prices: StockPrice[];
  events: StockEvent[];
  onEventClick?: (event: StockEvent) => void;
}

// 可选的时间范围
type TimeRange = '1m' | '3m' | '6m' | '1y' | '3y';

const StockChart: React.FC<StockChartProps> = ({ prices, events, onEventClick }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<'Candlestick'> | null>(null);
  const { currentTheme } = useTheme();
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3y'); // 默认显示全部3年数据
  
  // 创建图表 - 只创建一次，不随主题变化而重建
  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current) {
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
      setChart(newChart);
      setSeries(newSeries);
      
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
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
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
  }, [currentTheme]);
  
  // 使用自定义Hook处理图表尺寸
  useChartResize(chartContainerRef, (width, height) => {
    if (chartRef.current) {
      chartRef.current.applyOptions({ width, height });
    }
  });
  
  // 处理时间范围选择
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    
    if (!chartRef.current || prices.length === 0) return;
    
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
    
    chartRef.current.timeScale().setVisibleRange({
      from: fromTimestamp as Time,
      to: lastTimestamp as Time,
    });
  };
  
  // 更新价格数据并设置正确的日线显示
  useEffect(() => {
    if (seriesRef.current && prices.length > 0) {
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
        
        // 根据当前选择的范围设置可见区域（使用复制排序后的数据）
        handleRangeChange(selectedRange);
        
        // 设置时间刻度间隔适合3年日线显示
        chartRef.current.timeScale().applyOptions({
          timeVisible: true,
          secondsVisible: false,
          borderColor: currentTheme === 'dark' ? '#444' : '#D1D4DC',
          // 对于3年的日线数据，使用月刻度更合适
          tickMarkFormatter: (time: any) => {
            const date = new Date(time * 1000);
            return `${date.getFullYear()}/${date.getMonth() + 1}`;
          }
        });
      }
    }
  }, [prices, currentTheme, selectedRange]);
  
  // 更新事件标记
  useEffect(() => {
    if (seriesRef.current && events.length > 0) {
      // 创建标记
      const markers: SeriesMarker<Time>[] = events.map(event => {
        // 根据事件级别设置标记颜色
        let color = '#2196F3'; // 默认蓝色
        switch(event.level) {
          case 1:
            color = '#2196F3'; // 蓝色 - 信息
            break;
          case 2:
            color = '#4CAF50'; // 绿色 - 积极
            break;
          case 3:
            color = '#FFC107'; // 黄色 - 警告
            break;
          case 4:
            color = '#FF9800'; // 橙色 - 重要
            break;
          case 5:
            color = '#F44336'; // 红色 - 严重
            break;
        }
        
        return {
          time: event.time as Time,
          position: 'aboveBar',
          color,
          shape: 'circle',
          text: event.level.toString(),
          size: 1,
        };
      });
      
      // 设置标记
      seriesRef.current.setMarkers(markers);
    } else if (seriesRef.current) {
      // 清除标记
      seriesRef.current.setMarkers([]);
    }
  }, [events]);
  
  // 单独处理事件点击
  useEffect(() => {
    if (chartRef.current && onEventClick && seriesRef.current && events.length > 0) {
      // 对标记进行处理以便点击识别
      const markers = events.map(event => ({
        time: event.time as Time,
        event,
      }));
      
      const clickHandler = (param: MouseEventParams) => {
        if (!param.point || !param.time) {
          return;
        }
        
        const timeValue = param.time;
        
        // 寻找最接近的事件
        const clickedMarkerInfo = markers.find(marker => 
          marker.time === timeValue
        );
        
        if (clickedMarkerInfo) {
          // 只触发事件处理，不改变图表范围
          onEventClick(clickedMarkerInfo.event);
        }
      };
      
      // 使用点击事件而不是十字线移动
      chartRef.current.subscribeClick(clickHandler);
      
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeClick(clickHandler);
        }
      };
    }
  }, [onEventClick, events]);
  
  return (
    <div className="stock-chart-container">
      <div className="chart-controls" style={{ marginBottom: '12px' }}>
        <Radio.Group 
          value={selectedRange} 
          onChange={(e) => handleRangeChange(e.target.value)} 
          buttonStyle="solid"
          style={{ marginBottom: '10px' }}
        >
          <Radio.Button value="1m">1个月</Radio.Button>
          <Radio.Button value="3m">3个月</Radio.Button>
          <Radio.Button value="6m">6个月</Radio.Button>
          <Radio.Button value="1y">1年</Radio.Button>
          <Radio.Button value="3y">3年</Radio.Button>
        </Radio.Group>
      </div>
      <div 
        ref={chartContainerRef} 
        className="chart-container"
        style={{ 
          height: '500px', 
          width: '100%', 
          backgroundColor: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff'
        }} 
      />
      {/* 数据统计信息 */}
      <div className="chart-stats" style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: currentTheme === 'dark' ? '#aaa' : '#666',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          数据点: <b>{prices.length}</b>
        </div>
        {prices.length > 0 && (
          <div>
            范围: <b>{new Date(prices[0].time * 1000).toLocaleDateString()}</b> 至 <b>{new Date(prices[prices.length - 1].time * 1000).toLocaleDateString()}</b>
          </div>
        )}
        <div>
          当前显示: <b>{selectedRange === '1m' ? '1个月' : 
                     selectedRange === '3m' ? '3个月' : 
                     selectedRange === '6m' ? '6个月' : 
                     selectedRange === '1y' ? '1年' : '3年全部'}</b>
        </div>
      </div>
    </div>
  );
};

export default StockChart; 
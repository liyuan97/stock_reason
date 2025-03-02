import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, SeriesMarker, Time, MouseEventParams, ColorType, IPriceLine } from 'lightweight-charts';
import { StockPrice, StockEvent } from '../../types';
import useChartResize from '../../hooks/useChartResize';
import { useTheme } from '../../context/ThemeContext';
import { Button, Space, Radio, Tooltip, Popover } from 'antd';
import './StockChart.css'; // 为了添加自定义的CSS样式

interface StockChartProps {
  prices: StockPrice[];
  events: StockEvent[];
  onEventClick?: (event: StockEvent) => void;
}

// 可选的时间范围
type TimeRange = '1m' | '3m' | '6m' | '1y' | '3y';

// 添加一个新的接口用于事件覆盖层信息
interface EventOverlay extends HTMLDivElement {
  eventInfo?: StockEvent;
}

const StockChart: React.FC<StockChartProps> = ({ prices, events, onEventClick }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3y'); // 默认显示全部3年数据
  const [eventsState, setEventsState] = useState<StockEvent[]>(events); // 添加事件状态
  
  // 保存事件区域的引用以便清理
  const eventOverlaysRef = useRef<EventOverlay[]>([]);
  
  // 添加用于跟踪当前激活的点标记提示
  const activePointTooltipRef = useRef<HTMLDivElement | null>(null);

  // 当props中的events变化时，更新eventsState
  useEffect(() => {
    setEventsState(events);
  }, [events]);

  // 清理事件区域函数
  const cleanupEventOverlays = () => {
    eventOverlaysRef.current.forEach(overlay => {
      if (chartContainerRef.current?.contains(overlay)) {
        chartContainerRef.current?.removeChild(overlay);
      }
    });
    eventOverlaysRef.current = [];
  };
  
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
  }, [prices, currentTheme, selectedRange, handleRangeChange]);
  
  // 处理图表缩放或平移时更新连续事件区域
  useEffect(() => {
    if (chartRef.current && seriesRef.current) {
      const handleScaleChange = () => {
        // 当图表缩放或平移时，重新计算并更新连续事件区域
        cleanupEventOverlays();
        
        // 重新触发事件效果，通过改变state来触发重新渲染
        const currentEvents = [...eventsState];
        setEventsState([]); 
        setTimeout(() => setEventsState(currentEvents), 50);
      };
      
      chartRef.current.timeScale().subscribeVisibleTimeRangeChange(handleScaleChange);
      
      return () => {
        chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(handleScaleChange);
      };
    }
  }, [eventsState]);  // 依赖eventsState而不是events
  
  // 处理鼠标十字线移动，用于显示事件点上的提示
  useEffect(() => {
    if (chartRef.current && eventsState.length > 0) {
      // 移除当前活动的提示
      const removeActiveTooltip = () => {
        if (activePointTooltipRef.current && chartContainerRef.current?.contains(activePointTooltipRef.current)) {
          chartContainerRef.current.removeChild(activePointTooltipRef.current);
          activePointTooltipRef.current = null;
        }
      };

      // 鼠标移动处理函数
      const handleCrosshairMove = (param: MouseEventParams) => {
        // 移除之前的提示
        removeActiveTooltip();
        
        if (!param.point || !param.time) {
          return;
        }
        
        // 检查当前时间位置是否有事件点
        const timeValue = param.time as number;
        const eventsAtTime = eventsState.filter(event => event.startTime === timeValue);
        
        if (eventsAtTime.length > 0) {
          // 创建提示容器
          const tooltip = document.createElement('div');
          tooltip.className = 'event-tooltip point-event-tooltip';
          
          // 根据第一个事件获取颜色
          const event = eventsAtTime[0];
          let color = '#2196F3'; // 默认蓝色
          switch(event.level) {
            case 1: color = '#2196F3'; break; // 蓝色 - 信息
            case 2: color = '#4CAF50'; break; // 绿色 - 积极
            case 3: color = '#FFC107'; break; // 黄色 - 警告
            case 4: color = '#FF9800'; break; // 橙色 - 重要
            case 5: color = '#F44336'; break; // 红色 - 严重
          }
          
          // 设置定位和样式
          tooltip.style.position = 'absolute';
          tooltip.style.left = `${param.point.x}px`;
          tooltip.style.top = `${param.point.y - 10}px`;
          tooltip.style.transform = 'translate(-50%, -100%)';
          tooltip.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#fff';
          tooltip.style.color = currentTheme === 'dark' ? '#fff' : '#333';
          tooltip.style.padding = '8px 12px';
          tooltip.style.borderRadius = '4px';
          tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          tooltip.style.zIndex = '10';
          tooltip.style.maxWidth = '300px';
          tooltip.style.whiteSpace = 'nowrap';
          
          // 如果有多个事件，显示数量
          if (eventsAtTime.length > 1) {
            tooltip.innerHTML = `<div style="font-weight: bold;"><span style="color: ${color};">●</span> ${eventsAtTime.length}个事件 (点击查看详情)</div>`;
          } else {
            tooltip.innerHTML = `
              <div style="font-weight: bold;"><span style="color: ${color};">●</span> ${event.title}</div>
              <div style="font-size: 12px;">${new Date(event.startTime * 1000).toLocaleDateString()} | 级别: ${event.level}</div>
            `;
          }
          
          // 添加到容器，保存引用以便后续移除
          chartContainerRef.current?.appendChild(tooltip);
          activePointTooltipRef.current = tooltip;
        }
      };
      
      // 订阅十字线移动事件
      chartRef.current.subscribeCrosshairMove(handleCrosshairMove);
      
      // 鼠标离开图表时移除提示
      const handleMouseLeave = () => {
        removeActiveTooltip();
      };
      
      // 为图表容器添加鼠标离开监听器
      chartContainerRef.current?.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        // 清理
        chartRef.current?.unsubscribeCrosshairMove(handleCrosshairMove);
        chartContainerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
        removeActiveTooltip();
      };
    }
  }, [eventsState, currentTheme]);
  
  // 更新事件标记
  useEffect(() => {
    if (seriesRef.current && eventsState.length > 0) {
      // 清除之前的标记和区域线
      seriesRef.current.setMarkers([]);
      
      // 清除现有的事件区域
      cleanupEventOverlays();
      
      // 保存已创建的价格线以便之后移除
      const priceLines: IPriceLine[] = [];
      
      // 创建标记
      const markers: SeriesMarker<Time>[] = eventsState.map(event => {
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
        
        // 如果是持续性事件且有结束时间，创建区域标记
        if (event.durationType === 'continuous' && event.endTime && chartRef.current) {
          // 延迟创建覆盖层，确保时间坐标系统已准备好
          setTimeout(() => {
            if (chartRef.current && chartContainerRef.current) {
              const timeScale = chartRef.current.timeScale();
              const startCoord = timeScale.timeToCoordinate(event.startTime as Time);
              const endCoord = timeScale.timeToCoordinate(event.endTime as Time);
              
              if (startCoord !== null && endCoord !== null) {
                const overlay = document.createElement('div') as EventOverlay;
                overlay.className = 'event-region-overlay';
                overlay.style.position = 'absolute';
                overlay.style.left = `${startCoord}px`;
                overlay.style.width = `${endCoord - startCoord}px`;
                overlay.style.top = '0';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = `${color}20`; // 20% 透明度
                overlay.style.pointerEvents = 'auto'; // 允许鼠标事件
                overlay.style.zIndex = '1';
                overlay.style.cursor = 'pointer'; // 鼠标变为手型
                overlay.style.transition = 'background-color 0.2s ease'; // 添加过渡效果
                overlay.title = `${event.title} (${new Date(event.startTime * 1000).toLocaleDateString()} - ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : '至今'})`;
                
                // 存储事件信息到覆盖层元素
                overlay.eventInfo = event;
                
                // 添加鼠标悬停效果
                overlay.addEventListener('mouseenter', () => {
                  overlay.style.backgroundColor = `${color}40`; // 悬停时提高透明度为40%
                  
                  // 创建一个悬浮提示元素
                  const tooltip = document.createElement('div');
                  tooltip.className = 'event-tooltip';
                  tooltip.style.position = 'absolute';
                  tooltip.style.left = `${startCoord + (endCoord - startCoord) / 2}px`;
                  tooltip.style.transform = 'translateX(-50%)';
                  tooltip.style.bottom = '20px';
                  tooltip.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#fff';
                  tooltip.style.color = currentTheme === 'dark' ? '#fff' : '#333';
                  tooltip.style.padding = '8px 12px';
                  tooltip.style.borderRadius = '4px';
                  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  tooltip.style.zIndex = '10';
                  tooltip.style.maxWidth = '300px';
                  tooltip.style.pointerEvents = 'none';
                  
                  // 添加内容
                  tooltip.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 4px;">${event.title}</div>
                    <div style="font-size: 12px; margin-bottom: 4px;">
                      <span style="color: ${color};">●</span> 
                      级别: ${event.level} | 
                      ${new Date(event.startTime * 1000).toLocaleDateString()} - 
                      ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : '至今'}
                    </div>
                    <div style="font-size: 12px;">${event.description.slice(0, 100)}${event.description.length > 100 ? '...' : ''}</div>
                  `;
                  
                  // 添加到容器中
                  chartContainerRef.current?.appendChild(tooltip);
                  overlay.dataset.tooltipId = Date.now().toString();
                  tooltip.id = overlay.dataset.tooltipId;
                });
                
                overlay.addEventListener('mouseleave', () => {
                  overlay.style.backgroundColor = `${color}20`; // 恢复原来的透明度
                  
                  // 移除提示元素
                  if (overlay.dataset.tooltipId) {
                    const tooltip = document.getElementById(overlay.dataset.tooltipId);
                    if (tooltip && chartContainerRef.current?.contains(tooltip)) {
                      chartContainerRef.current?.removeChild(tooltip);
                    }
                    delete overlay.dataset.tooltipId;
                  }
                });
                
                // 添加点击事件处理
                overlay.addEventListener('click', () => {
                  if (onEventClick && overlay.eventInfo) {
                    onEventClick(overlay.eventInfo);
                  }
                });
                
                chartContainerRef.current.appendChild(overlay);
                eventOverlaysRef.current.push(overlay);
                
                // 为区域的开始和结束创建价格线
                const startPriceLine = seriesRef.current?.createPriceLine({
                  price: 0,
                  color: color,
                  lineWidth: 2,
                  lineStyle: 2, // 虚线
                  axisLabelVisible: false,
                  title: event.title,
                });
                
                const endPriceLine = seriesRef.current?.createPriceLine({
                  price: 0,
                  color: color,
                  lineWidth: 2,
                  lineStyle: 2, // 虚线
                  axisLabelVisible: false,
                  title: '',
                });
                
                if (startPriceLine && endPriceLine) {
                  priceLines.push(startPriceLine, endPriceLine);
                }
              }
            }
          }, 200); // 给图表一些时间来计算坐标
        }
        
        return {
          time: event.startTime as Time, // 使用 startTime 而不是 time
          position: 'aboveBar',
          color,
          shape: 'circle',
          text: event.level.toString(),
          size: 1,
        };
      });
      
      // 设置标记
      seriesRef.current.setMarkers(markers);
      
      // 返回清理函数
      return () => {
        // 清除所有价格线
        if (seriesRef.current) {
          priceLines.forEach(line => {
            seriesRef.current?.removePriceLine(line);
          });
        }
        // 清除所有事件区域
        cleanupEventOverlays();
      };
    } else if (seriesRef.current) {
      // 清除标记
      seriesRef.current.setMarkers([]);
      // 清除所有事件区域
      cleanupEventOverlays();
    }
  }, [eventsState, currentTheme, onEventClick]);
  
  // 清理函数 - 组件卸载时
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    return () => {
      if (chartContainer) {
        cleanupEventOverlays();
      }
    };
  }, []);
  
  // 单独处理事件点击
  useEffect(() => {
    if (chartRef.current && onEventClick && seriesRef.current && eventsState.length > 0) {
      // 对标记进行处理以便点击识别
      const markers = eventsState.map(event => ({
        time: event.startTime as Time, // 使用 startTime 而不是 time
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
  }, [onEventClick, eventsState]);
  
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
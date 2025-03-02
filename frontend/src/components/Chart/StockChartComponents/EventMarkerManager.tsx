import React, { useEffect } from 'react';
import { Time, SeriesMarker, MouseEventParams } from 'lightweight-charts';
import { useChartContext } from './ChartContext';
import { StockEvent } from '../../../types';

// 获取事件颜色
export const getEventColor = (level: number): string => {
  switch(level) {
    case 1: return '#2196F3'; // 蓝色 - 信息
    case 2: return '#4CAF50'; // 绿色 - 积极
    case 3: return '#FFC107'; // 黄色 - 警告
    case 4: return '#FF9800'; // 橙色 - 重要
    case 5: return '#F44336'; // 红色 - 严重
    default: return '#2196F3'; // 默认蓝色
  }
};

// 创建事件标记
export const createEventMarkers = (events: StockEvent[]): SeriesMarker<Time>[] => {
  return events.map(event => {
    const color = getEventColor(event.level);
    
    return {
      time: event.startTime as Time,
      position: 'aboveBar',
      color,
      shape: event.level >= 4 ? 'arrowDown' : 'circle',
      text: event.level.toString(),
      size: event.level, // 根据级别调整大小
    };
  });
};

const EventMarkerManager: React.FC = () => {
  const { 
    chartRef, 
    seriesRef, 
    chartContainerRef, 
    events, 
    currentTheme, 
    onEventClick,
    cleanupEventOverlays,
    eventOverlaysRef,
    activePointTooltipRef
  } = useChartContext();

  // 处理鼠标十字线移动，用于显示事件点上的提示
  useEffect(() => {
    if (!chartRef.current || events.length === 0) return;

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
      
      if (!param.point || !param.time || !chartContainerRef.current) {
        return;
      }
      
      // 检查当前时间位置是否有事件点
      const timeValue = param.time as number;
      
      // 添加时间容差，允许在事件点附近显示提示
      // 为日线图表添加一天的容差范围
      const TIME_TOLERANCE = 24 * 60 * 60; // 一天的秒数
      const eventsNearTime = events.filter(event => 
        Math.abs(event.startTime - timeValue) <= TIME_TOLERANCE
      );
      
      if (eventsNearTime.length > 0) {
        // 在找到的事件中找到距离当前时间最近的事件
        const closestEvent = eventsNearTime.reduce((prev, curr) => 
          Math.abs(curr.startTime - timeValue) < Math.abs(prev.startTime - timeValue) ? curr : prev
        );
        
        // 使用找到的时间点的坐标（而不是鼠标位置）更准确
        let tooltipX = param.point.x;
        
        // 如果可以，获取精确的事件点x坐标
        const eventCoordX = chartRef.current?.timeScale().timeToCoordinate(closestEvent.startTime as Time);
        if (eventCoordX !== null && eventCoordX !== undefined) {
          tooltipX = eventCoordX;
        }
        
        // 创建提示容器
        const tooltip = document.createElement('div');
        tooltip.className = 'event-tooltip point-event-tooltip';
        
        // 根据事件获取颜色
        const event = closestEvent;
        const color = getEventColor(event.level);
        
        // 设置定位和样式
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${param.point.y - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#fff';
        tooltip.style.color = currentTheme === 'dark' ? '#fff' : '#333';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        tooltip.style.zIndex = '100'; // 增加z-index以确保在最上层
        tooltip.style.maxWidth = '300px';
        tooltip.style.pointerEvents = 'auto'; // 允许鼠标事件
        tooltip.style.whiteSpace = 'normal'; // 允许内容自动换行
        tooltip.style.display = 'block'; // 确保显示
        tooltip.style.opacity = '1'; // 确保可见
        
        // 如果有多个相近事件，显示数量
        if (eventsNearTime.length > 1) {
          tooltip.innerHTML = `<div style="font-weight: bold;"><span style="color: ${color};">●</span> ${eventsNearTime.length}个事件 (点击查看详情)</div>`;
          
          // 添加点击事件以展示所有相近事件的详细信息
          tooltip.style.cursor = 'pointer';
          tooltip.onclick = () => {
            if (onEventClick) {
              onEventClick(closestEvent); // A点击时触发第一个事件
            }
          };
        } else {
          tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;"><span style="color: ${color};">●</span> ${event.title}</div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              ${new Date(event.startTime * 1000).toLocaleDateString()} | 级别: ${event.level}
            </div>
            <div style="font-size: 12px;">${event.description ? event.description.slice(0, 120) + (event.description.length > 120 ? '...' : '') : '无描述'}</div>
          `;
          
          // 添加点击事件处理
          if (onEventClick) {
            tooltip.style.cursor = 'pointer';
            tooltip.onclick = () => {
              if (onEventClick) {
                onEventClick(event);
              }
            };
          }
        }
        
        // 添加到容器，保存引用以便后续移除
        chartContainerRef.current.appendChild(tooltip);
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
      try {
        if (chartRef.current) {
          chartRef.current.unsubscribeCrosshairMove(handleCrosshairMove);
        }
        if (chartContainerRef.current) {
          chartContainerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      } catch (e) {
        console.error('Error cleaning up crosshair event handlers:', e);
      }
      removeActiveTooltip();
    };
  }, [events, currentTheme, onEventClick, chartRef, chartContainerRef, activePointTooltipRef]);

  // 单独处理事件点击
  useEffect(() => {
    if (!chartRef.current || !onEventClick || !seriesRef.current || events.length === 0) return;
    
    // 对标记进行处理以便点击识别
    const markers = events.map(event => ({
      time: event.startTime as Time,
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
  }, [onEventClick, events, chartRef, seriesRef]);

  return null; // This is a logic-only component
};

export default EventMarkerManager; 
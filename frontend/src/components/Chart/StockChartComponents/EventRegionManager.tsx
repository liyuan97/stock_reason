import React, { useEffect } from 'react';
import { Time } from 'lightweight-charts';
import { useChartContext } from './ChartContext';
import { getEventColor } from './EventMarkerManager';

const EventRegionManager: React.FC = () => {
  const { 
    chartRef, 
    seriesRef, 
    chartContainerRef, 
    events, 
    currentTheme, 
    onEventClick,
    cleanupEventOverlays,
    eventOverlaysRef
  } = useChartContext();

  // Create continuous event regions
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || events.length === 0) return;
    
    // Clear existing event regions
    cleanupEventOverlays();
    
    // Sort events by startTime in ascending order to ensure correct time sequence
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    
    // Process continuous events
    sortedEvents.forEach(event => {
      // If it's a continuous event with an end time, create a region marker
      if (event.durationType === 'continuous' && event.endTime && chartRef.current) {
        // Capture current chart reference to avoid referencing potentially changing values in timeout
        const currentChart = chartRef.current;
        const currentContainer = chartContainerRef.current;
        
        // Delay creating overlays to ensure the time coordinate system is ready
        setTimeout(() => {
          try {
            // Ensure chart and container still exist
            if (!currentChart || !currentContainer || currentChart !== chartRef.current) {
              console.log('Chart instance has changed, canceling region overlay creation');
              return;
            }
            
            const timeScale = currentChart.timeScale();
            const startCoord = timeScale.timeToCoordinate(event.startTime as Time);
            const endCoord = timeScale.timeToCoordinate(event.endTime as Time);
            
            if (startCoord !== null && endCoord !== null) {
              const color = getEventColor(event.level);
              
              const overlay = document.createElement('div');
              overlay.className = 'event-region-overlay';
              overlay.style.position = 'absolute';
              overlay.style.left = `${startCoord}px`;
              overlay.style.width = `${endCoord - startCoord}px`;
              overlay.style.top = '25px'; // Leave some space from the top to avoid obscuring markers
              overlay.style.height = 'calc(100% - 50px)'; // Ensure it doesn't obscure bottom scale
              overlay.style.backgroundColor = `${color}30`; // 30% transparency
              overlay.style.pointerEvents = 'auto'; // Allow mouse events
              overlay.style.zIndex = '2'; // Ensure it's above price lines but below markers
              overlay.style.cursor = 'pointer'; // Change cursor to pointer
              overlay.style.transition = 'background-color 0.2s ease'; // Add transition effect
              overlay.style.borderLeft = `2px solid ${color}`; // Add left border
              overlay.style.borderRight = `2px solid ${color}`; // Add right border
              overlay.title = `${event.title} (${new Date(event.startTime * 1000).toLocaleDateString()} - ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : 'Present'})`;
              
              // Add horizontal lines to identify the start and end of the event region
              const topLine = document.createElement('div');
              topLine.style.position = 'absolute';
              topLine.style.top = '0';
              topLine.style.left = '0';
              topLine.style.width = '100%';
              topLine.style.height = '2px';
              topLine.style.backgroundColor = color;
              
              const bottomLine = document.createElement('div');
              bottomLine.style.position = 'absolute';
              bottomLine.style.bottom = '0';
              bottomLine.style.left = '0';
              bottomLine.style.width = '100%';
              bottomLine.style.height = '2px';
              bottomLine.style.backgroundColor = color;
              
              overlay.appendChild(topLine);
              overlay.appendChild(bottomLine);
              
              // 存储事件信息到覆盖层元素
              (overlay as any).eventInfo = event;
              
              // 简化：使用一个变量追踪当前tooltip
              let activeTooltip: HTMLElement | null = null;
              
              // 添加鼠标悬停效果
              overlay.addEventListener('mouseenter', () => {
                overlay.style.backgroundColor = `${color}50`; // 悬停时提高透明度为50%
                
                // 创建一个悬浮提示元素
                const tooltip = document.createElement('div');
                tooltip.className = 'event-tooltip';
                tooltip.style.position = 'absolute';
                tooltip.style.left = `${startCoord + (endCoord - startCoord) / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.top = '10px'; // 将提示放在区域上方
                tooltip.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#fff';
                tooltip.style.color = currentTheme === 'dark' ? '#fff' : '#333';
                tooltip.style.padding = '8px 12px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                tooltip.style.zIndex = '100'; // 确保在最上层
                tooltip.style.maxWidth = '300px';
                tooltip.style.minWidth = '200px'; // 设置最小宽度
                tooltip.style.pointerEvents = 'none'; // 防止提示框自身触发鼠标事件
                tooltip.style.whiteSpace = 'normal'; // 允许文本换行
                tooltip.style.border = `1px solid ${color}`; // 添加边框
                
                // 添加内容
                tooltip.innerHTML = `
                  <div style="font-weight: bold; margin-bottom: 4px; color:${color};">${event.title}</div>
                  <div style="font-size: 12px; margin-bottom: 4px;">
                    Duration: ${new Date(event.startTime * 1000).toLocaleDateString()} - 
                    ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : 'Present'}
                  </div>
                  <div style="font-size: 12px; margin-bottom: 4px;">
                    Importance Level: ${event.level} / 5
                  </div>
                  <div style="font-size: 12px;">${event.description ? event.description : 'No description'}</div>
                  <div style="font-size: 10px; text-align: center; margin-top: 8px; font-style: italic;">Click for more details</div>
                `;
                
                // 添加到容器中
                currentContainer.appendChild(tooltip);
                activeTooltip = tooltip;
              });
              
              overlay.addEventListener('mouseleave', () => {
                overlay.style.backgroundColor = `${color}30`; // 恢复原来的透明度
                
                // 移除提示元素
                if (activeTooltip && currentContainer.contains(activeTooltip)) {
                  currentContainer.removeChild(activeTooltip);
                  activeTooltip = null;
                }
              });
              
              // 添加点击事件处理
              overlay.addEventListener('click', () => {
                if (onEventClick && (overlay as any).eventInfo) {
                  onEventClick((overlay as any).eventInfo);
                }
              });
              
              currentContainer.appendChild(overlay);
              eventOverlaysRef.current.push(overlay as any);
            }
          } catch (e) {
            console.error('Error creating event region overlay:', e);
          }
        }, 300); // Give chart more time to calculate coordinates
      }
    });
    
    return () => {
      // Clear all event regions
      cleanupEventOverlays();
    };
  }, [events, currentTheme, onEventClick, chartRef, chartContainerRef, cleanupEventOverlays, eventOverlaysRef, seriesRef]);

  return null; // This is a logic-only component
};

export default EventRegionManager; 
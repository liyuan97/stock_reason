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

  // 创建持续性事件区域
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || events.length === 0) return;
    
    // 清除现有的事件区域
    cleanupEventOverlays();
    
    // 对事件按照startTime进行升序排序，确保时间顺序正确
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    
    // 处理持续性事件
    sortedEvents.forEach(event => {
      // 如果是持续性事件且有结束时间，创建区域标记
      if (event.durationType === 'continuous' && event.endTime && chartRef.current) {
        // 捕获当前图表引用，避免在timeout中引用可能变化的值
        const currentChart = chartRef.current;
        const currentContainer = chartContainerRef.current;
        
        // 延迟创建覆盖层，确保时间坐标系统已准备好
        setTimeout(() => {
          try {
            // 确保图表和容器仍然存在
            if (!currentChart || !currentContainer || currentChart !== chartRef.current) {
              console.log('图表实例已变更，取消创建区域覆盖层');
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
              overlay.style.top = '25px'; // 从顶部留出一些空间，以免遮挡标记
              overlay.style.height = 'calc(100% - 50px)'; // 确保不会遮挡底部刻度
              overlay.style.backgroundColor = `${color}30`; // 30% 透明度
              overlay.style.pointerEvents = 'auto'; // 允许鼠标事件
              overlay.style.zIndex = '2'; // 确保在价格线之上，但在标记之下
              overlay.style.cursor = 'pointer'; // 鼠标变为手型
              overlay.style.transition = 'background-color 0.2s ease'; // 添加过渡效果
              overlay.style.borderLeft = `2px solid ${color}`; // 添加左边框
              overlay.style.borderRight = `2px solid ${color}`; // 添加右边框
              overlay.title = `${event.title} (${new Date(event.startTime * 1000).toLocaleDateString()} - ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : '至今'})`;
              
              // 添加横线标识事件区域的开始和结束
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
                    持续时间: ${new Date(event.startTime * 1000).toLocaleDateString()} - 
                    ${event.endTime ? new Date(event.endTime * 1000).toLocaleDateString() : '至今'}
                  </div>
                  <div style="font-size: 12px; margin-bottom: 4px;">
                    重要性级别: ${event.level} / 5
                  </div>
                  <div style="font-size: 12px;">${event.description ? event.description : '无描述'}</div>
                  <div style="font-size: 10px; text-align: center; margin-top: 8px; font-style: italic;">点击查看更多详情</div>
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
            console.error('创建事件区域覆盖层时出错:', e);
          }
        }, 300); // 给图表更多时间来计算坐标
      }
    });
    
    return () => {
      // 清除所有事件区域
      cleanupEventOverlays();
    };
  }, [events, currentTheme, onEventClick, chartRef, chartContainerRef, cleanupEventOverlays, eventOverlaysRef]);

  return null; // This is a logic-only component
};

export default EventRegionManager; 
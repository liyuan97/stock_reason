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

  // Handle updating event markers and continuous event areas when chart is zoomed or panned
  useEffect(() => {
    // Create a tracking variable to prevent async operations after component unmount
    let isComponentMounted = true;
    
    if (chartRef.current && seriesRef.current) {
      const handleScaleChange = () => {
        // If component is unmounted or chart is disposed, don't perform any operation
        if (!isComponentMounted || !chartRef.current || !seriesRef.current) {
          return;
        }
        
        console.log('Chart zoomed or panned, re-rendering event markers and areas');
        
        // When chart is zoomed or panned, recalculate and update continuous event areas
        // Clean up existing overlays
        cleanupEventOverlays();
        
        // Ensure markers are still visible
        if (events.length > 0 && seriesRef.current) {
          // Save current series reference to avoid it becoming null in timeout
          const currentSeries = seriesRef.current;
          
          // Use delay to ensure zoom operation is completed
          setTimeout(() => {
            // Check again if component and chart still exist
            if (!isComponentMounted || !chartRef.current) {
              return;
            }
            
            try {
              // Recreate event markers
              const markers = createEventMarkers(events);
              
              // Set markers
              if (currentSeries) {
                currentSeries.setMarkers(markers);
                console.log(`After zoom/pan: Rerendered ${markers.length} event markers`);
              }
            } catch (e) {
              console.error('Error redrawing markers on scale change:', e);
            }
          }, 300); // Increase delay to ensure zoom is completed
        }
      };
      
      // Subscribe to zoom events
      chartRef.current.timeScale().subscribeVisibleTimeRangeChange(handleScaleChange);
      
      // Store chart reference to use in cleanup
      const chart = chartRef.current;
      
      return () => {
        // Set unmount flag
        isComponentMounted = false;
        
        // Unsubscribe
        try {
          if (chart) {
            chart.timeScale().unsubscribeVisibleTimeRangeChange(handleScaleChange);
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
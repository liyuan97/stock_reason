import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

// 自定义Hook用于监听窗口大小变化
const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // 处理窗口大小变化的函数
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};

export default useWindowSize; 
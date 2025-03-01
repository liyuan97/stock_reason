import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  currentTheme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从localStorage读取主题或使用默认亮色主题
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'light';
  });

  // 切换主题
  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  // 当主题改变时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // 设置HTML根元素的data-theme属性，用于全局CSS变量
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Ant Design 主题配置
  const { defaultAlgorithm, darkAlgorithm } = theme;

  // 根据当前主题选择算法
  const themeAlgorithm = currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm;

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: themeAlgorithm,
          token: {
            colorPrimary: '#1e88e5',
            borderRadius: 4,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 自定义hook，用于在组件中访问主题上下文
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
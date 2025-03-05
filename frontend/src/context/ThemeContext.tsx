import React, { createContext, useState, useContext, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  currentTheme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Read theme from localStorage or use default light theme
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'light';
  });

  // Toggle theme
  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  // When theme changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Set data-theme attribute on HTML root element, used for global CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Ant Design theme configuration
  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Select algorithm based on current theme
  const algorithm = currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm;

  return (
    <ConfigProvider
      theme={{ algorithm }}
    >
      <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
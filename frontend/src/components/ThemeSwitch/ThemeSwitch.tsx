import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import './ThemeSwitch.css';

const ThemeSwitch: React.FC = () => {
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <div className="theme-switch">
      <Switch
        checkedChildren={<BulbOutlined />}
        unCheckedChildren={<BulbFilled />}
        checked={currentTheme === 'dark'}
        onChange={toggleTheme}
      />
    </div>
  );
};

export default ThemeSwitch; 
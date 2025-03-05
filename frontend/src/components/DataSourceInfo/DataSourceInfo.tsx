import React, { useState } from 'react';
import { Alert, Typography, Button, Tooltip } from 'antd';
import { InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const { Text, Link } = Typography;

interface DataSourceInfoProps {
  dataSource: 'yahoo' | 'mock' | 'alphavantage';
}

const DataSourceInfo: React.FC<DataSourceInfoProps> = ({ dataSource }) => {
  const { currentTheme } = useTheme();
  const [visible, setVisible] = useState<boolean>(true);
  
  // 如果不可见，不渲染任何内容
  if (!visible) return null;
  
  // 根据数据源确定消息内容
  const getMessage = () => {
    if (dataSource === 'yahoo') {
      return (
        <>
          <Text strong>实时数据来源：</Text> 当前显示的是来自雅虎财经的真实股票数据。
          <br />
          <Text type="secondary">
            注意：事件数据仍为模拟数据，仅用于演示目的。
          </Text>
        </>
      );
    } else if (dataSource === 'alphavantage') {
      return (
        <>
          <Text strong>实时数据来源：</Text> 当前显示的是来自Alpha Vantage的真实股票数据。
          <br />
          <Text type="secondary">
            注意：事件数据仍为模拟数据，仅用于演示目的。
          </Text>
        </>
      );
    } else {
      return (
        <>
          <Text strong>模拟数据提示：</Text> 当前显示的是模拟数据，非真实股票数据。
          <br />
          <Text type="secondary">
            无法连接到实时API，可能是由于网络问题或代理服务器未运行。
          </Text>
        </>
      );
    }
  };
  
  // 确定Alert类型
  const getAlertType = () => {
    return dataSource === 'mock' ? 'warning' : 'info';
  };
  
  return (
    <Alert
      message={getMessage()}
      type={getAlertType()}
      showIcon
      icon={<InfoCircleOutlined />}
      action={
        <Tooltip title="关闭提示">
          <Button 
            size="small" 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={() => setVisible(false)}
          />
        </Tooltip>
      }
      style={{ 
        marginBottom: '16px', 
        boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        background: currentTheme === 'dark' 
          ? (dataSource !== 'mock' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(250, 173, 20, 0.1)') 
          : ''
      }}
    />
  );
};

export default DataSourceInfo; 
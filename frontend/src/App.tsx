import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, Alert, Card, Tag, Button, Divider, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import StockChart from './components/Chart/StockChart';
import EventDetail from './components/EventMarker/EventDetail';
import EventTimeline from './components/Timeline/EventTimeline';
import SearchBar from './components/StockSearch/SearchBar';
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch';
import StarRating from './components/EventFilter/StarRating';
import DataSourceInfo from './components/DataSourceInfo/DataSourceInfo';
import DataSourceSelector from './components/DataSourceInfo/DataSourceSelector';
import { StockEvent, StockData, EventLevel } from './types';
import { getStockData, lastDataSource, DataSource } from './services/api';
import { useTheme } from './context/ThemeContext';
import './styles/App.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const App: React.FC = () => {
  const { currentTheme } = useTheme();
  
  // 状态管理
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState<boolean>(false);
  const [minimumLevel, setMinimumLevel] = useState<number | undefined>(undefined);
  const [dataSource, setDataSource] = useState<DataSource>('yahoo'); // 默认使用Alpha Vantage
  const [preferredDataSource, setPreferredDataSource] = useState<DataSource>('yahoo'); // 用户首选数据源
  
  // 获取股票数据
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[App] 使用首选数据源 ${preferredDataSource} 获取数据`);
        
        // 使用用户选择的首选数据源
        const data = await getStockData(selectedStock, preferredDataSource);
        
        // 检查返回的数据是否完整
        if (data.prices.length > 0) {
          const firstDate = new Date(data.prices[0].time * 1000);
          const lastDate = new Date(data.prices[data.prices.length - 1].time * 1000);
          console.log(`[App] 获取到${data.prices.length}个数据点，从${firstDate.toLocaleDateString()}到${lastDate.toLocaleDateString()}`);
        }
        
        setStockData(data);
        setDataSource(lastDataSource); // 更新实际使用的数据源
      } catch (err) {
        setError('获取股票数据失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [selectedStock, preferredDataSource]);
  
  // 处理事件点击
  const handleEventClick = (event: StockEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };
  
  // 关闭事件详情
  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
  };
  
  // 处理星级过滤变化
  const handleStarFilterChange = (stars: number | undefined) => {
    setMinimumLevel(stars);
  };
  
  // 处理数据源变化
  const handleDataSourceChange = (source: DataSource) => {
    setPreferredDataSource(source);
  };
  
  // 根据星级过滤事件
  const getFilteredEvents = () => {
    if (!stockData) return [];
    if (minimumLevel === undefined) return stockData.events;
    
    // 直接使用星级作为最低事件级别
    // 星级1 = 显示所有级别为1及以上的事件
    // 星级4 = 只显示级别为4和5的事件
    return stockData.events.filter(event => {
      return event.level >= minimumLevel;  // 直接过滤
    });
  };
  
  // 获取过滤后的数据
  const filteredEvents = stockData ? getFilteredEvents() : [];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: currentTheme === 'dark' ? '#001529' : '#1e88e5',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>股票事件追踪系统</Title>
        <ThemeSwitch />
      </Header>
      
      <Layout>
        <Content style={{ padding: '24px', margin: '16px' }}>
          <Card 
            style={{ 
              marginBottom: '24px',
              background: currentTheme === 'dark' ? '#1e1e1e' : '#fff',
              boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <SearchBar onSelect={(symbol: string) => setSelectedStock(symbol)} />
              </Col>
              <Col>
                <Space size="large">
                  <DataSourceSelector 
                    currentSource={preferredDataSource} 
                    onSourceChange={handleDataSourceChange} 
                  />
                  <StarRating value={minimumLevel} onChange={handleStarFilterChange} />
                </Space>
              </Col>
            </Row>
          </Card>
          
          {/* 显示数据来源信息 */}
          <DataSourceInfo dataSource={dataSource} />
          
          {loading ? (
            <div className="loading-indicator">
              <Spin>
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <div>加载中...</div>
                </div>
              </Spin>
            </div>
          ) : error ? (
            <Alert
              message="错误"
              description={error}
              type="error"
              showIcon
            />
          ) : stockData ? (
            <>
              <Card 
                style={{ 
                  marginBottom: '24px',
                  background: currentTheme === 'dark' ? '#1e1e1e' : '#fff',
                  boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Row align="middle">
                  <Col>
                    <Title level={4} style={{ margin: 0 }}>{stockData.name} ({stockData.symbol})</Title>
                    {stockData.prices.length > 0 && (
                      <Text>
                        最新价格：{stockData.prices[stockData.prices.length - 1].close}
                      </Text>
                    )}
                  </Col>
                </Row>
              </Card>
              
              <Card 
                title="股票走势图" 
                style={{ 
                  marginBottom: '24px',
                  background: currentTheme === 'dark' ? '#1e1e1e' : '#fff',
                  boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <StockChart
                  prices={stockData.prices}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              </Card>
              
              <Card 
                title="事件时间线" 
                style={{ 
                  background: currentTheme === 'dark' ? '#1e1e1e' : '#fff',
                  boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <EventTimeline
                  events={filteredEvents}
                  onEventSelect={handleEventClick}
                  selectedEvent={selectedEvent}
                />
              </Card>
            </>
          ) : null}
        </Content>
      </Layout>
      
      {showEventDetail && selectedEvent && (
        <>
          <div className="event-overlay" onClick={handleCloseEventDetail}></div>
          <EventDetail event={selectedEvent} onClose={handleCloseEventDetail} />
        </>
      )}
    </Layout>
  );
};

export default App;

 
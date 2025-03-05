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
  
  // State management
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState<boolean>(false);
  const [minimumLevel, setMinimumLevel] = useState<number | undefined>(undefined);
  const [dataSource, setDataSource] = useState<DataSource>('yahoo'); // Default using Alpha Vantage
  const [preferredDataSource, setPreferredDataSource] = useState<DataSource>('yahoo'); // User preferred data source
  
  // Get stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[App] Using preferred data source ${preferredDataSource} to fetch data`);
        
        // Use the user's preferred data source
        const data = await getStockData(selectedStock, preferredDataSource);
        
        // Check if the returned data is complete
        if (data.prices.length > 0) {
          const firstDate = new Date(data.prices[0].time * 1000);
          const lastDate = new Date(data.prices[data.prices.length - 1].time * 1000);
          console.log(`[App] Retrieved ${data.prices.length} data points, from ${firstDate.toLocaleDateString()} to ${lastDate.toLocaleDateString()}`);
        }
        
        setStockData(data);
        setDataSource(lastDataSource); // Update the actually used data source
      } catch (err) {
        setError('Failed to retrieve stock data, please try again later');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [selectedStock, preferredDataSource]);
  
  // Handle event click
  const handleEventClick = (event: StockEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };
  
  // Close event detail
  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
  };
  
  // Handle star filter change
  const handleStarFilterChange = (stars: number | undefined) => {
    setMinimumLevel(stars);
  };
  
  // Handle data source change
  const handleDataSourceChange = (source: DataSource) => {
    setPreferredDataSource(source);
  };
  
  // Filter events by star rating
  const getFilteredEvents = () => {
    if (!stockData) return [];
    if (minimumLevel === undefined) return stockData.events;
    
    // Directly use star rating as minimum event level
    // Star rating 1 = Show all events level 1 and above
    // Star rating 4 = Only show level 4 and 5 events
    return stockData.events.filter(event => {
      return event.level >= minimumLevel;  // Direct filtering
    });
  };
  
  // Get filtered data
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
        <Title level={3} style={{ color: '#fff', margin: 0 }}>Stock Event Tracker</Title>
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
          
          {/* Display data source information */}
          <DataSourceInfo dataSource={dataSource} />
          
          {loading ? (
            <div className="loading-indicator">
              <Spin>
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <div>Loading...</div>
                </div>
              </Spin>
            </div>
          ) : error ? (
            <Alert
              message="Error"
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
                        Latest price: {stockData.prices[stockData.prices.length - 1].close}
                      </Text>
                    )}
                  </Col>
                </Row>
              </Card>
              
              <Card 
                title="Stock Price Chart" 
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
                title="Event Timeline" 
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

 
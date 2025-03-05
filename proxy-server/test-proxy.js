// Simple script to test the proxy server
const axios = require('axios');

const PROXY_SERVER_URL = 'http://localhost:3001';

// Test getting stock data
async function testGetStockData(symbol) {
  try {
    console.log(`Testing stock data retrieval: ${symbol}`);
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/chart/${symbol}`);
    
    if (response.data && response.data.chart && response.data.chart.result) {
      console.log(`Successfully retrieved ${symbol} data!`);
      console.log(`Number of data points: ${response.data.chart.result[0].timestamp.length}`);
      return true;
    } else {
      console.error('Invalid response format');
      return false;
    }
  } catch (error) {
    console.error(`Failed to get stock data: ${error.message}`);
    return false;
  }
}

// Test search functionality
async function testSearch(query) {
  try {
    console.log(`Testing search: ${query}`);
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/search`, {
      params: { q: query }
    });
    
    if (response.data && response.data.quotes) {
      console.log(`Successfully searched "${query}"!`);
      console.log(`Number of results: ${response.data.quotes.length}`);
      console.log('Search results:', response.data.quotes.map(q => q.symbol).join(', '));
      return true;
    } else {
      console.error('Invalid response format');
      return false;
    }
  } catch (error) {
    console.error(`Search failed: ${error.message}`);
    return false;
  }
}

// Test health check
async function testHealth() {
  try {
    console.log('Testing health check endpoint');
    const response = await axios.get(`${PROXY_SERVER_URL}/health`);
    
    if (response.data && response.data.status === 'ok') {
      console.log('Health check successful!');
      console.log(`Server time: ${response.data.timestamp}`);
      return true;
    } else {
      console.error('Invalid health check response format');
      return false;
    }
  } catch (error) {
    console.error(`Health check failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting proxy server tests...\n');
  
  // Test health check
  const healthResult = await testHealth();
  console.log(healthResult ? '✅ Health check test passed' : '❌ Health check test failed');
  console.log('------------------------\n');
  
  // Test stock data retrieval
  const stockSymbols = ['AAPL', 'MSFT', 'GOOG'];
  for (const symbol of stockSymbols) {
    const stockResult = await testGetStockData(symbol);
    console.log(stockResult ? `✅ ${symbol} data retrieval test passed` : `❌ ${symbol} data retrieval test failed`);
    console.log('------------------------\n');
  }
  
  // Test search functionality
  const searchQueries = ['apple', 'tsla', 'amazon'];
  for (const query of searchQueries) {
    const searchResult = await testSearch(query);
    console.log(searchResult ? `✅ "${query}" search test passed` : `❌ "${query}" search test failed`);
    console.log('------------------------\n');
  }
  
  console.log('Tests completed!');
}

// Execute tests
runAllTests(); 
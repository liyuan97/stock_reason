// 测试代理服务器的简单脚本
const axios = require('axios');

const PROXY_SERVER_URL = 'http://localhost:3001';

// 测试获取股票数据
async function testGetStockData(symbol) {
  try {
    console.log(`测试获取股票数据: ${symbol}`);
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/chart/${symbol}`);
    
    if (response.data && response.data.chart && response.data.chart.result) {
      console.log(`成功获取 ${symbol} 数据!`);
      console.log(`数据点数量: ${response.data.chart.result[0].timestamp.length}`);
      return true;
    } else {
      console.error('响应格式不正确');
      return false;
    }
  } catch (error) {
    console.error(`获取股票数据失败: ${error.message}`);
    return false;
  }
}

// 测试搜索功能
async function testSearch(query) {
  try {
    console.log(`测试搜索: ${query}`);
    const response = await axios.get(`${PROXY_SERVER_URL}/api/yahoo/search`, {
      params: { q: query }
    });
    
    if (response.data && response.data.quotes) {
      console.log(`成功搜索 "${query}"!`);
      console.log(`结果数量: ${response.data.quotes.length}`);
      console.log('搜索结果:', response.data.quotes.map(q => q.symbol).join(', '));
      return true;
    } else {
      console.error('响应格式不正确');
      return false;
    }
  } catch (error) {
    console.error(`搜索失败: ${error.message}`);
    return false;
  }
}

// 测试健康检查
async function testHealth() {
  try {
    console.log('测试健康检查端点');
    const response = await axios.get(`${PROXY_SERVER_URL}/health`);
    
    if (response.data && response.data.status === 'ok') {
      console.log('健康检查成功!');
      console.log(`服务器时间: ${response.data.timestamp}`);
      return true;
    } else {
      console.error('健康检查响应格式不正确');
      return false;
    }
  } catch (error) {
    console.error(`健康检查失败: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试代理服务器...\n');
  
  // 测试健康检查
  const healthResult = await testHealth();
  console.log(healthResult ? '✅ 健康检查测试通过' : '❌ 健康检查测试失败');
  console.log('------------------------\n');
  
  // 测试获取股票数据
  const stockSymbols = ['AAPL', 'MSFT', 'GOOG'];
  for (const symbol of stockSymbols) {
    const stockResult = await testGetStockData(symbol);
    console.log(stockResult ? `✅ ${symbol} 数据获取测试通过` : `❌ ${symbol} 数据获取测试失败`);
    console.log('------------------------\n');
  }
  
  // 测试搜索功能
  const searchQueries = ['apple', 'tsla', 'amazon'];
  for (const query of searchQueries) {
    const searchResult = await testSearch(query);
    console.log(searchResult ? `✅ "${query}" 搜索测试通过` : `❌ "${query}" 搜索测试失败`);
    console.log('------------------------\n');
  }
  
  console.log('测试完成!');
}

// 执行测试
runAllTests(); 
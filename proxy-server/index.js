const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

// 创建缓存实例，默认缓存时间为10分钟
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS，允许前端应用访问
app.use(cors());

// 添加基本的日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * 将时间戳规范化到最近的时间间隔（例如小时或天）
 * @param {number} timestamp - Unix 时间戳（秒）
 * @param {string} interval - 请求的间隔，例如 '1d', '1h'
 * @return {number} 规范化的时间戳
 */
function normalizeTimestamp(timestamp, interval) {
  if (!timestamp) return timestamp;
  
  // 转换为毫秒
  const date = new Date(timestamp * 1000);
  
  // 根据请求的间隔进行不同的规范化
  if (interval.includes('d')) {
    // 如果是日级别数据，规范化到当天的开始
    date.setHours(0, 0, 0, 0);
  } else if (interval.includes('h')) {
    // 如果是小时级别，规范化到小时的开始
    date.setMinutes(0, 0, 0);
  } else if (interval.includes('m') && !interval.includes('mo')) {
    // 如果是分钟级别（但不是月），规范化到10分钟
    const minutes = Math.floor(date.getMinutes() / 10) * 10;
    date.setMinutes(minutes, 0, 0);
  }
  
  // 转回秒
  return Math.floor(date.getTime() / 1000);
}

// 雅虎财经API代理端点
app.get('/api/yahoo/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { 
      period1, 
      period2, 
      interval = '1d', 
      includePrePost = 'false', 
      events = 'div,split' 
    } = req.query;

    // 规范化时间戳以提高缓存命中率
    const normalizedPeriod1 = normalizeTimestamp(period1, interval);
    const normalizedPeriod2 = normalizeTimestamp(period2, interval);
    
    // 构建缓存键
    const cacheKey = `chart_${symbol}_${interval}_${normalizedPeriod1 || ''}_${normalizedPeriod2 || ''}_${includePrePost}_${events}`;
    
    // 检查缓存中是否有数据
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Yahoo Finance] 从缓存返回 ${symbol} 的数据 (键: ${cacheKey})`);
      return res.json(cachedData);
    }

    console.log(`[Yahoo Finance] 获取股票数据: ${symbol} (键: ${cacheKey})`);
    
    // 构建请求参数
    const params = {
      interval,
      includePrePost,
      events
    };
    
    // 添加时间范围参数（如果提供）
    if (period1) params.period1 = period1;
    if (period2) params.period2 = period2;
    
    // 如果没有提供时间范围，默认获取过去3年的数据
    if (!period1 && !period2) {
      params.period1 = Math.floor((Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) / 1000); // 3年前（秒）
      params.period2 = Math.floor(Date.now() / 1000); // 现在（秒）
    }
    
    // 发送请求到雅虎财经API
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com'
      },
      timeout: 10000 // 10秒超时
    });
    
    // 将数据存入缓存
    // 根据不同间隔设置不同的缓存时间
    let ttl = 3600; // 默认1小时
    if (interval === '1d') {
      ttl = 3600 * 6; // 日线图缓存6小时
    } else if (interval.includes('h')) {
      ttl = 3600 * 2; // 小时图缓存2小时
    } else if (interval.includes('m')) {
      ttl = 3600; // 分钟图缓存1小时
    }
    
    cache.set(cacheKey, response.data, ttl);
    
    // 返回数据给前端
    res.json(response.data);
    console.log(`[Yahoo Finance] 成功获取 ${symbol} 的数据并缓存`);
  } catch (error) {
    console.error(`[Yahoo Finance] 错误: ${error.message}`);
    
    // 提供详细的错误信息
    if (error.response) {
      // 服务器返回了错误状态码
      console.error(`状态码: ${error.response.status}`);
      console.error(`响应数据: ${JSON.stringify(error.response.data)}`);
      res.status(error.response.status).json({
        error: '雅虎财经API返回错误',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('没有收到响应');
      res.status(504).json({
        error: '请求超时或无响应',
        message: error.message
      });
    } else {
      // 请求设置时出错
      res.status(500).json({
        error: '请求设置错误',
        message: error.message
      });
    }
  }
});

// 雅虎财经搜索API代理端点
app.get('/api/yahoo/search', async (req, res) => {
  try {
    const { q, quotesCount = 10, lang = 'zh-CN' } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: '缺少搜索查询参数' });
    }
    
    // 构建缓存键
    const cacheKey = `search_${q}_${quotesCount}_${lang}`;
    
    // 检查缓存中是否有数据
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Yahoo Finance] 从缓存返回搜索结果: ${q}`);
      return res.json(cachedData);
    }
    
    console.log(`[Yahoo Finance] 搜索股票: ${q}`);
    
    // 对查询参数进行URL编码，确保中文等特殊字符能正确传输
    const encodedQuery = encodeURIComponent(q);
    
    const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
      params: {
        q: encodedQuery,
        quotesCount,
        lang
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com'
      },
      timeout: 5000 // 5秒超时
    });
    
    // 将搜索结果存入缓存 (搜索结果缓存时间较短，设为10分钟)
    const ttl = 600; // 10分钟，秒为单位
    cache.set(cacheKey, response.data, ttl);
    
    res.json(response.data);
    console.log(`[Yahoo Finance] 成功搜索: ${q} 并缓存结果`);
  } catch (error) {
    console.error(`[Yahoo Finance] 搜索错误: ${error.message}`);
    res.status(500).json({
      error: '搜索请求失败',
      message: error.message
    });
  }
});

// 添加缓存统计端点（用于调试和监控）
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  
  // 获取所有缓存键以便调试
  const keys = cache.keys();
  
  res.json({
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize,
    cacheKeys: keys
  });
});

// 添加清除缓存端点（开发环境使用）
app.delete('/api/cache/clear', (req, res) => {
  const keysDeleted = cache.flushAll();
  res.json({ success: true, message: '缓存已清除' });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`使用示例: http://localhost:${PORT}/api/yahoo/chart/AAPL`);
  console.log(`搜索示例: http://localhost:${PORT}/api/yahoo/search?q=apple`);
}); 
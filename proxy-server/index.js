const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

// Create cache instance, default cache time is 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS, allow access from frontend applications
app.use(cors());

// Add basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * Normalize timestamp to the nearest time interval (e.g., hour or day)
 * @param {number} timestamp - Unix timestamp (seconds)
 * @param {string} interval - Requested interval, e.g., '1d', '1h'
 * @return {number} Normalized timestamp
 */
function normalizeTimestamp(timestamp, interval) {
  if (!timestamp) return timestamp;
  
  // Convert to milliseconds
  const date = new Date(timestamp * 1000);
  
  // Normalize differently based on requested interval
  if (interval && interval.endsWith('d')) {
    // For day-level data, normalize to the beginning of the day
    date.setHours(0, 0, 0, 0);
  } else if (interval && interval.endsWith('h')) {
    // For hour-level data, normalize to the beginning of the hour
    date.setMinutes(0, 0, 0);
  }
  
  // Convert back to seconds
  return Math.floor(date.getTime() / 1000);
}

// Yahoo Finance API proxy endpoint
app.get('/api/yahoo/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { 
      interval = '1d',
      range,
      period1,
      period2,
      includePrePost = 'false',
      events = 'div,split'
    } = req.query;
    
    // Normalize timestamps to improve cache hit rate
    const normalizedPeriod1 = period1 ? normalizeTimestamp(period1, interval) : period1;
    const normalizedPeriod2 = period2 ? normalizeTimestamp(period2, interval) : period2;
    
    // Build cache key
    const cacheKey = `yahoo_chart_${symbol}_${interval}_${range || ''}_${normalizedPeriod1 || ''}_${normalizedPeriod2 || ''}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Yahoo Finance] Returning data for ${symbol} from cache (key: ${cacheKey})`);
      return res.json(cachedData);
    }
    
    console.log(`[Yahoo Finance] Fetching stock data: ${symbol} (key: ${cacheKey})`);
    
    // Build request parameters
    const params = {
      interval,
      includePrePost,
      events
    };
    
    // Add time range parameters (if provided)
    if (range) {
      params.range = range;
    } else if (normalizedPeriod1 && normalizedPeriod2) {
      // If no range provided, default to getting data from past 3 years
      params.period1 = normalizedPeriod1;
      params.period2 = normalizedPeriod2;
    } else {
      params.period1 = Math.floor((Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) / 1000); // 3 years ago (seconds)
      params.period2 = Math.floor(Date.now() / 1000); // now (seconds)
    }
    
    // Send request to Yahoo Finance API
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Cache the response
    cache.set(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('[Yahoo Finance] Error fetching stock data:', error.message);
    
    res.status(500).json({
      error: 'Failed to fetch stock data',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Yahoo Finance search API proxy endpoint
app.get('/api/yahoo/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Missing search query parameter' });
    }
    
    // Build cache key
    const cacheKey = `yahoo_search_${q}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Yahoo Finance] Returning search results from cache: ${q}`);
      return res.json(cachedData);
    }
    
    console.log(`[Yahoo Finance] Searching stocks: ${q}`);
    
    // URL encode the query parameters to ensure proper transmission of special characters including Chinese
    const encodedQ = encodeURIComponent(q);
    
    const response = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search`, {
      params: {
        q: encodedQ,
        quotesCount: 20,
        newsCount: 0,
        enableFuzzyQuery: false,
        quotesQueryId: 'tss_match_phrase_query',
        multiQuoteQueryId: 'multi_quote_single_token_query'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 5 seconds timeout
    });
    
    // Cache search results (shorter TTL for search results, set to 10 minutes)
    const ttl = 600; // 10 minutes, in seconds
    cache.set(cacheKey, response.data, ttl);
    
    res.json(response.data);
  } catch (error) {
    console.error('[Yahoo Finance] Error searching stocks:', error.message);
    res.status(500).json({
      error: 'Failed to search stocks',
      message: error.message
    });
  }
});

// Add cache statistics endpoint (for debugging and monitoring)
app.get('/api/cache/stats', (req, res) => {
  res.json(cache.getStats());
});

// Get all cache keys for debugging
app.get('/api/cache/keys', (req, res) => {
  const keys = cache.keys();
  const keysWithTTL = keys.map(key => {
    const ttl = cache.getTtl(key);
    return {
      key,
      ttl,
      expiresAt: ttl ? new Date(ttl).toISOString() : 'Never'
    };
  });
  res.json(keysWithTTL);
});

// Add clear cache endpoint (for development use)
app.delete('/api/cache', (req, res) => {
  cache.flushAll();
  res.json({ success: true, message: 'Cache cleared' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Example usage: http://localhost:${PORT}/api/yahoo/chart/AAPL`);
  console.log(`Search example: http://localhost:${PORT}/api/yahoo/search?q=apple`);
}); 
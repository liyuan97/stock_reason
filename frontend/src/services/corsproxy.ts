/**
 * CORS代理配置
 * 用于解决前端直接请求Yahoo Finance API时的跨域问题
 */

// 可用的CORS代理列表
export const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',    // AllOrigins
  'https://corsproxy.io/?',                 // corsproxy.io
  'https://cors-anywhere.herokuapp.com/',   // Heroku CORS Anywhere (需要先访问网站点击激活)
  'https://api.codetabs.com/v1/proxy?quest=', // CodeTabs
  'https://crossorigin.me/'                 // CrossOrigin
];

/**
 * 使用随机代理或指定代理构建API URL
 * @param originalUrl 原始API URL
 * @param proxyIndex 指定使用的代理索引，不指定则随机选择
 * @returns 带有CORS代理的URL
 */
export const getProxiedUrl = (originalUrl: string, proxyIndex?: number): string => {
  // 如果不可用，则随机选择一个代理
  const index = proxyIndex !== undefined ? proxyIndex : Math.floor(Math.random() * CORS_PROXIES.length);
  const proxy = CORS_PROXIES[index];
  
  return `${proxy}${encodeURIComponent(originalUrl)}`;
};

/**
 * 轮询所有可用的CORS代理，直到找到一个能工作的代理
 * @param apiCall 要执行的API调用函数
 * @returns API调用结果
 */
export const tryAllProxies = async <T>(apiCall: (url: string) => Promise<T>): Promise<T> => {
  // 首先尝试直接调用
  console.log('%c尝试直接请求API（无代理）...', 'background:#2196F3;color:white;padding:2px 5px;border-radius:3px;');
  try {
    return await apiCall('direct');
  } catch (error: any) {
    console.log('%c直接API调用失败，开始尝试CORS代理...', 'background:#FFC107;color:black;padding:2px 5px;border-radius:3px;');
    console.error('错误详情:', error.message);
    
    // 如果失败，尝试所有代理
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      console.log(`%c尝试代理 ${i+1}/${CORS_PROXIES.length}: ${CORS_PROXIES[i]}`, 'background:#4CAF50;color:white;padding:2px 5px;border-radius:3px;');
      try {
        return await apiCall(`proxy:${i}`);
      } catch (proxyError: any) {
        console.log(`%c代理 ${i+1}/${CORS_PROXIES.length} 失败`, 'background:#F44336;color:white;padding:2px 5px;border-radius:3px;');
        console.error('错误详情:', proxyError.message);
        
        // 如果是最后一个代理且仍然失败，抛出异常
        if (i === CORS_PROXIES.length - 1) {
          console.log('%c所有可用的代理方法都已尝试，全部失败', 'background:#000;color:white;padding:2px 5px;border-radius:3px;');
          throw new Error('所有代理尝试都失败');
        }
      }
    }
    
    // 这里实际上永远不会执行到，但TypeScript需要返回值
    throw new Error('无法获取数据');
  }
}; 
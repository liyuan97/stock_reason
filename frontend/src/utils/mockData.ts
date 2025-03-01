import { StockData, StockPrice, StockEvent } from '../types';

// 生成模拟的股票数据，包括历史价格和相关事件
export const getMockStockData = (symbol: string): StockData => {
  // 确保生成完整的最近3年(约780个交易日)的模拟价格数据，从今天往前推
  const now = new Date();
  const prices: StockPrice[] = [];
  let basePrice = 100; // 基准价格
  
  if (symbol === 'AAPL') {
    basePrice = 150;
  } else if (symbol === 'MSFT') {
    basePrice = 300;
  } else if (symbol === 'GOOG') {
    basePrice = 120;
  } else if (symbol === 'AMZN') {
    basePrice = 100;
  } else if (symbol === 'BABA') {
    basePrice = 80;
  }

  // 计算3年前的基准价格 (假设年平均增长15%)
  const basePrice3YearsAgo = basePrice / Math.pow(1.15, 3);
  
  // 每天的基准价格增长率 (复合)
  const dailyGrowthRate = Math.pow(basePrice / basePrice3YearsAgo, 1/780) - 1;
  
  // 记录第一个和最后一个数据点，用于调试
  let firstDate: Date | null = null;
  let lastDate: Date | null = null;
  
  // 生成模拟价格数据 - 确保3年数据（大约780个交易日）
  for (let i = 1095; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    // 跳过周末
    const day = date.getDay();
    if (day === 0 || day === 6) continue; // 0是周日，6是周六
    
    // 设置时间为当天交易时间
    date.setHours(16, 0, 0, 0);
    
    // 记录第一个和最后一个日期
    if (firstDate === null) {
      firstDate = new Date(date);
    }
    lastDate = new Date(date);
    
    // 使用随机数模拟价格波动，但保持整体趋势
    const trendValue = basePrice3YearsAgo * Math.pow(1 + dailyGrowthRate, 1095 - i);
    const volatility = 0.02; // 2%的日波动
    const dailyChange = ((Math.random() * 2 * volatility) - volatility); 
    const dailyPrice = trendValue * (1 + dailyChange);
    
    // 随机生成当天的开高低收价格
    const open = dailyPrice * (1 + (Math.random() * 0.01 - 0.005));
    const close = dailyPrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    prices.push({
      time: Math.floor(date.getTime() / 1000), // 转换为秒级时间戳
      open,
      high,
      low,
      close,
      volume
    });
  }

  // 记录生成的数据统计信息
  if (firstDate && lastDate) {
    console.log(`生成了${prices.length}个模拟价格数据点，从${firstDate.toLocaleDateString()}到${lastDate.toLocaleDateString()}`);
    
    // 添加更详细的日志，帮助调试
    const pricesPerYear = prices.length / 3;
    console.log(`每年平均数据点: ${pricesPerYear.toFixed(1)} (期望值: ~250个交易日)`)
    
    // 检查数据点是否有缺口
    let timeGaps = 0;
    let largeGaps = 0;
    for (let i = 1; i < prices.length; i++) {
      const gap = prices[i].time - prices[i-1].time;
      const dayGap = gap / (24 * 60 * 60); // 转换为天数
      if (dayGap > 3) { // 超过3天的缺口
        timeGaps++;
        if (dayGap > 7) { // 超过一周的大缺口
          largeGaps++;
        }
      }
    }
    console.log(`数据缺口统计: ${timeGaps}个超过3天的缺口, ${largeGaps}个超过一周的大缺口`);
  }

  // 生成3年周期内的模拟事件数据
  const events: StockEvent[] = [];
  
  // 添加特定公司的重要事件
  if (symbol === 'AAPL') {
    events.push({
      id: '1',
      title: '苹果发布iPhone 13系列',
      description: '苹果公司发布全新iPhone 13系列，包括iPhone 13 mini、iPhone 13、iPhone 13 Pro和iPhone 13 Pro Max。',
      time: Math.floor(new Date(now.getFullYear() - 1, 8, 14).getTime() / 1000), // 约一年前的9月
      level: 5,
      source: '苹果官网',
      url: 'https://www.apple.com'
    });
    
    events.push({
      id: '2',
      title: '苹果推出自研M1芯片',
      description: '苹果公司推出首款自研ARM架构M1芯片，用于Mac电脑，标志着苹果开始摆脱对英特尔的依赖。',
      time: Math.floor(new Date(now.getFullYear() - 2, 10, 10).getTime() / 1000), // 约两年前的11月
      level: 5,
      source: '苹果官网',
      url: 'https://www.apple.com'
    });
    
    events.push({
      id: '3',
      title: '苹果市值突破3万亿美元',
      description: '苹果公司市值突破3万亿美元，成为全球首家达到这一里程碑的公司。',
      time: Math.floor(new Date(now.getFullYear() - 1, 0, 3).getTime() / 1000), // 约一年半前的1月
      level: 4,
      source: '财经新闻',
      url: 'https://finance.yahoo.com'
    });
    
    events.push({
      id: '4',
      title: '苹果发布AirTag',
      description: '苹果公司发布物品追踪器AirTag，帮助用户追踪钥匙、钱包等物品。',
      time: Math.floor(new Date(now.getFullYear() - 2, 3, 20).getTime() / 1000), // 约两年前的4月
      level: 3,
      source: '苹果官网',
      url: 'https://www.apple.com'
    });
    
    events.push({
      id: '5',
      title: '苹果增加股票回购计划',
      description: '苹果公司宣布增加900亿美元的股票回购计划，同时将季度股息提高7%。',
      time: Math.floor(new Date(now.getFullYear() - 2, 3, 28).getTime() / 1000), // 约两年前的4月
      level: 3,
      source: '财经新闻',
      url: 'https://finance.yahoo.com'
    });
  } else if (symbol === 'MSFT') {
    events.push({
      id: '1',
      title: '微软完成收购动视暴雪',
      description: '微软以近700亿美元完成对游戏巨头动视暴雪的收购，成为科技史上最大并购案之一。',
      time: Math.floor(new Date(now.getFullYear() - 1, 0, 18).getTime() / 1000), // 约一年半前
      level: 5,
      source: '微软官网',
      url: 'https://www.microsoft.com'
    });
    
    events.push({
      id: '2',
      title: 'Azure云服务营收增长',
      description: '微软Azure云服务营收同比增长40%，超过市场预期，推动公司股价上涨。',
      time: Math.floor(new Date(now.getFullYear() - 1, 9, 25).getTime() / 1000), // 约一年前
      level: 3,
      source: '财报发布会',
      url: 'https://investor.microsoft.com'
    });
    
    events.push({
      id: '3',
      title: '微软发布Windows 11',
      description: '微软发布新一代操作系统Windows 11，带来全新设计和功能改进。',
      time: Math.floor(new Date(now.getFullYear() - 2, 5, 24).getTime() / 1000), // 约两年前的6月
      level: 4,
      source: '微软官网',
      url: 'https://www.microsoft.com'
    });
    
    events.push({
      id: '4',
      title: '微软与OpenAI合作',
      description: '微软宣布向OpenAI投资数十亿美元，深化在AI领域的战略合作。',
      time: Math.floor(new Date(now.getFullYear() - 2, 6, 22).getTime() / 1000), // 约两年前的7月
      level: 4,
      source: '微软官网',
      url: 'https://www.microsoft.com'
    });
  } else if (symbol === 'GOOG') {
    events.push({
      id: '1',
      title: '谷歌推出Gemini AI模型',
      description: '谷歌发布新一代大型语言模型Gemini，与OpenAI的GPT-4竞争，提升AI技术水平。',
      time: Math.floor(new Date(now.getFullYear() - 3, 7, 7).getTime() / 1000),
      level: 4,
      source: '谷歌官网',
      url: 'https://www.google.com'
    });
    
    events.push({
      id: '2',
      title: '反垄断调查',
      description: '美国司法部对谷歌展开新一轮反垄断调查，重点关注其在线广告业务。',
      time: Math.floor(new Date(now.getFullYear() - 1, 25, 25).getTime() / 1000),
      level: 3,
      source: '华尔街日报',
      url: 'https://www.wsj.com'
    });
  } else if (symbol === 'AMZN') {
    events.push({
      id: '1',
      title: '亚马逊宣布大规模裁员',
      description: '亚马逊宣布裁员超过18000人，主要影响零售部门和人力资源部门。',
      time: Math.floor(new Date(now.getFullYear() - 6, 12, 12).getTime() / 1000),
      level: 4,
      source: '亚马逊官网',
      url: 'https://www.amazon.com'
    });
    
    events.push({
      id: '2',
      title: 'AWS云服务新区域',
      description: '亚马逊AWS在亚太地区新增两个区域，扩大全球云服务覆盖范围。',
      time: Math.floor(new Date(now.getFullYear() - 2, 5, 5).getTime() / 1000),
      level: 2,
      source: '亚马逊AWS博客',
      url: 'https://aws.amazon.com/blogs/'
    });
  } else if (symbol === 'BABA') {
    events.push({
      id: '1',
      title: '阿里巴巴宣布拆分计划',
      description: '阿里巴巴集团宣布拆分为六大业务集团，包括淘宝天猫商业集团、云智能集团等。',
      time: Math.floor(new Date(now.getFullYear() - 4, 28, 28).getTime() / 1000),
      level: 5,
      source: '阿里巴巴官网',
      url: 'https://www.alibabagroup.com'
    });
    
    events.push({
      id: '2',
      title: '马云回归公开亮相',
      description: '阿里巴巴创始人马云时隔多月后首次公开亮相，参观多所欧洲农业研究机构。',
      time: Math.floor(new Date(now.getFullYear() - 1, 22, 22).getTime() / 1000),
      level: 3,
      source: '新浪财经',
      url: 'https://finance.sina.com.cn'
    });
  } else {
    // 默认添加一些通用事件
    events.push({
      id: '1',
      title: `${symbol}公司季度财报`,
      description: `${symbol}公布最新季度财报，营收和利润均符合市场预期。`,
      time: Math.floor(new Date(now.getFullYear() - 2, 15, 15).getTime() / 1000),
      level: 3,
      source: '公司公告',
      url: `https://www.${symbol.toLowerCase()}.com`
    });
  }
  
  // 添加更多随机事件，覆盖3年时间范围
  const eventTitles = [
    '高管人事变动',
    '新产品发布',
    '专利诉讼',
    '战略合作伙伴关系',
    '分析师评级调整',
    '股东大会',
    '国际市场扩张',
    '监管审查',
    '季度财报',
    '股息发放',
    '股票分割',
    '收购小型公司',
    '新业务线启动',
    '研发突破',
    '成本削减计划',
    '可持续发展计划'
  ];
  
  const eventDescriptions = [
    '公司任命新的首席技术官，负责技术创新和产品开发。',
    '公司推出全新产品线，针对新兴市场需求。',
    '公司卷入专利侵权诉讼，可能面临赔偿。',
    '公司与行业领导者建立战略合作伙伴关系，共同开发新技术。',
    '多家分析机构上调公司股票评级，看好未来增长前景。',
    '年度股东大会召开，讨论公司战略方向和股息政策。',
    '公司宣布进入新的国际市场，扩大全球业务范围。',
    '监管机构对公司展开例行调查，关注合规情况。',
    '公司发布季度财报，收入和利润超过市场预期。',
    '公司宣布发放特别股息，回报长期股东。',
    '公司宣布股票分割计划，旨在提高股票流动性。',
    '公司完成对初创企业的收购，增强特定领域的技术能力。',
    '公司启动新业务线，拓展收入来源。',
    '公司研发团队取得技术突破，获得关键专利。',
    '公司实施成本削减计划，以提高运营效率。',
    '公司发布新的可持续发展报告，设定减排目标。'
  ];
  
  // 生成过去3年的随机事件
  for (let i = 0; i < 15; i++) {
    const randomYear = Math.floor(Math.random() * 3);  // 0-2年前
    const randomMonth = Math.floor(Math.random() * 12); // 0-11月
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28日
    
    const eventDate = new Date(now.getFullYear() - randomYear, randomMonth, randomDay);
    // 避免周末
    if (eventDate.getDay() === 0) eventDate.setDate(eventDate.getDate() + 1); // 周日改为周一
    if (eventDate.getDay() === 6) eventDate.setDate(eventDate.getDate() - 1); // 周六改为周五
    
    const randomTitleIndex = Math.floor(Math.random() * eventTitles.length);
    const randomDescIndex = Math.floor(Math.random() * eventDescriptions.length);
    const randomLevel = (Math.floor(Math.random() * 5) + 1) as StockEvent['level']; // 1-5级事件
    
    events.push({
      id: `random-${i}`,
      title: eventTitles[randomTitleIndex],
      description: eventDescriptions[randomDescIndex],
      time: Math.floor(eventDate.getTime() / 1000),
      level: randomLevel,
      source: '市场消息',
    });
  }

  // 在返回前检查是否有足够的数据
  if (prices.length < 700) {
    console.warn(`警告：生成的数据点数量(${prices.length})不足以覆盖3年的交易日，可能会影响图表展示效果`);
    
    // 确保至少有750个数据点 - 如果不够，增加更密集的数据点
    if (prices.length > 0 && prices.length < 750) {
      const originalCount = prices.length;
      const firstTimestamp = prices[0].time;
      const lastTimestamp = prices[prices.length - 1].time;
      const totalTimespan = lastTimestamp - firstTimestamp;
      const avgInterval = totalTimespan / 780; // 理想间隔，确保至少780个点
      
      // 创建更密集的数据点并直接添加到prices数组
      let currentTime = firstTimestamp;
      
      while (currentTime <= lastTimestamp) {
        // 如果这个时间点不在已有数据中，添加它
        if (!prices.some(p => Math.abs(p.time - currentTime) < avgInterval / 2)) {
          // 找到最接近的价格点作为参考
          const nearestPrice = prices.reduce((nearest, current) => {
            return Math.abs(current.time - currentTime) < Math.abs(nearest.time - currentTime) 
              ? current 
              : nearest;
          }, prices[0]);
          
          // 基于最近的价格创建新的价格点
          const newPrice: StockPrice = {
            time: currentTime,
            open: nearestPrice.open * (1 + (Math.random() * 0.01 - 0.005)),
            close: nearestPrice.close * (1 + (Math.random() * 0.01 - 0.005)),
            high: nearestPrice.high * (1 + Math.random() * 0.005),
            low: nearestPrice.low * (1 - Math.random() * 0.005),
            volume: nearestPrice.volume ? Math.floor(nearestPrice.volume * (0.8 + Math.random() * 0.4)) : undefined
          };
          
          // 直接添加到原始数组
          prices.push(newPrice);
        }
        
        // 前进到下一个时间点
        currentTime += avgInterval;
      }
      
      // 确保排序
      prices.sort((a, b) => a.time - b.time);
      
      console.log(`已增强数据密度: 从${originalCount}个点增加到${prices.length}个点`);
    }
  }
  
  // 确保返回价格按时间排序
  prices.sort((a, b) => a.time - b.time);
  events.sort((a, b) => a.time - b.time);
  
  // 返回完整的数据
  return {
    symbol,
    name: getStockName(symbol),
    prices,
    events
  };
};

// 获取股票名称
const getStockName = (symbol: string): string => {
  // 中文名称映射表
  const nameMap: Record<string, string> = {
    'AAPL': '苹果公司',
    'MSFT': '微软公司',
    'GOOG': '谷歌公司',
    'GOOGL': '谷歌公司',
    'AMZN': '亚马逊公司',
    'META': 'Meta平台公司',
    'BABA': '阿里巴巴集团',
    'PDD': '拼多多',
    'BIDU': '百度公司',
    'NTES': '网易公司',
    'JD': '京东集团',
    'TCEHY': '腾讯控股',
    '0700.HK': '腾讯控股',
    '9988.HK': '阿里巴巴集团',
    '9999.HK': '网易公司',
    '1024.HK': '快手科技',
    '3690.HK': '美团点评'
  };
  
  return nameMap[symbol] || symbol;
};
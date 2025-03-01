# 股票事件追踪系统 - 前端

这是股票事件追踪系统的前端部分，基于 React + TypeScript 开发，使用 TradingView Lightweight Charts 实现专业级别的金融图表展示。

## 功能特性

1. **股票K线图显示**
   - 使用TradingView Lightweight Charts展示专业K线图
   - 支持缩放和平移
   - 实时响应窗口大小变化

2. **事件标记与展示**
   - 在图表上以不同颜色显示1-5级事件标记
   - 点击标记查看事件详情
   - 按等级筛选事件显示

3. **股票搜索**
   - 输入股票代码查询不同股票数据
   - 支持模糊搜索

4. **事件时间线**
   - 按日期分组展示所有相关事件
   - 点击事件跳转至对应详情
   - 高亮显示当前选中事件

## 项目结构

```
frontend/
├── public/             # 静态资源
├── src/
│   ├── components/     # React组件
│   │   ├── Chart/      # 图表相关组件
│   │   ├── EventMarker/# 事件标记组件
│   │   ├── Timeline/   # 时间线组件
│   │   └── StockSearch/# 搜索组件
│   ├── services/       # API服务
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript类型定义
│   ├── styles/         # CSS样式
│   ├── App.tsx         # 主应用组件
│   └── index.tsx       # 入口文件
├── package.json        # 依赖配置
└── tsconfig.json       # TypeScript配置
```

## 开发环境设置

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm start
```

3. 构建生产版本
```bash
npm run build
```

## 数据模型

### StockData
包含股票基本信息、价格数据和相关事件

### StockPrice
包含股票的OHLC(开盘、最高、最低、收盘)价格数据

### StockEvent
包含事件标题、描述、时间、重要程度等信息

## API接口

目前使用模拟数据，后续将连接到后端API:

- `getStockData(symbol)`: 获取股票数据
- `filterEvents(symbol, level)`: 按等级筛选事件
- `searchStocks(query)`: 搜索股票

## 使用的技术栈

- React 18
- TypeScript 4
- TradingView Lightweight Charts
- Axios
- React Hooks
- CSS3 

## 项目完成情况

已完成以下功能:

1. 基础项目结构搭建
2. 类型定义设计
3. 模拟数据生成
4. K线图表组件
5. 事件标记和详情组件
6. 事件时间线组件 
7. 股票搜索组件
8. 过滤和分类功能
9. 样式和UI设计

## 下一步计划

1. 连接真实后端API
2. 实现更多交互功能
3. 优化性能和用户体验
4. 添加更多数据展示功能
5. 增加单元测试 
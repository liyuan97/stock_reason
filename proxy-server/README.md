# Yahoo Finance API 代理服务器

这是一个简单的Node.js代理服务器，用于解决前端应用访问Yahoo Finance API时的CORS（跨域资源共享）问题。

## 功能

- 代理Yahoo Finance图表API请求
- 代理Yahoo Finance搜索API请求
- 处理错误并提供详细的错误信息
- 支持自定义请求参数

## 安装

```bash
# 安装依赖
npm install

# 安装开发依赖（可选）
npm install --save-dev nodemon
```

## 使用方法

### 启动服务器

```bash
# 生产模式
npm start

# 开发模式（代码更改时自动重启）
npm run dev
```

服务器默认运行在 http://localhost:3001

### API端点

#### 1. 获取股票图表数据

```
GET /api/yahoo/chart/:symbol
```

参数:
- `symbol`: 股票代码（如AAPL, MSFT, 0700.HK等）
- `period1`: 开始时间（Unix时间戳，秒）
- `period2`: 结束时间（Unix时间戳，秒）
- `interval`: 数据间隔（默认: '1d'，可选: '1d', '1wk', '1mo'等）
- `includePrePost`: 是否包含盘前盘后数据（默认: 'false'）
- `events`: 包含的事件（默认: 'div,split'）

示例:
```
http://localhost:3001/api/yahoo/chart/AAPL
http://localhost:3001/api/yahoo/chart/MSFT?interval=1wk
```

#### 2. 搜索股票

```
GET /api/yahoo/search
```

参数:
- `q`: 搜索查询（必需）
- `quotesCount`: 返回结果数量（默认: 10）
- `lang`: 语言（默认: 'zh-CN'）

示例:
```
http://localhost:3001/api/yahoo/search?q=apple
http://localhost:3001/api/yahoo/search?q=微软&quotesCount=5
```

#### 3. 健康检查

```
GET /health
```

返回服务器状态和当前时间戳。

## 在前端应用中使用

```javascript
// 获取股票数据
fetch('http://localhost:3001/api/yahoo/chart/AAPL')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 搜索股票
fetch('http://localhost:3001/api/yahoo/search?q=apple')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## 注意事项

- 此代理服务器仅用于开发和测试目的
- 在生产环境中使用时，请确保添加适当的安全措施
- Yahoo Finance API可能有使用限制，请遵守其服务条款 
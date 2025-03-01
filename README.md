# 股票事件追踪系统 (Stock Event Tracker)

## 产品思路

市场波动的背后总有原因，但当我们回顾历史行情时，很难记住过去的涨跌背后发生了什么。本系统旨在解决这一问题：将市场事件与股票走势关联起来，帮助投资者更全面地理解市场变动的原因。

核心价值：
- 直观可视化事件与行情的关联性
- 按重要程度（1-5级）分类展示事件
- 帮助投资者形成更完整的市场认知

## 设计思路

本系统采用前后端分离架构：

### 前端设计
- 基于 React + TypeScript  + lightweight-charts
- 使用 TradingView Lightweight Charts 提供专业级别的金融图表
- 在图表上以彩色标记展示不同等级的事件
- 响应式设计，同时支持桌面和移动设备

### 后端设计
- 基于 FastAPI 构建的 RESTful API
- 使用 SQLAlchemy ORM 进行数据库操作
- JWT 认证保护 API 端点
- Redis 缓存优化查询性能
- 定时任务抓取最新行情数据
- 基于 LangChain 的 LLM 服务，用于新闻分析和事件提取

### 数据流设计
```
用户请求 → 前端展示 ← API服务 ← 数据库 ← LLM新闻分析
```

## 系统架构图

```
+------------------+    +-------------------+    +------------------+
|                  |    |                   |    |                  |
|  React 前端      |    |   FastAPI 后端    |    |  PostgreSQL 数据库|
|                  |    |                   |    |                  |
+------------------+    +-------------------+    +------------------+
        ↑                        ↑                        ↑
        |                        |                        |
        ↓                        ↓                        ↓
+------------------+    +-------------------+    +------------------+
|                  |    |                   |    |                  |
| TradingView      |    | LLM 服务          |    |  Redis 缓存      |
| Charts           |    | (新闻分析)         |    |                  |
+------------------+    +-------------------+    +------------------+
```

## 项目结构

```
stock_reason/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chart/
│   │   │   ├── EventMarker/
│   │   │   ├── Timeline/
│   │   │   └── StockSearch/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   ├── dependencies/
│   │   │   └── middleware/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── models/
│   │   │   └── session.py
│   │   ├── services/
│   │   │   ├── stock_service.py
│   │   │   └── event_service.py
│   │   ├── llm/
│   │   │   ├── news_analyzer.py
│   │   │   └── event_extractor.py
│   │   └── main.py
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
└── README.md
```

## 安装与启动

### 前端开发环境

1. 克隆仓库
```bash
git clone https://github.com/yourusername/stock_reason.git
cd stock_reason/frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 在浏览器中访问
```
http://localhost:3000
```

### 后端开发环境

1. 进入后端目录
```bash
cd stock_reason/backend
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 启动后端服务
```bash
uvicorn app.main:app --reload
```

5. 访问API文档
```
http://localhost:8000/docs
```

### 使用Docker部署

```bash
docker-compose up -d
```

## 功能说明

### 当前实现功能

1. **股票K线图显示**
   - 支持缩放和平移
   - 显示OHLC蜡烛图
   - 自适应容器大小

2. **事件标记与展示**
   - 在图表上显示1-5级事件标记
   - 点击标记查看事件详情
   - 按等级筛选事件显示

3. **股票搜索**
   - 输入股票代码查询不同股票数据（如AAPL、MSFT等）

4. **事件时间线**
   - 展示所有相关事件的时间线
   - 点击事件跳转至对应时间点

### 计划功能

1. **后端集成**
   - 实现事件存储和管理API
   - 通过LLM分析新闻并自动提取事件

2. **数据扩展**
   - 支持更多市场和指数
   - 集成更多历史事件数据

3. **用户功能**
   - 用户自定义事件添加
   - 个人收藏和笔记
   - 事件影响分析报告
   - 自定义提醒

4. **社区功能**
   - 用户贡献事件和评分
   - 讨论区和评论系统

## 项目路线图

### 第一阶段 (MVP) - 2023年Q3
- ✅ 基础图表展示功能
- ✅ 静态事件标记和显示
- ✅ 基本的股票搜索

### 第二阶段 - 2023年Q4
- ✅ 事件时间线功能
- ✅ 事件筛选功能
- 🔄 后端API开发

### 第三阶段 - 2024年Q1
- 🔄 LLM新闻分析集成
- 🔄 用户账户系统
- 🔄 自定义事件添加

### 第四阶段 - 2024年Q2
- 📅 社区功能
- 📅 高级数据分析
- 📅 移动应用开发

## 接口文档

完整的API文档可通过启动后端服务后访问：
```
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc  # ReDoc
```

### 核心API端点

1. 股票数据API
   - `GET /api/stocks/{symbol}` - 获取指定股票基本信息
   - `GET /api/stocks/{symbol}/prices` - 获取股票历史价格
   - `GET /api/stocks/{symbol}/events` - 获取股票相关事件

2. 事件API
   - `GET /api/events` - 获取所有事件
   - `POST /api/events` - 创建新事件
   - `GET /api/events/{id}` - 获取特定事件详情
   - `PUT /api/events/{id}` - 更新事件
   - `DELETE /api/events/{id}` - 删除事件

3. 用户API
   - `POST /api/users/register` - 用户注册
   - `POST /api/users/login` - 用户登录
   - `GET /api/users/me` - 获取当前用户信息

## 屏幕截图

*此处将添加应用界面截图，展示主要功能*

1. 主界面
2. 事件标记与详情
3. 时间线展示
4. 搜索功能

## 数据来源

目前版本使用：
- 行情数据：Yahoo Finance非官方API
- 事件数据：模拟生成（后续将接入真实数据）

计划接入：
- 财经新闻源（如新浪财经、东方财富）
- 公司公告数据
- 宏观经济数据

## 测试策略

本项目采用多层次测试策略：

1. 单元测试
   - 前端组件测试：Jest + React Testing Library
   - 后端函数测试：Pytest

2. 集成测试
   - API端点测试
   - 数据流测试

3. 端到端测试
   - 使用Cypress进行关键用户流程测试

运行测试：
```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend
pytest
```

## 技术栈

### 前端
- React 17+
- TypeScript 4+
- TradingView Lightweight Charts
- Axios
- CSS3 (自定义样式)
- Jest

### 后端
- Python 3.9+
- FastAPI
- SQLAlchemy
- LangChain
- Pytest
- Redis
- PostgreSQL

## 部署指南

### 使用Docker部署

1. 确保安装了Docker和Docker Compose
2. 克隆仓库
3. 配置环境变量（可复制`.env.example`为`.env`并填写配置）
4. 执行部署命令
```bash
docker-compose up -d
```

### 手动部署

#### 前端
```bash
cd frontend
npm install
npm run build
# 将build目录部署到您的Web服务器
```

#### 后端
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# 配置环境变量
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 许可证

MIT

## 贡献指南

我们非常欢迎社区贡献！以下是参与项目的方式：

### 贡献流程

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 将您的更改推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

### 贡献类型

我们欢迎以下类型的贡献：
- 代码改进和新功能
- 文档完善
- Bug修复
- 测试用例
- UI/UX设计改进
- 新闻源集成
- 数据分析算法

### 代码规范

- 请遵循项目现有的代码风格
- 添加适当的注释
- 确保通过所有测试
- 新功能请同时添加测试

### Issue提交

如果您发现了问题但没有时间修复，请提交Issue：
- 清晰描述问题
- 提供复现步骤
- 如可能，附上截图或日志
- 标记相关标签

## 联系方式

- 项目负责人：[您的姓名]
- 邮箱：[您的邮箱]
- 微信：[您的微信]
- GitHub: [您的GitHub主页] 
# 股票事件追踪系统后端 (Stock Event Tracker Backend)

## 项目概述

提供股票事件追踪系统的后端 API 服务，支持事件记录、查询和分析，实现股票行情与重要事件的关联展示。

## 技术栈

- Python 3.10+
- FastAPI 框架
- SQLAlchemy ORM
- PostgreSQL 数据库
- Redis 缓存
- JWT 认证
- Alembic 数据库迁移
- LangChain + LLM 新闻分析

## 系统设计

### 后端架构
- 基于 FastAPI 构建的 RESTful API
- 使用 SQLAlchemy ORM 进行数据库操作
- JWT 认证保护 API 端点
- Redis 缓存优化查询性能
- 定时任务抓取最新行情数据
- 基于 LangChain 的 LLM 服务，用于新闻分析和事件提取

### 依赖管理
本项目使用 `uv` 作为 Python 包管理工具，它具有以下优势：
- 比传统的 pip 速度更快
- 提供了确定性的依赖锁定（uv.lock）
- 与 pyproject.toml 完美兼容
- 支持虚拟环境管理

### 数据流设计
```
API请求 → FastAPI处理 → 业务逻辑 → 数据库/缓存 ← LLM新闻分析
```

## 项目结构

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/     # API 路由定义
│   │   ├── dependencies/  # 依赖注入
│   │   └── middleware/    # 中间件
│   ├── core/
│   │   ├── config.py      # 配置管理
│   │   └── security.py    # 安全相关
│   ├── db/
│   │   ├── models/        # 数据模型
│   │   └── session.py     # 数据库会话
│   ├── services/
│   │   ├── stock_service.py  # 股票服务
│   │   └── event_service.py  # 事件服务
│   ├── llm/
│   │   ├── news_analyzer.py  # 新闻分析
│   │   └── event_extractor.py # 事件提取
│   └── main.py            # 应用入口
├── tests/                 # 测试用例
├── alembic/               # 数据库迁移
├── pyproject.toml         # 项目依赖配置
├── uv.lock                # 依赖锁定文件
└── requirements.txt       # 依赖说明（已弃用，仅保留参考）
```

## 安装与启动

### 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/stock_reason.git
cd stock_reason/backend
```

2. 安装 uv（如果尚未安装）
```bash
pip install uv
```

3. 创建并激活虚拟环境
```bash
uv venv
source .venv/bin/activate  # 在Windows上使用 .venv\Scripts\activate
```

4. 使用 uv 安装依赖
```bash
uv pip sync
```

如果是第一次设置或需要更新依赖锁文件：
```bash
uv pip install -e .
uv pip compile pyproject.toml -o uv.lock
uv pip sync uv.lock
```

5. 启动后端服务
```bash
uvicorn app.main:app --reload
```

6. 访问API文档
```
http://localhost:8000/docs
```

### 依赖管理

#### 添加新依赖

当需要添加新依赖时，按照以下步骤操作：

1. 更新 `pyproject.toml` 文件，在 `dependencies` 列表中添加新依赖

2. 重新生成锁文件
```bash
uv pip compile pyproject.toml -o uv.lock
```

3. 同步安装依赖
```bash
uv pip sync uv.lock
```

#### 开发依赖

如需安装开发工具（如代码格式化、类型检查等），可以使用：

```bash
uv pip install -e ".[dev]"
```

### 数据库迁移

使用 Alembic 进行数据库迁移：

```bash
# 创建迁移文件
alembic revision --autogenerate -m "描述你的变更"

# 应用迁移
alembic upgrade head
```

### 部署指南

#### 使用Docker部署

```bash
# 在项目根目录
docker-compose up -d backend
```

#### 手动部署

```bash
cd backend
# 安装 uv
pip install uv
# 创建虚拟环境
uv venv
source .venv/bin/activate  # 在Windows上使用 .venv\Scripts\activate
# 安装依赖
uv pip install -e .
uv pip sync
# 配置环境变量
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API 接口文档

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

## 测试

本项目使用 pytest 进行自动化测试：

```bash
# 运行所有测试
pytest

# 运行特定测试模块
pytest tests/test_api.py

# 生成测试覆盖率报告
pytest --cov=app
```

## 环境变量配置

创建 `.env` 文件在项目根目录，包含以下环境变量：

```
# 数据库配置
DATABASE_URL=postgresql+psycopg://user:password@localhost/dbname

# 安全配置
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 其他配置
ENVIRONMENT=development
```

## 数据来源

- 行情数据：Yahoo Finance非官方API
- 事件数据：用户输入与LLM新闻分析

## 许可证

MIT

## 贡献指南

我们欢迎社区贡献！请参照以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

### 代码规范

- 遵循PEP 8编码规范
- 使用类型注解
- 为所有函数和类添加文档字符串
- 编写单元测试 
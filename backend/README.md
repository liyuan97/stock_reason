# Stock Event Tracking System Backend

## Project Overview

Backend API service for the Stock Event Tracking System, supporting event recording, querying, and analysis, implementing the correlation display between stock market data and important events.

## Technology Stack

- Python 3.10+
- FastAPI framework
- SQLAlchemy ORM
- PostgreSQL database
- Redis cache
- JWT authentication
- Alembic database migration
- LangChain + LLM news analysis

## System Design

### Backend Architecture
- RESTful API built on FastAPI
- Database operations using SQLAlchemy ORM
- API endpoints protected by JWT authentication
- Redis cache for optimizing query performance
- Scheduled tasks to fetch the latest market data
- LLM service based on LangChain for news analysis and event extraction

### Dependency Management
This project uses `uv` as a Python package management tool, which has the following advantages:
- Faster than traditional pip
- Provides deterministic dependency locking (uv.lock)
- Perfect compatibility with pyproject.toml
- Supports virtual environment management

### Data Flow Design
```
API Request → FastAPI Processing → Business Logic → Database/Cache ← LLM News Analysis
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/     # API route definitions
│   │   ├── dependencies/  # Dependency injection
│   │   └── middleware/    # Middleware
│   ├── core/
│   │   ├── config.py      # Configuration management
│   │   └── security.py    # Security related
│   ├── db/
│   │   ├── models/        # Data models
│   │   └── session.py     # Database session
│   ├── services/
│   │   ├── stock_service.py  # Stock service
│   │   └── event_service.py  # Event service
│   ├── llm/
│   │   ├── news_analyzer.py  # News analysis
│   │   └── event_extractor.py # Event extraction
│   └── main.py            # Application entry
├── tests/                 # Test cases
├── alembic/               # Database migration
├── pyproject.toml         # Project dependency configuration
├── uv.lock                # Dependency lock file
└── requirements.txt       # Dependency description (deprecated, kept for reference only)
```

## Installation and Launch

### Development Environment Setup

1. Clone repository
```bash
git clone https://github.com/yourusername/stock_reason.git
cd stock_reason/backend
```

2. Install uv (if not already installed)
```bash
pip install uv
```

3. Create and activate virtual environment
```bash
uv venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
```

4. Install dependencies using uv
```bash
uv pip sync
```

If it's the first setup or need to update the dependency lock file:
```bash
uv pip install -e .
uv pip compile pyproject.toml -o uv.lock
uv pip sync uv.lock
```

5. Start backend service
```bash
uvicorn app.main:app --reload
```

6. Access API documentation
```
http://localhost:8000/docs
```

### Dependency Management

#### Adding New Dependencies

When you need to add new dependencies, follow these steps:

1. Update the `pyproject.toml` file, add new dependencies to the `dependencies` list

2. Regenerate the lock file
```bash
uv pip compile pyproject.toml -o uv.lock
```

3. Synchronize installed dependencies
```bash
uv pip sync uv.lock
```

#### Development Dependencies

To install development tools (such as code formatting, type checking, etc.), you can use:

```bash
uv pip install -e ".[dev]"
```

### Database Migration

Use Alembic for database migration:

```bash
# Create migration file
alembic revision --autogenerate -m "Describe your changes"

# Apply migration
alembic upgrade head
```

### Deployment Guide

#### Deploy Using Docker

```bash
# In the project root directory
docker-compose up -d backend
```

#### Manual Deployment

```bash
cd backend
# Install uv
pip install uv
# Create virtual environment
uv venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
# Install dependencies
uv pip install -e .
uv pip sync
# Configure environment variables
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Complete API documentation can be accessed after starting the backend service:
```
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc  # ReDoc
```

### Core API Endpoints

1. Stock Data API
   - `GET /api/stocks/{symbol}` - Get basic information for a specific stock
   - `GET /api/stocks/{symbol}/prices` - Get stock historical prices
   - `GET /api/stocks/{symbol}/events` - Get stock related events

2. Event API
   - `GET /api/events` - Get all events
   - `POST /api/events` - Create new event
   - `GET /api/events/{id}` - Get specific event details
   - `PUT /api/events/{id}` - Update event
   - `DELETE /api/events/{id}` - Delete event

3. User API
   - `POST /api/users/register` - User registration
   - `POST /api/users/login` - User login
   - `GET /api/users/me` - Get current user information

## Testing

This project uses pytest for automated testing:

```bash
# Run all tests
pytest

# Run specific test module
pytest tests/test_api.py

# Generate test coverage report
pytest --cov=app
```

## Environment Variable Configuration

Create a `.env` file in the project root directory, including the following environment variables:

```
# Database configuration
DATABASE_URL=postgresql+psycopg://user:password@localhost/dbname

# Security configuration
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis configuration
REDIS_URL=redis://localhost:6379/0

# Other configurations
ENVIRONMENT=development
```

## Data Sources

- Market data: Yahoo Finance unofficial API
- Event data: User input and LLM news analysis

## License

MIT

## Contribution Guidelines

We welcome community contributions! Please follow these steps:

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Follow PEP 8 coding style
- Use type annotations
- Add docstrings to all functions and classes
- Write unit tests 
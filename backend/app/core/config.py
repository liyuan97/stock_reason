import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用程序配置设置"""
    
    # 调试模式
    DEBUG: bool = False
    
    @field_validator("DEBUG", mode="before")
    def parse_debug(cls, v):
        if isinstance(v, str):
            return v.lower() in ("true", "1", "t", "yes")
        return bool(v)
    
    # API设置
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    PROJECT_NAME: str = "股票事件追踪系统"
    
    # 数据库设置
    # 数据库类型: "sqlite" 或 "postgresql"
    DB_TYPE: str = "sqlite"
    
    # SQLite设置
    SQLITE_DB_FILE: str = "stock_reason.db"
    
    # PostgreSQL设置
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "stock_reason"
    DATABASE_URI: Optional[str] = None

    @field_validator("DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
            
        values = info.data
        if values.get("DB_TYPE") == "sqlite":
            # SQLite连接字符串
            sqlite_file = values.get("SQLITE_DB_FILE", "stock_reason.db")
            return f"sqlite:///{sqlite_file}"
        else:
            # PostgreSQL连接字符串
            return PostgresDsn.build(
                scheme="postgresql",
                user=values.get("POSTGRES_USER"),
                password=values.get("POSTGRES_PASSWORD"),
                host=values.get("POSTGRES_SERVER"),
                path=f"/{values.get('POSTGRES_DB') or ''}",
            )
    
    # CORS设置
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                # 尝试解析JSON字符串
                import json
                return json.loads(v)
            except:
                # 如果不是JSON，尝试按逗号分割
                if not v.startswith("["):
                    return [i.strip() for i in v.split(",")]
                return []
        elif isinstance(v, (list, str)):
            return v
        return []  # 返回默认空列表而不是抛出错误
    
    # 股票数据API设置
    STOCK_API_BASE_URL: str = "https://query1.finance.yahoo.com"
    
    # Redis缓存设置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # 用户管理设置
    FIRST_SUPERUSER: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin"
    
    # 微信登录设置
    WECHAT_APP_ID: str = ""
    WECHAT_APP_SECRET: str = ""
    WECHAT_REDIRECT_URI: str = ""
    
    # 前端URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Apple登录设置
    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""
    APPLE_PRIVATE_KEY: str = ""
    APPLE_REDIRECT_URI: str = ""
    
    # Google登录设置
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    GOOGLE_FRONTEND_URL: str = ""
    
    # 使用限制
    FREE_USAGE_LIMIT: int = 10
    
    # LLM设置
    DEFAULT_LLM_NAME: str = "gpt-3.5-turbo"
    DEFAULT_PROMPT_VERSION: str = "v1"

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "from_attributes": True,  # 替代之前的orm_mode
        "extra": "allow"  # 允许额外的环境变量
    }


# 创建全局设置实例
try:
    settings = Settings()
except Exception as e:
    import logging
    logging.error(f"加载配置失败: {e}")
    # 提供一个基本的配置，确保程序至少能启动
    settings = Settings(
        PROJECT_NAME="股票事件追踪系统",
        API_V1_STR="/api",
        SECRET_KEY=secrets.token_urlsafe(32),
        DB_TYPE="sqlite",
        SQLITE_DB_FILE="stock_reason.db",
        BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
    ) 
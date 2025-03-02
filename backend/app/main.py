from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.api import api_router
from app.core.config import settings

# 根据环境变量决定是否使用数据库
USE_DATABASE = os.getenv("USE_DATABASE", "false").lower() == "true"

if USE_DATABASE:
    from app.db.base import Base
    from app.db.session import engine, SessionLocal
    from app.db.init_db import init_db


def create_tables():
    """创建数据库表"""
    if USE_DATABASE:
        Base.metadata.create_all(bind=engine)


def get_application():
    """创建FastAPI应用"""
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="股票事件追踪系统API"
    )

    # 设置CORS
    origins = []
    try:
        # 确保origins是字符串列表
        if settings.BACKEND_CORS_ORIGINS:
            origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
    except Exception as e:
        import logging
        logging.error(f"CORS配置错误: {e}")
        # 设置默认值
        origins = ["http://localhost:3000", "http://localhost:8080"]

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 挂载API路由
    _app.include_router(api_router, prefix=settings.API_V1_STR)

    return _app


app = get_application()


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    # 如果使用数据库，创建表并初始化
    if USE_DATABASE:
        # 创建数据库表
        create_tables()
        
        # 初始化数据库
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()
    else:
        print("使用模拟数据，不连接数据库") 
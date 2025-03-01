from typing import Generator
from fastapi import Depends

from app.db.session import SessionLocal


def get_db() -> Generator:
    """获取数据库会话依赖"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close() 
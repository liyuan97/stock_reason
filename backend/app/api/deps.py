from typing import Generator, Optional
import os
from fastapi import Depends

# 根据环境变量决定是否使用数据库
USE_DATABASE = os.getenv("USE_DATABASE", "false").lower() == "true"

if USE_DATABASE:
    from app.db.session import SessionLocal
    
    def get_db() -> Generator:
        """获取数据库会话依赖"""
        try:
            db = SessionLocal()
            yield db
        finally:
            db.close()
else:
    # 当不使用数据库时，提供一个空的依赖
    async def get_db() -> None:
        """不使用数据库时的空依赖"""
        return None 
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Stock(Base):
    """股票基本信息模型"""
    __tablename__ = "stocks"

    symbol = Column(String(20), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    market = Column(String(50), nullable=False)
    sector = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    description = Column(String(1000), nullable=True)
    
    # 关联事件列表
    events = relationship("Event", back_populates="stock", primaryjoin="Stock.symbol == Event.stock_symbol")
    
    # 关联价格列表
    prices = relationship("StockPrice", back_populates="stock", primaryjoin="Stock.symbol == StockPrice.stock_symbol")
    
    # 创建和更新时间
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now()) 
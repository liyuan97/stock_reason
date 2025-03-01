from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Event(Base):
    """股票相关事件模型"""
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    time = Column(Integer, nullable=False, comment="Unix时间戳(秒)")
    level = Column(Integer, nullable=False, comment="事件重要程度(1-5)")
    source = Column(String(255), nullable=True)
    url = Column(String(512), nullable=True)
    
    # 创建和更新时间
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # 关联股票代码
    stock_symbol = Column(String(20), ForeignKey("stocks.symbol"), nullable=False, index=True)
    
    # 关联股票
    stock = relationship("Stock", back_populates="events") 
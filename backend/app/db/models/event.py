from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class EventDurationType(enum.Enum):
    continuous = "continuous"
    temporary = "temporary"
    sudden = "sudden"


class EventCategory(enum.Enum):
    company = "company"
    industry = "industry"
    macroeconomic = "macroeconomic"
    market_sentiment = "market_sentiment"


class EventImpact(enum.Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"


class Event(Base):
    """股票相关事件模型"""
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    start_time = Column(Integer, nullable=False, comment="开始时间-Unix时间戳(秒)")
    end_time = Column(Integer, nullable=True, comment="结束时间-Unix时间戳(秒)")
    level = Column(Integer, nullable=False, comment="事件重要程度(1-5)")
    sources = Column(JSON, nullable=True, comment="事件来源列表")
    urls = Column(JSON, nullable=True, comment="相关链接列表")
    duration_type = Column(Enum(EventDurationType), nullable=False, comment="事件持续类型")
    category = Column(Enum(EventCategory), nullable=False, comment="事件分类")
    impact = Column(Enum(EventImpact), nullable=True, comment="事件影响类型")
    
    # 创建和更新时间
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # 关联股票代码
    stock_symbol = Column(String(20), ForeignKey("stocks.symbol"), nullable=False, index=True)
    
    # 关联股票
    stock = relationship("Stock", back_populates="events") 
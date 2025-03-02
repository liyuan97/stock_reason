from typing import Optional, List, Any, Union, Literal
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


# 事件等级类型
EventLevel = Literal[1, 2, 3, 4, 5]

# 事件持续类型
EventDurationType = Literal["continuous", "temporary", "sudden"]

# 事件分类
EventCategory = Literal["company", "industry", "macroeconomic", "market_sentiment"]

# 事件基础模型
class EventBase(BaseModel):
    """事件基础模型"""
    title: str
    description: str
    start_time: int  # Unix时间戳，对应前端的startTime
    end_time: Optional[int] = None  # 结束时间，对应前端的endTime
    level: EventLevel  # 事件重要性级别：1-5
    stock_symbol: str
    sources: Optional[List[str]] = None  # 多个来源，对应前端的sources
    urls: Optional[List[str]] = None  # 多个链接，对应前端的urls
    duration_type: EventDurationType  # 事件持续类型，对应前端的durationType
    category: EventCategory  # 事件分类，对应前端的category
    impact: Optional[Literal["positive", "negative", "neutral"]] = None  # 影响类型，对应前端的impact


# 创建事件请求模型
class EventCreate(EventBase):
    """创建事件的请求模型"""
    pass


# 更新事件请求模型
class EventUpdate(BaseModel):
    """更新事件的请求模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    level: Optional[EventLevel] = None
    stock_symbol: Optional[str] = None
    sources: Optional[List[str]] = None
    urls: Optional[List[str]] = None
    duration_type: Optional[EventDurationType] = None
    category: Optional[EventCategory] = None
    impact: Optional[Literal["positive", "negative", "neutral"]] = None


# 数据库中的事件模型
class EventInDBBase(EventBase):
    """数据库中的事件基础模型"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True
    }


# API响应中的事件模型
class Event(EventInDBBase):
    """标准事件响应模型"""
    pass


# 简化的事件列表项模型
class EventListItem(BaseModel):
    id: str
    title: str
    start_time: int  # 更改为start_time以与其他模型一致
    level: EventLevel
    stock_symbol: str
    duration_type: EventDurationType
    category: EventCategory
    impact: Optional[Literal["positive", "negative", "neutral"]] = None

    model_config = {
        "from_attributes": True
    }


class EventWithAnalysis(Event):
    """带有AI分析的事件模型"""
    analysis: Optional[Any] = None
    sentiment: Optional[float] = None  # 情感分析得分：-1.0 (极度负面) 到 1.0 (极度正面)
    ai_impact: Optional[float] = None  # 预计影响程度：0.0 (无影响) 到 1.0 (重大影响)，重命名以避免与前端的impact字符串类型冲突
    
    model_config = {
        "from_attributes": True
    }


# 带有事件列表的股票模型
class StockWithEvents(BaseModel):
    """带有相关事件的股票模型"""
    symbol: str
    name: str
    events: List[Event] = [] 
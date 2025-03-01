from typing import Optional, List, Any
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


# 事件等级类型
EventLevel = int

# 事件基础模型
class EventBase(BaseModel):
    """事件基础模型"""
    title: str
    description: str
    time: int  # Unix时间戳
    level: int  # 事件重要性级别：1-5
    stock_symbol: str
    source: Optional[str] = None
    url: Optional[str] = None


# 创建事件请求模型
class EventCreate(EventBase):
    """创建事件的请求模型"""
    pass


# 更新事件请求模型
class EventUpdate(BaseModel):
    """更新事件的请求模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    time: Optional[int] = None
    level: Optional[int] = None
    stock_symbol: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None


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
    time: int
    level: EventLevel
    stock_symbol: str

    model_config = {
        "from_attributes": True
    }


class EventWithAnalysis(Event):
    """带有AI分析的事件模型"""
    analysis: Optional[Any] = None
    sentiment: Optional[float] = None  # 情感分析得分：-1.0 (极度负面) 到 1.0 (极度正面)
    impact: Optional[float] = None  # 预计影响程度：0.0 (无影响) 到 1.0 (重大影响)
    
    model_config = {
        "from_attributes": True
    }


# 带有事件列表的股票模型
class StockWithEvents(BaseModel):
    """带有相关事件的股票模型"""
    symbol: str
    name: str
    events: List[Event] = [] 
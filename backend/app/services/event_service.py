import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.schemas.event import EventCreate
from app.db.models.event import Event

logger = logging.getLogger(__name__)


class EventService:
    """事件服务，负责管理股票相关事件"""
    
    def filter_events_by_time_range(
        self, 
        events: List[Event], 
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[Event]:
        """按时间范围过滤事件"""
        if not start_time and not end_time:
            return events
            
        filtered_events = events.copy()
        
        if start_time:
            filtered_events = [e for e in filtered_events if e.time >= start_time]
        if end_time:
            filtered_events = [e for e in filtered_events if e.time <= end_time]
            
        return filtered_events
    
    def filter_events_by_level(
        self, 
        events: List[Event], 
        min_level: Optional[int] = None,
        max_level: Optional[int] = None
    ) -> List[Event]:
        """按重要程度范围过滤事件"""
        if not min_level and not max_level:
            return events
            
        filtered_events = events.copy()
        
        if min_level:
            filtered_events = [e for e in filtered_events if e.level >= min_level]
        if max_level:
            filtered_events = [e for e in filtered_events if e.level <= max_level]
            
        return filtered_events
    
    def create_manual_event(
        self,
        title: str,
        description: str,
        time: int,
        level: int,
        stock_symbol: str,
        source: Optional[str] = None,
        url: Optional[str] = None,
    ) -> EventCreate:
        """创建手动添加的事件对象"""
        return EventCreate(
            title=title,
            description=description,
            time=time,
            level=level,
            stock_symbol=stock_symbol,
            source=source,
            url=url
        )

    def create_events_from_news(self, news_data: List[Dict[str, Any]], stock_symbol: str) -> List[EventCreate]:
        """从新闻数据创建事件（示例方法，实际应使用LLM服务）"""
        events = []
        for news in news_data:
            # 这里只是示例，实际应该用LLM分析新闻内容并提取事件
            event = EventCreate(
                title=news.get("title", ""),
                description=news.get("summary", ""),
                time=int(datetime.fromisoformat(news.get("publish_time")).timestamp()),
                level=3,  # 默认重要程度，实际应由LLM判断
                stock_symbol=stock_symbol,
                source=news.get("source", ""),
                url=news.get("url", "")
            )
            events.append(event)
        return events


event_service = EventService() 
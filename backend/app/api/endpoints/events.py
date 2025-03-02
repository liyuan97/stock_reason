from typing import Any, List, Optional, Literal
from fastapi import APIRouter, HTTPException, Query

# 导入mock数据模块
from app.mock_data import events as mock_events
from app.schemas.event import Event, EventCreate, EventUpdate, EventListItem

router = APIRouter()


@router.get("/", response_model=List[EventListItem])
def read_events(
    skip: int = 0,
    limit: int = 100,
    stock_symbol: Optional[str] = None,
    min_level: Optional[int] = Query(None, ge=1, le=5),
    max_level: Optional[int] = Query(None, ge=1, le=5),
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
    duration_type: Optional[Literal["continuous", "temporary", "sudden"]] = None,
    category: Optional[Literal["company", "industry", "macroeconomic", "market_sentiment"]] = None,
    impact: Optional[Literal["positive", "negative", "neutral"]] = None,
) -> Any:
    """
    获取事件列表。
    
    - **stock_symbol**: 可选，按股票代码过滤
    - **min_level/max_level**: 可选，按事件重要程度范围过滤(1-5)
    - **start_time/end_time**: 可选，按时间范围过滤(Unix时间戳)
    - **duration_type**: 可选，按事件持续类型过滤(continuous/temporary/sudden)
    - **category**: 可选，按事件分类过滤(company/industry/macroeconomic/market_sentiment)
    - **impact**: 可选，按事件影响类型过滤(positive/negative/neutral)
    """
    events = mock_events.get_multi(
        skip=skip, 
        limit=limit,
        stock_symbol=stock_symbol,
        min_level=min_level,
        max_level=max_level,
        start_time=start_time,
        end_time=end_time,
        duration_type=duration_type,
        category=category,
        impact=impact
    )
    
    return events


@router.get("/stock/{stock_symbol}", response_model=List[Event])
def read_events_by_stock(
    stock_symbol: str,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    获取特定股票的所有事件。
    
    - **stock_symbol**: 股票代码
    """
    events = mock_events.get_by_stock_symbol(stock_symbol=stock_symbol)
    # 应用分页
    return events[skip:skip + limit]


@router.get("/timerange", response_model=List[Event])
def read_events_by_time_range(
    start_time: int,
    end_time: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    获取指定时间范围内的所有事件。
    
    - **start_time**: 开始时间（Unix时间戳）
    - **end_time**: 结束时间（Unix时间戳）
    """
    events = mock_events.get_by_time_range(
        start_time=start_time,
        end_time=end_time
    )
    # 应用分页
    return events[skip:skip + limit]


@router.post("/", response_model=Event)
def create_event(
    *,
    event_in: EventCreate,
) -> Any:
    """
    创建新事件。
    
    需要提供以下必填字段:
    - **title**: 事件标题
    - **description**: 事件描述 
    - **start_time**: 开始时间（Unix时间戳）
    - **level**: 事件级别（1-5）
    - **stock_symbol**: 相关股票代码
    - **duration_type**: 事件持续类型(continuous/temporary/sudden)
    - **category**: 事件分类(company/industry/macroeconomic/market_sentiment)
    
    以下为可选字段:
    - **end_time**: 结束时间（Unix时间戳）
    - **sources**: 消息来源列表
    - **urls**: 相关链接列表
    - **impact**: 影响类型(positive/negative/neutral)
    """
    event = mock_events.create(obj_in=event_in)
    return event


@router.get("/{event_id}", response_model=Event)
def read_event(
    *,
    event_id: str,
) -> Any:
    """
    通过ID获取特定事件。
    """
    event = mock_events.get(event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    return event


@router.put("/{event_id}", response_model=Event)
def update_event(
    *,
    event_id: str,
    event_in: EventUpdate,
) -> Any:
    """
    更新事件。
    
    所有字段均为可选，仅更新提供的字段:
    - **title**: 事件标题
    - **description**: 事件描述 
    - **start_time**: 开始时间（Unix时间戳）
    - **end_time**: 结束时间（Unix时间戳）
    - **level**: 事件级别（1-5）
    - **stock_symbol**: 相关股票代码
    - **duration_type**: 事件持续类型(continuous/temporary/sudden)
    - **category**: 事件分类(company/industry/macroeconomic/market_sentiment)
    - **sources**: 消息来源列表
    - **urls**: 相关链接列表
    - **impact**: 影响类型(positive/negative/neutral)
    """
    event = mock_events.get(event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    event = mock_events.update(event_id=event_id, obj_in=event_in)
    return event


@router.delete("/{event_id}", response_model=Event)
def delete_event(
    *,
    event_id: str,
) -> Any:
    """
    删除事件。
    """
    event = mock_events.get(event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    event = mock_events.remove(event_id=event_id)
    return event 
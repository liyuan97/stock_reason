from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.schemas.event import Event, EventCreate, EventUpdate, EventListItem

router = APIRouter()


@router.get("/", response_model=List[EventListItem])
def read_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    stock_symbol: Optional[str] = None,
    min_level: Optional[int] = Query(None, ge=1, le=5),
    max_level: Optional[int] = Query(None, ge=1, le=5),
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
) -> Any:
    """
    获取事件列表。
    
    - **stock_symbol**: 可选，按股票代码过滤
    - **min_level/max_level**: 可选，按事件重要程度范围过滤(1-5)
    - **start_time/end_time**: 可选，按时间范围过滤(Unix时间戳)
    """
    events = crud.event.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        stock_symbol=stock_symbol,
        min_level=min_level,
        max_level=max_level,
        start_time=start_time,
        end_time=end_time
    )
    return events


@router.post("/", response_model=Event)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: EventCreate,
) -> Any:
    """
    创建新事件。
    """
    # 验证关联的股票是否存在
    stock = crud.stock.get(db, symbol=event_in.stock_symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail=f"Stock with symbol {event_in.stock_symbol} not found"
        )
    
    event = crud.event.create(db=db, obj_in=event_in)
    return event


@router.get("/{event_id}", response_model=Event)
def read_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
) -> Any:
    """
    通过ID获取特定事件。
    """
    event = crud.event.get(db=db, event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    return event


@router.put("/{event_id}", response_model=Event)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
    event_in: EventUpdate,
) -> Any:
    """
    更新事件。
    """
    event = crud.event.get(db=db, event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    event = crud.event.update(db=db, db_obj=event, obj_in=event_in)
    return event


@router.delete("/{event_id}", response_model=Event)
def delete_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
) -> Any:
    """
    删除事件。
    """
    event = crud.event.get(db=db, event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    event = crud.event.remove(db=db, event_id=event_id)
    return event 
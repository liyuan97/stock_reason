import uuid
from typing import List, Optional, Dict, Any, Union

from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.db.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def get(db: Session, event_id: str) -> Optional[Event]:
    """获取单个事件"""
    return db.query(Event).filter(Event.id == event_id).first()


def get_multi(
    db: Session, 
    *, 
    skip: int = 0, 
    limit: int = 100,
    stock_symbol: Optional[str] = None,
    min_level: Optional[int] = None,
    max_level: Optional[int] = None,
    start_time: Optional[int] = None,
    end_time: Optional[int] = None
) -> List[Event]:
    """获取多个事件，支持过滤"""
    query = db.query(Event)
    
    # 应用过滤条件
    if stock_symbol:
        query = query.filter(Event.stock_symbol == stock_symbol)
    if min_level is not None:
        query = query.filter(Event.level >= min_level)
    if max_level is not None:
        query = query.filter(Event.level <= max_level)
    if start_time is not None:
        query = query.filter(Event.time >= start_time)
    if end_time is not None:
        query = query.filter(Event.time <= end_time)
        
    # 排序、分页并返回结果
    return query.order_by(Event.time.desc()).offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: EventCreate) -> Event:
    """创建事件"""
    obj_in_data = jsonable_encoder(obj_in)
    
    # 生成UUID
    db_obj = Event(**obj_in_data, id=str(uuid.uuid4()))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session, *, db_obj: Event, obj_in: Union[EventUpdate, Dict[str, Any]]
) -> Event:
    """更新事件"""
    obj_data = jsonable_encoder(db_obj)
    
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in obj_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, event_id: str) -> Event:
    """删除事件"""
    obj = db.query(Event).get(event_id)
    db.delete(obj)
    db.commit()
    return obj 
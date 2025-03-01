from typing import List, Optional, Dict, Any, Union
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.db.models.stock import Stock
from app.db.models.price import StockPrice
from app.schemas.stock import StockCreate, StockUpdate, StockPriceCreate


def get(db: Session, symbol: str) -> Optional[Stock]:
    """获取单个股票"""
    return db.query(Stock).filter(Stock.symbol == symbol).first()


def get_multi(
    db: Session, *, skip: int = 0, limit: int = 100, market: Optional[str] = None
) -> List[Stock]:
    """获取多个股票"""
    query = db.query(Stock)
    
    if market:
        query = query.filter(Stock.market == market)
        
    return query.offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: StockCreate) -> Stock:
    """创建股票"""
    obj_in_data = jsonable_encoder(obj_in)
    db_obj = Stock(**obj_in_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session, *, db_obj: Stock, obj_in: Union[StockUpdate, Dict[str, Any]]
) -> Stock:
    """更新股票"""
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


def remove(db: Session, *, symbol: str) -> Stock:
    """删除股票"""
    obj = db.query(Stock).get(symbol)
    db.delete(obj)
    db.commit()
    return obj


# 股票价格相关CRUD操作
def get_stock_prices(
    db: Session, 
    *, 
    stock_symbol: str, 
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[StockPrice]:
    """获取股票历史价格"""
    query = db.query(StockPrice).filter(StockPrice.stock_symbol == stock_symbol)
    
    if start_date:
        query = query.filter(StockPrice.date >= start_date)
    if end_date:
        query = query.filter(StockPrice.date <= end_date)
        
    return query.order_by(StockPrice.date).all()


def create_stock_price(db: Session, *, obj_in: StockPriceCreate) -> StockPrice:
    """创建股票价格记录"""
    # 不使用jsonable_encoder，直接转换为dict但保持date字段为datetime对象
    obj_dict = obj_in.dict()
    
    # 确保日期是datetime对象
    if isinstance(obj_dict["date"], str):
        obj_dict["date"] = datetime.fromisoformat(obj_dict["date"].replace("Z", "+00:00"))
    
    db_obj = StockPrice(**obj_dict)
    
    # 检查是否已存在该日期的价格记录
    existing = db.query(StockPrice).filter(
        StockPrice.stock_symbol == obj_in.stock_symbol,
        StockPrice.date == obj_in.date
    ).first()
    
    if existing:
        # 更新现有记录
        for field, value in obj_dict.items():
            setattr(existing, field, value)
        db_obj = existing
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def batch_create_stock_prices(db: Session, *, objs_in: List[StockPriceCreate]) -> List[StockPrice]:
    """批量创建股票价格记录"""
    result = []
    for obj_in in objs_in:
        result.append(create_stock_price(db=db, obj_in=obj_in))
    return result 
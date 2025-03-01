from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.schemas.stock import Stock, StockCreate, StockUpdate, StockPrice, StockWithPrices

router = APIRouter()


@router.get("/", response_model=List[Stock])
def read_stocks(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    market: Optional[str] = None,
) -> Any:
    """
    获取股票列表。
    
    - **market**: 可选，按市场过滤（如：US, CN等）
    """
    stocks = crud.stock.get_multi(
        db, skip=skip, limit=limit, market=market
    )
    return stocks


@router.post("/", response_model=Stock)
def create_stock(
    *,
    db: Session = Depends(get_db),
    stock_in: StockCreate,
) -> Any:
    """
    创建新股票。
    """
    stock = crud.stock.get(db, symbol=stock_in.symbol)
    if stock:
        raise HTTPException(
            status_code=400,
            detail=f"Stock with symbol {stock_in.symbol} already exists"
        )
    stock = crud.stock.create(db=db, obj_in=stock_in)
    return stock


@router.get("/{symbol}", response_model=Stock)
def read_stock(
    *,
    db: Session = Depends(get_db),
    symbol: str,
) -> Any:
    """
    通过代码获取特定股票信息。
    """
    stock = crud.stock.get(db=db, symbol=symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    return stock


@router.put("/{symbol}", response_model=Stock)
def update_stock(
    *,
    db: Session = Depends(get_db),
    symbol: str,
    stock_in: StockUpdate,
) -> Any:
    """
    更新股票信息。
    """
    stock = crud.stock.get(db=db, symbol=symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    stock = crud.stock.update(db=db, db_obj=stock, obj_in=stock_in)
    return stock


@router.delete("/{symbol}", response_model=Stock)
def delete_stock(
    *,
    db: Session = Depends(get_db),
    symbol: str,
) -> Any:
    """
    删除股票。
    """
    stock = crud.stock.get(db=db, symbol=symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    stock = crud.stock.remove(db=db, symbol=symbol)
    return stock


@router.get("/{symbol}/prices", response_model=List[StockPrice])
def read_stock_prices(
    *,
    db: Session = Depends(get_db),
    symbol: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Any:
    """
    获取股票历史价格数据。
    
    - **start_date**: 可选，开始日期
    - **end_date**: 可选，结束日期
    """
    stock = crud.stock.get(db=db, symbol=symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    
    prices = crud.stock.get_stock_prices(
        db=db, 
        stock_symbol=symbol,
        start_date=start_date,
        end_date=end_date
    )
    return prices


@router.get("/{symbol}/events", response_model=List[Stock])
def read_stock_events(
    *,
    db: Session = Depends(get_db),
    symbol: str,
    min_level: Optional[int] = Query(None, ge=1, le=5),
    max_level: Optional[int] = Query(None, ge=1, le=5),
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    获取与特定股票相关的事件。
    
    - **min_level/max_level**: 可选，按事件重要程度范围过滤(1-5)
    - **start_time/end_time**: 可选，按时间范围过滤(Unix时间戳)
    """
    stock = crud.stock.get(db=db, symbol=symbol)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    
    events = crud.event.get_multi(
        db=db,
        stock_symbol=symbol,
        min_level=min_level,
        max_level=max_level,
        start_time=start_time,
        end_time=end_time,
        skip=skip,
        limit=limit
    )
    return events 
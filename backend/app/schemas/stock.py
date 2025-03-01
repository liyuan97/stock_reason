from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class StockBase(BaseModel):
    symbol: str
    name: str
    market: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    name: Optional[str] = None
    market: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None


class StockInDBBase(StockBase):
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class Stock(StockInDBBase):
    pass


# 股票价格基础模型
class StockPriceBase(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockPriceCreate(StockPriceBase):
    stock_symbol: str


class StockPrice(StockPriceBase):
    id: int
    stock_symbol: str

    model_config = {
        "from_attributes": True
    }


# 带有历史价格的股票模型
class StockWithPrices(Stock):
    prices: List[StockPrice] = [] 
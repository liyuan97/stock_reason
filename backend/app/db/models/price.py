from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class StockPrice(Base):
    """股票历史价格数据模型"""
    __tablename__ = "stock_prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_symbol = Column(String(20), ForeignKey("stocks.symbol"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    
    # 关联股票
    stock = relationship("Stock", back_populates="prices")
    
    # 确保每个股票每天只有一条记录
    __table_args__ = (
        UniqueConstraint('stock_symbol', 'date', name='uix_stock_date'),
    ) 
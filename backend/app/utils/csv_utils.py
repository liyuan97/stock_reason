import os
import csv
import pandas as pd
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.schemas.stock import Stock, StockPrice

# CSV文件目录
CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def get_available_stocks() -> List[Stock]:
    """
    获取所有可用的股票列表（基于CSV文件命名）
    """
    stocks = []
    try:
        for filename in os.listdir(CSV_DIR):
            if filename.endswith('_stock_data.csv'):
                symbol = filename.split('_')[0]
                # 创建基本的股票对象，只有symbol和name
                stocks.append(Stock(
                    symbol=symbol,
                    name=symbol,  # 使用symbol作为name
                    market="US",  # 默认市场
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                ))
    except Exception as e:
        print(f"Error reading stock directory: {e}")
    
    return stocks

def get_stock_by_symbol(symbol: str) -> Optional[Stock]:
    """
    通过代码获取特定股票
    """
    filepath = os.path.join(CSV_DIR, f"{symbol}_stock_data.csv")
    if not os.path.exists(filepath):
        return None
    
    return Stock(
        symbol=symbol,
        name=symbol,  # 使用symbol作为name
        market="US",  # 默认市场
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

def get_stock_prices(
    symbol: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[StockPrice]:
    """
    获取股票历史价格数据
    """
    filepath = os.path.join(CSV_DIR, f"{symbol}_stock_data.csv")
    if not os.path.exists(filepath):
        return []
    
    try:
        # 使用pandas读取CSV
        df = pd.read_csv(filepath, skiprows=2)  # 跳过前两行（Ticker行等）
        
        # 将第一列（Date列）转换为日期类型
        df['Date'] = pd.to_datetime(df['Date'])
        
        # 应用日期过滤
        if start_date:
            df = df[df['Date'] >= start_date]
        if end_date:
            df = df[df['Date'] <= end_date]
        
        # 转换为StockPrice列表
        prices = []
        for _, row in df.iterrows():
            prices.append(StockPrice(
                id=0,  # 占位ID
                stock_symbol=symbol,
                date=row['Date'],
                open=float(row['Open']),
                high=float(row['High']),
                low=float(row['Low']),
                close=float(row['Close']),
                volume=int(row['Volume'])
            ))
        
        return prices
    except Exception as e:
        print(f"Error reading stock prices from CSV: {e}")
        return []

def get_filtered_stocks(
    skip: int = 0,
    limit: int = 100,
    market: Optional[str] = None
) -> List[Stock]:
    """
    获取过滤后的股票列表
    """
    stocks = get_available_stocks()
    
    # 应用市场过滤
    if market:
        stocks = [s for s in stocks if s.market == market]
    
    # 应用分页
    return stocks[skip:skip+limit] 
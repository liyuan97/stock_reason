import logging
from datetime import datetime, timedelta
import time
import uuid
from sqlalchemy.orm import Session

from app import crud
from app.schemas.stock import StockCreate, StockPriceCreate
from app.schemas.event import EventCreate
from app.core.config import settings

# 设置日志
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    """
    初始化数据库并添加测试数据
    """
    # 添加测试股票数据
    test_stocks = [
        {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "market": "US",
            "sector": "Technology",
            "industry": "Consumer Electronics",
            "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
        },
        {
            "symbol": "MSFT",
            "name": "Microsoft Corporation",
            "market": "US",
            "sector": "Technology",
            "industry": "Software—Infrastructure",
            "description": "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide."
        },
        {
            "symbol": "TSLA",
            "name": "Tesla, Inc.",
            "market": "US",
            "sector": "Consumer Cyclical",
            "industry": "Auto Manufacturers",
            "description": "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems."
        }
    ]

    # 检查并添加测试股票
    for stock_data in test_stocks:
        stock = crud.stock.get(db, symbol=stock_data["symbol"])
        if not stock:
            stock_in = StockCreate(**stock_data)
            crud.stock.create(db=db, obj_in=stock_in)
            logger.info(f"已创建测试股票: {stock_data['symbol']}")
    
    # 为测试股票添加价格数据
    for stock_symbol in ["AAPL", "MSFT", "TSLA"]:
        # 获取30天的价格数据
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # 检查是否已有价格数据
        prices = crud.stock.get_stock_prices(db, stock_symbol=stock_symbol)
        if not prices:
            # 生成模拟价格数据
            current_date = start_date
            base_price = {"AAPL": 150.0, "MSFT": 300.0, "TSLA": 250.0}[stock_symbol]
            
            while current_date <= end_date:
                if current_date.weekday() < 5:  # 周一到周五
                    # 随机生成价格数据
                    import random
                    daily_change = random.uniform(-0.05, 0.05)  # -5% 到 +5%
                    
                    open_price = base_price * (1 + random.uniform(-0.01, 0.01))
                    close_price = open_price * (1 + daily_change)
                    high_price = max(open_price, close_price) * (1 + random.uniform(0, 0.02))
                    low_price = min(open_price, close_price) * (1 - random.uniform(0, 0.02))
                    volume = int(random.uniform(5000000, 50000000))
                    
                    # 更新基准价格
                    base_price = close_price
                    
                    # 创建价格对象
                    price_in = StockPriceCreate(
                        stock_symbol=stock_symbol,
                        date=current_date,
                        open=round(open_price, 2),
                        high=round(high_price, 2),
                        low=round(low_price, 2),
                        close=round(close_price, 2),
                        volume=volume
                    )
                    
                    crud.stock.create_stock_price(db=db, obj_in=price_in)
                
                current_date += timedelta(days=1)
            
            logger.info(f"已为 {stock_symbol} 创建测试价格数据")
    
    # 添加测试事件数据
    test_events = [
        {
            "title": "苹果发布iPhone 15系列",
            "description": "苹果公司宣布推出新一代iPhone 15系列，包括标准版和Pro版本，采用全新A17芯片。",
            "time": int(time.time()) - 86400 * 15,  # 15天前
            "level": 4,
            "stock_symbol": "AAPL",
            "source": "Apple 官方新闻",
            "url": "https://www.apple.com/newsroom/"
        },
        {
            "title": "苹果季度财报超预期",
            "description": "苹果公司公布2023年第三季度财报，营收和利润均超出分析师预期，主要得益于服务业务的增长。",
            "time": int(time.time()) - 86400 * 10,  # 10天前
            "level": 5,
            "stock_symbol": "AAPL",
            "source": "财报发布会",
            "url": "https://investor.apple.com/"
        },
        {
            "title": "微软扩大AI投资",
            "description": "微软宣布将在未来五年内向OpenAI追加投资100亿美元，进一步深化在人工智能领域的布局。",
            "time": int(time.time()) - 86400 * 12,  # 12天前
            "level": 4,
            "stock_symbol": "MSFT",
            "source": "微软官方博客",
            "url": "https://blogs.microsoft.com/"
        },
        {
            "title": "微软裁员10000人",
            "description": "微软宣布全球范围内裁员约10000人，以应对经济不确定性和调整业务重点。",
            "time": int(time.time()) - 86400 * 8,  # 8天前
            "level": 3,
            "stock_symbol": "MSFT",
            "source": "商业新闻",
            "url": "https://news.microsoft.com/"
        },
        {
            "title": "特斯拉交付量创新高",
            "description": "特斯拉第三季度汽车交付量达到46.6万辆，创历史新高，但略低于分析师预期的47万辆。",
            "time": int(time.time()) - 86400 * 5,  # 5天前
            "level": 4,
            "stock_symbol": "TSLA",
            "source": "特斯拉投资者关系",
            "url": "https://ir.tesla.com/"
        },
        {
            "title": "特斯拉降价",
            "description": "特斯拉在全球范围内下调Model 3和Model Y价格，以刺激需求，应对竞争加剧的电动车市场。",
            "time": int(time.time()) - 86400 * 2,  # 2天前
            "level": 3,
            "stock_symbol": "TSLA",
            "source": "市场新闻",
            "url": "https://www.tesla.com/blog"
        },
    ]
    
    # 检查并添加测试事件
    for event_data in test_events:
        # 查询是否有相同标题和时间的事件
        existing_events = crud.event.get_multi(
            db, 
            stock_symbol=event_data["stock_symbol"],
            start_time=event_data["time"],
            end_time=event_data["time"]
        )
        
        existing_event = next((e for e in existing_events if e.title == event_data["title"]), None)
        
        if not existing_event:
            event_in = EventCreate(**event_data)
            crud.event.create(db=db, obj_in=event_in)
            logger.info(f"已创建测试事件: {event_data['title']}")
    
    logger.info("数据库初始化完成") 
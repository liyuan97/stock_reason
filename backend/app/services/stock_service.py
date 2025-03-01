import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.stock import StockCreate, StockPriceCreate


logger = logging.getLogger(__name__)


class StockService:
    """股票数据服务，负责从外部API获取股票数据"""
    
    def __init__(self):
        self.base_url = settings.STOCK_API_BASE_URL
        
    async def get_stock_info(self, symbol: str) -> Dict[str, Any]:
        """获取股票基本信息"""
        try:
            async with httpx.AsyncClient() as client:
                # 这里使用Yahoo Finance API作为示例
                url = f"{self.base_url}/v7/finance/quote"
                params = {
                    "symbols": symbol
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                quote_response = data.get("quoteResponse", {})
                result = quote_response.get("result", [])
                
                if not result:
                    raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
                
                stock_data = result[0]
                
                # 提取需要的字段
                return {
                    "symbol": stock_data.get("symbol"),
                    "name": stock_data.get("longName") or stock_data.get("shortName"),
                    "market": stock_data.get("market") or stock_data.get("fullExchangeName", "UNKNOWN"),
                    "sector": stock_data.get("sector"),
                    "industry": stock_data.get("industry"),
                    "description": "",  # 需要从另一个API获取
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP错误：{e}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except httpx.RequestError as e:
            logger.error(f"请求错误：{e}")
            raise HTTPException(status_code=500, detail=f"请求错误：{str(e)}")
        except Exception as e:
            logger.error(f"获取股票信息时发生错误：{e}")
            raise HTTPException(status_code=500, detail=f"服务器错误：{str(e)}")
    
    async def get_stock_historical_prices(
        self, 
        symbol: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """获取股票历史价格数据"""
        try:
            # 默认获取过去1年的数据
            if not start_date:
                start_date = datetime.now() - timedelta(days=365)
            if not end_date:
                end_date = datetime.now()
                
            # 转换为Unix时间戳
            period1 = int(start_date.timestamp())
            period2 = int(end_date.timestamp())
            
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/v8/finance/chart/{symbol}"
                params = {
                    "period1": period1,
                    "period2": period2,
                    "interval": "1d",  # 日线数据
                    "includePrePost": "false"
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                chart = data.get("chart", {})
                result = chart.get("result", [])
                
                if not result:
                    return []
                
                # 提取价格数据
                timestamp = result[0].get("timestamp", [])
                indicators = result[0].get("indicators", {})
                quote = indicators.get("quote", [{}])[0]
                
                prices = []
                for i, ts in enumerate(timestamp):
                    # 确保有效数据
                    if (quote.get("open") and quote.get("high") and
                            quote.get("low") and quote.get("close") and
                            quote.get("volume") and
                            i < len(quote["open"]) and i < len(quote["high"]) and
                            i < len(quote["low"]) and i < len(quote["close"]) and
                            i < len(quote["volume"])):
                        
                        date = datetime.fromtimestamp(ts)
                        price = {
                            "stock_symbol": symbol,
                            "date": date,
                            "open": quote["open"][i],
                            "high": quote["high"][i],
                            "low": quote["low"][i],
                            "close": quote["close"][i],
                            "volume": quote["volume"][i]
                        }
                        prices.append(price)
                
                return prices
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP错误：{e}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except httpx.RequestError as e:
            logger.error(f"请求错误：{e}")
            raise HTTPException(status_code=500, detail=f"请求错误：{str(e)}")
        except Exception as e:
            logger.error(f"获取股票历史价格时发生错误：{e}")
            raise HTTPException(status_code=500, detail=f"服务器错误：{str(e)}")
    
    def create_stock_obj(self, stock_data: Dict[str, Any]) -> StockCreate:
        """根据API返回的数据创建股票对象"""
        return StockCreate(
            symbol=stock_data["symbol"],
            name=stock_data["name"],
            market=stock_data["market"],
            sector=stock_data.get("sector"),
            industry=stock_data.get("industry"),
            description=stock_data.get("description", "")
        )
    
    def create_price_objs(self, prices_data: List[Dict[str, Any]]) -> List[StockPriceCreate]:
        """根据API返回的数据创建股票价格对象列表"""
        return [StockPriceCreate(**price) for price in prices_data]


stock_service = StockService() 
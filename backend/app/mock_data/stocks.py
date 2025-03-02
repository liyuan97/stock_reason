import json
import os
from typing import List, Dict, Any, Optional

# File path for storing mock stock data
MOCK_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STOCKS_FILE = os.path.join(MOCK_DATA_DIR, "stocks.json")

# Ensure the mock data directory exists
os.makedirs(MOCK_DATA_DIR, exist_ok=True)

# Initialize with some sample data if file doesn't exist
SAMPLE_STOCKS = [
    {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "sector": "Technology",
        "industry": "Consumer Electronics",
        "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
    },
    {
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "sector": "Technology",
        "industry": "Software—Infrastructure",
        "description": "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide."
    },
    {
        "symbol": "AMZN",
        "name": "Amazon.com, Inc.",
        "sector": "Consumer Cyclical",
        "industry": "Internet Retail",
        "description": "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally."
    },
    {
        "symbol": "BABA",
        "name": "Alibaba Group Holding Limited",
        "sector": "Consumer Cyclical",
        "industry": "Internet Retail",
        "description": "Alibaba Group Holding Limited, through its subsidiaries, provides technology infrastructure and marketing reach to merchants, brands, retailers, and other businesses to engage with their users and customers in the People's Republic of China and internationally."
    },
    {
        "symbol": "TSLA",
        "name": "Tesla, Inc.",
        "sector": "Consumer Cyclical",
        "industry": "Auto Manufacturers",
        "description": "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally."
    }
]


def _ensure_stocks_file():
    """Ensure the stocks JSON file exists, create with sample data if not."""
    if not os.path.exists(STOCKS_FILE):
        with open(STOCKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(SAMPLE_STOCKS, f, ensure_ascii=False, indent=2)


def _load_stocks() -> List[Dict[str, Any]]:
    """Load stocks from the JSON file."""
    _ensure_stocks_file()
    with open(STOCKS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def _save_stocks(stocks: List[Dict[str, Any]]):
    """Save stocks to the JSON file."""
    with open(STOCKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(stocks, f, ensure_ascii=False, indent=2)


# CRUD operations for mock data
def get(symbol: str) -> Optional[Dict[str, Any]]:
    """Get a single stock by symbol."""
    stocks = _load_stocks()
    for stock in stocks:
        if stock["symbol"] == symbol:
            return stock
    return None


def get_multi(
    *,
    skip: int = 0,
    limit: int = 100,
    sector: Optional[str] = None,
    industry: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get multiple stocks with filters."""
    stocks = _load_stocks()
    filtered_stocks = []
    
    for stock in stocks:
        # Apply filters
        if sector and stock.get("sector") != sector:
            continue
        if industry and stock.get("industry") != industry:
            continue
        
        filtered_stocks.append(stock)
    
    # Sort by symbol
    filtered_stocks.sort(key=lambda x: x["symbol"])
    
    # Apply pagination
    paginated_stocks = filtered_stocks[skip:skip + limit]
    
    return paginated_stocks 
import json
import uuid
import os
import glob
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.schemas.event import EventCreate, EventUpdate, Event
from app.utils.time import get_current_unix_timestamp

# File path for storing mock event data
MOCK_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
EVENTS_FILE = os.path.join(MOCK_DATA_DIR, "events.json")
STOCKS_DIR = os.path.join(MOCK_DATA_DIR, "stocks")

# Ensure the mock data directory exists
os.makedirs(MOCK_DATA_DIR, exist_ok=True)
os.makedirs(STOCKS_DIR, exist_ok=True)

# Initialize with some sample data if file doesn't exist
SAMPLE_EVENTS = [
    {
        "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
        "title": "Q2财报发布",
        "description": "公司发布第二季度财报，净利润同比增长20%，超出市场预期。",
        "start_time": get_current_unix_timestamp() - 86400 * 7,  # 7 days ago
        "end_time": None,
        "level": 4,
        "stock_symbol": "AAPL",
        "sources": ["公司官网", "财经新闻"],
        "urls": ["https://example.com/news/1", "https://example.com/news/2"],
        "duration_type": "temporary",
        "category": "company",
        "impact": "positive",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "f1e2d3c4-b5a6-9876-5432-g1h2i3j4k5l6",
        "title": "新产品发布会",
        "description": "公司宣布将在下个月举行新产品发布会，预计将发布多款新产品。",
        "start_time": get_current_unix_timestamp() - 86400 * 3,  # 3 days ago
        "end_time": get_current_unix_timestamp() + 86400 * 14,  # 14 days in future
        "level": 3,
        "stock_symbol": "AAPL",
        "sources": ["公司官方微博", "科技博客"],
        "urls": ["https://example.com/tech/1"],
        "duration_type": "continuous",
        "category": "company",
        "impact": "positive",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "a9b8c7d6-e5f4-3210-g1h2-i3j4k5l6m7n8",
        "title": "行业竞争加剧",
        "description": "主要竞争对手推出同类产品，可能导致市场份额下降。",
        "start_time": get_current_unix_timestamp() - 86400 * 5,  # 5 days ago
        "end_time": None,
        "level": 2,
        "stock_symbol": "AAPL",
        "sources": ["行业分析报告", "竞争对手公告"],
        "urls": ["https://example.com/industry/1"],
        "duration_type": "continuous",
        "category": "industry",
        "impact": "negative",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6",
        "title": "宏观经济政策调整",
        "description": "央行宣布降息，可能对科技行业带来利好。",
        "start_time": get_current_unix_timestamp() - 86400 * 10,  # 10 days ago
        "end_time": None,
        "level": 3,
        "stock_symbol": "MSFT",
        "sources": ["央行公告", "财经分析"],
        "urls": ["https://example.com/economy/1"],
        "duration_type": "sudden",
        "category": "macroeconomic",
        "impact": "positive",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6",
        "title": "市场情绪波动",
        "description": "受国际形势影响，市场情绪出现波动，投资者谨慎观望。",
        "start_time": get_current_unix_timestamp() - 86400 * 2,  # 2 days ago
        "end_time": None,
        "level": 2,
        "stock_symbol": "MSFT",
        "sources": ["市场分析", "投资者情绪调查"],
        "urls": ["https://example.com/market/1"],
        "duration_type": "temporary",
        "category": "market_sentiment",
        "impact": "neutral",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]


def _ensure_events_file():
    """Ensure the events JSON file exists, create with sample data if not."""
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(SAMPLE_EVENTS, f, ensure_ascii=False, indent=2)


def _get_stock_file_path(stock_symbol: str) -> str:
    """Get the file path for a specific stock's events."""
    return os.path.join(STOCKS_DIR, f"{stock_symbol}.json")


def _load_events() -> List[Dict[str, Any]]:
    """Load events from all files including the main events file and individual stock files."""
    events = []
    
    # First try to load from individual stock files
    stock_files = glob.glob(os.path.join(STOCKS_DIR, "*.json"))
    if stock_files:
        for stock_file in stock_files:
            try:
                with open(stock_file, 'r', encoding='utf-8') as f:
                    stock_events = json.load(f)
                    events.extend(stock_events)
            except (json.JSONDecodeError, FileNotFoundError):
                # Skip files with errors
                continue
    else:
        # Fallback to the main events file for backward compatibility
        _ensure_events_file()
        try:
            with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
                events = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            # Return empty list if file has errors
            return []
    
    return events


def _load_events_by_stock(stock_symbol: str) -> List[Dict[str, Any]]:
    """Load events for a specific stock."""
    stock_file = _get_stock_file_path(stock_symbol)
    
    if os.path.exists(stock_file):
        # Load from the specific stock file
        try:
            with open(stock_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            pass
    
    # If no stock-specific file exists or there was an error, 
    # fall back to filtering from all events
    return [event for event in _load_events() if event["stock_symbol"] == stock_symbol]


def _save_events(events: List[Dict[str, Any]]):
    """Save events to files organized by stock symbol."""
    # Group events by stock symbol
    events_by_stock = {}
    for event in events:
        stock_symbol = event["stock_symbol"]
        if stock_symbol not in events_by_stock:
            events_by_stock[stock_symbol] = []
        events_by_stock[stock_symbol].append(event)
    
    # Save each stock's events to its own file
    for stock_symbol, stock_events in events_by_stock.items():
        stock_file = _get_stock_file_path(stock_symbol)
        with open(stock_file, 'w', encoding='utf-8') as f:
            json.dump(stock_events, f, ensure_ascii=False, indent=2)


def _convert_to_schema(event_data: Dict[str, Any]) -> Event:
    """Convert raw event data to Pydantic model."""
    # Convert ISO format strings to datetime objects for created_at and updated_at
    if isinstance(event_data.get("created_at"), str):
        event_data["created_at"] = datetime.fromisoformat(event_data["created_at"])
    if isinstance(event_data.get("updated_at"), str):
        event_data["updated_at"] = datetime.fromisoformat(event_data["updated_at"])
    
    return Event(**event_data)


# CRUD operations for mock data
def get(event_id: str) -> Optional[Event]:
    """Get a single event by ID."""
    events = _load_events()
    for event in events:
        if event["id"] == event_id:
            return _convert_to_schema(event)
    return None


def get_multi(
    *,
    skip: int = 0,
    limit: int = 100,
    stock_symbol: Optional[str] = None,
    min_level: Optional[int] = None,
    max_level: Optional[int] = None,
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
    duration_type: Optional[str] = None,
    category: Optional[str] = None,
    impact: Optional[str] = None
) -> List[Event]:
    """Get multiple events with filters."""
    # If stock symbol is provided, load only that stock's events for better performance
    if stock_symbol:
        events = _load_events_by_stock(stock_symbol)
    else:
        events = _load_events()
    
    filtered_events = []
    
    for event in events:
        # Skip filtering by stock_symbol if we've already loaded only that stock's events
        if stock_symbol and stock_symbol != event["stock_symbol"]:
            continue
        if min_level is not None and event["level"] < min_level:
            continue
        if max_level is not None and event["level"] > max_level:
            continue
        if start_time is not None and event["start_time"] < start_time:
            continue
        if end_time is not None and event["start_time"] > end_time:
            continue
        if duration_type is not None and event["duration_type"] != duration_type:
            continue
        if category is not None and event["category"] != category:
            continue
        if impact is not None and event.get("impact") != impact:
            continue
        
        filtered_events.append(event)
    
    # Sort by start_time descending
    filtered_events.sort(key=lambda x: x["start_time"], reverse=True)
    
    # Apply pagination
    paginated_events = filtered_events[skip:skip + limit]
    
    # Convert to Pydantic models
    return [_convert_to_schema(event) for event in paginated_events]


def get_by_stock_symbol(stock_symbol: str) -> List[Event]:
    """获取特定股票的所有事件"""
    return get_multi(stock_symbol=stock_symbol)


def get_by_time_range(start_time: int, end_time: int) -> List[Event]:
    """获取指定时间范围内的所有事件"""
    return get_multi(start_time=start_time, end_time=end_time)


def create(*, obj_in: EventCreate) -> Event:
    """Create a new event."""
    events = _load_events()
    
    # Convert Pydantic model to dict
    event_data = obj_in.model_dump()
    
    # Add metadata
    event_id = str(uuid.uuid4())
    now = datetime.now()
    
    new_event = {
        "id": event_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        **event_data
    }
    
    events.append(new_event)
    _save_events(events)
    
    return _convert_to_schema(new_event)


def update(*, event_id: str, obj_in: EventUpdate) -> Optional[Event]:
    """Update an existing event."""
    events = _load_events()
    updated_event = None
    
    for i, event in enumerate(events):
        if event["id"] == event_id:
            # Convert Pydantic model to dict, filtering out None values
            update_data = {k: v for k, v in obj_in.model_dump(exclude_unset=True).items() if v is not None}
            
            # Update the event
            events[i].update(update_data)
            events[i]["updated_at"] = datetime.now().isoformat()
            
            updated_event = events[i]
            break
    
    if updated_event:
        _save_events(events)
        return _convert_to_schema(updated_event)
    
    return None


def remove(*, event_id: str) -> Optional[Event]:
    """Remove an event."""
    events = _load_events()
    removed_event = None
    
    for i, event in enumerate(events):
        if event["id"] == event_id:
            removed_event = events.pop(i)
            break
    
    if removed_event:
        _save_events(events)
        return _convert_to_schema(removed_event)
    
    return None 
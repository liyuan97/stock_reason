import time
from datetime import datetime, timezone


def get_current_unix_timestamp() -> int:
    """
    获取当前的Unix时间戳（秒级）
    
    Returns:
        int: 当前时间的Unix时间戳（秒）
    """
    return int(time.time())


def unix_timestamp_to_datetime(timestamp: int) -> datetime:
    """
    将Unix时间戳转换为datetime对象
    
    Args:
        timestamp (int): Unix时间戳（秒）
        
    Returns:
        datetime: 对应的datetime对象（UTC时区）
    """
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)


def datetime_to_unix_timestamp(dt: datetime) -> int:
    """
    将datetime对象转换为Unix时间戳
    
    Args:
        dt (datetime): 要转换的datetime对象
        
    Returns:
        int: 对应的Unix时间戳（秒）
    """
    return int(dt.timestamp())


def format_timestamp(timestamp: int, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    将Unix时间戳格式化为指定格式的字符串
    
    Args:
        timestamp (int): Unix时间戳（秒）
        format_str (str, optional): 输出的日期格式. 默认为 "%Y-%m-%d %H:%M:%S".
        
    Returns:
        str: 格式化后的日期字符串
    """
    dt = unix_timestamp_to_datetime(timestamp)
    return dt.strftime(format_str) 
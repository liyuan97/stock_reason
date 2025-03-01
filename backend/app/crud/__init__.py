from app.crud.event import get as get_event
from app.crud.event import get_multi as get_multi_events
from app.crud.event import create as create_event
from app.crud.event import update as update_event
from app.crud.event import remove as remove_event

from app.crud.stock import get as get_stock
from app.crud.stock import get_multi as get_multi_stocks
from app.crud.stock import create as create_stock
from app.crud.stock import update as update_stock
from app.crud.stock import remove as remove_stock
from app.crud.stock import get_stock_prices
from app.crud.stock import create_stock_price
from app.crud.stock import batch_create_stock_prices

# 为便于引用，创建子模块
event = __import__('app.crud.event', fromlist=['*'])
stock = __import__('app.crud.stock', fromlist=['*']) 
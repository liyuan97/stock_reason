from app.crud.event import get as get_event
from app.crud.event import get_multi as get_multi_events
from app.crud.event import create as create_event
from app.crud.event import update as update_event
from app.crud.event import remove as remove_event

# 为便于引用，创建子模块
event = __import__('app.crud.event', fromlist=['*'])

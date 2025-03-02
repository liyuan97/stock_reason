#!/usr/bin/env python3
import json
import os

# 读取原始events.json文件
events_file = os.path.join(os.path.dirname(__file__), 'data', 'events.json')
stocks_dir = os.path.join(os.path.dirname(__file__), 'data', 'stocks')

# 确保目标目录存在
os.makedirs(stocks_dir, exist_ok=True)

# 读取所有事件
with open(events_file, 'r', encoding='utf-8') as f:
    events = json.load(f)

# 按股票符号分组
events_by_stock = {}
for event in events:
    stock_symbol = event['stock_symbol']
    if stock_symbol not in events_by_stock:
        events_by_stock[stock_symbol] = []
    events_by_stock[stock_symbol].append(event)

# 保存到单独的文件
for stock_symbol, stock_events in events_by_stock.items():
    stock_file = os.path.join(stocks_dir, f'{stock_symbol}.json')
    with open(stock_file, 'w', encoding='utf-8') as f:
        json.dump(stock_events, f, ensure_ascii=False, indent=2)
    print(f'已创建 {stock_file}，包含 {len(stock_events)} 个事件')

print(f'总共创建了 {len(events_by_stock)} 个股票文件') 
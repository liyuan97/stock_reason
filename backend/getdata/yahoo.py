import yfinance as yf
import pandas as pd
from datetime import datetime

# 定义股票选项
STOCK_OPTIONS = [
    { 'symbol': 'AAPL', 'name': '苹果公司' },
    { 'symbol': 'MSFT', 'name': '微软公司' },
    { 'symbol': 'GOOGL', 'name': '谷歌公司' },
    { 'symbol': 'AMZN', 'name': '亚马逊公司' },
    { 'symbol': 'TSLA', 'name': '特斯拉公司' },
    { 'symbol': 'BABA', 'name': '阿里巴巴' }
]

# 设置时间范围（当前日期为 2025-03-01，获取过去一年数据）
start_date = "2021-03-01"
end_date = "2025-03-01"

# 遍历股票并下载数据
for stock in STOCK_OPTIONS:
    symbol = stock['symbol']
    name = stock['name']
    print(f"正在下载 {name} ({symbol}) 的数据...")
    
    try:
        # 下载股票数据
        stock_data = yf.download(symbol, start=start_date, end=end_date)
        
        # 检查是否成功获取数据
        if not stock_data.empty:
            # 保存到 CSV 文件，文件名包含股票代码
            filename = f"data/{symbol}_stock_data.csv"
            stock_data.to_csv(filename)
            print(f"{name} ({symbol}) 数据已保存到 {filename}")
            
            # 打印前几行数据（可选）
            print(stock_data.head())
            print("\n")
        else:
            print(f"无法获取 {name} ({symbol}) 的数据，可能是日期范围无效或股票代码错误。")
            
    except Exception as e:
        print(f"下载 {name} ({symbol}) 时出错: {e}")

print("所有股票数据下载完成！")
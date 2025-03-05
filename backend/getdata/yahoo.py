import yfinance as yf
import pandas as pd
from datetime import datetime

# Define stock options
STOCK_OPTIONS = [
    { 'symbol': 'AAPL', 'name': 'Apple Inc.' },
    { 'symbol': 'MSFT', 'name': 'Microsoft Corporation' },
    { 'symbol': 'GOOGL', 'name': 'Google (Alphabet Inc.)' },
    { 'symbol': 'AMZN', 'name': 'Amazon.com Inc.' },
    { 'symbol': 'TSLA', 'name': 'Tesla Inc.' },
    { 'symbol': 'BABA', 'name': 'Alibaba Group Holding Ltd.' }
]

# Set time range (current date is 2025-03-01, get data for the past year)
start_date = "2021-03-01"
end_date = "2025-03-01"

# Iterate through stocks and download data
for stock in STOCK_OPTIONS:
    symbol = stock['symbol']
    name = stock['name']
    print(f"Downloading data for {name} ({symbol})...")
    
    try:
        # Download stock data
        stock_data = yf.download(symbol, start=start_date, end=end_date)
        
        # Check if data was successfully retrieved
        if not stock_data.empty:
            # Save to CSV file with stock code in filename
            filename = f"data/{symbol}_stock_data.csv"
            stock_data.to_csv(filename)
            print(f"{name} ({symbol}) data saved to {filename}")
            
            # Print first few rows (optional)
            print(stock_data.head())
            print("\n")
        else:
            print(f"Unable to get data for {name} ({symbol}), possibly due to invalid date range or stock code.")
            
    except Exception as e:
        print(f"Error while downloading {name} ({symbol}): {e}")

print("All stock data download completed!")
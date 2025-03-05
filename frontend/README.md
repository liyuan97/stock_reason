# Stock Event Tracking System - Frontend

This is the frontend part of the Stock Event Tracking System, developed with React + TypeScript, using TradingView Lightweight Charts to display professional-level financial charts.

## Features

1. **Stock Candlestick Chart Display**
   - Display professional candlestick charts using TradingView Lightweight Charts
   - Support for zooming and panning
   - Real-time response to window size changes

2. **Event Marking and Display**
   - Display level 1-5 event markers with different colors on the chart
   - Click markers to view event details
   - Filter events by level

3. **Stock Search**
   - Search different stocks by entering stock codes
   - Support for fuzzy search

4. **Event Timeline**
   - Display all related events grouped by date
   - Click events to jump to corresponding details
   - Highlight currently selected event

## Project Structure

```
frontend/
├── public/             # Static resources
├── src/
│   ├── components/     # React components
│   │   ├── Chart/      # Chart-related components
│   │   ├── EventMarker/# Event marker components
│   │   ├── Timeline/   # Timeline components
│   │   └── StockSearch/# Search components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── styles/         # CSS styles
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Entry file
├── package.json        # Dependency configuration
└── tsconfig.json       # TypeScript configuration
```

## Development Environment Setup

1. Install dependencies
```bash
npm install
```

2. Start development server
```bash
npm start
```

3. Build production version
```bash
npm run build
```

## Data Models

### StockData
Contains basic stock information, price data, and related events

### StockPrice
Contains stock OHLC (Open, High, Low, Close) price data

### StockEvent
Contains event title, description, time, importance level, and other information

## API Interfaces

Currently using mock data, will connect to backend API in the future:

- `getStockData(symbol)`: Get stock data
- `filterEvents(symbol, level)`: Filter events by level
- `searchStocks(query)`: Search stocks

## Technology Stack

- React 18
- TypeScript 4
- TradingView Lightweight Charts
- Axios
- React Hooks
- CSS3 

## Project Completion Status

The following features have been completed:

1. Basic project structure setup
2. Type definition design
3. Mock data generation
4. Candlestick chart component
5. Event marking and detail components
6. Event timeline component
7. Stock search component
8. Filtering and categorization functionality
9. Styling and UI design

## Next Steps

1. Connect to real backend API
2. Implement more interactive features
3. Optimize performance and user experience
4. Add more data display features
5. Add unit tests 
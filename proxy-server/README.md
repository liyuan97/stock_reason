# Yahoo Finance API Proxy Server

This is a simple Node.js proxy server designed to solve CORS (Cross-Origin Resource Sharing) issues when accessing the Yahoo Finance API from frontend applications.

## Features

- Proxy Yahoo Finance chart API requests
- Proxy Yahoo Finance search API requests
- Handle errors and provide detailed error information
- Support custom request parameters

## Installation

```bash
# Install dependencies
npm install

# Install development dependencies (optional)
npm install --save-dev nodemon
```

## Usage

```bash
# Start the proxy server
npm start

# Development mode (auto-restarts on code changes)
npm run dev
```

The server will start on port 3001 by default (configurable in .env file).

## API Endpoints

### 1. Stock Chart Data

```
GET /api/chart/:symbol
```

Parameters:
- `symbol`: Stock symbol (e.g., AAPL, MSFT, GOOGL)
- `interval`: Data interval (e.g., 1d, 1wk, 1mo) - optional
- `range`: Data range (e.g., 1mo, 3mo, 6mo, 1y, 5y, max) - optional

Example:
```
http://localhost:3001/api/chart/AAPL?interval=1d&range=1y
```

### 2. Stock Search

```
GET /api/search
```

Parameters:
- `query`: Search term

Example:
```
http://localhost:3001/api/search?query=apple
```

### 3. Health Check

```
GET /health
```

Returns server status and current timestamp.

## Error Handling

The server handles and returns appropriate error messages for:
- Invalid requests
- Yahoo Finance API errors
- Network issues

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
YAHOO_FINANCE_BASE_URL=https://query1.finance.yahoo.com
```

## License

MIT 
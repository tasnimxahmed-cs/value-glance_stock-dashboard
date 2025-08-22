// API Configuration
export const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
export const BASE_URL = 'https://finnhub.io/api/v1';
export const REQUEST_DELAY = 100; // ms between requests to avoid rate limiting
export const API_RETRY_COUNT = 3;
export const API_TIMEOUT = 10000; // 10 seconds

// Default Stock Symbols
export const DEFAULT_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 
  'AMZN', 'META', 'NVDA', 'NFLX'
];

// Chart Configuration
export const CHART_DAYS = 30;
export const CHART_COLORS = {
  primary: 'rgb(59, 130, 246)',
  primaryAlpha: 'rgba(59, 130, 246, 0.1)',
  success: 'rgb(34, 197, 94)',
  danger: 'rgb(239, 68, 68)',
  warning: 'rgb(245, 158, 11)',
} as const;

// UI Configuration
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key not found. Please add REACT_APP_FINNHUB_API_KEY to your .env file',
  FETCH_FAILED: 'Failed to fetch stock data. Please check your connection and try again.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait a moment before trying again.',
  INVALID_SYMBOL: 'Invalid stock symbol. Please enter a valid symbol.',
} as const;

// Demo data for when API key is missing
export const DEMO_STOCKS = [
  { symbol: 'AAPL', price: 175.43, change: 2.15, changePercent: 1.24, previousClose: 173.28, high: 176.50, low: 172.80, open: 173.50, volume: 45678900 },
  { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.85, previousClose: 143.79, high: 144.20, low: 141.90, open: 143.20, volume: 23456700 },
  { symbol: 'MSFT', price: 378.85, change: 5.67, changePercent: 1.52, previousClose: 373.18, high: 380.10, low: 372.50, open: 373.80, volume: 34567800 },
  { symbol: 'TSLA', price: 248.42, change: -3.28, changePercent: -1.30, previousClose: 251.70, high: 253.40, low: 247.20, open: 251.90, volume: 56789000 },
  { symbol: 'AMZN', price: 155.58, change: 1.45, changePercent: 0.94, previousClose: 154.13, high: 156.80, low: 153.70, open: 154.50, volume: 67890100 },
  { symbol: 'META', price: 485.09, change: 8.76, changePercent: 1.84, previousClose: 476.33, high: 487.20, low: 475.60, open: 476.80, volume: 45678900 },
  { symbol: 'NVDA', price: 875.28, change: 12.45, changePercent: 1.44, previousClose: 862.83, high: 878.90, low: 860.40, open: 863.20, volume: 34567800 },
  { symbol: 'NFLX', price: 612.04, change: -2.18, changePercent: -0.35, previousClose: 614.22, high: 615.60, low: 610.80, open: 614.50, volume: 23456700 },
];

export const DEMO_PROFILES = new Map([
  ['AAPL', { symbol: 'AAPL', name: 'Apple Inc.', marketCapitalization: 2750000000000, shareOutstanding: 15600000000 }],
  ['GOOGL', { symbol: 'GOOGL', name: 'Alphabet Inc.', marketCapitalization: 1850000000000, shareOutstanding: 12500000000 }],
  ['MSFT', { symbol: 'MSFT', name: 'Microsoft Corporation', marketCapitalization: 2800000000000, shareOutstanding: 7400000000 }],
  ['TSLA', { symbol: 'TSLA', name: 'Tesla, Inc.', marketCapitalization: 790000000000, shareOutstanding: 3200000000 }],
  ['AMZN', { symbol: 'AMZN', name: 'Amazon.com, Inc.', marketCapitalization: 1600000000000, shareOutstanding: 10300000000 }],
  ['META', { symbol: 'META', name: 'Meta Platforms, Inc.', marketCapitalization: 1230000000000, shareOutstanding: 2540000000 }],
  ['NVDA', { symbol: 'NVDA', name: 'NVIDIA Corporation', marketCapitalization: 2150000000000, shareOutstanding: 2460000000 }],
  ['NFLX', { symbol: 'NFLX', name: 'Netflix, Inc.', marketCapitalization: 270000000000, shareOutstanding: 441000000 }],
]);
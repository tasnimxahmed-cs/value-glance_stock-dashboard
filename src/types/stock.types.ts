export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  prices: Array<{ date: string; price: number }>;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
  logo?: string;
}

export type SortField = 'symbol' | 'price' | 'change';
export type SortDirection = 'asc' | 'desc';

export interface APIErrorData {
  status?: number;
  code?: string;
}

export class APIError extends Error implements APIErrorData {
  status?: number;
  code?: string;

  constructor(message: string, options?: APIErrorData) {
    super(message);
    this.name = 'APIError';
    this.status = options?.status;
    this.code = options?.code;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}
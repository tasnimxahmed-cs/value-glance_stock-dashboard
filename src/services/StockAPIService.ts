import { StockQuote, CompanyProfile, HistoricalData, APIError } from '../types/stock.types';
import { 
  FINNHUB_API_KEY, 
  BASE_URL, 
  API_RETRY_COUNT, 
  API_TIMEOUT,
  CHART_DAYS,
  ERROR_MESSAGES 
} from '../utils/constants';
import { sleep } from '../utils/formatters';

/**
 * Service class for handling all stock API interactions
 * Implements retry logic, rate limiting, and error handling
 */
export class StockAPIService {
  /**
   * Generic fetch method with retry logic and error handling
   */
  private static async fetchWithRetry(
    url: string, 
    retries = API_RETRY_COUNT, 
    signal?: AbortSignal
  ): Promise<any> {
    if (!FINNHUB_API_KEY) {
      throw new APIError(ERROR_MESSAGES.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Combine external signal with timeout
    const combinedSignal = signal || controller.signal;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(
          `${url}&token=${FINNHUB_API_KEY}`, 
          { signal: combinedSignal }
        );
        
        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          if (attempt < retries - 1) {
            await sleep(1000 * (attempt + 1)); // Exponential backoff
            continue;
          }
          throw new APIError(ERROR_MESSAGES.RATE_LIMIT);
        }
        
        // Handle other HTTP errors
        if (!response.ok) {
          const error = new APIError(`API request failed: ${response.status}`);
          error.status = response.status;
          throw error;
        }
        
        const data = await response.json();
        return data;

      } catch (err: any) {
        clearTimeout(timeoutId);
        
        // Don't retry on abort
        if (err.name === 'AbortError') {
          throw err;
        }
        
        // Last attempt - throw the error
        if (attempt === retries - 1) {
          if (err instanceof APIError) {
            throw err;
          }
          throw new APIError(ERROR_MESSAGES.FETCH_FAILED);
        }
        
        // Wait before retry
        await sleep(1000);
      }
    }
  }

  /**
   * Fetch current stock quote
   */
  static async getStockQuote(symbol: string, signal?: AbortSignal): Promise<StockQuote> {
    try {
      const data = await this.fetchWithRetry(
        `${BASE_URL}/quote?symbol=${symbol}`, 
        API_RETRY_COUNT, 
        signal
      );
      
      // Validate response data
      if (typeof data.c !== 'number' || data.c <= 0) {
        throw new APIError(`Invalid data for symbol ${symbol}`);
      }

      return {
        symbol,
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        previousClose: data.pc || 0,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
        volume: data.v || 0,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch company profile information
   */
  static async getCompanyProfile(symbol: string, signal?: AbortSignal): Promise<CompanyProfile> {
    try {
      const data = await this.fetchWithRetry(
        `${BASE_URL}/stock/profile2?symbol=${symbol}`, 
        API_RETRY_COUNT, 
        signal
      );
      
      return {
        symbol,
        name: data.name || symbol,
        marketCapitalization: data.marketCapitalization,
        shareOutstanding: data.shareOutstanding,
        logo: data.logo,
      };
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      
      // Return minimal profile on error
      return {
        symbol,
        name: symbol,
      };
    }
  }

  /**
   * Fetch historical stock data for charting
   * Note: Free tier has limited historical data access
   */
  static async getHistoricalData(symbol: string, signal?: AbortSignal): Promise<HistoricalData> {
    try {
      // Try multiple approaches for free tier compatibility
      const toDate = Math.floor(Date.now() / 1000);
      
      // First try: 1-day resolution for last 7 days (most likely to work in free tier)
      try {
        const fromDate = toDate - (7 * 24 * 60 * 60);
        const data = await this.fetchWithRetry(
          `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=1&from=${fromDate}&to=${toDate}`,
          1, // Only 1 retry for this attempt
          signal
        );
        
        if (data.s !== 'no_data' && data.c && data.c.length > 0) {
          const prices = data.c.map((price: number, index: number) => ({
            date: new Date(data.t[index] * 1000).toISOString().split('T')[0],
            price: Number(price.toFixed(2)),
          }));
          return { symbol, prices };
        }
      } catch (e) {
        console.log(`First attempt failed for ${symbol}, trying alternative...`);
      }
      
      // Second try: Daily resolution for last 5 days
      try {
        const fromDate = toDate - (5 * 24 * 60 * 60);
        const data = await this.fetchWithRetry(
          `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${fromDate}&to=${toDate}`,
          1,
          signal
        );
        
        if (data.s !== 'no_data' && data.c && data.c.length > 0) {
          const prices = data.c.map((price: number, index: number) => ({
            date: new Date(data.t[index] * 1000).toISOString().split('T')[0],
            price: Number(price.toFixed(2)),
          }));
          return { symbol, prices };
        }
      } catch (e) {
        console.log(`Second attempt failed for ${symbol}, giving up...`);
      }
      
      console.warn(`No historical data available for ${symbol} from Finnhub API (free tier limitation)`);
      return { symbol, prices: [] };
      
    } catch (error: any) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      
      // If it's a 403 error, it means historical data is not available in free tier
      if (error.status === 403) {
        console.warn(`Historical data not available for ${symbol} in free tier. Upgrade to paid plan for full access.`);
      }
      
      return { symbol, prices: [] };
    }
  }

  /**
   * Fetch multiple stock quotes with rate limiting
   */
  static async getBatchStockQuotes(
    symbols: string[], 
    signal?: AbortSignal,
    delayMs = 100
  ): Promise<StockQuote[]> {
    const results: StockQuote[] = [];
    
    for (let i = 0; i < symbols.length; i++) {
      try {
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await sleep(delayMs);
        }
        
        const quote = await this.getStockQuote(symbols[i], signal);
        
        // Only include valid quotes
        if (quote.price > 0) {
          results.push(quote);
        }
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbols[i]}:`, error);
        // Continue with other symbols
      }
    }
    
    return results;
  }

  /**
   * Fetch multiple company profiles with rate limiting
   */
  static async getBatchCompanyProfiles(
    symbols: string[], 
    signal?: AbortSignal,
    delayMs = 100
  ): Promise<Map<string, CompanyProfile>> {
    const profiles = new Map<string, CompanyProfile>();
    
    for (let i = 0; i < symbols.length; i++) {
      try {
        // Add delay between requests
        if (i > 0) {
          await sleep(delayMs);
        }
        
        const profile = await this.getCompanyProfile(symbols[i], signal);
        profiles.set(symbols[i], profile);
      } catch (error) {
        console.error(`Failed to fetch profile for ${symbols[i]}:`, error);
        // Add minimal profile
        profiles.set(symbols[i], { symbol: symbols[i], name: symbols[i] });
      }
    }
    
    return profiles;
  }

  /**
   * Validate if a symbol exists by checking if we can fetch its quote
   */
  static async validateSymbol(symbol: string, signal?: AbortSignal): Promise<boolean> {
    try {
      const quote = await this.getStockQuote(symbol, signal);
      return quote.price > 0;
    } catch {
      return false;
    }
  }
}

export default StockAPIService;
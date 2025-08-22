import { useState, useEffect, useCallback, useRef } from 'react';
import { StockQuote, CompanyProfile } from '../types/stock.types';
import StockAPIService from '../services/StockAPIService';
import { REQUEST_DELAY, FINNHUB_API_KEY, DEMO_STOCKS, DEMO_PROFILES } from '../utils/constants';

interface UseStockDataOptions {
  symbols: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseStockDataReturn {
  stocks: StockQuote[];
  profiles: Map<string, CompanyProfile>;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchStockData: () => Promise<void>;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
}

export const useStockData = ({
  symbols,
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
}: UseStockDataOptions): UseStockDataReturn => {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [profiles, setProfiles] = useState<Map<string, CompanyProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trackedSymbols, setTrackedSymbols] = useState<string[]>(symbols);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStockData = useCallback(async () => {
    try {
      setError(null);
      
      // If no API key, use demo data
      if (!FINNHUB_API_KEY) {
        const demoStocks = DEMO_STOCKS.filter(stock => 
          trackedSymbols.includes(stock.symbol)
        );
        setStocks(demoStocks);
        
        const demoProfiles = new Map();
        trackedSymbols.forEach(symbol => {
          const profile = DEMO_PROFILES.get(symbol);
          if (profile) {
            demoProfiles.set(symbol, profile);
          }
        });
        setProfiles(demoProfiles);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      // Fetch stock quotes
      const stockResults = await StockAPIService.getBatchStockQuotes(
        trackedSymbols,
        abortControllerRef.current.signal,
        REQUEST_DELAY
      );
      
      // Only include valid stocks
      const validStocks = stockResults.filter(stock => stock.price > 0);
      setStocks(validStocks);
      
      // Fetch company profiles for valid stocks
      const profileResults = await StockAPIService.getBatchCompanyProfiles(
        validStocks.map(s => s.symbol),
        abortControllerRef.current.signal,
        REQUEST_DELAY
      );
      
      setProfiles(profileResults);
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Don't show 403 errors as user-facing errors since they're API limitations
        if (err.status !== 403) {
          setError(err.message || 'Failed to fetch stock data');
        }
        console.error('Error in useStockData:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trackedSymbols]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStockData();
  }, [fetchStockData]);

  const addSymbol = useCallback((symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase().trim();
    if (normalizedSymbol && !trackedSymbols.includes(normalizedSymbol)) {
      setTrackedSymbols(prev => [...prev, normalizedSymbol]);
    }
  }, [trackedSymbols]);

  const removeSymbol = useCallback((symbol: string) => {
    setTrackedSymbols(prev => prev.filter(s => s !== symbol));
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(handleRefresh, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, handleRefresh]);

  // Initial data fetch and cleanup
  useEffect(() => {
    fetchStockData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchStockData]);

  // Update tracked symbols when props change
  useEffect(() => {
    setTrackedSymbols(symbols);
  }, [symbols]);

  return {
    stocks,
    profiles,
    loading,
    error,
    refreshing,
    fetchStockData: handleRefresh,
    addSymbol,
    removeSymbol
  };
};

export default useStockData;
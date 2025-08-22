import { useState, useEffect, useCallback, useRef } from 'react';
import { HistoricalData } from '../types/stock.types';
import StockAPIService from '../services/StockAPIService';
import { FINNHUB_API_KEY } from '../utils/constants';

interface UseChartDataOptions {
  symbol: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseChartDataReturn {
  chartData: HistoricalData | null;
  loading: boolean;
  error: string | null;
  isDemoData: boolean;
  fetchChartData: (symbol: string) => Promise<void>;
  clearData: () => void;
}

// Generate demo chart data
const generateDemoChartData = (symbol: string): HistoricalData => {
  const prices = [];
  
  // Use consistent base prices for demo symbols to make them look realistic
  const demoPrices: { [key: string]: number } = {
    'AAPL': 175,
    'GOOGL': 142,
    'MSFT': 378,
    'TSLA': 248,
    'AMZN': 155,
    'META': 485,
    'NVDA': 875,
    'NFLX': 612
  };
  
  const basePrice = demoPrices[symbol] || (100 + Math.random() * 200);
  const volatility = 0.015; // 1.5% daily volatility for more realistic movement
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movement with trend
    const trend = Math.sin(i * 0.2) * 0.01; // Add some trend
    const randomChange = (Math.random() - 0.5) * volatility;
    const totalChange = trend + randomChange;
    const price = basePrice * (1 + totalChange);
    
    prices.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2))
    });
  }
  
  return { symbol, prices };
};

export const useChartData = ({
  symbol,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseChartDataOptions): UseChartDataReturn => {
  const [chartData, setChartData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSymbolRef = useRef<string | null>(null);

  const fetchChartData = useCallback(async (targetSymbol: string) => {
    if (!targetSymbol) return;

    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      currentSymbolRef.current = targetSymbol;
      
             // If no API key, use demo data
       if (!FINNHUB_API_KEY) {
         // Simulate API delay
         await new Promise(resolve => setTimeout(resolve, 500));
         
         if (currentSymbolRef.current === targetSymbol) {
           const demoData = generateDemoChartData(targetSymbol);
           setChartData(demoData);
           setIsDemoData(true);
           setLoading(false);
         }
         return;
       }
      
      const data = await StockAPIService.getHistoricalData(
        targetSymbol,
        abortControllerRef.current.signal
      );
      
      console.log('Chart data received for', targetSymbol, data); // Debug log
      
             // Only set data if this is still the current symbol
       if (currentSymbolRef.current === targetSymbol) {
         // If no data from API, fallback to demo data for testing
         if (!data.prices || data.prices.length === 0) {
           console.warn(`No historical data available for ${targetSymbol}, using demo data`);
           const fallbackData = generateDemoChartData(targetSymbol);
           setChartData(fallbackData);
           setIsDemoData(true);
           setError(`Limited historical data available for ${targetSymbol}`);
         } else {
           setChartData(data);
           setIsDemoData(false);
         }
       }
      
    } catch (err: any) {
      if (err.name !== 'AbortError' && currentSymbolRef.current === targetSymbol) {
        // Handle 403 errors (API limitations) gracefully
        if (err.status === 403) {
          console.warn(`Historical data not available for ${targetSymbol} in free tier`);
          setError(`Historical data requires paid plan for ${targetSymbol}`);
        } else {
          setError(err.message || 'Failed to fetch chart data');
        }
        setChartData({ symbol: targetSymbol, prices: [] });
      }
    } finally {
      if (currentSymbolRef.current === targetSymbol) {
        setLoading(false);
      }
    }
  }, []);

  const clearData = useCallback(() => {
    setChartData(null);
    setError(null);
    setLoading(false);
    setIsDemoData(false);
    currentSymbolRef.current = null;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Handle symbol changes
  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    } else {
      clearData();
    }
  }, [symbol, fetchChartData, clearData]);

  // Setup auto-refresh for chart data
  useEffect(() => {
    if (autoRefresh && symbol && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (symbol) {
          fetchChartData(symbol);
        }
      }, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, symbol, refreshInterval, fetchChartData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    chartData,
    loading,
    error,
    isDemoData,
    fetchChartData,
    clearData
  };
};

export default useChartData;
/**
 * Utility functions for formatting data display
 */

/**
 * Format number as currency with $ symbol
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

/**
 * Format large numbers with locale-specific separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format market capitalization in billions
 */
export const formatMarketCap = (value: number): string => {
  const billions = value / 1000;
  return `$${billions.toFixed(2)}B`;
};

/**
 * Format percentage change with sign
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format volume with K/M/B suffixes
 */
export const formatVolume = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Validate stock symbol format
 */
export const isValidSymbol = (symbol: string): boolean => {
  // Basic validation: 1-5 uppercase letters
  const symbolPattern = /^[A-Z]{1,5}$/;
  return symbolPattern.test(symbol);
};

/**
 * Clean and normalize stock symbol input
 */
export const normalizeSymbol = (input: string): string => {
  return input.trim().toUpperCase();
};

/**
 * Get color class based on value change
 */
export const getChangeColorClass = (change: number): string => {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
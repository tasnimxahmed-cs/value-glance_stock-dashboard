import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Plus, Moon, Sun, Keyboard, AlertTriangle } from 'lucide-react';

// Components
import StockTable from './components/StockTable/StockTable';
import StockChart from './components/StockChart/StockChart';
import StockDetails from './components/StockDetails/StockDetails';
import LoadingScreen from './components/UI/LoadingScreen';
import ErrorScreen from './components/UI/ErrorScreen';
import KeyboardShortcutsModal from './components/UI/KeyboardShortcutsModal';

// Hooks
import useStockData from './hooks/useStockData';
import useChartData from './hooks/useChartData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';

// Contexts
import { useToast } from './contexts/ToastContext';

// Types and Utils
import { SortField, SortDirection } from './types/stock.types';
import { DEFAULT_SYMBOLS } from './utils/constants';
import { normalizeSymbol, isValidSymbol } from './utils/formatters';
import SessionStorage from './utils/sessionStorage';

const StockDashboard: React.FC = () => {
  // Check if we're in demo mode
  const isDemoMode = SessionStorage.isDemoMode();
  
  // Local state for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [customSymbol, setCustomSymbol] = useState('');
  const [trackedSymbols, setTrackedSymbols] = useState<string[]>(() => {
    // Load from session storage or use defaults
    const stored = SessionStorage.getTrackedSymbols();
    return stored.length > 0 ? stored : DEFAULT_SYMBOLS;
  });
  const [darkMode, setDarkMode] = useState(() => SessionStorage.getDarkMode());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  
  // Toast notifications
  const { showToast } = useToast();

  // Custom hooks for data management
  const {
    stocks,
    profiles,
    loading,
    error,
    refreshing,
    fetchStockData,
    addSymbol,
    removeSymbol
  } = useStockData({
    symbols: trackedSymbols,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });

  const {
    chartData,
    loading: chartLoading,
    isDemoData: chartIsDemoData,
    fetchChartData,
    clearData: clearChartData
  } = useChartData({
    symbol: selectedStock,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to session storage
    SessionStorage.setDarkMode(darkMode);
  }, [darkMode]);

  // Save tracked symbols to session storage
  useEffect(() => {
    SessionStorage.setTrackedSymbols(trackedSymbols);
  }, [trackedSymbols]);

  // Save selected stock to session storage
  useEffect(() => {
    SessionStorage.setSelectedStock(selectedStock);
  }, [selectedStock]);

  // Load selected stock from session storage on mount
  useEffect(() => {
    const storedSelectedStock = SessionStorage.getSelectedStock();
    if (storedSelectedStock && trackedSymbols.includes(storedSelectedStock)) {
      setSelectedStock(storedSelectedStock);
    }
  }, [trackedSymbols]);

  // Event handlers
  const handleRefresh = () => {
    fetchStockData();
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    fetchChartData(symbol);
  };

  const handleAddSymbol = async () => {
    // Disable adding symbols in demo mode
    if (isDemoMode) {
      showToast({
        type: 'warning',
        title: 'Demo Mode',
        message: 'Adding new symbols is disabled in demo mode. Get an API key to enable this feature.',
        duration: 4000
      });
      return;
    }

    const symbol = normalizeSymbol(customSymbol);
    
    if (!symbol) return;
    
    if (!isValidSymbol(symbol)) {
      showToast({
        type: 'error',
        title: 'Invalid Symbol',
        message: 'Please enter a valid stock symbol (1-5 letters)',
        duration: 3000
      });
      return;
    }
    
    if (trackedSymbols.includes(symbol)) {
      showToast({
        type: 'warning',
        title: 'Symbol Already Added',
        message: `${symbol} is already in your watchlist`,
        duration: 3000
      });
      return;
    }

    // Add to tracked symbols
    setTrackedSymbols(prev => [...prev, symbol]);
    addSymbol(symbol);
    setCustomSymbol('');
    
    showToast({
      type: 'success',
      title: 'Symbol Added',
      message: `${symbol} has been added to your watchlist`,
      duration: 2000
    });
  };

  const handleRemoveSymbol = (symbol: string) => {
    // Prevent removing default symbols in demo mode
    if (isDemoMode && DEFAULT_SYMBOLS.includes(symbol)) {
      showToast({
        type: 'warning',
        title: 'Demo Mode',
        message: 'Cannot remove default symbols in demo mode. Get an API key to enable this feature.',
        duration: 4000
      });
      return;
    }

    setTrackedSymbols(prev => prev.filter(s => s !== symbol));
    removeSymbol(symbol);
    
    if (selectedStock === symbol) {
      setSelectedStock(null);
      clearChartData();
    }
    
    showToast({
      type: 'info',
      title: 'Symbol Removed',
      message: `${symbol} has been removed from your watchlist`,
      duration: 2000
    });
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSymbol();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: handleRefresh,
    onToggleDarkMode: toggleDarkMode,
    onAddSymbol: () => symbolInputRef.current?.focus(),
    onSearch: () => searchInputRef.current?.focus()
  });

  // Performance optimization
  usePerformanceOptimization({
    onVisibilityChange: (isVisible) => {
      if (isVisible) {
        showToast({
          type: 'info',
          title: 'Welcome back!',
          message: 'Refreshing your data...',
          duration: 2000
        });
      }
    },
    onOnlineChange: (isOnline) => {
      if (!isOnline) {
        showToast({
          type: 'warning',
          title: 'You\'re offline',
          message: 'Some features may be limited',
          duration: 3000
        });
      } else {
        showToast({
          type: 'success',
          title: 'Back online!',
          message: 'All features are now available',
          duration: 2000
        });
      }
    }
  });

  // Get selected stock data
  const selectedStockData = selectedStock ? stocks.find(s => s.symbol === selectedStock) ?? null: null;
  const selectedStockProfile = selectedStock ? profiles.get(selectedStock) ?? null : null;

  // Render loading or error states
  if (loading && stocks.length === 0) {
    return <LoadingScreen />;
  }

  if (error && stocks.length === 0) {
    return (
      <ErrorScreen 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b sticky top-0 z-40 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className='text-left'>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Stock Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Real-time market data
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-5 w-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

                             {/* Add Symbol Input */}
               <div className={`flex items-center space-x-2 rounded-lg p-2 ${
                 darkMode ? 'bg-gray-700' : 'bg-gray-50'
               } ${isDemoMode ? 'opacity-50' : ''}`}>
                 <input
                   ref={symbolInputRef}
                   type="text"
                   placeholder={isDemoMode ? "Demo mode - API key required" : "Add symbol (e.g., AAPL)"}
                   value={customSymbol}
                   onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                   onKeyPress={handleKeyPress}
                   className={`bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder-gray-500 min-w-0 ${
                     darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900'
                   }`}
                   maxLength={5}
                   disabled={isDemoMode}
                 />
                 <button
                   onClick={handleAddSymbol}
                   disabled={!customSymbol.trim() || isDemoMode}
                   className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                 >
                   <Plus className="h-4 w-4" />
                   <span className="hidden sm:inline">Add</span>
                 </button>
               </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <svg 
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>

          {/* Market Status */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Market Open</span>
              </div>
              <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
                             {isDemoMode && (
                 <>
                   <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                   <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs flex items-center space-x-1">
                     <AlertTriangle className="h-3 w-3" />
                     <span>Demo Mode</span>
                   </span>
                 </>
               )}
            </div>
            
            {error && (
              <div className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Table - Takes up 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
                         <StockTable
               stocks={stocks}
               profiles={profiles}
               searchTerm={searchTerm}
               sortBy={sortBy}
               sortDirection={sortDirection}
               selectedStock={selectedStock}
               defaultSymbols={DEFAULT_SYMBOLS}
               onSearch={setSearchTerm}
               onSort={handleSort}
               onStockSelect={handleStockSelect}
               onStockRemove={handleRemoveSymbol}
               showVolumeColumn={true}
               showDetailsColumn={false}
               darkMode={darkMode}
               searchInputRef={searchInputRef}
               isDemoMode={isDemoMode}
             />
          </div>

          {/* Right Sidebar - Chart and Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stock Chart */}
            <StockChart
              data={chartData}
              isLoading={chartLoading}
              selectedStock={selectedStock}
              height="h-64"
              showTitle={true}
              darkMode={darkMode}
              isDemoData={chartIsDemoData}
            />

            {/* Stock Details */}
            <StockDetails
              stock={selectedStockData}
              profile={selectedStockProfile}
              showTitle={true}
              compact={false}
              darkMode={darkMode}
            />

            {/* Quick Stats Card */}
            {stocks.length > 0 && (
              <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>Market Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stocks.filter(s => s.change > 0).length}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gainers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {stocks.filter(s => s.change < 0).length}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Losers</div>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t text-center ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stocks.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Stocks Tracked
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                         <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               {isDemoMode ? (
                 'Demo Mode • Using sample data for demonstration • Get API key for full features'
               ) : (
                 'Powered by Finnhub API • Data delayed by 15 minutes'
               )}
             </div>
            <div className={`text-sm mt-2 sm:mt-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Built with React + TypeScript + Tailwind CSS by Tasnim for ValueGlance
            </div>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        darkMode={darkMode}
      />
    </div>
  );
};

export default StockDashboard;
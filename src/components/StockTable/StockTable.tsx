import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { StockQuote, CompanyProfile, SortField, SortDirection } from '../../types/stock.types';
import StockRow from './StockRow';
import { debounce } from '../../utils/formatters';

interface StockTableProps {
  stocks: StockQuote[];
  profiles: Map<string, CompanyProfile>;
  searchTerm: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  selectedStock: string | null;
  defaultSymbols: string[];
  onSearch: (term: string) => void;
  onSort: (field: SortField) => void;
  onStockSelect: (symbol: string) => void;
  onStockRemove: (symbol: string) => void;
  showVolumeColumn?: boolean;
  showDetailsColumn?: boolean;
  compact?: boolean;
  darkMode?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  isDemoMode?: boolean;
}

const StockTable: React.FC<StockTableProps> = ({
  stocks,
  profiles,
  searchTerm,
  sortBy,
  sortDirection,
  selectedStock,
  defaultSymbols,
  onSearch,
  onSort,
  onStockSelect,
  onStockRemove,
  showVolumeColumn = true,
  showDetailsColumn = false,
  compact = false,
  darkMode = false,
  searchInputRef,
  isDemoMode = false
}) => {
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers'>('all');

  // Debounced search to avoid too many updates
  const debouncedSearch = useMemo(
    () => debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );

  // Filtering logic
  const filteredStocks = useMemo(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profiles.get(stock.symbol)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'gainers' && stock.change > 0) ||
        (filterBy === 'losers' && stock.change < 0);
      
      return matchesSearch && matchesFilter;
    });

    return filtered;
  }, [stocks, profiles, searchTerm, filterBy]);

  // Sorting logic
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        default:
          aValue = a.symbol;
          bValue = b.symbol;
          break;
      }
      
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return aValue > bValue ? multiplier : -multiplier;
    });
  }, [filteredStocks, sortBy, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getStockStats = () => {
    const gainers = stocks.filter(s => s.change > 0).length;
    const losers = stocks.filter(s => s.change < 0).length;
    const unchanged = stocks.length - gainers - losers;
    
    return { gainers, losers, unchanged };
  };

  const stats = getStockStats();

  const handleHeaderClick = (field: SortField) => {
    onSort(field);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors duration-200 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Market Overview ({stocks.length} stocks)
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-green-600">
                ↗ {stats.gainers} gainers
              </span>
              <span className="text-red-600">
                ↘ {stats.losers} losers
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                → {stats.unchanged} unchanged
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Filter Buttons */}
            <div className={`flex rounded-lg border overflow-hidden ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              {[
                { key: 'all', label: 'All', count: stocks.length },
                { key: 'gainers', label: 'Gainers', count: stats.gainers },
                { key: 'losers', label: 'Losers', count: stats.losers }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterBy(key as any)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    filterBy === key
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search stocks..."
                defaultValue={searchTerm}
                onChange={handleSearchChange}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th 
                className={`text-left py-3 px-4 font-semibold cursor-pointer transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleHeaderClick('symbol')}
              >
                <div className="flex items-center space-x-1">
                  <span>Company{getSortIndicator('symbol')}</span>
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th 
                className={`text-right py-3 px-4 font-semibold cursor-pointer transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleHeaderClick('price')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Price{getSortIndicator('price')}</span>
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th 
                className={`text-right py-3 px-4 font-semibold cursor-pointer transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleHeaderClick('change')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Change{getSortIndicator('change')}</span>
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </th>
              {showVolumeColumn && (
                <th className={`text-right py-3 px-4 font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Volume
                </th>
              )}
              {showDetailsColumn && (
                <th className={`text-right py-3 px-4 font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Day Range
                </th>
              )}
              <th className="py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.length > 0 ? (
              sortedStocks.map((stock) => (
                                 <StockRow
                   key={stock.symbol}
                   stock={stock}
                   profile={profiles.get(stock.symbol)}
                   isSelected={selectedStock === stock.symbol}
                   isRemovable={!defaultSymbols.includes(stock.symbol)}
                   onSelect={onStockSelect}
                   onRemove={onStockRemove}
                   showVolume={showVolumeColumn}
                   showDetails={showDetailsColumn || !compact}
                   darkMode={darkMode}
                   isDemoMode={isDemoMode}
                 />
              ))
            ) : (
              <tr>
                <td colSpan={showVolumeColumn ? 6 : 5} className="py-12 text-center">
                  <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    {searchTerm ? (
                      <p>No stocks match "{searchTerm}"</p>
                    ) : (
                      <p>No stocks available</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedStocks.length > 0 && (
        <div className={`px-6 py-3 border-t transition-colors duration-200 ${
          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`flex items-center justify-between text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>
              Showing {sortedStocks.length} of {stocks.length} stocks
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <span>
              Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;
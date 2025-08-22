import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { StockQuote, CompanyProfile } from '../../types/stock.types';
import { formatCurrency, formatNumber, getChangeColorClass } from '../../utils/formatters';

interface StockRowProps {
  stock: StockQuote;
  profile?: CompanyProfile;
  isSelected: boolean;
  isRemovable: boolean;
  onSelect: (symbol: string) => void;
  onRemove?: (symbol: string) => void;
  showVolume?: boolean;
  showDetails?: boolean;
  darkMode?: boolean;
  isDemoMode?: boolean;
}

const StockRow: React.FC<StockRowProps> = ({ 
  stock, 
  profile, 
  isSelected, 
  isRemovable, 
  onSelect, 
  onRemove,
  showVolume = true,
  showDetails = true,
  darkMode = false,
  isDemoMode = false
}) => {
  const isPositive = stock.change >= 0;
  const changeColorClass = getChangeColorClass(stock.change);
  
  const handleRowClick = () => {
    onSelect(stock.symbol);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(stock.symbol);
    }
  };

  const getPerformanceIndicator = () => {
    const absChangePercent = Math.abs(stock.changePercent);
    if (absChangePercent >= 5) return '🔥'; // Hot stock
    if (absChangePercent >= 2) return '⚡'; // Active
    if (absChangePercent <= 0.5) return '😴'; // Sleepy
    return '';
  };

  const getVolumeIndicator = () => {
    if (stock.volume >= 100000000) return 'Very High';
    if (stock.volume >= 50000000) return 'High';
    if (stock.volume >= 10000000) return 'Normal';
    if (stock.volume >= 1000000) return 'Low';
    return 'Very Low';
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`
        border-b cursor-pointer transition-all duration-200
        ${darkMode ? 'border-gray-700' : 'border-gray-100'}
        ${isSelected 
          ? darkMode 
            ? 'bg-blue-900 border-blue-600 shadow-sm' 
            : 'bg-blue-50 border-blue-200 shadow-sm'
          : ''
        }
        ${isSelected 
          ? darkMode 
            ? 'hover:bg-blue-800' 
            : 'hover:bg-blue-100'
          : darkMode 
            ? 'hover:bg-gray-700' 
            : 'hover:bg-gray-50'
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      aria-label={`Select ${stock.symbol} stock`}
    >
      {/* Company Info */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          {profile?.logo && (
            <img 
              src={profile.logo} 
              alt={`${stock.symbol} logo`}
              className="h-8 w-8 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stock.symbol}
              </span>
              <span className="text-sm">{getPerformanceIndicator()}</span>
            </div>
            {showDetails && (
              <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {profile?.name || stock.symbol}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-3 px-4 text-right">
        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {formatCurrency(stock.price)}
        </div>
        {showDetails && (
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Open: {formatCurrency(stock.open)}
          </div>
        )}
      </td>

      {/* Change */}
      <td className="py-3 px-4 text-right">
        <div className={`flex items-center justify-end space-x-1 ${changeColorClass}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <div className="text-right">
            <div className="font-medium">
              {isPositive ? '+' : ''}{formatCurrency(stock.change)}
            </div>
            <div className="text-sm">
              ({stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </td>

      {/* Volume */}
      {showVolume && (
        <td className="py-3 px-4 text-right">
          <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {formatNumber(stock.volume)}
          </div>
          {showDetails && (
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {getVolumeIndicator()}
            </div>
          )}
        </td>
      )}

      {/* High/Low */}
      {showDetails && (
        <td className={`py-3 px-4 text-right text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div>H: {formatCurrency(stock.high)}</div>
          <div>L: {formatCurrency(stock.low)}</div>
        </td>
      )}

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center justify-end space-x-2">
                     {isRemovable && onRemove && !isDemoMode && (
             <button
               onClick={handleRemoveClick}
               className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
               title={`Remove ${stock.symbol}`}
               aria-label={`Remove ${stock.symbol} from watchlist`}
             >
               <X className="h-4 w-4" />
             </button>
           )}
        </div>
      </td>
    </tr>
  );
};

export default StockRow;
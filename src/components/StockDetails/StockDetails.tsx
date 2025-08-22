import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Building2 } from 'lucide-react';
import { StockQuote, CompanyProfile } from '../../types/stock.types';
import { formatCurrency, formatNumber, formatMarketCap, getChangeColorClass } from '../../utils/formatters';

interface StockDetailsProps {
  stock: StockQuote | null;
  profile: CompanyProfile | null;
  showTitle?: boolean;
  compact?: boolean;
  darkMode?: boolean;
}

interface DetailItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  colorClass?: string;
}

const DetailItem: React.FC<DetailItemProps & { darkMode?: boolean }> = ({ 
  label, 
  value, 
  icon, 
  highlight = false,
  colorClass = '',
  darkMode = false
}) => (
  <div className={`flex justify-between items-center py-2 ${
    highlight 
      ? darkMode 
        ? 'bg-gray-700 rounded px-3' 
        : 'bg-gray-50 rounded px-3' 
      : ''
  }`}>
    <div className="flex items-center space-x-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}:</span>
    </div>
    <span className={`font-medium text-sm ${colorClass || (darkMode ? 'text-white' : 'text-gray-900')}`}>
      {value}
    </span>
  </div>
);

const StockDetails: React.FC<StockDetailsProps> = ({ 
  stock, 
  profile, 
  showTitle = true,
  compact = false,
  darkMode = false
}) => {
  if (!stock) {
    return (
      <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {showTitle && (
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Stock Details</h3>
        )}
        <div className={`text-center py-8 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select a stock to view details</p>
        </div>
      </div>
    );
  }

  const isPositiveChange = stock.change >= 0;
  const changeColorClass = getChangeColorClass(stock.change);
  
  const basicDetails = [
    {
      label: 'Company',
      value: profile?.name || stock.symbol,
      icon: <Building2 className="h-4 w-4" />,
      highlight: true
    },
    {
      label: 'Current Price',
      value: formatCurrency(stock.price),
      icon: <DollarSign className="h-4 w-4" />,
      highlight: true
    },
    {
      label: 'Change',
      value: `${stock.change >= 0 ? '+' : ''}${formatCurrency(stock.change)} (${stock.changePercent.toFixed(2)}%)`,
      icon: isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      colorClass: changeColorClass,
      highlight: true
    }
  ];

  const additionalDetails = compact ? [] : [
    {
      label: 'Previous Close',
      value: formatCurrency(stock.previousClose),
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      label: 'Day High',
      value: formatCurrency(stock.high),
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: 'Day Low',
      value: formatCurrency(stock.low),
      icon: <TrendingDown className="h-4 w-4" />
    },
    {
      label: 'Opening Price',
      value: formatCurrency(stock.open)
    },
    {
      label: 'Volume',
      value: formatNumber(stock.volume)
    }
  ];

  const companyDetails = compact ? [] : [
    ...(profile?.marketCapitalization ? [{
      label: 'Market Cap',
      value: formatMarketCap(profile.marketCapitalization),
      icon: <Building2 className="h-4 w-4" />
    }] : []),
    ...(profile?.shareOutstanding ? [{
      label: 'Shares Outstanding',
      value: formatNumber(profile.shareOutstanding)
    }] : [])
  ];

  const allDetails: DetailItemProps[] = [...basicDetails, ...additionalDetails, ...companyDetails];

  const getPriceMovementSummary = () => {
    const dayRange = stock.high - stock.low;
    const currentPosition = stock.price - stock.low;
    const percentageInRange = dayRange > 0 ? (currentPosition / dayRange) * 100 : 50;
    
    return {
      dayRange: formatCurrency(dayRange),
      positionInRange: percentageInRange.toFixed(1),
      isNearHigh: percentageInRange > 80,
      isNearLow: percentageInRange < 20
    };
  };

  const priceMovement = getPriceMovementSummary();

  return (
    <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Stock Details</h3>
          {profile?.logo && (
            <img 
              src={profile.logo} 
              alt={`${stock.symbol} logo`}
              className="h-8 w-8 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      )}

      <div className="space-y-1">
        {allDetails.map(({ label, value, icon, highlight, colorClass }) => (
          <DetailItem
            key={label}
            label={label}
            value={value}
            icon={icon}
            highlight={highlight}
            colorClass={colorClass}
            darkMode={darkMode}
          />
        ))}
      </div>

      {!compact && (
        <>
          {/* Day Range Indicator */}
          <div className={`mt-6 pt-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className={`flex items-center justify-between text-sm mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span>Day Range: {formatCurrency(stock.low)} - {formatCurrency(stock.high)}</span>
              <span>{priceMovement.dayRange}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-2 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div 
                className="absolute top-0 w-3 h-2 bg-blue-600 rounded-full transform -translate-x-1/2"
                style={{ left: `${priceMovement.positionInRange}%` }}
              ></div>
            </div>
            
            <div className={`flex justify-between text-xs mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Low</span>
              <span className="font-medium text-blue-600">Current: {formatCurrency(stock.price)}</span>
              <span>High</span>
            </div>
            
            {priceMovement.isNearHigh && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 rounded p-2">
                📈 Trading near day high
              </div>
            )}
            
            {priceMovement.isNearLow && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                📉 Trading near day low
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className={`mt-4 pt-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className={`text-xs uppercase tracking-wide mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Performance</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-lg font-bold ${changeColorClass}`}>
                  {stock.changePercent.toFixed(2)}%
                </div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Today</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {((stock.price / stock.open - 1) * 100).toFixed(2)}%
                </div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>From Open</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Last Updated */}
      <div className={`mt-4 pt-4 border-t text-xs text-center ${
        darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'
      }`}>
        Data from Finnhub • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StockDetails;
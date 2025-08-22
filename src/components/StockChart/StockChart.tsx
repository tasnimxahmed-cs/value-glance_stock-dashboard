import React, { useRef, useEffect, useCallback } from 'react';
import * as Chart from 'chart.js';
import { HistoricalData } from '../../types/stock.types';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.LineController,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
);

interface StockChartProps {
  data: HistoricalData | null;
  isLoading: boolean;
  selectedStock: string | null;
  height?: string;
  showTitle?: boolean;
  darkMode?: boolean;
  isDemoData?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ 
  data, 
  isLoading, 
  selectedStock,
  height = "h-64",
  showTitle = true,
  darkMode = false,
  isDemoData = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);

  const renderChart = useCallback(() => {
    if (!data?.prices.length || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Determine trend color based on first vs last price
    const firstPrice = data.prices[0]?.price || 0;
    const lastPrice = data.prices[data.prices.length - 1]?.price || 0;
    const isUpTrend = lastPrice >= firstPrice;

    chartRef.current = new Chart.Chart(ctx, {
      type: 'line',
      data: {
        labels: data.prices.map(p => formatDate(p.date)),
        datasets: [{
          label: `${data.symbol} Price`,
          data: data.prices.map(p => p.price),
          borderColor: isUpTrend ? CHART_COLORS.success : CHART_COLORS.danger,
          backgroundColor: isUpTrend 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isUpTrend ? CHART_COLORS.success : CHART_COLORS.danger,
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: isUpTrend ? CHART_COLORS.success : CHART_COLORS.danger,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context: any) => {
                return `${data.symbol} - ${context[0].label}`;
              },
              label: (context: any) => {
                return `Price: ${formatCurrency(context.parsed.y)}`;
              }
            }
          },
        },
        scales: {
          x: {
            display: true,
            grid: { 
              display: false 
            },
            ticks: {
              maxTicksLimit: 6,
              color: darkMode ? '#9CA3AF' : '#6B7280'
            }
          },
          y: {
            display: true,
            position: 'right',
            grid: { 
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            border: {
              display: false
            },
            ticks: {
              color: darkMode ? '#9CA3AF' : '#6B7280',
              callback: function(value: any) {
                return formatCurrency(value);
              }
            }
          },
        },
        elements: {
          line: {
            tension: 0.4
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      },
    });
  }, [data, darkMode]);

  useEffect(() => {
    renderChart();
    
    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [renderChart]);

  const getChartTitle = () => {
    if (!selectedStock) return 'Select a Stock';
    return `${selectedStock} - 30 Day Chart`;
  };

  const renderEmptyState = () => (
    <div className={`flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <div className="text-center">
        <div className="text-4xl mb-2">📈</div>
        <p className="text-sm">Click on a stock to view its chart</p>
      </div>
    </div>
  );

  const renderNoDataState = () => (
    <div className={`flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <div className="text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm">No chart data available for {selectedStock}</p>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try a different stock symbol</p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading chart data...</p>
      </div>
    </div>
  );

  return (
    <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {getChartTitle()}
            </h3>
            {isDemoData && data && data.prices.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Demo Data
              </span>
            )}
          </div>
          {data && data.prices.length > 0 && (
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {data.prices.length} days
            </div>
          )}
        </div>
      )}
      
      <div className={`${height} relative`}>
        {selectedStock ? (
          isLoading ? (
            renderLoadingState()
          ) : data?.prices.length ? (
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
              role="img"
              aria-label={`Price chart for ${selectedStock}`}
            />
          ) : (
            renderNoDataState()
          )
        ) : (
          renderEmptyState()
        )}
      </div>
      
      {data && data.prices.length > 0 && (
        <div className={`mt-4 space-y-3 border-t pt-3 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`flex justify-between items-center text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>
              Period: {formatDate(data.prices[0].date)} - {formatDate(data.prices[data.prices.length - 1].date)}
            </span>
            <span>
              Data points: {data.prices.length}
            </span>
          </div>
          
          {isDemoData && (
            <div className={`p-3 rounded-lg text-sm ${
              darkMode 
                ? 'bg-yellow-900/20 border border-yellow-700/30 text-yellow-200' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Demo Chart Data</p>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    This chart shows simulated data for demonstration purposes. 
                    Real historical data requires a paid Finnhub API plan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockChart;
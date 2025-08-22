# 📈 Stock Dashboard

A modern, responsive stock market dashboard built with React, TypeScript, and Tailwind CSS. Track real-time stock prices, view interactive charts, and manage your watchlist with a beautiful, intuitive interface.

![Stock Dashboard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Stock+Dashboard+Preview)

## ✨ Features

### 🎯 Core Features
- **Real-time Stock Data**: Fetch live stock prices and market data from Finnhub API
- **Interactive Stock Table**: Sort, filter, and search through your watchlist
- **Interactive Charts**: Visualize stock performance with Chart.js powered charts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing

### 🚀 Advanced Features
- **Session Persistence**: Your preferences and stock selections are saved locally
- **Keyboard Shortcuts**: Navigate efficiently with keyboard shortcuts
  - `Ctrl/Cmd + R`: Refresh data
  - `Ctrl/Cmd + D`: Toggle dark mode
  - `Ctrl/Cmd + K`: Focus search
  - `Ctrl/Cmd + N`: Add new symbol (disabled in demo mode)
- **Demo Mode**: Works without API key using sample data
- **Auto-refresh**: Automatic data updates every minute
- **Error Handling**: Graceful error handling with retry mechanisms
- **Loading States**: Smooth loading animations and skeleton screens

### 📊 Data Display
- Current price, change, and percentage change
- Volume and market statistics
- Day high/low ranges
- Company profiles and market cap
- 30-day price charts with trend indicators
- **Demo Data Indicators**: Clear visual warnings when charts show simulated data

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Icons**: Lucide React
- **API**: Finnhub (with fallback demo data)
- **Build Tool**: Create React App
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd value-glance_stock-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Add your Finnhub API key
   REACT_APP_FINNHUB_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### API Key Setup (Optional)

The app works in demo mode without an API key, but for real data:

1. Get a free API key from [Finnhub](https://finnhub.io/)
2. Create a `.env` file in the root directory
3. Add your API key: `REACT_APP_FINNHUB_API_KEY=your_key_here`

### Demo Mode Limitations

When running without an API key, the app operates in **Demo Mode** with these restrictions:
- ✅ View sample stock data and charts
- ✅ Use all viewing and interaction features
- ✅ Session persistence works normally
- ❌ **Adding new stocks is disabled**
- ❌ **Removing default stocks is disabled**
- ⚠️ Clear indicators show you're in demo mode

**Note**: Demo mode is designed to showcase the app safely without requiring an API key.

### Free Tier API Limitations

Even with a valid API key, the free Finnhub tier has limitations:
- **Real-time Quotes**: ✅ Available (current prices, changes, volume)
- **Company Profiles**: ✅ Available (company names, market cap)
- **Historical Data**: ⚠️ Limited access (may fallback to demo data)
- **Rate Limits**: 60 API calls per minute

**For full historical data access**, consider upgrading to a paid Finnhub plan.

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎨 Customization

### Session Persistence
- Your selected stocks are saved locally and persist across browser sessions
- Dark mode preference is remembered
- Selected stock for charts is preserved
- All preferences are stored in localStorage

### Default Stocks
Modify the default watchlist in `src/utils/constants.ts`:
```typescript
export const DEFAULT_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 
  'AMZN', 'META', 'NVDA', 'NFLX'
];
```

### Styling
The app uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`.

### API Configuration
Adjust API settings in `src/utils/constants.ts`:
- Request delays
- Retry counts
- Timeout values
- Chart configuration

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── StockTable/     # Main stock table
│   ├── StockChart/     # Interactive charts
│   ├── StockDetails/   # Stock information panel
│   └── UI/            # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment
```bash
npm run build
# Upload the 'build' folder to your hosting service
```

## 🔧 Configuration

### Environment Variables
- `REACT_APP_FINNHUB_API_KEY`: Your Finnhub API key
- `REACT_APP_DEFAULT_SYMBOLS`: Comma-separated default stock symbols

### API Limits
- Free Finnhub tier: 60 API calls/minute
- Demo mode: Unlimited (uses sample data)

### Known Limitations
- **Demo Mode**: Adding/removing stocks is disabled for safety
- **Chart Data**: Demo charts show realistic simulated data
- **API Dependencies**: Real-time data requires valid API key
- **Historical Data**: Free tier has limited historical data access (may show demo data)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) for providing the stock data API
- [Chart.js](https://www.chartjs.org/) for the interactive charts
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide React](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with React + TypeScript + Tailwind CSS by Tasnim for ValueGlance**

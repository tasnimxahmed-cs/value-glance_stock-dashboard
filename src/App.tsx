import React from 'react';
import StockDashboard from './StockDashboard';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <StockDashboard />
      </div>
    </ToastProvider>
  );
}

export default App;
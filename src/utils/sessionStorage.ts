// Session Storage Keys
const STORAGE_KEYS = {
  TRACKED_SYMBOLS: 'stock_dashboard_tracked_symbols',
  DARK_MODE: 'stock_dashboard_dark_mode',
  SELECTED_STOCK: 'stock_dashboard_selected_stock',
  USER_PREFERENCES: 'stock_dashboard_preferences'
} as const;

// User Preferences Interface
export interface UserPreferences {
  darkMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showVolumeColumn: boolean;
  showDetailsColumn: boolean;
}

// Session Storage Utility
export class SessionStorage {
  static getTrackedSymbols(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACKED_SYMBOLS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load tracked symbols from storage:', error);
      return [];
    }
  }

  static setTrackedSymbols(symbols: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKED_SYMBOLS, JSON.stringify(symbols));
    } catch (error) {
      console.warn('Failed to save tracked symbols to storage:', error);
    }
  }

  static getDarkMode(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to load dark mode preference from storage:', error);
      return false;
    }
  }

  static setDarkMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save dark mode preference to storage:', error);
    }
  }

  static getSelectedStock(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_STOCK);
    } catch (error) {
      console.warn('Failed to load selected stock from storage:', error);
      return null;
    }
  }

  static setSelectedStock(symbol: string | null): void {
    try {
      if (symbol) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_STOCK, symbol);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_STOCK);
      }
    } catch (error) {
      console.warn('Failed to save selected stock to storage:', error);
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : {
        darkMode: false,
        autoRefresh: true,
        refreshInterval: 60000,
        showVolumeColumn: true,
        showDetailsColumn: false
      };
    } catch (error) {
      console.warn('Failed to load user preferences from storage:', error);
      return {
        darkMode: false,
        autoRefresh: true,
        refreshInterval: 60000,
        showVolumeColumn: true,
        showDetailsColumn: false
      };
    }
  }

  static setUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save user preferences to storage:', error);
    }
  }

  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }

  static isDemoMode(): boolean {
    return !process.env.REACT_APP_FINNHUB_API_KEY;
  }
}

export default SessionStorage;

import React from 'react';
import { X, Keyboard, RefreshCw, Moon, Search, Plus } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  darkMode
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'Ctrl/Cmd + R',
      description: 'Refresh stock data',
      icon: <RefreshCw className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + D',
      description: 'Toggle dark mode',
      icon: <Moon className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + K',
      description: 'Focus search',
      icon: <Search className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + N',
      description: 'Add new symbol',
      icon: <Plus className="h-4 w-4" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl transition-colors duration-200 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Keyboard className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {shortcut.icon}
                  </div>
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {shortcut.description}
                  </span>
                </div>
                <kbd className={`px-2 py-1 text-xs font-mono rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-xs text-center ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Press Esc to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onRefresh?: () => void;
  onToggleDarkMode?: () => void;
  onAddSymbol?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = ({
  onRefresh,
  onToggleDarkMode,
  onAddSymbol,
  onSearch
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + R: Refresh data
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        onRefresh?.();
      }

      // Ctrl/Cmd + D: Toggle dark mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        onToggleDarkMode?.();
      }

      // Ctrl/Cmd + K: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onSearch?.();
      }

      // Ctrl/Cmd + N: Add new symbol
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onAddSymbol?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onRefresh, onToggleDarkMode, onAddSymbol, onSearch]);
};

import { useEffect, useCallback } from 'react';

interface PerformanceOptimizationProps {
  onVisibilityChange?: (isVisible: boolean) => void;
  onOnlineChange?: (isOnline: boolean) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export const usePerformanceOptimization = ({
  onVisibilityChange,
  onOnlineChange,
  onFocusChange
}: PerformanceOptimizationProps) => {
  
  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    onVisibilityChange?.(isVisible);
  }, [onVisibilityChange]);

  // Handle online/offline status
  const handleOnlineChange = useCallback(() => {
    const isOnline = navigator.onLine;
    onOnlineChange?.(isOnline);
  }, [onOnlineChange]);

  // Handle window focus/blur
  const handleFocusChange = useCallback(() => {
    const isFocused = document.hasFocus();
    onFocusChange?.(isFocused);
  }, [onFocusChange]);

  useEffect(() => {
    // Page visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Online/offline events
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // Focus events
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
    };
  }, [handleVisibilityChange, handleOnlineChange, handleFocusChange]);

  // Preload critical resources
  useEffect(() => {
    // Preload chart.js for better performance
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.min.js';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Optimize for mobile devices
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Reduce animation complexity on mobile
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }
  }, []);
};

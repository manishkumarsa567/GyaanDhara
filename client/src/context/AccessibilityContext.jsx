import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext(null);
const STORAGE_KEY = 'gd_low_literacy_mode';

function readStoredMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AccessibilityProvider({ children }) {
  const [lowLiteracyMode, setLowLiteracyMode] = useState(readStoredMode);

  useEffect(() => {
    document.documentElement.classList.toggle('low-literacy-mode', lowLiteracyMode);
    try {
      localStorage.setItem(STORAGE_KEY, String(lowLiteracyMode));
    } catch (error) {
      console.warn('Could not save accessibility preferences:', error);
    }
    return () => document.documentElement.classList.remove('low-literacy-mode');
  }, [lowLiteracyMode]);

  const toggleLowLiteracyMode = useCallback(() => {
    setLowLiteracyMode((enabled) => !enabled);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ lowLiteracyMode, toggleLowLiteracyMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
}

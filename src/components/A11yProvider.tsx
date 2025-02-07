import React, { createContext, useContext, useState } from 'react';

interface A11yContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
    document.documentElement.classList.toggle('high-contrast');
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
    document.documentElement.style.fontSize = `${fontSize + 1}px`;
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
    document.documentElement.style.fontSize = `${fontSize - 1}px`;
  };

  return (
    <A11yContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}
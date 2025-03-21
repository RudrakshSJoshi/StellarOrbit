import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext(null);

// Context provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default is dark
  
  // Initialize theme from local storage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('stellarIDE_theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);
  
  // Update local storage when theme changes
  useEffect(() => {
    localStorage.setItem('stellarIDE_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Load theme-specific CSS
    if (theme === 'dark') {
      document.getElementById('theme-css')?.remove();
      const link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      link.href = '/assets/styles/themes/dark.css';
      document.head.appendChild(link);
    } else {
      document.getElementById('theme-css')?.remove();
      const link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      link.href = '/assets/styles/themes/light.css';
      document.head.appendChild(link);
    }
  }, [theme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Set a specific theme
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    }
  };
  
  // Provide the context value
  const contextValue = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
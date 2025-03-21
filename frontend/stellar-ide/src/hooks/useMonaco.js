import { useState, useEffect } from 'react';

// Monaco editor loader with dynamic import
const useMonaco = () => {
  const [monaco, setMonaco] = useState(null);
  const [isMonacoLoading, setIsMonacoLoading] = useState(true);
  const [monacoLoadError, setMonacoLoadError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const loadMonaco = async () => {
      try {
        setIsMonacoLoading(true);
        
        // Dynamically import Monaco editor
        const monaco = await import('monaco-editor');
        
        // Configure Monaco with web workers
        // This section would need to be adjusted based on your bundler (Vite in this case)
        // and how you're serving the Monaco workers
        
        if (!cancelled) {
          setMonaco(monaco);
          setIsMonacoLoading(false);
        }
      } catch (error) {
        console.error('Failed to load Monaco editor:', error);
        if (!cancelled) {
          setMonacoLoadError(error);
          setIsMonacoLoading(false);
        }
      }
    };
    
    loadMonaco();
    
    return () => {
      cancelled = true;
    };
  }, []);
  
  return { monaco, isMonacoLoading, monacoLoadError };
};

export default useMonaco;
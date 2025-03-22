import { useState, useEffect } from 'react';
import { EditorProvider } from './contexts/EditorContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import './assets/styles/themes/dark.css';
import APITest from './components/debug/APITest';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="stars-background"></div>
        <div className="loading-container">
          <div className="stellar-logo">
            <span className="logo-text">Stellar IDE</span>
            <div className="orbit-container">
              <div className="planet"></div>
              <div className="orbit">
                <div className="satellite"></div>
              </div>
            </div>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <FileSystemProvider>
        <BlockchainProvider>
          <EditorProvider>
            <div className="app-container">
              <Header />
              <div className="main-content">
                <Sidebar />
                <WorkspaceLayout />
              </div>
            </div>
          </EditorProvider>
        </BlockchainProvider>
      </FileSystemProvider>
    </ThemeProvider>
  );
}

export default App;
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useFileSystem } from '../../contexts/FileSystemContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { activeProject } = useFileSystem();
  const [networkType, setNetworkType] = useState('testnet');
  const location = useLocation();
  
  // Check if we're on a Backend Code page
  const isBackendCodePage = location.pathname.startsWith('/backend-code');
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <div className="planet-icon"></div>
          </div>
          <h1 className="logo-text">Stellar IDE</h1>
        </div>
        
        <nav className="main-nav">
          <Link to="/" className={`nav-item ${!isBackendCodePage ? 'active' : ''}`}>Editor</Link>
          <Link to={`/backend-code/${activeProject || ''}`} className={`nav-item ${isBackendCodePage ? 'active' : ''}`}>
            Backend Code
          </Link>
          <button className="nav-item">Deploy</button>
          <button className="nav-item">Interact</button>
          <button className="nav-item">Explorer</button>
        </nav>
      </div>
      
      <div className="header-right">
        <div className="network-selector">
          <select 
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value)}
            className={`network-select ${networkType}`}
          >
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="local">Local Network</option>
          </select>
        </div>
        
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        <button className="connect-wallet">
          Connect Wallet
        </button>
      </div>
      
      <style jsx>{`
        .header {
          height: var(--header-height);
          background-color: var(--background-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          z-index: 100;
        }
        
        .header-left, .header-right {
          display: flex;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          margin-right: 40px;
        }
        
        .logo-icon {
          position: relative;
          width: 32px;
          height: 32px;
          margin-right: 12px;
        }
        
        .planet-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, var(--space-bright-blue), var(--space-blue));
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(30, 136, 229, 0.5);
        }
        
        .planet-icon:before {
          content: '';
          position: absolute;
          width: 32px;
          height: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
        }
        
        .logo-text {
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(90deg, var(--space-light-blue), var(--space-purple));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .main-nav {
          display: flex;
        }
        
        .nav-item {
          padding: 8px 16px;
          margin-right: 4px;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-weight: 500;
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        
        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .nav-item.active {
          background-color: rgba(30, 136, 229, 0.15);
          color: var(--space-bright-blue);
        }
        
        .network-selector {
          margin-right: 16px;
        }
        
        .network-select {
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 6px 12px;
          padding-right: 32px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        
        .network-select.testnet {
          border-left: 3px solid var(--space-orange);
        }
        
        .network-select.mainnet {
          border-left: 3px solid var(--success);
        }
        
        .network-select.local {
          border-left: 3px solid var(--space-purple);
        }
        
        .theme-toggle {
          margin-right: 16px;
          background-color: var(--background-tertiary);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 18px;
        }
        
        .connect-wallet {
         background: linear-gradient(135deg, var(--space-light-blue), var(--space-purple));
          color: white;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          transition: all 0.2s ease;
        }
        
        .connect-wallet:hover {
          box-shadow: 0 0 15px rgba(30, 136, 229, 0.5);
        }
      `}</style>
    </header>
  );
};

export default Header;
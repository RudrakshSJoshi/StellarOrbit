// ====================================================================
// REPLACE YOUR EXISTING src/components/layout/Header.jsx WITH THIS FILE
// ====================================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useBlockchain } from '../../contexts/BlockchainContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { activeProject } = useFileSystem();
  const { activeAccount, accounts, network, changeNetwork } = useBlockchain();
  const location = useLocation();
  
  // Get active account details
  const getActiveAccountDetails = () => {
    if (!activeAccount || !accounts || accounts.length === 0) {
      return null;
    }
    
    return accounts.find(acc => acc.publicKey === activeAccount);
  };
  
  const activeAccountDetails = getActiveAccountDetails();
  
  // Format public key for display
  const formatPublicKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };
  
  // Handle network change
  const handleNetworkChange = (e) => {
    changeNetwork(e.target.value);
  };
  
  // Check if we're on a specific page
  const isEditorPage = location.pathname === '/';
  const isBackendCodePage = location.pathname.startsWith('/backend-code');
  const isAccountsPage = location.pathname.startsWith('/accounts');
  const isDeployPage = location.pathname.startsWith('/deploy');
  const isInteractPage = location.pathname.startsWith('/interact');
  const isExplorerPage = location.pathname.startsWith('/explorer');
  const isTransactionsPage = location.pathname.startsWith('/transactions');
  
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
          <Link to="/" className={`nav-item ${isEditorPage ? 'active' : ''}`}>Editor</Link>
          <Link to={`/backend-code/${activeProject || ''}`} className={`nav-item ${isBackendCodePage ? 'active' : ''}`}>
            Backend Code
          </Link>
          <Link to="/accounts" className={`nav-item ${isAccountsPage ? 'active' : ''}`}>
            Accounts
          </Link>
          <Link to="/deploy" className={`nav-item ${isDeployPage ? 'active' : ''}`}>
            Deploy
          </Link>
          <Link to="/interact" className={`nav-item ${isInteractPage ? 'active' : ''}`}>
            Interact
          </Link>
          <Link to="/explorer" className={`nav-item ${isExplorerPage ? 'active' : ''}`}>
            Explorer
          </Link>
          <Link to="/transactions" className={`nav-item ${isTransactionsPage ? 'active' : ''}`}>
           Transactions
          </Link>
        </nav>
      </div>
      
      <div className="header-right">
        <div className="network-selector">
          <select 
            value={network}
            onChange={handleNetworkChange}
            className={`network-select ${network}`}
          >
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="local">Local Network</option>
          </select>
        </div>
        
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        {activeAccountDetails ? (
          <div className="active-account">
            <div className="account-info">
              <div className="account-name">{activeAccountDetails.name}</div>
              <div className="account-address">{formatPublicKey(activeAccountDetails.publicKey)}</div>
            </div>
            <Link to="/accounts" className="manage-accounts-button">
              Manage
            </Link>
          </div>
        ) : (
          <Link to="/accounts" className="connect-wallet">
            Connect Wallet
          </Link>
        )}
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
          text-decoration: none;
        }
        
        .connect-wallet:hover {
          box-shadow: 0 0 15px rgba(30, 136, 229, 0.5);
        }
        
        .active-account {
          display: flex;
          align-items: center;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          padding: 4px 4px 4px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .account-info {
          margin-right: 12px;
        }
        
        .account-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .account-address {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        
        .manage-accounts-button {
          background-color: rgba(30, 136, 229, 0.1);
          color: var(--space-bright-blue);
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .manage-accounts-button:hover {
          background-color: rgba(30, 136, 229, 0.2);
        }
      `}</style>
    </header>
  );
};

export default Header;
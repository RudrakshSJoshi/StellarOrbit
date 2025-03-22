// ====================================================================
// CREATE NEW FILE: src/components/blockchain/AccountManager.jsx
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const AccountManager = () => {
  const { 
    accounts, 
    activeAccount, 
    setActiveAccount, 
    createAccount, 
    removeAccount,
    getAccountDetails,
    network,
    changeNetwork,
    isLoading,
    error: blockchainError,
    fetchAccounts
  } = useBlockchain();

  const [newAccountName, setNewAccountName] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(network);

  // Refresh account list
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Update selected network when network changes
  useEffect(() => {
    setSelectedNetwork(network);
  }, [network]);

  // Handle network change
  const handleNetworkChange = (e) => {
    const newNetwork = e.target.value;
    setSelectedNetwork(newNetwork);
    changeNetwork(newNetwork);
  };

  // Create a new account
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      setError('Account name is required');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await createAccount(newAccountName);
      setSuccess(`Account "${newAccountName}" created successfully!`);
      setNewAccountName('');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
  };

  // Set active account
  const handleSetActiveAccount = (publicKey) => {
    setActiveAccount(publicKey);
    setSuccess(`Active account changed successfully!`);
  };

  // Delete an account
  const handleDeleteAccount = async (name, publicKey) => {
    if (window.confirm(`Are you sure you want to delete account "${name}"?`)) {
      try {
        await removeAccount(name);
        setSuccess(`Account "${name}" deleted successfully!`);
      } catch (err) {
        setError(err.message || 'Failed to delete account');
      }
    }
  };

  // Refresh account balance
  const handleRefreshBalance = async (name) => {
    try {
      await getAccountDetails(name);
      setSuccess(`Account "${name}" balance refreshed!`);
    } catch (err) {
      setError(err.message || 'Failed to refresh account balance');
    }
  };

  // Format public key for display
  const formatPublicKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="account-manager">
      <div className="account-manager-header">
        <h2>Account Manager</h2>
        <div className="network-selector">
          <label htmlFor="network">Network:</label>
          <select 
            id="network"
            value={selectedNetwork}
            onChange={handleNetworkChange}
            className={`network-select ${selectedNetwork}`}
          >
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="local">Local Network</option>
          </select>
        </div>
      </div>

      {(error || blockchainError) && (
        <div className="error-message">
          {error || blockchainError}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="accounts-section">
        <div className="section-header">
          <h3>Your Accounts</h3>
          <button 
            className="refresh-button"
            onClick={fetchAccounts}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="no-accounts">No accounts found. Create a new account to get started.</div>
        ) : (
          <div className="accounts-list">
            {accounts.map((account) => (
              <div 
                key={account.publicKey}
                className={`account-item ${activeAccount === account.publicKey ? 'active' : ''}`}
              >
                <div className="account-info">
                  <div className="account-name">
                    <span className="name">{account.name}</span>
                    {account.isMock && <span className="mock-tag">MOCK</span>}
                  </div>
                  <div className="account-pubkey">{formatPublicKey(account.publicKey)}</div>
                  <div className="account-balance">
                    {account.balance ? (
                      <span>{account.balance} XLM</span>
                    ) : (
                      <span className="unknown-balance">Balance unknown</span>
                    )}
                  </div>
                  <div className="account-network">
                    <span className={`network-badge ${account.network || 'testnet'}`}>
                      {account.network || 'testnet'}
                    </span>
                  </div>
                </div>
                <div className="account-actions">
                  {activeAccount !== account.publicKey && (
                    <button 
                      className="action-button select-button"
                      onClick={() => handleSetActiveAccount(account.publicKey)}
                    >
                      Select
                    </button>
                  )}
                  <button 
                    className="action-button refresh-balance-button"
                    onClick={() => handleRefreshBalance(account.name)}
                  >
                    Refresh Balance
                  </button>
                  <button 
                    className="action-button delete-button"
                    onClick={() => handleDeleteAccount(account.name, account.publicKey)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="create-account-section">
        <div className="section-header">
          <h3>Create New Account</h3>
          <button 
            className="toggle-mode-button"
            onClick={() => setIsImporting(!isImporting)}
          >
            {isImporting ? 'Generate Account' : 'Import Account'}
          </button>
        </div>

        {!isImporting ? (
          <div className="create-form">
            <div className="form-group">
              <label htmlFor="newAccountName">Account Name:</label>
              <input
                type="text"
                id="newAccountName"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <button 
              className="create-button"
              onClick={handleCreateAccount}
              disabled={isLoading || !newAccountName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
            <div className="help-text">
              This will create a new Stellar account on the {selectedNetwork} network.
              {selectedNetwork === 'testnet' && ' The account will be automatically funded with testnet XLM.'}
            </div>
          </div>
        ) : (
          <div className="import-form">
            <div className="form-group">
              <label htmlFor="importAccountName">Account Name:</label>
              <input
                type="text"
                id="importAccountName"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="secretKey">Secret Key:</label>
              <input
                type="password"
                id="secretKey"
                value={newSecretKey}
                onChange={(e) => setNewSecretKey(e.target.value)}
                placeholder="Enter secret key (S...)"
              />
            </div>
            <button 
              className="import-button"
              onClick={() => {/* Implement key import */}}
              disabled={isLoading || !newAccountName.trim() || !newSecretKey.trim()}
            >
              {isLoading ? 'Importing...' : 'Import Account'}
            </button>
            <div className="help-text warning">
              Warning: Never share your secret key with anyone. It provides full access to your account.
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .account-manager {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .account-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .account-manager-header h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .network-selector {
          display: flex;
          align-items: center;
        }
        
        .network-selector label {
          margin-right: 10px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .network-select {
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 8px 12px;
          font-size: 14px;
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
        
        .error-message {
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .success-message {
          background-color: rgba(105, 240, 174, 0.1);
          border-left: 3px solid var(--success);
          color: var(--success);
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .section-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .refresh-button, .toggle-mode-button {
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .refresh-button:hover, .toggle-mode-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .accounts-section {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .loading, .no-accounts {
          padding: 20px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .accounts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .account-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
        }
        
        .account-item:hover {
          background-color: var(--background-primary);
        }
        
        .account-item.active {
          border-left-color: var(--accent-primary);
          background-color: rgba(30, 136, 229, 0.05);
        }
        
        .account-info {
          flex: 1;
        }
        
        .account-name {
          font-weight: 500;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }
        
        .mock-tag {
          background-color: var(--space-pink);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }
        
        .account-pubkey {
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .account-balance {
          color: var(--space-light-blue);
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .unknown-balance {
          color: var(--text-secondary);
          font-style: italic;
        }
        
        .network-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .network-badge.testnet {
          background-color: rgba(255, 109, 0, 0.1);
          color: var(--space-orange);
        }
        
        .network-badge.mainnet {
          background-color: rgba(105, 240, 174, 0.1);
          color: var(--success);
        }
        
        .network-badge.local {
          background-color: rgba(123, 31, 162, 0.1);
          color: var(--space-purple);
        }
        
        .account-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-button {
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 12px;
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .select-button {
          background-color: rgba(30, 136, 229, 0.1);
          color: var(--space-bright-blue);
          border-color: rgba(30, 136, 229, 0.2);
        }
        
        .select-button:hover {
          background-color: rgba(30, 136, 229, 0.2);
          color: var(--space-bright-blue);
        }
        
        .delete-button {
          color: var(--error);
        }
        
        .delete-button:hover {
          background-color: rgba(255, 82, 82, 0.1);
          color: var(--error);
        }
        
        .create-account-section {
          margin-bottom: 20px;
        }
        
        .create-form, .import-form {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .form-group input {
          width: 100%;
          background-color: var(--background-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 10px 12px;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .help-text {
          margin-top: 16px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .help-text.warning {
          color: var(--warning);
        }
        
        .create-button, .import-button {
          width: 100%;
          padding: 10px;
          border-radius: var(--border-radius);
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-purple));
          color: white;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .create-button:hover, .import-button:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .create-button:disabled, .import-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AccountManager;
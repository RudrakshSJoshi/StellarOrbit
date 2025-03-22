// ====================================================================
// CREATE NEW FILE: src/pages/TransactionsPage.jsx
// ====================================================================

import { useState } from 'react';
import Header from '../components/layout/Header';
import TransactionBuilder from '../components/blockchain/TransactionBuilder';
import { useBlockchain } from '../contexts/BlockchainContext';

const TransactionsPage = () => {
  const { isLoading, error, network } = useBlockchain();
  const [activeTab, setActiveTab] = useState('build'); // build, history
  
  const tabs = [
    { id: 'build', label: 'Build Transaction' },
    { id: 'history', label: 'Transaction History' }
  ];
  
  return (
    <div className="transactions-page">
      <Header />
      
      <div className="transactions-content">
        <h1>Transactions</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="transactions-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'build' && (
          <div className="tab-content">
            <TransactionBuilder />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="history-container">
              <div className="section-header">
                <h2>Transaction History</h2>
                <div className="network-badge">{network}</div>
              </div>
              
              {isLoading ? (
                <div className="loading-message">Loading transaction history...</div>
              ) : (
                <div className="empty-history">
                  <div className="empty-icon">📜</div>
                  <h3>No Transaction History</h3>
                  <p>Your recent transactions will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .transactions-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .transactions-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
        
        .transactions-content h1 {
          margin-top: 0;
          margin-bottom: 24px;
          font-size: 28px;
          color: var(--text-primary);
        }
        
        .error-message {
          margin-bottom: 20px;
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
        }
        
        .transactions-tabs {
          display: flex;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tab-button {
          padding: 12px 20px;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          color: var(--text-primary);
        }
        
        .tab-button.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }
        
        .tab-content {
          margin-bottom: 24px;
        }
        
        .history-container {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .network-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          background-color: var(--background-tertiary);
          color: var(--space-bright-blue);
        }
        
        .loading-message {
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .empty-history {
          padding: 60px 20px;
          text-align: center;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .empty-history h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        
        .empty-history p {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default TransactionsPage;
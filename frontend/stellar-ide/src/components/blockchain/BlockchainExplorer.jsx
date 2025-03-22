// ====================================================================
// REPLACE YOUR EXISTING src/components/blockchain/BlockchainExplorer.jsx WITH THIS FILE
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const BlockchainExplorer = () => {
  const { network } = useBlockchain();
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('account'); // account, transaction, contract
  const [searchResult, setSearchResult] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch recent transactions (mock data for now)
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would call a blockchain API
        // For now, we'll use mock data
        setTimeout(() => {
          setRecentTransactions([
            {
              hash: 'Tx0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              from: 'G...1234',
              to: 'G...5678',
              amount: '100',
              asset: 'XLM',
              time: new Date().toISOString(),
              status: 'success'
            },
            {
              hash: 'Tx9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
              from: 'G...5678',
              to: 'G...9012',
              amount: '250',
              asset: 'XLM',
              time: new Date(Date.now() - 300000).toISOString(),
              status: 'success'
            },
            {
              hash: 'Txabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
              from: 'G...3456',
              to: 'G...7890',
              amount: '500',
              asset: 'XLM',
              time: new Date(Date.now() - 600000).toISOString(),
              status: 'success'
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError('Failed to fetch recent transactions');
        setIsLoading(false);
      }
    };
    
    fetchRecentTransactions();
  }, [network]);
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    
    try {
      // In a real implementation, this would call a blockchain API
      // For now, we'll use mock data based on search type
      setTimeout(() => {
        switch (searchType) {
          case 'account':
            setSearchResult({
              type: 'account',
              publicKey: searchInput.length > 10 ? searchInput : 'G' + 'A'.repeat(55),
              balance: '10000.0000000',
              sequence: '123456789',
              numSubEntries: 3,
              lastModified: new Date().toISOString(),
              transactions: [
                {
                  hash: 'Tx0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                  time: new Date().toISOString(),
                  status: 'success'
                },
                {
                  hash: 'Tx9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
                  time: new Date(Date.now() - 300000).toISOString(),
                  status: 'success'
                }
              ]
            });
            break;
          case 'transaction':
            setSearchResult({
              type: 'transaction',
              hash: searchInput.length > 10 ? searchInput : 'Tx' + '0'.repeat(64),
              ledger: 40507095,
              time: new Date().toISOString(),
              fee: '0.00001',
              status: 'success',
              operations: [
                {
                  type: 'payment',
                  from: 'G...1234',
                  to: 'G...5678',
                  amount: '100',
                  asset: 'XLM'
                }
              ]
            });
            break;
          case 'contract':
            setSearchResult({
              type: 'contract',
              contractId: searchInput.length > 10 ? searchInput : 'C' + 'A'.repeat(55),
              wasmHash: 'WASM' + '0'.repeat(60),
              created: new Date().toISOString(),
              owner: 'G...1234',
              methods: [
                { name: 'hello', args: ['symbol'] },
                { name: 'transfer', args: ['address', 'u32'] }
              ]
            });
            break;
          default:
            setError('Invalid search type');
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Search failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Format the time
  const formatTime = (time) => {
    return new Date(time).toLocaleString();
  };
  
  // Format hash for display
  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  return (
    <div className="blockchain-explorer">
      <div className="explorer-header">
        <h2>{network.charAt(0).toUpperCase() + network.slice(1)} Explorer</h2>
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <div className="search-type-selector">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type"
              >
                <option value="account">Account</option>
                <option value="transaction">Transaction</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            
            <input
              type="text"
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Enter ${searchType} ID or hash...`}
            />
            
            <button 
              type="submit" 
              className="search-button"
              disabled={isLoading || !searchInput.trim()}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {searchResult && (
        <div className="search-result">
          <h3>Search Result</h3>
          
          {searchResult.type === 'account' && (
            <div className="account-result">
              <div className="result-section">
                <h4>Account Details</h4>
                <div className="result-grid">
                  <div className="result-label">Public Key:</div>
                  <div className="result-value monospace">{searchResult.publicKey}</div>
                  
                  <div className="result-label">Balance:</div>
                  <div className="result-value">{searchResult.balance} XLM</div>
                  
                  <div className="result-label">Sequence Number:</div>
                  <div className="result-value">{searchResult.sequence}</div>
                  
                  <div className="result-label">Sub-entries:</div>
                  <div className="result-value">{searchResult.numSubEntries}</div>
                  
                  <div className="result-label">Last Modified:</div>
                  <div className="result-value">{formatTime(searchResult.lastModified)}</div>
                </div>
              </div>
              
              <div className="result-section">
                <h4>Recent Transactions</h4>
                <div className="transactions-list">
                  {searchResult.transactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-hash monospace">{formatHash(tx.hash)}</div>
                      <div className="tx-time">{formatTime(tx.time)}</div>
                      <div className={`tx-status status-${tx.status}`}>{tx.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {searchResult.type === 'transaction' && (
            <div className="transaction-result">
              <div className="result-section">
                <h4>Transaction Details</h4>
                <div className="result-grid">
                  <div className="result-label">Hash:</div>
                  <div className="result-value monospace">{searchResult.hash}</div>
                  
                  <div className="result-label">Ledger:</div>
                  <div className="result-value">{searchResult.ledger}</div>
                  
                  <div className="result-label">Time:</div>
                  <div className="result-value">{formatTime(searchResult.time)}</div>
                  
                  <div className="result-label">Fee:</div>
                  <div className="result-value">{searchResult.fee} XLM</div>
                  
                  <div className="result-label">Status:</div>
                  <div className={`result-value status-${searchResult.status}`}>
                    {searchResult.status}
                  </div>
                </div>
              </div>
              
              <div className="result-section">
                <h4>Operations</h4>
                <div className="operations-list">
                  {searchResult.operations.map((op, index) => (
                    <div key={index} className="operation-item">
                      <div className="op-type">{op.type}</div>
                      <div className="op-details">
                        <div className="op-label">From:</div>
                        <div className="op-value monospace">{op.from}</div>
                        
                        <div className="op-label">To:</div>
                        <div className="op-value monospace">{op.to}</div>
                        
                        <div className="op-label">Amount:</div>
                        <div className="op-value">{op.amount} {op.asset}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {searchResult.type === 'contract' && (
            <div className="contract-result">
              <div className="result-section">
                <h4>Contract Details</h4>
                <div className="result-grid">
                  <div className="result-label">Contract ID:</div>
                  <div className="result-value monospace">{searchResult.contractId}</div>
                  
                  <div className="result-label">WASM Hash:</div>
                  <div className="result-value monospace">{searchResult.wasmHash}</div>
                  
                  <div className="result-label">Created:</div>
                  <div className="result-value">{formatTime(searchResult.created)}</div>
                  
                  <div className="result-label">Owner:</div>
                  <div className="result-value monospace">{searchResult.owner}</div>
                </div>
              </div>
              
              <div className="result-section">
                <h4>Contract Methods</h4>
                <div className="methods-list">
                  {searchResult.methods.map((method, index) => (
                    <div key={index} className="method-item">
                      <div className="method-name">{method.name}</div>
                      <div className="method-args">
                        {method.args.map((arg, argIndex) => (
                          <span key={argIndex} className="method-arg">{arg}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        
        {isLoading && !searchResult ? (
          <div className="loading">Loading transactions...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="no-transactions">No recent transactions found</div>
        ) : (
          <div className="transactions-table">
            <div className="table-header">
              <div className="col-hash">Hash</div>
              <div className="col-from">From</div>
              <div className="col-to">To</div>
              <div className="col-amount">Amount</div>
              <div className="col-time">Time</div>
              <div className="col-status">Status</div>
            </div>
            
            {recentTransactions.map((tx, index) => (
              <div key={index} className="table-row">
                <div className="col-hash monospace">{formatHash(tx.hash)}</div>
                <div className="col-from monospace">{tx.from}</div>
                <div className="col-to monospace">{tx.to}</div>
                <div className="col-amount">{tx.amount} {tx.asset}</div>
                <div className="col-time">{formatTime(tx.time)}</div>
                <div className={`col-status status-${tx.status}`}>{tx.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .blockchain-explorer {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .explorer-header {
          margin-bottom: 20px;
        }
        
        .explorer-header h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .search-container {
          margin-bottom: 24px;
        }
        
        .search-input-wrapper {
          display: flex;
          align-items: center;
        }
        
        .search-type-selector {
          min-width: 120px;
        }
        
        .search-type {
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius) 0 0 var(--border-radius);
          padding: 10px 12px;
          height: 100%;
          width: 100%;
        }
        
        .search-input {
          flex: 1;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-right: none;
          border-left: none;
          padding: 10px 12px;
          font-family: monospace;
        }
        
        .search-button {
          background-color: var(--accent-primary);
          color: white;
          border-radius: 0 var(--border-radius) var(--border-radius) 0;
          padding: 10px 16px;
          font-weight: 500;
          min-width: 120px;
        }
        
        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error-message {
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .search-result, .recent-transactions {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          padding: 20px;
          margin-bottom: 24px;
        }
        
        .search-result h3, .recent-transactions h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .result-section {
          margin-bottom: 20px;
        }
        
        .result-section h4 {
          font-size: 16px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }
        
        .result-grid {
          display: grid;
          grid-template-columns: 150px 1fr;
          row-gap: 12px;
          column-gap: 16px;
        }
        
        .result-label {
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .monospace {
          font-family: monospace;
          word-break: break-all;
        }
        
        .transactions-list, .operations-list, .methods-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .transaction-item, .operation-item, .method-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
        }
        
        .tx-hash {
          flex: 1;
        }
        
        .tx-time {
          min-width: 150px;
          text-align: right;
          margin-right: 12px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .status-success {
          color: var(--success);
        }
        
        .status-pending {
          color: var(--warning);
        }
        
        .status-failed {
          color: var(--error);
        }
        
        .op-type {
          background-color: var(--accent-secondary);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          margin-right: 12px;
          font-size: 14px;
          text-transform: capitalize;
        }
        
        .op-details {
          flex: 1;
          display: grid;
          grid-template-columns: 60px 1fr;
          row-gap: 8px;
          column-gap: 12px;
        }
        
        .op-label {
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .method-name {
          font-weight: 500;
          margin-right: 12px;
        }
        
        .method-args {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .method-arg {
          background-color: var(--background-primary);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }
        
        .loading, .no-transactions {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .transactions-table {
          display: flex;
          flex-direction: column;
        }
        
        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 8px 12px;
        }
        
        .table-header {
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 12px;
        }
        
        .table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .table-row:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default BlockchainExplorer;
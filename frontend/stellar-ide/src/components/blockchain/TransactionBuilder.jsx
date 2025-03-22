// ====================================================================
// REPLACE YOUR EXISTING src/components/blockchain/TransactionBuilder.jsx WITH THIS FILE
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const TransactionBuilder = () => {
  const { accounts, activeAccount, network, isLoading } = useBlockchain();
  const [transactionType, setTransactionType] = useState('payment');
  const [sourceAccount, setSourceAccount] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('XLM');
  const [memo, setMemo] = useState('');
  const [fee, setFee] = useState('0.00001');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [buildResult, setBuildResult] = useState(null);
  const [signResult, setSignResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Available transaction types
  const transactionTypes = [
    { value: 'payment', label: 'Payment' },
    { value: 'createAccount', label: 'Create Account' },
    { value: 'changeTrust', label: 'Change Trust' },
    { value: 'contractInvoke', label: 'Invoke Contract' }
  ];
  
  // Available assets
  const assets = [
    { value: 'XLM', label: 'XLM (Stellar Lumens)' },
    { value: 'USDC', label: 'USDC (USD Coin)' },
    { value: 'custom', label: 'Custom Asset' }
  ];
  
  // Initialize source account when active account changes
  useEffect(() => {
    if (activeAccount) {
      const account = accounts.find(acc => acc.publicKey === activeAccount);
      if (account) {
        setSourceAccount(account.publicKey);
      }
    } else if (accounts.length > 0) {
      setSourceAccount(accounts[0].publicKey);
    }
  }, [activeAccount, accounts]);
  
  // Reset form when transaction type changes
  useEffect(() => {
    setBuildResult(null);
    setSignResult(null);
    setSubmitResult(null);
    setError(null);
  }, [transactionType]);
  
  // Build transaction
  const handleBuildTransaction = () => {
    // Validate required fields
    if (!sourceAccount) {
      setError('Source account is required');
      return;
    }
    
    if (!destination) {
      setError('Destination is required');
      return;
    }
    
    if (transactionType === 'payment' || transactionType === 'createAccount') {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Valid amount is required');
        return;
      }
    }
    
    setError(null);
    setBuildResult(null);
    setSignResult(null);
    setSubmitResult(null);
    
    try {
      // In a real implementation, this would create a transaction using Stellar SDK
      // For prototype, we just create a mock transaction
      const txXDR = 'AAAAAMJEOhp61ydGAAAAAPoFGHlUgXkYUGw9sEyna7QpQGmKbPj4jH//////////AAAAAAAAAAAAAAABAAAAAAAAAAEAAAABAAAAAMJEOhp61ydGAAAAAPoFGHlUgXkYUGw9sEyna7QpQGmKbPj4jH//////////AAAAAAAAAAAAAAABAAAAAQAAAADCRDoaetcnRgAAAAD6BRh5VIF5GFBsPbBMp2u0KUBpimz4+Ix//////////wAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
      
      // Set build result
      setBuildResult({
        xdr: txXDR,
        hash: 'Tx' + Array(64).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
        sourceAccount,
        sequenceNumber: '123456789',
        fee: fee + ' XLM',
        operations: [
          {
            type: transactionType,
            source: sourceAccount,
            destination,
            amount: amount + ' ' + asset,
            memo: memo || '(none)'
          }
        ]
      });
    } catch (err) {
      console.error('Error building transaction:', err);
      setError('Failed to build transaction: ' + err.message);
    }
  };
  
  // Sign transaction
  const handleSignTransaction = () => {
    if (!buildResult) {
      setError('Build a transaction first');
      return;
    }
    
    setError(null);
    setSignResult(null);
    setSubmitResult(null);
    
    try {
      // In a real implementation, this would sign the transaction using Stellar SDK
      // For prototype, we just create a mock signed transaction
      const signedXDR = buildResult.xdr + 'SIGNED';
      
      // Set sign result
      setSignResult({
        signedXDR,
        signatures: [
          {
            keyType: 'ed25519',
            hint: sourceAccount.substring(0, 8),
            signature: 'sig' + Array(128).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
          }
        ]
      });
    } catch (err) {
      console.error('Error signing transaction:', err);
      setError('Failed to sign transaction: ' + err.message);
    }
  };
  
  // Submit transaction
  const handleSubmitTransaction = () => {
    if (!signResult) {
      setError('Sign the transaction first');
      return;
    }
    
    setError(null);
    setSubmitResult(null);
    
    try {
      // In a real implementation, this would submit the transaction to the Stellar network
      // For prototype, we just create a mock submission result
      
      // Simulate network delay
      setTimeout(() => {
        // Set submit result
        setSubmitResult({
          success: true,
          hash: buildResult.hash,
          ledger: 40507095,
          resultCode: 'txSUCCESS',
          resultXDR: 'AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAJAAAAAAAAAAAAAAASFzYAvKJa'
        });
      }, 1000);
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError('Failed to submit transaction: ' + err.message);
    }
  };
  
  // Clear form
  const handleClearForm = () => {
    setTransactionType('payment');
    setDestination('');
    setAmount('');
    setAsset('XLM');
    setMemo('');
    setFee('0.00001');
    setShowAdvanced(false);
    setBuildResult(null);
    setSignResult(null);
    setSubmitResult(null);
    setError(null);
  };
  
  return (
    <div className="transaction-builder">
      <div className="builder-header">
        <h2>Transaction Builder</h2>
        <div className="network-badge">{network}</div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-container">
        <div className="form-section">
          <div className="form-row">
            <label htmlFor="txType">Transaction Type:</label>
            <select
              id="txType"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              disabled={!!buildResult}
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <label htmlFor="sourceAccount">Source Account:</label>
            <select
              id="sourceAccount"
              value={sourceAccount}
              onChange={(e) => setSourceAccount(e.target.value)}
              disabled={!!buildResult || accounts.length === 0}
            >
              {accounts.length === 0 ? (
                <option value="">No accounts available</option>
              ) : (
                accounts.map(account => (
                  <option key={account.publicKey} value={account.publicKey}>
                    {account.name} ({account.publicKey.substring(0, 4)}...{account.publicKey.substring(account.publicKey.length - 4)})
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="form-row">
            <label htmlFor="destination">Destination:</label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination account or contract ID"
              disabled={!!buildResult}
            />
          </div>
          
          {(transactionType === 'payment' || transactionType === 'createAccount') && (
            <>
              <div className="form-row">
                <label htmlFor="amount">Amount:</label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  disabled={!!buildResult}
                />
              </div>
              
              <div className="form-row">
                <label htmlFor="asset">Asset:</label>
                <select
                  id="asset"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  disabled={!!buildResult}
                >
                  {assets.map(assetOption => (
                    <option key={assetOption.value} value={assetOption.value}>{assetOption.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div className="form-row">
            <label htmlFor="memo">Memo (Optional):</label>
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a memo to your transaction"
              disabled={!!buildResult}
            />
          </div>
          
          <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            <span className="toggle-icon">{showAdvanced ? '▼' : '►'}</span>
            <span>Advanced Options</span>
          </div>
          
          {showAdvanced && (
            <div className="advanced-section">
              <div className="form-row">
                <label htmlFor="fee">Fee (XLM):</label>
                <input
                  id="fee"
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Enter transaction fee"
                  disabled={!!buildResult}
                />
              </div>
              
              {/* Add more advanced options as needed */}
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="action-button build-button"
            onClick={handleBuildTransaction}
            disabled={isLoading || !!buildResult}
          >
            Build Transaction
          </button>
          
          <button 
            className="action-button sign-button"
            onClick={handleSignTransaction}
            disabled={isLoading || !buildResult || !!signResult}
          >
            Sign Transaction
          </button>
          
          <button 
            className="action-button submit-button"
            onClick={handleSubmitTransaction}
            disabled={isLoading || !signResult || !!submitResult}
          >
            Submit Transaction
          </button>
          
          <button 
            className="action-button clear-button"
            onClick={handleClearForm}
            disabled={isLoading}
          >
            Clear Form
          </button>
        </div>
      </div>
      
      {buildResult && (
        <div className="result-section">
          <h3>Transaction Details</h3>
          
          <div className="result-content">
            <div className="result-item">
              <div className="result-label">Hash:</div>
              <div className="result-value monospace">{buildResult.hash}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Source Account:</div>
              <div className="result-value monospace">{buildResult.sourceAccount}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Sequence Number:</div>
              <div className="result-value">{buildResult.sequenceNumber}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Fee:</div>
              <div className="result-value">{buildResult.fee}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Operations:</div>
              <div className="result-value">
                {buildResult.operations.map((op, index) => (
                  <div key={index} className="operation-item">
                    <div className="operation-type">{op.type}</div>
                    <div className="operation-details">
                      {op.source && (
                        <div>
                          <span className="detail-label">Source:</span> {op.source}
                        </div>
                      )}
                      {op.destination && (
                        <div>
                          <span className="detail-label">Destination:</span> {op.destination}
                        </div>
                      )}
                      {op.amount && (
                        <div>
                          <span className="detail-label">Amount:</span> {op.amount}
                        </div>
                      )}
                      {op.memo && (
                        <div>
                          <span className="detail-label">Memo:</span> {op.memo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="result-item">
              <div className="result-label">XDR:</div>
              <div className="result-value xdr-value">
                <div className="xdr-content monospace">
                  {buildResult.xdr}
                </div>
                <button 
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(buildResult.xdr);
                    alert('XDR copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {signResult && (
        <div className="result-section">
          <h3>Signed Transaction</h3>
          
          <div className="result-content">
            <div className="result-item">
              <div className="result-label">Signatures:</div>
              <div className="result-value">
                {signResult.signatures.map((sig, index) => (
                  <div key={index} className="signature-item">
                    <div><span className="detail-label">Key Type:</span> {sig.keyType}</div>
                    <div><span className="detail-label">Hint:</span> {sig.hint}</div>
                    <div className="signature-value monospace">{sig.signature.substring(0, 32)}...</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Signed XDR:</div>
              <div className="result-value xdr-value">
                <div className="xdr-content monospace">
                  {signResult.signedXDR}
                </div>
                <button 
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(signResult.signedXDR);
                    alert('Signed XDR copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {submitResult && (
        <div className={`result-section ${submitResult.success ? 'success-section' : 'error-section'}`}>
          <h3>Transaction Submission {submitResult.success ? 'Successful' : 'Failed'}</h3>
          
          <div className="result-content">
            <div className="result-item">
              <div className="result-label">Hash:</div>
              <div className="result-value monospace">{submitResult.hash}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Ledger:</div>
              <div className="result-value">{submitResult.ledger}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Result Code:</div>
              <div className="result-value">{submitResult.resultCode}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Result XDR:</div>
              <div className="result-value monospace">{submitResult.resultXDR}</div>
            </div>
            
            {submitResult.success && (
              <div className="success-message">
                Transaction was successfully submitted to the network!
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .transaction-builder {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .builder-header h2 {
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
        
        .error-message {
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .form-section {
          background-color: var(--background-tertiary);
          padding: 20px;
          border-radius: var(--border-radius);
        }
        
        .form-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }
        
        .form-row label {
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .form-row input, .form-row select {
          padding: 10px 12px;
          background-color: var(--background-primary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-size: 14px;
        }
        
        .form-row input:disabled, .form-row select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .advanced-toggle {
          display: flex;
          align-items: center;
          padding: 8px 0;
          margin-bottom: 12px;
          cursor: pointer;
          color: var(--space-bright-blue);
          font-size: 14px;
        }
        
        .toggle-icon {
          margin-right: 8px;
          font-size: 12px;
        }
        
        .advanced-section {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .action-button {
          flex: 1;
          min-width: 160px;
          padding: 12px;
          border-radius: var(--border-radius);
          font-weight: 500;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .build-button {
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-blue));
          color: white;
        }
        
        .sign-button {
          background: linear-gradient(135deg, var(--space-purple), var(--accent-secondary));
          color: white;
        }
        
        .submit-button {
          background: linear-gradient(135deg, var(--space-orange), var(--accent-tertiary));
          color: white;
        }
        
        .clear-button {
          background-color: var(--background-primary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .action-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .result-section {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .result-section h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }
        
        .success-section {
          background-color: rgba(105, 240, 174, 0.1);
          border-left: 4px solid var(--success);
        }
        
        .error-section {
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 4px solid var(--error);
        }
        
        .result-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .result-item {
          display: flex;
          gap: 12px;
        }
        
        .result-label {
          min-width: 120px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .result-value {
          flex: 1;
          word-break: break-word;
        }
        
        .monospace {
          font-family: monospace;
        }
        
        .xdr-value {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .xdr-content {
          flex: 1;
          background-color: var(--background-primary);
          padding: 8px 12px;
          border-radius: var(--border-radius);
          overflow-x: auto;
          max-height: 80px;
          white-space: nowrap;
        }
        
        .copy-button {
          padding: 4px 8px;
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        }
        
        .copy-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .operation-item {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: var(--border-radius);
          margin-bottom: 8px;
        }
        
        .operation-type {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--space-bright-blue);
          text-transform: capitalize;
        }
        
        .operation-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
        }
        
        .detail-label {
          color: var(--text-secondary);
          margin-right: 4px;
        }
        
        .signature-item {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: var(--border-radius);
          margin-bottom: 8px;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .signature-value {
          margin-top: 4px;
          word-break: break-all;
        }
        
        .success-message {
          margin-top: 12px;
          padding: 12px;
          background-color: rgba(105, 240, 174, 0.1);
          border-radius: var(--border-radius);
          color: var(--success);
          text-align: center;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default TransactionBuilder;
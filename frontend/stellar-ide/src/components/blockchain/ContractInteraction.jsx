// ====================================================================
// REPLACE YOUR EXISTING src/components/blockchain/ContractInteraction.jsx WITH THIS FILE
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const ContractInteraction = ({ contractId }) => {
  const { callContract, isLoading, error, network, accounts, activeAccount } = useBlockchain();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodArgs, setMethodArgs] = useState({});
  const [callResult, setCallResult] = useState(null);
  const [callError, setCallError] = useState(null);
  const [contract, setContract] = useState(null);
  
  // Initialize contract from blockchain context
  useEffect(() => {
    if (!contractId) return;
    
    // Find contract in saved contracts
    const contractData = window.localStorage.getItem('stellarIDE_contracts');
    if (contractData) {
      try {
        const contracts = JSON.parse(contractData);
        const found = contracts.find(c => c.contractId === contractId);
        if (found) {
          setContract(found);
          
          // Set default method if available
          if (found.interface && found.interface.length > 0) {
            setSelectedMethod(found.interface[0].name);
            
            // Initialize argument values
            const initialArgs = {};
            found.interface[0].args.forEach(arg => {
              initialArgs[arg.name] = '';
            });
            setMethodArgs(initialArgs);
          }
        }
      } catch (err) {
        console.error('Error parsing contracts:', err);
      }
    }
  }, [contractId]);
  
  // Handle method selection
  const handleMethodChange = (methodName) => {
    if (!contract) return;
    
    setSelectedMethod(methodName);
    setCallResult(null);
    setCallError(null);
    
    // Initialize argument values for this method
    const method = contract.interface.find(m => m.name === methodName);
    if (method) {
      const initialArgs = {};
      method.args.forEach(arg => {
        initialArgs[arg.name] = '';
      });
      setMethodArgs(initialArgs);
    }
  };
  
  // Handle argument input
  const handleArgChange = (name, value) => {
    setMethodArgs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle contract call
  const handleCallContract = async () => {
    if (!contractId || !selectedMethod) return;
    
    setCallResult(null);
    setCallError(null);
    
    try {
      // Convert arguments to array in the correct order
      const method = contract.interface.find(m => m.name === selectedMethod);
      const argsArray = method.args.map(arg => methodArgs[arg.name]);
      
      const result = await callContract(contractId, selectedMethod, argsArray);
      setCallResult(result);
    } catch (err) {
      console.error('Error calling contract:', err);
      setCallError(err.message || 'Failed to call contract');
    }
  };
  
  if (!contractId) {
    return (
      <div className="contract-interaction">
        <div className="empty-state">
          No contract selected. Please select a contract to interact with.
        </div>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="contract-interaction">
        <div className="loading-state">
          Loading contract details...
        </div>
      </div>
    );
  }
  
  return (
    <div className="contract-interaction">
      <div className="interaction-header">
        <h2>Interact with Contract: {contract.name}</h2>
        <div className="contract-id">ID: {contract.contractId}</div>
      </div>
      
      <div className="method-selector">
        <label htmlFor="method-select">Select Method:</label>
        <select 
          id="method-select"
          value={selectedMethod || ''}
          onChange={(e) => handleMethodChange(e.target.value)}
          disabled={isLoading}
        >
          {contract.interface.map(method => (
            <option key={method.name} value={method.name}>
              {method.name}({method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ')})
            </option>
          ))}
        </select>
      </div>
      
      {selectedMethod && (
        <div className="method-args">
          <h3>Arguments</h3>
          
          {contract.interface
            .find(m => m.name === selectedMethod)
            .args.map(arg => (
              <div key={arg.name} className="arg-input">
                <label htmlFor={`arg-${arg.name}`}>
                  {arg.name} ({arg.type}):
                </label>
                <input
                  id={`arg-${arg.name}`}
                  type="text"
                  value={methodArgs[arg.name] || ''}
                  onChange={(e) => handleArgChange(arg.name, e.target.value)}
                  placeholder={`Enter ${arg.type} value`}
                  disabled={isLoading}
                />
              </div>
            ))}
          
          <button 
            className="call-button"
            onClick={handleCallContract}
            disabled={isLoading || !activeAccount}
          >
            {isLoading ? 'Calling...' : 'Call Method'}
          </button>
          
          {!activeAccount && (
            <div className="warning-message">
              You need to select an active account to call contract methods.
            </div>
          )}
        </div>
      )}
      
      {callError && (
        <div className="error-result">
          <h3>Error</h3>
          <div className="error-message">{callError}</div>
        </div>
      )}
      
      {callResult && (
        <div className="call-result">
          <h3>Result</h3>
          <pre className="result-data">
            {JSON.stringify(callResult, null, 2)}
          </pre>
        </div>
      )}
      
      <style jsx>{`
        .contract-interaction {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .interaction-header {
          margin-bottom: 20px;
        }
        
        .interaction-header h2 {
          margin: 0 0 8px 0;
          font-size: 20px;
        }
        
        .contract-id {
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .empty-state, .loading-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .method-selector {
          margin-bottom: 20px;
        }
        
        .method-selector label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .method-selector select {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-family: monospace;
        }
        
        .method-args {
          margin-bottom: 20px;
          padding: 16px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .method-args h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .arg-input {
          margin-bottom: 12px;
        }
        
        .arg-input label {
          display: block;
          margin-bottom: 6px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        
        .arg-input input {
          width: 100%;
          padding: 8px 12px;
          background-color: var(--background-primary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-family: monospace;
        }
        
        .call-button {
          width: 100%;
          padding: 10px;
          margin-top: 16px;
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-purple));
          color: white;
          font-weight: 500;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .call-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .call-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .warning-message {
          margin-top: 8px;
          color: var(--warning);
          font-size: 14px;
          text-align: center;
        }
        
        .error-result {
          margin-top: 20px;
          padding: 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-radius: var(--border-radius);
          border-left: 4px solid var(--error);
        }
        
        .error-result h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          color: var(--error);
        }
        
        .error-message {
          color: var(--error);
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .call-result {
          margin-top: 20px;
          padding: 16px;
          background-color: rgba(105, 240, 174, 0.1);
          border-radius: var(--border-radius);
          border-left: 4px solid var(--success);
        }
        
        .call-result h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          color: var(--success);
        }
        
        .result-data {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: var(--border-radius);
          max-height: 300px;
          overflow: auto;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default ContractInteraction;
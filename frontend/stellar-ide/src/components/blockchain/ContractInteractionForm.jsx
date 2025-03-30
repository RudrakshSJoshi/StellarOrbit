// ContractInteractionForm.jsx
import { useState } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const ContractInteractionForm = ({ contractId, contractAbi }) => {
  const { callContract, activeAccount, network, isLoading } = useBlockchain();
  const [selectedFunction, setSelectedFunction] = useState(contractAbi.functions[0]);
  const [paramValues, setParamValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle input change for a parameter
  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Convert input value to appropriate type for the Soroban network
  const convertParamValue = (value, type) => {
    if (!value) return null;
    
    switch (type) {
      case 'i32':
      case 'u32':
      case 'i64':
      case 'u64':
      case 'i128':
      case 'u128':
        return BigInt(value);
      case 'String':
        return String(value);
      case 'Address':
        return value; // Address is passed as-is to be handled by Soroban SDK
      case 'Bool':
        return Boolean(value === 'true' || value === true);
      default:
        return value;
    }
  };

  // Create appropriate input field based on parameter type
  const renderInputField = (param) => {
    // Skip env parameter as it's handled by the Soroban runtime
    if (param.name === 'env' && param.type === 'Env') {
      return null;
    }

    switch (param.type) {
      case 'Bool':
        return (
          <select
            value={paramValues[param.name] || ''}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            className="param-input"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case 'i32':
      case 'u32':
      case 'i64':
      case 'u64':
      case 'i128':
      case 'u128':
        return (
          <input
            type="text"
            value={paramValues[param.name] || ''}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            placeholder={`Enter ${param.type}`}
            className="param-input"
          />
        );
      case 'Address':
        return (
          <input
            type="text"
            value={paramValues[param.name] || ''}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            placeholder="G..."
            className="param-input address-input"
          />
        );
      default:
        return (
          <input
            type="text"
            value={paramValues[param.name] || ''}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            placeholder={`Enter ${param.type}`}
            className="param-input"
          />
        );
    }
  };

  // Handle function call
  const handleCallFunction = async () => {
    if (!activeAccount) {
      setError('No active account selected');
      return;
    }

    setError(null);
    setResult(null);
    
    try {
      // Prepare arguments array for contract call
      // Skip the 'env' parameter which is handled by Soroban runtime
      const args = selectedFunction.parameters
        .filter(param => param.name !== 'env' || param.type !== 'Env')
        .map(param => convertParamValue(paramValues[param.name], param.type));
      
      const response = await callContract(contractId, selectedFunction.name, args);
      
      setResult({
        success: true,
        data: response
      });
    } catch (err) {
      console.error('Error calling contract:', err);
      setError(err.message || 'Failed to call contract');
      setResult({
        success: false,
        error: err.message
      });
    }
  };

  return (
    <div className="contract-interaction-form">
      <div className="form-header">
        <h3>Interact with Contract</h3>
        <div className="network-badge">{network}</div>
      </div>

      <div className="function-selector">
        <label>Function:</label>
        <div className="function-pills">
          {contractAbi.functions.map(func => (
            <button
              key={func.name}
              className={`function-pill ${selectedFunction?.name === func.name ? 'active' : ''}`}
              onClick={() => {
                setSelectedFunction(func);
                setParamValues({});
                setResult(null);
                setError(null);
              }}
            >
              {func.name}
            </button>
          ))}
        </div>
      </div>

      <div className="function-signature">
        {selectedFunction.name}({selectedFunction.parameters
          .filter(p => p.name !== 'env' || p.type !== 'Env')
          .map(p => `${p.name}: ${p.type}`)
          .join(', ')}) 
        {selectedFunction.returns !== 'void' ? ` → ${selectedFunction.returns}` : ''}
      </div>

      <div className="params-container">
        {selectedFunction.parameters
          .filter(param => param.name !== 'env' || param.type !== 'Env')
          .map(param => (
            <div key={param.name} className="param-row">
              <label className="param-label">
                {param.name}: <span className="param-type">{param.type}</span>
              </label>
              {renderInputField(param)}
            </div>
          ))}
      </div>
      
      <div className="call-actions">
        <button
          className="call-button"
          onClick={handleCallFunction}
          disabled={isLoading || !activeAccount}
        >
          {isLoading ? 'Calling...' : 'Call Function'}
        </button>
        
        {!activeAccount && (
          <div className="warning">
            You need to select an active account to call contract functions.
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className="result-header">
            <h4>Result</h4>
          </div>
          <pre className="result-output">
            {typeof result.data === 'object' 
              ? JSON.stringify(result.data, null, 2) 
              : String(result.data)
            }
          </pre>
        </div>
      )}

      <style jsx>{`
        .contract-interaction-form {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          margin-top: 20px;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .form-header h3 {
          margin: 0;
          font-size: 20px;
        }
        
        .network-badge {
          padding: 4px 12px;
          background-color: var(--background-tertiary);
          border-radius: 12px;
          font-size: 14px;
          color: var(--accent-primary);
        }
        
        .function-selector {
          margin-bottom: 16px;
        }
        
        .function-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .function-pill {
          padding: 6px 12px;
          background-color: var(--background-tertiary);
          border-radius: 16px;
          font-size: 14px;
          color: var(--text-secondary);
          border: 1px solid transparent;
          cursor: pointer;
        }
        
        .function-pill:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .function-pill.active {
          background-color: var(--accent-primary);
          color: white;
        }
        
        .function-signature {
          padding: 10px 16px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          font-family: monospace;
          margin-bottom: 20px;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .params-container {
          margin-bottom: 20px;
        }
        
        .param-row {
          margin-bottom: 12px;
        }
        
        .param-label {
          display: block;
          margin-bottom: 6px;
          color: var(--text-primary);
        }
        
        .param-type {
          color: var(--accent-secondary);
          font-family: monospace;
        }
        
        .param-input {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          color: var(--text-primary);
          font-family: monospace;
        }
        
        .address-input {
          font-size: 14px;
        }
        
        .call-actions {
          margin-bottom: 20px;
        }
        
        .call-button {
          padding: 10px 16px;
          background-color: var(--accent-primary);
          color: white;
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .call-button:hover:not(:disabled) {
          box-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
        }
        
        .call-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .warning {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: rgba(255, 215, 64, 0.1);
          border-left: 3px solid var(--warning);
          color: var(--warning);
          border-radius: 4px;
          font-size: 14px;
        }
        
        .error-message {
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .result-container {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          overflow: hidden;
        }
        
        .result-header {
          padding: 10px 16px;
          background-color: rgba(105, 240, 174, 0.1);
          border-bottom: 1px solid rgba(105, 240, 174, 0.2);
        }
        
        .result-header h4 {
          margin: 0;
          color: var(--success);
        }
        
        .result-output {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default ContractInteractionForm;
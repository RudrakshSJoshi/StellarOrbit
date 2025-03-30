// src/components/blockchain/ContractInteractionForm.jsx
import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const ContractInteractionForm = ({ contractId, contractCode }) => {
  const { callContract, activeAccount, network, isLoading } = useBlockchain();
  const [contractAbi, setContractAbi] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze contract code to generate ABI when component mounts
  useEffect(() => {
    if (contractCode) {
      analyzeContractCode(contractCode);
    }
  }, [contractCode]);

  // Analyze contract code with the AI agent
  const analyzeContractCode = async (code) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code
        })
      });
      
      if (!response.ok) {
        throw new Error(`Agent error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AI Agent Response:', data);
      
      // Process the ABI from agent response
      let abi = null;
      if (data.abi) {
        abi = data.abi;
      } else if (data.agent_response) {
        // Try to parse abi from agent_response if it's in JSON format
        try {
          abi = JSON.parse(data.agent_response);
        } catch (e) {
          console.error('Failed to parse ABI from agent_response:', e);
        }
      }
      
      if (abi && abi.functions && abi.functions.length > 0) {
        setContractAbi(abi);
        setSelectedFunction(abi.functions[0]);
      } else {
        throw new Error('No valid ABI found in agent response');
      }
    } catch (err) {
      console.error('Error analyzing contract:', err);
      setError(`Failed to analyze contract: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle input change for a parameter
  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Create appropriate input field based on parameter type
  const renderInputField = (param) => {
    // Skip env parameter as it's handled by the Soroban runtime
    if (param.name === 'env' && param.type === 'Env') {
      return null;
    }

    switch (param.type) {
      case 'Bool':
      case 'bool':
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
      case 'address':
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
    if (!contractId) {
      setError('No contract ID provided');
      return;
    }

    setError(null);
    setResult(null);
    
    try {
      // Prepare arguments array for contract call
      // Skip the 'env' parameter which is handled by Soroban runtime
      const args = selectedFunction.parameters
        .filter(param => param.name !== 'env' || param.type !== 'Env')
        .map(param => paramValues[param.name]);
      
      console.log(`Calling contract ${contractId} function ${selectedFunction.name} with args:`, args);
      
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

  if (isAnalyzing) {
    return (
      <div className="analyzing-container">
        <div className="loading-spinner"></div>
        <div className="analyzing-text">Analyzing contract code with AI...</div>
      </div>
    );
  }

  if (error && !contractAbi) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-title">Error Analyzing Contract</div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!contractAbi || !selectedFunction) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <div className="empty-title">No Contract ABI Available</div>
        <div className="empty-message">Unable to generate interface for this contract.</div>
      </div>
    );
  }

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
          disabled={isLoading}
        >
          {isLoading ? 'Calling...' : 'Call Function'}
        </button>
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
        
        .analyzing-container, .empty-state, .error-container {
          padding: 40px 20px;
          text-align: center;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          margin-top: 20px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .analyzing-text, .empty-message {
          color: var(--text-secondary);
        }
        
        .empty-icon, .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .empty-title, .error-title {
          font-size: 20px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .error-container {
          background-color: rgba(255, 82, 82, 0.05);
        }
        
        .error-icon {
          color: var(--error);
        }
        
        .error-title {
          color: var(--error);
        }
      `}</style>
    </div>
  );
};

export default ContractInteractionForm;
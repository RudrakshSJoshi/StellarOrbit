// src/components/blockchain/ContractInteractionPanel.jsx
import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { getContractId, getContractAbi, invokeContractFunction } from '../../services/ContractService';

const ContractInteractionPanel = ({ directContractId, directFunction }) => {
  const { accounts, activeAccount, network, callContract } = useBlockchain();
  const { projects, activeProject } = useFileSystem();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contractAbi, setContractAbi] = useState(null);
  const [contractId, setContractId] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionParams, setFunctionParams] = useState({});
  const [functionResult, setFunctionResult] = useState(null);
  
  // Initialize from props or context
  useEffect(() => {
    if (activeProject) {
      setSelectedProject(activeProject);
      loadContractDetails(activeProject);
    }
  }, [activeProject]);
  
  // Handle direct contract interaction if a contract ID was passed in
  useEffect(() => {
    if (directContractId) {
      setContractId(directContractId);
      
      // Find a project that has this contract ID
      const findProjectWithContract = async () => {
        for (const proj of projects) {
          const id = await getContractId(proj);
          if (id === directContractId) {
            setSelectedProject(proj);
            await loadContractDetails(proj);
            break;
          }
        }
      };
      
      findProjectWithContract();
    }
  }, [directContractId, projects]);
  
  // Handle direct function selection if passed
  useEffect(() => {
    if (directFunction && contractAbi) {
      const func = contractAbi.functions.find(f => f.name === directFunction);
      if (func) {
        handleFunctionChange(func);
      }
    }
  }, [directFunction, contractAbi]);
  
  // Load contract details when a project is selected
  const loadContractDetails = async (projectName) => {
    if (!projectName) return;
    
    setIsLoading(true);
    setError(null);
    setContractAbi(null);
    setContractId('');
    
    try {
      // 1. Load contract ID from project's .stellar directory
      const contractId = await getContractId(projectName);
      if (contractId) {
        setContractId(contractId);
      }
      
      // 2. Generate contract ABI using the AI agent
      const abiData = await getContractAbi(projectName);
      
      // 3. Parse and store the ABI data
      if (abiData && abiData.functions && abiData.functions.length > 0) {
        setContractAbi(abiData);
        setSelectedFunction(abiData.functions[0]);
        
        // Initialize params for the first function
        const initialParams = {};
        abiData.functions[0].parameters.forEach(param => {
          // Skip env parameter as it's handled by the Soroban runtime
          if (!(param.name === 'env' && param.type === 'Env')) {
            initialParams[param.name] = '';
          }
        });
        setFunctionParams(initialParams);
      } else {
        throw new Error('Failed to generate ABI for contract');
      }
    } catch (err) {
      console.error('Error loading contract details:', err);
      setError(err.message || 'Failed to load contract details');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle project selection change
  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    if (projectName) {
      loadContractDetails(projectName);
    }
  };
  
  // Handle function selection change
  const handleFunctionChange = (func) => {
    setSelectedFunction(func);
    setFunctionResult(null);
    
    // Initialize params for the selected function
    const initialParams = {};
    func.parameters.forEach(param => {
      // Skip env parameter as it's handled by the Soroban runtime
      if (!(param.name === 'env' && param.type === 'Env')) {
        initialParams[param.name] = '';
      }
    });
    setFunctionParams(initialParams);
  };
  
  // Handle parameter input change
  const handleParamChange = (paramName, value) => {
    setFunctionParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  // Convert string value to appropriate type based on parameter type
  const convertParamValue = (value, type) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    switch (type.toLowerCase()) {
      case 'i32':
      case 'u32':
      case 'i64':
      case 'u64':
        return parseInt(value, 10);
      case 'bool':
        return value === 'true';
      default:
        return value;
    }
  };
  
  // Execute contract function
  const executeFunction = async () => {
    if (!selectedFunction) {
      setError('No function selected');
      return;
    }
    
    if (!contractId) {
      setError('Contract ID not found. Make sure the contract is deployed first.');
      return;
    }
    
    if (!activeAccount) {
      setError('No active account selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFunctionResult(null);
    
    try {
      // 1. Prepare function arguments
      const args = selectedFunction.parameters
        .filter(param => !(param.name === 'env' && param.type === 'Env'))
        .map(param => convertParamValue(functionParams[param.name], param.type));
      
      // 2. Get the source account name
      const sourceAccount = accounts.find(acc => acc.publicKey === activeAccount)?.name;
      if (!sourceAccount) {
        throw new Error('Could not find source account name');
      }
      
      // 3. Call the contract function using our service
      const callResult = await invokeContractFunction(
        contractId,
        selectedFunction.name,
        args,
        sourceAccount,
        network
      );
      
      setSuccess(`Function ${selectedFunction.name} executed successfully!`);
      setFunctionResult(callResult.result);
    } catch (err) {
      console.error('Error executing function:', err);
      setError(err.message || 'Failed to execute function');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get active account name
  const getActiveAccountName = () => {
    if (!activeAccount || !accounts || accounts.length === 0) {
      return null;
    }
    
    const account = accounts.find(acc => acc.publicKey === activeAccount);
    return account ? account.name : null;
  };
  
  const activeAccountName = getActiveAccountName();
  
  return (
    <div className="contract-interaction-panel">
      <div className="panel-header">
        <h2>Contract Interaction</h2>
        <div className="network-badge">{network}</div>
      </div>
      
      <div className="project-selector">
        <h3>Select Project</h3>
        <div className="select-wrapper">
          <select 
            value={selectedProject} 
            onChange={handleProjectChange}
            className="project-select"
            disabled={isLoading}
          >
            <option value="">-- Select a project --</option>
            {projects.map((project, index) => (
              <option key={index} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <div className="success-text">{success}</div>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading contract details...</div>
        </div>
      ) : contractAbi ? (
        <div className="contract-details">
          <div className="contract-info">
            <h3>Contract Information</h3>
            
            <div className="info-row">
              <div className="info-label">Contract ID:</div>
              <div className="info-value">
                {contractId ? (
                  <div className="contract-id">
                    <span className="id-text">{contractId}</span>
                    <button 
                      className="copy-button"
                      onClick={() => {
                        navigator.clipboard.writeText(contractId);
                        alert('Contract ID copied to clipboard!');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <span className="missing-info">Not deployed yet</span>
                )}
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-label">Active Account:</div>
              <div className="info-value">
                {activeAccountName ? (
                  <span className="account-name">{activeAccountName}</span>
                ) : (
                  <span className="missing-info">No account selected</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="function-container">
            <h3>Contract Functions</h3>
            
            <div className="function-list">
              {contractAbi.functions.map((func, index) => (
                <button 
                  key={index}
                  className={`function-button ${selectedFunction && selectedFunction.name === func.name ? 'active' : ''}`}
                  onClick={() => handleFunctionChange(func)}
                >
                  {func.name}
                </button>
              ))}
            </div>
            
            {selectedFunction && (
              <div className="function-details">
                <div className="function-signature">
                  <span className="function-name">{selectedFunction.name}</span>
                  <span className="function-params">
                    ({selectedFunction.parameters
                      .filter(param => !(param.name === 'env' && param.type === 'Env'))
                      .map(param => `${param.name}: ${param.type}`)
                      .join(', ')})
                  </span>
                  {selectedFunction.returns !== 'void' && (
                    <span className="function-returns"> → {selectedFunction.returns}</span>
                  )}
                </div>
                
                <div className="params-container">
                  {selectedFunction.parameters
                    .filter(param => !(param.name === 'env' && param.type === 'Env'))
                    .map((param, index) => (
                      <div key={index} className="param-item">
                        <label className="param-label">
                          {param.name}: <span className="param-type">{param.type}</span>
                        </label>
                        <input 
                          type="text"
                          className="param-input"
                          value={functionParams[param.name] || ''}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          placeholder={`Enter ${param.type} value`}
                        />
                      </div>
                  ))}
                </div>
                
                <button 
                  className="execute-button"
                  onClick={executeFunction}
                  disabled={isLoading || !contractId || !activeAccount}
                >
                  {isLoading ? 'Executing...' : 'Execute Function'}
                </button>
                
                {!contractId && (
                  <div className="warning-message">
                    Contract not deployed yet. Deploy the contract first from the Deploy tab.
                  </div>
                )}
                
                {!activeAccount && (
                  <div className="warning-message">
                    No active account selected. Select an account from the Accounts tab.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {functionResult !== null && (
            <div className="result-container">
              <h3>Function Result</h3>
              <pre className="result-output">
                {typeof functionResult === 'object' 
                  ? JSON.stringify(functionResult, null, 2)
                  : String(functionResult)
                }
              </pre>
            </div>
          )}
        </div>
      ) : selectedProject ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Contract ABI Found</h3>
          <p>
            Could not generate ABI for this project. Make sure the project contains valid Soroban contract code.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Select a Project</h3>
          <p>
            Choose a project from the dropdown above to interact with its contract.
          </p>
          {!selectedProject && projects.length === 0 && (
            <div className="no-projects-message">
              <p>No projects found. Create a project first from the backend code editor.</p>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .contract-interaction-panel {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .panel-header h2 {
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
        
        .project-selector {
          margin-bottom: 24px;
          background-color: var(--background-tertiary);
          padding: 16px;
          border-radius: var(--border-radius);
        }
        
        .project-selector h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 18px;
        }
        
        .select-wrapper {
          width: 100%;
        }
        
        .project-select {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--background-secondary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-size: 16px;
        }
        
        .error-message, .success-message {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: flex-start;
        }
        
        .error-message {
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
        }
        
        .success-message {
          background-color: rgba(105, 240, 174, 0.1);
          border-left: 3px solid var(--success);
        }
        
        .error-icon, .success-icon {
          margin-right: 8px;
          font-size: 18px;
        }
        
        .error-text {
          color: var(--error);
          flex: 1;
        }
        
        .success-text {
          color: var(--success);
          flex: 1;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          color: var(--text-secondary);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          font-size: 16px;
        }
        
        .contract-details {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .contract-info {
          background-color: var(--background-tertiary);
          padding: 16px;
          border-radius: var(--border-radius);
        }
        
        .contract-info h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .info-label {
          width: 120px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .info-value {
          flex: 1;
        }
        
        .contract-id {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .id-text {
          font-family: monospace;
          color: var(--space-bright-blue);
          word-break: break-all;
        }
        
        .copy-button {
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .copy-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .missing-info {
          color: var(--space-gray);
          font-style: italic;
        }
        
        .account-name {
          color: var(--space-light-blue);
        }
        
        .function-container {
          background-color: var(--background-tertiary);
          padding: 16px;
          border-radius: var(--border-radius);
        }
        
        .function-container h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .function-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .function-button {
          padding: 8px 16px;
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .function-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .function-button.active {
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }
        
        .function-details {
          background-color: var(--background-secondary);
          padding: 16px;
          border-radius: var(--border-radius);
          margin-top: 16px;
        }
        
        .function-signature {
          font-family: monospace;
          padding: 8px 12px;
          background-color: var(--background-primary);
          border-radius: var(--border-radius);
          margin-bottom: 16px;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .function-name {
          color: var(--space-light-blue);
          font-weight: 500;
        }
        
        .function-params {
          color: var(--text-primary);
        }
        
        .function-returns {
          color: var(--space-purple);
        }
        
        .params-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .param-item {
          display: flex;
          flex-direction: column;
        }
        
        .param-label {
          margin-bottom: 6px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .param-type {
          color: var(--space-purple);
          font-family: monospace;
        }
        
        .param-input {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-family: monospace;
        }
        
        .execute-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-purple));
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .execute-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .execute-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .warning-message {
          margin-top: 12px;
          padding: 8px 12px;
          background-color: rgba(255, 215, 64, 0.1);
          border-left: 3px solid var(--warning);
          color: var(--warning);
          border-radius: 4px;
          font-size: 14px;
        }
        
        .result-container {
          background-color: var(--background-tertiary);
          padding: 16px;
          border-radius: var(--border-radius);
        }
        
        .result-container h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .result-output {
          padding: 12px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          font-family: monospace;
          white-space: pre-wrap;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 0;
          color: var(--text-secondary);
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        
        .empty-state p {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .no-projects-message {
          margin-top: 16px;
          padding: 12px;
          background-color: rgba(255, 215, 64, 0.1);
          border-radius: var(--border-radius);
          color: var(--warning);
        }
      `}</style>
    </div>
  );
};

export default ContractInteractionPanel;
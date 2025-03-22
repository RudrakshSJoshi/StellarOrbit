// ====================================================================
// CREATE NEW FILE: src/components/blockchain/ContractDeployer.jsx
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { compileProject, deployProject } from '../../services/ApiService';

const ContractDeployer = ({ projectName }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compileOutput, setCompileOutput] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [deployOutput, setDeployOutput] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  
  const { accounts, activeAccount, network } = useBlockchain();
  
  // Get active account name
  const getActiveAccountName = () => {
    if (!activeAccount || !accounts || accounts.length === 0) {
      return null;
    }
    
    const account = accounts.find(acc => acc.publicKey === activeAccount);
    return account ? account.name : null;
  };
  
  const activeAccountName = getActiveAccountName();
  
  // Handle project compilation
  const handleCompile = async () => {
    if (!projectName) {
      setCompileError('No project selected');
      return;
    }
    
    setIsCompiling(true);
    setCompileError(null);
    setCompileOutput(null);
    setShowOutput(true);
    
    try {
      const result = await compileProject(projectName);
      
      if (result.success) {
        setCompileOutput({
          buildOutput: result.buildOutput || 'Compilation successful!',
          optimizeOutput: result.optimizeOutput || ''
        });
      } else {
        setCompileError(result.error || 'Compilation failed');
      }
    } catch (error) {
      setCompileError(error.message || 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Handle project deployment
  const handleDeploy = async () => {
    if (!projectName) {
      setDeployError('No project selected');
      return;
    }
    
    if (!activeAccountName) {
      setDeployError('No active account selected');
      return;
    }
    
    if (!compileOutput) {
      const confirmCompile = window.confirm('Project needs to be compiled first. Compile now?');
      if (confirmCompile) {
        await handleCompile();
      } else {
        return;
      }
    }
    
    setIsDeploying(true);
    setDeployError(null);
    setDeployOutput(null);
    setContractId(null);
    setShowOutput(true);
    
    try {
      const result = await deployProject(
        projectName,
        activeAccountName,
        network || 'testnet'
      );
      
      if (result.success) {
        setDeployOutput(result.output || 'Deployment successful!');
        
        if (result.contractId) {
          setContractId(result.contractId);
        }
      } else {
        setDeployError(result.error || 'Deployment failed');
      }
    } catch (error) {
      setDeployError(error.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };
  
  // Clear outputs
  const clearOutputs = () => {
    setCompileOutput(null);
    setCompileError(null);
    setDeployOutput(null);
    setDeployError(null);
    setContractId(null);
    setShowOutput(false);
  };
  
  return (
    <div className="contract-deployer">
      <div className="deployer-header">
        <h2>Compile & Deploy: {projectName || 'No Project Selected'}</h2>
        {(compileOutput || compileError || deployOutput || deployError) && (
          <button 
            className="clear-button"
            onClick={clearOutputs}
          >
            Clear Output
          </button>
        )}
      </div>
      
      <div className="actions-container">
        <div className="compile-section">
          <h3>Compilation</h3>
          <p className="section-description">
            Compile your Soroban contract to WebAssembly (WASM) format.
          </p>
          
          <button 
            className={`action-button compile-button ${isCompiling ? 'loading' : ''}`}
            onClick={handleCompile}
            disabled={isCompiling || isDeploying || !projectName}
          >
            {isCompiling ? 'Compiling...' : 'Compile Contract'}
          </button>
          
          {compileError && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{compileError}</div>
            </div>
          )}
          
          {compileOutput && (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <div className="success-text">Compilation successful!</div>
            </div>
          )}
        </div>
        
        <div className="deploy-section">
          <h3>Deployment</h3>
          <p className="section-description">
            Deploy your compiled contract to the Stellar {network} network.
          </p>
          
          <div className="deploy-account">
            <div className="deploy-account-label">Deploying Account:</div>
            {activeAccountName ? (
              <div className="deploy-account-name">{activeAccountName}</div>
            ) : (
              <div className="deploy-account-error">No account selected</div>
            )}
          </div>
          
          <button 
            className={`action-button deploy-button ${isDeploying ? 'loading' : ''}`}
            onClick={handleDeploy}
            disabled={isDeploying || isCompiling || !projectName || !activeAccountName}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </button>
          
          {deployError && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{deployError}</div>
            </div>
          )}
          
          {contractId && (
            <div className="contract-id-container">
              <div className="contract-id-label">Contract ID:</div>
              <div className="contract-id">{contractId}</div>
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
          )}
        </div>
      </div>
      
      {showOutput && (
        <div className="output-container">
          <div className="output-header">
            <h3>Output</h3>
          </div>
          
          <div className="output-content">
            {compileOutput && (
              <div className="output-section">
                <div className="output-section-header">Compilation Output:</div>
                <pre className="output-text">{compileOutput.buildOutput}</pre>
                
                {compileOutput.optimizeOutput && (
                  <>
                    <div className="output-section-header">Optimization Output:</div>
                    <pre className="output-text">{compileOutput.optimizeOutput}</pre>
                  </>
                )}
              </div>
            )}
            
            {deployOutput && (
              <div className="output-section">
                <div className="output-section-header">Deployment Output:</div>
                <pre className="output-text">{deployOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .contract-deployer {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .deployer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .deployer-header h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .clear-button {
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .clear-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .actions-container {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .compile-section, .deploy-section {
          flex: 1;
          background-color: var(--background-tertiary);
          padding: 20px;
          border-radius: var(--border-radius);
        }
        
        .section-description {
          color: var(--text-secondary);
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .deploy-account {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          padding: 8px 12px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
        }
        
        .deploy-account-label {
          margin-right: 10px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .deploy-account-name {
          font-weight: 500;
        }
        
        .deploy-account-error {
          color: var(--error);
          font-style: italic;
        }
        
        .action-button {
          width: 100%;
          padding: 12px;
          border-radius: var(--border-radius);
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .compile-button {
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-blue));
          color: white;
        }
        
        .deploy-button {
          background: linear-gradient(135deg, var(--space-orange), var(--space-pink));
          color: white;
        }
        
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading {
          position: relative;
          overflow: hidden;
        }
        
        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: loading-animation 1.5s infinite;
        }
        
        @keyframes loading-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        .error-message, .success-message {
          margin-top: 16px;
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
        }
        
        .contract-id-container {
          margin-top: 16px;
          padding: 12px;
          background-color: rgba(30, 136, 229, 0.1);
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .contract-id-label {
          margin-right: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .contract-id {
          font-family: monospace;
          color: var(--space-bright-blue);
          word-break: break-all;
          margin-right: 8px;
        }
        
        .copy-button {
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 4px;
        }
        
        .copy-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .output-container {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          margin-top: 20px;
        }
        
        .output-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .output-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .output-content {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .output-section {
          margin-bottom: 20px;
        }
        
        .output-section:last-child {
          margin-bottom: 0;
        }
        
        .output-section-header {
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .output-text {
          padding: 12px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 14px;
          overflow-x: auto;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default ContractDeployer;
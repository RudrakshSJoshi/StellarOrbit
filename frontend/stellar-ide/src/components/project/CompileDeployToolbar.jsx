import { useState } from 'react';
import { compileProject, deployProject } from '../../services/ApiService';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { useFileSystem } from '../../contexts/FileSystemContext';

const CompileDeployToolbar = ({ projectName }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compileOutput, setCompileOutput] = useState(null);
  const [deployOutput, setDeployOutput] = useState(null);
  const [error, setError] = useState(null);
  const { accounts, activeAccount, network } = useBlockchain();
  
  const handleCompile = async () => {
    if (!projectName) {
      setError('No project selected');
      return;
    }
    
    setError(null);
    setIsCompiling(true);
    setCompileOutput(null);
    
    try {
      const result = await compileProject(projectName);
      
      setCompileOutput({
        success: result.success,
        message: 'Compilation successful!',
        buildOutput: result.buildOutput,
        optimizeOutput: result.optimizeOutput
      });
      
      // Scroll terminal into view or show notification
      console.log('Compilation successful:', result);
    } catch (error) {
      setError(`Compilation failed: ${error.message}`);
      console.error('Compilation error:', error);
    } finally {
      setIsCompiling(false);
    }
  };
  
  const handleDeploy = async () => {
    if (!projectName) {
      setError('No project selected');
      return;
    }
    
    if (!activeAccount) {
      setError('No active account selected');
      return;
    }
    
    setError(null);
    setIsDeploying(true);
    setDeployOutput(null);
    
    try {
      const result = await deployProject(
        projectName,
        activeAccount, // source account
        network || 'testnet' // network
      );
      
      setDeployOutput({
        success: result.success,
        message: 'Deployment successful!',
        contractId: result.contractId,
        output: result.output
      });
      
      // Scroll terminal into view or show notification
      console.log('Deployment successful:', result);
    } catch (error) {
      setError(`Deployment failed: ${error.message}`);
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };
  
  return (
    <div className="compile-deploy-toolbar">
      <button 
        className={`toolbar-button compile-button ${isCompiling ? 'loading' : ''}`}
        onClick={handleCompile}
        disabled={isCompiling || isDeploying || !projectName}
      >
        <span className="button-icon">🔨</span>
        <span className="button-text">{isCompiling ? 'Compiling...' : 'Compile'}</span>
      </button>
      
      <button 
        className={`toolbar-button deploy-button ${isDeploying ? 'loading' : ''}`}
        onClick={handleDeploy}
        disabled={isDeploying || isCompiling || !projectName || !compileOutput?.success}
      >
        <span className="button-icon">🚀</span>
        <span className="button-text">{isDeploying ? 'Deploying...' : 'Deploy'}</span>
      </button>
      
      {error && (
        <div className="toolbar-error">
          {error}
        </div>
      )}
      
      <style jsx>{`
        .compile-deploy-toolbar {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 40px;
          background-color: var(--background-tertiary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .toolbar-button {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          margin-right: 8px;
          background-color: var(--background-secondary);
          color: var(--text-primary);
          font-size: 13px;
          transition: all 0.2s ease;
        }
        
        .toolbar-button:hover:not(:disabled) {
          background-color: var(--background-primary);
        }
        
        .compile-button {
          border-left: 3px solid var(--space-light-blue);
        }
        
        .deploy-button {
          border-left: 3px solid var(--space-orange);
        }
        
        .button-icon {
          margin-right: 6px;
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
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        .toolbar-error {
          color: var(--error);
          font-size: 12px;
          margin-left: 8px;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default CompileDeployToolbar;
// ====================================================================
// CREATE NEW FILE: src/components/blockchain/ContractList.jsx
// ====================================================================

import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const ContractList = () => {
  const { contractInstances, network, callContract } = useBlockchain();
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter contracts by current network
  const networkContracts = contractInstances.filter(
    contract => contract.network === network
  );
  
  // Load contract details when selected
  useEffect(() => {
    if (!selectedContract) {
      setContractDetails(null);
      return;
    }
    
    const loadContractDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch contract metadata
        // For now, we'll just use the contract instance data
        const contract = contractInstances.find(c => c.contractId === selectedContract);
        
        if (contract) {
          setContractDetails(contract);
        } else {
          setError('Contract not found');
        }
      } catch (err) {
        console.error('Error loading contract details:', err);
        setError(err.message || 'Failed to load contract details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContractDetails();
  }, [selectedContract, contractInstances]);
  
  // Format contract ID for display
  const formatContractId = (id) => {
    if (!id) return '';
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  return (
    <div className="contract-list">
      <div className="contract-list-header">
        <h2>Deployed Contracts</h2>
        <div className="network-badge">{network}</div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">Loading contracts...</div>
      ) : networkContracts.length === 0 ? (
        <div className="empty-list">
          <p>No contracts deployed to {network} yet.</p>
          <p className="empty-hint">Deploy a contract to see it here.</p>
        </div>
      ) : (
        <div className="contracts-container">
          <div className="contracts-grid">
            {networkContracts.map(contract => (
              <div 
                key={contract.contractId}
                className={`contract-card ${selectedContract === contract.contractId ? 'selected' : ''}`}
                onClick={() => setSelectedContract(contract.contractId)}
              >
                <div className="contract-name">{contract.name}</div>
                <div className="contract-id">{formatContractId(contract.contractId)}</div>
                <div className="contract-date">
                  {new Date(contract.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          
          {selectedContract && contractDetails && (
            <div className="contract-details">
              <h3>Contract Details</h3>
              
              <div className="detail-item">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{contractDetails.name}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Contract ID:</div>
                <div className="detail-value">
                  <span className="contract-id-full">{contractDetails.contractId}</span>
                  <button 
                    className="copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(contractDetails.contractId);
                      alert('Contract ID copied to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Owner:</div>
                <div className="detail-value">{formatContractId(contractDetails.ownerKey)}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Network:</div>
                <div className="detail-value">{contractDetails.network}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Deployed:</div>
                <div className="detail-value">
                  {new Date(contractDetails.createdAt).toLocaleString()}
                </div>
              </div>
              
              {contractDetails.interface && (
                <div className="contract-functions">
                  <h4>Contract Functions</h4>
                  
                  {contractDetails.interface.map((method, index) => (
                    <div key={index} className="function-item">
                      <div className="function-name">{method.name}</div>
                      <div className="function-args">
                        ({method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ')})
                      </div>
                      <button 
                        className="invoke-button"
                        onClick={() => {
                          // In a real implementation, this would show a modal to input args
                          alert(`Function ${method.name} would be called here`);
                        }}
                      >
                        Invoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .contract-list {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .contract-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .contract-list-header h2 {
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
        
        .loading-indicator {
          padding: 20px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .empty-list {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .empty-hint {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.7;
        }
        
        .contracts-container {
          display: flex;
          gap: 20px;
        }
        
        .contracts-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        
        .contract-card {
          padding: 16px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .contract-card:hover {
          background-color: var(--background-primary);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .contract-card.selected {
          border-color: var(--accent-primary);
          background-color: rgba(30, 136, 229, 0.1);
        }
        
        .contract-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .contract-id {
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .contract-date {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .contract-details {
          flex: 1;
          padding: 20px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .contract-details h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .detail-item {
          display: flex;
          margin-bottom: 12px;
        }
        
        .detail-label {
          width: 100px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .detail-value {
          flex: 1;
          display: flex;
          align-items: center;
        }
        
        .contract-id-full {
          font-family: monospace;
          word-break: break-all;
        }
        
        .copy-button {
          margin-left: 8px;
          padding: 4px 8px;
          font-size: 12px;
          background-color: var(--background-secondary);
          border-radius: 4px;
          color: var(--text-secondary);
        }
        
        .copy-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
        
        .contract-functions {
          margin-top: 24px;
        }
        
        .contract-functions h4 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        
        .function-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          margin-bottom: 8px;
        }
        
        .function-name {
          font-weight: 500;
          margin-right: 6px;
        }
        
        .function-args {
          color: var(--text-secondary);
          font-family: monospace;
          font-size: 14px;
          flex: 1;
        }
        
        .invoke-button {
          padding: 4px 10px;
          font-size: 12px;
          background-color: var(--accent-primary);
          color: white;
          border-radius: 4px;
        }
        
        .invoke-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default ContractList;
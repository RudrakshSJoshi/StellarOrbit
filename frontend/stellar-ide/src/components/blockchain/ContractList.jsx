// src/components/blockchain/ContractList.jsx
import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';
import ContractInteraction from './ContractInteraction';

const ContractList = () => {
  const { network, contractInstances, fetchContractInstances } = useBlockchain();
  const [selectedContract, setSelectedContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter contracts by current network
  const networkContracts = contractInstances?.filter(
    contract => contract.network === network
  ) || [];
  
  // Load contract instances when component mounts
  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If fetchContractInstances exists, call it
        if (typeof fetchContractInstances === 'function') {
          await fetchContractInstances();
        }
      } catch (err) {
        console.error('Error loading contract instances:', err);
        setError('Failed to load contracts');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContracts();
  }, [fetchContractInstances, network]);
  
  // Format contract ID for display
  const formatContractId = (id) => {
    if (!id) return '';
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };
  
  // Handle contract selection
  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
  };
  
  // Handle return to list
  const handleReturnToList = () => {
    setSelectedContract(null);
  };

  // If a contract is selected, show the interaction component
  if (selectedContract) {
    return (
      <div className="contract-list-container">
        <button 
          className="return-button"
          onClick={handleReturnToList}
        >
          ← Back to Contracts List
        </button>
        
        <ContractInteraction contractId={selectedContract.contractId} />
      </div>
    );
  }

  return (
    <div className="contract-list-container">
      <div className="contract-list-header">
        <h2>Deployed Contracts</h2>
        <div className="network-badge">{network}</div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">Loading contracts...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : networkContracts.length === 0 ? (
        <div className="empty-list">
          <p>No contracts deployed to {network} yet.</p>
          <p className="empty-hint">Deploy a contract to see it here.</p>
        </div>
      ) : (
        <div className="contracts-grid">
          {networkContracts.map(contract => (
            <div 
              key={contract.contractId}
              className="contract-card"
              onClick={() => handleContractSelect(contract)}
            >
              <div className="contract-name">{contract.name}</div>
              <div className="contract-id">{formatContractId(contract.contractId)}</div>
              <div className="contract-date">
                {new Date(contract.createdAt).toLocaleDateString()}
              </div>
              <button className="interact-button">Interact</button>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .contract-list-container {
          width: 100%;
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
        
        .error-message {
          padding: 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
          margin-bottom: 20px;
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
        
        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .contract-card {
          padding: 20px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          display: flex;
          flex-direction: column;
        }
        
        .contract-card:hover {
          background-color: var(--background-primary);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .contract-name {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 12px;
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
          margin-bottom: 16px;
        }
        
        .interact-button {
          margin-top: auto;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-blue));
          color: white;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .interact-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(30, 136, 229, 0.5);
        }
        
        .return-button {
          margin-bottom: 16px;
          padding: 8px 16px;
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .return-button:hover {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default ContractList;
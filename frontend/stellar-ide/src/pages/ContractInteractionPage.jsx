// src/pages/ContractInteractionPage.jsx
import React from 'react';
import Header from '../components/layout/Header';
import { useBlockchain } from '../contexts/BlockchainContext';
import ContractInterface from '../components/blockchain/ContractInterface';

const ContractInteractionPage = () => {
  const { error: blockchainError } = useBlockchain();
  
  return (
    <div className="contract-interaction-page">
      <Header />
      
      <div className="page-content">
        <h1>Interact with Smart Contracts</h1>
        
        {blockchainError && (
          <div className="error-message">
            {blockchainError}
          </div>
        )}
        
        <div className="interface-container">
          <ContractInterface />
        </div>
      </div>
      
      <style jsx>{`
        .contract-interaction-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .page-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
        
        .page-content h1 {
          margin-top: 0;
          margin-bottom: 24px;
          font-size: 28px;
          color: var(--text-primary);
        }
        
        .error-message {
          margin-bottom: 20px;
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
        }
        
        .interface-container {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default ContractInteractionPage;
// src/pages/InteractPage.jsx
import { useState } from 'react';
import Header from '../components/layout/Header';
import ContractList from '../components/blockchain/ContractList';
import { useBlockchain } from '../contexts/BlockchainContext';

const InteractPage = () => {
  const { isLoading, error } = useBlockchain();
  
  return (
    <div className="interact-page">
      <Header />
      
      <div className="interact-content">
        <h1>Interact with Smart Contracts</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="interact-container">
          <ContractList />
        </div>
      </div>
      
      <style jsx>{`
        .interact-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .interact-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
        
        .interact-content h1 {
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
        
        .interact-container {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default InteractPage;
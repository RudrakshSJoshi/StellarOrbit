// ====================================================================
// CREATE NEW FILE: src/pages/ExplorerPage.jsx
// ====================================================================

import Header from '../components/layout/Header';
import BlockchainExplorer from '../components/blockchain/BlockchainExplorer';
import { useBlockchain } from '../contexts/BlockchainContext';

const ExplorerPage = () => {
  const { isLoading, error } = useBlockchain();
  
  return (
    <div className="explorer-page">
      <Header />
      
      <div className="explorer-content">
        <h1>Blockchain Explorer</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="explorer-container">
          <BlockchainExplorer />
        </div>
      </div>
      
      <style jsx>{`
        .explorer-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .explorer-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
        
        .explorer-content h1 {
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
        
        .explorer-container {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default ExplorerPage;
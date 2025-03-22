// ====================================================================
// CREATE NEW FILE: src/pages/AccountsPage.jsx
// ====================================================================

import Header from '../components/layout/Header';
import AccountManager from '../components/blockchain/AccountManager';
import { BlockchainProvider } from '../contexts/BlockchainContext';

const AccountsPage = () => {
  return (
    
    <div className="accounts-page">
      <Header />
      
      <div className="accounts-content">
        <AccountManager />
      </div>
      
      <style jsx>{`
        .accounts-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .accounts-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
      `}</style>
    </div>
    
  );
};

export default AccountsPage;
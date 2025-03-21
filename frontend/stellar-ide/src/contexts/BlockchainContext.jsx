import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const BlockchainContext = createContext(null);

// Context provider component
export const BlockchainProvider = ({ children }) => {
  const [network, setNetwork] = useState('testnet'); // testnet, mainnet, or local
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [contractInstances, setContractInstances] = useState([]);
  
  // Initialize from local storage on mount
  useEffect(() => {
    const storedNetwork = localStorage.getItem('stellarIDE_network');
    if (storedNetwork) {
      setNetwork(storedNetwork);
    }
    
    const storedAccounts = localStorage.getItem('stellarIDE_accounts');
    if (storedAccounts) {
      try {
        const parsedAccounts = JSON.parse(storedAccounts);
        setAccounts(parsedAccounts);
        
        // Set active account if available
        const storedActiveAccount = localStorage.getItem('stellarIDE_activeAccount');
        if (storedActiveAccount && parsedAccounts.some(acc => acc.publicKey === storedActiveAccount)) {
          setActiveAccount(storedActiveAccount);
        }
      } catch (error) {
        console.error('Error parsing stored accounts:', error);
      }
    }
    
    const storedContracts = localStorage.getItem('stellarIDE_contracts');
    if (storedContracts) {
      try {
        setContractInstances(JSON.parse(storedContracts));
      } catch (error) {
        console.error('Error parsing stored contracts:', error);
      }
    }
  }, []);
  
  // Save data to local storage when changed
  useEffect(() => {
    localStorage.setItem('stellarIDE_network', network);
  }, [network]);
  
  useEffect(() => {
    localStorage.setItem('stellarIDE_accounts', JSON.stringify(accounts));
  }, [accounts]);
  
  useEffect(() => {
    if (activeAccount) {
      localStorage.setItem('stellarIDE_activeAccount', activeAccount);
    }
  }, [activeAccount]);
  
  useEffect(() => {
    localStorage.setItem('stellarIDE_contracts', JSON.stringify(contractInstances));
  }, [contractInstances]);
  
  // Connect to Stellar network
  const connectToNetwork = async () => {
    try {
      // In a real implementation, this would initialize SDK connections
      console.log(`Connecting to ${network}...`);
      setConnected(true);
      return true;
    } catch (error) {
      console.error(`Error connecting to ${network}:`, error);
      setConnected(false);
      return false;
    }
  };
  
  // Disconnect from network
  const disconnectFromNetwork = () => {
    setConnected(false);
  };
  
  // Change network
  const changeNetwork = async (newNetwork) => {
    if (newNetwork === network) return true;
    
    setNetwork(newNetwork);
    
    if (connected) {
      // Reconnect to new network
      return connectToNetwork();
    }
    
    return true;
  };
  
  // Create a new account
  const createAccount = (accountName) => {
    // In a real implementation, this would generate keypairs via Stellar SDK
    // For prototype, create a mock account
    const newAccount = {
      name: accountName,
      publicKey: 'G' + Array(56).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join(''),
      privateKey: 'S' + Array(56).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join(''),
      balance: '10000.0000000',
      assets: []
    };
    
    setAccounts(prev => [...prev, newAccount]);
    
    // If no active account, set this as active
    if (!activeAccount) {
      setActiveAccount(newAccount.publicKey);
    }
    
    return newAccount;
  };
  
  // Import an existing account
  const importAccount = (accountName, secretKey) => {
    // In a real implementation, this would validate and derive public key
    // For prototype, create a mock account
    try {
      // Verify it looks like a secret key (starts with S and is 56 chars)
      if (!secretKey.startsWith('S') || secretKey.length !== 56) {
        throw new Error('Invalid secret key format');
      }
      
      // Mock public key (in real app, would be derived from secret)
      const publicKey = 'G' + secretKey.slice(1);
      
      // Check if account already exists
      if (accounts.some(acc => acc.publicKey === publicKey)) {
        throw new Error('Account already imported');
      }
      
      const newAccount = {
        name: accountName,
        publicKey,
        privateKey: secretKey,
        balance: '10000.0000000',
        assets: []
      };
      
      setAccounts(prev => [...prev, newAccount]);
      
      // If no active account, set this as active
      if (!activeAccount) {
        setActiveAccount(newAccount.publicKey);
      }
      
      return newAccount;
    } catch (error) {
      console.error('Error importing account:', error);
      throw error;
    }
  };
  
  // Remove an account
  const removeAccount = (publicKey) => {
    setAccounts(prev => prev.filter(acc => acc.publicKey !== publicKey));
    
    // If removing active account, set a new active account or null
    if (activeAccount === publicKey) {
      const remainingAccounts = accounts.filter(acc => acc.publicKey !== publicKey);
      if (remainingAccounts.length > 0) {
        setActiveAccount(remainingAccounts[0].publicKey);
      } else {
        setActiveAccount(null);
      }
    }
  };
  
  // Fund account using Friendbot (testnet only)
  const fundAccountWithFriendbot = async (publicKey) => {
    if (network !== 'testnet') {
      throw new Error('Friendbot is only available on testnet');
    }
    
    try {
      // In a real implementation, this would call Friendbot API
      console.log(`Funding account ${publicKey} with Friendbot...`);
      
      // Update account balance (mock)
      setAccounts(prev => prev.map(acc => 
        acc.publicKey === publicKey
          ? { ...acc, balance: '10000.0000000' }
          : acc
      ));
      
      return true;
    } catch (error) {
      console.error('Error funding account with Friendbot:', error);
      throw error;
    }
  };
  
  // Deploy a contract
  const deployContract = async (contractName, wasmBase64, sourceHash, args = []) => {
    if (!connected) {
      throw new Error('Not connected to network');
    }
    
    if (!activeAccount) {
      throw new Error('No active account selected');
    }
    
    try {
      // In a real implementation, this would upload WASM and deploy contract
      console.log(`Deploying contract ${contractName}...`);
      
      // Mock contract ID
      const contractId = 'C' + Array(56).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('');
      
      const newContract = {
        name: contractName,
        contractId,
        ownerKey: activeAccount,
        network,
        createdAt: new Date().toISOString(),
        interface: [
          {
            name: 'hello',
            args: [{ name: 'to', type: 'symbol' }],
            returns: { type: 'vec', items: { type: 'symbol' } }
          }
        ]
      };
      
      setContractInstances(prev => [...prev, newContract]);
      
      return newContract;
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw error;
    }
  };
  
  // Call a contract method
  const callContract = async (contractId, method, args = []) => {
    if (!connected) {
      throw new Error('Not connected to network');
    }
    
    try {
      // In a real implementation, this would call the contract method
      console.log(`Calling contract ${contractId} method ${method} with args:`, args);
      
      // Mock response
      return {
        success: true,
        result: ['Hello', args[0] || 'World']
      };
    } catch (error) {
      console.error(`Error calling contract ${contractId} method ${method}:`, error);
      throw error;
    }
  };
  
  // Provide the context value
  const contextValue = {
    network,
    connected,
    accounts,
    activeAccount,
    contractInstances,
    setActiveAccount,
    connectToNetwork,
    disconnectFromNetwork,
    changeNetwork,
    createAccount,
    importAccount,
    removeAccount,
    fundAccountWithFriendbot,
    deployContract,
    callContract
  };
  
  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Custom hook to use the blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  
  return context;
};
// ====================================================================
// REPLACE YOUR EXISTING src/contexts/BlockchainContext.jsx WITH THIS FILE
// ====================================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const BlockchainContext = createContext(null);

// API URL
const API_URL = 'http://localhost:5001/api';

// Context provider component
export const BlockchainProvider = ({ children }) => {
  const [network, setNetwork] = useState('testnet'); // testnet, mainnet, or local
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [contractInstances, setContractInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize from local storage on mount
  useEffect(() => {
    const storedNetwork = localStorage.getItem('stellarIDE_network');
    if (storedNetwork) {
      setNetwork(storedNetwork);
    }
    
    const storedActiveAccount = localStorage.getItem('stellarIDE_activeAccount');
    if (storedActiveAccount) {
      setActiveAccount(storedActiveAccount);
    }
    
    const storedContracts = localStorage.getItem('stellarIDE_contracts');
    if (storedContracts) {
      try {
        setContractInstances(JSON.parse(storedContracts));
      } catch (error) {
        console.error('Error parsing stored contracts:', error);
      }
    }
    
    // Load accounts from API
    fetchAccounts();
  }, []);
  
  // Save data to local storage when changed
  useEffect(() => {
    localStorage.setItem('stellarIDE_network', network);
  }, [network]);
  
  useEffect(() => {
    if (activeAccount) {
      localStorage.setItem('stellarIDE_activeAccount', activeAccount);
    }
  }, [activeAccount]);
  
  useEffect(() => {
    localStorage.setItem('stellarIDE_contracts', JSON.stringify(contractInstances));
  }, [contractInstances]);
  
  // Fetch accounts from API
  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/accounts`);
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
        
        // If we have an activeAccount stored but it's not in the accounts list,
        // and we have accounts, set the first account as active
        if (activeAccount && 
            data.accounts.length > 0 && 
            !data.accounts.some(acc => acc.publicKey === activeAccount)) {
          setActiveAccount(data.accounts[0].publicKey);
        }
      } else {
        console.error('Error fetching accounts:', data.error);
        setError('Failed to load accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch contract instances
  const fetchContractInstances = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch(`${API_URL}/contracts`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.contracts) {
          setContractInstances(data.contracts);
          return data.contracts;
        }
      }
      
      // If API fails or no contracts, try loading from localStorage
      const storedContracts = localStorage.getItem('stellarIDE_contracts');
      if (storedContracts) {
        try {
          const contracts = JSON.parse(storedContracts);
          setContractInstances(contracts);
          return contracts;
        } catch (err) {
          console.error('Error parsing stored contracts:', err);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching contract instances:', error);
      return [];
    }
  };
  
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
  const createAccount = async (accountName) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: accountName,
          network: network,
          fund: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh accounts list
        await fetchAccounts();
        
        // Set as active account if none is set
        if (!activeAccount) {
          setActiveAccount(data.account.publicKey);
        }
        
        return data.account;
      } else {
        setError(data.error || 'Failed to create account');
        throw new Error(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
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
  const removeAccount = async (accountName) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/accounts/${accountName}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Get the public key before removing from state
        const account = accounts.find(acc => acc.name === accountName);
        const publicKey = account ? account.publicKey : null;
        
        // Remove from state
        setAccounts(prev => prev.filter(acc => acc.name !== accountName));
        
        // If removing active account, set a new active account or null
        if (activeAccount === publicKey) {
          const remainingAccounts = accounts.filter(acc => acc.name !== accountName);
          if (remainingAccounts.length > 0) {
            setActiveAccount(remainingAccounts[0].publicKey);
          } else {
            setActiveAccount(null);
          }
        }
        
        return true;
      } else {
        setError(data.error || 'Failed to delete account');
        return false;
      }
    } catch (error) {
      console.error('Error removing account:', error);
      setError(error.message || 'Failed to delete account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get account details with balance
  const getAccountDetails = async (accountName) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/accounts/${accountName}`);
      const data = await response.json();
      
      if (data.success) {
        // Update this account in the accounts list
        setAccounts(prev => prev.map(acc => 
          acc.name === accountName ? data.account : acc
        ));
        
        return data.account;
      } else {
        setError(data.error || 'Failed to get account details');
        return null;
      }
    } catch (error) {
      console.error('Error getting account details:', error);
      setError(error.message || 'Failed to get account details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fund account using Friendbot (testnet only)
  const fundAccountWithFriendbot = async (accountName) => {
    if (network !== 'testnet') {
      throw new Error('Friendbot is only available on testnet');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the account to get public key
      const account = accounts.find(acc => acc.name === accountName);
      if (!account) {
        throw new Error('Account not found');
      }
      
      // In a real implementation, this would call Friendbot API
      console.log(`Funding account ${accountName} with Friendbot...`);
      
      // Call stellar CLI to fund the account
      const { stdout, stderr } = await execAsync(`stellar account fund ${accountName}`);
      
      if (stderr && stderr.includes('error')) {
        throw new Error(stderr);
      }
      
      // After funding, get the updated account details
      await getAccountDetails(accountName);
      
      return true;
    } catch (error) {
      console.error('Error funding account with Friendbot:', error);
      setError(error.message || 'Failed to fund account');
      throw error;
    } finally {
      setIsLoading(false);
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
    isLoading,
    error,
    setActiveAccount,
    connectToNetwork,
    disconnectFromNetwork,
    changeNetwork,
    createAccount,
    importAccount,
    removeAccount,
    getAccountDetails,
    fundAccountWithFriendbot,
    deployContract,
    callContract,
    fetchAccounts,
    fetchContractInstances
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
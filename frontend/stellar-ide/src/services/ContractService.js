// src/services/ContractService.js
const API_URL = 'http://localhost:5001/api';

// Get contract ID for a project
export const getContractId = async (projectName) => {
  try {
    console.log(`Getting contract ID for project: ${projectName}`);
    const response = await fetch(`${API_URL}/projects/${projectName}/contract-id`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Contract not deployed yet
        console.log(`No contract ID found for project ${projectName}`);
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get contract ID');
    }
    
    console.log(`Found contract ID for project ${projectName}: ${data.contractId}`);
    return data.contractId;
  } catch (error) {
    console.error(`Error getting contract ID for project ${projectName}:`, error);
    return null;
  }
};

// Save contract ID for a project
export const saveContractId = async (projectName, contractId) => {
  try {
    console.log(`Saving contract ID for project ${projectName}: ${contractId}`);
    const response = await fetch(`${API_URL}/projects/${projectName}/contract-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contractId })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to save contract ID');
    }
    
    console.log(`Successfully saved contract ID for project ${projectName}`);
    return true;
  } catch (error) {
    console.error(`Error saving contract ID for project ${projectName}:`, error);
    throw error;
  }
};

// Invoke a contract function
export const invokeContractFunction = async (contractId, functionName, args, source, network = 'testnet') => {
  try {
    console.log(`Invoking contract function ${functionName} on contract ${contractId}`);
    const response = await fetch(`${API_URL}/contracts/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contractId,
        function: functionName,
        args,
        source,
        network
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to invoke contract function');
    }
    
    return data;
  } catch (error) {
    console.error(`Error invoking contract function ${functionName}:`, error);
    throw error;
  }
};

// Get contract ABI (by analyzing the contract source)
export const getContractAbi = async (projectName) => {
  try {
    console.log(`Getting contract ABI for project ${projectName}`);
    // First try to get lib.rs from main source directory
    let sourceResponse = await fetch(`${API_URL}/projects/${projectName}/files/src/lib.rs`);
    let sourceData;
    
    if (sourceResponse.ok) {
      sourceData = await sourceResponse.json();
    } else {
      // If lib.rs doesn't exist, try alternative paths
      const alternativePaths = [
        `${API_URL}/projects/${projectName}/files/contracts/hello-world/src/lib.rs`,
        `${API_URL}/projects/${projectName}/files/src/main.rs`
      ];
      
      for (const path of alternativePaths) {
        sourceResponse = await fetch(path);
        if (sourceResponse.ok) {
          sourceData = await sourceResponse.json();
          break;
        }
      }
      
      if (!sourceData) {
        throw new Error('Could not find contract source file');
      }
    }
    
    if (!sourceData.success || !sourceData.content) {
      throw new Error('Failed to get contract source code');
    }
    
    // Call the AI agent to analyze the code and generate an ABI
    console.log(`Calling agent to analyze contract code for project ${projectName}`);
    
    const agentResponse = await fetch('http://localhost:8000/functioniser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: sourceData.content
      })
    });
    
    if (!agentResponse.ok) {
      throw new Error(`Agent API error: ${agentResponse.status}`);
    }
    
    const abiData = await agentResponse.json();
    
    // Process the ABI from the agent
    if (!abiData) {
      throw new Error('Failed to get ABI from the agent');
    }
    
    console.log(`Generated ABI for project ${projectName}:`, abiData);
    return abiData;
    
  } catch (error) {
    console.error(`Error getting contract ABI for project ${projectName}:`, error);
    throw error;
  }
};
// src/pages/InteractPage.jsx
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ContractInteractionPanel from '../components/blockchain/ContractInteractionPanel';
import { useFileSystem } from '../contexts/FileSystemContext';
import { useBlockchain } from '../contexts/BlockchainContext';

const InteractPage = () => {
  const { projects, activeProject, switchProject } = useFileSystem();
  const { isLoading: blockchainLoading, error } = useBlockchain();
  const [selectedProject, setSelectedProject] = useState(activeProject || '');
  const [isLoading, setIsLoading] = useState(false);

  // Get URL parameters for direct contract interaction
  const [directContractId, setDirectContractId] = useState(null);
  const [directFunction, setDirectFunction] = useState(null);
  
  useEffect(() => {
    // Parse URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const contractParam = searchParams.get('contract');
    const functionParam = searchParams.get('function');
    
    if (contractParam) {
      setDirectContractId(contractParam);
    }
    
    if (functionParam) {
      setDirectFunction(functionParam);
    }
  }, []);

  // Function to fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/projects');
      const data = await response.json();

      if (data.success && data.projects) {
        // This is handled by the FileSystemContext,
        // but we need to trigger a refresh
        if (data.projects.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects when the component mounts
  useEffect(() => {
    if (activeProject) {
      setSelectedProject(activeProject);
    }
    fetchProjects();
  }, [activeProject]);

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
          <ContractInteractionPanel 
            directContractId={directContractId}
            directFunction={directFunction}
          />
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
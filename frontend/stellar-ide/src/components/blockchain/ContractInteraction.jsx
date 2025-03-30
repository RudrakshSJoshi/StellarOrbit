// src/components/blockchain/ContractInteraction.jsx
import { useState, useEffect } from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import ContractInteractionForm from './ContractInteractionForm';

const ContractInteraction = ({ contractId }) => {
  const { network, isLoading } = useBlockchain();
  const { projects, activeProject } = useFileSystem();
  const [contractCode, setContractCode] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(activeProject || '');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsList, setProjectsList] = useState([]);
  
  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await fetch('http://localhost:5001/api/projects');
        const data = await response.json();
        
        if (data.success && data.projects) {
          setProjectsList(data.projects);
          if (!selectedProject && data.projects.length > 0) {
            setSelectedProject(data.projects[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Fetch contract code when contractId changes
  useEffect(() => {
    if (contractId) {
      fetchContractCode(contractId);
    }
  }, [contractId]);
  
  // Fetch contract code from backend
  const fetchContractCode = async (id) => {
    setIsLoadingCode(true);
    setError(null);
    
    try {
      // Determine which project the contract is from
      const contractsResponse = await fetch('http://localhost:5001/api/contracts');
      const contractsData = await contractsResponse.json();
      
      if (!contractsData.success) {
        throw new Error('Failed to fetch contracts list');
      }
      
      const contract = contractsData.contracts.find(c => c.contractId === id);
      
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      
      // Fetch contract source code
      const sourceResponse = await fetch(`http://localhost:5001/api/projects/${contract.project}/files/src/lib.rs`);
      const sourceData = await sourceResponse.json();
      
      if (!sourceData.success) {
        throw new Error('Failed to fetch contract source code');
      }
      
      setContractCode(sourceData.content);
      setSelectedProject(contract.project);
    } catch (err) {
      console.error('Error fetching contract code:', err);
      setError(err.message || 'Failed to fetch contract code');
    } finally {
      setIsLoadingCode(false);
    }
  };
  
  // Fetch project code manually
  const fetchProjectCode = async (projectName) => {
    if (!projectName) return;
    
    setIsLoadingCode(true);
    setError(null);
    
    try {
      // Fetch contract source code
      const sourceResponse = await fetch(`http://localhost:5001/api/projects/${projectName}/files/src/lib.rs`);
      const sourceData = await sourceResponse.json();
      
      if (!sourceData.success) {
        throw new Error('Failed to fetch contract source code');
      }
      
      setContractCode(sourceData.content);
    } catch (err) {
      console.error('Error fetching project code:', err);
      setError(err.message || 'Failed to fetch project code');
    } finally {
      setIsLoadingCode(false);
    }
  };
  
  // Handle project change
  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    fetchProjectCode(projectName);
  };
  
  // If no contractId provided, show project selector
  if (!contractId) {
    return (
      <div className="contract-interaction">
        <div className="interaction-header">
          <h2>Interact with Contract</h2>
        </div>
        
        <div className="project-selector">
          <h3>Select Project to Interact With</h3>
          
          {isLoadingProjects ? (
            <div className="loading-state">Loading projects...</div>
          ) : projectsList.length === 0 ? (
            <div className="empty-state">
              No projects found. Create a project first.
            </div>
          ) : (
            <div className="project-selection">
              <select 
                value={selectedProject} 
                onChange={handleProjectChange}
                className="project-select"
              >
                <option value="">-- Select a project --</option>
                {projectsList.map((project, index) => (
                  <option key={index} value={project.name || project}>
                    {project.name || project}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {isLoadingCode ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading project code...</div>
          </div>
        ) : selectedProject && contractCode ? (
          <ContractInteractionForm 
            contractId={null} 
            contractCode={contractCode}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="contract-interaction">
      <div className="interaction-header">
        <h2>Interact with Contract</h2>
        <div className="contract-id">ID: {contractId}</div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isLoadingCode ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading contract details...</div>
        </div>
      ) : contractCode ? (
        <ContractInteractionForm 
          contractId={contractId} 
          contractCode={contractCode}
        />
      ) : (
        <div className="no-code-state">
          Could not load contract code. Please try again later.
        </div>
      )}
      
      <style jsx>{`
        .contract-interaction {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-primary);
        }
        
        .interaction-header {
          margin-bottom: 20px;
        }
        
        .interaction-header h2 {
          margin: 0 0 8px 0;
          font-size: 20px;
        }
        
        .contract-id {
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .empty-state, .loading-state, .no-code-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          margin-bottom: 20px;
          padding: 12px 16px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ContractInteraction;
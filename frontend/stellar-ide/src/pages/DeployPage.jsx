// ====================================================================
// CREATE NEW FILE: src/pages/DeployPage.jsx
// ====================================================================

import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ContractDeployer from '../components/blockchain/ContractDeployer';
import { useFileSystem } from '../contexts/FileSystemContext';
import { BlockchainProvider } from '../contexts/BlockchainContext';


const DeployPage = () => {
  const { projects, activeProject, switchProject } = useFileSystem();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(activeProject || '');

  // Load projects when the component mounts
  useEffect(() => {
    // If active project is already set, use it as the selected project
    if (activeProject) {
      setSelectedProject(activeProject);
    }
    setIsLoading(false);
  }, [activeProject]);

  // Handle project change
  const handleProjectChange = async (e) => {
    const newProject = e.target.value;
    setSelectedProject(newProject);
    
    if (newProject) {
      try {
        await switchProject(newProject);
      } catch (error) {
        console.error('Error switching project:', error);
      }
    }
  };

  return (
    
    <div className="deploy-page">
      <Header />
      
      <div className="deploy-content">
        <div className="project-selector">
          <h2>Select Project to Deploy</h2>
          
          {isLoading ? (
            <div className="loading">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="no-projects-message">
              <p>You don't have any projects yet. Create one from the IDE first.</p>
            </div>
          ) : (
            <div className="project-select-container">
              <select 
                value={selectedProject} 
                onChange={handleProjectChange}
                className="project-select"
              >
                <option value="">-- Select a project --</option>
                {projects.map((project, index) => (
                  <option key={index} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="deployer-container">
          <ContractDeployer projectName={selectedProject} />
        </div>
      </div>
      
      <style jsx>{`
        .deploy-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .deploy-content {
          flex: 1;
          padding: 24px;
          overflow: auto;
          background-color: var(--background-primary);
        }
        
        .project-selector {
          margin-bottom: 24px;
        }
        
        .project-selector h2 {
          margin: 0 0 16px 0;
          font-size: 24px;
          color: var(--text-primary);
        }
        
        .loading, .no-projects-message {
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
        }
        
        .project-select-container {
          background-color: var(--background-secondary);
          padding: 20px;
          border-radius: var(--border-radius);
        }
        
        .project-select {
          width: 100%;
          padding: 12px;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          font-size: 16px;
        }
      `}</style>
    </div>
   
  );
};

export default DeployPage;
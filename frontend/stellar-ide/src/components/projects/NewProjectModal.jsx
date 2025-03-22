import { useState } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';

const NewProjectModal = ({ onClose, onProjectCreated }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [projectType, setProjectType] = useState('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createProject } = useFileSystem();
  
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    // Validate project name (only lowercase letters, numbers, and hyphens)
    const validNameRegex = /^[a-z0-9-]+$/;
    if (!validNameRegex.test(newProjectName)) {
      setError('Project name must contain only lowercase letters, numbers, and hyphens');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    setIsLoading(true);
    
    try {
      await createProject(newProjectName);
      
      // Notify parent component
      if (onProjectCreated) {
        onProjectCreated(newProjectName);
      }
    } catch (error) {
      setError(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Soroban Project</h3>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✖
          </button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              className="form-control"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="my-stellar-project"
              disabled={isLoading}
            />
            <div className="form-hint">
              Use lowercase letters, numbers, and hyphens only. This will be used as the contract name.
            </div>
          </div>
          
          <div className="form-group">
            <label>Contract Template</label>
            <select 
              className="form-control"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              disabled={isLoading}
            >
              <option value="token">Token Contract</option>
              <option value="hello-world">Hello World</option>
              <option value="escrow">Escrow Contract</option>
            </select>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="create-button"
            onClick={handleCreateProject}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          width: 450px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .modal-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .close-button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          border-radius: 50%;
          color: var(--text-secondary);
        }
        
        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .modal-content {
          padding: 16px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .form-control {
          width: 100%;
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 10px 12px;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .form-hint {
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .error-message {
          margin-top: 8px;
          padding: 8px 12px;
          background-color: rgba(255, 82, 82, 0.1);
          border-left: 3px solid var(--error);
          color: var(--error);
          border-radius: 4px;
          font-size: 13px;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .cancel-button {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-radius: var(--border-radius);
          padding: 8px 16px;
          margin-right: 8px;
        }
        
        .create-button {
          background-color: var(--accent-primary);
          color: white;
          border-radius: var(--border-radius);
          padding: 8px 16px;
          min-width: 120px;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default NewProjectModal;
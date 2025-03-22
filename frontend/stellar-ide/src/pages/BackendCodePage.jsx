// src/pages/BackendCodePage.jsx
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ProjectCodeWorkspace from '../components/project/ProjectCodeWorkspace';
import Terminal from '../components/terminal/Terminal';

const BackendCodePage = () => {
  const { projectName } = useParams();
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5001/api/projects');
        const data = await response.json();
        
        if (data.success && data.projects) {
          setProjects(data.projects);
          console.log("Loaded projects in page:", data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Redirect to the first project if none is selected
  if (!isLoading && !projectName && projects.length > 0) {
    return <Navigate to={`/backend-code/${projects[0]}`} replace />;
  }
  
  // Handle terminal resize
  const startResize = (e) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startHeight = terminalHeight;
    
    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + delta, 40), // Min height 40px
        window.innerHeight - 200 // Max height: window height - 200px for workspace
      );
      
      setTerminalHeight(newHeight);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const toggleTerminal = () => {
    setIsTerminalVisible(!isTerminalVisible);
  };
  
  return (
    <div className="backend-code-page">
      <Header />
      
      <div className="backend-code-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div>Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="no-projects">
            <div className="message-box">
              <div className="icon">📁</div>
              <h3>No Projects Found</h3>
              <p>Create a project first to edit backend code.</p>
              <button 
                className="create-project-btn"
                onClick={() => window.location.href = '/'}
              >
                Go to IDE
              </button>
            </div>
          </div>
        ) : (
          <>
            <ProjectCodeWorkspace projectName={projectName} />
            
            {isTerminalVisible && (
              <>
                <div 
                  className="resize-handle"
                  onMouseDown={startResize}
                ></div>
                
                <div 
                  className="terminal-container"
                  style={{ height: `${terminalHeight}px` }}
                >
                  <Terminal onClose={toggleTerminal} />
                </div>
              </>
            )}
            
            {!isTerminalVisible && (
              <div className="terminal-toggle">
                <button onClick={toggleTerminal}>
                  Show Terminal
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <style jsx>{`
        .backend-code-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .backend-code-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        
        .loading-container, .no-projects {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
          margin-right: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .message-box {
          text-align: center;
          padding: 32px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .message-box h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }
        
        .message-box p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }
        
        .create-project-btn {
          background: linear-gradient(135deg, var(--space-light-blue), var(--space-purple));
          color: white;
          padding: 10px 20px;
          border-radius: var(--border-radius);
          font-weight: 500;
        }
        
        .resize-handle {
          height: 6px;
          background-color: var(--background-tertiary);
          cursor: ns-resize;
          position: relative;
        }
        
        .resize-handle:hover {
          background-color: var(--accent-primary);
        }
        
        .resize-handle::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 2px;
          background-color: var(--space-gray);
          border-radius: 1px;
        }
        
        .terminal-container {
          min-height: 40px;
          background-color: var(--background-secondary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .terminal-toggle {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 10;
        }
        
        .terminal-toggle button {
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border-radius: var(--border-radius);
          padding: 8px 16px;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .terminal-toggle button:hover {
          background-color: var(--accent-primary);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default BackendCodePage;
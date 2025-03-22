// src/components/project/ProjectCodeWorkspace.jsx
import { useState, useEffect } from 'react';
import BackendFileExplorer from './BackendFileExplorer';
import ProjectCodeEditor from './ProjectCodeEditor';

const ProjectCodeWorkspace = ({ projectName }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load projects list on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/projects');
        const data = await response.json();
        
        if (data.success && data.projects) {
          setProjectsList(data.projects);
          console.log("Loaded projects:", data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Handle resize of sidebar
  const startResize = (e) => {
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + (moveEvent.clientX - startX)));
      setSidebarWidth(newWidth);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  // Handle file selection
  const handleFileSelect = (filePath) => {
    console.log("Selected file:", filePath);
    setActiveFile(filePath);
  };
  
  // Handle project change
  const handleProjectChange = (e) => {
    const newProject = e.target.value;
    if (newProject) {
      window.location.href = `/backend-code/${newProject}`;
    }
  };
  
  return (
    <div className="project-code-workspace">
      <div 
        className="sidebar" 
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="projects-dropdown">
          <select 
            value={projectName || ''}
            onChange={handleProjectChange}
            className="project-select"
          >
            <option value="" disabled>Select a project</option>
            {projectsList.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
        
        {projectName && (
          <BackendFileExplorer 
            projectName={projectName} 
            onFileSelect={handleFileSelect} 
          />
        )}
      </div>
      
      <div 
        className="resize-handle"
        onMouseDown={startResize}
      ></div>
      
      <div className="editor-area">
        {activeFile ? (
          <ProjectCodeEditor 
            projectName={projectName}
            filePath={activeFile}
          />
        ) : (
          <div className="no-file-selected">
            <div className="message-box">
              <div className="icon">📂</div>
              <h3>No File Selected</h3>
              <p>Select a file from the project explorer to edit it.</p>
              {!projectName && (
                <p className="hint">Please select a project first.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .project-code-workspace {
          display: flex;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .sidebar {
          height: 100%;
          background-color: var(--background-secondary);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .projects-dropdown {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .project-select {
          width: 100%;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 8px 12px;
          font-size: 14px;
        }
        
        .resize-handle {
          width: 5px;
          height: 100%;
          background-color: var(--background-tertiary);
          cursor: col-resize;
        }
        
        .resize-handle:hover, .resize-handle:active {
          background-color: var(--accent-primary);
        }
        
        .editor-area {
          flex: 1;
          height: 100%;
          overflow: hidden;
        }
        
        .no-file-selected {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background-primary);
        }
        
        .message-box {
          text-align: center;
          padding: 20px;
          background-color: var(--background-secondary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .message-box h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .message-box p {
          color: var(--text-secondary);
        }
        
        .hint {
          margin-top: 16px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ProjectCodeWorkspace;
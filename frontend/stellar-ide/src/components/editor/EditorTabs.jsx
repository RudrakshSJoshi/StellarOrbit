import { useEditor } from '../../contexts/EditorContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import CompileDeployToolbar from '../project/CompileDeployToolbar';

const EditorTabs = () => {
  const { 
    openFiles, 
    activeFile, 
    setActiveFile, 
    closeFile 
  } = useEditor();
  
  const { activeProject } = useFileSystem();
  
  const handleTabClick = (path) => {
    setActiveFile(path);
  };
  
  const handleCloseTab = (e, path) => {
    e.stopPropagation();
    closeFile(path);
  };
  
  const getFileIcon = (filePath) => {
    const extension = filePath.split('.').pop();
    
    switch (extension) {
      case 'rs':
        return '🦀';
      case 'js':
        return '📜';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };
  
  const getFileName = (path) => {
    return path.split('/').pop();
  };
  
  return (
    <div className="editor-tabs-container">
      <div className="editor-tabs">
        <div className="tabs-container">
          {openFiles.map(file => (
            <div 
              key={file.path} 
              className={`tab ${activeFile === file.path ? 'active' : ''}`}
              onClick={() => handleTabClick(file.path)}
            >
              <span className="tab-icon">{getFileIcon(file.path)}</span>
              <span className="tab-name">{getFileName(file.path)}</span>
              <button 
                className="tab-close"
                onClick={(e) => handleCloseTab(e, file.path)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="editor-toolbar">
          {activeFile && (
            <>
              <button className="toolbar-button" title="Save">
                💾
              </button>
              <button className="toolbar-button" title="Format Code">
                🔧
              </button>
              <div className="toolbar-separator"></div>
              <select className="toolbar-dropdown">
                <option value="rust">Rust</option>
                <option value="javascript">JavaScript</option>
                <option value="markdown">Markdown</option>
              </select>
            </>
          )}
        </div>
      </div>
      
      {/* Add Compile/Deploy Toolbar for Soroban */}
      <CompileDeployToolbar projectName={activeProject} />
      
      <style jsx>{`
        .editor-tabs-container {
          display: flex;
          flex-direction: column;
        }
        
        .editor-tabs {
          display: flex;
          justify-content: space-between;
          background-color: var(--background-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          height: 40px;
        }
        
        .tabs-container {
          display: flex;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        
        .tabs-container::-webkit-scrollbar {
          height: 3px;
        }
        
        .tab {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 40px;
          background-color: var(--background-tertiary);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          min-width: 120px;
          max-width: 200px;
          transition: background-color 0.2s;
        }
        
        .tab:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .tab.active {
          background-color: var(--background-primary);
          border-bottom: 2px solid var(--accent-primary);
        }
        
        .tab-icon {
          margin-right: 6px;
        }
        
        .tab-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .tab.active .tab-name {
          color: var(--text-primary);
        }
        
        .tab-close {
          margin-left: 6px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          opacity: 0.6;
          background: transparent;
          color: var(--text-secondary);
        }
        
        .tab-close:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .editor-toolbar {
          display: flex;
          align-items: center;
          padding: 0 16px;
        }
        
        .toolbar-button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          border-radius: 4px;
          background-color: transparent;
          color: var(--text-secondary);
        }
        
        .toolbar-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .toolbar-separator {
          width: 1px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 0 8px;
        }
        
        .toolbar-dropdown {
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default EditorTabs;
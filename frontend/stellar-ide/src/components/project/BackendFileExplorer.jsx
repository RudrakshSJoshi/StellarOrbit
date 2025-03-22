// src/components/project/BackendFileExplorer.jsx
import { useState, useEffect } from 'react';
import { 
  getProjectStructure, 
  createProjectFile, 
  createProjectFolder,
  deleteProjectItem,
  renameProjectItem
} from '../../services/BackendFileService';

const BackendFileExplorer = ({ projectName, onFileSelect }) => {
  const [structure, setStructure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, path: null, type: null });
  const [newItemInput, setNewItemInput] = useState({ visible: false, path: null, type: null, name: '' });
  const [renameInput, setRenameInput] = useState({ visible: false, path: null, name: '' });
  
  // Load project structure
  useEffect(() => {
    const loadStructure = async () => {
      if (!projectName) {
        setStructure(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Loading structure for project:", projectName);
        const data = await getProjectStructure(projectName);
        console.log("Received structure:", data);
        setStructure(data);
        
        // Auto-expand the src folder
        setExpandedFolders(prev => ({
          ...prev,
          'src': true
        }));
      } catch (err) {
        console.error('Error loading project structure:', err);
        setError(`Failed to load project structure: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStructure();
  }, [projectName]);
  
  // Toggle folder expansion
  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };
  
  // Show context menu
  const handleContextMenu = (e, path, type) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      path,
      type
    });
  };
  
  // Hide context menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
  
  // Handle context menu actions
  const handleContextAction = async (action) => {
    const { path, type } = contextMenu;
    
    switch (action) {
      case 'newFile':
        setNewItemInput({ visible: true, path, type: 'file', name: '' });
        break;
      case 'newFolder':
        setNewItemInput({ visible: true, path, type: 'folder', name: '' });
        break;
      case 'delete':
        handleDeleteItem(path);
        break;
      case 'rename':
        // Extract the current name from the path
        const currentName = path.split('/').pop();
        setRenameInput({ visible: true, path, name: currentName });
        break;
      default:
        break;
    }
    
    // Hide context menu
    setContextMenu(prev => ({ ...prev, visible: false }));
  };
  
  // Create new file or folder
  const handleCreateItem = async () => {
    try {
      const { path, type, name } = newItemInput;
      
      if (!name.trim()) {
        alert('Name cannot be empty');
        return;
      }
      
      // Determine the full path for the new item
      const parentPath = path || '';
      const newItemPath = parentPath ? `${parentPath}/${name}` : name;
      
      if (type === 'file') {
        await createProjectFile(projectName, newItemPath);
      } else {
        await createProjectFolder(projectName, newItemPath);
      }
      
      // Reset input state
      setNewItemInput({ visible: false, path: null, type: null, name: '' });
      
      // Refresh project structure
      const data = await getProjectStructure(projectName);
      setStructure(data);
      
      // Expand the parent folder
      if (parentPath) {
        setExpandedFolders(prev => ({
          ...prev,
          [parentPath]: true
        }));
      }
      
      // If it's a file, select it
      if (type === 'file' && onFileSelect) {
        onFileSelect(newItemPath);
      }
    } catch (err) {
      console.error('Error creating item:', err);
      alert(`Failed to create ${newItemInput.type}: ${err.message}`);
    }
  };
  
  // Delete item
  const handleDeleteItem = async (itemPath) => {
    if (!confirm(`Are you sure you want to delete ${itemPath}?`)) {
      return;
    }
    
    try {
      await deleteProjectItem(projectName, itemPath);
      
      // Refresh project structure
      const data = await getProjectStructure(projectName);
      setStructure(data);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(`Failed to delete item: ${err.message}`);
    }
  };
  
  // Rename item
  const handleRenameItem = async () => {
    try {
      const { path, name } = renameInput;
      
      if (!name.trim()) {
        alert('Name cannot be empty');
        return;
      }
      
      // Get parent path and create new path
      const pathParts = path.split('/');
      pathParts.pop(); // Remove the current name
      const parentPath = pathParts.join('/');
      const newPath = parentPath ? `${parentPath}/${name}` : name;
      
      // Don't do anything if the name is the same
      if (path === newPath) {
        setRenameInput({ visible: false, path: null, name: '' });
        return;
      }
      
      await renameProjectItem(projectName, path, newPath);
      
      // Reset input state
      setRenameInput({ visible: false, path: null, name: '' });
      
      // Refresh project structure
      const data = await getProjectStructure(projectName);
      setStructure(data);
      
      // If it's a file, select it with the new path
      const itemType = path.includes('.') ? 'file' : 'folder';
      if (itemType === 'file' && onFileSelect) {
        onFileSelect(newPath);
      }
    } catch (err) {
      console.error('Error renaming item:', err);
      alert(`Failed to rename item: ${err.message}`);
    }
  };
  
  // Cancel inputs when pressing escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        if (newItemInput.visible) {
          setNewItemInput({ visible: false, path: null, type: null, name: '' });
        }
        if (renameInput.visible) {
          setRenameInput({ visible: false, path: null, name: '' });
        }
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [newItemInput.visible, renameInput.visible]);
  
  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'rs':
        return '🦀';
      case 'js':
        return '📜';
      case 'json':
        return '🔧';
      case 'md':
        return '📝';
      case 'toml':
        return '⚙️';
      default:
        return '📄';
    }
  };
  
  // Recursive function to render folder structure
  const renderTree = (items, basePath = '') => {
    if (!items) return null;
    
    return Object.entries(items).map(([name, item]) => {
      const itemPath = basePath ? `${basePath}/${name}` : name;
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[itemPath] || false;
        
        return (
          <div key={itemPath} className="folder-item">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(itemPath)}
              onContextMenu={(e) => handleContextMenu(e, itemPath, 'folder')}
            >
              {renameInput.visible && renameInput.path === itemPath ? (
                <input
                  type="text"
                  className="rename-input"
                  value={renameInput.name}
                  onChange={(e) => setRenameInput(prev => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameItem();
                    if (e.key === 'Escape') setRenameInput({ visible: false, path: null, name: '' });
                  }}
                  onBlur={() => handleRenameItem()}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="folder-icon">
                    {isExpanded ? '📂' : '📁'}
                  </span>
                  <span className="folder-name">{name}</span>
                </>
              )}
            </div>
            
            {isExpanded && (
              <div className="folder-children">
                {newItemInput.visible && newItemInput.path === itemPath && (
                  <div className="new-item-input">
                    <span className="new-item-icon">
                      {newItemInput.type === 'file' ? '📄' : '📁'}
                    </span>
                    <input
                      type="text"
                      placeholder={`New ${newItemInput.type} name...`}
                      value={newItemInput.name}
                      onChange={(e) => setNewItemInput(prev => ({ ...prev, name: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateItem();
                        if (e.key === 'Escape') setNewItemInput({ visible: false, path: null, type: null, name: '' });
                      }}
                      onBlur={() => handleCreateItem()}
                      autoFocus
                    />
                  </div>
                )}
                {renderTree(item.children, itemPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={itemPath}
            className="file-item"
            onClick={() => onFileSelect && onFileSelect(itemPath)}
            onContextMenu={(e) => handleContextMenu(e, itemPath, 'file')}
          >
            {renameInput.visible && renameInput.path === itemPath ? (
              <input
                type="text"
                className="rename-input"
                value={renameInput.name}
                onChange={(e) => setRenameInput(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameItem();
                  if (e.key === 'Escape') setRenameInput({ visible: false, path: null, name: '' });
                }}
                onBlur={() => handleRenameItem()}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="file-icon">
                  {getFileIcon(name)}
                </span>
                <span className="file-name">{name}</span>
              </>
            )}
          </div>
        );
      }
    });
  };
  
  return (
    <div className="backend-file-explorer">
      <div className="explorer-header">
        <h3>{projectName || 'No Project Selected'}</h3>
        <div className="header-actions">
          <button 
            className="refresh-button" 
            onClick={async () => {
              setIsLoading(true);
              try {
                const data = await getProjectStructure(projectName);
                setStructure(data);
              } catch (err) {
                console.error('Error refreshing project structure:', err);
                setError(`Failed to refresh: ${err.message}`);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || !projectName}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-message">Loading project structure...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !structure ? (
        <div className="empty-message">No project selected</div>
      ) : (
        <div className="explorer-tree">
          {newItemInput.visible && !newItemInput.path && (
            <div className="new-item-input root-level">
              <span className="new-item-icon">
                {newItemInput.type === 'file' ? '📄' : '📁'}
              </span>
              <input
                type="text"
                placeholder={`New ${newItemInput.type} name...`}
                value={newItemInput.name}
                onChange={(e) => setNewItemInput(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateItem();
                  if (e.key === 'Escape') setNewItemInput({ visible: false, path: null, type: null, name: '' });
                }}
                onBlur={() => handleCreateItem()}
                autoFocus
              />
            </div>
          )}
          {renderTree(structure)}
        </div>
      )}
      
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x 
          }}
        >
          {contextMenu.type === 'folder' && (
            <>
              <div className="menu-item" onClick={() => handleContextAction('newFile')}>
                <span className="menu-icon">📄</span>
                <span>New File</span>
              </div>
              <div className="menu-item" onClick={() => handleContextAction('newFolder')}>
                <span className="menu-icon">📁</span>
                <span>New Folder</span>
              </div>
              <div className="menu-separator"></div>
            </>
          )}
          <div className="menu-item" onClick={() => handleContextAction('rename')}>
            <span className="menu-icon">✏️</span>
            <span>Rename</span>
          </div>
          <div className="menu-item delete" onClick={() => handleContextAction('delete')}>
            <span className="menu-icon">🗑️</span>
            <span>Delete</span>
          </div>
        </div>
      )}
      
      <div className="explorer-footer">
        <button 
          className="new-file-button" 
          onClick={() => setNewItemInput({ visible: true, path: null, type: 'file', name: '' })}
          disabled={!projectName}
        >
          <span className="button-icon">📄</span>
          <span>New File</span>
        </button>
        <button 
          className="new-folder-button" 
          onClick={() => setNewItemInput({ visible: true, path: null, type: 'folder', name: '' })}
          disabled={!projectName}
        >
          <span className="button-icon">📁</span>
          <span>New Folder</span>
        </button>
      </div>
      
      <style jsx>{`
        .backend-file-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--background-secondary);
          color: var(--text-primary);
        }
        
        .explorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          // src/components/project/BackendFileExplorer.jsx (continued)
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .explorer-header h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
        }
        
        .refresh-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .refresh-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .loading-message, .error-message, .empty-message {
          padding: 16px;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .error-message {
          color: var(--error);
        }
        
        .explorer-tree {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .folder-item {
          margin-bottom: 2px;
        }
        
        .folder-header {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .folder-header:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .folder-icon {
          margin-right: 8px;
        }
        
        .folder-name {
          color: var(--text-primary);
          font-weight: 500;
        }
        
        .folder-children {
          padding-left: 16px;
          margin-top: 2px;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 2px;
        }
        
        .file-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .file-icon {
          margin-right: 8px;
        }
        
        .file-name {
          color: var(--text-secondary);
        }
        
        .file-item:hover .file-name {
          color: var(--text-primary);
        }
        
        .context-menu {
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          min-width: 150px;
          z-index: 1000;
          overflow: hidden;
        }
        
        .menu-item {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .menu-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .menu-item.delete:hover {
          background-color: rgba(255, 0, 0, 0.1);
        }
        
        .menu-icon {
          margin-right: 8px;
        }
        
        .menu-separator {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 4px 0;
        }
        
        .explorer-footer {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .new-file-button, .new-folder-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          margin: 0 4px;
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border-radius: var(--border-radius);
          cursor: pointer;
          border: none;
          font-size: 12px;
        }
        
        .new-file-button:hover, .new-folder-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .button-icon {
          margin-right: 6px;
        }
        
        .new-item-input {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          margin-bottom: 2px;
        }
        
        .new-item-input.root-level {
          padding: 8px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: var(--border-radius);
        }
        
        .new-item-icon {
          margin-right: 8px;
        }
        
        .new-item-input input, .rename-input {
          flex: 1;
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--text-primary);
          font-size: 13px;
        }
        
        .new-item-input input:focus, .rename-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default BackendFileExplorer;
          
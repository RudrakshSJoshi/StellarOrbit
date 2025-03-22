import { useState, useEffect, useRef } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useEditor } from '../../contexts/EditorContext';

// Helper function to get file icon based on file extension
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'rs':
      return '🦀';
    case 'js':
    case 'jsx':
      return '📜';
    case 'json':
      return '{}';
    case 'md':
      return '📝';
    case 'toml':
      return '⚙️';
    case 'html':
      return '🌐';
    case 'css':
      return '🎨';
    case 'gitignore':
      return '🔒';
    case 'lock':
      return '🔑';
    default:
      return '📄';
  }
};

const FileTree = () => {
  const { 
    fileTree, 
    activeProject, 
    isLoading, 
    createFile, 
    createFolder, 
    deleteItem,
    renameItem 
  } = useFileSystem();
  
  const { openFile } = useEditor();
  const [expandedFolders, setExpandedFolders] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file');
  
  // Initialize expanded state for all folders
  useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      const initExpandedState = {};
      
      const processFolder = (items, path = '') => {
        items.forEach(item => {
          if (item.type === 'folder') {
            const itemPath = path ? `${path}/${item.name}` : item.name;
            // Expand src folder by default
            initExpandedState[itemPath] = item.name === 'src';
            
            if (item.children) {
              processFolder(item.children, itemPath);
            }
          }
        });
      };
      
      processFolder(fileTree);
      setExpandedFolders(initExpandedState);
    }
  }, [fileTree]);
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const handleFileClick = (file) => {
    if (file.type === 'file') {
      openFile(file.path);
    }
  };
  
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };
  
  const closeContextMenu = () => {
    setContextMenu(null);
  };
  
  const handleRenameClick = (item) => {
    setIsRenaming(item.path);
    setNewName(item.name);
    closeContextMenu();
  };
  
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    
    if (newName && isRenaming) {
      try {
        await renameItem(isRenaming, newName);
        setIsRenaming(null);
        setNewName('');
      } catch (error) {
        console.error('Error renaming item:', error);
      }
    }
  };
  
  const handleDeleteClick = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteItem(item.path);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
    closeContextMenu();
  };
  
  const handleNewItemClick = (parentPath, type) => {
    setIsCreatingNew(parentPath);
    setNewItemType(type);
    setNewItemName('');
    closeContextMenu();
  };

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    
    if (newItemName && isCreatingNew) {
      const path = isCreatingNew ? 
        (isCreatingNew === '/' ? newItemName : `${isCreatingNew}/${newItemName}`) : 
        newItemName;
      
      try {
        if (newItemType === 'file') {
          await createFile(path, '');
        } else {
          await createFolder(path);
        }
        setIsCreatingNew(null);
        setNewItemName('');
      } catch (error) {
        console.error(`Error creating ${newItemType}:`, error);
      }
    }
  }
  
  // Detect clicks outside context menu
  const contextMenuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        closeContextMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Render the file tree recursively
  const renderFileTree = (items, currentPath = '') => {
    if (!items || items.length === 0) {
      return <div className="empty-directory">Empty directory</div>;
    }
    
    // Sort items: folders first, then files, alphabetically
    const sortedItems = [...items].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return sortedItems.map((item) => {
      const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      
      if (item.type === 'folder') {
        return (
          <div key={itemPath} className="folder-item">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(itemPath)}
              onContextMenu={(e) => handleContextMenu(e, {...item, path: itemPath})}
            >
              <span className="folder-icon">
                {expandedFolders[itemPath] ? '📂' : '📁'}
              </span>
              
              {isRenaming === itemPath ? (
                <form onSubmit={handleRenameSubmit}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    onBlur={handleRenameSubmit}
                    className="rename-input"
                  />
                </form>
              ) : (
                <span className="folder-name">{item.name}</span>
              )}
            </div>
            
            {expandedFolders[itemPath] && (
              <div className="folder-children">
                {isCreatingNew === itemPath && (
                  <form onSubmit={handleNewItemSubmit} className="new-item-form">
                    <span className="file-icon">
                      {newItemType === 'file' ? '📄' : '📁'}
                    </span>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={`New ${newItemType}...`}
                      autoFocus
                      onBlur={handleNewItemSubmit}
                      className="new-item-input"
                    />
                  </form>
                )}
                {renderFileTree(item.children, itemPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={itemPath}
            className="file-item"
            onClick={() => handleFileClick({...item, path: itemPath})}
            onContextMenu={(e) => handleContextMenu(e, {...item, path: itemPath})}
          >
            <span className="file-icon">
              {getFileIcon(item.name)}
            </span>
            
            {isRenaming === itemPath ? (
              <form onSubmit={handleRenameSubmit}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  onBlur={handleRenameSubmit}
                  className="rename-input"
                />
              </form>
            ) : (
              <span className="file-name">{item.name}</span>
            )}
          </div>
        );
      }
    });
  };
  
  // Add root-level new item form
  const renderRootNewItemForm = () => {
    if (isCreatingNew === '/') {
      return (
        <form onSubmit={handleNewItemSubmit} className="new-item-form">
          <span className="file-icon">
            {newItemType === 'file' ? '📄' : '📁'}
          </span>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`New ${newItemType}...`}
            autoFocus
            onBlur={handleNewItemSubmit}
            className="new-item-input"
          />
        </form>
      );
    }
    return null;
  };
  
  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <h3>Project Files</h3>
        <div className="file-tree-actions">
          <button 
            className="icon-button" 
            title="New File"
            onClick={() => handleNewItemClick('/', 'file')}
          >
            <span>📄+</span>
          </button>
          <button 
            className="icon-button" 
            title="New Folder"
            onClick={() => handleNewItemClick('/', 'folder')}
          >
            <span>📁+</span>
          </button>
          <button 
            className="icon-button" 
            title="Refresh"
            onClick={() => window.location.reload()}
          >
            <span>🔄</span>
          </button>
        </div>
      </div>
      
      <div className="file-tree">
        {isLoading ? (
          <div className="loading-indicator">Loading files...</div>
        ) : (
          <>
            {renderRootNewItemForm()}
            {renderFileTree(fileTree)}
          </>
        )}
        
        {contextMenu && (
          <div 
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            ref={contextMenuRef}
          >
            <div 
              className="context-menu-item"
              onClick={() => handleRenameClick(contextMenu.item)}
            >
              Rename
            </div>
            <div 
              className="context-menu-item"
              onClick={() => handleDeleteClick(contextMenu.item)}
            >
              Delete
            </div>
            {contextMenu.item.type === 'folder' && (
              <>
                <div className="context-menu-separator"></div>
                <div 
                  className="context-menu-item"
                  onClick={() => handleNewItemClick(contextMenu.item.path, 'file')}
                >
                  New File
                </div>
                <div 
                  className="context-menu-item"
                  onClick={() => handleNewItemClick(contextMenu.item.path, 'folder')}
                >
                  New Folder
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .file-tree-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .file-tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .file-tree-header h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        .file-tree-actions {
          display: flex;
        }
        
        .icon-button {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          padding: 0;
          color: var(--text-secondary);
          background-color: transparent;
        }
        
        .icon-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .file-tree {
          flex: 1;
          overflow: auto;
          padding: 8px 0;
          font-size: 13px;
          position: relative;
        }
        
        .loading-indicator {
          padding: 16px;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .empty-directory {
          padding: 8px 16px;
          color: var(--text-secondary);
          font-style: italic;
          font-size: 12px;
        }162
        
        .folder-item {
          margin-bottom: 2px;
        }
        
        .folder-header {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .folder-header:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .folder-icon {
          margin-right: 6px;
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
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 2px;
        }
        
        .file-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .file-icon {
          margin-right: 6px;
        }
        
        .file-name {
          color: var(--text-secondary);
        }
        
        .file-item:hover .file-name {
          color: var(--text-primary);
        }
        
        .context-menu {
          position: fixed;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          min-width: 150px;
          overflow: hidden;
        }
        
        .context-menu-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .context-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .context-menu-separator {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 4px 0;
        }
        
        .rename-input, .new-item-input {
          background-color: var(--background-tertiary);
          border: 1px solid var(--accent-primary);
          color: var(--text-primary);
          border-radius: 2px;
          padding: 2px 4px;
          font-size: 13px;
          width: 100%;
          max-width: 150px;
        }
        
        .new-item-form {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
};

export default FileTree;
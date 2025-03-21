import { useState } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';

// Sample file structure until we have a real file system
const initialFiles = {
  'contracts': {
    type: 'folder',
    expanded: true,
    children: {
      'token.rs': { type: 'file', language: 'rust' },
      'escrow.rs': { type: 'file', language: 'rust' },
      'amm': {
        type: 'folder',
        expanded: false,
        children: {
          'pool.rs': { type: 'file', language: 'rust' },
          'router.rs': { type: 'file', language: 'rust' },
        }
      }
    }
  },
  'scripts': {
    type: 'folder',
    expanded: false,
    children: {
      'deploy.js': { type: 'file', language: 'javascript' },
      'interact.js': { type: 'file', language: 'javascript' },
    }
  },
  'README.md': { type: 'file', language: 'markdown' }
};

const FileTree = () => {
  const [files, setFiles] = useState(initialFiles);
  const { openFile } = useFileSystem();
  
  const toggleFolder = (path) => {
    const updateFilesRecursive = (files, pathParts) => {
      const [current, ...rest] = pathParts;
      
      if (rest.length === 0) {
        // We found the folder to toggle
        const folder = files[current];
        return {
          ...files,
          [current]: {
            ...folder,
            expanded: !folder.expanded
          }
        };
      }
      
      // Continue searching deeper
      return {
        ...files,
        [current]: {
          ...files[current],
          children: updateFilesRecursive(files[current].children, rest)
        }
      };
    };
    
    const pathParts = path.split('/').filter(Boolean);
    setFiles(updateFilesRecursive(files, pathParts));
  };
  
  const handleFileClick = (filePath) => {
    openFile(filePath);
  };
  
  const renderFileTree = (items, currentPath = '') => {
    return Object.entries(items).map(([name, item]) => {
      const itemPath = currentPath ? `${currentPath}/${name}` : name;
      
      if (item.type === 'folder') {
        return (
          <div key={itemPath} className="folder-item">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(itemPath)}
            >
              <span className="folder-icon">
                {item.expanded ? '📂' : '📁'}
              </span>
              <span className="folder-name">{name}</span>
            </div>
            
            {item.expanded && (
              <div className="folder-children">
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
            onClick={() => handleFileClick(itemPath)}
          >
            <span className="file-icon">
              {getFileIcon(item.language)}
            </span>
            <span className="file-name">{name}</span>
          </div>
        );
      }
    });
  };
  
  const getFileIcon = (language) => {
    switch (language) {
      case 'rust':
        return '🦀';
      case 'javascript':
        return '📜';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };
  
  return (
    <div className="file-tree">
      {renderFileTree(files)}
      
      <style jsx>{`
        .file-tree {
          padding: 8px 0;
          font-size: 13px;
        }
        
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
        
        .file-name:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default FileTree;
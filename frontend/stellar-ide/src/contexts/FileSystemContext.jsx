import { createContext, useContext, useState, useEffect } from 'react';

// Sample project structure
const initialFileSystem = {
  'contracts': {
    type: 'folder',
    children: {
      'token.rs': { 
        type: 'file', 
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'escrow.rs': { 
        type: 'file', 
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'amm': {
        type: 'folder',
        createdAt: new Date().toISOString(),
        children: {
          'pool.rs': { 
            type: 'file', 
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          'router.rs': { 
            type: 'file', 
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
        }
      }
    }
  },
  'scripts': {
    type: 'folder',
    createdAt: new Date().toISOString(),
    children: {
      'deploy.js': { 
        type: 'file', 
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'interact.js': { 
        type: 'file', 
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
    }
  },
  'README.md': { 
    type: 'file', 
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'Cargo.toml': { 
    type: 'file', 
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Create the context
const FileSystemContext = createContext(null);

// Context provider component
export const FileSystemProvider = ({ children }) => {
  const [fileSystem, setFileSystem] = useState(null);
  const [activeProject, setActiveProject] = useState('default');
  const [projects, setProjects] = useState(['default']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize file system on mount
  useEffect(() => {
    const loadFileSystem = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to load from local storage
        const storedProjects = localStorage.getItem('stellarIDE_projects');
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
        
        const storedActiveProject = localStorage.getItem('stellarIDE_activeProject');
        if (storedActiveProject) {
          setActiveProject(storedActiveProject);
        }
        
        const projectKey = `stellarIDE_fileSystem_${storedActiveProject || 'default'}`;
        const storedFileSystem = localStorage.getItem(projectKey);
        
        if (storedFileSystem) {
          setFileSystem(JSON.parse(storedFileSystem));
        } else {
          // If no stored file system, initialize with default
          setFileSystem(initialFileSystem);
          localStorage.setItem(projectKey, JSON.stringify(initialFileSystem));
        }
      } catch (error) {
        console.error('Error loading file system:', error);
        setError('Failed to load project files. Using default structure.');
        setFileSystem(initialFileSystem);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFileSystem();
  }, []);
  
  // Save file system changes to local storage
  useEffect(() => {
    if (fileSystem && !isLoading) {
      const projectKey = `stellarIDE_fileSystem_${activeProject}`;
      localStorage.setItem(projectKey, JSON.stringify(fileSystem));
    }
  }, [fileSystem, activeProject, isLoading]);
  
  // Save projects list to local storage
  useEffect(() => {
    if (projects.length > 0 && !isLoading) {
      localStorage.setItem('stellarIDE_projects', JSON.stringify(projects));
    }
  }, [projects, isLoading]);
  
  // Save active project to local storage
  useEffect(() => {
    if (activeProject && !isLoading) {
      localStorage.setItem('stellarIDE_activeProject', activeProject);
    }
  }, [activeProject, isLoading]);
  
  // Create a new project
  // Create a new project
  // Create a new project
const createProject = async (projectName) => {
  try {
    // Call backend API to create project without checking existence
    const response = await fetch('http://localhost:5001/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: projectName })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create project');
    }
    
    // Add to projects list
    setProjects(prev => [...prev, projectName]);
    
    // Initialize with empty file system
    const projectKey = `stellarIDE_fileSystem_${projectName}`;
    localStorage.setItem(projectKey, JSON.stringify(initialFileSystem));
    
    console.log(`Project ${projectName} created successfully!`);
    return true;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};
  
  // Switch to a different project
  const switchProject = (projectName) => {
    if (!projects.includes(projectName)) {
      throw new Error(`Project "${projectName}" does not exist`);
    }
    
    // Save current project first
    if (fileSystem && activeProject) {
      const currentProjectKey = `stellarIDE_fileSystem_${activeProject}`;
      localStorage.setItem(currentProjectKey, JSON.stringify(fileSystem));
    }
    
    // Set new active project
    setActiveProject(projectName);
    
    // Load the project's file system
    const projectKey = `stellarIDE_fileSystem_${projectName}`;
    const storedFileSystem = localStorage.getItem(projectKey);
    
    if (storedFileSystem) {
      setFileSystem(JSON.parse(storedFileSystem));
    } else {
      // If no stored file system, initialize with default
      setFileSystem(initialFileSystem);
      localStorage.setItem(projectKey, JSON.stringify(initialFileSystem));
    }
    
    return true;
  };
  
  // Delete a project
  const deleteProject = (projectName) => {
    if (!projects.includes(projectName)) {
      throw new Error(`Project "${projectName}" does not exist`);
    }
    
    if (projects.length === 1) {
      throw new Error('Cannot delete the only project');
    }
    
    // Remove from projects list
    setProjects(prev => prev.filter(p => p !== projectName));
    
    // Remove from local storage
    const projectKey = `stellarIDE_fileSystem_${projectName}`;
    localStorage.removeItem(projectKey);
    
    // If deleting the active project, switch to the first one
    if (activeProject === projectName) {
      const newActiveProject = projects.find(p => p !== projectName);
      switchProject(newActiveProject);
    }
    
    return true;
  };
  
  // Get content of a file by path
  const getFileContent = async (filePath) => {
    if (!fileSystem) return null;
    
    const pathParts = filePath.split('/').filter(Boolean);
    let current = fileSystem;
    
    // Navigate to the file
    for (const part of pathParts) {
      if (!current[part] && !current.children?.[part]) {
        return null; // File not found
      }
      
      current = current[part] || current.children[part];
    }
    
    // Return content if it's a file
    if (current.type === 'file') {
      return current.content;
    }
    
    return null;
  };
  
  // Save content to a file
  const saveFileContent = async (filePath, content) => {
    if (!fileSystem) return false;
    
    const pathParts = filePath.split('/').filter(Boolean);
    const fileName = pathParts.pop();
    
    // Make a copy of the file system to modify
    const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
    // Navigate to the containing folder
    let current = newFileSystem;
    
    for (const part of pathParts) {
      if (!current[part] && !current.children?.[part]) {
        // Create missing folders
        if (current.children) {
          current.children[part] = {
            type: 'folder',
            createdAt: new Date().toISOString(),
            children: {}
          };
          current = current.children[part];
        } else {
          current[part] = {
            type: 'folder',
            createdAt: new Date().toISOString(),
            children: {}
          };
          current = current[part];
        }
      } else {
        current = current[part] || current.children[part];
      }
    }
    
    // Save the file
    const timestamp = new Date().toISOString();
    const fileObj = {
      type: 'file',
      content,
      updatedAt: timestamp,
    };
    
    if (current.children) {
      // If file already exists, preserve its creation date
      if (current.children[fileName]) {
        fileObj.createdAt = current.children[fileName].createdAt;
      } else {
        fileObj.createdAt = timestamp;
      }
      current.children[fileName] = fileObj;
    } else {
      // If file already exists, preserve its creation date
      if (current[fileName]) {
        fileObj.createdAt = current[fileName].createdAt;
      } else {
        fileObj.createdAt = timestamp;
      }
      current[fileName] = fileObj;
    }
    
    setFileSystem(newFileSystem);
    return true;
  };
  
  // Create a new file
  const createFile = async (filePath, content = '') => {
    return saveFileContent(filePath, content);
  };
  
  // Create a new folder
  const createFolder = async (folderPath) => {
    if (!fileSystem) return false;
    
    const pathParts = folderPath.split('/').filter(Boolean);
    const folderName = pathParts.pop();
    
    // Make a copy of the file system to modify
    const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
    // Navigate to the containing folder
    let current = newFileSystem;
    
    for (const part of pathParts) {
      if (!current[part] && !current.children?.[part]) {
        // Create missing folders
        if (current.children) {
          current.children[part] = {
            type: 'folder',
            createdAt: new Date().toISOString(),
            children: {}
          };
          current = current.children[part];
        } else {
          current[part] = {
            type: 'folder',
            createdAt: new Date().toISOString(),
            children: {}
          };
          current = current[part];
        }
      } else {
        current = current[part] || current.children[part];
      }
    }
    
    // Create the folder
    const timestamp = new Date().toISOString();
    if (current.children) {
      current.children[folderName] = {
        type: 'folder',
        createdAt: timestamp,
        children: {}
      };
    } else {
      current[folderName] = {
        type: 'folder',
        createdAt: timestamp,
        children: {}
      };
    }
    
    setFileSystem(newFileSystem);
    return true;
  };
  
  // Delete a file or folder
  const deleteItem = async (itemPath) => {
    if (!fileSystem) return false;
    
    const pathParts = itemPath.split('/').filter(Boolean);
    const itemName = pathParts.pop();
    
    // Make a copy of the file system to modify
    const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
    // Navigate to the containing folder
    let current = newFileSystem;
    let parent = null;
    
    for (const part of pathParts) {
      parent = current;
      current = current[part] || current.children?.[part];
      
      if (!current) {
        return false; // Path not found
      }
    }
    
    // Delete the item
    if (parent.children && parent.children[itemName]) {
      delete parent.children[itemName];
    } else if (parent[itemName]) {
      delete parent[itemName];
    } else {
      return false; // Item not found
    }
    
    setFileSystem(newFileSystem);
    return true;
  };
  
  // Rename a file or folder
  const renameItem = async (oldPath, newName) => {
    if (!fileSystem) return false;
    
    // Get the item
    const pathParts = oldPath.split('/').filter(Boolean);
    const oldName = pathParts.pop();
    const parentPath = pathParts.join('/');
    
    // Create the new path
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    
    // Make a copy of the file system to modify
    const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
    // Navigate to the containing folder
    let current = newFileSystem;
    
    for (const part of pathParts) {
      current = current[part] || current.children?.[part];
      
      if (!current) {
        return false; // Path not found
      }
    }
    
    // Get the item to rename
    let item;
    if (current.children && current.children[oldName]) {
      item = current.children[oldName];
      delete current.children[oldName];
      current.children[newName] = item;
    } else if (current[oldName]) {
      item = current[oldName];
      delete current[oldName];
      current[newName] = item;
    } else {
      return false; // Item not found
    }
    
    setFileSystem(newFileSystem);
    return true;
  };
  
  // Move a file or folder
  const moveItem = async (sourcePath, destinationPath) => {
    if (!fileSystem) return false;
    
    // Get the source item
    let sourceItem = await getItemByPath(sourcePath);
    if (!sourceItem) {
      return false; // Source not found
    }
    
    // Make a deep copy to avoid reference issues
    sourceItem = JSON.parse(JSON.stringify(sourceItem));
    
    // Create the item at the destination
    const pathParts = sourcePath.split('/').filter(Boolean);
    const itemName = pathParts.pop();
    const newPath = destinationPath ? `${destinationPath}/${itemName}` : itemName;
    
    let success;
    if (sourceItem.type === 'file') {
      success = await createFile(newPath, sourceItem.content);
    } else {
      success = await createFolder(newPath);
      
              // Copy all children recursively
      if (success && sourceItem.children) {
        for (const childName in sourceItem.children) {
          const childSourcePath = `${sourcePath}/${childName}`;
          const childDestPath = newPath;
          
          await moveItem(childSourcePath, childDestPath);
        }
      }
    }
    
    // Delete the source if moving was successful
    if (success) {
      return deleteItem(sourcePath);
    }
    
    return false;
  };
  
  // Copy a file or folder
  const copyItem = async (sourcePath, destinationPath) => {
    if (!fileSystem) return false;
    
    // Get the source item
    let sourceItem = await getItemByPath(sourcePath);
    if (!sourceItem) {
      return false; // Source not found
    }
    
    // Make a deep copy to avoid reference issues
    sourceItem = JSON.parse(JSON.stringify(sourceItem));
    
    // Create the item at the destination
    const pathParts = sourcePath.split('/').filter(Boolean);
    const itemName = pathParts.pop();
    const newPath = destinationPath ? `${destinationPath}/${itemName}` : itemName;
    
    let success;
    if (sourceItem.type === 'file') {
      success = await createFile(newPath, sourceItem.content);
    } else {
      success = await createFolder(newPath);
      
      // Copy all children recursively
      if (success && sourceItem.children) {
        for (const childName in sourceItem.children) {
          const childSourcePath = `${sourcePath}/${childName}`;
          const childDestPath = newPath;
          
          await copyItem(childSourcePath, childDestPath);
        }
      }
    }
    
    return success;
  };
  
  // Helper function to get an item by path
  const getItemByPath = async (path) => {
    if (!fileSystem) return null;
    
    const pathParts = path.split('/').filter(Boolean);
    let current = fileSystem;
    
    for (const part of pathParts) {
      current = current[part] || current.children?.[part];
      if (!current) {
        return null;
      }
    }
    
    return current;
  };
  
  // Get all files in the file system (for search)
  const getAllFiles = () => {
    if (!fileSystem) return [];
    
    const files = [];
    
    const traverseFileSystem = (node, path = '') => {
      if (node.type === 'file') {
        files.push({ 
          path, 
          content: node.content,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt
        });
        return;
      }
      
      const children = node.children || node;
      for (const [name, child] of Object.entries(children)) {
        const childPath = path ? `${path}/${name}` : name;
        if (child.type === 'file') {
          files.push({ 
            path: childPath, 
            content: child.content,
            createdAt: child.createdAt,
            updatedAt: child.updatedAt
          });
        } else {
          traverseFileSystem(child, childPath);
        }
      }
    };
    
    traverseFileSystem(fileSystem);
    return files;
  };
  
  // Search for files by content or filename
  const searchFiles = (query) => {
    if (!query || !fileSystem) return [];
    
    const files = getAllFiles();
    const lowerQuery = query.toLowerCase();
    
    return files.filter(file => {
      const filename = file.path.split('/').pop().toLowerCase();
      return (
        filename.includes(lowerQuery) ||
        (file.content && file.content.toLowerCase().includes(lowerQuery))
      );
    });
  };
  
  // Export project as a zip file
  const exportProject = () => {
    // This would ideally use a library like JSZip to create a proper zip file
    // For now, return the file system JSON
    return JSON.stringify(fileSystem, null, 2);
  };
  
  // Import project from a zip or JSON file
  const importProject = (data, projectName = activeProject) => {
    try {
      let newFileSystem;
      
      // If data is a JSON string, parse it
      if (typeof data === 'string') {
        newFileSystem = JSON.parse(data);
      } else {
        // If data is an object (already parsed), use it directly
        newFileSystem = data;
      }
      
      // Validate the structure (basic check)
      if (!newFileSystem || typeof newFileSystem !== 'object') {
        throw new Error('Invalid file system structure');
      }
      
      // If importing to the current project, update the file system
      if (projectName === activeProject) {
        setFileSystem(newFileSystem);
      }
      
      // Save to local storage
      const projectKey = `stellarIDE_fileSystem_${projectName}`;
      localStorage.setItem(projectKey, JSON.stringify(newFileSystem));
      
      // If this is a new project, add it to the projects list
      if (!projects.includes(projectName)) {
        setProjects(prev => [...prev, projectName]);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing project:', error);
      return false;
    }
  };
  
  // Get file stats
  const getFileStats = async (filePath) => {
    const item = await getItemByPath(filePath);
    if (!item) return null;
    
    return {
      type: item.type,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      size: item.content ? new Blob([item.content]).size : 0,
      path: filePath,
      name: filePath.split('/').pop()
    };
  };
  
  // Get directory structure (for file browser)
  const getDirectoryStructure = (path = '') => {
    if (!fileSystem) return [];
    
    // If root, return the entire structure
    if (!path) {
      return Object.entries(fileSystem).map(([name, item]) => ({
        name,
        type: item.type || 'folder',
        children: item.type === 'folder' ? getDirectoryChildren(item) : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    }
    
    // Otherwise, navigate to the specified path
    const pathParts = path.split('/').filter(Boolean);
    let current = fileSystem;
    
    for (const part of pathParts) {
      current = current[part] || current.children?.[part];
      if (!current) {
        return [];
      }
    }
    
    // Return the children of this directory
    return getDirectoryChildren(current);
  };
  
  // Helper to get children of a directory
  const getDirectoryChildren = (directory) => {
    if (!directory || !directory.children) return [];
    
    return Object.entries(directory.children).map(([name, item]) => ({
      name,
      type: item.type,
      children: item.type === 'folder' ? getDirectoryChildren(item) : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  };
  
  // Create a directory structure from a template
  const createFromTemplate = async (templateName, targetPath = '') => {
    // Templates could be predefined project structures
    const templates = {
      'empty': {
        'src': {
          type: 'folder',
          children: {
            'main.rs': { type: 'file', content: '// Empty main file' }
          }
        },
        'README.md': { type: 'file', content: '# New Project' }
      },
      'token-contract': {
        'src': {
          type: 'folder',
          children: {
            'token.rs': { 
              type: 'file', 
              content: `use soroban_sdk::{contractimpl, symbol_short, vec, Env, Symbol, Vec};

pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(env: Env, admin: Symbol) -> Vec<Symbol> {
        // Initialization code here
        vec![&env, symbol_short!("initialized")]
    }
    
    pub fn transfer(env: Env, from: Symbol, to: Symbol, amount: u32) -> Vec<Symbol> {
        // Transfer logic here
        vec![&env, symbol_short!("transferred")]
    }
}` 
            }
          }
        },
        'Cargo.toml': { 
          type: 'file', 
          content: `[package]
name = "token-contract"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "0.8.0"

[dev-dependencies]
soroban-sdk = { version = "0.8.0", features = ["testutils"] }`
        },
        'README.md': { 
          type: 'file', 
          content: `# Token Contract\n\nA basic token contract for the Stellar blockchain.` 
        }
      }
    };
    
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }
    
    // Apply the template to the given path
    const timestamp = new Date().toISOString();
    
    const applyTemplate = async (templateObj, parentPath) => {
      for (const [name, item] of Object.entries(templateObj)) {
        const itemPath = parentPath ? `${parentPath}/${name}` : name;
        
        if (item.type === 'folder') {
          await createFolder(itemPath);
          
          if (item.children) {
            await applyTemplate(item.children, itemPath);
          }
        } else {
          await createFile(itemPath, item.content || '');
        }
      }
    };
    
    await applyTemplate(template, targetPath);
    return true;
  };
  
  // Provide the context value
  const contextValue = {
    fileSystem,
    isLoading,
    error,
    activeProject,
    projects,
    createProject,
    switchProject,
    deleteProject,
    getFileContent,
    saveFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    moveItem,
    copyItem,
    getAllFiles,
    searchFiles,
    exportProject,
    importProject,
    getFileStats,
    getDirectoryStructure,
    createFromTemplate
  };
  
  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

// Custom hook to use the file system context
export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  
  return context;
};
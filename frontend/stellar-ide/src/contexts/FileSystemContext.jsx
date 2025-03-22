import { createContext, useContext, useState, useEffect } from 'react';
import {
  getProjects,
  getProjectFiles,
  getFileContent,
  saveFileContent as saveFileAPI,
  createDirectory,
  deleteFileOrDirectory,
  renameFileOrDirectory,
  createProject as createProjectAPI
} from '../services/ApiService';

// Create the context
const FileSystemContext = createContext(null);

// Context provider component
export const FileSystemProvider = ({ children }) => {
  const [fileTree, setFileTree] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      console.log('Loading projects...');
      setIsLoading(true);
      setError(null);
      
      try {
        const projectsData = await getProjects();
        console.log('Projects loaded:', projectsData);
        
        if (projectsData && Array.isArray(projectsData)) {
          // Extract project names from the API response
          const projectNames = projectsData.map(p => p.name);
          console.log('Project names:', projectNames);
          
          setProjects(projectNames);
          
          // If no active project, set the first one
          if (!activeProject && projectNames.length > 0) {
            console.log('Setting active project to:', projectNames[0]);
            setActiveProject(projectNames[0]);
          }
        } else {
          console.warn('Unexpected projects data format:', projectsData);
          setProjects([]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Failed to load projects: ' + error.message);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Load project files when active project changes
  useEffect(() => {
    const loadProjectFiles = async () => {
      if (!activeProject) {
        console.log('No active project, not loading files');
        setFileTree([]);
        return;
      }
      
      console.log('Loading files for project:', activeProject);
      setIsLoading(true);
      setError(null);
      
      try {
        const structure = await getProjectFiles(activeProject);
        console.log('Project files loaded:', structure);
        setFileTree(structure);
      } catch (error) {
        console.error('Error loading project files:', error);
        setError('Failed to load project files: ' + error.message);
        setFileTree([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectFiles();
  }, [activeProject]);
  
  // Create a new project
  const createProject = async (projectName) => {
    try {
      console.log('Creating project:', projectName);
      setError(null);
      setIsLoading(true);
      
      const result = await createProjectAPI(projectName);
      console.log('Project creation result:', result);
      
      // Add to projects list and switch to it
      setProjects(prev => [...prev, projectName]);
      setActiveProject(projectName);
      
      // Load the project files
      try {
        const structure = await getProjectFiles(projectName);
        console.log('New project files:', structure);
        setFileTree(structure);
      } catch (fileError) {
        console.error('Error loading new project files:', fileError);
        // Don't fail the whole operation if we can't load files immediately
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      setError(`Failed to create project: ${error.message}`);
      setIsLoading(false);
      throw error;
    }
  };
  
  // Switch to a different project
  const switchProject = async (projectName) => {
    console.log('Switching to project:', projectName);
    if (!projects.includes(projectName)) {
      const error = new Error(`Project "${projectName}" does not exist`);
      console.error(error);
      throw error;
    }
    
    setActiveProject(projectName);
    return true;
  };
  
  // Get file content by path
  const getFileContentFromAPI = async (filePath) => {
    if (!activeProject) {
      console.log('No active project, cannot get file content');
      return null;
    }
    
    try {
      console.log(`Getting content for file ${filePath} in project ${activeProject}`);
      const content = await getFileContent(activeProject, filePath);
      return content;
    } catch (error) {
      console.error(`Error getting file content for ${filePath}:`, error);
      return null;
    }
  };
  
  // Save content to a file
  const saveFileContent = async (filePath, content) => {
    if (!activeProject) {
      console.log('No active project, cannot save file');
      return false;
    }
    
    try {
      console.log(`Saving content to file ${filePath} in project ${activeProject}`);
      await saveFileAPI(activeProject, filePath, content);
      
      // Refresh the file tree
      const structure = await getProjectFiles(activeProject);
      setFileTree(structure);
      
      return true;
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
      return false;
    }
  };
  
  // Create a new file
  const createFile = async (filePath, content = '') => {
    console.log(`Creating file ${filePath} with content length: ${content.length}`);
    return saveFileContent(filePath, content);
  };
  
  // Create a new folder
  const createFolder = async (folderPath) => {
    if (!activeProject) {
      console.log('No active project, cannot create folder');
      return false;
    }
    
    try {
      console.log(`Creating folder ${folderPath} in project ${activeProject}`);
      await createDirectory(activeProject, folderPath);
      
      // Refresh the file tree
      const structure = await getProjectFiles(activeProject);
      setFileTree(structure);
      
      return true;
    } catch (error) {
      console.error(`Error creating folder ${folderPath}:`, error);
      return false;
    }
  };
  
  // Delete a file or folder
  const deleteItem = async (itemPath) => {
    if (!activeProject) {
      console.log('No active project, cannot delete item');
      return false;
    }
    
    try {
      console.log(`Deleting item ${itemPath} in project ${activeProject}`);
      await deleteFileOrDirectory(activeProject, itemPath);
      
      // Refresh the file tree
      const structure = await getProjectFiles(activeProject);
      setFileTree(structure);
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${itemPath}:`, error);
      return false;
    }
  };
  
  // Rename a file or folder
  const renameItem = async (oldPath, newName) => {
    if (!activeProject) {
      console.log('No active project, cannot rename item');
      return false;
    }
    
    try {
      console.log(`Renaming ${oldPath} to ${newName} in project ${activeProject}`);
      await renameFileOrDirectory(activeProject, oldPath, newName);
      
      // Refresh the file tree
      const structure = await getProjectFiles(activeProject);
      setFileTree(structure);
      
      return true;
    } catch (error) {
      console.error(`Error renaming ${oldPath} to ${newName}:`, error);
      return false;
    }
  };
  
  // Search files by content or name
  const searchFiles = async (query) => {
    if (!query || !activeProject) {
      console.log('Cannot search: missing query or active project');
      return [];
    }
    
    console.log(`Searching for "${query}" in project ${activeProject}`);
    
    // Simple client-side search through the file tree
    const results = [];
    
    const searchInTree = (items, currentPath = '') => {
      if (!items || !Array.isArray(items)) {
        console.warn('Invalid items in searchInTree:', items);
        return;
      }
      
      items.forEach(item => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        
        // Check if name matches
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            path: itemPath,
            name: item.name,
            type: item.type
          });
        }
        
        // If it's a folder, search in children
        if (item.type === 'folder' && item.children) {
          searchInTree(item.children, itemPath);
        }
      });
    };
    
    searchInTree(fileTree);
    console.log(`Found ${results.length} results for query "${query}"`);
    return results;
  };
  
  // Get file stats (basically just returning file object properties)
  const getFileStats = async (filePath) => {
    if (!activeProject || !fileTree) {
      console.log('Cannot get file stats: missing active project or file tree');
      return null;
    }
    
    console.log(`Getting stats for ${filePath} in project ${activeProject}`);
    
    // Find the file in the file tree
    const findFileInTree = (items, path) => {
      if (!items || !Array.isArray(items)) {
        console.warn('Invalid items in findFileInTree:', items);
        return null;
      }
      
      const pathParts = path.split('/');
      const currentName = pathParts[0];
      
      const foundItem = items.find(item => item.name === currentName);
      
      if (!foundItem) {
        return null;
      }
      
      if (pathParts.length === 1) {
        return foundItem;
      }
      
      if (foundItem.type === 'folder' && foundItem.children) {
        return findFileInTree(foundItem.children, pathParts.slice(1).join('/'));
      }
      
      return null;
    };
    
    const fileStats = findFileInTree(fileTree, filePath);
    return fileStats;
  };
  
  // Transform API file tree to the format expected by the FileTree component
  const getDirectoryStructure = () => {
    return fileTree;
  };
  
  // Provide the context value
  const contextValue = {
    fileTree,
    isLoading,
    error,
    activeProject,
    projects,
    createProject,
    switchProject,
    getFileContent: getFileContentFromAPI,
    saveFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    searchFiles,
    getFileStats,
    getDirectoryStructure,
    openFile: path => getFileContentFromAPI(path) // Alias for compatibility
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
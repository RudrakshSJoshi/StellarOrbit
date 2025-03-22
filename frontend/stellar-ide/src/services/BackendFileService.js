// ====================================================================
// REPLACE YOUR EXISTING src/services/BackendFileService.js WITH THIS FILE
// ====================================================================

// src/services/BackendFileService.js
const API_URL = 'http://localhost:5001/api';

// Get project file structure
export const getProjectStructure = async (projectName) => {
  try {
    console.log(`Fetching structure for project: ${projectName}`);
    const response = await fetch(`${API_URL}/projects/${projectName}/structure`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get project structure');
    }
    
    return data.structure;
  } catch (error) {
    console.error('Error fetching project structure:', error);
    throw error;
  }
};

// Get file content
export const getProjectFile = async (projectName, filePath) => {
  try {
    console.log(`Getting file ${filePath} from project ${projectName}`);
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedPath}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get file content');
    }
    
    return data.content;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

// Save file content
export const saveProjectFile = async (projectName, filePath, content) => {
  try {
    console.log(`Saving file ${filePath} in project ${projectName}`);
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to save file');
    }
    
    return data;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Create new file
export const createProjectFile = async (projectName, filePath, content = '') => {
  try {
    console.log(`Creating file ${filePath} in project ${projectName}`);
    // Using the same endpoint as saveProjectFile but with a different function name for clarity
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create file');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
};

// Create new folder
export const createProjectFolder = async (projectName, folderPath) => {
  try {
    console.log(`Creating folder ${folderPath} in project ${projectName}`);
    const encodedPath = encodeURIComponent(folderPath);
    const response = await fetch(`${API_URL}/projects/${projectName}/directories/${encodedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create folder');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Delete file or folder
export const deleteProjectItem = async (projectName, itemPath) => {
  try {
    console.log(`Deleting item ${itemPath} in project ${projectName}`);
    const encodedPath = encodeURIComponent(itemPath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedPath}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete item');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Rename file or folder
export const renameProjectItem = async (projectName, oldPath, newPath) => {
  try {
    console.log(`Renaming ${oldPath} to ${newPath} in project ${projectName}`);
    // Extract the new name from the newPath
    const newName = newPath.split('/').pop();
    const encodedOldPath = encodeURIComponent(oldPath);
    
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedOldPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newName })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to rename item');
    }
    
    return data;
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};
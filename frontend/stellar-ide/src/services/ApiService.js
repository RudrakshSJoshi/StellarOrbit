// ====================================================================
// REPLACE YOUR EXISTING src/services/ApiService.js WITH THIS FILE
// ====================================================================

// src/services/ApiService.js
const API_URL = 'http://localhost:5001/api';

// Project operations
export const getProjects = async () => {
  try {
    console.log('Fetching projects from:', `${API_URL}/projects`);
    const response = await fetch(`${API_URL}/projects`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw API response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error(`Invalid JSON response: ${text}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get projects');
    }
    
    console.log('Projects retrieved:', data.projects);
    return data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (name) => {
  try {
    console.log('Creating project:', name);
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to create project (${response.status})`);
    }

    console.log('Project created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// File operations
export const getProjectFiles = async (projectName) => {
  try {
    console.log('Fetching files for project:', projectName);
    const response = await fetch(`${API_URL}/projects/${projectName}/files`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch project files');
    }
    
    console.log('Project files retrieved:', data.structure);
    return data.structure;
  } catch (error) {
    console.error(`Error fetching files for project ${projectName}:`, error);
    throw error;
  }
};

export const getFileContent = async (projectName, filePath) => {
  try {
    console.log(`Fetching content for file ${filePath} in project ${projectName}`);
    
    // Ensure the file path is properly encoded for URLs
    const encodedFilePath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedFilePath}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch file content');
    }
    
    return data.content;
  } catch (error) {
    console.error(`Error fetching content for file ${filePath}:`, error);
    throw error;
  }
};

export const saveFileContent = async (projectName, filePath, content) => {
  try {
    console.log(`Saving content to file ${filePath} in project ${projectName}`);
    
    // Ensure the file path is properly encoded for URLs
    const encodedFilePath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedFilePath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.error(`Error saving file ${filePath}:`, error);
    throw error;
  }
};

// Directory operations
export const createDirectory = async (projectName, dirPath) => {
  try {
    console.log(`Creating directory ${dirPath} in project ${projectName}`);
    
    // Ensure the directory path is properly encoded for URLs
    const encodedDirPath = encodeURIComponent(dirPath);
    const response = await fetch(`${API_URL}/projects/${projectName}/directories/${encodedDirPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create directory');
    }
    
    return data;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
};

export const deleteFileOrDirectory = async (projectName, filePath) => {
  try {
    console.log(`Deleting item ${filePath} in project ${projectName}`);
    
    // Ensure the file path is properly encoded for URLs
    const encodedFilePath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedFilePath}`, { 
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
    console.error(`Error deleting ${filePath}:`, error);
    throw error;
  }
};

export const renameFileOrDirectory = async (projectName, filePath, newName) => {
  try {
    console.log(`Renaming ${filePath} to ${newName} in project ${projectName}`);
    
    // Ensure the file path is properly encoded for URLs
    const encodedFilePath = encodeURIComponent(filePath);
    const response = await fetch(`${API_URL}/projects/${projectName}/files/${encodedFilePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    console.error(`Error renaming ${filePath}:`, error);
    throw error;
  }
};

// Compile and Deploy operations
export const compileProject = async (name) => {
  try {
    console.log(`Compiling project ${name}`);
    const response = await fetch(`${API_URL}/projects/${name}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to compile project');
    }
    
    return data;
  } catch (error) {
    console.error('Error compiling project:', error);
    throw error;
  }
};

export const deployProject = async (name, source, network) => {
  try {
    console.log(`Deploying project ${name} to ${network} using source ${source}`);
    const response = await fetch(`${API_URL}/projects/${name}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, network })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to deploy project');
    }
    
    return data;
  } catch (error) {
    console.error('Error deploying project:', error);
    throw error;
  }
};
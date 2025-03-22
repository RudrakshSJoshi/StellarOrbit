// src/services/ApiService.js
const API_URL = 'http://localhost:5001/api';

// In ApiService.js
export const createProject = async (name) => {
    try {
      // No validation here - directly send to backend
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };
export const compileProject = async (name) => {
  try {
    const response = await fetch(`${API_URL}/projects/${name}/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
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
    const response = await fetch(`${API_URL}/projects/${name}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ source, network })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to deploy project');
    }
    
    return data;
  } catch (error) {
    console.error('Error deploying project:', error);
    throw error;
  }
};
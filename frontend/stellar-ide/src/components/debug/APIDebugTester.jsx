// ====================================================================
// CREATE NEW FILE: src/components/debug/APIDebugTester.jsx
// ====================================================================

import React, { useState, useEffect } from 'react';

const APIDebugTester = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:5001/api');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectFiles, setProjectFiles] = useState(null);

  // Test API connection
  const testAPIConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await fetch(`${apiUrl}/test`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        setTestResult({
          status: response.status,
          ok: response.ok,
          data
        });
      } catch (e) {
        setTestResult({
          status: response.status,
          ok: response.ok,
          text
        });
      }
    } catch (err) {
      setError(`API connection failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/projects`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success && data.projects) {
          setProjects(data.projects);
          if (data.projects.length > 0 && !selectedProject) {
            setSelectedProject(data.projects[0].name);
          }
        } else {
          setError(data.error || 'Failed to fetch projects');
        }
      } catch (e) {
        setError(`Failed to parse response: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new project
  const createProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newProjectName })
      });
      
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setNewProjectName('');
          fetchProjects(); // Refresh project list
        } else {
          setError(data.error || 'Failed to create project');
        }
      } catch (e) {
        setError(`Failed to parse response: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project files
  const fetchProjectFiles = async () => {
    if (!selectedProject) {
      setError('No project selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProjectFiles(null);
    
    try {
      const response = await fetch(`${apiUrl}/projects/${selectedProject}/files`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setProjectFiles(data.structure);
        } else {
          setError(data.error || 'Failed to fetch project files');
        }
      } catch (e) {
        setError(`Failed to parse response: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    testAPIConnection();
    fetchProjects();
  }, []);

  // Recursive component to display file tree
  const FileTreeItem = ({ item }) => {
    if (item.type === 'folder') {
      return (
        <div className="tree-folder">
          <div className="folder-name">📁 {item.name}</div>
          <div className="folder-children" style={{ marginLeft: '20px' }}>
            {item.children && Object.entries(item.children).map(([name, childItem]) => (
              <FileTreeItem key={name} item={{...childItem, name}} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="tree-file">
          <div className="file-name">📄 {item.name}</div>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Debug Tester</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          color: 'red', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Connection Test</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            value={apiUrl} 
            onChange={(e) => setApiUrl(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button 
            onClick={testAPIConnection}
            disabled={isLoading}
            style={{ padding: '8px 16px' }}
          >
            Test Connection
          </button>
        </div>
        
        {testResult && (
          <div style={{ 
            backgroundColor: testResult.ok ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)', 
            padding: '10px', 
            borderRadius: '4px' 
          }}>
            <div><strong>Status:</strong> {testResult.status} ({testResult.ok ? 'OK' : 'Error'})</div>
            <pre style={{ 
              backgroundColor: '#f4f4f4', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(testResult.data || testResult.text, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '40%' }}>
          <h2>Projects</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="text" 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                style={{ flex: 1, padding: '8px' }}
              />
              <button 
                onClick={createProject}
                disabled={isLoading}
                style={{ padding: '8px 16px' }}
              >
                Create Project
              </button>
            </div>
            
            <button 
              onClick={fetchProjects}
              disabled={isLoading}
              style={{ padding: '8px 16px', width: '100%' }}
            >
              Refresh Projects List
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Project List</h3>
            {projects.length === 0 ? (
              <div>No projects found</div>
            ) : (
              <div>
                <select 
                  value={selectedProject} 
                  onChange={(e) => setSelectedProject(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                >
                  <option value="">Select a project</option>
                  {projects.map((project, index) => (
                    <option key={index} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
                
                <button 
                  onClick={fetchProjectFiles}
                  disabled={!selectedProject || isLoading}
                  style={{ padding: '8px 16px', width: '100%' }}
                >
                  View Project Files
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ width: '60%' }}>
          <h2>Project Files</h2>
          
          {isLoading ? (
            <div>Loading...</div>
          ) : !projectFiles ? (
            <div>No files loaded. Select a project and click "View Project Files".</div>
          ) : projectFiles.length === 0 ? (
            <div>Project has no files or directories</div>
          ) : (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              padding: '10px',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              {projectFiles.map((item, index) => (
                <FileTreeItem key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIDebugTester;
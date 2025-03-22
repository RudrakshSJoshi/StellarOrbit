import React, { useState, useEffect } from 'react';

const APITest = () => {
  const [projectsApiResponse, setProjectsApiResponse] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [filesApiResponse, setFilesApiResponse] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test projects API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/projects');
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        setProjectsApiResponse(data);
        
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0].name);
        }
      } catch (e) {
        setError(`Failed to parse response as JSON: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test files API for a project
  const fetchProjectFiles = async () => {
    if (!selectedProject) {
      setError("No project selected");
      return;
    }
    
    setLoading(true);
    setError(null);
    setFilesApiResponse(null);
    
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${selectedProject}/files`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        setFilesApiResponse(data);
      } catch (e) {
        setError(`Failed to parse response as JSON: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test file content API
  const fetchFileContent = async () => {
    if (!selectedProject || !selectedFile) {
      setError("No project or file selected");
      return;
    }
    
    setLoading(true);
    setError(null);
    setFileContent('');
    
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${selectedProject}/files/${selectedFile}`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success && data.content !== undefined) {
          setFileContent(data.content);
        } else {
          setError(`API returned an error: ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        setError(`Failed to parse response as JSON: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test saving file content
  const saveFileContent = async () => {
    if (!selectedProject || !selectedFile) {
      setError("No project or file selected");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${selectedProject}/files/${selectedFile}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: fileContent })
      });
      
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success) {
          alert('File saved successfully!');
        } else {
          setError(`API returned an error: ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        setError(`Failed to parse response as JSON: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create test file
  const createTestFile = async () => {
    if (!selectedProject) {
      setError("No project selected");
      return;
    }
    
    const testFileName = `test-file-${Date.now()}.txt`;
    const testContent = 'This is a test file created from the API Test component.';
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${selectedProject}/files/${testFileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: testContent })
      });
      
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (data.success) {
          alert(`Test file created: ${testFileName}`);
          fetchProjectFiles(); // Refresh file list
        } else {
          setError(`API returned an error: ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        setError(`Failed to parse response as JSON: ${text}`);
      }
    } catch (err) {
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Recursive component to display file tree
  const FileTreeItem = ({ item, path = '' }) => {
    const itemPath = path ? `${path}/${item.name}` : item.name;
    
    if (item.type === 'folder') {
      return (
        <div className="tree-folder">
          <div className="folder-name">📁 {item.name}</div>
          <div className="folder-children" style={{ marginLeft: '20px' }}>
            {item.children?.map((child, index) => (
              <FileTreeItem key={`${itemPath}-${index}`} item={child} path={itemPath} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div 
          className="tree-file" 
          onClick={() => {
            setSelectedFile(itemPath);
            fetchFileContent();
          }}
        >
          <div className="file-name" style={{ 
            cursor: 'pointer',
            color: selectedFile === itemPath ? '#4fc3f7' : 'inherit'
          }}>
            📄 {item.name}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Test Component</h1>
      
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
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button 
          onClick={fetchProjects}
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          Refresh Projects
        </button>
        
        {projectsApiResponse && (
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ padding: '8px', minWidth: '200px' }}
          >
            <option value="">Select a project</option>
            {projectsApiResponse.projects?.map((project, index) => (
              <option key={`project-${index}`} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>
        )}
        
        <button 
          onClick={fetchProjectFiles}
          disabled={!selectedProject || loading}
          style={{ padding: '8px 16px' }}
        >
          View Project Files
        </button>
        
        <button 
          onClick={createTestFile}
          disabled={!selectedProject || loading}
          style={{ padding: '8px 16px' }}
        >
          Create Test File
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '40%', borderRight: '1px solid #ddd', paddingRight: '20px' }}>
          <h2>File Explorer</h2>
          
          {loading && <div>Loading...</div>}
          
          {filesApiResponse?.structure ? (
            <div className="file-tree">
              {filesApiResponse.structure.map((item, index) => (
                <FileTreeItem key={`root-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <div>No files loaded. Select a project and click "View Project Files".</div>
          )}
        </div>
        
        <div style={{ width: '60%' }}>
          <h2>File Editor</h2>
          {selectedFile ? (
            <>
              <div style={{ marginBottom: '10px' }}>
                <strong>Editing:</strong> {selectedFile}
              </div>
              
              <textarea 
                value={fileContent} 
                onChange={(e) => setFileContent(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  fontFamily: 'monospace',
                  padding: '10px',
                  marginBottom: '10px'
                }}
              />
              
              <button 
                onClick={saveFileContent}
                disabled={loading}
                style={{ padding: '8px 16px' }}
              >
                Save File
              </button>
            </>
          ) : (
            <div>No file selected. Click on a file in the explorer to edit it.</div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>API Responses</h2>
        
        <h3>Projects API Response</h3>
        <pre style={{ 
          backgroundColor: '#f4f4f4', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(projectsApiResponse, null, 2) || 'No response yet'}
        </pre>
        
        <h3>Files API Response</h3>
        <pre style={{ 
          backgroundColor: '#f4f4f4', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(filesApiResponse, null, 2) || 'No response yet'}
        </pre>
      </div>
    </div>
  );
};

export default APITest;
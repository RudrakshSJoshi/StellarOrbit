// src/components/project/ProjectCodeEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { getProjectFile, saveProjectFile } from '../../services/BackendFileService';

const ProjectCodeEditor = ({ projectName, filePath, onSave }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const editorInstanceRef = useRef(null);
  
  useEffect(() => {
    // Load file content when filePath changes
    const loadFileContent = async () => {
      if (!projectName || !filePath) {
        setContent('');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fileContent = await getProjectFile(projectName, filePath);
        setContent(fileContent);
        setIsDirty(false);
        
        // Update editor content if it exists
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setValue(fileContent);
        }
      } catch (err) {
        console.error('Error loading file:', err);
        setError(`Failed to load file: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFileContent();
  }, [projectName, filePath]);
  
  // Save file content
  const handleSave = async () => {
    if (!projectName || !filePath) return;
    
    try {
      await saveProjectFile(projectName, filePath, content);
      setIsDirty(false);
      if (onSave) onSave(filePath);
    } catch (err) {
      console.error('Error saving file:', err);
      setError(`Failed to save file: ${err.message}`);
    }
  };
  
  // Load Monaco editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Clean up function for editor
    let disposeEditor = () => {};
    
    // Dynamic import for Monaco editor
    const loadMonaco = async () => {
      try {
        // Import monaco dynamically
        const monaco = await import('monaco-editor');
        monacoRef.current = monaco;
        
        // Create editor instance
        const editor = monaco.editor.create(editorRef.current, {
          value: content,
          language: getLanguageFromPath(filePath),
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          formatOnPaste: true,
          formatOnType: true,
        });
        
        editorInstanceRef.current = editor;
        
        // Handle content changes
        const contentChangeDisposable = editor.onDidChangeModelContent(() => {
          setContent(editor.getValue());
          setIsDirty(true);
        });
        
        // Set up keyboard shortcut for save
        const saveCommandDisposable = editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, 
          handleSave
        );
        
        // Update cleanup function
        disposeEditor = () => {
          contentChangeDisposable.dispose();
          saveCommandDisposable.dispose();
          editor.dispose();
        };
      } catch (err) {
        console.error('Error loading Monaco editor:', err);
        setError('Failed to load editor');
      }
    };
    
    loadMonaco();
    
    // Clean up when component unmounts
    return () => {
      disposeEditor();
    };
  }, [editorRef.current, filePath]);
  
  // Helper function to determine language from file path
  const getLanguageFromPath = (path) => {
    if (!path) return 'plaintext';
    
    const extension = path.split('.').pop().toLowerCase();
    const languageMap = {
      rs: 'rust',
      js: 'javascript',
      json: 'json',
      ts: 'typescript',
      html: 'html',
      css: 'css',
      md: 'markdown',
      toml: 'ini',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'shell',
      Cargo: 'toml'
    };
    
    return languageMap[extension] || 'plaintext';
  };
  
  // Handle keyboard shortcuts globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isDirty) {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, handleSave]);
  
  return (
    <div className="project-code-editor-container">
      {isLoading ? (
        <div className="editor-loading">
          <div className="loading-spinner"></div>
          <div>Loading file...</div>
        </div>
      ) : error ? (
        <div className="editor-error">
          <div className="error-icon">⚠️</div>
          <div>{error}</div>
        </div>
      ) : (
        <>
          <div className="editor-toolbar">
            <div className="file-info">
              <span className="file-path">{filePath}</span>
              {isDirty && <span className="dirty-indicator">•</span>}
            </div>
            <div className="toolbar-actions">
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={!isDirty}
              >
                Save
              </button>
            </div>
          </div>
          <div ref={editorRef} className="monaco-container"></div>
        </>
      )}
      
      <style jsx>{`
        .project-code-editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .editor-loading, .editor-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 12px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-icon {
          font-size: 24px;
          margin-bottom: 12px;
        }
        
        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          padding: 0 16px;
          background-color: var(--background-tertiary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .file-info {
          display: flex;
          align-items: center;
        }
        
        .file-path {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .dirty-indicator {
          margin-left: 8px;
          font-size: 20px;
          color: var(--accent-primary);
        }
        
        .toolbar-actions {
          display: flex;
        }
        
        .save-button {
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 4px;
          background-color: var(--accent-primary);
          color: white;
          opacity: 1;
        }
        
        .save-button:disabled {
          opacity: 0.5;
        }
        
        .monaco-container {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectCodeEditor;
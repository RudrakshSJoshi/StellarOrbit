import { createContext, useContext, useState, useEffect } from 'react';
import { useFileSystem } from './FileSystemContext';

// Create the context
const EditorContext = createContext(null);

// Context provider component
export const EditorProvider = ({ children }) => {
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [editorHistory, setEditorHistory] = useState({}); // For undo/redo functionality
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    wordWrap: 'off',
    minimap: true,
    lineNumbers: true,
  });
  
  const { 
    getFileContent, 
    saveFileContent, 
    activeProject 
  } = useFileSystem();
  
  // Close all open files when project changes
  useEffect(() => {
    setOpenFiles([]);
    setActiveFile(null);
    setEditorHistory({});
  }, [activeProject]);
  
  // Function to open a file
  const openFile = async (filePath) => {
    // Check if file is already open
    if (openFiles.some(file => file.path === filePath)) {
      setActiveFile(filePath);
      return;
    }
    
    try {
      // Get content from file system service
      const content = await getFileContent(filePath);
      
      if (content !== null) {
        // Add file to open files
        setOpenFiles(prev => [
          ...prev,
          { 
            path: filePath, 
            content,
            isDirty: false,
            language: getLanguageFromPath(filePath),
            lastModified: new Date().toISOString()
          }
        ]);
        
        // Set as active file
        setActiveFile(filePath);
        
        // Initialize history for this file
        setEditorHistory(prev => ({
          ...prev,
          [filePath]: {
            past: [],
            future: [],
            currentContent: content
          }
        }));
      } else {
        console.error(`Could not open file ${filePath}: Content is null`);
      }
    } catch (error) {
      console.error(`Error opening file ${filePath}:`, error);
      throw error;
    }
  };
  
  // Function to close a file
  const closeFile = async (filePath) => {
    // Check if file is dirty and needs saving
    const fileToClose = openFiles.find(file => file.path === filePath);
    
    if (fileToClose && fileToClose.isDirty && editorSettings.autoSave) {
      await saveFileContent(filePath, fileToClose.content);
    }
    
    // Remove from open files
    setOpenFiles(prev => prev.filter(file => file.path !== filePath));
    
    // If we closed the active file, set another one as active
    if (activeFile === filePath) {
      const remainingFiles = openFiles.filter(file => file.path !== filePath);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0].path);
      } else {
        setActiveFile(null);
      }
    }
    
    // Clean up history for this file
    setEditorHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[filePath];
      return newHistory;
    });
  };
  
  // Function to update file content
  const updateFileContent = (filePath, newContent) => {
    const file = openFiles.find(f => f.path === filePath);
    
    if (!file || file.content === newContent) return;
    
    // Update file in open files list
    setOpenFiles(prev => prev.map(file => 
      file.path === filePath 
        ? { 
            ...file, 
            content: newContent,
            isDirty: true,
            lastModified: new Date().toISOString()
          } 
        : file
    ));
    
    // Update history for undo/redo
    const history = editorHistory[filePath];
    if (history && history.currentContent !== newContent) {
      setEditorHistory(prev => ({
        ...prev,
        [filePath]: {
          past: [...prev[filePath].past, prev[filePath].currentContent],
          future: [],
          currentContent: newContent
        }
      }));
    }
    
    // Auto-save if enabled
    if (editorSettings.autoSave) {
      const debouncedSave = setTimeout(() => {
        saveFileContent(filePath, newContent)
          .then(() => {
            // Mark file as not dirty after save
            setOpenFiles(prev => prev.map(file => 
              file.path === filePath 
                ? { ...file, isDirty: false } 
                : file
            ));
          })
          .catch(error => {
            console.error(`Error auto-saving file ${filePath}:`, error);
          });
      }, 1000);
      
      return () => clearTimeout(debouncedSave);
    }
  };
  
  // Function to save the current file
  const saveCurrentFile = async () => {
    if (!activeFile) return false;
    
    const file = openFiles.find(f => f.path === activeFile);
    if (!file) return false;
    
    try {
      await saveFileContent(file.path, file.content);
      
      // Mark file as not dirty after save
      setOpenFiles(prev => prev.map(file => 
        file.path === activeFile 
          ? { ...file, isDirty: false } 
          : file
      ));
      
      return true;
    } catch (error) {
      console.error(`Error saving file ${activeFile}:`, error);
      return false;
    }
  };
  
  // Function to save all open files
  const saveAllFiles = async () => {
    const savePromises = openFiles
      .filter(file => file.isDirty)
      .map(file => saveFileContent(file.path, file.content));
    
    try {
      await Promise.all(savePromises);
      
      // Mark all files as not dirty after save
      setOpenFiles(prev => prev.map(file => ({ ...file, isDirty: false })));
      
      return true;
    } catch (error) {
      console.error('Error saving all files:', error);
      return false;
    }
  };
  
  // Function to create a new file
  const createNewFile = async (filePath, content = '') => {
    // Save to file system
    try {
      await saveFileContent(filePath, content);
      
      // Open the new file
      await openFile(filePath);
      
      return true;
    } catch (error) {
      console.error(`Error creating new file ${filePath}:`, error);
      return false;
    }
  };
  
  // Utility function to get language from file path
  const getLanguageFromPath = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'rs':
        return 'rust';
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'toml':
        return 'toml';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'txt':
        return 'plaintext';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'ts':
      case 'tsx':
        return 'typescript';
      default:
        return 'plaintext';
    }
  };
  
  // Undo function
  const undoEdit = () => {
    if (!activeFile) return;
    
    const history = editorHistory[activeFile];
    if (!history || history.past.length === 0) return;
    
    const newPast = [...history.past];
    const previousContent = newPast.pop();
    
    // Update history
    setEditorHistory(prev => ({
      ...prev,
      [activeFile]: {
        past: newPast,
        future: [history.currentContent, ...history.future],
        currentContent: previousContent
      }
    }));
    
    // Update file content
    setOpenFiles(prev => prev.map(file => 
      file.path === activeFile 
        ? { 
            ...file, 
            content: previousContent,
            isDirty: true,
            lastModified: new Date().toISOString()
          } 
        : file
    ));
  };
  
  // Redo function
  const redoEdit = () => {
    if (!activeFile) return;
    
    const history = editorHistory[activeFile];
    if (!history || history.future.length === 0) return;
    
    const newFuture = [...history.future];
    const nextContent = newFuture.shift();
    
    // Update history
    setEditorHistory(prev => ({
      ...prev,
      [activeFile]: {
        past: [...history.past, history.currentContent],
        future: newFuture,
        currentContent: nextContent
      }
    }));
    
    // Update file content
    setOpenFiles(prev => prev.map(file => 
      file.path === activeFile 
        ? { 
            ...file, 
            content: nextContent,
            isDirty: true,
            lastModified: new Date().toISOString()
          } 
        : file
    ));
  };
  
  // Update editor settings
  const updateEditorSettings = (newSettings) => {
    setEditorSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    // Save settings to local storage
    localStorage.setItem('stellarIDE_editorSettings', JSON.stringify({
      ...editorSettings,
      ...newSettings
    }));
  };
  
  // Load editor settings from local storage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('stellarIDE_editorSettings');
    if (storedSettings) {
      try {
        setEditorSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error('Error parsing editor settings:', error);
      }
    }
  }, []);
  
  // Provide the context value
  const contextValue = {
    openFiles,
    activeFile,
    editorSettings,
    setActiveFile,
    openFile,
    closeFile,
    updateFileContent,
    saveCurrentFile,
    saveAllFiles,
    createNewFile,
    undoEdit,
    redoEdit,
    updateEditorSettings,
    getLanguageFromPath
  };
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the editor context
export const useEditor = () => {
  const context = useContext(EditorContext);
  
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  
  return context;
};
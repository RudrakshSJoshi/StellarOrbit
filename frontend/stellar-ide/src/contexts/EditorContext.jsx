import { createContext, useContext, useState, useEffect } from 'react';
import { useFileSystem } from './FileSystemContext';

// Initial sample file content
const initialRustContract = `use soroban_sdk::{contractimpl, log, symbol_short, vec, Env, Symbol, Vec};

pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        log!(&env, "Hello {}", to);
        vec![&env, symbol_short!("Hello"), to]
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{symbol_short, vec, Env, Symbol, Vec};

    #[test]
    fn test_hello() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Contract);
        let client = ContractClient::new(&env, &contract_id);

        let name = symbol_short!("Dev");
        let res = client.hello(&name);

        assert_eq!(res, vec![&env, symbol_short!("Hello"), name]);
    }
}`;

const initialJavaScriptDeploy = `// Deploy script for Soroban contract
const StellarSdk = require('stellar-sdk');
const fs = require('fs');
const path = require('path');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const network = StellarSdk.Networks.TESTNET;

// Load contract WASM
const contractPath = path.resolve(__dirname, '../target/wasm32-unknown-unknown/release/hello_world.wasm');
const contractCode = fs.readFileSync(contractPath);

// Load deployer account
const deployerKeypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY');

async function deployContract() {
  try {
    // Get account sequence number
    const account = await server.loadAccount(deployerKeypair.publicKey());
    
    // Create transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '100000', // 0.01 XLM
      networkPassphrase: network
    })
    .addOperation(StellarSdk.Operation.uploadContractWasm({
      wasm: contractCode.toString('base64')
    }))
    .setTimeout(30)
    .build();
    
    // Sign and submit transaction
    transaction.sign(deployerKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log('Contract deployed successfully!');
    console.log('Contract ID:', result.hash);
    
    return result;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

deployContract();`;

const initialReadme = `# Stellar Smart Contract Project

This project contains a sample Soroban smart contract written in Rust for the Stellar blockchain.

## Getting Started

### Prerequisites

- Rust toolchain with wasm32-unknown-unknown target
- Soroban CLI
- Node.js and npm (for deployment scripts)

### Build

To build the contract:

\`\`\`
cargo build --target wasm32-unknown-unknown --release
\`\`\`

### Test

To run the tests:

\`\`\`
cargo test
\`\`\`

### Deploy

To deploy the contract to testnet:

\`\`\`
node scripts/deploy.js
\`\`\`

## Contract Functions

- **hello(to: Symbol)** - Returns a greeting to the specified name

## License

MIT
`;

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
  const { getFileContent, saveFileContent } = useFileSystem();
  
  // Function to open a file
  const openFile = async (filePath) => {
    // Check if file is already open
    if (openFiles.some(file => file.path === filePath)) {
      setActiveFile(filePath);
      return;
    }
    
    try {
      // Get content from file system service
      let content = await getFileContent(filePath);
      
      // If file doesn't exist yet (or we're in demo mode), use placeholder content
      if (!content) {
        if (filePath.endsWith('.rs')) {
          content = initialRustContract;
        } else if (filePath.endsWith('.js')) {
          content = initialJavaScriptDeploy;
        } else if (filePath.endsWith('.md')) {
          content = initialReadme;
        } else if (filePath.endsWith('.toml')) {
          content = '[package]\nname = "stellar-contract"\nversion = "0.1.0"\nedition = "2021"\n\n[lib]\ncrate-type = ["cdylib"]\n\n[dependencies]\nsoroban-sdk = "0.8.0"\n\n[dev-dependencies]\nsoroban-sdk = { version = "0.8.0", features = ["testutils"] }';
        } else {
          content = '// New file';
        }
        
        // Save the new file to the file system
        await saveFileContent(filePath, content);
      }
      
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
      const saveTimeout = setTimeout(() => {
        saveFileContent(filePath, newContent);
        
        // Mark file as not dirty after save
        setOpenFiles(prev => prev.map(file => 
          file.path === filePath 
            ? { ...file, isDirty: false } 
            : file
        ));
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
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
  const createNewFile = async (filePath, template = 'empty') => {
    let initialContent = '';
    
    // Choose template based on file extension and template parameter
    if (filePath.endsWith('.rs')) {
      if (template === 'contract') {
        initialContent = initialRustContract;
      } else {
        initialContent = '// New Rust file';
      }
    } else if (filePath.endsWith('.js')) {
      if (template === 'deploy') {
        initialContent = initialJavaScriptDeploy;
      } else {
        initialContent = '// New JavaScript file';
      }
    } else if (filePath.endsWith('.md')) {
      initialContent = '# New Markdown File';
    } else if (filePath.endsWith('.toml')) {
      initialContent = '[package]\nname = "new-project"\nversion = "0.1.0"\n';
    } else {
      initialContent = '// New file';
    }
    
    // Save to file system
    try {
      await saveFileContent(filePath, initialContent);
      
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
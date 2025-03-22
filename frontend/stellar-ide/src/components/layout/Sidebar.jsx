import { useState, useEffect } from 'react';
import FileTree from '../editor/FileTree';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import NewProjectModal from '../projects/NewProjectModal';
import { getProjects } from '../../services/ApiService';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('files');
  const { accounts, activeAccount, createAccount, importAccount, contractInstances } = useBlockchain();
  const { 
    searchFiles, 
    projects, 
    activeProject, 
    switchProject, 
    isLoading,
    createProject
  } = useFileSystem();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectCreating, setProjectCreating] = useState(false);
  
  // Fetch projects if needed
  useEffect(() => {
    if (projects.length === 0 && !isLoading) {
      // This is a fallback in case FileSystemContext didn't load projects
      const fetchProjects = async () => {
        try {
          const projectList = await getProjects();
          console.log('Fetched projects:', projectList);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };
      
      fetchProjects();
    }
  }, [projects, isLoading]);
  
  const tabs = [
    { id: 'files', icon: '📄', label: 'Files' },
    { id: 'accounts', icon: '👤', label: 'Accounts' },
    { id: 'contracts', icon: '📝', label: 'Contracts' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await searchFiles(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching files:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      createAccount(newAccountName);
      setNewAccountName('');
    }
  };
  
  const handleImportAccount = () => {
    if (newAccountName.trim() && secretKey.trim()) {
      try {
        importAccount(newAccountName, secretKey);
        setNewAccountName('');
        setSecretKey('');
      } catch (error) {
        console.error('Error importing account:', error);
        // In a real app, show an error notification
      }
    }
  };
  
  const handleProjectCreated = async (projectName) => {
    setProjectCreating(true);
    try {
      await createProject(projectName);
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      // In a real app, you would show an error notification here
    } finally {
      setProjectCreating(false);
    }
  };
  
  // Fixed project switch handler
  const handleProjectSwitch = async (e) => {
    const projectName = e.target.value;
    
    // Add validation to prevent switching to empty project names
    if (!projectName || projectName.trim() === '') {
      console.warn('Cannot switch to empty project name');
      return; // Early return to prevent the error
    }
    
    try {
      console.log('Switching to project:', projectName);
      await switchProject(projectName);
    } catch (error) {
      console.error('Error switching project:', error);
    }
  };
  
  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://localhost:5001/api/projects');
      
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed API response:', data);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        alert('API returned invalid JSON: ' + responseText);
        return;
      }
      
      if (response.ok) {
        alert('API connection successful! Projects: ' + 
              (data.projects ? JSON.stringify(data.projects) : 'No projects property in response'));
      } else {
        alert('API returned error: ' + (data.error || response.status));
      }
    } catch (error) {
      console.error('API test failed:', error);
      alert('API connection failed: ' + error.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="sidebar-content">
        {activeTab === 'files' && (
          <div className="files-panel">
            <div className="project-selector">
              <select 
                value={activeProject || ''} 
                onChange={handleProjectSwitch}
                className="project-select"
                disabled={isLoading || projectCreating}
              >
                {/* Add a disabled default option to prevent empty selection */}
                {!activeProject && (
                  <option value="" disabled>Select a project</option>
                )}
                
                {projects.length > 0 ? (
                  projects.map(project => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No projects available</option>
                )}
              </select>
              <button 
                className="icon-button" 
                title="Create New Project"
                onClick={() => setShowNewProjectModal(true)}
                disabled={isLoading || projectCreating}
              >
                <span>+</span>
              </button>
            </div>
            
            <FileTree />
          </div>
        )}
        
        {activeTab === 'accounts' && (
          <div className="accounts-panel">
            <div className="panel-header">
              <h3>Accounts</h3>
              <div className="panel-actions">
                <button className="icon-button" title="Create Account">
                  <span>+</span>
                </button>
                <button className="icon-button" title="Import Account">
                  <span>↓</span>
                </button>
              </div>
            </div>
            
            <div className="accounts-list">
              {accounts.length > 0 ? (
                accounts.map(account => (
                  <div 
                    key={account.publicKey}
                    className={`account-item ${activeAccount === account.publicKey ? 'active' : ''}`}
                  >
                    <div className="account-icon">👤</div>
                    <div className="account-details">
                      <div className="account-name">{account.name}</div>
                      <div className="account-key">
                        {account.publicKey.substr(0, 8)}...{account.publicKey.substr(-4)}
                      </div>
                    </div>
                    <div className="account-balance">
                      {parseFloat(account.balance).toFixed(2)} XLM
                    </div>
                  </div>
                ))
              ) : (
                <div className="create-account-form">
                  <input
                    type="text"
                    className="account-input"
                    placeholder="Account Name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                  <button 
                    className="account-button"
                    onClick={handleCreateAccount}
                  >
                    Create
                  </button>
                  
                  <div className="separator">or</div>
                  
                  <input
                    type="text"
                    className="account-input"
                    placeholder="Secret Key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <button 
                    className="account-button"
                    onClick={handleImportAccount}
                  >
                    Import
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'contracts' && (
          <div className="contracts-panel">
            <div className="panel-header">
              <h3>Contracts</h3>
              <div className="panel-actions">
                <button className="icon-button" title="Deploy Contract">
                  <span>🚀</span>
                </button>
                <button className="icon-button" title="Import Contract">
                  <span>↓</span>
                </button>
              </div>
            </div>
            
            <div className="contracts-list">
              {contractInstances.length > 0 ? (
                contractInstances.map(contract => (
                  <div 
                    key={contract.contractId}
                    className="contract-item"
                  >
                    <div className="contract-icon">📝</div>
                    <div className="contract-details">
                      <div className="contract-name">{contract.name}</div>
                      <div className="contract-id">
                        {contract.contractId.substr(0, 8)}...{contract.contractId.substr(-4)}
                      </div>
                    </div>
                    <div className="contract-network">
                      {contract.network}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No contracts deployed yet</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'search' && (
          <div className="search-panel">
            <div className="panel-header">
              <h3>Search</h3>
            </div>
            
            <div className="search-input-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search in workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
              >
                🔍
              </button>
            </div>
            
            <div className="search-results">
              {searchResults.length > 0 ? (
                <div>
                  <div className="search-summary">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.map((result, index) => (
                    <div key={index} className="search-result-item">
                      <div className="result-filename">
                        {result.name}
                      </div>
                      <div className="result-path">{result.path}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">
                  {searchQuery ? 'No results found' : 'Type to search'}
                </p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h3>Settings</h3>
            </div>
            
            <div className="settings-list">
              <div className="setting-group">
                <h4 className="setting-group-title">Editor</h4>
                
                <div className="setting-item">
                  <span className="setting-label">Font Size</span>
                  <select className="setting-control">
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Tab Size</span>
                  <select className="setting-control">
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Word Wrap</span>
                  <select className="setting-control">
                    <option value="off">Off</option>
                    <option value="on">On</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Auto Save</span>
                  <input type="checkbox" className="setting-control" defaultChecked />
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Minimap</span>
                  <input type="checkbox" className="setting-control" defaultChecked />
                </div>
              </div>
              
              <div className="setting-group">
                <h4 className="setting-group-title">Network</h4>
                
                <div className="setting-item">
                  <span className="setting-label">Default Network</span>
                  <select className="setting-control">
                    <option value="testnet">Testnet</option>
                    <option value="mainnet">Mainnet</option>
                    <option value="local">Local</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Horizon URL</span>
                  <input 
                    type="text" 
                    className="setting-control text-input" 
                    defaultValue="https://horizon-testnet.stellar.org"
                  />
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">RPC URL</span>
                  <input 
                    type="text" 
                    className="setting-control text-input" 
                    defaultValue="https://soroban-testnet.stellar.org"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="sidebar-footer">
        <div className="debug-controls">
          <button 
            className="debug-button"
            onClick={testAPIConnection}
            title="Test API Connection"
          >
            🔌 Test API
          </button>
        </div>
        <div className="ai-assistant-toggle">
          <button className="ai-button">
            <span className="ai-icon">🤖</span>
            <span>AI Assistant</span>
          </button>
        </div>
      </div>
      
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={handleProjectCreated}
          isLoading={projectCreating}
        />
      )}
      
      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100%;
          background-color: var(--background-secondary);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-tabs {
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .sidebar-tab {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          color: var(--text-secondary);
          position: relative;
          transition: all 0.2s ease;
        }
        
        .sidebar-tab:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .sidebar-tab.active {
          color: var(--text-primary);
        }
        
        .sidebar-tab.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, var(--space-bright-blue), var(--space-purple));
        }
        
        .tab-icon {
          margin-right: 12px;
          font-size: 18px;
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .panel-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .panel-actions {
          display: flex;
        }
        
        .icon-button {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          padding: 0;
          color: var(--text-secondary);
          background-color: transparent;
        }
        
        .icon-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .project-selector {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .project-select {
          flex: 1;
          background-color: var(--background-tertiary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 13px;
        }
        
        .empty-message {
          padding: 20px 16px;
          color: var(--text-secondary);
          font-size: 13px;
          text-align: center;
        }
        
        /* Accounts Panel */
        .accounts-list {
          padding: 8px;
        }
        
        .account-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: var(--border-radius);
          margin-bottom: 4px;
          transition: background-color 0.2s;
        }
        
        .account-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .account-item.active {
          background-color: rgba(30, 136, 229, 0.1);
        }
        
        .account-icon {
          margin-right: 12px;
          font-size: 18px;
        }
        
        .account-details {
          flex: 1;
        }
        
        .account-name {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        
        .account-key {
          font-size: 11px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        
        .account-balance {
          font-size: 12px;
          color: var(--space-light-blue);
        }
        
        .create-account-form {
          padding: 16px;
        }
        
        .account-input {
          width: 100%;
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          padding: 8px 12px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        
        .account-button {
          width: 100%;
          background-color: var(--accent-primary);
          color: white;
          border-radius: var(--border-radius);
          padding: 8px 0;
          margin-bottom: 16px;
        }
        
        .separator {
          text-align: center;
          margin: 8px 0;
          position: relative;
          color: var(--text-secondary);
          font-size: 12px;
        }
        
        .separator::before,
        .separator::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .separator::before {
          left: 0;
        }
        
        .separator::after {
          right: 0;
        }
        
        /* Contracts Panel */
        .contracts-list {
          padding: 8px;
        }
        
        .contract-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: var(--border-radius);
          margin-bottom: 4px;
          transition: background-color 0.2s;
        }
        
        .contract-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .contract-icon {
          margin-right: 12px;
          font-size: 18px;
        }
        
        .contract-details {
          flex: 1;
        }
        
        .contract-name {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        
        .contract-id {
          font-size: 11px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        
        .contract-network {
          font-size: 11px;
          color: var(--space-orange);
          padding: 2px 6px;
          background-color: rgba(255, 109, 0, 0.1);
          border-radius: 10px;
        }
        
        /* Search Panel */
        .search-input-container {
          display: flex;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .search-input {
          flex: 1;
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius) 0 0 var(--border-radius);
          padding: 8px 12px;
          color: var(--text-primary);
        }
        
        .search-button {
          background-color: var(--accent-primary);
          color: white;
          border-radius: 0 var(--border-radius) var(--border-radius) 0;
          padding: 0 12px;
        }
        
        .search-results {
          padding: 8px;
        }
        
        .search-summary {
          padding: 8px 12px;
          font-size: 12px;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 8px;
        }
        
        .search-result-item {
          padding: 8px 12px;
          border-radius: var(--border-radius);
          margin-bottom: 4px;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        
        .search-result-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .result-filename {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        
        .result-path {
          font-size: 11px;
          color: var(--text-secondary);
        }
        
        /* Settings Panel */
        .settings-list {
          padding: 8px;
        }
        
        .setting-group {
          margin-bottom: 16px;
        }
        
        .setting-group-title {
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 8px;
        }
        
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 4px;
        }
        
        .setting-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .setting-control {
          background-color: var(--background-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: var(--text-primary);
          padding: 4px 8px;
        }
        
        .text-input {
          width: 200px;
          font-size: 12px;
          font-family: monospace;
        }
        
        /* Sidebar Footer */
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ai-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, var(--space-purple), var(--space-pink));
          border-radius: var(--border-radius);
          color: white;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .ai-button:hover {
          box-shadow: 0 0 15px rgba(123, 31, 162, 0.5);
        }
        
        .ai-icon {
          margin-right: 8px;
        }
        
        .debug-controls {
          margin-bottom: 8px;
        }
        
        .debug-button {
          width: 100%;
          padding: 8px;
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border-radius: var(--border-radius);
          font-size: 12px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }
        
        .debug-button:hover {
          background-color: var(--background-secondary);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
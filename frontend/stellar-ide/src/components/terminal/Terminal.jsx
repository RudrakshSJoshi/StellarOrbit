import { useState, useRef, useEffect } from 'react';

const Terminal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('console');
  const [logs, setLogs] = useState([
    { type: 'info', content: '🚀 Stellar IDE Terminal Ready', timestamp: new Date() },
    { type: 'info', content: 'Type "help" for available commands', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  
  // Available tabs
  const tabs = [
    { id: 'console', label: 'Console' },
    { id: 'output', label: 'Output' },
    { id: 'problems', label: 'Problems' },
    { id: 'debug', label: 'Debug' }
  ];
  
  // Autoscroll logs to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Focus input when terminal is shown
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user input to logs
    setLogs(prev => [
      ...prev, 
      { 
        type: 'command', 
        content: input, 
        timestamp: new Date() 
      }
    ]);
    
    // Process command
    processCommand(input);
    
    // Clear input
    setInput('');
  };
  
  const processCommand = (command) => {
    const cmd = command.trim().toLowerCase();
    
    switch (cmd) {
      case 'help':
        setLogs(prev => [
          ...prev,
          {
            type: 'result',
            content: `
Available commands:
  help         - Display this help message
  clear        - Clear the console
  version      - Show IDE version
  compile      - Compile the current contract (placeholder)
  deploy       - Deploy contract to network (placeholder)
  test         - Run tests (placeholder)
  exit         - Close the terminal
            `,
            timestamp: new Date()
          }
        ]);
        break;
        
      case 'clear':
        setLogs([]);
        break;
        
      case 'version':
        setLogs(prev => [
          ...prev,
          {
            type: 'result',
            content: 'Stellar IDE v0.1.0',
            timestamp: new Date()
          }
        ]);
        break;
        
      case 'compile':
        setLogs(prev => [
          ...prev,
          {
            type: 'info',
            content: '🔄 Compiling contract...',
            timestamp: new Date()
          }
        ]);
        
        // Simulate compilation
        setTimeout(() => {
          setLogs(prev => [
            ...prev,
            {
              type: 'success',
              content: '✅ Contract compiled successfully',
              timestamp: new Date()
            }
          ]);
        }, 1500);
        break;
        
      case 'deploy':
        setLogs(prev => [
          ...prev,
          {
            type: 'info',
            content: '🚀 Deploying contract to testnet...',
            timestamp: new Date()
          }
        ]);
        
        // Simulate deployment
        setTimeout(() => {
          setLogs(prev => [
            ...prev,
            {
              type: 'success',
              content: '✅ Contract deployed successfully\nContract ID: GDKXJLKJLKJ5JHGHGHGH898989',
              timestamp: new Date()
            }
          ]);
        }, 2000);
        break;
        
      case 'test':
        setLogs(prev => [
          ...prev,
          {
            type: 'info',
            content: '🧪 Running tests...',
            timestamp: new Date()
          }
        ]);
        
        // Simulate tests
        setTimeout(() => {
          setLogs(prev => [
            ...prev,
            {
              type: 'result',
              content: `
Running 3 tests
test token::test::test_mint ... ok
test token::test::test_transfer ... ok
test token::test::test_burn ... ok

Test result: ok. 3 passed; 0 failed;
              `,
              timestamp: new Date()
            }
          ]);
        }, 1800);
        break;
        
      case 'exit':
        onClose();
        break;
        
      default:
        setLogs(prev => [
          ...prev,
          {
            type: 'error',
            content: `Unknown command: ${command}. Type "help" for available commands.`,
            timestamp: new Date()
          }
        ]);
        break;
    }
  };
  
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`terminal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="terminal-actions">
          <button 
            className="terminal-action-button"
            onClick={() => setLogs([])}
            title="Clear Terminal"
          >
            🗑️
          </button>
          <button 
            className="terminal-action-button"
            onClick={onClose}
            title="Close Terminal"
          >
            ✖
          </button>
        </div>
      </div>
      
      <div className="terminal-content" ref={scrollRef}>
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
            <span className="log-content">
              {log.type === 'command' && <span className="prompt">$ </span>}
              {log.content}
            </span>
          </div>
        ))}
      </div>
      
      <form className="terminal-input-container" onSubmit={handleSubmit}>
        <span className="prompt">$</span>
        <input 
          type="text"
          ref={inputRef}
          className="terminal-input"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a command..."
        />
      </form>
      
      <style jsx>{`
        .terminal {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
        }
        
        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          height: 36px;
          background-color: var(--background-tertiary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .terminal-tabs {
          display: flex;
        }
        
        .terminal-tab {
          padding: 6px 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 12px;
          margin-right: 4px;
          border-radius: 4px 4px 0 0;
        }
        
        .terminal-tab:hover {
          color: var(--text-primary);
        }
        
        .terminal-tab.active {
          color: var(--text-primary);
          background-color: var(--background-secondary);
          position: relative;
        }
        
        .terminal-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--accent-primary);
        }
        
        .terminal-actions {
          display: flex;
        }
        
        .terminal-action-button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          margin-left: 4px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          padding: 0;
        }
        
        .terminal-action-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .terminal-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          background-color: var(--background-secondary);
        }
        
        .log-entry {
          display: flex;
          margin-bottom: 4px;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        
        .log-timestamp {
          color: var(--space-gray);
          min-width: 80px;
          margin-right: 8px;
        }
        
        .log-content {
          flex: 1;
        }
        
        .log-info {
          color: var(--text-secondary);
        }
        
        .log-error {
          color: var(--error);
        }
        
        .log-success {
          color: var(--success);
        }
        
        .log-command {
          color: var(--space-light-blue);
        }
        
        .log-result {
          color: var(--text-primary);
        }
        
        .prompt {
          color: var(--space-purple);
          margin-right: 8px;
          font-weight: bold;
        }
        
        .terminal-input-container {
          display: flex;
          align-items: center;
          padding: 8px;
          background-color: var(--background-tertiary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: inherit;
          padding: 4px 8px;
        }
        
        .terminal-input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
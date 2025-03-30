// src/components/editor/CompileButton.jsx
import { useState } from 'react';
import { compileProject } from '../../services/ApiService';

const CompileButton = ({ projectName, editorContent }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAgentHelp, setShowAgentHelp] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  const [isLoadingAgentResponse, setIsLoadingAgentResponse] = useState(false);
  
  // Function to handle compilation
  const handleCompile = async () => {
    if (!projectName) {
      setError('No project selected');
      return;
    }
    
    setIsCompiling(true);
    setError(null);
    setResult(null);
    setShowAgentHelp(false);
    setAgentResponse(null);
    
    try {
      const response = await compileProject(projectName);
      
      if (response.success) {
        setResult({
          buildOutput: response.buildOutput || 'Compilation successful!',
          optimizeOutput: response.optimizeOutput || ''
        });
      } else {
        const errorMsg = response.error || 'Compilation failed';
        setError(errorMsg);
        
        // Auto show agent help when compilation fails
        setShowAgentHelp(true);
        
        // Call agent for help with the error
        await fetchAgentHelp(editorContent, errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || 'Compilation failed';
      setError(errorMsg);
      
      // Auto show agent help when compilation fails
      setShowAgentHelp(true);
      
      // Call agent for help with the error
      await fetchAgentHelp(editorContent, errorMsg);
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Function to fetch help from the AI agent
  const fetchAgentHelp = async (code, errorMessage) => {
    if (!code) return;
    
    setIsLoadingAgentResponse(true);
    
    try {
      const response = await fetch('http://localhost:8000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_type: "debugging",
          user_code: `###### ${code} ######`,
          context: errorMessage
        })
      });
      
      if (!response.ok) {
        throw new Error(`Agent error: ${response.status}`);
      }
      
      // Try to parse response as JSON
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { agent_response: text };
      }
      
      setAgentResponse(data);
    } catch (err) {
      console.error('Error fetching agent help:', err);
      setAgentResponse({ 
        agent_response: `Failed to get agent response: ${err.message}` 
      });
    } finally {
      setIsLoadingAgentResponse(false);
    }
  };
  
  // Extract agent response text
  const getAgentResponseText = () => {
    if (!agentResponse) return '';
    
    if (agentResponse.agent_response) {
      return agentResponse.agent_response;
    }
    
    if (agentResponse.response) {
      return agentResponse.response;
    }
    
    if (typeof agentResponse === 'string') {
      return agentResponse;
    }
    
    return JSON.stringify(agentResponse, null, 2);
  };
  
  // Format the response text
  const formatAgentResponse = (text) => {
    if (!text) return '';
    
    // Replace escaped newlines
    let formatted = text.replace(/\\n/g, '\n');
    
    // Clean up other escape sequences
    formatted = formatted.replace(/\\"/g, '"');
    formatted = formatted.replace(/\\\\/g, '\\');
    
    return formatted;
  };
  
  return (
    <div className="compile-button-container">
      <button 
        className={`compile-button ${isCompiling ? 'loading' : ''}`}
        onClick={handleCompile}
        disabled={isCompiling || !projectName}
      >
        {isCompiling ? 'Compiling...' : 'Compile'}
      </button>
      
      {(result || error) && (
        <div className="compile-result-container">
          <div className="compile-result-header">
            <div className={`result-title ${error ? 'error' : 'success'}`}>
              {error ? 'Compilation Error' : 'Compilation Successful'}
            </div>
            <button 
              className="close-button"
              onClick={() => {
                setResult(null);
                setError(null);
                setAgentResponse(null);
                setShowAgentHelp(false);
              }}
            >
              ✕
            </button>
          </div>
          
          <div className="compile-result-content">
            {error ? (
              <div className="error-message">
                <pre>{error}</pre>
              </div>
            ) : (
              <>
                <div className="output-section">
                  <div className="output-label">Build Output:</div>
                  <pre className="output-content">{result.buildOutput}</pre>
                </div>
                
                {result.optimizeOutput && (
                  <div className="output-section">
                    <div className="output-label">Optimization Output:</div>
                    <pre className="output-content">{result.optimizeOutput}</pre>
                  </div>
                )}
              </>
            )}
            
            {/* Agent help section */}
            {showAgentHelp && (
              <div className="agent-help-section">
                <div className="agent-help-header">
                  <h3>🤖 AI Assistant</h3>
                  {!agentResponse && !isLoadingAgentResponse && (
                    <button 
                      className="refresh-button"
                      onClick={() => fetchAgentHelp(editorContent, error)}
                    >
                      🔄
                    </button>
                  )}
                </div>
                
                {isLoadingAgentResponse ? (
                  <div className="agent-loading">
                    <div className="loading-spinner"></div>
                    <div>Getting help from AI assistant...</div>
                  </div>
                ) : agentResponse ? (
                  <div className="agent-response">
                    <pre className="agent-response-content">
                      {formatAgentResponse(getAgentResponseText())}
                    </pre>
                  </div>
                ) : (
                  <div className="agent-help-error">
                    Failed to get AI assistance. Click refresh to try again.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .compile-button-container {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 50;
        }
        
        .compile-button {
          background-color: var(--accent-primary);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }
        
        .compile-button:hover:not(:disabled) {
          background-color: var(--space-bright-blue);
          box-shadow: 0 2px 8px rgba(30, 136, 229, 0.5);
        }
        
        .compile-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .compile-button.loading {
          position: relative;
          overflow: hidden;
        }
        
        .compile-button.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: loading-animation 1.5s infinite;
        }
        
        @keyframes loading-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        .compile-result-container {
          position: absolute;
          top: 50px;
          right: 10px;
          width: 500px;
          max-width: 80vw;
          max-height: 80vh;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          z-index: 60;
        }
        
        .compile-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--background-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .result-title {
          font-weight: 500;
          font-size: 14px;
        }
        
        .result-title.success {
          color: var(--success);
        }
        
        .result-title.error {
          color: var(--error);
        }
        
        .close-button {
          background-color: transparent;
          border: none;
          color: var(--text-secondary);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .compile-result-content {
          padding: 16px;
          max-height: calc(80vh - 60px);
          overflow-y: auto;
        }
        
        .error-message {
          color: var(--error);
          background-color: rgba(255, 82, 82, 0.1);
          border-radius: var(--border-radius);
          padding: 12px;
          font-size: 13px;
        }
        
        .error-message pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: monospace;
        }
        
        .output-section {
          margin-bottom: 16px;
        }
        
        .output-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .output-content {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: var(--border-radius);
          font-family: monospace;
          font-size: 13px;
          white-space: pre-wrap;
          overflow-x: auto;
          color: var(--text-primary);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .agent-help-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .agent-help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .agent-help-header h3 {
          font-size: 16px;
          margin: 0;
          color: var(--space-light-blue);
        }
        
        .refresh-button {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .refresh-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .agent-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 12px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .agent-response {
          background-color: var(--background-primary);
          border-radius: var(--border-radius);
          padding: 12px;
          border-left: 3px solid var(--space-bright-blue);
        }
        
        .agent-response-content {
          margin: 0;
          white-space: pre-wrap;
          font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary);
        }
        
        .agent-help-error {
          color: var(--error);
          text-align: center;
          padding: 16px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default CompileButton;
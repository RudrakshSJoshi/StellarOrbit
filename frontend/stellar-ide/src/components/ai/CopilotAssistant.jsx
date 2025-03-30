// src/components/ai/CopilotAssistant.jsx
// This component adds GitHub Copilot-like functionality to the editor
// It allows users to select code and ask questions about it
import { useState, useEffect, useRef } from 'react';

// Simple function to parse markdown-like formatting in the response
const parseResponseMarkdown = (text) => {
  let formattedText = text || '';
  
  // Escape HTML entities to prevent XSS
  formattedText = formattedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Format code blocks with ```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
    return `<pre class="code-block"><code>${codeContent.trim()}</code></pre>`;
  });
  
  // Format inline code with backticks
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Format bullet points
  formattedText = formattedText.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/(<li>.*<\/li>\n*)+/g, '<ul>$&</ul>');
  
  // Format numbered lists
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  formattedText = formattedText.replace(/(<li>.*<\/li>\n*)+/g, '<ol>$&</ol>');
  
  // Format paragraphs (lines separated by double newlines)
  formattedText = formattedText.replace(/^(?!<[uo]l>|<li>|<pre|<code)(.*?)$/gm, (match, p1) => {
    if (p1.trim().length > 0) {
      return `<p>${p1}</p>`;
    }
    return match;
  });
  
  // Format bold text
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Format italic text
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  return formattedText;
};

const CopilotAssistant = ({ editor, monaco }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const popupRef = useRef(null);
  const promptInputRef = useRef(null);
  
  // Add a debounce helper to prevent rapid selection changes
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  // Set up selection change listener
  useEffect(() => {
    if (!editor || !monaco) return;
    
    const handleSelectionChange = debounce(() => {
      const selection = editor.getSelection();
      
      if (!selection || selection.isEmpty()) {
        // No selection, hide the popup only if not already in prompting or response state
        if (!isPrompting && !response) {
          setIsVisible(false);
        }
        return;
      }
      
      // Get the selected text
      const model = editor.getModel();
      if (!model) return;
      
      const selectedText = model.getValueInRange(selection);
      
      if (selectedText.trim().length === 0) {
        if (!isPrompting && !response) {
          setIsVisible(false);
        }
        return;
      }
      
      // Only update if the selection has actually changed
      if (selectedText !== selectedCode) {
        // Get position for the popup
        const lastLineNumber = selection.endLineNumber;
        const lastColumn = selection.endColumn;
        
        // Convert position to pixel coordinates
        const position = editor.getScrolledVisiblePosition({ lineNumber: lastLineNumber, column: lastColumn });
        if (!position) return;
        
        // Set state
        setSelectedCode(selectedText);
        setPosition({
          x: position.left + 10,
          y: position.top + 20
        });
        
        // Only show the popup if not already in prompting or response state
        if (!isPrompting && !response) {
          setIsVisible(true);
        }
      }
    }, 300); // Debounce for 300ms
    
    // Listen for selection changes
    const selectionChangeDisposable = editor.onDidChangeCursorSelection(handleSelectionChange);
    
    // Clean up
    return () => {
      selectionChangeDisposable.dispose();
    };
  }, [editor, monaco, selectedCode, isPrompting, response]);
  
  // Focus prompt input when prompting is enabled
  useEffect(() => {
    if (isPrompting && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [isPrompting]);
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Reset everything when clicking outside
        setIsVisible(false);
        setIsPrompting(false);
        setResponse(null);
        setShowFullResponse(false);
        setDebugInfo(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle asking the copilot
  const handleAskCopilot = async () => {
    if (!prompt.trim() || !selectedCode.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    // Prepare the request payload
    const payload = {
      request_type: "copilot",
      user_code: `###### ${selectedCode} ######`,
      context: prompt
    };
    
    // Log the payload for debugging
    console.log("Sending to agent:", payload);
    
    try {
      const response = await fetch('http://localhost:8000/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const rawText = await response.text();
      let data;
      
      try {
        // Try to parse as JSON
        data = JSON.parse(rawText);
        console.log("Received from agent:", data);
      } catch (e) {
        // If not valid JSON, use the raw text
        console.log("Received non-JSON response:", rawText);
        data = { agent_response: rawText };
      }
      
      // Set debug info for troubleshooting
      setDebugInfo({
        requestPayload: payload,
        rawResponse: rawText
      });
      
      setResponse(data);
      setIsPrompting(false);
      setShowFullResponse(true);
    } catch (err) {
      console.error('Error fetching from AI agent:', err);
      setError(err.message || 'Failed to get response from AI agent');
      setDebugInfo({
        error: err.message,
        requestPayload: payload
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keydown in prompt input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskCopilot();
    } else if (e.key === 'Escape') {
      setIsPrompting(false);
    }
  };
  
  // Extract the actual response text from the API response
  const getResponseText = () => {
    if (!response) return '';
    
    // Check if response is a string
    if (typeof response === 'string') {
      return response;
    }
    
    // Check for specific fields based on API response structure
    if (response.agent_response) {
      return response.agent_response;
    }
    
    if (response.response) {
      return response.response;
    }
    
    if (response.content) {
      return response.content;
    }
    
    if (response.answer) {
      return response.answer;
    }
    
    if (response.message) {
      return response.message;
    }
    
    // If we can't find a specific field, try to stringify the response
    try {
      return JSON.stringify(response, null, 2);
    } catch (e) {
      return "Error parsing response";
    }
  };
  
  // Format the response text with markdown parsing
  const formatResponseText = () => {
    let responseText = getResponseText();
    
    // Check if the response contains escaped newlines and replace them
    if (typeof responseText === 'string') {
      responseText = responseText.replace(/\\n/g, '\n');
      
      // Clean up other escape sequences
      responseText = responseText.replace(/\\"/g, '"');
      responseText = responseText.replace(/\\\\/g, '\\');
    } else {
      // If somehow responseText is not a string, convert it
      responseText = String(responseText);
    }
    
    // Parse markdown formatting
    return parseResponseMarkdown(responseText);
  };
  
  // Reset everything
  const handleReset = () => {
    setIsVisible(false);
    setIsPrompting(false);
    setResponse(null);
    setShowFullResponse(false);
    setDebugInfo(null);
    setError(null);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`copilot-popup ${showFullResponse ? 'full-response' : ''}`}
      style={{ 
        left: showFullResponse ? '50%' : `${position.x}px`, 
        top: showFullResponse ? '50%' : `${position.y}px`,
        transform: showFullResponse ? 'translate(-50%, -50%)' : 'none'
      }}
      ref={popupRef}
    >
      {!isPrompting && !response ? (
        <button 
          className="ask-copilot-button"
          onClick={() => setIsPrompting(true)}
        >
          <span className="copilot-icon">🤖</span>
          <span>Ask Copilot</span>
        </button>
      ) : isPrompting ? (
        <div className="prompt-container">
          <div className="selected-code-info">
            <div className="selection-label">Selected code ({selectedCode.length} characters):</div>
            <div className="selection-preview">{selectedCode.length > 100 ? selectedCode.substring(0, 100) + '...' : selectedCode}</div>
          </div>
          <input
            type="text"
            ref={promptInputRef}
            className="prompt-input"
            placeholder="Ask about this code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="prompt-actions">
            <button 
              className="cancel-button"
              onClick={() => setIsPrompting(false)}
            >
              Cancel
            </button>
            <button 
              className="ask-button"
              onClick={handleAskCopilot}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </div>
      ) : (
        <div className="response-container">
          {error ? (
            <div className="error-message">
              <div className="error-title">Error</div>
              <div className="error-content">{error}</div>
              {debugInfo && (
                <div className="debug-info">
                  <div className="debug-title">Debug Information:</div>
                  <pre className="debug-content">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
              <div className="error-actions">
                <button 
                  className="try-again-button"
                  onClick={() => setIsPrompting(true)}
                >
                  Try Again
                </button>
                <button 
                  className="close-button"
                  onClick={handleReset}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="response-header">
                <div className="response-title">
                  <span className="copilot-icon">🤖</span>
                  Copilot Response
                </div>
                <div className="response-actions">
                  <button 
                    className="edit-button"
                    onClick={() => setIsPrompting(true)}
                    title="Edit your question"
                  >
                    ✏️
                  </button>
                  <button 
                    className="close-button"
                    onClick={handleReset}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="response-content">
                {isLoading ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    <div>Thinking...</div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="response-text"
                      dangerouslySetInnerHTML={{ __html: formatResponseText() }}
                    />
                    
                    {debugInfo && (
                      <div className="debug-info">
                        <button 
                          className="toggle-debug"
                          onClick={() => setDebugInfo(prev => prev ? null : { show: true })}
                        >
                          {debugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
                        </button>
                        {debugInfo && (
                          <pre className="debug-content">{JSON.stringify(debugInfo, null, 2)}</pre>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      <style jsx>{`
        .copilot-popup {
          position: absolute;
          z-index: 100;
          min-width: 250px;
          max-width: 400px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .copilot-popup.full-response {
          min-width: 500px;
          max-width: 800px;
          width: 60%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        
        .ask-copilot-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          background: linear-gradient(90deg, var(--space-blue), var(--space-purple));
          color: white;
          border: none;
          border-radius: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        
        .copilot-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .prompt-container {
          padding: 12px;
        }
        
        .selected-code-info {
          margin-bottom: 12px;
          padding: 8px;
          background-color: var(--background-primary);
          border-radius: 4px;
          font-size: 12px;
        }
        
        .selection-label {
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .selection-preview {
          color: var(--text-primary);
          font-family: monospace;
          white-space: pre-wrap;
          overflow: hidden;
          max-height: 80px;
        }
        
        .prompt-input {
          width: 100%;
          padding: 10px;
          background-color: var(--background-primary);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        .prompt-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        
        .prompt-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        .cancel-button {
          padding: 6px 12px;
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 12px;
        }
        
        .cancel-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        
        .ask-button {
          padding: 6px 12px;
          background-color: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .ask-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .response-container {
          display: flex;
          flex-direction: column;
          max-height: 100%;
          flex: 1;
        }
        
        .response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(90deg, var(--space-blue), var(--space-purple));
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        
        .response-title {
          display: flex;
          align-items: center;
          font-size: 16px;
        }
        
        .response-actions {
          display: flex;
          gap: 8px;
        }
        
        .edit-button, .close-button {
          background-color: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
        }
        
        .edit-button:hover, .close-button:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .response-content {
          padding: 16px;
          overflow-y: auto;
          max-height: calc(80vh - 60px);
          min-height: 100px;
          flex: 1;
        }
        
        .response-text {
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
          font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0 4px;
        }
        
        .response-text p {
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        
        .response-text code {
          background-color: var(--background-primary);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
        }
        
        .response-text .code-block {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          overflow-x: auto;
          border-left: 3px solid var(--accent-primary);
        }
        
        .response-text .code-block code {
          background-color: transparent;
          padding: 0;
          display: block;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          white-space: pre;
        }
        
        .response-text ul, .response-text ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        
        .response-text li {
          margin-bottom: 8px;
        }
        
        .response-text strong {
          font-weight: bold;
        }
        
        .response-text em {
          font-style: italic;
        }
        
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: var(--text-secondary);
        }
        
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          color: var(--error);
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .error-title {
          font-weight: bold;
          font-size: 16px;
        }
        
        .error-content {
          margin-bottom: 12px;
        }
        
        .error-actions {
          display: flex;
          gap: 12px;
        }
        
        .try-again-button {
          background-color: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
        }
        
        .error-message .close-button {
          background-color: var(--error);
          color: white;
          width: auto;
          height: auto;
          padding: 6px 12px;
        }
        
        .debug-info {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px dashed rgba(255, 255, 255, 0.2);
        }
        
        .debug-title {
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .debug-content {
          background-color: var(--background-primary);
          padding: 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          white-space: pre-wrap;
          overflow-x: auto;
          color: var(--text-secondary);
        }
        
        .toggle-debug {
          background-color: var(--background-primary);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default CopilotAssistant;
import { useState, useRef } from 'react';
import EditorTabs from '../editor/EditorTabs';
import CodeEditor from '../editor/CodeEditor';
import Terminal from '../terminal/Terminal';

const WorkspaceLayout = () => {
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const resizeRef = useRef(null);
  const workspaceRef = useRef(null);
  
  const startResize = (e) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startHeight = terminalHeight;
    
    const onMouseMove = (moveEvent) => {
      const workspaceHeight = workspaceRef.current.clientHeight;
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + delta, 40), // Min height 40px
        workspaceHeight - 100 // Max height: workspace height - 100px for editor
      );
      
      setTerminalHeight(newHeight);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const toggleTerminal = () => {
    setIsTerminalVisible(!isTerminalVisible);
  };
  
  return (
    <div className="workspace" ref={workspaceRef}>
      <div className="editor-container">
        <EditorTabs />
        <CodeEditor />
      </div>
      
      {isTerminalVisible && (
        <>
          <div 
            className="resize-handle"
            ref={resizeRef}
            onMouseDown={startResize}
          />
          
          <div 
            className="terminal-container"
            style={{ height: `${terminalHeight}px` }}
          >
            <Terminal onClose={toggleTerminal} />
          </div>
        </>
      )}
      
      {!isTerminalVisible && (
        <div className="terminal-toggle">
          <button onClick={toggleTerminal}>
            Show Terminal
          </button>
        </div>
      )}
      
      <style jsx>{`
        .workspace {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--background-primary);
          position: relative;
        }
        
        .editor-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .resize-handle {
          height: 6px;
          background-color: var(--background-tertiary);
          cursor: ns-resize;
          position: relative;
        }
        
        .resize-handle:hover {
          background-color: var(--accent-primary);
        }
        
        .resize-handle::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 2px;
          background-color: var(--space-gray);
          border-radius: 1px;
        }
        
        .terminal-container {
          min-height: 40px;
          background-color: var(--background-secondary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .terminal-toggle {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 10;
        }
        
        .terminal-toggle button {
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          border-radius: var(--border-radius);
          padding: 8px 16px;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .terminal-toggle button:hover {
          background-color: var(--accent-primary);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default WorkspaceLayout;
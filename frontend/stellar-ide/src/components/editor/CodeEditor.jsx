import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import useMonaco from '../../hooks/useMonaco';

const CodeEditor = () => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const { monaco, isMonacoLoading } = useMonaco();
  const { 
    activeFile, 
    openFiles, 
    updateFileContent,
    editorSettings,
    saveCurrentFile,
    undoEdit,
    redoEdit
  } = useEditor();
  const [suggestions, setSuggestions] = useState([]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Save: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
      
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoEdit();
      }
      
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redoEdit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentFile, undoEdit, redoEdit]);
  
  // Initialize Monaco editor
  useEffect(() => {
    if (isMonacoLoading || !monaco || !editorRef.current) return;
    
    // Create Monaco editor instance if it doesn't exist
    if (!editorInstanceRef.current) {
      // Create Monaco editor instance
      const editor = monaco.editor.create(editorRef.current, {
        theme: 'stellarTheme',
        fontSize: editorSettings.fontSize,
        tabSize: editorSettings.tabSize,
        wordWrap: editorSettings.wordWrap,
        automaticLayout: true,
        minimap: {
          enabled: editorSettings.minimap,
          scale: 0.8
        },
        lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
        scrollBeyondLastLine: false,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        mouseWheelZoom: true,
        padding: {
          top: 16,
          bottom: 16
        },
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        renderWhitespace: 'boundary',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        scrollbar: {
          useShadows: true,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12
        }
      });
      
      editorInstanceRef.current = editor;
      
      // Define a custom theme
      monaco.editor.defineTheme('stellarTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'macro', foreground: 'BD63C5', fontStyle: 'bold' },
          { token: 'attribute', foreground: 'DCDCAA' },
        ],
        colors: {
          'editor.background': '#0a0e17',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#858585',
          'editorCursor.foreground': '#4fc3f7',
          'editor.lineHighlightBackground': '#1A2133',
          'editorLineNumber.activeForeground': '#4fc3f7',
          'editor.selectionBackground': '#264f78',
          'editor.selectionHighlightBackground': '#1A2133',
          'editor.findMatchBackground': '#515C6A',
          'editor.findMatchHighlightBackground': '#314365',
          'editorSuggestWidget.background': '#1A2133',
          'editorSuggestWidget.border': '#121726',
          'editorSuggestWidget.selectedBackground': '#284166',
          'editorSuggestWidget.highlightForeground': '#4fc3f7',
          'editorWidget.background': '#1A2133',
          'editorWidget.border': '#121726',
          'editorGutter.background': '#0a0e17',
          'editorWarning.foreground': '#ffd740',
          'editorError.foreground': '#ff5252',
          'scrollbarSlider.background': 'rgba(121, 121, 121, 0.4)',
          'scrollbarSlider.hoverBackground': 'rgba(100, 100, 100, 0.7)',
          'scrollbarSlider.activeBackground': 'rgba(191, 191, 191, 0.4)'
        }
      });
      
      // Apply the theme
      monaco.editor.setTheme('stellarTheme');
      
      // Register Rust language
      monaco.languages.register({ id: 'rust' });
      
      // Basic syntax highlighting for Rust
      monaco.languages.setMonarchTokensProvider('rust', {
        keywords: [
          'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern',
          'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod',
          'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct',
          'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while', 'async',
          'await', 'dyn', 'abstract', 'become', 'box', 'do', 'final', 'macro',
          'override', 'priv', 'typeof', 'unsized', 'virtual', 'yield',
          // Soroban-specific keywords
          'soroban_sdk', 'contractimpl', 'contracttype'
        ],
        
        typeKeywords: [
          'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
          'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
          'f32', 'f64', 'bool', 'char', 'str', 'String', 'Vec', 'Option', 'Result',
          // Soroban-specific types
          'Address', 'Bytes', 'BytesN', 'Symbol', 'Map', 'Env', 'Contract'
        ],
        
        operators: [
          '=', '>', '<', '!', '~', '?', ':',
          '==', '<=', '>=', '!=', '&&', '||', '<<', '>>',
          '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '..', '...',
          '=>'
        ],
        
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        
        tokenizer: {
          root: [
            // Identifiers and keywords
            [/[a-z_$][\w$]*/, {
              cases: {
                '@typeKeywords': 'keyword.type',
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            
            // Whitespace
            { include: '@whitespace' },
            
            // Delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
            
            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
            
            // Characters
            [/'[^\\']'/, 'string'],
            [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
            [/'/, 'string.invalid'],
            
            // Attributes and macros
            [/#!?\[.*\]/, 'attribute'],
            [/[#][\w]+!?/, 'macro']
          ],
          
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            ["\\*/", 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
          
          string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],
          
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
          ],
        },
        
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      });
      
      // Register Soroban-specific completions
      monaco.languages.registerCompletionItemProvider('rust', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };
          
          // Soroban SDK completions
          const sorobanCompletions = [
            {
              label: 'soroban_sdk',
              kind: monaco.languages.CompletionItemKind.Module,
              documentation: 'The Soroban SDK for building smart contracts',
              insertText: 'soroban_sdk',
              range: range
            },
            {
              label: '#[contractimpl]',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Implements a contract with the provided methods',
              insertText: '#[contractimpl]\nimpl ${1:ContractName} {\n    $0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range
            },
            {
              label: '#[contracttype]',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Marks a type as a contract type for Soroban',
              insertText: '#[contracttype]\nstruct ${1:TypeName} {\n    $0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range
            },
            {
              label: 'use soroban_sdk',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Import Soroban SDK features',
              insertText: 'use soroban_sdk::{${1:contractimpl, Env}};\n$0',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range
            },
            {
              label: 'pub fn',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Define a public contract function',
              insertText: 'pub fn ${1:function_name}(${2:env: Env, ${3:args}}) -> ${4:ReturnType} {\n    $0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range
            }
          ];
          
          return {
            suggestions: sorobanCompletions
          };
        }
      });
      
      // Track changes and update content
      editor.onDidChangeModelContent(() => {
        if (activeFile) {
          updateFileContent(activeFile, editor.getValue());
        }
      });
      
      // Handle cursor position changes to update suggestions
      editor.onDidChangeCursorPosition((e) => {
        if (!activeFile) return;
        
        const model = editor.getModel();
        if (!model) return;
        
        const position = e.position;
        const word = model.getWordUntilPosition(position);
        
        // Simple context-aware suggestions
        // In a real implementation, this would be more sophisticated
        const currentLine = model.getLineContent(position.lineNumber);
        const lineUntilPosition = currentLine.substring(0, position.column - 1);
        
        // Example: suggest Soroban-specific things when typing in a Rust file
        if (activeFile.endsWith('.rs')) {
          if (lineUntilPosition.includes('use soroban_sdk')) {
            setSuggestions([
              'contractimpl', 'Env', 'Symbol', 'Vec', 'Address', 'BytesN', 'Map'
            ]);
          } else if (lineUntilPosition.includes('#[')) {
            setSuggestions([
              'contractimpl', 'contracttype', 'test'
            ]);
          } else {
            setSuggestions([]);
          }
        }
      });
    }
    
    return () => {
      // Don't dispose the editor on unmount to preserve state
      // It will be re-used as we switch between files
    };
  }, [monaco, isMonacoLoading, editorSettings, activeFile, updateFileContent]);
  
  // Update the editor model when the active file changes
  useEffect(() => {
    if (isMonacoLoading || !monaco || !editorInstanceRef.current) return;
    
    const currentFile = openFiles.find(file => file.path === activeFile);
    
    if (currentFile) {
      // Get language from file extension
      const fileExtension = currentFile.path.split('.').pop();
      let language = 'text';
      
      switch (fileExtension) {
        case 'rs':
          language = 'rust';
          break;
        case 'js':
          language = 'javascript';
          break;
        case 'md':
          language = 'markdown';
          break;
        case 'toml':
          language = 'toml'; // Monaco supports TOML out of the box
          break;
        case 'json':
          language = 'json';
          break;
        default:
          language = 'text';
      }
      
      // Create or get existing model
      let model = monaco.editor.getModels().find(
        model => model.uri.toString() === monaco.Uri.file(currentFile.path).toString()
      );
      
      if (!model) {
        model = monaco.editor.createModel(
          currentFile.content,
          language,
          monaco.Uri.file(currentFile.path)
        );
      }
      
      // Set the model to the editor
      const editor = editorInstanceRef.current;
      if (editor) {
        editor.setModel(model);
        
        // Focus the editor
        setTimeout(() => {
          editor.focus();
        }, 100);
      }
    } else if (editorInstanceRef.current) {
      // If no active file, clear the editor model
      editorInstanceRef.current.setModel(null);
    }
  }, [activeFile, openFiles, monaco, isMonacoLoading]);
  
  // Update editor settings when they change
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    
    const editor = editorInstanceRef.current;
    
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap,
      minimap: {
        enabled: editorSettings.minimap
      },
      lineNumbers: editorSettings.lineNumbers ? 'on' : 'off'
    });
  }, [editorSettings]);
  
  return (
    <div className="code-editor-container">
      {isMonacoLoading ? (
        <div className="loading-editor">
          <div className="loading-spinner"></div>
          <div>Loading editor...</div>
        </div>
      ) : !activeFile ? (
        <div className="welcome-container">
          <div className="welcome-content">
            <div className="welcome-logo">
              <div className="welcome-planet"></div>
              <div className="welcome-orbit">
                <div className="welcome-satellite"></div>
              </div>
            </div>
            <h2 className="welcome-title">Welcome to Stellar IDE</h2>
            <p className="welcome-message">
              Get started by creating a new file or selecting an existing one from the file explorer.
            </p>
            <div className="quick-actions">
              <button className="action-button">
                <span className="action-icon">📄</span>
                <span>New Rust Contract</span>
              </button>
              <button className="action-button">
                <span className="action-icon">📂</span>
                <span>Open Project</span>
              </button>
              <button className="action-button">
                <span className="action-icon">🚀</span>
                <span>Deploy Example</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="editor-wrapper">
          <div ref={editorRef} className="monaco-editor"></div>
          
          {suggestions.length > 0 && (
            <div className="code-suggestions">
              <div className="suggestions-header">
                <span>Suggestions</span>
                <button className="close-suggestions" onClick={() => setSuggestions([])}>✕</button>
              </div>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .code-editor-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .editor-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .monaco-editor {
          width: 100%;
          height: 100%;
        }
        
        .loading-editor {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background-color: var(--background-primary);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .welcome-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background-primary);
        }
        
        .welcome-content {
          max-width: 500px;
          text-align: center;
          padding: 32px;
        }
        
        .welcome-logo {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
        }
        
        .welcome-planet {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--space-bright-blue), var(--space-blue));
          box-shadow: 0 0 20px rgba(30, 136, 229, 0.6);
        }
        
        .welcome-orbit {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: orbit-rotate 8s linear infinite;
        }
        
        .welcome-satellite {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--space-orange), var(--space-pink));
          box-shadow: 0 0 10px rgba(233, 30, 99, 0.6);
        }
        
        .welcome-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          background: linear-gradient(90deg, var(--space-light-blue), var(--space-purple));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .welcome-message {
          color: var(--text-secondary);
          margin-bottom: 32px;
          line-height: 1.6;
        }
        
        .quick-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border-radius: var(--border-radius);
          background-color: var(--background-tertiary);
          color: var(--text-secondary);
          transition: all 0.2s ease;
          width: 140px;
        }
        
        .action-button:hover {
          background-color: var(--background-secondary);
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
        }
        
        .action-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .code-suggestions {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 200px;
          background-color: var(--background-tertiary);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: var(--background-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          font-weight: 600;
        }
        
        .close-suggestions {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          padding: 2px;
        }
        
        .close-suggestions:hover {
          color: var(--text-primary);
        }
        
        .suggestions-list {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          padding: 6px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        
        .suggestion-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
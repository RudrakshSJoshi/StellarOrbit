stellar-ide/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/
│           ├── logo.svg
│           └── space-bg.jpg
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles
│   ├── components/
│   │   ├── common/                 # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── Tabs.jsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── WorkspaceLayout.jsx
│   │   ├── editor/                 # Editor related components
│   │   │   ├── CodeEditor.jsx      # Monaco editor wrapper
│   │   │   ├── EditorTabs.jsx      # File tabs for editor
│   │   │   ├── EditorToolbar.jsx   # Toolbar for editor actions
│   │   │   └── FileTree.jsx        # File explorer sidebar
│   │   ├── terminal/               # Terminal components
│   │   │   ├── Terminal.jsx        # Terminal/console output
│   │   │   └── TerminalToolbar.jsx # Terminal controls
│   │   ├── blockchain/             # Blockchain integration components
│   │   │   ├── AccountManager.jsx  # Account management panel
│   │   │   ├── TransactionBuilder.jsx # Transaction builder
│   │   │   ├── ContractDeployer.jsx # Contract deployment panel
│   │   │   ├── ContractInteraction.jsx # Contract interaction
│   │   │   └── BlockchainExplorer.jsx # Block explorer
│   │   └── ai/                    # AI assistant components
│   │       ├── AIAssistant.jsx    # Chat interface with AI
│   │       └── AIPrompts.jsx      # Predefined prompts
│   ├── contexts/                  # React contexts
│   │   ├── EditorContext.jsx      # Editor state management
│   │   ├── FileSystemContext.jsx  # File system operations
│   │   ├── BlockchainContext.jsx  # Blockchain connection
│   │   └── ThemeContext.jsx       # Theme management
│   ├── hooks/                     # Custom React hooks
│   │   ├── useMonaco.js           # Monaco editor hook
│   │   ├── useCompiler.js         # Compile contract hook
│   │   ├── useStellar.js          # Stellar SDK hook
│   │   └── useLocalStorage.js     # Local storage hook
│   ├── services/                  # Service modules
│   │   ├── compiler.js            # Compile service
│   │   ├── fileSystem.js          # File system service
│   │   ├── localStorage.js        # Local storage service
│   │   ├── stellarSDK.js          # Stellar SDK wrapper
│   │   └── aiService.js           # AI assistant service
│   ├── utils/                     # Utility functions
│   │   ├── formatters.js          # Data formatters
│   │   ├── validators.js          # Input validators
│   │   └── constants.js           # App constants
│   ├── assets/                    # Static assets
│   │   ├── styles/                # CSS modules
│   │   │   ├── themes/            # Theme styles
│   │   │   │   ├── dark.css       # Dark space theme
│   │   │   │   └── light.css      # Light space theme
│   │   │   └── animations.css     # CSS animations
│   │   └── icons/                 # Custom SVG icons
│   └── config/                    # Configuration files
│       ├── editorConfig.js        # Monaco editor config
│       └── networkConfig.js       # Stellar network config
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
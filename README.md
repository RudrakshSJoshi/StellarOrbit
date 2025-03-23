# Stellar Orbit  
![Stellar Orbit Logo](data/logo.png) 

### **An AI-Powered IDE for Stellar Blockchain Development**  

---

## 🚀 **Tech Stack**  
Built with the best of modern technologies:  
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)  
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)  
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)  

---

## ✨ **Core Features**  
- **Compile & Deploy Contracts**: Easily compile and deploy Stellar smart contracts.  
- **Address Creation**: Generate Stellar addresses in just a few clicks.  
- **User-Friendly IDE**: Intuitive interface for seamless development.  
- **No More CMD Hustle**: Say goodbye to complex command-line operations.  

---

## 🤖 **AI-Powered Features**  
- **Copilot Integration**: AI-assisted coding for faster and smarter development.  
- **AI Debugger**: Automatically detect and fix errors in your code.  
- **AI Code Generator**: Generate boilerplate code with AI assistance.  
- **AI Assistant**: Get real-time suggestions and solutions for your code.  
- **Backed by Soroban SDK & Rust Expertise**: Built with deep knowledge of Stellar's ecosystem.  

---

## 🔮 **Future Scope**  
- **Auto Interaction System**: Automate interactions with Stellar contracts.  
- **Multi-Contract Support**: Manage and deploy multiple contracts simultaneously.  
- **No-Code Contract Creation**: Create contracts using flowcharts and visual tools.  
- **Enhanced AI Capabilities**: Expand AI features for smarter and faster development.  

---

## 📂 **Resources**  
- [Project Presentation (PPT)](https://www.canva.com/design/DAGihZLdvsM/97qcPNlW1dLeM0E-iAzKfA/edit?utm_content=DAGihZLdvsM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)  
- [GitBook Documentation](https://bigbull-ai.gitbook.io/stellar-orbit)  

---

## 👥 **Contributors**  
A big thanks to the amazing contributors who made this project possible:  
- [RudrakshSJoshi](https://github.com/RudrakshSJoshi)  
- [Prateush Sharma](https://github.com/prateushsharma)  
- [Mihir](https://github.com/Mihir7b311)  

---

## 🌌 **To AI x Crypto!**  
<img src="data\logo2.png" alt="Stellar Orbit Minimalistic Logo" width="300" />  

---

**Stellar Orbit** - Empowering developers to build the future of blockchain, effortlessly.

---

## Architecture

```mermaid
flowchart TD
    subgraph "User Interface"
        UI_EDITOR[Code Editor] --> UI_TABS[Project Tabs Manager]
        UI_EDITOR --> UI_SYNTAX[Rust/Soroban Syntax Highlighting]
        UI_EDITOR --> UI_AUTOCOMPLETE[Code Autocompletion]
        UI_TERMINAL[Terminal/Console Output]
        UI_DEPLOY[Deployment Interface]
        UI_ACCOUNTS[Account Manager]
        UI_EXPLORER[Blockchain Explorer]
        UI_BUILDER[Transaction Builder]
        UI_DEBUG[Debugger/Logs]
    end
    
    subgraph "Core Services"
        CS_COMPILER[Soroban Contract Compiler]
        CS_PROJECT[Project Manager]
        CS_INTERACT[Contract Interaction Service]
        CS_TX[Transaction Constructor]
        CS_FS[File System]
        CS_CONFIG[Configuration Manager]
    end
    
    subgraph "Blockchain Integration"
        BI_SDK[Stellar SDK Integration]
        BI_SOROBAN[Soroban SDK]
        BI_HORIZON[Horizon API Client]
        BI_RPC[Soroban RPC Client]
        BI_XDR[XDR Encoder/Decoder]
        BI_SIGNER[Transaction Signer]
    end
    
    subgraph "Backend Services"
        BS_COMPILE[Rust/Soroban Compiler Service]
        BS_TESTNET[Local Testnet]
        BS_STORAGE[Project Storage]
        BS_AUTH[Authentication Service]
    end
    
    subgraph "External Services"
        ES_FRIENDBOT[Testnet Friendbot]
        ES_PUBLIC_HORIZON[Public Horizon Servers]
        ES_PUBLIC_RPC[Public Soroban-RPC]
        ES_STELLAREXPERT[StellarExpert API]
    end
    
    %% Connections omitted for brevity
```

## Project Structure

```mermaid
graph TD
    A[stellar-ide/] --> B[public/]
    B --> B1[favicon.ico]
    B --> B2[assets/]
    B2 --> B3[images/]
    B3 --> B4[logo.svg]
    B3 --> B5[space-bg.jpg]

    A --> C[src/]
    C --> C1["main.jsx (Entry point)"]
    C --> C2["App.jsx (Main App)"]
    C --> C3["index.css (Global styles)"]
    C --> D[components/]
    D --> D1["common/ (UI Components)"]
    D1 --> D11[Button.jsx]
    D1 --> D12[Dropdown.jsx]
    D1 --> D13[Modal.jsx]
    D1 --> D14[Tooltip.jsx]
    D1 --> D15[Tabs.jsx]
    D --> D2["layout/ (Layout Components)"]
    D2 --> D21[Header.jsx]
    D2 --> D22[Sidebar.jsx]
    D2 --> D23[Footer.jsx]
    D2 --> D24[WorkspaceLayout.jsx]
    D --> D3["editor/ (Editor Components)"]
    D3 --> D31[CodeEditor.jsx]
    D3 --> D32[EditorTabs.jsx]
    D3 --> D33[EditorToolbar.jsx]
    D3 --> D34[FileTree.jsx]
    D --> D4["terminal/ (Terminal)"]
    D4 --> D41[Terminal.jsx]
    D4 --> D42[TerminalToolbar.jsx]
    D --> D5["blockchain/ (Blockchain)"]
    D5 --> D51[AccountManager.jsx]
    D5 --> D52[TransactionBuilder.jsx]
    D5 --> D53[ContractDeployer.jsx]
    D5 --> D54[ContractInteraction.jsx]
    D5 --> D55[BlockchainExplorer.jsx]
    D --> D6["ai/ (AI Assistant)"]
    D6 --> D61[AIAssistant.jsx]
    D6 --> D62[AIPrompts.jsx]
    C --> E["contexts/ (React Contexts)"]
    E --> E1[EditorContext.jsx]
    E --> E2[FileSystemContext.jsx]
    E --> E3[BlockchainContext.jsx]
    E --> E4[ThemeContext.jsx]
```

## Getting Started

### Clone this repository
```sh
git clone https://github.com/RudrakshSJoshi/AlephAI.git
cd stellar-ide
```

### Install dependencies
```sh
npm install
```

### Start the development server
```sh
npm run dev
```

## Features
- **Code Editor**: Write and manage smart contract code with syntax highlighting.
- **Blockchain Interaction**: Deploy and interact with contracts on the Stellar blockchain.
- **AI Assistant**: Get AI-powered suggestions for contract development.
- **Terminal & Debugging Tools**: Built-in tools for seamless debugging and testing.
- **Project Management**: Organize and manage multiple projects easily.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Installation

### 1. Install Rust
#### macOS/Linux:
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
```

### 2. Install Stellar CLI
#### macOS:
```sh
brew install stellar-cli
```

### 3. Install Node.js Dependencies
```sh
npm install express
```

### 4. Run the Server
```sh
node server.js
```

## Agentic Backend in Python

This is the Python-based agentic application backend designed to run as a web server using FastAPI and Uvicorn.

### Prerequisites
- Python 3.7 or higher
- `pip` package manager

### Setup Instructions

#### 1. Create a Virtual Environment
```bash
python -m venv venv
```

#### 2. Activate the Virtual Environment
**On Windows:**
```bash
venv\Scripts\activate
```
**On macOS/Linux:**
```bash
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Start the Server
```bash
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

#### 5. Access the Application
```
http://localhost:8000
```


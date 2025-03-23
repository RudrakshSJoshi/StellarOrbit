
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


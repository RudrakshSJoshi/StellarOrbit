const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, '..'); // Root directory
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects'); // Set projects dir correctly
const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');
const CONTRACTS_FILE = path.join(__dirname,'contracts.json');

// Ensure projects directory exists
if (!fsSync.existsSync(PROJECTS_DIR)) {
  fsSync.mkdirSync(PROJECTS_DIR);
  console.log('Created projects directory at:', PROJECTS_DIR);
}
if (!fsSync.existsSync(ACCOUNTS_FILE)) {
    fsSync.writeFileSync(ACCOUNTS_FILE, JSON.stringify({
      accounts: []
    }));
  }
  if (!fsSync.existsSync(CONTRACTS_FILE)) {
    fsSync.writeFileSync(CONTRACTS_FILE, JSON.stringify({
      contracts: []
    }));
  }



  const getAccountsFromFile = async () => {
    try {
      const data = await fs.readFile(ACCOUNTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading accounts file:', error);
      return { accounts: [] };
    }
  };
  const saveAccountsToFile = async (accountsData) => {
    try {
      await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accountsData, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing accounts file:', error);
      return false;
    }
  };
  // Get contracts from file
const getContractsFromFile = async () => {
  try {
    const data = await fs.readFile(CONTRACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading contracts file:', error);
    return { contracts: [] };
  }
};
// Save contracts to file
const saveContractsToFile = async (contractsData) => {
  try {
    await fs.writeFile(CONTRACTS_FILE, JSON.stringify(contractsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing contracts file:', error);
    return false;
  }
};
  
app.get('/api/accounts', async (req, res) => {
    try {
      const accountsData = await getAccountsFromFile();
      res.json({ success: true, accounts: accountsData.accounts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// GET all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const contractsData = await getContractsFromFile();
    res.json({ success: true, contracts: contractsData.contracts });
    //console.log(res.json)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET contract by ID
app.get('/api/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contractsData = await getContractsFromFile();
    
    const contract = contractsData.contracts.find(c => c.contractId === id);
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }
    
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new contract
app.post('/api/contracts', async (req, res) => {
  try {
    const { name, contractId, project, ownerKey, network, abi } = req.body;
    
    if (!name || !contractId || !project || !ownerKey || !network) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const contractsData = await getContractsFromFile();
    
    // Check if contract already exists
    const existingContract = contractsData.contracts.find(c => c.contractId === contractId);
    if (existingContract) {
      return res.status(400).json({ success: false, error: 'Contract already exists' });
    }
    
    // Add new contract
    const newContract = {
      name,
      contractId,
      project,
      ownerKey,
      network,
      createdAt: new Date().toISOString(),
      abi: abi || null
    };
    
    contractsData.contracts.push(newContract);
    await saveContractsToFile(contractsData);
    
    res.json({ success: true, contract: newContract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE contract
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contractsData = await getContractsFromFile();
    
    const contractIndex = contractsData.contracts.findIndex(c => c.contractId === id);
    if (contractIndex === -1) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }
    
    // Remove contract
    contractsData.contracts.splice(contractIndex, 1);
    await saveContractsToFile(contractsData);
    
    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});




app.post('/api/accounts', async (req, res) => {
    try {
      const { name, network = 'testnet', fund = true } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: 'Account name is required' });
      }
      
      // Check if account already exists
      const accountsData = await getAccountsFromFile();
      const existingAccount = accountsData.accounts.find(a => a.name === name);
      if (existingAccount) {
        return res.status(400).json({ success: false, error: 'Account with this name already exists' });
      }
      
      // Generate a new Stellar account
      const networkFlag = network ? `--network ${network}` : '';
      const fundFlag = fund ? '--fund' : '';
      
      console.log(`Creating account with command: stellar keys generate --global ${name} ${networkFlag} ${fundFlag}`);
      
      try {
        // Generate the account
        const { stdout: genOutput, stderr: genError } = await execAsync(
          `stellar keys generate --global ${name} ${networkFlag} ${fundFlag}`
        );
        
        if (genError && genError.includes('error')) {
          throw new Error(genError);
        }
        
        // Get the address
        const { stdout: addressOutput, stderr: addressError } = await execAsync(
          `stellar keys address ${name}`
        );
        
        if (addressError && addressError.includes('error')) {
          throw new Error(addressError);
        }
        
        const publicKey = addressOutput.trim();
        
        // Save to accounts file
        const newAccount = {
          name,
          publicKey,
          network,
          createdAt: new Date().toISOString(),
          isFunded: fund
        };
        
        accountsData.accounts.push(newAccount);
        await saveAccountsToFile(accountsData);
        
        res.json({ 
          success: true, 
          account: newAccount,
          message: 'Account created successfully',
          output: genOutput
        });
      } catch (cmdError) {
        // If stellar CLI fails, create a mock account for testing
        console.error('Error running stellar CLI command:', cmdError);
        
        // Generate a fake Stellar account (for development only)
        const publicKey = 'G' + Array(56).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('');
        
        const newAccount = {
          name,
          publicKey,
          network,
          createdAt: new Date().toISOString(),
          isFunded: fund,
          isMock: true
        };
        
        accountsData.accounts.push(newAccount);
        await saveAccountsToFile(accountsData);
        
        res.json({ 
          success: true, 
          account: newAccount,
          message: 'Mock account created (stellar CLI failed)',
          error: cmdError.message
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
// Initialize a new contract project
app.post('/api/projects', async (req, res) => {
  try {
    console.log("Create Project called with body:", req.body);
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    
    const projectDir = path.join(PROJECTS_DIR, name);
    console.log("Project directory will be:", projectDir);

    if (fsSync.existsSync(projectDir)) {
      return res.status(400).json({ success: false, error: 'Project already exists' });
    }

    // Create the directory first
    await fs.mkdir(projectDir, { recursive: true });
    console.log("Created directory:", projectDir);

    // For debugging, log the directory contents
    console.log("Root dir contents:", await fs.readdir(ROOT_DIR));
    console.log("Projects dir contents:", await fs.readdir(PROJECTS_DIR));

    try {
      const { stdout, stderr } = await execAsync(`stellar contract init ${name}`, {
        cwd: PROJECTS_DIR // Run command from the projects directory
      });
      
      console.log("Command output:", stdout);
      if (stderr) console.error("Command error:", stderr);
      
      // Now check and fix Cargo.toml to ensure package name matches project name
      const cargoPath = path.join(projectDir, 'Cargo.toml');
      if (fsSync.existsSync(cargoPath)) {
        let cargoContent = await fs.readFile(cargoPath, 'utf8');
        // Replace the package name with the project name
        cargoContent = cargoContent.replace(/name\s*=\s*"[^"]+"/, `name = "${name}"`);
        // Write the updated content back
        await fs.writeFile(cargoPath, cargoContent);
        console.log(`Updated package name in Cargo.toml to "${name}"`);
      }
      
      res.json({ success: true, message: 'Project created successfully', output: stdout });
      console.log("Project created successfully: ", name);
    } catch (cmdError) {
      // If the command fails, still keep the directory but log the error
      console.error("Command error:", cmdError);
      // Create basic structure manually as fallback
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src', 'lib.rs'), '// Default Soroban contract\n\nuse soroban_sdk::{contractimpl, log, symbol_short, vec, Env, Symbol, Vec};\n\npub struct Contract;\n\n#[contractimpl]\nimpl Contract {\n    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {\n        vec![&env, symbol_short!("Hello"), to]\n    }\n}');
      await fs.writeFile(path.join(projectDir, 'Cargo.toml'), '[package]\nname = "' + name + '"\nversion = "0.1.0"\nedition = "2021"\n\n[lib]\ncrate-type = ["cdylib"]\n\n[dependencies]\nsoroban-sdk = "20.0.0"');
      
      res.json({ 
        success: true, 
        message: 'Project created with basic structure (stellar command failed)', 
        error: cmdError.message 
      });
    }
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// GET account details
app.get('/api/accounts/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const accountsData = await getAccountsFromFile();
      
      const account = accountsData.accounts.find(a => a.name === name);
      if (!account) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }
      
      // Get account balance if possible
      try {
        const { stdout, stderr } = await execAsync(`stellar balance ${name}`);
        
        if (!stderr) {
          const balanceMatch = stdout.match(/XLM\s+([0-9.]+)/);
          if (balanceMatch && balanceMatch[1]) {
            account.balance = balanceMatch[1];
          }
        }
      } catch (error) {
        console.warn(`Could not fetch balance for account ${name}:`, error.message);
        // Don't fail if balance check fails
      }
      
      res.json({ success: true, account });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
 // DELETE account
app.delete('/api/accounts/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const accountsData = await getAccountsFromFile();
      
      const accountIndex = accountsData.accounts.findIndex(a => a.name === name);
      if (accountIndex === -1) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }
      
      // Remove from accounts file
      accountsData.accounts.splice(accountIndex, 1);
      await saveAccountsToFile(accountsData);
      
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }); 

// Compile the contract - Modified with better WASM file detection
app.post('/api/projects/:name/compile', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    console.log(`Starting compilation for project: ${name}`);
    console.log(`Project directory: ${projectDir}`);

    if (!fsSync.existsSync(projectDir)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if the project has the expected Cargo.toml file
    const cargoPath = path.join(projectDir, 'Cargo.toml');
    if (!fsSync.existsSync(cargoPath)) {
      console.error(`Cargo.toml not found in project directory: ${cargoPath}`);
      return res.status(400).json({ success: false, error: 'Invalid Rust project. Cargo.toml not found.' });
    }

    console.log('Running stellar contract build...');
    try {
      const buildResult = await execAsync('stellar contract build', { 
        cwd: projectDir,
        // Increase maxBuffer to handle larger output
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      console.log('Build completed successfully');
      console.log('Build output:', buildResult.stdout);
      if (buildResult.stderr) console.log('Build stderr:', buildResult.stderr);
      
      // Check if the target directory exists
      const targetDir = path.join(projectDir, 'target');
      if (!fsSync.existsSync(targetDir)) {
        console.error(`Target directory not created: ${targetDir}`);
        return res.status(500).json({ 
          success: false, 
          error: 'Build failed to create target directory',
          buildOutput: buildResult.stdout
        });
      }
      
      // Find any WASM file in the release directory
      const wasmDir = path.join(projectDir, 'target', 'wasm32-unknown-unknown', 'release');
      console.log(`Looking for WASM files in: ${wasmDir}`);
      
      if (!fsSync.existsSync(wasmDir)) {
        console.error(`WASM directory not found: ${wasmDir}`);
        return res.status(500).json({ 
          success: false, 
          error: 'Build successful but WASM directory not found',
          buildOutput: buildResult.stdout
        });
      }
      
      // Get all WASM files in the directory
      const wasmFiles = fsSync.readdirSync(wasmDir).filter(file => file.endsWith('.wasm'));
      console.log('Found WASM files:', wasmFiles);
      
      if (wasmFiles.length === 0) {
        console.error(`No WASM files found in: ${wasmDir}`);
        return res.status(500).json({ 
          success: false, 
          error: 'Build successful but no WASM files found',
          buildOutput: buildResult.stdout
        });
      }
      
      // Use the first WASM file found
      const wasmFileName = wasmFiles[0];
      const wasmPath = path.join(wasmDir, wasmFileName);
      console.log(`Using WASM file: ${wasmPath}`);
      
      console.log('Running stellar contract optimize...');
      const optimizeResult = await execAsync(`stellar contract optimize --wasm ${wasmPath}`, { 
        cwd: projectDir,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      console.log('Optimization completed successfully');
      console.log('Optimize output:', optimizeResult.stdout);
      if (optimizeResult.stderr) console.log('Optimize stderr:', optimizeResult.stderr);

      return res.json({ 
        success: true, 
        buildOutput: buildResult.stdout, 
        optimizeOutput: optimizeResult.stdout,
        wasmFile: wasmFileName // Return the WASM filename for reference
      });
    } catch (cmdError) {
      console.error('Command execution error:', cmdError);
      // Return a more detailed error response
      return res.status(500).json({ 
        success: false, 
        error: `Command execution failed: ${cmdError.message}`,
        stderr: cmdError.stderr || '',
        command: cmdError.cmd || 'unknown command'
      });
    }
  } catch (error) {
    console.error('General error in compile endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy the contract - Updated with better WASM file detection
app.post('/api/projects/:name/deploy', async (req, res) => {
  try {
    const { name } = req.params;
    const { source, network } = req.body;

    const projectDir = path.join(PROJECTS_DIR, name);
    const wasmDir = path.join(projectDir, 'target', 'wasm32-unknown-unknown', 'release');

    // Check if the directory exists
    if (!fsSync.existsSync(wasmDir)) {
      return res.status(400).json({ 
        success: false, 
        error: 'WASM directory not found. Compile the contract first.' 
      });
    }

    // Get all WASM files in the directory
    const wasmFiles = fsSync.readdirSync(wasmDir).filter(file => file.endsWith('.wasm'));
    
    if (wasmFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No WASM files found. Compile the contract first.' 
      });
    }

    // Use the first WASM file found
    const wasmFileName = wasmFiles[0];
    const wasmPath = path.join(wasmDir, wasmFileName);
    console.log(`Using WASM file for deployment: ${wasmPath}`);

    const deployResult = await execAsync(
      `stellar contract deploy --wasm ${wasmPath} --source ${source} --network ${network} --alias ${name}`,
      { cwd: projectDir }
    );

    const output = deployResult.stdout;
    const contractIdMatch = output.match(/Contract ID: ([A-Z0-9]+)/);
    const contractId = contractIdMatch ? contractIdMatch[1] : null;

    res.json({ 
      success: true, 
      output: output, 
      contractId: contractId,
      wasmFile: wasmFileName
    });
    const contractsData = await getContractsFromFile();
    const newContract = {
      name,
      contractId,
      project: name,
      ownerKey: source,
      network,
      createdAt: new Date().toISOString()
    }

        // Check if it already exists
        const existingIndex = contractsData.contracts.findIndex(c => c.contractId === contractId);
        if (existingIndex >= 0) {
          contractsData.contracts[existingIndex] = newContract;
        } else {
          contractsData.contracts.push(newContract);
        }
        
        await saveContractsToFile(contractsData);
      
        return { 
          success: true, 
          output: output, 
          contractId: contractId,
          wasmFile: wasmFileName
        };
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET project structure as a tree
app.get('/api/projects/:name/structure', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (!fsSync.existsSync(projectDir)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Build directory tree recursively
    async function buildDirTree(dir, basePath = '') {
      const result = {};
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and target directories to avoid large responses
          if (entry.name === 'node_modules' || entry.name === 'target') {
            result[entry.name] = { type: 'folder', children: {}, skip: true };
          } else {
            result[entry.name] = { 
              type: 'folder', 
              children: await buildDirTree(path.join(dir, entry.name), relativePath)
            };
          }
        } else {
          result[entry.name] = { 
            type: 'file',
            path: relativePath,
            size: (await fs.stat(path.join(dir, entry.name))).size,
            extension: path.extname(entry.name).slice(1)
          };
        }
      }

      return result;
    }

    const structure = await buildDirTree(projectDir);
    res.json({ success: true, structure });
  } catch (error) {
    console.error("Error getting project structure:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get file structure for React UI (different format)
app.get('/api/projects/:name/files', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (!fsSync.existsSync(projectDir)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Convert directory to the format expected by the UI
    const buildUITree = async (dirPath, basePath = '') => {
      const result = [];
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and target directories
          if (entry.name === 'node_modules' || entry.name === 'target') {
            continue;
          }

          const children = await buildUITree(entryPath, relativePath);
          result.push({
            name: entry.name,
            type: 'folder',
            children
          });
        } else {
          result.push({
            name: entry.name,
            type: 'file',
            path: relativePath
          });
        }
      }

      return result;
    };

    const structure = await buildUITree(projectDir);
    res.json({ success: true, structure });
  } catch (error) {
    console.error("Error getting project files:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET file content
app.get('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name } = req.params;
    let { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullPath = path.join(projectDir, filePath);

    // Ensure the path is within the project directory (security check)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    if (!fsSync.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      return res.status(400).json({ success: false, error: 'Path is a directory, not a file' });
    }

    // For safety, don't read very large files
    if (stat.size > 1024 * 1024 * 5) { // 5MB limit
      return res.status(413).json({ success: false, error: 'File too large to read' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    res.json({ success: true, content });
  } catch (error) {
    console.error("Error getting file content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST save file content
app.post('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name } = req.params;
    let { filePath } = req.params;
    const { content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullPath = path.join(projectDir, filePath);

    // Ensure the path is within the project directory (security check)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    // Ensure the parent directory exists
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, { recursive: true });

    await fs.writeFile(fullPath, content);
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new file (checks if file already exists)
app.post('/api/projects/:name/files/create', async (req, res) => {
  try {
    const { name } = req.params;
    const { path: filePath, content = '' } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullPath = path.join(projectDir, filePath);

    // Ensure the path is within the project directory (security check)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    // Check if file already exists
    if (fsSync.existsSync(fullPath)) {
      return res.status(409).json({ success: false, error: 'File already exists' });
    }

    // Ensure the parent directory exists
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, { recursive: true });

    await fs.writeFile(fullPath, content);
    res.json({ success: true, message: 'File created successfully' });
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new folder
app.post('/api/projects/:name/directories/:folderPath(*)', async (req, res) => {
  try {
    const { name, folderPath } = req.params;
    
    if (!folderPath) {
      return res.status(400).json({ success: false, error: 'Folder path is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullPath = path.join(projectDir, folderPath);

    // Ensure the path is within the project directory (security check)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    // Create the directory recursively
    await fs.mkdir(fullPath, { recursive: true });
    res.json({ success: true, message: 'Folder created successfully' });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE file or folder
app.delete('/api/projects/:name/files/:itemPath(*)', async (req, res) => {
  try {
    const { name, itemPath } = req.params;
    
    if (!itemPath) {
      return res.status(400).json({ success: false, error: 'Item path is required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullPath = path.join(projectDir, itemPath);

    // Ensure the path is within the project directory (security check)
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    if (!fsSync.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      await fs.rm(fullPath, { recursive: true, force: true });
      res.json({ success: true, message: 'Folder deleted successfully' });
    } else {
      await fs.unlink(fullPath);
      res.json({ success: true, message: 'File deleted successfully' });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT rename file or folder
app.put('/api/projects/:name/files/:oldPath(*)', async (req, res) => {
  try {
    const { name, oldPath } = req.params;
    const { newName } = req.body;
    
    if (!oldPath || !newName) {
      return res.status(400).json({ success: false, error: 'Both old path and new name are required' });
    }

    const projectDir = path.join(PROJECTS_DIR, name);
    const fullOldPath = path.join(projectDir, oldPath);
    
    // Get the parent directory of the old path
    const parentDir = path.dirname(fullOldPath);
    const fullNewPath = path.join(parentDir, newName);

    // Ensure both paths are within the project directory (security check)
    if (!fullOldPath.startsWith(projectDir) || !fullNewPath.startsWith(projectDir)) {
      return res.status(403).json({ success: false, error: 'Access denied: Path outside project directory' });
    }

    if (!fsSync.existsSync(fullOldPath)) {
      return res.status(404).json({ success: false, error: 'Source item not found' });
    }

    if (fsSync.existsSync(fullNewPath)) {
      return res.status(409).json({ success: false, error: 'Destination already exists' });
    }

    await fs.rename(fullOldPath, fullNewPath);
    res.json({ success: true, message: 'Item renamed successfully' });
  } catch (error) {
    console.error("Error renaming item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET list of projects
app.get('/api/projects', async (req, res) => {
  try {
    // Ensure the projects directory exists
    if (!fsSync.existsSync(PROJECTS_DIR)) {
      fsSync.mkdirSync(PROJECTS_DIR, { recursive: true });
      console.log("Created projects directory that was missing");
    }
    
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({ name: entry.name }));
    
    res.json({ success: true, projects });
  } catch (error) {
    console.error("Error listing projects:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Projects directory: ${PROJECTS_DIR}`);
});
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

// Ensure projects directory exists
if (!fsSync.existsSync(PROJECTS_DIR)) {
  fsSync.mkdirSync(PROJECTS_DIR);
  console.log('Created projects directory at:', PROJECTS_DIR);
}

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
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

// Compile the contract
app.post('/api/projects/:name/compile', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (!fsSync.existsSync(projectDir)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const buildResult = await execAsync('stellar contract build', { cwd: projectDir });
    const wasmPath = path.join(projectDir, 'target', 'wasm32-unknown-unknown', 'release', `${name}.wasm`);
    const optimizeResult = await execAsync(`stellar contract optimize --wasm ${wasmPath}`, { cwd: projectDir });

    res.json({ success: true, buildOutput: buildResult.stdout, optimizeOutput: optimizeResult.stdout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy the contract
app.post('/api/projects/:name/deploy', async (req, res) => {
  try {
    const { name } = req.params;
    const { source, network } = req.body;

    const projectDir = path.join(PROJECTS_DIR, name);
    const wasmPath = path.join(projectDir, 'target', 'wasm32-unknown-unknown', 'release', `${name}.wasm`);

    if (!fsSync.existsSync(wasmPath)) {
      return res.status(400).json({ success: false, error: 'Compiled WASM not found. Compile the contract first.' });
    }

    const deployResult = await execAsync(
      `stellar contract deploy --wasm ${wasmPath} --source ${source} --network ${network} --alias ${name}`,
      { cwd: projectDir }
    );

    const output = deployResult.stdout;
    const contractIdMatch = output.match(/Contract ID: ([A-Z0-9]+)/);
    const contractId = contractIdMatch ? contractIdMatch[1] : null;

    res.json({ success: true, output: output, contractId: contractId });
  } catch (error) {
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
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);
const cors = require('cors');
const fsPromises = fs.promises;

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, '..'); // Root directory
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects'); // Ensure projects are created in root/projects

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR);
}

// Get list of all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await fsPromises.readdir(PROJECTS_DIR);
    const projectsData = await Promise.all(
      projects.map(async (project) => {
        const projectPath = path.join(PROJECTS_DIR, project);
        const stats = await fsPromises.stat(projectPath);
        return {
          name: project,
          isDirectory: stats.isDirectory(),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
    );
    
    // Filter out only directories
    const projectDirs = projectsData.filter(p => p.isDirectory);
    
    res.json({ success: true, projects: projectDirs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize a new contract project
app.post('/api/projects', async (req, res) => {
  try {
    console.log("Create Project called");
    const { name } = req.body;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (fs.existsSync(projectDir)) {
      return res.status(400).json({ error: 'Project already exists' });
    }

    const { stdout, stderr } = await execAsync(`stellar contract init ${name}`, {
      cwd: ROOT_DIR // Run command from the root directory
    });

    res.json({ success: true, message: 'Project created successfully', output: stdout });
    console.log("Project created successfully: ", name);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project structure (file tree)
app.get('/api/projects/:name/files', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Function to recursively get directory structure
    const getDirectoryStructure = async (dir, rootPath = '') => {
      const items = await fsPromises.readdir(dir);
      
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(dir, item);
          const relativePath = rootPath ? `${rootPath}/${item}` : item;
          const stats = await fsPromises.stat(itemPath);
          
          if (stats.isDirectory()) {
            return {
              name: item,
              path: relativePath,
              type: 'folder',
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime,
              children: await getDirectoryStructure(itemPath, relativePath)
            };
          } else {
            return {
              name: item,
              path: relativePath,
              type: 'file',
              size: stats.size,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          }
        })
      );
      
      return itemsWithDetails;
    };

    const structure = await getDirectoryStructure(projectDir);
    res.json({ success: true, structure });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get file content
app.get('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name, filePath } = req.params;
    const fullPath = path.join(PROJECTS_DIR, name, filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (fs.statSync(fullPath).isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }

    const content = await fsPromises.readFile(fullPath, 'utf8');
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update a file
app.post('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name, filePath } = req.params;
    const { content } = req.body;
    const fullPath = path.join(PROJECTS_DIR, name, filePath);
    
    // Create directory if it doesn't exist
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      await fsPromises.mkdir(dirPath, { recursive: true });
    }

    await fsPromises.writeFile(fullPath, content);
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create directory
app.post('/api/projects/:name/directories/:dirPath(*)', async (req, res) => {
  try {
    const { name, dirPath } = req.params;
    const fullPath = path.join(PROJECTS_DIR, name, dirPath);
    
    await fsPromises.mkdir(fullPath, { recursive: true });
    res.json({ success: true, message: 'Directory created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete file or directory
app.delete('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name, filePath } = req.params;
    const fullPath = path.join(PROJECTS_DIR, name, filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stats = await fsPromises.stat(fullPath);
    
    if (stats.isDirectory()) {
      // Remove directory recursively
      await fsPromises.rm(fullPath, { recursive: true });
      res.json({ success: true, message: 'Directory deleted successfully' });
    } else {
      // Remove file
      await fsPromises.unlink(fullPath);
      res.json({ success: true, message: 'File deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rename file or directory
app.put('/api/projects/:name/files/:filePath(*)', async (req, res) => {
  try {
    const { name, filePath } = req.params;
    const { newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ error: 'New name is required' });
    }
    
    const fullPath = path.join(PROJECTS_DIR, name, filePath);
    const dirPath = path.dirname(fullPath);
    const newPath = path.join(dirPath, newName);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    if (fs.existsSync(newPath)) {
      return res.status(400).json({ error: 'File or directory with new name already exists' });
    }

    await fsPromises.rename(fullPath, newPath);
    res.json({ success: true, message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compile the contract
app.post('/api/projects/:name/compile', async (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(PROJECTS_DIR, name);

    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: 'Project not found' });
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

    if (!fs.existsSync(wasmPath)) {
      return res.status(400).json({ error: 'Compiled WASM not found. Compile the contract first.' });
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
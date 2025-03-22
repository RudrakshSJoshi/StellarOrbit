const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, '..'); // Root directory
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects'); // Ensure projects are created in root/projects

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR);
}

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
    console.log("Project created succesfully: ",name);
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

    const buildResult = await execAsync('stellar contract build', { cwd: ROOT_DIR });
    const wasmPath = path.join(projectDir, 'target', 'wasm32-unknown-unknown', 'release', `${name}.wasm`);
    const optimizeResult = await execAsync(`stellar contract optimize --wasm ${wasmPath}`, { cwd: ROOT_DIR });

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
      { cwd: ROOT_DIR }
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

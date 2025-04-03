const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Fitness Level System...');

// Get the absolute path to the server file
const serverPath = path.resolve(__dirname, 'server/index.js');

// Check if the server file exists
if (!fs.existsSync(serverPath)) {
  console.error(`Error: Server file not found at ${serverPath}`);
  process.exit(1);
}

console.log('Starting server from:', serverPath);

// Use simple node to run the server
const child = spawn('node', [serverPath], { stdio: 'inherit' });

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  child.kill('SIGINT');
  process.exit(0);
});
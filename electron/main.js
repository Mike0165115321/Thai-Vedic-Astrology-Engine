const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;
let apiPort;

// Get a random free port
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

// Wait for the backend to be ready
function waitForBackend(port, maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          clearInterval(interval);
          reject(new Error('Backend failed to start'));
        }
      });
    }, 500);
  });
}

async function startBackend() {
  apiPort = await getFreePort();
  console.log(`Starting backend on port ${apiPort}`);

  const backendExePath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'backend', 'backend.exe')
    : path.join(__dirname, '..', 'backend', 'dist', 'backend', 'backend.exe');

  console.log(`Backend path: ${backendExePath}`);
  
  backendProcess = spawn(backendExePath, [apiPort.toString()], {
    detached: false, // Ensure it's not detached so it dies when we die
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));

  await waitForBackend(apiPort);
}

const { protocol, net } = require('electron');

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'resources', 'frontend-out', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true // Important for custom protocols
    },
  });

  mainWindow.setMenu(null); // Hide default menu

  // Optional: Open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  const fileUrl = `app://-/index.html?port=${apiPort}`;
  console.log(`Loading frontend from: ${fileUrl}`);
  mainWindow.loadURL(fileUrl);
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Register custom protocol to handle Next.js absolute paths
    protocol.handle('app', (request) => {
      const urlStr = request.url.replace('app://-', '');
      const decodedPath = decodeURIComponent(urlStr.split('?')[0]).replace(/^\//, ''); // Remove leading slash
      
      let filePath = app.isPackaged
        ? path.join(process.resourcesPath, 'frontend-out', decodedPath)
        : path.join(__dirname, 'resources', 'frontend-out', decodedPath);
        
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        // Fallback to index.html for SPA routing
        filePath = app.isPackaged
          ? path.join(process.resourcesPath, 'frontend-out', 'index.html')
          : path.join(__dirname, 'resources', 'frontend-out', 'index.html');
      }
      
      return net.fetch('file://' + filePath);
    });

    try {
      await startBackend();
      createWindow();
    } catch (error) {
      console.error('Failed to start application:', error);
      app.quit();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('quit', () => {
    if (backendProcess) {
      console.log('Killing backend process...');
      backendProcess.kill();
    }
  });
}

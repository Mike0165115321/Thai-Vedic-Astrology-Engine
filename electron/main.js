const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const url = require('url');

let mainWindow;
let backendProcess;
let apiPort;

// ---------- Helpers ----------

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

// ---------- Frontend root directory ----------

function getFrontendDir() {
  if (app.isPackaged) {
    // electron-builder puts "files" inside resources/app.asar
    // and "extraResources" beside it → resources/frontend-out
    return path.join(process.resourcesPath, 'frontend-out');
  }
  return path.join(__dirname, 'resources', 'frontend-out');
}

// ---------- Backend ----------

async function startBackend() {
  apiPort = await getFreePort();
  console.log(`[main] Starting backend on port ${apiPort}`);

  const backendExePath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'backend', 'backend.exe')
    : path.join(__dirname, '..', 'backend', 'dist', 'backend', 'backend.exe');

  console.log(`[main] Backend path: ${backendExePath}`);

  backendProcess = spawn(backendExePath, [apiPort.toString()], {
    detached: false,
  });

  backendProcess.stdout.on('data', (d) => console.log(`[backend] ${d}`));
  backendProcess.stderr.on('data', (d) => console.error(`[backend-err] ${d}`));
  backendProcess.on('error', (err) => console.error('[main] spawn error:', err));

  await waitForBackend(apiPort);
  console.log('[main] Backend is ready!');
}

// ---------- Window ----------

function createWindow() {
  const frontendDir = getFrontendDir();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(frontendDir, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenu(null);

  // --- Open DevTools for debugging (remove for production) ---
  // mainWindow.webContents.openDevTools();

  // Load the static index.html directly via file:// protocol
  // and inject the port via a hash so the renderer can read it
  const indexPath = path.join(frontendDir, 'index.html');
  console.log(`[main] Loading: ${indexPath}`);

  mainWindow.loadFile(indexPath, {
    query: { port: apiPort.toString() },
  });
}

// ---------- App lifecycle ----------

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // ---- Custom protocol to intercept absolute "/_next/..." requests ----
    // Next.js static export uses paths like "/_next/static/css/xxx.css"
    // When loaded via file://, the browser resolves them to the drive root.
    // This protocol intercepts those requests and serves from our frontend dir.
    protocol.interceptFileProtocol('file', (request, callback) => {
      let requestPath = decodeURIComponent(new URL(request.url).pathname);

      // On Windows, pathname starts with /C:/... – normalise
      if (process.platform === 'win32' && requestPath.startsWith('/')) {
        requestPath = requestPath.substring(1);
      }

      const frontendDir = getFrontendDir();

      // If the path contains "/_next/" but points outside our frontend dir,
      // redirect it to our frontend dir.
      if (requestPath.includes('_next') && !requestPath.startsWith(frontendDir.replace(/\\/g, '/'))) {
        // Extract the _next/... portion
        const nextIdx = requestPath.indexOf('_next');
        const relativePath = requestPath.substring(nextIdx);
        const correctedPath = path.join(frontendDir, relativePath);
        console.log(`[protocol] Redirect: ${requestPath} → ${correctedPath}`);
        callback(correctedPath);
        return;
      }

      // Default: serve as-is
      callback(requestPath);
    });

    try {
      await startBackend();
      createWindow();
    } catch (error) {
      console.error('[main] Failed to start:', error);
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
      console.log('[main] Killing backend process...');
      backendProcess.kill();
    }
  });
}

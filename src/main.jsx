const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function sendToRenderer(channel, payload) {
  try {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send(channel, payload);
    }
  } catch (e) {
    // ignore
  }
}

function setupAutoUpdates() {
  // In dev, autoUpdater generally won’t work unless running a packaged app.
  // You can keep it enabled, but it will usually do nothing in `npm run start`.
  autoUpdater.autoDownload = true;

  // True “auto update”: install immediately when downloaded.
  // If you prefer “install on quit”, comment this handler.
  autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('update:downloaded', info);

    // Small delay so renderer can show a message if you want
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1500);
  });

  autoUpdater.on('checking-for-update', () => sendToRenderer('update:checking'));
  autoUpdater.on('update-available', (info) => sendToRenderer('update:available', info));
  autoUpdater.on('update-not-available', (info) => sendToRenderer('update:none', info));
  autoUpdater.on('download-progress', (progress) => sendToRenderer('update:progress', progress));
  autoUpdater.on('error', (err) => sendToRenderer('update:error', err?.message || String(err)));

  // Optional: renderer can manually trigger checks
  ipcMain.handle('update:check', async () => {
    return autoUpdater.checkForUpdates();
  });

  // Kick off initial check shortly after ready
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 2000);

  // Check periodically (30 min)
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 30 * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
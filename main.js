const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

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
  } catch {
    // ignore
  }
}

function setupAutoUpdates() {
  // Updates should be checked only for packaged/installed builds
  if (!app.isPackaged) {
    console.log('[updater] Skipping auto-updates (dev mode).');
    return;
  }

  // If you want your app to accept GitHub "Pre-release" builds, enable:
  // autoUpdater.allowPrerelease = true;

  autoUpdater.autoDownload = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking-for-update');
    sendToRenderer('update:checking');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] update-available', info?.version);
    sendToRenderer('update:available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[updater] update-not-available', info?.version);
    sendToRenderer('update:none', info);
  });

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update:progress', progress);
  });

  autoUpdater.on('error', (err) => {
    console.log('[updater] error', err);
    sendToRenderer('update:error', err?.message || String(err));
  });

  autoUpdater.on('update-downloaded', async (info) => {
    console.log('[updater] update-downloaded', info?.version);
    sendToRenderer('update:downloaded', info);

    const result = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: 'An update has been downloaded.',
      detail: 'Restart the app to install it.',
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  // Renderer can manually trigger checks
  ipcMain.handle('update:check', async () => {
    return autoUpdater.checkForUpdates();
  });

  // Initial check
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 2000);

  // Periodic checks (30 minutes)
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
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
  // You said no mac support, but keeping standard behavior is harmless
  if (process.platform !== 'darwin') app.quit();
});
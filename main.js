// main.js (Electron main process)
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// ---------------------------
// Window
// ---------------------------

function createWindow() {
  // Remove the default Electron application menu (File/Edit/View/etc.)
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,

    // Hide menu bar on Windows/Linux
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Extra safety: force-hide menu bar
  mainWindow.setMenuBarVisibility(false);

  // ALWAYS OPEN DEVTOOLS
  // mainWindow.webContents.openDevTools();

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

// ---------------------------
// Persistent Storage (Main-side)
// ---------------------------
const getUserDataFilePath = () => {
  // Persist in the OS userData directory (AppData/Roaming on Windows)
  return path.join(app.getPath('userData'), 'userData.json');
};

const readJsonSafe = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch (e) {
    return { __parseError: e?.message || String(e) };
  }
};

const writeJsonSafe = (filePath, obj) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
};

// IPC handlers used by preload.js -> window.storage.*
function registerStorageIpc() {
  ipcMain.handle('load-data', async () => {
    try {
      const filePath = getUserDataFilePath();
      const parsed = readJsonSafe(filePath);

      // If file doesn't exist or is empty, return nulls (renderer uses defaults)
      if (!parsed) return { data: null, settings: null };

      // If JSON parse failed, signal error (UI can "start fresh")
      if (parsed.__parseError) {
        return {
          data: null,
          settings: null,
          error: `Failed to parse userData.json: ${parsed.__parseError}`,
        };
      }

      return {
        data: parsed.data ?? null,
        settings: parsed.settings ?? null,
      };
    } catch (e) {
      return { data: null, settings: null, error: e?.message || String(e) };
    }
  });

  ipcMain.handle('save-data', async (_event, data, settings) => {
    try {
      const filePath = getUserDataFilePath();
      return writeJsonSafe(filePath, { data, settings });
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  });

  ipcMain.handle('system-wipe', async () => {
    try {
      const filePath = getUserDataFilePath();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  });
}

// ---------------------------
// Auto Updates
// ---------------------------
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

// ---------------------------
// App Lifecycle
// ---------------------------
app.whenReady().then(() => {
  registerStorageIpc();
  createWindow();
  setupAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
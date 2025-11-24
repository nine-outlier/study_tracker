const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Path where the user data JSON file will be saved.
const userDataPath = path.join(app.getPath('userData'), 'userData.json');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Study Tracker",
    autoHideMenuBar: true,

    // --- FIX: Enable Native Windows Title Bar ---
    frame: true,  // Changed from false to true. This brings back the Windows frame.
    
    // Removed: titleBarStyle: 'hidden',
    // Removed: titleBarOverlay: { ... },

    // 🔹 Custom app icon (make sure build/icon.ico exists)
    icon: path.join(__dirname, 'build', 'icon.ico'),

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.setTitle("Study Tracker");
  mainWindow.loadFile('index.html');
  // Optional: Open DevTools for debugging
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers for File Operations ---
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(userDataPath)) {
      const data = fs.readFileSync(userDataPath, 'utf8');
      return JSON.parse(data);
    }
    return { data: null, settings: null };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { data: null, settings: null, error: 'Failed to read user data file.' };
  }
});

ipcMain.handle('save-data', async (event, data, settings) => {
  try {
    const content = JSON.stringify({ data, settings }, null, 2);
    fs.writeFileSync(userDataPath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save data:', error);
    return { success: false, error: 'Failed to write user data file.' };
  }
});
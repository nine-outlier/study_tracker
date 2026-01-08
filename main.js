// main.js
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Optional but helpful for debugging updater issues:
const log = require("electron-log");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Update behavior:
autoUpdater.autoDownload = true;          // download as soon as an update is found
autoUpdater.autoInstallOnAppQuit = true;  // install on next quit by default

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Keep these aligned with how your app currently works.
      // If you rely on nodeIntegration today, don’t change it here.
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // remove if you don't have preload.js
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

function isPackaged() {
  return app.isPackaged === true;
}

function initAutoUpdates() {
  // If you want users to receive pre-releases (beta), uncomment:
  // autoUpdater.allowPrerelease = true;

  autoUpdater.on("error", (err) => {
    log.error("Updater error:", err);
  });

  autoUpdater.on("update-available", () => {
    log.info("Update available. Downloading...");
  });

  autoUpdater.on("update-not-available", () => {
    log.info("No update available.");
  });

  autoUpdater.on("update-downloaded", async () => {
    log.info("Update downloaded.");

    const result = await dialog.showMessageBox({
      type: "info",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update ready",
      message: "An update has been downloaded.",
      detail: "Restart the app to install it.",
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(); // installs immediately
    }
  });

  // Check on launch
  autoUpdater.checkForUpdatesAndNotify();

  // Optional: check every 6 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 6 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();

  // IMPORTANT: updates generally only work reliably in a packaged + installed build (NSIS),
  // not while running `electron .` from source.
  if (isPackaged()) {
    initAutoUpdates();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
// Renderer-safe storage bridge for Electron.
//
// IMPORTANT:
// - Do NOT import 'electron', 'fs', or 'path' in here.
// - Use window.require so webpack doesn't try to bundle Electron.

const getIpcRenderer = () => {
  try {
    // Only works in Electron renderer when nodeIntegration is enabled
    if (typeof window !== 'undefined' && typeof window.require === 'function') {
      const electron = window.require('electron');
      return electron?.ipcRenderer || null;
    }
  } catch (e) {
    // Not running in Electron (or window.require blocked)
  }
  return null;
};

/**
 * Loads the user data and settings object from the persistent userDataPath file.
 * @returns {Promise<{data: object, settings: object, error?: string}>}
 */
export async function loadData() {
  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) {
    return { data: null, settings: null, error: 'ipcRenderer not available (not running in Electron renderer).' };
  }

  try {
    return await ipcRenderer.invoke('load-data');
  } catch (e) {
    return { data: null, settings: null, error: e?.message || String(e) };
  }
}

/**
 * Saves the current application state (data and settings) to the persistent file.
 * @param {object} data - The examData object.
 * @param {object} settings - The appSettings object.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveData(data, settings) {
  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) {
    return { success: false, error: 'ipcRenderer not available (not running in Electron renderer).' };
  }

  try {
    return await ipcRenderer.invoke('save-data', data, settings);
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}

/**
 * Factory reset: deletes the persisted file on disk (implemented in the main process).
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function systemWipe() {
  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) {
    return { success: false, error: 'ipcRenderer not available (not running in Electron renderer).' };
  }

  try {
    return await ipcRenderer.invoke('system-wipe');
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}
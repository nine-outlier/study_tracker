// This module uses Electron's IPC to communicate with the main process
// which has access to the Node.js 'fs' module for file I/O.
// window.require('electron') is necessary in the Electron renderer process.
const { ipcRenderer } = window.require('electron'); 

/**
 * Loads the user data and settings object from the persistent userDataPath file.
 * @returns {Promise<{data: object, settings: object, error?: string}>}
 */
export async function loadData() {
    try {
        const result = await ipcRenderer.invoke('load-data');
        return result;
    } catch (e) {
        return { data: null, settings: null, error: e.message };
    }
}

/**
 * Saves the current application state (data and settings) to the persistent file.
 * @param {object} data - The examData object.
 * @param {object} settings - The appSettings object.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveData(data, settings) {
    try {
        const result = await ipcRenderer.invoke('save-data', data, settings);
        return result;
    } catch (e) {
        return { success: false, error: e.message };
    }
}
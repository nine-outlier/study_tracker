// Renderer-safe storage bridge for Electron.
// Uses preload.js (contextBridge) instead of window.require.

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.storage) return window.storage;
  } catch {}
  return null;
};

/**
 * Loads the user data and settings object from persistent storage.
 * @returns {Promise<{data: object|null, settings: object|null, error?: string}>}
 */
export async function loadData() {
  const storage = getStorage();
  if (!storage) {
    return { data: null, settings: null, error: 'storage bridge not available (preload not loaded).' };
  }
  try {
    return await storage.loadData();
  } catch (e) {
    return { data: null, settings: null, error: e?.message || String(e) };
  }
}

/**
 * Saves the current application state (data and settings) to persistent storage.
 * @param {object} data
 * @param {object} settings
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveData(data, settings) {
  const storage = getStorage();
  if (!storage) {
    return { success: false, error: 'storage bridge not available (preload not loaded).' };
  }
  try {
    return await storage.saveData(data, settings);
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}

/**
 * Factory reset: deletes persisted file on disk (main process).
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function systemWipe() {
  const storage = getStorage();
  if (!storage) {
    return { success: false, error: 'storage bridge not available (preload not loaded).' };
  }
  try {
    return await storage.systemWipe();
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}
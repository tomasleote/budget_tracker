/**
 * App mode source of truth.
 * 'authed' = Firebase-backed API repos; 'demo' = local mock repos; null = show Welcome.
 * Persisted to localStorage so the mode survives reloads.
 */
const STORAGE_KEY = 'bt_app_mode';
const VALID_MODES = ['authed', 'demo'];

export function getAppMode() {
  try {
    const mode = window.localStorage.getItem(STORAGE_KEY);
    return VALID_MODES.includes(mode) ? mode : null;
  } catch {
    return null;
  }
}

export function setAppMode(mode) {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Invalid app mode: ${mode}`);
  }
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function clearAppMode() {
  window.localStorage.removeItem(STORAGE_KEY);
}

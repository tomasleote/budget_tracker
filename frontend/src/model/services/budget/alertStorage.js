// Pure helpers for reading/writing budget alert state to localStorage.
// Isolated here to keep BudgetService under the line-count limit.

const KEYS = {
  ALERTS: 'budget_tracker_alerts',
  DISMISSED: 'budget_tracker_dismissed_alerts',
  HISTORY: 'budget_tracker_alert_history'
};

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('alertStorage parse error:', e);
    }
    return fallback;
  }
}

export function getBudgetState(progress) {
  if (progress.isExceeded) return 'exceeded';
  if (progress.isNearLimit) return 'warning';
  return 'normal';
}

export function shouldGenerateAlert(currentState, lastState) {
  if (currentState === 'normal') return false;
  if (lastState === 'normal' && (currentState === 'warning' || currentState === 'exceeded')) return true;
  if (lastState === 'warning' && currentState === 'exceeded') return true;
  return false;
}

export function getStoredAlerts() {
  return safeParse(localStorage.getItem(KEYS.ALERTS), []);
}

export function saveStoredAlerts(alerts) {
  try {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving alerts:', e);
    }
  }
}

export function getDismissedAlerts() {
  const raw = localStorage.getItem(KEYS.DISMISSED);
  return new Set(safeParse(raw, []));
}

export function saveDismissedAlerts(dismissedSet) {
  try {
    localStorage.setItem(KEYS.DISMISSED, JSON.stringify([...dismissedSet]));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving dismissed alerts:', e);
    }
  }
}

export function getAlertHistory() {
  return safeParse(localStorage.getItem(KEYS.HISTORY), {});
}

export function saveAlertHistory(history) {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving alert history:', e);
    }
  }
}

export function clearAllAlertStorage() {
  localStorage.removeItem(KEYS.DISMISSED);
  localStorage.removeItem(KEYS.HISTORY);
  localStorage.removeItem(KEYS.ALERTS);
}

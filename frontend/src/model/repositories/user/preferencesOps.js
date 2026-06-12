import { logger } from '../../../controller/utils/logger.js';
import { User } from '../../entities/index.js';
import { getCurrentUser } from './crudOps.js';

export async function getUserPreferences(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    return user ? user.preferences : {};
  } catch (error) {
    logger.error('Error getting user preferences:', error);
    return {};
  }
}

export async function updatePreferences(ctx, newPreferences) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('No user found');
    }
    const user = User.fromJSON(currentUser);
    user.updatePreferences(newPreferences);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to update preferences');
    }
    return { success: true, data: user.preferences };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function updatePreference(ctx, key, value) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('No user found');
    }
    const user = User.fromJSON(currentUser);
    user.updatePreference(key, value);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to update preference');
    }
    return { success: true, data: { [key]: value } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getPreference(ctx, key, defaultValue = null) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user || !user.preferences) {
      return defaultValue;
    }
    return user.preferences[key] !== undefined ? user.preferences[key] : defaultValue;
  } catch (error) {
    logger.error('Error getting user preference:', error);
    return defaultValue;
  }
}

export async function getTheme(ctx) {
  try {
    return await getPreference(ctx, 'theme', 'light');
  } catch (error) {
    return 'light';
  }
}

export async function setTheme(ctx, theme) {
  try {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      throw new Error('Invalid theme. Must be light, dark, or auto');
    }
    return await updatePreference(ctx, 'theme', theme);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCurrency(ctx) {
  try {
    return await getPreference(ctx, 'currency', 'USD');
  } catch (error) {
    return 'USD';
  }
}

export async function setCurrency(ctx, currency) {
  try {
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid currency code');
    }
    return await updatePreference(ctx, 'currency', currency.toUpperCase());
  } catch (error) {
    return { success: false, error: error.message };
  }
}

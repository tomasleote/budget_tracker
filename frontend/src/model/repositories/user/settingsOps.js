import { logger } from '../../../controller/utils/logger.js';
import { User } from '../../entities/index.js';
import { getCurrentUser } from './crudOps.js';

export async function getUserSettings(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    return user ? user.settings : {};
  } catch (error) {
    logger.error('Error getting user settings:', error);
    return {};
  }
}

export async function updateSettings(ctx, newSettings) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('No user found');
    }
    const user = User.fromJSON(currentUser);
    user.updateSettings(newSettings);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to update settings');
    }
    return { success: true, data: user.settings };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function updateSetting(ctx, key, value) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('No user found');
    }
    const user = User.fromJSON(currentUser);
    user.updateSetting(key, value);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to update setting');
    }
    return { success: true, data: { [key]: value } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getSetting(ctx, key, defaultValue = null) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user || !user.settings) {
      return defaultValue;
    }
    return user.settings[key] !== undefined ? user.settings[key] : defaultValue;
  } catch (error) {
    logger.error('Error getting user setting:', error);
    return defaultValue;
  }
}

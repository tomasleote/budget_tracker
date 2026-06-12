import { logger } from '../../../controller/utils/logger.js';
import { User } from '../../entities/index.js';

export async function getCurrentUser(ctx) {
  try {
    const userData = ctx.storageService.getItem(ctx.storageKey, null);
    return userData;
  } catch (error) {
    logger.error('Error getting current user:', error);
    return null;
  }
}

export async function saveUser(ctx, userData) {
  try {
    const user = new User(userData);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to save user');
    }
    return { success: true, data: user.toJSON() };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function updateUser(ctx, updateData) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('No user found to update');
    }
    const user = User.fromJSON(currentUser);
    user.update(updateData);
    const saved = ctx.storageService.setItem(ctx.storageKey, user.toJSON());
    if (!saved) {
      throw new Error('Failed to update user');
    }
    return { success: true, data: user.toJSON() };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function deleteUser(ctx) {
  try {
    const removed = ctx.storageService.removeItem(ctx.storageKey);
    return { success: removed, error: removed ? null : 'Failed to delete user' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

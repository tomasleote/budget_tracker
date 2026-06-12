import { logger } from '../../../controller/utils/logger.js';
import { User } from '../../entities/index.js';
import { getCurrentUser, saveUser, updateUser } from './crudOps.js';

export async function updateProfile(ctx, profileData) {
  try {
    const allowedFields = ['name', 'email', 'avatar'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (profileData.hasOwnProperty(field)) {
        updateData[field] = profileData[field];
      }
    });
    return await updateUser(ctx, updateData);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAvatar(ctx, avatarUrl) {
  try {
    return await updateUser(ctx, { avatar: avatarUrl });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function removeAvatar(ctx) {
  try {
    return await updateUser(ctx, { avatar: null });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function validateUser(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { isValid: false, errors: ['No user found'] };
    }
    try {
      new User(user);
      return { isValid: true, errors: [] };
    } catch (validationError) {
      return { isValid: false, errors: [validationError.message] };
    }
  } catch (error) {
    return { isValid: false, errors: [error.message] };
  }
}

export async function userExists(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    return user !== null;
  } catch (error) {
    return false;
  }
}

export async function initializeUser(ctx, userData = {}) {
  try {
    const existingUser = await getCurrentUser(ctx);
    if (existingUser) {
      return { success: true, data: existingUser, message: 'User already exists' };
    }
    const defaultUserData = {
      name: 'Demo User',
      email: 'demo@budgettracker.com',
      ...userData
    };
    return await saveUser(ctx, defaultUserData);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createDefaultUser(ctx) {
  try {
    const defaultUser = User.createDefault();
    return await saveUser(ctx, defaultUser.toJSON());
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetUserToDefaults(ctx) {
  try {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      return await createDefaultUser(ctx);
    }
    const resetData = {
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
      preferences: User.createDefault().preferences,
      settings: User.createDefault().settings
    };
    return await saveUser(ctx, resetData);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function formatCurrency(ctx, amount) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    const userEntity = User.fromJSON(user);
    return userEntity.formatCurrency(amount);
  } catch (error) {
    logger.error('Error formatting currency:', error);
    return `$${amount}`;
  }
}

export async function formatDate(ctx, date) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return new Date(date).toLocaleDateString('en-US');
    }
    const userEntity = User.fromJSON(user);
    return userEntity.formatDate(date);
  } catch (error) {
    logger.error('Error formatting date:', error);
    return new Date(date).toLocaleDateString();
  }
}

export async function exportUserData(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    return { user, exportedAt: new Date().toISOString(), version: '1.0.0' };
  } catch (error) {
    logger.error('Error exporting user data:', error);
    return null;
  }
}

export async function importUserData(ctx, userData) {
  try {
    if (!userData || !userData.user) {
      throw new Error('Invalid user data format');
    }
    return await saveUser(ctx, userData.user);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function backupUser(ctx) {
  try {
    const user = await getCurrentUser(ctx);
    return { user, timestamp: new Date().toISOString(), storageKey: ctx.storageKey };
  } catch (error) {
    logger.error('Error backing up user:', error);
    return null;
  }
}

export async function restoreUser(ctx, backupData) {
  try {
    if (!backupData || !backupData.user) {
      throw new Error('Invalid backup data');
    }
    const saved = ctx.storageService.setItem(ctx.storageKey, backupData.user);
    return { success: saved, error: saved ? null : 'Failed to restore user data' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

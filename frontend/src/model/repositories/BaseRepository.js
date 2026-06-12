import { logger } from '../../controller/utils/logger.js';
import StorageService from '../services/StorageService.js';
import { sortData } from './base/sortHelpers.js';

class BaseRepository {
  constructor(entityName, storageKey, EntityClass) {
    this.entityName = entityName;
    this.storageKey = storageKey;
    this.EntityClass = EntityClass;
    this.storageService = StorageService;
  }

  // Generic CRUD operations
  async create(data) {
    try {
      const entity = new this.EntityClass(data);
      const existingData = await this.getAll();
      existingData.push(entity.toJSON());
      const saved = this.storageService.setItem(this.storageKey, existingData);
      if (!saved) throw new Error(`Failed to save ${this.entityName}`);
      return { success: true, data: entity.toJSON(), id: entity.id };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  async getAll() {
    try {
      return this.storageService.getItem(this.storageKey, []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error getting all ${this.entityName}:`, error);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const allData = await this.getAll();
      return allData.find(item => item.id === id) || null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error getting ${this.entityName} by ID:`, error);
      }
      return null;
    }
  }

  async update(id, updateData) {
    try {
      const allData = await this.getAll();
      const index = allData.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`${this.entityName} not found`);
      const entity = this.EntityClass.fromJSON(allData[index]);
      entity.update(updateData);
      allData[index] = entity.toJSON();
      const saved = this.storageService.setItem(this.storageKey, allData);
      if (!saved) throw new Error(`Failed to update ${this.entityName}`);
      return { success: true, data: entity.toJSON() };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  async delete(id) {
    try {
      const allData = await this.getAll();
      const filteredData = allData.filter(item => item.id !== id);
      if (allData.length === filteredData.length) throw new Error(`${this.entityName} not found`);
      const saved = this.storageService.setItem(this.storageKey, filteredData);
      if (!saved) throw new Error(`Failed to delete ${this.entityName}`);
      return { success: true, deletedId: id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMultiple(ids) {
    try {
      const allData = await this.getAll();
      const filteredData = allData.filter(item => !ids.includes(item.id));
      const saved = this.storageService.setItem(this.storageKey, filteredData);
      if (!saved) throw new Error(`Failed to delete multiple ${this.entityName}`);
      return { success: true, deletedIds: ids, deletedCount: allData.length - filteredData.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exists(id) {
    try {
      const item = await this.getById(id);
      return item !== null;
    } catch {
      return false;
    }
  }

  async count() {
    try {
      const allData = await this.getAll();
      return allData.length;
    } catch {
      return 0;
    }
  }

  async clear() {
    try {
      const saved = this.storageService.setItem(this.storageKey, []);
      return { success: saved, error: saved ? null : 'Failed to clear data' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Query methods
  async findBy(criteria) {
    try {
      const allData = await this.getAll();
      return allData.filter(item =>
        Object.keys(criteria).every(key => {
          const criteriaValue = criteria[key];
          const itemValue = item[key];
          if (typeof criteriaValue === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(criteriaValue.toLowerCase());
          }
          return itemValue === criteriaValue;
        })
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error finding ${this.entityName} by criteria:`, error);
      }
      return [];
    }
  }

  async findOne(criteria) {
    try {
      const results = await this.findBy(criteria);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error finding one ${this.entityName}:`, error);
      }
      return null;
    }
  }

  // Sorting and pagination
  async getWithPagination(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const allData = await this.getAll();
      const sortedData = this.sortData(allData, sortBy, sortOrder);
      const offset = (page - 1) * limit;
      const paginatedData = sortedData.slice(offset, offset + limit);
      return {
        data: paginatedData,
        pagination: {
          page, limit, total: allData.length,
          pages: Math.ceil(allData.length / limit),
          hasNext: offset + limit < allData.length,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error getting paginated ${this.entityName}:`, error);
      }
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, pages: 0, hasNext: false, hasPrev: false }
      };
    }
  }

  sortData(data, sortBy, sortOrder = 'desc') {
    return sortData(data, sortBy, sortOrder);
  }

  // Batch operations
  async createMultiple(dataArray) {
    const results = [];
    for (const data of dataArray) {
      results.push(await this.create(data));
    }
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    return { total: results.length, successful: successful.length, failed: failed.length, results, data: successful.map(r => r.data) };
  }

  async updateMultiple(updates) {
    const results = [];
    for (const update of updates) {
      results.push({ id: update.id, ...(await this.update(update.id, update.data)) });
    }
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    return { total: results.length, successful: successful.length, failed: failed.length, results };
  }

  // Backup and restore
  async backup() {
    try {
      const allData = await this.getAll();
      return { entityName: this.entityName, storageKey: this.storageKey, data: allData, timestamp: new Date().toISOString(), count: allData.length };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error backing up ${this.entityName}:`, error);
      }
      return null;
    }
  }

  async restore(backupData) {
    try {
      if (!backupData || !backupData.data) throw new Error('Invalid backup data');
      const saved = this.storageService.setItem(this.storageKey, backupData.data);
      if (!saved) throw new Error('Failed to restore data');
      return { success: true, restoredCount: backupData.data.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Validation
  async validateData() {
    try {
      const allData = await this.getAll();
      const results = { total: allData.length, valid: 0, invalid: 0, errors: [] };
      for (const item of allData) {
        try {
          new this.EntityClass(item);
          results.valid++;
        } catch (error) {
          results.invalid++;
          results.errors.push({ id: item.id, error: error.message });
        }
      }
      return results;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error validating ${this.entityName} data:`, error);
      }
      return { total: 0, valid: 0, invalid: 0, errors: [] };
    }
  }

  // Search functionality
  async search(query, fields = []) {
    try {
      const allData = await this.getAll();
      const searchTerm = query.toLowerCase();
      return allData.filter(item => {
        if (fields.length === 0) {
          return Object.values(item).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm)
          );
        }
        return fields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(searchTerm);
        });
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Error searching ${this.entityName}:`, error);
      }
      return [];
    }
  }
}

export default BaseRepository;

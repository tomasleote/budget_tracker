/**
 * Base localStorage repository that implements the same interface as the database repository
 * This allows seamless switching between database and localStorage storage modes
 */

import { localStorage } from './NodeLocalStorage';
import { logger } from '../../config/logger';
import { DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from '../BaseRepository';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseLocalStorageRepository<T extends { id: string; created_at?: string; updated_at?: string }, CreateDto, UpdateDto> {
  protected abstract storageKey: string;
  
  /**
   * Get all items from localStorage
   */
  protected getAllItems(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data) as T[];
    } catch (error) {
      logger.error(`Error reading from localStorage (${this.storageKey}):`, error);
      return [];
    }
  }

  /**
   * Save all items to localStorage
   */
  protected saveAllItems(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      logger.error(`Error saving to localStorage (${this.storageKey}):`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateDto): Promise<DatabaseResult<T>> {
    try {
      const items = this.getAllItems();
      const now = new Date().toISOString();
      
      const newItem = {
        ...data,
        id: uuidv4(),
        created_at: now,
        updated_at: now
      } as T;

      items.push(newItem);
      this.saveAllItems(items);

      logger.debug(`Created ${this.storageKey} item:`, newItem);
      return { data: newItem, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage create error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<DatabaseResult<T>> {
    try {
      const items = this.getAllItems();
      const item = items.find(item => item.id === id);
      
      if (!item) {
        return { data: null, error: null }; // Not found is not an error
      }

      return { data: item, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage findById error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find all records with optional filtering, sorting, and pagination
   */
  async findAll(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'created_at', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<T[]>> {
    try {
      let items = this.getAllItems();

      // Apply filters
      items = this.applyFilters(items, filters);

      // Apply sorting
      items = this.applySorting(items, sort);

      // Count before pagination
      const count = items.length;

      // Apply pagination
      if (pagination) {
        items = items.slice(pagination.offset, pagination.offset + pagination.limit);
      }

      return { 
        data: items, 
        error: null,
        ...(pagination && { count })
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage findAll error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string, updates: Partial<UpdateDto>): Promise<DatabaseResult<T>> {
    try {
      const items = this.getAllItems();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return { data: null, error: 'Item not found' };
      }

      const updatedItem = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString()
      } as T;

      items[index] = updatedItem;
      this.saveAllItems(items);

      logger.debug(`Updated ${this.storageKey} item:`, updatedItem);
      return { data: updatedItem, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage update error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const filteredItems = items.filter(item => item.id !== id);
      
      if (items.length === filteredItems.length) {
        return { data: false, error: 'Item not found' };
      }

      this.saveAllItems(filteredItems);
      logger.debug(`Deleted ${this.storageKey} item with id:`, id);
      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage delete error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(dataArray: CreateDto[]): Promise<DatabaseResult<T[]>> {
    try {
      const items = this.getAllItems();
      const now = new Date().toISOString();
      
      const newItems = dataArray.map(data => ({
        ...data,
        id: uuidv4(),
        created_at: now,
        updated_at: now
      } as T));

      items.push(...newItems);
      this.saveAllItems(items);

      logger.debug(`Bulk created ${newItems.length} ${this.storageKey} items`);
      return { data: newItems, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage bulkCreate error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Bulk delete records by IDs
   */
  async bulkDelete(ids: string[]): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const filteredItems = items.filter(item => !ids.includes(item.id));
      
      this.saveAllItems(filteredItems);
      logger.debug(`Bulk deleted ${items.length - filteredItems.length} ${this.storageKey} items`);
      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage bulkDelete error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters: FilterOptions = {}): Promise<DatabaseResult<number>> {
    try {
      let items = this.getAllItems();
      items = this.applyFilters(items, filters);
      return { data: items.length, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`LocalStorage count error in ${this.storageKey}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const exists = items.some(item => item.id === id);
      return { data: exists, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Apply filters to items
   */
  protected applyFilters(items: T[], filters: FilterOptions): T[] {
    return items.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue;

        // Handle special filter operators
        if (key.includes('gte_')) {
          const field = key.replace('gte_', '') as keyof T;
          if ((item[field] as any) < value) return false;
        } else if (key.includes('lte_')) {
          const field = key.replace('lte_', '') as keyof T;
          if ((item[field] as any) > value) return false;
        } else if (key.includes('ilike_')) {
          const field = key.replace('ilike_', '') as keyof T;
          const itemValue = String(item[field]).toLowerCase();
          const searchValue = String(value).toLowerCase().replace(/%/g, '');
          if (!itemValue.includes(searchValue)) return false;
        } else if (key.includes('is_null_')) {
          const field = key.replace('is_null_', '') as keyof T;
          const isNull = item[field] === null || item[field] === undefined;
          if (!isNull) return false;
        } else {
          // Regular equality check
          const field = key as keyof T;
          if (value === null) {
            if (item[field] !== null && item[field] !== undefined) return false;
          } else {
            if (item[field] !== value) return false;
          }
        }
      }
      return true;
    });
  }

  /**
   * Apply sorting to items
   */
  protected applySorting(items: T[], sort: SortOptions): T[] {
    return [...items].sort((a, b) => {
      const field = sort.field as keyof T;
      const aValue = a[field];
      const bValue = b[field];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sort.ascending ? -1 : 1;
      if (bValue === null || bValue === undefined) return sort.ascending ? 1 : -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.ascending ? comparison : -comparison;
    });
  }

  /**
   * Clear all data (useful for testing)
   */
  async clearAll(): Promise<void> {
    this.saveAllItems([]);
    logger.debug(`Cleared all ${this.storageKey} items`);
  }
}

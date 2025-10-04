/**
 * LocalStorage implementation for Node.js
 * Provides browser-like localStorage API with optional file persistence
 */

import * as fs from 'fs';
import * as path from 'path';
import { storageConfig } from '../../config/storage';

class NodeLocalStorage {
  private data: Map<string, string> = new Map();
  private dataPath: string;
  private persist: boolean;

  constructor() {
    this.dataPath = storageConfig.localStorage.dataPath;
    this.persist = storageConfig.localStorage.persist;
    
    // Create data directory if it doesn't exist
    if (this.persist && !fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    // Load existing data
    this.loadAll();
  }

  /**
   * Get item from localStorage
   */
  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: string): void {
    this.data.set(key, value);
    if (this.persist) {
      this.saveToFile(key, value);
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    this.data.delete(key);
    if (this.persist) {
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    this.data.clear();
    if (this.persist) {
      // Remove all .json files from data directory
      const files = fs.readdirSync(this.dataPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.dataPath, file));
        }
      });
    }
  }

  /**
   * Get all keys
   */
  get length(): number {
    return this.data.size;
  }

  /**
   * Get key at index
   */
  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }

  /**
   * Get all data as object (useful for debugging)
   */
  getAllData(): Record<string, any> {
    const result: Record<string, any> = {};
    this.data.forEach((value, key) => {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Private: Get file path for a key
   */
  private getFilePath(key: string): string {
    // Sanitize key to be a valid filename
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.dataPath, `${safeKey}.json`);
  }

  /**
   * Private: Save data to file
   */
  private saveToFile(key: string, value: string): void {
    if (!this.persist) return;
    
    try {
      const filePath = this.getFilePath(key);
      fs.writeFileSync(filePath, value, 'utf-8');
    } catch (error) {
      console.error(`Failed to save localStorage data for key "${key}":`, error);
    }
  }

  /**
   * Private: Load all data from files
   */
  private loadAll(): void {
    if (!this.persist || !fs.existsSync(this.dataPath)) return;
    
    try {
      const files = fs.readdirSync(this.dataPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataPath, file);
          const key = file.replace('.json', '').replace(/_/g, '-');
          try {
            const data = fs.readFileSync(filePath, 'utf-8');
            this.data.set(key, data);
          } catch (error) {
            console.error(`Failed to load localStorage data from ${file}:`, error);
          }
        }
      });
      console.log(`📁 Loaded ${this.data.size} items from localStorage`);
    } catch (error) {
      console.error('Failed to load localStorage data:', error);
    }
  }
}

// Export singleton instance
export const localStorage = new NodeLocalStorage();

// Also export the class for testing
export default NodeLocalStorage;

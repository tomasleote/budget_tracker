/**
 * Firestore-backed Category repository (users/{uid}/categories).
 * Mirrors the public surface the services and import/export layer rely on.
 */
import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryWithChildren } from '../../types/category';
import { DatabaseResult, FilterOptions } from '../BaseRepository';
import { errorMessage } from './helpers/queryHelpers';
import { buildCategoryHierarchy } from '../queries/categoryQueries';

export class CategoryFirestoreRepository extends FirestoreBaseRepository<Category, CreateCategoryDto, UpdateCategoryDto> {
  protected collectionName = 'categories';

  private defaultCategoriesCache: Category[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  override async create(data: CreateCategoryDto): Promise<DatabaseResult<Category>> {
    const withDefaults = { is_default: false, is_active: true, parent_id: null, ...data };
    return super.create(withDefaults as CreateCategoryDto);
  }

  async findByNameAndType(name: string, type: 'income' | 'expense'): Promise<DatabaseResult<Category>> {
    try {
      const items = await this.getAllItems();
      return { data: items.find(c => c.name === name && c.type === type) || null, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findByParentId(parentId: string): Promise<DatabaseResult<Category[]>> {
    return this.findAll({ parent_id: parentId } as FilterOptions);
  }

  async findByType(type: 'income' | 'expense', activeOnly = true): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { type };
    if (activeOnly) filters.is_active = true;
    return this.findAll(filters);
  }

  async findDefaultCategories(): Promise<DatabaseResult<Category[]>> {
    const now = Date.now();
    if (this.defaultCategoriesCache && now - this.cacheTimestamp < this.CACHE_TTL) {
      return { data: this.defaultCategoriesCache, error: null };
    }
    const result = await this.findAll({ is_default: true, is_active: true } as FilterOptions);
    if (result.data && !result.error) {
      this.defaultCategoriesCache = result.data;
      this.cacheTimestamp = now;
    }
    return result;
  }

  async findRootCategories(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    try {
      const items = await this.getAllItems();
      const roots = items.filter(c => !c.parent_id && (!type || c.type === type));
      return { data: roots, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async hasChildren(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = await this.getAllItems();
      return { data: items.some(c => c.parent_id === categoryId), error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async getCategoryHierarchy(type?: 'income' | 'expense'): Promise<DatabaseResult<CategoryWithChildren[]>> {
    try {
      let items = await this.getAllItems();
      if (type) items = items.filter(c => c.type === type);
      items.sort((a, b) => a.name.localeCompare(b.name));
      return { data: buildCategoryHierarchy(items) as CategoryWithChildren[], error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async searchByName(searchTerm: string): Promise<DatabaseResult<Category[]>> {
    return this.findAll({ ilike_name: `%${searchTerm}%` } as FilterOptions, { field: 'name', ascending: true });
  }

  async findByNameAndTypeSimple(name: string, type: 'income' | 'expense'): Promise<Category | null> {
    const result = await this.findByNameAndType(name, type);
    if (result.error) throw new Error(result.error);
    return result.data;
  }

  async checkCategoriesExistBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) return { data: [], error: null };
      const items = await this.getAllItems();
      const existing = categoryIds.filter(id => items.some(c => c.id === id));
      return { data: existing, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async validateParentsBatch(parentIds: (string | null)[]): Promise<DatabaseResult<{ [key: string]: Category }>> {
    try {
      const ids = parentIds.filter((id): id is string => id !== null);
      if (ids.length === 0) return { data: {}, error: null };
      const items = await this.getAllItems();
      const map: { [key: string]: Category } = {};
      ids.forEach(id => {
        const parent = items.find(c => c.id === id);
        if (parent) map[id] = parent;
      });
      return { data: map, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  clearCache(): void {
    this.defaultCategoriesCache = null;
    this.cacheTimestamp = 0;
  }
}

export default new CategoryFirestoreRepository();

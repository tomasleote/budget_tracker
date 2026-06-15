/**
 * Base Firestore repository implementing the shared CRUD surface
 * (DatabaseResult shape) against users/{uid}/<collection>. The uid is read
 * from the request context, so every operation is scoped to the caller.
 */
import type { CollectionReference } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from '../../config/firebase';
import { getUid } from '../../context/requestContext';
import { DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from '../BaseRepository';
import { applyFilters, applySorting, paginate, errorMessage } from './helpers/queryHelpers';

type Entity = { id: string; created_at?: string; updated_at?: string };

export abstract class FirestoreBaseRepository<T extends Entity, CreateDto, UpdateDto> {
  protected abstract collectionName: string;

  protected collection(): CollectionReference {
    return firestore.collection('users').doc(getUid()).collection(this.collectionName);
  }

  protected async getAllItems(): Promise<T[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map(doc => doc.data() as T);
  }

  async create(data: CreateDto): Promise<DatabaseResult<T>> {
    try {
      const ref = this.collection().doc(uuidv4());
      const now = new Date().toISOString();
      const item = { ...data, id: ref.id, created_at: now, updated_at: now } as unknown as T;
      await ref.set(item);
      return { data: item, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findById(id: string): Promise<DatabaseResult<T>> {
    try {
      const doc = await this.collection().doc(id).get();
      if (!doc.exists) return { data: null, error: null };
      return { data: doc.data() as T, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findAll(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'created_at', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<T[]>> {
    try {
      let items = applyFilters(await this.getAllItems(), filters);
      items = applySorting(items, sort);
      const count = items.length;
      items = paginate(items, pagination);
      return { data: items, error: null, ...(pagination && { count }) };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async update(id: string, updates: Partial<UpdateDto>): Promise<DatabaseResult<T>> {
    try {
      const ref = this.collection().doc(id);
      const doc = await ref.get();
      if (!doc.exists) return { data: null, error: 'Item not found' };
      const item = { ...(doc.data() as T), ...updates, updated_at: new Date().toISOString() } as unknown as T;
      await ref.set(item);
      return { data: item, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async delete(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const ref = this.collection().doc(id);
      const doc = await ref.get();
      if (!doc.exists) return { data: false, error: 'Item not found' };
      await ref.delete();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async bulkCreate(dataArray: CreateDto[]): Promise<DatabaseResult<T[]>> {
    try {
      const collection = this.collection();
      const batch = firestore.batch();
      const now = new Date().toISOString();
      const items = dataArray.map(data => {
        const ref = collection.doc(uuidv4());
        const item = { ...data, id: ref.id, created_at: now, updated_at: now } as unknown as T;
        batch.set(ref, item);
        return item;
      });
      await batch.commit();
      return { data: items, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async bulkDelete(ids: string[]): Promise<DatabaseResult<boolean>> {
    try {
      const collection = this.collection();
      const batch = firestore.batch();
      ids.forEach(id => batch.delete(collection.doc(id)));
      await batch.commit();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async count(filters: FilterOptions = {}): Promise<DatabaseResult<number>> {
    try {
      const items = applyFilters(await this.getAllItems(), filters);
      return { data: items.length, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async exists(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const doc = await this.collection().doc(id).get();
      return { data: doc.exists, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }
}

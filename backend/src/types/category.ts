export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  description?: string;
  parent_id?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  type?: 'income' | 'expense';
  color?: string;
  icon?: string;
  description?: string;
  is_active?: boolean;
  parent_id?: string | null;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export interface BulkCategoryOperation {
  action: 'create' | 'update' | 'delete';
  categories: (CreateCategoryDto | (UpdateCategoryDto & { id: string }) | { id: string })[];
}

export interface CategoryQuery {
  type?: 'income' | 'expense';
  is_active?: boolean;
  parent_id?: string | null;
  include_children?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

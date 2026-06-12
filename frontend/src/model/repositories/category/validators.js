/**
 * Pure validation helpers for CategoryRepository.
 */

// Hex color: #RGB or #RRGGBB
const HEX_COLOR_RE = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export function isValidHexColor(color) {
  return HEX_COLOR_RE.test(color);
}

export function validateHierarchy(categories) {
  const errors = [];

  for (const category of categories) {
    if (category.parentId !== null) {
      const parent = categories.find(c => c.id === category.parentId);
      if (!parent) {
        errors.push({
          id: category.id,
          name: category.name,
          error: 'Parent category not found'
        });
      } else if (parent.parentId !== null) {
        errors.push({
          id: category.id,
          name: category.name,
          error: 'Nested subcategories not allowed'
        });
      }
    }
  }

  return {
    total: categories.length,
    valid: categories.length - errors.length,
    invalid: errors.length,
    errors
  };
}

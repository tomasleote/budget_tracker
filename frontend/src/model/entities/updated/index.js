/**
 * Updated Entities Index
 * Exports the backend-compatible entity classes
 */

import Transaction from './Transaction.js';
import Category from './Category.js';
import Budget from './Budget.js';
import User from '../User.js'; // User entity doesn't need updates

// Export individual entities
export {
  Transaction,
  Category,
  Budget,
  User
};

// Default export
export default {
  Transaction,
  Category,
  Budget,
  User
};

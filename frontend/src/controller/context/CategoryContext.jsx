import React, { createContext, useContext } from 'react';

// Create CategoryContext
const CategoryContext = createContext();

// Hook to use CategoryContext
export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryContext;

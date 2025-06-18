import React, { createContext, useContext } from 'react';

// Mock User Context Hook
const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    // Return mock data structure
    return {
      user: null,
      isLoading: () => false,
      hasError: () => false,
      getError: () => null,
      actions: {
        loadUser: async () => {},
        clearErrors: () => {}
      }
    };
  }
  return context;
};

export default UserContext;

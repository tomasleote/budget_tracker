import React, { useMemo } from 'react';
import UserContext from '../UserContext.jsx';

// Simple mock UserProvider for now
export const UserProvider = ({ children }) => {
  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: null,
    isLoading: () => false,
    hasError: () => false,
    getError: () => null,
    actions: {
      loadUser: async () => {},
      clearErrors: () => {}
    }
  }), []); // Empty dependency array since this is a static mock

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

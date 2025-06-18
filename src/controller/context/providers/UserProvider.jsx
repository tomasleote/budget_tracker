import React from 'react';
import UserContext from '../UserContext.jsx';

// Simple mock UserProvider for now
export const UserProvider = ({ children }) => {
  const value = {
    user: null,
    isLoading: () => false,
    hasError: () => false,
    getError: () => null,
    actions: {
      loadUser: async () => {},
      clearErrors: () => {}
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

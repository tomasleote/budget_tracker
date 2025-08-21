      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(budget => 
          budget.category.toLowerCase().includes(searchTerm) ||
          budget.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const aVal = a[state.filters.sortBy];
        const bVal = b[state.filters.sortBy];
        
        if (state.filters.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      return filtered;
    }
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export default BudgetProvider;
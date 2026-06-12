// Static budget allocation templates returned by ApiBudgetRepository.getBudgetTemplates()

const BUDGET_TEMPLATES = [
  {
    name: '50-30-20',
    description: '50% needs, 30% wants, 20% savings',
    allocations: [
      { category: 'needs', percentage: 50 },
      { category: 'wants', percentage: 30 },
      { category: 'savings', percentage: 20 }
    ]
  },
  {
    name: '70-20-10',
    description: '70% expenses, 20% savings, 10% giving',
    allocations: [
      { category: 'expenses', percentage: 70 },
      { category: 'savings', percentage: 20 },
      { category: 'giving', percentage: 10 }
    ]
  },
  {
    name: 'Zero-Based',
    description: 'Every dollar is allocated to a category',
    allocations: []
  }
];

export default BUDGET_TEMPLATES;

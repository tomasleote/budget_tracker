import React from 'react';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const BudgetListFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPeriod,
  setSelectedPeriod,
  sortField,
  setSortField,
  showFilters,
  setShowFilters
}) => (
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <Input
          placeholder="Search budgets by category or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={faSearch}
          iconPosition="left"
        />
      </div>
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        icon={faFilter}
        style={{
          backgroundColor: showFilters ? 'var(--accent-primary)' : 'transparent',
          borderColor: showFilters ? 'var(--accent-primary)' : 'var(--border-primary)',
          color: showFilters ? 'var(--text-inverse)' : 'var(--text-primary)'
        }}
      >
        Filters
      </Button>
    </div>

    {showFilters && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="exceeded">Exceeded</option>
            <option value="warning">Near Limit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Periods</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Sort By
          </label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="utilizationPercentage">Usage %</option>
            <option value="budgetAmount">Amount</option>
            <option value="category">Category</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

export default BudgetListFilters;

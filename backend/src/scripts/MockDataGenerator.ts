import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';

export interface MockDataConfig {
  months: 1 | 3 | 6 | 12;
  startDate?: string; // ISO date string, defaults to X months ago from today
  includeWeekends?: boolean;
  variability?: 'low' | 'medium' | 'high'; // How much spending varies
}

export interface CategoryData {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  avgAmount: number;
  frequency: number; // transactions per month
  variance: number; // amount variance (0-1)
}

export class MockDataGenerator {
  // Realistic category spending patterns
  private readonly expenseCategories: Omit<CategoryData, 'id'>[] = [
    { name: 'Groceries', type: 'expense', color: '#10B981', icon: 'shopping-cart', avgAmount: 120, frequency: 8, variance: 0.3 },
    { name: 'Dining Out', type: 'expense', color: '#F59E0B', icon: 'utensils', avgAmount: 45, frequency: 6, variance: 0.5 },
    { name: 'Transportation', type: 'expense', color: '#3B82F6', icon: 'car', avgAmount: 80, frequency: 12, variance: 0.4 },
    { name: 'Utilities', type: 'expense', color: '#8B5CF6', icon: 'bolt', avgAmount: 150, frequency: 1, variance: 0.2 },
    { name: 'Entertainment', type: 'expense', color: '#EC4899', icon: 'film', avgAmount: 60, frequency: 4, variance: 0.6 },
    { name: 'Healthcare', type: 'expense', color: '#EF4444', icon: 'heart', avgAmount: 200, frequency: 1.5, variance: 0.8 },
    { name: 'Shopping', type: 'expense', color: '#F97316', icon: 'shopping-bag', avgAmount: 100, frequency: 3, variance: 0.7 },
    { name: 'Education', type: 'expense', color: '#06B6D4', icon: 'book', avgAmount: 300, frequency: 0.5, variance: 0.3 },
    { name: 'Insurance', type: 'expense', color: '#84CC16', icon: 'shield', avgAmount: 250, frequency: 1, variance: 0.1 },
    { name: 'Miscellaneous', type: 'expense', color: '#6B7280', icon: 'dots-horizontal', avgAmount: 75, frequency: 3, variance: 0.9 }
  ];

  private readonly incomeCategories: Omit<CategoryData, 'id'>[] = [
    { name: 'Salary', type: 'income', color: '#059669', icon: 'briefcase', avgAmount: 4500, frequency: 1, variance: 0.05 },
    { name: 'Freelance', type: 'income', color: '#DC2626', icon: 'laptop', avgAmount: 800, frequency: 2, variance: 0.4 },
    { name: 'Investments', type: 'income', color: '#7C3AED', icon: 'trending-up', avgAmount: 200, frequency: 1, variance: 0.6 },
    { name: 'Side Business', type: 'income', color: '#DB2777', icon: 'store', avgAmount: 500, frequency: 1.5, variance: 0.3 },
    { name: 'Gifts', type: 'income', color: '#059669', icon: 'gift', avgAmount: 150, frequency: 0.5, variance: 0.8 },
    { name: 'Other Income', type: 'income', color: '#0891B2', icon: 'cash', avgAmount: 100, frequency: 0.3, variance: 0.5 }
  ];

  /**
   * Get all existing categories from database
   */
  async getExistingCategories(): Promise<CategoryData[]> {
    try {
      const { data: categories, error } = await supabaseAdmin
        .from('categories')
        .select('id, name, type, color, icon')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      if (!categories || categories.length === 0) {
        throw new Error('No categories found. Please seed default categories first.');
      }

      // Map categories to CategoryData with realistic patterns
      return categories.map(cat => {
        const template = cat.type === 'expense' 
          ? this.expenseCategories.find(ec => ec.name === cat.name)
          : this.incomeCategories.find(ic => ic.name === cat.name);

        return {
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          avgAmount: template?.avgAmount || (cat.type === 'expense' ? 100 : 1000),
          frequency: template?.frequency || 2,
          variance: template?.variance || 0.4
        };
      });
    } catch (error) {
      logger.error('Error getting existing categories:', error);
      throw error;
    }
  }

  /**
   * Generate realistic transactions for given period
   */
  generateTransactions(categories: CategoryData[], config: MockDataConfig): any[] {
    const transactions: any[] = [];
    const { months, startDate, variability = 'medium' } = config;
    
    // Calculate date range
    const endDate = new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setMonth(start.getMonth() - months);
    }

    const variabilityMultiplier = { low: 0.5, medium: 1.0, high: 1.5 }[variability];

    logger.info(`Generating transactions from ${start.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Generate transactions for each category
    categories.forEach(category => {
      const monthsInPeriod = months;
      const totalTransactions = Math.round(category.frequency * monthsInPeriod * variabilityMultiplier);
      
      for (let i = 0; i < totalTransactions; i++) {
        // Random date within the period
        const randomTime = start.getTime() + Math.random() * (endDate.getTime() - start.getTime());
        const transactionDate = new Date(randomTime);
        
        // Skip weekends for some categories (like work-related expenses)
        if (!config.includeWeekends && 
            ['Transportation', 'Salary'].includes(category.name) && 
            (transactionDate.getDay() === 0 || transactionDate.getDay() === 6)) {
          continue;
        }

        // Generate amount with variance
        const baseAmount = category.avgAmount;
        const variance = category.variance * variabilityMultiplier;
        const randomVariance = (Math.random() - 0.5) * variance * 2;
        const amount = Math.max(1, baseAmount * (1 + randomVariance));

        // Generate realistic description
        const description = this.generateDescription(category.name, category.type, amount);

        transactions.push({
          type: category.type,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
          description,
          category_id: category.id,
          date: transactionDate.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    // Sort by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    logger.info(`Generated ${transactions.length} transactions`);
    return transactions;
  }

  /**
   * Generate realistic budgets for expense categories
   */
  generateBudgets(categories: CategoryData[], config: MockDataConfig): any[] {
    const budgets: any[] = [];
    const expenseCategories = categories.filter(cat => cat.type === 'expense');
    
    // Generate monthly budgets for each expense category
    expenseCategories.forEach(category => {
      // Budget should be 10-30% higher than average monthly spending
      const monthlySpending = category.avgAmount * category.frequency;
      const budgetMultiplier = 1.1 + Math.random() * 0.2; // 1.1 to 1.3
      const budgetAmount = Math.round(monthlySpending * budgetMultiplier);

      // Create budget for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      budgets.push({
        category_id: category.id,
        budget_amount: budgetAmount,
        period: 'monthly',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    logger.info(`Generated ${budgets.length} budgets`);
    return budgets;
  }

  /**
   * Generate realistic transaction descriptions
   */
  private generateDescription(categoryName: string, type: 'income' | 'expense', amount: number): string {
    const descriptions: Record<string, string[]> = {
      // Expense descriptions
      'Groceries': ['Weekly groceries', 'Supermarket shopping', 'Fresh produce', 'Organic food store', 'Bulk shopping'],
      'Dining Out': ['Restaurant dinner', 'Coffee shop', 'Fast food lunch', 'Pizza delivery', 'Food truck'],
      'Transportation': ['Gas station', 'Public transport', 'Uber ride', 'Parking fee', 'Car maintenance'],
      'Utilities': ['Electricity bill', 'Gas bill', 'Water bill', 'Internet service', 'Phone bill'],
      'Entertainment': ['Movie tickets', 'Concert', 'Streaming service', 'Gaming', 'Books'],
      'Healthcare': ['Doctor visit', 'Pharmacy', 'Dental care', 'Health insurance', 'Medical supplies'],
      'Shopping': ['Clothing', 'Electronics', 'Home goods', 'Online purchase', 'Department store'],
      'Education': ['Course fee', 'Books', 'Online learning', 'Workshop', 'Certification'],
      'Insurance': ['Car insurance', 'Health insurance', 'Home insurance', 'Life insurance'],
      'Miscellaneous': ['Gift', 'Donation', 'Service fee', 'Subscription', 'Misc expense'],
      
      // Income descriptions
      'Salary': ['Monthly salary', 'Paycheck', 'Salary payment', 'Monthly income'],
      'Freelance': ['Freelance project', 'Consulting work', 'Contract payment', 'Client payment'],
      'Investments': ['Dividend payment', 'Stock sale', 'Investment return', 'Portfolio gain'],
      'Side Business': ['Business income', 'Side project', 'Online sales', 'Service income'],
      'Gifts': ['Birthday gift', 'Holiday money', 'Gift money', 'Cash gift'],
      'Other Income': ['Refund', 'Bonus', 'Prize money', 'Misc income']
    };

    const categoryDescriptions = descriptions[categoryName] || ['Transaction'];
    const randomDescription = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    
    // Add amount context for some categories
    if (['Groceries', 'Dining Out', 'Shopping'].includes(categoryName) && Math.random() > 0.5) {
      const locations = {
        'Groceries': ['Walmart', 'Target', 'Whole Foods', 'Local Market'],
        'Dining Out': ['Local Restaurant', 'Pizza Place', 'Coffee Shop', 'Fast Food'],
        'Shopping': ['Amazon', 'Mall', 'Online Store', 'Retail Store']
      };
      const location = locations[categoryName as keyof typeof locations];
      const randomLocation = location[Math.floor(Math.random() * location.length)];
      return `${randomDescription} - ${randomLocation}`;
    }

    return randomDescription;
  }

  /**
   * Insert transactions into database in batches
   */
  async insertTransactions(transactions: any[]): Promise<void> {
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      batches.push(transactions.slice(i, i + batchSize));
    }

    logger.info(`Inserting ${transactions.length} transactions in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const { error } = await supabaseAdmin
        .from('transactions')
        .insert(batch);

      if (error) {
        throw new Error(`Failed to insert batch ${i + 1}: ${error.message}`);
      }

      logger.info(`Inserted batch ${i + 1}/${batches.length} (${batch.length} transactions)`);
    }
  }

  /**
   * Insert budgets into database
   */
  async insertBudgets(budgets: any[]): Promise<void> {
    logger.info(`Inserting ${budgets.length} budgets`);

    const { error } = await supabaseAdmin
      .from('budgets')
      .insert(budgets);

    if (error) {
      throw new Error(`Failed to insert budgets: ${error.message}`);
    }

    logger.info(`Successfully inserted ${budgets.length} budgets`);
  }
}

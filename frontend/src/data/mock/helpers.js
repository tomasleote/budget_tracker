const DESCRIPTIONS = {
  'Food & Dining': ['Weekly grocery shopping', 'Supermarket run', 'Fresh produce', 'Restaurant dinner', 'Coffee shop'],
  'Transportation': ['Gas station fill-up', 'Uber ride', 'Public transit', 'Parking fee', 'Car maintenance'],
  'Shopping': ['Clothing purchase', 'Amazon order', 'Home supplies', 'Electronics', 'Personal items'],
  'Bills & Utilities': ['Electricity bill', 'Internet bill', 'Water bill', 'Phone bill', 'Cable TV'],
  'Entertainment': ['Movie tickets', 'Concert tickets', 'Streaming service', 'Gaming', 'Books'],
  'Healthcare': ['Doctor visit', 'Pharmacy', 'Dental cleaning', 'Insurance copay', 'Medication'],
  'Personal Care': ['Gym membership', 'Haircut', 'Cosmetics', 'Spa treatment', 'Personal trainer'],
  'Home & Garden': ['Furniture', 'Home repairs', 'Gardening supplies', 'Appliances', 'Home improvement'],
  'Salary': ['Bi-weekly paycheck', 'Monthly salary', 'Salary deposit'],
  'Freelance': ['Web design project', 'Consulting work', 'Freelance writing', 'Photography gig'],
  'Investment': ['Dividend payment', 'Stock profit', 'Bond interest', 'Crypto gains'],
  'Side Business': ['Online sales', 'Tutoring session', 'Product sales', 'Service revenue']
};

export const generateAmount = (baseAmount, variance) => {
  const randomFactor = (Math.random() - 0.5) * 2;
  return Math.max(1, Math.round(baseAmount + (randomFactor * variance)));
};

export const generateRandomDate = (startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
};

export const generateDescription = (category, type) => {
  const categoryDescriptions = DESCRIPTIONS[category] || ['Transaction'];
  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex];
};

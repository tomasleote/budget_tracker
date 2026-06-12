const validateTransactionForm = (formData) => {
  const newErrors = {};

  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    newErrors.amount = 'Amount must be greater than 0';
  } else if (parseFloat(formData.amount) > 1000000) {
    newErrors.amount = 'Amount cannot exceed $1,000,000';
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Description is required';
  } else if (formData.description.trim().length > 100) {
    newErrors.description = 'Description cannot exceed 100 characters';
  }

  if (!formData.categoryId) {
    newErrors.categoryId = 'Category is required';
  }

  if (!formData.date) {
    newErrors.date = 'Date is required';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    if (selectedDate > today) {
      newErrors.date = 'Date cannot be in the future';
    } else if (selectedDate < fiveYearsAgo) {
      newErrors.date = 'Date cannot be more than 5 years ago';
    }
  }

  return newErrors;
};

export default validateTransactionForm;

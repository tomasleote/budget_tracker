const getInsightStyling = (type) => {
  switch (type) {
    case 'critical':
      return { bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600', titleColor: 'text-red-900' };
    case 'warning':
      return { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', iconColor: 'text-yellow-600', titleColor: 'text-yellow-900' };
    case 'success':
      return { bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600', titleColor: 'text-green-900' };
    default:
      return { bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-600', titleColor: 'text-blue-900' };
  }
};

export default getInsightStyling;

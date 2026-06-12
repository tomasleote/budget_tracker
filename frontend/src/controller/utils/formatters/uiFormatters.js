export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const unescapeHtml = (safe) => {
  return safe
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

export const formatDisplayName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown User';
  if (!lastName) return firstName;
  if (!firstName) return lastName;
  return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || '?';
};

export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
};

export const formatStatus = (status, withIcon = true) => {
  const statusMap = {
    active: { label: 'Active', color: 'success', icon: 'fas fa-check-circle' },
    inactive: { label: 'Inactive', color: 'secondary', icon: 'fas fa-pause-circle' },
    pending: { label: 'Pending', color: 'warning', icon: 'fas fa-clock' },
    completed: { label: 'Completed', color: 'success', icon: 'fas fa-check-circle' },
    cancelled: { label: 'Cancelled', color: 'danger', icon: 'fas fa-times-circle' },
    error: { label: 'Error', color: 'danger', icon: 'fas fa-exclamation-circle' }
  };

  const statusInfo = statusMap[status] || { label: status, color: 'secondary', icon: 'fas fa-question-circle' };

  return {
    ...statusInfo,
    formatted: withIcon ? `${statusInfo.icon} ${statusInfo.label}` : statusInfo.label
  };
};

export const formatPriority = (priority, withIcon = true) => {
  const priorityMap = {
    low: { label: 'Low', color: 'success', icon: 'fas fa-arrow-down' },
    medium: { label: 'Medium', color: 'warning', icon: 'fas fa-minus' },
    high: { label: 'High', color: 'danger', icon: 'fas fa-arrow-up' },
    critical: { label: 'Critical', color: 'danger', icon: 'fas fa-exclamation-triangle' }
  };

  const priorityInfo = priorityMap[priority] || { label: priority, color: 'secondary', icon: 'fas fa-question-circle' };

  return {
    ...priorityInfo,
    formatted: withIcon ? `${priorityInfo.icon} ${priorityInfo.label}` : priorityInfo.label
  };
};

import React, { useState } from 'react';
import { useAuth } from '../../../controller/hooks/useAuth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function RegisterForm() {
  const { register } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  const update = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!values.email) next.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(values.email)) next.email = 'Enter a valid email address';
    if (!values.password) next.password = 'Password is required';
    else if (values.password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setPending(true);
    try {
      await register(values.email, values.password);
    } catch (error) {
      setFormError(error?.message || 'Unable to create your account. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="register-email" className="block text-sm font-medium text-theme-secondary">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          disabled={pending}
          className={`input-theme w-full rounded-lg border px-3 py-2 text-sm${errors.email ? ' input-error' : ''}`}
        />
        {errors.email && <p className="text-xs text-theme-error">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="register-password" className="block text-sm font-medium text-theme-secondary">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          disabled={pending}
          className={`input-theme w-full rounded-lg border px-3 py-2 text-sm${errors.password ? ' input-error' : ''}`}
        />
        {errors.password && <p className="text-xs text-theme-error">{errors.password}</p>}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-theme-error">{formError}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-theme-primary w-full rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

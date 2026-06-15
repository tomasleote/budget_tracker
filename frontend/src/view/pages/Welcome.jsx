import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../controller/hooks/useAuth';
import { getAppMode } from '../../controller/appMode';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

const TABS = [
  { id: 'login', label: 'Log in' },
  { id: 'register', label: 'Register' },
];

export function Welcome() {
  const { user, enterDemo } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [demoPending, setDemoPending] = useState(false);
  const [demoError, setDemoError] = useState('');

  if (user || getAppMode() === 'demo') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemo = async () => {
    setDemoError('');
    setDemoPending(true);
    try {
      await enterDemo();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setDemoError(error?.message || 'Could not start the demo. Please try again.');
      setDemoPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary px-4 py-12 theme-transition">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-theme-primary">Budget Tracker</h1>
          <p className="mt-2 text-sm text-theme-secondary">
            Take control of your spending. Log in, create an account, or explore the demo.
          </p>
        </header>

        <div className="card-theme rounded-2xl border p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-theme-tertiary p-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={
                  tab === item.id
                    ? 'btn-theme-primary rounded-md border px-4 py-2 text-sm font-semibold'
                    : 'btn-theme-ghost rounded-md border px-4 py-2 text-sm font-medium'
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-theme-tertiary" />
            <span className="text-xs uppercase tracking-wide text-theme-tertiary">or</span>
            <span className="h-px flex-1 bg-theme-tertiary" />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={demoPending}
            className="btn-theme-outline w-full rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {demoPending ? 'Starting demo...' : 'Try the demo'}
          </button>
          {demoError && <p role="alert" className="mt-3 text-sm text-theme-error">{demoError}</p>}
        </div>
      </div>
    </div>
  );
}

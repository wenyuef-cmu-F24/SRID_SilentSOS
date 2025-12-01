import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:4000/api';

function AuthPage() {
  const navigate = useNavigate();
  const { saveAuth, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (!form.confirmPassword) {
        setError('Please retype your password.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const body = mode === 'signup'
        // Use username as both display name and login identifier
        ? { name: form.username, email: form.username, password: form.password }
        : { email: form.username, password: form.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      saveAuth({ token: data.token, user: data.user });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-10 pb-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">SilentSOS</h1>
        <p className="text-gray-600 mb-8 text-center">
          {mode === 'login'
            ? 'Welcome back. Sign in to stay protected.'
            : 'Create your safety account so we can remember your profile and contacts.'}
        </p>

        <div className="flex mb-6 bg-white rounded-full p-1 shadow-sm">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              mode === 'login' ? 'bg-gray-900 text-white' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              mode === 'signup' ? 'bg-gray-900 text-white' : 'text-gray-500'
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 text-gray-900"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 text-gray-900"
              placeholder="At least 6 characters"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retype Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 text-gray-900"
                placeholder="Retype your password"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gray-900 text-white rounded-2xl py-3 font-semibold text-lg hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;



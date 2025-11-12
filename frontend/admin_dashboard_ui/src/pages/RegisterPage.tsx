import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth?.register?.({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      {/* Larger card: max-w-3xl for overall width, inner controls constrained to max-w-xl */}
      <div className="w-full max-w-3xl bg-white border rounded-lg shadow-sm p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Create your account</h2>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          <div className="w-full max-w-xl">
            <label className="block text-sm text-gray-600 mb-2">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full box-border px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="w-full max-w-xl">
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full box-border px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="w-full max-w-xl">
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full box-border px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="w-full max-w-xl">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-4 py-3 rounded-md"
            >
              Create account
            </button>
          </div>
        </form>

        <div className="mt-6 text-base text-gray-600 text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
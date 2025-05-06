import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="m-auto bg-white rounded-lg shadow-lg p-10 w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Memora</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-teal-700 text-white py-2 rounded">Login</button>
        </form>
        <p className="mt-4 text-center text-sm">Don’t have an account? <a href="/signup" className="text-teal-700 font-semibold">Sign Up</a></p>
      </div>
    </div>
  );
};

export default LoginPage;

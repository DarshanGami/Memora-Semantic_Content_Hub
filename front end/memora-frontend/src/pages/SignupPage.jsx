import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      alert('Signup successful! Please login.');
      navigate('/');
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-8 rounded w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up to Memora</h2>
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" required />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" required />
        <button type="submit" className="bg-teal-600 text-white w-full py-2 rounded hover:bg-teal-700">Sign Up</button>
        <p className="mt-4 text-sm text-center">
          Already have an account? <a href="/" className="text-teal-700 font-semibold">Login</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
    setIsVisible(true);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      // alert('Signup successful! Please login.');
      navigate('/');
      toast.success('Signup successful!');
    } catch (err) {
      toast.error('Signup failed!');
      // alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes slideIn {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }
        .slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        .input-focus {
          transition: all 0.3s ease;
        }
        .input-focus:focus {
          transform: scale(1.02);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
        }
        .button-hover {
          transition: all 0.3s ease;
        }
        .button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className={`w-full max-w-md transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-600"></div>

          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Sign Up to Memora
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="slide-in" style={{ animationDelay: '0.1s' }}>
                <input 
                  name="firstName" 
                  placeholder="First Name" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  required 
                />
              </div>

              <div className="slide-in" style={{ animationDelay: '0.2s' }}>
                <input 
                  name="lastName" 
                  placeholder="Last Name" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  required 
                />
              </div>

              <div className="slide-in" style={{ animationDelay: '0.3s' }}>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  required 
                />
              </div>

              <div className="slide-in" style={{ animationDelay: '0.4s' }}>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  required 
                />
              </div>
            </div>

            <div className="slide-in" style={{ animationDelay: '0.5s' }}>
              <button 
                type="submit" 
                className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg font-semibold shadow-lg button-hover pulse-animation"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="slide-in" style={{ animationDelay: '0.6s' }}>
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a 
                href="/" 
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors duration-200 hover:underline"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;  
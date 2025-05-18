import React, { useState, useEffect } from 'react';
import { useNavigate , Link} from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // useEffect(() => {
  //   if (localStorage.getItem('loggedOut')) {
  //     toast.success('Logged out successfully!');
  //     localStorage.removeItem('loggedOut');
  //   }
  // }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (err) {
      // alert('Login failed');
      toast.error('Login failed. Please check credentials.');
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
          
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Memora
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="slide-in" style={{ animationDelay: '0.1s' }}>
                <input 
                  type="email" 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="slide-in" style={{ animationDelay: '0.2s' }}>
                <input 
                  type="password" 
                  className="w-full p-3 border border-gray-300 rounded-lg input-focus"
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="slide-in" style={{ animationDelay: '0.3s' }}>
              <button 
                type="submit" 
                className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg font-semibold shadow-lg button-hover pulse-animation"
              >
                Login
              </button>
            </div>
          </form>
          
          <div className="slide-in" style={{ animationDelay: '0.4s' }}>
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                  to="/signup"
                  className="text-teal-600 font-semibold hover:text-teal-700 transition-colors duration-200 hover:underline">
                  Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
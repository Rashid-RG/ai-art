import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, register, resetPassword, notify } = useAppContext();
  const navigate = useNavigate();
  
  // State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminRole: 'Administrator' // For visual distinction
  });
  
  // Forgot Password Email State
  const [resetEmail, setResetEmail] = useState('');
  
  // Validation State
  const [emailError, setEmailError] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');

  // Email Regex Pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Pre-fill email for convenience when switching modes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: isAdminMode ? 'admin@artisha.com' : '',
      password: ''
    }));
    setEmailError('');
  }, [isAdminMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate Email Format
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address (e.g., user@example.com).');
      setIsLoading(false);
      return;
    }

    // Simulate network validation delay for robust feel
    setTimeout(() => {
      try {
        const role = isAdminMode ? UserRole.ADMIN : UserRole.CUSTOMER;

        if (isRegistering) {
          if (!formData.name.trim()) {
            notify('error', 'Name is required for registration.');
            setIsLoading(false);
            return;
          }
          register(formData.name, formData.email, role, formData.password);
        } else {
          // Pass password to login function
          const success = login(formData.email, role, formData.password);
          if (!success) {
            setIsLoading(false);
            return; 
          }
        }

        // Navigate based on role
        navigate(isAdminMode ? '/admin' : '/');
      } catch (error) {
        console.error("Login error", error);
        notify('error', 'Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailRegex.test(resetEmail)) {
      setResetEmailError('Please enter a valid email address.');
      return;
    }

    resetPassword(resetEmail);
    setShowForgotModal(false);
    setResetEmail('');
    setResetEmailError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-12 relative">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Header Section */}
        <div className={`p-8 text-center transition-colors duration-300 ${isAdminMode ? 'bg-stone-900' : 'bg-orange-600'}`}>
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <i className={`fas ${isAdminMode ? 'fa-user-shield' : 'fa-user'} text-white text-2xl`}></i>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
            {isAdminMode ? 'Artisan Access' : 'Customer Login'}
          </h2>
          <p className="text-white/80 mt-2 text-sm">
            {isAdminMode ? 'Manage your storefront & orders' : 'Discover unique Sri Lankan art'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-stone-200">
          <button 
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              !isAdminMode ? 'text-orange-600 bg-white border-b-2 border-orange-600' : 'text-stone-400 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            Customer
          </button>
          <button 
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              isAdminMode ? 'text-stone-900 bg-white border-b-2 border-stone-900' : 'text-stone-400 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field (Register Only) */}
            {isRegistering && (
              <div className="animate-fade-in-down">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition focus:border-transparent focus:ring-orange-500"
                    placeholder="e.g. John Doe"
                  />
                  <i className="fas fa-id-card absolute left-3 top-3.5 text-stone-400"></i>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition focus:border-transparent ${
                    emailError 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-stone-300 focus:ring-orange-500'
                  }`}
                  placeholder="name@example.com"
                />
                <i className={`fas fa-envelope absolute left-3 top-3.5 ${emailError ? 'text-red-500' : 'text-stone-400'}`}></i>
              </div>
              {emailError && <p className="text-red-500 text-xs mt-1 font-medium animate-fade-in">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-xs font-bold text-stone-500 uppercase">Password</label>
                 {!isRegistering && (
                   <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-orange-600 hover:underline">Forgot?</button>
                 )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition focus:border-transparent focus:ring-orange-500"
                  placeholder="••••••••"
                />
                <i className="fas fa-lock absolute left-3 top-3.5 text-stone-400"></i>
              </div>
            </div>

            {/* Admin Role Selector (Visual Only) */}
            {isAdminMode && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Access Level</label>
                <div className="relative">
                  <select
                    name="adminRole"
                    value={formData.adminRole}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none appearance-none bg-white"
                  >
                    <option>Administrator</option>
                    <option>Store Manager</option>
                    <option>Order Fulfillment</option>
                  </select>
                  <i className="fas fa-user-tag absolute left-3 top-3.5 text-stone-400"></i>
                  <i className="fas fa-chevron-down absolute right-3 top-3.5 text-stone-400 text-xs"></i>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transform transition hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                isAdminMode 
                  ? 'bg-stone-900 hover:bg-stone-800 focus:ring-stone-500' 
                  : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  {isRegistering ? 'Create Account' : 'Sign In'} <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className={`font-bold hover:underline ${isAdminMode ? 'text-stone-900' : 'text-orange-600'}`}
              >
                {isRegistering ? 'Sign In' : 'Register Now'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="bg-stone-50 p-4 border-t border-stone-100 text-center">
           <p className="text-[10px] text-stone-400 uppercase tracking-widest">
             <i className="fas fa-shield-alt mr-1"></i> Secure 256-bit SSL Encrypted
           </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-xl">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold font-serif mb-2">Reset Password</h3>
            <p className="text-sm text-stone-500 mb-4">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-4">
                <input 
                  type="email" 
                  required
                  className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none ${
                    resetEmailError ? 'border-red-500 bg-red-50' : 'border-stone-300'
                  }`}
                  placeholder="Enter email address"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetEmailError('');
                  }}
                />
                {resetEmailError && <p className="text-red-500 text-xs mt-1">{resetEmailError}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForgotModal(false)} className="text-stone-500 font-bold text-sm px-3 py-2 hover:bg-stone-50 rounded">Cancel</button>
                <button type="submit" className="bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded hover:bg-orange-700">Send Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
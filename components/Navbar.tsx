import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, cart, logout, newOrderCount, alerts, clearAlerts } = useAppContext();
  const location = useLocation();
  const [showAlerts, setShowAlerts] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-orange-600 font-bold' : 'text-stone-600 hover:text-orange-500';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-600 rounded-tr-lg rounded-bl-lg group-hover:bg-stone-900 transition-colors duration-300"></div>
            <span className="text-2xl font-serif font-bold text-stone-800">Artisha</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop</Link>
            <Link to="/creative-studio" className={isActive('/creative-studio')}>AI Studio</Link>
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className={`relative ${isActive('/admin')}`}>
                Dashboard
                {newOrderCount > 0 && (
                  <span className="absolute -top-1 -right-4 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-600 rounded-full animate-bounce">
                    {newOrderCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowAlerts(!showAlerts)}
                onBlur={() => setTimeout(() => setShowAlerts(false), 200)}
                className="p-2 text-stone-600 hover:text-orange-600 transition relative"
                title="Notifications"
              >
                <i className="fas fa-bell text-lg"></i>
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-stone-100 py-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-stone-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-stone-800">Notifications</span>
                    {alerts.length > 0 && (
                      <button onClick={clearAlerts} className="text-xs text-stone-400 hover:text-orange-600 transition">Clear All</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-stone-400 text-sm italic">
                        No new notifications
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className="px-4 py-3 border-b border-stone-50 hover:bg-stone-50 flex gap-3 transition">
                           <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                             alert.type === 'success' ? 'bg-green-500' : 
                             alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                           }`}></div>
                           <p className="text-sm text-stone-600 leading-snug">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2 text-stone-600 hover:text-orange-600 transition">
              <i className="fas fa-shopping-cart text-lg"></i>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-stone-200 mx-1"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:bg-stone-50 p-1.5 rounded-full transition">
                  {user.avatar ? (
                     <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-stone-200 object-cover" />
                  ) : (
                     <i className="fas fa-user-circle text-2xl text-stone-300"></i>
                  )}
                  <span className="text-sm font-bold text-stone-700 hidden sm:block">{user.name}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-xs font-bold border border-stone-300 px-3 py-1.5 rounded hover:bg-stone-900 hover:text-white transition uppercase tracking-wide"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-md flex items-center gap-2"
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
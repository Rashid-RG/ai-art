
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded-tr-lg rounded-bl-lg"></div>
              <span className="text-xl font-serif font-bold text-white">Artisha</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Empowering Sri Lankan artisans with AI-driven tools to reach a global audience. Discover unique, handcrafted masterpieces.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-serif font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-500 transition">Home</Link></li>
              <li><Link to="/shop" className="hover:text-orange-500 transition">Shop Collections</Link></li>
              <li><Link to="/creative-studio" className="hover:text-orange-500 transition">AI Creative Studio</Link></li>
              <li><Link to="/login" className="hover:text-orange-500 transition">Login / Register</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
             <h3 className="text-white font-serif font-bold mb-4">Customer Care</h3>
             <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-orange-500 transition">Shipping & Delivery</a></li>
               <li><a href="#" className="hover:text-orange-500 transition">Returns Policy</a></li>
               <li><a href="#" className="hover:text-orange-500 transition">Track Order</a></li>
               <li><Link to="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
             </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-serif font-bold mb-4">Visit Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1 text-orange-600"></i>
                <span>123 Art Street, Colombo 07, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-orange-600"></i>
                <span>hello@artisha.lk</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone text-orange-600"></i>
                <span>+94 11 234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} Artisha. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-pinterest"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

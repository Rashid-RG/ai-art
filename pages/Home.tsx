import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Home: React.FC = () => {
  const { products } = useAppContext();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Art Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 animate-fade-in-down drop-shadow-lg">
            Discover the Soul of Sri Lankan Art
          </h1>
          <p className="text-xl text-stone-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Handcrafted masterpieces from local artisans, enhanced by AI customization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="bg-orange-600 text-white px-8 py-3 rounded-md font-bold hover:bg-orange-700 transition shadow-lg">
              Shop Collections
            </Link>
            <Link to="/creative-studio" className="bg-white text-stone-900 px-8 py-3 rounded-md font-bold hover:bg-stone-100 transition shadow-lg flex items-center justify-center gap-2">
              <i className="fas fa-magic text-purple-600"></i> AI Custom Art
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-stone-800 mb-4">Featured Masterpieces</h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map(product => (
            <Link to={`/shop/${product.id}`} key={product.id} className="group block">
              <div className="relative overflow-hidden rounded-lg shadow-md aspect-[3/4]">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-bold">View Details</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-orange-600 transition">{product.title}</h3>
                <p className="text-stone-500 text-sm">{product.category}</p>
                <p className="text-stone-900 font-bold mt-1">LKR {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Art Creation" 
              className="rounded-xl shadow-2xl"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm">Creative Studio</span>
            <h2 className="text-4xl font-serif text-stone-900 mt-2 mb-6">Can't Find What You're Looking For?</h2>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              Use our AI-powered Creative Studio to describe your dream art piece. Collaborate with our intelligent agent to visualize your idea, and we'll connect you with an artisan to bring it to life.
            </p>
            <Link to="/creative-studio" className="inline-block border-2 border-stone-900 text-stone-900 px-6 py-3 rounded hover:bg-stone-900 hover:text-white transition font-bold">
              Try AI Studio Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

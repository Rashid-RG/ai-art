import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Shop: React.FC = () => {
  const { products, addToCart } = useAppContext();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'All' || p.category === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-stone-900 mb-8 text-center">Shop Collections</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  filter === cat 
                    ? 'bg-stone-900 text-white' 
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search art..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:border-orange-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-stone-400"></i>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group border border-stone-100">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-stone-900 hover:text-orange-600 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300"
                  title="Add to Cart"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">{product.category}</p>
                <Link to={`/shop/${product.id}`}>
                  <h3 className="text-lg font-bold text-stone-900 mb-2 truncate group-hover:text-orange-600 transition">{product.title}</h3>
                </Link>
                <div className="flex justify-between items-center">
                  <span className="text-stone-800 font-bold">LKR {product.price.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">No art pieces found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

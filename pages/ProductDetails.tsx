
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, wishlist, toggleWishlist } = useAppContext();
  const navigate = useNavigate();

  const product = products.find(p => p.id === id);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-8 text-stone-500 hover:text-stone-900">
          <i className="fas fa-arrow-left mr-2"></i> Back to Shop
        </button>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="rounded-lg overflow-hidden shadow-lg bg-stone-50">
            <img src={product.imageUrl} alt={product.title} className="w-full h-auto object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm mb-2">{product.category}</span>
            <h1 className="text-4xl font-serif text-stone-900 mb-4">{product.title}</h1>
            <p className="text-2xl font-light text-stone-800 mb-6">LKR {product.price.toLocaleString()}</p>
            
            <p className="text-stone-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex gap-2 mb-8">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
               <button 
                  onClick={() => addToCart(product)}
                  className="flex-1 md:flex-none bg-stone-900 text-white px-8 py-4 rounded hover:bg-orange-600 transition duration-300 font-bold flex items-center justify-center gap-3"
                >
                  <i className="fas fa-shopping-bag"></i> Add to Cart
                </button>
                
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-6 py-4 border rounded-lg transition duration-300 ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <i className={`fas fa-heart ${isWishlisted ? 'animate-pulse' : ''}`}></i>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

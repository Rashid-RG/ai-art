import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, placeOrder, user } = useAppContext();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    placeOrder();
    alert('Order placed successfully! (Mock)');
    navigate('/');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <i className="fas fa-shopping-basket text-6xl text-stone-300 mb-4"></i>
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Your cart is empty</h2>
        <Link to="/shop" className="text-orange-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded shadow-sm flex gap-4 items-center">
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.category}</p>
                  <p className="font-bold text-stone-900 mt-1">LKR {item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-stone-600">Qty: {item.quantity}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-stone-600">
                <span>Subtotal</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4 text-stone-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-xl text-stone-900 mb-6">
                <span>Total</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

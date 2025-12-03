
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigate, Link } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, userOrders, wishlist, products, updateProfile, changePassword, logout, notify, addToCart, toggleWishlist } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'security'>('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: ''
  });

  const [emailError, setEmailError] = useState('');
  const [passData, setPassData] = useState({ current: '', newPass: '', confirm: '' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || ''
      });
      setEmailError('');
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(profileData.email)) {
      setEmailError('Please enter a valid email address.');
      notify('error', 'Validation failed.');
      return;
    }
    updateProfile({ ...user, ...profileData });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirm) {
      alert("Passwords don't match.");
      return;
    }
    const success = changePassword(passData.current, passData.newPass);
    if (success) setPassData({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden sticky top-24">
            <div className="bg-stone-900 px-6 py-6 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden bg-stone-700 mx-auto mb-3">
                <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-serif font-bold text-white">{user.name}</h2>
              <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mt-1">{user.role}</p>
            </div>
            
            <nav className="p-2 space-y-1">
              {['profile', 'orders', 'wishlist', 'security'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded transition capitalize ${activeTab === tab ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <i className={`fas fa-${tab === 'profile' ? 'user-cog' : tab === 'orders' ? 'box-open' : tab === 'wishlist' ? 'heart' : 'shield-alt'} w-5 text-center`}></i> {tab}
                </button>
              ))}
              <div className="border-t border-stone-100 my-1"></div>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded text-red-600 hover:bg-red-50 transition">
                <i className="fas fa-sign-out-alt w-5 text-center"></i> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">Personal Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1">Full Name</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1">Email</label>
                    <input type="email" value={profileData.email} onChange={e => {setProfileData({...profileData, email: e.target.value}); setEmailError('')}} className={`w-full border rounded px-3 py-2 focus:ring-2 outline-none ${emailError ? 'border-red-500' : 'border-stone-300 focus:ring-orange-500'}`}/>
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-stone-600 mb-1">Bio</label>
                   <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} rows={4} className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Tell us about yourself..."/>
                </div>
                <div>
                   <label className="block text-sm font-bold text-stone-600 mb-1">Avatar URL</label>
                   <input type="text" value={profileData.avatar} onChange={e => setProfileData({...profileData, avatar: e.target.value})} className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"/>
                </div>
                <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded hover:bg-orange-600 transition font-bold shadow-md">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
               <h2 className="text-2xl font-bold text-stone-900 mb-6">Order History</h2>
               {userOrders.length === 0 ? (
                 <div className="bg-white p-12 rounded-lg text-center border border-stone-100">
                   <p className="text-stone-500 mb-4">No orders yet.</p>
                   <Link to="/shop" className="text-orange-600 font-bold hover:underline">Browse Shop</Link>
                 </div>
               ) : (
                 userOrders.map(order => (
                   <div key={order.id} className="bg-white rounded-lg border border-stone-100 overflow-hidden">
                     <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase">Order Placed</p>
                          <p className="text-sm font-bold">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-stone-200 text-stone-700">{order.status}</span>
                     </div>
                     <div className="p-6">
                       {order.items.map((item, i) => (
                         <div key={i} className="flex items-center gap-4 mb-4 last:mb-0">
                            <img src={item.imageUrl} className="w-16 h-16 rounded object-cover" />
                            <div className="flex-1">
                              <h4 className="font-bold">{item.title}</h4>
                              <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-bold">LKR {item.price.toLocaleString()}</div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'wishlist' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">My Wishlist</h2>
                {wishlistedProducts.length === 0 ? (
                  <div className="bg-white p-12 rounded-lg text-center border border-stone-100">
                    <i className="fas fa-heart text-4xl text-stone-300 mb-4"></i>
                    <p className="text-stone-500 mb-4">Your wishlist is empty.</p>
                    <Link to="/shop" className="text-orange-600 font-bold hover:underline">Discover Art</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistedProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden group">
                        <div className="relative aspect-square">
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                          <button onClick={() => toggleWishlist(product.id)} className="absolute top-2 right-2 bg-white p-2 rounded-full text-red-500 shadow hover:scale-110 transition">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-stone-900 truncate">{product.title}</h3>
                          <p className="text-stone-500 text-sm mb-3">LKR {product.price.toLocaleString()}</p>
                          <button onClick={() => addToCart(product)} className="w-full bg-stone-900 text-white py-2 rounded text-sm font-bold hover:bg-orange-600 transition">Add to Cart</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-lg border border-stone-100 p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">Security</h2>
              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                <input type="password" required placeholder="Current Password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className="w-full border rounded px-3 py-2 outline-none focus:border-orange-500"/>
                <input type="password" required placeholder="New Password" value={passData.newPass} onChange={e => setPassData({...passData, newPass: e.target.value})} className="w-full border rounded px-3 py-2 outline-none focus:border-orange-500"/>
                <input type="password" required placeholder="Confirm New Password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} className="w-full border rounded px-3 py-2 outline-none focus:border-orange-500"/>
                <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded font-bold hover:bg-orange-700 transition">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

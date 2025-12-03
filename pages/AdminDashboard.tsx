
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, Product, Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { generateArtImage, generateProductDescription } from '../services/geminiService';

export const AdminDashboard: React.FC = () => {
  const { user, products, orders, allUsers, analyticsData, messages, addProduct, updateProduct, removeProduct, updateOrderStatus, deleteUser, clearNewOrderCount, notify, deleteMessage } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'orders' | 'users' | 'messages'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: '',
    tags: '',
    aiPricingDetails: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      clearNewOrderCount();
    }
  }, [activeTab, clearNewOrderCount]);

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-4">You need administrator privileges to view this page.</p>
        <button onClick={() => window.history.back()} className="text-orange-600 underline">Go Back</button>
      </div>
    );
  }

  const resetForm = () => {
    setNewProduct({ title: '', description: '', price: '', category: '', imageUrl: '', stock: '', tags: '', aiPricingDetails: '' });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setNewProduct({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock.toString(),
      tags: product.tags.join(', '),
      aiPricingDetails: product.aiPricingDetails || ''
    });
    setEditingId(product.id);
    setShowAddModal(true);
  };

  const handleGenerateImage = async () => {
    if (!newProduct.title && !newProduct.description) {
      notify('error', 'Please provide a Title or Description to generate an image.');
      return;
    }
    
    setIsGeneratingImage(true);
    const prompt = `High quality product image of art: ${newProduct.title}. ${newProduct.description}`;
    
    try {
      const generatedUrl = await generateArtImage(prompt);
      if (generatedUrl) {
        setNewProduct(prev => ({ ...prev, imageUrl: generatedUrl }));
        notify('success', 'Image generated successfully!');
      } else {
        notify('error', 'Failed to generate image. Please try again.');
      }
    } catch (e) {
      notify('error', 'Error generating image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!newProduct.title || !newProduct.category) {
      notify('error', 'Please provide a Title and Category to generate a description.');
      return;
    }
    
    setIsGeneratingDescription(true);
    try {
      const description = await generateProductDescription(newProduct.title, newProduct.category);
      if (description) {
        setNewProduct(prev => ({ ...prev, description }));
        notify('success', 'Description generated successfully!');
      } else {
        notify('error', 'Failed to generate description.');
      }
    } catch (e) {
      notify('error', 'Error generating description.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      title: newProduct.title,
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category,
      imageUrl: newProduct.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`,
      stock: Number(newProduct.stock),
      tags: newProduct.tags.split(',').map(t => t.trim()),
      aiPricingDetails: newProduct.aiPricingDetails
    };

    if (editingId) {
      updateProduct({ ...productData, id: editingId });
    } else {
      addProduct({ ...productData, id: `p-${Date.now()}` });
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const renderOrderStatusCell = (status: Order['status']) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(status);
    
    const statusConfig = {
        pending: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500', icon: 'fa-clock' },
        processing: { color: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-500', icon: 'fa-cogs' },
        shipped: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', bar: 'bg-indigo-500', icon: 'fa-shipping-fast' },
        delivered: { color: 'text-green-700 bg-green-50 border-green-200', bar: 'bg-green-500', icon: 'fa-check-circle' }
    };
    const config = statusConfig[status];

    return (
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${config.color}`}>
              <i className={`fas ${config.icon}`}></i> {status}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">{currentStepIndex + 1}/4</span>
        </div>
        <div className="flex gap-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          {steps.map((step, index) => (
            <div 
              key={step} 
              className={`flex-1 transition-all duration-500 ${index <= currentStepIndex ? config.bar : 'bg-stone-200 opacity-50'} ${index === currentStepIndex && status !== 'delivered' ? 'animate-pulse' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // --- TAB CONTENT RENDERERS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Revenue</p><p className="text-2xl font-bold text-stone-900 mt-1">LKR {orders.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}</p></div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><i className="fas fa-coins text-lg"></i></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Orders</p><p className="text-2xl font-bold text-stone-900 mt-1">{orders.length}</p></div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fas fa-shopping-bag text-lg"></i></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Users</p><p className="text-2xl font-bold text-stone-900 mt-1">{allUsers.length}</p></div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><i className="fas fa-users text-lg"></i></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-500 uppercase tracking-wider">New Messages</p><p className="text-2xl font-bold text-stone-900 mt-1">{messages.length}</p></div>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><i className="fas fa-envelope text-lg"></i></div>
        </div>
      </div>
    </div>
  );

  const renderRealTimeAnalytics = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
           <div className="relative"><span className="w-3 h-3 bg-red-500 rounded-full inline-block animate-ping absolute"></span><span className="w-3 h-3 bg-red-500 rounded-full inline-block relative"></span></div>
           <h2 className="text-xl font-bold text-stone-900">Live Traffic Monitor</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
              <h3 className="text-sm font-bold text-stone-500 uppercase mb-4">Real-Time Active Users</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs><linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={[0, 'auto']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeUsers" stroke="#ea580c" fillOpacity={1} fill="url(#colorUsers)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
        <h3 className="text-lg font-bold text-stone-800">User Management</h3>
        <span className="bg-white border border-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">{allUsers.length} Users</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-stone-400 text-xs uppercase font-bold border-b border-stone-100">
            <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Joined</th><th className="px-6 py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {allUsers.map(u => (
              <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3"><img src={u.avatar} className="w-10 h-10 rounded-full object-cover" /><div><p className="font-bold text-sm">{u.name}</p><p className="text-xs text-stone-500">{u.email}</p></div></td>
                <td className="px-6 py-4"><span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span></td>
                <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active</span></td>
                <td className="px-6 py-4 text-xs">{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'Unknown'}</td>
                <td className="px-6 py-4">{u.id !== user?.id && (<button onClick={() => { if(window.confirm(`Remove ${u.name}?`)) deleteUser(u.id); }} className="text-stone-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden animate-fade-in">
       <div className="p-6 border-b border-stone-100 bg-stone-50"><h3 className="text-lg font-bold text-stone-800">User Inquiries</h3></div>
       <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-stone-400 text-xs uppercase font-bold border-b border-stone-100">
            <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">From</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Message</th><th className="px-6 py-4">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
             {messages.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-400">No messages found.</td></tr> : messages.map(msg => (
               <tr key={msg.id} className="hover:bg-stone-50">
                 <td className="px-6 py-4 text-xs font-mono text-stone-500">{new Date(msg.date).toLocaleDateString()}</td>
                 <td className="px-6 py-4"><p className="text-sm font-bold">{msg.name}</p><p className="text-xs text-stone-500">{msg.email}</p></td>
                 <td className="px-6 py-4 text-sm font-medium">{msg.subject}</td>
                 <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">{msg.message}</td>
                 <td className="px-6 py-4"><button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash-alt"></i></button></td>
               </tr>
             ))}
          </tbody>
        </table>
       </div>
    </div>
  );

  const renderProducts = () => (
     <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="text-lg font-bold text-stone-800">Product Inventory</h3>
          <button onClick={openAddModal} className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-orange-600 transition text-sm font-bold shadow-md flex items-center gap-2"><i className="fas fa-plus"></i> Add Product</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-stone-400 text-xs uppercase font-bold border-b border-stone-100">
              <tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-stone-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3"><img src={p.imageUrl} className="w-12 h-12 rounded border border-stone-200 object-cover" /><div><p className="font-bold text-sm truncate max-w-[150px]">{p.title}</p><p className="text-xs text-stone-500">{p.category}</p></div></td>
                  <td className="px-6 py-4 font-bold text-sm">LKR {p.price.toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded ${p.stock < 3 ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600'}`}>{p.stock} Units</span></td>
                  <td className="px-6 py-4 flex gap-3"><button onClick={() => openEditModal(p)} className="text-stone-400 hover:text-blue-600"><i className="fas fa-edit"></i></button><button onClick={() => removeProduct(p.id)} className="text-stone-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-stone-100 bg-stone-50"><h3 className="text-lg font-bold text-stone-800">Order Management</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-stone-400 text-xs uppercase font-bold border-b border-stone-100">
            <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status & Progress</th><th className="px-6 py-4">Update</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-stone-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-stone-500">{order.id}</td>
                <td className="px-6 py-4 text-sm font-medium">User {order.userId.slice(0, 5)}...</td>
                <td className="px-6 py-4 font-bold text-sm">LKR {order.total.toLocaleString()}</td>
                <td className="px-6 py-4">{renderOrderStatusCell(order.status)}</td>
                <td className="px-6 py-4">
                  <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])} className="border border-stone-300 rounded text-xs px-2 py-1.5 bg-white cursor-pointer focus:border-orange-500 focus:outline-none">
                    <option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-stone-900">Admin Dashboard</h1>
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mt-4 md:mt-0 overflow-x-auto max-w-full">
            {(['overview', 'analytics', 'users', 'messages', 'products', 'orders'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition whitespace-nowrap ${activeTab === tab ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderRealTimeAnalytics()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && renderOrders()}
      </div>

       {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="text-xl font-bold font-serif text-stone-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-red-500 transition"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Title</label><input required type="text" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label><div className="relative"><textarea required rows={3} className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none pr-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} /><button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDescription} className="absolute right-2 bottom-2 bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200 hover:bg-purple-200 transition text-xs font-bold flex items-center gap-1">{isGeneratingDescription ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>} AI Write</button></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Price (LKR)</label><input required type="number" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div><div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Stock</label><input required type="number" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /></div></div>
               <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Category</label><select required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="">Select...</option><option value="Painting">Painting</option><option value="Sculpture">Sculpture</option><option value="Textile">Textile</option></select></div><div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Image URL</label><div className="flex gap-2"><input type="text" className="w-full border border-stone-300 rounded px-3 py-2 text-sm flex-1 focus:border-orange-500 focus:outline-none" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://..." /><button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} className="bg-purple-100 text-purple-700 px-3 py-2 rounded border border-purple-200 hover:bg-purple-200 transition text-xs font-bold whitespace-nowrap flex items-center gap-2" title="Generate using AI">{isGeneratingImage ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>} AI Gen</button></div></div></div>
                <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tags (comma separated)</label><input type="text" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" value={newProduct.tags} onChange={e => setNewProduct({...newProduct, tags: e.target.value})} placeholder="nature, blue, abstract" /></div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100"><label className="block text-xs font-bold text-purple-800 mb-1 uppercase tracking-wide"><i className="fas fa-robot mr-1"></i>AI Pricing Details (Optional)</label><input type="text" className="w-full border border-purple-200 rounded px-3 py-2 text-sm focus:border-purple-400 focus:outline-none" value={newProduct.aiPricingDetails} onChange={e => setNewProduct({...newProduct, aiPricingDetails: e.target.value})} placeholder="e.g. GPU Compute: LKR 500 + Generation Fee" /></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-stone-100 mt-4"><button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 font-bold text-sm transition">Cancel</button><button type="submit" className="px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-orange-600 font-bold text-sm transition shadow-lg">{editingId ? 'Update Product' : 'Save Product'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

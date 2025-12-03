
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Message } from '../types';

export const Contact: React.FC = () => {
  const { sendMessage } = useAppContext();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg: Message = {
      id: `msg-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toISOString(),
      read: false
    };
    sendMessage(msg);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center border border-stone-100 animate-fade-in-up">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
             <i className="fas fa-check"></i>
           </div>
           <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Message Sent!</h2>
           <p className="text-stone-600 mb-6">Thank you for contacting Artisha. Our team will get back to you shortly.</p>
           <button onClick={() => {setSubmitted(false); setFormData({name:'', email:'', subject:'', message:''})}} className="text-orange-600 font-bold hover:underline">Send another message</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Contact Us</h1>
           <p className="text-stone-600 max-w-2xl mx-auto">Have a question about an artwork or your order? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3"><i className="fas fa-map-marker-alt"></i></div>
                 <h3 className="font-bold text-stone-900 mb-1">Visit Us</h3>
                 <p className="text-sm text-stone-500">123 Art Street, Colombo 07, Sri Lanka</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3"><i className="fas fa-envelope"></i></div>
                 <h3 className="font-bold text-stone-900 mb-1">Email Us</h3>
                 <p className="text-sm text-stone-500">hello@artisha.lk</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3"><i className="fas fa-phone"></i></div>
                 <h3 className="font-bold text-stone-900 mb-1">Call Us</h3>
                 <p className="text-sm text-stone-500">+94 11 234 5678</p>
              </div>
           </div>

           <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-stone-100 space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-bold text-stone-600 mb-1">Name</label>
                       <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-stone-300 rounded px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Your Name" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-stone-600 mb-1">Email</label>
                       <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-stone-300 rounded px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="you@example.com" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1">Subject</label>
                    <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-stone-300 rounded px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="How can we help?" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1">Message</label>
                    <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border border-stone-300 rounded px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Write your message here..." />
                 </div>
                 <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded font-bold hover:bg-orange-600 transition shadow-lg">Send Message</button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

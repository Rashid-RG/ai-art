import React, { useState, useRef, useEffect } from 'react';
import { getSupportResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAppContext } from '../context/AppContext';

export const SupportBot: React.FC = () => {
  const { user, userOrders } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user ? user.name.split(' ')[0] : 'there'}! 👋 I am the Artisha Support Bot. How can I help you today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Typing Effect State
  const [displayMessage, setDisplayMessage] = useState<ChatMessage | null>(null);
  const [typedText, setTypedText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, typedText]);

  // Handle Typing Effect for the latest bot message
  useEffect(() => {
    if (displayMessage) {
      let i = 0;
      const text = displayMessage.text;
      setTypedText('');
      
      const intervalId = setInterval(() => {
        setTypedText((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
          // Commit the full message to history
          setMessages(prev => [...prev, displayMessage]);
          setDisplayMessage(null);
          setIsLoading(false);
        }
      }, 20); // Speed of typing

      return () => clearInterval(intervalId);
    }
  }, [displayMessage]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading || displayMessage) return;

    // Add User Message immediately
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Get AI Response with Context
    const responseText = await getSupportResponse(textToSend, user, userOrders);
    
    // Trigger Typing Effect
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setDisplayMessage(botMsg);
  };

  const quickActions = [
    "Where is my order?",
    "Shipping Policy",
    "Return Policy"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-stone-200 mb-4 animate-fade-in-up overflow-hidden">
          <div className="bg-stone-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Artisha Support</h3>
                <p className="text-[10px] text-stone-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-xs">
                    <i className="fas fa-robot text-stone-500"></i>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-orange-600 text-white rounded-tr-none' 
                    : 'bg-white border border-stone-100 text-stone-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator / Streaming Message */}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-xs">
                    <i className="fas fa-robot text-stone-500"></i>
                 </div>
                 {displayMessage ? (
                   <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm bg-white border border-stone-100 text-stone-800 rounded-tl-none">
                     {typedText}<span className="inline-block w-1 h-4 bg-stone-800 ml-1 align-middle animate-pulse"></span>
                   </div>
                 ) : (
                   <div className="bg-white border border-stone-200 p-2 rounded-xl rounded-tl-none shadow-sm flex gap-1 items-center px-3">
                     <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                 )}
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="bg-stone-50 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickActions.map(action => (
              <button 
                key={action}
                onClick={() => handleSend(action)}
                disabled={isLoading || !!displayMessage}
                className="whitespace-nowrap bg-white border border-stone-200 px-3 py-1 rounded-full text-xs text-stone-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                disabled={isLoading || !!displayMessage}
                className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !!displayMessage}
                className="bg-stone-900 text-white w-9 h-9 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-stone-900 transition flex items-center justify-center shadow-sm"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-stone-900 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 relative group"
      >
        <i className={`fas ${isOpen ? 'fa-chevron-down' : 'fa-comment-dots'} text-2xl`}></i>
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
        )}
      </button>
    </div>
  );
};
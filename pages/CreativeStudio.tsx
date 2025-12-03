import React, { useState, useRef, useEffect } from 'react';
import { generateArtDescription, generateArtImage } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const CreativeStudio: React.FC = () => {
  const { addToCart, notify } = useAppContext();
  const navigate = useNavigate();

  // Load from session storage if available
  const loadInitialMessages = () => {
    const saved = sessionStorage.getItem('artisha_studio_chat');
    if (saved) return JSON.parse(saved);
    return [{ 
      id: 'init', 
      role: 'model', 
      text: 'Welcome to the Creative Studio! I am your AI Art Consultant. Describe the artwork you imagine—style, colors, mood—and I will help you visualize it before we commission an artisan.', 
      timestamp: Date.now() 
    }];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Pricing Configuration
  const [config, setConfig] = useState({ size: '12x16', medium: 'Canvas Print' });
  const [estimatedPrice, setEstimatedPrice] = useState(8500);

  // Streaming/Typing State
  const [displayMessage, setDisplayMessage] = useState<ChatMessage | null>(null);
  const [typedText, setTypedText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typedText, isTyping]);

  // Persist Chat
  useEffect(() => {
    sessionStorage.setItem('artisha_studio_chat', JSON.stringify(messages));
  }, [messages]);

  // Handle Typing Effect
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
          // Commit the full message
          setMessages(prev => [...prev, displayMessage]);
          if (displayMessage.image) {
              setGeneratedImage(displayMessage.image);
          }
          setDisplayMessage(null);
          setIsTyping(false);
        }
      }, 15); // Faster typing for creative descriptions

      return () => clearInterval(intervalId);
    }
  }, [displayMessage]);

  // Update price when config changes
  useEffect(() => {
    let base = 8500;
    if (config.medium === 'Acrylic on Canvas') base = 18000;
    if (config.medium === 'Oil Painting') base = 25000;
    if (config.medium === 'Hand-embellished Print') base = 12000;

    let multiplier = 1;
    if (config.size === '18x24') multiplier = 1.4;
    if (config.size === '24x36') multiplier = 2.0;
    if (config.size === '30x40') multiplier = 2.5;

    setEstimatedPrice(Math.round(base * multiplier));
  }, [config]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || displayMessage) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Fetch Full Response
    const responseText = await generateArtDescription(input, history);
    
    let imageUri = undefined;
    if (responseText.includes("FINAL VISUALIZATION:") || messages.length > 2) {
       const promptForImage = responseText.includes("FINAL VISUALIZATION:") 
          ? responseText.split("FINAL VISUALIZATION:")[1] 
          : input;
       
       const img = await generateArtImage(promptForImage);
       if (img) {
         imageUri = img;
       }
    }

    const botMsg: ChatMessage = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: responseText, 
      image: imageUri,
      timestamp: Date.now() 
    };

    // Start Typing Effect
    setDisplayMessage(botMsg);
  };

  const handleCommission = () => {
    if (!generatedImage) return;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      title: `Custom Commission (${config.medium})`,
      description: `Custom artwork based on AI visualization. Size: ${config.size}. Medium: ${config.medium}.`,
      price: estimatedPrice,
      category: 'Commission',
      imageUrl: generatedImage,
      stock: 1,
      tags: ['custom', 'commission', 'ai-design']
    };

    addToCart(customProduct);
    notify('success', 'Custom commission added to cart!');
    navigate('/cart');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-stone-50 overflow-hidden">
      {/* Left: Chat Interface */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-stone-200 bg-white">
        <div className="p-4 border-b border-stone-100 bg-white shadow-sm z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-800"><i className="fas fa-magic text-purple-600 mr-2"></i>Creative Consultant</h2>
            <p className="text-xs text-stone-500">Refine your vision with AI</p>
          </div>
          <button onClick={() => {sessionStorage.removeItem('artisha_studio_chat'); window.location.reload()}} className="text-xs text-stone-400 hover:text-red-500">
             <i className="fas fa-trash-alt mr-1"></i> Reset
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-stone-900 text-white rounded-br-none' 
                  : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.image && (
                   <div className="mt-3 rounded overflow-hidden border border-stone-300">
                     <img src={msg.image} alt="AI Generated visualization" className="w-full h-auto" />
                     <p className="text-[10px] text-stone-500 p-1 bg-stone-50 text-center">AI Visualization Preview</p>
                   </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Area */}
          {isTyping && (
             <div className="flex justify-start">
               {displayMessage ? (
                  <div className="max-w-[85%] rounded-lg p-4 bg-white border border-stone-100 text-stone-800 rounded-bl-none shadow-sm">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {typedText}<span className="inline-block w-1.5 h-4 bg-purple-600 ml-1 align-middle animate-pulse"></span>
                    </p>
                  </div>
               ) : (
                  <div className="bg-stone-100 text-stone-500 text-xs px-4 py-2 rounded-lg rounded-bl-none animate-pulse flex items-center gap-2">
                    <i className="fas fa-paint-brush"></i> Designing concept...
                  </div>
               )}
             </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-100 bg-white">
          <div className="flex gap-2">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your idea (e.g., 'A watercolor painting of a peacock in rain...')"
              className="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none h-12 bg-stone-50"
              disabled={isTyping || !!displayMessage}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !!displayMessage}
              className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:bg-stone-300"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Visualization & Pricing Panel */}
      <div className="hidden md:flex md:w-1/2 bg-stone-900 items-center justify-center p-8 relative overflow-y-auto">
         {generatedImage ? (
           <div className="text-center animate-fade-in w-full max-w-md">
             <div className="bg-white p-2 shadow-2xl rounded-sm inline-block max-w-full mb-6 relative group">
               <img src={generatedImage} alt="Final Design" className="max-h-[45vh] object-contain" />
               <div className="absolute inset-0 border-4 border-white/10 pointer-events-none"></div>
             </div>
             
             <div className="bg-stone-800 p-6 rounded-lg text-left shadow-lg border border-stone-700">
               <h3 className="text-white font-serif text-xl mb-4 border-b border-stone-700 pb-2">Commission Details</h3>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                   <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">Medium</label>
                   <select 
                    value={config.medium}
                    onChange={(e) => setConfig({...config, medium: e.target.value})}
                    className="w-full bg-stone-900 text-white border border-stone-600 rounded px-2 py-2 text-sm focus:border-orange-500 focus:outline-none"
                   >
                     <option>Canvas Print</option>
                     <option>Hand-embellished Print</option>
                     <option>Acrylic on Canvas</option>
                     <option>Oil Painting</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">Size (Inches)</label>
                   <select 
                    value={config.size}
                    onChange={(e) => setConfig({...config, size: e.target.value})}
                    className="w-full bg-stone-900 text-white border border-stone-600 rounded px-2 py-2 text-sm focus:border-orange-500 focus:outline-none"
                   >
                     <option>12x16</option>
                     <option>18x24</option>
                     <option>24x36</option>
                     <option>30x40</option>
                   </select>
                 </div>
               </div>

               <div className="flex justify-between items-end mb-6">
                 <div>
                    <p className="text-xs text-stone-400">Estimated Price</p>
                    <p className="text-3xl font-bold text-white">LKR {estimatedPrice.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-stone-500 italic">*Includes artisan fee & delivery</p>
                 </div>
               </div>

               <button 
                onClick={handleCommission}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition font-bold flex items-center justify-center gap-2"
               >
                 <i className="fas fa-shopping-cart"></i> Order Commission
               </button>
             </div>
           </div>
         ) : (
           <div className="text-center text-stone-500">
             <div className="text-6xl mb-4 opacity-20"><i className="fas fa-palette"></i></div>
             <h3 className="text-xl font-serif text-stone-400 mb-2">Canvas Empty</h3>
             <p className="max-w-xs mx-auto text-sm">Chat with the consultant to generate a visualization of your custom art piece.</p>
           </div>
         )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, ChevronRight, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can we help you today at Holanbra?', sender: 'manager' }
  ]);
  const [input, setInput] = useState('');

  // Fetch real-time status from CasperLet API
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/casperlet/status');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setIsOnline(data.status === 'online');
      } catch (error) {
        console.error('Failed to fetch manager status:', error);
        // Fallback to offline on error
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages([...messages, { text: userMessage, sender: 'user' }]);
    setInput('');
    
    try {
      const response = await fetch('/api/sl/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          senderName: 'Website Visitor'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reach SL');
      }

      // Notification that it was sent
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: 'Your message was delivered to our manager in-world!', 
          sender: 'manager' 
        }]);
      }, 500);
    } catch (error) {
      console.error('Failed to send to SL:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, our manager is currently offline in Second Life. Please try again later or visit us in-world.', 
        sender: 'manager' 
      }]);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[350px] h-[500px] glass-card shadow-2xl flex flex-col overflow-hidden border-white/10"
          >
            {/* Header */}
            <div className="p-4 bg-amber-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                    <User className="text-white" />
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-amber-600",
                    isOnline ? "bg-yellow-400" : "bg-gray-400"
                  )}></div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Victoria Holanbra</h4>
                  <p className="text-amber-100/60 text-[8px] uppercase font-black tracking-widest">
                    {isOnline ? 'Online in SL' : 'Offline'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-dark/50">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed",
                  msg.sender === 'manager' 
                    ? "bg-amber-900/40 text-amber-100 self-start rounded-tl-none border border-amber-500/10" 
                    : "bg-amber-600 text-white self-end ml-auto rounded-tr-none shadow-lg shadow-amber-900/20"
                )}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-background-dark">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                />
                <button type="submit" className="p-2 bg-amber-600 rounded-full text-white hover:bg-amber-500 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 p-4 bg-amber-600 text-white rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] transition-all"
      >
        <MessageSquare size={24} />
        {/* Badge */}
        {isOnline && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-4 border-background-dark flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </span>
        )}
        <span className="max-w-0 overflow-hidden font-black text-[10px] uppercase tracking-widest whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out">
          Call in SL
        </span>
      </motion.button>
    </div>
  );
}

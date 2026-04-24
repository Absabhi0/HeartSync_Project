import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Partner', content: 'Hey! You there? 💖' },
    { id: 2, sender: 'Me', content: 'Always! Just got done with work. How are you doing?' },
    { id: 3, sender: 'Partner', content: 'Cant wait to see you!' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), sender: 'Me', content: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-white font-sans">
      
      {/* Sticky Top Header */}
      <nav className="sticky top-0 z-50 w-full flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black/50 border border-white/10"></div>
          </div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
            HeartSync Chat
          </h2>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="border border-white/20 text-gray-300 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          Back
        </button>
      </nav>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl ${
              msg.sender === 'Me' 
                ? 'bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/20 rounded-tr-sm' 
                : 'bg-white/10 backdrop-blur-md border border-white/5 text-gray-100 rounded-tl-sm'
            }`}>
              <p className="text-[15px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="fixed bottom-0 w-full p-4 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-full px-8 py-4 font-semibold shadow-lg transition-all active:scale-95"
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
};

export default Chat;
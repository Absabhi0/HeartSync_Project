import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'My messages', content: 'Hello partner! How are you doing?' },
    { sender: 'Partner\'s messages', content: 'I\'m good, thanks for asking! How about yourself?' },
    { sender: 'My messages', content: 'Just been working on a new project. What have you been up to lately?' },
  ]);
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: 'My messages', content: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-10 w-full flex justify-between items-center p-6 bg-white/[0.02] border-b border-white/10 backdrop-blur-md">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 tracking-tight">HeartSync Chat</h2>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="border border-white/20 text-gray-300 px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/10 hover:text-white hover:border-white/40 transition-all active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-20 px-4">
        
        <div className="w-full max-w-5xl overflow-y-scroll h-[calc(100vh-360px)] bg-white/[0.03] border border-white/10 rounded-3xl text-center backdrop-blur-xl flex flex-col gap-8">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end ${msg.sender === 'My messages' ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-[#0a0a0f] rounded-full p-4 text-white">
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Area */}
        <div className="fixed bottom-0 w-full bg-black/10 border-t border-white/10 backdrop-blur-md flex items-center justify-between px-6 py-4">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-black/20 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] transform transition-all active:scale-[0.98] text-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

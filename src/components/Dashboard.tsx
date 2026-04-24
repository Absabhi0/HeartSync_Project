import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#0f0a15] text-white flex flex-col items-center p-6 font-sans relative overflow-hidden">
      {/* Premium Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">HeartSync</h1>
          <button onClick={handleLogout} className="text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all">Logout</button>
        </header>

        <div className="space-y-6">
          {/* Main Chat Action Card */}
          <div 
            onClick={() => navigate('/chat')}
            className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-400 font-medium mb-1">Your Connection</p>
                <h2 className="text-2xl font-semibold italic">Message Partner</h2>
              </div>
              <div className="bg-rose-500 p-4 rounded-2xl group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pairing Status Card */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
            <p className="text-gray-400 text-sm mb-4 text-center italic">Invite your partner to sync hearts</p>
            <div className="flex gap-2">
              <input readOnly value="HS-SYNC-789" className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-1 text-center font-mono text-rose-300 outline-none" />
              <button className="bg-white/10 hover:bg-white/20 px-6 rounded-2xl transition-all">Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
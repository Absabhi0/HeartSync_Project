import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const Dashboard = () => {
  const [pairingCode] = useState('SYNC-' + Math.floor(1000 + Math.random() * 9000));
  const [partnerCode, setPartnerCode] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch logged-in user details
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="relative z-10 w-full flex justify-between items-center p-6 bg-white/[0.02] border-b border-white/10 backdrop-blur-md">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 tracking-tight">
            HeartSync
          </h2>
          <span className="text-xs text-gray-400 mt-1">{userEmail}</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="border border-white/20 text-gray-300 px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/10 hover:text-white hover:border-white/40 transition-all active:scale-95"
        >
          Log Out
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-20 px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Space</span></h1>
          <p className="text-gray-400">Share your code or enter your partner's code to sync your hearts.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl">
          
          {/* Card 1: Your Pairing Code */}
          <div className="w-full md:w-1/2 p-10 bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl text-center backdrop-blur-xl flex flex-col h-full justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Your Pairing Code</h3>
              <p className="text-sm text-gray-500 mb-8">Give this code to your partner so they can connect with you.</p>
            </div>
            
            <div className="bg-black/40 py-6 px-6 rounded-2xl border border-white/5 mb-8 shadow-inner">
              <p className="text-4xl font-mono font-bold tracking-widest text-rose-400">{pairingCode}</p>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(pairingCode);
                alert('Pairing code copied to clipboard! 💖');
              }}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-4 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all active:scale-95 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copy Code
            </button>
          </div>

          {/* Card 2: Connect with Partner */}
          <div className="w-full md:w-1/2 p-10 bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl text-center backdrop-blur-xl flex flex-col h-full justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Connect with Partner</h3>
              <p className="text-sm text-gray-500 mb-8">Have your partner's code? Enter it below to sync your accounts.</p>
            </div>
            
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(partnerCode) alert(`Syncing request sent to ${partnerCode}! 🔄`); 
              }} 
              className="flex flex-col gap-6 mb-2"
            >
              <input
                type="text"
                placeholder="e.g. SYNC-1234"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                className="w-full p-6 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 uppercase font-mono tracking-widest text-center text-2xl shadow-inner transition-all"
                required
                maxLength={9}
              />
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] transform transition-all active:scale-[0.98] text-lg mt-2 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Sync Connection
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
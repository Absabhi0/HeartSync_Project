import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-rose-50">
      {/* Floating Hearts for Auth Page */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
         {[...Array(10)].map((_, i) => (
           <div key={i} className="absolute animate-bounce" style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 2}s`
           }}>❤️</div>
         ))}
      </div>

      <div className="glass-card w-full max-w-md p-10 rounded-[40px] shadow-2xl relative z-10 border-2 border-rose-100">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-love text-rose-500 mb-2">HeartSync</h1>
          <p className="text-rose-400 font-bold uppercase tracking-widest text-sm">
            {isSignUp ? "Create Your Bond" : "Welcome Back, Lover"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border-2 border-rose-100 p-4 rounded-2xl focus:outline-none focus:border-rose-400 text-slate-700 transition-all shadow-inner"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Secret Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border-2 border-rose-100 p-4 rounded-2xl focus:outline-none focus:border-rose-400 text-slate-700 transition-all shadow-inner"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-rose-200 hover:scale-[1.02] transition-all active:scale-95"
          >
            {loading ? "Magic is happening..." : isSignUp ? "Sign Up 💞" : "Login ❤️"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-rose-500 font-semibold hover:underline decoration-rose-300"
          >
            {isSignUp ? "Already have a sync? Login" : "New here? Start your HeartSync"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
import React, { useState } from 'react';
import supabase from '../lib/supabase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Signup successful! Check your email to verify.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Login successful! Welcome to HeartSync.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white font-sans w-full px-4">
      
      {/* Premium Glassmorphism Card */}
      <div className="w-full max-w-md p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 tracking-tight">
            HeartSync
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {isSignUp ? 'Begin your exclusive journey' : 'Welcome back to your space'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all duration-300"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all duration-300"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-rose-600/20 transform transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Connection' : 'Log In')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-400 hover:text-rose-300 transition-colors text-sm font-medium"
            type="button"
          >
            {isSignUp ? 'Already paired? Log In here' : "Need a connection? Sign Up"}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-center text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
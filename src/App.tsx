import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

/* ============================================================
   TYPES
   ============================================================ */
interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  dob: string;
  mood: string;
  partner_id: string | null;
  invite_code: string;
  sync_start_date: string | null;
}
interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}
interface BucketItem {
  id: string;
  title: string;
  is_completed: boolean;
  author_id: string;
}

/* ============================================================
   BACKGROUND — Floating Hearts
   ============================================================ */
function Background() {
  const hearts = ['💗', '💕', '💖', '🩷', '💓', '💝', '❤️', '💞'];
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    emoji: hearts[i % hearts.length],
    left: `${(i * 7.3 + 3) % 100}%`,
    delay: `${(i * 1.7) % 10}s`,
    duration: `${10 + (i * 1.3) % 10}s`,
    size: `${1 + (i % 3) * 0.4}rem`,
  }));
  return (
    <div className="heart-bg">
      {items.map(h => (
        <div
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
          }}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   AUTH — Sliding Overlay Design
   ============================================================ */
function Auth() {
  // 'login' = overlay on right (sign-in form visible)
  // 'signup' = overlay on left (sign-up form visible)
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Shared form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Sign-up only
  const [username, setUsername]     = useState('');
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [dob, setDob]               = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleLogin = async () => {
    setError(''); setLoading(true);
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) setError(e.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!agreeTerms) { setError('Please agree to the terms.'); return; }
    setError(''); setLoading(true);
    const { data, error: e } = await supabase.auth.signUp({ email, password });
    if (e) { setError(e.message); setLoading(false); return; }
    if (data.user) {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase.from('profiles').insert({
        id: data.user.id,
        username, first_name: firstName, last_name: lastName, dob,
        invite_code: inviteCode, mood: '😊 Happy',
      });
      setInfo('Check your email to confirm your account! 💌');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // On mobile (<600px) the overlay hides and React controls which panel shows
  const isSignIn = mode === 'login';

  return (
    <div className="auth-page">
      {/* Floating particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: `${(i * 9.5 + 4) % 96}%`,
            bottom: 0,
            animationDuration: `${7 + (i * 0.8) % 7}s`,
            animationDelay: `${(i * 0.7) % 5}s`,
            fontSize: '1rem',
            opacity: 0,
            animation: `floatUp ${7 + (i * 0.8) % 7}s ${(i * 0.7) % 5}s linear infinite`,
            pointerEvents: 'none',
          }}
        >
          🌸
        </div>
      ))}

      <div className="auth-card">
        {/* ── SIGN IN PANEL (left half) ── */}
        <div
          className={`auth-panel auth-panel--signin ${!isSignIn ? 'covered' : ''} ${
            // mobile: hide if not current mode
            !isSignIn ? 'mobile-hidden' : ''
          }`}
        >
          <div className="auth-logo shimmer-text">HeartSync</div>
          <p className="auth-subtitle">Welcome back, love 💕</p>

          <div className="w-full space-y-3">
            <input
              className="input-love"
              type="email"
              placeholder="Email 📧"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input-love"
              type="password"
              placeholder="Password 🔒"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error  && isSignIn && <p className="text-red-400 text-xs mt-2 text-center animate-pulse">{error}</p>}
          {info   && isSignIn && <p className="text-green-500 text-xs mt-2 text-center">{info}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:scale-[1.03] btn-press transition-all duration-200 disabled:opacity-60"
          >
            {loading ? '✨ Loading...' : '💗 Sign In'}
          </button>

          <div className="flex items-center gap-3 my-3 w-full">
            <div className="flex-1 h-px bg-rose-100" />
            <span className="text-rose-300 text-xs">or</span>
            <div className="flex-1 h-px bg-rose-100" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-2.5 rounded-full border-2 border-rose-200 bg-white text-rose-600 font-semibold text-sm flex items-center justify-center gap-2 hover:border-rose-400 hover:bg-rose-50 btn-press transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.3 0 6.1 1.1 8.4 3.3l6.3-6.3C34.7 2.8 29.7.5 24 .5 14.7.5 6.9 6.1 3.3 14l7.4 5.8C12.5 13.2 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8c4.3-4 6.8-9.9 7.2-17z"/>
              <path fill="#FBBC05" d="M10.7 28.2A14.5 14.5 0 0 1 9.5 24c0-1.5.3-2.9.7-4.2L2.8 14C1 17.1 0 20.4 0 24s1 6.9 2.8 10l7.9-5.8z"/>
              <path fill="#34A853" d="M24 47.5c5.7 0 10.5-1.9 14-5.1l-7.4-5.8c-2 1.4-4.6 2.2-6.6 2.2-6.2 0-11.5-3.7-13.3-9.1L2.8 34c3.6 7.9 11.4 13.5 21.2 13.5z"/>
            </svg>
            Google
          </button>

          {/* Mobile-only toggle */}
          <p className="mt-4 text-rose-300 text-xs sm:hidden">
            Don&apos;t have an account?{' '}
            <button onClick={() => switchMode('signup')} className="text-rose-500 font-bold underline">Sign Up</button>
          </p>
        </div>

        {/* ── SIGN UP PANEL (right half) ── */}
        <div
          className={`auth-panel auth-panel--signup ${isSignIn ? 'covered' : ''} ${
            isSignIn ? 'mobile-hidden' : ''
          }`}
        >
          <div className="auth-logo shimmer-text">HeartSync</div>
          <p className="auth-subtitle">Start your love story 🌹</p>

          <div className="w-full space-y-2.5">
            <input
              className="input-love"
              placeholder="Username 💌"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="input-love"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                className="input-love"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <input
              className="input-love"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
            <input
              className="input-love"
              type="email"
              placeholder="Email 📧"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input-love"
              type="password"
              placeholder="Password 🔒"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label className="flex items-center gap-2 text-rose-400 text-xs cursor-pointer pl-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="accent-rose-500"
              />
              I agree to the Terms &amp; Conditions 💝
            </label>
          </div>

          {error && !isSignIn && <p className="text-red-400 text-xs mt-2 text-center animate-pulse">{error}</p>}
          {info  && !isSignIn && <p className="text-green-500 text-xs mt-2 text-center">{info}</p>}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:scale-[1.03] btn-press transition-all duration-200 disabled:opacity-60"
          >
            {loading ? '✨ Loading...' : '🌹 Create Account'}
          </button>

          {/* Mobile-only toggle */}
          <p className="mt-4 text-rose-300 text-xs sm:hidden">
            Already have an account?{' '}
            <button onClick={() => switchMode('login')} className="text-rose-500 font-bold underline">Sign In</button>
          </p>
        </div>

        {/* ── SLIDING OVERLAY PANEL ── */}
        <div className={`auth-overlay ${mode === 'signup' ? 'overlay-left' : ''}`}>
          {mode === 'login' ? (
            // Overlay is on the right → prompts to switch to sign up
            <>
              <span className="auth-overlay-heart">💗</span>
              <p className="auth-overlay-title">Hello, Friend!</p>
              <p className="auth-overlay-text">
                Start your journey with us and find your perfect sync 🌹
              </p>
              <button className="auth-overlay-btn" onClick={() => switchMode('signup')}>
                Sign Up
              </button>
            </>
          ) : (
            // Overlay is on the left → prompts to switch to sign in
            <>
              <span className="auth-overlay-heart">💕</span>
              <p className="auth-overlay-title">Welcome Back!</p>
              <p className="auth-overlay-text">
                Please login to your account to continue your love story 💌
              </p>
              <button className="auth-overlay-btn" onClick={() => switchMode('login')}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS MODAL
   ============================================================ */
function SettingsModal({ profile, onClose }: { profile: Profile | null; onClose: () => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card cute-shadow rounded-[28px] w-full max-w-sm mx-4 p-7 modal-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">⚙️</div>
          <h2 className="text-2xl font-bold text-rose-600" style={{ fontFamily: 'var(--font-love)' }}>
            Settings
          </h2>
        </div>

        {profile && (
          <div className="bg-rose-50 rounded-2xl p-4 mb-5 space-y-1">
            <p className="text-rose-700 font-bold text-lg">@{profile.username}</p>
            <p className="text-rose-400 text-sm">{profile.first_name} {profile.last_name}</p>
            {profile.dob && (
              <p className="text-rose-300 text-xs">
                🎂 {new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <div className="mt-2 pt-2 border-t border-rose-100">
              <p className="text-rose-400 text-xs">Invite Code</p>
              <p className="font-digital text-rose-600 font-bold tracking-widest">{profile.invite_code}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg hover:scale-[1.03] btn-press transition-all duration-200"
        >
          🚪 Sign Out
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 rounded-full border-2 border-rose-200 text-rose-400 text-sm font-semibold hover:border-rose-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   NAVBAR — centered column
   ============================================================ */
function Navbar({ profile, onSettingsOpen }: { profile: Profile | null; onSettingsOpen: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="navbar-outer">
      <nav className="navbar-glass">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-bold text-rose-500 hover:scale-105 transition-transform"
          style={{ fontFamily: 'var(--font-love)' }}
        >
          💗 HeartSync
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-100 btn-press transition-all duration-150"
          >
            💬 Chat
          </button>
          {profile && (
            <span className="hidden sm:block text-rose-400 text-sm font-medium max-w-[100px] truncate">
              @{profile.username}
            </span>
          )}
          <button
            onClick={onSettingsOpen}
            className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-100 btn-press transition-all duration-200 text-base"
            style={{ transition: 'transform 0.3s ease, background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(45deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
          >
            ⚙️
          </button>
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   SYNC TIMER
   ============================================================ */
function SyncTimer({ syncStart }: { syncStart: string | null }) {
  const [elapsed, setElapsed] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!syncStart) return;
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date(syncStart).getTime());
      const s = Math.floor(diff / 1000);
      setElapsed({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [syncStart]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { label: 'Days', val: elapsed.d },
    { label: 'Hrs',  val: elapsed.h },
    { label: 'Min',  val: elapsed.m },
    { label: 'Sec',  val: elapsed.s },
  ];

  return (
    <div className="glass-card cute-shadow rounded-3xl p-6 timer-glow text-center">
      <p className="text-rose-400 font-semibold text-sm mb-3">💞 Together Since</p>
      {syncStart ? (
        <div className="flex justify-center gap-4">
          {units.map(u => (
            <div key={u.label} className="flex flex-col items-center">
              <span className="font-digital text-3xl font-bold text-rose-600 leading-none">{pad(u.val)}</span>
              <span className="text-rose-300 text-xs mt-1">{u.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-rose-300 text-sm">Link with your partner to start the timer 💌</p>
      )}
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile]             = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [bucketList, setBucketList]       = useState<BucketItem[]>([]);
  const [newBucket, setNewBucket]         = useState('');
  const [partnerCode, setPartnerCode]     = useState('');
  const [settingsOpen, setSettingsOpen]   = useState(false);
  const [hugSent, setHugSent]             = useState(false);
  const [hugReceived, setHugReceived]     = useState(false);
  const [userId, setUserId]               = useState<string | null>(null);

  const MOODS = ['😊 Happy','🥰 In Love','😴 Sleepy','😤 Grumpy','🥺 Missing You','🎉 Excited','😌 Content','😢 Sad'];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);

      const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (p) {
        setProfile(p);
        if (p.partner_id) {
          const { data: pp } = await supabase.from('profiles').select('*').eq('id', p.partner_id).single();
          if (pp) setPartnerProfile(pp);
        }
      }

      const { data: bl } = await supabase.from('bucket_list').select('*').order('created_at', { ascending: false });
      if (bl) setBucketList(bl);
    };
    init();
  }, []);

  // Virtual Hug receive
  useEffect(() => {
    const channel = supabase.channel('system_events');
    channel.on('broadcast', { event: 'nudge' }, () => {
      setHugReceived(true);
      setTimeout(() => setHugReceived(false), 3500);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Partner realtime mood
  useEffect(() => {
    if (!profile?.partner_id) return;
    const sub = supabase.channel('partner-profile')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.partner_id}` },
        payload => setPartnerProfile(prev => prev ? { ...prev, ...payload.new } : null),
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [profile?.partner_id]);

  const sendHug = async () => {
    await supabase.channel('system_events').send({ type: 'broadcast', event: 'nudge', payload: {} });
    setHugSent(true);
    setTimeout(() => setHugSent(false), 2500);
  };

  const setMood = async (mood: string) => {
    if (!userId) return;
    await supabase.from('profiles').update({ mood }).eq('id', userId);
    setProfile(prev => prev ? { ...prev, mood } : null);
  };

  const addBucket = async () => {
    if (!newBucket.trim() || !userId) return;
    const { data } = await supabase
      .from('bucket_list')
      .insert({ title: newBucket.trim(), author_id: userId, is_completed: false })
      .select()
      .single();
    if (data) setBucketList(prev => [data, ...prev]);
    setNewBucket('');
  };

  const toggleBucket = async (item: BucketItem) => {
    const updated = !item.is_completed;
    await supabase.from('bucket_list').update({ is_completed: updated }).eq('id', item.id);
    setBucketList(prev => prev.map(b => b.id === item.id ? { ...b, is_completed: updated } : b));
  };

  const linkPartner = async () => {
    if (!partnerCode.trim() || !userId) return;
    const { data: partner } = await supabase.from('profiles').select('*').ilike('invite_code', partnerCode.trim()).single();
    if (!partner) { alert('No partner found with that code 💔'); return; }
    const now = new Date().toISOString();
    await supabase.from('profiles').update({ partner_id: partner.id, sync_start_date: now }).eq('id', userId);
    await supabase.from('profiles').update({ partner_id: userId, sync_start_date: now }).eq('id', partner.id);
    setProfile(prev => prev ? { ...prev, partner_id: partner.id, sync_start_date: now } : null);
    setPartnerProfile(partner);
    setPartnerCode('');
  };

  return (
    <>
      <Navbar profile={profile} onSettingsOpen={() => setSettingsOpen(true)} />
      {settingsOpen && <SettingsModal profile={profile} onClose={() => setSettingsOpen(false)} />}

      {/* Virtual Hug Overlay */}
      {hugReceived && (
        <div className="heartbeat-overlay">
          <div className="animate-explosive-heartbeat text-8xl mb-4">💗</div>
          <p className="text-rose-600 font-bold text-2xl" style={{ fontFamily: 'var(--font-love)' }}>
            Virtual Hug!
          </p>
          <p className="text-rose-400 mt-1">
            {partnerProfile?.first_name || 'Your partner'} sent you love 🥰
          </p>
        </div>
      )}

      {/* Centered page content */}
      <div className="min-h-screen pt-20 pb-10 relative z-10">
        <div className="app-wrapper">
          <div className="space-y-5">

            {/* Partner Sync Banner */}
            {!profile?.partner_id ? (
              <div className="glass-card cute-shadow rounded-3xl p-6">
                <h3 className="text-rose-500 font-bold text-lg mb-1">🔗 Link Your Partner</h3>
                <p className="text-rose-300 text-sm mb-4">Share your code or enter theirs to connect 💌</p>
                {profile?.invite_code && (
                  <div className="bg-rose-50 rounded-2xl p-3 mb-4 text-center">
                    <p className="text-rose-400 text-xs mb-1">Your Invite Code</p>
                    <p className="font-digital text-rose-600 text-2xl tracking-widest font-bold">
                      {profile.invite_code}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className="input-love flex-1"
                    placeholder="Enter partner's code..."
                    value={partnerCode}
                    onChange={e => setPartnerCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && linkPartner()}
                  />
                  <button
                    onClick={linkPartner}
                    className="px-5 py-2 rounded-full bg-rose-500 text-white font-bold hover:bg-rose-600 btn-press transition-all"
                  >
                    Connect 💞
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card cute-shadow rounded-3xl p-5 flex items-center gap-4">
                <div className="text-4xl">💑</div>
                <div className="flex-1">
                  <p className="text-rose-600 font-bold">
                    Synced with {partnerProfile?.first_name || 'your love'} 💗
                  </p>
                  <p className="text-rose-400 text-sm">{partnerProfile?.mood || '...'}</p>
                </div>
              </div>
            )}

            {/* Sync Timer */}
            <SyncTimer syncStart={profile?.sync_start_date ?? null} />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="glass-card cute-shadow rounded-3xl p-6 flex flex-col items-center gap-2 hover-jelly btn-press border border-transparent hover:border-rose-300 transition-all duration-200 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">💬</span>
                <span className="text-rose-600 font-bold text-sm">Private Chat</span>
              </button>
              <button
                onClick={sendHug}
                disabled={hugSent}
                className="glass-card cute-shadow rounded-3xl p-6 flex flex-col items-center gap-2 hover-jelly btn-press border border-transparent hover:border-rose-300 transition-all duration-200 group disabled:opacity-70"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {hugSent ? '💌' : '🤗'}
                </span>
                <span className="text-rose-600 font-bold text-sm">
                  {hugSent ? 'Hug Sent!' : 'Virtual Hug'}
                </span>
              </button>
            </div>

            {/* Mood Picker */}
            <div className="glass-card cute-shadow rounded-3xl p-6">
              <h3 className="text-rose-500 font-bold text-lg mb-4">💭 How are you feeling?</h3>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`rounded-2xl py-2 px-1 text-xs font-semibold transition-all duration-200 btn-press hover-jelly ${
                      profile?.mood === m
                        ? 'bg-rose-500 text-white shadow-lg scale-105'
                        : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Bucket List */}
            <div className="glass-card cute-shadow rounded-3xl p-6">
              <h3 className="text-rose-500 font-bold text-lg mb-4">🪣 Our Bucket List</h3>
              <div className="flex gap-2 mb-4">
                <input
                  className="input-love flex-1"
                  placeholder="Add a dream together... 🌙"
                  value={newBucket}
                  onChange={e => setNewBucket(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addBucket()}
                />
                <button
                  onClick={addBucket}
                  className="px-4 py-2 rounded-full bg-rose-500 text-white font-bold hover:bg-rose-600 btn-press transition-all"
                >
                  +
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bucketList.length === 0 && (
                  <p className="text-rose-300 text-sm text-center py-4">No dreams yet... add one! 💭</p>
                )}
                {bucketList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleBucket(item)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover-jelly ${
                      item.is_completed ? 'bg-green-50 border border-green-200' : 'bg-rose-50 hover:bg-rose-100'
                    }`}
                  >
                    <span className="text-lg">{item.is_completed ? '✅' : '🌸'}</span>
                    <span className={`text-sm font-medium ${item.is_completed ? 'line-through text-gray-400' : 'text-rose-600'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CHAT UI — WhatsApp style, centered column
   ============================================================ */
function ChatUI() {
  const navigate = useNavigate();
  const [messages, setMessages]       = useState<Message[]>([]);
  const [newMsg, setNewMsg]           = useState('');
  const [userId, setUserId]           = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      const uid = session.user.id;
      setUserId(uid);

      const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (p) {
        setProfile(p);
        if (p.partner_id) {
          const { data: pp } = await supabase.from('profiles').select('first_name').eq('id', p.partner_id).single();
          if (pp) setPartnerName(pp.first_name);
        }
      }

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (msgs) setMessages(msgs);
    };
    init();
  }, [navigate]);

  // Realtime subscription — logic unchanged
  useEffect(() => {
    const channel = supabase.channel('chat-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new as Message;
        setMessages(prev => [...prev, msg]);
        if (msg.sender_id !== userId) setIsTyping(false);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing broadcast
  useEffect(() => {
    const channel = supabase.channel('typing_events');
    channel.on('broadcast', { event: 'typing' }, payload => {
      if (payload.payload?.sender !== userId) {
        setIsTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const broadcastTyping = useCallback(async () => {
    await supabase.channel('typing_events').send({
      type: 'broadcast', event: 'typing', payload: { sender: userId },
    });
  }, [userId]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !userId) return;
    const content = newMsg.trim();
    setNewMsg('');
    await supabase.from('messages').insert({ content, sender_id: userId });
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <Navbar profile={profile} onSettingsOpen={() => setSettingsOpen(true)} />
      {settingsOpen && <SettingsModal profile={profile} onClose={() => setSettingsOpen(false)} />}

      {/* Centered chat column */}
      <div className="chat-outer" style={{ paddingTop: '64px' }}>
        <div className="chat-inner">

          {/* Chat sub-header */}
          <div className="chat-header">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-rose-400 hover:text-rose-600 text-xl btn-press mr-1"
            >
              ←
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {partnerName ? partnerName[0].toUpperCase() : '💗'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-rose-700 font-bold text-sm truncate">{partnerName || 'Your Love'}</p>
              <p className="text-rose-400 text-xs">
                {isTyping ? '✍️ typing...' : '💗 HeartSync Chat'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 chat-scroll">
            {messages.map(msg => {
              const isMine = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} bubble-enter`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 shadow-sm ${
                      isMine
                        ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-[18px] rounded-br-[4px]'
                        : 'bg-white text-rose-800 border border-rose-100 rounded-[18px] rounded-bl-[4px]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-0.5 ${isMine ? 'text-rose-200' : 'text-rose-300'} text-right`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start bubble-enter">
                <div className="bg-white border border-rose-100 rounded-[18px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="chat-input-bar">
            <input
              className="input-love flex-1 text-sm"
              placeholder="Type something sweet... 💌"
              value={newMsg}
              onChange={e => { setNewMsg(e.target.value); broadcastTyping(); }}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:scale-105 btn-press disabled:opacity-50 transition-all text-lg"
            >
              💗
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
function AppInner() {
  const [session, setSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(!!s);
      if (s && window.location.pathname === '/') navigate('/dashboard');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
      if (s) { if (window.location.pathname === '/') navigate('/dashboard'); }
      else navigate('/');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (session === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-rose-400 text-4xl" style={{ animation: 'heartPulse 1.2s ease-in-out infinite' }}>
          💗
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/"          element={session ? null    : <Auth />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Auth />} />
      <Route path="/chat"      element={session ? <ChatUI />    : <Auth />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Background />
      <AppInner />
    </BrowserRouter>
  );
}

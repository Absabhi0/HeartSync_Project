// ============================================================
// HeartSync · App.tsx
// Unified React + TypeScript + Tailwind v4 + Supabase
// All components live here by design.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { supabase } from './lib/supabase';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type Profile = {
  id: string;
  partner_id: string | null;
  invite_code: string | null;
  mood: string | null;
  sync_start_date: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
};

type Message = {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
};

type BucketItem = {
  id: string;
  created_at: string;
  title: string;
  is_completed: boolean;
  author_id: string;
};

// ------------------------------------------------------------
// Mood Options
// ------------------------------------------------------------
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'In Love' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🤗', label: 'Missing You' },
  { emoji: '😴', label: 'Sleepy' },
  { emoji: '🥺', label: 'Needy' },
  { emoji: '🔥', label: 'Excited' },
  { emoji: '😢', label: 'Sad' },
];

// ============================================================
// Background · Floating Hearts
// ============================================================
function Background() {
  const hearts = useMemo(() => {
    const shapes = ['❤', '💕', '💖', '💗', '💘', '🌸', '✿'];
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 30,
      dur: 14 + Math.random() * 16,
      delay: Math.random() * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
  }, []);

  return (
    <div className="heart-bg" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.shape}
        </span>
      ))}
    </div>
  );
}

// ============================================================
// Logo Mark
// ============================================================
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full cute-shadow"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #ff9ebd 0%, #f43f72 60%, #e11d5a 100%)',
      }}
    >
      <span style={{ fontSize: size * 0.55 }}>💞</span>
      <span className="pulse-ring" />
    </div>
  );
}

// ============================================================
// Navbar · Global top navigation
// ============================================================
function Navbar({
  profile,
  onOpenSettings,
}: {
  profile: Profile | null;
  onOpenSettings: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const onChat = location.pathname.startsWith('/chat');

  const displayName =
    profile?.username ||
    profile?.first_name ||
    (profile?.id ? `user_${profile.id.slice(0, 6)}` : '...');

  return (
    <header
      className="navbar-safe fixed top-0 left-0 right-0 z-40 glass-strong soft-border"
      style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 hover-jelly"
          aria-label="HeartSync home"
        >
          <LogoMark size={38} />
          <span className="font-love text-2xl md:text-3xl gradient-text leading-none">
            HeartSync
          </span>
        </button>

        {/* Right cluster */}
        <nav className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate(onChat ? '/dashboard' : '/chat')}
            className="btn-press hover-jelly flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-white font-semibold text-sm md:text-base cute-shadow"
            style={{
              background: 'linear-gradient(135deg, #f43f72 0%, #e11d5a 100%)',
            }}
          >
            <span>{onChat ? '🏠' : '💬'}</span>
            <span className="hidden sm:inline">{onChat ? 'Dashboard' : 'Chat'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card soft-border">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-sm font-semibold text-rose-700 max-w-[160px] truncate">
              @{displayName}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="btn-press hover-jelly w-11 h-11 rounded-full glass-card soft-border flex items-center justify-center text-rose-600 hover:text-rose-700"
          >
            <GearIcon />
          </button>
        </nav>
      </div>

      {/* Mobile username line */}
      <div className="md:hidden px-4 pb-2 -mt-1 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-xs font-semibold text-rose-700">@{displayName}</span>
      </div>
    </header>
  );
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ============================================================
// Settings Modal · contains Logout
// ============================================================
function SettingsModal({
  open,
  onClose,
  profile,
  onProfileChange,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileChange: (p: Profile) => void;
}) {
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUsername(profile?.username || '');
  }, [profile?.username]);

  if (!open) return null;

  const saveUsername = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage('');
    const { data, error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', profile.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      setMessage(`Save failed: ${error.message}`);
      return;
    }
    if (data) onProfileChange(data as Profile);
    setMessage('✨ Saved!');
    setTimeout(() => setMessage(''), 1800);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-strong cute-shadow-lg soft-border rounded-[28px] w-[92vw] max-w-md p-7 md:p-8 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <h2 className="font-love text-3xl gradient-text">Settings</h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-card soft-border flex items-center justify-center text-rose-600 hover-jelly"
          >
            ✕
          </button>
        </div>

        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-rose-700 mb-1.5">
              Username
            </label>
            <input
              className="rose-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_lovely_name"
            />
          </div>

          <button
            onClick={saveUsername}
            disabled={saving}
            className="btn-press hover-jelly w-full py-3 rounded-2xl text-white font-bold cute-shadow"
            style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {message && (
            <p className="text-center text-sm text-rose-700 font-semibold">{message}</p>
          )}

          <div className="border-t border-rose-100 my-5" />

          <div className="rounded-2xl p-4 glass-card soft-border">
            <p className="text-sm text-rose-800 font-semibold mb-1">Account</p>
            <p className="text-xs text-rose-500 break-all">
              ID: <span className="font-mono">{profile?.id || '—'}</span>
            </p>
            {profile?.invite_code && (
              <p className="text-xs text-rose-500 mt-1">
                Invite code: <span className="font-mono font-bold">{profile.invite_code}</span>
              </p>
            )}
          </div>

          <button
            onClick={logout}
            className="btn-press hover-jelly w-full py-3 rounded-2xl font-bold text-rose-700 border-2 border-rose-300 bg-white/80 hover:bg-rose-50 transition"
          >
            🚪 Log Out
          </button>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// Hugging Hearts · Post-Sync Overlay
// ============================================================
function HuggingHearts({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparkles = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    left: 30 + Math.random() * 40,
    top: 30 + Math.random() * 30,
    delay: 1.2 + Math.random() * 1.2,
    emoji: ['✨', '💫', '💖', '🌟'][i % 4],
  }));

  return (
    <div className="hug-overlay" role="dialog" aria-label="Partner linked">
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="hug-heart left">💖</span>
        <span className="hug-heart right">💗</span>
        {sparkles.map((s) => (
          <span
            key={s.id}
            className="hug-sparkle"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
            }}
          >
            {s.emoji}
          </span>
        ))}
        <div className="hug-caption">
          You&apos;re linked! <br />
          <span style={{ fontSize: 22, fontFamily: 'var(--font-main)', fontWeight: 600 }}>
            Two hearts, one sync 💞
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Auth · Sliding Door
// ============================================================
function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [lEmail, setLEmail] = useState('');
  const [lPassword, setLPassword] = useState('');

  // Signup fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: lEmail,
      password: lPassword,
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agree) {
      setError('Please accept the Terms to continue.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: sEmail,
      password: sPassword,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          dob,
        },
      },
    });
    if (!error && data.user) {
      // Seed profile row (safe if RLS off; ignored if exists via on conflict trigger)
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          username,
          first_name: firstName,
          last_name: lastName,
          dob: dob || null,
        },
        { onConflict: 'id' },
      );
    }
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md relative animate-fade-up">
        {/* Brand header (always above the sliding door) */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <LogoMark size={72} />
          </div>
          <h1 className="font-love text-5xl md:text-6xl gradient-text leading-tight">
            HeartSync
          </h1>
          <p className="font-main text-rose-700/80 mt-2 text-base md:text-lg">
            {mode === 'login'
              ? 'Welcome back, lovebird 💕'
              : 'Begin your love story today 💞'}
          </p>
        </div>

        {/* Sliding Door Card */}
        <div className="glass-strong cute-shadow-lg soft-border rounded-[28px] p-1.5">
          <div className="door-wrap">
            <div className={`door-track ${mode === 'login' ? 'door-login' : 'door-signup'}`}>
              {/* LOGIN PANEL */}
              <div className="door-panel p-6 md:p-7">
                <form onSubmit={handleLogin} className="space-y-4">
                  <h2 className="font-script text-3xl text-rose-600 text-center mb-1">
                    Sign In
                  </h2>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="rose-input"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="rose-input"
                    value={lPassword}
                    onChange={(e) => setLPassword(e.target.value)}
                  />
                  {error && mode === 'login' && (
                    <p className="text-sm text-rose-600 text-center font-semibold">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-press hover-jelly w-full py-3.5 rounded-2xl text-white font-bold text-lg cute-shadow"
                    style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
                  >
                    {loading ? 'Loading…' : 'Log In 💖'}
                  </button>

                  <GoogleDivider />

                  <button
                    type="button"
                    onClick={handleGoogle}
                    className="btn-press hover-jelly w-full py-3 rounded-2xl font-semibold bg-white border-2 border-rose-200 hover:border-rose-300 transition flex items-center justify-center gap-2"
                  >
                    <GoogleIcon /> Continue with Google
                  </button>

                  <p className="text-center text-sm text-rose-700 mt-2">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setMode('signup');
                      }}
                      className="font-bold underline decoration-rose-300 hover:text-rose-600"
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              </div>

              {/* SIGNUP PANEL */}
              <div className="door-panel p-6 md:p-7">
                <form onSubmit={handleSignup} className="space-y-3">
                  <h2 className="font-script text-3xl text-rose-600 text-center mb-1">
                    Create Account
                  </h2>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    className="rose-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      className="rose-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      className="rose-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <input
                    type="date"
                    className="rose-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="rose-input"
                    value={sEmail}
                    onChange={(e) => setSEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="rose-input"
                    value={sPassword}
                    onChange={(e) => setSPassword(e.target.value)}
                  />
                  <label className="flex items-start gap-2 text-sm text-rose-700/80 px-1">
                    <input
                      type="checkbox"
                      className="mt-1 accent-rose-500"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span>I agree to the Terms & sweet conditions 💌</span>
                  </label>
                  {error && mode === 'signup' && (
                    <p className="text-sm text-rose-600 text-center font-semibold">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-press hover-jelly w-full py-3.5 rounded-2xl text-white font-bold text-lg cute-shadow"
                    style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
                  >
                    {loading ? 'Loading…' : 'Sign Up 💞'}
                  </button>

                  <p className="text-center text-sm text-rose-700 mt-2">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setMode('login');
                      }}
                      className="font-bold underline decoration-rose-300 hover:text-rose-600"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px bg-rose-200 flex-1" />
      <span className="text-xs text-rose-500 font-semibold">or</span>
      <div className="h-px bg-rose-200 flex-1" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

// ============================================================
// Sync Timer Hook — ticks every second
// ============================================================
function useSyncTimer(startIso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startIso]);

  return useMemo(() => {
    if (!startIso) return null;
    const start = new Date(startIso).getTime();
    const diff = Math.max(0, now - start);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }, [now, startIso]);
}

// ============================================================
// Dashboard
// ============================================================
function Dashboard({
  userId,
  profile,
  onProfileChange,
  onSyncSuccess,
}: {
  userId: string;
  profile: Profile | null;
  onProfileChange: (p: Profile) => void;
  onSyncSuccess: () => void;
}) {
  const navigate = useNavigate();
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [inviteInput, setInviteInput] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [bucket, setBucket] = useState<BucketItem[]>([]);
  const [newBucket, setNewBucket] = useState('');
  const [hugIncoming, setHugIncoming] = useState(false);
  const [hugCooldown, setHugCooldown] = useState(false);

  const timer = useSyncTimer(profile?.sync_start_date);
  const linked = Boolean(profile?.partner_id);

  // Load partner profile
  useEffect(() => {
    if (!profile?.partner_id) {
      setPartnerProfile(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .single();
      if (data) setPartnerProfile(data as Profile);
    })();
  }, [profile?.partner_id]);

  // Subscribe to partner's mood updates in realtime
  useEffect(() => {
    if (!profile?.partner_id) return;
    const channel = supabase
      .channel(`partner-${profile.partner_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.partner_id}`,
        },
        (payload) => {
          setPartnerProfile(payload.new as Profile);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.partner_id]);

  // Listen for incoming virtual hug
  useEffect(() => {
    const channel = supabase.channel('system_events');
    channel
      .on('broadcast', { event: 'nudge' }, (payload) => {
        const toId = (payload?.payload as any)?.to;
        if (toId === userId) {
          setHugIncoming(true);
          setTimeout(() => setHugIncoming(false), 2200);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Load bucket list
  useEffect(() => {
    (async () => {
      const ids = [userId, profile?.partner_id].filter(Boolean) as string[];
      if (ids.length === 0) return;
      const { data } = await supabase
        .from('bucket_list')
        .select('*')
        .in('author_id', ids)
        .order('created_at', { ascending: false });
      if (data) setBucket(data as BucketItem[]);
    })();
  }, [userId, profile?.partner_id]);

  // Update mood
  const setMood = async (m: string) => {
    if (!profile) return;
    const { data } = await supabase
      .from('profiles')
      .update({ mood: m })
      .eq('id', profile.id)
      .select()
      .single();
    if (data) onProfileChange(data as Profile);
  };

  // Sync partner
  const syncPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncError('');
    const code = inviteInput.trim();
    if (!code || !profile) return;
    if (profile.invite_code && code.toLowerCase() === profile.invite_code.toLowerCase()) {
      setSyncError("That's your own code 💔");
      return;
    }
    setSyncing(true);
    const { data: partners, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('invite_code', code)
      .limit(1);

    if (error || !partners || partners.length === 0) {
      setSyncing(false);
      setSyncError('Code not found. Double-check with your love 🥺');
      return;
    }
    const partner = partners[0] as Profile;
    const nowIso = new Date().toISOString();

    const [meRes, themRes] = await Promise.all([
      supabase
        .from('profiles')
        .update({ partner_id: partner.id, sync_start_date: nowIso })
        .eq('id', profile.id)
        .select()
        .single(),
      supabase
        .from('profiles')
        .update({ partner_id: profile.id, sync_start_date: nowIso })
        .eq('id', partner.id)
        .select()
        .single(),
    ]);

    setSyncing(false);
    if (meRes.error || themRes.error) {
      setSyncError(meRes.error?.message || themRes.error?.message || 'Could not sync');
      return;
    }
    if (meRes.data) onProfileChange(meRes.data as Profile);
    onSyncSuccess();
  };

  // Virtual hug
  const sendHug = async () => {
    if (!profile?.partner_id || hugCooldown) return;
    setHugCooldown(true);
    await supabase.channel('system_events').send({
      type: 'broadcast',
      event: 'nudge',
      payload: { from: userId, to: profile.partner_id },
    });
    setTimeout(() => setHugCooldown(false), 2500);
  };

  // Bucket list actions
  const addBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newBucket.trim();
    if (!title) return;
    const { data } = await supabase
      .from('bucket_list')
      .insert({ title, author_id: userId, is_completed: false })
      .select()
      .single();
    if (data) setBucket((b) => [data as BucketItem, ...b]);
    setNewBucket('');
  };

  const toggleBucket = async (item: BucketItem) => {
    const { data } = await supabase
      .from('bucket_list')
      .update({ is_completed: !item.is_completed })
      .eq('id', item.id)
      .select()
      .single();
    if (data) setBucket((b) => b.map((x) => (x.id === item.id ? (data as BucketItem) : x)));
  };

  // --- Render ---
  return (
    <div className="relative z-10 pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto">
      {hugIncoming && (
        <div className="heartbeat-overlay">
          <span className="animate-explosive-heartbeat">💞</span>
        </div>
      )}

      {/* Greeting */}
      <section className="text-center mb-8">
        <h1 className="font-love text-5xl md:text-6xl gradient-text">
          Hi {profile?.first_name || 'love'} 💕
        </h1>
        <p className="font-main text-rose-700/75 mt-1 text-base md:text-lg">
          {linked ? 'Your heart is synced.' : "Let's connect you to your love."}
        </p>
      </section>

      {/* NOT LINKED — Invite card */}
      {!linked && (
        <section className="max-w-2xl mx-auto glass-strong cute-shadow-lg soft-border rounded-[28px] p-6 md:p-8 animate-fade-up">
          <h2 className="font-script text-3xl text-rose-600 text-center">
            Link with your partner
          </h2>
          <p className="text-center text-rose-700/75 mt-1 mb-5">
            Share your code, or enter theirs. One link lasts forever 💘
          </p>

          <div className="rounded-2xl p-5 glass-card soft-border text-center mb-5">
            <p className="text-sm font-semibold text-rose-600">Your invite code</p>
            <p className="font-digital text-3xl md:text-4xl text-rose-700 mt-2 select-all">
              {profile?.invite_code || '— — — — — —'}
            </p>
            <button
              onClick={() => {
                if (profile?.invite_code) {
                  navigator.clipboard.writeText(profile.invite_code);
                }
              }}
              className="mt-3 btn-press hover-jelly px-4 py-2 rounded-full bg-rose-500 text-white font-semibold text-sm"
            >
              Copy code
            </button>
          </div>

          <form onSubmit={syncPartner} className="flex flex-col sm:flex-row gap-3">
            <input
              className="rose-input flex-1"
              placeholder="Enter partner's code"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <button
              disabled={syncing}
              className="btn-press hover-jelly px-6 py-3 rounded-2xl text-white font-bold cute-shadow"
              style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
            >
              {syncing ? 'Syncing…' : 'Heart Sync 💞'}
            </button>
          </form>
          {syncError && (
            <p className="text-sm text-rose-600 font-semibold text-center mt-3">{syncError}</p>
          )}
        </section>
      )}

      {/* LINKED — Dashboard Grid */}
      {linked && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 md:gap-6">
          {/* LEFT: Timer + Mood */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            {/* Sync Timer */}
            <section className="glass-strong cute-shadow-lg soft-border rounded-[28px] p-6 md:p-8 text-center">
              <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest">
                Synced for
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                <TimerBlock value={timer?.days ?? 0} label="days" />
                <TimerBlock value={timer?.hours ?? 0} label="hours" />
                <TimerBlock value={timer?.minutes ?? 0} label="min" />
                <TimerBlock value={timer?.seconds ?? 0} label="sec" />
              </div>
              <p className="font-script text-2xl md:text-3xl text-rose-600 mt-4">
                Every second with you ✨
              </p>
            </section>

            {/* Mood Picker */}
            <section className="glass-strong cute-shadow-lg soft-border rounded-[28px] p-6 md:p-7">
              <h3 className="font-script text-2xl text-rose-600 mb-3">How do you feel?</h3>
              <div className="grid grid-cols-4 gap-2.5">
                {MOODS.map((m) => {
                  const selected = profile?.mood === `${m.emoji} ${m.label}`;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setMood(`${m.emoji} ${m.label}`)}
                      className={`btn-press hover-jelly rounded-2xl py-3 px-2 text-center transition ${
                        selected
                          ? 'bg-rose-500 text-white cute-shadow'
                          : 'bg-white/70 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <div className="text-2xl">{m.emoji}</div>
                      <div className="text-xs font-semibold mt-1">{m.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl p-4 glass-card soft-border flex items-center gap-3">
                <span className="text-3xl">{partnerProfile?.mood?.split(' ')[0] || '💭'}</span>
                <div>
                  <p className="text-xs text-rose-500 font-semibold">Partner's mood</p>
                  <p className="text-rose-800 font-bold">
                    {partnerProfile?.mood || 'Waiting for a vibe…'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* CENTER: Bucket List */}
          <section className="lg:col-span-1 glass-strong cute-shadow-lg soft-border rounded-[28px] p-6">
            <h3 className="font-script text-2xl text-rose-600 mb-3">Bucket List</h3>
            <form onSubmit={addBucket} className="flex gap-2 mb-4">
              <input
                className="rose-input flex-1"
                placeholder="Paris trip 🗼"
                value={newBucket}
                onChange={(e) => setNewBucket(e.target.value)}
              />
              <button
                className="btn-press hover-jelly w-11 h-11 rounded-full text-white text-xl cute-shadow shrink-0"
                style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
                aria-label="Add"
              >
                +
              </button>
            </form>
            <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {bucket.length === 0 && (
                <li className="text-center text-rose-500/70 text-sm py-6">
                  No dreams yet. Add one 💫
                </li>
              )}
              {bucket.map((b) => (
                <li
                  key={b.id}
                  onClick={() => toggleBucket(b)}
                  className={`cursor-pointer rounded-2xl px-4 py-3 soft-border transition hover-jelly flex items-center gap-2 ${
                    b.is_completed
                      ? 'bg-rose-100 line-through text-rose-500'
                      : 'bg-white/80 text-rose-800'
                  }`}
                >
                  <span>{b.is_completed ? '💖' : '🤍'}</span>
                  <span className="flex-1 truncate font-semibold">{b.title}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* RIGHT: Premium Action Buttons */}
          <section className="lg:col-span-1 space-y-4 md:space-y-5">
            <PremiumButton
              label="Heart Sync"
              sub="Your bond"
              emoji="💞"
              gradient="linear-gradient(135deg, #ff9ebd 0%, #f43f72 100%)"
              badge={linked ? 'Linked' : 'Unlinked'}
              pulse
              onClick={() => {
                const el = document.getElementById('sync-anchor');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
            <PremiumButton
              label="Send Virtual Hug"
              sub={hugCooldown ? 'Sent! 💨' : 'Tap to hug them'}
              emoji="🤗"
              gradient="linear-gradient(135deg, #ffb3c6 0%, #ff6aa0 100%)"
              disabled={hugCooldown || !linked}
              onClick={sendHug}
            />
            <PremiumButton
              label="Open Chat"
              sub="Say something cute"
              emoji="💬"
              gradient="linear-gradient(135deg, #f58eb5 0%, #e11d5a 100%)"
              onClick={() => navigate('/chat')}
            />
          </section>
        </div>
      )}

      <div id="sync-anchor" />
    </div>
  );
}

// Timer digit block
function TimerBlock({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div
        className="font-digital timer-glow font-bold text-rose-600 bg-white/80 soft-border rounded-2xl px-3 md:px-5 py-2 md:py-3 min-w-[72px] md:min-w-[88px] text-center"
        style={{ fontSize: 'clamp(28px, 4.5vw, 44px)' }}
      >
        {display}
      </div>
      <span className="text-xs md:text-sm text-rose-500 font-bold uppercase mt-1 tracking-wider">
        {label}
      </span>
    </div>
  );
}

// Big premium button
function PremiumButton({
  label,
  sub,
  emoji,
  gradient,
  badge,
  pulse,
  disabled,
  onClick,
}: {
  label: string;
  sub?: string;
  emoji: string;
  gradient: string;
  badge?: string;
  pulse?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`premium-btn relative w-full rounded-[28px] p-5 md:p-6 text-white text-left cute-shadow-lg soft-border ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      style={{ background: gradient }}
    >
      <div className="flex items-center gap-4 relative z-[2]">
        <span
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl text-3xl md:text-4xl bg-white/25"
          style={{ backdropFilter: 'blur(6px)' }}
        >
          {emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-script text-2xl md:text-3xl leading-tight">{label}</div>
          {sub && <div className="text-sm md:text-base text-white/85 font-semibold">{sub}</div>}
        </div>
        {badge && (
          <span className="text-xs md:text-sm font-bold bg-white/25 px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {pulse && <span className="pulse-ring" />}
    </button>
  );
}

// ============================================================
// ChatUI · WhatsApp-style
// ============================================================
function ChatUI({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeout = useRef<number | null>(null);
  const myTypingSentAt = useRef<number>(0);

  const partnerId = profile?.partner_id || null;

  // Initial load
  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .in('sender_id', [userId, partnerId])
        .order('created_at', { ascending: true })
        .limit(200);
      if (data) setMessages(data as Message[]);
    })();
  }, [userId, partnerId]);

  // Realtime: inserts + typing broadcasts
  useEffect(() => {
    if (!partnerId) return;
    const channel = supabase.channel('chat-room', {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message;
          if (m.sender_id === userId || m.sender_id === partnerId) {
            setMessages((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]));
          }
        },
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const who = (payload?.payload as any)?.from;
        if (who === partnerId) {
          setPartnerTyping(true);
          if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
          typingTimeout.current = window.setTimeout(() => setPartnerTyping(false), 2200);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    };
  }, [userId, partnerId]);

  // Auto-scroll to latest
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const sendTyping = () => {
    const now = Date.now();
    if (now - myTypingSentAt.current < 1500) return;
    myTypingSentAt.current = now;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { from: userId },
    });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !partnerId) return;
    setInput('');
    const { data, error } = await supabase
      .from('messages')
      .insert({ content, sender_id: userId })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, data as Message]);
    }
  };

  if (!partnerId) {
    return (
      <div className="relative z-10 pt-24 pb-16 px-4 max-w-xl mx-auto text-center">
        <div className="glass-strong cute-shadow-lg soft-border rounded-[28px] p-8 animate-fade-up">
          <div className="text-6xl mb-3">💔</div>
          <h2 className="font-love text-3xl gradient-text">No partner linked</h2>
          <p className="text-rose-700/80 mt-2">
            Link with your love from the Dashboard to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-20 pb-4 px-0 md:px-4 max-w-3xl mx-auto h-screen flex flex-col">
      <div className="flex-1 flex flex-col glass-strong cute-shadow-lg soft-border md:rounded-[28px] overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-rose-100 bg-white/70">
          <span className="text-2xl">💞</span>
          <div>
            <p className="font-script text-xl text-rose-700 leading-none">Private Chat</p>
            <p className="text-xs text-rose-500 font-semibold">
              with @{/* eslint-disable-next-line */}
              <PartnerName partnerId={partnerId} />
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto chat-surface px-3 md:px-5 py-5 space-y-2"
        >
          {messages.length === 0 && (
            <div className="text-center text-rose-500/80 mt-10">
              <div className="text-5xl mb-2">💌</div>
              <p className="font-script text-2xl">Say something sweet</p>
            </div>
          )}

          {messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`${
                    mine ? 'msg-bubble-me' : 'msg-bubble-partner'
                  } max-w-[78%] md:max-w-[70%] px-4 py-2.5 animate-fade-up`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      mine ? 'text-white/80' : 'text-rose-400'
                    } text-right`}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}

          {partnerTyping && (
            <div className="flex justify-start animate-fade-up">
              <div className="typing-dots" aria-label="Partner is typing">
                <span />
                <span />
                <span />
              </div>
              <span className="ml-2 text-xs text-rose-500 self-end mb-1 font-semibold">
                Partner is typing…
              </span>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={send}
          className="flex items-center gap-2 px-3 md:px-4 py-3 border-t border-rose-100 bg-white/75"
        >
          <input
            className="rose-input flex-1"
            placeholder="Type a love note…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping();
            }}
          />
          <button
            type="submit"
            className="btn-press hover-jelly w-12 h-12 rounded-full text-white text-xl cute-shadow shrink-0"
            style={{ background: 'linear-gradient(135deg, #f43f72, #e11d5a)' }}
            aria-label="Send"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function PartnerName({ partnerId }: { partnerId: string }) {
  const [name, setName] = useState('loading…');
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, first_name')
        .eq('id', partnerId)
        .single();
      if (data) setName(data.username || data.first_name || 'your_love');
    })();
  }, [partnerId]);
  return <>{name}</>;
}

// ============================================================
// Protected layout wrapper (adds Navbar + Settings + Background)
// ============================================================
function Shell({
  profile,
  onProfileChange,
  children,
}: {
  profile: Profile | null;
  onProfileChange: (p: Profile) => void;
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <Background />
      <Navbar profile={profile} onOpenSettings={() => setSettingsOpen(true)} />
      {children}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onProfileChange={onProfileChange}
      />
    </>
  );
}

// ============================================================
// Root App · Session + Routes
// ============================================================
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showHug, setShowHug] = useState(false);

  // Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Profile fetch + realtime on my own row
  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }
    const uid = session.user.id as string;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (data) setProfile(data as Profile);
    })();

    const channel = supabase
      .channel(`me-${uid}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` },
        (payload) => setProfile(payload.new as Profile),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  if (loadingSession) {
    return (
      <>
        <Background />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin-slow text-5xl">💞</div>
            <p className="font-script text-2xl text-rose-600">Loading your love…</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Background />
        <Auth />
      </>
    );
  }

  const userId = session.user.id as string;

  return (
    <BrowserRouter>
      {showHug && <HuggingHearts onDone={() => setShowHug(false)} />}
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Shell profile={profile} onProfileChange={setProfile}>
              <Dashboard
                userId={userId}
                profile={profile}
                onProfileChange={setProfile}
                onSyncSuccess={() => setShowHug(true)}
              />
            </Shell>
          }
        />
        <Route
          path="/chat"
          element={
            <Shell profile={profile} onProfileChange={setProfile}>
              <ChatUI userId={userId} profile={profile} />
            </Shell>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

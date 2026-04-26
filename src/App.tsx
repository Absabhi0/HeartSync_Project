import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

/* ============================================================
   TYPES
   ============================================================ */
interface Profile {
  id: string; username: string; first_name: string; last_name: string;
  dob: string; mood: string; partner_id: string | null;
  invite_code: string; sync_start_date: string | null;
}
interface Message {
  id: string; content: string; sender_id: string; created_at: string;
  is_gift?: boolean; gift_time?: string;
}
interface BucketItem {
  id: string; title: string; is_completed: boolean; author_id: string;
}
interface MemoryCard {
  id: number; title: string; imageUrl: string | null; tilt: number;
}

/* ============================================================
   BACKGROUND
   ============================================================ */
function Background() {
  const hearts = ['💗','💕','💖','🩷','💓','💝','❤️','💞'];
  const items = Array.from({length:14},(_,i)=>({
    id:i, emoji:hearts[i%hearts.length],
    left:`${(i*7.3+3)%100}%`, delay:`${(i*1.7)%10}s`,
    duration:`${10+(i*1.3)%10}s`, size:`${1+(i%3)*0.4}rem`,
  }));
  return (
    <div className="heart-bg">
      {items.map(h=>(
        <div key={h.id} className="floating-heart"
          style={{left:h.left,animationDelay:h.delay,animationDuration:h.duration,fontSize:h.size}}>
          {h.emoji}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   AUTH (UNTOUCHED)
   ============================================================ */
function Auth() {
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [username,setUsername]=useState(''); const [firstName,setFirstName]=useState('');
  const [lastName,setLastName]=useState(''); const [dob,setDob]=useState('');
  const [agreeTerms,setAgreeTerms]=useState(false);
  const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [info,setInfo]=useState('');
  const switchMode=(next:'login'|'signup')=>{setMode(next);setError('');setInfo('');};
  const handleLogin=async()=>{setError('');setLoading(true);const{error:e}=await supabase.auth.signInWithPassword({email,password});if(e)setError(e.message);setLoading(false);};
  const handleSignUp=async()=>{if(!agreeTerms){setError('Please agree to the terms.');return;}setError('');setLoading(true);const{data,error:e}=await supabase.auth.signUp({email,password});if(e){setError(e.message);setLoading(false);return;}if(data.user){const inviteCode=Math.random().toString(36).substring(2,10).toUpperCase();await supabase.from('profiles').insert({id:data.user.id,username,first_name:firstName,last_name:lastName,dob,invite_code:inviteCode,mood:'😊 Happy'});setInfo('Check your email to confirm your account! 💌');}setLoading(false);};
  const handleGoogle=async()=>{await supabase.auth.signInWithOAuth({provider:'google'});};
  const isSignIn=mode==='login';
  return (
    <div className="auth-page">
      {Array.from({length:10},(_,i)=>(
        <div key={i} style={{position:'absolute',left:`${(i*9.5+4)%96}%`,bottom:0,fontSize:'1rem',opacity:0,pointerEvents:'none',animation:`floatUp ${7+(i*0.8)%7}s ${(i*0.7)%5}s linear infinite`}}>🌸</div>
      ))}
      <div className="auth-card">
        <div className={`auth-panel auth-panel--signin ${!isSignIn?'covered mobile-hidden':''}`}>
          <div className="auth-logo shimmer-text">HeartSync</div>
          <p className="auth-subtitle">Welcome back, love 💕</p>
          <div className="w-full space-y-3">
            <input className="input-love" type="email" placeholder="Email 📧" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input className="input-love" type="password" placeholder="Password 🔒" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
          </div>
          {error&&isSignIn&&<p className="text-red-400 text-xs mt-2 text-center animate-pulse">{error}</p>}
          {info&&isSignIn&&<p className="text-green-500 text-xs mt-2 text-center">{info}</p>}
          <button onClick={handleLogin} disabled={loading} className="w-full mt-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:scale-[1.03] btn-press transition-all duration-200 disabled:opacity-60">{loading?'✨ Loading...':'💗 Sign In'}</button>
          <div className="flex items-center gap-3 my-3 w-full"><div className="flex-1 h-px bg-rose-100"/><span className="text-rose-300 text-xs">or</span><div className="flex-1 h-px bg-rose-100"/></div>
          <button onClick={handleGoogle} className="w-full py-2.5 rounded-full border-2 border-rose-200 bg-white text-rose-600 font-semibold text-sm flex items-center justify-center gap-2 hover:border-rose-400 hover:bg-rose-50 btn-press transition-all duration-200">
            <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.3 0 6.1 1.1 8.4 3.3l6.3-6.3C34.7 2.8 29.7.5 24 .5 14.7.5 6.9 6.1 3.3 14l7.4 5.8C12.5 13.2 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8c4.3-4 6.8-9.9 7.2-17z"/><path fill="#FBBC05" d="M10.7 28.2A14.5 14.5 0 0 1 9.5 24c0-1.5.3-2.9.7-4.2L2.8 14C1 17.1 0 20.4 0 24s1 6.9 2.8 10l7.9-5.8z"/><path fill="#34A853" d="M24 47.5c5.7 0 10.5-1.9 14-5.1l-7.4-5.8c-2 1.4-4.6 2.2-6.6 2.2-6.2 0-11.5-3.7-13.3-9.1L2.8 34c3.6 7.9 11.4 13.5 21.2 13.5z"/></svg>
            Google
          </button>
        </div>
        <div className={`auth-panel auth-panel--signup ${isSignIn?'covered mobile-hidden':''}`}>
          <div className="auth-logo shimmer-text">HeartSync</div>
          <p className="auth-subtitle">Start your love story 🌹</p>
          <div className="w-full space-y-2.5">
            <input className="input-love" placeholder="Username 💌" value={username} onChange={e=>setUsername(e.target.value)}/>
            <div className="flex gap-2"><input className="input-love" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)}/><input className="input-love" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
            <input className="input-love" type="date" value={dob} onChange={e=>setDob(e.target.value)}/>
            <input className="input-love" type="email" placeholder="Email 📧" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input className="input-love" type="password" placeholder="Password 🔒" value={password} onChange={e=>setPassword(e.target.value)}/>
            <label className="flex items-center gap-2 text-rose-400 text-xs cursor-pointer pl-1"><input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} className="accent-rose-500"/>I agree to the Terms &amp; Conditions 💝</label>
          </div>
          {error&&!isSignIn&&<p className="text-red-400 text-xs mt-2 text-center animate-pulse">{error}</p>}
          {info&&!isSignIn&&<p className="text-green-500 text-xs mt-2 text-center">{info}</p>}
          <button onClick={handleSignUp} disabled={loading} className="w-full mt-3 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:scale-[1.03] btn-press transition-all duration-200 disabled:opacity-60">{loading?'✨ Loading...':'🌹 Create Account'}</button>
        </div>
        <div className={`auth-overlay ${mode==='signup'?'overlay-left':''}`}>
          {mode==='login'?(<><span className="auth-overlay-heart">💗</span><p className="auth-overlay-title">Hello, Friend!</p><p className="auth-overlay-text">Start your journey with us and find your perfect sync 🌹</p><button className="auth-overlay-btn" onClick={()=>switchMode('signup')}>Sign Up</button></>):(<><span className="auth-overlay-heart">💕</span><p className="auth-overlay-title">Welcome Back!</p><p className="auth-overlay-text">Please login to your account to continue your love story 💌</p><button className="auth-overlay-btn" onClick={()=>switchMode('login')}>Sign In</button></>)}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS MODAL (UNTOUCHED)
   ============================================================ */
function SettingsModal({profile,onClose}:{profile:Profile|null;onClose:()=>void}) {
  const navigate=useNavigate();
  const handleLogout=async()=>{await supabase.auth.signOut();navigate('/');onClose();};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card cute-shadow rounded-[28px] w-full max-w-sm mx-4 p-7 modal-card" onClick={e=>e.stopPropagation()}>
        <div className="text-center mb-6"><div className="text-5xl mb-2">⚙️</div><h2 className="text-2xl font-bold text-rose-600" style={{fontFamily:'var(--font-love)'}}>Settings</h2></div>
        {profile&&(<div className="bg-rose-50 rounded-2xl p-4 mb-5 space-y-1"><p className="text-rose-700 font-bold text-lg">@{profile.username}</p><p className="text-rose-400 text-sm">{profile.first_name} {profile.last_name}</p>{profile.dob&&<p className="text-rose-300 text-xs">🎂 {new Date(profile.dob).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>}<div className="mt-2 pt-2 border-t border-rose-100"><p className="text-rose-400 text-xs">Invite Code</p><p className="font-digital text-rose-600 font-bold tracking-widest">{profile.invite_code}</p></div></div>)}
        <button onClick={handleLogout} className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg hover:scale-[1.03] btn-press transition-all duration-200">🚪 Sign Out</button>
        <button onClick={onClose} className="w-full mt-3 py-2 rounded-full border-2 border-rose-200 text-rose-400 text-sm font-semibold hover:border-rose-400 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD NAVBAR (unchanged logic, now with Profile & Game)
   ============================================================ */
function DashboardNavbar({profile,onSettingsOpen,onChatOpen,onProfileOpen,onGameOpen}:{
  profile:Profile|null; onSettingsOpen:()=>void; onChatOpen:()=>void;
  onProfileOpen:()=>void; onGameOpen:()=>void;
}) {
  return (
    <nav className="db-nav">
      <span className="db-nav-logo">HeartSync</span>
      <div className="db-nav-center">
        {/* Profile icon */}
        <button className="db-nav-icon-btn" title="Profile" onClick={onProfileOpen}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </button>
        <div className="db-nav-divider"/>
        {/* Chat icon */}
        <button className="db-nav-icon-btn" title="Chat" onClick={onChatOpen}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <div className="db-nav-divider"/>
        {/* Game icon */}
        <button className="db-nav-icon-btn" title="Partner Quiz" onClick={onGameOpen}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div className="db-nav-right">
        <button className="db-nav-icon-btn" title="Settings" onClick={onSettingsOpen}
          onMouseEnter={e=>(e.currentTarget.style.transform='rotate(60deg) scale(1.08)')}
          onMouseLeave={e=>(e.currentTarget.style.transform='')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </nav>
  );
}

/* ============================================================
   PROFILE PAGE (NEW)
   ============================================================ */
function ProfilePage({profile,userId,onClose}:{profile:Profile|null;userId:string|null;onClose:()=>void}) {
  const [coverUrl,setCoverUrl]     = useState<string|null>(null);
  const [avatarUrl,setAvatarUrl]   = useState<string|null>(null);
  const [bio,setBio]               = useState('');
  const [social,setSocial]         = useState({instagram:'',facebook:'',threads:'',x:'',pinterest:''});
  const [locked,setLocked]         = useState(false);
  const [saved,setSaved]           = useState(false);
  const coverRef  = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleCoverChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f)return;
    setCoverUrl(URL.createObjectURL(f));
  };
  const handleAvatarChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f)return;
    setAvatarUrl(URL.createObjectURL(f));
  };
  const handleSave=async()=>{
    if(!userId)return;
    await supabase.from('profiles').update({mood:profile?.mood||'😊 Happy'}).eq('id',userId);
    setSaved(true); setTimeout(()=>setSaved(false),2200);
  };

  const socialIcons:{[k:string]:string}={
    instagram:'📷', facebook:'📘', threads:'🧵', x:'✖️', pinterest:'📌'
  };

  return (
    <div className="profile-page" style={{position:'fixed',inset:0,zIndex:100,overflowY:'auto'}}>
      {/* Back button */}
      <div style={{position:'absolute',top:'calc(var(--nav-h) + 0.75rem)',left:'1rem',zIndex:10}}>
        <button onClick={onClose} className="db-nav-icon-btn" style={{background:'rgba(0,0,0,0.35)',border:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#f5c6c6" strokeWidth="2" width="18" height="18"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
      </div>

      {/* Lock overlay */}
      {locked&&(
        <div className="profile-locked-overlay">
          <div style={{fontSize:'5rem',animation:'heartPulse 1s ease infinite'}}>😤</div>
          <h2>Profile Locked</h2>
          <p>You're in Anger Mode. Take a breath 💨</p>
          <button onClick={()=>setLocked(false)} className="game-btn game-btn-outline" style={{width:'auto',padding:'0.6rem 2rem',marginTop:'0.5rem'}}>
            Unlock 💗
          </button>
        </div>
      )}

      {/* Cover photo */}
      <div className="profile-cover" onClick={()=>coverRef.current?.click()}>
        {coverUrl?<img src={coverUrl} alt="cover"/>:null}
        <div className="profile-cover-edit">
          <div className="profile-cover-edit-icon">
            <span>📷</span>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.04em'}}>Edit Cover</span>
          </div>
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleCoverChange}/>

        {/* Avatar (inside cover for absolute positioning) */}
        <div className="profile-avatar-wrap" onClick={e=>{e.stopPropagation();avatarRef.current?.click();}}>
          {avatarUrl
            ?<img src={avatarUrl} alt="avatar"/>
            :<div className="profile-avatar-placeholder">{profile?.first_name?.[0]?.toUpperCase()||'💗'}</div>
          }
        </div>
        <input ref={avatarRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange}/>
      </div>

      {/* Body */}
      <div className="profile-body">
        {/* Name */}
        <div className="profile-name">
          <h1>{profile?.first_name||''} {profile?.last_name||''}</h1>
          <p>@{profile?.username||''} · {profile?.invite_code||''}</p>
        </div>

        {/* Bio */}
        <div className="profile-card">
          <div className="profile-card-title">✍️ About Me</div>
          <textarea
            className="profile-bio-input"
            placeholder="Write something sweet about yourself... 💕"
            value={bio}
            onChange={e=>setBio(e.target.value)}
          />
        </div>

        {/* Social links */}
        <div className="profile-card">
          <div className="profile-card-title">🔗 Link Social Media</div>
          <div className="profile-social-grid">
            {Object.entries(social).map(([platform,val])=>(
              <div key={platform} className="profile-social-item">
                <div className="profile-social-label">
                  <span>{socialIcons[platform]}</span>
                  <span style={{textTransform:'capitalize'}}>{platform}</span>
                </div>
                <input
                  className="profile-social-input"
                  placeholder={`@${platform}`}
                  value={val}
                  onChange={e=>setSocial(prev=>({...prev,[platform]:e.target.value}))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button className="profile-save-btn" onClick={handleSave}>
          {saved?'✅ Saved!':'💾 Save Profile'}
        </button>

        {/* Lock / Anger mode */}
        <div className="profile-lock-card">
          <div className="profile-lock-info">
            <h3>😤 Anger Mode</h3>
            <p>Lock your profile when you need space</p>
          </div>
          <label className="toggle-wrap">
            <input type="checkbox" checked={locked} onChange={e=>setLocked(e.target.checked)}/>
            <span className="toggle-slider"/>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CHAT UI — REDESIGNED
   ============================================================ */
function ChatUI({initialProfile}:{initialProfile:Profile|null}) {
  const navigate = useNavigate();
  const [messages,setMessages]       = useState<Message[]>([]);
  const [newMsg,setNewMsg]           = useState('');
  const [userId,setUserId]           = useState<string|null>(null);
  const [partnerName,setPartnerName] = useState('');
  const [isTyping,setIsTyping]       = useState(false);
  const [profile,setProfile]         = useState<Profile|null>(initialProfile);
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [isRecording,setIsRecording] = useState(false);
  const [showGiftModal,setShowGiftModal] = useState(false);
  const [giftText,setGiftText]       = useState('');
  const [giftTime,setGiftTime]       = useState('');
  const bottomRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){navigate('/');return;}
      const uid=session.user.id; setUserId(uid);
      const{data:p}=await supabase.from('profiles').select('*').eq('id',uid).single();
      if(p){setProfile(p);if(p.partner_id){const{data:pp}=await supabase.from('profiles').select('first_name').eq('id',p.partner_id).single();if(pp)setPartnerName(pp.first_name);}}
      const{data:msgs}=await supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(100);
      if(msgs)setMessages(msgs);
    };
    init();
  },[navigate]);

  // Realtime subscription — UNCHANGED
  useEffect(()=>{
    const channel=supabase.channel('chat-room')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},payload=>{
        const msg=payload.new as Message;
        setMessages(prev=>[...prev,msg]);
        if(msg.sender_id!==userId)setIsTyping(false);
      }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[userId]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  useEffect(()=>{
    const channel=supabase.channel('typing_events');
    channel.on('broadcast',{event:'typing'},payload=>{
      if(payload.payload?.sender!==userId){
        setIsTyping(true);
        if(typingTimer.current)clearTimeout(typingTimer.current);
        typingTimer.current=setTimeout(()=>setIsTyping(false),3000);
      }
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[userId]);

  const broadcastTyping=useCallback(async()=>{
    await supabase.channel('typing_events').send({type:'broadcast',event:'typing',payload:{sender:userId}});
  },[userId]);

  const sendMessage=async(content?:string,isGift=false,giftTs?:string)=>{
    const text=(content||newMsg).trim(); if(!text||!userId)return;
    setNewMsg('');
    await supabase.from('messages').insert({content:text,sender_id:userId,...(isGift?{is_gift:true,gift_time:giftTs}:{})});
  };

  const sendGift=()=>{
    if(!giftText.trim())return;
    sendMessage(`🎁 Gift Message (for ${giftTime||'now'}): ${giftText}`,true,giftTime);
    setGiftText(''); setGiftTime(''); setShowGiftModal(false);
  };

  const toggleVoice=()=>{ setIsRecording(r=>!r); };

  const deleteConversation=async()=>{
    if(!window.confirm('Delete all messages? This cannot be undone. 💔'))return;
    await supabase.from('messages').delete().neq('id','00000000-0000-0000-0000-000000000000');
    setMessages([]);
  };

  const formatTime=(ts:string)=>new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  const formatDate=(ts:string)=>new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric'});

  return (
    <>
      {settingsOpen&&<SettingsModal profile={profile} onClose={()=>setSettingsOpen(false)}/>}

      {/* Gift modal */}
      {showGiftModal&&(
        <div className="modal-overlay" onClick={()=>setShowGiftModal(false)}>
          <div className="gift-modal-inner" onClick={e=>e.stopPropagation()}>
            <p className="gift-modal-title">🎁 Schedule Gift Message</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div>
                <label style={{fontSize:'0.78rem',fontWeight:700,color:'#9b6a70',display:'block',marginBottom:'0.3rem'}}>Message</label>
                <textarea
                  style={{width:'100%',border:'1.5px solid #fda4af',borderRadius:'12px',padding:'0.6rem 0.9rem',fontSize:'0.88rem',color:'#9f1239',fontFamily:'var(--font-main)',resize:'none',minHeight:'72px',outline:'none'}}
                  placeholder="Write your sweet message... 💌"
                  value={giftText} onChange={e=>setGiftText(e.target.value)}
                />
              </div>
              <div>
                <label style={{fontSize:'0.78rem',fontWeight:700,color:'#9b6a70',display:'block',marginBottom:'0.3rem'}}>Schedule For</label>
                <input type="datetime-local" style={{width:'100%',border:'1.5px solid #fda4af',borderRadius:'9999px',padding:'0.55rem 1rem',fontSize:'0.85rem',color:'#9f1239',fontFamily:'var(--font-main)',outline:'none'}} value={giftTime} onChange={e=>setGiftTime(e.target.value)}/>
              </div>
              <button onClick={sendGift} style={{padding:'0.7rem',borderRadius:'12px',background:'#8b2a3a',color:'#fff',fontWeight:700,fontSize:'0.9rem',border:'none',cursor:'pointer'}}>
                🎁 Send Gift Message
              </button>
              <button onClick={()=>setShowGiftModal(false)} style={{padding:'0.5rem',borderRadius:'9999px',background:'transparent',border:'1.5px solid #fda4af',color:'#c9515f',fontWeight:600,fontSize:'0.82rem',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-page">
        <div className="chat-column">
          {/* Top bar */}
          <div className="chat-topbar">
            <button className="chat-topbar-btn" onClick={()=>navigate('/dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#c9515f,#f7cece)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#3d0f1c',fontSize:'0.95rem',flexShrink:0}}>
              {partnerName?partnerName[0].toUpperCase():'💗'}
            </div>
            <div className="chat-topbar-title">
              <p>{partnerName||'Your Love'}</p>
              <span>{isTyping?'✍️ typing...':'💗 HeartSync'}</span>
            </div>
            <button className="chat-topbar-btn danger" title="Delete conversation" onClick={deleteConversation}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
            <button className="chat-topbar-btn" onClick={()=>setSettingsOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>

          {/* Messages feed */}
          <div className="chat-feed">
            {messages.length===0&&(
              <div style={{textAlign:'center',padding:'3rem 1rem',color:'rgba(90,26,42,0.35)'}}>
                <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>💌</div>
                <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:'0.9rem'}}>No messages yet... say something sweet!</p>
              </div>
            )}
            {messages.map((msg,idx)=>{
              const isMine=msg.sender_id===userId;
              const showDate=idx===0||formatDate(messages[idx-1].created_at)!==formatDate(msg.created_at);
              return (
                <div key={msg.id}>
                  {showDate&&(
                    <div style={{textAlign:'center',margin:'0.5rem 0'}}>
                      <span style={{background:'rgba(90,26,42,0.12)',borderRadius:'9999px',padding:'0.2rem 0.75rem',fontSize:'0.68rem',color:'#9b6a70',fontWeight:600}}>{formatDate(msg.created_at)}</span>
                    </div>
                  )}
                  <div className={`chat-msg-row ${isMine?'mine':'theirs'}`}>
                    <div className={`chat-bubble ${isMine?'mine':'theirs'} ${msg.is_gift?'gift':''}`}>
                      {msg.content}
                    </div>
                    <span className="chat-ts">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
            {isTyping&&(
              <div className="chat-typing">
                <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div className="chat-inputbar">
            {isRecording?(
              <div className="voice-recording" style={{flex:1}}>
                🔴 Recording... <button onClick={toggleVoice} style={{background:'none',border:'none',cursor:'pointer',color:'#be185d',fontWeight:700,marginLeft:'auto'}}>Stop</button>
              </div>
            ):(
              <input
                className="chat-input-field"
                placeholder="Say something sweet... 💌"
                value={newMsg}
                onChange={e=>{setNewMsg(e.target.value);broadcastTyping();}}
                onKeyDown={e=>e.key==='Enter'&&sendMessage()}
              />
            )}
            <button className="chat-action-btn chat-voice-btn" title="Voice message" onClick={toggleVoice}>
              {isRecording?'⏹':'🎤'}
            </button>
            <button className="chat-action-btn chat-gift-btn" title="Schedule gift message" onClick={()=>setShowGiftModal(true)}>
              🎁
            </button>
            <button className="chat-action-btn chat-send-btn" disabled={!newMsg.trim()&&!isRecording} onClick={()=>sendMessage()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   GAME — How Much Do You Know Your Partner?
   ============================================================ */
const QUESTION_BANK = [
  "What is your partner's favourite food?",
  "What is your partner's biggest dream in life?",
  "What is the first thing your partner notices about someone?",
  "What is your partner's love language?",
  "Where would your partner most like to travel?",
  "What song reminds your partner of you?",
  "What is your partner's most used emoji?",
  "What is your partner's biggest fear?",
  "What movie could your partner watch forever?",
  "What nickname does your partner secretly love?",
  "What was the last thing that made your partner laugh?",
  "What is your partner's guilty pleasure?",
  "What is your partner's morning routine?",
  "What would your partner's perfect date look like?",
  "What is your partner's favourite season and why?",
];

function shuffle<T>(arr:T[]):T[]{return [...arr].sort(()=>Math.random()-0.5);}

type GamePhase = 'answering' | 'scoring' | 'result';

function GamePage({profile,onClose}:{profile:Profile|null;onClose:()=>void}) {
  const [questions,setQuestions]   = useState<string[]>(()=>shuffle(QUESTION_BANK).slice(0,10));
  const [answers,setAnswers]       = useState<string[]>(Array(10).fill(''));
  const [scores,setScores]         = useState<(boolean|null)[]>(Array(10).fill(null));
  const [phase,setPhase]           = useState<GamePhase>('answering');
  const [tab,setTab]               = useState<'answer'|'score'>('answer');

  const regenerate=()=>{
    setQuestions(shuffle(QUESTION_BANK).slice(0,10));
    setAnswers(Array(10).fill(''));
    setScores(Array(10).fill(null));
    setPhase('answering');
    setTab('answer');
  };

  const submitAnswers=()=>{
    if(answers.some(a=>!a.trim())){alert('Please answer all questions first! 💕');return;}
    setPhase('scoring'); setTab('score');
  };

  const markScore=(idx:number,correct:boolean)=>{
    setScores(prev=>{const n=[...prev];n[idx]=correct;return n;});
  };

  const allScored=scores.every(s=>s!==null);
  const correctCount=scores.filter(s=>s===true).length;
  const wrongCount=scores.filter(s=>s===false).length;

  const resultMessage=(c:number)=>{
    if(c===10) return "You two were MADE for each other! 💯💗";
    if(c>=8)   return "You know each other so well! Almost perfect 💕";
    if(c>=6)   return "Pretty good! A few more dates and you'll be perfect 🌹";
    if(c>=4)   return "Room to grow — that's what makes love exciting 💫";
    return         "Time for more long talks under the stars ✨";
  };

  return (
    <div className="game-page" style={{position:'fixed',inset:0,zIndex:100,overflowY:'auto'}}>
      {/* Back */}
      <div style={{position:'fixed',top:'calc(var(--nav-h) + 0.75rem)',left:'1rem',zIndex:10}}>
        <button onClick={onClose} className="db-nav-icon-btn" style={{background:'rgba(0,0,0,0.4)',border:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#f5c6c6" strokeWidth="2" width="18" height="18"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
      </div>

      <div className="game-content">
        {/* Header */}
        <div className="game-header">
          <h1>💗 How Much Do You Know Your Partner?</h1>
          <p>Answer all 10 questions, then let your partner score them!</p>
        </div>

        {/* Phase tabs */}
        {phase!=='result'&&(
          <div className="game-tabs">
            <button className={`game-tab ${tab==='answer'?'active':''}`} onClick={()=>setTab('answer')}>✏️ Answer</button>
            <button className={`game-tab ${tab==='score'?'active':''}`} onClick={()=>{if(phase==='scoring')setTab('score');}}>
              💯 Partner Scores
            </button>
          </div>
        )}

        {/* ANSWER PHASE */}
        {(tab==='answer'||phase==='answering')&&phase!=='result'&&(
          <>
            {questions.map((q,i)=>(
              <div key={i} className="game-q-card">
                <div className="game-q-num">Question {i+1} of 10</div>
                <div className="game-q-text">{q}</div>
                <input
                  className="game-q-input"
                  placeholder="Your answer..."
                  value={answers[i]}
                  onChange={e=>{const a=[...answers];a[i]=e.target.value;setAnswers(a);}}
                />
              </div>
            ))}
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'0.5rem'}}>
              <button className="game-btn game-btn-primary" onClick={submitAnswers}>
                💌 Submit for Partner to Score
              </button>
              <button className="game-btn game-btn-outline" onClick={regenerate}>
                🔄 New Questions
              </button>
            </div>
          </>
        )}

        {/* SCORING PHASE */}
        {tab==='score'&&phase==='scoring'&&(
          <>
            <p style={{color:'rgba(245,198,198,0.7)',fontSize:'0.85rem',textAlign:'center',marginBottom:'1.25rem',fontStyle:'italic'}}>
              Partner: check each answer and tap 💗 for correct or 💔 for incorrect
            </p>
            {questions.map((q,i)=>(
              <div key={i} className="game-score-card">
                <div className="game-q-num">Question {i+1}</div>
                <div className="game-score-q">{q}</div>
                <div className="game-score-answer">Answer: <strong>{answers[i]||'—'}</strong></div>
                <div className="game-score-btns">
                  <button
                    className={`game-heart-btn correct ${scores[i]===true?'selected':''}`}
                    onClick={()=>markScore(i,true)}
                    title="Correct!"
                  >
                    💗
                  </button>
                  <button
                    className={`game-heart-btn wrong ${scores[i]===false?'selected':''}`}
                    onClick={()=>markScore(i,false)}
                    title="Incorrect"
                  >
                    💔
                  </button>
                </div>
              </div>
            ))}
            {allScored&&(
              <button className="game-btn game-btn-primary" style={{marginTop:'0.5rem'}} onClick={()=>setPhase('result')}>
                🎉 See Results!
              </button>
            )}
          </>
        )}

        {/* RESULT */}
        {phase==='result'&&(
          <>
            <div className="game-result">
              <div className="game-result-score">{correctCount} / 10</div>
              <div className="game-result-hearts">
                {Array.from({length:correctCount}).map((_,i)=><span key={i}>💗</span>)}
                {Array.from({length:wrongCount}).map((_,i)=><span key={i}>💔</span>)}
              </div>
              <p className="game-result-msg">{resultMessage(correctCount)}</p>
            </div>

            {/* Score breakdown */}
            <div style={{marginTop:'1.5rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {questions.map((q,i)=>(
                <div key={i} className="game-score-card">
                  <div className="game-q-num">Q{i+1} {scores[i]===true?'💗':'💔'}</div>
                  <div className="game-score-q">{q}</div>
                  <div className="game-score-answer">Your answer: <strong>{answers[i]}</strong></div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'1.5rem'}}>
              <button className="game-btn game-btn-primary" onClick={regenerate}>
                💞 Play Again
              </button>
              <button className="game-btn game-btn-outline" onClick={onClose}>
                ← Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD COMPONENTS (unchanged)
   ============================================================ */
const MOOD_SHAYRI:Record<string,string>={
  Romantic:'Tum saath ho to har lamha\nkhaas lagta hai,\nTum door bhi raho to har pal\nbas tumhara ehsaas lagta hai.',
  Happy:'Khushiyon ka rang tumse hai,\nMuskarahat ki wajah tum ho,\nHar subah naya sawera lagta hai\njab zindagi mein tum ho.',
  Missing:'Dil dhoondta hai tujhe har taraf,\nAankhen tarse hain teri raah pe,\nKehdo kuch jo dil ko chain aaye,\ntere bina sab kuch adhura hai.',
  Lovey:'Ishq tera aisa hai jaise\nsaans ka chalana hai,\nTere bina jeena ek\nadhoori kahani hai.',
  Excited:'Rooh mein tufaan hai teri yaadon ka,\nDil mein jashn hai teri baaton ka,\nYeh khushi mujhe sirf tum dete ho.',
  Content:'Sukoon teri aankhon mein milta hai,\nChain teri baahon mein hai,\nSab rang fike lagte hain\nsirf tera pyaar sach lagta hai.',
  Sleepy:'Neend mein bhi tera chehra\nnazar aata hai,\nSapnon mein bhi tu hi\naawaaz lagata hai.',
  Grumpy:'Mana gussa hai aaj mujhko,\nPar dil ka darwaza\nsirf tere liye khula hai.',
};

function LiveTimer({syncStart}:{syncStart:string|null}) {
  const [elapsed,setElapsed]=useState({d:0,h:0,m:0});
  useEffect(()=>{
    if(!syncStart)return;
    const tick=()=>{const diff=Math.max(0,Date.now()-new Date(syncStart).getTime());const s=Math.floor(diff/1000);setElapsed({d:Math.floor(s/86400),h:Math.floor((s%86400)/3600),m:Math.floor((s%3600)/60)});};
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
  },[syncStart]);
  const pad=(n:number)=>String(n).padStart(3,'0');
  return (
    <div className="db-card">
      <h2 className="db-card-title">Live Timer</h2>
      <div className="db-card-divider"><span className="db-card-divider-heart">♥</span></div>
      {syncStart?(<>
        <p className="db-timer-label"><span>♡</span> Together for <span>♡</span></p>
        <div className="db-timer-digits">
          <span className="db-timer-num">{pad(elapsed.d)}</span><span className="db-timer-colon">:</span>
          <span className="db-timer-num">{String(elapsed.h).padStart(2,'0')}</span><span className="db-timer-colon">:</span>
          <span className="db-timer-num">{String(elapsed.m).padStart(2,'0')}</span>
        </div>
        <div className="db-timer-units"><span className="db-timer-unit">Days</span><span className="db-timer-unit">Hours</span><span className="db-timer-unit">Minutes</span></div>
      </>):(
        <p className="db-timer-label" style={{textAlign:'center',marginTop:'1.5rem'}}>♡ Link with your partner<br/>to start the timer ♡</p>
      )}
      <div className="db-timer-footer"><span className="db-timer-heart-outline">♡</span></div>
    </div>
  );
}

function MoodCard({profile,userId,onMoodChange}:{profile:Profile|null;userId:string|null;onMoodChange:(m:string)=>void}) {
  const moods=Object.keys(MOOD_SHAYRI);
  const currentMood=profile?.mood?.split(' ').slice(1).join(' ')||'Romantic';
  const shayriKey=moods.find(k=>currentMood.toLowerCase().includes(k.toLowerCase()))||moods[0];
  const shayri=MOOD_SHAYRI[shayriKey]||MOOD_SHAYRI[moods[0]];
  const handleChange=async(e:React.ChangeEvent<HTMLSelectElement>)=>{const val=e.target.value;onMoodChange(val);if(!userId)return;await supabase.from('profiles').update({mood:val}).eq('id',userId);};
  return (
    <div className="db-card">
      <h2 className="db-card-title">Mood</h2>
      <div className="db-card-divider"><span className="db-card-divider-heart">♥</span></div>
      <div className="db-mood-select-wrap">
        <span className="db-mood-select-icon">♥</span>
        <select className="db-mood-select" style={{paddingLeft:'2rem'}} value={shayriKey} onChange={handleChange}>
          {moods.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <span className="db-mood-select-arrow">▾</span>
      </div>
      <div className="db-shayri" style={{flex:1}}>
        <span className="db-shayri-open">"</span>
        <p className="db-shayri-quote">{shayri}</p>
        <span className="db-shayri-close">"</span>
      </div>
    </div>
  );
}

function BucketListCard({bucketList,userId,onAdd,onToggle}:{bucketList:BucketItem[];userId:string|null;onAdd:(item:{date:string;location:string;idea:string})=>void;onToggle:(item:BucketItem)=>void}) {
  const [date,setDate]=useState(''); const [location,setLocation]=useState(''); const [idea,setIdea]=useState('');
  const handleSave=()=>{if(!idea.trim())return;onAdd({date,location,idea});setDate('');setLocation('');setIdea('');};
  return (
    <div className="db-card">
      <h2 className="db-card-title">Bucket List</h2>
      <div className="db-card-divider"><span className="db-card-divider-heart">♥</span></div>
      <div className="db-bucket-field"><span className="db-bucket-field-icon">📅</span><span className="db-bucket-label">Date</span><input className="db-bucket-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div className="db-bucket-field"><span className="db-bucket-field-icon">📍</span><span className="db-bucket-label">Location</span><input className="db-bucket-input" placeholder="Where do you want to go?" value={location} onChange={e=>setLocation(e.target.value)}/></div>
      <div className="db-bucket-field"><span className="db-bucket-field-icon">💡</span><span className="db-bucket-label">Idea</span><input className="db-bucket-input" placeholder="What do you want to do?" value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSave()}/></div>
      <button className="db-bucket-save-btn" onClick={handleSave}><span>♥</span> Save Idea</button>
      {bucketList.length>0&&(<div className="db-bucket-list">{bucketList.map(item=>(<div key={item.id} className={`db-bucket-item ${item.is_completed?'done':''}`} onClick={()=>onToggle(item)}><span>{item.is_completed?'✅':'🌸'}</span><span>{item.title}</span></div>))}</div>)}
    </div>
  );
}

const DEFAULT_MEMORIES:MemoryCard[]=[
  {id:1,title:'Sunset Walk',imageUrl:null,tilt:-2.5},
  {id:2,title:'Movie Night',imageUrl:null,tilt:1.8},
  {id:3,title:'City Lights',imageUrl:null,tilt:-1.2},
  {id:4,title:'Rainy Evening',imageUrl:null,tilt:2.4},
];

function CoupleMemoryGrid() {
  const [memories,setMemories]=useState<MemoryCard[]>(DEFAULT_MEMORIES);
  const fileRefs=useRef<(HTMLInputElement|null)[]>([]);
  const handleFileChange=(id:number,e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);setMemories(prev=>prev.map(m=>m.id===id?{...m,imageUrl:url}:m));};
  return (
    <section className="db-memory-section">
      <div className="db-memory-heading"><div className="db-memory-heading-line"/><span className="db-memory-heading-heart">♡</span><h2 className="db-memory-heading-text">Couple Memory</h2><span className="db-memory-heading-heart">♡</span><div className="db-memory-heading-line"/></div>
      <div className="db-memory-grid">
        {memories.map((mem,idx)=>(
          <div key={mem.id} className="db-memory-card" style={{transform:`rotate(${mem.tilt}deg)`}}>
            <div className="db-memory-tape"/>
            <div className="db-memory-photo">
              {mem.imageUrl?<img src={mem.imageUrl} alt={mem.title}/>:<div className="db-memory-photo-placeholder"><span className="db-memory-photo-placeholder-icon">📷</span><span className="db-memory-photo-placeholder-text">Add Photo</span></div>}
              <input ref={el=>{fileRefs.current[idx]=el;}} type="file" accept="image/*" className="db-memory-file-input" onChange={e=>handleFileChange(mem.id,e)}/>
            </div>
            <div className="db-memory-bottom"><span className="db-memory-title">{mem.title}</span><button className="db-memory-add-btn" onClick={()=>fileRefs.current[idx]?.click()}>+</button></div>
            <div className="db-memory-heart">♥</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   DASHBOARD (main orchestrator)
   ============================================================ */
function Dashboard() {
  const navigate = useNavigate();
  const [profile,setProfile]               = useState<Profile|null>(null);
  const [partnerProfile,setPartnerProfile] = useState<Profile|null>(null);
  const [bucketList,setBucketList]         = useState<BucketItem[]>([]);
  const [partnerCode,setPartnerCode]       = useState('');
  const [settingsOpen,setSettingsOpen]     = useState(false);
  const [hugReceived,setHugReceived]       = useState(false);
  const [userId,setUserId]                 = useState<string|null>(null);
  const [showProfile,setShowProfile]       = useState(false);
  const [showGame,setShowGame]             = useState(false);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession(); if(!session)return;
      const uid=session.user.id; setUserId(uid);
      const{data:p}=await supabase.from('profiles').select('*').eq('id',uid).single();
      if(p){setProfile(p);if(p.partner_id){const{data:pp}=await supabase.from('profiles').select('*').eq('id',p.partner_id).single();if(pp)setPartnerProfile(pp);}}
      const{data:bl}=await supabase.from('bucket_list').select('*').order('created_at',{ascending:false}); if(bl)setBucketList(bl);
    };
    init();
  },[]);

  useEffect(()=>{
    const channel=supabase.channel('system_events');
    channel.on('broadcast',{event:'nudge'},()=>{setHugReceived(true);setTimeout(()=>setHugReceived(false),3500);}).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[]);

  useEffect(()=>{
    if(!profile?.partner_id)return;
    const sub=supabase.channel('partner-profile').on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles',filter:`id=eq.${profile.partner_id}`},payload=>setPartnerProfile(prev=>prev?{...prev,...payload.new}:null)).subscribe();
    return()=>{supabase.removeChannel(sub);};
  },[profile?.partner_id]);

  const handleMoodChange=(mood:string)=>{setProfile(prev=>prev?{...prev,mood}:null);};

  const handleBucketAdd=async({date,location,idea}:{date:string;location:string;idea:string})=>{
    if(!userId)return;
    const title=[idea,location,date].filter(Boolean).join(' · ');
    const{data}=await supabase.from('bucket_list').insert({title,author_id:userId,is_completed:false}).select().single();
    if(data)setBucketList(prev=>[data,...prev]);
  };

  const handleBucketToggle=async(item:BucketItem)=>{
    const updated=!item.is_completed;
    await supabase.from('bucket_list').update({is_completed:updated}).eq('id',item.id);
    setBucketList(prev=>prev.map(b=>b.id===item.id?{...b,is_completed:updated}:b));
  };

  const linkPartner=async()=>{
    if(!partnerCode.trim()||!userId)return;
    const{data:partner}=await supabase.from('profiles').select('*').ilike('invite_code',partnerCode.trim()).single();
    if(!partner){alert('No partner found with that code 💔');return;}
    const now=new Date().toISOString();
    await supabase.from('profiles').update({partner_id:partner.id,sync_start_date:now}).eq('id',userId);
    await supabase.from('profiles').update({partner_id:userId,sync_start_date:now}).eq('id',partner.id);
    setProfile(prev=>prev?{...prev,partner_id:partner.id,sync_start_date:now}:null);
    setPartnerProfile(partner); setPartnerCode('');
  };

  return (
    <>
      <DashboardNavbar
        profile={profile}
        onSettingsOpen={()=>setSettingsOpen(true)}
        onChatOpen={()=>navigate('/chat')}
        onProfileOpen={()=>setShowProfile(true)}
        onGameOpen={()=>setShowGame(true)}
      />
      {settingsOpen&&<SettingsModal profile={profile} onClose={()=>setSettingsOpen(false)}/>}

      {/* Profile overlay */}
      {showProfile&&<ProfilePage profile={profile} userId={userId} onClose={()=>setShowProfile(false)}/>}
      {/* Game overlay */}
      {showGame&&<GamePage profile={profile} onClose={()=>setShowGame(false)}/>}

      {hugReceived&&(
        <div className="heartbeat-overlay">
          <div className="animate-explosive-heartbeat text-8xl mb-4">💗</div>
          <p className="text-rose-600 font-bold text-2xl" style={{fontFamily:'var(--font-love)'}}>Virtual Hug!</p>
          <p className="text-rose-400 mt-1">{partnerProfile?.first_name||'Your partner'} sent you love 🥰</p>
        </div>
      )}

      <div className="db-page">
        <div className="db-content">
          {/* Sync strip */}
          {!profile?.partner_id?(
            <div className="db-sync-strip">
              <span style={{fontSize:'1.1rem'}}>🔗</span>
              <span style={{flex:1}}>Your invite code: <strong className="font-digital" style={{letterSpacing:'0.12em',color:'#fda4af'}}>{profile?.invite_code??'...'}</strong></span>
              <input style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'9999px',padding:'0.35rem 0.9rem',color:'#fff',fontSize:'0.8rem',outline:'none',width:'160px'}} placeholder="Partner's code..." value={partnerCode} onChange={e=>setPartnerCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&linkPartner()}/>
              <button onClick={linkPartner} style={{background:'#c9515f',border:'none',borderRadius:'9999px',color:'#fff',padding:'0.35rem 1rem',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>Connect 💞</button>
            </div>
          ):(
            <div className="db-sync-strip">
              <span style={{fontSize:'1.2rem'}}>💑</span>
              <span>Synced with <strong>{partnerProfile?.first_name||'your love'}</strong></span>
              <span style={{marginLeft:'auto',opacity:0.7,fontSize:'0.8rem'}}>{partnerProfile?.mood||''}</span>
            </div>
          )}

          <div className="db-mid">
            <LiveTimer syncStart={profile?.sync_start_date??null}/>
            <MoodCard profile={profile} userId={userId} onMoodChange={handleMoodChange}/>
            <BucketListCard bucketList={bucketList} userId={userId} onAdd={handleBucketAdd} onToggle={handleBucketToggle}/>
          </div>

          <CoupleMemoryGrid/>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
function AppInner() {
  const [session,setSession]=useState<boolean|null>(null);
  const navigate=useNavigate();
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session:s}})=>{setSession(!!s);if(s&&window.location.pathname==='/')navigate('/dashboard');});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{setSession(!!s);if(s){if(window.location.pathname==='/')navigate('/dashboard');}else navigate('/');});
    return()=>subscription.unsubscribe();
  },[navigate]);
  if(session===null)return(<div className="fixed inset-0 flex items-center justify-center" style={{background:'#3d0f1c'}}><div className="text-rose-400 text-4xl" style={{animation:'heartPulse 1.2s ease-in-out infinite'}}>💗</div></div>);
  return (
    <Routes>
      <Route path="/"          element={session?null:<Auth/>}/>
      <Route path="/dashboard" element={session?<Dashboard/>:<Auth/>}/>
      <Route path="/chat"      element={session?<ChatUI initialProfile={null}/>:<Auth/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Background/>
      <AppInner/>
    </BrowserRouter>
  );
}

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import supabase from './lib/supabase';

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading HeartSync...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* If not logged in, show Auth. If logged in, redirect to Dashboard */}
        <Route 
          path="/" 
          element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* If logged in, show Dashboard. If not logged in, redirect to Auth */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { User, ViewState } from './types';
import { apiService } from './services/api';
import { Navbar } from './components/Navbar';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { MintingStation } from './pages/MintingStation';
import { Explorer } from './pages/Explorer';
import { Verifier } from './pages/Verifier';
import { Profile } from './pages/Profile';
import { Requests } from './pages/Requests';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LOGIN');
  const [initializing, setInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initSession = async () => {
        const storedId = localStorage.getItem('nexus_user_id');
        if (storedId) {
            try {
                const userData = await apiService.getUser(storedId);
                setUser(userData);
                setView('DASHBOARD');
            } catch (error) {
                console.error("Session expired or invalid", error);
                localStorage.removeItem('nexus_user_id');
            }
        }
        setInitializing(false);
    };

    initSession();
  }, []);

  // Refetch user data to update balance
  const refreshUser = async () => {
      if (user) {
          const updated = await apiService.getUser(user.id);
          setUser(updated);
      }
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user_id');
    setUser(null);
    setView('LOGIN');
  };

  const renderView = () => {
    if (!user) return null;
    switch (view) {
      case 'DASHBOARD': return <Dashboard user={user} updateUser={refreshUser} />;
      case 'MINT': return <MintingStation user={user} setView={setView} />;
      case 'EXPLORER': return <Explorer user={user} updateUser={refreshUser} />;
      case 'VERIFIER': return <Verifier />;
      case 'PROFILE': return <Profile user={user} updateUser={refreshUser} onLogout={handleLogout} />;
      case 'REQUESTS': return <Requests user={user} updateUser={refreshUser} />;
      default: return <Dashboard user={user} updateUser={refreshUser} />;
    }
  };

  if (initializing) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
              <Loader2 className="animate-spin mr-2" />
              <span>Initializing NexusChain...</span>
          </div>
      );
  }

  if (!user || view === 'LOGIN') {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 overflow-hidden">
      {/* Desktop Navbar (Top) */}
      <div className="hidden md:block">
         <Navbar 
          user={user} 
          currentView={view} 
          onNavigate={setView} 
          onLogout={handleLogout} 
          isMobile={false}
        />
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative pb-24 md:pb-0 scroll-smooth">
        {renderView()}
        
        {/* Footer / Status Bar - Desktop only for bottom placement, or make sticky */}
        <footer className="h-8 bg-black/40 border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono backdrop-blur-sm mt-auto w-full">
            <div>NEXUS_CHAIN_SERVER_V2.0 // NODE_ACTIVE</div>
            <div className="flex items-center space-x-4">
                <span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE</span>
                <span>BALANCE: {user.balance.toFixed(4)} ETH</span>
            </div>
        </footer>
      </main>

      {/* Mobile Navbar (Bottom) */}
      <div className="md:hidden">
        <Navbar 
          user={user} 
          currentView={view} 
          onNavigate={setView} 
          onLogout={handleLogout} 
          isMobile={true}
        />
      </div>
      
    </div>
  );
};

export default App;

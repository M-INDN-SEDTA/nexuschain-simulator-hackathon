
import React from 'react';
import { ViewState } from '../types';
import { User } from '../types';
import { LayoutDashboard, PlusCircle, Search, ScanLine, LogOut, Wallet, UserCircle, FileText } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isMobile: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, onNavigate, onLogout, isMobile }) => {
  if (!user) return null;

  if (isMobile) {
    // Mobile Bottom Navigation
    return (
      <nav className="fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl flex items-center justify-between px-4 z-50 shadow-2xl backdrop-blur-xl bg-[#111]/90 border border-white/20">
         <button 
           onClick={() => onNavigate('DASHBOARD')}
           className={`p-2 rounded-full transition-all ${currentView === 'DASHBOARD' ? 'bg-indigo-600 text-white scale-110' : 'text-slate-400'}`}
         >
           <LayoutDashboard size={22} />
         </button>
         <button 
           onClick={() => onNavigate('REQUESTS')}
           className={`p-2 rounded-full transition-all ${currentView === 'REQUESTS' ? 'bg-indigo-600 text-white scale-110' : 'text-slate-400'}`}
         >
           <FileText size={22} />
         </button>
         
         <div className="relative -top-6">
            <button 
                onClick={() => onNavigate('MINT')}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-950 transition-all ${currentView === 'MINT' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
                <PlusCircle size={24} />
            </button>
         </div>

         <button 
           onClick={() => onNavigate('EXPLORER')}
           className={`p-2 rounded-full transition-all ${currentView === 'EXPLORER' ? 'bg-indigo-600 text-white scale-110' : 'text-slate-400'}`}
         >
           <Search size={22} />
         </button>
         <button 
           onClick={() => onNavigate('PROFILE')}
           className={`p-2 rounded-full transition-all ${currentView === 'PROFILE' ? 'bg-indigo-600 text-white scale-110' : 'text-slate-400'}`}
         >
           <UserCircle size={22} />
         </button>
      </nav>
    );
  }

  // Desktop Top Navigation
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <nav className="h-16 border-b border-white/10 glass-panel flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md bg-black/40">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="font-bold text-white">N</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          NexusChain
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Assets" />
        <NavItem view="REQUESTS" icon={FileText} label="Transactions" />
        <NavItem view="MINT" icon={PlusCircle} label="Mint" />
        <NavItem view="VERIFIER" icon={ScanLine} label="Verify" />
        <NavItem view="EXPLORER" icon={Search} label="Explorer" />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 text-xs text-indigo-400">
            <Wallet size={12} />
            <span>{user.balance.toFixed(2)} ETH</span>
          </div>
          <span className="text-xs text-slate-500">{user.walletAddress.substring(0, 6)}...</span>
        </div>
        
        <button 
           onClick={() => onNavigate('PROFILE')}
           className={`p-2 rounded-full transition-colors ${currentView === 'PROFILE' ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-slate-400'}`}
           title="Profile"
        >
            <UserCircle size={20} />
        </button>

        <button 
          onClick={onLogout}
          className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full text-slate-400 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

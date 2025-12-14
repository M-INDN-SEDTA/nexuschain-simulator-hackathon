
import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2, Mail } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (email: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [connecting, setConnecting] = useState(false);
  const [email, setEmail] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setConnecting(true);
    // Simulate auth delay
    setTimeout(() => {
        onConnect(email);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 rotate-3 hover:rotate-6 transition-transform">
                <Shield size={40} className="text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">NexusChain</h1>
            <p className="text-slate-400 mb-8">Login to Access Marketplace</p>

            <form onSubmit={handleConnect} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input 
                        type="email" 
                        required
                        placeholder="Enter your Gmail address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={connecting}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 group"
                >
                    {connecting ? (
                        <>
                            <Loader2 className="animate-spin" />
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-blue-600 font-bold">G</span>
                            <span>Sign in with Google</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                        </>
                    )}
                </button>
            </form>
            
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-6">
                Connected to Nexus Server Node
            </p>
        </div>
      </div>
    </div>
  );
};

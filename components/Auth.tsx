
import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthProps {
  onSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    setLoading(true);

    try {
        let user;
        if (isLogin) {
            user = await apiService.login(email, password);
        } else {
            user = await apiService.signup(name, email, password);
        }
        
        // Save session
        localStorage.setItem('nexus_user_id', user.id);
        onSuccess(user);
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                    <Shield size={32} className="text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">NexusChain</h1>
                <p className="text-slate-400 mb-6">
                    {isLogin ? 'Sign in to your account' : 'Create your digital identity'}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            required={!isLogin}
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input 
                        type="email" 
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input 
                        type="password" 
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {!isLogin && (
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            required
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

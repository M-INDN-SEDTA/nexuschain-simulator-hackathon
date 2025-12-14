
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';
import { User as UserIcon, Wallet, Save, Lock, CreditCard, LogOut, ShieldCheck, Mail } from 'lucide-react';

interface ProfileProps {
    user: User;
    updateUser: () => void;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, updateUser, onLogout }) => {
    const [amount, setAmount] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profileImage, setProfileImage] = useState(user.profileImage || '');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.topUpBalance(user.id, parseFloat(amount));
            setMsg({ type: 'success', text: `Successfully added ${amount} ETH to wallet.` });
            setAmount('');
            updateUser();
        } catch (e) {
            setMsg({ type: 'error', text: 'Top-up failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.updateProfile(user.id, { 
                password: newPassword || undefined, 
                profileImage 
            });
            setMsg({ type: 'success', text: 'Profile updated successfully.' });
            setNewPassword('');
            updateUser();
        } catch (e) {
            setMsg({ type: 'error', text: 'Update failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-8">User Profile & Settings</h1>

            {msg && (
                <div className={`mb-6 p-4 rounded-xl border ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* User Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-black/50">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={48} className="text-white" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <p className="text-slate-400 text-sm mb-4">{user.email}</p>
                        
                        <div className="bg-white/5 rounded-lg p-3 mb-4 text-left">
                            <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Wallet Address</span>
                            <p className="text-xs font-mono text-indigo-300 break-all">{user.walletAddress}</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-lg p-4">
                            <span className="text-[10px] uppercase text-green-400 font-bold block mb-1">Current Balance</span>
                            <p className="text-2xl font-bold text-white font-mono">{user.balance.toFixed(4)} ETH</p>
                        </div>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Forms Column */}
                <div className="md:col-span-2 space-y-8">
                    
                    {/* Top Up Form */}
                    <div className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Add Funds</h3>
                                <p className="text-slate-400 text-xs">Simulate depositing ETH into your Nexus wallet.</p>
                            </div>
                        </div>

                        <form onSubmit={handleTopUp} className="flex gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-bold">ETH</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-14 pr-4 text-white focus:border-indigo-500 outline-none font-mono"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center space-x-2"
                            >
                                <CreditCard size={18} />
                                <span>Add</span>
                            </button>
                        </form>
                    </div>

                    {/* Settings Form */}
                    <div className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Account Security & Details</h3>
                                <p className="text-slate-400 text-xs">Update your password and profile image.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profile Image URL</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
                                    <input 
                                        type="text" 
                                        value={profileImage}
                                        onChange={(e) => setProfileImage(e.target.value)}
                                        placeholder="https://example.com/avatar.png"
                                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password (Optional)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-600" size={16} />
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password to change"
                                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 mt-4"
                            >
                                <Save size={18} />
                                <span>Save Changes</span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { User, TradeRequest, Transaction } from '../types';
import { apiService } from '../services/api';
import { Loader2, ArrowRightLeft, Check, X, Clock, FileText, ArrowRight } from 'lucide-react';

interface RequestsProps {
    user: User;
    updateUser: () => void;
}

export const Requests: React.FC<RequestsProps> = ({ user, updateUser }) => {
    const [view, setView] = useState<'INCOMING' | 'OUTGOING' | 'HISTORY'>('INCOMING');
    const [requests, setRequests] = useState<TradeRequest[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const reqData = await apiService.fetchTradeRequests(user.id);
            setRequests(reqData);
            
            if (view === 'HISTORY') {
                const txData = await apiService.fetchTransactions();
                // Filter only my transactions
                const myTxs = txData.filter(tx => tx.from === user.id || tx.to === user.id);
                setTransactions(myTxs);
            }
        } catch (e) {
            console.error("Fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [view, user.id]);

    const handleAction = async (reqId: string, action: 'accept' | 'reject') => {
        setProcessing(reqId);
        try {
            await apiService.respondToTradeRequest(reqId, action);
            await fetchData(); // Refresh list
            updateUser(); // Update balance
        } catch (e) {
            alert(`Failed to ${action} request.`);
        } finally {
            setProcessing(null);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `http://localhost:5000${url}`;
    };

    const renderIncoming = () => {
        const incoming = requests.filter(r => r.sellerId === user.id && r.status === 'PENDING');
        if (incoming.length === 0) return <EmptyState message="No incoming purchase requests." />;

        return (
            <div className="space-y-4">
                {incoming.map(req => (
                    <div key={req.id} className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/10">
                                {req.nftImage && <img src={getImageUrl(req.nftImage)} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{req.nftName}</h3>
                                <div className="text-sm text-slate-400 flex items-center gap-2">
                                    <span>From: <span className="text-indigo-400 font-bold">{req.buyerName}</span></span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-slate-300">Offer: {req.price} ETH</span>
                                </div>
                                <span className="text-xs text-slate-500">{new Date(req.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleAction(req.id, 'reject')}
                                disabled={!!processing}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                <X size={16} /> Reject
                            </button>
                            <button 
                                onClick={() => handleAction(req.id, 'accept')}
                                disabled={!!processing}
                                className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing === req.id ? <Loader2 className="animate-spin" size={16}/> : <Check size={16} />} 
                                Accept & Sell
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderOutgoing = () => {
        const outgoing = requests.filter(r => r.buyerId === user.id);
        if (outgoing.length === 0) return <EmptyState message="You haven't made any requests yet." />;

        return (
            <div className="space-y-4">
                {outgoing.map(req => (
                    <div key={req.id} className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/10">
                                {req.nftImage && <img src={getImageUrl(req.nftImage)} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{req.nftName}</h3>
                                <div className="text-sm text-slate-400">
                                    Seller: <span className="text-slate-300">{req.sellerName}</span> | Offer: {req.price} ETH
                                </div>
                            </div>
                        </div>
                        <div>
                            {req.status === 'PENDING' && (
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Clock size={12} /> Pending Approval
                                </span>
                            )}
                            {req.status === 'ACCEPTED' && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Check size={12} /> Approved
                                </span>
                            )}
                            {req.status === 'REJECTED' && (
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <X size={12} /> Rejected
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderHistory = () => {
        if (transactions.length === 0) return <EmptyState message="No transaction history found." />;

        return (
            <div className="space-y-3">
                {transactions.map(tx => (
                    <div key={tx.txId} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${tx.type === 'MINT' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {tx.type === 'MINT' ? <Check size={18} /> : <ArrowRightLeft size={18} />}
                            </div>
                            <div>
                                <div className="font-bold text-white">{tx.data}</div>
                                <div className="text-xs text-slate-500 font-mono">{tx.txId}</div>
                            </div>
                         </div>
                         <div className="text-right">
                             <div className="font-bold text-white">{tx.price ? `${tx.price} ETH` : '-'}</div>
                             <div className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                         </div>
                    </div>
                ))}
            </div>
        );
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
            <p className="text-slate-500">{message}</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Transactions & Requests</h1>
                <p className="text-slate-400">Manage your buying and selling activities.</p>
            </header>

            <div className="flex space-x-2 mb-8 bg-black/20 p-1 rounded-xl w-fit border border-white/10">
                <TabButton active={view === 'INCOMING'} onClick={() => setView('INCOMING')} label="Incoming Requests" />
                <TabButton active={view === 'OUTGOING'} onClick={() => setView('OUTGOING')} label="My Requests" />
                <TabButton active={view === 'HISTORY'} onClick={() => setView('HISTORY')} label="Completed History" />
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-slate-500">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <div className="animate-fade-in">
                    {view === 'INCOMING' && renderIncoming()}
                    {view === 'OUTGOING' && renderOutgoing()}
                    {view === 'HISTORY' && renderHistory()}
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
    >
        {label}
    </button>
);

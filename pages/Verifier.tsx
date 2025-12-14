
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { NFT } from '../types';
import { Scan, CheckCircle, XCircle, Search } from 'lucide-react';

export const Verifier: React.FC = () => {
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; nft?: NFT; message: string } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId) return;
    
    setLoading(true);
    setResult(null);

    try {
        // Use the new explicit fetch-by-ID endpoint
        const nft = await apiService.fetchNFTById(inputId);
        setResult({ valid: true, nft: nft, message: "Asset Validated Successfully" });
    } catch (e) {
        // 404 or other errors means invalid
        setResult({ valid: false, message: "Invalid ID: Asset Not Found" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Scanner Line Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
              <Scan size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Asset Verifier</h2>
            <p className="text-slate-400 text-sm mt-2">Enter the 6-digit Unique Asset ID (UUID) to verify ownership and authenticity.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
              <input
                type="text"
                value={inputId}
                onChange={(e) => { setInputId(e.target.value.toUpperCase()); setResult(null); }}
                placeholder="e.g. A4F92B"
                className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-center text-white font-mono placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase tracking-widest text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputId}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying Blockchain Data..." : "Verify Asset"}
            </button>
          </form>

          {result && (
            <div className={`mt-8 p-6 rounded-xl border flex flex-col items-center text-center animate-fade-in-up ${
              result.valid 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {result.valid ? (
                <CheckCircle size={56} className="text-green-500 mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              ) : (
                <XCircle size={56} className="text-red-500 mb-3 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              )}
              
              <h3 className={`font-bold text-xl mb-1 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                {result.message}
              </h3>
              
              {result.valid && result.nft && (
                <div className="mt-4 w-full bg-black/40 p-4 rounded-lg text-left border border-white/5 space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-500 text-xs uppercase font-bold">Item Name</span>
                      <span className="font-bold text-white">{result.nft.metadata.name}</span>
                  </div>
                   <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-500 text-xs uppercase font-bold">Category</span>
                      <span className="text-indigo-300">{result.nft.type}</span>
                  </div>
                   <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-500 text-xs uppercase font-bold">Current Owner</span>
                      <span className="font-mono text-yellow-500">{result.nft.owner.substring(0,12)}...</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500 text-xs uppercase font-bold">Verified On</span>
                      <span className="text-slate-400">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

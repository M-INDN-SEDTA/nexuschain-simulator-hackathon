
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { NFT, User } from '../types';
import { NFTCard } from '../components/NFTCard';
import { NFTDetailModal } from '../components/NFTDetailModal';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
    user: User;
    updateUser: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, updateUser }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'COLLECTED' | 'SAVED'>('COLLECTED');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const fetchData = async () => {
      setLoading(true);
      try {
        const allNfts = await apiService.fetchNFTs();
        setNfts(allNfts);
      } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredNFTs = nfts.filter(nft => {
      if (view === 'COLLECTED') return nft.owner === user.id;
      if (view === 'SAVED') return user.savedItems.includes(nft.id);
      return false;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Syncing Wallet...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-slate-400">Manage your assets and watchlist.</p>
        </div>
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            <button 
                onClick={() => setView('COLLECTED')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'COLLECTED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Collected
            </button>
            <button 
                onClick={() => setView('SAVED')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'SAVED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Saved
            </button>
        </div>
      </header>

      {filteredNFTs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-500 text-lg">
              {view === 'COLLECTED' ? "You don't own any assets yet." : "Your watchlist is empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <NFTCard 
                key={nft.id} 
                nft={nft} 
                onClick={() => setSelectedNFT(nft)}
            />
          ))}
        </div>
      )}

      {selectedNFT && (
          <NFTDetailModal 
            nft={selectedNFT} 
            currentUser={user}
            onClose={() => { setSelectedNFT(null); fetchData(); updateUser(); }}
            onUpdate={() => { setSelectedNFT(null); fetchData(); updateUser(); }}
          />
      )}
    </div>
  );
};

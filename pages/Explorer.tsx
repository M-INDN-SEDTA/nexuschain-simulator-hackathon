
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { NFT, User, Transaction, NFTType } from '../types';
import { NFTCard } from '../components/NFTCard';
import { NFTDetailModal } from '../components/NFTDetailModal';
import { Search as SearchIcon, Activity, ArrowRightLeft, Filter, Calendar, X } from 'lucide-react';

interface ExplorerProps {
    user: User;
    updateUser: () => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ user, updateUser }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [sort, setSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [date, setDate] = useState('');

  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [nftData, txData] = await Promise.all([
            apiService.fetchNFTs(search, category, sort, date),
            apiService.fetchTransactions()
        ]);
        setNfts(nftData);
        setTransactions(txData);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, [search, category, sort, date]);

  const handleModalClose = () => {
      setSelectedNFT(null);
      fetchData();
      updateUser();
  };

  const clearFilters = () => {
      setSearch('');
      setCategory('ALL');
      setSort('NEWEST');
      setDate('');
  };

  const hasActiveFilters = search || category !== 'ALL' || date;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Marketplace Explorer</h1>
                <p className="text-slate-400">Discover assets and view live blockchain activity.</p>
            </div>
            
            <div className="relative w-full md:w-96">
                <SearchIcon className="absolute left-4 top-3.5 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search assets, creators, or types..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white/10"
                />
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-slate-400 mr-2">
                <Filter size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            </div>

            {/* Category Select */}
            <div className="relative">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none bg-black/40 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 pr-8 focus:border-indigo-500 focus:outline-none cursor-pointer hover:bg-black/60 transition-colors"
                >
                    <option value="ALL">All Categories</option>
                    {Object.values(NFTType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400"></div>
                </div>
            </div>

            {/* Sort Select */}
            <div className="relative">
                <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="appearance-none bg-black/40 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 pr-8 focus:border-indigo-500 focus:outline-none cursor-pointer hover:bg-black/60 transition-colors"
                >
                    <option value="NEWEST">Newest First</option>
                    <option value="OLDEST">Oldest First</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                     <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400"></div>
                </div>
            </div>

            {/* Date Picker */}
            <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-black/40 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-3 py-2 focus:border-indigo-500 focus:outline-none hover:bg-black/60 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="ml-auto flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                >
                    <X size={14} />
                    <span>Clear All</span>
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content: NFTs */}
          <div className="lg:col-span-3">
            {loading ? (
                <div className="text-center py-20">
                    <span className="text-slate-500 animate-pulse">Scanning chain data...</span>
                </div>
            ) : nfts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
                    <p className="text-slate-500">No assets found matching your query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nfts.map(nft => (
                        <NFTCard 
                            key={nft.id} 
                            nft={nft} 
                            onClick={() => setSelectedNFT(nft)}
                        />
                    ))}
                </div>
            )}
          </div>

          {/* Sidebar: Recent Activity */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 h-fit sticky top-24 hidden lg:block">
              <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-4">
                  <Activity className="text-indigo-400" size={20} />
                  <h3 className="font-bold text-white">Live Transactions</h3>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {transactions.length === 0 ? (
                       <p className="text-xs text-slate-500">No transactions recorded yet.</p>
                  ) : (
                      transactions.map(tx => (
                          <div key={tx.txId} className="bg-black/20 p-3 rounded-lg border border-white/5">
                              <div className="flex justify-between items-center mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tx.type === 'MINT' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                      {tx.type}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs text-slate-300 font-medium truncate mb-1">{tx.data}</p>
                              <div className="flex items-center text-[10px] text-slate-500 space-x-1">
                                  <span className="font-mono text-xs">{tx.from === 'SYSTEM' ? 'System' : tx.from.substring(0,4)+'...'}</span>
                                  <ArrowRightLeft size={10} />
                                  <span className="font-mono text-xs">{tx.to.substring(0,4)}...</span>
                              </div>
                              <div className="mt-1 text-[10px] text-slate-600 font-mono truncate">
                                  Tx: {tx.txId}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {selectedNFT && (
          <NFTDetailModal 
            nft={selectedNFT} 
            currentUser={user}
            onClose={handleModalClose}
            onUpdate={handleModalClose}
          />
      )}
    </div>
  );
};

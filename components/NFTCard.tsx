
import React, { useState } from 'react';
import { NFT } from '../types';
import { Clock, Copy, Check } from 'lucide-react';

interface NFTCardProps {
  nft: NFT;
  onClick?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onClick }) => {
  const [copied, setCopied] = useState(false);

  // Helper to resolve image URL
  const getImageUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000${url}`;
  };

  const imageSrc = nft.metadata.images && nft.metadata.images.length > 0 
    ? getImageUrl(nft.metadata.images[0]) 
    : 'https://via.placeholder.com/400';

  const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(nft.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={onClick}
      className="relative group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-900 relative">
        <img 
          src={imageSrc}
          alt={nft.metadata.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase text-white border border-white/10">
            {nft.type}
        </div>

        {/* Sale Badge */}
        {nft.isForSale && (
            <div className="absolute top-2 right-2 bg-green-500 text-black px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg shadow-green-500/20">
                For Sale
            </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-white truncate pr-2">{nft.metadata.name}</h3>
            {nft.isForSale && (
                <span className="text-green-400 font-mono text-xs font-bold">{nft.price} ETH</span>
            )}
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
             <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                {nft.owner.substring(0,1)}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Owner</span>
                <span className="text-xs text-slate-300 truncate max-w-[100px]">{nft.owner === 'SYSTEM' ? 'System' : nft.owner.substring(0,8) + '...'}</span>
             </div>
        </div>

        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500">
           <div className="flex items-center space-x-1">
               <Clock size={10} />
               <span>{new Date(nft.metadata.createdDate).toLocaleDateString()}</span>
           </div>
           
           <div className="flex items-center space-x-2 bg-black/20 px-2 py-1 rounded border border-white/5">
                <span className="font-mono text-indigo-400">#{nft.id}</span>
                <button onClick={handleCopy} className="hover:text-white transition-colors">
                    {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

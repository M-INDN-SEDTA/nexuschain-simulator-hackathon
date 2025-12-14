
import React, { useState } from 'react';
import { NFT, User, NFTType } from '../types';
import { X, User as UserIcon, Calendar, Maximize, Heart, ShoppingCart, Copy, Check, Settings, ArrowRight, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface NFTDetailModalProps {
  nft: NFT;
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void; // Refresh parent
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, currentUser, onClose, onUpdate }) => {
  const [buying, setBuying] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);
  
  // Management State
  const [manageMode, setManageMode] = useState(false);
  const [newPrice, setNewPrice] = useState(nft.price.toString());
  const [newIsForSale, setNewIsForSale] = useState(nft.isForSale);

  const isOwner = nft.owner === currentUser.id;
  const isSaved = currentUser.savedItems.includes(nft.id);
  const isIdentity = nft.type === NFTType.IDENTITY;

  const handleRequestPurchase = async () => {
      setBuying(true);
      const res = await apiService.createTradeRequest(nft.id, currentUser.id);
      if (res.success) {
          setShowRequestSuccess(true);
          // Auto-close success message and modal
          setTimeout(() => {
              setShowRequestSuccess(false);
              onUpdate();
              onClose();
          }, 3000);
      } else {
          alert("Request Failed: " + res.error);
      }
      setBuying(false);
  };

  const handleSave = async () => {
      await apiService.toggleSave(nft.id, currentUser.id);
      onUpdate();
  };

  const handleUpdateListing = async () => {
      setUpdating(true);
      try {
          await apiService.updateNFT(nft.id, {
              price: parseFloat(newPrice),
              isForSale: newIsForSale
          });
          onUpdate();
          setManageMode(false);
      } catch (error) {
          alert("Failed to update listing.");
      } finally {
          setUpdating(false);
      }
  };

  const handleCopyId = () => {
      navigator.clipboard.writeText(nft.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Helper to resolve image URL
  const getImageUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        
      {/* Success Popup Overlay */}
      {showRequestSuccess && (
         <div className="absolute z-50 top-10 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center space-x-4 animate-fade-in-up backdrop-blur-md border border-white/20">
             <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle size={24} />
             </div>
             <div>
                 <h4 className="font-bold text-lg">Purchase Request Created</h4>
                 <p className="text-sm opacity-90">Visit the Transactions page to view the status.</p>
             </div>
             <button onClick={onClose} className="ml-4 hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
         </div>
      )}

      <div className="bg-[#1a1a1a] w-full max-w-5xl rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-2xl relative">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-black relative flex flex-col min-h-[300px] md:min-h-0">
            <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20 relative">
                 {/* ID Badge Overlay */}
                 <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono border border-white/10 z-10">
                     #{nft.id}
                 </div>
                <img 
                    src={getImageUrl(nft.metadata.images[selectedImage])} 
                    className="max-h-full max-w-full object-contain drop-shadow-2xl" 
                />
            </div>
            {/* Thumbnails */}
            {nft.metadata.images.length > 1 && (
                <div className="h-20 md:h-24 bg-[#111] flex items-center space-x-2 p-2 overflow-x-auto border-t border-white/10 no-scrollbar">
                    {nft.metadata.images.map((img, idx) => (
                        <img 
                            key={idx} 
                            src={getImageUrl(img)} 
                            onClick={() => setSelectedImage(idx)}
                            className={`h-16 w-16 md:h-20 md:w-20 object-cover rounded cursor-pointer border-2 transition-all flex-shrink-0 ${selectedImage === idx ? 'border-indigo-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        />
                    ))}
                </div>
            )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-[#1a1a1a] max-h-[60vh] md:max-h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs font-bold uppercase tracking-wider">
                            {nft.type}
                        </span>
                        <div 
                            onClick={handleCopyId}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center space-x-2 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <span className="text-xs font-mono text-slate-400">COPY ID</span>
                            {copied ? <Check size={12} className="text-green-400"/> : <Copy size={12} className="text-slate-500"/>}
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{nft.metadata.name}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {nft.metadata.description}
            </p>

            {/* Owner Management Section */}
            {isOwner && !isIdentity && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center space-x-2 text-indigo-400">
                             <Settings size={16} />
                             <span className="text-sm font-bold uppercase">Listing Management</span>
                         </div>
                         <button 
                            onClick={() => setManageMode(!manageMode)}
                            className="text-xs text-slate-500 underline hover:text-white"
                         >
                             {manageMode ? 'Cancel' : 'Edit Listing'}
                         </button>
                     </div>

                     {manageMode ? (
                         <div className="space-y-4 animate-fade-in">
                             <div className="flex items-center justify-between">
                                 <span className="text-sm text-slate-300">List for Sale?</span>
                                 <div 
                                    onClick={() => setNewIsForSale(!newIsForSale)}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${newIsForSale ? 'bg-green-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newIsForSale ? 'translate-x-6' : ''}`} />
                                </div>
                             </div>
                             
                             {newIsForSale && (
                                 <div>
                                     <label className="text-xs text-slate-500 uppercase block mb-1">Price (ETH)</label>
                                     <input 
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white font-mono"
                                     />
                                 </div>
                             )}

                             <button 
                                onClick={handleUpdateListing}
                                disabled={updating}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm"
                             >
                                 {updating ? 'Updating...' : 'Save Changes'}
                             </button>
                         </div>
                     ) : (
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-400">Current Status:</span>
                             <span className={nft.isForSale ? 'text-green-400 font-bold' : 'text-slate-500 italic'}>
                                 {nft.isForSale ? `Listed at ${nft.price} ETH` : 'Not Listed'}
                             </span>
                         </div>
                     )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Creator</span>
                    <div className="flex items-center space-x-2 text-white text-sm font-medium truncate">
                        <UserIcon size={14} />
                        <span>{nft.metadata.creator}</span>
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Size / Specs</span>
                    <div className="flex items-center space-x-2 text-white text-sm font-medium">
                        <Maximize size={14} />
                        <span>{nft.metadata.size || 'N/A'}</span>
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Created</span>
                    <div className="flex items-center space-x-2 text-white text-sm font-medium">
                        <Calendar size={14} />
                        <span>{new Date(nft.metadata.createdDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Attributes Grid */}
            {nft.metadata.attributes.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Attributes</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {nft.metadata.attributes.map((attr, idx) => (
                            <div key={idx} className="bg-indigo-500/5 border border-indigo-500/20 rounded p-2">
                                <span className="block text-[10px] text-indigo-300/70 uppercase">{attr.trait_type}</span>
                                <span className="block text-sm font-medium text-indigo-100">{attr.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ownership History */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">History</h4>
                <div className="bg-black/30 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                    {nft.history.length === 0 ? (
                        <p className="text-xs text-slate-600 italic">No previous transfers.</p>
                    ) : (
                        nft.history.map((h, i) => (
                            <div key={i} className="text-xs text-slate-400 flex justify-between items-center bg-white/5 p-2 rounded">
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono">{h.from.substring(0,6)}...</span>
                                    <span className="text-slate-600">→</span>
                                    <span className="font-mono">{h.to.substring(0,6)}...</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-green-500 font-bold">{h.price} ETH</span>
                                    <span className="text-[10px] text-slate-600">{new Date(h.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                     {nft.isForSale ? (
                         <div>
                             <span className="text-xs text-slate-500 block">Current Price</span>
                             <span className="text-3xl font-bold text-green-400">{nft.price} <span className="text-sm text-green-600">ETH</span></span>
                         </div>
                     ) : (
                         <div className="flex flex-col">
                             <span className="text-slate-500 text-xs uppercase">Status</span>
                             <span className="text-slate-400 font-medium italic">Not Listed For Sale</span>
                         </div>
                     )}
                </div>

                <div className="flex space-x-3">
                    <button 
                        onClick={handleSave}
                        className={`p-3 rounded-xl border border-white/10 transition-colors ${isSaved ? 'bg-pink-500/20 text-pink-500 border-pink-500/50' : 'hover:bg-white/5 text-slate-400'}`}
                        title={isSaved ? "Remove from Saved" : "Save Item"}
                    >
                        <Heart fill={isSaved ? "currentColor" : "none"} size={24} />
                    </button>
                    
                    {!isOwner && nft.isForSale && (
                        <button 
                            onClick={handleRequestPurchase}
                            disabled={buying}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all"
                        >
                            <ShoppingCart size={20} />
                            <span>{buying ? 'Requesting...' : 'Request Purchase'}</span>
                        </button>
                    )}
                    
                    {isOwner && !manageMode && (
                        <button className="px-8 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl cursor-default border border-white/5">
                            You Own This
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { NFTType, NFTMetadata, User, NFTAttribute, ViewState } from '../types';
import { Wand2, Loader2, Tag, Upload, X, DollarSign, User as UserIcon, Maximize, CheckCircle, ArrowRight } from 'lucide-react';

interface MintingStationProps {
    user: User;
    setView?: (view: ViewState) => void;
}

// FIX: Component defined outside to prevent re-creation on every render
interface CategoryInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (name: string, value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ label, name, type = "text", placeholder = "", value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
        />
    </div>
);

export const MintingStation: React.FC<MintingStationProps> = ({ user, setView }) => {
  const [activeTab, setActiveTab] = useState<NFTType>(NFTType.OWNERSHIP);
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedId, setLastMintedId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Common Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [creator, setCreator] = useState(user.name);
  const [price, setPrice] = useState('');
  const [isForSale, setIsForSale] = useState(false);
  
  // Specific Fields State
  const [specificFields, setSpecificFields] = useState<Record<string, string>>({});

  // File State
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      setSpecificFields({});
      // Reset sale status when switching to Identity as it cannot be sold
      if (activeTab === NFTType.IDENTITY) setIsForSale(false);
  }, [activeTab]);

  useEffect(() => {
    return () => {
        previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        if (e.target.files.length + files.length > 8) {
            alert("Maximum 8 images allowed.");
            return;
        }
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || files.length === 0) {
        alert("Name and at least one image are required.");
        return;
    }

    setIsMinting(true);
    try {
      const attributes: NFTAttribute[] = [
          { trait_type: "Origin", value: "NexusChain Mint" },
          { trait_type: "Creator", value: creator }
      ];

      Object.entries(specificFields).forEach(([key, value]) => {
          if (value) attributes.push({ trait_type: key, value });
      });

      const metadata: NFTMetadata = {
        name,
        description,
        images: [], 
        size,
        creator,
        attributes,
        createdDate: Date.now()
      };

      const nft = await apiService.mintNFT(
          user.id, 
          activeTab, 
          metadata, 
          parseFloat(price) || 0, 
          activeTab === NFTType.IDENTITY ? false : isForSale,
          files
      );
      
      setLastMintedId(nft.id);
      setShowSuccessModal(true);

      // Auto close modal
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 5000);
      
      // Reset form
      setName('');
      setDescription('');
      setFiles([]);
      setPreviews([]);
      setPrice('');
      setIsForSale(false);
      setSpecificFields({});
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert("Failed to mint. Check server connection.");
    } finally {
      setIsMinting(false);
    }
  };

  const handleSpecificFieldChange = (name: string, value: string) => {
    setSpecificFields(prev => ({ ...prev, [name]: value }));
  };

  const renderSpecificFields = () => {
      switch (activeTab) {
          case NFTType.IDENTITY:
              return (
                  <>
                    <CategoryInput label="Nationality" name="Nationality" value={specificFields['Nationality']} onChange={handleSpecificFieldChange} />
                    <CategoryInput label="Date of Birth" name="DOB" type="date" value={specificFields['DOB']} onChange={handleSpecificFieldChange} />
                    <CategoryInput label="Role / Title" name="Role" value={specificFields['Role']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.OWNERSHIP:
              return (
                  <>
                    <CategoryInput label="Serial Number" name="Serial Number" value={specificFields['Serial Number']} onChange={handleSpecificFieldChange} />
                    <CategoryInput label="Material" name="Material" value={specificFields['Material']} onChange={handleSpecificFieldChange} />
                    <CategoryInput label="Condition" name="Condition" value={specificFields['Condition']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.TICKET:
              return (
                  <>
                     <CategoryInput label="Event Date" name="Event Date" type="datetime-local" value={specificFields['Event Date']} onChange={handleSpecificFieldChange} />
                     <CategoryInput label="Venue / Location" name="Venue" value={specificFields['Venue']} onChange={handleSpecificFieldChange} />
                     <CategoryInput label="Seat / Row" name="Seat" value={specificFields['Seat']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.GAMING:
              return (
                  <>
                      <CategoryInput label="Level / Power" name="Level" type="number" value={specificFields['Level']} onChange={handleSpecificFieldChange} />
                      <CategoryInput label="Class" name="Class" placeholder="e.g. Warrior" value={specificFields['Class']} onChange={handleSpecificFieldChange} />
                      <CategoryInput label="Rarity" name="Rarity" placeholder="e.g. Legendary" value={specificFields['Rarity']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.REAL_ESTATE:
              return (
                  <>
                      <CategoryInput label="Property Address" name="Address" value={specificFields['Address']} onChange={handleSpecificFieldChange} />
                      <CategoryInput label="Square Footage" name="SqFt" type="number" value={specificFields['SqFt']} onChange={handleSpecificFieldChange} />
                      <CategoryInput label="Property Type" name="Type" placeholder="Apartment, House..." value={specificFields['Type']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.MUSIC:
              return (
                  <>
                       <CategoryInput label="Artist" name="Artist" value={specificFields['Artist']} onChange={handleSpecificFieldChange} />
                       <CategoryInput label="Genre" name="Genre" value={specificFields['Genre']} onChange={handleSpecificFieldChange} />
                       <CategoryInput label="Duration" name="Duration" placeholder="3:45" value={specificFields['Duration']} onChange={handleSpecificFieldChange} />
                  </>
              );
          case NFTType.ART:
              return (
                  <>
                       <CategoryInput label="Medium" name="Medium" placeholder="Oil, Digital, etc." value={specificFields['Medium']} onChange={handleSpecificFieldChange} />
                       <CategoryInput label="Year Created" name="Year" type="number" value={specificFields['Year']} onChange={handleSpecificFieldChange} />
                  </>
              );
           case NFTType.COLLECTIBLE:
               return (
                   <>
                        <CategoryInput label="Edition Number" name="Edition" value={specificFields['Edition']} onChange={handleSpecificFieldChange} />
                        <CategoryInput label="Series / Collection" name="Series" value={specificFields['Series']} onChange={handleSpecificFieldChange} />
                   </>
               );
          default:
              return null;
      }
  };

  return (
    <div className="min-h-screen p-6 pb-24 max-w-5xl mx-auto animate-fade-in relative">
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/20 max-w-md w-full relative overflow-hidden">
               <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                   <X size={20} />
               </button>
               <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400 border border-green-500/30">
                       <CheckCircle size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2">Mint Successful!</h2>
                   <p className="text-slate-400 mb-6">
                       Your asset <span className="text-green-400 font-mono">#{lastMintedId}</span> has been created and added to the blockchain.
                   </p>
                   
                   <div className="flex w-full space-x-3">
                       <button 
                         onClick={() => setView?.('DASHBOARD')}
                         className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center"
                       >
                           <span>Go to Assets</span>
                           <ArrowRight size={18} className="ml-2" />
                       </button>
                   </div>
               </div>
               
               {/* Progress bar for auto-close */}
               <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-[width_5s_linear_forwards] w-full origin-left"></div>
           </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-12">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 bg-black/20 no-scrollbar">
            {Object.values(NFTType).map(cat => (
                 <button
                 key={cat}
                 onClick={() => { setActiveTab(cat); setLastMintedId(null); }}
                 className={`px-6 py-4 flex-shrink-0 text-sm font-bold tracking-wide transition-colors ${
                   activeTab === cat 
                     ? 'border-b-2 border-indigo-500 text-indigo-400 bg-white/5' 
                     : 'text-slate-500 hover:text-white'
                 }`}
               >
                 {cat.replace('_', ' ')}
               </button>
            ))}
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create New {activeTab.replace('_', ' ')} Asset</h2>
            <p className="text-slate-400 text-sm">
              Complete the form below to mint to the NexusChain server.
            </p>
          </div>

          <form onSubmit={handleMint} className="space-y-8">
            
            {/* Image Upload */}
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 text-center transition-colors hover:border-slate-500">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageUpload}
                />
                
                {previews.length === 0 ? (
                    <div className="cursor-pointer py-8" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                             <Upload size={32} />
                        </div>
                        <p className="text-slate-300 font-medium">Click to upload images</p>
                        <p className="text-slate-500 text-xs mt-1">Max 8 images allowed</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {previews.length < 8 && (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center border border-white/10 rounded-lg cursor-pointer hover:bg-white/5"
                             >
                                <Upload className="text-slate-500 mb-2" />
                                <span className="text-xs text-slate-500">Add More</span>
                             </div>
                        )}
                    </div>
                )}
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Item Name</label>
                    <input 
                        type="text" 
                        required
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                        placeholder={`e.g. My Awesome ${activeTab.toLowerCase()}`} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Creator / Issuer</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
                        <input 
                            type="text" 
                            value={creator} 
                            onChange={e => setCreator(e.target.value)} 
                            className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-indigo-500 outline-none" 
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your asset in detail..."
                    className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24 resize-none"
                />
            </div>

            {/* Specific Fields Grid */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center">
                    <Tag size={16} className="mr-2 text-indigo-400" />
                    {activeTab} Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderSpecificFields()}
                    
                    {/* Always visible Size/Dim */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Size / Dimensions</label>
                        <div className="relative">
                            <Maximize className="absolute left-3 top-3.5 text-slate-600" size={16} />
                            <input 
                                type="text" 
                                value={size} 
                                onChange={e => setSize(e.target.value)} 
                                placeholder="Optional specs"
                                className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sale Settings - HIDDEN FOR IDENTITY */}
            {activeTab !== NFTType.IDENTITY && (
                <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-indigo-500/20">
                     <div className="flex items-center justify-between">
                         <div>
                             <h3 className="text-sm font-bold text-white">Marketplace Listing</h3>
                             <p className="text-xs text-slate-400">Do you want to list this item for sale immediately?</p>
                         </div>
                         <div 
                            onClick={() => setIsForSale(!isForSale)}
                            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isForSale ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isForSale ? 'translate-x-7' : ''}`} />
                        </div>
                     </div>

                     {isForSale && (
                         <div className="mt-4 animate-fade-in-up">
                              <label className="block text-xs font-bold text-green-400 uppercase mb-2">Sale Price (ETH)</label>
                              <div className="relative">
                                 <DollarSign className="absolute left-3 top-3.5 text-green-500" size={16} />
                                 <input 
                                    type="number" 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)} 
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 pl-10 text-green-400 focus:border-green-500 outline-none font-mono text-lg" 
                                />
                            </div>
                         </div>
                     )}
                </div>
            )}

            <button
              type="submit"
              disabled={isMinting}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                isMinting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25'
              }`}
            >
              {isMinting ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Processing Transaction...</span>
                </>
              ) : (
                <>
                  <Wand2 />
                  <span>Mint {activeTab} Asset</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

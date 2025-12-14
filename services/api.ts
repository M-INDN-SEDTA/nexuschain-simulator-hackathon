
import { NFT, User, NFTType, NFTMetadata, Transaction, TradeRequest } from '../types';

const API_URL = 'http://localhost:5000/api';

export const apiService = {
  async signup(name: string, email: string, password: string): Promise<User> {
    const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getUser(userId: string): Promise<User> {
    const res = await fetch(`${API_URL}/users/${userId}`);
    if (!res.ok) throw new Error("User session invalid");
    return res.json();
  },

  async topUpBalance(userId: string, amount: number): Promise<User> {
    const res = await fetch(`${API_URL}/users/${userId}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('Top up failed');
    return res.json();
  },

  async updateProfile(userId: string, data: { password?: string; profileImage?: string }): Promise<User> {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },

  async fetchNFTs(search?: string, category?: string, sort?: string, date?: string): Promise<NFT[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    if (date) params.append('date', date);

    const res = await fetch(`${API_URL}/nfts?${params.toString()}`);
    return res.json();
  },

  async fetchNFTById(id: string): Promise<NFT> {
    const res = await fetch(`${API_URL}/nfts/${id}`);
    if (!res.ok) {
        throw new Error('NFT not found');
    }
    return res.json();
  },

  async fetchTransactions(): Promise<Transaction[]> {
      const res = await fetch(`${API_URL}/transactions`);
      return res.json();
  },

  async mintNFT(
    ownerId: string, 
    type: NFTType, 
    metadata: NFTMetadata, 
    price: number, 
    isForSale: boolean,
    imageFiles: File[]
  ): Promise<NFT> {
    
    const formData = new FormData();
    formData.append('owner', ownerId);
    formData.append('type', type);
    formData.append('name', metadata.name);
    formData.append('description', metadata.description);
    formData.append('creator', metadata.creator);
    if (metadata.size) formData.append('size', metadata.size);
    formData.append('price', price.toString());
    formData.append('isForSale', isForSale.toString());
    formData.append('attributes', JSON.stringify(metadata.attributes));

    // Append all images
    imageFiles.forEach(file => {
        formData.append('images', file);
    });

    const res = await fetch(`${API_URL}/nfts`, {
      method: 'POST',
      // Note: Content-Type not set headers manually for FormData, browser does it with boundary
      body: formData
    });

    if (!res.ok) throw new Error('Minting failed');
    return res.json();
  },

  async updateNFT(id: string, updates: { price?: number; isForSale?: boolean }): Promise<NFT> {
    const res = await fetch(`${API_URL}/nfts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },

  async createTradeRequest(nftId: string, buyerId: string): Promise<{ success: boolean, error?: string }> {
      const res = await fetch(`${API_URL}/trade-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nftId, buyerId })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
  },

  async fetchTradeRequests(userId: string): Promise<TradeRequest[]> {
      const res = await fetch(`${API_URL}/trade-requests/${userId}`);
      if (!res.ok) return [];
      return res.json();
  },

  async respondToTradeRequest(requestId: string, action: 'accept' | 'reject'): Promise<boolean> {
      const res = await fetch(`${API_URL}/trade-request/${requestId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
      });
      return res.ok;
  },

  // Deprecated direct buy but kept for compatibility if needed elsewhere
  async buyNFT(nftId: string, buyerId: string): Promise<{ success: boolean, nft: NFT, buyer: User, error?: string }> {
    const res = await fetch(`${API_URL}/nfts/${nftId}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, nft: {} as any, buyer: {} as any, error: data.error };
    return data;
  },

  async toggleSave(nftId: string, userId: string): Promise<User> {
    const res = await fetch(`${API_URL}/nfts/${nftId}/toggle-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    return res.json();
  }
};

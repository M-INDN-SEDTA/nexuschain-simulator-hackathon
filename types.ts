
export enum NFTType {
  IDENTITY = 'IDENTITY',
  OWNERSHIP = 'OWNERSHIP',
  TICKET = 'TICKET',
  GAMING = 'GAMING',
  ART = 'ART',
  REAL_ESTATE = 'REAL_ESTATE',
  MUSIC = 'MUSIC',
  COLLECTIBLE = 'COLLECTIBLE'
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface OwnershipHistory {
  from: string;
  to: string;
  price: number;
  date: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  images: string[]; // URLs from server
  attributes: NFTAttribute[];
  size?: string;
  creator: string;
  createdDate: number;
}

export interface NFT {
  id: string; // 6-char UUID
  type: NFTType;
  owner: string; // User ID
  metadata: NFTMetadata;
  txHash: string;
  
  // Market Data
  price: number;
  isForSale: boolean;
  history: OwnershipHistory[];
  likes: string[]; // User IDs
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  balance: number;
  savedItems: string[]; // IDs of NFTs
  profileImage?: string; // URL to avatar
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'MINT' | 'EXPLORER' | 'VERIFIER' | 'PROFILE' | 'REQUESTS';

export interface Transaction {
  txId: string;
  from: string;
  to: string;
  tokenId: string;
  type: 'MINT' | 'SALE';
  timestamp: number;
  data: string;
  price?: number;
}

export interface TradeRequest {
  id: string;
  nftId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: number;
  nftName: string;
  buyerName: string;
  sellerName: string;
  nftImage?: string;
}

export interface Block {
  blockNumber: number;
  timestamp: number;
  transactions: Transaction[];
  hash: string;
  previousHash: string;
}

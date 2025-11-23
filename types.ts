
export enum ViewMode {
  FEED = 'FEED',
  WATCH = 'WATCH',
  CHAT = 'CHAT',
  CREATOR = 'CREATOR',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  EXPLORE = 'EXPLORE',
  CREATE_REEL = 'CREATE_REEL',
  MARKET = 'MARKET'
}

export type PrivacyLevel = 'public' | 'contacts' | 'private';

export interface PrivacySettings {
  email: PrivacyLevel;
  phoneNumber: PrivacyLevel;
  dob: PrivacyLevel;
  address: PrivacyLevel;
  lastActive: PrivacyLevel;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  subscribers?: string;
  subscriberCount?: number; // Numeric for algos
  subscriptions?: string[]; // IDs of users subscribed to
  bio?: string;
  coverImage?: string;
  following?: string;
  followingIds?: string[]; 
  postsCount?: number;
  isOnline?: boolean;
  lastActive?: number; // Timestamp
  affinityScore?: number; // Dynamic score relative to current user
  
  // Extended Profile Details
  firstName?: string;
  lastName?: string;
  dob?: string; // YYYY-MM-DD
  age?: number;
  countryCode?: string;
  pincode?: string;
  address?: string;
  optionalPhoneNumber?: string;
  
  website?: string;
  location?: string;
  joinedDate?: string;
  email?: string;
  statusMessage?: string;
  phoneNumber?: string;
  
  // Configuration
  isProfileComplete?: boolean;
  privacySettings?: PrivacySettings;

  // Social Links
  twitter?: string;
  linkedin?: string;
  github?: string;
  
  // Preferences
  themePreference?: 'light' | 'dark' | 'system';
  contentPreferences?: string[]; // e.g. ['tech', 'art']
  
  savedPostIds?: string[]; // Bookmarks
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  members: number;
  isJoined?: boolean;
  tags?: string[];
  trendingScore?: number;
  creatorId?: string; // ID of the user who created it
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
  unixTimestamp?: number; // For sorting
  likes?: number;
  replies?: Comment[]; // Nested replies
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  commentsList?: Comment[];
  shares: number;
  timestamp: string;
  unixTimestamp?: number; // Crucial for time-decay algorithms
  type: 'text' | 'image' | 'video';
  communityId?: string; // Optional link to a community
  
  // Algorithmic Metadata
  viewCount?: number;
  engagementScore?: number; // Calculated dynamically
  tags?: string[];
  category?: string;
  
  // Social Commerce
  taggedProductId?: string;
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  likes: string; // Display string "12K"
  likeCount?: number; // Numeric for sorting
  comments: string;
  author: User;
  description: string;
  filter?: string;
  duration?: number;
  bufferStatus?: 'unloaded' | 'loading' | 'ready'; // For player optimization
}

export interface LongFormVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: string;
  views: string;
  viewCount?: number; // Numeric
  uploadedAt: string;
  unixUploadedAt?: number;
  author: User;
  description: string;
  category: string;
  likes?: string;
  likeCount?: number;
  dislikeCount?: number;
  type?: 'video' | 'short' | 'live';
  tags?: string[];
  privacy?: 'public' | 'private' | 'unlisted';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  encryptionHash?: string; // Simulating E2EE
  replyToId?: string;
}

export interface ChatSession {
  id: string;
  user: User; 
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
  lastActiveTimestamp?: number;
  messages: Message[];
  participants?: User[]; // For groups
  admins?: string[]; // IDs of admins
  typingUsers?: string[]; // IDs of users typing
}

// --- E-Commerce Types ---

export interface Variant {
  name: string; // e.g. Size, Color
  options: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: string; // Display price "$120"
  rawPrice?: number; // Numeric for calc
  discount?: string; // "20% OFF"
  images: string[]; // Array of URLs
  image: string; // Main image (keep for compatibility)
  location: string;
  sellerId: string;
  category: string;
  stock: number;
  variants?: Variant[];
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  shippingTime?: string;
  returnPolicy?: string;
}

export interface PayoutDetails {
  method: 'upi' | 'bank';
  upiId?: string;
  accountNumber?: string;
  ifsc?: string;
  holderName: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  logo: string;
  banner: string;
  rating: number;
  followers: number;
  description: string;
  isVerified?: boolean;
  payoutDetails?: PayoutDetails;
  totalRevenue?: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  variant?: string;
  title: string; // Snapshot
  price: number; // Snapshot
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: string;
  paymentMethod: 'cod' | 'online';
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  user?: User;
  content: string;
  timestamp: string;
  unixTimestamp?: number;
  read: boolean;
  targetImage?: string;
  targetId?: string; // Link to post/video
  priority?: 'high' | 'low';
}

export interface ExploreItem {
  id: string;
  image: string;
  likes: number;
  type: 'image' | 'video';
  category?: string;
  trendingScore?: number;
}

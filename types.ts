
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

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  subscribers?: string;
  subscriberCount?: number; // Numeric for algos
  bio?: string;
  coverImage?: string;
  following?: string;
  followingIds?: string[]; 
  postsCount?: number;
  isOnline?: boolean;
  lastActive?: number; // Timestamp
  affinityScore?: number; // Dynamic score relative to current user
  
  // Extended Profile Details
  website?: string;
  location?: string;
  joinedDate?: string;
  email?: string;
  statusMessage?: string;
  phoneNumber?: string;
  
  // Social Links
  twitter?: string;
  linkedin?: string;
  github?: string;
  
  // Preferences
  themePreference?: 'light' | 'dark' | 'system';
  contentPreferences?: string[]; // e.g. ['tech', 'art']
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
  type?: 'video' | 'short' | 'live';
  tags?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  encryptionHash?: string; // Simulating E2EE
  replyToId?: string;
}

export interface ChatSession {
  id: string;
  user: User; 
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
  lastActiveTimestamp?: number;
  messages: Message[];
  participants?: User[]; // For groups
  typingUsers?: string[]; // IDs of users typing
}

export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  sellerId?: string;
  category?: string;
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

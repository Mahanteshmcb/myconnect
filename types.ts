
export enum ViewMode {
  FEED = 'FEED',
  WATCH = 'WATCH',
  CHAT = 'CHAT',
  CREATOR = 'CREATOR',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  EXPLORE = 'EXPLORE',
  CREATE_REEL = 'CREATE_REEL'
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  subscribers?: string;
  bio?: string;
  coverImage?: string;
  following?: string;
  followingIds?: string[]; // Added for following logic
  postsCount?: number;
  isOnline?: boolean;
  // Extended Profile Details
  website?: string;
  location?: string;
  joinedDate?: string;
  email?: string;
  statusMessage?: string; // For Chat
  phoneNumber?: string; // For Chat profile
  // Social Links
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string; // Group icon
  members: number;
  isJoined?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
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
  type: 'text' | 'image' | 'video';
  communityId?: string; // If posted in a community
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  likes: string;
  comments: string;
  author: User;
  description: string;
  filter?: string; // CSS filter string
}

export interface LongFormVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: string;
  views: string;
  uploadedAt: string;
  author: User;
  description: string;
  category: string;
  likes?: string;
  type?: 'video' | 'short' | 'live'; // Added for filtering
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
}

export interface ChatSession {
  id: string;
  user: User; // For DM, this is the other user. For Group, this is a placeholder or null
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
  messages: Message[];
}

export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  user?: User;
  content: string;
  timestamp: string;
  read: boolean;
  targetImage?: string;
}

export interface ExploreItem {
  id: string;
  image: string;
  likes: number;
  type: 'image' | 'video';
}

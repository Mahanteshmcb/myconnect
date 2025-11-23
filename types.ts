export enum ViewMode {
  FEED = 'FEED',
  WATCH = 'WATCH',
  CHAT = 'CHAT',
  CREATOR = 'CREATOR',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  EXPLORE = 'EXPLORE'
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
  postsCount?: number;
  isOnline?: boolean; // For chat status
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
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  likes: string;
  comments: string;
  author: User;
  description: string;
}

export interface LongFormVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string; // Made required for playback
  duration: string;
  views: string;
  uploadedAt: string;
  author: User;
  description: string;
  category: string;
  likes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read'; // WhatsApp style ticks
  type?: 'text' | 'image' | 'audio';
}

export interface ChatSession {
  id: string;
  user: User;
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
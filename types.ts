export enum ViewMode {
  FEED = 'FEED',
  WATCH = 'WATCH',
  CHAT = 'CHAT',
  CREATOR = 'CREATOR',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  subscribers?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  commentsList?: Comment[]; // Added detailed comments
  shares: number;
  timestamp: string;
  type: 'text' | 'image' | 'video';
}

export interface Video {
  id: string;
  url: string; // Placeholder for video source
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
  duration: string;
  views: string;
  uploadedAt: string;
  author: User;
  description: string;
  category: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
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
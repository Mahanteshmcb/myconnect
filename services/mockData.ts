
import { Post, User, Video, ChatSession, Product, LongFormVideo, Notification, ExploreItem } from '../types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Rivera',
  handle: '@arivera',
  avatar: 'https://picsum.photos/id/64/100/100',
  verified: true,
  subscribers: '1.2K',
  bio: 'Digital creator | Tech enthusiast | Coffee lover ☕️\nBuilding the future one pixel at a time.',
  coverImage: 'https://picsum.photos/id/29/1200/400',
  following: '450',
  postsCount: 84,
  isOnline: true,
  website: 'https://alexrivera.dev',
  location: 'San Francisco, CA',
  joinedDate: 'September 2021',
  statusMessage: 'Available for freelance work 🚀',
  phoneNumber: '+1 (555) 012-3456',
  email: 'hello@alexrivera.dev',
  twitter: 'https://twitter.com/alexrivera',
  github: 'https://github.com/alexrivera',
  linkedin: 'https://linkedin.com/in/alexrivera'
};

export const MOCK_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://picsum.photos/id/65/100/100', subscribers: '120K', isOnline: true },
  'u2': { id: 'u2', name: 'David Chen', handle: '@dchen_tech', avatar: 'https://picsum.photos/id/91/100/100', verified: true, subscribers: '850K', isOnline: false },
  'u3': { id: 'u3', name: 'MyConnect AI', handle: '@ai_assistant', avatar: 'https://picsum.photos/id/2/100/100', verified: true, isOnline: true },
  'u4': { id: 'u4', name: 'Emma Wilson', handle: '@emma_art', avatar: 'https://picsum.photos/id/129/100/100', subscribers: '45K', isOnline: true },
  'u5': { id: 'u5', name: 'TechDaily', handle: '@techdaily', avatar: 'https://picsum.photos/id/201/100/100', verified: true, subscribers: '2.1M', isOnline: false },
  'u6': { id: 'u6', name: 'Cooking w/ James', handle: '@chefjames', avatar: 'https://picsum.photos/id/292/100/100', subscribers: '500K', isOnline: true },
};

export const FEED_POSTS: Post[] = [
  {
    id: 'p1',
    author: MOCK_USERS['u2'],
    content: 'Just deployed the new architecture for the cloud cluster. Performance improved by 40%! 🚀 #tech #devlife @sarahj',
    image: 'https://picsum.photos/id/0/800/400',
    likes: 245,
    comments: 42,
    commentsList: [
        { id: 'c1', author: MOCK_USERS['u1'], text: 'This is huge! Great work David.', timestamp: '1h ago' },
        { id: 'c2', author: MOCK_USERS['u5'], text: 'Are you writing a blog post about this?', timestamp: '30m ago' }
    ],
    shares: 12,
    timestamp: '2h ago',
    type: 'image'
  },
  {
    id: 'p2',
    author: MOCK_USERS['u1'],
    content: 'Does anyone know a good hiking trail near the bay area for this weekend? #hiking #bayarea',
    likes: 89,
    comments: 23,
    commentsList: [
        { id: 'c3', author: MOCK_USERS['u4'], text: 'Check out Mount Tamalpais! The views are insane.', timestamp: '3h ago' },
    ],
    shares: 2,
    timestamp: '4h ago',
    type: 'text'
  },
  {
    id: 'p3',
    author: MOCK_USERS['u4'],
    content: 'Working on a new commissioned piece. The lighting in my studio is perfect today. #art #studio',
    image: 'https://picsum.photos/id/106/800/500',
    likes: 1204,
    comments: 89,
    commentsList: [],
    shares: 145,
    timestamp: '6h ago',
    type: 'image'
  }
];

export const REELS_VIDEOS: Video[] = [
  {
    id: 'v1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://picsum.photos/id/28/400/700',
    likes: '12.5K',
    comments: '405',
    author: MOCK_USERS['u4'],
    description: 'Morning routine in the mountains 🏔️'
  },
  {
    id: 'v2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/id/56/400/700',
    likes: '45.2K',
    comments: '1.2K',
    author: MOCK_USERS['u1'],
    description: 'Singapore is amazing at night! 🤯'
  },
  {
    id: 'v3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/id/88/400/700',
    likes: '8.9K',
    comments: '220',
    author: MOCK_USERS['u2'],
    description: 'Coding ASMR - Mechanical Keyboards ⌨️'
  }
];

export const LONG_FORM_VIDEOS: LongFormVideo[] = [
  {
    id: 'lf1',
    title: 'Building a Social Media App in 10 Minutes',
    duration: '12:45',
    views: '1.2M',
    uploadedAt: '2 days ago',
    author: MOCK_USERS['u2'],
    description: 'In this video, we break down the complex architecture of modern social platforms and how to scale them efficiently.',
    category: 'Technology',
    thumbnail: 'https://picsum.photos/id/1/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: '124K',
    type: 'video'
  },
  {
    id: 'lf2',
    title: 'Ultimate 4K Nature Relaxation Film',
    duration: '3:00:00',
    views: '450K',
    uploadedAt: '1 week ago',
    author: MOCK_USERS['u1'],
    description: 'Relax and enjoy the beautiful scenery of the Pacific Northwest.',
    category: 'Nature',
    thumbnail: 'https://picsum.photos/id/10/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: '22K',
    type: 'video'
  },
  {
    id: 'lf3',
    title: 'Reviewing the Latest Smart Home Tech',
    duration: '18:20',
    views: '89K',
    uploadedAt: '5 hours ago',
    author: MOCK_USERS['u5'],
    description: 'Is it worth the upgrade? We test the newest smart home gadgets.',
    category: 'Tech',
    thumbnail: 'https://picsum.photos/id/20/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    likes: '5.6K',
    type: 'video'
  },
  {
    id: 'lf4',
    title: 'How to Paint Abstract Landscapes',
    duration: '24:10',
    views: '32K',
    uploadedAt: '1 day ago',
    author: MOCK_USERS['u4'],
    description: 'Follow along as I create a new piece from scratch using acrylics.',
    category: 'Art',
    thumbnail: 'https://picsum.photos/id/104/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    likes: '1.1K',
    type: 'video'
  },
  {
    id: 'lf5',
    title: 'Street Food Tour: Tokyo',
    duration: '45:30',
    views: '2.5M',
    uploadedAt: '3 weeks ago',
    author: MOCK_USERS['u6'],
    description: 'Tasting the best Yakitori and Ramen in Tokyo!',
    category: 'Travel',
    thumbnail: 'https://picsum.photos/id/225/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    likes: '200K',
    type: 'video'
  },
  {
    id: 'lf6',
    title: 'Minimalist Desk Setup Tour 2025',
    duration: '08:15',
    views: '120K',
    uploadedAt: '3 days ago',
    author: MOCK_USERS['u2'],
    description: 'My productivity setup for coding and content creation.',
    category: 'Technology',
    thumbnail: 'https://picsum.photos/id/374/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    likes: '15K',
    type: 'video'
  },
  {
    id: 'lf7',
    title: '🔴 LIVE: Coding a React App from Scratch',
    duration: 'LIVE',
    views: '1.5K watching',
    uploadedAt: 'Live',
    author: MOCK_USERS['u2'],
    description: 'Join the livestream as we build.',
    category: 'Technology',
    thumbnail: 'https://picsum.photos/id/3/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: '3K',
    type: 'live'
  },
  {
    id: 'lf8',
    title: 'Funny Cat Moments 2024',
    duration: '0:59',
    views: '5M',
    uploadedAt: '1 month ago',
    author: MOCK_USERS['u1'],
    description: 'Cats being cats.',
    category: 'Nature',
    thumbnail: 'https://picsum.photos/id/40/360/640', // Portrait
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    likes: '500K',
    type: 'short'
  }
];

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'c1',
    user: MOCK_USERS['u3'],
    lastMessage: 'How can I help you with your tasks today?',
    unread: 1,
    timestamp: 'Now',
    messages: [
      { id: 'm1', senderId: 'u3', text: 'Hello Alex! I am your personal MyConnect AI Assistant. How can I help you today?', timestamp: new Date(), isAi: true, status: 'read' }
    ]
  },
  {
    id: 'c2',
    user: MOCK_USERS['u1'],
    lastMessage: 'See you at 5!',
    unread: 0,
    timestamp: '10m',
    messages: [
      { id: 'm2', senderId: 'me', text: 'Hey, are we still on for coffee?', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read' },
      { id: 'm3', senderId: 'u1', text: 'Yes! See you at 5!', timestamp: new Date(Date.now() - 1000 * 60 * 10), status: 'delivered' }
    ]
  },
  {
    id: 'c3',
    user: MOCK_USERS['u2'],
    lastMessage: 'Sent a photo',
    unread: 2,
    timestamp: '1h',
    messages: [
      { id: 'm4', senderId: 'u2', text: 'Check out the new design mockups.', timestamp: new Date(Date.now() - 1000 * 60 * 120), status: 'read' },
      { id: 'm5', senderId: 'u2', text: 'What do you think?', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read' }
    ]
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'like', user: MOCK_USERS['u1'], content: 'liked your photo.', timestamp: '2m ago', read: false, targetImage: 'https://picsum.photos/id/0/100/100' },
  { id: 'n2', type: 'comment', user: MOCK_USERS['u2'], content: 'commented: "Great work!"', timestamp: '15m ago', read: false, targetImage: 'https://picsum.photos/id/0/100/100' },
  { id: 'n3', type: 'follow', user: MOCK_USERS['u4'], content: 'started following you.', timestamp: '1h ago', read: true },
  { id: 'n4', type: 'system', content: 'Your subscription to MyConnect Premium was successful.', timestamp: '2h ago', read: true },
  { id: 'n5', type: 'like', user: MOCK_USERS['u5'], content: 'liked your reel.', timestamp: '3h ago', read: true, targetImage: 'https://picsum.photos/id/28/100/100' },
  { id: 'n6', type: 'mention', user: MOCK_USERS['u6'], content: 'mentioned you in a post.', timestamp: '5h ago', read: true, targetImage: 'https://picsum.photos/id/292/100/100' },
  { id: 'n7', type: 'follow', user: MOCK_USERS['u2'], content: 'started following you.', timestamp: '1d ago', read: true },
];

export const EXPLORE_ITEMS: ExploreItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `e${i}`,
  image: `https://picsum.photos/id/${100 + i}/400/${i % 3 === 0 ? 600 : 400}`,
  likes: Math.floor(Math.random() * 5000) + 100,
  type: i % 5 === 0 ? 'video' : 'image'
}));

export const TRENDING_TOPICS = [
  { id: 1, topic: 'Technology', name: '#AIRevolution', posts: '120K' },
  { id: 2, topic: 'Politics', name: 'Senate Vote', posts: '45.2K' },
  { id: 3, topic: 'Sports', name: 'World Cup 2026', posts: '89K' },
  { id: 4, topic: 'Entertainment', name: 'Stranger Things', posts: '210K' },
  { id: 5, topic: 'Business', name: 'Crypto Bull Run', posts: '56K' }
];

export const SUGGESTED_USERS = [
  MOCK_USERS['u3'],
  MOCK_USERS['u5'],
  MOCK_USERS['u6']
];

export const MARKET_ITEMS: Product[] = [];
import { Post, User, Video, ChatSession, Product, LongFormVideo } from '../types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Rivera',
  handle: '@arivera',
  avatar: 'https://picsum.photos/id/64/100/100',
  verified: true,
  subscribers: '1.2K'
};

export const MOCK_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://picsum.photos/id/65/100/100', subscribers: '120K' },
  'u2': { id: 'u2', name: 'David Chen', handle: '@dchen_tech', avatar: 'https://picsum.photos/id/91/100/100', verified: true, subscribers: '850K' },
  'u3': { id: 'u3', name: 'MyConnect AI', handle: '@ai_assistant', avatar: 'https://picsum.photos/id/2/100/100', verified: true },
  'u4': { id: 'u4', name: 'Emma Wilson', handle: '@emma_art', avatar: 'https://picsum.photos/id/129/100/100', subscribers: '45K' },
  'u5': { id: 'u5', name: 'TechDaily', handle: '@techdaily', avatar: 'https://picsum.photos/id/201/100/100', verified: true, subscribers: '2.1M' },
  'u6': { id: 'u6', name: 'Cooking w/ James', handle: '@chefjames', avatar: 'https://picsum.photos/id/292/100/100', subscribers: '500K' },
};

export const FEED_POSTS: Post[] = [
  {
    id: 'p1',
    author: MOCK_USERS['u2'],
    content: 'Just deployed the new architecture for the cloud cluster. Performance improved by 40%! 🚀 #tech #devlife',
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
    content: 'Does anyone know a good hiking trail near the bay area for this weekend?',
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
    content: 'Working on a new commissioned piece. The lighting in my studio is perfect today.',
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
    url: '#',
    thumbnail: 'https://picsum.photos/id/28/400/700',
    likes: '12.5K',
    comments: '405',
    author: MOCK_USERS['u4'],
    description: 'Morning routine in the mountains 🏔️'
  },
  {
    id: 'v2',
    url: '#',
    thumbnail: 'https://picsum.photos/id/56/400/700',
    likes: '45.2K',
    comments: '1.2K',
    author: MOCK_USERS['u1'],
    description: 'You won\'t believe this simple hack! 🤯'
  },
  {
    id: 'v3',
    url: '#',
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
    thumbnail: 'https://picsum.photos/id/1/640/360',
    duration: '12:45',
    views: '1.2M',
    uploadedAt: '2 days ago',
    author: MOCK_USERS['u2'],
    description: 'In this video, we break down the complex architecture of modern social platforms and how to scale them efficiently.',
    category: 'Technology'
  },
  {
    id: 'lf2',
    title: 'Ultimate 4K Nature Relaxation Film',
    thumbnail: 'https://picsum.photos/id/10/640/360',
    duration: '3:00:00',
    views: '450K',
    uploadedAt: '1 week ago',
    author: MOCK_USERS['u1'],
    description: 'Relax and enjoy the beautiful scenery of the Pacific Northwest.',
    category: 'Nature'
  },
  {
    id: 'lf3',
    title: 'Reviewing the Latest Smart Home Tech',
    thumbnail: 'https://picsum.photos/id/20/640/360',
    duration: '18:20',
    views: '89K',
    uploadedAt: '5 hours ago',
    author: MOCK_USERS['u5'],
    description: 'Is it worth the upgrade? We test the newest smart home gadgets.',
    category: 'Tech'
  },
  {
    id: 'lf4',
    title: 'How to Paint Abstract Landscapes',
    thumbnail: 'https://picsum.photos/id/104/640/360',
    duration: '24:10',
    views: '32K',
    uploadedAt: '1 day ago',
    author: MOCK_USERS['u4'],
    description: 'Follow along as I create a new piece from scratch using acrylics.',
    category: 'Art'
  },
  {
    id: 'lf5',
    title: 'Street Food Tour: Tokyo',
    thumbnail: 'https://picsum.photos/id/225/640/360',
    duration: '45:30',
    views: '2.5M',
    uploadedAt: '3 weeks ago',
    author: MOCK_USERS['u6'],
    description: 'Tasting the best Yakitori and Ramen in Tokyo!',
    category: 'Travel'
  },
  {
    id: 'lf6',
    title: 'Minimalist Desk Setup Tour 2025',
    thumbnail: 'https://picsum.photos/id/374/640/360',
    duration: '08:15',
    views: '120K',
    uploadedAt: '3 days ago',
    author: MOCK_USERS['u2'],
    description: 'My productivity setup for coding and content creation.',
    category: 'Technology'
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
      { id: 'm1', senderId: 'u3', text: 'Hello Alex! I am your personal MyConnect AI Assistant. How can I help you today?', timestamp: new Date(), isAi: true }
    ]
  },
  {
    id: 'c2',
    user: MOCK_USERS['u1'],
    lastMessage: 'See you at 5!',
    unread: 0,
    timestamp: '10m',
    messages: [
      { id: 'm2', senderId: 'me', text: 'Hey, are we still on for coffee?', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 'm3', senderId: 'u1', text: 'Yes! See you at 5!', timestamp: new Date(Date.now() - 1000 * 60 * 10) }
    ]
  }
];

export const MARKET_ITEMS: Product[] = [];
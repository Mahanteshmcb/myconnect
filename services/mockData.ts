

import { Post, User, Video, ChatSession, Product, LongFormVideo, Notification, ExploreItem, Community, Store, Order } from '../types';

export const MOCK_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://picsum.photos/id/65/100/100', subscribers: '120K', isOnline: true, followingIds: ['u2', 'u4'], email: 'sarah@example.com', phoneNumber: '+12223334444', password: 'password123' },
  'u2': { id: 'u2', name: 'David Chen', handle: '@dchen_tech', avatar: 'https://picsum.photos/id/91/100/100', verified: true, subscribers: '850K', isOnline: false, followingIds: ['u1', 'u5', 'me'], email: 'david@example.com', phoneNumber: '+13334445555', password: 'password123' },
  'u3': { id: 'u3', name: 'MyConnect AI', handle: '@ai_assistant', avatar: 'https://picsum.photos/id/2/100/100', verified: true, isOnline: true, followingIds: [] },
  'u4': { id: 'u4', name: 'Emma Wilson', handle: '@emma_art', avatar: 'https://picsum.photos/id/129/100/100', subscribers: '45K', isOnline: true, followingIds: ['u1', 'me'] },
  'u5': { id: 'u5', name: 'TechDaily', handle: '@techdaily', avatar: 'https://picsum.photos/id/201/100/100', verified: true, subscribers: '2.1M', isOnline: false, followingIds: ['u2'] },
  'u6': { id: 'u6', name: 'Cooking w/ James', handle: '@chefjames', avatar: 'https://picsum.photos/id/292/100/100', subscribers: '500K', isOnline: true, followingIds: [] },
};

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
  followingIds: ['u1', 'u2', 'u5'], // Following Sarah, David, TechDaily
  postsCount: 84,
  isOnline: true,
  website: 'https://alexrivera.dev',
  location: 'San Francisco, CA',
  joinedDate: 'September 2021',
  statusMessage: 'Available for freelance work 🚀',
  phoneNumber: '+15550123456',
  email: 'hello@alexrivera.dev',
  password: 'password123',
  twitter: 'https://twitter.com/alexrivera',
  github: 'https://github.com/alexrivera',
  linkedin: 'https://linkedin.com/in/alexrivera',
  savedPostIds: [],
  
  // New Profile Fields - Set to Trigger Onboarding
  isProfileComplete: false,
  firstName: 'Alex',
  lastName: 'Rivera',
  dob: '',
  countryCode: '+1',
  pincode: '',
  address: '',
  
  privacySettings: {
      email: 'private',
      phoneNumber: 'private',
      dob: 'contacts',
      address: 'private',
      lastActive: 'public'
  }
};

export const REGISTERED_USERS: User[] = [
    CURRENT_USER,
    MOCK_USERS['u1'],
    MOCK_USERS['u2'],
];

export const getUserByHandle = (handle: string): User | undefined => {
    // Normalize handle (remove @ if present)
    const normalized = handle.startsWith('@') ? handle : `@${handle}`;
    // Search in mock users
    const user = Object.values(MOCK_USERS).find(u => u.handle.toLowerCase() === normalized.toLowerCase());
    if (user) return user;
    // Check current user
    if (normalized.toLowerCase() === CURRENT_USER.handle.toLowerCase()) return CURRENT_USER;
    return undefined;
};

// --- Relational Data Helpers ---

export const getFollowingForUser = (userId: string): User[] => {
    let targetUser = userId === 'me' ? CURRENT_USER : MOCK_USERS[userId];
    if (!targetUser) return [];
    
    // In a real DB this is a join. Here we map IDs to objects.
    return (targetUser.followingIds || []).map(id => 
        id === 'me' ? CURRENT_USER : MOCK_USERS[id]
    ).filter(Boolean);
};

export const getFollowersForUser = (userId: string): User[] => {
    // Find all users who have userId in their followingIds list
    const allUsers = [CURRENT_USER, ...Object.values(MOCK_USERS)];
    return allUsers.filter(u => u.followingIds?.includes(userId));
};

export const getCommunityMembers = (communityId: string): User[] => {
    // Simulate members deterministically based on community ID length/char codes
    // In a real app, this is a DB query.
    const allUsers = [CURRENT_USER, ...Object.values(MOCK_USERS)];
    // Randomly select 50% of users to be "members" for demo purposes, seeded by ID
    return allUsers.filter((u, i) => (communityId.charCodeAt(0) + i) % 2 === 0);
};

// --- Content Data ---

export const MOCK_COMMUNITIES: Community[] = [
  { id: 'g1', name: 'React Developers', members: 15400, avatar: 'https://picsum.photos/id/0/200/200', description: 'Everything React.js, Next.js and more.', isJoined: true, creatorId: 'u2' },
  { id: 'g2', name: 'Digital Art Hub', members: 8200, avatar: 'https://picsum.photos/id/106/200/200', description: 'Share your art and get feedback.', isJoined: false, creatorId: 'u4' },
  { id: 'g3', name: 'Startup Founders', members: 5300, avatar: 'https://picsum.photos/id/20/200/200', description: 'Advice and networking for founders.', isJoined: true, creatorId: 'me' },
  { id: 'g4', name: 'Photography Lovers', members: 22000, avatar: 'https://picsum.photos/id/250/200/200', description: 'Shots from around the world.', isJoined: false, creatorId: 'u1' },
  { id: 'g5', name: 'Gaming Lounge', members: 45000, avatar: 'https://picsum.photos/id/96/200/200', description: 'Discussion for PC and Console gamers.', isJoined: false, creatorId: 'u5' },
  { id: 'g6', name: 'Music Producers', members: 1200, avatar: 'https://picsum.photos/id/145/200/200', description: 'Share your beats and tracks.', isJoined: true, creatorId: 'u6' },
];

export const FEED_POSTS: Post[] = [
  {
    id: 'p1',
    author: MOCK_USERS['u2'],
    content: 'Just deployed the new architecture for the cloud cluster. Performance improved by 40%! 🚀 #tech #devlife @sarahj',
    image: 'https://picsum.photos/id/0/800/400',
    likes: 245,
    comments: 2,
    commentsList: [
        { id: 'c1', author: MOCK_USERS['u1'], text: 'This is huge! Great work David.', timestamp: '1h ago' },
        { id: 'c2', author: MOCK_USERS['u5'], text: 'Are you writing a blog post about this?', timestamp: '30m ago' }
    ],
    shares: 12,
    timestamp: '2h ago',
    type: 'image',
    communityId: 'g1'
  },
  {
    id: 'p2',
    author: MOCK_USERS['u1'],
    content: 'Does anyone know a good hiking trail near the bay area for this weekend? #hiking #bayarea',
    likes: 89,
    comments: 1,
    commentsList: [
        { id: 'c3', author: MOCK_USERS['u4'], text: 'Check out Mount Tamalpais! The views are insane.', timestamp: '3h ago' },
    ],
    shares: 2,
    timestamp: '4h ago',
    type: 'text'
  },
   {
    id: 'p_me_1',
    author: CURRENT_USER,
    content: 'Loving the new setup for my workspace! Productivity through the roof. #desksetup #wfh',
    image: 'https://picsum.photos/id/26/800/600',
    likes: 152,
    comments: 2,
    commentsList: [
        { id: 'c_me_1', author: MOCK_USERS['u2'], text: 'Looks clean! What keyboard is that?', timestamp: '1h ago' }
    ],
    shares: 5,
    timestamp: 'Just now',
    type: 'image',
  },
  {
    id: 'p3',
    author: MOCK_USERS['u4'],
    content: 'Working on a new commissioned piece. The lighting in my studio is perfect today. #art #studio',
    image: 'https://picsum.photos/id/106/800/500',
    likes: 1204,
    comments: 0,
    commentsList: [],
    shares: 145,
    timestamp: '6h ago',
    type: 'image',
    communityId: 'g2'
  },
  {
    id: 'p4',
    author: MOCK_USERS['u5'],
    content: 'Breaking: New AI model released today promises to revolutionize coding workflows. Read our full analysis below. 🤖⚡️',
    likes: 5400,
    comments: 0,
    commentsList: [],
    shares: 1200,
    timestamp: '1h ago',
    type: 'text'
  },
  {
    id: 'p5',
    author: MOCK_USERS['u6'],
    content: 'Fresh homemade pasta! Who wants the recipe? 🍝',
    image: 'https://picsum.photos/id/493/800/600',
    likes: 850,
    comments: 0,
    commentsList: [],
    shares: 45,
    timestamp: '30m ago',
    type: 'image',
    communityId: 'g3' 
  },
  {
    id: 'p6',
    author: MOCK_USERS['u3'], // AI Assistant
    content: 'Tip of the day: You can now summarize long threads using the new AI features in MyConnect! Just mention me. ✨',
    likes: 12000,
    comments: 0,
    commentsList: [],
    shares: 300,
    timestamp: '5h ago',
    type: 'text'
  }
];

export const REELS_VIDEOS: Video[] = [
  {
    id: 'v_me_1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://picsum.photos/id/48/400/700',
    likes: '1.2K',
    comments: '45',
    author: CURRENT_USER,
    description: 'Quick coffee break! ☕️ #coffee'
  },
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
    id: 'lf_me_1',
    title: 'My Desk Setup Tour 2025 | Productivity & Tech',
    duration: '15:30',
    views: '15K',
    uploadedAt: '1 day ago',
    author: CURRENT_USER,
    description: 'Here is a full tour of my 2025 desk setup for programming, video editing, and content creation.',
    category: 'Technology',
    thumbnail: 'https://picsum.photos/id/17/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    likes: '1.1K',
    type: 'video'
  },
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
    id: 'lf_me_2',
    title: 'How I Plan My Week for Maximum Focus',
    duration: '8:45',
    views: '8K',
    uploadedAt: '3 days ago',
    author: CURRENT_USER,
    description: 'A look into my weekly planning process using Notion and other tools.',
    category: 'Productivity',
    thumbnail: 'https://picsum.photos/id/35/640/360',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    likes: '850',
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
      { id: 'm1', senderId: 'u3', text: 'Hello Alex! I am your personal MyConnect AI Assistant. How can I help you today?', timestamp: new Date(), isAi: true, status: 'read', type: 'text' }
    ]
  },
  {
    id: 'c2',
    user: MOCK_USERS['u1'],
    lastMessage: 'See you at 5!',
    unread: 0,
    timestamp: '10m',
    messages: [
      { id: 'm2', senderId: 'me', text: 'Hey, are we still on for coffee?', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read', type: 'text' },
      { id: 'm3', senderId: 'u1', text: 'Yes! See you at 5!', timestamp: new Date(Date.now() - 1000 * 60 * 10), status: 'delivered', type: 'text' }
    ]
  },
  {
    id: 'c3',
    user: MOCK_USERS['u2'],
    lastMessage: 'Sent a photo',
    unread: 2,
    timestamp: '1h',
    messages: [
      { id: 'm4', senderId: 'u2', text: 'Check out the new design mockups.', timestamp: new Date(Date.now() - 1000 * 60 * 120), status: 'read', type: 'text' },
      { id: 'm5', senderId: 'u2', text: 'What do you think?', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read', type: 'text' }
    ]
  },
  {
    id: 'g_chat_1',
    user: { ...CURRENT_USER, id: 'group_placeholder' }, // Placeholder for group logic
    isGroup: true,
    groupName: 'Weekend Hikers',
    groupAvatar: 'https://picsum.photos/id/10/200/200',
    lastMessage: 'Sarah: Rain check?',
    unread: 5,
    timestamp: '2h',
    messages: [
      { id: 'gm1', senderId: 'u1', text: 'Rain check?', timestamp: new Date(Date.now() - 1000 * 60 * 120), status: 'read', type: 'text' }
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

const EXPLORE_CATEGORIES = ['Decor', 'Travel', 'Architecture', 'Food', 'Art', 'Style', 'Music', 'DIY', 'Beauty'];

export const EXPLORE_ITEMS: ExploreItem[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `e${i}`,
  image: `https://picsum.photos/id/${10 + i}/400/${[400, 500, 600, 300][i % 4]}`,
  likes: Math.floor(Math.random() * 5000) + 100,
  type: i % 5 === 0 ? 'video' : 'image',
  category: EXPLORE_CATEGORIES[i % EXPLORE_CATEGORIES.length]
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

export const MOCK_STORES: Store[] = [
    {
        id: 's1',
        sellerId: 'u4', // Emma
        name: 'Emma\'s Art Shop',
        logo: 'https://picsum.photos/id/103/200/200',
        banner: 'https://picsum.photos/id/106/800/200',
        rating: 4.8,
        followers: 1250,
        description: 'Original paintings and digital prints.',
        isVerified: true
    },
    {
        id: 's2',
        sellerId: 'u5', // TechDaily
        name: 'TechDaily Gadgets',
        logo: 'https://picsum.photos/id/201/200/200',
        banner: 'https://picsum.photos/id/0/800/200',
        rating: 4.5,
        followers: 5400,
        description: 'Best tech accessories reviewed by us.',
        isVerified: true
    },
    {
        id: 's3',
        sellerId: 'me', // Current User Store
        name: 'Alex\'s Gear',
        logo: 'https://picsum.photos/id/64/200/200',
        banner: 'https://picsum.photos/id/29/800/200',
        rating: 5.0,
        followers: 45,
        description: 'My used camera gear and accessories.',
        isVerified: true
    }
];

export const MARKET_ITEMS: Product[] = [
    { 
        id: 'p1', 
        title: 'Vintage Camera', 
        price: '$120', 
        rawPrice: 120,
        image: 'https://picsum.photos/id/250/300/300', 
        images: ['https://picsum.photos/id/250/600/600', 'https://picsum.photos/id/251/600/600'],
        location: 'New York, NY', 
        category: 'Electronics', 
        sellerId: 'u4',
        stock: 2,
        description: 'Fully functional vintage camera in excellent condition. Comes with original strap.',
        rating: 4.5,
        reviewCount: 12,
        shippingTime: '3-5 days',
        returnPolicy: 'No returns'
    },
    { 
        id: 'p2', 
        title: 'MacBook Pro M1', 
        price: '$900',
        rawPrice: 900, 
        image: 'https://picsum.photos/id/0/300/300', 
        images: ['https://picsum.photos/id/0/600/600'],
        location: 'San Francisco, CA', 
        category: 'Electronics', 
        sellerId: 'u5',
        stock: 5,
        description: 'Lightly used MacBook Pro. M1 Chip, 16GB RAM, 512GB SSD.',
        rating: 4.9,
        reviewCount: 45,
        shippingTime: '2 days',
        returnPolicy: '14 days return',
        discount: '10% OFF'
    },
    { 
        id: 'p3', 
        title: 'Leather Jacket', 
        price: '$85', 
        rawPrice: 85,
        image: 'https://picsum.photos/id/445/300/300', 
        images: ['https://picsum.photos/id/445/600/600'],
        location: 'Chicago, IL', 
        category: 'Fashion', 
        sellerId: 'u4',
        stock: 1,
        variants: [
            { name: 'Size', options: ['M', 'L'] },
            { name: 'Color', options: ['Brown', 'Black'] }
        ],
        description: 'Genuine leather jacket. Vintage look.',
        rating: 4.2,
        reviewCount: 8,
        shippingTime: '5-7 days',
        returnPolicy: '30 days return'
    },
    { 
        id: 'p4', 
        title: 'Mountain Bike', 
        price: '$350', 
        rawPrice: 350,
        image: 'https://picsum.photos/id/191/300/300', 
        images: ['https://picsum.photos/id/191/600/600'],
        location: 'Denver, CO', 
        category: 'Sports', 
        sellerId: 'u6',
        stock: 1,
        description: 'Rugged mountain bike ready for trails.',
        rating: 4.7,
        reviewCount: 3,
        shippingTime: 'Pickup Only',
        returnPolicy: 'No returns'
    },
    { 
        id: 'p5', 
        title: 'Gaming Monitor', 
        price: '$200', 
        rawPrice: 200,
        image: 'https://picsum.photos/id/20/300/300', 
        images: ['https://picsum.photos/id/20/600/600'],
        location: 'Austin, TX', 
        category: 'Electronics', 
        sellerId: 'me',
        stock: 2,
        description: '27 inch 144hz monitor. Perfect for gaming.',
        rating: 5.0,
        reviewCount: 1,
        shippingTime: '3 days',
        returnPolicy: '7 days return'
    },
    { id: 'p6', title: 'Modern Sofa', price: '$450', rawPrice: 450, image: 'https://picsum.photos/id/32/300/300', images: [], location: 'Seattle, WA', category: 'Home', sellerId: 'u2', stock: 1, rating: 4.6, reviewCount: 10, discount: '15% OFF' },
    { id: 'p7', title: 'Designer Sunglasses', price: '$150', rawPrice: 150, image: 'https://picsum.photos/id/64/300/300', images: [], location: 'Miami, FL', category: 'Fashion', sellerId: 'u1', stock: 10, rating: 4.8, reviewCount: 22 },
    { id: 'p8', title: 'Wireless Earbuds', price: '$45', rawPrice: 45, image: 'https://picsum.photos/id/96/300/300', images: [], location: 'Boston, MA', category: 'Electronics', sellerId: 'u5', stock: 50, rating: 4.3, reviewCount: 150, discount: 'Deal' },
    { id: 'p9', title: 'Skincare Set', price: '$60', rawPrice: 60, image: 'https://picsum.photos/id/100/300/300', images: [], location: 'Los Angeles, CA', category: 'Beauty', sellerId: 'u1', stock: 20, rating: 4.9, reviewCount: 85 },
    { id: 'p10', title: 'Yoga Mat', price: '$25', rawPrice: 25, image: 'https://picsum.photos/id/152/300/300', images: [], location: 'Portland, OR', category: 'Sports', sellerId: 'u6', stock: 100, rating: 4.5, reviewCount: 40 },
    { id: 'p11', title: 'Coffee Maker', price: '$80', rawPrice: 80, image: 'https://picsum.photos/id/204/300/300', images: [], location: 'Seattle, WA', category: 'Home', sellerId: 'u2', stock: 15, rating: 4.7, reviewCount: 60 },
    { id: 'p12', title: 'Running Shoes', price: '$110', rawPrice: 110, image: 'https://picsum.photos/id/319/300/300', images: [], location: 'Austin, TX', category: 'Fashion', sellerId: 'u4', stock: 8, rating: 4.6, reviewCount: 30 },
    { id: 'p13', title: 'Smart Watch', price: '$220', rawPrice: 220, image: 'https://picsum.photos/id/366/300/300', images: [], location: 'San Jose, CA', category: 'Electronics', sellerId: 'u5', stock: 12, rating: 4.4, reviewCount: 95, discount: '5% OFF' },
    { id: 'p14', title: 'Ceramic Vase', price: '$35', rawPrice: 35, image: 'https://picsum.photos/id/400/300/300', images: [], location: 'Santa Fe, NM', category: 'Home', sellerId: 'u4', stock: 5, rating: 5.0, reviewCount: 12 },
    { id: 'p15', title: 'Mechanical Keyboard', price: '$140', rawPrice: 140, image: 'https://picsum.photos/id/425/300/300', images: [], location: 'New York, NY', category: 'Electronics', sellerId: 'me', stock: 3, rating: 4.8, reviewCount: 20 },
    { id: 'p16', title: 'Organic Face Oil', price: '$40', rawPrice: 40, image: 'https://picsum.photos/id/443/300/300', images: [], location: 'San Diego, CA', category: 'Beauty', sellerId: 'u1', stock: 30, rating: 4.7, reviewCount: 55 },
    { id: 'p17', title: 'Designer Desk Lamp', price: '$75', rawPrice: 75, image: 'https://picsum.photos/id/500/300/300', images: [], location: 'San Francisco, CA', category: 'Home', sellerId: 'me', stock: 5, rating: 4.9, reviewCount: 15 },
];

export const MARKET_BANNERS = [
    { id: 1, image: 'https://picsum.photos/id/1/1200/400', title: 'Summer Sale', subtitle: 'Up to 50% off on Fashion' },
    { id: 2, image: 'https://picsum.photos/id/20/1200/400', title: 'Tech Upgrade', subtitle: 'Latest gadgets at best prices' },
    { id: 3, image: 'https://picsum.photos/id/180/1200/400', title: 'Home Decor', subtitle: 'Revamp your living space' },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'o1',
        buyerId: 'u2',
        items: [{ productId: 'p5', quantity: 1, title: 'Gaming Monitor', price: 200 }],
        total: 200,
        status: 'shipped',
        date: '2025-05-10',
        shippingAddress: '123 Tech Lane, SF, CA',
        paymentMethod: 'online'
    },
    {
        id: 'o2',
        buyerId: 'u1',
        items: [{ productId: 'p5', quantity: 1, title: 'Gaming Monitor', price: 200 }],
        total: 200,
        status: 'delivered',
        date: '2025-05-01',
        shippingAddress: '456 Park Ave, NY, NY',
        paymentMethod: 'cod'
    }
];
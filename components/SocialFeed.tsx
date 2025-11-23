
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Post, User, Comment, Community } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, SearchIcon, PlusIcon, CloseIcon, CameraIcon, RepeatIcon, BookmarkIcon, ChartBarIcon, FilmIcon, UsersIcon, CheckIcon, SettingsIcon, SendIcon, TrashIcon, HomeIcon } from './Icons';
import { TRENDING_TOPICS, SUGGESTED_USERS, getUserByHandle, getCommunityMembers, MOCK_USERS } from '../services/mockData';
import { getPersonalizedFeed, formatCompactNumber } from '../services/coreEngine';

interface SocialFeedProps {
  posts: Post[];
  currentUser: User;
  onPostCreate: (content: string, media?: string, type?: 'image' | 'video', communityId?: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onViewProfile: (user: User) => void;
  onUpdateUser?: (user: User) => void; 
  communities?: Community[];
  onJoinCommunity?: (id: string) => void;
  onCreateCommunity?: (name: string, description: string) => void;
  onDeleteCommunity?: (id: string) => void;
}

// --- Stories Logic ---
interface Story {
  id: string;
  user: User;
  img: string;
  isViewed: boolean;
}

// Mock Stories for visual demo
const generateMockStories = (currentUser: User, users: User[]): Story[] => [
    { id: 's0', user: currentUser, isViewed: false, img: 'https://picsum.photos/id/101/350/600' },
    { id: 's1', user: users[0] || currentUser, isViewed: false, img: 'https://picsum.photos/id/102/350/600' },
    { id: 's2', user: users[1] || currentUser, isViewed: true, img: 'https://picsum.photos/id/103/350/600' },
    { id: 's3', user: users[2] || currentUser, isViewed: false, img: 'https://picsum.photos/id/104/350/600' },
    { id: 's4', user: users[3] || currentUser, isViewed: true, img: 'https://picsum.photos/id/106/350/600' },
];

const StoryViewer = ({ stories, initialIndex, onClose }: { stories: Story[], initialIndex: number, onClose: () => void }) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (activeIndex < stories.length - 1) {
                        setActiveIndex(activeIndex + 1);
                        return 0;
                    } else {
                        onClose();
                        return 100;
                    }
                }
                return prev + 1; // 100 ticks approx 5s roughly if interval is 50ms
            });
        }, 50);
        return () => clearInterval(timer);
    }, [activeIndex, stories.length, onClose]);

    const activeStory = stories[activeIndex];

    return (
        <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
            {/* Story Container */}
            <div className="relative w-full md:w-[400px] h-full md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden">
                {/* Progress Bars */}
                <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                    {stories.map((s, idx) => (
                        <div key={s.id} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{ width: idx < activeIndex ? '100%' : idx === activeIndex ? `${progress}%` : '0%' }}
                             ></div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 flex items-center gap-3 z-20">
                    <img src={activeStory.user.avatar} className="w-10 h-10 rounded-full border-2 border-white" />
                    <span className="text-white font-bold">{activeStory.user.name}</span>
                    <span className="text-white/70 text-sm">3h</span>
                </div>
                
                <button onClick={onClose} className="absolute top-8 right-4 text-white z-20">
                    <CloseIcon className="w-8 h-8" />
                </button>

                {/* Image */}
                <img src={activeStory.img} className="w-full h-full object-cover" />

                {/* Tap Areas */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={() => { if(activeIndex > 0) { setActiveIndex(activeIndex - 1); setProgress(0); } }}></div>
                <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={() => { if(activeIndex < stories.length - 1) { setActiveIndex(activeIndex + 1); setProgress(0); } else onClose(); }}></div>

                {/* Reply */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                     <input type="text" placeholder="Send message" className="w-full bg-transparent border border-white/50 rounded-full px-4 py-3 text-white placeholder-white/70 outline-none focus:border-white" />
                </div>
            </div>
        </div>
    );
};

// --- Community Members Modal ---
const CommunityMembersModal = ({ 
    communityId, 
    onClose, 
    onViewProfile 
}: { 
    communityId: string, 
    onClose: () => void, 
    onViewProfile: (u: User) => void 
}) => {
    const members = useMemo(() => getCommunityMembers(communityId), [communityId]);
    
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">Community Members</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {members.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer" onClick={() => { onClose(); onViewProfile(u); }}>
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.handle}</p>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && (
                         <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No members found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Community Dashboard ---
const CommunityDashboard = ({ 
    joinedCommunities, 
    unjoinedCommunities,
    onJoin,
    onSelect,
    onCreate,
    currentUserId,
    onDelete
}: { 
    joinedCommunities: Community[], 
    unjoinedCommunities: Community[],
    onJoin: (id: string) => void,
    onSelect: (id: string) => void,
    onCreate: (name: string, desc: string) => void,
    currentUserId: string,
    onDelete: (id: string) => void
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const handleCreate = () => {
        if(name.trim()) {
            onCreate(name, desc);
            setIsCreating(false);
            setName('');
            setDesc('');
        }
    };

    return (
        <div className="p-4 space-y-6 pb-20">
            {/* Creator */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-blue-600 dark:text-blue-300">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Create a Community</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Connect with like-minded people.</p>
                    </div>
                </div>
                
                {isCreating ? (
                    <div className="space-y-3 animate-fade-in">
                        <input 
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="Community Name (e.g. 'Hiking Club')"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 ring-blue-500"
                            autoFocus
                        />
                        <input 
                            value={desc} onChange={e => setDesc(e.target.value)}
                            placeholder="Description (Optional)"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 ring-blue-500"
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCreate}
                                disabled={!name.trim()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button 
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-bold text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        + Start a New Group
                    </button>
                )}
            </div>

            {/* Your Communities */}
            {joinedCommunities.length > 0 && (
                <div>
                    <h3 className="font-extrabold text-xl dark:text-white mb-4 flex items-center gap-2">
                        Your Groups <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{joinedCommunities.length}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {joinedCommunities.map(c => (
                            <div key={c.id} onClick={() => onSelect(c.id)} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:shadow-md transition group">
                                <img src={c.avatar} className="w-12 h-12 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition">{c.name}</h4>
                                    <p className="text-xs text-gray-500">{formatCompactNumber(c.members)} members</p>
                                </div>
                                {c.creatorId === currentUserId && (
                                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete community?')) onDelete(c.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Discover */}
            <div>
                <h3 className="font-extrabold text-xl dark:text-white mb-4">Discover</h3>
                <div className="space-y-4">
                    {unjoinedCommunities.map(c => (
                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4 flex-1">
                                <img src={c.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{c.name}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2">{c.description || "A community for like-minded people."}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white dark:border-gray-900"></div>)}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">{formatCompactNumber(c.members)} members</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onJoin(c.id)}
                                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-80 transition"
                            >
                                Join Community
                            </button>
                        </div>
                    ))}
                    {unjoinedCommunities.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            You've joined all available communities!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Left Sidebar: Communities ---
const CommunitiesSidebar = ({ 
    communities = [], 
    onJoin, 
    onCreate,
    onDelete,
    selectedCommunityId,
    onSelectCommunity,
    currentUserId
}: { 
    communities: Community[], 
    onJoin: (id: string) => void, 
    onCreate: (name: string, desc: string) => void,
    onDelete: (id: string) => void,
    selectedCommunityId: string | null,
    onSelectCommunity: (id: string | null) => void,
    currentUserId: string
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const handleCreate = () => {
        if(newName.trim()) {
            onCreate(newName, newDesc);
            setIsCreating(false);
            setNewName('');
            setNewDesc('');
        }
    };

    return (
        <div className="hidden lg:flex w-[280px] flex-col gap-4 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pl-6 pr-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">Communities</h2>
                    <button onClick={() => setIsCreating(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-500" title="Create Community">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {isCreating && (
                    <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg animate-fade-in border border-blue-100 dark:border-blue-900">
                        <h3 className="text-xs font-bold text-blue-600 mb-2 uppercase">New Community</h3>
                        <input className="w-full p-2 text-sm rounded border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white mb-2" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                        <input className="w-full p-2 text-sm rounded border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white mb-2" placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        <div className="flex gap-2">
                            <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 bg-blue-500 text-white text-xs py-1.5 rounded font-bold disabled:opacity-50">Create</button>
                            <button onClick={() => setIsCreating(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs py-1.5 rounded font-bold">Cancel</button>
                        </div>
                    </div>
                )}
                
                {selectedCommunityId && (
                     <button 
                        onClick={() => onSelectCommunity(null)} 
                        className="mb-3 text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                     >
                         ← Back to all communities
                     </button>
                )}

                <div className="space-y-3">
                    {communities.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => onSelectCommunity(c.id)}
                            className={`flex items-center gap-3 group cursor-pointer p-2 rounded-xl transition ${selectedCommunityId === c.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            <img src={c.avatar} className="w-10 h-10 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${selectedCommunityId === c.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{c.name}</h4>
                                <p className="text-xs text-gray-500">{formatCompactNumber(c.members)} members</p>
                            </div>
                            
                            {/* Delete button for creator, Join button for others */}
                            {c.creatorId === currentUserId ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); if(confirm(`Delete community "${c.name}"?`)) onDelete(c.id); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition z-10"
                                    title="Delete Community"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onJoin(c.id); }}
                                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition z-10 ${c.isJoined ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    {c.isJoined ? 'Joined' : 'Join'}
                                </button>
                            )}
                        </div>
                    ))}
                    {communities.length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-sm">
                            No communities found. Create one!
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-1">Premium</h3>
                <p className="text-xs opacity-90 mb-3">Unlock exclusive badges, analytics, and more.</p>
                <button className="w-full py-2 bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-gray-50 transition">Upgrade</button>
            </div>
        </div>
    );
};

// --- Right Sidebar: Trends & Suggestions ---
const RightSidebar = ({ 
    onFollow,
    searchQuery,
    setSearchQuery
}: { 
    onFollow: (user: User) => void,
    searchQuery: string,
    setSearchQuery: (q: string) => void
}) => {
    return (
        <div className="hidden xl:block w-[320px] sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pr-6 space-y-6">
            
            {/* Search Box */}
            <div className="bg-white dark:bg-gray-900 rounded-full px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-2 group focus-within:ring-2 ring-blue-500/50 transition-all">
                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                <input 
                    type="text" 
                    placeholder="Search posts, people, tags..." 
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Trends */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mb-4">Trends for you</h2>
                {TRENDING_TOPICS.slice(0, 5).map(t => (
                    <div key={t.id} className="py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 cursor-pointer transition">
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>{t.topic}</span>
                            <span>...</span>
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.posts} posts</div>
                    </div>
                ))}
                <button className="text-blue-500 text-sm mt-2 font-medium w-full text-left px-2">Show more</button>
            </div>

            {/* Who to Follow */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                 <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mb-4">Who to follow</h2>
                 <div className="space-y-4">
                     {SUGGESTED_USERS.map(u => (
                         <div key={u.id} className="flex items-center gap-3">
                             <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{u.name}</h4>
                                 <p className="text-gray-500 text-xs truncate">{u.handle}</p>
                             </div>
                             <button onClick={() => onFollow(u)} className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-80">
                                 Follow
                             </button>
                         </div>
                     ))}
                 </div>
            </div>

            <div className="text-xs text-gray-400 leading-5 px-2">
                Terms of Service Privacy Policy Cookie Policy Accessibility Ads Info More © 2025 MyConnect Corp.
            </div>
        </div>
    );
};

// --- Create Post Component ---
const CreatePost = ({ user, onPost, onViewProfile, communities = [] }: { user: User, onPost: (content: string, media?: string, type?: 'image' | 'video', communityId?: string) => void, onViewProfile: (user: User) => void, communities: Community[] }) => {
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [postTarget, setPostTarget] = useState<'public' | string>('public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const joinedCommunities = communities.filter(c => c.isJoined);

  const handleSubmit = () => {
    if ((content.trim() || mediaPreview)) {
      onPost(
        content, 
        mediaPreview || undefined, 
        mediaType || undefined, 
        postTarget === 'public' ? undefined : postTarget
      );
      setContent('');
      setMediaPreview(null);
      setMediaType(null);
      setPostTarget('public');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setMediaPreview(url);
          setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
      <div className="flex gap-3">
        <img onClick={() => onViewProfile(user)} src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80" />
        <div className="flex-1">
          {/* Post Target Selector */}
          {joinedCommunities.length > 0 && (
              <div className="mb-2">
                <select 
                    value={postTarget} 
                    onChange={e => setPostTarget(e.target.value)}
                    className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full outline-none border-none cursor-pointer appearance-none hover:bg-blue-100 transition"
                >
                    <option value="public">🌎 Everyone</option>
                    {joinedCommunities.map(c => <option key={c.id} value={c.id}>👥 {c.name}</option>)}
                </select>
              </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's happening?`}
            className="w-full bg-transparent text-lg text-gray-900 dark:text-white outline-none resize-none min-h-[60px] placeholder-gray-500"
          />
          {mediaPreview && (
              <div className="relative mt-2 rounded-2xl overflow-hidden group bg-black">
                  {mediaType === 'video' ? (
                      <video src={mediaPreview} controls className="w-full max-h-[300px] object-contain" />
                  ) : (
                      <img src={mediaPreview} className="w-full max-h-[300px] object-contain" />
                  )}
                  <button onClick={() => { setMediaPreview(null); setMediaType(null); }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                      <CloseIcon className="w-4 h-4" />
                  </button>
              </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-1 text-blue-500">
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
             <button onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current!.click() }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition" title="Photo">
                 <CameraIcon className="w-5 h-5" />
             </button>
             <button onClick={() => { fileInputRef.current!.accept = "video/*"; fileInputRef.current!.click() }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition" title="Video">
                 <FilmIcon className="w-5 h-5" />
             </button>
             <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition hidden sm:block" title="Poll">
                 <ChartBarIcon className="w-5 h-5" />
             </button>
        </div>
        <button 
           onClick={handleSubmit}
           disabled={!content.trim() && !mediaPreview}
           className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50 hover:bg-blue-600 transition shadow-md transform active:scale-95"
         >
           Post
         </button>
      </div>
    </div>
  );
};

// --- Feed Comment Modal ---
const FeedCommentModal = ({ post, currentUser, isOpen, onClose, onAddComment }: { post: Post | null, currentUser: User, isOpen: boolean, onClose: () => void, onAddComment: (postId: string, text: string) => void }) => {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen || !post) return null;

    const handleAdd = () => {
        if (!text.trim()) return;
        onAddComment(post.id, text);
        setText('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                     <h3 className="font-bold text-gray-900 dark:text-white">Comments ({post.commentsList?.length || 0})</h3>
                     <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {post.commentsList && post.commentsList.length > 0 ? post.commentsList.map(c => (
                         <div key={c.id} className="flex gap-3 animate-fade-in">
                             <img src={c.author.avatar} className="w-8 h-8 rounded-full object-cover" />
                             <div>
                                 <div className="flex items-center gap-2">
                                     <span className="font-bold text-sm text-gray-900 dark:text-white">{c.author.name}</span>
                                     <span className="text-xs text-gray-500">{c.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-r-xl rounded-bl-xl mt-1">{c.text}</p>
                             </div>
                         </div>
                     )) : (
                         <div className="text-center py-10 text-gray-400">
                             <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                 <CommentIcon className="w-6 h-6 text-gray-300" />
                             </div>
                             No comments yet. Be the first!
                         </div>
                     )}
                 </div>

                 <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-white dark:bg-gray-900">
                     <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" />
                     <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 border border-transparent focus-within:border-blue-500 transition-colors">
                         <input 
                            ref={inputRef}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white"
                         />
                         <button onClick={handleAdd} disabled={!text.trim()} className="ml-2 text-blue-500 font-bold disabled:opacity-50">
                             <SendIcon className="w-5 h-5" />
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

// --- Post Card ---
const PostCard: React.FC<{ 
    post: Post, 
    currentUser: User, 
    onViewProfile: (user: User) => void, 
    onCommentClick: (postId: string) => void,
    onHashtagClick: (tag: string) => void,
    onMentionClick: (handle: string) => void 
}> = ({ post, currentUser, onViewProfile, onCommentClick, onHashtagClick, onMentionClick }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(post.likes);
    const [retweeted, setRetweeted] = useState(false);
    
    // Parse hashtags in content
    const renderContent = (text: string) => {
        const regex = /([#@][\w_]+)/g;
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.startsWith('#')) {
                return <span key={i} onClick={(e) => { e.stopPropagation(); onHashtagClick(part); }} className="text-blue-500 cursor-pointer hover:underline">{part}</span>;
            }
            if (part.startsWith('@')) {
                return <span key={i} onClick={(e) => { e.stopPropagation(); onMentionClick(part); }} className="text-blue-500 cursor-pointer hover:underline">{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition p-4 cursor-pointer">
            <div className="flex gap-3">
                <img src={post.author.avatar} className="w-10 h-10 rounded-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewProfile(post.author); }} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewProfile(post.author); }}>{post.author.name}</span>
                            {post.author.verified && <CheckIcon className="w-4 h-4 text-blue-500" />}
                            <span className="text-gray-500 text-sm">{post.author.handle} · {post.timestamp}</span>
                            {post.communityId && (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">
                                    Community
                                </span>
                            )}
                        </div>
                        <button className="text-gray-400 hover:text-blue-500">...</button>
                    </div>

                    <div className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                        {renderContent(post.content)}
                    </div>

                    {post.image && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            {post.type === 'video' ? (
                                <video src={post.image} controls className="w-full max-h-[500px] object-cover" />
                            ) : (
                                <img src={post.image} className="w-full max-h-[500px] object-cover" />
                            )}
                        </div>
                    )}

                    {/* Interactions */}
                    <div className="flex justify-between items-center mt-3 max-w-md text-gray-500">
                        <button onClick={(e) => { e.stopPropagation(); onCommentClick(post.id); }} className="flex items-center gap-2 group hover:text-blue-500">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"><CommentIcon className="w-4 h-4" /></div>
                            <span className="text-sm">{formatCompactNumber(post.commentsList?.length || post.comments)}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRetweeted(!retweeted); }} className={`flex items-center gap-2 group ${retweeted ? 'text-green-500' : 'hover:text-green-500'}`}>
                            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20"><RepeatIcon className="w-4 h-4" /></div>
                            <span className="text-sm">{formatCompactNumber(post.shares + (retweeted ? 1 : 0))}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }} className={`flex items-center gap-2 group ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                            <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20"><HeartIcon className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /></div>
                            <span className="text-sm">{formatCompactNumber(likes)}</span>
                        </button>
                        <button className="flex items-center gap-2 group hover:text-blue-500">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"><ShareIcon className="w-4 h-4" /></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Social Feed ---
export const SocialFeed: React.FC<SocialFeedProps> = ({ 
    posts, currentUser, onPostCreate, onViewProfile, communities = [], onJoinCommunity, onCreateCommunity, onAddComment, onDeleteCommunity 
}) => {
  const [activeTab, setActiveTab] = useState<'For You' | 'Following' | 'Communities'>('For You');
  const [stories, setStories] = useState<Story[]>(generateMockStories(currentUser, SUGGESTED_USERS));
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);
  
  // Use Post ID instead of Post object to ensure reactivity when comments are added
  const [activePostIdForComments, setActivePostIdForComments] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search Filter State
  const [searchFilter, setSearchFilter] = useState<'all' | 'people' | 'communities' | 'videos' | 'posts'>('all');
  
  // View Community Members
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Derived active post for modal
  const activePostForComments = useMemo(() => 
     posts.find(p => p.id === activePostIdForComments) || null
  , [posts, activePostIdForComments]);

  // Combined Search Results Logic
  const searchResults = useMemo(() => {
      if (!searchQuery.trim()) return null;
      const q = searchQuery.toLowerCase();

      const matchedUsers = Object.values(MOCK_USERS).filter(u => 
          u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)
      );
      
      const matchedCommunities = communities.filter(c => 
          c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );

      const matchedPosts = posts.filter(p => 
          p.content.toLowerCase().includes(q) || 
          p.author.name.toLowerCase().includes(q)
      );

      return {
          users: matchedUsers,
          communities: matchedCommunities,
          posts: matchedPosts
      };

  }, [searchQuery, posts, communities]);

  // Main Feed Display Logic (Standard View)
  const displayPosts = useMemo(() => {
      let filtered = posts;

      // Note: Search is handled separately now, so this filtering mainly handles Tabs
      
      // 1. Tab Filter
      if (activeTab === 'Following') {
          // Strictly show posts from authors in the following list
          filtered = filtered.filter(p => currentUser.followingIds?.includes(p.author.id));
      } else if (activeTab === 'Communities') {
          if (selectedCommunityId) {
              filtered = filtered.filter(p => p.communityId === selectedCommunityId);
          } else {
              filtered = filtered.filter(p => !!p.communityId);
          }
      } else if (activeTab === 'For You') {
          return getPersonalizedFeed(filtered, currentUser);
      }

      return filtered;
  }, [posts, activeTab, currentUser, selectedCommunityId]);

  // Derived Community Lists for Dashboard
  const joinedCommunities = communities.filter(c => c.isJoined);
  const unjoinedCommunities = communities.filter(c => !c.isJoined);

  const handleSelectCommunity = (id: string | null) => {
      setSelectedCommunityId(id);
      setActiveTab('Communities');
      setSearchQuery(''); // Clear search when switching context
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHashtagClick = (tag: string) => {
      setSearchQuery(tag);
      setSearchFilter('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMentionClick = (handle: string) => {
      const user = getUserByHandle(handle);
      if (user) {
          onViewProfile(user);
      } else {
          setSearchQuery(handle);
      }
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const newStory: Story = {
              id: `s_${Date.now()}`,
              user: currentUser,
              img: URL.createObjectURL(file),
              isViewed: false
          };
          setStories(prev => [prev[0], newStory, ...prev.slice(1)]);
      }
  };

  const showCommunityDashboard = activeTab === 'Communities' && !selectedCommunityId && !searchQuery;

  // Render Search Results Helper
  const renderSearchResults = () => {
      if (!searchResults) return null;
      
      const { users, communities: resultComm, posts: resultPosts } = searchResults;
      const showAll = searchFilter === 'all';

      return (
          <div className="pb-20">
             {/* Filter Tabs */}
             <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black sticky top-[60px] z-20">
                 {['all', 'people', 'communities', 'videos', 'posts'].map(filter => (
                     <button
                        key={filter}
                        onClick={() => setSearchFilter(filter as any)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition whitespace-nowrap ${searchFilter === filter ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                     >
                         {filter}
                     </button>
                 ))}
             </div>

             {/* Users Section */}
             {(showAll || searchFilter === 'people') && users.length > 0 && (
                 <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                     <h3 className="font-bold text-lg mb-3 dark:text-white">People</h3>
                     <div className="space-y-4">
                         {users.map(u => (
                             <div key={u.id} className="flex items-center gap-3">
                                 <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                                 <div className="flex-1">
                                     <h4 className="font-bold text-sm dark:text-white">{u.name}</h4>
                                     <p className="text-xs text-gray-500">@{u.handle}</p>
                                 </div>
                                 <button onClick={() => onViewProfile(u)} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold dark:text-white">View</button>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

             {/* Communities Section */}
             {(showAll || searchFilter === 'communities') && resultComm.length > 0 && (
                 <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                     <h3 className="font-bold text-lg mb-3 dark:text-white">Communities</h3>
                     <div className="space-y-3">
                         {resultComm.map(c => (
                             <div key={c.id} className="flex items-center gap-3">
                                 <img src={c.avatar} className="w-10 h-10 rounded-xl object-cover" />
                                 <div className="flex-1">
                                     <h4 className="font-bold text-sm dark:text-white">{c.name}</h4>
                                     <p className="text-xs text-gray-500">{formatCompactNumber(c.members)} members</p>
                                 </div>
                                 <button onClick={() => { if(onJoinCommunity) onJoinCommunity(c.id); }} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold">
                                     {c.isJoined ? 'Joined' : 'Join'}
                                 </button>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

             {/* Posts Section */}
             {(showAll || searchFilter === 'posts' || searchFilter === 'videos') && (
                 <div>
                     {(showAll || searchFilter === 'posts') && <h3 className="font-bold text-lg p-4 pb-2 dark:text-white">Posts</h3>}
                     {resultPosts
                        .filter(p => searchFilter === 'videos' ? p.type === 'video' : true)
                        .map(post => (
                         <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser} 
                            onViewProfile={onViewProfile} 
                            onCommentClick={setActivePostIdForComments}
                            onHashtagClick={handleHashtagClick}
                            onMentionClick={handleMentionClick}
                        />
                     ))}
                     {resultPosts.length === 0 && (
                         <div className="p-4 text-gray-500 text-sm italic">No posts found.</div>
                     )}
                 </div>
             )}
          </div>
      );
  };

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto">
        {viewingStoryIndex !== null && (
            <StoryViewer 
                stories={stories} 
                initialIndex={viewingStoryIndex} 
                onClose={() => setViewingStoryIndex(null)} 
            />
        )}
        
        {activePostForComments && (
            <FeedCommentModal 
                post={activePostForComments}
                currentUser={currentUser}
                isOpen={!!activePostForComments}
                onClose={() => setActivePostIdForComments(null)}
                onAddComment={onAddComment}
            />
        )}
        
        {showMembersModal && selectedCommunityId && (
            <CommunityMembersModal 
                communityId={selectedCommunityId}
                onClose={() => setShowMembersModal(false)}
                onViewProfile={onViewProfile}
            />
        )}

        <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
            
            {/* Left Sidebar (Communities) - Desktop Only */}
            <CommunitiesSidebar 
                communities={communities} 
                onJoin={onJoinCommunity || (() => {})} 
                onCreate={onCreateCommunity || (() => {})}
                onDelete={onDeleteCommunity || (() => {})}
                selectedCommunityId={selectedCommunityId}
                onSelectCommunity={handleSelectCommunity}
                currentUserId={currentUser.id}
            />

            {/* Main Feed */}
            <div className="flex-1 max-w-[600px] w-full border-x border-gray-100 dark:border-gray-800 relative">
                 {/* Header & Tabs */}
                 <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-gray-800">
                     <div className="md:hidden px-4 py-3 flex justify-between items-center">
                         <img src={currentUser.avatar} className="w-8 h-8 rounded-full" onClick={() => onViewProfile(currentUser)} />
                         <span className="font-bold text-lg dark:text-white">Home</span>
                         <button><SettingsIcon className="w-6 h-6 dark:text-white" /></button>
                     </div>
                     <div className="flex">
                        {['For You', 'Following', 'Communities'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => { setActiveTab(tab as any); if(tab !== 'Communities') setSelectedCommunityId(null); setSearchQuery(''); }}
                                className="flex-1 py-4 text-sm font-bold relative hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                                <span className={activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>{tab}</span>
                                {activeTab === tab && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full"></div>}
                            </button>
                        ))}
                     </div>
                 </div>

                 {/* SEARCH RESULTS VIEW */}
                 {searchQuery ? (
                     renderSearchResults()
                 ) : (
                     /* STANDARD VIEW */
                     <>
                        {/* Stories Tray - Only on 'For You' or 'Following' */}
                        {activeTab !== 'Communities' && (
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4 overflow-x-auto no-scrollbar">
                                <input type="file" ref={storyInputRef} className="hidden" accept="image/*" onChange={handleStoryUpload} />
                                {/* Create Story */}
                                <div onClick={() => storyInputRef.current?.click()} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
                                    <div className="relative w-16 h-16">
                                        <img src={currentUser.avatar} className="w-full h-full rounded-full border-2 border-gray-200 dark:border-gray-800 opacity-80" />
                                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-black">
                                            <PlusIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate w-full text-center">Your Story</span>
                                </div>

                                {/* Other Stories */}
                                {stories.slice(1).map((story, idx) => (
                                    <div key={story.id} onClick={() => setViewingStoryIndex(idx + 1)} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer">
                                        <div className={`w-16 h-16 rounded-full p-[2px] ${story.isViewed ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                                            <img src={story.img} className="w-full h-full rounded-full border-2 border-white dark:border-black object-cover" />
                                        </div>
                                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate w-16 text-center">{story.user.name.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* COMMUNITY DASHBOARD VIEW */}
                        {showCommunityDashboard ? (
                            <CommunityDashboard 
                                joinedCommunities={joinedCommunities}
                                unjoinedCommunities={unjoinedCommunities}
                                onJoin={onJoinCommunity || (() => {})}
                                onSelect={handleSelectCommunity}
                                onCreate={onCreateCommunity || (() => {})}
                                currentUserId={currentUser.id}
                                onDelete={onDeleteCommunity || (() => {})}
                            />
                        ) : (
                            /* FEED LIST */
                            <div>
                                {/* Create Post */}
                                {activeTab !== 'Communities' && (
                                    <div className="px-4 mt-4">
                                        <CreatePost 
                                            user={currentUser} 
                                            onPost={onPostCreate} 
                                            onViewProfile={onViewProfile} 
                                            communities={communities} 
                                        />
                                    </div>
                                )}

                                {/* Context Filter Banner for Community */}
                                {selectedCommunityId && (
                                    <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 mb-2 border-y border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                                        <span className="text-sm text-blue-800 dark:text-blue-300 font-bold flex items-center gap-2">
                                            <UsersIcon className="w-4 h-4" />
                                            {communities.find(c => c.id === selectedCommunityId)?.name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setShowMembersModal(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View Members</button>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={() => setSelectedCommunityId(null)} className="text-xs text-blue-500 hover:underline">Clear Filter</button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Community Post Creator */}
                                {selectedCommunityId && (
                                    <div className="px-4 mb-4">
                                        <CreatePost 
                                            user={currentUser} 
                                            onPost={onPostCreate} 
                                            onViewProfile={onViewProfile} 
                                            communities={communities} 
                                        />
                                    </div>
                                )}
                                
                                {/* The Post List */}
                                {displayPosts.length > 0 ? displayPosts.map(post => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        currentUser={currentUser} 
                                        onViewProfile={onViewProfile} 
                                        onCommentClick={setActivePostIdForComments}
                                        onHashtagClick={handleHashtagClick}
                                        onMentionClick={handleMentionClick}
                                    />
                                )) : (
                                    <div className="py-20 text-center text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            {activeTab === 'Following' ? <UsersIcon className="w-8 h-8 text-gray-300" /> : <HomeIcon className="w-8 h-8 text-gray-300" />}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">No Posts Yet</h3>
                                        <p>
                                            {activeTab === 'Following' 
                                                ? "Posts from people you follow will appear here." 
                                                : "Be the first to post something!"}
                                        </p>
                                        {activeTab === 'Following' && (
                                            <button onClick={() => setActiveTab('For You')} className="mt-4 text-blue-500 text-sm font-bold hover:underline">
                                                Discover people to follow
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="py-10 text-center text-gray-500 text-sm">You've reached the end!</div>
                            </div>
                        )}
                     </>
                 )}
            </div>

            {/* Right Sidebar - Desktop Only */}
            <RightSidebar 
                onFollow={onViewProfile} 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

        </div>
    </div>
  );
};

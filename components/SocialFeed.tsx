
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Post, User, Comment, Community } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, SearchIcon, PlusIcon, CloseIcon, CameraIcon, RepeatIcon, BookmarkIcon, ChartBarIcon, FilmIcon, UsersIcon, CheckIcon, SettingsIcon, SendIcon } from './Icons';
import { TRENDING_TOPICS, SUGGESTED_USERS } from '../services/mockData';
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

// --- Left Sidebar: Communities ---
const CommunitiesSidebar = ({ 
    communities = [], 
    onJoin, 
    onCreate,
    selectedCommunityId,
    onSelectCommunity
}: { 
    communities: Community[], 
    onJoin: (id: string) => void, 
    onCreate: (name: string, desc: string) => void,
    selectedCommunityId: string | null,
    onSelectCommunity: (id: string | null) => void
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
                    <button onClick={() => setIsCreating(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-500">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {isCreating && (
                    <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg animate-fade-in">
                        <input className="w-full p-2 text-sm rounded border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white mb-2" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
                        <input className="w-full p-2 text-sm rounded border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white mb-2" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        <div className="flex gap-2">
                            <button onClick={handleCreate} className="flex-1 bg-blue-500 text-white text-xs py-1.5 rounded font-bold">Create</button>
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
                            <button 
                                onClick={(e) => { e.stopPropagation(); onJoin(c.id); }}
                                className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${c.isJoined ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400' : 'bg-blue-500 text-white'}`}
                            >
                                {c.isJoined ? 'Joined' : 'Join'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-1">Premium</h3>
                <p className="text-xs opacity-90 mb-3">Unlock exclusive badges, analytics, and more.</p>
                <button className="w-full py-2 bg-white text-blue-600 font-bold rounded-lg text-sm">Upgrade</button>
            </div>
        </div>
    );
};

// --- Right Sidebar: Trends & Suggestions ---
const RightSidebar = ({ 
    onFollow 
}: { 
    onFollow: (user: User) => void 
}) => {
    return (
        <div className="hidden xl:block w-[320px] sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pr-6 space-y-6">
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
                     <h3 className="font-bold text-gray-900 dark:text-white">Comments</h3>
                     <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {post.commentsList && post.commentsList.length > 0 ? post.commentsList.map(c => (
                         <div key={c.id} className="flex gap-3">
                             <img src={c.author.avatar} className="w-8 h-8 rounded-full" />
                             <div>
                                 <div className="flex items-center gap-2">
                                     <span className="font-bold text-sm text-gray-900 dark:text-white">{c.author.name}</span>
                                     <span className="text-xs text-gray-500">{c.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-800 dark:text-gray-200">{c.text}</p>
                             </div>
                         </div>
                     )) : (
                         <div className="text-center py-10 text-gray-400">No comments yet. Be the first!</div>
                     )}
                 </div>

                 <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                     <img src={currentUser.avatar} className="w-8 h-8 rounded-full" />
                     <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4">
                         <input 
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white"
                         />
                         <button onClick={handleAdd} disabled={!text.trim()} className="ml-2 text-blue-500 font-bold disabled:opacity-50">
                             Post
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

// --- Post Card ---
const PostCard: React.FC<{ post: Post, currentUser: User, onViewProfile: (user: User) => void, onCommentClick: (post: Post) => void }> = ({ post, currentUser, onViewProfile, onCommentClick }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(post.likes);
    const [retweeted, setRetweeted] = useState(false);
    
    // Parse hashtags in content
    const renderContent = (text: string) => {
        const parts = text.split(/(\s+)/);
        return parts.map((part, i) => {
            if (part.startsWith('#')) return <span key={i} className="text-blue-500 cursor-pointer hover:underline">{part}</span>;
            if (part.startsWith('@')) return <span key={i} className="text-blue-500 cursor-pointer hover:underline">{part}</span>;
            return part;
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
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full ml-2">
                                    Community Post
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
                        <button onClick={(e) => { e.stopPropagation(); onCommentClick(post); }} className="flex items-center gap-2 group hover:text-blue-500">
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
    posts, currentUser, onPostCreate, onViewProfile, communities = [], onJoinCommunity, onCreateCommunity, onAddComment 
}) => {
  const [activeTab, setActiveTab] = useState<'For You' | 'Following' | 'Communities'>('For You');
  const [stories, setStories] = useState<Story[]>(generateMockStories(currentUser, SUGGESTED_USERS));
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [activePostForComments, setActivePostForComments] = useState<Post | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  // Filter Posts
  const displayPosts = useMemo(() => {
      let filtered = posts;
      
      if (activeTab === 'Following') {
          filtered = posts.filter(p => currentUser.followingIds?.includes(p.author.id) || p.author.id === currentUser.id);
      }
      
      if (activeTab === 'Communities') {
          // If a specific community is selected, filter by that ID only
          if (selectedCommunityId) {
              filtered = posts.filter(p => p.communityId === selectedCommunityId);
          } else {
              // Otherwise show all community posts
              filtered = posts.filter(p => !!p.communityId);
          }
      }

      return activeTab === 'For You' ? getPersonalizedFeed(filtered, currentUser) : filtered;
  }, [posts, activeTab, currentUser, selectedCommunityId]);

  const handleSelectCommunity = (id: string | null) => {
      setSelectedCommunityId(id);
      setActiveTab('Communities');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                onClose={() => setActivePostForComments(null)}
                onAddComment={onAddComment}
            />
        )}

        <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
            
            {/* Left Sidebar (Communities) - Desktop Only */}
            <CommunitiesSidebar 
                communities={communities} 
                onJoin={onJoinCommunity || (() => {})} 
                onCreate={onCreateCommunity || (() => {})} 
                selectedCommunityId={selectedCommunityId}
                onSelectCommunity={handleSelectCommunity}
            />

            {/* Main Feed */}
            <div className="flex-1 max-w-[600px] w-full border-x border-gray-100 dark:border-gray-800">
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
                                onClick={() => { setActiveTab(tab as any); if(tab !== 'Communities') setSelectedCommunityId(null); }}
                                className="flex-1 py-4 text-sm font-bold relative hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                                <span className={activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>{tab}</span>
                                {activeTab === tab && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full"></div>}
                            </button>
                        ))}
                     </div>
                 </div>

                 {/* Stories Tray */}
                 <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4 overflow-x-auto no-scrollbar">
                     {/* Create Story */}
                     <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
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

                 {/* Create Post */}
                 <div className="px-4 mt-4">
                     <CreatePost 
                        user={currentUser} 
                        onPost={onPostCreate} 
                        onViewProfile={onViewProfile} 
                        communities={communities} 
                     />
                 </div>

                 {/* Feed */}
                 <div>
                     {selectedCommunityId && (
                         <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10 mb-2 border-y border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                             <span className="text-sm text-blue-800 dark:text-blue-300 font-bold">
                                 Viewing: {communities.find(c => c.id === selectedCommunityId)?.name}
                             </span>
                             <button onClick={() => setSelectedCommunityId(null)} className="text-xs text-blue-500 hover:underline">Clear Filter</button>
                         </div>
                     )}
                     
                     {displayPosts.length > 0 ? displayPosts.map(post => (
                         <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser} 
                            onViewProfile={onViewProfile} 
                            onCommentClick={setActivePostForComments}
                        />
                     )) : (
                         <div className="py-20 text-center text-gray-500">
                             <h3 className="text-lg font-bold mb-2">No Posts Yet</h3>
                             <p>Be the first to post something here!</p>
                         </div>
                     )}
                     <div className="py-10 text-center text-gray-500 text-sm">You've reached the end!</div>
                 </div>
            </div>

            {/* Right Sidebar - Desktop Only */}
            <RightSidebar onFollow={onViewProfile} />

        </div>
    </div>
  );
};

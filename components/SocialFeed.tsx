
import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment, Community } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, SearchIcon, PlusIcon, SendIcon, CloseIcon, TrashIcon, CameraIcon, RepeatIcon, BookmarkIcon, ChartBarIcon, FilmIcon, PlayCircleIcon, UsersIcon } from './Icons';
import { TRENDING_TOPICS, SUGGESTED_USERS, MOCK_COMMUNITIES } from '../services/mockData';

interface SocialFeedProps {
  posts: Post[];
  currentUser: User;
  onPostCreate: (content: string, media?: string, type?: 'image' | 'video') => void;
  onViewProfile: (user?: User) => void;
  onUpdateUser?: (user: User) => void; // Added prop for follow updates
}

// --- Skeleton Loader Component ---
const SkeletonPost = () => (
    <div className="bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mt-2"></div>
            </div>
        </div>
        <div className="flex justify-between mt-4 px-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>
    </div>
);

// --- User Hover Card ---
const UserHoverCard = ({ user, children, onViewProfile }: { user: User, children?: React.ReactNode, onViewProfile: (user: User) => void }) => {
    return (
        <div className="relative group inline-block">
            <div onClick={(e) => { e.stopPropagation(); onViewProfile(user); }}>
                {children}
            </div>
            {/* Hover Card Popup */}
            <div className="absolute top-full left-0 z-50 pt-2 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity delay-300 duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-72 p-4 overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                        <img src={user.avatar} className="w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-gray-800" />
                        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full font-bold text-sm hover:opacity-80">
                            Profile
                        </button>
                    </div>
                    <div className="mb-3">
                         <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight hover:underline cursor-pointer" onClick={() => onViewProfile(user)}>{user.name}</h4>
                         <span className="text-gray-500 text-sm">{user.handle}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm mb-4 line-clamp-3">
                        {user.bio || "No bio available."}
                    </p>
                    <div className="flex gap-4 text-sm">
                        <div className="flex gap-1">
                            <span className="font-bold text-gray-900 dark:text-white">{user.following || '0'}</span>
                            <span className="text-gray-500">Following</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-bold text-gray-900 dark:text-white">{user.subscribers || '0'}</span>
                            <span className="text-gray-500">Followers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Create Post Component ---
const CreatePost = ({ user, onPost, onViewProfile }: { user: User, onPost: (content: string, media?: string, type?: 'image' | 'video') => void, onViewProfile: (user: User) => void }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - content.length;
  const progress = (content.length / MAX_CHARS) * 100;
  const progressColor = charsLeft < 20 ? 'text-red-500' : charsLeft < 50 ? 'text-yellow-500' : 'text-blue-500';

  const handleSubmit = () => {
    if ((content.trim() || mediaPreview) && content.length <= MAX_CHARS) {
      onPost(content, mediaPreview || undefined, mediaType || undefined);
      setContent('');
      setMediaPreview(null);
      setMediaType(null);
      setIsFocused(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileClick = (type: 'image' | 'video') => {
      if (fileInputRef.current) {
          // Accept only specific types based on button clicked
          fileInputRef.current.accept = type === 'image' ? "image/*" : "video/*";
          fileInputRef.current.click();
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
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex gap-3">
        <img onClick={() => onViewProfile(user)} src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={`What's happening?`}
            className="w-full bg-transparent text-lg text-gray-900 dark:text-white outline-none resize-none min-h-[50px]"
          />
          
          {mediaPreview && (
              <div className="relative mt-2 rounded-2xl overflow-hidden group bg-black">
                  {mediaType === 'video' ? (
                      <video src={mediaPreview} controls className="w-full h-64 object-contain" />
                  ) : (
                      <img src={mediaPreview} className="w-full h-64 object-contain" />
                  )}
                  <button onClick={() => { setMediaPreview(null); setMediaType(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70">
                      <CloseIcon className="w-4 h-4" />
                  </button>
              </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 text-blue-500">
             {/* Hidden File Input */}
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
             
             <button onClick={() => handleFileClick('image')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition" title="Add Photo">
                 <CameraIcon className="w-5 h-5" />
             </button>
             <button onClick={() => handleFileClick('video')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition" title="Add Video">
                 <FilmIcon className="w-5 h-5" />
             </button>
             <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><span className="text-xl leading-none">GIF</span></button>
             <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><span className="text-xl leading-none">📊</span></button>
        </div>
        <div className="flex items-center gap-4">
             {content.length > 0 && (
                 <div className="flex items-center gap-2">
                     <span className={`text-xs ${charsLeft < 0 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{charsLeft}</span>
                     <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700 relative flex items-center justify-center">
                         <div className={`absolute inset-0 rounded-full border-2 border-transparent ${progressColor}`} style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}></div>
                     </div>
                 </div>
             )}
             <button 
               onClick={handleSubmit}
               disabled={(!content.trim() && !mediaPreview) || charsLeft < 0}
               className="bg-blue-500 text-white px-5 py-1.5 rounded-full font-bold text-sm disabled:opacity-50 hover:bg-blue-600 transition shadow-sm"
             >
               Post
             </button>
        </div>
      </div>
    </div>
  );
};

// --- Rich Text Component (Hashtags/Mentions) ---
const RichText = ({ text }: { text: string }) => {
    const parts = text.split(/((?:#|@)\w+)/g);
    return (
        <p className="text-gray-900 dark:text-gray-100 text-[15px] leading-normal whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.startsWith('#') || part.startsWith('@')) {
                    return <span key={i} className="text-blue-500 hover:underline cursor-pointer">{part}</span>;
                }
                return part;
            })}
        </p>
    );
};

// --- Post Card Component ---
const PostCard: React.FC<{ post: Post, currentUser: User, onViewProfile: (user: User) => void, onHidePost: (id: string) => void, onUnfollow: (id: string) => void }> = ({ post, currentUser, onViewProfile, onHidePost, onUnfollow }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [shares, setShares] = useState(post.shares);
  const [showComments, setShowComments] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentsList || []);
  const [newComment, setNewComment] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent opening post
      if (!liked) {
          setLikes(likes + 1);
          setLiked(true);
      }
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 1000);
  };

  const handleRepost = () => {
      if (reposted) {
          setShares(shares - 1);
      } else {
          setShares(shares + 1);
      }
      setReposted(!reposted);
  };

  const handleBookmark = () => {
      setBookmarked(!bookmarked);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
        id: `c_${Date.now()}`,
        author: currentUser,
        text: newComment,
        timestamp: 'Just now'
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors p-4 cursor-pointer">
      <div className="flex gap-3">
        <UserHoverCard user={post.author} onViewProfile={onViewProfile}>
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer" />
        </UserHoverCard>
        
        <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <UserHoverCard user={post.author} onViewProfile={onViewProfile}>
                        <h3 className="font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:underline">{post.author.name}</h3>
                    </UserHoverCard>
                    {post.author.verified && <span className="text-blue-500 text-[12px]">✔</span>}
                    <UserHoverCard user={post.author} onViewProfile={onViewProfile}>
                        <span className="text-gray-500 dark:text-gray-400 text-sm truncate cursor-pointer hover:underline">{post.author.handle}</span>
                    </UserHoverCard>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">· {post.timestamp}</span>
                    {post.communityId && (
                        <span className="text-sm font-medium text-gray-500">in <span className="text-blue-500 hover:underline">Community {post.communityId}</span></span>
                    )}
                </div>
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }} className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 relative group">
                        ...
                    </button>
                    {showOptions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}></div>
                            <div className="absolute top-6 right-0 bg-white dark:bg-black shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl w-48 z-20 py-2 font-bold text-sm overflow-hidden animate-fade-in">
                                <div onClick={(e) => { e.stopPropagation(); onHidePost(post.id); setShowOptions(false); }} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-2">
                                    <span className="text-lg">😢</span> Not interested
                                </div>
                                {post.author.id !== currentUser.id && (
                                    <div onClick={(e) => { e.stopPropagation(); onUnfollow(post.author.id); setShowOptions(false); }} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-2">
                                        <span className="text-lg">👤</span> Unfollow @{post.author.handle.replace('@','')}
                                    </div>
                                )}
                                <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-2">
                                    <span className="text-lg">🔇</span> Mute @{post.author.handle.replace('@','')}
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 cursor-pointer flex items-center gap-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-lg">🚩</span> Report Post
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mt-1">
                <RichText text={post.content} />
            </div>

            {post.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative select-none" onDoubleClick={handleDoubleTap}>
                    {post.type === 'video' ? (
                        <video controls src={post.image} className="w-full h-auto object-cover max-h-[500px]" />
                    ) : (
                        <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                    )}
                    {showHeartOverlay && post.type !== 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <HeartIcon className="w-24 h-24 text-white animate-like drop-shadow-lg" filled />
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-3 max-w-md text-gray-500 dark:text-gray-400">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                    className="flex items-center gap-2 group hover:text-blue-500 transition"
                    title="Reply"
                >
                    <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                        <CommentIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs group-hover:text-blue-500">{comments.length}</span>
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); handleRepost(); }}
                    className={`flex items-center gap-2 group hover:text-green-500 transition ${reposted ? 'text-green-500' : ''}`}
                    title="Repost"
                >
                    <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20">
                        <RepeatIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs group-hover:text-green-500">{shares}</span>
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                    className={`flex items-center gap-2 group hover:text-red-500 transition ${liked ? 'text-red-500' : ''}`}
                    title="Like"
                >
                    <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20">
                        <HeartIcon className={`w-4 h-4 ${liked ? 'animate-like' : ''}`} filled={liked} />
                    </div>
                    <span className="text-xs group-hover:text-red-500">{likes}</span>
                </button>

                <button className="flex items-center gap-2 group hover:text-blue-500 transition" title="View Analytics">
                    <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                        <ChartBarIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs group-hover:text-blue-500">2.4K</span>
                </button>

                <div className="flex gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                        className={`p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition ${bookmarked ? 'text-blue-500' : ''}`}
                        title="Bookmark"
                    >
                        <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition" title="Share">
                        <ShareIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Comment Section (Inline) */}
            {showComments && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 mb-3">
                        <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Me" />
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 flex items-center transition-all duration-300 ease-in-out focus-within:py-4 focus-within:shadow-md focus-within:ring-1 ring-blue-500/20">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Post your reply" 
                                className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                                autoFocus
                            />
                            <button 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="text-blue-500 disabled:opacity-50 ml-2"
                            >
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 mb-3">
                             <UserHoverCard user={comment.author} onViewProfile={onViewProfile}>
                                <img src={comment.author.avatar} className="w-8 h-8 rounded-full cursor-pointer" alt={comment.author.name} />
                             </UserHoverCard>
                             <div>
                                 <div className="flex items-center gap-2">
                                     <UserHoverCard user={comment.author} onViewProfile={onViewProfile}>
                                         <span className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline">{comment.author.name}</span>
                                     </UserHoverCard>
                                     <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Stories Component ---
const Stories = () => {
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  
  const stories = [
    { id: 1, name: 'Your Story', img: 'https://picsum.photos/id/64/100/100', isUser: true, storyImg: 'https://picsum.photos/id/64/400/800' },
    { id: 2, name: 'Elon', img: 'https://picsum.photos/id/10/100/100', storyImg: 'https://picsum.photos/id/10/400/800' },
    { id: 3, name: 'Mark', img: 'https://picsum.photos/id/12/100/100', storyImg: 'https://picsum.photos/id/12/400/800' },
    { id: 4, name: 'Jane', img: 'https://picsum.photos/id/15/100/100', storyImg: 'https://picsum.photos/id/15/400/800' },
    { id: 5, name: 'Sarah', img: 'https://picsum.photos/id/20/100/100', storyImg: 'https://picsum.photos/id/20/400/800' },
    { id: 6, name: 'David', img: 'https://picsum.photos/id/25/100/100', storyImg: 'https://picsum.photos/id/25/400/800' },
  ];

  useEffect(() => {
      let interval: any;
      if (viewingStory !== null) {
          setProgress(0);
          interval = setInterval(() => {
              setProgress(prev => {
                  if (prev >= 100) {
                      if (viewingStory < stories.length - 1) {
                           setViewingStory(viewingStory + 1);
                           return 0;
                      } else {
                           setViewingStory(null);
                           return 100;
                      }
                  }
                  return prev + 1;
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [viewingStory]);

  const handleStoryClick = (index: number) => {
      if (index === 0) {
          alert("Add to your story!");
      } else {
          setViewingStory(index);
      }
  };

  return (
    <>
        <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar pb-2 px-4 border-b border-gray-100 dark:border-gray-800">
        {stories.map((story, index) => (
            <div key={story.id} onClick={() => handleStoryClick(index)} className="flex flex-col items-center space-y-1 min-w-[72px] cursor-pointer group">
            <div className={`w-[68px] h-[68px] rounded-full p-[3px] ${story.isUser ? 'bg-transparent' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition duration-300'}`}>
                <div className="w-full h-full bg-white dark:bg-black rounded-full p-[3px] relative">
                <img src={story.img} alt={story.name} className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-800" />
                {story.isUser && <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-2 border-white dark:border-gray-900"><PlusIcon className="w-3 h-3"/></div>}
                </div>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-400 font-medium truncate w-full text-center">{story.name}</span>
            </div>
        ))}
        </div>

        {viewingStory !== null && (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center backdrop-blur-2xl">
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={() => setViewingStory(null)} className="text-white p-2 bg-black/20 rounded-full hover:bg-black/50">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="relative w-full md:max-w-[400px] h-full md:h-[85vh] bg-gray-900 md:rounded-2xl overflow-hidden shadow-2xl">
                    <div className="absolute top-3 left-2 right-2 flex gap-1 z-20">
                         {stories.map((_, idx) => (
                             <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-white transition-all duration-100 ease-linear"
                                    style={{ 
                                        width: idx < viewingStory ? '100%' : idx === viewingStory ? `${progress}%` : '0%' 
                                    }}
                                 ></div>
                             </div>
                         ))}
                    </div>
                    
                    <div className="absolute top-6 left-4 flex items-center gap-3 z-20">
                        <img src={stories[viewingStory].img} className="w-8 h-8 rounded-full border border-white/50" />
                        <span className="text-white font-bold shadow-sm text-sm">{stories[viewingStory].name}</span>
                        <span className="text-white/70 text-xs">5h</span>
                    </div>

                    <img src={stories[viewingStory].storyImg} className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={() => setViewingStory(prev => prev && prev > 1 ? prev - 1 : 1)}></div>
                    <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={() => {
                        setProgress(100); 
                        setTimeout(() => {
                             if (viewingStory < stories.length - 1) setViewingStory(viewingStory + 1);
                             else setViewingStory(null);
                        }, 10);
                    }}></div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center gap-3">
                        <input type="text" placeholder="Send message" className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-2.5 text-white placeholder-white/70 focus:border-white outline-none backdrop-blur-sm text-sm" />
                        <button className="text-white p-2 hover:scale-110 transition">
                            <HeartIcon className="w-7 h-7" />
                        </button>
                        <button className="text-white p-2 hover:scale-110 transition">
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

// --- Communities/Groups Sidebar Component ---
const CommunitiesSidebar = ({ communities: initialCommunities }: { communities: Community[] }) => {
    const [communities, setCommunities] = useState(initialCommunities);

    const handleCreateCommunity = () => {
        const name = prompt("Enter community name:");
        if (name) {
            alert(`Community "${name}" created! (Functionality simulated)`);
        }
    };

    const toggleJoin = (id: string) => {
        setCommunities(prev => prev.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c));
    };

    return (
        <div className="bg-gray-50 dark:bg-[#16181c] rounded-2xl p-4 mb-4">
            <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Communities
            </h2>
            <div className="space-y-4">
                {communities.map(comm => (
                    <div key={comm.id} className="flex items-center justify-between group">
                         <div className="flex items-center gap-2">
                             <img src={comm.avatar} className="w-10 h-10 rounded-lg object-cover" alt={comm.name} />
                             <div>
                                 <div className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline">{comm.name}</div>
                                 <div className="text-gray-500 text-xs">{comm.members.toLocaleString()} members</div>
                             </div>
                         </div>
                         <button 
                            onClick={() => toggleJoin(comm.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition ${comm.isJoined ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-500' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}
                         >
                             {comm.isJoined ? 'Joined' : 'Join'}
                         </button>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleCreateCommunity}
                className="w-full mt-4 py-2 border border-blue-500 text-blue-500 rounded-xl text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"
            >
                <PlusIcon className="w-4 h-4" /> Create Community
            </button>
        </div>
    );
};

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, currentUser, onPostCreate, onViewProfile, onUpdateUser }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'For You' | 'Following' | 'Communities'>('For You');
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (containerRef.current && containerRef.current.scrollTop === 0) {
          startY.current = e.touches[0].clientY;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!containerRef.current || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const dy = currentY - startY.current;

      if (containerRef.current.scrollTop <= 0 && dy > 0) {
          setPullDistance(Math.min(dy * 0.45, 120));
      } else {
          setPullDistance(0);
      }
  };

  const handleTouchEnd = () => {
      if (isRefreshing) return;
      if (pullDistance > 60) {
          handleRefresh();
      }
      setPullDistance(0);
  };

  const toggleFollow = (targetId: string) => {
      if (!onUpdateUser) return;
      let newIds = currentUser.followingIds ? [...currentUser.followingIds] : [];
      if (newIds.includes(targetId)) {
          newIds = newIds.filter(id => id !== targetId);
      } else {
          newIds.push(targetId);
      }
      onUpdateUser({ ...currentUser, followingIds: newIds });
  };

  const isFollowing = (userId: string) => {
      return currentUser.followingIds?.includes(userId) || false;
  };

  const handleHidePost = (id: string) => {
      setHiddenPostIds(prev => [...prev, id]);
  };

  // Filter posts based on active tab, search, and hidden posts
  const displayPosts = posts.filter(post => {
      if (hiddenPostIds.includes(post.id)) return false;

      // Search Filter
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = post.content.toLowerCase().includes(q) || 
                          post.author.name.toLowerCase().includes(q) ||
                          post.author.handle.toLowerCase().includes(q);
          if (!matches) return false;
      }

      // Tab Filter
      if (activeTab === 'Communities') return !!post.communityId;
      if (activeTab === 'Following') return isFollowing(post.author.id) || post.author.id === currentUser.id;
      
      // For You - show everything (or algorithm)
      return true; 
  });

  return (
    <div 
        ref={containerRef}
        id="social-feed-container"
        className="h-full overflow-y-auto bg-white dark:bg-black transition-colors duration-300 relative overscroll-y-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {isSearchOpen && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col animate-fade-in md:hidden">
            <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 gap-2">
                <div className="bg-gray-100 dark:bg-gray-800 flex-1 rounded-full flex items-center px-4 py-2">
                    <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <input 
                        autoFocus 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search MyConnect..." 
                        className="bg-transparent outline-none w-full text-gray-900 dark:text-white" 
                    />
                </div>
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-blue-600 font-medium">Cancel</button>
            </div>
          </div>
      )}

      {/* Pull to Refresh Indicator */}
      <div 
          className="absolute left-0 right-0 flex justify-center z-30 pointer-events-none transition-all duration-300 ease-out"
          style={{ 
              top: '60px', 
              transform: `translateY(${isRefreshing ? 20 : pullDistance - 40}px)`,
              opacity: (pullDistance > 10 || isRefreshing) ? 1 : 0
          }}
      >
         <div 
            className={`bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-xl border border-gray-100 dark:border-gray-700 text-blue-500 flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined }}
         >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
         </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-[1250px] mx-auto min-h-full flex gap-6">
        
        {/* Main Feed Column */}
        <div className="flex-1 max-w-[600px] border-x border-gray-100 dark:border-gray-800 w-full mx-auto lg:mx-0 pt-0 pb-32">
            
            {/* Header / Tabs */}
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20 border-b border-gray-100 dark:border-gray-800">
                {/* Mobile Header Top Row */}
                <div className="md:hidden flex items-center justify-between py-3 px-4">
                    <img onClick={() => onViewProfile(currentUser)} src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover cursor-pointer" alt="Me" />
                    <div className="flex gap-4 text-gray-800 dark:text-white">
                        <button onClick={() => setIsSearchOpen(true)}><SearchIcon className="w-6 h-6" /></button>
                    </div>
                </div>

                {/* Tabs Row */}
                <div className="flex">
                    {['For You', 'Following', 'Communities'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className="flex-1 py-4 text-sm font-bold relative hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        >
                            <span className={activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                                {tab}
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="border-b border-gray-100 dark:border-gray-800">
               <div className="pt-4">
                 <Stories />
               </div>
               <div className="px-4">
                 <CreatePost user={currentUser} onPost={onPostCreate} onViewProfile={onViewProfile} />
               </div>
            </div>
            
            <div className="flex flex-col">
                {displayPosts.length > 0 ? (
                    displayPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser} 
                            onViewProfile={onViewProfile} 
                            onHidePost={handleHidePost}
                            onUnfollow={(id) => toggleFollow(id)}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <div className="mb-2 text-2xl">🕵️</div>
                        <p>No posts found.</p>
                        {activeTab === 'Following' && <p className="text-xs mt-1">Try following more people!</p>}
                        {activeTab === 'Communities' && <p className="text-xs mt-1">Join a community to see posts here.</p>}
                        {searchQuery && <p className="text-xs mt-1">Try a different search term.</p>}
                    </div>
                )}
            </div>

            {/* Skeleton Loading State */}
            <div className="mt-4">
                <SkeletonPost />
                <SkeletonPost />
            </div>
        </div>

        {/* Right Sidebar (Desktop) */}
        <div className="hidden lg:block w-[350px] pt-4 pr-4 space-y-4 sticky top-0 h-screen overflow-y-auto no-scrollbar">
            {/* Search */}
            <div className="bg-gray-100 dark:bg-[#16181c] rounded-full flex items-center px-4 py-3 mb-4 group focus-within:ring-1 ring-blue-500">
                <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-transparent w-full ml-3 outline-none text-gray-900 dark:text-white placeholder-gray-500" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Communities */}
            <CommunitiesSidebar communities={MOCK_COMMUNITIES} />

            {/* Trends */}
            <div className="bg-gray-50 dark:bg-[#16181c] rounded-2xl p-4">
                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mb-4">Trends for you</h2>
                <div className="space-y-4">
                    {TRENDING_TOPICS.map(trend => (
                        <div key={trend.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{trend.topic} · Trending</span>
                                <button>...</button>
                            </div>
                            <div className="font-bold text-gray-900 dark:text-white text-base">{trend.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{trend.posts} posts</div>
                        </div>
                    ))}
                </div>
                <button className="text-blue-500 text-sm mt-4 hover:underline">Show more</button>
            </div>

            {/* Who to follow */}
            <div className="bg-gray-50 dark:bg-[#16181c] rounded-2xl p-4">
                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mb-4">Who to follow</h2>
                <div className="space-y-4">
                    {SUGGESTED_USERS.map(user => {
                        const followed = isFollowing(user.id);
                        return (
                            <div key={user.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <UserHoverCard user={user} onViewProfile={onViewProfile}>
                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover cursor-pointer" alt="" />
                                    </UserHoverCard>
                                    <div>
                                        <UserHoverCard user={user} onViewProfile={onViewProfile}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer">{user.name}</div>
                                        </UserHoverCard>
                                        <div className="text-gray-500 text-xs">{user.handle}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleFollow(user.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${followed ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}
                                >
                                    {followed ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button className="text-blue-500 text-sm mt-4 hover:underline">Show more</button>
            </div>
            
            <div className="text-xs text-gray-500 px-4 flex flex-wrap gap-x-3 gap-y-1 pb-4">
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Cookie Policy</a>
                <a href="#" className="hover:underline">Accessibility</a>
                <a href="#" className="hover:underline">Ads info</a>
                <span>© 2025 MyConnect Corp.</span>
            </div>
        </div>

      </div>
    </div>
  );
};

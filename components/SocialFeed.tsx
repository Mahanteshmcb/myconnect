import React, { useState, useRef } from 'react';
import { Post, User, Comment } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, SearchIcon, PlusIcon, SendIcon, CloseIcon, TrashIcon } from './Icons';

interface SocialFeedProps {
  posts: Post[];
  currentUser: User;
  onPostCreate: (content: string) => void;
}

// --- Create Post Component ---
const CreatePost = ({ user, onPost }: { user: User, onPost: (content: string) => void }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
      setIsFocused(false);
    }
  };

  const handleMockAction = (type: string) => {
    alert(`${type} feature would open a picker here!`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <div className="flex gap-3">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
            className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition resize-none h-12 focus:h-24"
          />
        </div>
      </div>
      {(isFocused || content) && (
        <div className="flex justify-end mt-2">
           <button 
             onClick={handleSubmit}
             disabled={!content.trim()}
             className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium text-sm disabled:opacity-50 hover:bg-blue-700 transition"
           >
             Post
           </button>
        </div>
      )}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
        <button onClick={() => handleMockAction('Photo/Video')} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg transition">
          <span className="text-green-500">🖼️</span> Photo/Video
        </button>
        <button onClick={() => handleMockAction('Feeling/Activity')} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg transition">
          <span className="text-yellow-500">😊</span> Feeling
        </button>
        <button onClick={() => handleMockAction('Live Video')} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg transition">
          <span className="text-red-500">🎥</span> Live
        </button>
      </div>
    </div>
  );
};

// --- Post Card Component ---
const PostCard = ({ post, currentUser }: { post: Post, currentUser: User }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentsList || []);
  const [newComment, setNewComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
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

  const handleShare = () => {
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000); // Auto close "copied" toast
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden relative">
        {/* Share Toast */}
        {showShare && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-sm z-20 fade-in">
                Link copied to clipboard!
            </div>
        )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm text-gray-900">{post.author.name}</h3>
              {post.author.verified && <span className="text-blue-500 text-[10px]">✔</span>}
            </div>
            <p className="text-xs text-gray-500">{post.timestamp} • 🌎</p>
          </div>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} className="text-gray-400 hover:text-gray-600 p-1">...</button>
        
        {/* Options Dropdown */}
        {showOptions && (
            <div className="absolute top-10 right-4 bg-white shadow-xl border border-gray-100 rounded-lg w-40 z-10 py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                    <span>👁️</span> Hide Post
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                    <TrashIcon className="w-4 h-4" /> Report
                </button>
            </div>
        )}
        {/* Click overlay to close options */}
        {showOptions && <div className="fixed inset-0 z-0" onClick={() => setShowOptions(false)}></div>}
      </div>
      
      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image && (
        <div className="mt-2">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-2">
        <div className="flex gap-4 w-full">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition py-1 rounded-lg hover:bg-gray-50 ${liked ? 'text-red-500' : 'text-gray-600'}`}
          >
            <HeartIcon className="w-5 h-5" filled={liked} />
            {likes > 0 ? likes : 'Like'}
          </button>
          <button 
             onClick={() => setShowComments(!showComments)}
             className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 py-1 rounded-lg transition"
           >
            <CommentIcon className="w-5 h-5" />
            {comments.length > 0 ? comments.length : 'Comment'}
          </button>
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 py-1 rounded-lg transition">
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
          <div className="bg-gray-50 p-4 border-t border-gray-100 animate-fade-in-down">
            {comments.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                             <img src={comment.author.avatar} className="w-8 h-8 rounded-full" alt={comment.author.name} />
                             <div className="bg-white p-2 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                 <h4 className="text-xs font-bold text-gray-900">{comment.author.name}</h4>
                                 <p className="text-sm text-gray-800">{comment.text}</p>
                             </div>
                             <span className="text-[10px] text-gray-400 mt-2">{comment.timestamp}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 text-sm py-2">No comments yet. Be the first!</div>
            )}
            
            {/* Add Comment Input */}
            <div className="flex gap-2 items-center mt-2">
                <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Me" />
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Write a comment..." 
                        className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1.5 text-blue-600 hover:bg-blue-50 p-1 rounded-full disabled:opacity-30"
                    >
                        <SendIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

// --- Stories Component ---
const Stories = () => {
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  
  const stories = [
    { id: 1, name: 'You', img: 'https://picsum.photos/id/64/100/100', isUser: true, storyImg: 'https://picsum.photos/id/64/400/800' },
    { id: 2, name: 'Elon', img: 'https://picsum.photos/id/10/100/100', storyImg: 'https://picsum.photos/id/10/400/800' },
    { id: 3, name: 'Mark', img: 'https://picsum.photos/id/12/100/100', storyImg: 'https://picsum.photos/id/12/400/800' },
    { id: 4, name: 'Jane', img: 'https://picsum.photos/id/15/100/100', storyImg: 'https://picsum.photos/id/15/400/800' },
    { id: 5, name: 'Sarah', img: 'https://picsum.photos/id/20/100/100', storyImg: 'https://picsum.photos/id/20/400/800' },
  ];

  const handleStoryClick = (index: number) => {
      if (index === 0) {
          // User story - simulate adding
          alert("This would open the camera to add a story!");
      } else {
          setViewingStory(index);
      }
  };

  return (
    <>
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
        {stories.map((story, index) => (
            <div key={story.id} onClick={() => handleStoryClick(index)} className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer group">
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.isUser ? 'bg-transparent border-2 border-gray-200 border-dashed' : 'bg-gradient-to-tr from-yellow-400 to-purple-600'}`}>
                <div className="w-full h-full bg-white rounded-full p-[2px] relative">
                <img src={story.img} alt={story.name} className="w-full h-full rounded-full object-cover" />
                {story.isUser && <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-2 border-white"><PlusIcon className="w-3 h-3"/></div>}
                </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{story.name}</span>
            </div>
        ))}
        </div>

        {/* Full Screen Story Viewer Overlay */}
        {viewingStory !== null && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={() => setViewingStory(null)} className="text-white p-2">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>
                
                <div className="relative w-full md:max-w-md h-full md:h-[80vh] bg-gray-900 md:rounded-xl overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-2 left-2 right-2 flex gap-1">
                         <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                             <div className="h-full bg-white animate-[width_5s_linear]"></div>
                         </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="absolute top-6 left-4 flex items-center gap-2">
                        <img src={stories[viewingStory].img} className="w-8 h-8 rounded-full border border-white" />
                        <span className="text-white font-bold shadow-sm">{stories[viewingStory].name}</span>
                        <span className="text-white/70 text-xs">3h</span>
                    </div>

                    <img src={stories[viewingStory].storyImg} className="w-full h-full object-cover" />
                    
                    {/* Tap areas */}
                    <div className="absolute inset-y-0 left-0 w-1/3" onClick={() => setViewingStory(prev => prev && prev > 1 ? prev - 1 : null)}></div>
                    <div className="absolute inset-y-0 right-0 w-1/3" onClick={() => setViewingStory(prev => prev && prev < stories.length - 1 ? prev + 1 : null)}></div>

                    {/* Reply */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <input type="text" placeholder="Send a message..." className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/70 focus:border-white outline-none backdrop-blur-sm" />
                        <button className="text-white p-2">
                            <HeartIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

// --- Search Overlay Component ---
const SearchOverlay = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
        <div className="flex items-center p-4 border-b border-gray-100 gap-2">
            <div className="bg-gray-100 flex-1 rounded-full flex items-center px-4 py-2">
                <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
                <input autoFocus type="text" placeholder="Search MyConnect..." className="bg-transparent outline-none w-full" />
            </div>
            <button onClick={onClose} className="text-blue-600 font-medium">Cancel</button>
        </div>
        <div className="p-4">
            <h3 className="text-sm font-bold text-gray-500 mb-3">Recent Searches</h3>
            <div className="flex flex-col gap-3">
                {['React tutorials', 'Hiking trails', 'Best sushi Tokyo', 'Frontend jobs'].map(s => (
                    <div key={s} className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-3">
                             <div className="bg-gray-100 p-2 rounded-full"><SearchIcon className="w-4 h-4 text-gray-500" /></div>
                             <span>{s}</span>
                        </div>
                        <button className="text-gray-400"><CloseIcon className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, currentUser, onPostCreate }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network request
    setTimeout(() => {
        setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 relative scrollbar-hide" id="social-feed-container">
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {/* Loading Indicator */}
      {isRefreshing && (
          <div className="absolute top-16 left-0 right-0 flex justify-center z-20">
             <div className="bg-white rounded-full p-2 shadow-md animate-spin text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </div>
          </div>
      )}

      <div className="max-w-xl mx-auto pt-4 pb-32 px-4 md:px-0 min-h-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 md:hidden sticky top-0 bg-gray-50 z-10 py-2">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">MyConnect</h1>
            <div className="flex gap-3">
                <button onClick={handleRefresh} disabled={isRefreshing} className={`bg-gray-200 p-2 rounded-full transition active:scale-90 ${isRefreshing ? 'opacity-50' : ''}`}>
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => setIsSearchOpen(true)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition active:scale-90">
                    <SearchIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
        
        <Stories />
        <CreatePost user={currentUser} onPost={onPostCreate} />
        
        <div className="flex flex-col">
            {posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
        </div>

        <div className="text-center py-6 text-gray-400 text-sm">
            <p>You're all caught up!</p>
            <button onClick={handleRefresh} className="text-blue-500 font-medium mt-2">Refresh Feed</button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { LongFormVideo, User } from '../types';
import { SearchIcon, MenuIcon, BellIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, YouTubeLogo, MicrophoneIcon, CreateVideoIcon, SettingsIcon, SendIcon } from './Icons';

interface LongFormVideoProps {
  videos: LongFormVideo[];
  currentUser: User;
  onUpdateVideo: (video: LongFormVideo) => void;
  onViewProfile: (user?: User) => void;
}

const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-gray-100 dark:bg-[#272727] font-medium' : 'hover:bg-gray-100 dark:hover:bg-[#272727]'} text-gray-900 dark:text-white`}>
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <span className="text-sm truncate">{label}</span>
  </div>
);

const VideoPlayer = ({ video, autoPlay }: { video: LongFormVideo, autoPlay: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    return (
        <div className="relative w-full aspect-video bg-black group">
            <video
                key={video.id} // Force remount when video changes to ensure autoplay triggers
                ref={videoRef}
                src={video.url}
                poster={video.thumbnail}
                className="w-full h-full object-contain"
                autoPlay={autoPlay}
                controls
            />
        </div>
    );
};

export const LongFormVideoApp: React.FC<LongFormVideoProps> = ({ videos, currentUser, onViewProfile }) => {
  const [currentView, setCurrentView] = useState<'BROWSE' | 'WATCH'>('BROWSE');
  const [selectedVideo, setSelectedVideo] = useState<LongFormVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<'all' | 'video' | 'short' | 'live'>('all');
  
  // Watch State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<{user: string, text: string, time: string}[]>([]);

  const filteredVideos = videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesType = activeType === 'all' || v.type === activeType;
      
      // Fallback: if video doesn't have a type property (older data), treat as 'video'
      const videoType = v.type || 'video';
      const effectiveMatchType = activeType === 'all' || videoType === activeType;

      return matchesSearch && matchesCategory && effectiveMatchType;
  });

  const handleVideoClick = (video: LongFormVideo) => {
    setSelectedVideo(video);
    setCurrentView('WATCH');
    setIsSubscribed(false); // Reset state for new video simulation
    setIsLiked(false);
    setIsDisliked(false);
    setDescriptionExpanded(false);
    setComments([
        { user: "TechFan99", text: "Great content as always!", time: "2 hours ago" },
        { user: "Sarah J.", text: "Can you do a tutorial on the advanced features?", time: "5 hours ago" }
    ]);
    window.scrollTo(0, 0);
  };

  const handleSubscribe = () => {
      setIsSubscribed(!isSubscribed);
  };

  const handleLike = () => {
      setIsLiked(!isLiked);
      if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
      setIsDisliked(!isDisliked);
      if (isLiked) setIsLiked(false);
  };

  const handlePostComment = () => {
      if (!commentText.trim()) return;
      setComments([{ user: currentUser.name, text: commentText, time: 'Just now' }, ...comments]);
      setCommentText('');
  };

  // --- Header Component ---
  const Header = () => (
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0f0f0f] px-4 h-14 flex items-center justify-between border-b border-transparent dark:border-none">
          <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full">
                  <MenuIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <div onClick={() => { setCurrentView('BROWSE'); setSearchQuery(''); setActiveCategory('All'); setActiveType('all'); }} className="flex items-center gap-1 cursor-pointer" title="StreamHub Home">
                  <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                  <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white relative -top-0.5 font-sans">StreamHub</span>
              </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-4 ml-10">
              <div className="flex flex-1 items-center">
                  <div className="flex flex-1 items-center px-4 bg-white dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-l-full h-10 shadow-inner focus-within:border-blue-500 ml-8">
                      <input 
                        type="text" 
                        placeholder="Search" 
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setCurrentView('BROWSE');
                        }}
                      />
                  </div>
                  <button onClick={() => setCurrentView('BROWSE')} className="h-10 px-6 bg-gray-100 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-200 dark:hover:bg-[#303030] flex items-center justify-center">
                      <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
              </div>
              <button className="p-2.5 bg-gray-100 dark:bg-[#181818] rounded-full hover:bg-gray-200 dark:hover:bg-[#303030]">
                  <MicrophoneIcon className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full hidden sm:block">
                  <CreateVideoIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full">
                  <BellIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <img onClick={() => onViewProfile(currentUser)} src={currentUser.avatar} className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-red-500 transition" alt="Profile" />
          </div>
      </div>
  );

  // --- WATCH PAGE ---
  if (currentView === 'WATCH' && selectedVideo) {
    const relatedVideos = videos.filter(v => v.id !== selectedVideo.id);
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] overflow-y-auto">
        <Header />
        <div className="flex flex-col lg:flex-row max-w-[1750px] mx-auto w-full p-0 lg:p-6 gap-6">
            {/* Left Column: Video & Comments */}
            <div className="flex-1">
                <div className="w-full bg-black lg:rounded-xl overflow-hidden aspect-video">
                     <VideoPlayer video={selectedVideo} autoPlay={true} />
                </div>
                
                <div className="px-4 lg:px-0 py-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{selectedVideo.title}</h1>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                             <img onClick={() => onViewProfile(selectedVideo.author)} src={selectedVideo.author.avatar} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80" alt="" />
                             <div onClick={() => onViewProfile(selectedVideo.author)} className="flex flex-col mr-4 cursor-pointer group">
                                 <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-gray-700">{selectedVideo.author.name}</h3>
                                 <span className="text-xs text-gray-600 dark:text-[#aaa]">{selectedVideo.author.subscribers} subscribers</span>
                             </div>
                             <button 
                                onClick={handleSubscribe}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${isSubscribed ? 'bg-gray-200 dark:bg-[#272727] text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}
                             >
                                 {isSubscribed ? 'Subscribed' : 'Subscribe'}
                             </button>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <div className="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full h-9">
                                <button 
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 h-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-l-full border-r border-gray-300 dark:border-[#3f3f3f] transition ${isLiked ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}
                                >
                                    <ThumbsUpIcon className="w-5 h-5" filled={isLiked} />
                                    <span className="text-sm font-medium">{selectedVideo.likes}</span>
                                </button>
                                <button 
                                    onClick={handleDislike}
                                    className={`px-4 h-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-r-full transition ${isDisliked ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
                                >
                                    <ThumbsDownIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <button className="flex items-center gap-2 bg-gray-100 dark:bg-[#272727] px-4 h-9 rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                <ShareIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Share</span>
                            </button>
                            <button className="flex items-center justify-center bg-gray-100 dark:bg-[#272727] w-9 h-9 rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                <span className="font-bold mb-2 text-gray-900 dark:text-white">...</span>
                            </button>
                        </div>
                    </div>

                    <div 
                        className={`mt-4 bg-gray-100 dark:bg-[#272727] p-3 rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-[#3f3f3f] ${descriptionExpanded ? '' : 'h-24 overflow-hidden relative'}`}
                        onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    >
                        <div className="font-bold text-gray-900 dark:text-white mb-1">
                            {selectedVideo.views} views • {selectedVideo.uploadedAt}
                        </div>
                        <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{selectedVideo.description}</p>
                        <p className="text-gray-800 dark:text-white mt-4">
                            Connect with us:<br/>
                            Twitter: @streamhub<br/>
                            Instagram: @streamhub_official<br/>
                            Discord: invite.gg/streamhub
                        </p>
                        <span className="font-bold text-gray-600 dark:text-gray-400 mt-2 block">
                            {descriptionExpanded ? 'Show less' : 'Show more'}
                        </span>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{comments.length} Comments</h3>
                        
                        <div className="flex gap-4 mb-6">
                            <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="Me" />
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none pb-1 text-gray-900 dark:text-white focus:border-black dark:focus:border-white transition"
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <button onClick={() => setCommentText('')} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full text-gray-600 dark:text-gray-300">Cancel</button>
                                    <button onClick={handlePostComment} disabled={!commentText.trim()} className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-700">Comment</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {comments.map((c, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {c.user[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline">{c.user}</span>
                                            <span className="text-xs text-gray-500">{c.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{c.text}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                                                <ThumbsUpIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                                                <ThumbsDownIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Reply</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Recommendations */}
            <div className="w-full lg:w-[400px] px-4 lg:px-0 flex flex-col gap-3 pb-20">
                <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                    {['All', 'From this channel', 'Related'].map(tag => (
                        <button key={tag} className="px-3 py-1.5 bg-gray-100 dark:bg-[#272727] rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-[#3f3f3f] text-gray-900 dark:text-white">
                            {tag}
                        </button>
                    ))}
                </div>
                {relatedVideos.map(video => (
                    <div key={video.id} onClick={() => handleVideoClick(video)} className="flex gap-2 cursor-pointer group">
                        <div className="w-40 h-24 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-[#272727]">
                            <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-bold px-1 rounded">{video.duration}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{video.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-[#aaa] hover:text-gray-900 dark:hover:text-white">{video.author.name}</p>
                            <p className="text-xs text-gray-600 dark:text-[#aaa]">{video.views} views • {video.uploadedAt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // --- BROWSE HOME PAGE ---
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex w-60 flex-col px-3 hover:overflow-y-auto overflow-hidden sticky top-14 h-full pb-4">
            <SidebarItem icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>} label="Home" active={true} onClick={() => { setActiveCategory('All'); setSearchQuery(''); setActiveType('all'); }} />
            <SidebarItem icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-6.62L6 6.94a3.74 3.74 0 0 0 .36 7.4l1.2.5L6.04 15.66a3.74 3.74 0 0 0 3.5 6.62l8.5-4.5a3.74 3.74 0 0 0-.36-7.4l-1.9.94zM8.7 19.84l-1.5.8-1.2-.5a2.12 2.12 0 0 1-1-2.1 2.12 2.12 0 0 1 1.1-1.9l8.5-4.5 1.2-.64.5.26.3.16.4.2.4.24.4.26.3.3.3.3.2.3.2.4.1.4a2.12 2.12 0 0 1-1 2.1l-1.2.5-.5.3-.4.16-.4.2-.4.2-.4.25-.3.3-.3.3-.2.3-.2.4-.1.4zm1-7.3l-1.2-.64-.5-.26-.3-.16-.4-.2-.4-.24-.4-.26-.3-.3-.3-.3-.2-.3-.2-.4-.1-.4a2.12 2.12 0 0 1 1-2.1l1.2-.5 1.5-.8a2.12 2.12 0 0 1 2.1 1 2.12 2.12 0 0 1-1.1 1.9l-8.5 4.5z" /></svg>} label="Shorts" onClick={() => setActiveType('short')} active={activeType === 'short'} />
            <SidebarItem icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.7 8.7H5.3V7h13.4v1.7zm-1.7-5H7v1.6h10V3.7zm3.3 8.3v6.7c0 1-.7 1.6-1.6 1.6H5.3c-1 0-1.6-.7-1.6-1.6V12c0-1 .7-1.7 1.6-1.7h13.4c1 0 1.6.8 1.6 1.7zm-5 3.3l-5-2.7v5.4l5-2.7z" /></svg>} label="Subscriptions" />
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>
            <SidebarItem icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>} label="Your Channel" onClick={() => onViewProfile(currentUser)} />
            <SidebarItem icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10h4v4H4v-4zm0 6h4v4H4v-4zm0-12h4v4H4V4zm6 12h4v4h-4v-4zm0-6h4v4h-4v-4zm0-6h4v4h-4V4zm6 12h4v4h-4v-4zm0-6h4v4h-4v-4zm0-6h4v4h-4V4z" /></svg>} label="Library" />
            <SidebarItem icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-.69 1.22-.37.48zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" /></svg>} label="History" />
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>
            <div className="px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Categories</div>
            <SidebarItem icon={<SettingsIcon className="w-5 h-5" />} label="Technology" active={activeCategory === 'Technology'} onClick={() => setActiveCategory('Technology')} />
            <SidebarItem icon={<SettingsIcon className="w-5 h-5" />} label="Nature" active={activeCategory === 'Nature'} onClick={() => setActiveCategory('Nature')} />
            <SidebarItem icon={<SettingsIcon className="w-5 h-5" />} label="Travel" active={activeCategory === 'Travel'} onClick={() => setActiveCategory('Travel')} />
          </div>

          {/* Main Feed */}
          <div className="flex-1 overflow-y-auto pb-20">
             {/* Format Filter Bar (New) */}
             <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {[
                      { id: 'all', label: 'All' },
                      { id: 'video', label: 'Videos' },
                      { id: 'short', label: 'Shorts' },
                      { id: 'live', label: 'Live' }
                  ].map((type) => (
                      <button
                          key={type.id}
                          onClick={() => setActiveType(type.id as any)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${activeType === type.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-[#272727] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3f3f3f]'}`}
                      >
                          {type.label}
                      </button>
                  ))}
             </div>

             {/* Category Filter Chips */}
             <div className="sticky top-12 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm py-3 px-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-transparent dark:border-[#3f3f3f]">
                  {['All', 'Technology', 'Nature', 'Travel', 'Art', 'Tech', 'Music', 'News'].map((tag, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveCategory(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeCategory === tag ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'}`}
                      >
                          {tag}
                      </button>
                  ))}
             </div>

             {filteredVideos.length > 0 ? (
                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                     {filteredVideos.map(video => (
                         <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer group flex flex-col gap-3">
                             <div className={`relative rounded-xl overflow-hidden ${video.type === 'short' ? 'aspect-[9/16] max-w-[200px]' : 'aspect-video'}`}>
                                 <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" alt="" />
                                 <span className={`absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded ${video.type === 'live' ? 'bg-red-600' : ''}`}>{video.duration}</span>
                             </div>
                             <div className="flex gap-3 items-start">
                                 {video.type !== 'short' && <img src={video.author.avatar} className="w-9 h-9 rounded-full mt-1" alt="" />}
                                 <div className="flex flex-col">
                                     <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">{video.title}</h3>
                                     <div className="text-sm text-gray-600 dark:text-[#aaa] mt-1">
                                         {video.type !== 'short' && <p className="hover:text-gray-900 dark:hover:text-white">{video.author.name}</p>}
                                         <p>{video.views} views • {video.uploadedAt}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                     <SearchIcon className="w-12 h-12 mb-4 opacity-50" />
                     <p>No videos found matching filters.</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

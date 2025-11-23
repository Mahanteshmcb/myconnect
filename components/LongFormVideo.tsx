
import React, { useState, useRef, useEffect } from 'react';
import { LongFormVideo, User, Video } from '../types';
import { SearchIcon, MenuIcon, BellIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, StreamHubLogo, MicrophoneIcon, CreateVideoIcon, SettingsIcon, UploadIcon, HomeIcon, HistoryIcon, LibraryIcon, CheckIcon, CloseIcon, QualityIcon, CCIcon, PlayCircleIcon } from './Icons';
import { VideoReels } from './VideoReels';
import { REELS_VIDEOS } from '../services/mockData';

interface LongFormVideoProps {
  videos: LongFormVideo[];
  currentUser: User;
  onUpdateVideo: (video: LongFormVideo) => void;
  onViewProfile: (user?: User) => void;
}

// --- Upload Video Modal ---
const UploadVideoModal = ({ isOpen, onClose, currentUser, onUpload }: { isOpen: boolean, onClose: () => void, currentUser: User, onUpload: (video: LongFormVideo) => void }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'video' | 'short'>('video');
    const [category, setCategory] = useState('Technology');
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            // Simulate generating thumbnail
            setThumbnailPreview('https://picsum.photos/640/360'); 
        }
    };

    const handleUpload = () => {
        if (!title || !videoPreview) return;
        
        const newVideo: LongFormVideo = {
            id: `v_${Date.now()}`,
            title,
            description: desc,
            url: videoPreview,
            thumbnail: thumbnailPreview || 'https://picsum.photos/640/360',
            duration: '00:00', // Real implementation would calculate duration
            views: '0',
            uploadedAt: 'Just now',
            author: currentUser,
            category,
            likes: '0',
            type
        };
        
        onUpload(newVideo);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#282828] w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#3f3f3f]">
                    <h2 className="text-xl font-bold dark:text-white">Upload to StreamHub</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                    {/* Left: Metadata */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Details</label>
                            <input 
                                className="w-full p-4 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500"
                                placeholder="Title (required)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <textarea 
                                className="w-full p-4 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500 h-32 resize-none"
                                placeholder="Description"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select 
                                    className="w-full p-3 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {['Technology', 'Nature', 'Gaming', 'Music', 'Education', 'Lifestyle'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                                <div className="flex bg-gray-100 dark:bg-[#1f1f1f] rounded-lg p-1">
                                    <button onClick={() => setType('video')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${type === 'video' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>Long Video</button>
                                    <button onClick={() => setType('short')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${type === 'short' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>Reel</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div 
                            className="w-full aspect-video bg-gray-100 dark:bg-[#1f1f1f] rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-[#3f3f3f] hover:border-blue-500 transition relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                            {videoPreview ? (
                                <video src={videoPreview} className="w-full h-full object-cover" controls />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-[#2f2f2f] rounded-full flex items-center justify-center mb-2">
                                        <UploadIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <span className="text-sm text-gray-500">Select video file</span>
                                </>
                            )}
                        </div>
                        <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase">Video Link</span>
                            <div className="text-blue-500 text-sm truncate mt-1">https://streamhub.app/v/{Date.now()}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-[#3f3f3f] flex justify-end gap-3 bg-gray-50 dark:bg-[#1f1f1f]">
                    <button onClick={onClose} className="px-6 py-2 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-lg transition">Cancel</button>
                    <button 
                        onClick={handleUpload}
                        disabled={!title || !videoPreview}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Channel Page ---
const ChannelPage = ({ 
    user, 
    videos,
    onBack,
    onVideoClick,
    currentUser
}: { 
    user: User, 
    videos: LongFormVideo[], 
    onBack: () => void,
    onVideoClick: (v: LongFormVideo) => void,
    currentUser: User
}) => {
    const [activeTab, setActiveTab] = useState<'Home' | 'Videos' | 'Reels'>('Home');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const channelVideos = videos.filter(v => v.author.id === user.id);
    const shorts = channelVideos.filter(v => v.type === 'short');
    const longVideos = channelVideos.filter(v => v.type !== 'short');

    return (
        <div className="flex-1 bg-white dark:bg-[#0f0f0f] overflow-y-auto">
            {/* Banner */}
            <div className="h-40 md:h-60 w-full bg-gray-800 relative group">
                {user.coverImage ? (
                    <img src={user.coverImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900">
                        <span className="text-white font-bold text-2xl">{user.name}'s Channel</span>
                    </div>
                )}
            </div>

            {/* Header Info */}
            <div className="max-w-6xl mx-auto px-6 py-6 border-b border-gray-200 dark:border-[#3f3f3f]">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f0f0f] -mt-16" alt={user.name} />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name} {user.verified && <CheckIcon className="inline w-5 h-5 text-gray-500" />}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">@{user.handle} • {user.subscribers || '1K'} subscribers • {channelVideos.length} videos</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl line-clamp-2 mb-4">{user.bio || "Welcome to my official channel! I post videos about technology and lifestyle."}</p>
                        <button 
                            onClick={() => setIsSubscribed(!isSubscribed)}
                            className={`px-8 py-2.5 rounded-full font-bold text-sm transition ${isSubscribed ? 'bg-gray-200 dark:bg-[#272727] text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                        >
                            {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-8">
                    {['Home', 'Videos', 'Reels', 'Playlists', 'Community'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 font-bold text-sm uppercase border-b-2 transition ${activeTab === tab ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {activeTab === 'Home' && (
                    <div className="space-y-8">
                         {shorts.length > 0 && (
                             <div>
                                 <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><StreamHubLogo className="w-6 h-6 text-red-600" /> Reels</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {shorts.slice(0, 5).map(v => (
                                         <div key={v.id} onClick={() => onVideoClick(v)} className="cursor-pointer group">
                                             <div className="aspect-[9/16] rounded-xl overflow-hidden mb-2">
                                                 <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                             </div>
                                             <h4 className="font-bold text-sm dark:text-white line-clamp-2">{v.title}</h4>
                                             <p className="text-xs text-gray-500">{v.views} views</p>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         <div>
                             <h3 className="text-xl font-bold dark:text-white mb-4">Videos</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                 {longVideos.map(v => (
                                     <div key={v.id} onClick={() => onVideoClick(v)} className="cursor-pointer group">
                                         <div className="aspect-video rounded-xl overflow-hidden mb-2 relative">
                                             <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                             <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{v.duration}</span>
                                         </div>
                                         <h4 className="font-bold text-sm dark:text-white line-clamp-2">{v.title}</h4>
                                         <p className="text-xs text-gray-500">{v.views} views • {v.uploadedAt}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-gray-100 dark:bg-[#272727] font-medium' : 'hover:bg-gray-100 dark:hover:bg-[#272727]'} text-gray-900 dark:text-white`}>
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <span className="text-sm truncate">{label}</span>
  </div>
);

// --- Enhanced Video Player with Settings ---
const EnhancedVideoPlayer = ({ video, autoPlay }: { video: LongFormVideo, autoPlay: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [quality, setQuality] = useState('Auto');
    const [captions, setCaptions] = useState(false);

    return (
        <div className="relative w-full aspect-video bg-black group rounded-xl overflow-hidden">
            <video
                key={video.id}
                ref={videoRef}
                src={video.url}
                poster={video.thumbnail}
                className="w-full h-full object-contain"
                autoPlay={autoPlay}
                controls
            />
            
            {/* Overlay Settings Button (Visible on hover) */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                 <button 
                    onClick={() => setCaptions(!captions)}
                    className={`p-1.5 rounded bg-black/60 text-white backdrop-blur-sm ${captions ? 'border-b-2 border-red-500' : ''}`}
                    title="Subtitles/CC"
                 >
                     <CCIcon className="w-5 h-5" />
                 </button>
                 <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 rounded bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                        title="Settings"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>

                    {/* Settings Menu */}
                    {showSettings && (
                        <div className="absolute top-10 right-0 w-48 bg-black/90 text-white rounded-xl shadow-xl backdrop-blur-md p-2 z-20 flex flex-col text-sm border border-white/10">
                            <div className="px-3 py-2 border-b border-white/10 font-bold mb-1">Quality</div>
                            {['1080p HD', '720p', '480p', 'Auto'].map(q => (
                                <button 
                                    key={q} 
                                    onClick={() => { setQuality(q); setShowSettings(false); }}
                                    className={`px-3 py-2 text-left hover:bg-white/10 rounded flex justify-between ${quality === q ? 'text-blue-400' : ''}`}
                                >
                                    {q}
                                    {quality === q && <CheckIcon className="w-4 h-4" />}
                                </button>
                            ))}
                            <div className="border-t border-white/10 my-1"></div>
                            <button className="px-3 py-2 text-left hover:bg-white/10 rounded">Playback Speed</button>
                        </div>
                    )}
                 </div>
            </div>
            
            {/* Caption Overlay (Mock) */}
            {captions && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
                     <span className="bg-black/70 text-white px-3 py-1 text-sm rounded backdrop-blur-sm">
                         [Captions: {video.description.substring(0, 30)}...]
                     </span>
                </div>
            )}
        </div>
    );
};

export const LongFormVideoApp: React.FC<LongFormVideoProps> = ({ videos: initialVideos, currentUser, onViewProfile }) => {
  const [videos, setVideos] = useState(initialVideos);
  const [currentView, setCurrentView] = useState<'HOME' | 'WATCH' | 'REELS' | 'CHANNEL' | 'LIBRARY' | 'HISTORY'>('HOME');
  const [selectedVideo, setSelectedVideo] = useState<LongFormVideo | null>(null);
  const [viewingChannel, setViewingChannel] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<'all' | 'video' | 'short' | 'live'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Watch State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<{user: string, text: string, time: string}[]>([]);
  
  // History State
  const [history, setHistory] = useState<LongFormVideo[]>([]);

  // Shorts/Reels State
  const [isReelsMuted, setIsReelsMuted] = useState(false);

  const filteredVideos = videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesType = activeType === 'all' || v.type === activeType;
      
      const videoType = v.type || 'video';
      const effectiveMatchType = activeType === 'all' || videoType === activeType;

      return matchesSearch && matchesCategory && effectiveMatchType;
  });

  const handleVideoClick = (video: LongFormVideo) => {
    // Add to history
    setHistory(prev => {
        const newHistory = [video, ...prev.filter(v => v.id !== video.id)];
        return newHistory.slice(0, 50); // Keep last 50
    });

    if (video.type === 'short') {
        setCurrentView('REELS');
    } else {
        setSelectedVideo(video);
        setCurrentView('WATCH');
        setIsSubscribed(false); 
        setIsLiked(false);
        setIsDisliked(false);
        setDescriptionExpanded(false);
        setComments([
            { user: "TechFan99", text: "Great content as always!", time: "2 hours ago" },
            { user: "Sarah J.", text: "Can you do a tutorial on the advanced features?", time: "5 hours ago" }
        ]);
        window.scrollTo(0, 0);
    }
  };

  const handleChannelClick = (user: User) => {
      setViewingChannel(user);
      setCurrentView('CHANNEL');
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

  const handleUploadVideo = (newVideo: LongFormVideo) => {
      setVideos([newVideo, ...videos]);
  };

  // Convert LongFormVideo 'short' type to generic Video type for Reels player
  const reelsVideos: Video[] = REELS_VIDEOS; // Or map from videos.filter(v => v.type === 'short')

  // --- Header Component ---
  const Header = () => (
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0f0f0f] px-4 h-14 flex items-center justify-between border-b border-transparent dark:border-none">
          <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full">
                  <MenuIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <div onClick={() => { setCurrentView('HOME'); setSearchQuery(''); setActiveCategory('All'); setActiveType('all'); }} className="flex items-center gap-2 cursor-pointer" title="StreamHub Home">
                  <div className="text-red-600">
                    <StreamHubLogo className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">StreamHub</span>
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
                            if (e.key === 'Enter') setCurrentView('HOME');
                        }}
                      />
                  </div>
                  <button onClick={() => setCurrentView('HOME')} className="h-10 px-6 bg-gray-100 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-200 dark:hover:bg-[#303030] flex items-center justify-center">
                      <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
              </div>
              <button className="p-2.5 bg-gray-100 dark:bg-[#181818] rounded-full hover:bg-gray-200 dark:hover:bg-[#303030]">
                  <MicrophoneIcon className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full hidden sm:block"
                title="Create"
              >
                  <CreateVideoIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full">
                  <BellIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <img onClick={() => handleChannelClick(currentUser)} src={currentUser.avatar} className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-blue-500 transition" alt="Profile" />
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f]">
      <Header />
      <UploadVideoModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        currentUser={currentUser}
        onUpload={handleUploadVideo}
      />
      
      <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className={`hidden md:flex w-60 flex-col px-3 hover:overflow-y-auto overflow-hidden sticky top-14 h-full pb-4 ${currentView === 'WATCH' ? 'hidden xl:flex' : ''}`}>
            <SidebarItem icon={<HomeIcon className="w-6 h-6" />} label="Home" active={currentView === 'HOME'} onClick={() => setCurrentView('HOME')} />
            <SidebarItem icon={<StreamHubLogo className="w-6 h-6 text-red-600" />} label="Reels" active={currentView === 'REELS'} onClick={() => setCurrentView('REELS')} />
            <SidebarItem icon={<LibraryIcon className="w-6 h-6" />} label="Subscriptions" onClick={() => setActiveType('video')} />
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>
            <SidebarItem icon={<CheckIcon className="w-6 h-6" />} label="Your Channel" active={currentView === 'CHANNEL' && viewingChannel?.id === currentUser.id} onClick={() => handleChannelClick(currentUser)} />
            <SidebarItem icon={<HistoryIcon className="w-6 h-6" />} label="History" active={currentView === 'HISTORY'} onClick={() => setCurrentView('HISTORY')} />
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>
            <div className="px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Subscriptions</div>
            {/* Mock Subs */}
            {['TechDaily', 'Sarah Jenkins', 'Emma Wilson'].map(name => (
                <div key={name} className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">{name[0]}</div>
                    <span className="text-sm truncate text-gray-900 dark:text-white">{name}</span>
                </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f0f0f]">
              {currentView === 'REELS' && (
                  <div className="h-full bg-black">
                      <VideoReels 
                        videos={reelsVideos} 
                        isMuted={isReelsMuted} 
                        toggleMute={() => setIsReelsMuted(!isReelsMuted)} 
                        onViewProfile={handleChannelClick}
                        onCreateReel={() => {}}
                      />
                  </div>
              )}

              {currentView === 'HISTORY' && (
                  <div className="p-6">
                      <h2 className="text-2xl font-bold dark:text-white mb-6">Watch History</h2>
                      <div className="space-y-4">
                          {history.length === 0 ? <p className="text-gray-500">No watch history yet.</p> : history.map(video => (
                              <div key={video.id} onClick={() => handleVideoClick(video)} className="flex gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1f1f1f] p-2 rounded-lg group">
                                  <div className="w-40 aspect-video relative rounded-lg overflow-hidden flex-shrink-0">
                                      <img src={video.thumbnail} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>
                                  </div>
                                  <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.author.name} • {video.views} views</p>
                                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">{video.description}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {currentView === 'CHANNEL' && viewingChannel && (
                  <ChannelPage 
                    user={viewingChannel} 
                    videos={videos} 
                    onBack={() => setCurrentView('HOME')} 
                    onVideoClick={handleVideoClick}
                    currentUser={currentUser}
                  />
              )}

              {currentView === 'WATCH' && selectedVideo && (
                  <div className="flex flex-col lg:flex-row max-w-[1750px] mx-auto w-full p-0 lg:p-6 gap-6">
                        {/* Left Column: Video & Comments */}
                        <div className="flex-1">
                            <EnhancedVideoPlayer video={selectedVideo} autoPlay={true} />
                            
                            <div className="px-4 lg:px-0 py-4">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{selectedVideo.title}</h1>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <img onClick={() => handleChannelClick(selectedVideo.author)} src={selectedVideo.author.avatar} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80" alt="" />
                                        <div onClick={() => handleChannelClick(selectedVideo.author)} className="flex flex-col mr-4 cursor-pointer group">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-gray-700">{selectedVideo.author.name}</h3>
                                            <span className="text-xs text-gray-600 dark:text-[#aaa]">{selectedVideo.author.subscribers || '2K'} subscribers</span>
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
                            {filteredVideos.filter(v => v.id !== selectedVideo.id).map(video => (
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
              )}

              {currentView === 'HOME' && (
                  <div className="pb-20">
                     {/* Format Filter Bar */}
                     <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
                          {[
                              { id: 'all', label: 'All' },
                              { id: 'video', label: 'Videos' },
                              { id: 'short', label: 'Reels' },
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
                                         {video.type !== 'short' && <img onClick={(e) => {e.stopPropagation(); handleChannelClick(video.author)}} src={video.author.avatar} className="w-9 h-9 rounded-full mt-1 hover:opacity-80 transition" alt="" />}
                                         <div className="flex flex-col">
                                             <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">{video.title}</h3>
                                             <div className="text-sm text-gray-600 dark:text-[#aaa] mt-1">
                                                 {video.type !== 'short' && <p onClick={(e) => {e.stopPropagation(); handleChannelClick(video.author)}} className="hover:text-gray-900 dark:hover:text-white hover:underline">{video.author.name}</p>}
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
              )}
          </div>
      </div>
    </div>
  );
};

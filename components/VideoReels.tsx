
import React, { useState, useRef, useEffect } from 'react';
import { Video, Comment, User } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, PlayCircleIcon, CloseIcon, SendIcon, PlusIcon, CameraIcon, MusicIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './Icons';
import { CURRENT_USER, MOCK_USERS } from '../services/mockData';

export interface VideoReelsProps {
  videos: Video[];
  currentUser: User;
  isMuted: boolean;
  toggleMute: () => void;
  onViewProfile: (user: User) => void;
  onCreateReel: () => void;
  onSubscribe?: (userId: string) => void;
  onUseSound?: (video: Video) => void;
}

interface ReelItemProps {
  video: Video;
  currentUser: User;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onViewProfile: (user: User) => void;
  onSubscribe?: (userId: string) => void;
  onUseSound?: (video: Video) => void;
}

// --- Create Reel Interface ---
export const CreateReel = ({ onBack, onPost, currentUser }: { onBack: () => void, onPost: (video: Video) => void, currentUser: User }) => {
    const [caption, setCaption] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('none');

    const FILTERS = [
        { name: 'Normal', value: 'none', color: 'bg-gray-500' },
        { name: 'B&W', value: 'grayscale(100%)', color: 'bg-gray-800' },
        { name: 'Sepia', value: 'sepia(0.8)', color: 'bg-yellow-700' },
        { name: 'Vivid', value: 'saturate(2)', color: 'bg-red-500' },
        { name: 'Cool', value: 'hue-rotate(180deg)', color: 'bg-blue-400' },
        { name: 'Warm', value: 'sepia(0.4) saturate(1.5)', color: 'bg-orange-400' },
        { name: 'Invert', value: 'invert(1)', color: 'bg-white' },
        { name: 'Vintage', value: 'contrast(1.2) brightness(0.9)', color: 'bg-purple-800' },
    ];

    const handleFileSelect = () => {
        // Simulate file selection
        const mockVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
        setPreviewUrl(mockVideo);
        setActiveFilter('none');
    };

    const handlePost = () => {
        if (!previewUrl) return;
        
        const newVideo: Video = {
            id: `v_${Date.now()}`,
            url: previewUrl,
            thumbnail: 'https://picsum.photos/400/700', // Mock thumbnail
            likes: '0',
            comments: '0',
            author: currentUser,
            description: caption || 'New Reel ✨',
            filter: activeFilter
        };
        onPost(newVideo);
        onBack();
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-fade-in" role="dialog" aria-label="Create New Reel">
            {/* Header */}
            <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
                <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md" aria-label="Close creator">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-white font-bold text-lg drop-shadow-md">New Reel</h2>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Preview / Camera Area */}
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                    <video 
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        style={{ filter: activeFilter }}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                        <CameraIcon className="w-20 h-20 opacity-50" />
                        <p>Camera Preview</p>
                    </div>
                )}

                {/* Camera Controls Overlay (Mock) */}
                {!previewUrl && (
                    <div className="absolute right-4 top-20 flex flex-col gap-6 text-white">
                         <button className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition" aria-label="Toggle Flash">
                             <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">⚡️</div>
                             <span className="text-[10px]">Flash</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition" aria-label="Change Recording Speed">
                             <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">1x</div>
                             <span className="text-[10px]">Speed</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition" aria-label="Set Timer">
                             <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">⏱</div>
                             <span className="text-[10px]">Timer</span>
                         </button>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-black pb-safe relative z-20">
                {previewUrl ? (
                    <div className="space-y-4 pt-4">
                        {/* Filters Carousel */}
                        <div className="px-4">
                            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Filters</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" role="radiogroup" aria-label="Video Filters">
                                {FILTERS.map((f) => (
                                    <button 
                                        key={f.name}
                                        onClick={() => setActiveFilter(f.value)}
                                        className={`flex flex-col items-center gap-1 min-w-[60px] group transition-transform active:scale-95`}
                                        aria-label={`Apply ${f.name} filter`}
                                        aria-pressed={activeFilter === f.value}
                                        role="radio"
                                        aria-checked={activeFilter === f.value}
                                    >
                                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden ${activeFilter === f.value ? 'border-white ring-2 ring-blue-500' : 'border-gray-600'}`}>
                                            <div 
                                                className={`w-full h-full ${f.color}`}
                                                style={ f.name === 'Normal' ? {} : { filter: f.value }}
                                            ></div>
                                        </div>
                                        <span className={`text-[10px] font-medium ${activeFilter === f.value ? 'text-white' : 'text-gray-500'}`}>{f.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900 rounded-t-2xl space-y-4">
                            <div className="flex gap-3">
                                <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-700" alt="" />
                                <input 
                                    type="text" 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption..." 
                                    className="flex-1 bg-gray-800 rounded-xl px-4 text-white outline-none focus:ring-1 ring-blue-500"
                                    aria-label="Video Caption"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPreviewUrl(null)} className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition" aria-label="Discard and retake video">Retake</button>
                                <button onClick={handlePost} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition" aria-label="Post Reel">Post Reel</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center px-8 py-6">
                        <button onClick={handleFileSelect} className="w-10 h-10 rounded-lg border-2 border-white/30 overflow-hidden" aria-label="Select video from gallery">
                            <img src="https://picsum.photos/id/10/100/100" className="w-full h-full object-cover opacity-60" alt="Gallery preview" />
                        </button>
                        
                        <button 
                            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-transparent'}`}
                            onClick={() => setIsRecording(!isRecording)}
                            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            <div className={`w-16 h-16 bg-red-500 rounded-full ${isRecording ? 'animate-pulse' : ''}`}></div>
                        </button>

                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white" aria-label="Switch Camera">
                            <CameraIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Comment Sheet Component ---
const CommentSheet = ({ 
    isOpen, 
    onClose, 
    comments, 
    onAddComment,
    onViewProfile
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    comments: Comment[]; 
    onAddComment: (text: string) => void;
    onViewProfile: (user: User) => void;
}) => {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (text.trim()) {
            onAddComment(text);
            setText('');
        }
    };

    return (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 w-full md:w-[450px] md:mx-auto h-[65%] rounded-t-2xl flex flex-col shadow-2xl animate-slide-up overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 relative">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-8"></div> {/* Spacer */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Comments {comments.length > 0 && `(${comments.length})`}</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <CloseIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <img onClick={() => onViewProfile(comment.author)} src={comment.author.avatar || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-full object-cover flex-shrink-0 cursor-pointer" alt={comment.author.name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span onClick={() => onViewProfile(comment.author)} className="text-sm font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">{comment.author.name}</span>
                                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 leading-snug whitespace-pre-wrap">{comment.text}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs font-semibold text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Reply</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-1">
                                <button className="text-gray-400 hover:text-red-500 transition">
                                    <HeartIcon className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-gray-400">{comment.likes ?? 0}</span>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-6">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <CommentIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-300">No comments yet</p>
                            <p className="text-sm mt-1">Start the conversation.</p>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 ring-1 ring-transparent focus-within:ring-blue-500/50 transition-all">
                        <img src={CURRENT_USER.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="Me" />
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder={`Add a comment as ${CURRENT_USER.name}...`}
                            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-500 py-1"
                        />
                        <button 
                            onClick={handleSubmit} 
                            disabled={!text.trim()}
                            className={`p-2 rounded-full transition-all ${text.trim() ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-gray-400 cursor-not-allowed'}`}
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Share Sheet Component ---
const ShareSheet = ({ isOpen, onClose, video }: { isOpen: boolean, onClose: () => void, video: Video }) => {
    if (!isOpen) return null;
    
    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full md:w-[450px] md:mx-auto rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-center mb-4 dark:text-white">Share to</h3>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {['Direct', 'WhatsApp', 'Facebook', 'Messenger', 'Twitter', 'Email'].map(app => (
                        <div key={app} className="flex flex-col items-center gap-2 min-w-[70px]">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                                📱
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{app}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mt-2 overflow-x-auto no-scrollbar pb-2">
                    {['Copy Link', 'Save Video', 'Duet', 'Stitch'].map(action => (
                         <div key={action} className="flex flex-col items-center gap-2 min-w-[70px]">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white">
                                <ShareIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{action}</span>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReelItem: React.FC<ReelItemProps> = ({ video, currentUser, isActive, isMuted, toggleMute, onViewProfile, onSubscribe, onUseSound }) => {
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
      { id: 'c1', author: MOCK_USERS['u2'], text: 'Awesome shot! 🔥', timestamp: '1h ago', likes: 12 },
      { id: 'c2', author: MOCK_USERS['u5'], text: 'Where is this?', timestamp: '30m ago', likes: 5 },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isSubscribed = currentUser.followingIds?.includes(video.author.id);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = async () => {
        try {
            await videoElement.play();
            setIsPlaying(true);
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                console.error("Video play failed:", error);
            }
            setIsPlaying(false);
        }
    };
    
    if (isActive) {
        handlePlay();
    } else {
        videoElement.pause();
        videoElement.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const updateProgress = () => {
      if (videoEl.duration > 0) {
        setProgress((videoEl.currentTime / videoEl.duration) * 100);
      }
    };
    videoEl.addEventListener('timeupdate', updateProgress);
    return () => videoEl.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      videoElement.play().catch(e => {
          if ((e as DOMException).name !== 'AbortError') console.error("Play toggle failed", e);
      });
      setIsPlaying(true);
    }
  };

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
        id: `c_${Date.now()}`,
        author: currentUser,
        text,
        timestamp: 'Just now',
    };
    setComments(prev => [newComment, ...prev]);
  };
  
  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={video.url}
        loop
        muted={isMuted}
        onClick={togglePlay}
        className="w-full h-full object-cover"
        playsInline
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
          <PlayCircleIcon className="w-20 h-20 text-white/70" />
        </div>
      )}

      {/* Overlays */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe text-white bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end">
          {/* Left Side: Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <img onClick={() => onViewProfile(video.author)} src={video.author.avatar} className="w-10 h-10 rounded-full border-2 border-white cursor-pointer" alt={video.author.name} />
              <span onClick={() => onViewProfile(video.author)} className="font-bold cursor-pointer">{video.author.name}</span>
              <button 
                onClick={() => onSubscribe && onSubscribe(video.author.id)} 
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${isSubscribed ? 'bg-transparent border border-white/50 text-white' : 'bg-white text-black'}`}
              >
                  {isSubscribed ? 'Following' : 'Follow'}
              </button>
            </div>
            <p className="text-sm line-clamp-2">{video.description}</p>
            <div onClick={() => onUseSound && onUseSound(video)} className="flex items-center gap-2 text-xs cursor-pointer">
              <MusicIcon className="w-4 h-4" />
              Original Sound - {video.author.name}
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1">
              <HeartIcon className={`w-8 h-8 transition-transform ${liked ? 'text-red-500' : ''}`} filled={liked} />
              <span className="text-xs font-bold">{video.likes}</span>
            </button>
            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
              <CommentIcon className="w-8 h-8" />
              <span className="text-xs font-bold">{comments.length}</span>
            </button>
            <button onClick={() => setShowShare(true)} className="flex flex-col items-center gap-1">
              <ShareIcon className="w-8 h-8" />
              <span className="text-xs font-bold">{video.shareCount}</span>
            </button>
            <button onClick={toggleMute}>
              {isMuted ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      <CommentSheet isOpen={showComments} onClose={() => setShowComments(false)} comments={comments} onAddComment={handleAddComment} onViewProfile={onViewProfile} />
      <ShareSheet isOpen={showShare} onClose={() => setShowShare(false)} video={video} />
    </div>
  );
};
export const VideoReels: React.FC<VideoReelsProps> = ({ videos, currentUser, isMuted, toggleMute, onViewProfile, onCreateReel, onSubscribe, onUseSound }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter videos based on active tab
  const displayVideos = React.useMemo(() => {
      if (activeTab === 'following') {
          return videos.filter(v => currentUser.followingIds?.includes(v.author.id));
      }
      return videos; // 'for_you' shows all or algorithmic feed
  }, [videos, activeTab, currentUser.followingIds]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        }
      },
      { threshold: 0.7 }
    );

    const elements = containerRef.current?.childNodes;
    if (elements) {
      elements.forEach((el) => observer.observe(el as Element));
    }

    return () => {
      const elements = containerRef.current?.childNodes;
      if (elements) {
        elements.forEach((el) => observer.unobserve(el as Element));
      }
    };
  }, [displayVideos]); // Dependencies updated to re-observe when list changes

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 text-white pointer-events-none">
        <div className="flex items-center gap-4 font-bold text-lg pointer-events-auto">
          <button 
            onClick={() => setActiveTab('following')} 
            className={`transition-opacity ${activeTab === 'following' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          >
            Following
          </button>
          <div className="w-px h-4 bg-white/30"></div>
          <button 
            onClick={() => setActiveTab('for_you')} 
            className={`transition-opacity ${activeTab === 'for_you' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          >
            For You
          </button>
        </div>
        <button onClick={onCreateReel} className="p-2 rounded-full hover:bg-white/20 pointer-events-auto">
          <CameraIcon className="w-6 h-6" />
        </button>
      </div>

      {displayVideos.length > 0 ? displayVideos.map((video, index) => (
        <div key={video.id} data-index={index} className="h-full w-full snap-start flex-shrink-0 relative">
          <ReelItem
            video={video}
            currentUser={currentUser}
            isActive={index === activeIndex}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onViewProfile={onViewProfile}
            onSubscribe={onSubscribe}
            onUseSound={onUseSound}
          />
        </div>
      )) : (
          <div className="h-full w-full flex items-center justify-center text-white flex-col gap-4 bg-black">
              <p>No videos in your Following feed yet.</p>
              <button onClick={() => setActiveTab('for_you')} className="bg-white text-black px-4 py-2 rounded-full font-bold">Go to For You</button>
          </div>
      )}
    </div>
  );
};

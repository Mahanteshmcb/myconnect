
import React, { useState, useRef, useEffect } from 'react';
import { Video, Comment, User } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, PlayCircleIcon, CloseIcon, SendIcon, PlusIcon, CameraIcon, MusicIcon, CheckIcon } from './Icons';
import { CURRENT_USER } from '../services/mockData';

interface VideoReelsProps {
  videos: Video[];
  isMuted: boolean;
  toggleMute: () => void;
  onViewProfile: (user: User) => void;
  onCreateReel: () => void;
  onSubscribe?: (userId: string) => void;
  onUseSound?: (video: Video) => void;
}

interface ReelItemProps {
  video: Video;
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
                                <span className="text-xs text-gray-400">12</span>
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

const ReelItem: React.FC<ReelItemProps> = ({ video, isActive, isMuted, toggleMute, onViewProfile, onSubscribe, onUseSound }) => {
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [progress, setProgress] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Interaction Sheets
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAudioInfo, setShowAudioInfo] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([
      { id: '1', author: { ...video.author, name: 'Jessica Miller', avatar: 'https://picsum.photos/id/10/100/100' }, text: 'This view is absolutely breathtaking! 😍 Where exactly is this?', timestamp: '2h' },
      { id: '2', author: { ...video.author, name: 'David Chen', avatar: 'https://picsum.photos/id/12/100/100' }, text: 'I need to go here next summer. Adding to my bucket list.', timestamp: '45m' },
      { id: '3', author: { ...video.author, name: 'Alex Rivera', avatar: 'https://picsum.photos/id/32/100/100' }, text: 'The editing on this is top notch 🔥', timestamp: '10m' },
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);

  // Auto play/pause based on active state
  useEffect(() => {
      if (isActive) {
          if (videoRef.current) {
              videoRef.current.currentTime = 0; // Restart video when it becomes active
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
      } else {
          videoRef.current?.pause();
          setIsPlaying(false);
          setShowComments(false); // Close comments when scrolling away
      }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTap = (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          // Double Tap detected
          if (!liked) {
              setLiked(true);
          }
          setShowHeartOverlay(true);
          setTimeout(() => setShowHeartOverlay(false), 1000);
      } else {
          // Single Tap detected
          togglePlay();
      }
      lastTapRef.current = now;
  };

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(percent);
      }
  };

  const handleAddComment = (text: string) => {
      const newComment: Comment = {
          id: `c${Date.now()}`,
          author: CURRENT_USER,
          text: text,
          timestamp: 'Just now'
      };
      setComments([newComment, ...comments]);
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSubscribed(!isSubscribed);
      if (onSubscribe) {
          onSubscribe(video.author.id);
      }
  };

  const handleUseSoundClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUseSound) {
          onUseSound(video);
      }
      setShowAudioInfo(false);
  };

  return (
    <div className="relative w-full h-full snap-start flex items-center justify-center bg-black overflow-hidden">
      {/* Video Layer */}
      <div className="relative w-full h-full md:max-w-[450px] cursor-pointer" onClick={handleTap}>
          {video.url ? (
              <video
                ref={videoRef}
                src={video.url}
                poster={video.thumbnail}
                className="w-full h-full object-cover"
                style={{ filter: video.filter || 'none' }}
                loop
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
              />
          ) : (
              <div className="flex items-center justify-center h-full text-white bg-gray-800">
                  Video unavailable
              </div>
          )}
          
          {/* Pause Indicator */}
          {!isPlaying && !showComments && !showShare && !showAudioInfo && video.url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                  <PlayCircleIcon className="w-16 h-16 text-white/50 animate-pulse" />
              </div>
          )}

          {/* Double Tap Heart Animation */}
          {showHeartOverlay && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <HeartIcon className="w-28 h-28 text-white/90 animate-like drop-shadow-2xl filter" filled />
              </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
               <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
      
          {/* Overlay UI */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none transition-opacity duration-300 ${showComments || showShare ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute bottom-4 left-0 right-0 p-4 pb-12 md:pb-4 flex items-end justify-between pointer-events-auto">
                
                {/* Left Side: Info */}
                <div className="flex-1 pr-12 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <img onClick={() => onViewProfile(video.author)} src={video.author.avatar} className="w-10 h-10 rounded-full border border-white cursor-pointer" alt="" />
                        <span onClick={() => onViewProfile(video.author)} className="font-bold text-shadow cursor-pointer hover:underline">{video.author.handle}</span>
                        <button 
                            onClick={handleSubscribeClick}
                            className={`border border-white/50 text-xs px-3 py-1 rounded-lg font-semibold backdrop-blur-md hover:bg-white/20 transition ${isSubscribed ? 'bg-white/20 text-white' : 'bg-transparent'}`}
                        >
                            {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2 leading-snug text-shadow-sm">{video.description}</p>
                    <div 
                        className="flex items-center gap-2 text-xs opacity-90 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setShowAudioInfo(true); }}
                    >
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                           <MusicIcon className="w-3 h-3" />
                           <div className="w-24 overflow-hidden whitespace-nowrap">
                               <span className="animate-marquee">Original Sound - {video.author.name}</span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col items-center gap-5 min-w-[50px]">
                    <div className="flex flex-col items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className="p-2 transition active:scale-90">
                            <HeartIcon className={`w-9 h-9 drop-shadow-lg ${liked ? 'text-red-500 fill-red-500 animate-like' : 'text-white'}`} filled={liked} />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{video.likes}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                            className="p-2 transition active:scale-90"
                        >
                            <CommentIcon className="w-8 h-8 text-white drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{comments.length}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
                            className="p-2 transition active:scale-90"
                         >
                             <ShareIcon className="w-8 h-8 text-white drop-shadow-lg" />
                         </button>
                         <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                    </div>

                    <div 
                        className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center border border-white/20 mt-2 animate-spin-slow cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setShowAudioInfo(true); }}
                    >
                        <img src={video.author.avatar} className="w-6 h-6 rounded-full" />
                    </div>
                </div>
            </div>
          </div>

          {/* Mute Toggle */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className={`absolute top-20 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-black/40 transition ${showComments || showShare ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
              {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
          </button>

          {/* Comments Modal */}
          <CommentSheet 
            isOpen={showComments} 
            onClose={() => setShowComments(false)}
            comments={comments}
            onAddComment={handleAddComment}
            onViewProfile={onViewProfile}
          />

          {/* Share Sheet */}
          <ShareSheet 
            isOpen={showShare}
            onClose={() => setShowShare(false)}
            video={video}
          />

          {/* Audio Info Sheet */}
          {showAudioInfo && (
              <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAudioInfo(false)}>
                  <div className="bg-white dark:bg-gray-900 w-full p-6 rounded-t-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <MusicIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg dark:text-white">Original Sound</h3>
                              <p className="text-gray-500">{video.author.name}</p>
                              <p className="text-xs text-gray-400 mt-2">10.5K videos made with this sound</p>
                          </div>
                      </div>
                      <button 
                        onClick={handleUseSoundClick} 
                        className="w-full mt-6 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
                      >
                          Use this sound
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export const VideoReels: React.FC<VideoReelsProps> = ({ videos, isMuted, toggleMute, onViewProfile, onCreateReel, onSubscribe, onUseSound }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
      if (containerRef.current) {
          const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
          if (index !== activeIndex) setActiveIndex(index);
      }
  };

  return (
    <div className="relative h-full w-full">
        {/* Creation Floating Action Button - Only show if not passed from LongFormVideo */}
        {onCreateReel && (
            <button 
                onClick={onCreateReel}
                className="absolute top-20 md:top-6 left-4 z-30 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-3 rounded-full text-white shadow-lg hover:scale-110 transition active:scale-95"
                aria-label="Create Reel"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        )}

        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
        {videos.map((video, index) => (
            <ReelItem 
            key={video.id} 
            video={video} 
            isActive={index === activeIndex} 
            isMuted={isMuted}
            toggleMute={toggleMute}
            onViewProfile={onViewProfile}
            onSubscribe={onSubscribe}
            onUseSound={onUseSound}
            />
        ))}
        </div>
    </div>
  );
};

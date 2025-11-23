import React, { useState, useRef, useEffect } from 'react';
import { Video, Comment } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, PlayCircleIcon, CloseIcon, SendIcon } from './Icons';
import { CURRENT_USER } from '../services/mockData';

interface VideoReelsProps {
  videos: Video[];
  isMuted: boolean;
  toggleMute: () => void;
}

interface ReelItemProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

// --- Comment Sheet Component ---
const CommentSheet = ({ 
    isOpen, 
    onClose, 
    comments, 
    onAddComment 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    comments: Comment[]; 
    onAddComment: (text: string) => void;
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
                            <img src={comment.author.avatar || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt={comment.author.name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">{comment.author.name}</span>
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
                                <span className="text-[10px] text-gray-400">12</span>
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

const ReelItem = ({ video, isActive, isMuted, toggleMute }: ReelItemProps) => {
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [progress, setProgress] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  
  // Comment State
  const [showComments, setShowComments] = useState(false);
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

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-full snap-start flex items-center justify-center bg-black overflow-hidden">
      {/* Video Layer */}
      <div className="relative w-full h-full md:max-w-[450px] cursor-pointer" onClick={handleTap}>
          <video
            ref={videoRef}
            src={video.url}
            poster={video.thumbnail}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
          />
          
          {/* Pause Indicator */}
          {!isPlaying && !showComments && (
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
          <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute bottom-4 left-0 right-0 p-4 pb-12 md:pb-4 flex items-end justify-between pointer-events-auto">
                
                {/* Left Side: Info */}
                <div className="flex-1 pr-12 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <img src={video.author.avatar} className="w-10 h-10 rounded-full border border-white" alt="" />
                        <span className="font-bold text-shadow">{video.author.handle}</span>
                        <button className="border border-white/50 bg-transparent text-xs px-3 py-1 rounded-lg font-semibold backdrop-blur-md hover:bg-white/20 transition">Follow</button>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2 leading-snug text-shadow-sm">{video.description}</p>
                    <div className="flex items-center gap-2 text-xs opacity-90">
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                           <span>♫</span>
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
                         <button className="p-2 transition active:scale-90">
                             <ShareIcon className="w-8 h-8 text-white drop-shadow-lg" />
                         </button>
                         <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                    </div>

                    <div className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center border border-white/20 mt-2 animate-spin-slow">
                        <img src={video.author.avatar} className="w-6 h-6 rounded-full" />
                    </div>
                </div>
            </div>
          </div>

          {/* Mute Toggle */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className={`absolute top-20 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-black/40 transition ${showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
              {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
          </button>

          {/* Comments Modal */}
          <CommentSheet 
            isOpen={showComments} 
            onClose={() => setShowComments(false)}
            comments={comments}
            onAddComment={handleAddComment}
          />
      </div>
    </div>
  );
};

export const VideoReels: React.FC<VideoReelsProps> = ({ videos, isMuted, toggleMute }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
      if (containerRef.current) {
          const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
          if (index !== activeIndex) setActiveIndex(index);
      }
  };

  return (
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
        />
      ))}
    </div>
  );
};

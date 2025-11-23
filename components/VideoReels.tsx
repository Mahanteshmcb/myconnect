import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, PlayCircleIcon } from './Icons';

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

const ReelItem = ({ video, isActive, isMuted, toggleMute }: ReelItemProps) => {
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(percent);
      }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-full snap-start flex items-center justify-center bg-black overflow-hidden">
      {/* Video Layer */}
      <div className="relative w-full h-full md:max-w-[450px]" onClick={togglePlay}>
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
          
          {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <PlayCircleIcon className="w-16 h-16 text-white/80" />
              </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
               <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
      
          {/* Overlay UI */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none">
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
                        <button className="p-2 transition active:scale-90">
                            <CommentIcon className="w-8 h-8 text-white drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{video.comments}</span>
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
            className="absolute top-20 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-black/40 transition"
          >
              {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
          </button>
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
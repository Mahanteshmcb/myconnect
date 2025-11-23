import React, { useState } from 'react';
import { Video } from '../types';
import { HeartIcon, CommentIcon, ShareIcon } from './Icons';

interface VideoReelsProps {
  videos: Video[];
}

const ReelItem = ({ video }: { video: Video }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative w-full h-full snap-start flex items-center justify-center bg-gray-900">
      {/* Simulated Video Background */}
      <div className="absolute inset-0 opacity-60">
        <img src={video.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover blur-sm" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
          <img src={video.thumbnail} alt="Video content" className="max-w-full max-h-full object-contain shadow-2xl" />
      </div>

      {/* Overlay UI */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-24 md:pb-8 text-white">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-12">
            <div className="flex items-center gap-2 mb-3">
              <img src={video.author.avatar} alt={video.author.name} className="w-10 h-10 rounded-full border border-white" />
              <span className="font-bold text-sm">{video.author.handle}</span>
              <button className="bg-transparent border border-white/50 text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">Follow</button>
            </div>
            <p className="text-sm mb-4 leading-relaxed">{video.description}</p>
            <div className="flex items-center gap-2 text-xs opacity-80">
                <span>♫ Original Sound - {video.author.name}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div 
                onClick={() => setLiked(!liked)}
                className="bg-gray-800/50 p-3 rounded-full backdrop-blur-md cursor-pointer hover:bg-gray-700/50 transition"
              >
                <HeartIcon className={`w-7 h-7 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} filled={liked} />
              </div>
              <span className="text-xs font-medium">{video.likes}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="bg-gray-800/50 p-3 rounded-full backdrop-blur-md cursor-pointer hover:bg-gray-700/50 transition">
                <CommentIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-medium">{video.comments}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="bg-gray-800/50 p-3 rounded-full backdrop-blur-md cursor-pointer hover:bg-gray-700/50 transition">
                <ShareIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-medium">Share</span>
            </div>
            
            <div className="animate-spin-slow mt-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center overflow-hidden">
                  <img src={video.author.avatar} className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoReels: React.FC<VideoReelsProps> = ({ videos }) => {
  return (
    <div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {videos.map((video) => (
        <ReelItem key={video.id} video={video} />
      ))}
    </div>
  );
};
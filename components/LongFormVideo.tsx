import React, { useState } from 'react';
import { LongFormVideo, User } from '../types';
import { SearchIcon, MenuIcon, BellIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, PlusIcon } from './Icons';

interface LongFormVideoProps {
  videos: LongFormVideo[];
  currentUser: User;
  onUpdateVideo: (video: LongFormVideo) => void;
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

const SidebarItem = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export const LongFormVideoApp: React.FC<LongFormVideoProps> = ({ videos, currentUser, onUpdateVideo }) => {
  const [currentView, setCurrentView] = useState<'BROWSE' | 'WATCH'>('BROWSE');
  const [selectedVideo, setSelectedVideo] = useState<LongFormVideo | null>(null);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState('');
  // Local comment state - in a real app this would be in the data model or fetched
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', user: 'User 1', avatar: 'https://picsum.photos/id/50/50/50', text: 'Great video! Really helpful.', time: '2 hours ago', likes: 12 },
    { id: 'c2', user: 'User 2', avatar: 'https://picsum.photos/id/51/50/50', text: 'Can you make a tutorial on the backend next?', time: '3 hours ago', likes: 5 },
  ]);

  const handleVideoClick = (video: LongFormVideo) => {
    setSelectedVideo(video);
    setCurrentView('WATCH');
    window.scrollTo(0, 0);
    // Reset comments for "demo" feel on new video
    setComments([
      { id: 'c1', user: 'User 1', avatar: 'https://picsum.photos/id/50/50/50', text: 'Great video! Really helpful.', time: '2 hours ago', likes: 12 },
      { id: 'c2', user: 'User 2', avatar: 'https://picsum.photos/id/51/50/50', text: 'Can you make a tutorial on the backend next?', time: '3 hours ago', likes: 5 },
    ]);
  };

  const handleBack = () => {
    setCurrentView('BROWSE');
    setSelectedVideo(null);
  };

  const toggleSubscribe = (authorId: string) => {
    setSubscribed(prev => ({...prev, [authorId]: !prev[authorId]}));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser.name,
      avatar: currentUser.avatar,
      text: commentText,
      time: 'Just now',
      likes: 0
    };
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  if (currentView === 'WATCH' && selectedVideo) {
    const isSubscribed = subscribed[selectedVideo.author.id];

    return (
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto pb-20">
        {/* Primary Content (Video + Details) */}
        <div className="flex-1">
          <div className="mb-4">
             <button onClick={handleBack} className="mb-2 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 lg:hidden">
                ← Back to Browse
             </button>
            {/* Simulated Player */}
            <div className="w-full aspect-video bg-black rounded-xl shadow-lg relative group overflow-hidden">
               <img src={selectedVideo.thumbnail} className="w-full h-full object-cover opacity-50" alt="thumbnail" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition shadow-xl">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               </div>
               {/* Progress Bar Mock */}
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                  <div className="w-1/3 h-full bg-red-600"></div>
               </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
               <img src={selectedVideo.author.avatar} className="w-10 h-10 rounded-full" alt={selectedVideo.author.name} />
               <div>
                  <h3 className="font-bold text-sm">{selectedVideo.author.name}</h3>
                  <p className="text-xs text-gray-500">{selectedVideo.author.subscribers} subscribers</p>
               </div>
               <button 
                 onClick={() => toggleSubscribe(selectedVideo.author.id)}
                 className={`ml-4 px-4 py-2 rounded-full text-sm font-medium transition ${isSubscribed ? 'bg-gray-100 text-gray-800' : 'bg-black text-white hover:bg-gray-800'}`}
               >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
               </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
               <div className="flex bg-gray-100 rounded-full overflow-hidden">
                  <button className="px-4 py-2 hover:bg-gray-200 flex items-center gap-2 border-r border-gray-300 text-sm font-medium transition">
                     <ThumbsUpIcon className="w-5 h-5" /> 12K
                  </button>
                  <button className="px-4 py-2 hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition">
                     <ThumbsDownIcon className="w-5 h-5" />
                  </button>
               </div>
               <button className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition">
                  <ShareIcon className="w-5 h-5" /> Share
               </button>
               <button className="px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-sm font-medium transition">
                  ...
               </button>
            </div>
          </div>

          <div className="mt-4 bg-gray-100 p-3 rounded-xl text-sm cursor-pointer hover:bg-gray-200 transition">
             <div className="font-bold mb-1">{selectedVideo.views} views • {selectedVideo.uploadedAt}</div>
             <p className="text-gray-800 whitespace-pre-wrap">{selectedVideo.description}</p>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
             <h3 className="font-bold text-lg mb-4">{comments.length} Comments</h3>
             <div className="flex gap-3 mb-6">
                <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="me" />
                <div className="flex-1">
                   <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment..." 
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent transition" 
                    />
                    <button onClick={handleAddComment} disabled={!commentText.trim()} className="text-sm font-bold text-blue-600 disabled:text-gray-400">
                      Comment
                    </button>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                {comments.map((comment) => (
                   <div key={comment.id} className="flex gap-3">
                      <img src={comment.avatar} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" alt={comment.user} />
                      <div>
                         <div className="text-xs font-bold text-gray-900">{comment.user} <span className="text-gray-500 font-normal ml-1">{comment.time}</span></div>
                         <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                         <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 cursor-pointer">
                              <ThumbsUpIcon className="w-3 h-3 text-gray-500" /> 
                              <span className="text-xs text-gray-500">{comment.likes || ''}</span>
                            </div>
                            <ThumbsDownIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            <span className="text-xs font-medium text-gray-500 cursor-pointer">Reply</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar (Related Videos) */}
        <div className="lg:w-[400px] space-y-3">
           {videos.filter(v => v.id !== selectedVideo.id).map(video => (
              <div key={video.id} onClick={() => handleVideoClick(video)} className="flex gap-2 cursor-pointer group">
                 <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt={video.title} />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-[10px] px-1 rounded">{video.duration}</span>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600">{video.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{video.author.name}</p>
                    <p className="text-xs text-gray-500">{video.views} views • {video.uploadedAt}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  // BROWSE VIEW
  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar (Desktop) */}
      <div className="hidden md:flex w-60 flex-col p-3 gap-2 overflow-y-auto border-r border-gray-100">
        <SidebarItem icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>} label="Home" active />
        <SidebarItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="Shorts" />
        <SidebarItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} label="Subscriptions" />
        <hr className="my-2 border-gray-200" />
        <h3 className="px-3 text-sm font-bold text-gray-700 mb-1">You</h3>
        <SidebarItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="History" />
        <SidebarItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Your videos" />
        <SidebarItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} label="Watch later" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Filter Chips */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar border-b border-gray-100">
          {['All', 'Gaming', 'Music', 'Live', 'Mixes', 'Technology', 'Cooking', 'Recently uploaded'].map((cat, i) => (
             <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${i === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
               {cat}
             </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-4">
          {videos.map(video => (
            <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer group">
              <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
                <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={video.title} />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  {video.duration}
                </span>
              </div>
              <div className="flex gap-3">
                <img src={video.author.avatar} className="w-9 h-9 rounded-full mt-1" alt={video.author.name} />
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{video.title}</h3>
                  <div className="text-sm text-gray-500">
                    <p className="hover:text-gray-800">{video.author.name} {video.author.verified && '✔'}</p>
                    <p>{video.views} views • {video.uploadedAt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
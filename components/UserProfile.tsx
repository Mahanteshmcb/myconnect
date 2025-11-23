import React, { useState } from 'react';
import { User, Post, Video } from '../types';
import { GridIcon, TagIcon, PlayCircleIcon, SettingsIcon, CameraIcon, BackIcon } from './Icons';

interface UserProfileProps {
  user: User;
  posts: Post[];
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, posts, onBack }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  
  // Filter content for this user
  const userPosts = posts.filter(p => p.author.id === user.id);
  
  // Mock reels/tagged data as we only have global data in props usually
  const mockReels = Array.from({ length: 6 }).map((_, i) => ({
      id: `r${i}`,
      thumbnail: `https://picsum.photos/id/${40 + i}/400/600`,
      views: '12K'
  }));

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
      {/* Header */}
      <div className="relative">
         <div className="h-40 md:h-60 w-full bg-gray-300 dark:bg-gray-800 overflow-hidden">
            {user.coverImage && <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />}
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 md:hidden">
                <BackIcon className="w-6 h-6" />
            </button>
         </div>
         
         <div className="max-w-4xl mx-auto px-4 relative">
            <div className="absolute -top-16 left-4 md:left-0">
                <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-white dark:bg-gray-800" />
                    <button className="absolute bottom-2 right-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-full border border-white dark:border-gray-900 text-gray-600 dark:text-gray-300">
                        <CameraIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        {user.verified && <span className="text-blue-500 text-lg">✔</span>}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{user.handle}</p>
                </div>
                
                <div className="flex gap-3">
                   <button className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                       Edit Profile
                   </button>
                   <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                       <SettingsIcon className="w-6 h-6" />
                   </button>
                </div>
            </div>
            
            {/* Bio */}
            <div className="mt-4 max-w-2xl">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 mt-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">{userPosts.length}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">{user.subscribers || '0'}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">{user.following || '0'}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Following</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex mt-2 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
                <button 
                   onClick={() => setActiveTab('posts')}
                   className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'posts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <GridIcon className="w-5 h-5" /> Posts
                </button>
                <button 
                   onClick={() => setActiveTab('reels')}
                   className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'reels' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <PlayCircleIcon className="w-5 h-5" /> Reels
                </button>
                <button 
                   onClick={() => setActiveTab('tagged')}
                   className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'tagged' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <TagIcon className="w-5 h-5" /> Tagged
                </button>
            </div>

            {/* Content Grid */}
            <div className="py-4 min-h-[300px]">
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {userPosts.length > 0 ? userPosts.map(post => (
                            <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-900 relative group cursor-pointer overflow-hidden">
                                {post.image ? (
                                    <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-gray-500">{post.content.substring(0, 50)}...</div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold gap-4">
                                    <span>♥ {post.likes}</span>
                                    <span>💬 {post.comments}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 py-20 text-center text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CameraIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">No Posts Yet</h3>
                                <p>Share your first photo or video.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reels' && (
                     <div className="grid grid-cols-3 gap-1 md:gap-4">
                         {mockReels.map(reel => (
                             <div key={reel.id} className="aspect-[9/16] bg-gray-900 relative cursor-pointer group overflow-hidden">
                                 <img src={reel.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                 <div className="absolute bottom-2 left-2 text-white text-xs font-bold flex items-center gap-1">
                                     <PlayCircleIcon className="w-3 h-3" /> {reel.views}
                                 </div>
                             </div>
                         ))}
                     </div>
                )}

                {activeTab === 'tagged' && (
                     <div className="py-20 text-center text-gray-400">
                         <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                             <TagIcon className="w-8 h-8 text-gray-300" />
                         </div>
                         <h3 className="font-bold text-lg text-gray-900 dark:text-white">Photos of You</h3>
                         <p>When people tag you in photos, they'll appear here.</p>
                     </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { User, Post, Video, LongFormVideo, Product } from '../types';
import { GridIcon, TagIcon, PlayCircleIcon, SettingsIcon, CameraIcon, BackIcon, CloseIcon, CheckIcon, TwitterIcon, LinkedInIcon, GitHubIcon, SendIcon, PlusIcon, HeartIcon, CommentIcon, BookmarkIcon, QrCodeIcon, ShareIcon, LinkIcon, MapIcon, FilmIcon, ShoppingBagIcon } from './Icons';
import { MOCK_USERS, getFollowersForUser, getFollowingForUser } from '../services/mockData';
import { SettingsModal } from './Settings';

interface UserProfileProps {
  user: User; // The user profile being viewed
  currentUser: User; // The currently logged in user
  posts: Post[];
  longFormVideos: LongFormVideo[];
  marketItems: Product[];
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onStartChat: (user: User) => void; 
  onOpenSettings: () => void;
}

const UserListModal = ({ 
    title, 
    users, 
    onClose, 
    onFollow 
}: { 
    title: string, 
    users: User[], 
    onClose: () => void, 
    onFollow?: (u: User) => void 
}) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {users.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer">
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.handle}</p>
                            </div>
                            {onFollow && (
                                <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-white">
                                    View
                                </button>
                            )}
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileQRModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(`https://myconnect.app/${user.handle.replace('@','')}`);
        alert("Profile link copied!");
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-[32px] shadow-2xl p-8 flex flex-col items-center relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                    <CloseIcon className="w-5 h-5" />
                </button>
                
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg -mt-16 mb-4 overflow-hidden">
                    <img src={user.avatar} className="w-full h-full object-cover" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{user.handle}</p>
                
                <div className="w-64 h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 rounded-xl mb-6">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                        <QrCodeIcon className="w-48 h-48 text-black opacity-80" />
                    </div>
                </div>
                
                <div className="flex gap-4 w-full">
                    <button onClick={handleCopy} className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        <LinkIcon className="w-5 h-5" /> Copy Link
                    </button>
                    <button className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                        <ShareIcon className="w-5 h-5" /> Share
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContentDetailModal = ({ 
    item, 
    onClose,
    type
}: { 
    item: any, 
    onClose: () => void,
    type: 'post' | 'reel' | 'tagged' | 'video' | 'product'
}) => {
    const imgSrc = item.image || item.thumbnail || 'https://via.placeholder.com/600';
    const isVideoType = type === 'reel' || type === 'video';

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in" onClick={onClose}>
             <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 p-2 bg-black/50 rounded-full">
                 <CloseIcon className="w-6 h-6" />
             </button>

             <div className="flex w-full max-w-6xl h-full md:h-[85vh] bg-black md:bg-white md:dark:bg-gray-900 overflow-hidden md:rounded-xl shadow-2xl flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                 {/* Media Side */}
                 <div className="flex-1 bg-black flex items-center justify-center relative">
                     {isVideoType ? (
                         <video src={item.url} className="max-w-full max-h-full object-contain" controls autoPlay loop />
                     ) : (
                         <img src={imgSrc} className="max-w-full max-h-full object-contain" />
                     )}
                 </div>

                 {/* Details Side */}
                 <div className="hidden md:flex w-[400px] flex-col border-l border-gray-100 dark:border-gray-800">
                     <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                         <img src={item.author?.avatar} className="w-8 h-8 rounded-full"></img>
                         <span className="font-bold text-gray-900 dark:text-white text-sm">{item.author?.name || "User"}</span>
                     </div>
                     
                     <div className="flex-1 p-4 overflow-y-auto">
                         <div className="space-y-4">
                             <p className="text-sm text-gray-800 dark:text-gray-200">
                                <span className="font-bold">{item.author?.name || "User"}</span> {item.content || item.description || item.title || "No caption"}
                             </p>
                             <div className="text-center text-gray-400 text-sm py-10">Comments unavailable.</div>
                         </div>
                     </div>

                     <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                         <div className="flex justify-between mb-2">
                             <div className="flex gap-4">
                                 <HeartIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                 <CommentIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                 <SendIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                             </div>
                             <BookmarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                         </div>
                         <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">{item.likes || '0'} likes</div>
                         <div className="text-xs text-gray-500 uppercase">2 HOURS AGO</div>
                         <input type="text" placeholder="Add a comment..." className="w-full bg-transparent text-sm outline-none dark:text-white mt-4" />
                     </div>
                 </div>
             </div>
        </div>
    );
};

const StoryHighlights = () => {
    const highlights = [
        { id: 1, title: 'Travel', img: 'https://picsum.photos/id/101/200/200' },
        { id: 2, title: 'Food', img: 'https://picsum.photos/id/102/200/200' },
        { id: 3, title: 'Work', img: 'https://picsum.photos/id/103/200/200' },
        { id: 4, title: 'Pets', img: 'https://picsum.photos/id/104/200/200' },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-1">
            {highlights.map(h => (
                <div key={h.id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer opacity-90 hover:opacity-100 transition">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200 dark:bg-gray-700">
                        <img src={h.img} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-black" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-300">{h.title}</span>
                </div>
            ))}
            <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
                <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
                    <PlusIcon className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">New</span>
            </div>
        </div>
    );
};

export const UserProfile: React.FC<UserProfileProps> = ({ user, currentUser, posts, longFormVideos, marketItems, onBack, onUpdateUser, onStartChat, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'videos' | 'shop' | 'tagged'>('posts');
  const [showQR, setShowQR] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [listModalType, setListModalType] = useState<'followers' | 'following' | null>(null);

  const [viewingItem, setViewingItem] = useState<{item: any, type: 'post' | 'reel' | 'tagged' | 'video' | 'product'} | null>(null);
  
  const userPosts = posts.filter(p => p.author.id === user.id);
  const userVideos = longFormVideos.filter(v => v.author.id === user.id);
  const userProducts = marketItems.filter(p => p.sellerId === user.id);
  const isOwnProfile = user.id === currentUser.id;
  
  const canSeeDob = isOwnProfile || user.privacySettings?.dob === 'public' || (user.privacySettings?.dob === 'contacts' && isFollowing);
  const canSeeLocation = isOwnProfile || user.privacySettings?.address === 'public' || (user.privacySettings?.address === 'contacts' && isFollowing);

  const mockReels = Array.from({ length: 9 }).map((_, i) => ({
      id: `r${i}`,
      thumbnail: `https://picsum.photos/id/${200 + i}/400/600`,
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // Add URL for playback
      views: `${(Math.random() * 50).toFixed(1)}K`
  }));

  const mockTagged = Array.from({ length: 4 }).map((_, i) => ({
      id: `t${i}`,
      thumbnail: `https://picsum.photos/id/${300 + i}/400/400`,
  }));

  const getFollowList = (type: 'followers' | 'following'): User[] => {
      if (type === 'following') return getFollowingForUser(user.id);
      return getFollowersForUser(user.id);
  };

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
      {listModalType && (
          <UserListModal 
              title={listModalType === 'followers' ? 'Followers' : 'Following'}
              users={getFollowList(listModalType)}
              onClose={() => setListModalType(null)}
          />
      )}

      {showQR && <ProfileQRModal user={user} onClose={() => setShowQR(false)} />}
      {viewingItem && <ContentDetailModal item={viewingItem.item} type={viewingItem.type} onClose={() => setViewingItem(null)} />}

      <div className="relative">
         <div className="h-40 md:h-60 w-full bg-gray-300 dark:bg-gray-800 overflow-hidden group relative">
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 md:hidden z-10"><BackIcon className="w-6 h-6" /></button>
            {isOwnProfile && (
                <button onClick={onOpenSettings} className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition">
                    <CameraIcon className="w-5 h-5" />
                </button>
            )}
         </div>
         
         <div className="max-w-4xl mx-auto px-4 relative">
            <div className="absolute -top-16 left-4 md:left-0">
                <div className="relative group w-32 h-32">
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full border-4 border-white dark:border-black object-cover bg-white dark:bg-gray-800" />
                    {isOwnProfile && (
                        <button onClick={onOpenSettings} className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white border-2 border-white dark:border-black">
                            <CameraIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">{user.firstName ? `${user.firstName} ${user.lastName}` : user.name}{user.verified && <CheckIcon className="w-5 h-5 text-blue-500" />}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{user.handle}</p>
                        {canSeeDob && user.age && <p className="text-xs text-gray-400 mt-1">{user.age} years old</p>}
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                   {isOwnProfile ? (
                       <>
                           <button onClick={onOpenSettings} className="flex-1 md:flex-none px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">Edit Profile</button>
                           <button onClick={() => setShowQR(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Share Profile"><QrCodeIcon className="w-6 h-6" /></button>
                       </>
                   ) : (
                       <>
                           <button onClick={() => setIsFollowing(!isFollowing)} className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-semibold transition ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
                           <button onClick={() => onStartChat && onStartChat(user)} className="flex-1 md:flex-none px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">Message</button>
                       </>
                   )}
                </div>
            </div>
            
            <div className="mt-6 max-w-2xl space-y-4">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{user.bio || "No bio yet."}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    {canSeeLocation && (user.address || user.location) && <span className="flex items-center gap-1"><MapIcon className="w-4 h-4" /> {user.address || user.location}</span>}
                    {user.website && <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><LinkIcon className="w-4 h-4" /> {user.website.replace('https://', '')}</a>}
                    {user.joinedDate && <span className="flex items-center gap-1">📅 Joined {user.joinedDate}</span>}
                </div>
                {(user.twitter || user.linkedin || user.github) && (
                    <div className="flex items-center gap-3 mt-3 pt-2">
                        {user.twitter && <a href={user.twitter} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400 transition" title="Twitter"><TwitterIcon className="w-5 h-5" /></a>}
                        {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-700 transition" title="LinkedIn"><LinkedInIcon className="w-5 h-5" /></a>}
                        {user.github && <a href={user.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition" title="GitHub"><GitHubIcon className="w-5 h-5" /></a>}
                    </div>
                )}
                <StoryHighlights />
            </div>
            
            <div className="flex gap-8 mt-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-1"><span className="font-bold text-gray-900 dark:text-white">{userPosts.length}</span><span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span></div>
                <div onClick={() => setListModalType('followers')} className="flex items-center gap-1 cursor-pointer"><span className="font-bold text-gray-900 dark:text-white">{user.subscribers || '0'}</span><span className="text-gray-500 dark:text-gray-400 text-sm">Subscribers</span></div>
                <div onClick={() => setListModalType('following')} className="flex items-center gap-1 cursor-pointer"><span className="font-bold text-gray-900 dark:text-white">{user.following || '0'}</span><span className="text-gray-500 dark:text-gray-400 text-sm">Following</span></div>
            </div>

            <div className="flex mt-2 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
                <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'posts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'}`}><GridIcon className="w-5 h-5" /> Posts</button>
                <button onClick={() => setActiveTab('reels')} className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'reels' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'}`}><PlayCircleIcon className="w-5 h-5" /> Reels</button>
                <button onClick={() => setActiveTab('videos')} className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'videos' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'}`}><FilmIcon className="w-5 h-5" /> Videos</button>
                <button onClick={() => setActiveTab('shop')} className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'shop' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'}`}><ShoppingBagIcon className="w-5 h-5" /> Shop</button>
                <button onClick={() => setActiveTab('tagged')} className={`flex-1 py-4 flex justify-center items-center gap-2 text-sm font-medium uppercase transition border-b-2 ${activeTab === 'tagged' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'}`}><TagIcon className="w-5 h-5" /> Tagged</button>
            </div>

            <div className="py-4 min-h-[300px]">
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {userPosts.length > 0 ? userPosts.map(post => (
                            <div key={post.id} onClick={() => setViewingItem({item: post, type: 'post'})} className="aspect-square bg-gray-100 dark:bg-gray-900 relative group cursor-pointer overflow-hidden rounded-md"><img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold gap-4"><span>♥ {post.likes}</span><span>💬 {post.comments}</span></div></div>
                        )) : <div className="col-span-3 py-20 text-center text-gray-400"><CameraIcon className="w-8 h-8 mx-auto mb-2" /><h3 className="font-bold">No Posts Yet</h3></div>}
                    </div>
                )}
                {activeTab === 'reels' && (
                     <div className="grid grid-cols-3 gap-1 md:gap-4">
                         {mockReels.map(reel => (
                             <div key={reel.id} onClick={() => setViewingItem({item: reel, type: 'reel'})} className="aspect-[9/16] bg-gray-900 relative cursor-pointer group overflow-hidden rounded-md"><img src={reel.thumbnail} className="w-full h-full object-cover" /><div className="absolute bottom-2 left-2 text-white text-xs font-bold flex items-center gap-1 drop-shadow-md"><PlayCircleIcon className="w-3 h-3" /> {reel.views}</div></div>
                         ))}
                     </div>
                )}
                {activeTab === 'videos' && (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {userVideos.length > 0 ? userVideos.map(video => (
                            <div key={video.id} onClick={() => setViewingItem({item: video, type: 'video'})} className="aspect-video bg-gray-100 dark:bg-gray-900 relative group cursor-pointer overflow-hidden rounded-md"><img src={video.thumbnail} alt="Video" className="w-full h-full object-cover group-hover:scale-105 transition" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"><PlayCircleIcon className="w-10 h-10" /></div><span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{video.duration}</span></div>
                        )) : <div className="col-span-3 py-20 text-center text-gray-400"><FilmIcon className="w-8 h-8 mx-auto mb-2" /><h3 className="font-bold">No Videos Yet</h3></div>}
                    </div>
                )}
                {activeTab === 'shop' && (
                     <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {userProducts.length > 0 ? userProducts.map(product => (
                            <div key={product.id} onClick={() => setViewingItem({item: product, type: 'product'})} className="aspect-square bg-gray-100 dark:bg-gray-900 relative group cursor-pointer overflow-hidden rounded-md"><img src={product.image} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">{product.price}</div></div>
                        )) : <div className="col-span-3 py-20 text-center text-gray-400"><ShoppingBagIcon className="w-8 h-8 mx-auto mb-2" /><h3 className="font-bold">No Products Yet</h3></div>}
                    </div>
                )}
                {activeTab === 'tagged' && (
                     <div className="grid grid-cols-3 gap-1 md:gap-4">
                         {mockTagged.map(tag => (
                             <div key={tag.id} onClick={() => setViewingItem({item: tag, type: 'tagged'})} className="aspect-square bg-gray-100 dark:bg-gray-900 relative cursor-pointer group overflow-hidden rounded-md"><img src={tag.thumbnail} className="w-full h-full object-cover" /><div className="absolute top-2 right-2"><TagIcon className="w-4 h-4 text-white drop-shadow-md" /></div></div>
                         ))}
                     </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};
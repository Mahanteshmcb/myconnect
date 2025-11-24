import React, { useState, useRef } from 'react';
import { User, Post, Video, LongFormVideo, Product } from '../types';
import { GridIcon, TagIcon, PlayCircleIcon, SettingsIcon, CameraIcon, BackIcon, CloseIcon, CheckIcon, TwitterIcon, LinkedInIcon, GitHubIcon, SendIcon, LinkIcon, MapIcon, FilmIcon, ShoppingBagIcon, PencilIcon, HeartIcon, CommentIcon } from './Icons';
import { REELS_VIDEOS } from '../services/mockData';
import { getFollowersForUser, getFollowingForUser } from '../services/mockData';

interface UserProfileProps {
  user: User;
  currentUser: User;
  posts: Post[];
  longFormVideos: LongFormVideo[];
  marketItems: Product[];
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onStartChat: (user: User) => void;
  onOpenSettings: () => void;
  onWatchReel: (reel: Video) => void;
  onWatchVideo: (video: LongFormVideo) => void;
  onViewProduct: (product: Product) => void;
}

const UserListModal = ({ title, users, onClose }: { title: string, users: User[], onClose: () => void }) => (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {users.length > 0 ? users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer">
                        <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt={u.name} />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.handle}</p>
                        </div>
                    </div>
                )) : <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No users found.</div>}
            </div>
        </div>
    </div>
);

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  currentUser,
  posts,
  longFormVideos,
  marketItems,
  onBack,
  onUpdateUser,
  onStartChat,
  onOpenSettings,
  onWatchReel,
  onWatchVideo,
  onViewProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'videos' | 'shop' | 'tagged'>('posts');
  const [listModal, setListModal] = useState<{ open: boolean, title: string, users: User[] }>({ open: false, title: '', users: [] });
  const [isFollowing, setIsFollowing] = useState(currentUser.followingIds?.includes(user.id) || false);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusText, setStatusText] = useState(user.statusMessage || '');

  const isCurrentUser = user.id === currentUser.id;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const followers = getFollowersForUser(user.id);
  const following = getFollowingForUser(user.id);

  const userPosts = posts.filter(p => p.author.id === user.id);
  const userVideos = longFormVideos.filter(v => v.author.id === user.id);
  const userReels: Video[] = REELS_VIDEOS.filter(v => v.author.id === user.id);
  const userShopItems = marketItems.filter(p => p.sellerId === user.id);
  const mockTagged: Post[] = [posts[0], posts[2]].map(p => ({...p, image: `https://picsum.photos/id/${Math.floor(Math.random()*100)}/400/400`}));
  
  const contentMap = {
    posts: { data: userPosts, icon: <GridIcon className="w-4 h-4" /> },
    reels: { data: userReels, icon: <PlayCircleIcon className="w-4 h-4" /> },
    videos: { data: userVideos, icon: <FilmIcon className="w-4 h-4" /> },
    shop: { data: userShopItems, icon: <ShoppingBagIcon className="w-4 h-4" /> },
    tagged: { data: mockTagged, icon: <TagIcon className="w-4 h-4" /> },
  };

  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  onUpdateUser({ ...user, [field]: event.target.result as string });
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleStatusSave = () => {
    onUpdateUser({ ...user, statusMessage: statusText });
    setIsEditingStatus(false);
  };
  
  const renderContent = () => {
    const activeContent = contentMap[activeTab];
    if (!activeContent.data || activeContent.data.length === 0) {
      return <div className="text-center py-20 text-gray-500">No {activeTab} yet.</div>;
    }

    return (
      <div className="grid grid-cols-3 gap-1">
        {activeContent.data.map((item, index) => {
          const src = (activeTab === 'posts' || activeTab === 'tagged' || activeTab === 'shop')
            ? (item as any).image
            : (item as any).thumbnail;

          return (
            <div 
                key={`${activeTab}-${item.id}-${index}`} 
                className="aspect-square bg-gray-100 dark:bg-gray-800 relative group cursor-pointer"
                onClick={() => {
                    if (activeTab === 'reels' && (item as Video).url) {
                        onWatchReel(item as Video);
                    } else if (activeTab === 'videos' && (item as LongFormVideo).url) {
                        onWatchVideo(item as LongFormVideo);
                    } else if (activeTab === 'shop' && (item as Product).price) {
                        onViewProduct(item as Product);
                    } else if (activeTab === 'posts' || activeTab === 'tagged') {
                        alert(`Viewing post: "${(item as Post).content.substring(0, 30)}..." (Specific post view not implemented)`);
                    }
                }}
            >
              <img src={src} className="w-full h-full object-cover" alt="content item"/>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  {((item as Post).likes !== undefined) &&
                      <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-bold"><HeartIcon className="w-5 h-5" /> {(item as Post).likes}</span>
                          <span className="flex items-center gap-1 font-bold"><CommentIcon className="w-5 h-5" /> {(item as Post).comments}</span>
                      </div>
                  }
                   {(activeTab === 'reels') && (item as Video).likes !== undefined &&
                      <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-bold"><HeartIcon className="w-5 h-5" /> {(item as Video).likes}</span>
                          <span className="flex items-center gap-1 font-bold"><PlayCircleIcon className="w-5 h-5" /></span>
                      </div>
                  }
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-16">
        {listModal.open && <UserListModal title={listModal.title} users={listModal.users} onClose={() => setListModal({ ...listModal, open: false })} />}
        
        <div className="p-4 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><BackIcon className="w-6 h-6" /></button>
            <h1 className="font-bold text-lg">{user.name}</h1>
            <div className="w-10"></div>
        </div>

        <div className="relative">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
                {user.coverImage && <img src={user.coverImage} className="w-full h-full object-cover" alt="Cover"/>}
                {isCurrentUser && (
                    <>
                        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'coverImage')} />
                        <label htmlFor="cover-upload" onClick={() => coverInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full cursor-pointer hover:bg-black/70">
                            <CameraIcon className="w-5 h-5" />
                        </label>
                    </>
                )}
            </div>

            <div className="px-4 -mt-16">
                <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-black bg-gray-300">
                    <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="Avatar" />
                     {isCurrentUser && (
                        <>
                            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} />
                            <label htmlFor="avatar-upload" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-black/50 text-white p-2 rounded-full cursor-pointer hover:bg-black/70">
                                <CameraIcon className="w-5 h-5" />
                            </label>
                        </>
                    )}
                </div>
                
                <div className="flex justify-between items-start mt-2">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">{user.name} {user.verified && <CheckIcon className="w-5 h-5 text-blue-500" />}</h2>
                        <p className="text-gray-500">@{user.handle}</p>
                    </div>
                     <div className="flex gap-2">
                        {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"><TwitterIcon className="w-5 h-5" /></a>}
                        {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"><LinkedInIcon className="w-5 h-5" /></a>}
                        {user.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"><GitHubIcon className="w-5 h-5" /></a>}
                        {isCurrentUser ? (
                            <button onClick={onOpenSettings} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                        ) : (
                             <button onClick={() => onStartChat(user)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 text-sm leading-relaxed">{user.bio}</div>

                {isCurrentUser ? (
                    isEditingStatus ? (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <input
                                type="text"
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                className="flex-1 bg-transparent dark:bg-gray-800 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 ring-blue-500"
                                placeholder="Set a status..."
                                autoFocus
                            />
                            <button onClick={handleStatusSave} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Save</button>
                            <button onClick={() => setIsEditingStatus(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditingStatus(true)} className="mt-2 text-sm text-gray-500 italic flex items-center gap-2 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                             <span className="opacity-50 group-hover:opacity-100 transition"><PencilIcon className="w-4 h-4" /> </span>
                             <span>{user.statusMessage || 'Set a status...'}</span>
                        </div>
                    )
                ) : user.statusMessage && (
                     <div className="mt-2 text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                         "{user.statusMessage}"
                     </div>
                )}


                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {user.location && <span className="flex items-center gap-1"><MapIcon className="w-4 h-4" /> {user.location}</span>}
                    {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><LinkIcon className="w-4 h-4" /> {user.website.replace('https://','')}</a>}
                    <span className="flex items-center gap-1">Joined {user.joinedDate}</span>
                </div>

                <div className="mt-4 flex gap-4 text-sm">
                    <button onClick={() => setListModal({ open: true, title: 'Following', users: following })} className="hover:underline">
                        <span className="font-bold">{following.length}</span> <span className="text-gray-500">Following</span>
                    </button>
                    <button onClick={() => setListModal({ open: true, title: 'Followers', users: followers })} className="hover:underline">
                        <span className="font-bold">{followers.length}</span> <span className="text-gray-500">Followers</span>
                    </button>
                </div>
                
                {!isCurrentUser && (
                    <div className="mt-4">
                        <button onClick={handleFollowToggle} className={`w-full py-2 font-bold rounded-lg transition ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-blue-600 text-white'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mt-6 flex justify-around">
            {Object.entries(contentMap).map(([key, { icon }]) => (
                <button 
                    key={key} 
                    onClick={() => setActiveTab(key as any)}
                    className={`flex-1 py-3 flex justify-center items-center gap-2 border-b-2 transition ${activeTab === key ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-500'}`}
                >
                    {icon}
                    <span className="capitalize text-sm font-medium hidden sm:inline">{key}</span>
                </button>
            ))}
        </div>

        {/* Content */}
        <div>{renderContent()}</div>
    </div>
  );
};

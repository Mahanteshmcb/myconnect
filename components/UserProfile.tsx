
import React, { useState, useEffect } from 'react';
import { User, Post, Video } from '../types';
import { GridIcon, TagIcon, PlayCircleIcon, SettingsIcon, CameraIcon, BackIcon, CloseIcon, CheckIcon, TwitterIcon, LinkedInIcon, GitHubIcon, SendIcon, PlusIcon, HeartIcon, CommentIcon, BookmarkIcon, QrCodeIcon, ShareIcon, LinkIcon } from './Icons';
import { MOCK_USERS, getFollowersForUser, getFollowingForUser } from '../services/mockData';

interface UserProfileProps {
  user: User; // The user profile being viewed
  currentUser: User; // The currently logged in user
  posts: Post[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
  onStartChat?: (user: User) => void; // New Prop
}

// --- User List Modal (Followers/Following) ---
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

// --- Profile QR Code Modal ---
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

// --- Content Detail Modal (Lightbox) ---
const ContentDetailModal = ({ 
    item, 
    onClose,
    type
}: { 
    item: any, 
    onClose: () => void,
    type: 'post' | 'reel' | 'tagged'
}) => {
    const imgSrc = item.image || item.thumbnail || 'https://via.placeholder.com/600';

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in" onClick={onClose}>
             <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 p-2 bg-black/50 rounded-full">
                 <CloseIcon className="w-6 h-6" />
             </button>

             <div className="flex w-full max-w-6xl h-full md:h-[85vh] bg-black md:bg-white md:dark:bg-gray-900 overflow-hidden md:rounded-xl shadow-2xl flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                 {/* Media Side */}
                 <div className="flex-1 bg-black flex items-center justify-center relative">
                     <img src={imgSrc} className="max-w-full max-h-full object-contain" />
                     {type === 'reel' && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <PlayCircleIcon className="w-20 h-20 text-white/80" />
                         </div>
                     )}
                 </div>

                 {/* Details Side */}
                 <div className="hidden md:flex w-[400px] flex-col border-l border-gray-100 dark:border-gray-800">
                     {/* Header */}
                     <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                         <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                         <span className="font-bold text-gray-900 dark:text-white text-sm">Author Name</span>
                     </div>
                     
                     {/* Comments Area */}
                     <div className="flex-1 p-4 overflow-y-auto">
                         <div className="space-y-4">
                             <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-bold">Author Name</span> This is the caption for the content shown on the left.</p>
                             <div className="text-center text-gray-400 text-sm py-10">No comments yet.</div>
                         </div>
                     </div>

                     {/* Action Bar */}
                     <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                         <div className="flex justify-between mb-2">
                             <div className="flex gap-4">
                                 <HeartIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                 <CommentIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                 <SendIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                             </div>
                             <BookmarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                         </div>
                         <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">1,234 likes</div>
                         <div className="text-xs text-gray-500 uppercase">2 HOURS AGO</div>
                         
                         {/* Input */}
                         <div className="flex items-center mt-4 gap-2">
                             <div className="text-xl">😊</div>
                             <input type="text" placeholder="Add a comment..." className="flex-1 bg-transparent text-sm outline-none dark:text-white" />
                             <button className="text-blue-500 font-bold text-sm">Post</button>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- Advanced Settings Modal ---
const SettingsModal = ({ 
    isOpen, 
    onClose, 
    currentUser, 
    onSave 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    currentUser: User; 
    onSave: (user: User) => void; 
}) => {
    const [formData, setFormData] = useState<User>(currentUser);
    const [activeTab, setActiveTab] = useState<'channel' | 'chat'>('channel');

    useEffect(() => {
        setFormData(currentUser);
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleChange = (key: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                         <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                             <CloseIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                         </button>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Settings</h2>
                    </div>
                    <button 
                        onClick={handleSave} 
                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold text-sm hover:opacity-80 transition"
                    >
                        Save
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 px-4">
                    <TabButton id="channel" label="Channel Settings" />
                    <TabButton id="chat" label="Chat Appearance" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'channel' && (
                        <div className="space-y-4 animate-fade-in">
                             <p className="text-sm text-gray-500 mb-4">Settings for your long-form video Creator Channel.</p>
                             <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                                 <div>
                                     <h3 className="font-bold text-gray-900 dark:text-white">Subscribers Visible</h3>
                                     <p className="text-xs text-gray-500">Show subscriber count on channel</p>
                                 </div>
                                 <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                                 </div>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Channel Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email || ''} 
                                    onChange={e => handleChange('email', e.target.value)}
                                    placeholder="contact@email.com"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-sm text-gray-500 mb-4">Your appearance in the Chat / Messaging section.</p>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status Message</label>
                                <input 
                                    type="text" 
                                    value={formData.statusMessage || ''} 
                                    onChange={e => handleChange('statusMessage', e.target.value)}
                                    placeholder="Available, At work, etc."
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number (Visual Only)</label>
                                <input 
                                    type="text" 
                                    value={formData.phoneNumber || ''} 
                                    onChange={e => handleChange('phoneNumber', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Story Highlights Component ---
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

export const UserProfile: React.FC<UserProfileProps> = ({ user, currentUser, posts, onBack, onUpdateUser, onStartChat }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Inline Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User>(user);

  // List Modal State
  const [listModalType, setListModalType] = useState<'followers' | 'following' | null>(null);

  // Content Viewer State
  const [viewingItem, setViewingItem] = useState<{item: any, type: 'post' | 'reel' | 'tagged'} | null>(null);

  useEffect(() => {
      if (!isEditing) setEditData(user);
  }, [user, isEditing]);
  
  // Filter content for this user
  const userPosts = posts.filter(p => p.author.id === user.id);
  const isOwnProfile = user.id === currentUser.id;
  
  const mockReels = Array.from({ length: 9 }).map((_, i) => ({
      id: `r${i}`,
      thumbnail: `https://picsum.photos/id/${200 + i}/400/600`,
      views: `${(Math.random() * 50).toFixed(1)}K`
  }));

  const mockTagged = Array.from({ length: 4 }).map((_, i) => ({
      id: `t${i}`,
      thumbnail: `https://picsum.photos/id/${300 + i}/400/400`,
  }));

  // Resolve Follow Lists
  const getFollowList = (type: 'followers' | 'following'): User[] => {
      if (type === 'following') {
          return getFollowingForUser(user.id);
      } else {
           return getFollowersForUser(user.id);
      }
  };

  const handleSaveProfile = () => {
      if (onUpdateUser) onUpdateUser(editData);
      setIsEditing(false);
  };

  const handleCancelEdit = () => {
      setEditData(user);
      setIsEditing(false);
  };

  const handleChange = (key: keyof User, value: any) => {
      setEditData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpdate = (type: 'avatar' | 'cover') => {
      const url = window.prompt(`Enter new ${type} image URL:`, type === 'avatar' ? editData.avatar : editData.coverImage);
      if (url) {
          handleChange(type === 'avatar' ? 'avatar' : 'coverImage', url);
      }
  };

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={user}
        onSave={(updatedUser) => {
            if (onUpdateUser) onUpdateUser(updatedUser);
        }}
      />
      
      {listModalType && (
          <UserListModal 
              title={listModalType === 'followers' ? 'Followers' : 'Following'}
              users={getFollowList(listModalType)}
              onClose={() => setListModalType(null)}
          />
      )}

      {showQR && (
          <ProfileQRModal 
              user={user}
              onClose={() => setShowQR(false)}
          />
      )}

      {viewingItem && (
          <ContentDetailModal 
            item={viewingItem.item}
            type={viewingItem.type}
            onClose={() => setViewingItem(null)}
          />
      )}

      {/* Header */}
      <div className="relative">
         {/* Cover Image */}
         <div className="h-40 md:h-60 w-full bg-gray-300 dark:bg-gray-800 overflow-hidden group relative">
            <img src={isEditing ? editData.coverImage : user.coverImage} alt="Cover" className={`w-full h-full object-cover transition ${isEditing ? 'opacity-70 blur-[2px]' : ''}`} />
            
            {/* Back Button (Mobile) */}
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 md:hidden z-10">
                <BackIcon className="w-6 h-6" />
            </button>

            {/* Edit Cover Overlay */}
            {isEditing && (
                <button 
                    onClick={() => handleImageUpdate('cover')}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group"
                >
                    <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm">
                        <CameraIcon className="w-8 h-8" />
                    </div>
                </button>
            )}
         </div>
         
         <div className="max-w-4xl mx-auto px-4 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-4 md:left-0">
                <div className="relative group w-32 h-32">
                    <img 
                        src={isEditing ? editData.avatar : user.avatar} 
                        alt={user.name} 
                        className={`w-full h-full rounded-full border-4 border-white dark:border-black object-cover bg-white dark:bg-gray-800 ${isEditing ? 'opacity-80' : ''}`} 
                    />
                    {isEditing && (
                        <button 
                            onClick={() => handleImageUpdate('avatar')}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full text-white hover:bg-black/50 transition"
                        >
                            <CameraIcon className="w-8 h-8" />
                        </button>
                    )}
                </div>
            </div>
            
            {/* Profile Actions / Header */}
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    {isEditing ? (
                        <div className="space-y-2 max-w-md">
                            <input 
                                type="text"
                                value={editData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full text-2xl font-bold bg-gray-50 dark:bg-gray-900 border-b-2 border-blue-500 outline-none text-gray-900 dark:text-white px-2 py-1 rounded"
                                placeholder="Display Name"
                            />
                            <div className="flex items-center text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 rounded px-2 py-1">
                                <input 
                                    type="text"
                                    value={editData.handle}
                                    onChange={(e) => handleChange('handle', e.target.value)}
                                    className="bg-transparent outline-none flex-1 border-b border-dashed border-gray-400"
                                    placeholder="@handle"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {user.name}
                                {user.verified && <span className="text-blue-500 text-lg">✔</span>}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{user.handle}</p>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                   {isOwnProfile ? (
                       <>
                           {isEditing ? (
                               <>
                                   <button 
                                        onClick={handleCancelEdit}
                                        className="flex-1 md:flex-none px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                   >
                                       Cancel
                                   </button>
                                   <button 
                                        onClick={handleSaveProfile}
                                        className="flex-1 md:flex-none px-6 py-2 bg-blue-600 rounded-lg font-semibold text-white hover:bg-blue-700 transition shadow-lg"
                                   >
                                       Save Changes
                                   </button>
                               </>
                           ) : (
                               <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 md:flex-none px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                               >
                                   Edit Profile
                               </button>
                           )}
                           <button 
                                onClick={() => setShowQR(true)}
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Share Profile"
                           >
                               <QrCodeIcon className="w-6 h-6" />
                           </button>
                           <button 
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                           >
                               <SettingsIcon className="w-6 h-6" />
                           </button>
                       </>
                   ) : (
                       <>
                           <button 
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-semibold transition ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                           >
                               {isFollowing ? 'Following' : 'Follow'}
                           </button>
                           <button 
                                onClick={() => onStartChat && onStartChat(user)}
                                className="flex-1 md:flex-none px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                           >
                               Message
                           </button>
                           <button onClick={() => setShowQR(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                               <QrCodeIcon className="w-6 h-6" />
                           </button>
                       </>
                   )}
                </div>
            </div>
            
            {/* Bio & Details */}
            <div className="mt-6 max-w-2xl space-y-4">
                {isEditing ? (
                    <div className="space-y-4 animate-fade-in bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
                            <textarea 
                                value={editData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                                rows={3}
                                placeholder="Tell the world about yourself..."
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                <input 
                                    type="text"
                                    value={editData.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                                <input 
                                    type="text"
                                    value={editData.website || ''}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                             <label className="text-xs font-bold text-gray-500 uppercase">Social Links</label>
                             <div className="flex items-center gap-2">
                                 <TwitterIcon className="w-5 h-5 text-gray-500" />
                                 <input 
                                    type="text"
                                    value={editData.twitter || ''}
                                    onChange={(e) => handleChange('twitter', e.target.value)}
                                    className="flex-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder="Twitter URL"
                                 />
                             </div>
                             <div className="flex items-center gap-2">
                                 <LinkedInIcon className="w-5 h-5 text-gray-500" />
                                 <input 
                                    type="text"
                                    value={editData.linkedin || ''}
                                    onChange={(e) => handleChange('linkedin', e.target.value)}
                                    className="flex-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder="LinkedIn URL"
                                 />
                             </div>
                             <div className="flex items-center gap-2">
                                 <GitHubIcon className="w-5 h-5 text-gray-500" />
                                 <input 
                                    type="text"
                                    value={editData.github || ''}
                                    onChange={(e) => handleChange('github', e.target.value)}
                                    className="flex-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder="GitHub URL"
                                 />
                             </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                            {user.location && (
                                <span className="flex items-center gap-1">
                                    📍 {user.location}
                                </span>
                            )}
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                                    🔗 {user.website.replace('https://', '')}
                                </a>
                            )}
                            {user.joinedDate && (
                                <span className="flex items-center gap-1">
                                    📅 Joined {user.joinedDate}
                                </span>
                            )}
                        </div>
                        
                        {/* Social Links Display */}
                        {(user.twitter || user.linkedin || user.github) && (
                            <div className="flex items-center gap-3 mt-3 pt-2">
                                {user.twitter && (
                                    <a href={user.twitter} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400 transition" title="Twitter">
                                        <TwitterIcon className="w-5 h-5" />
                                    </a>
                                )}
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-700 transition" title="LinkedIn">
                                        <LinkedInIcon className="w-5 h-5" />
                                    </a>
                                )}
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition" title="GitHub">
                                        <GitHubIcon className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        )}
                        
                        <StoryHighlights />
                    </>
                )}
            </div>
            
            {/* Stats - Now Clickable */}
            <div className="flex gap-8 mt-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-1 cursor-default hover:opacity-70 transition active:scale-95">
                    <span className="font-bold text-gray-900 dark:text-white">{userPosts.length}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span>
                </div>
                <div 
                    onClick={() => setListModalType('followers')}
                    className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition active:scale-95"
                    title="View Followers"
                >
                    <span className="font-bold text-gray-900 dark:text-white">{user.subscribers || '0'}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
                </div>
                <div 
                    onClick={() => setListModalType('following')}
                    className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition active:scale-95"
                    title="View Following"
                >
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
                            <div key={post.id} onClick={() => setViewingItem({item: post, type: 'post'})} className="aspect-square bg-gray-100 dark:bg-gray-900 relative group cursor-pointer overflow-hidden">
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
                             <div key={reel.id} onClick={() => setViewingItem({item: reel, type: 'reel'})} className="aspect-[9/16] bg-gray-900 relative cursor-pointer group overflow-hidden">
                                 <img src={reel.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                 <div className="absolute bottom-2 left-2 text-white text-xs font-bold flex items-center gap-1 drop-shadow-md">
                                     <PlayCircleIcon className="w-3 h-3" /> {reel.views}
                                 </div>
                             </div>
                         ))}
                     </div>
                )}

                {activeTab === 'tagged' && (
                     <div className="grid grid-cols-3 gap-1 md:gap-4">
                         {mockTagged.map(tag => (
                             <div key={tag.id} onClick={() => setViewingItem({item: tag, type: 'tagged'})} className="aspect-square bg-gray-100 dark:bg-gray-900 relative cursor-pointer group overflow-hidden">
                                 <img src={tag.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                 <div className="absolute top-2 right-2">
                                     <TagIcon className="w-4 h-4 text-white drop-shadow-md" />
                                 </div>
                             </div>
                         ))}
                     </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

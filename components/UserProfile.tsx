
import React, { useState, useEffect } from 'react';
import { User, Post, Video } from '../types';
import { GridIcon, TagIcon, PlayCircleIcon, SettingsIcon, CameraIcon, BackIcon, CloseIcon, CheckIcon, TwitterIcon, LinkedInIcon, GitHubIcon, SendIcon, PlusIcon } from './Icons';

interface UserProfileProps {
  user: User; // The user profile being viewed
  currentUser: User; // The currently logged in user
  posts: Post[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

// --- Edit Profile Modal ---
const EditProfileModal = ({ 
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
    const [activeTab, setActiveTab] = useState<'general' | 'social' | 'channel' | 'chat'>('general');

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
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                         <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                             <CloseIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                         </button>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
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
                    <TabButton id="general" label="General" />
                    <TabButton id="social" label="Social" />
                    <TabButton id="channel" label="Channel" />
                    <TabButton id="chat" label="Chat Info" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Images */}
                            <div className="relative h-32 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden group">
                                <img src={formData.coverImage} className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                                        <CameraIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="absolute -bottom-2 left-4">
                                     <div className="relative w-24 h-24">
                                         <img src={formData.avatar} className="w-full h-full rounded-full border-4 border-white dark:border-gray-900 object-cover" />
                                         <button className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition text-white">
                                             <CameraIcon className="w-6 h-6" />
                                         </button>
                                     </div>
                                </div>
                            </div>
                            <div className="h-6"></div> {/* Spacer for avatar overlap */}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Handle (@username)</label>
                                    <input 
                                        type="text" 
                                        value={formData.handle} 
                                        onChange={e => handleChange('handle', e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                    <textarea 
                                        value={formData.bio} 
                                        onChange={e => handleChange('bio', e.target.value)}
                                        rows={3}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-sm text-gray-500 mb-4">These details appear on your main social feed profile.</p>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <input 
                                    type="text" 
                                    value={formData.location || ''} 
                                    onChange={e => handleChange('location', e.target.value)}
                                    placeholder="City, Country"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Website</label>
                                <input 
                                    type="text" 
                                    value={formData.website || ''} 
                                    onChange={e => handleChange('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email (Public)</label>
                                <input 
                                    type="email" 
                                    value={formData.email || ''} 
                                    onChange={e => handleChange('email', e.target.value)}
                                    placeholder="contact@email.com"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Social Links</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <TwitterIcon className="w-6 h-6 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={formData.twitter || ''} 
                                            onChange={e => handleChange('twitter', e.target.value)}
                                            placeholder="https://twitter.com/username"
                                            className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <LinkedInIcon className="w-6 h-6 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={formData.linkedin || ''} 
                                            onChange={e => handleChange('linkedin', e.target.value)}
                                            placeholder="https://linkedin.com/in/username"
                                            className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <GitHubIcon className="w-6 h-6 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={formData.github || ''} 
                                            onChange={e => handleChange('github', e.target.value)}
                                            placeholder="https://github.com/username"
                                            className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Channel Description</label>
                                <textarea 
                                    value={formData.bio} 
                                    onChange={e => handleChange('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Describe your channel content..."
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">This uses your main bio by default but can be customized for video audiences.</p>
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
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <CheckIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Active Status</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">You are currently shown as Online</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const UserProfile: React.FC<UserProfileProps> = ({ user, currentUser, posts, onBack, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Filter content for this user
  const userPosts = posts.filter(p => p.author.id === user.id);
  const isOwnProfile = user.id === currentUser.id;
  
  // Mock reels/tagged data as we only have global data in props usually
  const mockReels = Array.from({ length: 6 }).map((_, i) => ({
      id: `r${i}`,
      thumbnail: `https://picsum.photos/id/${40 + i}/400/600`,
      views: '12K'
  }));

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
        onSave={(updatedUser) => {
            if (onUpdateUser) onUpdateUser(updatedUser);
        }}
      />

      {/* Header */}
      <div className="relative">
         <div className="h-40 md:h-60 w-full bg-gray-300 dark:bg-gray-800 overflow-hidden group">
            {user.coverImage && <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />}
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 md:hidden z-10">
                <BackIcon className="w-6 h-6" />
            </button>
         </div>
         
         <div className="max-w-4xl mx-auto px-4 relative">
            <div className="absolute -top-16 left-4 md:left-0">
                <div className="relative group">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-white dark:bg-gray-800" />
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
                   {isOwnProfile ? (
                       <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                       >
                           Edit Profile
                       </button>
                   ) : (
                       <>
                           <button 
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={`px-6 py-2 rounded-lg font-semibold transition ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                           >
                               {isFollowing ? 'Following' : 'Follow'}
                           </button>
                           <button className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                               Message
                           </button>
                       </>
                   )}
                   <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                       <SettingsIcon className="w-6 h-6" />
                   </button>
                </div>
            </div>
            
            {/* Bio & Details */}
            <div className="mt-4 max-w-2xl space-y-2">
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


import React, { useState, useRef, useEffect } from 'react';
import { LongFormVideo, User, Video, Comment } from '../types';
import { SearchIcon, MenuIcon, BellIcon, BellRingIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, StreamHubLogo, MicrophoneIcon, CreateVideoIcon, SettingsIcon, UploadIcon, HomeIcon, HistoryIcon, LibraryIcon, CheckIcon, CloseIcon, QualityIcon, CCIcon, PlayCircleIcon, SignalIcon, AnalyticsIcon, EyeIcon, GlobeIcon, LockClosedIcon, DashboardIcon, DownloadIcon, ClockIcon, ReplyIcon, PlaylistIcon, MicActiveIcon, ToggleLeftIcon, CheckCircleIcon, MoreVerticalIcon, ListPlusIcon } from './Icons';
import { VideoReels, CreateReel } from './VideoReels';
import { REELS_VIDEOS, MOCK_USERS } from '../services/mockData';

interface LongFormVideoProps {
  videos: LongFormVideo[];
  currentUser: User;
  onUpdateVideo: (video: LongFormVideo) => void;
  onViewProfile: (user?: User) => void;
}

// --- Share Video Modal ---
const VideoShareModal = ({ isOpen, onClose, video }: { isOpen: boolean, onClose: () => void, video: LongFormVideo | null }) => {
    if (!isOpen || !video) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(video.url);
        alert("Link copied to clipboard!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1f1f1f] w-full max-w-sm rounded-2xl shadow-xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share</h3>
                     <button onClick={onClose}><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-2">
                     {['WhatsApp', 'Twitter', 'Facebook', 'Email', 'Reddit'].map(platform => (
                         <div key={platform} className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer hover:opacity-80">
                             <div className="w-12 h-12 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center text-xl shadow-sm">
                                 🔗
                             </div>
                             <span className="text-xs text-gray-500 dark:text-gray-400">{platform}</span>
                         </div>
                     ))}
                </div>
                
                <div className="bg-gray-50 dark:bg-[#121212] p-3 rounded-xl flex items-center gap-3 border border-gray-100 dark:border-[#333]">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">https://streamhub.app/v/{video.id}</p>
                    </div>
                    <button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Live Studio Component ---
const LiveStudio = ({ onClose, currentUser }: { onClose: () => void, currentUser: User }) => {
    const [isLive, setIsLive] = useState(false);
    const [title, setTitle] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#181818] text-white">
            <div className="flex justify-between items-center p-4 border-b border-[#303030]">
                <div className="flex items-center gap-2">
                    <SignalIcon className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-bold">StreamHub Live Studio</h2>
                </div>
                <button onClick={onClose}><CloseIcon className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Main Preview Area */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                    <div className="bg-black aspect-video rounded-xl overflow-hidden relative border border-[#303030] flex items-center justify-center">
                        <video 
                            ref={videoRef} 
                            className="w-full h-full object-cover opacity-50" 
                            src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                        {!isLive && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <p className="text-gray-400">Camera Preview (Simulated)</p>
                             </div>
                        )}
                        <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-white ${isLive ? 'animate-pulse' : ''}`}></div>
                            {isLive ? 'LIVE' : 'OFFLINE'}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#202020] p-4 rounded-xl border border-[#303030]">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Stream Health</h3>
                            <div className="text-green-500 font-bold">Excellent</div>
                        </div>
                        <div className="bg-[#202020] p-4 rounded-xl border border-[#303030]">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Viewers</h3>
                            <div className="text-white font-bold text-xl">{isLive ? '1,240' : '0'}</div>
                        </div>
                        <div className="bg-[#202020] p-4 rounded-xl border border-[#303030]">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Time</h3>
                            <div className="text-white font-bold text-xl">{isLive ? '00:12:45' : '00:00:00'}</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-80 bg-[#202020] border-l border-[#303030] p-4 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Stream Title</label>
                        <input 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-[#121212] border border-[#303030] rounded p-2 text-white outline-none focus:border-red-600"
                            placeholder="My Awesome Stream"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Category</label>
                        <select className="w-full bg-[#121212] border border-[#303030] rounded p-2 text-white outline-none">
                            <option>Gaming</option>
                            <option>Just Chatting</option>
                            <option>Music</option>
                            <option>Tech</option>
                        </select>
                    </div>

                    <div className="flex-1 bg-[#121212] rounded border border-[#303030] p-2 overflow-y-auto">
                        <div className="text-gray-500 text-xs text-center mt-4">Stream Chat will appear here</div>
                        {isLive && (
                            <div className="mt-4 space-y-2">
                                <div className="text-sm"><span className="font-bold text-blue-400">User123:</span> Hello!</div>
                                <div className="text-sm"><span className="font-bold text-green-400">Mod:</span> Welcome to the stream.</div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setIsLive(!isLive)}
                        className={`w-full py-3 rounded font-bold text-white transition ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLive ? 'End Stream' : 'Go Live'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Channel Analytics Component ---
const ChannelAnalytics = ({ currentUser }: { currentUser: User }) => {
    return (
        <div className="p-8 max-w-6xl mx-auto pb-20">
            <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-3">
                <AnalyticsIcon className="w-8 h-8 text-blue-500" /> Channel Analytics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Views', value: '1.2M', change: '+12%', color: 'text-green-500' },
                    { label: 'Watch Time (hours)', value: '45.2K', change: '+8%', color: 'text-green-500' },
                    { label: 'Subscribers', value: currentUser.subscribers || '1.2K', change: '+150', color: 'text-blue-500' },
                    { label: 'Estimated Revenue', value: '$3,402.50', change: '+5%', color: 'text-green-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <div className="text-2xl font-bold dark:text-white mt-1">{stat.value}</div>
                        <div className={`${stat.color} text-xs font-bold mt-2`}>{stat.change} this month</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 <div className="lg:col-span-2 bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#333]">
                     <h3 className="font-bold dark:text-white mb-4">Realtime Activity</h3>
                     <div className="h-64 flex items-end justify-between gap-1">
                         {Array.from({length: 48}).map((_, i) => (
                             <div key={i} className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.random() * 100}%`, opacity: 0.5 + Math.random() * 0.5 }}></div>
                         ))}
                     </div>
                     <p className="text-xs text-gray-500 mt-2 text-right">Last 48 hours</p>
                 </div>
                 
                 <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#333]">
                     <h3 className="font-bold dark:text-white mb-4">Top Content</h3>
                     <div className="space-y-4">
                         {[1,2,3,4,5].map(i => (
                             <div key={i} className="flex items-center gap-3">
                                 <div className="w-16 h-9 bg-gray-200 dark:bg-[#333] rounded overflow-hidden">
                                     <img src={`https://picsum.photos/id/${10 + i}/100/100`} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-sm font-bold dark:text-white truncate">How to build a startup in 2025</div>
                                     <div className="text-xs text-gray-500">12K views • 98% likes</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#333]">
                <h3 className="font-bold dark:text-white mb-4">Audience Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Age</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm dark:text-gray-300"><span>18-24</span> <span>45%</span></div>
                             <div className="w-full h-2 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%]"></div></div>
                             <div className="flex justify-between text-sm dark:text-gray-300"><span>25-34</span> <span>30%</span></div>
                             <div className="w-full h-2 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[30%]"></div></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Gender</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm dark:text-gray-300"><span>Male</span> <span>60%</span></div>
                             <div className="w-full h-2 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[60%]"></div></div>
                             <div className="flex justify-between text-sm dark:text-gray-300"><span>Female</span> <span>35%</span></div>
                             <div className="w-full h-2 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden"><div className="h-full bg-pink-500 w-[35%]"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Upload Video Modal ---
const UploadVideoModal = ({ isOpen, onClose, currentUser, onUpload }: { isOpen: boolean, onClose: () => void, currentUser: User, onUpload: (video: LongFormVideo) => void }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'video' | 'short'>('video');
    const [category, setCategory] = useState('Technology');
    const [privacy, setPrivacy] = useState<'public' | 'private' | 'unlisted'>('public');
    const [tags, setTags] = useState<string>('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            setThumbnailPreview('https://picsum.photos/640/360'); 
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            setThumbnailPreview('https://picsum.photos/640/360'); 
        }
    };

    const handleUpload = () => {
        if (!title || !videoPreview) return;
        
        const newVideo: LongFormVideo = {
            id: `v_${Date.now()}`,
            title,
            description: desc,
            url: videoPreview,
            thumbnail: thumbnailPreview || 'https://picsum.photos/640/360',
            duration: '00:00', // Real implementation would calculate duration
            views: '0',
            uploadedAt: 'Just now',
            author: currentUser,
            category,
            likes: '0',
            likeCount: 0,
            dislikeCount: 0,
            type,
            privacy,
            tags: tags.split(',').map(t => t.trim())
        };
        
        onUpload(newVideo);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#282828] w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#3f3f3f]">
                    <h2 className="text-xl font-bold dark:text-white">Upload to StreamHub</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                    {/* Left: Metadata */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Details</label>
                            <input 
                                className="w-full p-4 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500"
                                placeholder="Title (required)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <textarea 
                                className="w-full p-4 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500 h-32 resize-none"
                                placeholder="Description"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select 
                                    className="w-full p-3 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {['Technology', 'Nature', 'Gaming', 'Music', 'Education', 'Lifestyle'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Privacy</label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none appearance-none"
                                        value={privacy}
                                        onChange={e => setPrivacy(e.target.value as any)}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="unlisted">Unlisted</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                        {privacy === 'public' && <GlobeIcon className="w-5 h-5" />}
                                        {privacy === 'private' && <LockClosedIcon className="w-5 h-5" />}
                                        {privacy === 'unlisted' && <EyeIcon className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                            <input 
                                className="w-full p-3 border border-gray-300 dark:border-[#3f3f3f] rounded-lg bg-transparent dark:text-white outline-none focus:border-blue-500"
                                placeholder="e.g. tech, review, gaming"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                            <div className="flex bg-gray-100 dark:bg-[#1f1f1f] rounded-lg p-1">
                                <button onClick={() => setType('video')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${type === 'video' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>Long Video</button>
                                <button onClick={() => setType('short')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${type === 'short' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>Reel</button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Drag Drop */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div 
                            className={`w-full aspect-video bg-gray-100 dark:bg-[#1f1f1f] rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition relative overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-[#3f3f3f] hover:border-blue-500'}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                            {videoPreview ? (
                                <video src={videoPreview} className="w-full h-full object-cover" controls />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-[#2f2f2f] rounded-full flex items-center justify-center mb-2">
                                        <UploadIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <span className="text-sm text-gray-500">Drag & drop or select video</span>
                                </>
                            )}
                        </div>

                        <div 
                            className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252525] transition"
                            onClick={() => thumbInputRef.current?.click()}
                        >
                            <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                if(e.target.files?.[0]) setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                            }} />
                            <span className="text-xs font-bold text-gray-500 uppercase">Thumbnail</span>
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} className="w-full h-20 object-cover rounded mt-2" />
                            ) : (
                                <div className="w-full h-20 bg-gray-200 dark:bg-[#333] rounded mt-2 flex items-center justify-center text-gray-400 text-xs">Upload Image</div>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase">Video Link</span>
                            <div className="text-blue-500 text-sm truncate mt-1">https://streamhub.app/v/{Date.now()}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-[#3f3f3f] flex justify-end gap-3 bg-gray-50 dark:bg-[#1f1f1f]">
                    <button onClick={onClose} className="px-6 py-2 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-lg transition">Cancel</button>
                    <button 
                        onClick={handleUpload}
                        disabled={!title || !videoPreview}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Channel Page ---
const ChannelPage = ({ 
    user, 
    videos,
    onBack,
    onVideoClick,
    currentUser
}: { 
    user: User, 
    videos: LongFormVideo[], 
    onBack: () => void,
    onVideoClick: (v: LongFormVideo) => void,
    currentUser: User
}) => {
    const [activeTab, setActiveTab] = useState<'Home' | 'Videos' | 'Reels'>('Home');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [notificationLevel, setNotificationLevel] = useState<'all' | 'personalized' | 'none'>('personalized');
    const [showSubMenu, setShowSubMenu] = useState(false);

    const channelVideos = videos.filter(v => v.author.id === user.id);
    const shorts = channelVideos.filter(v => v.type === 'short');
    const longVideos = channelVideos.filter(v => v.type !== 'short');

    return (
        <div className="flex-1 bg-white dark:bg-[#0f0f0f] overflow-y-auto">
            {/* Banner */}
            <div className="h-40 md:h-60 w-full bg-gray-800 relative group overflow-hidden">
                {user.coverImage ? (
                    <img src={user.coverImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900">
                        <span className="text-white font-bold text-2xl drop-shadow-md">{user.name}'s Channel</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
            </div>

            {/* Header Info */}
            <div className="max-w-6xl mx-auto px-6 pt-0 pb-6 border-b border-gray-200 dark:border-[#3f3f3f]">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f0f0f] -mt-16 z-10" alt={user.name} />
                    <div className="flex-1 mt-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name} {user.verified && <CheckIcon className="inline w-6 h-6 text-gray-500" />}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-medium">@{user.handle} • {user.subscribers || '1K'} subscribers • {channelVideos.length} videos</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl line-clamp-2 mb-4">{user.bio || "Welcome to my official channel! I post videos about technology and lifestyle."}</p>
                        
                        <div className="flex items-center gap-2 relative">
                            <div className="flex rounded-full overflow-hidden">
                                <button 
                                    onClick={() => setIsSubscribed(!isSubscribed)}
                                    className={`px-6 py-2.5 font-bold text-sm transition ${isSubscribed ? 'bg-gray-200 dark:bg-[#272727] text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'}`}
                                >
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                                {isSubscribed && (
                                    <button 
                                        onClick={() => setShowSubMenu(!showSubMenu)}
                                        className="bg-gray-200 dark:bg-[#272727] px-3 border-l border-gray-300 dark:border-[#444] text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-[#333]"
                                    >
                                        {notificationLevel === 'all' && <BellRingIcon className="w-5 h-5" />}
                                        {notificationLevel === 'personalized' && <BellIcon className="w-5 h-5" />}
                                        {notificationLevel === 'none' && <BellIcon className="w-5 h-5 opacity-50" />}
                                    </button>
                                )}
                            </div>
                            
                            {showSubMenu && isSubscribed && (
                                <div className="absolute top-12 left-20 bg-white dark:bg-[#282828] shadow-xl rounded-xl border border-gray-200 dark:border-[#444] z-20 py-1 w-48">
                                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Notifications</div>
                                    <button onClick={() => { setNotificationLevel('all'); setShowSubMenu(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] text-sm dark:text-white flex items-center gap-2">
                                        <BellRingIcon className="w-4 h-4" /> All
                                    </button>
                                    <button onClick={() => { setNotificationLevel('personalized'); setShowSubMenu(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] text-sm dark:text-white flex items-center gap-2">
                                        <BellIcon className="w-4 h-4" /> Personalized
                                    </button>
                                    <button onClick={() => { setNotificationLevel('none'); setShowSubMenu(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] text-sm dark:text-white flex items-center gap-2">
                                        <BellIcon className="w-4 h-4 opacity-50" /> None
                                    </button>
                                    <div className="border-t dark:border-[#444] mt-1 pt-1">
                                        <button onClick={() => { setIsSubscribed(false); setShowSubMenu(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-red-500 font-bold">
                                            Unsubscribe
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-8 border-b border-transparent">
                    {['Home', 'Videos', 'Reels', 'Playlists', 'Community'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 font-bold text-sm uppercase border-b-2 transition ${activeTab === tab ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
                {activeTab === 'Home' && (
                    <div className="space-y-10">
                         {shorts.length > 0 && (
                             <div>
                                 <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><StreamHubLogo className="w-6 h-6 text-red-600" /> Reels</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {shorts.slice(0, 5).map(v => (
                                         <div key={v.id} onClick={() => onVideoClick(v)} className="cursor-pointer group">
                                             <div className="aspect-[9/16] rounded-xl overflow-hidden mb-2">
                                                 <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                             </div>
                                             <h4 className="font-bold text-sm dark:text-white line-clamp-2">{v.title}</h4>
                                             <p className="text-xs text-gray-500">{v.views} views</p>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         <div>
                             <h3 className="text-xl font-bold dark:text-white mb-4">Recent Videos</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                 {longVideos.map(v => (
                                     <div key={v.id} onClick={() => onVideoClick(v)} className="cursor-pointer group">
                                         <div className="aspect-video rounded-xl overflow-hidden mb-2 relative">
                                             <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                             <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{v.duration}</span>
                                         </div>
                                         <h4 className="font-bold text-sm dark:text-white line-clamp-2">{v.title}</h4>
                                         <p className="text-xs text-gray-500">{v.views} views • {v.uploadedAt}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active?: boolean, onClick?: () => void, collapsed: boolean }) => (
  <div onClick={onClick} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-5 px-3'} py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-gray-100 dark:bg-[#272727] font-medium' : 'hover:bg-gray-100 dark:hover:bg-[#272727]'} text-gray-900 dark:text-white group relative`}>
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    {!collapsed && <span className="text-sm truncate">{label}</span>}
    {collapsed && (
        <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
        </div>
    )}
  </div>
);

// --- Enhanced Video Player with Settings ---
const EnhancedVideoPlayer = ({ video, autoPlay }: { video: LongFormVideo, autoPlay: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [quality, setQuality] = useState('Auto');
    const [captions, setCaptions] = useState(false);

    return (
        <div className="relative w-full aspect-video bg-black group rounded-xl overflow-hidden shadow-2xl">
            <video
                key={video.id}
                ref={videoRef}
                src={video.url}
                poster={video.thumbnail}
                className="w-full h-full object-contain"
                autoPlay={autoPlay}
                controls
            />
            
            {/* Overlay Settings Button (Visible on hover) */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                 <button 
                    onClick={() => setCaptions(!captions)}
                    className={`p-1.5 rounded bg-black/60 text-white backdrop-blur-sm ${captions ? 'border-b-2 border-red-500' : ''}`}
                    title="Subtitles/CC"
                 >
                     <CCIcon className="w-5 h-5" />
                 </button>
                 <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 rounded bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                        title="Settings"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>

                    {/* Settings Menu */}
                    {showSettings && (
                        <div className="absolute top-10 right-0 w-48 bg-black/90 text-white rounded-xl shadow-xl backdrop-blur-md p-2 z-20 flex flex-col text-sm border border-white/10">
                            <div className="px-3 py-2 border-b border-white/10 font-bold mb-1">Quality</div>
                            {['1080p HD', '720p', '480p', 'Auto'].map(q => (
                                <button 
                                    key={q} 
                                    onClick={() => { setQuality(q); setShowSettings(false); }}
                                    className={`px-3 py-2 text-left hover:bg-white/10 rounded flex justify-between ${quality === q ? 'text-blue-400' : ''}`}
                                >
                                    {q}
                                    {quality === q && <CheckIcon className="w-4 h-4" />}
                                </button>
                            ))}
                            <div className="border-t border-white/10 my-1"></div>
                            <button className="px-3 py-2 text-left hover:bg-white/10 rounded">Playback Speed</button>
                        </div>
                    )}
                 </div>
            </div>
            
            {/* Caption Overlay (Mock) */}
            {captions && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
                     <span className="bg-black/70 text-white px-3 py-1 text-sm rounded backdrop-blur-sm">
                         [Captions: {video.description.substring(0, 30)}...]
                     </span>
                </div>
            )}
        </div>
    );
};

// --- Recursive Comment Component ---
const VideoComment = ({ comment, onReply }: { comment: Comment, onReply: (id: string, text: string) => void }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(comment.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {comment.author.name[0]}
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <ThumbsUpIcon className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <ThumbsDownIcon className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => setIsReplying(!isReplying)} 
                        className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Reply
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-2 flex gap-2">
                        <input 
                            className="bg-gray-100 dark:bg-[#272727] text-sm p-2 rounded w-full dark:text-white outline-none focus:border-blue-500 border border-transparent"
                            placeholder="Add a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                        />
                        <button onClick={handleReplySubmit} className="bg-blue-600 text-white px-3 rounded text-xs font-bold">Reply</button>
                        <button onClick={() => setIsReplying(false)} className="text-gray-500 text-xs hover:text-gray-700">Cancel</button>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {comment.replies.map(reply => (
                            <VideoComment key={reply.id} comment={reply} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Video Context Menu ---
const VideoContextMenu = ({ 
    video, 
    onClose,
    onWatchLater,
    onDownload,
    onShare,
    onSaveToPlaylist
}: { 
    video: LongFormVideo, 
    onClose: () => void,
    onWatchLater: () => void,
    onDownload: () => void,
    onShare: () => void,
    onSaveToPlaylist: () => void
}) => {
    return (
        <div 
            className="absolute bottom-10 right-2 z-20 bg-white dark:bg-[#282828] rounded-xl shadow-xl border border-gray-100 dark:border-[#333] w-48 overflow-hidden animate-fade-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={() => { onWatchLater(); onClose(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-gray-800 dark:text-gray-200">
                <ClockIcon className="w-4 h-4" /> Watch Later
            </button>
            <button onClick={() => { onSaveToPlaylist(); onClose(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-gray-800 dark:text-gray-200">
                <ListPlusIcon className="w-4 h-4" /> Save to Playlist
            </button>
            <button onClick={() => { onDownload(); onClose(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-gray-800 dark:text-gray-200">
                <DownloadIcon className="w-4 h-4" /> Download
            </button>
            <button onClick={() => { onShare(); onClose(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-gray-800 dark:text-gray-200">
                <ShareIcon className="w-4 h-4" /> Share
            </button>
            <div className="h-px bg-gray-100 dark:bg-[#333]"></div>
            <button onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#333] text-sm text-red-500">
                Cancel
            </button>
        </div>
    );
};

export const LongFormVideoApp: React.FC<LongFormVideoProps> = ({ videos: initialVideos, currentUser, onViewProfile }) => {
  const [videos, setVideos] = useState(initialVideos);
  const [currentView, setCurrentView] = useState<'HOME' | 'WATCH' | 'REELS' | 'CHANNEL' | 'LIBRARY' | 'LIVE' | 'ANALYTICS' | 'CREATE_REEL' | 'WATCH_LATER'>('HOME');
  const [selectedVideo, setSelectedVideo] = useState<LongFormVideo | null>(null);
  const [viewingChannel, setViewingChannel] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<'all' | 'video' | 'short' | 'live'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Header State
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Watch State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBellOn, setIsBellOn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  // Library State
  const [history, setHistory] = useState<LongFormVideo[]>([]);
  const [watchLater, setWatchLater] = useState<LongFormVideo[]>([]);
  const [downloads, setDownloads] = useState<LongFormVideo[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Sharing & Menu
  const [sharingVideo, setSharingVideo] = useState<LongFormVideo | null>(null);
  const [activeMenuVideoId, setActiveMenuVideoId] = useState<string | null>(null);

  // Local Subscriptions List (IDs)
  const [subscriptions, setSubscriptions] = useState<string[]>(currentUser.subscriptions || ['u2', 'u5']);

  // Shorts/Reels State
  const [isReelsMuted, setIsReelsMuted] = useState(false);
  // Reels video list - in real app this would be separate API but we filter videos
  const [reelsVideos, setReelsVideos] = useState<Video[]>(REELS_VIDEOS);

  const filteredVideos = videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesType = activeType === 'all' || v.type === activeType;
      
      const videoType = v.type || 'video';
      const effectiveMatchType = activeType === 'all' || videoType === activeType;

      return matchesSearch && matchesCategory && effectiveMatchType;
  });

  const handleVideoClick = (video: LongFormVideo) => {
    // Add to history
    setHistory(prev => {
        const newHistory = [video, ...prev.filter(v => v.id !== video.id)];
        return newHistory.slice(0, 50); // Keep last 50
    });

    if (video.type === 'short') {
        setCurrentView('REELS');
    } else {
        setSelectedVideo(video);
        setCurrentView('WATCH');
        setIsSubscribed(subscriptions.includes(video.author.id)); 
        setIsBellOn(false);
        setIsLiked(false);
        setIsDisliked(false);
        setDescriptionExpanded(false);
        
        // Mock Comments with updated structure
        const mockComments: Comment[] = [
            { id: 'c1', author: { ...currentUser, name: "TechFan99" }, text: "Great content as always!", timestamp: "2 hours ago", replies: [] },
            { id: 'c2', author: { ...currentUser, name: "Sarah J." }, text: "Can you do a tutorial on the advanced features?", timestamp: "5 hours ago", replies: [] }
        ];
        setComments(mockComments);
        
        window.scrollTo(0, 0);
    }
  };

  const handleChannelClick = (user: User) => {
      setViewingChannel(user);
      setCurrentView('CHANNEL');
  };

  const handleSubscribe = () => {
      if (selectedVideo) {
          if (isSubscribed) {
              setSubscriptions(prev => prev.filter(id => id !== selectedVideo.author.id));
              setIsSubscribed(false);
          } else {
              setSubscriptions(prev => [...prev, selectedVideo.author.id]);
              setIsSubscribed(true);
          }
      }
  };

  const handleLike = () => {
      setIsLiked(!isLiked);
      if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
      setIsDisliked(!isDisliked);
      if (isLiked) setIsLiked(false);
  };

  const handlePostComment = () => {
      if (!commentText.trim()) return;
      const newComment: Comment = {
          id: `nc_${Date.now()}`,
          author: currentUser,
          text: commentText,
          timestamp: 'Just now',
          replies: []
      };
      setComments([newComment, ...comments]);
      setCommentText('');
  };

  const handleReplyToComment = (parentId: string, text: string) => {
      const addReply = (list: Comment[]): Comment[] => {
          return list.map(c => {
              if (c.id === parentId) {
                  return {
                      ...c,
                      replies: [...(c.replies || []), {
                          id: `r_${Date.now()}`,
                          author: currentUser,
                          text,
                          timestamp: 'Just now'
                      }]
                  };
              } else if (c.replies) {
                  return { ...c, replies: addReply(c.replies) };
              }
              return c;
          });
      };
      setComments(addReply(comments));
  };

  const handleUploadVideo = (newVideo: LongFormVideo) => {
      setVideos([newVideo, ...videos]);
  };

  const handlePostReel = (newVideo: Video) => {
      setReelsVideos([newVideo, ...reelsVideos]);
      setCurrentView('REELS'); // Return to reels view after posting
  };

  const toggleWatchLater = (video: LongFormVideo) => {
      setWatchLater(prev => {
          const exists = prev.find(v => v.id === video.id);
          if (exists) return prev.filter(v => v.id !== video.id);
          return [video, ...prev];
      });
  };

  const handleDownload = (video: LongFormVideo) => {
      setDownloadingId(video.id);
      setTimeout(() => {
          setDownloads(prev => [video, ...prev]);
          setDownloadingId(null);
      }, 2000);
  };

  const startVoiceSearch = () => {
      setIsListening(true);
      // Simulate listening
      setTimeout(() => {
          setSearchQuery("New Technology Trends");
          setIsListening(false);
      }, 2500);
  };

  const renderVideoList = (videoList: LongFormVideo[], emptyMessage: string) => {
      if (videoList.length === 0) return <p className="text-gray-500 p-6">{emptyMessage}</p>;
      
      return (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videoList.map(video => (
                  <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer group flex flex-col gap-3 relative">
                      <div className="aspect-video rounded-xl overflow-hidden mb-2 relative">
                          <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>
                          
                          {/* Three Dot Context Menu Trigger (Bottom Right of Thumbnail) */}
                          <button 
                             onClick={(e) => { e.stopPropagation(); setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id); }}
                             className="absolute bottom-1 left-1 p-1 bg-black/70 hover:bg-black/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <MoreVerticalIcon className="w-4 h-4" />
                          </button>
                      </div>

                      {activeMenuVideoId === video.id && (
                          <VideoContextMenu 
                              video={video}
                              onClose={() => setActiveMenuVideoId(null)}
                              onWatchLater={() => toggleWatchLater(video)}
                              onDownload={() => handleDownload(video)}
                              onShare={() => setSharingVideo(video)}
                              onSaveToPlaylist={() => alert("Added to Playlist")}
                          />
                      )}

                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{video.author.name}</p>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f]" onClick={() => setActiveMenuVideoId(null)}>
      {currentView === 'LIVE' ? (
          <LiveStudio onClose={() => setCurrentView('HOME')} currentUser={currentUser} />
      ) : currentView === 'CREATE_REEL' ? (
          <CreateReel 
            onBack={() => setCurrentView('REELS')}
            onPost={handlePostReel}
            currentUser={currentUser}
          />
      ) : (
      <>
      {/* INLINED HEADER TO FIX INPUT FOCUS ISSUE */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0f0f0f] px-4 h-14 flex items-center justify-between border-b border-transparent dark:border-none">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full"
              >
                  {isSidebarCollapsed ? <ToggleLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" /> : <MenuIcon className="w-6 h-6 text-gray-900 dark:text-white" />}
              </button>
              <div onClick={() => { setCurrentView('HOME'); setSearchQuery(''); setActiveCategory('All'); setActiveType('all'); }} className="flex items-center gap-2 cursor-pointer" title="StreamHub Home">
                  <div className="text-red-600">
                    <StreamHubLogo className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans hidden sm:block">StreamHub</span>
              </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-4 ml-10">
              <div className="flex flex-1 items-center relative">
                  <form 
                    className="flex flex-1 items-center w-full"
                    onSubmit={(e) => { e.preventDefault(); setCurrentView('HOME'); }}
                  >
                      <div className="flex flex-1 items-center px-4 bg-white dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-l-full h-10 shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all ml-8 group">
                          <div className="md:hidden group-focus-within:block mr-2">
                              <SearchIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Search" 
                            className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <button type="submit" className="h-10 px-6 bg-gray-100 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-200 dark:hover:bg-[#303030] flex items-center justify-center transition-colors" aria-label="Search">
                          <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                  </form>
                  
                  {isListening && (
                      <div className="absolute top-12 left-0 right-0 bg-red-600 text-white p-2 rounded-lg text-center shadow-lg animate-pulse z-50">
                          Listening...
                      </div>
                  )}
              </div>
              <button 
                onClick={startVoiceSearch}
                className={`p-2.5 bg-gray-100 dark:bg-[#181818] rounded-full hover:bg-gray-200 dark:hover:bg-[#303030] transition ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                aria-label="Voice Search"
              >
                  {isListening ? <MicActiveIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5 text-gray-900 dark:text-white" />}
              </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setCurrentView('LIVE')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full text-gray-600 dark:text-gray-300"
                title="Go Live"
              >
                  <SignalIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full hidden sm:block"
                title="Upload"
              >
                  <CreateVideoIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full"
                  >
                      <BellIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                  {showNotifications && (
                      <div className="absolute top-12 right-0 w-80 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-gray-100 dark:border-[#333] z-50 overflow-hidden">
                          <div className="p-3 border-b border-gray-100 dark:border-[#333] font-bold dark:text-white">Notifications</div>
                          <div className="max-h-80 overflow-y-auto">
                              {/* Mock Notifications */}
                              {[1,2,3].map(i => (
                                  <div key={i} className="p-3 hover:bg-gray-50 dark:hover:bg-[#333] flex gap-3 cursor-pointer">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                      <div className="flex-1">
                                          <p className="text-sm dark:text-white">TechDaily uploaded: "New iPhone Review"</p>
                                          <span className="text-xs text-gray-500">2 hours ago</span>
                                      </div>
                                      <img src="https://picsum.photos/50/50" className="w-10 h-10 rounded object-cover" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
              <img onClick={() => handleChannelClick(currentUser)} src={currentUser.avatar} className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-blue-500 transition" alt="Profile" />
          </div>
      </div>

      <UploadVideoModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        currentUser={currentUser}
        onUpload={handleUploadVideo}
      />

      <VideoShareModal 
        isOpen={!!sharingVideo}
        onClose={() => setSharingVideo(null)}
        video={sharingVideo}
      />
      
      <div className="flex flex-1 overflow-hidden">
          {/* Collapsible Sidebar */}
          <div 
            className={`hidden md:flex flex-col px-3 hover:overflow-y-auto overflow-hidden sticky top-14 h-full pb-4 transition-all duration-300 ease-in-out border-r border-transparent dark:border-[#1f1f1f]
            ${isSidebarCollapsed ? 'w-20 items-center' : 'w-60'} 
            ${currentView === 'WATCH' ? 'hidden xl:flex' : ''}`}
          >
            <SidebarItem collapsed={isSidebarCollapsed} icon={<HomeIcon className="w-6 h-6" />} label="Home" active={currentView === 'HOME'} onClick={() => setCurrentView('HOME')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<StreamHubLogo className="w-6 h-6 text-red-600" />} label="Reels" active={currentView === 'REELS'} onClick={() => setCurrentView('REELS')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<LibraryIcon className="w-6 h-6" />} label="Library" active={currentView === 'LIBRARY'} onClick={() => setCurrentView('LIBRARY')} />
            
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3 w-full"></div>
            
            <SidebarItem collapsed={isSidebarCollapsed} icon={<CheckIcon className="w-6 h-6" />} label="Your Channel" active={currentView === 'CHANNEL' && viewingChannel?.id === currentUser.id} onClick={() => handleChannelClick(currentUser)} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<HistoryIcon className="w-6 h-6" />} label="History" active={false} onClick={() => setCurrentView('LIBRARY')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<ClockIcon className="w-6 h-6" />} label="Watch Later" active={currentView === 'WATCH_LATER'} onClick={() => setCurrentView('WATCH_LATER')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<DownloadIcon className="w-6 h-6" />} label="Downloads" active={false} onClick={() => setCurrentView('LIBRARY')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<DashboardIcon className="w-6 h-6" />} label="Analytics" active={currentView === 'ANALYTICS'} onClick={() => setCurrentView('ANALYTICS')} />
            
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3 w-full"></div>
            
            {!isSidebarCollapsed && <div className="px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Subscriptions</div>}
            
            {/* Dynamic Subscription List */}
            {subscriptions.map(subId => {
                const subUser = Object.values(MOCK_USERS).find(u => u.id === subId) || { id: subId, name: 'Unknown User', avatar: 'https://via.placeholder.com/30' } as User;
                return (
                    <div 
                        key={subId} 
                        onClick={() => { setSearchQuery(subUser.name); setCurrentView('HOME'); }}
                        className={`flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}
                        title={subUser.name}
                    >
                        <img src={subUser.avatar} className="w-6 h-6 rounded-full object-cover" />
                        {!isSidebarCollapsed && <span className="text-sm truncate text-gray-900 dark:text-white">{subUser.name}</span>}
                    </div>
                );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f0f0f]">
              {currentView === 'ANALYTICS' && <ChannelAnalytics currentUser={currentUser} />}
              
              {currentView === 'REELS' && (
                  <div className="h-full bg-black">
                      <VideoReels 
                        videos={reelsVideos} 
                        isMuted={isReelsMuted} 
                        toggleMute={() => setIsReelsMuted(!isReelsMuted)} 
                        onViewProfile={handleChannelClick}
                        onCreateReel={() => setCurrentView('CREATE_REEL')}
                        onSubscribe={(id) => {
                            if (!subscriptions.includes(id)) setSubscriptions([...subscriptions, id]);
                            else setSubscriptions(subscriptions.filter(s => s !== id));
                        }}
                        onUseSound={() => setCurrentView('CREATE_REEL')}
                      />
                  </div>
              )}

              {currentView === 'WATCH_LATER' && (
                  <div className="p-6 pb-20 min-h-full">
                      <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                               <ClockIcon className="w-8 h-8 text-white" />
                           </div>
                           <div>
                               <h1 className="text-3xl font-bold dark:text-white">Watch Later</h1>
                               <p className="text-gray-500">{watchLater.length} videos • Updated today</p>
                           </div>
                      </div>
                      {renderVideoList(watchLater, "Your Watch Later list is empty.")}
                  </div>
              )}

              {currentView === 'LIBRARY' && (
                  <div className="p-6 space-y-10 pb-20">
                      <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                               <LibraryIcon className="w-8 h-8 text-red-600" />
                           </div>
                           <div>
                               <h1 className="text-3xl font-bold dark:text-white">Library</h1>
                               <p className="text-gray-500">Manage your history, watch later list, and downloads.</p>
                           </div>
                      </div>

                      <section>
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><HistoryIcon className="w-5 h-5" /> History</h2>
                              <button className="text-blue-500 text-sm font-bold">See all</button>
                          </div>
                          {history.length === 0 ? <p className="text-gray-500 text-sm italic">No watch history.</p> : (
                              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                                  {history.map(video => (
                                      <div key={video.id} onClick={() => handleVideoClick(video)} className="min-w-[250px] cursor-pointer group">
                                          <div className="aspect-video rounded-lg overflow-hidden relative">
                                              <img src={video.thumbnail} className="w-full h-full object-cover" />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>
                                          </div>
                                          <h3 className="font-bold text-sm mt-2 dark:text-white line-clamp-2">{video.title}</h3>
                                          <p className="text-xs text-gray-500">{video.author.name}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>

                      <section>
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><ClockIcon className="w-5 h-5" /> Watch Later</h2>
                              <button onClick={() => setCurrentView('WATCH_LATER')} className="text-blue-500 text-sm font-bold hover:underline">See all</button>
                          </div>
                          {watchLater.length === 0 ? <p className="text-gray-500 text-sm italic">Your list is empty.</p> : (
                              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                                  {watchLater.map(video => (
                                      <div key={video.id} onClick={() => handleVideoClick(video)} className="min-w-[250px] cursor-pointer group">
                                          <div className="aspect-video rounded-lg overflow-hidden relative">
                                              <img src={video.thumbnail} className="w-full h-full object-cover" />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                                          </div>
                                          <h3 className="font-bold text-sm mt-2 dark:text-white line-clamp-2">{video.title}</h3>
                                          <p className="text-xs text-gray-500">{video.author.name}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>

                      <section>
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><DownloadIcon className="w-5 h-5" /> Downloads</h2>
                              <button className="text-blue-500 text-sm font-bold">See all</button>
                          </div>
                          {downloads.length === 0 ? <p className="text-gray-500 text-sm italic">No downloaded videos.</p> : (
                              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                                  {downloads.map(video => (
                                      <div key={video.id} onClick={() => handleVideoClick(video)} className="min-w-[250px] cursor-pointer group">
                                          <div className="aspect-video rounded-lg overflow-hidden relative">
                                              <img src={video.thumbnail} className="w-full h-full object-cover" />
                                              <div className="absolute top-2 right-2 bg-green-500 p-1 rounded-full"><CheckIcon className="w-3 h-3 text-white" /></div>
                                          </div>
                                          <h3 className="font-bold text-sm mt-2 dark:text-white line-clamp-2">{video.title}</h3>
                                          <p className="text-xs text-gray-500">{video.author.name}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>
                  </div>
              )}

              {currentView === 'CHANNEL' && viewingChannel && (
                  <ChannelPage 
                    user={viewingChannel} 
                    videos={videos} 
                    onBack={() => setCurrentView('HOME')} 
                    onVideoClick={handleVideoClick}
                    currentUser={currentUser}
                  />
              )}

              {currentView === 'WATCH' && selectedVideo && (
                  <div className="flex flex-col lg:flex-row max-w-[1750px] mx-auto w-full p-0 lg:p-6 gap-6">
                        {/* Left Column: Video & Comments */}
                        <div className="flex-1">
                            <EnhancedVideoPlayer video={selectedVideo} autoPlay={true} />
                            
                            <div className="px-4 lg:px-0 py-4">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{selectedVideo.title}</h1>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <img onClick={() => handleChannelClick(selectedVideo.author)} src={selectedVideo.author.avatar} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80" alt="" />
                                        <div onClick={() => handleChannelClick(selectedVideo.author)} className="flex flex-col mr-4 cursor-pointer group">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-gray-700">{selectedVideo.author.name}</h3>
                                            <span className="text-xs text-gray-600 dark:text-[#aaa]">{selectedVideo.author.subscribers || '2K'} subscribers</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={handleSubscribe}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${isSubscribed ? 'bg-gray-200 dark:bg-[#272727] text-gray-900 dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}
                                            >
                                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                            </button>
                                            {isSubscribed && (
                                                <button onClick={() => setIsBellOn(!isBellOn)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full">
                                                    {isBellOn ? <BellRingIcon className="w-6 h-6 text-gray-900 dark:text-white" /> : <BellIcon className="w-6 h-6 text-gray-900 dark:text-white" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                                        <div className="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full h-9">
                                            <button 
                                                onClick={handleLike}
                                                className={`flex items-center gap-2 px-4 h-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-l-full border-r border-gray-300 dark:border-[#3f3f3f] transition ${isLiked ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}
                                            >
                                                <ThumbsUpIcon className="w-5 h-5" filled={isLiked} />
                                                <span className="text-sm font-medium">{isLiked ? (selectedVideo.likeCount || 0) + 1 : (selectedVideo.likeCount || 0)}</span>
                                            </button>
                                            <button 
                                                onClick={handleDislike}
                                                className={`px-4 h-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-r-full transition ${isDisliked ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
                                            >
                                                <ThumbsDownIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button onClick={() => setSharingVideo(selectedVideo)} className="flex items-center gap-2 bg-gray-100 dark:bg-[#272727] px-4 h-9 rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                            <ShareIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Share</span>
                                        </button>
                                        <button onClick={() => handleDownload(selectedVideo)} className="flex items-center gap-2 bg-gray-100 dark:bg-[#272727] px-4 h-9 rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                            {downloadingId === selectedVideo.id ? (
                                                <span className="text-xs text-blue-500 animate-pulse">Downloading...</span>
                                            ) : downloads.find(d => d.id === selectedVideo.id) ? (
                                                <>
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Saved</span>
                                                </>
                                            ) : (
                                                <>
                                                    <DownloadIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Download</span>
                                                </>
                                            )}
                                        </button>
                                        <button onClick={() => toggleWatchLater(selectedVideo)} className="p-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                            {watchLater.find(v => v.id === selectedVideo.id) ? (
                                                 <CheckIcon className="w-5 h-5 text-blue-500" />
                                            ) : (
                                                 <ClockIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                            )}
                                        </button>
                                        <button className="p-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                            <PlaylistIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div 
                                    className={`mt-4 bg-gray-100 dark:bg-[#272727] p-3 rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-[#3f3f3f] ${descriptionExpanded ? '' : 'h-24 overflow-hidden relative'}`}
                                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                                >
                                    <div className="font-bold text-gray-900 dark:text-white mb-1">
                                        {selectedVideo.views} views • {selectedVideo.uploadedAt}
                                    </div>
                                    <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{selectedVideo.description}</p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        {selectedVideo.tags?.map(tag => <span key={tag} className="mr-2">#{tag}</span>)}
                                    </div>
                                    <span className="font-bold text-gray-600 dark:text-gray-400 mt-2 block">
                                        {descriptionExpanded ? 'Show less' : 'Show more'}
                                    </span>
                                </div>

                                {/* Comment Section */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{comments.length} Comments</h3>
                                    
                                    <div className="flex gap-4 mb-6">
                                        <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="Me" />
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Add a comment..."
                                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none pb-1 text-gray-900 dark:text-white focus:border-black dark:focus:border-white transition"
                                            />
                                            <div className="flex justify-end mt-2 gap-2">
                                                <button onClick={() => setCommentText('')} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full text-gray-600 dark:text-gray-300">Cancel</button>
                                                <button onClick={handlePostComment} disabled={!commentText.trim()} className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-700">Comment</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {comments.map((c) => (
                                            <VideoComment key={c.id} comment={c} onReply={handleReplyToComment} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Recommendations */}
                        <div className="w-full lg:w-[400px] px-4 lg:px-0 flex flex-col gap-3 pb-20">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold dark:text-white">Up Next</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Autoplay</span>
                                    <button 
                                        onClick={() => setAutoPlayNext(!autoPlayNext)} 
                                        className={`w-10 h-5 rounded-full relative transition ${autoPlayNext ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${autoPlayNext ? 'left-5.5' : 'left-0.5'}`}></div>
                                    </button>
                                </div>
                            </div>

                            {filteredVideos.filter(v => v.id !== selectedVideo.id).map(video => (
                                <div key={video.id} onClick={() => handleVideoClick(video)} className="flex gap-2 cursor-pointer group">
                                    <div className="w-40 h-24 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-[#272727]">
                                        <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-bold px-1 rounded">{video.duration}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{video.title}</h4>
                                        <p className="text-xs text-gray-600 dark:text-[#aaa] hover:text-gray-900 dark:hover:text-white">{video.author.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-[#aaa]">{video.views} views • {video.uploadedAt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                  </div>
              )}

              {currentView === 'HOME' && (
                  <div className="pb-20">
                     {/* Format Filter Bar */}
                     <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
                          {[
                              { id: 'all', label: 'All' },
                              { id: 'video', label: 'Videos' },
                              { id: 'short', label: 'Reels' },
                              { id: 'live', label: 'Live' }
                          ].map((type) => (
                              <button
                                  key={type.id}
                                  onClick={() => setActiveType(type.id as any)}
                                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${activeType === type.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-[#272727] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3f3f3f]'}`}
                              >
                                  {type.label}
                              </button>
                          ))}
                     </div>

                     {/* Category Filter Chips */}
                     <div className="sticky top-12 z-10 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm py-3 px-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-transparent dark:border-[#3f3f3f]">
                          {['All', 'Technology', 'Nature', 'Travel', 'Art', 'Tech', 'Music', 'News'].map((tag, i) => (
                              <button 
                                key={i} 
                                onClick={() => setActiveCategory(tag)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeCategory === tag ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'}`}
                              >
                                  {tag}
                              </button>
                          ))}
                     </div>

                     {filteredVideos.length > 0 ? (
                         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                             {filteredVideos.map(video => (
                                 <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer group flex flex-col gap-3 transition-transform duration-200 hover:scale-[1.01] relative">
                                     <div className={`relative rounded-xl overflow-hidden ${video.type === 'short' ? 'aspect-[9/16] max-w-[200px]' : 'aspect-video'}`}>
                                         <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-in-out" alt="" />
                                         <span className={`absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded ${video.type === 'live' ? 'bg-red-600' : ''}`}>{video.duration}</span>

                                         {/* Three Dot Context Menu Trigger */}
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id); }}
                                            className="absolute bottom-1 left-1 p-1 bg-black/70 hover:bg-black/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                         >
                                             <MoreVerticalIcon className="w-4 h-4" />
                                         </button>
                                     </div>

                                     {/* Context Menu Dropdown */}
                                     {activeMenuVideoId === video.id && (
                                         <VideoContextMenu 
                                             video={video}
                                             onClose={() => setActiveMenuVideoId(null)}
                                             onWatchLater={() => toggleWatchLater(video)}
                                             onDownload={() => handleDownload(video)}
                                             onShare={() => setSharingVideo(video)}
                                             onSaveToPlaylist={() => alert("Added to playlist")}
                                         />
                                     )}

                                     <div className="flex gap-3 items-start">
                                         {video.type !== 'short' && <img onClick={(e) => {e.stopPropagation(); handleChannelClick(video.author)}} src={video.author.avatar} className="w-9 h-9 rounded-full mt-1 hover:opacity-80 transition" alt="" />}
                                         <div className="flex flex-col">
                                             <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">{video.title}</h3>
                                             <div className="text-sm text-gray-600 dark:text-[#aaa] mt-1">
                                                 {video.type !== 'short' && <p onClick={(e) => {e.stopPropagation(); handleChannelClick(video.author)}} className="hover:text-gray-900 dark:hover:text-white hover:underline">{video.author.name}</p>}
                                                 <p>{video.views} views • {video.uploadedAt}</p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                             <SearchIcon className="w-12 h-12 mb-4 opacity-50" />
                             <p>No videos found matching filters.</p>
                         </div>
                     )}
                  </div>
              )}
          </div>
      </div>
      </>
      )}
    </div>
  );
};

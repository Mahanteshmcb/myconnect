
import React, { useState, useRef, useEffect } from 'react';
import { LongFormVideo, User, Video, Comment } from '../types';
import { SearchIcon, MenuIcon, BellIcon, BellRingIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, StreamHubLogo, MicrophoneIcon, CreateVideoIcon, SettingsIcon, UploadIcon, HomeIcon, HistoryIcon, LibraryIcon, CheckIcon, CloseIcon, QualityIcon, CCIcon, PlayCircleIcon, SignalIcon, AnalyticsIcon, EyeIcon, GlobeIcon, LockClosedIcon, DashboardIcon, DownloadIcon, ClockIcon, ReplyIcon, PlaylistIcon, MicActiveIcon, ToggleLeftIcon, CheckCircleIcon, MoreVerticalIcon, ListPlusIcon, QuestionMarkCircleIcon } from './Icons';
import { VideoReels, CreateReel } from './VideoReels';
import { REELS_VIDEOS, MOCK_USERS } from '../services/mockData';
import { formatCompactNumber } from '../services/coreEngine';

interface LongFormVideoProps {
  videos: LongFormVideo[];
  currentUser: User;
  onUpdateVideo: (video: LongFormVideo) => void;
  onViewProfile: (user?: User) => void;
  initialVideo?: LongFormVideo | null;
}

// --- Share Video Modal ---
const VideoShareModal = ({ isOpen, onClose, video }: { isOpen: boolean, onClose: () => void, video: LongFormVideo | null }) => {
    if (!isOpen || !video) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://streamhub.app/v/${video.id}`);
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
const ChannelAnalytics = ({ currentUser, videos }: { currentUser: User; videos: LongFormVideo[] }) => {
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
                         {videos.slice(0, 5).map((v, i) => (
                             <div key={i} className="flex items-center gap-3">
                                 <div className="w-16 h-9 bg-gray-200 dark:bg-[#333] rounded overflow-hidden">
                                     <img src={v.thumbnail} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-sm font-bold dark:text-white truncate">{v.title}</div>
                                     <div className="text-xs text-gray-500">{v.views} views • 98% likes</div>
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
                                    {['Technology', 'Nature', 'Travel', 'Art', 'Tech', 'Music', 'News'].map(c => <option key={c} value={c}>{c}</option>)}
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
                                <img src={thumbnailPreview} className="w-full h-20 object-cover rounded mt-2" alt="Thumbnail Preview"/>
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
    onVideoClick,
    currentUser
}: { 
    user: User, 
    videos: LongFormVideo[], 
    onVideoClick: (v: LongFormVideo) => void,
    currentUser: User
}) => {
    type ChannelTab = 'Home' | 'Videos' | 'Reels' | 'Dashboard' | 'Content' | 'Analytics' | 'Comments';
    const isOwnChannel = user.id === currentUser.id;
    const [activeTab, setActiveTab] = useState<ChannelTab>(isOwnChannel ? 'Dashboard' : 'Home');
    
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [notificationLevel, setNotificationLevel] = useState<'all' | 'personalized' | 'none'>('personalized');
    const [showSubMenu, setShowSubMenu] = useState(false);

    const channelVideos = videos.filter(v => v.author.id === user.id);
    const shorts = channelVideos.filter(v => v.type === 'short');
    const longVideos = channelVideos.filter(v => v.type !== 'short');
    
    const TABS: ChannelTab[] = isOwnChannel ? ['Dashboard', 'Content', 'Analytics', 'Comments'] : ['Home', 'Videos', 'Reels'];

    const renderContentTab = () => (
        <div className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-[#333]">
            <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-[#333]">
                    <tr>
                        <th className="p-4">Video</th>
                        <th className="p-4">Views</th>
                        <th className="p-4">Likes</th>
                        <th className="p-4">Comments</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {channelVideos.map(v => (
                        <tr key={v.id} className="border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                            <td className="p-4 flex items-center gap-3">
                                <img src={v.thumbnail} className="w-24 h-14 rounded object-cover" alt={v.title} />
                                <span className="font-bold dark:text-white truncate">{v.title}</span>
                            </td>
                            <td className="p-4 dark:text-gray-300">{v.views}</td>
                            <td className="p-4 dark:text-gray-300">{v.likes}</td>
                            <td className="p-4 dark:text-gray-300">123</td>
                            <td className="p-4 dark:text-gray-300">{v.uploadedAt}</td>
                            <td className="p-4"><button className="text-blue-500 font-bold">Edit</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {channelVideos.length === 0 && <p className="p-8 text-center text-gray-500">No content uploaded yet.</p>}
        </div>
    );

    const renderCommentsTab = () => (
        <div className="space-y-4">
            <h3 className="font-bold dark:text-white">Recent Comments</h3>
             {[
                { user: MOCK_USERS['u1'], text: "This was so helpful!", video: "My Desk Setup Tour 2025" },
                { user: MOCK_USERS['u2'], text: "Amazing quality!", video: "How I Plan My Week" },
             ].map((c, i) => (
                <div key={i} className="bg-white dark:bg-[#1f1f1f] p-4 rounded-xl border border-gray-200 dark:border-[#333]">
                    <div className="flex items-start gap-3">
                        <img src={c.user.avatar} className="w-8 h-8 rounded-full" alt={c.user.name} />
                        <div>
                            <p className="text-sm dark:text-white"><span className="font-bold">{c.user.name}</span> commented: "{c.text}"</p>
                            <p className="text-xs text-gray-500 mt-1">on <span className="font-medium text-blue-500">{c.video}</span></p>
                        </div>
                    </div>
                </div>
             ))}
        </div>
    );

    return (
        <div className="flex-1 bg-white dark:bg-[#0f0f0f] overflow-y-auto" onClick={() => setShowSubMenu(false)}>
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
            <div className="max-w-6xl mx-auto px-6 pt-0 pb-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f0f0f] -mt-16 z-10" alt={user.name} />
                    <div className="flex-1 mt-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name} {user.verified && <CheckIcon className="inline w-6 h-6 text-gray-500" />}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-medium">@{user.handle} • {user.subscribers || '1K'} subscribers • {channelVideos.length} videos</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl line-clamp-2 mb-4">{user.bio || "Welcome to my official channel! I post videos about technology and lifestyle."}</p>
                        
                        {!isOwnChannel && (
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
                                        onClick={(e) => { e.stopPropagation(); setShowSubMenu(!showSubMenu); }}
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
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-8 border-b border-gray-200 dark:border-[#3f3f3f]">
                    {TABS.map(tab => (
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
                {(activeTab === 'Home' || activeTab === 'Dashboard') && (
                    <div className="space-y-10">
                        {isOwnChannel && <ChannelAnalytics currentUser={currentUser} videos={videos} />}
                         {shorts.length > 0 && (
                             <div>
                                 <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><StreamHubLogo className="w-6 h-6 text-red-600" /> Reels</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {shorts.slice(0, 5).map(v => (
                                         <div key={v.id} onClick={() => onVideoClick(v)} className="cursor-pointer group">
                                             <div className="aspect-[9/16] rounded-xl overflow-hidden mb-2">
                                                 <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt={v.title} />
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
                                             <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt={v.title} />
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
                {activeTab === 'Analytics' && <ChannelAnalytics currentUser={currentUser} videos={videos} />}
                {activeTab === 'Content' && renderContentTab()}
                {activeTab === 'Comments' && renderCommentsTab()}
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
const EnhancedVideoPlayer = ({ video, autoPlay, onEnded }: { video: LongFormVideo, autoPlay: boolean, onEnded?: () => void }) => {
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
                onEnded={onEnded}
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
const VideoComment = ({ comment, onReply, currentUser, depth = 0 }: { comment: Comment, onReply: (id: string, text: string) => void, currentUser: User, depth?: number }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(comment.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    // Adjust avatar size based on nesting depth
    const avatarSize = depth > 0 ? 'w-8 h-8' : 'w-10 h-10';

    return (
        <div className={`flex gap-4 group ${depth > 0 ? 'mt-3' : ''}`}>
            <img 
                src={comment.author.avatar} 
                className={`${avatarSize} rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 object-cover`} 
                alt={comment.author.name} 
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className={`font-bold ${depth > 0 ? 'text-xs' : 'text-sm'} text-gray-900 dark:text-white cursor-pointer hover:underline`}>{comment.author.name}</span>
                    <span className="text-[10px] text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{comment.text}</p>
                
                <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
                        <ThumbsUpIcon className="w-3.5 h-3.5" />
                        {comment.likes && <span className="text-xs">{comment.likes}</span>}
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
                        <ThumbsDownIcon className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => setIsReplying(!isReplying)} 
                        className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 uppercase tracking-wide"
                    >
                        Reply
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-3 flex gap-3 animate-fade-in">
                        <img src={currentUser.avatar} className="w-6 h-6 rounded-full object-cover" alt="Your avatar" />
                        <div className="flex-1">
                            <input 
                                className="bg-gray-100 dark:bg-[#272727] text-sm p-2 rounded-b-none rounded-t-lg w-full dark:text-white outline-none focus:border-b-2 border-blue-500 transition-colors placeholder-gray-500"
                                placeholder={`Reply to ${comment.author.name}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsReplying(false)} className="text-gray-500 text-xs hover:text-gray-700 font-bold px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#333]">Cancel</button>
                                <button onClick={handleReplySubmit} disabled={!replyText.trim()} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition">Reply</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="relative ml-2 pl-6 border-l-2 border-gray-100 dark:border-[#333] space-y-1">
                        {comment.replies.map(reply => (
                            <VideoComment 
                                key={reply.id} 
                                comment={reply} 
                                onReply={onReply} 
                                currentUser={currentUser} 
                                depth={depth + 1} 
                            />
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
            className="absolute top-10 right-0 z-20 bg-white dark:bg-[#282828] rounded-xl shadow-xl border border-gray-100 dark:border-[#333] w-48 overflow-hidden animate-fade-in flex flex-col"
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

export const LongFormVideoApp: React.FC<LongFormVideoProps> = ({ videos: initialVideos, currentUser, onViewProfile, onUpdateVideo, initialVideo }) => {
  
  const parseCompactNumber = (str: string): number => {
      if (!str) return 0;
      const lower = str.toLowerCase();
      const num = parseFloat(lower);
      if (lower.endsWith('k')) return num * 1000;
      if (lower.endsWith('m')) return num * 1000000;
      return num;
  };

  // FIX: Explicitly type the 'videos' state to match the 'LongFormVideo' interface.
  const [videos, setVideos] = useState<LongFormVideo[]>(() => initialVideos.map(v => ({
      ...v,
      likeCount: v.likeCount || parseCompactNumber(v.likes || '0'),
      dislikeCount: v.dislikeCount || Math.floor(parseCompactNumber(v.likes || '0') * 0.05) 
  })));

  const [currentView, setCurrentView] = useState<'HOME' | 'WATCH' | 'REELS' | 'CHANNEL' | 'LIBRARY' | 'LIVE' | 'CREATE_REEL' | 'WATCH_LATER'>('HOME');
  const [selectedVideo, setSelectedVideo] = useState<LongFormVideo | null>(null);
  const [viewingChannel, setViewingChannel] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<'all' | 'video' | 'short' | 'live'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBellOn, setIsBellOn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  const [history, setHistory] = useState<LongFormVideo[]>([]);
  const [watchLater, setWatchLater] = useState<LongFormVideo[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<{name: string, videos: LongFormVideo[]}[]>([{ name: 'Favorites', videos: [] }]);
  const [downloads, setDownloads] = useState<LongFormVideo[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const [sharingVideo, setSharingVideo] = useState<LongFormVideo | null>(null);
  const [activeMenuVideoId, setActiveMenuVideoId] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState<string[]>(currentUser.subscriptions || ['u2', 'u5']);

  const [isReelsMuted, setIsReelsMuted] = useState(false);
  const [reelsVideos, setReelsVideos] = useState<Video[]>(REELS_VIDEOS);

  const handleVideoClick = (video: LongFormVideo) => {
    setHistory(prev => {
        const newHistory = [video, ...prev.filter(v => v.id !== video.id)];
        return newHistory.slice(0, 50);
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
        
        const mockComments: Comment[] = [
            { id: 'c1', author: MOCK_USERS['u2'], text: "Great content as always!", timestamp: "2 hours ago", likes: 120, dislikes: 2, replies: [
                { id: 'c1_r1', author: currentUser, text: "Thanks David!", timestamp: "1 hour ago", likes: 10, dislikes: 0 }
            ]},
            { id: 'c2', author: MOCK_USERS['u1'], text: "Can you do a tutorial on the advanced features?", timestamp: "5 hours ago", likes: 55, dislikes: 0, replies: [] }
        ];
        setComments(mockComments);
        
        window.scrollTo(0, 0);
    }
  };
  
  useEffect(() => {
    if (initialVideo) {
      handleVideoClick(initialVideo);
    } else {
      if(currentView === 'WATCH' && selectedVideo) {
        setCurrentView('HOME');
        setSelectedVideo(null);
      }
    }
  }, [initialVideo]);

  const filteredVideos = videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const videoType = v.type || 'video';
      const effectiveMatchType = activeType === 'all' || videoType === activeType;

      return matchesSearch && matchesCategory && effectiveMatchType;
  });


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

  const updateVideoCounts = (videoId: string, likesChange: number, dislikesChange: number) => {
      const updatedVideo = videos.find(v => v.id === videoId);
      if (!updatedVideo) return;

      const newLikeCount = (updatedVideo.likeCount || 0) + likesChange;
      const newDislikeCount = (updatedVideo.dislikeCount || 0) + dislikesChange;
      
      const finalVideo = { ...updatedVideo, likeCount: newLikeCount, dislikeCount: newDislikeCount, likes: formatCompactNumber(newLikeCount) };
      
      setVideos(prev => prev.map(v => v.id === videoId ? finalVideo : v));
      setSelectedVideo(finalVideo);
      onUpdateVideo(finalVideo);
  };

  const handleLike = () => {
      if (!selectedVideo) return;
      const likesChange = isLiked ? -1 : 1;
      const dislikesChange = isDisliked ? -1 : 0;
      updateVideoCounts(selectedVideo.id, likesChange, dislikesChange);
      setIsLiked(!isLiked);
      if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
      if (!selectedVideo) return;
      const dislikesChange = isDisliked ? -1 : 1;
      const likesChange = isLiked ? -1 : 0;
      updateVideoCounts(selectedVideo.id, likesChange, dislikesChange);
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
      const newReply: Comment = {
          id: `r_${Date.now()}`,
          author: currentUser,
          text,
          timestamp: 'Just now'
      };

      const addReplyRecursively = (commentList: Comment[]): Comment[] => {
          return commentList.map(comment => {
              if (comment.id === parentId) {
                  return { ...comment, replies: [...(comment.replies || []), newReply] };
              }
              if (comment.replies && comment.replies.length > 0) {
                  return { ...comment, replies: addReplyRecursively(comment.replies) };
              }
              return comment;
          });
      };
      setComments(prevComments => addReplyRecursively(prevComments));
  };
  
  const handleVideoEnd = () => {
    if (autoPlayNext && selectedVideo) {
        const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
        if (currentIndex > -1 && currentIndex < videos.length - 1) {
            const nextVideo = videos[currentIndex + 1];
            handleVideoClick(nextVideo);
        }
    }
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
          if (exists) {
            alert(`"${video.title}" removed from Watch Later.`);
            return prev.filter(v => v.id !== video.id);
          }
          alert(`"${video.title}" added to Watch Later.`);
          return [video, ...prev];
      });
  };

  const handleDownload = (video: LongFormVideo) => {
      setDownloadingId(video.id);
      alert(`Downloading "${video.title}"...`);
      setTimeout(() => {
          setDownloads(prev => [video, ...prev]);
          setDownloadingId(null);
      }, 2000);
  };
  
  const handleSaveToPlaylist = (video: LongFormVideo) => {
    setMyPlaylists(prev => {
        const updatedPlaylists = [...prev];
        if (!updatedPlaylists[0].videos.find(v => v.id === video.id)) {
            updatedPlaylists[0].videos.push(video);
        }
        return updatedPlaylists;
    });
    alert(`Added "${video.title}" to Favorites playlist!`);
  };

  const startVoiceSearch = () => {
      setIsListening(true);
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
                          <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt={video.title} />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>
                          
                          <button 
                             onClick={(e) => { e.stopPropagation(); setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id); }}
                             className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                              onSaveToPlaylist={() => handleSaveToPlaylist(video)}
                          />
                      )}
                      
                      <div className="flex gap-3 items-start">
                           <img src={video.author.avatar} className="w-9 h-9 rounded-full" alt={video.author.name} />
                           <div>
                               <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug text-sm">{video.title}</h3>
                               <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{video.views} views • {video.uploadedAt}</p>
                           </div>
                       </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f]" onClick={() => { setActiveMenuVideoId(null); setShowNotifications(false); }}>
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
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0f0f0f] px-4 h-14 flex items-center justify-between border-b border-gray-200 dark:border-[#272727]">
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
                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full"
                  >
                      <BellIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                  {showNotifications && (
                      <div className="absolute top-12 right-0 w-80 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-gray-100 dark:border-[#333] z-50 overflow-hidden">
                          <div className="p-3 border-b border-gray-100 dark:border-[#333] font-bold dark:text-white">Notifications</div>
                          <div className="max-h-80 overflow-y-auto">
                              {[1,2,3].map(i => (
                                  <div key={i} className="p-3 hover:bg-gray-50 dark:hover:bg-[#333] flex gap-3 cursor-pointer">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                      <div className="flex-1">
                                          <p className="text-sm dark:text-white">TechDaily uploaded: "New iPhone Review"</p>
                                          <span className="text-xs text-gray-500">2 hours ago</span>
                                      </div>
                                      <img src="https://picsum.photos/50/50" className="w-10 h-10 rounded object-cover" alt="Notification content"/>
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
          <div 
            className={`hidden md:flex flex-col px-3 hover:overflow-y-auto overflow-hidden sticky top-14 h-full pb-4 transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-[#1f1f1f]
            ${isSidebarCollapsed ? 'w-20 items-center' : 'w-60'} 
            ${currentView === 'WATCH' ? 'hidden xl:flex' : ''}`}
          >
            <SidebarItem collapsed={isSidebarCollapsed} icon={<HomeIcon className="w-6 h-6" />} label="Home" active={currentView === 'HOME'} onClick={() => setCurrentView('HOME')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<StreamHubLogo className="w-6 h-6 text-red-600" />} label="Reels" active={currentView === 'REELS'} onClick={() => setCurrentView('REELS')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<LibraryIcon className="w-6 h-6" />} label="Library" active={currentView === 'LIBRARY'} onClick={() => setCurrentView('LIBRARY')} />
            
            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3 w-full"></div>
            
            <SidebarItem collapsed={isSidebarCollapsed} icon={<CheckIcon className="w-6 h-6" />} label="Your Channel" active={currentView === 'CHANNEL' && viewingChannel?.id === currentUser.id} onClick={() => handleChannelClick(currentUser)} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<HistoryIcon className="w-6 h-6" />} label="History" active={false} onClick={() => setCurrentView('LIBRARY')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<ClockIcon className="w-6 h-6"/>} label="Watch Later" active={currentView==='WATCH_LATER'} onClick={() => setCurrentView('WATCH_LATER')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<DownloadIcon className="w-6 h-6" />} label="Downloads" active={false} onClick={() => setCurrentView('LIBRARY')} />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<PlaylistIcon className="w-6 h-6" />} label="My Playlist" active={false} onClick={() => setCurrentView('LIBRARY')} />

            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3 w-full"></div>

            <div className="text-xs font-bold text-gray-500 uppercase px-3 my-2">{!isSidebarCollapsed && "Subscriptions"}</div>
            {subscriptions.map(subId => {
                const user = MOCK_USERS[subId];
                if (!user) return null;
                return <SidebarItem key={subId} collapsed={isSidebarCollapsed} icon={<img src={user.avatar} className="w-6 h-6 rounded-full" alt={user.name} />} label={user.name} active={currentView === 'CHANNEL' && viewingChannel?.id === user.id} onClick={() => handleChannelClick(user)} />;
            })}

            <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3 w-full"></div>
            
            <SidebarItem collapsed={isSidebarCollapsed} icon={<SettingsIcon className="w-6 h-6" />} label="Settings" />
            <SidebarItem collapsed={isSidebarCollapsed} icon={<QuestionMarkCircleIcon className="w-6 h-6" />} label="Send Feedback" />
</div>
          
          <div className="flex-1 overflow-y-auto">
              {currentView === 'HOME' && (
                  <div>
                      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-[#272727]">
                          {['All', 'Music', 'Gaming', 'Live', 'News', 'React', 'AI', 'Cooking', 'Travel', 'Podcasts'].map(cat => (
                              <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'}`}
                              >
                                {cat}
                              </button>
                          ))}
                      </div>
                      {filteredVideos.length > 0 ? (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                            {filteredVideos.map(video => (
                                <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer group flex flex-col gap-3 relative">
                                    <div className="aspect-video rounded-xl overflow-hidden mb-2 relative">
                                        <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt={video.title}/>
                                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>
                                        
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id); }}
                                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                                          onSaveToPlaylist={() => handleSaveToPlaylist(video)}
                                        />
                                    )}

                                    <div className="flex gap-3 items-start">
                                        <img onClick={(e) => { e.stopPropagation(); handleChannelClick(video.author); }} src={video.author.avatar} className="w-9 h-9 rounded-full" alt={video.author.name} />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug text-sm">{video.title}</h3>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                              <p className="hover:text-black dark:hover:text-white transition" onClick={(e) => { e.stopPropagation(); handleChannelClick(video.author); }}>{video.author.name}</p>
                                              <p>{video.views} views • {video.uploadedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                      ) : (
                         <div className="text-center py-20 text-gray-500">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <StreamHubLogo className="w-8 h-8 text-gray-300" />
                              </div>
                              <h3 className="text-lg font-bold mb-2 dark:text-gray-300">No videos found</h3>
                              <p className="text-sm">Try adjusting your search or filters.</p>
                          </div>
                      )}
                  </div>
              )}
              {currentView === 'REELS' && <VideoReels videos={reelsVideos} currentUser={currentUser} isMuted={isReelsMuted} toggleMute={() => setIsReelsMuted(!isReelsMuted)} onViewProfile={onViewProfile} onCreateReel={() => setCurrentView('CREATE_REEL')} onSubscribe={(id) => handleSubscribe()} />} 
              {currentView === 'CHANNEL' && viewingChannel && <ChannelPage user={viewingChannel} videos={videos} onVideoClick={handleVideoClick} currentUser={currentUser} />}
              {currentView === 'WATCH_LATER' && 
                <div>
                    <h2 className="text-2xl font-bold dark:text-white p-6 pb-0">Watch Later</h2>
                    {renderVideoList(watchLater, "Videos you save to 'Watch Later' will be shown here.")}
                </div>
              }
              {currentView === 'LIBRARY' && (
                  <div className="p-6">
                      <h2 className="text-2xl font-bold dark:text-white mb-6">Library</h2>
                      
                      <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><HistoryIcon className="w-5 h-5"/>History</h3>
                      {renderVideoList(history.slice(0, 4), "Your watch history is empty.")}
                      
                      <h3 className="text-lg font-bold dark:text-white mb-4 mt-8 flex items-center gap-2"><ClockIcon className="w-5 h-5"/>Watch Later</h3>
                      {renderVideoList(watchLater.slice(0,4), "No videos in your watch later list.")}

                      <h3 className="text-lg font-bold dark:text-white mb-4 mt-8 flex items-center gap-2"><PlaylistIcon className="w-5 h-5"/>Favorites</h3>
                      {renderVideoList(myPlaylists[0]?.videos.slice(0,4) || [], "No videos in this playlist.")}

                      <h3 className="text-lg font-bold dark:text-white mb-4 mt-8 flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Downloads</h3>
                      {renderVideoList(downloads.slice(0,4), "No downloaded videos.")}
                  </div>
              )}
              {currentView === 'WATCH' && selectedVideo && (
                  <div className="flex flex-col lg:flex-row gap-6 p-6">
                      <div className="flex-1">
                          <EnhancedVideoPlayer video={selectedVideo} autoPlay={true} onEnded={handleVideoEnd} />
                          <div className="mt-4">
                              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedVideo.title}</h1>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                      <img onClick={() => handleChannelClick(selectedVideo.author)} src={selectedVideo.author.avatar} className="w-10 h-10 rounded-full cursor-pointer" alt={selectedVideo.author.name} />
                                      <div>
                                          <div onClick={() => handleChannelClick(selectedVideo.author)} className="font-bold text-gray-900 dark:text-white cursor-pointer">{selectedVideo.author.name}</div>
                                          <div className="text-xs text-gray-500">{selectedVideo.author.subscribers || '1K'} subscribers</div>
                                      </div>
                                      <button 
                                        onClick={handleSubscribe}
                                        className={`ml-4 px-4 py-2 rounded-full font-bold text-sm transition ${isSubscribed ? 'bg-gray-200 dark:bg-[#272727]' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                                      >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                      </button>
                                      {isSubscribed && (
                                          <button onClick={() => setIsBellOn(!isBellOn)} className="p-2 bg-gray-200 dark:bg-[#272727] rounded-full">
                                            {isBellOn ? <BellRingIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                                          </button>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                      <div className="flex bg-gray-100 dark:bg-[#272727] rounded-full">
                                          <button onClick={handleLike} className={`px-4 py-2 flex items-center gap-2 rounded-l-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] ${isLiked ? 'text-blue-600' : ''}`}>
                                            <ThumbsUpIcon className="w-5 h-5" filled={isLiked} /> 
                                            <span className="text-sm font-bold">{formatCompactNumber(selectedVideo.likeCount || 0)}</span>
                                          </button>
                                          <div className="w-px bg-gray-200 dark:bg-[#3f3f3f]"></div>
                                          <button onClick={handleDislike} className={`px-4 py-2 rounded-r-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] ${isDisliked ? 'text-blue-600' : ''}`}>
                                            <ThumbsDownIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                      <button onClick={() => setSharingVideo(selectedVideo)} className="px-4 py-2 flex items-center gap-2 rounded-full bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                                        <ShareIcon className="w-5 h-5" />
                                        <span className="text-sm font-bold">{formatCompactNumber(selectedVideo.shareCount || 0)}</span>
                                      </button>
                                  </div>
                              </div>
                          </div>

                           <div className="mt-4 p-4 bg-gray-100 dark:bg-[#272727] rounded-xl cursor-pointer" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                              <p className={`text-sm text-gray-800 dark:text-gray-200 ${!descriptionExpanded && 'line-clamp-2'}`}>{selectedVideo.description}</p>
                           </div>

                           <div className="mt-6">
                              <h2 className="text-lg font-bold dark:text-white mb-4">{comments.length} Comments</h2>
                              <div className="flex gap-4 mb-6">
                                <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="My avatar"/>
                                <div className="flex-1 border-b-2 border-gray-200 dark:border-[#3f3f3f] focus-within:border-black dark:focus-within:border-white">
                                  <input 
                                    className="w-full bg-transparent outline-none pb-1 dark:text-white" 
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                  />
                                </div>
                                <button onClick={handlePostComment} disabled={!commentText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm disabled:opacity-50">Post</button>
                              </div>
                              <div className="space-y-6">
                                {comments.map(c => <VideoComment key={c.id} comment={c} onReply={handleReplyToComment} currentUser={currentUser} />)}
                              </div>
                           </div>
                      </div>
                      <div className="w-full lg:w-96 flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-gray-100 dark:bg-[#272727] p-2 rounded-lg">
                            <h3 className="font-bold text-sm dark:text-white">Up next</h3>
                            <div className="flex items-center gap-2 text-sm">
                                Autoplay
                                <div onClick={() => setAutoPlayNext(!autoPlayNext)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${autoPlayNext ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-500'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPlayNext ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                        {videos.filter(v => v.id !== selectedVideo.id).slice(0, 10).map(v => (
                          <div key={v.id} onClick={() => handleVideoClick(v)} className="flex gap-3 cursor-pointer group">
                            <div className="w-40 h-24 rounded-lg overflow-hidden relative bg-gray-200 dark:bg-[#272727]">
                                <img src={v.thumbnail} className="w-full h-full object-cover" alt={v.title} />
                                <span className="absolute bottom-1 right-1 text-xs bg-black/80 text-white px-1 rounded">{v.duration}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-500">{v.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{v.author.name}</p>
                              <p className="text-xs text-gray-500">{v.views} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
      </>
      )}
    </div>
  );
};

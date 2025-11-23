
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, UsersIcon, MicrophoneIcon, CloseIcon, BackIcon, ClockIcon, LockIcon, DocumentIcon, PhoneIcon, InfoIcon, VideoIcon, UserPlusIcon, UserMinusIcon, ExitIcon, PlayCircleIcon, DownloadIcon, PhoneOffIcon, VideoOffIcon, MicOffIcon, MicActiveIcon, ReplyIcon, TrashIcon, CopyIcon, PencilIcon, LinkIcon, UploadIcon } from './Icons';
import { MOCK_USERS } from '../services/mockData';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string, type?: 'text' | 'image' | 'video' | 'audio' | 'document', mediaUrl?: string, customId?: string, fileName?: string, fileSize?: string, replyToId?: string) => void;
  onCreateGroup: (name: string) => void;
  onAddContact: (contact: User) => void;
  isAiThinking?: boolean;
  onViewProfile: (user?: User) => void;
  selectedSessionId?: string | null;
}

// --- Socket Simulation Class ---
class MockSocket {
    private listeners: ((msg: any) => void)[] = [];

    subscribe(callback: (msg: any) => void) {
        this.listeners.push(callback);
    }

    emit(event: string, payload: any) {
        setTimeout(() => {
            if (event === 'sendMessage') {
                this.notify({ type: 'status_update', id: payload.id, status: 'sent' });
                setTimeout(() => {
                    this.notify({ type: 'status_update', id: payload.id, status: 'delivered' });
                    setTimeout(() => {
                        this.notify({ type: 'status_update', id: payload.id, status: 'read' });
                    }, 2000);
                }, 1000);
            }
        }, 300);
    }

    private notify(msg: any) {
        this.listeners.forEach(cb => cb(msg));
    }
}

const socket = new MockSocket();

const MessageStatus = ({ status }: { status?: string }) => {
    if (!status || status === 'sending') return <ClockIcon className="w-3 h-3 text-gray-400" />;
    const color = status === 'read' ? 'text-blue-500' : 'text-gray-400';
    return (
        <div className={`flex -space-x-1 ${color}`}>
            <CheckIcon className="w-3 h-3" />
            {(status === 'delivered' || status === 'read') && <CheckIcon className="w-3 h-3" />}
        </div>
    );
};

const EncryptionBadge = () => (
    <div className="flex justify-center my-4">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm max-w-[85%] text-center border border-yellow-200 dark:border-yellow-900/50">
            <LockIcon className="w-3 h-3 flex-shrink-0" />
            <span>Messages are end-to-end encrypted. No one outside of this chat, not even MyConnect, can read or listen to them.</span>
        </div>
    </div>
);

// --- Image Viewer Modal ---
const ImageViewer = ({ src, onClose }: { src: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
            <CloseIcon className="w-8 h-8" />
        </button>
        <img 
            src={src} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
        />
    </div>
);

// --- Audio Player Component ---
const AudioPlayer = ({ src }: { src: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!src) return;
        
        const audio = new Audio(src);
        audioRef.current = audio;

        const onLoadedMetadata = () => setDuration(audio.duration);
        const onTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };
        const onError = (e: Event) => {
            console.error("Audio playback error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audioRef.current = null;
        };
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(error => {
                        console.error("Audio play failed:", error);
                        setIsPlaying(false);
                    });
            }
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="flex items-center gap-3 min-w-[220px] py-2 px-1">
            <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition flex-shrink-0"
            >
                {isPlaying ? (
                    <div className="w-3 h-3 bg-current rounded-sm" /> // Pause Icon
                ) : (
                    <PlayCircleIcon className="w-6 h-6 ml-0.5" />
                )}
            </button>
            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden w-full">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-100 ease-linear" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                    <span>{isPlaying && audioRef.current ? formatTime(audioRef.current.currentTime) : formatTime(0)}</span>
                    <span>{formatTime(duration || 0)}</span>
                </div>
            </div>
            <div className="relative">
                 <MicrophoneIcon className={`w-12 h-12 text-gray-100 dark:text-gray-700 absolute -top-4 -right-2 -z-10 opacity-20`} />
            </div>
        </div>
    );
};

// --- Call Overlay Component ---
const CallOverlay = ({ 
    isActive, 
    type, 
    user, 
    onEndCall 
}: { 
    isActive: boolean, 
    type: 'audio' | 'video', 
    user: User, 
    onEndCall: () => void 
}) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [status, setStatus] = useState('Calling...');

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => setStatus('Connected'), 2000);
            const interval = setInterval(() => {
                if (status === 'Connected') setDuration(prev => prev + 1);
            }, 1000);
            return () => { clearTimeout(timer); clearInterval(interval); setDuration(0); setStatus('Calling...'); };
        }
    }, [isActive, status]);

    if (!isActive) return null;

    const formatTime = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="absolute inset-0 z-[100] bg-[#1a1a1a] flex flex-col items-center text-white animate-fade-in">
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Background Effect */}
                <div className="absolute inset-0 overflow-hidden opacity-30 blur-3xl">
                    <img src={user.avatar} className="w-full h-full object-cover" />
                </div>

                {/* User Info */}
                <div className="flex flex-col items-center z-10 relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl mb-6 relative">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                        {status === 'Calling...' && (
                            <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20"></div>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                    <p className="text-lg text-gray-400 font-medium">{status === 'Connected' ? formatTime(duration) : status}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full bg-[#222] p-8 rounded-t-[3rem] flex items-center justify-center gap-8 shadow-2xl z-20 border-t border-[#333]">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition transform active:scale-95 ${isMuted ? 'bg-white text-black' : 'bg-[#333] text-white hover:bg-[#444]'}`}
                >
                    {isMuted ? <MicOffIcon className="w-7 h-7" /> : <MicrophoneIcon className="w-7 h-7" />}
                </button>
                
                <button 
                    onClick={onEndCall}
                    className="p-5 bg-red-600 rounded-full text-white hover:bg-red-700 transition transform hover:scale-110 active:scale-90 shadow-lg shadow-red-600/30"
                >
                    <PhoneOffIcon className="w-8 h-8" />
                </button>

                {type === 'video' && (
                    <button 
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full transition transform active:scale-95 ${isVideoOff ? 'bg-white text-black' : 'bg-[#333] text-white hover:bg-[#444]'}`}
                    >
                        {isVideoOff ? <VideoOffIcon className="w-7 h-7" /> : <VideoIcon className="w-7 h-7" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Contact Modal (Add New) ---
const ContactModal = ({ 
    isOpen, 
    onClose, 
    onAdd 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onAdd: (name: string, phone: string) => void 
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white">Add New Contact</h3>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="space-y-4">
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Contact Name"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border border-transparent focus:border-blue-500"
                        autoFocus
                    />
                    <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border border-transparent focus:border-blue-500"
                    />
                    <button 
                        onClick={() => { if(name.trim()) onAdd(name, phone); }}
                        disabled={!name.trim()}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        Save Contact
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- My Profile Edit Modal ---
const MyProfileEditModal = ({
    isOpen,
    onClose,
    user,
    onSave
}: {
    isOpen: boolean,
    onClose: () => void,
    user: User,
    onSave: (u: Partial<User>) => void
}) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState(user.avatar);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAvatar(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white">Edit Profile</h3>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="flex justify-center mb-6">
                    <div className="relative group w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img src={avatar} className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border border-transparent focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">About</label>
                        <textarea 
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border border-transparent focus:border-blue-500 resize-none"
                            rows={3}
                        />
                    </div>
                    <button 
                        onClick={() => { onSave({ name, bio, avatar }); onClose(); }}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Create/Edit Group Modal ---
const GroupModal = ({ 
    isOpen, 
    onClose, 
    mode, 
    onSubmit, 
    existingMembers = [] 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    mode: 'create' | 'add_member', 
    onSubmit: (data: any) => void,
    existingMembers?: User[]
}) => {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter users for selection (exclude existing members and self)
    const availableUsers = Object.values(MOCK_USERS).filter(u => 
        !existingMembers.find(m => m.id === u.id) && 
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.handle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    const toggleUser = (user: User) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSubmit = () => {
        if (mode === 'create' && !groupName) return;
        onSubmit({ name: groupName, members: selectedUsers });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">{mode === 'create' ? 'New Group' : 'Add Members'}</h3>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                    {mode === 'create' && (
                        <div className="mb-4">
                            <input 
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="Group Subject" 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border-b-2 border-transparent focus:border-blue-500 transition"
                            />
                        </div>
                    )}

                    <div className="mb-2 relative">
                        <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search people..." 
                            className="w-full pl-10 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg outline-none dark:text-white text-sm"
                        />
                    </div>

                    <div className="space-y-2 mt-2">
                        {availableUsers.map(user => (
                            <div 
                                key={user.id} 
                                onClick={() => toggleUser(user)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${selectedUsers.find(u => u.id === user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <div className="relative">
                                    <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                    {selectedUsers.find(u => u.id === user.id) && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                                            <CheckIcon className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm dark:text-white">{user.name}</h4>
                                    <p className="text-xs text-gray-500">@{user.handle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={(mode === 'create' && !groupName) || selectedUsers.length === 0}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mode === 'create' ? 'Create Group' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- File Preview Modal ---
const FilePreviewModal = ({ 
    file, 
    url, 
    type, 
    onClose, 
    onSend 
}: { 
    file: File, 
    url: string, 
    type: 'image' | 'video' | 'document' | 'audio', 
    onClose: () => void, 
    onSend: (caption: string) => void 
}) => {
    const [caption, setCaption] = useState('');

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col justify-center items-center p-4 animate-fade-in">
            <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center w-full max-w-3xl relative">
                {type === 'image' && <img src={url} className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl" />}
                {type === 'video' && <video src={url} controls className="max-h-[70vh] max-w-full rounded-lg shadow-2xl" />}
                {type === 'audio' && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl flex flex-col items-center gap-4 w-full max-w-md">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <MicrophoneIcon className="w-12 h-12 text-gray-500" />
                        </div>
                        <audio src={url} controls className="w-full" />
                        <p className="text-gray-800 dark:text-white font-mono text-sm">{file.name}</p>
                    </div>
                )}
                {type === 'document' && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl flex flex-col items-center gap-4">
                        <DocumentIcon className="w-24 h-24 text-gray-500" />
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{file.name}</p>
                        <p className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                )}
            </div>

            <div className="w-full max-w-2xl mt-6 flex gap-4">
                <input 
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="flex-1 bg-gray-800 text-white p-4 rounded-xl outline-none focus:ring-2 ring-blue-500"
                    autoFocus
                />
                <button 
                    onClick={() => onSend(caption)} 
                    className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition shadow-lg hover:scale-105"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

// --- Main Chat Component ---
export const ChatApp: React.FC<ChatAppProps> = ({ sessions: initialSessions, currentUser, onSendMessage, onCreateGroup, onAddContact, isAiThinking, onViewProfile, selectedSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(selectedSessionId || null);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState(''); // Search inside chat
  const [filterType, setFilterType] = useState<'all' | 'groups' | 'unread' | 'docs' | 'links' | 'audio'>('all');
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, string>>({});
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef<any>(null);

  // Modals
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'add_member'>('create');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  // Call & Reply State
  const [callState, setCallState] = useState<{active: boolean, type: 'audio' | 'video'}>({ active: false, type: 'audio' });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  
  // File Preview State
  const [filePreview, setFilePreview] = useState<{ file: File, url: string, type: 'image' | 'video' | 'document' | 'audio' } | null>(null);

  // Group Editing State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupAvatar, setEditGroupAvatar] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);

  // Update sessions when prop changes
  useEffect(() => {
      setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
      if (selectedSessionId) {
          setActiveSessionId(selectedSessionId);
      }
  }, [selectedSessionId]);

  useEffect(() => {
      socket.subscribe((msg) => {
          if (msg.type === 'status_update') {
              setLocalMessageStatuses(prev => ({ ...prev, [msg.id]: msg.status }));
          }
      });
  }, []);

  useEffect(() => {
      if (!chatSearchTerm) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
  }, [activeSessionId, sessions, isAiThinking, chatSearchTerm, replyingTo]);

  // When entering chat info, prep edit state
  useEffect(() => {
      if (activeSessionId) {
          const s = sessions.find(s => s.id === activeSessionId);
          if (s && s.isGroup) {
              setEditGroupName(s.groupName || '');
              setEditGroupDesc(s.groupDescription || '');
              setEditGroupAvatar(s.groupAvatar || '');
          }
      }
  }, [activeSessionId, sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = (text: string = inputText, type: 'text' | 'image' | 'video' | 'audio' | 'document' = 'text', mediaUrl?: string, fileName?: string, fileSize?: string) => {
    if ((!text.trim() && !mediaUrl) || !activeSessionId) return;
    
    const newMsgId = `msg_${Date.now()}`;
    setLocalMessageStatuses(prev => ({ ...prev, [newMsgId]: 'sending' }));
    
    // Update local session state immediately for responsiveness
    onSendMessage(activeSessionId, text, type, mediaUrl, newMsgId, fileName, fileSize, replyingTo?.id);
    socket.emit('sendMessage', { id: newMsgId, text: text });
    
    if (type === 'text') setInputText('');
    setShowAttachments(false);
    setReplyingTo(null);
    setFilePreview(null); // Clear preview
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'audio') => {
      const file = e.target.files?.[0];
      if (file && activeSessionId) {
          const url = URL.createObjectURL(file);
          setFilePreview({ file, url, type });
      }
      // Reset input so same file can be selected again if cancelled
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreviewSend = (caption: string) => {
      if (filePreview) {
          const size = (filePreview.file.size / 1024 / 1024).toFixed(2) + ' MB';
          handleSend(caption, filePreview.type, filePreview.url, filePreview.file.name, size);
      }
  };

  const handleCreateGroupSubmit = (data: { name: string, members: User[] }) => {
      onCreateGroup(data.name);
      // Note: In a real app, we'd pass members too. Mock implementation in App.tsx handles it simply.
      setGroupModalOpen(false);
  };

  const handleAddMembersSubmit = (data: { members: User[] }) => {
      if (!activeSessionId) return;
      const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
              return {
                  ...s,
                  participants: [...(s.participants || []), ...data.members]
              };
          }
          return s;
      });
      setSessions(updatedSessions);
  };

  const handleSaveGroupInfo = () => {
      if (!activeSessionId) return;
      const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
              return {
                  ...s,
                  groupName: editGroupName,
                  groupDescription: editGroupDesc,
                  groupAvatar: editGroupAvatar
              };
          }
          return s;
      });
      setSessions(updatedSessions);
      setIsEditingGroup(false);
  };

  const handleGroupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setEditGroupAvatar(URL.createObjectURL(e.target.files[0]));
      }
  };

  const handleRemoveMember = (userId: string) => {
      if (!activeSessionId) return;
      if (!confirm("Remove this user from the group?")) return;
      const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
              return {
                  ...s,
                  participants: s.participants?.filter(p => p.id !== userId)
              };
          }
          return s;
      });
      setSessions(updatedSessions);
  };

  // Handle Voice Recording Logic
  const handleVoiceRecord = () => {
      if (isRecording) {
          // STOP Recording
          clearInterval(recordingIntervalRef.current);
          setIsRecording(false);
          setRecordingDuration(0);
          // Send a mock audio file (Reliable MP3)
          const mockAudioUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3"; 
          handleSend("", "audio", mockAudioUrl, "Voice Message", "0:15"); 
      } else {
          // START Recording
          setIsRecording(true);
          setRecordingDuration(0);
          recordingIntervalRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);
      }
  };

  const formatDuration = (sec: number) => {
      const min = Math.floor(sec / 60);
      const s = sec % 60;
      return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyMessage = (text: string) => {
      navigator.clipboard.writeText(text);
      setContextMenuMsgId(null);
  };

  const handleDeleteMessage = (msgId: string) => {
      if (!activeSessionId) return;
      const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
              return { ...s, messages: s.messages.filter(m => m.id !== msgId) };
          }
          return s;
      });
      setSessions(updatedSessions);
      setContextMenuMsgId(null);
  };

  const handleBlockOrLeave = (isGroup: boolean) => {
      if (isGroup) {
          if(confirm("Are you sure you want to leave this group?")) {
              setSessions(sessions.filter(s => s.id !== activeSessionId));
              setActiveSessionId(null);
          }
      } else {
          if(confirm("Block this contact?")) {
              alert("Contact blocked.");
          }
      }
  };

  const handleCreateContact = (name: string, phone: string) => {
      const newUser: User = {
          id: `u_${Date.now()}`,
          name: name,
          handle: phone,
          avatar: `https://ui-avatars.com/api/?name=${name.replace(' ','+')}&background=random`,
          isOnline: false,
          phoneNumber: phone
      };
      onAddContact(newUser);
      setContactModalOpen(false);
  };

  // Search & Filter Logic
  const filteredSessions = sessions.filter(s => {
      // Basic text filter for sessions
      if (['all', 'groups', 'unread'].includes(filterType)) {
          const matchesSearch = (s.isGroup ? s.groupName : s.user.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
          
          if (filterType === 'groups') return matchesSearch && s.isGroup;
          if (filterType === 'unread') return matchesSearch && s.unread > 0;
          return matchesSearch;
      }
      return true; // If filtering by content type, we handle display differently
  });

  // Global content search results
  const contentSearchResults = React.useMemo(() => {
      if (['all', 'groups', 'unread'].includes(filterType)) return null;
      
      const results: { session: ChatSession, msg: Message }[] = [];
      sessions.forEach(s => {
          s.messages.forEach(m => {
              let match = false;
              if (filterType === 'docs' && m.type === 'document') match = true;
              if (filterType === 'audio' && m.type === 'audio') match = true;
              if (filterType === 'links' && (m.text.includes('http') || m.text.includes('www'))) match = true;
              
              if (match && (!searchTerm || m.text.toLowerCase().includes(searchTerm.toLowerCase()) || m.fileName?.toLowerCase().includes(searchTerm.toLowerCase()))) {
                  results.push({ session: s, msg: m });
              }
          });
      });
      return results;
  }, [sessions, filterType, searchTerm]);


  const renderMessageBubble = (msg: Message) => {
      const isMe = msg.senderId === currentUser.id;
      const isContextOpen = contextMenuMsgId === msg.id;
      const isHighlighted = chatSearchTerm && msg.text.toLowerCase().includes(chatSearchTerm.toLowerCase());
      
      // Resolve replying to message
      const repliedMsg = activeSession?.messages.find(m => m.id === msg.replyToId);

      return (
          <div className={`max-w-[80%] relative group ${isHighlighted ? 'opacity-100' : (chatSearchTerm ? 'opacity-30' : 'opacity-100')}`} id={msg.id}>
              {/* Context Menu Trigger */}
              <button 
                  onClick={(e) => { e.stopPropagation(); setContextMenuMsgId(isContextOpen ? null : msg.id); }}
                  className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition`}
              >
                  <div className="rotate-90"><MenuIcon className="w-4 h-4" /></div>
              </button>

              {/* Context Menu */}
              {isContextOpen && (
                  <div className={`absolute top-6 ${isMe ? 'right-0' : 'left-0'} z-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 py-1 min-w-[120px] animate-fade-in`}>
                      <button onClick={() => { setReplyingTo(msg); setContextMenuMsgId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                          <ReplyIcon className="w-4 h-4" /> Reply
                      </button>
                      <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                          <CopyIcon className="w-4 h-4" /> Copy
                      </button>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2">
                          <TrashIcon className="w-4 h-4" /> Delete
                      </button>
                  </div>
              )}

              <div className={`rounded-lg px-3 py-2 shadow-md text-sm mb-1 relative ${isMe ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-black dark:text-white rounded-tl-none'}`}>
                  {/* Reply Context Bubble */}
                  {repliedMsg && (
                      <div 
                        onClick={() => document.getElementById(repliedMsg.id)?.scrollIntoView({behavior: 'smooth', block: 'center'})}
                        className={`mb-2 rounded-md p-2 text-xs border-l-4 border-blue-500 bg-black/5 dark:bg-black/20 opacity-80 flex flex-col cursor-pointer hover:opacity-100 transition`}
                      >
                          <span className="font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                              {repliedMsg.senderId === currentUser.id ? 'You' : (activeSession?.participants?.find(p => p.id === repliedMsg.senderId)?.name || 'User')}
                          </span>
                          <span className="truncate">{repliedMsg.type === 'text' ? repliedMsg.text : `[${repliedMsg.type}]`}</span>
                      </div>
                  )}

                  {/* Image/Video */}
                  {(msg.type === 'image' || msg.type === 'video') && msg.mediaUrl && (
                      <div className="mb-1">
                          {msg.type === 'image' ? (
                              <img 
                                src={msg.mediaUrl} 
                                className="rounded-lg max-h-60 object-cover w-full cursor-pointer" 
                                onClick={() => setViewingImage(msg.mediaUrl || '')}
                              />
                          ) : (
                              <video src={msg.mediaUrl} controls className="rounded-lg max-h-60 w-full" />
                          )}
                      </div>
                  )}

                  {/* Audio */}
                  {msg.type === 'audio' && msg.mediaUrl && (
                      <AudioPlayer src={msg.mediaUrl} />
                  )}

                  {/* Document */}
                  {msg.type === 'document' && (
                      <div className="flex items-center gap-3 bg-black/5 dark:bg-white/10 p-2 rounded-lg mb-1 cursor-pointer hover:bg-black/10 transition">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-500">
                              <DocumentIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="font-bold truncate text-sm">{msg.fileName || 'Document'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{msg.fileSize || 'PDF'}</p>
                          </div>
                          <a 
                            href={msg.mediaUrl} 
                            download={msg.fileName || 'document'}
                            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                              <DownloadIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                          </a>
                      </div>
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.type !== 'audio' && msg.type !== 'document' ? msg.text : (msg.text && msg.text !== msg.fileName ? msg.text : '')}</p>
                  
                  <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] opacity-70 min-w-[45px] text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isMe && <MessageStatus status={localMessageStatuses[msg.id] || msg.status} />}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mx-auto max-w-[1600px] transition-colors pb-16 md:pb-0 relative" onClick={() => setContextMenuMsgId(null)}>
      <GroupModal 
        isOpen={groupModalOpen} 
        onClose={() => setGroupModalOpen(false)} 
        mode={groupModalMode} 
        onSubmit={groupModalMode === 'create' ? handleCreateGroupSubmit : handleAddMembersSubmit}
        existingMembers={activeSession?.participants}
      />

      <ContactModal 
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onAdd={handleCreateContact}
      />

      <MyProfileEditModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser}
        onSave={(updated) => {
            console.log("Updating user", updated);
        }}
      />

      {viewingImage && <ImageViewer src={viewingImage} onClose={() => setViewingImage(null)} />}

      {filePreview && (
          <FilePreviewModal 
              file={filePreview.file}
              url={filePreview.url}
              type={filePreview.type}
              onClose={() => { setFilePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
              onSend={handlePreviewSend}
          />
      )}

      <input type="file" ref={fileInputRef} className="hidden" />

      {activeSession && (
          <CallOverlay 
            isActive={callState.active} 
            type={callState.type} 
            user={activeSession.isGroup ? { name: activeSession.groupName, avatar: activeSession.groupAvatar } as User : activeSession.user}
            onEndCall={() => setCallState({ ...callState, active: false })}
          />
      )}

      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setProfileModalOpen(true)}>
                <img src={currentUser.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80 transition" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setContactModalOpen(true)} 
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" 
                    title="New Contact"
                >
                   <UserPlusIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => { setGroupModalMode('create'); setGroupModalOpen(true); }} 
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" 
                    title="New Group"
                >
                   <UsersIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="p-3 space-y-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-3 py-2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search or start new chat" 
                    className="bg-transparent border-none outline-none text-sm ml-2 w-full dark:text-white" 
                />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Unread', 'Groups', 'Docs', 'Links', 'Audio'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilterType(f.toLowerCase() as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${filterType === f.toLowerCase() ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
            {contentSearchResults ? (
                <div className="p-2 space-y-2">
                    <div className="px-2 text-xs font-bold text-gray-500 uppercase mb-2">Found Messages</div>
                    {contentSearchResults.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setActiveSessionId(item.session.id)}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer flex gap-3"
                        >
                            <img src={item.session.isGroup ? item.session.groupAvatar : item.session.user.avatar} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-sm dark:text-white">{item.session.isGroup ? item.session.groupName : item.session.user.name}</h4>
                                    <span className="text-xs text-gray-400">{new Date(item.msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{item.msg.text || item.msg.fileName || 'Media'}</p>
                            </div>
                        </div>
                    ))}
                    {contentSearchResults.length === 0 && <div className="text-center text-gray-500 text-sm mt-10">No results found.</div>}
                </div>
            ) : (
                filteredSessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${activeSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-green-500' : 'border-l-4 border-transparent'}`}
                    >
                        <div className="relative">
                            <img src={session.isGroup ? session.groupAvatar : session.user.avatar} className="w-12 h-12 rounded-full object-cover" />
                            {session.user.isOnline && !session.isGroup && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                        </div>
                        <div className="flex-1 border-b border-gray-50 dark:border-gray-800 pb-3 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{session.isGroup ? session.groupName : session.user.name}</h3>
                                <span className="text-xs text-gray-400 flex-shrink-0">{session.timestamp}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{session.lastMessage}</p>
                                {session.unread > 0 && (
                                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{session.unread}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#efeae2] dark:bg-[#0b141a] relative`}>
        {activeSession ? (
          <>
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden"><BackIcon className="w-6 h-6 dark:text-white" /></button>
              <div className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-lg transition" onClick={() => setShowChatInfo(true)}>
                  <img src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{activeSession.isGroup ? activeSession.groupName : activeSession.user.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                        {activeSession.isGroup 
                            ? activeSession.participants?.map(p => p.name.split(' ')[0]).join(', ') 
                            : (activeSession.user.isOnline ? 'Online' : 'Click for info')}
                    </p>
                  </div>
              </div>
              <div className="flex gap-3 md:gap-5 text-gray-500 dark:text-gray-300 items-center">
                  {chatSearchTerm ? (
                      <div className="bg-white dark:bg-gray-800 flex items-center rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700">
                          <input 
                            autoFocus
                            value={chatSearchTerm}
                            onChange={e => setChatSearchTerm(e.target.value)}
                            className="bg-transparent text-sm outline-none w-24 dark:text-white"
                            placeholder="Search..."
                          />
                          <button onClick={() => setChatSearchTerm('')}><CloseIcon className="w-4 h-4" /></button>
                      </div>
                  ) : (
                      <button onClick={() => setChatSearchTerm(' ')} title="Search in chat"><SearchIcon className="w-5 h-5" /></button>
                  )}
                  <button onClick={() => setCallState({active: true, type: 'video'})} title="Video Call"><VideoIcon className="w-5 h-5" /></button>
                  <button onClick={() => setCallState({active: true, type: 'audio'})} title="Voice Call"><PhoneIcon className="w-5 h-5" /></button>
                  <button onClick={() => setShowChatInfo(!showChatInfo)} title="Info"><InfoIcon className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-90">
              <EncryptionBadge />
              
              {activeSession.messages.map((msg, i) => {
                  const prevMsg = activeSession.messages[i - 1];
                  const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                  
                  return (
                      <div key={msg.id}>
                          {showDate && (
                              <div className="flex justify-center my-4 sticky top-2 z-10">
                                  <span className="bg-gray-200 dark:bg-gray-800 text-xs px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm font-medium">
                                      {new Date(msg.timestamp).toDateString()}
                                  </span>
                              </div>
                          )}
                          <div className={`flex mb-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                              {renderMessageBubble(msg)}
                          </div>
                      </div>
                  );
              })}
              {isAiThinking && activeSession.user.id === 'u3' && <div className="text-gray-500 text-xs italic ml-4 animate-pulse">AI is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
                <div className="bg-gray-100 dark:bg-gray-800 p-2 px-4 flex justify-between items-center border-l-4 border-blue-500 mx-2 mt-2 rounded-r-lg shadow-inner">
                    <div className="flex flex-col max-w-[90%]">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                            Replying to {replyingTo.senderId === currentUser.id ? 'Yourself' : (activeSession.participants?.find(p => p.id === replyingTo.senderId)?.name || 'User')}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {replyingTo.type === 'text' ? replyingTo.text : `[${replyingTo.type}]`}
                        </span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <CloseIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            )}

            {/* Footer Input */}
            <div className="p-2 bg-gray-50 dark:bg-gray-900 flex items-end gap-2 border-t border-gray-200 dark:border-gray-800">
               <div className="relative">
                   <button onClick={() => setShowAttachments(!showAttachments)} className={`p-3 mb-1 rounded-full transition ${showAttachments ? 'bg-gray-200 dark:bg-gray-700 rotate-45' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                       <PlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                   </button>
                   
                   {showAttachments && (
                       <div className="absolute bottom-16 left-0 flex flex-col gap-3 animate-slide-up z-20">
                           {[
                               { icon: <DocumentIcon className="w-5 h-5" />, bg: 'bg-purple-500', label: 'Document', type: 'document' },
                               { icon: <CameraIcon className="w-5 h-5" />, bg: 'bg-red-500', label: 'Camera', type: 'image' },
                               { icon: <VideoIcon className="w-5 h-5" />, bg: 'bg-pink-500', label: 'Gallery', type: 'video' },
                               { icon: <PlayCircleIcon className="w-5 h-5" />, bg: 'bg-orange-500', label: 'Audio', type: 'audio' },
                           ].map((item) => (
                               <button 
                                    key={item.label}
                                    onClick={() => { 
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = item.type === 'document' ? '*/*' : `${item.type}/*`;
                                            fileInputRef.current.onchange = (e) => handleFileUpload(e as any, item.type as any);
                                            fileInputRef.current.click();
                                        }
                                    }}
                                    className="flex items-center gap-3 group"
                               >
                                   <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${item.bg} hover:scale-110 transition`}>
                                       {item.icon}
                                   </div>
                                   <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs shadow opacity-0 group-hover:opacity-100 transition dark:text-white font-bold">{item.label}</span>
                                </button>
                           ))}
                       </div>
                   )}
               </div>

               <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-700 transition flex items-center mb-1">
                   {isRecording ? (
                       <div className="flex-1 flex items-center gap-2 text-red-500 font-mono">
                           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                           {formatDuration(recordingDuration)}
                           <span className="text-gray-400 text-xs ml-2">Release to send</span>
                       </div>
                   ) : (
                       <input 
                         type="text" 
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                         placeholder="Type a message"
                         className="flex-1 bg-transparent outline-none dark:text-white max-h-32 overflow-y-auto py-1"
                       />
                   )}
               </div>

               <button 
                    onMouseDown={!inputText ? handleVoiceRecord : undefined}
                    onMouseUp={!inputText && isRecording ? handleVoiceRecord : undefined}
                    onClick={inputText ? () => handleSend() : undefined}
                    // Touch support for mobile
                    onTouchStart={!inputText ? handleVoiceRecord : undefined}
                    onTouchEnd={!inputText && isRecording ? handleVoiceRecord : undefined}
                    className={`p-3 rounded-full shadow-md mb-1 transition-all active:scale-95 flex items-center justify-center ${inputText || isRecording ? 'bg-[#00a884] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-white'}`}
               >
                   {inputText ? <SendIcon className="w-5 h-5" /> : (isRecording ? <SendIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />)}
               </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <ChatIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-light text-gray-700 dark:text-gray-300">MyConnect Web</h2>
              <p className="mt-4 text-sm text-gray-400 max-w-md text-center leading-relaxed">
                  Send and receive messages without keeping your phone online.<br/>
                  Use MyConnect on up to 4 linked devices and 1 phone.
              </p>
              <EncryptionBadge />
          </div>
        )}
      </div>

      {/* Right Info Panel (Conditional) */}
      {showChatInfo && activeSession && (
          <div className="w-full md:w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute inset-0 md:relative z-20 flex flex-col h-full overflow-y-auto animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                  <button onClick={() => setShowChatInfo(false)} className="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded-full"><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                  <h3 className="font-bold dark:text-white text-lg">{activeSession.isGroup ? 'Group Info' : 'Contact Info'}</h3>
              </div>

              <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="relative group">
                      <img 
                        src={isEditingGroup ? editGroupAvatar : (activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar)} 
                        className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-gray-100 dark:border-gray-800" 
                      />
                      {isEditingGroup && activeSession.isGroup && (
                          <>
                            <div 
                                onClick={() => groupAvatarInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition mb-4"
                            >
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" ref={groupAvatarInputRef} className="hidden" accept="image/*" onChange={handleGroupAvatarChange} />
                          </>
                      )}
                  </div>

                  {isEditingGroup ? (
                      <div className="w-full space-y-2">
                          <input 
                            value={editGroupName} 
                            onChange={(e) => setEditGroupName(e.target.value)} 
                            className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded border border-blue-500 outline-none text-center font-bold text-xl dark:text-white"
                          />
                      </div>
                  ) : (
                      <h2 className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                          {activeSession.isGroup ? activeSession.groupName : activeSession.user.name}
                          {activeSession.isGroup && activeSession.admins?.includes(currentUser.id) && (
                              <button onClick={() => setIsEditingGroup(true)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                          )}
                      </h2>
                  )}
                  <p className="text-gray-500 text-lg mt-2 font-mono">
                      {activeSession.isGroup 
                        ? `Group • ${activeSession.participants?.length} participants` 
                        : activeSession.user.phoneNumber || '+1 (555) 019-2834'}
                  </p>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">About</span>
                      {isEditingGroup ? (
                          <textarea 
                            value={editGroupDesc} 
                            onChange={(e) => setEditGroupDesc(e.target.value)} 
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded border border-blue-500 outline-none text-sm resize-none dark:text-white"
                            rows={3}
                          />
                      ) : (
                          <p className="text-sm dark:text-gray-300 leading-relaxed">{activeSession.isGroup ? activeSession.groupDescription || "No description" : activeSession.user.bio || "Available"}</p>
                      )}
                  </div>
                  
                  {isEditingGroup && (
                      <div className="flex gap-2">
                          <button onClick={handleSaveGroupInfo} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
                          <button onClick={() => setIsEditingGroup(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg font-bold text-sm">Cancel</button>
                      </div>
                  )}

                  {!activeSession.isGroup && (
                      <div className="flex flex-col gap-2 pt-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Media, Links and Docs</span>
                          <div className="flex gap-2 mt-1 overflow-hidden rounded-lg">
                              {[1,2,3].map(i => <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0"></div>)}
                              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 font-bold">+12</div>
                          </div>
                      </div>
                  )}
              </div>

              {activeSession.isGroup && (
                  <div className="flex-1 p-0">
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{activeSession.participants?.length} Participants</span>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://myconnect.app/join/${activeSession.id}`);
                                    alert("Group invite link copied!");
                                }} 
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
                                title="Copy Invite Link"
                              >
                                  <LinkIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setGroupModalMode('add_member'); setGroupModalOpen(true); }} className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition">
                                  <UserPlusIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {activeSession.participants?.map(p => (
                              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition" onClick={() => onViewProfile(p)}>
                                  <img src={p.avatar} className="w-10 h-10 rounded-full object-cover" />
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold dark:text-white truncate">{p.id === currentUser.id ? 'You' : p.name}</h4>
                                      <p className="text-xs text-gray-500 truncate">{p.handle}</p>
                                  </div>
                                  {activeSession.admins?.includes(p.id) && <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded border border-green-200 dark:border-green-900">Admin</span>}
                                  
                                  {activeSession.admins?.includes(currentUser.id) && p.id !== currentUser.id && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(p.id); }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                        title="Remove"
                                      >
                                          <UserMinusIcon className="w-4 h-4" />
                                      </button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800 space-y-2 bg-white dark:bg-gray-900">
                  {activeSession.isGroup ? (
                      <button 
                        onClick={() => handleBlockOrLeave(true)}
                        className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition"
                      >
                          <ExitIcon className="w-5 h-5" /> Exit Group
                      </button>
                  ) : (
                      <button 
                        onClick={() => handleBlockOrLeave(false)}
                        className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition"
                      >
                          <ExitIcon className="w-5 h-5" /> Block {activeSession.user.name}
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

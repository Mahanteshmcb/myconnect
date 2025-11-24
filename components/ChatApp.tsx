import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, UsersIcon, MicrophoneIcon, CloseIcon, BackIcon, ClockIcon, LockIcon, DocumentIcon, PhoneIcon, InfoIcon, VideoIcon, UserPlusIcon, UserMinusIcon, ExitIcon, PlayCircleIcon, DownloadIcon, PhoneOffIcon, VideoOffIcon, MicOffIcon, MicActiveIcon, ReplyIcon, TrashIcon, CopyIcon, PencilIcon, LinkIcon, UploadIcon, ShieldCheckIcon, MoreVerticalIcon } from './Icons';
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
  onUpdateGroup?: (sessionId: string, updates: Partial<ChatSession>) => void;
  onLeaveChat?: (sessionId: string) => void;
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-yellow-100 dark:border-yellow-900/30 backdrop-blur-sm">
            <LockIcon className="w-3 h-3 flex-shrink-0" />
            <span>End-to-end encrypted. Only participants can read this.</span>
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
        <div className="flex items-center gap-3 min-w-[240px] py-2 px-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl backdrop-blur-sm">
            <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-600 transition flex-shrink-0"
            >
                {isPlaying ? (
                    <div className="w-3 h-3 bg-white rounded-sm" /> 
                ) : (
                    <PlayCircleIcon className="w-6 h-6 ml-0.5" />
                )}
            </button>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden w-full cursor-pointer">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-100 ease-linear" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-300 font-mono font-bold">
                    <span>{isPlaying && audioRef.current ? formatTime(audioRef.current.currentTime) : formatTime(0)}</span>
                    <span>{formatTime(duration || 0)}</span>
                </div>
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
        <div className="absolute inset-0 z-[100] bg-[#1a1a1a] flex flex-col items-center text-white animate-fade-in overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <img src={user.avatar} className="w-full h-full object-cover blur-3xl scale-125" />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
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
            <div className="w-full bg-black/30 backdrop-blur-xl p-8 rounded-t-[3rem] flex items-center justify-center gap-8 shadow-2xl z-20 border-t border-white/10">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition transform active:scale-95 ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
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
                        className={`p-4 rounded-full transition transform active:scale-95 ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isVideoOff ? <VideoOffIcon className="w-7 h-7" /> : <VideoIcon className="w-7 h-7" />}
                    </button>
                )}
                 {type === 'audio' && <div className="w-[68px]"></div>}
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
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 animate-slide-up border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-xl dark:text-white">New Contact</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Name</label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition font-medium"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Phone</label>
                        <input 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition font-medium"
                        />
                    </div>
                    <button 
                        onClick={() => { if(name.trim()) onAdd(name, phone); }}
                        disabled={!name.trim()}
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-80 disabled:opacity-50 transition shadow-lg active:scale-95"
                    >
                        Save Contact
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
        setGroupName('');
        setSelectedUsers([]);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-extrabold text-xl dark:text-white">{mode === 'create' ? 'Create New Group' : 'Add Participants'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                    {mode === 'create' && (
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                    <CameraIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <input 
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    placeholder="Group Name" 
                                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {/* Selected Chips */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
                                    <img src={u.avatar} className="w-4 h-4 rounded-full" />
                                    {u.name.split(' ')[0]}
                                    <button onClick={(e) => { e.stopPropagation(); toggleUser(u); }}><CloseIcon className="w-3 h-3 hover:text-blue-900" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mb-4 relative">
                        <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search people to add..." 
                            className="w-full pl-10 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none dark:text-white text-sm font-medium transition focus:bg-white dark:focus:bg-black focus:ring-2 ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        {availableUsers.map(user => {
                            const isSelected = !!selectedUsers.find(u => u.id === user.id);
                            return (
                                <div 
                                    key={user.id} 
                                    onClick={() => toggleUser(user)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900 animate-bounce-short">
                                                <CheckIcon className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'dark:text-white'}`}>{user.name}</h4>
                                        <p className="text-xs text-gray-500">@{user.handle}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {availableUsers.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">No more contacts found.</div>}
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={handleSubmit}
                        disabled={(mode === 'create' && !groupName) || selectedUsers.length === 0}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition active:scale-95"
                    >
                        {mode === 'create' ? `Create Group (${selectedUsers.length})` : `Add ${selectedUsers.length} Members`}
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
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center p-4 animate-fade-in">
            <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center w-full max-w-3xl relative p-4">
                {type === 'image' && <img src={url} className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl" />}
                {type === 'video' && <video src={url} controls className="max-h-[60vh] max-w-full rounded-xl shadow-2xl" />}
                {type === 'audio' && (
                    <div className="bg-gray-900 p-8 rounded-3xl flex flex-col items-center gap-6 w-full max-w-md border border-gray-800">
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <MicrophoneIcon className="w-10 h-10 text-blue-500" />
                        </div>
                        <audio src={url} controls className="w-full accent-blue-500" />
                        <p className="text-white font-mono text-sm opacity-70">{file.name}</p>
                    </div>
                )}
                {type === 'document' && (
                    <div className="bg-gray-900 p-8 rounded-3xl flex flex-col items-center gap-6 border border-gray-800">
                        <DocumentIcon className="w-24 h-24 text-gray-500" />
                        <div className="text-center">
                            <p className="text-xl font-bold text-white mb-1">{file.name}</p>
                            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full max-w-xl mb-8 flex gap-3">
                <input 
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="flex-1 bg-gray-800 text-white p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition placeholder-gray-500"
                    autoFocus
                />
                <button 
                    onClick={() => onSend(caption)} 
                    className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition shadow-lg hover:scale-105 flex items-center justify-center aspect-square"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

// --- Main Chat Component ---
export const ChatApp: React.FC<ChatAppProps> = ({ sessions: initialSessions, currentUser, onSendMessage, onCreateGroup, onAddContact, isAiThinking, onViewProfile, selectedSessionId, onUpdateGroup, onLeaveChat }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(selectedSessionId || null);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'groups' | 'unread' | 'docs' | 'links' | 'audio'>('all');
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, string>>({});
  const [activeMemberMenuId, setActiveMemberMenuId] = useState<string | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef<any>(null);

  // Modals
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'add_member'>('create');
  const [contactModalOpen, setContactModalOpen] = useState(false);
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
    
    onSendMessage(activeSessionId, text, type, mediaUrl, newMsgId, fileName, fileSize, replyingTo?.id);
    socket.emit('sendMessage', { id: newMsgId, text: text });
    
    if (type === 'text') setInputText('');
    setShowAttachments(false);
    setReplyingTo(null);
    setFilePreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'audio') => {
      const file = e.target.files?.[0];
      if (file && activeSessionId) {
          const url = URL.createObjectURL(file);
          setFilePreview({ file, url, type });
      }
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
      setGroupModalOpen(false);
  };

  const handleAddMembersSubmit = (data: { members: User[] }) => {
      if (!activeSessionId || !activeSession) return;
      
      // Only add members that aren't already in
      const currentIds = activeSession.participants?.map(p => p.id) || [];
      const newMembers = data.members.filter(m => !currentIds.includes(m.id));
      
      if (newMembers.length > 0 && onUpdateGroup) {
          onUpdateGroup(activeSessionId, {
              participants: [...(activeSession.participants || []), ...newMembers]
          });
      }
      setGroupModalOpen(false);
  };

  const handleSaveGroupInfo = () => {
      if (!activeSessionId) return;
      if (onUpdateGroup) {
          onUpdateGroup(activeSessionId, {
              groupName: editGroupName,
              groupDescription: editGroupDesc,
              groupAvatar: editGroupAvatar
          });
      }
      setIsEditingGroup(false);
  };

  const handleGroupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setEditGroupAvatar(URL.createObjectURL(e.target.files[0]));
      }
  };

  const handleRemoveMember = (userId: string) => {
      if (!activeSessionId || !activeSession) return;
      
      if (onUpdateGroup) {
          const newParticipants = activeSession.participants?.filter(p => p.id !== userId) || [];
          const newAdmins = activeSession.admins?.filter(id => id !== userId) || []; // Remove admin rights if removed
          
          onUpdateGroup(activeSessionId, {
              participants: newParticipants,
              admins: newAdmins
          });
      }
  };

  const handleToggleAdmin = (userId: string) => {
      if (!activeSessionId || !activeSession) return;
      const isAdmin = activeSession.admins?.includes(userId);
      
      if (onUpdateGroup) {
          let newAdmins = activeSession.admins || [];
          if (isAdmin) {
              newAdmins = newAdmins.filter(id => id !== userId);
          } else {
              newAdmins = [...newAdmins, userId];
          }
          onUpdateGroup(activeSessionId, { admins: newAdmins });
      }
  };

  const handleVoiceRecord = () => {
      if (isRecording) {
          clearInterval(recordingIntervalRef.current);
          setIsRecording(false);
          setRecordingDuration(0);
          const mockAudioUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3"; 
          handleSend("", "audio", mockAudioUrl, "Voice Message", "0:15"); 
      } else {
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
              if (onLeaveChat && activeSessionId) {
                  onLeaveChat(activeSessionId);
                  setActiveSessionId(null);
              }
          }
      } else {
          if(confirm("Block this contact?")) {
              if (onLeaveChat && activeSessionId) {
                  onLeaveChat(activeSessionId);
                  setActiveSessionId(null);
              }
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

  const filteredSessions = sessions.filter(s => {
      if (['all', 'groups', 'unread'].includes(filterType)) {
          const matchesSearch = (s.isGroup ? s.groupName : s.user.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
          
          if (filterType === 'groups') return matchesSearch && s.isGroup;
          if (filterType === 'unread') return matchesSearch && s.unread > 0;
          return matchesSearch;
      }
      return true;
  });

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
      const repliedMsg = activeSession?.messages.find(m => m.id === msg.replyToId);
      const hasMedia = (msg.type === 'image' || msg.type === 'video') && msg.mediaUrl;

      // Dynamic classes based on content type
      let containerClasses = `max-w-[80%] relative group ${isHighlighted ? 'opacity-100' : (chatSearchTerm ? 'opacity-30' : 'opacity-100')}`;
      
      let bubbleClasses = `relative shadow-sm text-sm mb-1.5 border border-transparent `;
      
      if (hasMedia) {
          // Media specific styling (Transparent)
          bubbleClasses += "bg-transparent p-0 shadow-none border-none"; 
      } else {
          // Text/Doc/Audio styling (Standard)
          bubbleClasses += `rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border-gray-100 dark:border-gray-700'}`;
      }

      return (
          <div className={containerClasses} id={msg.id}>
              <button 
                  onClick={(e) => { e.stopPropagation(); setContextMenuMsgId(isContextOpen ? null : msg.id); }}
                  className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition`}
              >
                  <div className="rotate-90"><MenuIcon className="w-4 h-4" /></div>
              </button>

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

              <div className={bubbleClasses}>
                  {/* Reply context specifically for media messages (above the image) */}
                  {repliedMsg && hasMedia && (
                      <div 
                        onClick={() => document.getElementById(repliedMsg.id)?.scrollIntoView({behavior: 'smooth', block: 'center'})}
                        className={`mb-1 rounded-xl p-2 text-xs border-l-4 shadow-sm cursor-pointer hover:opacity-90 transition ${isMe ? 'bg-blue-600 text-white border-white/50' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-blue-500'}`}
                      >
                          <span className="font-bold mb-0.5 block">Replying to {repliedMsg.senderId === currentUser.id ? 'You' : (activeSession?.participants?.find(p => p.id === repliedMsg.senderId)?.name || 'User')}</span>
                          <span className="truncate block">{repliedMsg.type === 'text' ? repliedMsg.text : `[${repliedMsg.type}]`}</span>
                      </div>
                  )}

                  {/* If Media, render it directly in the transparent container */}
                  {hasMedia && (
                      <div className="mb-1">
                          {msg.type === 'image' ? (
                              <img 
                                src={msg.mediaUrl} 
                                className={`rounded-2xl max-h-72 object-cover w-full cursor-pointer hover:brightness-90 transition ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`} 
                                onClick={() => setViewingImage(msg.mediaUrl || '')}
                              />
                          ) : (
                              <video src={msg.mediaUrl} controls className={`rounded-2xl max-h-72 w-full ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                          )}
                      </div>
                  )}

                  {/* If Text exists with media, it needs its own bubble now because the parent is transparent */}
                  {msg.text && hasMedia && (
                      <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'}`}>
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                      </div>
                  )}

                  {/* Standard Text Only Message */}
                  {!hasMedia && (
                      <>
                          {repliedMsg && (
                              <div 
                                onClick={() => document.getElementById(repliedMsg.id)?.scrollIntoView({behavior: 'smooth', block: 'center'})}
                                className={`mb-2 rounded-lg p-2 text-xs border-l-4 ${isMe ? 'border-white/50 bg-white/10' : 'border-blue-500 bg-gray-100 dark:bg-gray-700'} opacity-90 flex flex-col cursor-pointer hover:opacity-100 transition`}
                              >
                                  <span className={`font-bold mb-0.5 ${isMe ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                                      {repliedMsg.senderId === currentUser.id ? 'You' : (activeSession?.participants?.find(p => p.id === repliedMsg.senderId)?.name || 'User')}
                                  </span>
                                  <span className="truncate">{repliedMsg.type === 'text' ? repliedMsg.text : `[${repliedMsg.type}]`}</span>
                              </div>
                          )}
                          {msg.type === 'audio' && msg.mediaUrl && (
                              <div className={isMe ? 'brightness-200 contrast-125' : ''}>
                                  <AudioPlayer src={msg.mediaUrl} />
                              </div>
                          )}
                          {msg.type === 'document' && (
                              <div className={`flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer transition ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-500">
                                      <DocumentIcon className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                      <p className="font-bold truncate text-sm">{msg.fileName || 'Document'}</p>
                                      <p className={`text-xs uppercase ${isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{msg.fileSize || 'FILE'}</p>
                                  </div>
                                  <a 
                                    href={msg.mediaUrl} 
                                    download={msg.fileName || 'document'}
                                    className={`p-2 rounded-full ${isMe ? 'hover:bg-white/20' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                      <DownloadIcon className="w-5 h-5" />
                                  </a>
                              </div>
                          )}
                          
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.type !== 'audio' && msg.type !== 'document' ? msg.text : (msg.text && msg.text !== msg.fileName ? msg.text : '')}</p>
                      </>
                  )}
                  
                  <div className={`flex justify-end items-center gap-1 mt-1 ${hasMedia && !msg.text ? 'mr-1' : ''}`}>
                      <span className={`text-[10px] min-w-[45px] text-right font-medium ${hasMedia && !msg.text ? (isMe ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500') : (isMe ? 'text-blue-100' : 'text-gray-400')}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isMe && <MessageStatus status={localMessageStatuses[msg.id] || msg.status} />}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#0f0f0f] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f] shadow-lg mx-auto max-w-[1600px] transition-colors pb-16 md:pb-0 relative" onClick={() => { setContextMenuMsgId(null); setActiveMemberMenuId(null); }}>
      
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
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-[#1f1f1f] flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'} bg-white dark:bg-[#0f0f0f]`}>
        <div className="p-5 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Chats</h2>
            <div className="flex gap-2">
                <button onClick={() => setContactModalOpen(true)} className="p-2.5 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] rounded-full transition" title="New Contact"><UserPlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" /></button>
                <button onClick={() => { setGroupModalMode('create'); setGroupModalOpen(true); }} className="p-2.5 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] rounded-full transition" title="New Group"><UsersIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" /></button>
            </div>
        </div>
        
        <div className="px-5 pb-3 space-y-3">
            <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-xl flex items-center px-4 py-2.5 transition-all focus-within:ring-2 ring-blue-500/50">
                <SearchIcon className="w-4 h-4 text-gray-400" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-3 w-full dark:text-white font-medium" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['All', 'Unread', 'Groups', 'Docs'].map(f => (
                    <button key={f} onClick={() => setFilterType(f.toLowerCase() as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${filterType === f.toLowerCase() ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400'}`}>{f}</button>
                ))}
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
            {contentSearchResults ? (
                <div className="p-2 space-y-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Found Messages</div>
                    {contentSearchResults.map((item, idx) => (
                        <div key={idx} onClick={() => setActiveSessionId(item.session.id)} className="p-3 mx-2 hover:bg-gray-100 dark:hover:bg-[#1f1f1f] rounded-xl cursor-pointer flex gap-4 items-center">
                            <img src={item.session.isGroup ? item.session.groupAvatar : item.session.user.avatar} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-0.5">
                                    <h4 className="font-bold text-sm dark:text-white">{item.session.isGroup ? item.session.groupName : item.session.user.name}</h4>
                                    <span className="text-[10px] text-gray-400">{new Date(item.msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate font-medium">{item.msg.text || item.msg.fileName || 'Media'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                filteredSessions.map(session => (
                    <div key={session.id} onClick={() => setActiveSessionId(session.id)} className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#161616] transition border-l-4 ${activeSessionId === session.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent'}`}>
                        <div className="relative">
                            <img src={session.isGroup ? session.groupAvatar : session.user.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                            {session.user.isOnline && !session.isGroup && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#0f0f0f]"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-bold text-sm truncate ${activeSessionId === session.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{session.isGroup ? session.groupName : session.user.name}</h3>
                                <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">{session.timestamp}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{session.lastMessage}</p>
                                {session.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm shadow-blue-500/30">{session.unread}</span>}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#f0f2f5] dark:bg-[#050505] relative`}>
        {activeSession ? (
          <>
            <div className="px-6 py-3 bg-white/80 dark:bg-[#0f0f0f]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#1f1f1f] flex items-center gap-4 shadow-sm z-10 sticky top-0">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#222]"><BackIcon className="w-6 h-6 dark:text-white" /></button>
              <div className="flex items-center gap-4 flex-1 cursor-pointer group" onClick={() => setShowChatInfo(true)}>
                  <img src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-10 h-10 rounded-full shadow-sm border border-gray-100 dark:border-[#333]" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition">{activeSession.isGroup ? activeSession.groupName : activeSession.user.name}</h3>
                    <p className="text-xs text-gray-500 truncate font-medium">{activeSession.isGroup ? `${activeSession.participants?.length} members` : (activeSession.user.isOnline ? 'Online' : 'Offline')}</p>
                  </div>
              </div>
              <div className="flex gap-1 items-center text-gray-500 dark:text-gray-400">
                  {chatSearchTerm ? (
                      <div className="flex items-center bg-gray-100 dark:bg-[#222] rounded-full px-3 py-1.5">
                          <input autoFocus value={chatSearchTerm} onChange={e => setChatSearchTerm(e.target.value)} className="bg-transparent text-sm outline-none w-24 dark:text-white" placeholder="Find..." />
                          <button onClick={() => setChatSearchTerm('')}><CloseIcon className="w-4 h-4 hover:text-red-500" /></button>
                      </div>
                  ) : (
                      <button onClick={() => setChatSearchTerm(' ')} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition"><SearchIcon className="w-5 h-5" /></button>
                  )}
                  <button onClick={() => setCallState({active: true, type: 'video'})} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition"><VideoIcon className="w-5 h-5" /></button>
                  <button onClick={() => setCallState({active: true, type: 'audio'})} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition"><PhoneIcon className="w-5 h-5" /></button>
                  <button onClick={() => setShowChatInfo(!showChatInfo)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition"><InfoIcon className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:opacity-90">
              <EncryptionBadge />
              {activeSession.messages.map((msg, i) => {
                  const prevMsg = activeSession.messages[i - 1];
                  const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                  return (
                      <div key={msg.id}>
                          {showDate && (
                              <div className="flex justify-center my-6 sticky top-2 z-10">
                                  <span className="bg-white/80 dark:bg-[#222]/80 backdrop-blur-sm text-xs px-4 py-1.5 rounded-full text-gray-600 dark:text-gray-300 shadow-sm font-bold border border-gray-200 dark:border-[#333]">
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
              {isAiThinking && activeSession.user.id === 'u3' && <div className="text-gray-500 text-xs font-bold ml-4 animate-pulse">AI is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            {replyingTo && (
                <div className="px-4 pt-2 bg-[#f0f2f5] dark:bg-[#050505]">
                    <div className="bg-white dark:bg-[#1f1f1f] p-3 rounded-xl border-l-4 border-blue-500 flex justify-between items-center shadow-sm">
                        <div className="flex flex-col max-w-[90%]">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">Replying to {replyingTo.senderId === currentUser.id ? 'You' : (activeSession.participants?.find(p => p.id === replyingTo.senderId)?.name || 'User')}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{replyingTo.type === 'text' ? replyingTo.text : `[${replyingTo.type}]`}</span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full"><CloseIcon className="w-4 h-4 text-gray-500" /></button>
                    </div>
                </div>
            )}

            <div className="p-3 bg-[#f0f2f5] dark:bg-[#050505]">
               <div className="bg-white dark:bg-[#1f1f1f] rounded-3xl p-2 shadow-sm border border-gray-200 dark:border-[#333] flex items-end gap-2">
                   <button onClick={() => setShowAttachments(!showAttachments)} className={`p-3 rounded-full transition-transform duration-200 ${showAttachments ? 'bg-gray-100 dark:bg-[#333] rotate-45' : 'hover:bg-gray-100 dark:hover:bg-[#333]'}`}>
                       <PlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                   </button>
                   
                   {showAttachments && (
                       <div className="absolute bottom-20 left-4 flex flex-col gap-3 animate-slide-up z-20">
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
                                   <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${item.bg} hover:scale-110 transition transform`}>
                                       {item.icon}
                                   </div>
                                   <span className="bg-white dark:bg-[#222] px-3 py-1 rounded-lg text-xs font-bold shadow dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                                </button>
                           ))}
                       </div>
                   )}

                   <div className="flex-1 mb-1">
                        {isRecording ? (
                            <div className="flex items-center gap-3 h-10 px-2 animate-pulse">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-red-500 font-mono font-bold">{formatDuration(recordingDuration)}</span>
                                <span className="text-gray-400 text-xs">Recording...</span>
                            </div>
                        ) : (
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Type a message"
                                className="w-full bg-transparent outline-none dark:text-white max-h-32 py-2 resize-none text-base"
                                rows={1}
                            />
                        )}
                   </div>

                   <button 
                        onMouseDown={!inputText ? handleVoiceRecord : undefined}
                        onMouseUp={!inputText && isRecording ? handleVoiceRecord : undefined}
                        onClick={inputText ? () => handleSend() : undefined}
                        onTouchStart={!inputText ? handleVoiceRecord : undefined}
                        onTouchEnd={!inputText && isRecording ? handleVoiceRecord : undefined}
                        className={`p-3 rounded-full shadow-lg mb-0.5 transition-all active:scale-90 flex items-center justify-center ${inputText || isRecording ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-300'}`}
                   >
                       {inputText ? <SendIcon className="w-5 h-5" /> : (isRecording ? <SendIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />)}
                   </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="w-40 h-40 bg-gray-100 dark:bg-[#1f1f1f] rounded-full flex items-center justify-center mb-8 animate-pulse-slow">
                  <ChatIcon className="w-20 h-20 text-gray-300 dark:text-gray-600" />
              </div>
              <h2 className="text-3xl font-light text-gray-800 dark:text-gray-200">Welcome to Chats</h2>
              <p className="mt-4 text-sm text-gray-400 max-w-xs text-center">Select a conversation or start a new one to connect with friends.</p>
              <button onClick={() => setContactModalOpen(true)} className="mt-8 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:opacity-80 transition shadow-lg">
                  Start New Chat
              </button>
          </div>
        )}
      </div>

      {/* Right Info Panel */}
      {showChatInfo && activeSession && (
          <div className="w-full md:w-80 border-l border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0f0f0f] absolute inset-0 md:relative z-20 flex flex-col h-full overflow-y-auto animate-slide-in-right shadow-2xl" onClick={() => setActiveMemberMenuId(null)}>
              <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-[#1f1f1f]">
                  <button onClick={() => setShowChatInfo(false)} className="self-end p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full text-gray-500 mb-2"><CloseIcon className="w-6 h-6" /></button>
                  
                  <div className="relative group mb-4">
                      <img 
                        src={isEditingGroup ? editGroupAvatar : (activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar)} 
                        className="w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-[#222]" 
                      />
                      {isEditingGroup && activeSession.isGroup && (
                          <>
                            <div onClick={() => groupAvatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" ref={groupAvatarInputRef} className="hidden" accept="image/*" onChange={handleGroupAvatarChange} />
                          </>
                      )}
                  </div>

                  {isEditingGroup ? (
                      <input 
                        value={editGroupName} 
                        onChange={(e) => setEditGroupName(e.target.value)} 
                        className="w-full p-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-blue-500 outline-none text-center font-bold text-xl dark:text-white mb-2"
                        autoFocus
                      />
                  ) : (
                      <h2 className="text-2xl font-black dark:text-white flex items-center justify-center gap-2">
                          {activeSession.isGroup ? activeSession.groupName : activeSession.user.name}
                          {activeSession.isGroup && activeSession.admins?.includes(currentUser.id) && (
                              <button onClick={() => setIsEditingGroup(true)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-4 h-4" /></button>
                          )}
                      </h2>
                  )}
                  
                  <p className="text-gray-500 font-medium mt-1">
                      {activeSession.isGroup ? `Group • ${activeSession.participants?.length} participants` : activeSession.user.handle}
                  </p>
              </div>

              <div className="p-6 space-y-6 border-b border-gray-100 dark:border-[#1f1f1f]">
                  <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                      {isEditingGroup ? (
                          <textarea 
                            value={editGroupDesc} 
                            onChange={(e) => setEditGroupDesc(e.target.value)} 
                            className="w-full p-3 bg-gray-50 dark:bg-[#222] rounded-xl border border-blue-500 outline-none text-sm resize-none dark:text-white"
                            rows={3}
                          />
                      ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activeSession.isGroup ? activeSession.groupDescription || "No description" : activeSession.user.bio || "Available"}</p>
                      )}
                  </div>
                  
                  {isEditingGroup && (
                      <div className="flex gap-3">
                          <button onClick={handleSaveGroupInfo} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition">Save Changes</button>
                          <button onClick={() => setIsEditingGroup(false)} className="flex-1 bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-white py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-[#333] transition">Cancel</button>
                      </div>
                  )}
              </div>

              {activeSession.isGroup && (
                  <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center px-6 py-4 sticky top-0 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm z-10">
                          <span className="text-sm font-bold dark:text-white">{activeSession.participants?.length} Members</span>
                          <div className="flex gap-2">
                              <button onClick={() => { navigator.clipboard.writeText(`https://myconnect.app/join/${activeSession.id}`); alert("Link copied!"); }} className="p-2 bg-gray-100 dark:bg-[#222] rounded-full hover:bg-gray-200 transition text-gray-600 dark:text-gray-300" title="Invite Link"><LinkIcon className="w-4 h-4" /></button>
                              <button onClick={() => { setGroupModalMode('add_member'); setGroupModalOpen(true); }} className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-80 transition flex items-center gap-1">
                                  <PlusIcon className="w-3 h-3" /> Add
                              </button>
                          </div>
                      </div>
                      
                      <div className="flex-1 px-2 pb-4 overflow-y-auto">
                          {activeSession.participants?.map(p => {
                              const isAdmin = activeSession.admins?.includes(p.id);
                              return (
                                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] group transition relative">
                                      <img src={p.avatar} className="w-10 h-10 rounded-full object-cover" />
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                              <h4 className="text-sm font-bold dark:text-white truncate">{p.id === currentUser.id ? 'You' : p.name}</h4>
                                              {isAdmin && (
                                                  <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                                      <ShieldCheckIcon className="w-3 h-3" /> Admin
                                                  </span>
                                              )}
                                          </div>
                                          <p className="text-xs text-gray-500 truncate">@{p.handle}</p>
                                      </div>
                                      
                                      {/* Admin Actions Menu */}
                                      {activeSession.admins?.includes(currentUser.id) && p.id !== currentUser.id && (
                                          <div className="relative">
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); setActiveMemberMenuId(activeMemberMenuId === p.id ? null : p.id); }}
                                                  className="p-2 hover:bg-gray-200 dark:hover:bg-[#333] rounded-full transition"
                                              >
                                                  <MoreVerticalIcon className="w-4 h-4 text-gray-500" />
                                              </button>
                                              
                                              {activeMemberMenuId === p.id && (
                                                  <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-gray-100 dark:border-[#333] z-20 overflow-hidden animate-fade-in">
                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); handleToggleAdmin(p.id); setActiveMemberMenuId(null); }}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#333] dark:text-white flex items-center gap-2"
                                                      >
                                                          <ShieldCheckIcon className="w-3 h-3" /> {isAdmin ? 'Dismiss Admin' : 'Make Admin'}
                                                      </button>
                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(p.id); setActiveMemberMenuId(null); }}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#333] text-red-500 flex items-center gap-2"
                                                      >
                                                          <UserMinusIcon className="w-3 h-3" /> Remove
                                                      </button>
                                                  </div>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              <div className="p-6 mt-auto bg-gray-50 dark:bg-[#151515] border-t border-gray-100 dark:border-[#222]">
                  {activeSession.isGroup ? (
                      <button 
                        onClick={() => handleBlockOrLeave(true)}
                        className="w-full py-3.5 flex items-center justify-center gap-2 text-red-600 font-bold bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-2xl transition shadow-sm"
                      >
                          <ExitIcon className="w-5 h-5" /> Exit Group
                      </button>
                  ) : (
                      <button 
                        onClick={() => handleBlockOrLeave(false)}
                        className="w-full py-3.5 flex items-center justify-center gap-2 text-red-600 font-bold bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-2xl transition shadow-sm"
                      >
                          <ExitIcon className="w-5 h-5" /> Block Contact
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

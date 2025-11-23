
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, UsersIcon, MicrophoneIcon, CloseIcon, BackIcon, ClockIcon, LockIcon, DocumentIcon, PhoneIcon, InfoIcon, VideoIcon, UserPlusIcon, UserMinusIcon, ExitIcon, PlayCircleIcon, DownloadIcon, PhoneOffIcon, VideoOffIcon, MicOffIcon, MicActiveIcon, ReplyIcon, TrashIcon, CopyIcon, PencilIcon, LinkIcon } from './Icons';
import { MOCK_USERS } from '../services/mockData';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string, type?: 'text' | 'image' | 'video' | 'audio' | 'document', mediaUrl?: string, customId?: string, fileName?: string, fileSize?: string, replyToId?: string) => void;
  onCreateGroup: (name: string) => void;
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

// --- Main Chat Component ---
export const ChatApp: React.FC<ChatAppProps> = ({ sessions: initialSessions, currentUser, onSendMessage, onCreateGroup, isAiThinking, onViewProfile, selectedSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(selectedSessionId || null);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState(''); // Search inside chat
  const [filterType, setFilterType] = useState<'all' | 'groups' | 'unread'>('all');
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'add_member'>('create');
  
  // Call & Reply State
  const [callState, setCallState] = useState<{active: boolean, type: 'audio' | 'video'}>({ active: false, type: 'audio' });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  
  // Group Editing State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [activeSessionId, sessions, isAiThinking, chatSearchTerm]);

  // When entering chat info, prep edit state
  useEffect(() => {
      if (activeSessionId) {
          const s = sessions.find(s => s.id === activeSessionId);
          if (s && s.isGroup) {
              setEditGroupName(s.groupName || '');
              setEditGroupDesc(s.groupDescription || '');
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'audio') => {
      const file = e.target.files?.[0];
      if (file && activeSessionId) {
          const url = URL.createObjectURL(file);
          const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
          handleSend(file.name, type, url, file.name, size);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateGroupSubmit = (data: { name: string, members: User[] }) => {
      const newGroupId = `g_${Date.now()}`;
      const newGroup: ChatSession = {
          id: newGroupId,
          isGroup: true,
          groupName: data.name,
          groupAvatar: `https://ui-avatars.com/api/?name=${data.name.replace(' ','+')}&background=random`,
          user: { ...currentUser, id: 'group_placeholder' },
          lastMessage: 'Group created',
          unread: 0,
          timestamp: 'Just now',
          messages: [],
          participants: [currentUser, ...data.members],
          admins: [currentUser.id]
      };
      setSessions([newGroup, ...sessions]);
      setActiveSessionId(newGroupId);
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
                  groupDescription: editGroupDesc
              };
          }
          return s;
      });
      setSessions(updatedSessions);
      setIsEditingGroup(false);
  };

  const handleRemoveMember = (userId: string) => {
      if (!activeSessionId) return;
      if (!confirm("Remove this user?")) return;
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

  const handleVoiceRecord = () => {
      if (isRecording) {
          setIsRecording(false);
          // Simulate sending an audio file
          handleSend("Voice Message", "audio", "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav"); 
      } else {
          setIsRecording(true);
      }
  };

  const handleCopyMessage = (text: string) => {
      navigator.clipboard.writeText(text);
      setContextMenuMsgId(null);
  };

  const handleDeleteMessage = (msgId: string) => {
      // In a real app this would call API
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

  const filteredSessions = sessions.filter(s => {
      const matchesSearch = (s.isGroup ? s.groupName : s.user.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'groups') return matchesSearch && s.isGroup;
      if (filterType === 'unread') return matchesSearch && s.unread > 0;
      return matchesSearch;
  });

  const renderMessageBubble = (msg: Message) => {
      const isMe = msg.senderId === currentUser.id;
      const isContextOpen = contextMenuMsgId === msg.id;
      const isHighlighted = chatSearchTerm && msg.text.toLowerCase().includes(chatSearchTerm.toLowerCase());
      
      // Resolve replying to message
      const repliedMsg = activeSession?.messages.find(m => m.id === msg.replyToId);

      return (
          <div className={`max-w-[80%] relative group ${isHighlighted ? 'opacity-100' : (chatSearchTerm ? 'opacity-30' : 'opacity-100')}`}>
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
                      <div className={`mb-2 rounded-md p-2 text-xs border-l-4 border-blue-500 bg-black/5 dark:bg-black/20 opacity-80 flex flex-col cursor-pointer`}>
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
                              <img src={msg.mediaUrl} className="rounded-lg max-h-60 object-cover w-full" />
                          ) : (
                              <video src={msg.mediaUrl} controls className="rounded-lg max-h-60 w-full" />
                          )}
                      </div>
                  )}

                  {/* Audio */}
                  {msg.type === 'audio' && (
                      <div className="flex items-center gap-3 min-w-[200px] py-2">
                          <button className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-white">
                              <PlayCircleIcon className="w-5 h-5" />
                          </button>
                          <div className="flex-1">
                              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div className="w-1/3 h-full bg-blue-500"></div>
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">0:15</span>
                          </div>
                      </div>
                  )}

                  {/* Document */}
                  {msg.type === 'document' && (
                      <div className="flex items-center gap-3 bg-black/5 dark:bg-white/10 p-2 rounded-lg mb-1">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-500">
                              <DocumentIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="font-bold truncate text-sm">{msg.fileName || 'Document'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{msg.fileSize || 'PDF'}</p>
                          </div>
                          <button className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                              <DownloadIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                          </button>
                      </div>
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.type !== 'audio' && msg.type !== 'document' ? msg.text : ''}</p>
                  
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => { setGroupModalMode('create'); setGroupModalOpen(true); }} 
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" 
                    title="New Group"
                >
                   <UsersIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" title="New Chat">
                   <PlusIcon className="w-5 h-5" />
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
                {['All', 'Unread', 'Groups'].map(f => (
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
            {filteredSessions.map(session => (
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
            ))}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#efeae2] dark:bg-[#0b141a] relative`}>
        {activeSession ? (
          <>
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden"><BackIcon className="w-6 h-6 dark:text-white" /></button>
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setShowChatInfo(!showChatInfo)}>
                  <img src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{activeSession.isGroup ? activeSession.groupName : activeSession.user.name}</h3>
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
                   <input 
                     type="text" 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Type a message"
                     className="flex-1 bg-transparent outline-none dark:text-white max-h-32 overflow-y-auto py-1"
                   />
               </div>

               <button 
                    onClick={() => inputText ? handleSend() : handleVoiceRecord()}
                    className={`p-3 rounded-full shadow-md mb-1 transition-all active:scale-95 flex items-center justify-center ${inputText || isRecording ? 'bg-[#00a884] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-white'}`}
               >
                   {inputText ? <SendIcon className="w-5 h-5" /> : (isRecording ? <div className="w-5 h-5 bg-white rounded animate-pulse" /> : <MicrophoneIcon className="w-5 h-5" />)}
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
          <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hidden lg:flex flex-col h-full overflow-y-auto animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <button onClick={() => setShowChatInfo(false)}><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                  <h3 className="font-bold dark:text-white">{activeSession.isGroup ? 'Group Info' : 'Contact Info'}</h3>
              </div>

              <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-gray-800">
                  <img src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-24 h-24 rounded-full object-cover mb-3 shadow-lg" />
                  {isEditingGroup ? (
                      <div className="w-full space-y-2">
                          <input 
                            value={editGroupName} 
                            onChange={(e) => setEditGroupName(e.target.value)} 
                            className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded border border-blue-500 outline-none text-center font-bold"
                          />
                      </div>
                  ) : (
                      <h2 className="text-xl font-bold dark:text-white flex items-center justify-center gap-2">
                          {activeSession.isGroup ? activeSession.groupName : activeSession.user.name}
                          {activeSession.isGroup && activeSession.admins?.includes(currentUser.id) && (
                              <button onClick={() => setIsEditingGroup(true)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-4 h-4" /></button>
                          )}
                      </h2>
                  )}
                  <p className="text-gray-500 text-sm mt-1">{activeSession.isGroup ? `Group • ${activeSession.participants?.length} participants` : activeSession.user.phoneNumber || '+1 555 019 2834'}</p>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500 uppercase">About</span>
                      {isEditingGroup ? (
                          <textarea 
                            value={editGroupDesc} 
                            onChange={(e) => setEditGroupDesc(e.target.value)} 
                            className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded border border-blue-500 outline-none text-sm resize-none"
                            rows={2}
                          />
                      ) : (
                          <p className="text-sm dark:text-gray-300">{activeSession.isGroup ? activeSession.groupDescription || "No description" : activeSession.user.bio || "Available"}</p>
                      )}
                  </div>
                  
                  {isEditingGroup && (
                      <div className="flex gap-2">
                          <button onClick={handleSaveGroupInfo} className="flex-1 bg-blue-600 text-white py-1.5 rounded font-bold text-sm">Save</button>
                          <button onClick={() => setIsEditingGroup(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-1.5 rounded font-bold text-sm">Cancel</button>
                      </div>
                  )}

                  {!activeSession.isGroup && (
                      <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-500 uppercase">Media, Links and Docs</span>
                          <div className="flex gap-2 mt-2">
                              {[1,2,3].map(i => <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>)}
                          </div>
                      </div>
                  )}
              </div>

              {activeSession.isGroup && (
                  <div className="flex-1 p-4">
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase">{activeSession.participants?.length} Participants</span>
                          <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://myconnect.app/join/${activeSession.id}`);
                                    alert("Group invite link copied!");
                                }} 
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition text-gray-600 dark:text-gray-300"
                                title="Copy Invite Link"
                              >
                                  <LinkIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setGroupModalMode('add_member'); setGroupModalOpen(true); }} className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 hover:scale-110 transition">
                                  <UserPlusIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {activeSession.participants?.map(p => (
                              <div key={p.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => onViewProfile(p)}>
                                  <img src={p.avatar} className="w-8 h-8 rounded-full object-cover" />
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold dark:text-white truncate">{p.id === currentUser.id ? 'You' : p.name}</h4>
                                      <p className="text-xs text-gray-500 truncate">{p.handle}</p>
                                  </div>
                                  {activeSession.admins?.includes(currentUser.id) && p.id !== currentUser.id && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(p.id); }}
                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                                        title="Remove"
                                      >
                                          <UserMinusIcon className="w-4 h-4" />
                                      </button>
                                  )}
                                  {activeSession.admins?.includes(p.id) && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Admin</span>}
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800">
                  {activeSession.isGroup ? (
                      <button className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition">
                          <ExitIcon className="w-5 h-5" /> Exit Group
                      </button>
                  ) : (
                      <button className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition">
                          <ExitIcon className="w-5 h-5" /> Block {activeSession.user.name}
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

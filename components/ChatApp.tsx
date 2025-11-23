
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, UsersIcon, MicrophoneIcon, CloseIcon, BackIcon, ClockIcon, LockIcon } from './Icons';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string, type?: 'text' | 'image' | 'video' | 'audio', mediaUrl?: string, customId?: string) => void;
  onCreateGroup: (name: string) => void;
  isAiThinking?: boolean;
  onViewProfile: (user?: User) => void;
  selectedSessionId?: string | null; // New prop to control active session externally
}

// --- Socket Simulation Class ---
// Simulates real-time connection events
class MockSocket {
    private listeners: ((msg: any) => void)[] = [];

    subscribe(callback: (msg: any) => void) {
        this.listeners.push(callback);
    }

    emit(event: string, payload: any) {
        // Simulate network latency
        setTimeout(() => {
            if (event === 'sendMessage') {
                // Simulate server ack
                this.notify({ type: 'status_update', id: payload.id, status: 'sent' });
                
                // Simulate delivery
                setTimeout(() => {
                    this.notify({ type: 'status_update', id: payload.id, status: 'delivered' });
                    // Simulate read
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

// --- Message Status Indicator ---
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

// --- Encryption Badge ---
const EncryptionBadge = () => (
    <div className="flex justify-center my-4">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm max-w-[80%] text-center border border-yellow-200 dark:border-yellow-900/50">
            <LockIcon className="w-3 h-3 flex-shrink-0" />
            <span>Messages are end-to-end encrypted. No one outside of this chat, not even MyConnect, can read or listen to them.</span>
        </div>
    </div>
);

export const ChatApp: React.FC<ChatAppProps> = ({ sessions, currentUser, onSendMessage, onCreateGroup, isAiThinking, onViewProfile, selectedSessionId }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(selectedSessionId || sessions[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state to track real-time status updates from "socket"
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, string>>({});

  // Sync active session if prop changes (e.g. coming from Profile "Message" button)
  useEffect(() => {
      if (selectedSessionId) {
          setActiveSessionId(selectedSessionId);
      }
  }, [selectedSessionId]);

  useEffect(() => {
      // Subscribe to socket events
      socket.subscribe((msg) => {
          if (msg.type === 'status_update') {
              setLocalMessageStatuses(prev => ({ ...prev, [msg.id]: msg.status }));
          }
      });
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isAiThinking]);

  const handleSend = () => {
    if (!inputText.trim() || !activeSessionId) return;
    const newMsgId = `msg_${Date.now()}`;
    
    // Optimistic UI Update happens in parent, but we track status here using the ID we generated
    setLocalMessageStatuses(prev => ({ ...prev, [newMsgId]: 'sending' }));
    
    // Pass ID to parent so the message in state matches our socket tracker
    onSendMessage(activeSessionId, inputText, 'text', undefined, newMsgId);
    
    // Simulate socket emission
    socket.emit('sendMessage', { id: newMsgId, text: inputText });
    
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeSessionId) {
          const url = URL.createObjectURL(file);
          const type = file.type.startsWith('video') ? 'video' : 'image';
          const newMsgId = `msg_${Date.now()}`;
          
          setLocalMessageStatuses(prev => ({ ...prev, [newMsgId]: 'sending' }));
          onSendMessage(activeSessionId, file.name, type, url, newMsgId);
          socket.emit('sendMessage', { id: newMsgId, text: 'attachment' });
          setShowAttachments(false);
      }
  };

  const groupedMessages = activeSession?.messages.reduce((groups, message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
      return groups;
  }, {} as Record<string, Message[]>) || {};

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mx-auto max-w-6xl transition-colors pb-16 md:pb-0">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      
      {/* Sidebar */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            <div className="flex gap-2">
                <button onClick={() => { const n = prompt("Group Name"); if(n) onCreateGroup(n); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full" title="Create Group">
                   <UsersIcon className="w-5 h-5 dark:text-white" />
                </button>
            </div>
        </div>
        
        <div className="p-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-3 py-2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <input placeholder="Search chats" className="bg-transparent border-none outline-none text-sm ml-2 w-full dark:text-white" />
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${activeSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500' : ''}`}
                >
                    <div className="relative">
                        <img src={session.isGroup ? session.groupAvatar : session.user.avatar} className="w-12 h-12 rounded-full object-cover" />
                        {session.user.isOnline && !session.isGroup && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                    </div>
                    <div className="flex-1 border-b border-gray-50 dark:border-gray-800 pb-3">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{session.isGroup ? session.groupName : session.user.name}</h3>
                            <span className="text-xs text-gray-400">{session.timestamp}</span>
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

      {/* Active Chat */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#efeae2] dark:bg-[#0b141a]`}>
        {activeSession ? (
          <>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden"><BackIcon className="w-6 h-6 dark:text-white" /></button>
              <img onClick={() => !activeSession.isGroup && onViewProfile(activeSession.user)} src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-10 h-10 rounded-full cursor-pointer" />
              <div className="flex-1">
                <h3 onClick={() => !activeSession.isGroup && onViewProfile(activeSession.user)} className="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:underline">{activeSession.isGroup ? activeSession.groupName : activeSession.user.name}</h3>
                <p className="text-xs text-gray-500">{activeSession.isGroup ? 'Group Info' : (activeSession.user.isOnline ? 'Online' : 'Last seen recently')}</p>
              </div>
              <div className="flex gap-4 text-blue-500">
                  <button><SearchIcon className="w-5 h-5" /></button>
                  <button><MenuIcon className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-90">
              <EncryptionBadge />
              
              {Object.keys(groupedMessages).map(dateKey => (
                  <div key={dateKey}>
                      <div className="flex justify-center my-4 sticky top-0 z-10"><span className="bg-gray-200 dark:bg-gray-800 text-xs px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 shadow-sm">{dateKey}</span></div>
                      {groupedMessages[dateKey].map(msg => (
                          <div key={msg.id} className={`flex mb-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-2 py-1.5 shadow-md text-sm ${msg.senderId === currentUser.id ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-black dark:text-white rounded-tl-none'}`}>
                                {msg.type === 'image' && msg.mediaUrl && (
                                    <img src={msg.mediaUrl} className="w-full max-w-[250px] rounded-lg mb-1" />
                                )}
                                {msg.type === 'video' && msg.mediaUrl && (
                                    <video src={msg.mediaUrl} controls className="w-full max-w-[250px] rounded-lg mb-1" />
                                )}
                                {msg.text}
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] opacity-70 min-w-[45px] text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {msg.senderId === currentUser.id && <MessageStatus status={localMessageStatuses[msg.id] || msg.status} />}
                                </div>
                            </div>
                          </div>
                      ))}
                  </div>
              ))}
              {isAiThinking && activeSession.user.id === 'u3' && <div className="text-gray-500 text-xs italic ml-4">AI is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 bg-gray-50 dark:bg-gray-900 flex items-center gap-2">
               <div className="relative">
                   <button onClick={() => setShowAttachments(!showAttachments)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><PlusIcon className="w-6 h-6 text-gray-500" /></button>
                   {showAttachments && (
                       <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 flex flex-col gap-2 min-w-[150px] animate-slide-up border border-gray-100 dark:border-gray-700 z-20">
                           <button onClick={() => { fileInputRef.current!.accept="image/*"; fileInputRef.current!.click(); }} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm dark:text-white">
                               <div className="bg-purple-500 p-1.5 rounded-full text-white"><CheckIcon className="w-4 h-4" /></div> Photos
                           </button>
                           <button onClick={() => { fileInputRef.current!.accept="video/*"; fileInputRef.current!.click(); }} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm dark:text-white">
                               <div className="bg-red-500 p-1.5 rounded-full text-white"><CameraIcon className="w-4 h-4" /></div> Videos
                           </button>
                           <button className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm dark:text-white">
                               <div className="bg-blue-500 p-1.5 rounded-full text-white"><PaperClipIcon className="w-4 h-4" /></div> Document
                           </button>
                       </div>
                   )}
               </div>
               <input 
                 type="text" 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Type a message"
                 className="flex-1 bg-white dark:bg-gray-800 rounded-full px-4 py-2 border dark:border-gray-700 outline-none dark:text-white"
               />
               <button onClick={handleSend}><SendIcon className="w-6 h-6 text-[#00a884]" /></button>
               <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><MicrophoneIcon className="w-6 h-6 text-gray-500" /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <ChatIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-light text-gray-700 dark:text-gray-300">MyConnect Web</h2>
              <p className="mt-2 text-sm text-gray-400">Send and receive messages without keeping your phone online.</p>
              <EncryptionBadge />
          </div>
        )}
      </div>
    </div>
  );
};

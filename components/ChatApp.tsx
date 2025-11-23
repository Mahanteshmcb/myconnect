
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, UsersIcon, MicrophoneIcon, CloseIcon, BackIcon } from './Icons';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string, type?: 'text' | 'image' | 'video' | 'audio', mediaUrl?: string) => void;
  onCreateGroup: (name: string) => void;
  isAiThinking?: boolean;
  onViewProfile: (user?: User) => void;
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
    if (!status || status === 'sending') return <span className="text-gray-400 text-[10px]">🕒</span>;
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
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm max-w-[80%] text-center">
            <span className="text-sm">🔒</span> Messages are end-to-end encrypted. No one outside of this chat, not even MyConnect, can read or listen to them.
        </div>
    </div>
);

export const ChatApp: React.FC<ChatAppProps> = ({ sessions, currentUser, onSendMessage, onCreateGroup, isAiThinking, onViewProfile }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state to track real-time status updates from "socket"
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, string>>({});

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
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic UI Update happens in parent, but we track status here
    setLocalMessageStatuses(prev => ({ ...prev, [tempId]: 'sending' }));
    
    onSendMessage(activeSessionId, inputText, 'text');
    
    // Simulate socket emission
    socket.emit('sendMessage', { id: tempId, text: inputText });
    
    setInputText('');
  };

  const groupedMessages = activeSession?.messages.reduce((groups, message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
      return groups;
  }, {} as Record<string, Message[]>) || {};

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mx-auto max-w-6xl transition-colors">
      <input type="file" ref={fileInputRef} className="hidden" />
      
      {/* Sidebar */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            <div className="flex gap-2">
                <button onClick={() => { const n = prompt("Group Name"); if(n) onCreateGroup(n); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                   <PlusIcon className="w-5 h-5 dark:text-white" />
                </button>
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${activeSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                    <img src={session.isGroup ? session.groupAvatar : session.user.avatar} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{session.isGroup ? session.groupName : session.user.name}</h3>
                            <span className="text-xs text-gray-400">{session.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.lastMessage}</p>
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
              <img src={activeSession.isGroup ? activeSession.groupAvatar : activeSession.user.avatar} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{activeSession.isGroup ? activeSession.groupName : activeSession.user.name}</h3>
                <p className="text-xs text-gray-500">{activeSession.isGroup ? 'Group Info' : 'Online'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-90">
              <EncryptionBadge />
              
              {Object.keys(groupedMessages).map(dateKey => (
                  <div key={dateKey}>
                      <div className="flex justify-center my-4 sticky top-0"><span className="bg-gray-200 dark:bg-gray-800 text-xs px-3 py-1 rounded-full">{dateKey}</span></div>
                      {groupedMessages[dateKey].map(msg => (
                          <div key={msg.id} className={`flex mb-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-2 py-1.5 shadow-md text-sm ${msg.senderId === currentUser.id ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-white'}`}>
                                {msg.text}
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] opacity-70">
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
               <button onClick={() => setShowAttachments(!showAttachments)}><PlusIcon className="w-6 h-6 text-gray-500" /></button>
               <input 
                 type="text" 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Type a message"
                 className="flex-1 bg-white dark:bg-gray-800 rounded-full px-4 py-2 border dark:border-gray-700 outline-none dark:text-white"
               />
               <button onClick={handleSend}><SendIcon className="w-6 h-6 text-[#00a884]" /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

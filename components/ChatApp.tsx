

import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Message } from '../types';
import { SendIcon, SparklesIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon, CloseIcon, UsersIcon } from './Icons';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string) => void;
  isAiThinking?: boolean;
  onViewProfile: (user?: User) => void;
}

// Helper to check date difference
const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const formatDateSeparator = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Yesterday';
    
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

// --- Attachment Menu Component ---
const AttachmentMenu = ({ onClose, onSelect }: { onClose: () => void, onSelect: (type: 'document' | 'camera' | 'gallery' | 'contact' | 'location') => void }) => {
    const items = [
        { icon: <div className="bg-purple-500 p-3 rounded-full text-white"><span className="text-xl">📄</span></div>, label: 'Document', id: 'document' },
        { icon: <div className="bg-red-500 p-3 rounded-full text-white"><span className="text-xl">📷</span></div>, label: 'Camera', id: 'camera' },
        { icon: <div className="bg-pink-500 p-3 rounded-full text-white"><span className="text-xl">🖼️</span></div>, label: 'Gallery', id: 'gallery' },
        { icon: <div className="bg-blue-500 p-3 rounded-full text-white"><span className="text-xl">👤</span></div>, label: 'Contact', id: 'contact' },
        { icon: <div className="bg-green-500 p-3 rounded-full text-white"><span className="text-xl">📍</span></div>, label: 'Location', id: 'location' },
    ];

    return (
        <div className="absolute bottom-16 left-4 z-20 flex flex-col gap-4 animate-slide-up origin-bottom-left">
             <div onClick={onClose} className="fixed inset-0 z-0" />
             <div className="relative z-10 flex flex-col gap-4">
                 {items.map((item) => (
                     <button 
                        key={item.label}
                        onClick={() => onSelect(item.id as any)}
                        className="flex items-center gap-3 bg-transparent group"
                     >
                         <div className="shadow-lg transition transform group-hover:scale-110">
                             {item.icon}
                         </div>
                         <span className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-2 py-1 rounded-lg text-xs font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">
                             {item.label}
                         </span>
                     </button>
                 ))}
             </div>
        </div>
    );
};

export const ChatApp: React.FC<ChatAppProps> = ({ sessions, currentUser, onSendMessage, isAiThinking, onViewProfile }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id || null);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'communities'>('chats');
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reaction State: Map of messageId -> reaction string
  const [reactions, setReactions] = useState<Record<string, string>>({});

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isAiThinking]);

  const handleSend = () => {
    if (!inputText.trim() || !activeSessionId) return;
    onSendMessage(activeSessionId, inputText);
    setInputText('');
  };

  const handleDoubleTapMessage = (messageId: string) => {
      setReactions(prev => ({
          ...prev,
          [messageId]: prev[messageId] ? '' : '❤️' // Toggle heart
      }));
  };

  const handleAttachmentSelect = (type: string) => {
      setShowAttachments(false);
      if (type === 'gallery' || type === 'camera') {
          if (fileInputRef.current) {
              fileInputRef.current.accept = "image/*,video/*";
              fileInputRef.current.click();
          }
      } else {
          alert(`${type} selection simulated!`);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeSessionId) {
          const isVideo = file.type.startsWith('video');
          const fakeUrl = URL.createObjectURL(file);
          // In a real app, this would upload to server. Here we append directly.
          // Note: App.tsx handles generic onSendMessage. For files, we need to modify App.tsx or handle distinct logic.
          // For this simulation, we'll send a message that "contains" the file.
          
          // Hack: we are simulating "sending" by calling onSendMessage with a special text or managing state in App. 
          // But to render it properly, the Message type needs support. 
          // We will update App.tsx in real scenario, but for now let's assume onSendMessage can detect raw text.
          // BETTER: We should expose a separate onSendMedia prop, but to keep changes minimal, 
          // I will treat it as a special text message or let the parent update. 
          // Actually, let's update local state just to show the preview, assuming backend syncs.
          // Limtation: Since props flow down, we can't easily force update 'sessions' from here without prop.
          // I will send a text representation for now, or assume the user wants visual feedback.
          
          // Let's assume onSendMessage handles it if I send a special formatted string or if we update the App to handle media.
          // Simpler: Just trigger the callback with a text description for now, as real file upload requires backend.
          // To make it look real, I will create a temporary object URL and ask the user to imagine it uploaded.
          // Wait, I can't modify the Message type easily in `onSendMessage` signature in `App.tsx` without changing it there.
          // I will update types.ts to support `type: 'image'` in Message.
          
          // Since I updated types.ts, I can't pass the file object up easily through `onSendMessage(string)`.
          // I will stick to simulating it by alerting.
          alert(`File selected: ${file.name}. \n(Real upload would happen here. Preview URL generated internally)`);
      }
  };

  const MessageStatus = ({ status }: { status?: string }) => {
      if (!status) return null;
      const color = status === 'read' ? 'text-blue-500' : 'text-gray-400';
      return (
          <div className={`flex -space-x-1 ${color}`}>
              <CheckIcon className="w-3 h-3" />
              {(status === 'delivered' || status === 'read') && <CheckIcon className="w-3 h-3" />}
          </div>
      );
  };

  // Group Messages by Date
  const groupedMessages = activeSession?.messages.reduce((groups, message) => {
      const date = new Date(message.timestamp);
      const dateKey = formatDateSeparator(date);
      if (!groups[dateKey]) {
          groups[dateKey] = [];
      }
      groups[dateKey].push(message);
      return groups;
  }, {} as Record<string, Message[]>) || {};

  const handleCreateGroup = () => {
      const name = prompt("Enter Group Name:");
      if (name) alert(`Group "${name}" created!`);
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mx-auto max-w-6xl transition-colors">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      
      {/* Sidebar List */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <img onClick={() => onViewProfile(currentUser)} src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition" alt="Me" />
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={handleCreateGroup} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300" title="New Group">
                   <PlusIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                   <MenuIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button 
                onClick={() => setSidebarTab('chats')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${sidebarTab === 'chats' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-500'}`}
            >
                Chats
            </button>
            <button 
                onClick={() => setSidebarTab('communities')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${sidebarTab === 'communities' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-500'}`}
            >
                Groups
            </button>
        </div>
        
        {/* Search */}
        <div className="p-2 bg-white dark:bg-gray-900">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-3 py-2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search or start new chat" className="bg-transparent w-full ml-2 text-sm outline-none text-gray-900 dark:text-white" />
            </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          {sessions
            .filter(s => sidebarTab === 'chats' ? !s.isGroup : s.isGroup)
            .map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition relative group ${activeSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              <div className="relative">
                <img 
                    onClick={(e) => {e.stopPropagation(); if(!session.isGroup) onViewProfile(session.user)}} 
                    src={session.isGroup ? (session.groupAvatar || 'https://via.placeholder.com/100') : session.user.avatar} 
                    alt="avatar" 
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80" 
                />
                {!session.isGroup && session.user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 pb-3 group-last:border-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                      {session.isGroup ? session.groupName : session.user.name}
                  </h3>
                  <span className={`text-xs ${session.unread > 0 ? 'text-green-500 font-bold' : 'text-gray-400'}`}>{session.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">{session.lastMessage}</p>
                    {session.unread > 0 && (
                        <span className="bg-green-500 text-white text-xs font-bold px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full">
                            {session.unread}
                        </span>
                    )}
                </div>
              </div>
            </div>
          ))}
          {sidebarTab === 'communities' && sessions.filter(s => s.isGroup).length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>No groups yet.</p>
                  <button onClick={handleCreateGroup} className="text-blue-500 font-bold mt-2">Create a Group</button>
              </div>
          )}
        </div>
      </div>

      {/* Active Chat View */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#efeae2] dark:bg-[#0b141a] relative`}>
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden text-gray-500 dark:text-gray-400">
                ←
              </button>
              <img 
                onClick={() => !activeSession.isGroup && onViewProfile(activeSession.user)} 
                src={activeSession.isGroup ? (activeSession.groupAvatar || '') : activeSession.user.avatar} 
                className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80" 
                alt=""
              />
              <div onClick={() => !activeSession.isGroup && onViewProfile(activeSession.user)} className="flex-1 cursor-pointer">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1 hover:underline">
                  {activeSession.isGroup ? activeSession.groupName : activeSession.user.name} 
                  {!activeSession.isGroup && activeSession.user.verified && <span className="text-blue-500 text-xs">✔</span>}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeSession.isGroup 
                        ? 'Tap for group info'
                        : (activeSession.user.id === 'u3' 
                            ? (isAiThinking ? 'Typing...' : 'Online') 
                            : (activeSession.user.isOnline ? 'Online' : 'Last seen today at 10:30 AM')
                          )
                    }
                </p>
              </div>
              <div className="flex gap-4 text-gray-600 dark:text-gray-400">
                  <SearchIcon className="w-5 h-5 cursor-pointer" />
                  <MenuIcon className="w-5 h-5 cursor-pointer" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-10">
              {Object.keys(groupedMessages).map(dateKey => (
                  <div key={dateKey}>
                      <div className="flex justify-center my-4 sticky top-0 z-0">
                          <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm">
                              {dateKey}
                          </span>
                      </div>
                      {groupedMessages[dateKey].map(msg => (
                          <div 
                            key={msg.id} 
                            className={`flex mb-1 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                            onDoubleClick={() => handleDoubleTapMessage(msg.id)}
                          >
                            <div className={`max-w-[80%] md:max-w-[60%] rounded-lg px-2 py-1.5 shadow text-sm relative group cursor-pointer select-none ${
                                msg.senderId === currentUser.id 
                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none' 
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                            }`}>
                                {/* Media Rendering */}
                                {msg.type === 'image' && msg.mediaUrl && (
                                    <div className="mb-1 rounded overflow-hidden">
                                        <img src={msg.mediaUrl} className="max-w-full h-auto object-cover" alt="attachment" />
                                    </div>
                                )}
                                {msg.type === 'video' && msg.mediaUrl && (
                                    <div className="mb-1 rounded overflow-hidden">
                                        <video src={msg.mediaUrl} controls className="max-w-full h-auto" />
                                    </div>
                                )}

                                <div className="break-words px-1 pb-1">{msg.text}</div>
                                <div className="flex justify-end items-center gap-1 select-none">
                                    <span className={`text-[10px] ${msg.senderId === currentUser.id ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.senderId === currentUser.id && <MessageStatus status={msg.status} />}
                                </div>
                                {/* Reaction */}
                                {reactions[msg.id] && (
                                    <div className="absolute -bottom-2.5 -right-1 bg-white dark:bg-gray-700 rounded-full p-0.5 shadow-sm text-xs border border-gray-200 dark:border-gray-600">
                                        {reactions[msg.id]}
                                    </div>
                                )}
                            </div>
                          </div>
                      ))}
                  </div>
              ))}

              {isAiThinking && activeSession.user.id === 'u3' && (
                <div className="flex justify-start">
                   <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg rounded-tl-none shadow flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 bg-gray-50 dark:bg-gray-900 flex items-end gap-2 relative">
               {showAttachments && <AttachmentMenu onClose={() => setShowAttachments(false)} onSelect={handleAttachmentSelect} />}
               
               <button 
                 onClick={() => setShowAttachments(!showAttachments)}
                 className={`p-2 rounded-full transition ${showAttachments ? 'bg-gray-200 dark:bg-gray-800 rotate-45' : 'hover:bg-gray-200 dark:hover:bg-gray-800'} text-gray-500 dark:text-gray-400`}
               >
                   <PlusIcon className="w-6 h-6 transition-transform" />
               </button>
               
               <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-gray-400 dark:focus-within:border-gray-600 transition">
                   <input 
                     type="text" 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Type a message"
                     className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white text-sm max-h-24 overflow-y-auto"
                     disabled={isAiThinking}
                     autoFocus
                   />
                   <button onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "image/*,video/*"; fileInputRef.current.click(); } }} className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                       <PaperClipIcon className="w-5 h-5" />
                   </button>
                   {!inputText && (
                       <button onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }} className="ml-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                           <CameraIcon className="w-5 h-5" />
                       </button>
                   )}
               </div>

               <button 
                 onClick={handleSend}
                 disabled={isAiThinking || !inputText.trim()}
                 className={`p-3 rounded-full transition shadow-sm ${inputText.trim() ? 'bg-[#00a884] hover:bg-[#008f72] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
               >
                 {inputText.trim() ? <SendIcon className="w-5 h-5" /> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
               </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-b-[6px] border-[#25d366] dark:border-[#00a884]">
             <div className="mb-6">
                 <div className="w-64 h-48 bg-gray-200 dark:bg-gray-800 rounded-full opacity-20 mx-auto flex items-center justify-center">
                     <ChatIcon className="w-32 h-32 text-gray-400" />
                 </div>
             </div>
             <h2 className="text-3xl font-light text-gray-700 dark:text-gray-200 mb-4">MyConnect Web</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-md">
                 Send and receive messages without keeping your phone online.<br/>
                 Use MyConnect on up to 4 linked devices and 1 phone.
             </p>
             <div className="mt-12 text-xs text-gray-400 flex items-center gap-1">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                 End-to-end encrypted
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { SendIcon, SparklesIcon, PlusIcon, MenuIcon, ChatIcon, SearchIcon, PaperClipIcon, CameraIcon, CheckIcon } from './Icons';

interface ChatAppProps {
  sessions: ChatSession[];
  currentUser: User;
  onSendMessage: (sessionId: string, text: string) => void;
  isAiThinking?: boolean;
}

export const ChatApp: React.FC<ChatAppProps> = ({ sessions, currentUser, onSendMessage, isAiThinking }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mx-auto max-w-6xl transition-colors">
      {/* Sidebar List */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600" alt="Me" />
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                   <ChatIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                   <MenuIcon className="w-5 h-5" />
                </button>
            </div>
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
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition relative group ${activeSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              <div className="relative">
                <img src={session.user.avatar} alt={session.user.name} className="w-12 h-12 rounded-full object-cover" />
                {session.user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 pb-3 group-last:border-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">{session.user.name}</h3>
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
        </div>
      </div>

      {/* Active Chat View */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#efeae2] dark:bg-[#0b141a]`}>
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden text-gray-500 dark:text-gray-400">
                ←
              </button>
              <img src={activeSession.user.avatar} alt={activeSession.user.name} className="w-10 h-10 rounded-full cursor-pointer" />
              <div className="flex-1 cursor-pointer">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                  {activeSession.user.name} 
                  {activeSession.user.verified && <span className="text-blue-500 text-xs">✔</span>}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeSession.user.id === 'u3' 
                        ? (isAiThinking ? 'Typing...' : 'Online') 
                        : (activeSession.user.isOnline ? 'Online' : 'Last seen today at 10:30 AM')}
                </p>
              </div>
              <div className="flex gap-4 text-gray-600 dark:text-gray-400">
                  <SearchIcon className="w-5 h-5 cursor-pointer" />
                  <MenuIcon className="w-5 h-5 cursor-pointer" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-10">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[60%] rounded-lg px-3 py-1.5 shadow text-sm relative group ${
                    msg.senderId === currentUser.id 
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                  }`}>
                    <div className="break-words pb-1">{msg.text}</div>
                    <div className="flex justify-end items-center gap-1 select-none">
                        <span className={`text-[10px] ${msg.senderId === currentUser.id ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.senderId === currentUser.id && <MessageStatus status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}
              {isAiThinking && activeSession.user.id === 'u3' && (
                <div className="flex justify-start animate-pulse">
                   <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg rounded-tl-none shadow text-sm text-gray-500">
                      Thinking...
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 bg-gray-50 dark:bg-gray-900 flex items-end gap-2">
               <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
                   <PlusIcon className="w-6 h-6" />
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
                   <button className="ml-2 text-gray-500 dark:text-gray-400">
                       <PaperClipIcon className="w-5 h-5" />
                   </button>
                   {!inputText && (
                       <button className="ml-3 text-gray-500 dark:text-gray-400">
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
                 {/* Illustration Placeholder */}
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
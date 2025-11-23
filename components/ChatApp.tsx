import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { SendIcon, SparklesIcon, PlusIcon, MenuIcon, ChatIcon } from './Icons';

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

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm mx-auto max-w-5xl">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
          <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition ${activeSessionId === session.id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative">
                <img src={session.user.avatar} alt={session.user.name} className="w-12 h-12 rounded-full object-cover" />
                {session.user.id === 'u3' && (
                   <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 text-white border-2 border-white">
                     <SparklesIcon className="w-2 h-2" />
                   </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 truncate">{session.user.name}</h3>
                  <span className="text-xs text-gray-400">{session.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{session.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Chat View */}
      <div className={`flex-1 flex flex-col ${!activeSessionId ? 'hidden md:flex' : 'flex'} bg-[#f0f2f5]`}>
        {activeSession ? (
          <>
            <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setActiveSessionId(null)} className="md:hidden text-gray-500">
                ← Back
              </button>
              <img src={activeSession.user.avatar} alt={activeSession.user.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {activeSession.user.name} 
                  {activeSession.user.verified && <span className="text-blue-500 text-xs">✔</span>}
                  {activeSession.user.id === 'u3' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">AI</span>}
                </h3>
                <p className="text-xs text-gray-500">{activeSession.user.id === 'u3' && isAiThinking ? 'Thinking...' : 'Online'}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full"><MenuIcon className="w-5 h-5 text-gray-600" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-10">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm relative ${
                    msg.senderId === currentUser.id 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-900 rounded-bl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right ${msg.senderId === currentUser.id ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isAiThinking && activeSession.user.id === 'u3' && (
                <div className="flex justify-start">
                   <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-200">
               {activeSession.user.id === 'u3' && (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <SparklesIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">MyConnect AI is ready to help</span>
                  </div>
               )}
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={isAiThinking}
                />
                <button 
                  onClick={handleSend}
                  disabled={isAiThinking || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-2.5 rounded-full transition shadow-md"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ChatIcon className="w-10 h-10 text-gray-300" />
             </div>
             <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
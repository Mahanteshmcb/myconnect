import React, { useState } from 'react';
import { ViewMode, Post, ChatSession, Message, LongFormVideo, User, Video } from './types';
import { SocialFeed } from './components/SocialFeed';
import { VideoReels } from './components/VideoReels';
import { ChatApp } from './components/ChatApp';
import { LongFormVideoApp } from './components/LongFormVideo';
import { FEED_POSTS, CURRENT_USER, REELS_VIDEOS, INITIAL_CHATS, LONG_FORM_VIDEOS } from './services/mockData';
import { HomeIcon, VideoIcon, ChatIcon, PlayCircleIcon, MenuIcon, CloseIcon, SettingsIcon, BookmarkIcon, MoonIcon, HelpIcon, TrashIcon } from './components/Icons';
import { getAIResponse } from './services/geminiService';

// --- Mobile Menu Drawer Component ---
const MobileMenu = ({ isOpen, onClose, currentUser }: { isOpen: boolean; onClose: () => void; currentUser: User }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <CloseIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Profile Section */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <div>
              <h3 className="font-bold text-gray-900">{currentUser.name}</h3>
              <p className="text-sm text-gray-500">{currentUser.handle}</p>
            </div>
          </div>
          <button className="w-full mt-2 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            View Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {[
             { icon: <SettingsIcon className="w-6 h-6" />, label: "Settings & Privacy" },
             { icon: <BookmarkIcon className="w-6 h-6" />, label: "Saved" },
             { icon: <MoonIcon className="w-6 h-6" />, label: "Dark Mode" },
             { icon: <HelpIcon className="w-6 h-6" />, label: "Help & Support" },
             { icon: <TrashIcon className="w-6 h-6" />, label: "Recycle Bin" },
           ].map((item, idx) => (
             <button key={idx} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium">
               <span className="text-gray-500">{item.icon}</span>
               {item.label}
             </button>
           ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full py-3 text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-red-50">
            Log Out
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">MyConnect v1.0.2</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.FEED);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Global State
  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [longFormVideos, setLongFormVideos] = useState<LongFormVideo[]>(LONG_FORM_VIDEOS);
  const [reels, setReels] = useState<Video[]>(REELS_VIDEOS);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Feed Actions ---
  const handleCreatePost = (content: string) => {
    const newPost: Post = {
      id: `new_p_${Date.now()}`,
      author: CURRENT_USER,
      content: content,
      likes: 0,
      comments: 0,
      commentsList: [],
      shares: 0,
      timestamp: 'Just now',
      type: 'text'
    };
    setPosts([newPost, ...posts]);
  };

  // --- Chat Actions ---
  const handleSendMessage = async (sessionId: string, text: string) => {
    const sessionIndex = chats.findIndex(c => c.id === sessionId);
    if (sessionIndex === -1) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: CURRENT_USER.id,
      text: text,
      timestamp: new Date(),
    };

    const updatedChats = [...chats];
    updatedChats[sessionIndex] = {
      ...updatedChats[sessionIndex],
      messages: [...updatedChats[sessionIndex].messages, newMessage],
      lastMessage: text,
      timestamp: 'Now'
    };
    setChats(updatedChats);

    // AI Logic
    const currentSession = updatedChats[sessionIndex];
    if (currentSession.user.id === 'u3') { // u3 is the AI
      setIsAiThinking(true);
      try {
        const aiResponseText = await getAIResponse(text);
        
        const aiMessage: Message = {
          id: `ai_msg_${Date.now()}`,
          senderId: 'u3',
          text: aiResponseText,
          timestamp: new Date(),
          isAi: true
        };

        setChats(prevChats => {
          const newChats = [...prevChats];
          const idx = newChats.findIndex(c => c.id === sessionId);
          if (idx !== -1) {
            newChats[idx] = {
              ...newChats[idx],
              messages: [...newChats[idx].messages, aiMessage],
              lastMessage: aiResponseText
            };
          }
          return newChats;
        });
      } catch (error) {
        console.error("AI Error", error);
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  // --- Long Form Video Actions ---
  const handleUpdateVideo = (updatedVideo: LongFormVideo) => {
    setLongFormVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const renderContent = () => {
    switch (activeTab) {
      case ViewMode.FEED:
        return <SocialFeed posts={posts} currentUser={CURRENT_USER} onPostCreate={handleCreatePost} />;
      case ViewMode.WATCH:
        return <VideoReels videos={reels} />;
      case ViewMode.CHAT:
        return (
          <ChatApp 
            sessions={chats} 
            currentUser={CURRENT_USER} 
            onSendMessage={handleSendMessage}
            isAiThinking={isAiThinking}
          />
        );
      case ViewMode.CREATOR:
        return (
          <LongFormVideoApp 
            videos={longFormVideos} 
            currentUser={CURRENT_USER}
            onUpdateVideo={handleUpdateVideo} 
          />
        );
      default:
        return <SocialFeed posts={posts} currentUser={CURRENT_USER} onPostCreate={handleCreatePost} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} currentUser={CURRENT_USER} />

      {/* Desktop Header */}
      <header className="hidden md:flex bg-white shadow-sm z-50 px-6 h-16 items-center justify-between sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(ViewMode.FEED)}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">MyConnect</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.FEED ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
            <HomeIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CREATOR ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}>
            <PlayCircleIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.WATCH)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.WATCH ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
            <VideoIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CHAT)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CHAT ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
            <ChatIcon className="w-6 h-6" />
          </button>
        </nav>

        <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-gray-500">
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300 cursor-pointer" onClick={() => setIsMenuOpen(true)}>
                <img src={CURRENT_USER.avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-hidden ${activeTab === ViewMode.WATCH ? 'bg-black' : ''}`}>
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden bg-white border-t border-gray-200 h-16 flex justify-around items-center z-50 pb-safe fixed bottom-0 w-full">
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.FEED ? 'text-blue-600' : 'text-gray-400'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.CREATOR ? 'text-red-600' : 'text-gray-400'}`}>
            <PlayCircleIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Videos</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.WATCH)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.WATCH ? 'text-blue-600' : 'text-gray-400'}`}>
            <VideoIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Reels</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.CHAT)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.CHAT ? 'text-blue-600' : 'text-gray-400'}`}>
            <ChatIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 flex flex-col items-center gap-1 text-gray-400">
            <MenuIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
      </nav>
    </div>
  );
}
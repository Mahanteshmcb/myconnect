import React, { useState, useEffect } from 'react';
import { ViewMode, Post, ChatSession, Message, LongFormVideo, User, Video, Notification } from './types';
import { SocialFeed } from './components/SocialFeed';
import { VideoReels } from './components/VideoReels';
import { ChatApp } from './components/ChatApp';
import { LongFormVideoApp } from './components/LongFormVideo';
import { UserProfile } from './components/UserProfile';
import { Notifications } from './components/Notifications';
import { Explore } from './components/Explore';
import { FEED_POSTS, CURRENT_USER, REELS_VIDEOS, INITIAL_CHATS, LONG_FORM_VIDEOS, MOCK_NOTIFICATIONS, EXPLORE_ITEMS } from './services/mockData';
import { HomeIcon, VideoIcon, ChatIcon, PlayCircleIcon, MenuIcon, CloseIcon, SettingsIcon, BookmarkIcon, MoonIcon, HelpIcon, TrashIcon, BellIcon, ExploreIcon, YouTubeLogo } from './components/Icons';
import { getAIResponse } from './services/geminiService';

// --- Mobile Menu Drawer Component ---
const MobileMenu = ({ isOpen, onClose, currentUser, isDarkMode, toggleDarkMode, onViewProfile }: { isOpen: boolean; onClose: () => void; currentUser: User; isDarkMode: boolean; toggleDarkMode: () => void; onViewProfile: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-3/4 max-w-xs bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right transition-colors duration-300">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-lg dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <CloseIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Profile Section */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{currentUser.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.handle}</p>
            </div>
          </div>
          <button 
            onClick={() => { onViewProfile(); onClose(); }}
            className="w-full mt-2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition"
          >
            View Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {[
             { icon: <SettingsIcon className="w-6 h-6" />, label: "Settings & Privacy" },
             { icon: <BookmarkIcon className="w-6 h-6" />, label: "Saved" },
             { icon: <HelpIcon className="w-6 h-6" />, label: "Help & Support" },
             { icon: <TrashIcon className="w-6 h-6" />, label: "Recycle Bin" },
           ].map((item, idx) => (
             <button key={idx} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
               {item.label}
             </button>
           ))}
           {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><MoonIcon className="w-6 h-6" /></span>
               {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <button className="w-full py-3 text-red-600 font-bold bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            Log Out
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">MyConnect v1.0.4</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.FEED);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Global State
  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [longFormVideos, setLongFormVideos] = useState<LongFormVideo[]>(LONG_FORM_VIDEOS);
  const [reels, setReels] = useState<Video[]>(REELS_VIDEOS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Reels Global Mute State (False = Sound On by default)
  const [isReelsMuted, setIsReelsMuted] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
        return (
          <VideoReels 
            videos={reels} 
            isMuted={isReelsMuted} 
            toggleMute={() => setIsReelsMuted(!isReelsMuted)} 
          />
        );
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
      case ViewMode.PROFILE:
        return (
          <UserProfile 
             user={CURRENT_USER} 
             posts={posts} 
             onBack={() => setActiveTab(ViewMode.FEED)}
          />
        );
      case ViewMode.NOTIFICATIONS:
        return <Notifications notifications={notifications} />;
      case ViewMode.EXPLORE:
        return <Explore items={EXPLORE_ITEMS} />;
      default:
        return <SocialFeed posts={posts} currentUser={CURRENT_USER} onPostCreate={handleCreatePost} />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentUser={CURRENT_USER} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onViewProfile={() => setActiveTab(ViewMode.PROFILE)}
      />

      {/* Desktop Header */}
      <header className="hidden md:flex bg-white dark:bg-gray-900 shadow-sm z-50 px-6 h-16 items-center justify-between sticky top-0 border-b dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(ViewMode.FEED)}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">MyConnect</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.FEED ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <HomeIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CREATOR ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <YouTubeLogo className="w-8 h-8" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.WATCH)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.WATCH ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <VideoIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.EXPLORE)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.EXPLORE ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <ExploreIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CHAT)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CHAT ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <ChatIcon className="w-6 h-6" />
          </button>
        </nav>

        <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab(ViewMode.NOTIFICATIONS)} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition">
                <BellIcon className="w-6 h-6" />
                {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600 cursor-pointer" onClick={() => setIsMenuOpen(true)}>
                <img src={CURRENT_USER.avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-hidden ${activeTab === ViewMode.WATCH ? 'bg-black' : ''}`}>
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex justify-around items-center z-50 pb-safe fixed bottom-0 w-full transition-colors ${activeTab === ViewMode.WATCH ? 'bg-black/90 border-gray-800 backdrop-blur-sm text-white' : ''}`}>
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.FEED ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.CREATOR ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <YouTubeLogo className="w-6 h-6" />
            <span className="text-[10px] font-medium">Video</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.WATCH)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.WATCH ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            <VideoIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Reels</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.CHAT)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.CHAT ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <ChatIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
            <MenuIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
      </nav>
    </div>
  );
}
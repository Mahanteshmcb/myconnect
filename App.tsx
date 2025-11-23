
import React, { useState, useEffect } from 'react';
import { ViewMode, Post, ChatSession, Message, LongFormVideo, User, Video, Notification, Community, Comment } from './types';
import { SocialFeed } from './components/SocialFeed';
import { VideoReels, CreateReel } from './components/VideoReels';
import { ChatApp } from './components/ChatApp';
import { LongFormVideoApp } from './components/LongFormVideo';
import { UserProfile } from './components/UserProfile';
import { Notifications } from './components/Notifications';
import { Marketplace } from './components/Marketplace';
import { Explore } from './components/Explore';
import { SettingsModal, OnboardingModal } from './components/Settings'; // Import new components
import { FEED_POSTS, CURRENT_USER, REELS_VIDEOS, INITIAL_CHATS, LONG_FORM_VIDEOS, MOCK_NOTIFICATIONS, EXPLORE_ITEMS, MOCK_COMMUNITIES, MARKET_ITEMS } from './services/mockData';
import { HomeIcon, VideoIcon, ChatIcon, MenuIcon, CloseIcon, SettingsIcon, BookmarkIcon, MoonIcon, HelpIcon, TrashIcon, BellIcon, ExploreIcon, StreamHubIcon, ShoppingBagIcon } from './components/Icons';
import { getAIResponse } from './services/geminiService';

// Updated MobileMenu to support settings triggers
const MobileMenu = ({ 
    isOpen, 
    onClose, 
    currentUser, 
    isDarkMode, 
    toggleDarkMode, 
    onViewProfile,
    onOpenSettings 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    currentUser: User; 
    isDarkMode: boolean; 
    toggleDarkMode: () => void; 
    onViewProfile: () => void;
    onOpenSettings: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-3/4 max-w-xs bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right transition-colors duration-300">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-lg dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <CloseIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name}</h3>
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

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           <button onClick={() => { onOpenSettings(); onClose(); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><SettingsIcon className="w-6 h-6" /></span>
               Settings & Privacy
           </button>
           <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><BookmarkIcon className="w-6 h-6" /></span>
               Saved
           </button>
           <button onClick={() => { onOpenSettings(); onClose(); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><HelpIcon className="w-6 h-6" /></span>
               Help & Support
           </button>
           <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><TrashIcon className="w-6 h-6" /></span>
               Recycle Bin
           </button>
            <button onClick={toggleDarkMode} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
               <span className="text-gray-500 dark:text-gray-400"><MoonIcon className="w-6 h-6" /></span>
               {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <button className="w-full py-3 text-red-600 font-bold bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            Log Out
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">MyConnect v1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.FEED);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [viewingUser, setViewingUser] = useState<User>(CURRENT_USER); 
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [longFormVideos, setLongFormVideos] = useState<LongFormVideo[]>(LONG_FORM_VIDEOS);
  const [reels, setReels] = useState<Video[]>(REELS_VIDEOS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isReelsMuted, setIsReelsMuted] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check profile completeness on mount
  useEffect(() => {
      if (!currentUser.isProfileComplete) {
          setIsOnboardingOpen(true);
      }
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleUpdateUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      if (viewingUser.id === updatedUser.id) {
          setViewingUser(updatedUser);
      }
  };
  
  const handleProfileComplete = (completedUser: User) => {
      handleUpdateUser(completedUser);
      setIsOnboardingOpen(false);
  };

  const handleViewProfile = (user?: User) => {
      setViewingUser(user || currentUser);
      setActiveTab(ViewMode.PROFILE);
  };

  // Updated Create Post handler to support product tagging
  const handleCreatePost = (content: string, media?: string, type?: 'image' | 'video' | 'text', communityId?: string, productId?: string) => {
    const newPost: Post = {
      id: `new_p_${Date.now()}`,
      author: currentUser,
      content: content,
      likes: 0,
      comments: 0,
      commentsList: [],
      shares: 0,
      timestamp: 'Just now',
      type: type || 'text',
      image: media,
      communityId: communityId,
      taggedProductId: productId // Add product ID
    };
    setPosts([newPost, ...posts]);
  };

  const handleAddComment = (postId: string, text: string) => {
      const newComment: Comment = {
          id: `c_${Date.now()}`,
          author: currentUser,
          text: text,
          timestamp: 'Just now'
      };

      setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
              return {
                  ...post,
                  comments: post.comments + 1,
                  commentsList: [newComment, ...(post.commentsList || [])]
              };
          }
          return post;
      }));
  };

  // ... (Keep Community Actions)
  const handleCreateCommunity = (name: string, description: string) => {
      const newId = `c_${Date.now()}`;
      const newCommunity: Community = {
          id: newId,
          name,
          description,
          avatar: `https://ui-avatars.com/api/?name=${name.replace(' ','+')}&background=random`,
          members: 1,
          isJoined: true,
          tags: [],
          trendingScore: 0,
          creatorId: currentUser.id 
      };
      setCommunities([...communities, newCommunity]);
      setSelectedCommunityId(newId);
      setActiveTab(ViewMode.FEED); 
  };

  const handleDeleteCommunity = (id: string) => {
      setCommunities(communities.filter(c => c.id !== id));
      setPosts(posts.filter(p => p.communityId !== id));
      if (selectedCommunityId === id) setSelectedCommunityId(null);
  };

  const handleUpdateCommunity = (id: string, updates: Partial<Community>) => {
      setCommunities(communities.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleJoinCommunity = (communityId: string) => {
      setCommunities(communities.map(c => 
          c.id === communityId 
            ? { ...c, isJoined: !c.isJoined, members: c.isJoined ? c.members - 1 : c.members + 1 }
            : c
      ));
  };

  const handleRemoveMember = (communityId: string, userId: string) => {
      setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, members: Math.max(0, c.members - 1) } : c
      ));
      alert("Member removed (simulated)");
  };

  const handleNavigateToCommunity = (communityId: string) => {
      setSelectedCommunityId(communityId);
      setActiveTab(ViewMode.FEED);
  };

  const handleNavigateToMarket = () => {
      setActiveTab(ViewMode.MARKET);
  };

  const handleVideoClick = (video: LongFormVideo) => {
      setActiveTab(ViewMode.CREATOR);
  };

  const handlePostReel = (video: Video) => {
      setReels([video, ...reels]);
      setActiveTab(ViewMode.WATCH);
  };

  const handleCreateGroup = (name: string) => {
      const newGroupId = `g_${Date.now()}`;
      const newGroup: ChatSession = {
          id: newGroupId,
          isGroup: true,
          groupName: name,
          groupAvatar: `https://ui-avatars.com/api/?name=${name.replace(' ','+')}&background=random`,
          user: { ...currentUser, id: 'group_placeholder' },
          lastMessage: 'Group created',
          unread: 0,
          timestamp: 'Just now',
          messages: [],
          participants: [currentUser], // Start with creator
          admins: [currentUser.id] // Creator is admin
      };
      setChats([newGroup, ...chats]);
      setActiveTab(ViewMode.CHAT);
      setSelectedChatId(newGroupId);
  };

  const handleUpdateGroup = (sessionId: string, updates: Partial<ChatSession>) => {
      setChats(chats.map(c => c.id === sessionId ? { ...c, ...updates } : c));
  };

  const handleLeaveChat = (sessionId: string) => {
      setChats(chats.filter(c => c.id !== sessionId));
  };
  
  const handleStartChat = (targetUser: User) => {
      const existingChat = chats.find(c => !c.isGroup && c.user.id === targetUser.id);
      if (existingChat) {
          setSelectedChatId(existingChat.id);
      } else {
          const newChatId = `c_${Date.now()}`;
          const newChat: ChatSession = {
              id: newChatId,
              user: targetUser,
              lastMessage: '',
              unread: 0,
              timestamp: 'Now',
              messages: []
          };
          setChats([newChat, ...chats]);
          setSelectedChatId(newChatId);
      }
      setActiveTab(ViewMode.CHAT);
  };

  const handleAddContact = (contact: User) => {
      const newChatId = `c_${Date.now()}`;
      const newChat: ChatSession = {
          id: newChatId,
          user: contact,
          lastMessage: '',
          unread: 0,
          timestamp: 'Now',
          messages: []
      };
      setChats([newChat, ...chats]);
      setSelectedChatId(newChatId);
      setActiveTab(ViewMode.CHAT);
  };

  const handleSendMessage = async (
      sessionId: string, 
      text: string, 
      type: 'text' | 'image' | 'video' | 'audio' | 'document' = 'text', 
      mediaUrl?: string, 
      customId?: string,
      fileName?: string,
      fileSize?: string,
      replyToId?: string
  ) => {
    const sessionIndex = chats.findIndex(c => c.id === sessionId);
    if (sessionIndex === -1) return;

    const newMessage: Message = {
      id: customId || `msg_${Date.now()}`,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date(),
      type: type,
      mediaUrl: mediaUrl,
      fileName: fileName,
      fileSize: fileSize,
      replyToId: replyToId,
      status: 'sending'
    };

    const updatedChats = [...chats];
    updatedChats[sessionIndex] = {
      ...updatedChats[sessionIndex],
      messages: [...updatedChats[sessionIndex].messages, newMessage],
      lastMessage: type === 'text' ? text : `Sent a ${type}`,
      timestamp: 'Now'
    };
    setChats(updatedChats);

    const currentSession = updatedChats[sessionIndex];
    if (currentSession.user.id === 'u3' && type === 'text') {
      setIsAiThinking(true);
      try {
        const aiResponseText = await getAIResponse(text);
        const aiMessage: Message = {
          id: `ai_msg_${Date.now()}`,
          senderId: 'u3',
          text: aiResponseText,
          timestamp: new Date(),
          isAi: true,
          type: 'text',
          status: 'read'
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

  const handleUpdateVideo = (updatedVideo: LongFormVideo) => {
    setLongFormVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const renderContent = () => {
    switch (activeTab) {
      case ViewMode.FEED:
        return (
            <SocialFeed 
                posts={posts} 
                currentUser={currentUser} 
                onPostCreate={handleCreatePost} 
                onAddComment={handleAddComment}
                onViewProfile={handleViewProfile}
                onUpdateUser={handleUpdateUser}
                communities={communities}
                onJoinCommunity={handleJoinCommunity}
                onCreateCommunity={handleCreateCommunity}
                onDeleteCommunity={handleDeleteCommunity}
                onUpdateCommunity={handleUpdateCommunity}
                onRemoveMember={handleRemoveMember}
            />
        );
      case ViewMode.WATCH:
        return (
          <VideoReels 
            videos={reels} 
            isMuted={isReelsMuted} 
            toggleMute={() => setIsReelsMuted(!isReelsMuted)} 
            onViewProfile={handleViewProfile}
            onCreateReel={() => setActiveTab(ViewMode.CREATE_REEL)}
          />
        );
      case ViewMode.CREATE_REEL:
          return (
              <CreateReel 
                onBack={() => setActiveTab(ViewMode.WATCH)} 
                onPost={handlePostReel}
                currentUser={currentUser}
              />
          );
      case ViewMode.CHAT:
        return (
          <ChatApp 
            sessions={chats} 
            currentUser={currentUser} 
            onSendMessage={handleSendMessage}
            onCreateGroup={handleCreateGroup}
            onAddContact={handleAddContact}
            isAiThinking={isAiThinking}
            onViewProfile={handleViewProfile}
            selectedSessionId={selectedChatId}
            onUpdateGroup={handleUpdateGroup}
            onLeaveChat={handleLeaveChat}
          />
        );
      case ViewMode.CREATOR:
        return (
          <LongFormVideoApp 
            videos={longFormVideos} 
            currentUser={currentUser}
            onUpdateVideo={handleUpdateVideo}
            onViewProfile={handleViewProfile} 
          />
        );
      case ViewMode.PROFILE:
        return (
          <UserProfile 
             user={viewingUser} 
             currentUser={currentUser}
             posts={posts} 
             onBack={() => setActiveTab(ViewMode.FEED)}
             onUpdateUser={handleUpdateUser}
             onStartChat={handleStartChat}
          />
        );
      case ViewMode.NOTIFICATIONS:
        return <Notifications notifications={notifications} onViewProfile={handleViewProfile} />;
      case ViewMode.EXPLORE:
        return (
            <Explore 
                items={EXPLORE_ITEMS} 
                onViewProfile={handleViewProfile}
                onJoinCommunity={handleJoinCommunity}
                onNavigateToCommunity={handleNavigateToCommunity}
                onNavigateToMarket={handleNavigateToMarket}
                onNavigateToVideo={handleVideoClick}
            />
        );
      case ViewMode.MARKET:
        return <Marketplace />;
      default:
        return <SocialFeed posts={posts} currentUser={currentUser} onPostCreate={handleCreatePost} onAddComment={handleAddComment} onViewProfile={handleViewProfile} onUpdateUser={handleUpdateUser} />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
      <OnboardingModal 
        isOpen={isOnboardingOpen}
        currentUser={currentUser}
        onComplete={handleProfileComplete}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />

      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentUser={currentUser} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onViewProfile={() => handleViewProfile(currentUser)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <header className="hidden md:flex bg-white dark:bg-gray-900 shadow-sm z-50 px-6 h-16 items-center justify-between sticky top-0 border-b dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(ViewMode.FEED)}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">MyConnect</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.FEED ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Feed">
            <HomeIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CREATOR ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="StreamHub">
            <StreamHubIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.EXPLORE)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.EXPLORE ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Explore">
            <ExploreIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.MARKET)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.MARKET ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Marketplace">
            <ShoppingBagIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab(ViewMode.CHAT)} className={`p-2 rounded-lg transition ${activeTab === ViewMode.CHAT ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Chat">
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
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600 cursor-pointer" onClick={() => handleViewProfile(currentUser)}>
                <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
             <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                <MenuIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      <main className={`flex-1 overflow-hidden ${activeTab === ViewMode.WATCH || activeTab === ViewMode.CREATE_REEL ? 'bg-black' : ''}`}>
        {renderContent()}
      </main>

      <nav className={`md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex justify-around items-center z-50 pb-safe fixed bottom-0 w-full transition-colors ${activeTab === ViewMode.WATCH || activeTab === ViewMode.CREATE_REEL ? 'bg-black/90 border-gray-800 backdrop-blur-sm text-white' : ''}`}>
          <button onClick={() => setActiveTab(ViewMode.FEED)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.FEED ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.CREATOR)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.CREATOR ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <StreamHubIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Videos</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.EXPLORE)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.EXPLORE ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <ExploreIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <button onClick={() => setActiveTab(ViewMode.MARKET)} className={`p-2 flex flex-col items-center gap-1 ${activeTab === ViewMode.MARKET ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <ShoppingBagIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Shop</span>
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

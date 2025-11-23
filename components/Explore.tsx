
import React, { useState, useMemo } from 'react';
import { ExploreItem, User, Community, Product, Post, Video, LongFormVideo } from '../types';
import { SearchIcon, PlayCircleIcon, HeartIcon, UsersIcon, ShoppingBagIcon, GridIcon, StreamHubLogo, CloseIcon, TagIcon, CheckIcon, ShareIcon } from './Icons'; 
import { MOCK_USERS, MOCK_COMMUNITIES, MARKET_ITEMS, FEED_POSTS, REELS_VIDEOS, LONG_FORM_VIDEOS } from '../services/mockData';

interface ExploreProps {
  items: ExploreItem[];
  onViewProfile: (user: User) => void;
  onJoinCommunity: (communityId: string) => void;
  onNavigateToCommunity: (communityId: string) => void;
  onNavigateToVideo: (video: LongFormVideo) => void;
  onNavigateToMarket: () => void;
}

const TABS = [
    { id: 'All', label: 'All', icon: null },
    { id: 'For You', label: 'For You', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'People', label: 'People', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'Communities', label: 'Groups', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'Marketplace', label: 'Shop', icon: <ShoppingBagIcon className="w-4 h-4" /> },
    { id: 'Videos', label: 'Videos', icon: <StreamHubLogo className="w-4 h-4" /> },
];

// --- Explore Detail Modal ---
const ExploreDetailModal = ({ item, onClose, onNavigateToVideo }: { item: ExploreItem | Post | Video, onClose: () => void, onNavigateToVideo: (v: LongFormVideo) => void }) => {
    const imgSrc = (item as any).image || (item as any).thumbnail || (item as any).url;
    const isVideo = (item as any).type === 'video' || (item as any).type === 'short';

    const handleWatch = () => {
        if (isVideo) {
            // Construct a mock LongFormVideo object to be compatible with the player
            const mockVideo: LongFormVideo = {
                id: item.id,
                title: 'Explore Video',
                thumbnail: imgSrc,
                url: (item as any).url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: '00:00',
                views: '0',
                uploadedAt: 'Just now',
                author: MOCK_USERS['u1'], // Default
                description: 'Video from Explore',
                category: 'Explore',
                likes: '0',
                type: 'video'
            };
            onNavigateToVideo(mockVideo);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition">
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="flex-1 bg-black flex items-center justify-center relative group">
                    <img src={imgSrc} className="max-w-full max-h-[80vh] object-contain" />
                    {isVideo && (
                        <button 
                            onClick={handleWatch}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition"
                        >
                            <PlayCircleIcon className="w-20 h-20 text-white opacity-90 group-hover:scale-110 transition" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Product Modal ---
const ProductModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-gray-100 dark:bg-black relative">
                    <img src={product.image} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white md:hidden">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.title}</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400">{product.category}</p>
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="mt-6 mb-8">
                        <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{product.price}</h3>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">📍 {product.location}</p>
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            This is a great item in excellent condition. Perfect for anyone looking for quality at an affordable price.
                        </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg active:scale-95">
                            Message Seller
                        </button>
                        <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <HeartIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <ShareIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Explore: React.FC<ExploreProps> = ({ 
    items, 
    onViewProfile, 
    onJoinCommunity, 
    onNavigateToCommunity, 
    onNavigateToVideo,
    onNavigateToMarket 
}) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingItem, setViewingItem] = useState<ExploreItem | null>(null);

  // Derived Data for search
  const allUsers = Object.values(MOCK_USERS);
  
  const filteredData = useMemo(() => {
      const q = searchQuery.toLowerCase();
      return {
          users: allUsers.filter(u => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)),
          communities: MOCK_COMMUNITIES.filter(c => c.name.toLowerCase().includes(q)),
          products: MARKET_ITEMS.filter(p => p.title.toLowerCase().includes(q)),
          posts: FEED_POSTS.filter(p => p.content.toLowerCase().includes(q)),
          videos: LONG_FORM_VIDEOS.filter(v => v.title.toLowerCase().includes(q)),
          exploreItems: items.filter(i => !q || (i.category && i.category.toLowerCase().includes(q)))
      };
  }, [searchQuery, items]);

  const renderPeople = () => (
      <div className="p-4 space-y-4">
          {filteredData.users.map(user => (
              <div key={user.id} onClick={() => onViewProfile(user)} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                      <h3 className="font-bold dark:text-white flex items-center gap-1">
                          {user.name}
                          {user.verified && <CheckIcon className="w-4 h-4 text-blue-500" />}
                      </h3>
                      <p className="text-sm text-gray-500">@{user.handle}</p>
                      <p className="text-xs text-gray-400 mt-1">{user.subscribers || '0'} followers</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewProfile(user); }} 
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-80"
                  >
                      View
                  </button>
              </div>
          ))}
          {filteredData.users.length === 0 && <p className="text-gray-500 text-center">No users found.</p>}
      </div>
  );

  const renderCommunities = () => (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredData.communities.map(c => (
              <div key={c.id} onClick={() => onNavigateToCommunity(c.id)} className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 cursor-pointer hover:border-blue-500 transition">
                  <img src={c.avatar} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                      <h3 className="font-bold dark:text-white truncate">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.members.toLocaleString()} members</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onJoinCommunity(c.id); }} 
                        className={`mt-2 px-4 py-1.5 text-xs font-bold rounded-full transition ${c.isJoined ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 'bg-blue-50 text-blue-600'}`}
                      >
                          {c.isJoined ? 'Joined' : 'Join'}
                      </button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderMarket = () => (
      <div className="p-4">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold dark:text-white">Marketplace</h3>
              <button onClick={onNavigateToMarket} className="text-blue-500 text-sm font-bold hover:underline">See All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredData.products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">{p.price}</span>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-sm dark:text-white truncate">{p.title}</h3>
                        <p className="text-xs text-gray-500">{p.location}</p>
                    </div>
                </div>
            ))}
          </div>
      </div>
  );

  const renderVideos = () => (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredData.videos.map(v => (
              <div key={v.id} onClick={() => onNavigateToVideo(v)} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer group shadow-sm">
                  <div className="aspect-video relative">
                      <img src={v.thumbnail} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                          <PlayCircleIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100" />
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 rounded">{v.duration}</span>
                  </div>
                  <div className="p-3">
                      <h3 className="font-bold text-sm dark:text-white line-clamp-2">{v.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{v.author.name} • {v.views} views</p>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderMasonry = () => (
      <div className="p-1 md:p-4 grid grid-cols-3 gap-1 md:gap-4 auto-rows-[120px] md:auto-rows-[250px] grid-flow-dense">
          {filteredData.exploreItems.map((item, index) => {
              const isBig = index % 10 === 0;
              const spanClass = isBig ? 'row-span-2 col-span-2' : 'row-span-1 col-span-1';
              return (
                  <div 
                      key={item.id} 
                      onClick={() => setViewingItem(item)}
                      className={`relative group cursor-pointer overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-sm md:rounded-lg ${spanClass}`}
                  >
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      {item.type === 'video' && (
                          <div className="absolute top-2 right-2 text-white drop-shadow-md"><PlayCircleIcon className="w-6 h-6" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2">
                          <div className="flex items-center gap-2 text-white font-bold mb-1"><HeartIcon className="w-6 h-6" filled /><span>{item.likes}</span></div>
                          {item.category && <span className="text-white/80 text-xs font-medium px-2 py-1 bg-black/40 rounded-full backdrop-blur-sm">{item.category}</span>}
                      </div>
                  </div>
              );
          })}
      </div>
  );

  const renderAll = () => (
      <div className="pb-20 space-y-8">
          {/* Horizontal People */}
          {filteredData.users.length > 0 && (
              <div className="pt-4 pl-4">
                  <h3 className="font-bold text-lg dark:text-white mb-3">People to follow</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pr-4">
                      {filteredData.users.slice(0, 8).map(u => (
                          <div key={u.id} onClick={() => onViewProfile(u)} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
                              <img src={u.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800 group-hover:border-blue-500 transition" />
                              <span className="text-xs font-medium text-center dark:text-white truncate w-full">{u.name.split(' ')[0]}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Featured Communities */}
          {filteredData.communities.length > 0 && (
              <div className="px-4">
                  <h3 className="font-bold text-lg dark:text-white mb-3">Trending Communities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredData.communities.slice(0, 4).map(c => (
                          <div key={c.id} onClick={() => onNavigateToCommunity(c.id)} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                              <img src={c.avatar} className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 overflow-hidden">
                                  <h4 className="font-bold text-sm dark:text-white truncate">{c.name}</h4>
                                  <p className="text-xs text-gray-500">{c.members} members</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Visual Discovery */}
          <div className="px-4">
              <h3 className="font-bold text-lg dark:text-white mb-3">Explore Feed</h3>
              {renderMasonry()}
          </div>
      </div>
  );

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto transition-colors flex flex-col">
        {selectedProduct && (
            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
        
        {viewingItem && (
            <ExploreDetailModal item={viewingItem} onClose={() => setViewingItem(null)} onNavigateToVideo={onNavigateToVideo} />
        )}

        {/* Search Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
            <div className="p-3">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-full flex items-center px-4 py-3 transition-colors group focus-within:ring-2 ring-blue-500">
                    <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search everything..." 
                      className="bg-transparent w-full ml-3 outline-none text-gray-900 dark:text-white placeholder-gray-500 text-base"
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')}><CloseIcon className="w-5 h-5 text-gray-400" /></button>}
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 px-3 pb-3 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
                            activeTab === tab.id 
                            ? 'bg-black dark:bg-white text-white dark:text-black' 
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1">
            {activeTab === 'All' && renderAll()}
            {activeTab === 'People' && renderPeople()}
            {activeTab === 'Communities' && renderCommunities()}
            {activeTab === 'Marketplace' && renderMarket()}
            {activeTab === 'Videos' && renderVideos()}
            {activeTab === 'For You' && renderMasonry()}
        </div>
    </div>
  );
};

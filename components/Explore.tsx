
import React, { useState } from 'react';
import { ExploreItem } from '../types';
import { SearchIcon, PlayCircleIcon, HeartIcon } from './Icons';

interface ExploreProps {
  items: ExploreItem[];
}

const CATEGORIES = ['All', 'Decor', 'Travel', 'Architecture', 'Food', 'Art', 'Style', 'Music', 'DIY', 'Beauty'];

export const Explore: React.FC<ExploreProps> = ({ items }) => {
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
      const matchesTag = activeTag === 'All' || item.category === activeTag;
      const matchesSearch = !searchQuery || (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
  });

  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
        {/* Search Bar Sticky */}
        <div className="sticky top-0 z-10 p-3 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center px-4 py-2.5 transition-colors group focus-within:ring-2 ring-blue-500">
                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accounts, tags, places..." 
                  className="bg-transparent w-full ml-3 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                />
            </div>
            {/* Tags */}
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((tag) => (
                    <button 
                        key={tag} 
                        onClick={() => setActiveTag(tag)}
                        className={`px-4 py-1.5 rounded-lg border text-sm font-medium whitespace-nowrap transition ${
                            activeTag === tag 
                            ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' 
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>

        {/* Masonry Grid with Auto-Dense packing for a "Mosaic" feel */}
        <div className="p-1 md:p-4 grid grid-cols-3 gap-1 md:gap-4 auto-rows-[120px] md:auto-rows-[250px] grid-flow-dense">
            {filteredItems.map((item, index) => {
                // Determine grid span pattern (Mosaic Logic)
                // Every 10th item is big (2x2) to create visual interest
                // Only apply if we are in 'All' view to keep the quilt pattern consistent, 
                // or just apply based on index for simplicity in filtered views too.
                const isBig = index % 10 === 0;
                const spanClass = isBig ? 'row-span-2 col-span-2' : 'row-span-1 col-span-1';

                return (
                    <div 
                        key={item.id} 
                        className={`relative group cursor-pointer overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-sm md:rounded-lg ${spanClass}`}
                    >
                        <img 
                          src={item.image} 
                          alt={item.category || "Explore"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        />
                        
                        {item.type === 'video' && (
                            <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                <PlayCircleIcon className="w-6 h-6" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2">
                            <div className="flex items-center gap-2 text-white font-bold mb-1">
                                <HeartIcon className="w-6 h-6" filled />
                                <span>{item.likes}</span>
                            </div>
                            {item.category && (
                                <span className="text-white/80 text-xs font-medium px-2 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                                    {item.category}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {filteredItems.length === 0 && (
                <div className="col-span-3 h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <SearchIcon className="w-12 h-12 mb-4 opacity-30" />
                    <p>No results found for "{searchQuery || activeTag}"</p>
                </div>
            )}
        </div>
    </div>
  );
};
import React from 'react';
import { ExploreItem } from '../types';
import { SearchIcon, PlayCircleIcon, HeartIcon } from './Icons';

interface ExploreProps {
  items: ExploreItem[];
}

export const Explore: React.FC<ExploreProps> = ({ items }) => {
  return (
    <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 transition-colors">
        {/* Search Bar Sticky */}
        <div className="sticky top-0 z-10 p-3 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center px-4 py-2.5 transition-colors group focus-within:ring-2 ring-blue-500">
                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  placeholder="Search accounts, tags, places..." 
                  className="bg-transparent w-full ml-3 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                />
            </div>
            {/* Tags */}
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {['Decor', 'Travel', 'Architecture', 'Food', 'Art', 'Style', 'Music', 'DIY', 'Beauty'].map((tag, i) => (
                    <button key={i} className="px-4 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        {tag}
                    </button>
                ))}
            </div>
        </div>

        {/* Masonry Grid Simulation */}
        <div className="p-1 md:p-4 grid grid-cols-3 gap-1 md:gap-4 auto-rows-[120px] md:auto-rows-[300px]">
            {items.map((item, index) => (
                <div 
                    key={item.id} 
                    className={`relative group cursor-pointer overflow-hidden bg-gray-200 dark:bg-gray-800 ${
                        (index % 7 === 0) ? 'row-span-2 col-span-2' : 'row-span-1 col-span-1'
                    }`}
                >
                    <img 
                      src={item.image} 
                      alt="Explore" 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                    />
                    
                    {item.type === 'video' && (
                        <div className="absolute top-2 right-2 text-white drop-shadow-md">
                            <PlayCircleIcon className="w-6 h-6" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <HeartIcon className="w-6 h-6" filled />
                            <span>{item.likes}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
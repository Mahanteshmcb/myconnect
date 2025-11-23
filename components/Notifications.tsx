
import React from 'react';
import { Notification, User } from '../types';
import { HeartIcon, CommentIcon, CheckIcon, BellIcon, PlusIcon } from './Icons';

interface NotificationsProps {
  notifications: Notification[];
  onViewProfile: (user?: User) => void;
}

const NotificationItem: React.FC<{ notification: Notification, onViewProfile: (user?: User) => void }> = ({ notification, onViewProfile }) => {
  let icon;
  let iconBg;

  switch (notification.type) {
    case 'like':
      icon = <HeartIcon className="w-4 h-4 text-white" filled />;
      iconBg = 'bg-red-500';
      break;
    case 'comment':
      icon = <CommentIcon className="w-4 h-4 text-white" />;
      iconBg = 'bg-blue-500';
      break;
    case 'follow':
      icon = <PlusIcon className="w-4 h-4 text-white" />;
      iconBg = 'bg-purple-500';
      break;
    case 'mention':
      icon = <span className="text-white text-xs font-bold">@</span>;
      iconBg = 'bg-orange-500';
      break;
    default:
      icon = <BellIcon className="w-4 h-4 text-white" />;
      iconBg = 'bg-gray-500';
  }

  return (
    <div className={`p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer border-b border-gray-50 dark:border-gray-900 ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
      <div className="relative" onClick={() => notification.user && onViewProfile(notification.user)}>
        {notification.user ? (
          <img src={notification.user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-800" alt="" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${iconBg} border-2 border-white dark:border-black flex items-center justify-center`}>
           {icon}
        </div>
      </div>
      
      <div className="flex-1">
         <p className="text-sm text-gray-900 dark:text-white leading-snug">
            {notification.user && <span className="font-bold mr-1 hover:underline" onClick={() => onViewProfile(notification.user)}>{notification.user.name}</span>}
            <span className="text-gray-600 dark:text-gray-300">{notification.content}</span>
         </p>
         <span className="text-xs text-gray-400 mt-1 block">{notification.timestamp}</span>
      </div>

      {notification.targetImage && (
          <img src={notification.targetImage} className="w-12 h-12 rounded object-cover ml-2" alt="Content" />
      )}
      
      {notification.type === 'follow' && (
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">
              Follow Back
          </button>
      )}
    </div>
  );
};

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onViewProfile }) => {
  return (
    <div className="max-w-2xl mx-auto h-full bg-white dark:bg-black flex flex-col transition-colors">
       <div className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 flex justify-between items-center">
           <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
           <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Mark all as read</button>
       </div>
       
       <div className="flex-1 overflow-y-auto pb-20">
           <div className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">New</div>
           {notifications.filter(n => !n.read).length > 0 ? 
             notifications.filter(n => !n.read).map(n => <NotificationItem key={n.id} notification={n} onViewProfile={onViewProfile} />) :
             <div className="p-8 text-center text-gray-400 text-sm italic">No new notifications</div>
           }
           
           <div className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 mt-2">Earlier</div>
           {notifications.filter(n => n.read).map(n => (
               <NotificationItem key={n.id} notification={n} onViewProfile={onViewProfile} />
           ))}
       </div>
    </div>
  );
};

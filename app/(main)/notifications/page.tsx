"use client";

import { useStore, AppNotification } from "@/lib/store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, Star, Shield, Info, CheckCheck } from "lucide-react";
import Image from "next/image";

// Simple time ago helper
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
}

const getIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'like': return <Heart className="w-4 h-4 text-white fill-crimson" />;
    case 'match': return <MessageCircle className="w-4 h-4 text-white fill-blue-500" />;
    case 'superlike': return <Star className="w-4 h-4 text-white fill-amber-500" />;
    case 'system': return <Info className="w-4 h-4 text-white" />;
    case 'verified': return <Shield className="w-4 h-4 text-white fill-green-500" />;
    default: return <Bell className="w-4 h-4 text-white" />;
  }
};

const getBgColor = (type: AppNotification['type']) => {
  switch (type) {
    case 'like': return 'bg-crimson';
    case 'match': return 'bg-blue-500';
    case 'superlike': return 'bg-amber-500';
    case 'verified': return 'bg-green-500';
    default: return 'bg-white/20';
  }
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshNotifications } = useStore();
  const [filter, setFilter] = useState<'all' | 'match' | 'system'>('all');

  useEffect(() => {
    void refreshNotifications(30);
  }, [refreshNotifications]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'match') return ['match', 'like', 'superlike'].includes(n.type);
    if (filter === 'system') return ['system', 'verified', 'boost'].includes(n.type);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080808] pb-24 text-white lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Notifications</h1>
          <button 
            onClick={() => void markAllNotificationsRead()}
            className="p-2 text-white/50 transition-colors hover:text-white"
          >
            <CheckCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'match', 'system'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === f 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4 lg:max-w-4xl">
          <AnimatePresence initial={false}>
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-white/30"
              >
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No notifications yet</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => void markNotificationRead(notification.id)}
                  className={`relative p-4 rounded-2xl border transition-colors cursor-pointer group ${
                    notification.isRead 
                      ? 'bg-transparent border-white/5' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon/Avatar */}
                    <div className="relative flex-shrink-0">
                      {notification.senderAvatar ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                          <Image 
                            src={notification.senderAvatar} 
                            alt="" 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBgColor(notification.type)} bg-opacity-20`}>
                          {getIcon(notification.type)}
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      {notification.senderAvatar && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getBgColor(notification.type)} border-2 border-[#080808]`}>
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-sm font-bold truncate pr-2 ${notification.isRead ? 'text-white/70' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-[10px] text-white/30 whitespace-nowrap">
                          {timeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className={`text-xs ${notification.isRead ? 'text-white/40' : 'text-white/80'} line-clamp-2`}>
                        {notification.message}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-crimson shadow-[0_0_10px_rgba(232,25,44,0.5)]" />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match, mockMatches, mockMessages } from './mockMatches';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  job: string;
  company: string;
  education: string;
  height: string;
  relationshipGoal: string;
  interests: string[];
  isVerified: boolean;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  stats: {
    likesReceived: number;
    matches: number;
    profileViews: number;
  };
  boosts: number;
}

interface AppState {
  currentUser: UserProfile | null;
  isPro: boolean;
  matches: Match[];
  notifications: AppNotification[];
  
  // Actions
  togglePro: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: AppNotification) => void;
  addBoosts: (amount: number) => void;
  consumeBoost: () => void;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'match' | 'message' | 'superlike' | 'boost' | 'verified' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  senderAvatar?: string;
  link?: string;
}

// Mock initial user
const initialUser: UserProfile = {
  id: 'me',
  name: 'Alex',
  age: 24,
  bio: "Adventure seeker & coffee enthusiast. ☕️🏔️\nLooking for someone to explore the city with.",
  photos: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  ],
  job: 'Product Designer',
  company: 'Airbnb',
  education: 'Stanford University',
  height: "5'10\"",
  relationshipGoal: 'Long-term partner',
  interests: ['Photography', 'Hiking', 'Sushi', 'Design', 'Travel'],
  isVerified: true,
  location: {
    lat: 37.7749,
    lng: -122.4194,
    city: 'San Francisco',
  },
  stats: {
    likesReceived: 142,
    matches: 28,
    profileViews: 1056,
  },
  boosts: 2,
};

const initialNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'Sarah liked your profile',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isRead: false,
    senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    type: 'match',
    title: 'It\'s a Match!',
    message: 'You and Jessica matched 🔥',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    senderAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '3',
    type: 'superlike',
    title: 'Super Like!',
    message: 'Emily super liked you ⭐',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    senderAvatar: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: initialUser,
      isPro: false,
      matches: mockMatches,
      notifications: initialNotifications,

      togglePro: () => set((state) => ({ isPro: !state.isPro })),
      
      updateProfile: (updates) => 
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      addBoosts: (amount) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, boosts: (state.currentUser.boosts || 0) + amount }
            : null,
        })),
      consumeBoost: () =>
        set((state) => ({
          currentUser: state.currentUser && state.currentUser.boosts > 0
            ? { ...state.currentUser, boosts: state.currentUser.boosts - 1 }
            : state.currentUser,
        })),
    }),
    {
      name: 'ignite-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser, 
        isPro: state.isPro,
        notifications: state.notifications 
      }),
    }
  )
);

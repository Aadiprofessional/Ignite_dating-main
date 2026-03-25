export interface Match {
  id: string;
  matchId?: string;
  conversationId?: string;
  otherUserId?: string;
  username?: string;
  otherFullName?: string;
  photoUrls?: string[];
  name: string;
  avatar: string;
  isNew: boolean;
  online: boolean;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isVerified: boolean;
}

export interface Message {
  id: string;
  senderId: string; // 'me' or 'other'
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'gif' | 'voice' | 'notification';
  reactions?: string[]; // Emojis
  mediaUrl?: string;
  voiceDuration?: string;
}

export const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Sarah',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    isNew: true,
    online: true,
    lastMessage: "Hey! I saw you like hiking too 🏔️",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unreadCount: 1,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Jessica',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    isNew: true,
    online: false,
    lastMessage: "Haha exactly! 😂",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0,
    isVerified: false,
  },
  {
    id: '3',
    name: 'Emily',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    isNew: false,
    online: true,
    lastMessage: "When are you free next week?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 0,
    isVerified: true,
  },
  {
    id: '4',
    name: 'Olivia',
    avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
    isNew: false,
    online: false,
    lastMessage: "Sent a photo",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    unreadCount: 0,
    isVerified: true,
  },
  {
    id: '5',
    name: 'Sophia',
    avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
    isNew: false,
    online: true,
    lastMessage: "That sounds amazing!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    unreadCount: 0,
    isVerified: false,
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      senderId: 'other',
      text: "Hey! I saw you like hiking too 🏔️",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'read',
      type: 'text',
    },
    {
      id: 'm2',
      senderId: 'me',
      text: "Yeah! I go to the mountains almost every weekend. Do you have a favorite trail?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      status: 'read',
      type: 'text',
    },
    {
      id: 'm3',
      senderId: 'other',
      text: "I love the PCT section near here. The views are incredible!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4),
      status: 'read',
      type: 'text',
      reactions: ['❤️'],
    },
    {
      id: 'm4',
      senderId: 'other',
      text: "",
      mediaUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4),
      status: 'read',
      type: 'image',
    },
    {
      id: 'm5',
      senderId: 'me',
      text: "Wow, that looks stunning! We should go sometime.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'delivered',
      type: 'text',
    },
    {
      id: 'm6',
      senderId: 'other',
      text: "Liked your message",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      status: 'read',
      type: 'notification',
    },
  ],
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match, mockMatches } from './mockMatches';
import { Profile } from './mockProfiles';
import {
  AccountState,
  api,
  ApiError,
  AuthSession,
  ChatListItem,
  IncomingLike,
  WalletInfo,
  mapApiDiscoverProfile,
  mapApiChatListItem,
  mapApiMatch,
  mapApiNotification,
  mapApiUserToProfile,
  normalizeAccountState,
  OnboardingStatusPayload,
  SignupPayload,
  SwipeAction,
  SwipeResponse,
  UniversityOption,
  VerificationRequest,
} from './api';

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
  preferences: {
    minAge: number;
    maxAge: number;
    maxDistanceKm: number;
    interestedIn: string[];
    showMe: boolean;
  };
}

interface AppState {
  currentUser: UserProfile | null;
  session: AuthSession | null;
  isPro: boolean;
  matches: Match[];
  discoverProfiles: Profile[];
  notifications: AppNotification[];
  incomingLikes: IncomingLikeProfile[];
  accountState: AccountState | null;
  onboardingStatus: OnboardingStatusPayload | null;
  universities: UniversityOption[];
  wallet: WalletInfo | null;
  
  // Actions
  signup: (payload: SignupPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrateFromApi: () => Promise<void>;
  refreshDiscover: (options?: { limit?: number; university_mode?: 'all' | 'same_university'; search?: string }) => Promise<void>;
  sendSwipe: (targetId: string, action: SwipeAction | 'pass') => Promise<SwipeResponse | null>;
  refreshIncomingLikes: (options?: { limit?: number; offset?: number }) => Promise<void>;
  respondIncomingLike: (swiperUserId: string, decision: 'accept' | 'reject') => Promise<SwipeResponse | null>;
  refreshMatches: () => Promise<void>;
  refreshNotifications: (limit?: number) => Promise<void>;
  togglePro: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  reportUser: (userId: string, reason: string, details?: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  addNotification: (notification: AppNotification) => void;
  addBoosts: (amount: number) => void;
  consumeBoost: () => void;
  refreshOnboardingStatus: () => Promise<OnboardingStatusPayload | null>;
  refreshWallet: () => Promise<WalletInfo | null>;
  searchUniversities: (search: string) => Promise<UniversityOption[]>;
  uploadVerificationDocument: (file: File) => Promise<string>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  submitOnboardingAndVerification: (payload: {
    first_name: string;
    last_name: string;
    nick_name?: string;
    birth_date: string;
    passing_year: number;
    gender: string;
    pronouns?: string;
    height_cm: number;
    bio: string;
    occupation: string;
    education: string;
    interests: string[];
    relationship_goals: string[];
    interested_in: string[];
    min_age: number;
    max_age: number;
    max_distance_km: number;
    show_me_on_ignite: boolean;
    university_id?: string;
    custom_university_name?: string;
    document_url: string;
    phone_number: string;
    instagram_link?: string;
    wechat_link?: string;
    xiaohongshu_link?: string;
    photo_urls: string[];
  }) => Promise<VerificationRequest | null>;
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

export interface IncomingLikeProfile {
  swipeId: string;
  swiperId: string;
  likedAt: Date;
  action: string;
  userId: string;
  username: string;
  name: string;
  bio: string;
  photos: string[];
  city: string;
  country: string;
  universityName: string;
  distanceKm: number;
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
  preferences: {
    minAge: 18,
    maxAge: 35,
    maxDistanceKm: 50,
    interestedIn: ['female'],
    showMe: true,
  },
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

const parseAccountState = (payload: Record<string, unknown>): AccountState | null => {
  return normalizeAccountState(payload.account_state);
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const pickPayloadArray = (payload: unknown, key: string): Record<string, unknown>[] => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  const dataResult = asRecord(data.result);
  const candidates = [root[key], data[key], result[key], dataResult[key]];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Record<string, unknown>[];
    }
  }
  return [];
};

const pickSwipePayload = (payload: unknown): SwipeResponse => {
  const root = asRecord(payload);
  if (root.result || root.target_user || root.verification || root.user) {
    return root as SwipeResponse;
  }
  const data = asRecord(root.data);
  if (data.result || data.target_user || data.verification || data.user) {
    return data as SwipeResponse;
  }
  return {};
};

const mapIncomingLike = (item: IncomingLike): IncomingLikeProfile => ({
  swipeId: item.swipe_id,
  swiperId: item.swiper_id,
  likedAt: item.liked_at ? new Date(item.liked_at) : new Date(),
  action: item.action,
  userId: item.user_id,
  username: item.username || '',
  name: item.full_name || item.username || 'Ignite User',
  bio: item.bio || '',
  photos: Array.isArray(item.photo_urls) && item.photo_urls.length ? item.photo_urls : ['https://picsum.photos/seed/incoming-like/400/600'],
  city: item.city || '',
  country: item.country || '',
  universityName: item.university_name || '',
  distanceKm: typeof item.distance_km === 'number' ? item.distance_km : 0,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: initialUser,
      session: null,
      isPro: false,
      matches: mockMatches,
      discoverProfiles: [],
      notifications: initialNotifications,
      incomingLikes: [],
      accountState: null,
      onboardingStatus: null,
      universities: [],
      wallet: null,

      signup: async (payload) => {
        await api.signup(payload);
      },

      login: async (email, password) => {
        const { session, user, accountState } = await api.login(email, password);
        set({ session, accountState });
        try {
          const me = await api.me(session.accessToken);
          const meData = (me.data?.data as Record<string, unknown>) || me.data || {};
          const userProfile = mapApiUserToProfile((user || {}) as Record<string, unknown>, meData);
          const meAccountState = parseAccountState(meData) || accountState;
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              ...userProfile,
              boosts: state.currentUser?.boosts ?? 0,
              stats: {
                likesReceived: state.currentUser?.stats.likesReceived ?? 0,
                matches: state.currentUser?.stats.matches ?? 0,
                profileViews: state.currentUser?.stats.profileViews ?? 0,
              },
            },
            accountState: meAccountState || state.accountState,
          }));
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().logout();
            throw error;
          }
          const userProfile = mapApiUserToProfile((user || {}) as Record<string, unknown>);
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              ...userProfile,
              boosts: state.currentUser?.boosts ?? 0,
              stats: {
                likesReceived: state.currentUser?.stats.likesReceived ?? 0,
                matches: state.currentUser?.stats.matches ?? 0,
                profileViews: state.currentUser?.stats.profileViews ?? 0,
              },
            },
          }));
        }
        await Promise.allSettled([
          get().refreshDiscover({ limit: 20 }),
          get().refreshMatches(),
          get().refreshNotifications(30),
          get().refreshIncomingLikes({ limit: 20, offset: 0 }),
        ]);
        await get().refreshOnboardingStatus().catch(() => null);
        await get().refreshWallet().catch(() => null);
      },

      logout: () =>
        set({
          session: null,
          currentUser: null,
          matches: [],
          discoverProfiles: [],
          notifications: [],
          incomingLikes: [],
          accountState: null,
          onboardingStatus: null,
          universities: [],
          wallet: null,
          isPro: false,
        }),

      hydrateFromApi: async () => {
        const token = get().session?.accessToken;
        if (!token) return;
        try {
          const me = await api.me(token);
          const meData = (me.data?.data as Record<string, unknown>) || me.data || {};
          const meUser = (meData.user as Record<string, unknown>) || {};
          const accountState = parseAccountState(meData);
          set((state) => ({
            currentUser: {
              ...(state.currentUser || initialUser),
              ...mapApiUserToProfile(meUser, meData),
            },
            accountState: accountState || state.accountState,
          }));
          await Promise.all([
            get().refreshDiscover({ limit: 20 }),
            get().refreshMatches(),
            get().refreshNotifications(30),
            get().refreshIncomingLikes({ limit: 20, offset: 0 }),
          ]);
          await get().refreshOnboardingStatus();
          await get().refreshWallet();
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().logout();
            return;
          }
          throw error;
        }
      },

      refreshDiscover: async (options = { limit: 20 }) => {
        const token = get().session?.accessToken;
        if (!token) return;
        try {
          const discover = await api.discover(token, options);
          const profiles = pickPayloadArray(discover.data, 'profiles').map((profile) =>
            mapApiDiscoverProfile(profile as Record<string, unknown>)
          );
          set({ discoverProfiles: profiles });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().logout();
            return;
          }
          throw error;
        }
      },

      sendSwipe: async (targetId, action) => {
        const token = get().session?.accessToken;
        if (!token) return null;
        const response = await api.swipe(token, targetId, action);
        const swipePayload = pickSwipePayload(response.data);
        set((state) => ({
          discoverProfiles:
            action === 'unlock_profile'
              ? state.discoverProfiles
              : state.discoverProfiles.filter((profile) => profile.id !== targetId),
        }));
        if (swipePayload?.result?.is_match) {
          await Promise.allSettled([get().refreshMatches(), get().refreshNotifications(30)]);
        }
        return swipePayload;
      },

      refreshIncomingLikes: async (options = { limit: 20, offset: 0 }) => {
        const token = get().session?.accessToken;
        if (!token) return;
        const response = await api.incomingLikes(token, options);
        const incomingLikes = pickPayloadArray(response.data, 'incoming_likes').map((item) =>
          mapIncomingLike(item as unknown as IncomingLike)
        );
        set((state) => ({
          incomingLikes,
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                stats: {
                  ...state.currentUser.stats,
                  likesReceived: incomingLikes.length,
                },
              }
            : state.currentUser,
        }));
      },

      respondIncomingLike: async (swiperUserId, decision) => {
        const token = get().session?.accessToken;
        if (!token) return null;
        const response = await api.respondIncomingLike(token, swiperUserId, decision);
        const payload = pickSwipePayload(response.data);
        set((state) => ({
          incomingLikes: state.incomingLikes.filter((like) => like.swiperId !== swiperUserId),
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                stats: {
                  ...state.currentUser.stats,
                  likesReceived: Math.max(
                    0,
                    state.currentUser.stats.likesReceived - 1
                  ),
                },
              }
            : state.currentUser,
        }));
        if (payload?.result?.is_match) {
          await Promise.allSettled([get().refreshMatches(), get().refreshNotifications(30)]);
        }
        return {
          result: payload?.result,
          target_user: (payload?.target_user || asRecord(payload).user) as Record<string, unknown> | undefined,
        };
      },

      refreshMatches: async () => {
        const token = get().session?.accessToken;
        if (!token) return;
        let mapped = [] as Match[];
        try {
          const chats = await api.chats(token, { limit: 50, offset: 0 });
          mapped = pickPayloadArray(chats.data, 'chats').map((chat) => mapApiChatListItem(chat as unknown as ChatListItem));
        } catch {
          const matches = await api.matches(token);
          mapped = pickPayloadArray(matches.data, 'matches').map((match) => mapApiMatch(match as Record<string, unknown>));
        }
        set((state) => ({
          matches: mapped,
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                stats: {
                  ...state.currentUser.stats,
                  matches: mapped.length,
                },
              }
            : state.currentUser,
        }));
      },

      refreshNotifications: async (limit = 30) => {
        const token = get().session?.accessToken;
        if (!token) return;
        const notifications = await api.notifications(token, limit);
        const mapped = pickPayloadArray(notifications.data, 'notifications').map((item) =>
          mapApiNotification(item as Record<string, unknown>)
        );
        set({ notifications: mapped });
      },

      togglePro: () => set((state) => ({ isPro: !state.isPro })),
      
      updateProfile: async (updates) => {
        const token = get().session?.accessToken;
        const currentUser = get().currentUser;
        if (!currentUser) return;
        const [firstName, ...restName] = (updates.name || currentUser.name).split(' ');
        const payload: Record<string, unknown> = {
          first_name: firstName,
          last_name: restName.join(' '),
          bio: updates.bio ?? currentUser.bio,
          occupation: updates.job ?? currentUser.job,
          education: updates.education ?? currentUser.education,
          interests: updates.interests ?? currentUser.interests,
          relationship_goal: updates.relationshipGoal ?? currentUser.relationshipGoal,
        };
        const nextPreferences = {
          minAge: updates.preferences?.minAge ?? currentUser.preferences.minAge,
          maxAge: updates.preferences?.maxAge ?? currentUser.preferences.maxAge,
          maxDistanceKm: updates.preferences?.maxDistanceKm ?? currentUser.preferences.maxDistanceKm,
          interestedIn: updates.preferences?.interestedIn ?? currentUser.preferences.interestedIn,
          showMe: updates.preferences?.showMe ?? currentUser.preferences.showMe,
        };
        if (token) {
          await api.updateMe(token, payload);
          if (updates.photos) {
            const urls = updates.photos.filter((photo) => /^https?:\/\//.test(photo));
            if (urls.length) {
              await api.replaceImages(token, urls);
            }
          }
          await api.updatePreferences(token, {
            min_age: nextPreferences.minAge,
            max_age: nextPreferences.maxAge,
            max_distance_km: nextPreferences.maxDistanceKm,
            interested_in: nextPreferences.interestedIn,
            show_me: nextPreferences.showMe,
          });
        }
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates, preferences: { ...state.currentUser.preferences, ...updates.preferences } }
            : null,
        }));
      },

      markNotificationRead: async (id) => {
        const token = get().session?.accessToken;
        if (token) {
          await api.markNotificationRead(token, id);
        }
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      markAllNotificationsRead: async () => {
        const token = get().session?.accessToken;
        const unreadIds = get()
          .notifications.filter((notification) => !notification.isRead)
          .map((notification) => notification.id);
        if (token && unreadIds.length) {
          await Promise.all(unreadIds.map((id) => api.markNotificationRead(token, id)));
        }
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      reportUser: async (userId, reason, details = '') => {
        const token = get().session?.accessToken;
        if (!token) return;
        await api.report(token, userId, reason, details);
      },

      blockUser: async (userId) => {
        const token = get().session?.accessToken;
        if (!token) return;
        await api.block(token, userId);
        set((state) => ({
          matches: state.matches.filter((match) => match.id !== userId),
        }));
      },

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
      refreshOnboardingStatus: async () => {
        const token = get().session?.accessToken;
        if (!token) return null;
        const status = await api.onboardingStatus(token);
        const data = status.data || null;
        set((state) => ({
          onboardingStatus: data,
          accountState:
            normalizeAccountState({
              ...(state.accountState || {}),
              onboarding_completed: Boolean(data?.onboarding?.completed ?? state.accountState?.onboarding_completed),
              onboarding_step:
                typeof data?.onboarding?.step === 'number'
                  ? data.onboarding.step
                  : (state.accountState?.onboarding_step ?? 0),
              verification_status:
                typeof data?.verification?.status === 'string'
                  ? data.verification.status
                  : state.accountState?.verification_status,
              access_status: data?.access_status ?? state.accountState?.access_status,
              next_action: data?.next_action ?? state.accountState?.next_action,
              status_message: data?.status_message ?? state.accountState?.status_message,
              can_use_app:
                state.accountState?.can_use_app ||
                data?.access_status === 'approved' ||
                data?.verification?.status === 'approved',
            }) || state.accountState,
        }));
        return data;
      },
      refreshWallet: async () => {
        const token = get().session?.accessToken;
        const uid = get().currentUser?.id;
        if (!token || !uid) {
          set({ wallet: null, isPro: false });
          return null;
        }
        const response = await api.getCoins(token, uid);
        const wallet = response.data?.wallet || null;
        const isActive = wallet?.active_subscription?.status === 'active';
        set({ wallet, isPro: Boolean(isActive) });
        return wallet;
      },
      searchUniversities: async (search) => {
        const token = get().session?.accessToken;
        if (!token) return [];
        const response = await api.universities(token, search);
        const universities = response.data?.universities || [];
        set({ universities });
        return universities;
      },
      uploadVerificationDocument: async (file) => {
        const currentUserId = get().currentUser?.id || crypto.randomUUID();
        return api.uploadVerificationDocument(file, currentUserId);
      },
      uploadProfilePhoto: async (file) => {
        const currentUserId = get().currentUser?.id || crypto.randomUUID();
        return api.uploadProfilePhoto(file, currentUserId);
      },
      submitOnboardingAndVerification: async (payload) => {
        const token = get().session?.accessToken;
        if (!token) return null;
        const validPhotoUrls = payload.photo_urls.filter((url) => /^https?:\/\//.test(url));
        if (validPhotoUrls.length) {
          await api.replaceImages(token, validPhotoUrls);
        }
        await api.onboardingBasics(token, {
          first_name: payload.first_name,
          last_name: payload.last_name,
          birth_date: payload.birth_date,
          gender: payload.gender,
          pronouns: payload.pronouns || '',
          height_cm: payload.height_cm,
        });
        await api.onboardingAbout(token, {
          bio: payload.bio,
          occupation: payload.occupation,
          education: payload.education,
        });
        await api.onboardingInterests(token, payload.interests);
        await api.onboardingGoals(token, payload.relationship_goals);
        if (payload.university_id) {
          await api.onboardingPreferences(token, {
            interested_in: payload.interested_in,
            min_age: payload.min_age,
            max_age: payload.max_age,
            max_distance_km: payload.max_distance_km,
            show_me_on_ignite: payload.show_me_on_ignite,
            university_id: payload.university_id,
          });
        }
        const verificationBody = payload.university_id
          ? {
              university_id: payload.university_id,
              document_url: payload.document_url,
              phone_number: payload.phone_number,
              passing_year: payload.passing_year,
              nick_name: payload.nick_name || undefined,
              instagram_link: payload.instagram_link || undefined,
              wechat_link: payload.wechat_link || undefined,
              xiaohongshu_link: payload.xiaohongshu_link || undefined,
            }
          : {
              custom_university_name: payload.custom_university_name || '',
              document_url: payload.document_url,
              phone_number: payload.phone_number,
              passing_year: payload.passing_year,
              nick_name: payload.nick_name || undefined,
              instagram_link: payload.instagram_link || undefined,
              wechat_link: payload.wechat_link || undefined,
              xiaohongshu_link: payload.xiaohongshu_link || undefined,
            };
        const verificationResponse = await api.submitVerification(token, verificationBody);
        await get().hydrateFromApi();
        await get().refreshOnboardingStatus();
        return verificationResponse.data?.verification_request || null;
      },
    }),
    {
      name: 'ignite-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        session: state.session,
        isPro: state.isPro,
        notifications: state.notifications,
        incomingLikes: state.incomingLikes,
        accountState: state.accountState,
        wallet: state.wallet,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.session) {
          const sessionRecord = state.session as unknown as Record<string, unknown>;
          const normalizedAccessToken =
            typeof sessionRecord.accessToken === 'string'
              ? sessionRecord.accessToken
              : typeof sessionRecord.access_token === 'string'
                ? sessionRecord.access_token
                : typeof sessionRecord.token === 'string'
                  ? sessionRecord.token
                  : '';
          const normalizedRefreshToken =
            typeof sessionRecord.refreshToken === 'string'
              ? sessionRecord.refreshToken
              : typeof sessionRecord.refresh_token === 'string'
                ? sessionRecord.refresh_token
                : undefined;
          state.session = normalizedAccessToken
            ? {
                accessToken: normalizedAccessToken,
                refreshToken: normalizedRefreshToken,
              }
            : null;
        }
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          timestamp: notification.timestamp instanceof Date ? notification.timestamp : new Date(notification.timestamp),
        }));
        state.matches = state.matches.map((match) => ({
          ...match,
          timestamp: match.timestamp instanceof Date ? match.timestamp : new Date(match.timestamp),
        }));
        state.incomingLikes = state.incomingLikes.map((item) => ({
          ...item,
          likedAt: item.likedAt instanceof Date ? item.likedAt : new Date(item.likedAt),
        }));
      },
    }
  )
);

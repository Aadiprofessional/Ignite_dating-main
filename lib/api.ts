import { Match } from './mockMatches';
import { Profile } from './mockProfiles';
import type { AppNotification, UserProfile } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:49191';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
}

export interface AccountState {
  onboarding_completed: boolean;
  onboarding_step: number;
  verification_status: string;
  can_use_app: boolean;
}

export interface VerificationRequest {
  id?: string;
  user_id?: string;
  status?: string;
  university_id?: string;
  custom_university_name?: string;
  document_url?: string;
  phone_number?: string;
}

export interface OnboardingStatusPayload {
  onboarding?: {
    step?: number;
    completed?: boolean;
  };
  verification?: {
    status?: string;
    rejection_reason?: string | null;
    latest_request?: VerificationRequest | null;
  };
  preferences?: Record<string, unknown>;
}

export interface UniversityOption {
  id: string;
  name: string;
  city: string;
  country: string;
  is_active: boolean;
}

export interface SignupPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
}

export interface EventRecord {
  id: string;
  creator_id?: string;
  title: string;
  description?: string;
  image_url?: string;
  location_name?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  starts_at?: string;
  ends_at?: string;
  capacity?: number;
  status?: string;
  approved_participants?: number;
  available_slots?: number;
}

export interface EventJoinRequest {
  id: string;
  event_id?: string;
  requester_id?: string;
  status?: string;
  requester_message?: string;
  creator_note?: string;
  events?: EventRecord;
  requester_profile?: {
    user_id?: string;
    username?: string;
    full_name?: string;
  };
}

interface ApiCallOptions {
  method?: HttpMethod;
  path: string;
  token?: string;
  body?: unknown;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiErrorPayload {
  message?: string;
  error?: string;
  code?: string | number;
}

const normalizeErrorField = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.message === 'string') return candidate.message;
  if (typeof candidate.error === 'string') return candidate.error;
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null, fallback: string) {
    super(normalizeErrorField(payload?.message) || normalizeErrorField(payload?.error) || fallback);
    this.status = status;
    this.payload = payload;
  }
}

const apiCall = async <T>({ method = 'GET', path, token, body }: ApiCallOptions): Promise<ApiResponse<T>> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  const parsed = raw ? safeJson(raw) : {};

  if (!response.ok) {
    throw new ApiError(response.status, parsed as ApiErrorPayload, `Request failed (${response.status})`);
  }

  return {
    data: parsed as T,
    status: response.status,
  };
};

const safeJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

const pickString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const pickNumber = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const pickArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const getSupabaseConfig = (bucketEnvKey: string, fallbackBucket: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env[bucketEnvKey] || fallbackBucket;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase storage is not configured.');
  }
  return { supabaseUrl, supabaseAnonKey, bucket };
};

const buildStorageObjectPath = (userId: string, fileName: string) => {
  const extension = fileName.includes('.') ? fileName.split('.').pop() || 'bin' : 'bin';
  const sanitizedUserId = (userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${sanitizedUserId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
};

const uploadToSupabaseStorage = async (options: {
  file: File;
  userId: string;
  bucketEnvKey: string;
  fallbackBucket: string;
  uploadErrorMessage: string;
}) => {
  const { file, userId, bucketEnvKey, fallbackBucket, uploadErrorMessage } = options;
  const { supabaseUrl, supabaseAnonKey, bucket } = getSupabaseConfig(bucketEnvKey, fallbackBucket);
  const objectPath = buildStorageObjectPath(userId, file.name);
  const encodedObjectPath = objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedObjectPath}`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
        'x-upsert': 'true',
        'content-type': file.type || 'application/octet-stream',
      },
      body: file,
    }
  );

  if (!uploadResponse.ok) {
    const rawError = await uploadResponse.text();
    const parsedError = rawError ? safeJson(rawError) : {};
    const parsedMessage =
      typeof parsedError?.message === 'string'
        ? parsedError.message
        : typeof parsedError?.error === 'string'
          ? parsedError.error
          : '';
    if (parsedMessage.toLowerCase().includes('bucket not found')) {
      throw new Error(`Supabase bucket "${bucket}" not found. Create it first.`);
    }
    throw new Error(parsedMessage || uploadErrorMessage);
  }

  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedObjectPath}`;
};

const buildName = (profile: Record<string, unknown>) => {
  const fullName = pickString(profile.full_name);
  if (fullName) return fullName;
  const firstName = pickString(profile.first_name);
  const lastName = pickString(profile.last_name);
  const joinedName = `${firstName} ${lastName}`.trim();
  return joinedName || pickString(profile.username) || pickString(profile.name) || 'Ignite User';
};

const calcAge = (birthdate: string) => {
  if (!birthdate) return 24;
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return 24;
  const diff = Date.now() - birth.getTime();
  return Math.max(18, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
};

export const mapApiUserToProfile = (
  userPayload: Record<string, unknown>,
  mePayload?: Record<string, unknown>
): UserProfile => {
  const profilePayload = (mePayload?.profile as Record<string, unknown> | undefined) || {};
  const preferencesPayload = (mePayload?.preferences as Record<string, unknown> | undefined) || {};
  const interests = pickArray<string>(profilePayload.interests);
  const imagesPayload = pickArray<{ url?: string }>(mePayload?.images).map((item) => pickString(item?.url)).filter(Boolean);
  const images = imagesPayload.length ? imagesPayload : pickArray<string>(profilePayload.photo_urls).filter(Boolean);
  const birthdate = pickString(profilePayload.birth_date) || pickString(profilePayload.birthdate);
  const city = pickString(profilePayload.city);
  const country = pickString(profilePayload.country);
  const latitude = pickNumber(profilePayload.latitude);
  const longitude = pickNumber(profilePayload.longitude);
  const relationshipGoals = pickArray<string>(profilePayload.relationship_goals);
  const resolvedUserId =
    pickString((userPayload as { id?: string }).id) ||
    pickString((profilePayload as { user_id?: string }).user_id) ||
    'me';

  return {
    id: resolvedUserId,
    name: buildName(profilePayload),
    age: calcAge(birthdate),
    bio: pickString(profilePayload.bio),
    photos: images.length ? images : ['https://picsum.photos/seed/ignite-profile/400/600'],
    job: pickString(profilePayload.occupation),
    company: '',
    education: pickString(profilePayload.education),
    height:
      (typeof profilePayload.height_cm === 'number' ? `${profilePayload.height_cm} cm` : pickString(profilePayload.height_cm)) ||
      '170 cm',
    relationshipGoal: relationshipGoals[0] || pickString(profilePayload.relationship_goal) || 'Long-term partner',
    interests,
    isVerified: pickString((mePayload?.account_state as { verification_status?: string })?.verification_status) === 'approved',
    location: {
      lat: latitude,
      lng: longitude,
      city: [city, country].filter(Boolean).join(', ') || 'Unknown',
    },
    stats: {
      likesReceived: 0,
      matches: 0,
      profileViews: 0,
    },
    boosts: 0,
    preferences: {
      minAge: pickNumber(preferencesPayload.min_age, 18),
      maxAge: pickNumber(preferencesPayload.max_age, 35),
      maxDistanceKm: pickNumber(preferencesPayload.max_distance_km, 50),
      interestedIn: pickArray<string>(preferencesPayload.interested_in),
      showMe: typeof preferencesPayload.show_me === 'boolean' ? preferencesPayload.show_me : true,
    },
  };
};

export const mapApiDiscoverProfile = (item: Record<string, unknown>): Profile => {
  const profile = (item.profile as Record<string, unknown> | undefined) || item;
  const images = pickArray<{ url?: string }>(item.images).map((image) => pickString(image?.url)).filter(Boolean);
  const firstName = pickString(profile.first_name);
  const lastName = pickString(profile.last_name);
  const name = `${firstName} ${lastName}`.trim() || pickString(profile.name, 'Ignite User');

  return {
    id: pickString((item as { user_id?: string }).user_id || profile.user_id || profile.id || item.id, crypto.randomUUID()),
    name,
    age: calcAge(pickString(profile.birth_date) || pickString(profile.birthdate)),
    distance: Math.round(pickNumber(profile.distance_km, 0)),
    bio: pickString(profile.bio),
    photos: images.length ? images : ['https://picsum.photos/seed/ignite-discover/400/600'],
    interests: pickArray<string>(profile.interests),
    compatibility: Math.max(70, Math.min(99, Math.round(pickNumber(profile.compatibility_score, 85)))),
    job: pickString(profile.occupation, 'Member'),
    education: pickString(profile.education),
  };
};

export const mapApiMatch = (item: Record<string, unknown>): Match => {
  const profile =
    (item.other_user as Record<string, unknown> | undefined) ||
    (item.profile as Record<string, unknown> | undefined) ||
    {};
  const images = pickArray<{ url?: string }>(item.images).map((image) => pickString(image?.url)).filter(Boolean);
  const firstName = pickString(profile.first_name);
  const lastName = pickString(profile.last_name);
  const matchedAt = pickString((item as { matched_at?: string; created_at?: string }).matched_at) || pickString((item as { created_at?: string }).created_at);
  const timestamp = matchedAt ? new Date(matchedAt) : new Date();

  return {
    id: pickString((item as { user_id?: string }).user_id || profile.user_id || profile.id || item.id, crypto.randomUUID()),
    name: `${firstName} ${lastName}`.trim() || pickString(profile.full_name) || pickString(profile.username) || pickString(profile.name, 'New Match'),
    avatar: images[0] || 'https://picsum.photos/seed/ignite-match/100/100',
    isNew: true,
    online: false,
    lastMessage: 'You matched on Ignite',
    timestamp,
    unreadCount: 0,
    isVerified: false,
  };
};

export const mapApiNotification = (item: Record<string, unknown>): AppNotification => {
  const metadata = ((item.metadata || item.payload) as Record<string, unknown> | undefined) || {};
  const createdAt = pickString((item as { created_at?: string }).created_at);
  const typeRaw = pickString(item.type, 'system');
  const mapType: Record<string, AppNotification['type']> = {
    like: 'like',
    match: 'match',
    message: 'message',
    superlike: 'superlike',
    boost: 'boost',
    verified: 'verified',
    system: 'system',
  };
  const mappedType = mapType[typeRaw] || 'system';

  return {
    id: pickString((item as { id?: string }).id, crypto.randomUUID()),
    type: mappedType,
    title: pickString(item.title, 'Notification'),
    message: pickString(item.body) || pickString(item.message) || 'You have a new update.',
    timestamp: createdAt ? new Date(createdAt) : new Date(),
    isRead: Boolean(item.is_read),
    senderAvatar: pickString(metadata.sender_avatar),
    link: pickString(metadata.link),
  };
};

export const api = {
  signup: async (payload: SignupPayload) =>
    apiCall<{ user?: Record<string, unknown> }>({
      method: 'POST',
      path: '/api/auth/signup',
      body: payload,
    }),
  login: async (email: string, password: string) => {
    const { data } = await apiCall<{
      data?: {
        session?: { access_token?: string; refresh_token?: string; user?: Record<string, unknown> };
        user?: Record<string, unknown>;
        account_state?: AccountState;
        access_token?: string;
        refresh_token?: string;
      };
      session?: { access_token?: string; refresh_token?: string; user?: Record<string, unknown> };
      user?: Record<string, unknown>;
      account_state?: AccountState;
      access_token?: string;
      refresh_token?: string;
    }>({
      method: 'POST',
      path: '/api/auth/login',
      body: { email, password },
    });
    const payload = (data?.data as Record<string, unknown> | undefined) || (data as Record<string, unknown>);
    const sessionPayload = (payload.session as { access_token?: string; refresh_token?: string; user?: Record<string, unknown> } | undefined) || undefined;
    const token =
      sessionPayload?.access_token ||
      (typeof payload.access_token === 'string' ? payload.access_token : undefined);
    const refreshToken =
      sessionPayload?.refresh_token ||
      (typeof payload.refresh_token === 'string' ? payload.refresh_token : undefined);
    const userPayload =
      (payload.user as Record<string, unknown> | undefined) ||
      (sessionPayload?.user as Record<string, unknown> | undefined) ||
      {};
    const accountStatePayload = (payload.account_state as AccountState | undefined) || null;
    if (!token) {
      throw new ApiError(500, null, 'No access token received');
    }
    return {
      session: {
        accessToken: token,
        refreshToken,
      } as AuthSession,
      user: userPayload,
      accountState: accountStatePayload,
    };
  },
  me: async (token: string) =>
    apiCall<Record<string, unknown>>({
      path: '/api/auth/me',
      token,
    }),
  updateMe: async (token: string, body: Record<string, unknown>) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/me',
      token,
      body,
    }),
  updatePreferences: async (
    token: string,
    body: { min_age: number; max_age: number; max_distance_km: number; interested_in: string[]; show_me: boolean }
  ) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/preferences',
      token,
      body,
    }),
  replaceImages: async (token: string, urls: string[]) =>
    apiCall<Record<string, unknown>>({
      method: 'POST',
      path: '/api/images',
      token,
      body: {
        operation: 'replace_all',
        urls,
      },
    }),
  addImage: async (token: string, url: string) =>
    apiCall<Record<string, unknown>>({
      method: 'POST',
      path: '/api/images',
      token,
      body: {
        operation: 'add',
        url,
      },
    }),
  discover: async (
    token: string,
    options?: { limit?: number; university_mode?: 'all' | 'same_university'; search?: string }
  ) => {
    const limit = options?.limit ?? 20;
    const params = new URLSearchParams({ limit: String(limit) });
    if (options?.university_mode) params.set('university_mode', options.university_mode);
    if (options?.search?.trim()) params.set('search', options.search.trim());
    return apiCall<{ profiles?: Record<string, unknown>[] }>({
      path: `/api/discover?${params.toString()}`,
      token,
    });
  },
  universities: async (token: string, search: string) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    const query = params.toString();
    return apiCall<{ universities?: UniversityOption[] }>({
      path: `/api/universities${query ? `?${query}` : ''}`,
      token,
    });
  },
  onboardingStatus: async (token: string) =>
    apiCall<OnboardingStatusPayload>({
      path: '/api/onboarding/status',
      token,
    }),
  onboardingBasics: async (
    token: string,
    body: {
      first_name: string;
      last_name: string;
      birth_date: string;
      gender: string;
      pronouns?: string;
      height_cm: number;
    }
  ) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/onboarding/basics',
      token,
      body,
    }),
  onboardingAbout: async (token: string, body: { bio: string; occupation: string; education?: string }) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/onboarding/about',
      token,
      body,
    }),
  onboardingInterests: async (token: string, interests: string[]) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/onboarding/interests',
      token,
      body: { interests },
    }),
  onboardingGoals: async (token: string, relationshipGoals: string[]) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/onboarding/goals',
      token,
      body: { relationship_goals: relationshipGoals },
    }),
  onboardingPreferences: async (
    token: string,
    body: {
      interested_in: string[];
      min_age: number;
      max_age: number;
      max_distance_km: number;
      show_me_on_ignite: boolean;
      university_id: string;
    }
  ) =>
    apiCall<Record<string, unknown>>({
      method: 'PUT',
      path: '/api/onboarding/preferences',
      token,
      body,
    }),
  submitVerification: async (
    token: string,
    body:
      | { university_id: string; document_url: string; phone_number: string }
      | { custom_university_name: string; document_url: string; phone_number: string }
  ) =>
    apiCall<{ verification_request?: VerificationRequest }>({
      method: 'POST',
      path: '/api/verification/submit',
      token,
      body,
    }),
  uploadVerificationDocument: async (file: File, userId: string) =>
    uploadToSupabaseStorage({
      file,
      userId,
      bucketEnvKey: 'NEXT_PUBLIC_SUPABASE_VERIFICATION_BUCKET',
      fallbackBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'verification-documents',
      uploadErrorMessage: 'Failed to upload verification document.',
    }),
  uploadProfilePhoto: async (file: File, userId: string) =>
    uploadToSupabaseStorage({
      file,
      userId,
      bucketEnvKey: 'NEXT_PUBLIC_SUPABASE_PHOTOS_BUCKET',
      fallbackBucket: 'profile-photos',
      uploadErrorMessage: 'Failed to upload profile photo.',
    }),
  createEvent: async (
    token: string,
    body: {
      title: string;
      description: string;
      image_url?: string;
      location_name: string;
      address: string;
      city: string;
      country: string;
      latitude: number;
      longitude: number;
      starts_at: string;
      ends_at: string;
      capacity: number;
    }
  ) =>
    apiCall<{ event?: EventRecord; moderation?: { status?: string } }>({
      method: 'POST',
      path: '/api/events',
      token,
      body,
    }),
  listEvents: async (
    token: string,
    options?: {
      search?: string;
      city?: string;
      from_date?: string;
      to_date?: string;
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.search?.trim()) params.set('search', options.search.trim());
    if (options?.city?.trim()) params.set('city', options.city.trim());
    if (options?.from_date) params.set('from_date', options.from_date);
    if (options?.to_date) params.set('to_date', options.to_date);
    if (typeof options?.limit === 'number') params.set('limit', String(options.limit));
    if (typeof options?.offset === 'number') params.set('offset', String(options.offset));
    if (options?.status?.trim()) params.set('status', options.status.trim());
    const query = params.toString();
    return apiCall<{ events?: EventRecord[] }>({
      path: `/api/events${query ? `?${query}` : ''}`,
      token,
    });
  },
  listMyCreatedEvents: async (token: string) =>
    apiCall<{ events?: EventRecord[] }>({
      path: '/api/events/my/created',
      token,
    }),
  getEventDetails: async (token: string, eventId: string) =>
    apiCall<{ event?: EventRecord; my_join_request?: EventJoinRequest }>({
      path: `/api/events/${eventId}`,
      token,
    }),
  requestJoinEvent: async (token: string, eventId: string, message: string) =>
    apiCall<{ join_request?: EventJoinRequest }>({
      method: 'POST',
      path: `/api/events/${eventId}/join`,
      token,
      body: { message },
    }),
  listMyJoinRequests: async (token: string) =>
    apiCall<{ join_requests?: EventJoinRequest[] }>({
      path: '/api/events/my/join-requests',
      token,
    }),
  listEventJoinRequests: async (token: string, eventId: string) =>
    apiCall<{ join_requests?: EventJoinRequest[] }>({
      path: `/api/events/${eventId}/join-requests`,
      token,
    }),
  reviewEventJoinRequest: async (
    token: string,
    eventId: string,
    joinRequestId: string,
    body: { action: 'approve' | 'reject'; creator_note?: string }
  ) =>
    apiCall<{ join_request?: EventJoinRequest }>({
      method: 'PATCH',
      path: `/api/events/${eventId}/join-requests/${joinRequestId}`,
      token,
      body,
    }),
  swipe: async (token: string, targetId: string, action: 'like' | 'pass' | 'superlike') =>
    apiCall<Record<string, unknown>>({
      method: 'POST',
      path: '/api/swipes',
      token,
      body: { target_id: targetId, action },
    }),
  notifications: async (token: string, limit = 30) =>
    apiCall<{ notifications?: Record<string, unknown>[] }>({
      path: `/api/notifications?limit=${limit}`,
      token,
    }),
  markNotificationRead: async (token: string, notificationId: string) =>
    apiCall<Record<string, unknown>>({
      method: 'PATCH',
      path: `/api/notifications/${notificationId}/read`,
      token,
    }),
  matches: async (token: string) =>
    apiCall<{ matches?: Record<string, unknown>[] }>({
      path: '/api/matches',
      token,
    }),
  report: async (token: string, reportedId: string, reason: string, details?: string) =>
    apiCall<Record<string, unknown>>({
      method: 'POST',
      path: '/api/reports',
      token,
      body: { reported_id: reportedId, reason, details: details || '' },
    }),
  block: async (token: string, blockedId: string) =>
    apiCall<Record<string, unknown>>({
      method: 'POST',
      path: '/api/blocks',
      token,
      body: { blocked_id: blockedId },
    }),
};

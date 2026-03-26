"use client";

/*
Changes vs original:
- Rebuilt the page into hero discovery feed, my-events dashboard strip, and a multi-step create drawer.
- Kept existing event APIs/auth/data flows intact while redesigning layout, motion, and interaction polish.
- Added Supabase image upload + auto geolocation in create flow and upgraded loading/accessibility states.
*/

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomMap from "@/components/CustomMap";
import { api, createClientId, EventJoinRequest, EventRecord } from "@/lib/api";
import { useStore } from "@/lib/store";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Loader2, LocateFixed, MapPin, Navigation, Plus, RefreshCw, Search, SlidersHorizontal, Sparkles, Trash2, Users, Wifi } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DiscoveryFilter = "all" | "today" | "this-week" | "online" | "in-person";
type CreateStep = 1 | 2 | 3;
type DateField = "start" | "end";

type CreateEventFormState = {
  title: string;
  description: string;
  location_name: string;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  starts_at: string;
  ends_at: string;
  capacity: string;
};

const categoryOptions = ["Dating", "Social", "Networking", "Music", "Food", "Wellness", "Adventure", "Games", "Art", "Other"];
const discoveryTabs: { id: DiscoveryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "this-week", label: "This Week" },
  { id: "online", label: "Online" },
  { id: "in-person", label: "In Person" },
];

const toLocalInputDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

const toDisplayDateTime = (value?: string) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const clampLatitude = (value: number) => Math.max(-90, Math.min(90, value));
const clampLongitude = (value: number) => Math.max(-180, Math.min(180, value));
const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceInKm = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getEventTimes = (event: EventRecord) => ({
  starts: event.starts_at ? new Date(event.starts_at).getTime() : Number.NaN,
  ends: event.ends_at ? new Date(event.ends_at).getTime() : Number.NaN,
});

const isLiveEvent = (event: EventRecord, now: number) => {
  const { starts, ends } = getEventTimes(event);
  if (Number.isNaN(starts)) return false;
  if (Number.isNaN(ends)) return starts <= now;
  return starts <= now && ends >= now;
};

const isUpcomingEvent = (event: EventRecord, now: number) => {
  const { starts } = getEventTimes(event);
  if (Number.isNaN(starts)) return false;
  return starts >= now;
};

const isToday = (value?: string) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toDateString() === new Date().toDateString();
};

const isThisWeek = (value?: string) => {
  if (!value) return false;
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return false;
  const now = Date.now();
  return date >= now && date <= now + 7 * 24 * 60 * 60 * 1000;
};

const isOnlineEvent = (event: EventRecord) => {
  const text = [event.location_name, event.address, event.city].join(" ").toLowerCase();
  return text.includes("online") || text.includes("virtual");
};

const toNormalizedList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getEventCategory = (event: EventRecord) => {
  const record = event as EventRecord & {
    category?: string;
    event_category?: string;
    event_type?: string;
    type?: string;
    categories?: string[] | string;
    tags?: string[] | string;
  };
  const directCategory = [record.category, record.event_category, record.event_type, record.type]
    .find((value) => typeof value === "string" && value.trim())
    ?.trim();
  if (directCategory) return directCategory;
  const listCategory = [...toNormalizedList(record.categories), ...toNormalizedList(record.tags)][0];
  if (listCategory) return listCategory;
  return isOnlineEvent(event) ? "Online" : "In Person";
};

const toIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const buildMonthGrid = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const firstVisibleDate = new Date(year, month, 1 - startWeekday);
  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(firstVisibleDate);
    date.setDate(firstVisibleDate.getDate() + index);
    return {
      iso: toIsoDate(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
    };
  });
};

const getEventColor = (eventKey: string) => {
  let hash = 0;
  for (let index = 0; index < eventKey.length; index += 1) {
    hash = (hash * 33 + eventKey.charCodeAt(index)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 85% 68%)`;
};

const hostNameFromEvent = (event: EventRecord) => `Host ${(event.creator_id || event.id).slice(0, 5).toUpperCase()}`;
const hostAvatarFromEvent = (event: EventRecord) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(event.creator_id || event.id)}`;

const getDefaultCreateFormState = (): CreateEventFormState => {
  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  return {
    title: "",
    description: "",
    location_name: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    starts_at: toLocalInputDateTime(startsAt),
    ends_at: toLocalInputDateTime(endsAt),
    capacity: "80",
  };
};

export function EventsSection() {
  const token = useStore((state) => state.session?.accessToken);
  const currentUser = useStore((state) => state.currentUser);

  const [nowTick, setNowTick] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField>("start");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [joinActionEventId, setJoinActionEventId] = useState<string | null>(null);
  const [joinActionError, setJoinActionError] = useState<string | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedJoinEventId, setSelectedJoinEventId] = useState<string | null>(null);
  const [joinDraftMessage, setJoinDraftMessage] = useState("Would love to attend this event");

  const [myCreatedEvents, setMyCreatedEvents] = useState<EventRecord[]>([]);
  const [myCreatedLoading, setMyCreatedLoading] = useState(false);
  const [myCreatedError, setMyCreatedError] = useState<string | null>(null);
  const [myJoinRequests, setMyJoinRequests] = useState<EventJoinRequest[]>([]);
  const [myJoinRequestsLoading, setMyJoinRequestsLoading] = useState(false);

  const [selectedEventToManageId, setSelectedEventToManageId] = useState<string | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [eventJoinRequests, setEventJoinRequests] = useState<EventJoinRequest[]>([]);
  const [eventJoinRequestsLoading, setEventJoinRequestsLoading] = useState(false);
  const [eventJoinRequestsError, setEventJoinRequestsError] = useState<string | null>(null);
  const [creatorNoteByJoinRequest, setCreatorNoteByJoinRequest] = useState<Record<string, string>>({});
  const [reviewJoinRequestId, setReviewJoinRequestId] = useState<string | null>(null);

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [createCategory, setCreateCategory] = useState(categoryOptions[0]);
  const [createIsOnline, setCreateIsOnline] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEventFormState>(() => getDefaultCreateFormState());
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [fabPulse, setFabPulse] = useState(true);

  const [detailsEvent, setDetailsEvent] = useState<EventRecord | null>(null);
  const [detailsJoinRequest, setDetailsJoinRequest] = useState<EventJoinRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewerLocation, setViewerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewerLocationLoading, setViewerLocationLoading] = useState(false);
  const [viewerLocationError, setViewerLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await api.listEvents(token, {
        status: "approved",
        limit: 80,
        offset: 0,
      });
      setEvents(response.data.events || []);
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "Failed to fetch events.");
    } finally {
      setEventsLoading(false);
    }
  }, [token]);

  const loadMyCreatedEvents = useCallback(async () => {
    if (!token) return;
    setMyCreatedLoading(true);
    setMyCreatedError(null);
    try {
      const response = await api.listMyCreatedEvents(token);
      setMyCreatedEvents(response.data.events || []);
    } catch (error) {
      setMyCreatedError(error instanceof Error ? error.message : "Failed to fetch your created events.");
    } finally {
      setMyCreatedLoading(false);
    }
  }, [token]);

  const loadMyJoinRequests = useCallback(async () => {
    if (!token) return;
    setMyJoinRequestsLoading(true);
    try {
      const response = await api.listMyJoinRequests(token);
      setMyJoinRequests(response.data.join_requests || []);
    } finally {
      setMyJoinRequestsLoading(false);
    }
  }, [token]);

  const loadEventJoinRequests = useCallback(
    async (eventId: string) => {
      if (!token) return;
      setEventJoinRequestsLoading(true);
      setEventJoinRequestsError(null);
      try {
        const response = await api.listEventJoinRequests(token, eventId);
        setEventJoinRequests(response.data.join_requests || []);
      } catch (error) {
        setEventJoinRequestsError(error instanceof Error ? error.message : "Failed to fetch join requests.");
      } finally {
        setEventJoinRequestsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    void Promise.allSettled([loadEvents(), loadMyCreatedEvents(), loadMyJoinRequests()]);
  }, [token, loadEvents, loadMyCreatedEvents, loadMyJoinRequests]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const seen = window.localStorage.getItem("events-fab-pulse-seen");
    if (seen) {
      setFabPulse(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setFabPulse(false);
      window.localStorage.setItem("events-fab-pulse-seen", "1");
    }, 7000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!createImageFile) {
      setCreateImagePreview("");
      return;
    }
    const url = URL.createObjectURL(createImageFile);
    setCreateImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createImageFile]);

  const myCreatedEventIds = useMemo(() => new Set(myCreatedEvents.map((event) => event.id)), [myCreatedEvents]);

  const myJoinStatusByEvent = useMemo(() => {
    const map: Record<string, string> = {};
    myJoinRequests.forEach((request) => {
      const eventId = request.events?.id || request.event_id;
      if (eventId) map[eventId] = request.status || "pending";
    });
    return map;
  }, [myJoinRequests]);

  const selectedManagedEvent = useMemo(
    () => myCreatedEvents.find((event) => event.id === selectedEventToManageId) || null,
    [myCreatedEvents, selectedEventToManageId]
  );

  const approvedEvents = useMemo(
    () => events.filter((event) => (event.status || "").toLowerCase() === "approved"),
    [events]
  );

  const categoryFilterOptions = useMemo(() => {
    const eventCategories = Array.from(new Set(approvedEvents.map((event) => getEventCategory(event))));
    const mergedCategories = [
      ...categoryOptions,
      ...eventCategories.filter((category) => !categoryOptions.some((option) => option.toLowerCase() === category.toLowerCase())),
    ];
    return ["all", ...mergedCategories];
  }, [approvedEvents]);

  const selectedDateLabel = useMemo(() => {
    if (!startDate && !endDate) return "Any Date";
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    return startDate || endDate;
  }, [endDate, startDate]);

  const currentMonthLabel = useMemo(
    () => calendarMonth.toLocaleString([], { month: "long", year: "numeric" }),
    [calendarMonth]
  );

  const monthDays = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);
  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const calendarEventsByDate = useMemo(() => {
    const query = search.trim().toLowerCase();
    const eventsMap = new Map<string, Array<{ id: string; title: string; startsAtMs: number; event: EventRecord; color: string }>>();
    approvedEvents.forEach((event, index) => {
      const eventCategory = getEventCategory(event);
      const content = [event.title, event.description, event.location_name, event.city, event.country, eventCategory].join(" ").toLowerCase();
      if (!isUpcomingEvent(event, nowTick) && !isLiveEvent(event, nowTick)) return;
      if (query && !content.includes(query)) return;
      if (selectedCategory !== "all" && eventCategory !== selectedCategory) return;
      if (discoveryFilter === "today" && !isToday(event.starts_at)) return;
      if (discoveryFilter === "this-week" && !isThisWeek(event.starts_at)) return;
      if (discoveryFilter === "online" && !isOnlineEvent(event)) return;
      if (discoveryFilter === "in-person" && isOnlineEvent(event)) return;
      if (!event.starts_at) return;
      const startDateValue = new Date(event.starts_at);
      if (Number.isNaN(startDateValue.getTime())) return;
      const rawEndDate = event.ends_at ? new Date(event.ends_at) : new Date(startDateValue);
      const endDateValue = Number.isNaN(rawEndDate.getTime()) ? new Date(startDateValue) : rawEndDate;
      const rangeStart = startDateValue.getTime() <= endDateValue.getTime() ? startDateValue : endDateValue;
      const rangeEnd = startDateValue.getTime() <= endDateValue.getTime() ? endDateValue : startDateValue;
      const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
      const rangeEndDate = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
      const eventId = event.id || `${event.title || "event"}-${index}`;
      const eventEntry = {
        id: eventId,
        title: event.title?.trim() || "Untitled event",
        startsAtMs: startDateValue.getTime(),
        event,
        color: getEventColor(eventId),
      };
      while (cursor.getTime() <= rangeEndDate.getTime()) {
        const iso = toIsoDate(cursor);
        const existingEvents = eventsMap.get(iso) ?? [];
        if (!existingEvents.some((item) => item.id === eventId)) {
          existingEvents.push(eventEntry);
          existingEvents.sort((a, b) => a.startsAtMs - b.startsAtMs);
          eventsMap.set(iso, existingEvents);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return eventsMap;
  }, [approvedEvents, nowTick, discoveryFilter, search, selectedCategory]);
  const selectedDayEvents = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return (calendarEventsByDate.get(selectedCalendarDay) ?? []).slice(0, 5);
  }, [calendarEventsByDate, selectedCalendarDay]);

  const feedEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const toTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
    const sorted = [...approvedEvents].sort((a, b) => {
      const liveDiff = Number(isLiveEvent(b, nowTick)) - Number(isLiveEvent(a, nowTick));
      if (liveDiff !== 0) return liveDiff;
      const aStart = a.starts_at ? new Date(a.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bStart = b.starts_at ? new Date(b.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aStart - bStart;
    });
    return sorted.filter((event) => {
      const eventCategory = getEventCategory(event);
      const eventTime = event.starts_at ? new Date(event.starts_at).getTime() : Number.NaN;
      const content = [event.title, event.description, event.location_name, event.city, event.country, eventCategory].join(" ").toLowerCase();
      if (!isUpcomingEvent(event, nowTick) && !isLiveEvent(event, nowTick)) return false;
      if (query && !content.includes(query)) return false;
      if (selectedCategory !== "all" && eventCategory !== selectedCategory) return false;
      if (fromTime !== null && (Number.isNaN(eventTime) || eventTime < fromTime)) return false;
      if (toTime !== null && (Number.isNaN(eventTime) || eventTime > toTime)) return false;
      if (discoveryFilter === "all") return true;
      if (discoveryFilter === "today") return isToday(event.starts_at);
      if (discoveryFilter === "this-week") return isThisWeek(event.starts_at);
      if (discoveryFilter === "online") return isOnlineEvent(event);
      if (discoveryFilter === "in-person") return !isOnlineEvent(event);
      return true;
    });
  }, [approvedEvents, nowTick, discoveryFilter, search, selectedCategory, startDate, endDate]);

  const dashboardItems = useMemo(() => {
    const created = myCreatedEvents.map((event) => ({
      key: `created-${event.id}`,
      role: "Organizer" as const,
      event,
    }));
    const joined = myJoinRequests
      .filter((request) => request.events)
      .map((request) => ({
        key: `joined-${request.id}`,
        role: "Attendee" as const,
        event: request.events as EventRecord,
      }));
    return [...created, ...joined].sort((a, b) => {
      const aStart = a.event.starts_at ? new Date(a.event.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bStart = b.event.starts_at ? new Date(b.event.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aStart - bStart;
    });
  }, [myCreatedEvents, myJoinRequests]);

  const pendingJoinRequests = useMemo(
    () => eventJoinRequests.filter((request) => (request.status || "pending").toLowerCase() === "pending"),
    [eventJoinRequests]
  );

  const approvedJoinRequests = useMemo(
    () => eventJoinRequests.filter((request) => (request.status || "").toLowerCase() === "approved"),
    [eventJoinRequests]
  );

  const otherJoinRequests = useMemo(
    () => eventJoinRequests.filter((request) => !["pending", "approved"].includes((request.status || "").toLowerCase())),
    [eventJoinRequests]
  );

  const selectedJoinEvent = useMemo(() => feedEvents.find((event) => event.id === selectedJoinEventId) || null, [feedEvents, selectedJoinEventId]);

  const handleUseCurrentLocation = useCallback(async () => {
    setLocationError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 0,
        });
      });
      const latitude = clampLatitude(position.coords.latitude);
      const longitude = clampLongitude(position.coords.longitude);
      setCreateForm((prev) => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        if (!response.ok) throw new Error("Could not reverse geocode your location.");
        const payload = (await response.json()) as { display_name?: string; address?: Record<string, string> };
        const address = payload.address || {};
        const cityValue = address.city || address.town || address.village || address.state || "";
        const countryValue = address.country || "";
        const addressText = payload.display_name || [address.road, address.suburb, cityValue, countryValue].filter(Boolean).join(", ");
        setCreateForm((prev) => ({
          ...prev,
          location_name: prev.location_name || "Current Location",
          address: addressText || prev.address,
          city: cityValue || prev.city,
          country: countryValue || prev.country,
        }));
      } catch {
        setCreateForm((prev) => ({ ...prev, location_name: prev.location_name || "Current Location" }));
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Unable to fetch location.");
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const handleCreateEvent = async () => {
    if (!token) return;
    setCreateError(null);
    setCreateSuccess(null);

    const startsAt = new Date(createForm.starts_at);
    const endsAt = new Date(createForm.ends_at);
    const capacity = Number(createForm.capacity);
    const latitude = clampLatitude(Number(createForm.latitude));
    const longitude = clampLongitude(Number(createForm.longitude));

    const locationName = createIsOnline ? "Online Event" : createForm.location_name.trim();
    const address = createIsOnline ? "Online" : createForm.address.trim();
    const cityValue = createIsOnline ? "Online" : createForm.city.trim();
    const countryValue = createIsOnline ? "Online" : createForm.country.trim();

    if (!createForm.title.trim() || !createForm.description.trim() || !locationName || !address || !cityValue || !countryValue) {
      setCreateError("Please fill all required fields.");
      return;
    }
    if (!createImageFile) {
      setCreateError("Please upload an event image.");
      return;
    }
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      setCreateError("Please enter valid start/end date and time.");
      return;
    }
    if (Number.isNaN(capacity) || capacity <= 0) {
      setCreateError("Capacity must be greater than 0.");
      return;
    }
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setCreateError("Use my location first so latitude/longitude are valid.");
      return;
    }

    setIsCreatingEvent(true);
    try {
      setIsUploadingImage(true);
      const uploadedImageUrl = await api.uploadProfilePhoto(createImageFile, currentUser?.id || createClientId());
      setIsUploadingImage(false);
      await api.createEvent(token, {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        image_url: uploadedImageUrl,
        location_name: locationName,
        address,
        city: cityValue,
        country: countryValue,
        latitude,
        longitude,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        capacity,
      });
      setCreateSuccess("Event submitted successfully. It is pending admin approval.");
      setCreateStep(1);
      setCreateCategory(categoryOptions[0]);
      setCreateForm(getDefaultCreateFormState());
      setCreateImageFile(null);
      setIsCreateDrawerOpen(false);
      await Promise.allSettled([loadMyCreatedEvents(), loadEvents()]);
    } catch (error) {
      setIsUploadingImage(false);
      setCreateError(error instanceof Error ? error.message : "Failed to create event.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleRequestJoin = async (eventId: string, message: string) => {
    if (!token) return;
    setJoinActionEventId(eventId);
    setJoinActionError(null);
    try {
      const joinMessage = message.trim() || "Would love to attend this event";
      await api.requestJoinEvent(token, eventId, joinMessage);
      await loadMyJoinRequests();
      setIsJoinDialogOpen(false);
      setSelectedJoinEventId(null);
      setJoinDraftMessage("Would love to attend this event");
    } catch (error) {
      setJoinActionError(error instanceof Error ? error.message : "Could not submit join request.");
    } finally {
      setJoinActionEventId(null);
    }
  };

  const openJoinDialog = (event: EventRecord) => {
    setSelectedJoinEventId(event.id);
    setJoinDraftMessage(`Would love to attend ${event.title || "this event"}`);
    setJoinActionError(null);
    setIsJoinDialogOpen(true);
  };

  const openManageFlow = async (eventId: string) => {
    setSelectedEventToManageId(eventId);
    setIsManageDialogOpen(true);
    await loadEventJoinRequests(eventId);
  };

  const requestViewerLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setViewerLocationError("Location access is not available in this browser.");
      return;
    }
    setViewerLocationLoading(true);
    setViewerLocationError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 60_000,
        });
      });
      setViewerLocation({
        lat: clampLatitude(position.coords.latitude),
        lng: clampLongitude(position.coords.longitude),
      });
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          setViewerLocationError("Location permission denied. Enable it to view route and distance.");
        } else if (error.code === error.TIMEOUT) {
          setViewerLocationError("Location request timed out. Try again.");
        } else {
          setViewerLocationError("Unable to detect your current location.");
        }
      } else {
        setViewerLocationError("Unable to detect your current location.");
      }
    } finally {
      setViewerLocationLoading(false);
    }
  }, []);

  const openDetails = async (eventId: string) => {
    if (!token) return;
    setDetailsOpen(true);
    setDetailsLoading(true);
    void requestViewerLocation();
    try {
      const response = await api.getEventDetails(token, eventId);
      setDetailsEvent(response.data.event || null);
      setDetailsJoinRequest(response.data.my_join_request || null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const detailsCoords = useMemo(() => {
    const lat = Number(detailsEvent?.latitude);
    const lng = Number(detailsEvent?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [detailsEvent?.latitude, detailsEvent?.longitude]);

  const detailsDistanceKm = useMemo(() => {
    if (!viewerLocation || !detailsCoords) return null;
    return getDistanceInKm(viewerLocation.lat, viewerLocation.lng, detailsCoords.lat, detailsCoords.lng);
  }, [viewerLocation, detailsCoords]);

  const directionsUrl = useMemo(() => {
    if (!viewerLocation || !detailsCoords) return "";
    return `https://www.google.com/maps/dir/?api=1&origin=${viewerLocation.lat},${viewerLocation.lng}&destination=${detailsCoords.lat},${detailsCoords.lng}&travelmode=driving`;
  }, [viewerLocation, detailsCoords]);

  const detailsJoinStatus = useMemo(() => {
    if (!detailsEvent?.id) return "";
    return (detailsJoinRequest?.status || myJoinStatusByEvent[detailsEvent.id] || "").toLowerCase();
  }, [detailsEvent?.id, detailsJoinRequest?.status, myJoinStatusByEvent]);

  const handleReviewJoinRequest = async (joinRequestId: string, action: "approve" | "reject") => {
    if (!token || !selectedEventToManageId) return;
    setReviewJoinRequestId(joinRequestId);
    try {
      await api.reviewEventJoinRequest(token, selectedEventToManageId, joinRequestId, {
        action,
        creator_note: creatorNoteByJoinRequest[joinRequestId]?.trim() || undefined,
      });
      await Promise.allSettled([loadEventJoinRequests(selectedEventToManageId), loadEvents()]);
    } catch (error) {
      setEventJoinRequestsError(error instanceof Error ? error.message : "Failed to update join request.");
    } finally {
      setReviewJoinRequestId(null);
    }
  };

  const canProceedToStep2 = createForm.title.trim() && createForm.description.trim() && createImageFile;
  const canProceedToStep3 =
    createForm.starts_at &&
    createForm.ends_at &&
    (createIsOnline || (createForm.location_name && createForm.address && createForm.city && createForm.country));

  return (
    <section className="relative pb-24 lg:pb-10">
      <div className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.25),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(168,17,30,0.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-crimson">
              <Sparkles className="h-3.5 w-3.5" />
              Discovery Feed
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-offwhite sm:text-5xl lg:text-6xl">What&apos;s happening near you</h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300 sm:text-base">
              Find live moments, request access in one tap, and jump into your community events without leaving Ignite.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {discoveryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-label={`Filter events by ${tab.label}`}
                onClick={() => setDiscoveryFilter(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  discoveryFilter === tab.id
                    ? "border-crimson bg-crimson text-white shadow-[0_10px_30px_rgba(232,25,44,0.25)]"
                    : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {categoryFilterOptions.map((category) => (
              <button
                key={category}
                type="button"
                aria-label={`Filter by ${category === "all" ? "all categories" : category}`}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition ${
                  selectedCategory === category
                    ? "border-crimson bg-crimson/25 text-offwhite"
                    : "border-white/15 bg-white/[0.03] text-offwhite/70 hover:bg-white/[0.08]"
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-white/12 bg-white/[0.03] p-4 md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label className="group relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  aria-label="Search events"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search event, city, category..."
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/25 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                />
              </label>
              <button
                type="button"
                aria-label="Open date calendar"
                onClick={() => {
                  const fallbackDate = startDate || endDate;
                  if (fallbackDate) {
                    const parsed = new Date(`${fallbackDate}T00:00:00`);
                    if (!Number.isNaN(parsed.getTime())) {
                      setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                    }
                  }
                  setActiveDateField(startDate ? "end" : "start");
                  setSelectedCalendarDay(fallbackDate || toIsoDate(new Date()));
                  setCalendarModalOpen(true);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                <CalendarDays className="h-4 w-4 text-crimson" />
                Open Calendar
              </button>
              <button
                type="button"
                aria-label="Clear feed filters"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setStartDate("");
                  setEndDate("");
                  setSelectedCalendarDay("");
                  setDiscoveryFilter("all");
                }}
                className="h-11 rounded-xl border border-white/15 bg-black/25 px-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Clear Filters
              </button>
              <button
                type="button"
                aria-label="Refresh events feed"
                onClick={() => void loadEvents()}
                className="h-11 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Refresh Feed
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-zinc-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Date Range: {selectedDateLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {createSuccess ? <p className="mt-4 text-sm text-emerald-400">{createSuccess}</p> : null}
        {eventsError ? <p className="mt-4 text-sm text-rose-400">{eventsError}</p> : null}
        {joinActionError ? <p className="mt-2 text-sm text-rose-400">{joinActionError}</p> : null}

        {eventsLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <div className="h-40 animate-pulse bg-zinc-800/70" />
                <div className="space-y-2 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-700/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-700/50" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-700/50" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-700/50" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {feedEvents.map((event) => {
              const live = isLiveEvent(event, nowTick);
              const eventCategory = getEventCategory(event);
              const myJoinStatus = myJoinStatusByEvent[event.id];
              const isMine = myCreatedEventIds.has(event.id);
              const hasSlots = (event.available_slots ?? 1) > 0;
              const hasJoinStatus = Boolean(myJoinStatus);
              const chipClass = live
                ? "border-rose-400/70 bg-rose-500/20 text-rose-200"
                : isOnlineEvent(event)
                  ? "border-sky-400/60 bg-sky-500/20 text-sky-200"
                  : "border-emerald-400/60 bg-emerald-500/20 text-emerald-200";

              return (
                <article
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${event.title || "event"}`}
                  onClick={() => void openDetails(event.id)}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                      keyboardEvent.preventDefault();
                      void openDetails(event.id);
                    }
                  }}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#121212] shadow-[0_10px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative h-40 overflow-hidden">
                    {event.image_url ? (
                      <img src={event.image_url} loading="lazy" alt={event.title || "Event cover"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.35),transparent_45%),linear-gradient(145deg,#1a1a1a,#0c0c0c)]" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    {live ? (
                      <span className="absolute left-3 top-3 inline-flex animate-pulse items-center rounded-full border border-rose-400/70 bg-rose-500/20 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-100">
                        LIVE
                      </span>
                    ) : null}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-semibold text-white">{event.title || "Untitled Event"}</h3>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase ${chipClass}`}>
                        {isOnlineEvent(event) ? "Online" : "In Person"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="inline-flex items-center gap-1 rounded-full border border-crimson/40 bg-crimson/15 px-2 py-1 font-medium text-[10px] uppercase tracking-[0.12em] text-crimson">
                        {eventCategory}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        <CalendarDays className="h-3.5 w-3.5 text-crimson" />
                        {toDisplayDateTime(event.starts_at)}
                      </span>
                      <span className="line-clamp-1 inline-flex items-center gap-1 text-zinc-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {[event.location_name, event.city].filter(Boolean).join(", ") || "Location TBD"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={hostAvatarFromEvent(event)} alt={hostNameFromEvent(event)} loading="lazy" className="h-7 w-7 rounded-full border border-white/20 bg-black/40" />
                        <div>
                          <p className="text-xs text-zinc-400">Hosted by</p>
                          <p className="text-sm font-medium text-zinc-100">{hostNameFromEvent(event)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(3, Math.max(1, event.approved_participants ?? 1)) }).map((_, index) => (
                            <img
                              key={index}
                              src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(`${event.id}-${index}`)}`}
                              alt="Attendee avatar"
                              loading="lazy"
                              className="h-6 w-6 rounded-full border border-black/60 bg-zinc-900"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-300">{event.approved_participants ?? 0} going</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300">
                      <p className="line-clamp-2 text-zinc-400">{event.description || "No description yet."}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                          Capacity {event.capacity ?? "—"}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                          Slots left {event.available_slots ?? "—"}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                          Status {(event.status || "approved").replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>

                    {!isMine ? (
                      <div className="space-y-2" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                        {hasJoinStatus ? (
                          <p className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold capitalize text-zinc-200">
                            Join status: {myJoinStatus?.replaceAll("_", " ")}
                          </p>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Join ${event.title || "event"}`}
                            disabled={!hasSlots || joinActionEventId === event.id}
                            onClick={() => openJoinDialog(event)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-crimson/50 bg-crimson/85 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {joinActionEventId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {hasSlots ? "Join" : "Event Full"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Manage ${event.title || "event"}`}
                        onClick={() => void openManageFlow(event.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!eventsLoading && !eventsError && feedEvents.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">No events found for selected filters.</p>
        ) : null}

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Events Dashboard</h2>
            <button
              type="button"
              aria-label="Refresh my events"
              onClick={() => void Promise.allSettled([loadMyCreatedEvents(), loadMyJoinRequests()])}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
          {myCreatedError ? <p className="mb-3 text-sm text-rose-400">{myCreatedError}</p> : null}
          {myCreatedLoading || myJoinRequestsLoading ? (
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your events...
            </div>
          ) : null}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dashboardItems.map((item) => {
              const live = isLiveEvent(item.event, nowTick);
              return (
                <div key={item.key} className="glass-card min-w-[340px] overflow-hidden">
                  <div className="relative h-32">
                    {item.event.image_url ? (
                      <img src={item.event.image_url} loading="lazy" alt={item.event.title || "Event cover"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.35),transparent_45%),linear-gradient(145deg,#1a1a1a,#0c0c0c)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded-full border border-white/25 bg-black/40 px-2 py-1 text-[11px] font-semibold text-zinc-100">{item.role}</span>
                      {live ? <span className="rounded-full border border-rose-400/70 bg-rose-500/20 px-2 py-1 text-[11px] font-bold text-rose-100">LIVE</span> : null}
                    </div>
                    <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-base font-semibold text-white">{item.event.title || "Untitled Event"}</p>
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-xs text-zinc-300">{toDisplayDateTime(item.event.starts_at)}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                        {isOnlineEvent(item.event) ? "Online" : "In Person"}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                        {(item.event.approved_participants ?? 0)} joined
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                        Slots {item.event.available_slots ?? "—"}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-zinc-400">
                      {[item.event.location_name, item.event.city, item.event.country].filter(Boolean).join(", ") || "Location TBD"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                    {item.role === "Organizer" ? (
                      <>
                        <button
                          type="button"
                          aria-label={`Manage ${item.event.title || "event"}`}
                          onClick={() => void openManageFlow(item.event.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          aria-label={`View details for ${item.event.title || "event"}`}
                          onClick={() => void openDetails(item.event.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
                        >
                          Details
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`Open ${item.event.title || "event"} now`}
                          onClick={() => void openDetails(item.event.id)}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                            live ? "border-crimson/50 bg-crimson/85 text-white hover:bg-crimson" : "border-white/20 bg-white/10 text-zinc-100 hover:bg-white/15"
                          }`}
                        >
                          {live ? "Join Now" : "View Details"}
                        </button>
                        <button
                          type="button"
                          aria-label={`More details for ${item.event.title || "event"}`}
                          onClick={() => void openDetails(item.event.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
                        >
                          More Info
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {!myCreatedLoading && !myJoinRequestsLoading && dashboardItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">You have not created or joined events yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="border-white/15 bg-[#0C0C0C] p-0 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Select event dates</DialogTitle>
            <DialogDescription className="sr-only">Choose a start and end date and browse events in calendar view.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-3 md:p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-300">
                <CalendarDays className="h-4 w-4 text-crimson" />
                Event Calendar
              </p>
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{currentMonthLabel}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-label="Set start date"
                onClick={() => setActiveDateField("start")}
                className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                  activeDateField === "start" ? "border-crimson/70 bg-crimson/20 text-white" : "border-white/15 bg-white/[0.03] text-zinc-300"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">From Date</p>
                <p className="mt-1 font-medium">{startDate || "Not selected"}</p>
              </button>
              <button
                type="button"
                aria-label="Set end date"
                onClick={() => setActiveDateField("end")}
                className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                  activeDateField === "end" ? "border-crimson/70 bg-crimson/20 text-white" : "border-white/15 bg-white/[0.03] text-zinc-300"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">To Date</p>
                <p className="mt-1 font-medium">{endDate || "Not selected"}</p>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/12 bg-black/25 p-2.5 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200">{currentMonthLabel}</p>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekdayLabels.map((day) => (
                    <div key={day} className="flex h-6 items-center justify-center text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day) => {
                    const isStart = startDate === day.iso;
                    const isEnd = endDate === day.iso;
                    const inRange = Boolean(startDate && endDate && day.iso > startDate && day.iso < endDate);
                    const isToday = day.iso === todayIso;
                    const dayEvents = calendarEventsByDate.get(day.iso) ?? [];
                    const dayPrimaryEvent = dayEvents[0];
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        aria-label={`Select ${day.iso}`}
                        onClick={() => {
                          setSelectedCalendarDay(day.iso);
                          if (activeDateField === "start") {
                            setStartDate(day.iso);
                            if (endDate && day.iso > endDate) setEndDate(day.iso);
                            setActiveDateField("end");
                            return;
                          }
                          if (!startDate || day.iso >= startDate) {
                            setEndDate(day.iso);
                            return;
                          }
                          setStartDate(day.iso);
                          setEndDate(day.iso);
                        }}
                        className={`aspect-square w-full overflow-hidden rounded-lg border px-1 py-0.5 text-left transition ${
                          isStart || isEnd
                            ? "border-crimson bg-crimson text-white"
                            : inRange
                              ? "border border-crimson/35 bg-crimson/15 text-white"
                              : day.inCurrentMonth
                                ? "border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
                                : "border-white/5 bg-transparent text-zinc-600 hover:bg-white/[0.04]"
                        } ${isToday && !isStart && !isEnd ? "ring-1 ring-crimson/60" : ""}`}
                      >
                        <span className="block text-[11px] font-medium">{day.dayNumber}</span>
                        <span
                          className={`mt-0.5 block line-clamp-1 text-[8px] leading-tight ${isStart || isEnd ? "text-white" : ""}`}
                          style={{ color: isStart || isEnd ? undefined : dayPrimaryEvent?.color }}
                        >
                          {dayPrimaryEvent?.title || ""}
                        </span>
                        <span className={`block text-[8px] leading-tight ${isStart || isEnd ? "text-white/90" : "text-zinc-500"}`}>
                          {dayEvents.length > 1 ? `+${dayEvents.length - 1}` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[0.02] p-2.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                  {selectedCalendarDay ? `${selectedCalendarDay} · Top ${Math.min(5, selectedDayEvents.length)} Events` : "Pick a date"}
                </p>
                <div className="mt-2 space-y-1.5">
                  {selectedCalendarDay ? (
                    selectedDayEvents.length > 0 ? (
                      selectedDayEvents.map((item) => (
                        <div key={`${selectedCalendarDay}-${item.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                            <p className="line-clamp-1 text-xs" style={{ color: item.color }}>
                              {item.title}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCalendarModalOpen(false);
                              void openDetails(item.event.id);
                            }}
                            className="shrink-0 rounded-full border border-crimson/45 bg-crimson/15 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-crimson transition hover:bg-crimson/25"
                          >
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No events for this day.</p>
                    )
                  ) : (
                    <p className="text-xs text-zinc-500">Tap any date to quickly view events.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Clear selected dates"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCalendarDay("");
                }}
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-zinc-300 transition hover:bg-white/[0.08]"
              >
                Clear Dates
              </button>
              <button
                type="button"
                aria-label="Done selecting dates"
                onClick={() => setCalendarModalOpen(false)}
                className="rounded-lg border border-crimson/40 bg-crimson px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-crimson/90"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isJoinDialogOpen}
        onOpenChange={(open) => {
          setIsJoinDialogOpen(open);
          if (!open) {
            setSelectedJoinEventId(null);
            setJoinDraftMessage("Would love to attend this event");
          }
        }}
      >
        <DialogContent className="border-white/15 bg-[#0C0C0C] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Join Event</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Send a short message with your join request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">{selectedJoinEvent?.title || "Selected event"}</p>
              <p className="mt-1 text-xs text-zinc-400">{toDisplayDateTime(selectedJoinEvent?.starts_at)}</p>
            </div>
            <textarea
              aria-label="Join request message"
              value={joinDraftMessage}
              onChange={(event) => setJoinDraftMessage(event.target.value)}
              placeholder="Write a message to organizer"
              className="min-h-28 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
            />
            {joinActionError ? <p className="text-sm text-rose-400">{joinActionError}</p> : null}
            <button
              type="button"
              aria-label="Send join request"
              disabled={!selectedJoinEvent || joinActionEventId === selectedJoinEvent.id}
              onClick={() => {
                if (selectedJoinEvent) void handleRequestJoin(selectedJoinEvent.id, joinDraftMessage);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-crimson/50 bg-crimson px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson/90 disabled:opacity-50"
            >
              {selectedJoinEvent && joinActionEventId === selectedJoinEvent.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Join
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDrawerOpen}
        onOpenChange={(open) => {
          setIsCreateDrawerOpen(open);
          if (open) {
            setCreateError(null);
            setLocationError(null);
            void handleUseCurrentLocation();
          } else {
            setCreateStep(1);
          }
        }}
      >
        <button
          type="button"
          aria-label="Create Event"
          onClick={() => setIsCreateDrawerOpen(true)}
          className={`fixed bottom-6 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full border border-crimson/60 bg-crimson px-5 text-sm font-semibold text-white shadow-[0_15px_45px_rgba(232,25,44,0.45)] transition-all duration-300 hover:scale-105 lg:bottom-10 lg:right-10 ${
            fabPulse ? "animate-pulseGlow" : ""
          }`}
        >
          <Plus className="h-5 w-5" />
          Create Event
        </button>
        <DialogContent
          className="fixed inset-0 z-50 h-screen w-full translate-x-0 translate-y-0 gap-0 overflow-hidden border-white/15 bg-[#0C0C0C] p-0 text-white data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full sm:left-auto sm:right-0 sm:max-w-[560px] sm:rounded-none lg:inset-y-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[86vh] lg:max-h-[900px] lg:w-[min(1140px,94vw)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:data-[state=closed]:zoom-out-95 lg:data-[state=open]:zoom-in-95"
          aria-label="Create event drawer"
        >
          <div className="flex h-full flex-col lg:flex-row">
            <aside className="hidden w-[380px] border-r border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.28),transparent_45%),linear-gradient(180deg,#121212_0%,#0B0B0B_100%)] p-8 lg:flex lg:flex-col">
              <p className="inline-flex w-fit items-center rounded-full border border-crimson/40 bg-crimson/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-crimson">
                Event Builder
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">Create your next Ignite experience</h3>
              <p className="mt-2 text-sm text-zinc-300">Complete each step to publish a polished listing optimized for discovery and quick joins.</p>
              <div className="mt-8 space-y-3">
                <div className={`rounded-2xl border px-4 py-3 transition-colors ${createStep === 1 ? "border-crimson/45 bg-crimson/15" : "border-white/10 bg-white/[0.03]"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Step 1</p>
                  <p className="mt-1 text-sm font-medium text-white">Basics and cover image</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 transition-colors ${createStep === 2 ? "border-crimson/45 bg-crimson/15" : "border-white/10 bg-white/[0.03]"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Step 2</p>
                  <p className="mt-1 text-sm font-medium text-white">Time and location</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 transition-colors ${createStep === 3 ? "border-crimson/45 bg-crimson/15" : "border-white/10 bg-white/[0.03]"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Step 3</p>
                  <p className="mt-1 text-sm font-medium text-white">Review and publish</p>
                </div>
              </div>
              <div className="mt-auto overflow-hidden rounded-2xl border border-white/15 bg-[#141414]">
                <div className="relative h-44">
                  {createImagePreview ? (
                    <img src={createImagePreview} loading="lazy" alt="Event preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-crimson/35 via-crimson/15 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-base font-semibold text-white">{createForm.title || "Event title"}</p>
                    <p className="text-xs text-zinc-200">{createCategory}</p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex h-full flex-1 flex-col">
              <div className="border-b border-white/10 px-5 py-4 lg:px-8 lg:py-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white lg:text-xl">Create Event</h3>
                  <span className="text-xs text-zinc-400">Step {createStep} of 3</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-crimson transition-all duration-300" style={{ width: `${(createStep / 3) * 100}%` }} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 lg:px-8 lg:py-6">
                {createStep === 1 ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Event Name</p>
                          <input
                            aria-label="Event name"
                            value={createForm.title}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder="Event name"
                            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Category</p>
                          <div className="flex flex-wrap gap-2">
                            {categoryOptions.map((category) => (
                              <button
                                key={category}
                                type="button"
                                aria-label={`Select ${category} category`}
                                onClick={() => setCreateCategory(category)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  createCategory === category ? "border-crimson bg-crimson/20 text-white" : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload cover image"
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const file = event.dataTransfer.files?.[0] || null;
                          if (file) setCreateImageFile(file);
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 transition-colors hover:bg-white/10"
                      >
                        {createImagePreview ? (
                          <img src={createImagePreview} loading="lazy" alt="Event preview" className="h-44 w-full rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-44 items-center justify-center rounded-xl bg-white/[0.02]">
                            <p className="text-sm text-zinc-400">Drop image here or click to upload</p>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => setCreateImageFile(event.target.files?.[0] || null)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Description</p>
                      <textarea
                        aria-label="Event description"
                        value={createForm.description}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Describe your event"
                        className="min-h-32 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}

                {createStep === 2 ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Start</p>
                        <input
                          type="datetime-local"
                          aria-label="Start date and time"
                          value={createForm.starts_at}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, starts_at: event.target.value }))}
                          className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white focus:border-crimson/60 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">End</p>
                        <input
                          type="datetime-local"
                          aria-label="End date and time"
                          value={createForm.ends_at}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, ends_at: event.target.value }))}
                          className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white focus:border-crimson/60 focus:outline-none"
                        />
                      </div>
                    </div>
                    <label className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                      <span className="inline-flex items-center gap-2 text-sm text-zinc-300">
                        <Wifi className="h-4 w-4 text-crimson" />
                        Online event
                      </span>
                      <input
                        type="checkbox"
                        aria-label="Toggle online event"
                        checked={createIsOnline}
                        onChange={(event) => setCreateIsOnline(event.target.checked)}
                        className="h-4 w-4 accent-crimson"
                      />
                    </label>
                    {!createIsOnline ? (
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <input
                          aria-label="Location name"
                          value={createForm.location_name}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, location_name: event.target.value }))}
                          placeholder="Location name"
                          className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                        />
                        <input
                          aria-label="Address"
                          value={createForm.address}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, address: event.target.value }))}
                          placeholder="Address"
                          className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                        />
                        <input
                          aria-label="City"
                          value={createForm.city}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, city: event.target.value }))}
                          placeholder="City"
                          className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                        />
                        <input
                          aria-label="Country"
                          value={createForm.country}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, country: event.target.value }))}
                          placeholder="Country"
                          className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                        />
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        aria-label="Use current location"
                        onClick={() => void handleUseCurrentLocation()}
                        disabled={locationLoading}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/10 disabled:opacity-60"
                      >
                        {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-crimson" />}
                        Use my location
                      </button>
                      <input
                        type="number"
                        min={1}
                        aria-label="Maximum attendees"
                        value={createForm.capacity}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, capacity: event.target.value }))}
                        placeholder="Max attendees"
                        className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">Lat: {createForm.latitude || "Not set"}</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">Lng: {createForm.longitude || "Not set"}</div>
                    </div>
                  </div>
                ) : null}

                {createStep === 3 ? (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#141414]">
                      <div className="relative h-52">
                        {createImagePreview ? (
                          <img src={createImagePreview} loading="lazy" alt="Preview cover" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-crimson/30 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <p className="text-lg font-semibold text-white">{createForm.title || "Event title"}</p>
                          <p className="text-xs text-zinc-200">{createCategory}</p>
                        </div>
                      </div>
                      <div className="space-y-2 p-4 text-sm text-zinc-300">
                        <p>{createForm.description || "Event description"}</p>
                        <p>{toDisplayDateTime(createForm.starts_at)} - {toDisplayDateTime(createForm.ends_at)}</p>
                        <p>{createIsOnline ? "Online Event" : [createForm.location_name, createForm.city, createForm.country].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Publish Checklist</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Title and description added</p>
                        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Date and timing selected</p>
                        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">{createIsOnline ? "Online event enabled" : "Venue details filled"}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {locationError ? <p className="mt-4 text-sm text-rose-400">{locationError}</p> : null}
                {createError ? <p className="mt-2 text-sm text-rose-400">{createError}</p> : null}
              </div>

              <div className="border-t border-white/10 px-5 py-4 lg:px-8 lg:py-5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label="Previous step"
                    disabled={createStep === 1}
                    onClick={() => setCreateStep((prev) => (prev > 1 ? ((prev - 1) as CreateStep) : prev))}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back
                  </button>

                  {createStep < 3 ? (
                    <button
                      type="button"
                      aria-label="Next step"
                      onClick={() => setCreateStep((prev) => (prev < 3 ? ((prev + 1) as CreateStep) : prev))}
                      disabled={(createStep === 1 && !canProceedToStep2) || (createStep === 2 && !canProceedToStep3)}
                      className="inline-flex items-center gap-2 rounded-xl border border-crimson/50 bg-crimson px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Submit event"
                      disabled={isCreatingEvent || isUploadingImage}
                      onClick={() => void handleCreateEvent()}
                      className="inline-flex items-center gap-2 rounded-xl border border-crimson/50 bg-crimson px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                    >
                      {isCreatingEvent || isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {isUploadingImage ? "Uploading image..." : "Submit Event"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isManageDialogOpen}
        onOpenChange={(open) => {
          setIsManageDialogOpen(open);
          if (!open) {
            setSelectedEventToManageId(null);
            setEventJoinRequestsError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-[#0C0C0C] text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Requests · {selectedManagedEvent?.title || "Event"}</DialogTitle>
            <DialogDescription className="text-zinc-400">Review attendee pipeline with separated pending and approved sections.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <span className="rounded-full border border-yellow-400/40 bg-yellow-500/15 px-2 py-1">Pending {pendingJoinRequests.length}</span>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-1">Approved {approvedJoinRequests.length}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1">Total {eventJoinRequests.length}</span>
            </div>
            <button
              type="button"
              aria-label="Refresh join requests"
              onClick={() => {
                if (selectedEventToManageId) void loadEventJoinRequests(selectedEventToManageId);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:bg-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
          {eventJoinRequestsLoading ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading join requests...
            </div>
          ) : null}
          {eventJoinRequestsError ? <p className="mt-2 text-sm text-rose-400">{eventJoinRequestsError}</p> : null}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Pending Requests</p>
              {pendingJoinRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {request.requester_profile?.full_name || request.requester_profile?.username || request.requester_id || "Attendee"}
                    </p>
                    <span className="rounded-full border border-yellow-400/40 bg-yellow-500/15 px-2 py-1 text-xs uppercase text-yellow-200">pending</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{request.requester_message || "No message provided."}</p>
                  <input
                    aria-label="Creator note"
                    value={creatorNoteByJoinRequest[request.id] || ""}
                    onChange={(event) =>
                      setCreatorNoteByJoinRequest((prev) => ({
                        ...prev,
                        [request.id]: event.target.value,
                      }))
                    }
                    placeholder="Creator note (optional)"
                    className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      aria-label="Approve request"
                      disabled={reviewJoinRequestId === request.id}
                      onClick={() => void handleReviewJoinRequest(request.id, "approve")}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/30 disabled:opacity-60"
                    >
                      {reviewJoinRequestId === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Approve
                    </button>
                    <button
                      type="button"
                      aria-label="Reject request"
                      disabled={reviewJoinRequestId === request.id}
                      onClick={() => void handleReviewJoinRequest(request.id, "reject")}
                      className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/30 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!eventJoinRequestsLoading && pendingJoinRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">No pending requests.</p>
              ) : null}
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Approved Attendees</p>
              {approvedJoinRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {request.requester_profile?.full_name || request.requester_profile?.username || request.requester_id || "Attendee"}
                    </p>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-xs uppercase text-emerald-200">approved</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-300">{request.creator_note || request.requester_message || "No note available."}</p>
                  <button
                    type="button"
                    aria-label="Remove approved attendee"
                    disabled={reviewJoinRequestId === request.id}
                    onClick={() => void handleReviewJoinRequest(request.id, "reject")}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/30 disabled:opacity-60"
                  >
                    {reviewJoinRequestId === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Remove
                  </button>
                </div>
              ))}
              {!eventJoinRequestsLoading && approvedJoinRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">No approved attendees yet.</p>
              ) : null}
            </div>
          </div>
          {otherJoinRequests.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-sm font-semibold text-white">Other Status</p>
              <div className="space-y-2">
                {otherJoinRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                    {(request.requester_profile?.full_name || request.requester_profile?.username || request.requester_id || "Attendee")} ·{" "}
                    {(request.status || "unknown").replaceAll("_", " ")}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {!eventJoinRequestsLoading && eventJoinRequests.length === 0 ? (
            <p className="text-sm text-zinc-500">No join requests found for this event yet.</p>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-sm font-semibold text-white">Event Snapshot</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Status: {(selectedManagedEvent?.status || "unknown").replaceAll("_", " ")}</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Capacity: {selectedManagedEvent?.capacity ?? "—"}</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Approved: {selectedManagedEvent?.approved_participants ?? 0}</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Slots Left: {selectedManagedEvent?.available_slots ?? "—"}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="h-[86vh] max-h-[86vh] w-[min(96vw,1200px)] overflow-hidden border-white/15 bg-[#0C0C0C] p-0 text-white sm:max-w-[1200px] [&>button]:z-50 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:bg-black/70 [&>button]:p-1.5 [&>button]:text-white">
          {detailsLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details...
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 text-sm text-zinc-300 lg:grid-cols-[1.08fr_1fr]">
              <div className="h-full overflow-y-auto p-5 lg:p-6">
                <DialogHeader>
                  <DialogTitle className="text-white">{detailsEvent?.title || "Event details"}</DialogTitle>
                  <DialogDescription className="text-zinc-400">Full event payload summary from the details endpoint.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
                    <div className="relative h-52">
                      {detailsEvent?.image_url ? (
                        <img src={detailsEvent.image_url} loading="lazy" alt={detailsEvent.title || "Event"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.35),transparent_45%),linear-gradient(145deg,#1a1a1a,#0c0c0c)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-black/40 px-2 py-1 text-xs font-semibold text-zinc-100">
                          {(detailsEvent?.status || "unknown").replaceAll("_", " ")}
                        </span>
                        <span className="rounded-full border border-white/20 bg-black/40 px-2 py-1 text-xs font-semibold text-zinc-100">
                          Capacity {detailsEvent?.capacity ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="leading-relaxed">{detailsEvent?.description || "No description available."}</p>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-zinc-200">
                          <CalendarDays className="h-4 w-4 text-crimson" />
                          {toDisplayDateTime(detailsEvent?.starts_at)} - {toDisplayDateTime(detailsEvent?.ends_at)}
                        </p>
                        <p className="mt-2 inline-flex items-start gap-2 text-zinc-200">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                          {[detailsEvent?.location_name, detailsEvent?.address, detailsEvent?.city, detailsEvent?.country].filter(Boolean).join(", ") || "Location TBD"}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-2 text-zinc-200">
                          <Users className="h-4 w-4 text-crimson" />
                          {(detailsEvent?.approved_participants ?? 0)} joined · {detailsEvent?.available_slots ?? "—"} slots left
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#101010] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                            <Navigation className="h-4 w-4 text-crimson" />
                            Your route info
                          </p>
                          <button
                            type="button"
                            onClick={() => void requestViewerLocation()}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/10"
                          >
                            <LocateFixed className="h-3 w-3" />
                            Refresh location
                          </button>
                        </div>
                        {viewerLocationLoading ? (
                          <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-300">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Detecting your current location...
                          </p>
                        ) : null}
                        {viewerLocationError ? <p className="mt-2 text-xs text-rose-300">{viewerLocationError}</p> : null}
                        {viewerLocation ? (
                          <div className="mt-2 space-y-2 text-xs text-zinc-300">
                            <p>
                              You: {viewerLocation.lat.toFixed(5)}, {viewerLocation.lng.toFixed(5)}
                            </p>
                            <p>
                              Distance: {detailsDistanceKm !== null ? `${detailsDistanceKm.toFixed(1)} km` : "Not available"}
                            </p>
                            {directionsUrl ? (
                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-crimson/35 bg-crimson/15 px-2 py-1 font-medium text-crimson transition-colors hover:bg-crimson/25"
                              >
                                Open turn-by-turn path
                                <ChevronRight className="h-3.5 w-3.5" />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      My Join Status: {(detailsJoinStatus || "none").replaceAll("_", " ")}
                    </span>
                    <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Event ID: {detailsEvent?.id || "—"}</span>
                  </div>
                  {!myCreatedEventIds.has(detailsEvent?.id || "") ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-3">
                      {detailsJoinStatus ? (
                        <p className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold capitalize text-zinc-200">
                          Join status: {detailsJoinStatus.replaceAll("_", " ")}
                        </p>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Join ${detailsEvent?.title || "event"} from details`}
                          disabled={(detailsEvent?.available_slots ?? 1) <= 0 || !detailsEvent}
                          onClick={() => {
                            if (detailsEvent) openJoinDialog(detailsEvent);
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-crimson/50 bg-crimson/85 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {(detailsEvent?.available_slots ?? 1) > 0 ? "Join Event" : "Event Full"}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="relative h-full overflow-hidden border-t border-white/10 bg-[#0F0F0F] lg:border-l lg:border-t-0">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.22),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(232,25,44,0.12),transparent_42%)]" />
                <div className="absolute left-4 right-16 top-4 z-20 rounded-2xl border border-white/15 bg-black/35 p-3 backdrop-blur-md lg:right-4">
                  <p className="text-sm font-semibold text-white">Event Location Map</p>
                  <p className="mt-1 text-xs text-zinc-300">
                    {[detailsEvent?.location_name, detailsEvent?.city, detailsEvent?.country].filter(Boolean).join(", ") || "Location not available"}
                  </p>
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  <CustomMap
                    latitude={detailsCoords?.lat ?? null}
                    longitude={detailsCoords?.lng ?? null}
                    zoom={13}
                    interactive
                    height="100%"
                    markers={[
                      ...(viewerLocation
                        ? [
                            {
                              lat: viewerLocation.lat,
                              lng: viewerLocation.lng,
                              label: "Your current location",
                              color: "var(--foreground)",
                              markerType: "user" as const,
                            },
                          ]
                        : []),
                      ...(detailsCoords
                        ? [
                            {
                              lat: detailsCoords.lat,
                              lng: detailsCoords.lng,
                              label: detailsEvent?.title || "Event location",
                              color: "var(--crimson)",
                              live: detailsEvent ? isLiveEvent(detailsEvent, nowTick) : false,
                              markerType: "event" as const,
                            },
                          ]
                        : []),
                    ]}
                    routeCoordinates={
                      viewerLocation && detailsCoords
                        ? {
                            from: { lat: viewerLocation.lat, lng: viewerLocation.lng },
                            to: { lat: detailsCoords.lat, lng: detailsCoords.lng },
                          }
                        : null
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

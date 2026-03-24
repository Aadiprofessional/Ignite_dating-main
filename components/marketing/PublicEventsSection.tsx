"use client";

import CustomMap from "@/components/CustomMap";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, EventRecord } from "@/lib/api";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const getEventType = (event: EventRecord) => {
  const categoryText = getEventCategory(event).toLowerCase();
  const text = [event.title, event.description, categoryText].join(" ").toLowerCase();
  if (text.includes("dating") || text.includes("date night") || text.includes("speed date")) return "dating";
  if (text.includes("network") || text.includes("business") || text.includes("professional")) return "networking";
  if (text.includes("social") || text.includes("party") || text.includes("music")) return "social";
  return "other";
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

type PublicEventsSectionProps = {
  fullPage?: boolean;
};

export default function PublicEventsSection({ fullPage = false }: PublicEventsSectionProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeDateField, setActiveDateField] = useState<"start" | "end">("start");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState("");

  useEffect(() => {
    const loadPublicEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.listPublicRunningEvents();
        const payload = response.data || {};
        const items = payload.events || payload.running_events || payload.data || [];
        setEvents(
          [...items].sort((a, b) => {
            const aTime = a.starts_at ? new Date(a.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b.starts_at ? new Date(b.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
            return bTime - aTime;
          })
        );
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load public events.");
      } finally {
        setLoading(false);
      }
    };
    void loadPublicEvents();
  }, []);

  const detailsCoords = useMemo(() => {
    const lat = Number(selectedEvent?.latitude);
    const lng = Number(selectedEvent?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [selectedEvent?.latitude, selectedEvent?.longitude]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => set.add(getEventCategory(event)));
    return ["all", ...Array.from(set)];
  }, [events]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      const value = [event.city, event.country].filter(Boolean).join(", ") || event.location_name || "";
      if (value) set.add(value);
    });
    return ["all", ...Array.from(set)];
  }, [events]);

  const typeOptions = ["all", "dating", "networking", "social", "other"];
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
    const query = searchTerm.trim().toLowerCase();
    const eventsMap = new Map<string, Array<{ id: string; title: string; startsAtMs: number; event: EventRecord; color: string }>>();
    events.forEach((event, index) => {
      const eventCategory = getEventCategory(event);
      const eventType = getEventType(event);
      const eventLocation = [event.city, event.country].filter(Boolean).join(", ") || event.location_name || "";
      const content = [event.title, event.description, event.location_name, event.city, event.country, eventCategory].join(" ").toLowerCase();
      if (query && !content.includes(query)) return;
      if (selectedCategory !== "all" && eventCategory !== selectedCategory) return;
      if (selectedType !== "all" && eventType !== selectedType) return;
      if (selectedLocation !== "all" && eventLocation !== selectedLocation) return;
      if (!event.starts_at) return;
      const startDate = new Date(event.starts_at);
      if (Number.isNaN(startDate.getTime())) return;
      const rawEndDate = event.ends_at ? new Date(event.ends_at) : new Date(startDate);
      const endDate = Number.isNaN(rawEndDate.getTime()) ? new Date(startDate) : rawEndDate;
      const rangeStart = startDate.getTime() <= endDate.getTime() ? startDate : endDate;
      const rangeEnd = startDate.getTime() <= endDate.getTime() ? endDate : startDate;
      const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
      const rangeEndDate = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
      const eventId = event.id || `${event.title || "event"}-${index}`;
      const eventEntry = {
        id: eventId,
        title: event.title?.trim() || "Untitled event",
        startsAtMs: startDate.getTime(),
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
  }, [events, searchTerm, selectedCategory, selectedLocation, selectedType]);
  const selectedDayEvents = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return (calendarEventsByDate.get(selectedCalendarDay) ?? []).slice(0, 5);
  }, [calendarEventsByDate, selectedCalendarDay]);

  const filteredEvents = useMemo(() => {
    const fromTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const toTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
    const query = searchTerm.trim().toLowerCase();
    return events
      .filter((event) => {
        const eventCategory = getEventCategory(event);
        const eventType = getEventType(event);
        const eventLocation = [event.city, event.country].filter(Boolean).join(", ") || event.location_name || "";
        const content = [event.title, event.description, event.location_name, event.city, event.country, eventCategory].join(" ").toLowerCase();
        const eventTime = event.starts_at ? new Date(event.starts_at).getTime() : Number.NaN;

        if (query && !content.includes(query)) return false;
        if (selectedCategory !== "all" && eventCategory !== selectedCategory) return false;
        if (selectedType !== "all" && eventType !== selectedType) return false;
        if (selectedLocation !== "all" && eventLocation !== selectedLocation) return false;
        if (fromTime !== null && (Number.isNaN(eventTime) || eventTime < fromTime)) return false;
        if (toTime !== null && (Number.isNaN(eventTime) || eventTime > toTime)) return false;

        return true;
      })
      .sort((a, b) => {
        const aTime = a.starts_at ? new Date(a.starts_at).getTime() : Number.MIN_SAFE_INTEGER;
        const bTime = b.starts_at ? new Date(b.starts_at).getTime() : Number.MIN_SAFE_INTEGER;
        return bTime - aTime;
      });
  }, [endDate, events, searchTerm, selectedCategory, selectedLocation, selectedType, startDate]);

  const displayEvents = useMemo(() => (fullPage ? filteredEvents : filteredEvents.slice(0, 4)), [filteredEvents, fullPage]);

  return (
    <section className={`bg-background ${fullPage ? "pt-32 pb-20" : "py-20"}`}>
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <div className="mb-8">
          <p className="inline-flex rounded-full border border-crimson/35 bg-crimson/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">
            {fullPage ? "All Events" : "Live Events"}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[42px] leading-[0.95] text-offwhite md:text-[58px]">
            {fullPage ? "Explore every public event in one place" : "See what&apos;s happening near you right now"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-offwhite/65 md:text-base">
            {fullPage
              ? "Search, filter by location, category, type, and use calendar dates to find the exact events you want."
              : "Browse live public events, filter by category, and open full details instantly."}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
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

        {fullPage ? (
          <div className="mb-7 rounded-3xl border border-white/12 bg-white/[0.03] p-4 md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="group relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search event, city..."
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/25 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-crimson/60 focus:outline-none"
                />
              </label>
              <select
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white focus:border-crimson/60 focus:outline-none"
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Locations" : option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-zinc-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Event Type
              </span>
              {typeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition ${
                    selectedType === type
                      ? "border-crimson bg-crimson/25 text-offwhite"
                      : "border-white/15 bg-white/[0.03] text-offwhite/70 hover:bg-white/[0.08]"
                  }`}
                >
                  {type === "all" ? "All Types" : type}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                  setSelectedLocation("all");
                  setStartDate("");
                  setEndDate("");
                  setSelectedCalendarDay("");
                }}
                className="ml-auto rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-zinc-200 transition hover:bg-white/[0.08]"
              >
                Clear Filters
              </button>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-400">Date Range: {selectedDateLabel}</p>
          </div>
        ) : null}

        {error ? <p className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.03]">
                <div className="h-48 animate-pulse bg-zinc-800/70" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-700/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-700/50" />
                  <div className="h-10 w-full animate-pulse rounded-full bg-zinc-700/50" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayEvents.map((event) => (
              <article
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedEvent(event);
                  setDetailsOpen(true);
                }}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    setSelectedEvent(event);
                    setDetailsOpen(true);
                  }
                }}
                className="group overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.02] shadow-[0_16px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-crimson/35 hover:bg-white/[0.04]"
              >
                <div className="relative h-48 overflow-hidden">
                  {event.image_url ? (
                    <img src={event.image_url} loading="lazy" alt={event.title || "Event cover"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.35),transparent_45%),linear-gradient(145deg,#1a1a1a,#0c0c0c)]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <h3 className="line-clamp-2 font-display text-[24px] leading-[0.95] text-offwhite">
                      {event.title || "Untitled Event"}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                        isOnlineEvent(event) ? "border-sky-400/60 bg-sky-500/20 text-sky-200" : "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {isOnlineEvent(event) ? "Online" : "In Person"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3.5 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-1 rounded-full border border-crimson/40 bg-crimson/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-crimson">
                      {getEventCategory(event)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-offwhite/80">
                      <CalendarDays className="h-3.5 w-3.5 text-crimson" />
                      {toDisplayDateTime(event.starts_at)}
                    </span>
                    <span className="line-clamp-1 inline-flex items-center gap-1 text-offwhite/55">
                      <MapPin className="h-3.5 w-3.5" />
                      {[event.location_name, event.city].filter(Boolean).join(", ") || "Location TBD"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-offwhite/60">
                    {event.description || "No description yet."}
                  </p>
                  <button
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      router.push("/login");
                    }}
                    className="ignite-btn inline-flex w-full items-center justify-center rounded-full border border-crimson/50 bg-crimson/90 px-4 py-2.5 text-sm font-semibold text-offwhite transition hover:bg-crimson"
                  >
                    Join Event
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && events.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-offwhite/55">
            No public running events right now.
          </p>
        ) : null}

        {!loading && !error && events.length > 0 && displayEvents.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-offwhite/55">
            No events match these filters.
          </p>
        ) : null}

        <div className="mx-auto mt-8 w-full max-w-5xl rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-3 md:p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-300">
              <CalendarDays className="h-4 w-4 text-crimson" />
              Event Calendar
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{currentMonthLabel}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button
              type="button"
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
              onClick={() => setActiveDateField("end")}
              className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                activeDateField === "end" ? "border-crimson/70 bg-crimson/20 text-white" : "border-white/15 bg-white/[0.03] text-zinc-300"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">To Date</p>
              <p className="mt-1 font-medium">{endDate || "Not selected"}</p>
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 rounded-2xl border border-white/12 bg-black/25 p-2.5 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-zinc-200 transition hover:bg-white/[0.08]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200">{currentMonthLabel}</p>
                <button
                  type="button"
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
                            setSelectedEvent(item.event);
                            setDetailsOpen(true);
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
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCalendarDay("");
                }}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.08]"
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>

        {!fullPage ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/live-events")}
              className="inline-flex items-center justify-center rounded-full border border-crimson/50 bg-crimson/90 px-5 py-2.5 text-sm font-semibold text-offwhite transition hover:bg-crimson"
            >
              View More Events
            </button>
          </div>
        ) : null}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="h-[86vh] max-h-[86vh] w-[min(96vw,1200px)] overflow-hidden border-white/15 bg-[#0C0C0C] p-0 text-white sm:max-w-[1200px] [&>button]:z-50 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:bg-black/70 [&>button]:p-1.5 [&>button]:text-white">
          {!selectedEvent ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details...
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 text-sm text-zinc-300 lg:grid-cols-[1.08fr_1fr]">
              <div className="h-full overflow-y-auto p-5 lg:p-6">
                <DialogHeader>
                  <DialogTitle className="text-white">{selectedEvent.title || "Event details"}</DialogTitle>
                  <DialogDescription className="text-zinc-400">Public event details.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
                    <div className="relative h-52">
                      {selectedEvent.image_url ? (
                        <img src={selectedEvent.image_url} loading="lazy" alt={selectedEvent.title || "Event"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(232,25,44,0.35),transparent_45%),linear-gradient(145deg,#1a1a1a,#0c0c0c)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="leading-relaxed">{selectedEvent.description || "No description available."}</p>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-zinc-200">
                          <CalendarDays className="h-4 w-4 text-crimson" />
                          {toDisplayDateTime(selectedEvent.starts_at)} - {toDisplayDateTime(selectedEvent.ends_at)}
                        </p>
                        <p className="mt-2 inline-flex items-start gap-2 text-zinc-200">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                          {[selectedEvent.location_name, selectedEvent.address, selectedEvent.city, selectedEvent.country].filter(Boolean).join(", ") || "Location TBD"}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-2 text-zinc-200">
                          <Users className="h-4 w-4 text-crimson" />
                          {(selectedEvent.approved_participants ?? 0)} joined · {selectedEvent.available_slots ?? "—"} slots left
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-crimson/50 bg-crimson/85 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson"
                      >
                        Join Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-full overflow-hidden border-t border-white/10 bg-[#0F0F0F] lg:border-l lg:border-t-0">
                <div className="absolute left-4 right-16 top-4 z-20 rounded-2xl border border-white/15 bg-black/35 p-3 backdrop-blur-md lg:right-4">
                  <p className="text-sm font-semibold text-white">Event Location Map</p>
                  <p className="mt-1 text-xs text-zinc-300">
                    {[selectedEvent.location_name, selectedEvent.city, selectedEvent.country].filter(Boolean).join(", ") || "Location not available"}
                  </p>
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  <CustomMap
                    latitude={detailsCoords?.lat ?? null}
                    longitude={detailsCoords?.lng ?? null}
                    zoom={13}
                    interactive
                    height="100%"
                    markers={
                      detailsCoords
                        ? [
                            {
                              lat: detailsCoords.lat,
                              lng: detailsCoords.lng,
                              label: selectedEvent.title || "Event location",
                              color: "var(--crimson)",
                              markerType: "event" as const,
                            },
                          ]
                        : []
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

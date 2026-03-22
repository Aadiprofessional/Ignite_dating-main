"use client";

import CustomMap from "@/components/CustomMap";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, EventRecord } from "@/lib/api";
import { CalendarDays, Loader2, MapPin, Users } from "lucide-react";
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

export default function PublicEventsSection() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

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
            return aTime - bTime;
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

  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <div className="mb-8">
          <p className="inline-flex rounded-full border border-crimson/35 bg-crimson/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">
            Live Events
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[42px] leading-[0.95] text-offwhite md:text-[58px]">
            See what&apos;s happening near you right now
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-offwhite/65 md:text-base">
            Browse live public events, preview full details with map view, and sign in to join instantly.
          </p>
        </div>

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
            {events.map((event) => (
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

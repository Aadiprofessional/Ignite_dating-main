"use client";

import { FilterDrawer } from "@/components/discover/FilterDrawer";
import { ProfileGrid } from "@/components/discover/ProfileGrid";
import { useStore } from "@/lib/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function DiscoverPage() {
  const { discoverProfiles, refreshDiscover } = useStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeChip, setActiveChip] = useState("Near Me");
  const [searchQuery, setSearchQuery] = useState("");

  const filterChips = ["Near Me", "New", "Online", "Verified", "Popular", "Recently Active"];

  useEffect(() => {
    if (discoverProfiles.length > 0) return;
    void refreshDiscover({ limit: 24 });
  }, [discoverProfiles.length, refreshDiscover]);

  const profiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return discoverProfiles;
    return discoverProfiles.filter((profile) => {
      const byName = profile.name.toLowerCase().includes(normalizedQuery);
      const byInterest = profile.interests.some((interest) => interest.toLowerCase().includes(normalizedQuery));
      return byName || byInterest;
    });
  }, [discoverProfiles, searchQuery]);

  const handleLoadMore = () => {
    void refreshDiscover({ limit: 48, search: searchQuery || undefined });
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 space-y-4 bg-[#080808]/80 px-4 pb-3 pt-4 backdrop-blur-md lg:px-8">
        {/* Search Bar */}
        <div className="mx-auto flex w-full max-w-6xl gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto pb-2 no-scrollbar mask-linear-fade lg:hidden">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeChip === chip
                  ? "bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(232,25,44,0.3)]"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.18em] text-zinc-500">Filter Mode</h2>
            <div className="grid grid-cols-1 gap-2">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeChip === chip
                      ? "border-crimson bg-crimson/20 text-white"
                      : "border-white/10 bg-[#0F0F0F] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </aside>
        <ProfileGrid profiles={profiles} onLoadMore={handleLoadMore} />
      </main>
      {/* Filter Drawer */}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}

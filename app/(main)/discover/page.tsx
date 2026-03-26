"use client";

import { FilterDrawer } from "@/components/discover/FilterDrawer";
import type { DiscoverSearchFilters } from "@/components/discover/FilterDrawer";
import { ProfileGrid } from "@/components/discover/ProfileGrid";
import { useStore } from "@/lib/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const defaultFilters: DiscoverSearchFilters = {
  universityIds: [],
  minAge: "",
  maxAge: "",
  hobbies: "",
  cities: "",
};

const parseCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseAge = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const ageGroupOptions = [
  { label: "Any age", min: "", max: "" },
  { label: "18 - 21", min: "18", max: "21" },
  { label: "22 - 25", min: "22", max: "25" },
  { label: "26 - 30", min: "26", max: "30" },
  { label: "31 - 40", min: "31", max: "40" },
];

export default function DiscoverPage() {
  const { discoverProfiles, universities, searchUniversities, refreshDiscover, sendSwipe } = useStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverSearchFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<DiscoverSearchFilters>(defaultFilters);

  const hasAppliedFilters = useMemo(
    () =>
      appliedFilters.universityIds.length > 0 ||
      Boolean(appliedFilters.minAge.trim()) ||
      Boolean(appliedFilters.maxAge.trim()) ||
      Boolean(appliedFilters.hobbies.trim()) ||
      Boolean(appliedFilters.cities.trim()),
    [appliedFilters]
  );

  useEffect(() => {
    void searchUniversities("");
  }, [searchUniversities]);

  const selectedAgeGroup = useMemo(
    () =>
      ageGroupOptions.find((option) => option.min === filters.minAge && option.max === filters.maxAge)?.label || "Custom",
    [filters.maxAge, filters.minAge]
  );

  const applyFilters = (nextFilters: DiscoverSearchFilters) => {
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchQuery.trim();
      if (!q && !hasAppliedFilters) {
        void refreshDiscover({
          limit: 10,
          university_mode: "all",
        });
        return;
      }
      void refreshDiscover({
        q: q || undefined,
        university_ids: appliedFilters.universityIds,
        min_age: parseAge(appliedFilters.minAge),
        max_age: parseAge(appliedFilters.maxAge),
        hobbies: parseCommaSeparated(appliedFilters.hobbies),
        cities: parseCommaSeparated(appliedFilters.cities),
        limit: 20,
        offset: 0,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, appliedFilters, hasAppliedFilters, refreshDiscover]);

  const handleLike = async (profileId: string) => {
    await sendSwipe(profileId, "like");
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
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select
            value={filters.universityIds[0] || ""}
            onChange={(e) => {
              const next = {
                ...filters,
                universityIds: e.target.value ? [e.target.value] : [],
              };
              applyFilters(next);
            }}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-crimson/50"
          >
            <option value="" className="bg-zinc-900">All universities</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id} className="bg-zinc-900">
                {university.name}
              </option>
            ))}
          </select>
          <select
            value={selectedAgeGroup}
            onChange={(e) => {
              const picked = ageGroupOptions.find((option) => option.label === e.target.value) || ageGroupOptions[0];
              const next = {
                ...filters,
                minAge: picked.min,
                maxAge: picked.max,
              };
              applyFilters(next);
            }}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-crimson/50"
          >
            {ageGroupOptions.map((option) => (
              <option key={option.label} value={option.label} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
            <option value="Custom" className="bg-zinc-900">Custom</option>
          </select>
          <input
            type="text"
            placeholder="Hobby (Music)"
            value={filters.hobbies}
            onChange={(e) => {
              const next = { ...filters, hobbies: e.target.value };
              applyFilters(next);
            }}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50"
          />
          <input
            type="text"
            placeholder="City (Mumbai)"
            value={filters.cities}
            onChange={(e) => {
              const next = { ...filters, cities: e.target.value };
              applyFilters(next);
            }}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50"
          />
          <button
            onClick={() => applyFilters(defaultFilters)}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pt-5 lg:px-8">
        <ProfileGrid profiles={discoverProfiles} onLike={handleLike} />
      </main>
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        universityOptions={universities}
        onApply={() => setAppliedFilters(filters)}
        onReset={() => {
          applyFilters(defaultFilters);
        }}
      />
    </div>
  );
}

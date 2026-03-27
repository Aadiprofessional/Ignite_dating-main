"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import type { UniversityOption } from "@/lib/api";
import type { CityOptionGroup } from "@/lib/constants/chinaCities";

export interface DiscoverSearchFilters {
  universityIds: string[];
  minAge: string;
  maxAge: string;
  hobbies: string;
  cities: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoverSearchFilters;
  setFilters: Dispatch<SetStateAction<DiscoverSearchFilters>>;
  universityOptions: UniversityOption[];
  cityOptionGroups: CityOptionGroup[];
  onApply: () => void;
  onReset: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  universityOptions,
  cityOptionGroups,
  onApply,
  onReset,
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-zinc-800 rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-bold text-2xl text-white">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8 pb-24">
              <div className="space-y-2">
                <label className="block text-sm font-mono text-zinc-400">Universities</label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  {universityOptions.length === 0 ? (
                    <p className="text-xs text-zinc-500">No universities available.</p>
                  ) : (
                    universityOptions.map((university) => {
                      const checked = filters.universityIds.includes(university.id);
                      return (
                        <label key={university.id} className="flex items-center gap-2 text-sm text-zinc-200">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setFilters((current) => ({
                                ...current,
                                universityIds: checked
                                  ? current.universityIds.filter((id) => id !== university.id)
                                  : [...current.universityIds, university.id],
                              }))
                            }
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-crimson focus:ring-crimson"
                          />
                          <span>{university.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-zinc-400">Min age</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.minAge}
                    onChange={(e) => setFilters((current) => ({ ...current, minAge: e.target.value }))}
                    placeholder="21"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-zinc-400">Max age</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.maxAge}
                    onChange={(e) => setFilters((current) => ({ ...current, maxAge: e.target.value }))}
                    placeholder="28"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-mono text-zinc-400">Hobbies (comma-separated)</label>
                <input
                  type="text"
                  value={filters.hobbies}
                  onChange={(e) => setFilters((current) => ({ ...current, hobbies: e.target.value }))}
                  placeholder="Music,Travel"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-crimson/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-mono text-zinc-400">City</label>
                <select
                  value={filters.cities}
                  onChange={(e) => setFilters((current) => ({ ...current, cities: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-crimson/50"
                >
                  <option value="" className="bg-zinc-900">
                    All cities
                  </option>
                  {cityOptionGroups.map((group) => (
                    <optgroup key={group.label} label={group.label} className="bg-zinc-900 text-zinc-300">
                      {group.options.map((city) => (
                        <option key={city} value={city} className="bg-zinc-900">
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={onReset}
                  className="flex-1 py-4 rounded-full border border-zinc-800 font-bold text-zinc-400 hover:bg-zinc-900 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    onApply();
                    onClose();
                  }}
                  className="flex-1 py-4 rounded-full bg-crimson font-bold text-white shadow-[0_0_20px_rgba(232,25,44,0.4)] hover:bg-crimson/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

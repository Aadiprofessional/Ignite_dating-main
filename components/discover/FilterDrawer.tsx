"use client";

import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterDrawer({ isOpen, onClose }: FilterDrawerProps) {
  const [distance, setDistance] = useState([10]);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [heightRange, setHeightRange] = useState([150, 190]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const genders = ["Men", "Women", "Non-binary"];
  const goals = ["Casual", "Serious", "Friends", "Open"];

  const toggleGender = (gender: string) => {
    if (selectedGenders.includes(gender)) {
      setSelectedGenders(selectedGenders.filter((g) => g !== gender));
    } else {
      setSelectedGenders([...selectedGenders, gender]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
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
              {/* Distance */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-mono text-zinc-400">Maximum Distance</span>
                  <span className="font-bold text-crimson">{distance} km</span>
                </div>
                <Slider
                  defaultValue={[10]}
                  max={100}
                  step={1}
                  value={distance}
                  onValueChange={setDistance}
                  className="py-4"
                />
              </div>

              {/* Age Range */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-mono text-zinc-400">Age Range</span>
                  <span className="font-bold text-crimson">
                    {ageRange[0]} - {ageRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[18, 35]}
                  max={60}
                  min={18}
                  step={1}
                  value={ageRange}
                  onValueChange={setAgeRange}
                  className="py-4"
                />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <span className="font-mono text-sm text-zinc-400">Show me</span>
                <div className="flex flex-wrap gap-2">
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => toggleGender(gender)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedGenders.includes(gender)
                          ? "bg-crimson border-crimson text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relationship Goals */}
              <div className="space-y-3">
                <span className="font-mono text-sm text-zinc-400">Relationship Goals</span>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedGoals.includes(goal)
                          ? "bg-crimson border-crimson text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => {
                    setDistance([10]);
                    setAgeRange([18, 35]);
                    setSelectedGenders([]);
                    setSelectedGoals([]);
                  }}
                  className="flex-1 py-4 rounded-full border border-zinc-800 font-bold text-zinc-400 hover:bg-zinc-900 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
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

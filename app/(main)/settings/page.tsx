"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, LogOut, Save, Shield, User } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { BrandLogo } from "@/components/ui/flame-logo";

function SettingSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-4">{title}</h2>
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ 
  icon: Icon, 
  label, 
  value, 
  onClick, 
  type = "link",
  checked = false
}: { 
  icon?: any, 
  label: string, 
  value?: string, 
  onClick?: () => void, 
  type?: "link" | "toggle" | "button",
  checked?: boolean
}) {
  return (
    <div 
      onClick={type !== "toggle" ? onClick : undefined}
      className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 active:bg-white/5 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-white/60" />}
        <span className="font-medium text-sm">{label}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {value && <span className="text-white/40 text-sm">{value}</span>}
        
        {type === "link" && <ChevronRight className="w-4 h-4 text-white/30" />}
        
        {type === "toggle" && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-crimson' : 'bg-white/20'}`}
          >
            <motion.div 
              initial={false}
              animate={{ x: checked ? 18 : 2 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout, currentUser, updateProfile } = useStore();
  const [distance, setDistance] = useState(50);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [showMe, setShowMe] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setDistance(currentUser.preferences.maxDistanceKm || 50);
    setMinAge(currentUser.preferences.minAge || 18);
    setMaxAge(currentUser.preferences.maxAge || 35);
    setShowMe(currentUser.preferences.showMe);
  }, [currentUser]);

  const hasUnsavedChanges = useMemo(() => {
    if (!currentUser) return false;
    return (
      distance !== currentUser.preferences.maxDistanceKm ||
      minAge !== currentUser.preferences.minAge ||
      maxAge !== currentUser.preferences.maxAge ||
      showMe !== currentUser.preferences.showMe
    );
  }, [currentUser, distance, maxAge, minAge, showMe]);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await updateProfile({
        preferences: {
          minAge,
          maxAge,
          maxDistanceKm: distance,
          interestedIn: currentUser.preferences.interestedIn,
          showMe,
        },
      });
      setSaveSuccess("Preferences updated.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white/60">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pb-24 text-white lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-xl font-bold">Settings</h1>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
        <div>
        <SettingSection title="Profile">
          <SettingItem icon={User} label="Edit Profile" onClick={() => router.push('/profile/edit')} />
          <SettingItem icon={Shield} label="Safety Center" onClick={() => router.push('/safety')} />
        </SettingSection>

        <SettingSection title="Discovery">
          <div className="p-4 border-b border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Maximum Distance</span>
              <span className="text-sm text-white/50">{distance}km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={distance} 
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-crimson"
            />
          </div>
          <div className="p-4 border-b border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Age Range</span>
              <span className="text-sm text-white/50">{minAge} - {maxAge}</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-white/40 mb-1">Min age</div>
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={minAge}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setMinAge(Math.min(next, maxAge - 1));
                  }}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-crimson"
                />
              </div>
              <div>
                <div className="text-xs text-white/40 mb-1">Max age</div>
                <input
                  type="range"
                  min="19"
                  max="70"
                  value={maxAge}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setMaxAge(Math.max(next, minAge + 1));
                  }}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-crimson"
                />
              </div>
            </div>
          </div>
          <SettingItem 
            label="Show me on Hkmeetup" 
            type="toggle" 
            checked={showMe} 
            onClick={() => setShowMe(!showMe)} 
          />
        </SettingSection>
        {saveError ? <p className="text-sm text-crimson mt-3">{saveError}</p> : null}
        {saveSuccess ? <p className="text-sm text-emerald-400 mt-3">{saveSuccess}</p> : null}
        </div>

        <div>
        <div className="space-y-4 mt-8 mb-12">
          <button
            onClick={() => void handleSave()}
            disabled={!hasUnsavedChanges || isSaving}
            className="w-full py-3 rounded-xl bg-crimson text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <div className="text-center pb-8">
          <BrandLogo className="mx-auto mb-2 h-8 w-8" />
          <p className="text-xs text-white/30">Hkmeetup Version 1.0.0 (Build 2024.05.20)</p>
        </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  Settings,
  Edit2,
  Star,
  Zap,
  Heart,
  ChevronRight,
  Crown,
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Ruler,
  Goal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { currentUser, isPro } = useStore();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/50">Loading profile...</div>
      </div>
    );
  }

  const filledFields = [
    currentUser.bio,
    currentUser.job,
    currentUser.education,
    currentUser.interests.length > 0,
    currentUser.photos.length > 0,
    currentUser.location.city && currentUser.location.city !== "Unknown",
  ].filter(Boolean).length;
  const completionPercentage = Math.min(100, Math.round((filledFields / 6) * 100));
  const primaryPhoto = currentUser.photos[0] || "https://picsum.photos/seed/hkmeetup-profile/400/600";
  const coverPhoto = currentUser.photos[1] || primaryPhoto;
  const detailRows = [
    { label: "Work", value: currentUser.job || "Add your work details", icon: BriefcaseBusiness },
    { label: "Education", value: currentUser.education || "Add your education", icon: GraduationCap },
    { label: "Height", value: currentUser.height || "Add your height", icon: Ruler },
    { label: "Goal", value: currentUser.relationshipGoal || "Set your relationship goal", icon: Goal },
  ];
  const stats = [
    { label: "Matches", value: String(currentUser.stats.matches), icon: Heart, color: "text-crimson" },
    { label: "Likes", value: String(currentUser.stats.likesReceived), icon: Star, color: "text-amber-500" },
    { label: "Views", value: String(currentUser.stats.profileViews), icon: Zap, color: "text-purple-400" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808] pb-24 lg:pb-8">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-full max-w-5xl -translate-x-1/2 bg-crimson/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-56 w-56 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">My Space</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-white">Profile</h1>
          </div>
          <Link href="/settings">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <Settings className="h-5 w-5 text-white/80" />
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[370px_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-[0_24px_70px_-28px_rgba(0,0,0,0.9)]"
          >
            <div className="relative h-36">
              <Image src={coverPhoto} alt={`${currentUser.name} cover`} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#080808]" />
              {!isPro && (
                <Link href="/wallet/buy" className="absolute right-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </span>
                </Link>
              )}
            </div>

            <div className="relative -mt-14 px-5 pb-5">
              <div className="mx-auto flex w-fit flex-col items-center">
                <div className="relative h-28 w-28">
                  <div className="absolute inset-0 rounded-full border-2 border-crimson p-1">
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image src={primaryPhoto} alt={currentUser.name} fill className="object-cover" />
                    </div>
                  </div>
                  <Link
                    href="/profile/edit"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] transition-colors hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4 text-white" />
                  </Link>
                </div>
                <div className="mt-3 text-center">
                  <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-white">
                    {currentUser.name}, {currentUser.age}
                    {currentUser.isVerified && <BadgeCheck className="h-5 w-5 text-sky-400" />}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">{currentUser.company || "Ignite Community"}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <MapPin className="h-3.5 w-3.5 text-crimson" />
                    {currentUser.location.city || "Location not set"}
                  </span>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                      <Crown className="h-3.5 w-3.5" />
                      Pro Member
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0e0e0e] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90">Profile Strength</span>
                  <span className="text-sm font-semibold text-crimson">{completionPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-crimson to-rose-400"
                  />
                </div>
                <p className="mt-2 text-xs text-white/50">
                  {completionPercentage === 100
                    ? "Your profile is complete and looking great."
                    : "Add more details and photos to improve your visibility."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center"
                  >
                    <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] uppercase tracking-widest text-white/40">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/profile/edit"
                  className="rounded-xl border border-crimson/30 bg-crimson/15 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-crimson/25"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/settings"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  Preferences
                </Link>
              </div>
            </div>
          </motion.section>

          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-crimson" />
                <h3 className="font-serif text-xl font-semibold text-white">About Me</h3>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-white/75">
                {currentUser.bio || "Add a bio to tell people more about your vibe, hobbies, and what you are looking for."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <h3 className="mb-4 font-serif text-xl font-semibold text-white">Profile Details</h3>
              <div className="space-y-2">
                {detailRows.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <detail.icon className="h-4 w-4 text-crimson" />
                      <p className="text-sm text-white/60">{detail.label}</p>
                    </div>
                    <p className="max-w-[60%] truncate text-sm font-medium text-white">{detail.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <h3 className="mb-4 font-serif text-xl font-semibold text-white">Interests</h3>
              {currentUser.interests.length ? (
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-crimson/30 bg-crimson/15 px-3 py-1.5 text-xs font-medium text-crimson-light"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/55">Add interests to help people discover what you love.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <h3 className="mb-4 font-serif text-xl font-semibold text-white">Photos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {currentUser.photos.slice(0, 6).map((photo, index) => (
                  <div key={photo} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                    <Image src={photo} alt={`${currentUser.name} photo ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
                <Link
                  href="/profile/edit"
                  className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/25 text-sm text-white/70 transition-colors hover:bg-white/5"
                >
                  Add Photo
                </Link>
              </div>
            </motion.div>

            {!isPro && (
              <Link href="/wallet/buy">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-crimson p-1"
                >
                  <div className="flex items-center justify-between rounded-[22px] bg-[#0c0c0c] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-crimson">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Upgrade to Hkmeetup Pro</h3>
                        <p className="text-xs text-white/60">See who liked you, get boosts, and stand out faster.</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/50" />
                  </div>
                </motion.div>
              </Link>
            )}

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="space-y-3"
            >
              {[
                { icon: Settings, label: "Settings", href: "/settings" },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-white/65" />
                      <span className="text-sm font-medium text-white">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/30" />
                  </div>
                </Link>
              ))}
            </motion.div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-white/20">Hkmeetup v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heart, X } from "lucide-react";

type Profile = {
  name: string;
  age: number;
  distance: string;
  interests: [string, string];
  image: string;
};

const profiles: Profile[] = [
  {
    name: "Aisha",
    age: 24,
    distance: "2 miles away",
    interests: ["Poetry", "Hiking"],
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    name: "Marco",
    age: 26,
    distance: "4 miles away",
    interests: ["Coffee", "Photography"],
    image: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    name: "Priya",
    age: 23,
    distance: "1 mile away",
    interests: ["Travel", "Live Music"],
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
];

function ProfileCard({
  profile,
  active,
  forceSwipe,
  onSwiped,
}: {
  profile: Profile;
  active: boolean;
  forceSwipe: { direction: "left" | "right"; id: number } | null;
  onSwiped: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -30], [1, 0]);
  const glow = useTransform(
    x,
    [-180, 0, 180],
    ["rgba(245,240,235,0.16)", "rgba(245,240,235,0.03)", "rgba(232,25,44,0.38)"],
  );
  const boxShadow = useMotionTemplate`0 0 45px ${glow}`;
  const swipingRef = useRef(false);

  const performSwipe = useCallback(
    (direction: "left" | "right") => {
      if (swipingRef.current) {
        return;
      }
      swipingRef.current = true;
      animate(x, direction === "right" ? 800 : -800, {
        type: "spring",
        stiffness: 250,
        damping: 24,
        onComplete: onSwiped,
      });
    },
    [onSwiped, x],
  );

  useEffect(() => {
    if (!active || !forceSwipe) {
      return;
    }
    performSwipe(forceSwipe.direction);
  }, [active, forceSwipe, performSwipe]);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/12"
      style={{
        x,
        rotate: active ? rotate : 0,
        boxShadow,
      }}
      drag={active && !swipingRef.current ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (!active || swipingRef.current) {
          return;
        }
        if (info.offset.x > 120) {
          performSwipe("right");
          return;
        }
        if (info.offset.x < -120) {
          performSwipe("left");
          return;
        }
        animate(x, 0, { type: "spring", stiffness: 280, damping: 25 });
      }}
    >
      <Image src={profile.image} alt={profile.name} fill sizes="340px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-transparent" />

      {active ? (
        <>
          <motion.span
            style={{ opacity: likeOpacity }}
            className="absolute left-5 top-6 rounded-md border-2 border-crimson px-3 py-1 font-display text-xl text-crimson -rotate-[15deg]"
          >
            LIKE ❤️
          </motion.span>
          <motion.span
            style={{ opacity: nopeOpacity }}
            className="absolute right-5 top-6 rounded-md border-2 border-white px-3 py-1 font-display text-xl text-offwhite rotate-[15deg]"
          >
            NOPE ✕
          </motion.span>
        </>
      ) : null}

      <div className="absolute bottom-0 w-full p-6">
        <h3 className="font-display text-4xl text-offwhite">
          {profile.name}, {profile.age}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-offwhite/75">
          {profile.distance}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.interests.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-offwhite/85"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeDemo() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [index, setIndex] = useState(0);
  const [forcedSwipe, setForcedSwipe] = useState<{
    direction: "left" | "right";
    id: number;
  } | null>(null);

  const visibleCards = useMemo(
    () => profiles.slice(index, index + 3),
    [index],
  );

  const done = index >= profiles.length;

  const handleSwiped = () => {
    setIndex((previous) => previous + 1);
    setForcedSwipe(null);
  };

  return (
    <motion.section
      id="try-it"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7 }}
      className="bg-background py-24 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.28em] text-crimson">
          TRY IT NOW
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-[40px] leading-[0.95] text-offwhite md:text-[62px]">
          Test the swiping experience before creating your account
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-offwhite/60 md:text-base">
          Explore how matching feels on IGNITE with a live preview flow designed for faster, clearer actions.
        </p>

        <div className="mt-14 rounded-[34px] border border-white/10 bg-white/[0.02] p-4 sm:p-6 lg:p-8">
          <div className="grid items-center justify-items-center gap-8 lg:grid-cols-[minmax(0,1fr)_340px_120px] lg:gap-10">
            <div className="order-2 w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left lg:order-1 lg:max-w-[420px] lg:self-stretch">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-crimson/90">
                Desktop Preview
              </p>
              <h3 className="mt-3 font-display text-4xl leading-[0.95] text-offwhite">
                Swipe with confidence
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-offwhite/65">
                Review profile details clearly, then make faster choices with one-tap actions.
                The layout keeps controls visible so decision making feels effortless on desktop.
              </p>
              <div className="mt-5 grid gap-2.5">
                {[
                  "Profile details stay readable during swipe",
                  "Fast pass/like controls beside the preview",
                  "Smooth card transitions with instant feedback",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-offwhite/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="ignite-btn mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-offwhite transition hover:border-crimson/60 hover:text-offwhite"
              >
                Continue to Sign Up
              </Link>
            </div>

            <div className="order-1 relative lg:order-2">
              <div className="relative h-[690px] w-[336px] rounded-[58px] border border-white/30 bg-gradient-to-b from-[#2b2b2b] via-[#1e1e1e] to-[#121212] p-[9px] shadow-[0_40px_120px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.25)]">
                <span className="pointer-events-none absolute -left-[3px] top-[145px] h-16 w-[3px] rounded-r-full bg-white/35" />
                <span className="pointer-events-none absolute -left-[3px] top-[220px] h-24 w-[3px] rounded-r-full bg-white/35" />
                <span className="pointer-events-none absolute -right-[3px] top-[200px] h-20 w-[3px] rounded-l-full bg-white/35" />
                <div className="pointer-events-none absolute left-1/2 top-4 z-[80] h-7 w-28 -translate-x-1/2 rounded-full border border-white/10 bg-black/95 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]" />
                <div className="relative h-full w-full overflow-hidden rounded-[49px] border border-white/10 bg-black pt-12">
                  {done ? (
                    <div className="flex h-full items-center justify-center p-6">
                      <div className="glass-card w-full rounded-[28px] p-8 text-center">
                        <p className="text-4xl">🔥</p>
                        <h3 className="mt-4 font-display text-4xl text-offwhite">
                          Ready for the real thing?
                        </h3>
                        <Link
                          href="/signup"
                          className="ignite-btn mt-7 inline-flex w-full items-center justify-center rounded-full bg-crimson px-6 py-3 font-body font-semibold text-offwhite"
                        >
                          Create Free Account
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      {visibleCards
                        .map((profile, stackIndex) => {
                          const active = stackIndex === 0;
                          const scale = active ? 1 : stackIndex === 1 ? 0.95 : 0.9;
                          const translateY = active ? 0 : stackIndex === 1 ? 12 : 24;
                          const zIndex = 30 - stackIndex * 10;

                          return (
                            <motion.div
                              key={`${profile.name}-${index}-${stackIndex}`}
                              className="absolute inset-0"
                            initial={{ opacity: 0, y: 36, scale: 0.86 }}
                            animate={{ opacity: 1, y: translateY, scale }}
                            transition={{ type: "spring", stiffness: 240, damping: 25 }}
                              style={{
                                zIndex,
                              }}
                            >
                              <ProfileCard
                                profile={profile}
                                active={active}
                                forceSwipe={active ? forcedSwipe : null}
                                onSwiped={handleSwiped}
                              />
                            </motion.div>
                          );
                        })
                        .reverse()}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="order-3 flex w-full max-w-[340px] flex-row justify-center gap-5 lg:w-auto lg:max-w-none lg:flex-col lg:items-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() =>
                    !done &&
                    setForcedSwipe({
                      direction: "left",
                      id: Date.now(),
                    })
                  }
                  className="ignite-btn inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-transparent text-offwhite"
                  aria-label="Pass"
                >
                  <X className="h-8 w-8" />
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-offwhite/60">
                  Pass
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() =>
                    !done &&
                    setForcedSwipe({
                      direction: "right",
                      id: Date.now(),
                    })
                  }
                  className="ignite-btn animate-pulseGlow inline-flex h-20 w-20 items-center justify-center rounded-full bg-crimson text-offwhite shadow-[0_0_35px_rgba(232,25,44,0.35)]"
                  aria-label="Like"
                >
                  <Heart className="h-8 w-8" />
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-offwhite/60">
                  Like
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

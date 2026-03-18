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
      className="bg-background py-32"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.35em] text-crimson">
          TRY IT NOW
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-center font-display text-[42px] leading-[0.95] text-offwhite md:text-[64px]">
          Feel the spark before you sign up
        </h2>

        <div className="mt-14 grid items-center justify-items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="relative h-[600px] w-[340px] rounded-[44px] border-2 border-white/12 bg-[#0D0D0D] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black">
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
                          style={{
                            zIndex,
                            scale,
                            y: translateY,
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

          <div className="flex flex-row gap-5 lg:flex-col">
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
          </div>
        </div>
      </div>
    </motion.section>
  );
}

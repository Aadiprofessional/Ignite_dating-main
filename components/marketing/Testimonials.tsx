"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Story = {
  names: string;
  quote: string;
  avatars: [string, string];
};

const stories: Story[] = [
  {
    names: "Zara & Noah",
    quote: "One late-night match turned into sunrise coffee and now we're planning our wedding.",
    avatars: [
      "https://randomuser.me/api/portraits/women/12.jpg",
      "https://randomuser.me/api/portraits/men/14.jpg",
    ],
  },
  {
    names: "Mia & Rohan",
    quote: "We both swiped right because of playlists. The chemistry was instant.",
    avatars: [
      "https://randomuser.me/api/portraits/women/22.jpg",
      "https://randomuser.me/api/portraits/men/24.jpg",
    ],
  },
  {
    names: "Yuki & James",
    quote: "We matched on a Sunday and spent the whole week finishing each other's sentences.",
    avatars: [
      "https://randomuser.me/api/portraits/women/33.jpg",
      "https://randomuser.me/api/portraits/men/37.jpg",
    ],
  },
  {
    names: "Layla & Ethan",
    quote: "It felt effortless from day one. IGNITE helped us skip the awkward part.",
    avatars: [
      "https://randomuser.me/api/portraits/women/39.jpg",
      "https://randomuser.me/api/portraits/men/43.jpg",
    ],
  },
  {
    names: "Sofia & Kai",
    quote: "We met halfway for tacos and now we travel together every month.",
    avatars: [
      "https://randomuser.me/api/portraits/women/48.jpg",
      "https://randomuser.me/api/portraits/men/50.jpg",
    ],
  },
  {
    names: "Aria & Dev",
    quote: "Our first message thread looked like a movie script. We never stopped talking.",
    avatars: [
      "https://randomuser.me/api/portraits/women/54.jpg",
      "https://randomuser.me/api/portraits/men/58.jpg",
    ],
  },
  {
    names: "Nadia & Liam",
    quote: "The app made it easy to find someone serious without feeling serious.",
    avatars: [
      "https://randomuser.me/api/portraits/women/62.jpg",
      "https://randomuser.me/api/portraits/men/66.jpg",
    ],
  },
  {
    names: "Priya & Alex",
    quote: "A random like became our favorite love story. Still feels like a spark every day.",
    avatars: [
      "https://randomuser.me/api/portraits/women/72.jpg",
      "https://randomuser.me/api/portraits/men/76.jpg",
    ],
  },
];

function StoryCard({ story }: { story: Story }) {
  return (
    <article className="glass-card min-w-[320px] p-6">
      <div className="flex gap-1 text-crimson">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>★</span>
        ))}
      </div>
      <p className="mt-3 font-display text-6xl leading-none text-crimson/20">“</p>
      <p className="mt-2 font-body text-base italic leading-relaxed text-offwhite/75">
        {story.quote}
      </p>
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex">
            {story.avatars.map((avatar, index) => (
              <span
                key={avatar}
                className={`relative inline-flex h-9 w-9 overflow-hidden rounded-full border border-white/15 ${index === 0 ? "" : "-ml-2"}`}
              >
                <Image src={avatar} alt={story.names} fill sizes="36px" />
              </span>
            ))}
          </div>
          <div>
            <p className="font-body text-sm text-offwhite">{story.names}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite/60">
              Matched on IGNITE 🔥
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const rowA = [...stories, ...stories];
  const rowB = [...stories.slice(4), ...stories.slice(0, 4), ...stories.slice(4), ...stories.slice(0, 4)];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7 }}
      className="overflow-hidden bg-[#0A0A0A] py-32"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.35em] text-crimson">
          REAL STORIES
        </p>
        <h2 className="mt-5 text-center font-display text-[40px] leading-[0.95] text-offwhite md:text-[64px]">
          They found their spark.
          <span className="ml-3 italic text-crimson">You&apos;re next.</span>
        </h2>
      </div>

      <div className="mt-14 space-y-6">
        <div className="group overflow-hidden">
          <div className="flex w-max gap-6 animate-[scrollLeft_35s_linear_infinite] group-hover:[animation-play-state:paused]">
            {rowA.map((story, index) => (
              <StoryCard key={`${story.names}-${index}`} story={story} />
            ))}
          </div>
        </div>

        <div className="group overflow-hidden">
          <div className="flex w-max gap-6 animate-[scrollLeft_35s_linear_infinite] [animation-direction:reverse] group-hover:[animation-play-state:paused]">
            {rowB.map((story, index) => (
              <StoryCard key={`${story.names}-reverse-${index}`} story={story} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

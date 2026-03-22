"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MiniProfileDrawer } from "@/components/chat/MiniProfileDrawer";
import { mockMessages } from "@/lib/mockMatches";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ChatPageClientProps {
  id: string;
}

export function ChatPageClient({ id }: ChatPageClientProps) {
  const router = useRouter();
  const { matches, blockUser, reportUser } = useStore();
  const match = matches.find((m) => m.id === id);
  const messages = mockMessages[id] || [];

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (match?.online) {
      const timeout = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [match]);

  if (!match) {
    return <div className="text-white p-10">Match not found</div>;
  }

  const noiseBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50" style={noiseBg} />
      <ChatHeader match={match} onProfileClick={() => setShowMiniProfile(true)} />
      <div className="z-10 flex-1 space-y-6 overflow-y-auto px-4 pt-4 pb-4">
        <div className="flex justify-center">
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          const showTimestamp = false;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={isMe}
              showTimestamp={showTimestamp}
              onImageClick={(url) => setLightboxImage(url)}
            />
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 mt-1">
              <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
            </div>
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput />

      <AnimatePresence>
        {showMiniProfile && (
          <MiniProfileDrawer
            match={match}
            onClose={() => setShowMiniProfile(false)}
            onUnmatch={() => {
              void blockUser(match.id);
              setShowMiniProfile(false);
              router.push("/matches");
            }}
            onReport={() => {
              void reportUser(match.id, "abuse", "Reported from mini profile drawer");
              setShowMiniProfile(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-800/50 rounded-full text-white hover:bg-zinc-700 transition-colors"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightboxImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

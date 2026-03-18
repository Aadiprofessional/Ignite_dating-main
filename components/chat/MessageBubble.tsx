"use client";

import { Message } from "@/lib/mockMatches";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showTimestamp: boolean;
  onImageClick?: (url: string) => void;
}

export function MessageBubble({ message, isMe, showTimestamp, onImageClick }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  if (message.type === "notification") {
    return (
        <div className="w-full flex justify-center my-4">
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 rounded-full">
                <span className="text-crimson text-xs">❤️</span>
                <span className="text-zinc-400 text-xs font-medium">{message.text}</span>
            </div>
        </div>
    )
  }

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-1 group`}>
      {/* Timestamp Pill */}
      {showTimestamp && (
        <div className="w-full flex justify-center my-4">
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-full">
            {format(message.timestamp, "MMM d, h:mm a")}
          </span>
        </div>
      )}

      <div
        className="relative max-w-[75%]"
        onContextMenu={(e) => {
          e.preventDefault();
          setShowReactions(!showReactions);
        }}
      >
        {/* Reaction Picker */}
        {showReactions && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute bottom-full mb-2 ${
              isMe ? "right-0" : "left-0"
            } bg-zinc-800 rounded-full p-1 flex gap-1 shadow-lg z-10 border border-zinc-700`}
          >
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setShowReactions(false)}
                className="hover:bg-zinc-700 p-1.5 rounded-full transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}

        {/* Bubble */}
        <div
          className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-crimson text-white rounded-[20px_20px_4px_20px]"
              : "bg-[#ffffff0d] text-zinc-100 rounded-[20px_20px_20px_4px] border border-white/5"
          }`}
        >
          {message.type === "text" && <p>{message.text}</p>}
          
          {(message.type === "image" || message.type === "gif") && (
            <div className="rounded-lg overflow-hidden my-1 cursor-pointer" onClick={() => onImageClick?.(message.mediaUrl || "")}>
              <img src={message.mediaUrl} alt="Sent media" className="max-w-full object-cover" />
              {message.type === "gif" && (
                 <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-white/20">
                    GIF
                 </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? "text-white/70" : "text-zinc-500"}`}>
            <span className="text-[10px] font-mono">
              {format(message.timestamp, "HH:mm")}
            </span>
            {isMe && (
              <span className="ml-0.5">
                {message.status === "sent" && <Check size={12} />}
                {message.status === "delivered" && <CheckCheck size={12} />}
                {message.status === "read" && <CheckCheck size={12} className="text-white" />} 
                {/* Note: "crimson double tick" on crimson bg might be hard to see, using white for read on sent bubble */}
              </span>
            )}
          </div>

          {/* Reactions Display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`absolute -bottom-2 ${isMe ? "left-0" : "right-0"} bg-zinc-800 rounded-full px-1.5 py-0.5 text-xs shadow-sm border border-zinc-700`}>
              {message.reactions.join("")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

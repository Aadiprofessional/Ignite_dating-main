"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, CheckCheck, MoreHorizontal, Pause, Play, Reply } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ChatUiMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: "uploading" | "sent" | "delivered" | "read";
  type: "text" | "image" | "gif" | "video" | "notification";
  reactionEmojis?: string[];
  mediaUrl?: string;
  mediaKind?: "image" | "gif" | "video" | "audio";
  replyToMessageId?: string;
}

interface MessageBubbleProps {
  message: ChatUiMessage;
  isMe: boolean;
  showTimestamp: boolean;
  onImageClick?: (url: string) => void;
  onReact?: (emoji: string) => void;
  onDeleteMe?: () => void;
  onDeleteEveryone?: () => void;
  canDeleteEveryone?: boolean;
  onReply?: () => void;
}

function AudioMessagePlayer({ src, isMe }: { src: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    await audio.play();
    setIsPlaying(true);
  };

  const formatAudioTime = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    const minutes = Math.floor(safeValue / 60);
    const seconds = Math.floor(safeValue % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`my-1 w-[210px] rounded-xl border px-2.5 py-2 ${isMe ? "border-white/25 bg-white/10" : "border-zinc-700 bg-zinc-900/80"}`}>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void togglePlay()}
          className={`rounded-full p-2 ${isMe ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-100"}`}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => {
              const audio = audioRef.current;
              if (!audio) return;
              const nextTime = Number(event.target.value);
              audio.currentTime = nextTime;
              setCurrentTime(nextTime);
            }}
            className="h-1.5 w-full cursor-pointer accent-crimson"
          />
          <div className={`mt-1 flex items-center justify-between text-[10px] ${isMe ? "text-white/80" : "text-zinc-400"}`}>
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({
  message,
  isMe,
  showTimestamp,
  onImageClick,
  onReact,
  onDeleteMe,
  onDeleteEveryone,
  canDeleteEveryone,
  onReply,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const longPressRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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
        onPointerDown={() => {
          if (longPressRef.current) window.clearTimeout(longPressRef.current);
          longPressRef.current = window.setTimeout(() => {
            setShowReactions(true);
          }, 450);
        }}
        onPointerUp={() => {
          if (longPressRef.current) window.clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }}
        onPointerLeave={() => {
          if (longPressRef.current) window.clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStartRef.current;
          const touch = event.changedTouches[0];
          if (!start || !touch) return;
          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < 40) {
            onReply?.();
          }
        }}
      >
        <button
          onClick={() => setShowActions((prev) => !prev)}
          className={`absolute -top-2 ${isMe ? "-left-8" : "-right-8"} z-20 rounded-full border border-zinc-700 bg-zinc-900 p-1 text-zinc-300 opacity-100 transition md:opacity-0 md:group-hover:opacity-100`}
        >
          <MoreHorizontal size={14} />
        </button>
        {showActions && (
          <div className={`absolute bottom-full mb-2 z-30 ${isMe ? "right-0" : "left-0"} rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-lg`}>
            {onReply && (
              <button
                onClick={() => {
                  onReply();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
              >
                <Reply size={12} />
                Reply
              </button>
            )}
            {onDeleteMe && (
              <button
                onClick={() => {
                  onDeleteMe();
                  setShowActions(false);
                }}
                className="w-full rounded-lg px-3 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
              >
                Delete for me
              </button>
            )}
            {onDeleteEveryone && canDeleteEveryone && (
              <button
                onClick={() => {
                  onDeleteEveryone();
                  setShowActions(false);
                }}
                className="w-full rounded-lg px-3 py-1 text-left text-xs text-crimson hover:bg-zinc-800"
              >
                Delete for everyone
              </button>
            )}
          </div>
        )}
        {showReactions && (
          <div className={`absolute bottom-full mb-2 z-20 ${isMe ? "right-0" : "left-0"}`}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-800 rounded-full p-1 flex gap-1 shadow-lg border border-zinc-700"
            >
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact?.(emoji);
                    setShowReactions(false);
                  }}
                  className="hover:bg-zinc-700 p-1.5 rounded-full transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
            {(onDeleteMe || (onDeleteEveryone && canDeleteEveryone)) && (
              <div className="mt-2 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-lg">
                {onDeleteMe && (
                  <button
                    onClick={() => {
                      onDeleteMe();
                      setShowReactions(false);
                    }}
                    className="w-full rounded-lg px-3 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                  >
                    Delete for me
                  </button>
                )}
                {onDeleteEveryone && canDeleteEveryone && (
                  <button
                    onClick={() => {
                      onDeleteEveryone();
                      setShowReactions(false);
                    }}
                    className="w-full rounded-lg px-3 py-1 text-left text-xs text-crimson hover:bg-zinc-800"
                  >
                    Delete for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div
          className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-crimson text-white rounded-[20px_20px_4px_20px]"
              : "bg-[#ffffff0d] text-zinc-100 rounded-[20px_20px_20px_4px] border border-white/5"
          }`}
        >
          {message.type === "text" && <p>{message.text}</p>}
          
          {(message.type === "image" || message.type === "gif") && (
            <div
              className={`my-1 w-[170px] cursor-pointer overflow-hidden rounded-lg sm:w-[210px] ${message.type === "gif" ? "border border-fuchsia-500/30 bg-zinc-950" : ""}`}
              onClick={() => onImageClick?.(message.mediaUrl || "")}
            >
              <img src={message.mediaUrl} alt="Sent media" className="h-auto max-h-[240px] w-full object-cover" />
              {message.type === "gif" && (
                 <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-white/20">
                    GIF
                 </div>
              )}
            </div>
          )}
          {message.type === "video" && message.mediaUrl && (message.mediaKind === "audio" ? (
            <AudioMessagePlayer src={message.mediaUrl} isMe={isMe} />
          ) : (
            <video controls className="my-1 w-[170px] rounded-lg sm:w-[210px]">
              <source src={message.mediaUrl} />
            </video>
          ))}
          {message.type !== "text" && Boolean(message.text.trim()) && (
            <p className="mt-2 whitespace-pre-wrap break-words">{message.text}</p>
          )}

          <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? "text-white/70" : "text-zinc-500"}`}>
            <span className="text-[10px] font-mono">
              {format(message.timestamp, "HH:mm")}
            </span>
            {isMe && (
              <span className="ml-0.5">
                {message.status === "uploading" && <span className="text-[10px]">Uploading...</span>}
                {message.status === "sent" && <Check size={12} />}
                {message.status === "delivered" && <CheckCheck size={12} />}
                {message.status === "read" && <CheckCheck size={12} className="text-white" />} 
              </span>
            )}
          </div>

          {message.reactionEmojis && message.reactionEmojis.length > 0 && (
            <div className={`absolute -bottom-2 ${isMe ? "left-0" : "right-0"} bg-zinc-800 rounded-full px-1.5 py-0.5 text-xs shadow-sm border border-zinc-700`}>
              {message.reactionEmojis.join("")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

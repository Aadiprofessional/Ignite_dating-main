"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Mic, Plus, Send, Smile, Video } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type MediaSendType = "IMAGE" | "GIF" | "VIDEO";

interface ChatInputProps {
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSendText: (message: string) => Promise<void> | void;
  onSendMedia?: (payload: { type: MediaSendType; file: File; content?: string }) => Promise<void> | void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyToMessage?: { id: string; text: string; type: "text" | "image" | "gif" | "video" };
  onCancelReply?: () => void;
}

export function ChatInput({
  disabled = false,
  value,
  onValueChange,
  onSendText,
  onSendMedia,
  onTypingStart,
  onTypingStop,
  replyToMessage,
  onCancelReply,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<MediaSendType>("IMAGE");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const typingTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputValue = value ?? message;
  const setInputValue = (nextValue: string) => {
    if (onValueChange) onValueChange(nextValue);
    else setMessage(nextValue);
  };

  const mediaOptions = useMemo(
    () => [
      { icon: ImageIcon, label: "IMAGE", color: "bg-purple-500" },
      { icon: ImageIcon, label: "GIF", color: "bg-green-500" },
      { icon: Video, label: "VIDEO", color: "bg-blue-500" },
    ],
    []
  );

  const handleSendText = async () => {
    if (disabled) return;
    if (inputValue.trim()) {
      await onSendText(inputValue.trim());
      setInputValue("");
      onTypingStop?.();
    }
  };

  const handleSendMedia = async () => {
    if (disabled || !onSendMedia) return;
    if (!selectedMediaFile) return;
    await onSendMedia({ type: mediaType, file: selectedMediaFile, content: mediaCaption.trim() || undefined });
    setSelectedMediaFile(null);
    setMediaCaption("");
    setIsMediaOpen(false);
  };

  const mediaAccept = mediaType === "VIDEO" ? "video/*" : mediaType === "GIF" ? "image/gif" : "image/*";

  return (
    <div className="z-30">
      <AnimatePresence>
        {isMediaOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-full left-0 right-0 z-40 mb-2 rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-4 shadow-2xl"
          >
            <div className="grid grid-cols-3 gap-3">
              {mediaOptions.map((option) => (
                <button
                  key={option.label}
                  disabled={disabled}
                  onClick={() => {
                    setMediaType(option.label as MediaSendType);
                    setSelectedMediaFile(null);
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${option.color} ${
                      mediaType === option.label ? "ring-2 ring-white/80" : ""
                    }`}
                  >
                    <option.icon size={24} />
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaAccept}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedMediaFile(file);
                }}
                className="hidden"
              />
              <button
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500 disabled:opacity-50"
              >
                Choose file
              </button>
              <p className="flex-1 truncate text-xs text-zinc-400">
                {selectedMediaFile ? selectedMediaFile.name : `Select ${mediaType.toLowerCase()} from device`}
              </p>
              <button
                disabled={disabled || !selectedMediaFile}
                onClick={() => void handleSendMedia()}
                className="rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <input
              value={mediaCaption}
              onChange={(event) => setMediaCaption(event.target.value)}
              placeholder="Write a caption (optional)"
              className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#080808]/90 backdrop-blur-md border-t border-zinc-900 pb-safe">
        {replyToMessage && (
          <div className="mx-3 mt-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">Replying to</p>
                <p className="truncate text-xs text-zinc-200">
                  {replyToMessage.text || `${replyToMessage.type.toUpperCase()} message`}
                </p>
              </div>
              <button
                disabled={disabled}
                onClick={onCancelReply}
                className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 hover:border-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 p-3">
          <button
            disabled={disabled}
            onClick={() => setIsMediaOpen(!isMediaOpen)}
            className={`p-2 rounded-full transition-colors ${
              isMediaOpen ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Plus size={24} className={`transition-transform ${isMediaOpen ? "rotate-45" : ""}`} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                const nextValue = e.target.value;
                setInputValue(nextValue);
                if (disabled) return;
                if (nextValue.trim()) {
                  onTypingStart?.();
                  if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = window.setTimeout(() => {
                    onTypingStop?.();
                  }, 1500);
                } else {
                  onTypingStop?.();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendText();
                }
              }}
              disabled={disabled}
              placeholder="Type a message..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors">
              <Smile size={20} />
            </button>
          </div>

          {inputValue.trim() ? (
            <button
              onClick={() => void handleSendText()}
              disabled={disabled}
              className="p-3 bg-crimson rounded-full text-white shadow-[0_0_15px_rgba(232,25,44,0.4)] hover:scale-105 transition-transform"
            >
              <Send size={20} />
            </button>
          ) : (
            <button
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              onMouseLeave={() => setIsRecording(false)}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? "bg-crimson text-white scale-110 shadow-[0_0_20px_crimson]"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

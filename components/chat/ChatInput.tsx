"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Mic, Pause, Play, Plus, Send, Smile, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaType, setMediaType] = useState<MediaSendType>("IMAGE");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const inputValue = value ?? message;
  const setInputValue = useCallback(
    (nextValue: string) => {
      if (onValueChange) onValueChange(nextValue);
      else setMessage(nextValue);
    },
    [onValueChange]
  );

  const mediaOptions = useMemo(
    () => [
      { icon: ImageIcon, label: "IMAGE", color: "bg-purple-500" },
      { icon: ImageIcon, label: "GIF", color: "bg-green-500" },
      { icon: Video, label: "VIDEO", color: "bg-blue-500" },
    ],
    []
  );

  const emojiOptions = useMemo(
    () => ["😀", "😂", "😍", "😘", "🥰", "😎", "🔥", "❤️", "👍", "🎉", "🙌", "🤝", "😢", "😡", "🙏"],
    []
  );
  const audioMimeCandidates = useMemo(
    () => ["audio/mpeg", "audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"],
    []
  );
  const uploadLimits = useMemo(
    () => ({
      IMAGE: 8 * 1024 * 1024,
      GIF: 12 * 1024 * 1024,
      VIDEO: 35 * 1024 * 1024,
      AUDIO: 16 * 1024 * 1024,
    }),
    []
  );

  const isAudioFile = Boolean(selectedMediaFile?.type.startsWith("audio/"));
  const mediaPreviewUrl = useMemo(
    () => (selectedMediaFile ? URL.createObjectURL(selectedMediaFile) : null),
    [selectedMediaFile]
  );

  useEffect(() => {
    if (!mediaPreviewUrl) return;
    return () => {
      URL.revokeObjectURL(mediaPreviewUrl);
    };
  }, [mediaPreviewUrl]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        window.clearInterval(recordingIntervalRef.current);
      }
      mediaRecorderRef.current?.stop();
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      setIsRecording(false);
      return;
    }
    mediaRecorderRef.current.stop();
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.ceil(bytes / 1024)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled) return;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("Audio recording is not supported in this browser.");
      return;
    }
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      recordingChunksRef.current = [];
      const selectedMimeType =
        typeof MediaRecorder.isTypeSupported === "function"
          ? audioMimeCandidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || ""
          : "";
      if (typeof MediaRecorder.isTypeSupported === "function" && !selectedMimeType) {
        setRecordingError("Audio recording format is not supported in this browser.");
        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        return;
      }
      const recorder = selectedMimeType ? new MediaRecorder(stream, { mimeType: selectedMimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const resolvedMimeType = recorder.mimeType || selectedMimeType || "audio/webm";
        const extension = resolvedMimeType.includes("mpeg")
          ? "mp3"
          : resolvedMimeType.includes("mp4")
          ? "m4a"
          : resolvedMimeType.includes("ogg")
          ? "ogg"
          : "webm";
        const audioBlob = new Blob(recordingChunksRef.current, { type: resolvedMimeType });
        const file = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, { type: resolvedMimeType });
        if (file.size > uploadLimits.AUDIO) {
          setRecordingError(`Voice note is too large. Max ${formatFileSize(uploadLimits.AUDIO)} allowed.`);
          setSelectedMediaFile(null);
          setIsRecording(false);
          return;
        }
        setSelectedMediaFile(file);
        setMediaType("VIDEO");
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingIntervalRef.current) {
          window.clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((track) => track.stop());
          recordingStreamRef.current = null;
        }
      };
      recorder.start();
      setSelectedMediaFile(null);
      setIsAudioPreviewPlaying(false);
      setIsMediaOpen(false);
      setIsEmojiOpen(false);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setRecordingError("Microphone permission is needed to record audio.");
      setIsRecording(false);
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      }
      if (recordingIntervalRef.current) {
        window.clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [audioMimeCandidates, disabled, formatFileSize, uploadLimits.AUDIO]);

  const toggleAudioRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }
    void startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const toggleAudioPreview = useCallback(() => {
    if (!audioPreviewRef.current) return;
    if (isAudioPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsAudioPreviewPlaying(false);
      return;
    }
    void audioPreviewRef.current.play();
    setIsAudioPreviewPlaying(true);
  }, [isAudioPreviewPlaying]);

  const handlePrimarySend = async () => {
    if (disabled || isSending) return;
    setIsSending(true);
    const trimmedText = inputValue.trim();
    try {
      if (selectedMediaFile && onSendMedia) {
        const isAudioPayload = selectedMediaFile.type.startsWith("audio/");
        const detectedType: MediaSendType = selectedMediaFile.type === "image/gif"
          ? "GIF"
          : selectedMediaFile.type.startsWith("image/")
          ? "IMAGE"
          : "VIDEO";
        const sendType = detectedType || mediaType;
        const allowedSize = isAudioPayload ? uploadLimits.AUDIO : uploadLimits[sendType];
        if (selectedMediaFile.size > allowedSize) {
          setUploadError(`File is too large. Max ${formatFileSize(allowedSize)} allowed.`);
          return;
        }
        setUploadError(null);
        await onSendMedia({
          type: sendType,
          file: selectedMediaFile,
          content: trimmedText || undefined,
        });
        setSelectedMediaFile(null);
        setIsAudioPreviewPlaying(false);
        setInputValue("");
        setIsEmojiOpen(false);
        setIsMediaOpen(false);
        return;
      }
      if (trimmedText) {
        await onSendText(inputValue.trim());
        setInputValue("");
        setIsEmojiOpen(false);
        setIsMediaOpen(false);
        onTypingStop?.();
      }
    } finally {
      setIsSending(false);
    }
  };

  const mediaAccept = mediaType === "VIDEO" ? "video/*" : mediaType === "GIF" ? "image/gif" : "image/*";

  return (
    <div className="relative z-30">
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
                  if (!file) {
                    setSelectedMediaFile(null);
                    return;
                  }
                  const targetLimit = mediaType === "IMAGE" ? uploadLimits.IMAGE : mediaType === "GIF" ? uploadLimits.GIF : uploadLimits.VIDEO;
                  if (file.size > targetLimit) {
                    setUploadError(`Selected file is too large. Max ${formatFileSize(targetLimit)} allowed.`);
                    setSelectedMediaFile(null);
                    return;
                  }
                  setUploadError(null);
                  setSelectedMediaFile(file);
                  setRecordingError(null);
                  setIsMediaOpen(false);
                  setIsEmojiOpen(false);
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEmojiOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-full right-2 z-40 mb-2 w-[280px] rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-3 shadow-2xl"
          >
            <div className="grid grid-cols-5 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputValue(`${inputValue}${emoji}`);
                    setIsEmojiOpen(false);
                  }}
                  className="rounded-lg bg-zinc-900/80 py-2 text-xl transition-colors hover:bg-zinc-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
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
        {isRecording && (
          <div className="mx-3 mt-3 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-crimson" />
                <span className="text-xs font-semibold text-white">Recording voice note</span>
                <div className="flex items-end gap-1">
                  <span className="h-2 w-1 animate-pulse rounded bg-crimson/80" />
                  <span className="h-3 w-1 animate-pulse rounded bg-crimson/80 [animation-delay:120ms]" />
                  <span className="h-4 w-1 animate-pulse rounded bg-crimson/80 [animation-delay:240ms]" />
                </div>
              </div>
              <span className="text-xs font-mono text-crimson">{`${Math.floor(recordingSeconds / 60)
                .toString()
                .padStart(2, "0")}:${(recordingSeconds % 60).toString().padStart(2, "0")}`}</span>
            </div>
          </div>
        )}
        {selectedMediaFile && !isRecording && (
          <div className="mx-3 mt-3 rounded-xl border border-zinc-700 bg-zinc-900/70 p-2">
            {isAudioFile && mediaPreviewUrl ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleAudioPreview}
                    className="rounded-full bg-zinc-800 p-2 text-zinc-200 hover:bg-zinc-700"
                  >
                    {isAudioPreviewPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-100">{selectedMediaFile.name}</p>
                    <p className="text-[11px] text-zinc-400">Voice note ready</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (audioPreviewRef.current) {
                      audioPreviewRef.current.pause();
                    }
                    setIsAudioPreviewPlaying(false);
                    setSelectedMediaFile(null);
                  }}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X size={16} />
                </button>
                <audio
                  ref={audioPreviewRef}
                  src={mediaPreviewUrl}
                  onEnded={() => setIsAudioPreviewPlaying(false)}
                  className="hidden"
                />
              </div>
            ) : mediaPreviewUrl ? (
              <div className="relative flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
                  {selectedMediaFile.type.startsWith("video/") ? (
                    <video src={mediaPreviewUrl} className="h-full w-full object-cover" />
                  ) : (
                    <img src={mediaPreviewUrl} alt="Selected media" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-100">{selectedMediaFile.name}</p>
                  <p className="text-[11px] text-zinc-400">
                    {selectedMediaFile.type.startsWith("video/") ? "Video attached" : "Image attached"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMediaFile(null)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handlePrimarySend();
          }}
          className="flex items-center gap-3 p-3"
        >
          <button
            disabled={disabled}
            onClick={() => {
              setIsMediaOpen((prev) => !prev);
              setIsEmojiOpen(false);
            }}
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
                  void handlePrimarySend();
                }
              }}
              disabled={disabled}
              placeholder="Type a message..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setIsEmojiOpen((prev) => !prev);
                setIsMediaOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              <Smile size={20} />
            </button>
          </div>

          {inputValue.trim() || selectedMediaFile ? (
            <button
              type="submit"
              disabled={disabled || isSending}
              className="relative z-30 touch-manipulation p-3 bg-crimson rounded-full text-white shadow-[0_0_15px_rgba(232,25,44,0.4)] hover:scale-105 transition-transform disabled:opacity-60"
            >
              <Send size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleAudioRecording}
              disabled={disabled}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? "bg-crimson text-white scale-110 shadow-[0_0_20px_crimson]"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Mic size={20} />
            </button>
          )}
        </form>
        {uploadError ? (
          <div className="px-4 pb-2 text-[11px] text-crimson">{uploadError}</div>
        ) : recordingError ? (
          <div className="px-4 pb-2 text-[11px] text-zinc-500">{recordingError}</div>
        ) : null}
      </div>
    </div>
  );
}

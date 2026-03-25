"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatUiMessage, MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MiniProfileDrawer } from "@/components/chat/MiniProfileDrawer";
import { api, ApiError, ChatMessageRecord, ChatMessageReaction, ReplySuggestionItem } from "@/lib/api";
import { connectChatSocket } from "@/lib/chatSocket";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneOff, PhoneIncoming, PhoneCall, X } from "lucide-react";
import type { Socket } from "socket.io-client";

interface ChatPageClientProps {
  id: string;
}

interface StoredReplySuggestions {
  triggerMessageId: string;
  suggestions: ReplySuggestionItem[];
}

export function ChatPageClient({ id }: ChatPageClientProps) {
  const router = useRouter();
  const { matches, blockUser, reportUser, session, currentUser, refreshMatches } = useStore();
  const match = matches.find((m) => m.id === id);
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousMessageCountRef = useRef(0);
  const typingTimerRef = useRef<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(Boolean(match?.online));
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [callState, setCallState] = useState<"idle" | "calling" | "incoming" | "active">("idle");
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [incomingTargetUserId, setIncomingTargetUserId] = useState<string | null>(null);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatUiMessage | null>(null);
  const [replySuggestions, setReplySuggestions] = useState<ReplySuggestionItem[]>([]);
  const [suggestionsTriggerMessageId, setSuggestionsTriggerMessageId] = useState<string | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const ringtoneContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<number | null>(null);
  const suggestionsFetchRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef(false);
  const lastReadSentRef = useRef<string | null>(null);
  const myUserId = currentUser?.id || "";
  const suggestionsStorageKey = `reply-suggestions:${id}`;

  const persistReplySuggestions = useCallback(
    (triggerMessageId: string, suggestions: ReplySuggestionItem[]) => {
      if (typeof window === "undefined") return;
      const payload: StoredReplySuggestions = {
        triggerMessageId,
        suggestions: suggestions.slice(0, 3),
      };
      window.localStorage.setItem(suggestionsStorageKey, JSON.stringify(payload));
    },
    [suggestionsStorageKey]
  );

  const loadStoredReplySuggestions = useCallback((): StoredReplySuggestions | null => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(suggestionsStorageKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredReplySuggestions;
      if (!parsed.triggerMessageId || !Array.isArray(parsed.suggestions)) return null;
      return {
        triggerMessageId: parsed.triggerMessageId,
        suggestions: parsed.suggestions
          .filter((item) => Boolean(item && typeof item.reply === "string" && item.reply.trim()))
          .slice(0, 3),
      };
    } catch {
      return null;
    }
  }, [suggestionsStorageKey]);

  const fetchReplySuggestions = useCallback(
    async (triggerMessageId: string, force = false) => {
      const token = session?.accessToken;
      if (!token) return;
      if (!force && suggestionsFetchRef.current === triggerMessageId) return;
      suggestionsFetchRef.current = triggerMessageId;
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      try {
        const response = await api.matchReplySuggestions(token, id, {
          triggerMessageId,
          force,
        });
        const suggestionList = (response.data?.suggestions || [])
          .filter((item) => Boolean(item?.reply?.trim()))
          .slice(0, 3);
        if (!suggestionList.length) {
          setReplySuggestions([]);
          setSuggestionsTriggerMessageId(triggerMessageId);
          persistReplySuggestions(triggerMessageId, []);
          return;
        }
        setReplySuggestions(suggestionList);
        setSuggestionsTriggerMessageId(triggerMessageId);
        persistReplySuggestions(triggerMessageId, suggestionList);
      } catch (suggestionError) {
        const message = suggestionError instanceof Error ? suggestionError.message : "Failed to load suggestions";
        setSuggestionsError(message);
      } finally {
        setSuggestionsLoading(false);
        suggestionsFetchRef.current = null;
      }
    },
    [id, persistReplySuggestions, session?.accessToken]
  );

  const stopIncomingRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      window.clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneContextRef.current) {
      void ringtoneContextRef.current.close();
      ringtoneContextRef.current = null;
    }
  }, []);

  const startIncomingRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) return;
    if (typeof window === "undefined") return;
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const context = new AudioContextCtor();
    ringtoneContextRef.current = context;
    const playTone = (frequency: number, offset: number, duration: number, gainValue: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, context.currentTime + offset);
      gain.gain.linearRampToValueAtTime(gainValue, context.currentTime + offset + 0.02);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + offset + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + duration + 0.05);
    };
    const playChime = () => {
      if (context.state === "suspended") {
        void context.resume();
      }
      playTone(523.25, 0, 0.35, 0.09);
      playTone(659.25, 0.18, 0.35, 0.08);
      playTone(783.99, 0.36, 0.45, 0.08);
    };
    playChime();
    ringtoneIntervalRef.current = window.setInterval(playChime, 1700);
  }, []);

  const appendOrUpdateMessage = useCallback((next: ChatUiMessage) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === next.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...next };
        return copy;
      }
      return [...prev, next].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, []);

  const parseReactionEmojis = useCallback(
    (reactions?: ChatMessageReaction[]) => (reactions || []).map((item) => item?.emoji || "").filter(Boolean),
    []
  );

  const normalizeMessage = useCallback(
    (item: ChatMessageRecord): ChatUiMessage => {
      const senderId = item.sender_id || "other";
      const isMeSender = Boolean(myUserId && senderId === myUserId);
      const rawType = (item.type || "TEXT").toUpperCase();
      const mappedType: ChatUiMessage["type"] =
        rawType === "IMAGE" ? "image" : rawType === "GIF" ? "gif" : rawType === "VIDEO" ? "video" : "text";
      const statusRaw = (item.status || "sent").toLowerCase();
      const status: ChatUiMessage["status"] =
        statusRaw === "uploading" ? "uploading" : statusRaw === "read" ? "read" : statusRaw === "delivered" ? "delivered" : "sent";
      return {
        id: item.id || crypto.randomUUID(),
        senderId: isMeSender ? "me" : "other",
        text: item.content || "",
        timestamp: item.created_at ? new Date(item.created_at) : new Date(),
        status,
        type: mappedType,
        mediaUrl: item.media_url || undefined,
        replyToMessageId: item.reply_to_message_id || undefined,
        reactionEmojis: parseReactionEmojis(item.reactions),
      };
    },
    [myUserId, parseReactionEmojis]
  );

  const fetchMessages = useCallback(
    async (cursor?: string) => {
      const token = session?.accessToken;
      if (!token) return;
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      try {
        const response = await api.matchMessages(token, id, { limit: 30, cursor });
        const list = response.data?.messages || [];
        const normalized = list.map(normalizeMessage).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setNextCursor(response.data?.next_cursor || null);
        if (cursor) {
          setMessages((prev) => {
            const map = new Map<string, ChatUiMessage>();
            [...normalized, ...prev].forEach((message) => map.set(message.id, message));
            return [...map.values()].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
        } else {
          setMessages(normalized);
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load messages";
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id, normalizeMessage, session?.accessToken]
  );

  const refreshLatestMessages = useCallback(async () => {
    const token = session?.accessToken;
    if (!token || refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    try {
      const response = await api.matchMessages(token, id, { limit: 30 });
      const list = response.data?.messages || [];
      const normalized = list.map(normalizeMessage).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMessages((prev) => {
        const map = new Map<string, ChatUiMessage>();
        [...prev, ...normalized].forEach((message) => {
          const existing = map.get(message.id);
          map.set(message.id, existing ? { ...existing, ...message } : message);
        });
        const next = [...map.values()].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        if (
          next.length === prev.length &&
          next.every(
            (item, index) =>
              item.id === prev[index]?.id &&
              item.status === prev[index]?.status &&
              item.text === prev[index]?.text &&
              item.type === prev[index]?.type &&
              (item.mediaUrl || "") === (prev[index]?.mediaUrl || "") &&
              item.timestamp.getTime() === prev[index]?.timestamp.getTime() &&
              JSON.stringify(item.reactionEmojis || []) === JSON.stringify(prev[index]?.reactionEmojis || [])
          )
        ) {
          return prev;
        }
        return next;
      });
      if (response.data?.next_cursor) {
        setNextCursor(response.data.next_cursor);
      }
    } catch {
      return;
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [id, normalizeMessage, session?.accessToken]);

  const cleanupCall = useCallback(() => {
    stopIncomingRingtone();
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIncomingOffer(null);
    setIncomingTargetUserId(null);
    setIncomingCallId(null);
    setActiveCallId(null);
    setCallState("idle");
    setShowCallOverlay(false);
  }, [stopIncomingRingtone]);

  const requestMediaStream = useCallback(async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      throw new Error("Camera and microphone are not available in this environment.");
    }
    const constraints: MediaStreamConstraints = { video: true, audio: true };
    if (navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    type LegacyNavigator = Navigator & {
      getUserMedia?: (
        constraints: MediaStreamConstraints,
        successCallback: (stream: MediaStream) => void,
        errorCallback?: (error: unknown) => void
      ) => void;
      webkitGetUserMedia?: (
        constraints: MediaStreamConstraints,
        successCallback: (stream: MediaStream) => void,
        errorCallback?: (error: unknown) => void
      ) => void;
      mozGetUserMedia?: (
        constraints: MediaStreamConstraints,
        successCallback: (stream: MediaStream) => void,
        errorCallback?: (error: unknown) => void
      ) => void;
      msGetUserMedia?: (
        constraints: MediaStreamConstraints,
        successCallback: (stream: MediaStream) => void,
        errorCallback?: (error: unknown) => void
      ) => void;
    };
    const legacyNavigator = navigator as LegacyNavigator;
    const legacyGetUserMedia =
      legacyNavigator.getUserMedia ||
      legacyNavigator.webkitGetUserMedia ||
      legacyNavigator.mozGetUserMedia ||
      legacyNavigator.msGetUserMedia;
    if (legacyGetUserMedia) {
      return new Promise<MediaStream>((resolve, reject) => {
        legacyGetUserMedia.call(legacyNavigator, constraints, resolve, reject);
      });
    }
    const isSecure = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isSecure) {
      throw new Error("Camera/microphone require HTTPS on iPad Safari. Open this app on an https URL.");
    }
    throw new Error("This browser does not support camera/microphone access.");
  }, []);

  const ensurePeer = useCallback(
    async (targetUserId?: string | null) => {
      if (peerRef.current) return peerRef.current;
      const stream = await requestMediaStream();
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      };
      peer.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) return;
        socketRef.current.emit("webrtc_ice_candidate", {
          match_id: id,
          target_user_id: targetUserId || match?.otherUserId,
          candidate: event.candidate,
        });
      };
      peerRef.current = peer;
      return peer;
    },
    [id, match?.otherUserId, requestMediaStream]
  );

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isFirstLoad = previousMessageCountRef.current === 0;
    const hasNewMessage = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;
    if (!isFirstLoad && !hasNewMessage) return;
    const newestMessage = messages[messages.length - 1];
    const shouldScroll = isFirstLoad || shouldStickToBottomRef.current || newestMessage?.senderId === "me";
    if (!shouldScroll) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: isFirstLoad ? "auto" : "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (match?.online || isOnline) {
      const timeout = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, match]);

  useEffect(() => {
    setIsOnline(Boolean(match?.online));
  }, [match?.online]);

  useEffect(() => {
    if (!session?.accessToken) return;
    void fetchMessages();
    void api
      .matchUnreadCount(session.accessToken, id)
      .then((response) => {
        setUnreadCount(response.data?.unread_count || response.data?.count || 0);
      })
      .catch(() => null);
  }, [fetchMessages, id, session?.accessToken]);

  useEffect(() => {
    setComposerText("");
    setReplyingTo(null);
    setReplySuggestions([]);
    setSuggestionsTriggerMessageId(null);
    setSuggestionsError(null);
    suggestionsFetchRef.current = null;
    lastReadSentRef.current = null;
  }, [id]);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (!match) void refreshMatches();
  }, [match, refreshMatches, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || isSocketConnected) return;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      void refreshLatestMessages();
    }, 5000);
    return () => {
      window.clearInterval(interval);
    };
  }, [isSocketConnected, refreshLatestMessages, session?.accessToken]);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    const socket = connectChatSocket(token);
    socketRef.current = socket;
    setIsSocketConnected(socket.connected);

    const handleSocketConnect = () => {
      setIsSocketConnected(true);
      void refreshLatestMessages();
    };

    const handleSocketDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleNewMessage = (payload: Record<string, unknown>) => {
      const messagePayload = (
        payload.message && typeof payload.message === "object" ? payload.message : payload
      ) as ChatMessageRecord;
      const payloadMatchId =
        (typeof payload.match_id === "string" ? payload.match_id : "") ||
        (typeof messagePayload.match_id === "string" ? messagePayload.match_id : "");
      if (payloadMatchId && payloadMatchId !== id) return;
      const normalized = normalizeMessage(messagePayload);
      appendOrUpdateMessage(normalized);
      if (normalized.senderId === "other") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleReaction = (payload: Record<string, unknown>) => {
      const messageId =
        (typeof payload.message_id === "string" ? payload.message_id : "") ||
        (typeof payload.id === "string" ? payload.id : "");
      if (!messageId) return;
      const reaction =
        (typeof payload.emoji === "string" ? payload.emoji : "") ||
        (typeof payload.reaction === "string" ? payload.reaction : "");
      if (!reaction) return;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                reactionEmojis: Array.from(new Set([...(message.reactionEmojis || []), reaction])),
              }
            : message
        )
      );
    };

    const handleDeleted = (payload: Record<string, unknown>) => {
      const messageId =
        (typeof payload.message_id === "string" ? payload.message_id : "") ||
        (typeof payload.id === "string" ? payload.id : "");
      if (!messageId) return;
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
    };

    const handleDelivered = (payload: Record<string, unknown>) => {
      const messageId =
        (typeof payload.message_id === "string" ? payload.message_id : "") ||
        (typeof payload.id === "string" ? payload.id : "");
      if (!messageId) return;
      setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, status: "delivered" } : message)));
    };

    const handleRead = (payload: Record<string, unknown>) => {
      const messageId =
        (typeof payload.last_read_message_id === "string" ? payload.last_read_message_id : "") ||
        (typeof payload.message_id === "string" ? payload.message_id : "");
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((message) =>
          message.senderId === "me" ? { ...message, status: "read" } : message
        )
      );
      setUnreadCount(0);
    };

    const handleTyping = (payload: Record<string, unknown>) => {
      const payloadMatchId = typeof payload.match_id === "string" ? payload.match_id : "";
      if (payloadMatchId !== id) return;
      const senderId = typeof payload.user_id === "string" ? payload.user_id : "other";
      const isTypingPayload = typeof payload.is_typing === "boolean" ? payload.is_typing : true;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTypingPayload) next.add(senderId);
        else next.delete(senderId);
        return next;
      });
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => {
        setTypingUsers(new Set());
      }, 2000);
    };

    const handleIncomingCall = (payload: Record<string, unknown>) => {
      const payloadMatchId = typeof payload.match_id === "string" ? payload.match_id : "";
      if (payloadMatchId !== id) return;
      setIncomingCallId(typeof payload.call_id === "string" ? payload.call_id : null);
      setIncomingOffer((payload.offer as RTCSessionDescriptionInit | undefined) || null);
      setIncomingTargetUserId(typeof payload.target_user_id === "string" ? payload.target_user_id : match?.otherUserId || null);
      setCallState("incoming");
      setShowCallOverlay(false);
    };

    const handleCallAccepted = (payload: Record<string, unknown>) => {
      if (typeof payload.call_id === "string") setActiveCallId(payload.call_id);
      const answer = payload.answer as RTCSessionDescriptionInit | undefined;
      if (answer && peerRef.current) {
        void peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
      setCallState("active");
      setShowCallOverlay(true);
    };

    const handleCallRejected = () => {
      cleanupCall();
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    const handleOffer = async (payload: Record<string, unknown>) => {
      const payloadMatchId = typeof payload.match_id === "string" ? payload.match_id : "";
      if (payloadMatchId !== id) return;
      const sdp = typeof payload.sdp === "string" ? payload.sdp : "";
      if (!sdp) return;
      setIncomingOffer({ type: "offer", sdp });
      setIncomingTargetUserId(typeof payload.target_user_id === "string" ? payload.target_user_id : match?.otherUserId || null);
      if (callState === "active" || callState === "calling") {
        const peer = await ensurePeer(typeof payload.target_user_id === "string" ? payload.target_user_id : match?.otherUserId);
        await peer.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc_answer", {
          match_id: id,
          target_user_id: typeof payload.target_user_id === "string" ? payload.target_user_id : match?.otherUserId,
          sdp: answer.sdp,
        });
      } else {
        setCallState("incoming");
      }
    };

    const handleAnswer = async (payload: Record<string, unknown>) => {
      const payloadMatchId = typeof payload.match_id === "string" ? payload.match_id : "";
      if (payloadMatchId !== id || !peerRef.current) return;
      const sdp = typeof payload.sdp === "string" ? payload.sdp : "";
      if (!sdp) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
      setCallState("active");
    };

    const handleIce = async (payload: Record<string, unknown>) => {
      const payloadMatchId = typeof payload.match_id === "string" ? payload.match_id : "";
      if (payloadMatchId !== id || !peerRef.current) return;
      const candidate = payload.candidate as RTCIceCandidateInit | undefined;
      if (!candidate) return;
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleUserOnline = (payload: Record<string, unknown>) => {
      const userId = typeof payload.user_id === "string" ? payload.user_id : "";
      if (userId && userId === match?.otherUserId) setIsOnline(true);
    };

    const handleUserOffline = (payload: Record<string, unknown>) => {
      const userId = typeof payload.user_id === "string" ? payload.user_id : "";
      if (userId && userId === match?.otherUserId) setIsOnline(false);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);
    socket.on("connect_error", handleSocketDisconnect);
    socket.on("message_reaction", handleReaction);
    socket.on("message_deleted", handleDeleted);
    socket.on("message_read", handleRead);
    socket.on("message_delivered", handleDelivered);
    socket.on("typing", handleTyping);
    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleIce);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("connect_error", handleSocketDisconnect);
      socket.off("message_reaction", handleReaction);
      socket.off("message_deleted", handleDeleted);
      socket.off("message_read", handleRead);
      socket.off("message_delivered", handleDelivered);
      socket.off("typing", handleTyping);
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice_candidate", handleIce);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      setIsSocketConnected(false);
    };
  }, [
    appendOrUpdateMessage,
    callState,
    cleanupCall,
    ensurePeer,
    id,
    match?.otherUserId,
    normalizeMessage,
    refreshLatestMessages,
    session?.accessToken,
  ]);

  useEffect(() => {
    if (callState === "incoming") {
      startIncomingRingtone();
      return;
    }
    stopIncomingRingtone();
  }, [callState, startIncomingRingtone, stopIncomingRingtone]);

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

  useEffect(() => {
    if (!session?.accessToken || !messages.length) return;
    if (typeof document !== "undefined" && document.hidden) return;
    const lastIncoming = [...messages].reverse().find((message) => message.senderId === "other");
    if (!lastIncoming) return;
    if (lastReadSentRef.current === lastIncoming.id) return;
    lastReadSentRef.current = lastIncoming.id;
    void api.markMatchRead(session.accessToken, id, lastIncoming.id).catch(() => {
      if (lastReadSentRef.current === lastIncoming.id) {
        lastReadSentRef.current = null;
      }
      return null;
    });
    socketRef.current?.emit("message_read", {
      match_id: id,
      last_read_message_id: lastIncoming.id,
    });
    setUnreadCount(0);
  }, [id, messages, session?.accessToken]);

  useEffect(() => {
    const latestIncoming = [...messages].reverse().find((message) => message.senderId === "other");
    if (!latestIncoming) {
      setReplySuggestions([]);
      setSuggestionsTriggerMessageId(null);
      return;
    }
    if (latestIncoming.id === suggestionsTriggerMessageId) return;
    const stored = loadStoredReplySuggestions();
    if (stored && stored.triggerMessageId === latestIncoming.id) {
      setReplySuggestions(stored.suggestions.slice(0, 3));
      setSuggestionsTriggerMessageId(stored.triggerMessageId);
      setSuggestionsError(null);
      return;
    }
    void fetchReplySuggestions(latestIncoming.id);
  }, [fetchReplySuggestions, loadStoredReplySuggestions, messages, suggestionsTriggerMessageId]);

  const isSocketTyping = typingUsers.size > 0;

  const startCall = useCallback(async () => {
    if (!socketRef.current || !match) return;
    try {
      const peer = await ensurePeer(match.otherUserId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      setCallState("calling");
      setShowCallOverlay(true);
      socketRef.current.emit("call_invite", {
        match_id: id,
        offer,
        metadata: { mode: "video" },
        quality_profile: "high",
      });
      socketRef.current.emit("webrtc_offer", {
        match_id: id,
        target_user_id: match.otherUserId,
        sdp: offer.sdp,
      });
    } catch (callError) {
      const message = callError instanceof Error ? callError.message : "Unable to start call";
      setError(message);
      cleanupCall();
    }
  }, [cleanupCall, ensurePeer, id, match]);

  const acceptIncomingCall = useCallback(async () => {
    if (!socketRef.current) return;
    try {
      const peer = await ensurePeer(incomingTargetUserId || match?.otherUserId);
      if (incomingOffer) {
        await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      }
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketRef.current.emit("call_accept", {
        call_id: incomingCallId,
        answer,
      });
      socketRef.current.emit("webrtc_answer", {
        match_id: id,
        target_user_id: incomingTargetUserId || match?.otherUserId,
        sdp: answer.sdp,
      });
      setActiveCallId(incomingCallId);
      setCallState("active");
      setShowCallOverlay(true);
    } catch (callError) {
      const message = callError instanceof Error ? callError.message : "Unable to accept call";
      setError(message);
      cleanupCall();
    }
  }, [cleanupCall, ensurePeer, id, incomingCallId, incomingOffer, incomingTargetUserId, match?.otherUserId]);

  const rejectIncomingCall = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("call_reject", {
      call_id: incomingCallId,
      reason: "rejected",
    });
    cleanupCall();
  }, [cleanupCall, incomingCallId]);

  const endCall = useCallback(() => {
    if (socketRef.current && (activeCallId || incomingCallId)) {
      socketRef.current.emit("call_end", {
        call_id: activeCallId || incomingCallId,
      });
    }
    cleanupCall();
  }, [activeCallId, cleanupCall, incomingCallId]);

  const readMediaMetadata = useCallback(
    async (file: File, type: "IMAGE" | "GIF" | "VIDEO") => {
      if (type === "VIDEO") {
        const url = URL.createObjectURL(file);
        try {
          const dimensions = await new Promise<{ width: number; height: number } | null>((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = url;
            video.onloadedmetadata = () => {
              resolve({
                width: video.videoWidth || 0,
                height: video.videoHeight || 0,
              });
            };
            video.onerror = () => resolve(null);
          });
          return dimensions;
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const url = URL.createObjectURL(file);
      try {
        const dimensions = await new Promise<{ width: number; height: number } | null>((resolve) => {
          const image = new Image();
          image.src = url;
          image.onload = () => {
            resolve({
              width: image.naturalWidth || 0,
              height: image.naturalHeight || 0,
            });
          };
          image.onerror = () => resolve(null);
        });
        return dimensions;
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    []
  );

  const sendText = useCallback(
    (text: string) => {
      const token = session?.accessToken;
      const trimmedText = text.trim();
      if (!token || !trimmedText) return;
      const replyToMessageId = replyingTo?.id;
      const optimisticId = `temp-${crypto.randomUUID()}`;
      const optimisticMessage: ChatUiMessage = {
        id: optimisticId,
        senderId: "me",
        text: trimmedText,
        timestamp: new Date(),
        status: "sent",
        type: "text",
        replyToMessageId: replyToMessageId || undefined,
      };
      appendOrUpdateMessage(optimisticMessage);
      setError(null);
      setReplyingTo(null);
      void (async () => {
        try {
          const response = await api.sendMatchMessage(token, id, {
            type: "TEXT",
            content: trimmedText,
            reply_to_message_id: replyToMessageId,
          });
          const message = response.data?.message;
          if (message) {
            const normalized = normalizeMessage(message);
            setMessages((prev) => {
              const withoutOptimistic = prev.filter((item) => item.id !== optimisticId);
              const existingIndex = withoutOptimistic.findIndex((item) => item.id === normalized.id);
              if (existingIndex >= 0) {
                const copy = [...withoutOptimistic];
                copy[existingIndex] = { ...copy[existingIndex], ...normalized };
                return copy.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
              }
              return [...withoutOptimistic, normalized].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            });
            return;
          }
          setMessages((prev) => prev.filter((item) => item.id !== optimisticId));
          await fetchMessages();
        } catch (sendError) {
          setMessages((prev) => prev.filter((item) => item.id !== optimisticId));
          const message = sendError instanceof Error ? sendError.message : "Failed to send message";
          setError(message);
        }
      })();
    },
    [appendOrUpdateMessage, fetchMessages, id, normalizeMessage, replyingTo?.id, session?.accessToken]
  );

  const sendMedia = useCallback(
    (payload: { type: "IMAGE" | "GIF" | "VIDEO"; file: File; content?: string }) => {
      const token = session?.accessToken;
      if (!token) return;
      if (!myUserId) {
        setError("Unable to upload media. Please login again.");
        return;
      }
      const replyToMessageId = replyingTo?.id;
      const optimisticId = `temp-${crypto.randomUUID()}`;
      const previewUrl = URL.createObjectURL(payload.file);
      const optimisticType: ChatUiMessage["type"] =
        payload.type === "IMAGE" ? "image" : payload.type === "GIF" ? "gif" : "video";
      const optimisticMessage: ChatUiMessage = {
        id: optimisticId,
        senderId: "me",
        text: payload.content?.trim() || "",
        timestamp: new Date(),
        status: "uploading",
        type: optimisticType,
        mediaUrl: previewUrl,
        replyToMessageId: replyToMessageId || undefined,
      };
      appendOrUpdateMessage(optimisticMessage);
      setError(null);
      setReplyingTo(null);
      void (async () => {
        try {
          const uploadedUrl = await api.uploadChatMedia(payload.file, myUserId);
          const dimensions = await readMediaMetadata(payload.file, payload.type);
          const response = await api.sendMatchMessage(token, id, {
            type: payload.type,
            media_url: uploadedUrl,
            content: payload.content?.trim() || undefined,
            metadata: dimensions || undefined,
            reply_to_message_id: replyToMessageId,
          });
          const message = response.data?.message;
          if (message) {
            const normalized = normalizeMessage(message);
            setMessages((prev) => {
              const withoutOptimistic = prev.filter((item) => item.id !== optimisticId);
              const existingIndex = withoutOptimistic.findIndex((item) => item.id === normalized.id);
              if (existingIndex >= 0) {
                const copy = [...withoutOptimistic];
                copy[existingIndex] = { ...copy[existingIndex], ...normalized };
                return copy.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
              }
              return [...withoutOptimistic, normalized].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            });
            return;
          }
          setMessages((prev) => prev.filter((item) => item.id !== optimisticId));
          await fetchMessages();
        } catch (sendError) {
          setMessages((prev) => prev.filter((item) => item.id !== optimisticId));
          const message = sendError instanceof Error ? sendError.message : "Failed to send media";
          setError(message);
        } finally {
          URL.revokeObjectURL(previewUrl);
        }
      })();
    },
    [appendOrUpdateMessage, fetchMessages, id, myUserId, normalizeMessage, readMediaMetadata, replyingTo?.id, session?.accessToken]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const token = session?.accessToken;
      if (!token) return;
      try {
        const response = await api.toggleMessageReaction(token, messageId, emoji);
        const reactions = parseReactionEmojis(response.data?.reactions);
        if (reactions.length) {
          setMessages((prev) => prev.map((item) => (item.id === messageId ? { ...item, reactionEmojis: reactions } : item)));
          return;
        }
        setMessages((prev) =>
          prev.map((item) =>
            item.id === messageId
              ? { ...item, reactionEmojis: Array.from(new Set([...(item.reactionEmojis || []), emoji])) }
              : item
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === messageId
              ? { ...item, reactionEmojis: Array.from(new Set([...(item.reactionEmojis || []), emoji])) }
              : item
          )
        );
      }
    },
    [parseReactionEmojis, session?.accessToken]
  );

  const deleteMessage = useCallback(
    async (messageId: string, scope: "me" | "everyone") => {
      const token = session?.accessToken;
      if (!token) return;
      try {
        await api.deleteMessage(token, messageId, scope);
        setMessages((prev) => prev.filter((message) => message.id !== messageId));
      } catch (deleteError) {
        const message =
          deleteError instanceof ApiError ? deleteError.message : "Failed to delete message";
        setError(message);
      }
    },
    [session?.accessToken]
  );

  const typingStart = useCallback(() => {
    socketRef.current?.emit("typing_start", { match_id: id });
  }, [id]);

  const typingStop = useCallback(() => {
    socketRef.current?.emit("typing_stop", { match_id: id });
  }, [id]);

  if (!match) {
    return <div className="text-white p-10">Match not found</div>;
  }

  const noiseBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
  };

  return (
    <div className="h-[100dvh] bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50" style={noiseBg} />
      <ChatHeader
        match={match}
        onProfileClick={() => setShowMiniProfile(true)}
        onStartCall={() => void startCall()}
        callActive={callState !== "idle"}
        subtitle={
          callState === "active"
            ? "In call"
            : callState === "calling"
            ? "Calling..."
            : isOnline
            ? "Online"
            : unreadCount > 0
            ? `${unreadCount} unread`
            : "Offline"
        }
      />
      <div
        ref={messagesContainerRef}
        onScroll={(event) => {
          const target = event.currentTarget;
          const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
          shouldStickToBottomRef.current = distanceToBottom < 120;
        }}
        className="z-10 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 pt-4 pb-4"
      >
        <div className="flex items-center justify-center gap-3">
          {nextCursor && (
            <button
              onClick={() => void fetchMessages(nextCursor)}
              disabled={loadingMore}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-mono text-zinc-300 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load older"}
            </button>
          )}
          {loading && <span className="text-xs font-mono text-zinc-500">Loading messages...</span>}
        </div>

        {!loading &&
          messages.map((msg) => {
            const messageIsMine = msg.senderId === "me";
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={messageIsMine}
                showTimestamp={false}
                onImageClick={(url) => setLightboxImage(url)}
                onReact={(emoji) => void toggleReaction(msg.id, emoji)}
                onDeleteMe={() => void deleteMessage(msg.id, "me")}
                onDeleteEveryone={() => void deleteMessage(msg.id, "everyone")}
                canDeleteEveryone={messageIsMine}
                onReply={msg.type === "notification" ? undefined : () => setReplyingTo(msg)}
              />
            );
          })}

        {(isTyping || isSocketTyping) && (
          <div className="flex items-start gap-2 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 mt-1">
              <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
            </div>
            <TypingIndicator />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-xs text-crimson">
            {error}
          </div>
        )}
      </div>

      <div className="z-20 border-t border-zinc-900 bg-[#080808]/95 px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-mono uppercase tracking-wide text-zinc-500">Quick replies</p>
          {suggestionsLoading && <span className="text-[11px] text-zinc-500">Generating...</span>}
        </div>
        {suggestionsError && <p className="mb-2 text-[11px] text-crimson">{suggestionsError}</p>}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {replySuggestions.slice(0, 3).map((suggestion, index) => (
            <button
              key={`${suggestionsTriggerMessageId || "suggestion"}-${index}`}
              onClick={() => setComposerText(suggestion.reply)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-left transition-colors hover:border-fuchsia-500/40 hover:bg-zinc-800"
            >
              <p className="mb-1 text-[10px] font-mono uppercase tracking-wide text-fuchsia-300/80">
                {suggestion.tone || "suggestion"}
              </p>
              <p className="text-xs text-zinc-200">{suggestion.reply}</p>
            </button>
          ))}
        </div>
      </div>

      <ChatInput
        disabled={!session?.accessToken}
        value={composerText}
        onValueChange={setComposerText}
        onSendText={sendText}
        onSendMedia={sendMedia}
        onTypingStart={typingStart}
        onTypingStop={typingStop}
        replyToMessage={
          replyingTo && replyingTo.type !== "notification"
            ? {
                id: replyingTo.id,
                text: replyingTo.text,
                type: replyingTo.type,
              }
            : undefined
        }
        onCancelReply={() => setReplyingTo(null)}
      />

      <AnimatePresence>
        {callState === "incoming" && !showCallOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed right-4 top-4 z-[80] w-[320px] rounded-2xl border border-fuchsia-400/40 bg-zinc-950/95 p-4 shadow-[0_20px_80px_rgba(217,70,239,0.35)] backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-full border border-zinc-700">
                <img src={match.avatar} alt={match.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{match.name} is calling you</p>
                <p className="text-xs text-fuchsia-200/80">Tap open for full screen or reject now</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCallOverlay(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
              >
                <PhoneCall size={16} />
                Open
              </button>
              <button
                onClick={rejectIncomingCall}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-crimson px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                <PhoneOff size={16} />
                Reject
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMiniProfile && (
          <MiniProfileDrawer
            match={match}
            onClose={() => setShowMiniProfile(false)}
            onUnmatch={() => {
              void blockUser(match.otherUserId || match.id);
              setShowMiniProfile(false);
              router.push("/matches");
            }}
            onReport={() => {
              void reportUser(match.otherUserId || match.id, "abuse", "Reported from mini profile drawer");
              setShowMiniProfile(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {callState !== "idle" && showCallOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 p-4"
          >
            <div className="mx-auto flex h-full max-w-5xl flex-col gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm text-white">
                  {callState === "incoming" ? `Incoming call from ${match.name}` : callState === "calling" ? `Calling ${match.name}...` : `In call with ${match.name}`}
                </p>
                <button onClick={endCall} className="rounded-full bg-crimson p-2 text-white">
                  <PhoneOff size={18} />
                </button>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                </div>
              </div>
              {callState === "incoming" && (
                <div className="flex justify-center gap-4">
                  <button onClick={() => void acceptIncomingCall()} className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white">
                    <PhoneIncoming size={18} />
                    Accept
                  </button>
                  <button onClick={rejectIncomingCall} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white">
                    <PhoneOff size={18} />
                    Reject
                  </button>
                </div>
              )}
              {callState === "calling" && (
                <div className="flex justify-center">
                  <button onClick={endCall} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white">
                    <PhoneOff size={18} />
                    Cancel
                  </button>
                </div>
              )}
              {callState === "active" && (
                <div className="flex justify-center">
                  <button onClick={endCall} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white">
                    <PhoneCall size={18} />
                    End call
                  </button>
                </div>
              )}
            </div>
          </motion.div>
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

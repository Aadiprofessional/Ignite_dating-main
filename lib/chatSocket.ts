"use client";

import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const CHAT_SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;
const CHAT_SOCKET_PATH = process.env.NEXT_PUBLIC_CHAT_SOCKET_PATH || "/api/chat";
const CHAT_SOCKET_TRANSPORTS = process.env.NEXT_PUBLIC_CHAT_SOCKET_TRANSPORTS;

const resolveSocketBase = () => {
  if (CHAT_SOCKET_URL) {
    return CHAT_SOCKET_URL;
  }
  if (API_BASE) {
    try {
      const url = new URL(API_BASE);
      return `${url.protocol}//${url.host}`;
    } catch {
      return API_BASE;
    }
  }
  return "https://server.hkmeetup.space";
};

const resolveSocketPath = () => {
  if (!CHAT_SOCKET_PATH) return "/api/chat";
  return CHAT_SOCKET_PATH.startsWith("/") ? CHAT_SOCKET_PATH : `/${CHAT_SOCKET_PATH}`;
};

const resolveSecureOption = (socketBase: string) => {
  try {
    return new URL(socketBase).protocol === "https:";
  } catch {
    return typeof window !== "undefined" ? window.location.protocol === "https:" : true;
  }
};

const resolveTransports = () => {
  if (CHAT_SOCKET_TRANSPORTS) {
    const parsed = CHAT_SOCKET_TRANSPORTS.split(",")
      .map((item) => item.trim())
      .filter((item): item is "websocket" | "polling" => item === "websocket" || item === "polling");
    if (parsed.length) return parsed;
  }
  return ["websocket", "polling"];
};

export type ChatSocket = Socket;

let socketRef: ChatSocket | null = null;

export const connectChatSocket = (token: string) => {
  if (socketRef) {
    const currentAuthToken =
      socketRef.auth && typeof socketRef.auth === "object"
        ? (socketRef.auth as { token?: string }).token
        : undefined;
    if (currentAuthToken === token) {
      return socketRef;
    }
    socketRef.disconnect();
    socketRef = null;
  }
  const socketBase = resolveSocketBase();
  socketRef = io(socketBase, {
    path: resolveSocketPath(),
    auth: { token },
    transports: resolveTransports(),
    secure: resolveSecureOption(socketBase),
    upgrade: true,
    rememberUpgrade: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 15000,
  });
  return socketRef;
};

export const getChatSocket = () => socketRef;

export const disconnectChatSocket = () => {
  if (socketRef) {
    socketRef.disconnect();
    socketRef = null;
  }
};

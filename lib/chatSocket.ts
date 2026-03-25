"use client";

import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:49191";
const CHAT_SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;
const CHAT_SOCKET_PATH = process.env.NEXT_PUBLIC_CHAT_SOCKET_PATH || "/chat";
const CHAT_SOCKET_TRANSPORTS = process.env.NEXT_PUBLIC_CHAT_SOCKET_TRANSPORTS;

const resolveSocketBase = () => {
  if (CHAT_SOCKET_URL) {
    return CHAT_SOCKET_URL;
  }
  try {
    const url = new URL(API_BASE);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:49191";
  }
};

const resolveTransports = () => {
  if (CHAT_SOCKET_TRANSPORTS) {
    const parsed = CHAT_SOCKET_TRANSPORTS.split(",")
      .map((item) => item.trim())
      .filter((item): item is "websocket" | "polling" => item === "websocket" || item === "polling");
    if (parsed.length) return parsed;
  }
  return ["websocket"];
};

export type ChatSocket = Socket;

let socketRef: ChatSocket | null = null;

export const connectChatSocket = (token: string) => {
  if (socketRef?.connected) {
    const currentAuthToken =
      socketRef.auth && typeof socketRef.auth === "object"
        ? (socketRef.auth as { token?: string }).token
        : undefined;
    if (currentAuthToken === token) return socketRef;
  }
  if (socketRef) {
    socketRef.disconnect();
    socketRef = null;
  }
  socketRef = io(resolveSocketBase(), {
    path: CHAT_SOCKET_PATH,
    auth: { token },
    transports: resolveTransports(),
    reconnection: true,
    reconnectionAttempts: 10,
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

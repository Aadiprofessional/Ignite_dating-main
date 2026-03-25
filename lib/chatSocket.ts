"use client";

import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:49191";

const resolveSocketBase = () => {
  try {
    const url = new URL(API_BASE);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:49191";
  }
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
    path: "/chat",
    auth: { token },
    transports: ["websocket", "polling"],
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

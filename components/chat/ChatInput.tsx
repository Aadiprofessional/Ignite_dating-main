"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Gift, Image as ImageIcon, MapPin, Mic, Music, Plus, Send, Smile } from "lucide-react";
import { useState } from "react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Send:", message);
      setMessage("");
    }
  };

  const mediaOptions = [
    { icon: Camera, label: "Camera", color: "bg-blue-500" },
    { icon: ImageIcon, label: "Gallery", color: "bg-purple-500" },
    { icon: Music, label: "Audio", color: "bg-green-500" },
    { icon: MapPin, label: "Location", color: "bg-red-500" },
    { icon: Gift, label: "Gift", color: "bg-yellow-500" },
  ];

  return (
    <>
      <AnimatePresence>
        {isMediaOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMediaOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-[80px] left-0 right-0 z-50 bg-[#0A0A0A] border-t border-zinc-800 rounded-t-2xl p-6"
            >
              <div className="grid grid-cols-5 gap-4">
                {mediaOptions.map((option) => (
                  <button
                    key={option.label}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${option.color}`}>
                      <option.icon size={24} />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-md border-t border-zinc-900 pb-safe">
        <div className="flex items-center gap-3 p-3">
          <button
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors">
              <Smile size={20} />
            </button>
          </div>

          {message.trim() ? (
            <button
              onClick={handleSend}
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
    </>
  );
}

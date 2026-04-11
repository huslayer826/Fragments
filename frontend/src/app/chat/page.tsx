"use client";

import ChatInterface from "../components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Security Analyst Chat</h2>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}

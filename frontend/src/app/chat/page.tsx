"use client";

import ChatInterface from "../components/ChatInterface";
import PageHeader from "../components/PageHeader";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="AI analyst"
        subtitle="Ask questions about this network. Answers are grounded in the latest scan through a RAG pipeline."
      />
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}

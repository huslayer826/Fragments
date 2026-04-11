"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const result = await api.queryChat(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response, sources: result.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg mb-2">Fragments AI</p>
            <p className="text-sm">Ask questions about your network security posture.</p>
            <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>&ldquo;What&rsquo;s the biggest risk on my network?&rdquo;</p>
              <p>&ldquo;Which devices have critical vulnerabilities?&rdquo;</p>
              <p>&ldquo;Show me all IoT devices&rdquo;</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-lg px-4 py-3"
              style={{
                background: msg.role === "user" ? "var(--accent-orange)" : "var(--bg-surface)",
                color: msg.role === "user" ? "#000" : "var(--text-primary)",
              }}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
            >
              Analyzing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="border-t pt-4 flex gap-2"
        style={{ borderColor: "var(--border-color)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your network..."
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg border text-sm"
          style={{
            background: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--accent-orange)", color: "#000" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

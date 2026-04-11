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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `◆ Failed to get a response: ${msg}` },
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
          <div className="text-center py-12" style={{ color: "var(--text-ghost)" }}>
            <p
              className="mb-2"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "24px",
                color: "var(--text-primary)",
              }}
            >
              Fragments AI
            </p>
            <p className="text-sm">Ask questions about your network security posture.</p>
            <div
              className="mt-6 inline-flex flex-col gap-2 items-start text-left"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              <p>&gt; What&rsquo;s the biggest risk on my network?</p>
              <p>&gt; Which devices have critical vulnerabilities?</p>
              <p>&gt; Show me all IoT devices</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-xl px-4 py-3"
              style={{
                background: msg.role === "user" ? "var(--orange)" : "var(--bg-card)",
                color: msg.role === "user" ? "var(--white)" : "var(--text-primary)",
                border: msg.role === "user"
                  ? "none"
                  : "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
              }}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div
                  className="mt-3 pt-2 border-t"
                  style={{
                    borderColor: msg.role === "user"
                      ? "color-mix(in srgb, var(--white) 30%, transparent)"
                      : "color-mix(in srgb, var(--bg-border) 40%, transparent)",
                  }}
                >
                  <p
                    className="mb-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: msg.role === "user" ? "var(--white)" : "var(--text-ghost)",
                      opacity: msg.role === "user" ? 0.7 : 1,
                    }}
                  >
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded-md"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          background: "var(--black)",
                          color: "var(--text-secondary)",
                          border: "1px solid color-mix(in srgb, var(--bg-border) 40%, transparent)",
                        }}
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
              className="rounded-xl px-4 py-3"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-ghost)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
              }}
            >
              analyzing…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="pt-4 flex gap-2"
        style={{
          borderTop: "1px solid color-mix(in srgb, var(--bg-border) 40%, transparent)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your network…"
          disabled={loading}
          className="frag-input flex-1"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="frag-btn-primary"
        >
          Send
        </button>
      </div>
    </div>
  );
}

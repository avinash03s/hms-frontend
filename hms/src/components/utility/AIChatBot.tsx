import { useEffect, useRef, useState } from "react";
import { askAI } from "../../service/AIService";
import { IconRobot, IconSend, IconTrash, IconX } from "@tabler/icons-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  ts: Date;
}

let msgId = 0;
const makeMsg = (role: Message["role"], text: string): Message => ({
  id: ++msgId,
  role,
  text,
  ts: new Date(),
});

const fmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const renderText = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1
        ? <strong key={j} style={{ fontWeight: 600 }}>{p}</strong>
        : p
    );
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
      const content = line.replace(/^[\s\-•]+/, "");
      return (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 4 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6B7280", marginTop: 7, flexShrink: 0 }} />
          <span>{content}</span>
        </div>
      );
    }
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "2px 0", alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#9CA3AF", display: "inline-block",
        animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

const SUGGESTIONS = [
  "What is Paracetamol used for?",
  "Side effects of Metformin?",
  "Is Ibuprofen safe with BP meds?",
  "How to store insulin?",
];

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setMessages([
        makeMsg("assistant",
          "Hi! 👋 I'm your medical AI assistant.\n\nAsk me about medicines, dosages, side effects, or drug interactions.\n\n⚠️ Always consult your doctor before any medical decision."
        ),
      ]);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setMessages([]);
      setInput("");
    }
  }, [open]);

  const handleAsk = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, makeMsg("user", q)]);
    setLoading(true);
    try {
      const res = await askAI(q);
      setMessages((prev) => [...prev, makeMsg("assistant", res)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        makeMsg("assistant", "⚠️ Couldn't reach the AI service. Please try again."),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() =>
      setMessages([makeMsg("assistant", "Chat cleared! How can I help you? 🩺")]), 40
    );
  };

  const canSend = !loading && input.trim().length > 0;

  return (
    <>
      {!open && (
        <span style={{
          position: "fixed",
          bottom: 20, right: 20,
          width: 56, height: 56,
          borderRadius: "50%",
          background: "rgba(36, 174, 158, 0.35)",
          zIndex: 9998,
          animation: "pulse-ring 2s ease-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {!open && (
        <div style={{
          position: "fixed",
          bottom: 32, right: 80,
          background: "#1F2937",
          color: "#F9FAFB",
          fontSize: 11.5,
          fontWeight: 600,
          padding: "5px 10px",
          borderRadius: 8,
          zIndex: 9999,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          pointerEvents: "none",
          animation: "label-in 0.3s ease-out",
        }}>
          🩺 AI Assistant
          <div style={{
            position: "absolute",
            right: -6, top: "50%",
            transform: "translateY(-50%)",
            width: 0, height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "6px solid #1F2937",
          }} />
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        title="Medical AI Assistant"
        style={{
          position: "fixed",
          bottom: 24, right: 24,
          width: 48, height: 48,
          borderRadius: "50%",
          background: "#1F2937",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          border: "none",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          zIndex: 9999,
          transition: "background 0.2s, transform 0.2s",
          animation: open ? "none" : "bot-pulse 2s ease-in-out infinite",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
          (e.currentTarget as HTMLButtonElement).style.background = "#111827";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.background = "#1F2937";
        }}
      >
        {open ? <IconX size={17} stroke={2.5} /> : <IconRobot size={20} stroke={1.8} />}
      </button>

      {open && (
        <div style={{
          position: "fixed",
          /* Sits just above the FAB, anchored to bottom-right */
          bottom: 82,
          right: 16,
          /* Shrinks to fit any screen — never wider than viewport, never taller than 75vh */
          width: "min(340px, calc(100vw - 32px))",
          maxHeight: "min(75vh, 560px)",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          zIndex: 9999,
          overflow: "hidden",
          animation: "chat-in 0.18s ease-out",
          fontFamily: "'Inter', system-ui, sans-serif",
          boxSizing: "border-box",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 14px",
            background: "#1F2937",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#374151",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconRobot size={17} color="#E5E7EB" stroke={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F9FAFB", lineHeight: 1.3 }}>
                  Medical AI Assistant
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                  <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>Online</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={clearChat} title="Clear chat" style={{ width: 28, height: 28, borderRadius: 6, background: "#374151", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4B5563"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#374151"; }}>
                <IconTrash size={13} stroke={2} />
              </button>
              <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 6, background: "#374151", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4B5563"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#374151"; }}>
                <IconX size={13} stroke={2.5} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "14px 12px",
            display: "flex", flexDirection: "column",
            gap: 10,
            background: "#F9FAFB",
            minHeight: 0, /* critical — lets flex child shrink and scroll */
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 7, animation: "msg-in 0.16s ease-out" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "user" ? "#374151" : "#E5E7EB" }}>
                  {msg.role === "user"
                    ? <span style={{ fontSize: 10, fontWeight: 700, color: "#F9FAFB" }}>P</span>
                    : <IconRobot size={13} color="#6B7280" stroke={1.8} />
                  }
                </div>
                <div style={{
                  maxWidth: "75%",
                  padding: "9px 12px",
                  borderRadius: msg.role === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                  background: msg.role === "user" ? "#1F2937" : "#fff",
                  color: msg.role === "user" ? "#F3F4F6" : "#374151",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  border: msg.role === "assistant" ? "1px solid #E5E7EB" : "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}>
                  <div>{renderText(msg.text)}</div>
                  <div style={{ fontSize: 10, marginTop: 4, color: msg.role === "user" ? "#6B7280" : "#9CA3AF", textAlign: msg.role === "user" ? "right" : "left" }}>
                    {fmt(msg.ts)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7, animation: "msg-in 0.16s ease-out" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconRobot size={13} color="#6B7280" stroke={1.8} />
                </div>
                <div style={{ padding: "10px 13px", borderRadius: "3px 12px 12px 12px", background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — horizontal scroll, no wrap */}
          {messages.length <= 1 && !loading && (
            <div style={{
              padding: "0 12px 10px",
              display: "flex",
              gap: 5,
              overflowX: "auto",
              flexWrap: "nowrap",
              background: "#F9FAFB",
              flexShrink: 0,
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleAsk(s)} style={{
                  padding: "4px 9px", fontSize: 11, fontWeight: 500,
                  borderRadius: 6, border: "1px solid #E5E7EB",
                  background: "#fff", color: "#374151", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ padding: "6px 12px", background: "#FFF8E1", borderTop: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>⚠️</span>
            <span style={{ fontSize: 10, color: "#92400E" }}>For information only. Always consult your doctor.</span>
          </div>

          {/* Input bar */}
          <div style={{ padding: "10px 12px", background: "#fff", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder="Ask about a medicine…"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 12px",
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                fontSize: 16, /* 16px = no auto-zoom on iOS */
                outline: "none",
                color: "#111827",
                background: loading ? "#F9FAFB" : "#fff",
                fontFamily: "inherit",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "#9CA3AF"; }}
              onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB"; }}
            />
            <button onClick={() => handleAsk()} disabled={!canSend}
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: canSend ? "#1F2937" : "#F3F4F6",
                border: "none", cursor: canSend ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
              onMouseLeave={(e) => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "#1F2937"; }}>
              <IconSend size={14} color={canSend ? "#fff" : "#9CA3AF"} stroke={2} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bot-pulse {
          0%   { transform: scale(1);    box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
          50%  { transform: scale(1.15); box-shadow: 0 6px 20px rgba(36,174,158,0.5); }
          100% { transform: scale(1);    box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        @keyframes label-in {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.65); opacity: 0.35; }
          40%            { transform: scale(1);    opacity: 1;    }
        }
        @keyframes chat-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </>
  );
};

export default AIChatBot;
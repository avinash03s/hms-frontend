import { useEffect, useRef, useState } from "react";
import { askAI, askPatientAI } from "../../service/AIService";
import {
  IconAlertTriangle,
  IconChevronRight,
  IconHeartbeat,
  IconPill,
  IconSend,
  IconShieldCheck,
  IconSnowflake,
  IconStethoscope,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

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
      j % 2 === 1 ? <strong key={j} className="pai-strong">{p}</strong> : p
    );
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
      const content = line.replace(/^[\s\-•]+/, "");
      return (
        <div key={i} className="pai-bullet">
          <span className="pai-dot" />
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

const SUGGESTIONS = [
  { text: "What is Paracetamol used for?", icon: IconPill, tone: "blue" },
  { text: "Side effects of Metformin?", icon: IconAlertTriangle, tone: "amber" },
  { text: "Is Ibuprofen safe with BP meds?", icon: IconHeartbeat, tone: "red" },
  { text: "How to store insulin?", icon: IconSnowflake, tone: "teal" },
];

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // welcome screen stays at the top; only auto-scroll once a chat is going
    if (messages.length <= 1 && !loading) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setMessages([
        makeMsg("assistant",
          "Hi! 👋 I'm your Medical AI Assistant.\n\nAsk me about medicines, dosages, side effects, or drug interactions.\n\n⚠️ Always consult your Doctor before any medical decision."
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

      const isLoggedIn = !!localStorage.getItem("token");

      const res = isLoggedIn
        ? await askPatientAI(q)
        : await askAI(q);

      setMessages((prev) => [
        ...prev,
        makeMsg("assistant", res)
      ]);
      // const res = await askAI(q);
      // setMessages((prev) => [...prev, makeMsg("assistant", res)]);
    }catch (err: any) {
      // show the backend's own message when the AI is busy (HTTP 503)
      const busyMsg =
        err?.response?.status === 503 && typeof err?.response?.data === "string"
          ? err.response.data
          : null;
      setMessages((prev) => [
        ...prev,
        makeMsg(
          "assistant",
          busyMsg
            ? `⚠️ ${busyMsg}`
            : "⚠️ Couldn't reach the AI service. Please try again."
        ),
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
        <div className="pai-tag">
          <span className="pai-tag-dot" />
          Pulse AI
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        title="Pulse AI"
        aria-label={open ? "Close Pulse AI" : "Open Pulse AI"}
        className={`pai-fab ${open ? "is-open" : ""}`}
      >
        {open ? <IconX size={22} stroke={2.2} /> : <IconStethoscope size={26} stroke={1.8} />}
      </button>

      {open && (
        <div className="pai-panel" role="dialog" aria-label="Pulse AI chat">
          <div className="pai-header">
            <div className="pai-header-row">
              <div className="pai-header-left">
                <div className="pai-badge"><IconStethoscope size={22} stroke={1.8} /></div>
                <div>
                  <div className="pai-title">Pulse AI</div>
                  <div className="pai-status">
                    <span className="pai-status-dot" />
                    {loading ? "Checking your question…" : "Online · Medicine Assistant"}
                  </div>
                </div>
              </div>
              <div className="pai-actions">
                <button onClick={clearChat} title="Clear chat" aria-label="Clear chat" className="pai-icon-btn">
                  <IconTrash size={16} stroke={1.9} />
                </button>
                <button onClick={() => setOpen(false)} title="Close" aria-label="Close" className="pai-icon-btn">
                  <IconX size={17} stroke={2.2} />
                </button>
              </div>
            </div>
            <div className={`pai-trace ${loading ? "live" : ""}`} aria-hidden="true" />
          </div>

          <div className="pai-notice">
            <IconShieldCheck size={15} stroke={2} />
            <span>For information only. Always consult your Doctor.</span>
          </div>

          <div className="pai-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`pai-row ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="pai-avatar"><IconStethoscope size={15} stroke={1.9} /></div>
                )}
                <div className={`pai-bubble ${msg.role}`}>
                  <div>{renderText(msg.text)}</div>
                  <div className="pai-time">{fmt(msg.ts)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="pai-row assistant">
                <div className="pai-avatar"><IconStethoscope size={15} stroke={1.9} /></div>
                <div className="pai-bubble assistant pai-typing">
                  <div className="pai-ecg" aria-label="Pulse is typing" />
                </div>
              </div>
            )}
            {messages.length <= 1 && !loading && (
              <div className="pai-sugg">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.text} onClick={() => handleAsk(s.text)} className="pai-item">
                      <span className={`pai-item-icon ${s.tone}`}><Icon size={15} stroke={1.9} /></span>
                      <span className="pai-item-text">{s.text}</span>
                      <IconChevronRight size={15} stroke={2} className="pai-item-chev" />
                    </button>
                  );
                })}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="pai-input-wrap">
            <div className={`pai-input-box ${loading ? "is-disabled" : ""}`}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Ask about a medicine…"
                className="pai-input"
              />
              <button
                onClick={() => handleAsk()}
                disabled={!canSend}
                aria-label="Send"
                className={`pai-send ${canSend ? "active" : ""}`}
              >
                <IconSend size={17} stroke={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap');

        .pai-fab, .pai-panel, .pai-tag {
          --blue: #0B5FA5;
          --blue-dark: #084C85;
          --blue-soft: #E8F2FB;
          --teal: #00958C;
          --ink: #12304A;
          --ink-2: #4A6A83;
          --mute: #7D95A8;
          --line: #D8E5F0;
          --bg: #F3F8FC;
          --green: #2EAD6B;
          font-family: 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
        }

        .pai-trace, .pai-ecg {
          background-repeat: repeat-x; background-position: 0 center;
        }
        .pai-trace {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='28' viewBox='0 0 120 28'%3E%3Cpath d='M0 14H30Q34 8 38 14H48L52 16L57 2L62 26L66 14H76Q82 7 88 14H120' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E");
        }
        .pai-ecg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='28' viewBox='0 0 120 28'%3E%3Cpath d='M0 14H30Q34 8 38 14H48L52 16L57 2L62 26L66 14H76Q82 7 88 14H120' fill='none' stroke='%230B5FA5' stroke-width='1.6' stroke-linejoin='round'/%3E%3C/svg%3E");
          width: 84px; height: 24px; background-size: auto 24px; animation: pai-scroll 1.4s linear infinite;
        }

        /* Launcher */
        .pai-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%; border: 3px solid #fff; cursor: pointer;
          background: var(--blue); color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 22px rgba(11,95,165,0.4);
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .pai-fab:hover { background: var(--blue-dark); transform: scale(1.05); }
        .pai-fab:not(.is-open)::after {
          content: ""; position: absolute; inset: -9px; border-radius: 50%;
          border: 2px solid rgba(11,95,165,0.35); animation: pai-ring 2.4s ease-out infinite; pointer-events: none;
        }
        .pai-fab:focus-visible, .pai-icon-btn:focus-visible, .pai-item:focus-visible, .pai-send:focus-visible {
          outline: 3px solid rgba(11,95,165,0.45); outline-offset: 2px;
        }
        .pai-tag {
          position: fixed; bottom: 38px; right: 92px; z-index: 9999; pointer-events: none;
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
          background: #fff; color: var(--ink); border: 1px solid var(--line); border-radius: 999px;
          padding: 8px 14px; font-size: 13px; font-weight: 600;
          box-shadow: 0 6px 18px rgba(18,48,74,0.12);
        }
        .pai-tag-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); }

        /* Panel */
        .pai-panel {
          position: fixed; bottom: 90px; right: 16px; z-index: 9999;
          width: min(384px, calc(100vw - 32px)); height: min(80vh, 620px);
          display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;
          background: #fff; color: var(--ink);
          border: 1px solid var(--line); border-radius: 16px;
          box-shadow: 0 20px 50px rgba(18,48,74,0.2);
          transform-origin: bottom right; animation: pai-open 0.2s ease-out;
        }

        /* Header: hospital blue with a faint cross pattern */
        .pai-header {
          flex-shrink: 0; background-color: var(--blue);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M12.5 9h3v3.5H19v3h-3.5V19h-3v-3.5H9v-3h3.5z' fill='%23ffffff' fill-opacity='0.07'/%3E%3C/svg%3E");
        }
        .pai-header-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 12px 6px 16px; }
        .pai-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .pai-badge {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0; background: #fff; color: var(--blue);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .pai-title { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.01em; line-height: 1.2; }
        .pai-status { display: flex; align-items: center; gap: 7px; margin-top: 3px; font-size: 12px; color: #CFE4F6; }
        .pai-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #5BE0A0; box-shadow: 0 0 0 3px rgba(91,224,160,0.25); }
        .pai-actions { display: flex; gap: 4px; }
        .pai-icon-btn {
          width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.12); color: #fff; transition: background 0.15s ease;
        }
        .pai-icon-btn:hover { background: rgba(255,255,255,0.24); }
        .pai-trace {
          height: 26px; opacity: 0.28; transition: opacity 0.3s ease;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent);
        }
        .pai-trace.live { opacity: 0.85; animation: pai-scroll 1.4s linear infinite; }

        .pai-notice {
          flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 8px 14px; font-size: 12px; font-weight: 600; color: var(--blue);
          background: var(--blue-soft); border-bottom: 1px solid var(--line);
        }

        /* Messages */
        .pai-messages {
          flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
          padding: 16px 14px 10px; display: flex; flex-direction: column; gap: 14px; background: var(--bg);
          scrollbar-width: thin; scrollbar-color: #C3D5E4 transparent;
        }
        .pai-messages::-webkit-scrollbar { width: 6px; }
        .pai-messages::-webkit-scrollbar-thumb { background: #C3D5E4; border-radius: 6px; }

        .pai-row { display: flex; align-items: flex-end; gap: 8px; animation: pai-in 0.18s ease-out; }
        .pai-row.user { justify-content: flex-end; }
        .pai-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; background: #fff; color: var(--blue);
          border: 1.5px solid var(--line); display: flex; align-items: center; justify-content: center;
        }
        .pai-bubble { max-width: 80%; padding: 11px 14px; font-size: 14px; line-height: 1.55; word-break: break-word; overflow-wrap: break-word; }
        .pai-bubble.assistant {
          background: #fff; color: var(--ink); border: 1px solid var(--line);
          border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 2px rgba(18,48,74,0.05);
        }
        .pai-bubble.user { background: var(--blue); color: #fff; border-radius: 16px 4px 16px 16px; }
        .pai-time { font-size: 11px; margin-top: 5px; }
        .pai-bubble.assistant .pai-time { color: var(--mute); }
        .pai-bubble.user .pai-time { color: #BBD6EF; text-align: right; }
        .pai-strong { font-weight: 700; }
        .pai-bullet { display: flex; gap: 10px; align-items: flex-start; margin-top: 6px; }
        .pai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); margin-top: 8px; flex-shrink: 0; }
        .pai-bubble.user .pai-dot { background: #fff; }
        .pai-typing { padding: 8px 14px; }

        /* Quick questions (inside the scroll area, so they never squeeze the chat) */
        .pai-sugg { display: flex; flex-direction: column; gap: 6px; padding: 0 0 4px 38px; }
        .pai-item {
          display: flex; align-items: center; gap: 10px; text-align: left; cursor: pointer; width: 100%;
          padding: 7px 10px; border-radius: 10px; font-family: inherit; color: var(--ink);
          background: #fff; border: 1px solid var(--line);
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .pai-item:hover { border-color: var(--blue); background: #FAFCFE; }
        .pai-item-text { flex: 1; font-size: 13px; font-weight: 600; line-height: 1.3; }
        .pai-item-chev { color: var(--mute); flex-shrink: 0; }
        .pai-item:hover .pai-item-chev { color: var(--blue); }
        .pai-item-icon { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .pai-item-icon.blue  { background: #E3F0FB; color: #0B5FA5; }
        .pai-item-icon.amber { background: #FDF1D6; color: #B7791F; }
        .pai-item-icon.red   { background: #FDE6E4; color: #C8372D; }
        .pai-item-icon.teal  { background: #DDF3F1; color: #00796F; }

        /* Input */
        .pai-input-wrap { flex-shrink: 0; padding: 12px 14px 14px; background: #fff; border-top: 1px solid var(--line); }
        .pai-input-box {
          display: flex; align-items: center; gap: 8px; padding: 5px 5px 5px 14px; border-radius: 14px;
          background: var(--bg); border: 1.5px solid var(--line);
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .pai-input-box:focus-within { background: #fff; border-color: var(--blue); box-shadow: 0 0 0 4px rgba(11,95,165,0.12); }
        .pai-input-box.is-disabled { opacity: 0.75; }
        .pai-input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-family: inherit; font-size: 16px; color: var(--ink); padding: 9px 0; }
        .pai-input::placeholder { color: var(--mute); }
        .pai-send {
          width: 40px; height: 40px; border-radius: 11px; border: none; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #DCE7F1; color: #98AEC0; cursor: not-allowed; transition: background 0.15s ease;
        }
        .pai-send.active { background: var(--blue); color: #fff; cursor: pointer; }
        .pai-send.active:hover { background: var(--blue-dark); }

        @keyframes pai-scroll { from { background-position-x: 0; } to { background-position-x: -120px; } }
        @keyframes pai-ring { 0% { transform: scale(0.85); opacity: 0.9; } 100% { transform: scale(1.35); opacity: 0; } }
        @keyframes pai-open { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes pai-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .pai-fab::after, .pai-panel, .pai-row, .pai-trace.live, .pai-ecg { animation: none !important; }
        }
        @media (max-width: 480px) {
          .pai-tag { display: none; }
          .pai-panel { right: 16px; height: min(78vh, 580px); }
        }
      `}</style>
    </>
  );
};

export default AIChatBot;


// import { useEffect, useRef, useState } from "react";
// import { askAI, askPatientAI } from "../../service/AIService";
// import { IconRobot, IconSend, IconTrash, IconX } from "@tabler/icons-react";

// interface Message {
//   id: number;
//   role: "user" | "assistant";
//   text: string;
//   ts: Date;
// }

// let msgId = 0;
// const makeMsg = (role: Message["role"], text: string): Message => ({
//   id: ++msgId,
//   role,
//   text,
//   ts: new Date(),
// });

// const fmt = (d: Date) =>
//   d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// const renderText = (text: string) => {
//   const lines = text.split("\n");
//   return lines.map((line, i) => {
//     const parts = line.split(/\*\*(.*?)\*\*/g);
//     const rendered = parts.map((p, j) =>
//       j % 2 === 1
//         ? <strong key={j} style={{ fontWeight: 600 }}>{p}</strong>
//         : p
//     );
//     if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
//       const content = line.replace(/^[\s\-•]+/, "");
//       return (
//         <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 4 }}>
//           <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6B7280", marginTop: 7, flexShrink: 0 }} />
//           <span>{content}</span>
//         </div>
//       );
//     }
//     return (
//       <span key={i}>
//         {rendered}
//         {i < lines.length - 1 && <br />}
//       </span>
//     );
//   });
// };

// const TypingDots = () => (
//   <div style={{ display: "flex", gap: 4, padding: "2px 0", alignItems: "center" }}>
//     {[0, 1, 2].map((i) => (
//       <span key={i} style={{
//         width: 6, height: 6, borderRadius: "50%",
//         background: "#9CA3AF", display: "inline-block",
//         animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
//       }} />
//     ))}
//   </div>
// );

// const SUGGESTIONS = [
//   "What is Paracetamol used for?",
//   "Side effects of Metformin?",
//   "Is Ibuprofen safe with BP meds?",
//   "How to store insulin?",
// ];

// const AIChatBot = () => {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   useEffect(() => {
//     if (open) {
//       setMessages([
//         makeMsg("assistant",
//           "Hi! 👋 I'm your medical AI assistant.\n\nAsk me about medicines, dosages, side effects, or drug interactions.\n\n⚠️ Always consult your doctor before any medical decision."
//         ),
//       ]);
//       setInput("");
//       setTimeout(() => inputRef.current?.focus(), 100);
//     } else {
//       setMessages([]);
//       setInput("");
//     }
//   }, [open]);

//   const handleAsk = async (question?: string) => {
//     const q = (question ?? input).trim();
//     if (!q || loading) return;
//     setInput("");
//     setMessages((prev) => [...prev, makeMsg("user", q)]);
//     setLoading(true);
//     try {

//       const isLoggedIn = !!localStorage.getItem("token");

//       const res = isLoggedIn
//         ? await askPatientAI(q)
//         : await askAI(q);

//       setMessages((prev) => [
//         ...prev,
//         makeMsg("assistant", res)
//       ]);
//       // const res = await askAI(q);
//       // setMessages((prev) => [...prev, makeMsg("assistant", res)]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         makeMsg("assistant", "⚠️ Couldn't reach the AI service. Please try again."),
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKey = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     setTimeout(() =>
//       setMessages([makeMsg("assistant", "Chat cleared! How can I help you? 🩺")]), 40
//     );
//   };

//   const canSend = !loading && input.trim().length > 0;

//   return (
//     <>
//       {!open && (
//         <span style={{
//           position: "fixed",
//           bottom: 20, right: 20,
//           width: 56, height: 56,
//           borderRadius: "50%",
//           background: "rgba(36, 174, 158, 0.35)",
//           zIndex: 9998,
//           animation: "pulse-ring 2s ease-out infinite",
//           pointerEvents: "none",
//         }} />
//       )}

//       {!open && (
//         <div style={{
//           position: "fixed",
//           bottom: 32, right: 80,
//           background: "#1F2937",
//           color: "#F9FAFB",
//           fontSize: 11.5,
//           fontWeight: 600,
//           padding: "5px 10px",
//           borderRadius: 8,
//           zIndex: 9999,
//           whiteSpace: "nowrap",
//           boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
//           pointerEvents: "none",
//           animation: "label-in 0.3s ease-out",
//         }}>
//           🩺 AI Assistant
//           <div style={{
//             position: "absolute",
//             right: -6, top: "50%",
//             transform: "translateY(-50%)",
//             width: 0, height: 0,
//             borderTop: "5px solid transparent",
//             borderBottom: "5px solid transparent",
//             borderLeft: "6px solid #1F2937",
//           }} />
//         </div>
//       )}

//       <button
//         onClick={() => setOpen((v) => !v)}
//         title="Pulse AI"
//         style={{
//           position: "fixed",
//           bottom: 24, right: 24,
//           width: 48, height: 48,
//           borderRadius: "50%",
//           background: "#1F2937",
//           color: "#fff",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           cursor: "pointer",
//           border: "none",
//           boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
//           zIndex: 9999,
//           transition: "background 0.2s, transform 0.2s",
//           animation: open ? "none" : "bot-pulse 2s ease-in-out infinite",
//         }}
//         onMouseEnter={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
//           (e.currentTarget as HTMLButtonElement).style.background = "#111827";
//         }}
//         onMouseLeave={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
//           (e.currentTarget as HTMLButtonElement).style.background = "#1F2937";
//         }}
//       >
//         {open ? <IconX size={17} stroke={2.5} /> : <IconRobot size={20} stroke={1.8} />}
//       </button>

//       {open && (
//         <div style={{
//           position: "fixed",
//           bottom: 82,
//           right: 16,
//           width: "min(340px, calc(100vw - 32px))",
//           maxHeight: "min(75vh, 560px)",
//           display: "flex",
//           flexDirection: "column",
//           background: "#fff",
//           borderRadius: 12,
//           border: "1px solid #E5E7EB",
//           boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
//           zIndex: 9999,
//           overflow: "hidden",
//           animation: "chat-in 0.18s ease-out",
//           fontFamily: "'Inter', system-ui, sans-serif",
//           boxSizing: "border-box",
//         }}>
//           <div style={{
//             padding: "12px 14px",
//             background: "#1F2937",
//             display: "flex", alignItems: "center",
//             justifyContent: "space-between",
//             flexShrink: 0,
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <div style={{
//                 width: 32, height: 32, borderRadius: 8,
//                 background: "#374151",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//               }}>
//                 <IconRobot size={17} color="#E5E7EB" stroke={1.8} />
//               </div>
//               <div>
//                 <div style={{ fontSize: 13, fontWeight: 600, color: "#F9FAFB", lineHeight: 1.3 }}>
//                   Pulse AI
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
//                   <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
//                   <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>Online</span>
//                 </div>
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: 5 }}>
//               <button onClick={clearChat} title="Clear chat" style={{ width: 28, height: 28, borderRadius: 6, background: "#374151", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
//                 onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4B5563"; }}
//                 onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#374151"; }}>
//                 <IconTrash size={13} stroke={2} />
//               </button>
//               <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 6, background: "#374151", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
//                 onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4B5563"; }}
//                 onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#374151"; }}>
//                 <IconX size={13} stroke={2.5} />
//               </button>
//             </div>
//           </div>

//           <div style={{
//             flex: 1,
//             overflowY: "auto",
//             WebkitOverflowScrolling: "touch",
//             padding: "14px 12px",
//             display: "flex", flexDirection: "column",
//             gap: 10,
//             background: "#F9FAFB",
//             minHeight: 0,
//           }}>
//             {messages.map((msg) => (
//               <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 7, animation: "msg-in 0.16s ease-out" }}>
//                 <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "user" ? "#374151" : "#E5E7EB" }}>
//                   {msg.role === "user"
//                     ? <span style={{ fontSize: 10, fontWeight: 700, color: "#F9FAFB" }}>P</span>
//                     : <IconRobot size={13} color="#6B7280" stroke={1.8} />
//                   }
//                 </div>
//                 <div style={{
//                   maxWidth: "75%",
//                   padding: "9px 12px",
//                   borderRadius: msg.role === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
//                   background: msg.role === "user" ? "#1F2937" : "#fff",
//                   color: msg.role === "user" ? "#F3F4F6" : "#374151",
//                   fontSize: 12.5,
//                   lineHeight: 1.6,
//                   border: msg.role === "assistant" ? "1px solid #E5E7EB" : "none",
//                   boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//                   wordBreak: "break-word",
//                   overflowWrap: "break-word",
//                 }}>
//                   <div>{renderText(msg.text)}</div>
//                   <div style={{ fontSize: 10, marginTop: 4, color: msg.role === "user" ? "#6B7280" : "#9CA3AF", textAlign: msg.role === "user" ? "right" : "left" }}>
//                     {fmt(msg.ts)}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {loading && (
//               <div style={{ display: "flex", alignItems: "flex-end", gap: 7, animation: "msg-in 0.16s ease-out" }}>
//                 <div style={{ width: 26, height: 26, borderRadius: 8, background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                   <IconRobot size={13} color="#6B7280" stroke={1.8} />
//                 </div>
//                 <div style={{ padding: "10px 13px", borderRadius: "3px 12px 12px 12px", background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
//                   <TypingDots />
//                 </div>
//               </div>
//             )}
//             <div ref={bottomRef} />
//           </div>

//           {messages.length <= 1 && !loading && (
//             <div style={{
//               padding: "0 12px 10px",
//               display: "flex",
//               gap: 5,
//               overflowX: "auto",
//               flexWrap: "nowrap",
//               background: "#F9FAFB",
//               flexShrink: 0,
//               WebkitOverflowScrolling: "touch",
//               scrollbarWidth: "none",
//               msOverflowStyle: "none",
//             }}>
//               {SUGGESTIONS.map((s) => (
//                 <button key={s} onClick={() => handleAsk(s)} style={{
//                   padding: "4px 9px", fontSize: 11, fontWeight: 500,
//                   borderRadius: 6, border: "1px solid #E5E7EB",
//                   background: "#fff", color: "#374151", cursor: "pointer",
//                   whiteSpace: "nowrap", flexShrink: 0,
//                 }}
//                   onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
//                   onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
//                   {s}
//                 </button>
//               ))}
//             </div>
//           )}

//           <div style={{ padding: "6px 12px", background: "#FFF8E1", borderTop: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
//             <span style={{ fontSize: 11 }}>⚠️</span>
//             <span style={{ fontSize: 10, color: "#92400E" }}>For information only. Always consult your doctor.</span>
//           </div>

//           <div style={{ padding: "10px 12px", background: "#fff", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
//             <input
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKey}
//               disabled={loading}
//               placeholder="Ask about a medicine…"
//               style={{
//                 flex: 1,
//                 minWidth: 0,
//                 padding: "9px 12px",
//                 borderRadius: 8,
//                 border: "1.5px solid #E5E7EB",
//                 fontSize: 16,
//                 outline: "none",
//                 color: "#111827",
//                 background: loading ? "#F9FAFB" : "#fff",
//                 fontFamily: "inherit",
//               }}
//               onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "#9CA3AF"; }}
//               onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB"; }}
//             />
//             <button onClick={() => handleAsk()} disabled={!canSend}
//               style={{
//                 width: 34, height: 34, borderRadius: 8,
//                 background: canSend ? "#1F2937" : "#F3F4F6",
//                 border: "none", cursor: canSend ? "pointer" : "not-allowed",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 flexShrink: 0,
//               }}
//               onMouseEnter={(e) => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
//               onMouseLeave={(e) => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = "#1F2937"; }}>
//               <IconSend size={14} color={canSend ? "#fff" : "#9CA3AF"} stroke={2} />
//             </button>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes bot-pulse {
//           0%   { transform: scale(1);    box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
//           50%  { transform: scale(1.15); box-shadow: 0 6px 20px rgba(36,174,158,0.5); }
//           100% { transform: scale(1);    box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
//         }
//         @keyframes pulse-ring {
//           0%   { transform: scale(0.8); opacity: 0.8; }
//           100% { transform: scale(1.7); opacity: 0;   }
//         }
//         @keyframes label-in {
//           from { opacity: 0; transform: translateX(6px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//         @keyframes dot-bounce {
//           0%, 80%, 100% { transform: scale(0.65); opacity: 0.35; }
//           40%            { transform: scale(1);    opacity: 1;    }
//         }
//         @keyframes chat-in {
//           from { opacity: 0; transform: translateY(10px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0)    scale(1);    }
//         }
//         @keyframes msg-in {
//           from { opacity: 0; transform: translateY(5px); }
//           to   { opacity: 1; transform: translateY(0);   }
//         }
//       `}</style>
//     </>
//   );
// };

// export default AIChatBot;
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API = `${process.env.REACT_APP_API_URL}/api`;
const WS_URL = `${process.env.REACT_APP_API_URL}/ws`;
const EMOJIS = ["😂", "👀", "🔥", "🤯", "💀", "🫢"];

const getToken = () => localStorage.getItem("accessToken");

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, data: text }; }
};

const timeLeft = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

const shortToken = (token) => token ? `#${token.slice(0, 6).toUpperCase()}` : "#??????";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

  .chat-root {
    min-height: 100vh;
    background: #050507;
    display: flex;
    flex-direction: column;
    font-family: 'Crimson Pro', Georgia, serif;
  }

  .chat-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 70px;
    border-bottom: 1px solid rgba(139,0,0,0.2);
    background: rgba(5,5,7,0.97);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }

  .chat-nav-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .btn-back {
    background: none;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 8px 16px;
    color: rgba(255,255,255,0.3);
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 1px;
    transition: all 0.2s;
  }

  .btn-back:hover {
    border-color: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.6);
  }

  .chat-group-name {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    font-weight: 700;
    color: #e8e0d5;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .chat-nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ws-status {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    font-style: italic;
  }

  .ws-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #444;
  }

  .ws-dot.connected { background: #2d8a4e; animation: pulse 2s infinite; }
  .ws-dot.connecting { background: #8a6d2d; animation: pulse 0.8s infinite; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .msg-count {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    color: rgba(139,0,0,0.6);
    letter-spacing: 2px;
  }

  .chat-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .bg-noise {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139,0,0,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,0,0,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    z-index: 1;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-track { background: transparent; }
  .messages-area::-webkit-scrollbar-thumb { background: rgba(139,0,0,0.3); border-radius: 2px; }

  .msg-bubble {
    max-width: 680px;
    animation: bubbleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .msg-bubble.own { align-self: flex-end; }
  .msg-bubble.other { align-self: flex-start; }

  .msg-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .msg-bubble.own .msg-header { flex-direction: row-reverse; }

  .sender-token {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(139,0,0,0.7);
  }

  .msg-bubble.own .sender-token { color: rgba(200,169,126,0.7); }

  .msg-time {
    font-size: 11px;
    color: rgba(255,255,255,0.15);
    font-style: italic;
  }

  .msg-expires {
    font-size: 10px;
    color: rgba(139,0,0,0.4);
    font-family: 'Cinzel', serif;
    letter-spacing: 1px;
  }

  .msg-content {
    padding: 16px 20px;
    border-radius: 1px;
    font-size: 17px;
    line-height: 1.6;
    color: #e8e0d5;
    position: relative;
  }

  .msg-bubble.other .msg-content {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-left: 2px solid rgba(139,0,0,0.5);
  }

  .msg-bubble.own .msg-content {
    background: rgba(139,0,0,0.12);
    border: 1px solid rgba(139,0,0,0.25);
    border-right: 2px solid rgba(139,0,0,0.6);
  }

  .msg-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .msg-bubble.own .msg-footer { justify-content: flex-end; }

  .emoji-btn {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s;
    color: rgba(255,255,255,0.5);
  }

  .emoji-btn:hover {
    background: rgba(139,0,0,0.08);
    border-color: rgba(139,0,0,0.3);
  }

  .emoji-btn.reacted {
    background: rgba(139,0,0,0.12);
    border-color: rgba(139,0,0,0.35);
  }

  .emoji-count {
    font-size: 11px;
    font-family: 'Cinzel', serif;
  }

  .emoji-picker {
    display: flex;
    gap: 4px;
  }

  .emoji-pick-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: transform 0.15s;
    opacity: 0.5;
  }

  .emoji-pick-btn:hover {
    opacity: 1;
    transform: scale(1.3);
  }

  .report-btn {
    background: none;
    border: none;
    font-size: 11px;
    color: rgba(255,255,255,0.1);
    cursor: pointer;
    font-family: 'Cinzel', serif;
    letter-spacing: 1px;
    padding: 4px 8px;
    transition: color 0.2s;
  }

  .report-btn:hover { color: rgba(200,50,50,0.5); }

  .chat-input-area {
    padding: 24px 40px;
    border-top: 1px solid rgba(139,0,0,0.15);
    background: rgba(5,5,7,0.95);
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }

  .input-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .chat-input {
    flex: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1px;
    padding: 16px 20px;
    color: #e8e0d5;
    font-size: 17px;
    font-family: 'Crimson Pro', serif;
    outline: none;
    resize: none;
    min-height: 56px;
    max-height: 140px;
    transition: border-color 0.3s;
    line-height: 1.5;
  }

  .chat-input:focus { border-color: rgba(139,0,0,0.4); }
  .chat-input::placeholder { color: rgba(255,255,255,0.12); font-style: italic; }

  .btn-send {
    padding: 16px 28px;
    background: #8b0000;
    border: none;
    border-radius: 1px;
    color: #e8e0d5;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    height: 56px;
  }

  .btn-send:hover:not(:disabled) {
    background: #a00000;
    box-shadow: 0 0 20px rgba(139,0,0,0.3);
  }

  .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }

  .input-hint {
    margin-top: 10px;
    font-size: 12px;
    color: rgba(255,255,255,0.12);
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .anon-badge {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(139,0,0,0.5);
    background: rgba(139,0,0,0.06);
    border: 1px solid rgba(139,0,0,0.15);
    padding: 2px 8px;
    border-radius: 1px;
  }

  .empty-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.1);
    gap: 12px;
  }

  .empty-chat-icon {
    font-size: 40px;
    opacity: 0.3;
  }

  .empty-chat-text {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .empty-chat-sub {
    font-size: 14px;
    font-style: italic;
    color: rgba(255,255,255,0.08);
  }

  .loading-msgs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    color: rgba(255,255,255,0.2);
    font-style: italic;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(139,0,0,0.3);
    border-top-color: #8b0000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .new-msg-toast {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(139,0,0,0.9);
    color: #e8e0d5;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 2px;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    z-index: 50;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

export default function ChatPage({ group, onBack, myToken }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [reactions, setReactions] = useState({});
  const [showNewMsg, setShowNewMsg] = useState(false);

  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const isAtBottom = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      fetchMessages();
      connectWS();
      return () => stompClient.current?.deactivate();
    }, []);

  const scrollToBottom = (force = false) => {
    if (force || isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMsg(false);
    }
  };

  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isAtBottom.current = atBottom;
    if (atBottom) setShowNewMsg(false);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { ok, data } = await apiFetch(`/messages/${group.id}`);
    if (ok) {
      const sorted = [...data].reverse();
      setMessages(sorted);
      await fetchAllReactions(sorted);
    }
    setLoading(false);
    setTimeout(() => scrollToBottom(true), 100);
  };

  const fetchAllReactions = async (msgs) => {
    const summaries = {};
    await Promise.all(
      msgs.map(async (m) => {
        const { ok, data } = await apiFetch(`/reactions/${m.id}/summary`);
        if (ok) summaries[m.id] = data.emojiCounts || {};
      })
    );
    setReactions(summaries);
  };

  const connectWS = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${getToken()}` },
      onConnect: () => {
        setWsStatus("connected");
        client.subscribe(`/topic/group/${group.id}`, (frame) => {
          const msg = JSON.parse(frame.body);
          const newMsg = {
            id: Date.now(),
            senderToken: msg.senderToken,
            content: msg.content,
            postedAt: msg.postedAt,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            reactionCount: 0,
          };
          setMessages((prev) => [...prev, newMsg]);
          if (!isAtBottom.current) setShowNewMsg(true);
          else setTimeout(() => scrollToBottom(true), 50);
        });
      },
      onDisconnect: () => setWsStatus("disconnected"),
      onStompError: () => setWsStatus("disconnected"),
      reconnectDelay: 3000,
    });
    client.activate();
    stompClient.current = client;
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/chat/${group.id}`,
        body: JSON.stringify({ content: input.trim() }),
      });
    } else {
      await apiFetch(`/messages/${group.id}`, {
        method: "POST",
        body: JSON.stringify({ content: input.trim() }),
      });
      fetchMessages();
    }
    setInput("");
    setSending(false);
    setTimeout(() => scrollToBottom(true), 100);
  };

  const toggleReaction = async (messageId, emoji) => {
    const { ok } = await apiFetch(
      `/reactions/${messageId}/toggle?emoji=${encodeURIComponent(emoji)}`,
      { method: "POST" }
    );
    if (ok) {
      const { data } = await apiFetch(`/reactions/${messageId}/summary`);
      setReactions((prev) => ({ ...prev, [messageId]: data.emojiCounts || {} }));
    }
  };

  const reportMessage = async (messageId) => {
    if (!window.confirm("Report this rumour?")) return;
    await apiFetch(`/reports/${messageId}`, {
      method: "POST",
      body: JSON.stringify({ reason: "Inappropriate content" }),
    });
  };

  const isOwn = (token) => token === myToken;

  return (
    <>
      <style>{styles}</style>
      <div className="chat-root">

        {/* Navbar */}
        <nav className="chat-nav">
          <div className="chat-nav-left">
            <button className="btn-back" onClick={onBack}>← Back</button>
            <div className="chat-group-name">{group.groupName}</div>
          </div>
          <div className="chat-nav-right">
            <span className="msg-count">{messages.length} rumours</span>
            <div className="ws-status">
              <div className={`ws-dot ${wsStatus}`} />
              {wsStatus === "connected" ? "Live" : wsStatus === "connecting" ? "Connecting..." : "Offline"}
            </div>
          </div>
        </nav>

        {/* Messages */}
        <div className="chat-body">
          <div className="bg-noise" />
          <div
            className="messages-area"
            ref={messagesAreaRef}
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="loading-msgs">
                <div className="spinner" /> Loading rumours...
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">🤫</div>
                <div className="empty-chat-text">No rumours yet</div>
                <div className="empty-chat-sub">Be the first to whisper something...</div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`msg-bubble ${isOwn(msg.senderToken) ? "own" : "other"}`}
                >
                  <div className="msg-header">
                    <span className="sender-token">{shortToken(msg.senderToken)}</span>
                    <span className="msg-time">
                      {msg.postedAt ? new Date(msg.postedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                    {msg.expiresAt && (
                      <span className="msg-expires">{timeLeft(msg.expiresAt)}</span>
                    )}
                  </div>

                  <div className="msg-content">{msg.content}</div>

                  <div className="msg-footer">
                    {/* Show existing reactions */}
                    {reactions[msg.id] && Object.entries(reactions[msg.id]).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        className="emoji-btn reacted"
                        onClick={() => toggleReaction(msg.id, emoji)}
                      >
                        {emoji} <span className="emoji-count">{count}</span>
                      </button>
                    ))}

                    {/* Emoji picker */}
                    <div className="emoji-picker">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          className="emoji-pick-btn"
                          onClick={() => toggleReaction(msg.id, e)}
                          title={`React with ${e}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>

                    {!isOwn(msg.senderToken) && (
                      <button className="report-btn" onClick={() => reportMessage(msg.id)}>
                        report
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {showNewMsg && (
            <div className="new-msg-toast" onClick={() => scrollToBottom(true)}>
              New rumour ↓
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="input-row">
            <textarea
              className="chat-input"
              placeholder="Whisper a rumour anonymously..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
            />
            <button
              className="btn-send"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
            >
              {sending ? "..." : "Whisper"}
            </button>
          </div>
          <div className="input-hint">
            <span className="anon-badge">Anonymous</span>
            Your identity is never revealed. Press Enter to send.
          </div>
        </div>
      </div>
    </>
  );
}

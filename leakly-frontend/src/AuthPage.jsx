import { useState, useEffect } from "react";

const API = "http://localhost:8080/api/auth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #050507;
    min-height: 100vh;
    font-family: 'Crimson Pro', Georgia, serif;
  }

  .auth-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #050507;
    position: relative;
    overflow: hidden;
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139,0,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,0,0,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .bg-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,0,0,0.08) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .auth-card {
    position: relative;
    width: 460px;
    background: #0d0d10;
    border: 1px solid rgba(139,0,0,0.25);
    border-radius: 2px;
    padding: 52px 48px;
    box-shadow: 0 0 80px rgba(139,0,0,0.06), inset 0 0 60px rgba(0,0,0,0.4);
    z-index: 1;
    animation: fadeIn 0.8s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .corner {
    position: absolute;
    width: 16px;
    height: 16px;
    border-color: rgba(139,0,0,0.6);
    border-style: solid;
  }
  .corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
  .corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
  .corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
  .corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

  .brand {
    text-align: center;
    margin-bottom: 40px;
  }

  .brand-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    border: 1px solid rgba(139,0,0,0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139,0,0,0.08);
  }

  .brand-icon svg {
    width: 22px;
    height: 22px;
    fill: #8b0000;
  }

  .brand-title {
    font-family: 'Cinzel', serif;
    font-size: 26px;
    font-weight: 700;
    color: #e8e0d5;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .brand-sub {
    font-size: 13px;
    color: rgba(139,0,0,0.7);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 6px;
    font-weight: 300;
  }

  .tab-row {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 36px;
  }

  .tab {
    flex: 1;
    background: none;
    border: none;
    padding: 12px;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    color: rgba(255,255,255,0.25);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.3s;
  }

  .tab:hover { color: rgba(255,255,255,0.5); }

  .tab.active {
    color: #c8a97e;
    border-bottom-color: #8b0000;
  }

  .field {
    margin-bottom: 20px;
  }

  .field label {
    display: block;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
    font-family: 'Cinzel', serif;
  }

  .field input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1px;
    padding: 13px 16px;
    color: #e8e0d5;
    font-size: 15px;
    font-family: 'Crimson Pro', Georgia, serif;
    outline: none;
    transition: border-color 0.3s, background 0.3s;
  }

  .field input::placeholder { color: rgba(255,255,255,0.15); }

  .field input:focus {
    border-color: rgba(139,0,0,0.5);
    background: rgba(139,0,0,0.04);
  }

  .btn-submit {
    width: 100%;
    margin-top: 8px;
    padding: 15px;
    background: #8b0000;
    border: none;
    border-radius: 1px;
    color: #e8e0d5;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .btn-submit:hover:not(:disabled) {
    background: #a00000;
    box-shadow: 0 0 20px rgba(139,0,0,0.3);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-submit.loading::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: rgba(255,255,255,0.3);
    animation: shimmer 1s infinite;
  }

  @keyframes shimmer {
    to { left: 100%; }
  }

  .msg {
    margin-top: 20px;
    padding: 12px 16px;
    border-radius: 1px;
    font-size: 14px;
    font-style: italic;
    animation: fadeIn 0.3s ease;
  }

  .msg.error {
    background: rgba(139,0,0,0.12);
    border: 1px solid rgba(139,0,0,0.3);
    color: #e07070;
  }

  .msg.success {
    background: rgba(0,80,50,0.12);
    border: 1px solid rgba(0,150,80,0.25);
    color: #70c090;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }

  .divider-text {
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 2px;
    font-family: 'Cinzel', serif;
  }

  .footer-text {
    text-align: center;
    margin-top: 28px;
    font-size: 12px;
    color: rgba(255,255,255,0.18);
    letter-spacing: 1px;
    font-style: italic;
  }

  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 1px;
    height: 1px;
    background: rgba(139,0,0,0.5);
    border-radius: 50%;
    animation: float linear infinite;
  }

  @keyframes float {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-20px) scale(1); opacity: 0; }
  }

  .verified-banner {
    background: rgba(0,80,50,0.15);
    border: 1px solid rgba(0,150,80,0.2);
    border-radius: 1px;
    padding: 14px 16px;
    margin-bottom: 24px;
    text-align: center;
    font-size: 13px;
    color: #70c090;
    font-style: italic;
  }
`;

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 3 + 1}px`,
  duration: `${Math.random() * 15 + 10}s`,
  delay: `${Math.random() * 10}s`,
}));

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) verifyEmail(token);
  }, []);

  const verifyEmail = async (token) => {
    try {
      const res = await fetch(`${API}/verify-email?token=${token}`);
      const text = await res.text();
      setVerified(true);
      setMessage({ type: "success", text });
    } catch {
      setMessage({ type: "error", text: "Verification failed. Try again." });
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (tab === "register") {
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        setMessage({ type: "success", text });
        setEmail("");
        setPassword("");
      } else {
        const res = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        if (onLogin) onLogin(data);
        else setMessage({ type: "success", text: "Login successful! Redirecting..." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setMessage(null);
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="auth-card">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <div className="brand-title">Leakly</div>
            <div className="brand-sub">Whisper anonymously</div>
          </div>

          {verified && (
            <div className="verified-banner">
              Your identity is verified. You may now enter.
            </div>
          )}

          <div className="tab-row">
            <button
              className={`tab ${tab === "login" ? "active" : ""}`}
              onClick={() => switchTab("login")}
            >
              Enter
            </button>
            <button
              className={`tab ${tab === "register" ? "active" : ""}`}
              onClick={() => switchTab("register")}
            >
              Join
            </button>
          </div>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder={tab === "register" ? "Min. 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            className={`btn-submit ${loading ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : tab === "login" ? "Enter the shadows" : "Join the whispers"}
          </button>

          {message && (
            <div className={`msg ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">{tab === "login" ? "New here?" : "Already one of us?"}</span>
            <div className="divider-line" />
          </div>

          <button
            className="btn-submit"
            style={{ background: "transparent", border: "1px solid rgba(139,0,0,0.3)", color: "rgba(200,169,126,0.7)" }}
            onClick={() => switchTab(tab === "login" ? "register" : "login")}
          >
            {tab === "login" ? "Create an account" : "Sign in instead"}
          </button>

          <p className="footer-text">
            {tab === "login"
              ? "Your identity remains hidden. Always."
              : "After joining, verify your email to begin."}
          </p>
        </div>
      </div>
    </>
  );
}

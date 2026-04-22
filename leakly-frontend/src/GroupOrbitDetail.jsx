import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const COLORS = {
  bg: "#050507",
  crimson: "#8b0000",
  crimsonBright: "#c0001a",
  gold: "#c8a97e",
  goldDim: "#7a5f3a",
  text: "#e8dcc8",
  textDim: "#7a7060",
  memberBg: "#0d0d12",
  memberBorder: "#2a1a2e",
  lineColor: "rgba(139,0,0,0.25)",
  pulse: "rgba(200,169,126,0.18)",
};

const CENTER_R = 68;   // px radius of the "Enter Chat" button
const ORBIT_R  = 220;  // px radius of the member orbit
const NODE_R   = 42;   // half of node width/height (node = 84px)

// ─────────────────────────────────────────────
//  SVG orbit lines + member nodes (pure SVG layer)
// ─────────────────────────────────────────────
function OrbitSVG({ members, size, cx, cy }) {
  const r = Math.min(ORBIT_R, size * 0.38);
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        {/* Orbit ring gradient */}
        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(139,0,0,0.08)" />
        </radialGradient>
        {/* Glowing line filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gold glow for admin */}
        <filter id="goldGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Orbit ring */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(139,0,0,0.15)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      {/* Connection lines */}
      {members.map((m, i) => {
        const angle = (i / members.length) * 2 * Math.PI - Math.PI / 2;
        const mx = cx + r * Math.cos(angle);
        const my = cy + r * Math.sin(angle);
        return (
          <line
            key={m.id ?? i}
            x1={cx} y1={cy}
            x2={mx} y2={my}
            stroke={m.isAdmin ? "rgba(200,169,126,0.3)" : COLORS.lineColor}
            strokeWidth={m.isAdmin ? "1.5" : "1"}
            filter="url(#glow)"
          />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Single member node (absolutely positioned)
// ─────────────────────────────────────────────
function MemberNode({ member, angle, orbitR, cx, cy, hovered, onHover, onLeave }) {
  const x = cx + orbitR * Math.cos(angle) - NODE_R;
  const y = cy + orbitR * Math.sin(angle) - NODE_R;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: NODE_R * 2,
        height: NODE_R * 2,
        borderRadius: "50%",
        background: hovered
          ? "radial-gradient(circle at 35% 35%, #1a0a1a, #0a050a)"
          : "radial-gradient(circle at 35% 35%, #110b18, #07040a)",
        border: `2px solid ${member.isAdmin ? COLORS.gold : (hovered ? COLORS.crimsonBright : COLORS.memberBorder)}`,
        boxShadow: member.isAdmin
          ? `0 0 14px ${COLORS.goldDim}, inset 0 0 8px rgba(200,169,126,0.08)`
          : hovered
          ? `0 0 12px rgba(139,0,0,0.5)`
          : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        zIndex: 10,
      }}
    >
      <span style={{
        fontSize: member.isAdmin ? "20px" : "16px",
        lineHeight: 1,
        color: member.isAdmin ? COLORS.gold : "rgba(232,220,200,0.3)",
      }}>
        {member.isAdmin ? "♛" : "◈"}
      </span>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0d0a10",
          border: `1px solid ${member.isAdmin ? COLORS.goldDim : "rgba(139,0,0,0.4)"}`,
          borderRadius: "4px",
          padding: "5px 10px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 999,
        }}>
          <span style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "12px",
            color: member.isAdmin ? COLORS.gold : COLORS.text,
          }}>
            {member.isAdmin ? "⚑ Admin" : "Member"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main exported component
//  Props:
//    group   – { id, name, inviteCode, members: [{ id, email, username, role }] }
//    onEnterChat – () => void
//    onBack      – () => void
// ─────────────────────────────────────────────
export default function GroupOrbitDetail({ group, onEnterChat, onBack }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(500);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [enterHovered, setEnterHovered] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const rafRef = useRef(null);
  const lastTime = useRef(null);

  // Responsive sizing
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const s = Math.min(containerRef.current.offsetWidth, containerRef.current.offsetHeight, 520);
        setSize(Math.max(s, 320));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Slow orbit rotation (~0.4 rpm)
  useEffect(() => {
    const tick = (ts) => {
      if (lastTime.current !== null) {
        const dt = ts - lastTime.current;
        setOrbitAngle(a => a + dt * 0.00004); // radians per ms
      }
      lastTime.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!group) return null;

  const members = group.members || [];
  const cx = size / 2;
  const cy = size / 2;
  const orbitR = Math.min(ORBIT_R, size * 0.38);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: COLORS.bg,
      fontFamily: "'Crimson Pro', Georgia, serif",
      color: COLORS.text,
      overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px 14px",
        borderBottom: "1px solid rgba(139,0,0,0.2)",
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: COLORS.textDim,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = COLORS.gold}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.textDim}
        >
          ← Back
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Cinzel', 'Palatino Linotype', serif",
            fontSize: "18px",
            color: COLORS.text,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            {group.name}
          </div>
          <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "2px", letterSpacing: "0.06em" }}>
            {members.length} {members.length === 1 ? "whisper" : "whispers"} in the dark
          </div>
        </div>

        {/* Invite code pill */}
        <div
          title="Click to copy invite code"
          onClick={() => navigator.clipboard?.writeText(group.inviteCode)}
          style={{
            background: "rgba(139,0,0,0.12)",
            border: "1px solid rgba(139,0,0,0.3)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "11px",
            fontFamily: "'Courier New', monospace",
            color: COLORS.gold,
            cursor: "pointer",
            letterSpacing: "0.1em",
            transition: "background 0.2s",
            userSelect: "none",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(139,0,0,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(139,0,0,0.12)"}
        >
          {group.inviteCode}
        </div>
      </div>

      {/* ── Orbit Stage ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial glow */}
        <div style={{
          position: "absolute",
          width: orbitR * 2.6,
          height: orbitR * 2.6,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,0,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Orbit canvas (sized box) */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>

          {/* SVG lines layer */}
          <OrbitSVG members={members} size={size} cx={cx} cy={cy} />

          {/* Member nodes */}
          {members.map((m, i) => {
            const baseAngle = (i / members.length) * 2 * Math.PI - Math.PI / 2;
            const angle = baseAngle + orbitAngle;
            return (
              <MemberNode
                key={m.id ?? i}
                member={{
                  ...m,
                  isAdmin: (m.role === "ADMIN") || (m.groupRole === "ADMIN"),
                }}
                angle={angle}
                orbitR={orbitR}
                cx={cx}
                cy={cy}
                hovered={hoveredIdx === i}
                onHover={() => setHoveredIdx(i)}
                onLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* ── Enter Chat button (center) ── */}
          <button
            onClick={onEnterChat}
            onMouseEnter={() => setEnterHovered(true)}
            onMouseLeave={() => setEnterHovered(false)}
            style={{
              position: "absolute",
              left: cx - CENTER_R,
              top: cy - CENTER_R,
              width: CENTER_R * 2,
              height: CENTER_R * 2,
              borderRadius: "50%",
              border: `2px solid ${enterHovered ? COLORS.crimsonBright : "rgba(139,0,0,0.6)"}`,
              background: enterHovered
                ? "radial-gradient(circle at 40% 38%, #3a0000, #1a0005)"
                : "radial-gradient(circle at 40% 38%, #220000, #0d0008)",
              boxShadow: enterHovered
                ? `0 0 32px rgba(139,0,0,0.7), 0 0 60px rgba(139,0,0,0.3), inset 0 0 20px rgba(200,0,0,0.15)`
                : `0 0 18px rgba(139,0,0,0.4), 0 0 40px rgba(139,0,0,0.15)`,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease",
              zIndex: 20,
              transform: enterHovered ? "scale(1.06)" : "scale(1)",
            }}
          >
            {/* Outer pulse ring */}
            <div style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: `1px solid ${enterHovered ? "rgba(139,0,0,0.45)" : "rgba(139,0,0,0.15)"}`,
              animation: "leaklyPulse 2.4s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              inset: -18,
              borderRadius: "50%",
              border: "1px solid rgba(139,0,0,0.08)",
              animation: "leaklyPulse 2.4s ease-in-out 0.8s infinite",
              pointerEvents: "none",
            }} />

            <span style={{
              fontFamily: "'Cinzel', 'Palatino Linotype', serif",
              fontSize: enterHovered ? "13px" : "12px",
              color: enterHovered ? "#ff4444" : COLORS.crimsonBright,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "all 0.3s",
              lineHeight: 1.2,
              textAlign: "center",
            }}>
              Enter<br />Chat
            </span>
          </button>

        </div>{/* /orbit canvas */}
      </div>

      {/* ── Legend ── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        padding: "14px 28px 20px",
        borderTop: "1px solid rgba(139,0,0,0.1)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: `2px solid ${COLORS.gold}`,
            boxShadow: `0 0 6px ${COLORS.goldDim}`,
          }} />
          <span style={{ fontSize: "12px", color: COLORS.textDim, letterSpacing: "0.06em" }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: `2px solid ${COLORS.memberBorder}`,
          }} />
          <span style={{ fontSize: "12px", color: COLORS.textDim, letterSpacing: "0.06em" }}>Member</span>
        </div>
        <div style={{ fontSize: "12px", color: COLORS.textDim, letterSpacing: "0.04em", opacity: 0.6 }}>
          Identities hidden
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

        @keyframes leaklyPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0.1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

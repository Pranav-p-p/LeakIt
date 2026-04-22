import { useState, useEffect } from "react";
import GroupOrbitDetail from "./GroupOrbitDetail";

const API = "http://localhost:8080/api";

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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

  .db-root {
    min-height: 100vh;
    background: #050507;
    font-family: 'Crimson Pro', Georgia, serif;
    display: flex;
    flex-direction: column;
  }

  .db-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 80px;
    border-bottom: 1px solid rgba(139,0,0,0.2);
    background: rgba(5,5,7,0.95);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .nav-brand {
    font-family: 'Cinzel', serif;
    font-size: 26px;
    font-weight: 700;
    color: #e8e0d5;
    letter-spacing: 4px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-brand-dot {
    width: 6px;
    height: 6px;
    background: #8b0000;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .nav-email {
    font-size: 16px;
    color: rgba(255,255,255,0.25);
    font-style: italic;
  }

  .btn-logout {
    background: none;
    border: 1px solid rgba(139,0,0,0.3);
    padding: 10px 24px;
    color: rgba(200,169,126,0.6);
    font-family: 'Cinzel', serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 1px;
    transition: all 0.3s;
  }

  .btn-logout:hover {
    border-color: rgba(139,0,0,0.6);
    color: #c8a97e;
  }

  .db-body {
    display: flex;
    flex: 1;
  }

  .db-sidebar {
    width: 380px;
    border-right: 1px solid rgba(139,0,0,0.15);
    padding: 32px 24px;
    flex-shrink: 0;
    background: rgba(8,8,10,0.8);
  }

  .sidebar-title {
    font-family: 'Cinzel', serif;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(139,0,0,0.7);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(139,0,0,0.15);
  }

  .group-card {
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 1px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    animation: slideIn 0.4s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .group-card:hover, .group-card.active {
    border-color: rgba(139,0,0,0.4);
    background: rgba(139,0,0,0.05);
  }

  .group-card.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #8b0000;
  }

  .group-name {
    font-size: 20px;
    color: #e8e0d5;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .group-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .group-code {
    font-size: 13px;
    color: rgba(139,0,0,0.6);
    letter-spacing: 2px;
    font-family: 'Cinzel', serif;
  }

  .group-members {
    font-size: 13px;
    color: rgba(255,255,255,0.2);
  }

  .btn-new-group {
    width: 100%;
    margin-top: 16px;
    padding: 16px;
    background: transparent;
    border: 1px dashed rgba(139,0,0,0.3);
    border-radius: 1px;
    color: rgba(139,0,0,0.6);
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-new-group:hover {
    border-color: rgba(139,0,0,0.6);
    color: #c8a97e;
    background: rgba(139,0,0,0.04);
  }

  .db-main {
    flex: 1;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }

  .bg-grid-main {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139,0,0,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,0,0,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    position: relative;
    z-index: 1;
    animation: fadeIn 0.6s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-icon {
    width: 60px;
    height: 60px;
    border: 1px solid rgba(139,0,0,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(139,0,0,0.05);
  }

  .empty-title {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 2px;
    margin-bottom: 10px;
  }

  .empty-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.15);
    font-style: italic;
  }

  .group-detail {
    position: relative;
    z-index: 1;
    animation: fadeIn 0.4s ease;
    height: 100%;
  }

  .detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .detail-name {
    font-family: 'Cinzel', serif;
    font-size: 36px;
    font-weight: 700;
    color: #e8e0d5;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  .detail-invite {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .invite-label {
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 1px;
    font-family: 'Cinzel', serif;
    text-transform: uppercase;
  }

  .invite-code {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    color: #c8a97e;
    letter-spacing: 4px;
    background: rgba(139,0,0,0.08);
    border: 1px solid rgba(139,0,0,0.2);
    padding: 4px 12px;
    border-radius: 1px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .invite-code:hover {
    background: rgba(139,0,0,0.15);
    border-color: rgba(139,0,0,0.4);
  }

  .copied-tip {
    font-size: 11px;
    color: rgba(100,200,130,0.7);
    font-style: italic;
  }

  .detail-actions {
    display: flex;
    gap: 10px;
  }

  .btn-action {
    padding: 14px 28px;
    border-radius: 1px;
    font-family: 'Cinzel', serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-chat {
    background: #8b0000;
    border: none;
    color: #e8e0d5;
  }

  .btn-chat:hover { background: #a00000; }

  .btn-leave {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.3);
  }

  .btn-leave:hover {
    border-color: rgba(255,100,100,0.3);
    color: rgba(255,100,100,0.6);
  }

  .members-title {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(139,0,0,0.6);
    margin-bottom: 16px;
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .member-card {
    padding: 14px 16px;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 1px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.2s;
  }

  .member-card:hover { border-color: rgba(139,0,0,0.25); }

  .member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(139,0,0,0.15);
    border: 1px solid rgba(139,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: rgba(139,0,0,0.7);
    font-family: 'Cinzel', serif;
    flex-shrink: 0;
  }

  .member-token {
    font-size: 13px;
    color: rgba(232,224,213,0.75);
    font-family: 'Crimson Pro', Georgia, serif;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: color 0.2s;
    user-select: none;
  }

  .member-token:hover {
    color: #c8a97e;
  }

  .member-reroll-hint {
    font-size: 9px;
    color: rgba(139,0,0,0.45);
    letter-spacing: 1px;
    font-family: 'Cinzel', serif;
    margin-top: 1px;
    cursor: pointer;
    user-select: none;
  }

  .member-role {
    font-size: 9px;
    color: rgba(139,0,0,0.6);
    letter-spacing: 1px;
    font-family: 'Cinzel', serif;
    text-transform: uppercase;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: fadeIn 0.2s ease;
  }

  .modal {
    width: 420px;
    background: #0d0d10;
    border: 1px solid rgba(139,0,0,0.3);
    border-radius: 2px;
    padding: 40px;
    position: relative;
  }

  .modal-corner { position: absolute; width: 12px; height: 12px; border-color: rgba(139,0,0,0.5); border-style: solid; }
  .modal-ctl { top:-1px; left:-1px; border-width: 2px 0 0 2px; }
  .modal-ctr { top:-1px; right:-1px; border-width: 2px 2px 0 0; }
  .modal-cbl { bottom:-1px; left:-1px; border-width: 0 0 2px 2px; }
  .modal-cbr { bottom:-1px; right:-1px; border-width: 0 2px 2px 0; }

  .modal-title {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #e8e0d5;
    margin-bottom: 24px;
  }

  .modal-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border: 1px solid rgba(139,0,0,0.2);
    border-radius: 1px;
    overflow: hidden;
  }

  .modal-tab {
    flex: 1;
    padding: 9px;
    background: none;
    border: none;
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    color: rgba(255,255,255,0.25);
    transition: all 0.2s;
  }

  .modal-tab.active {
    background: rgba(139,0,0,0.15);
    color: #c8a97e;
  }

  .modal-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1px;
    padding: 12px 14px;
    color: #e8e0d5;
    font-size: 15px;
    font-family: 'Crimson Pro', serif;
    outline: none;
    margin-bottom: 16px;
    transition: border-color 0.3s;
  }

  .modal-input:focus { border-color: rgba(139,0,0,0.5); }
  .modal-input::placeholder { color: rgba(255,255,255,0.15); }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-confirm {
    flex: 1;
    padding: 12px;
    background: #8b0000;
    border: none;
    border-radius: 1px;
    color: #e8e0d5;
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-confirm:hover { background: #a00000; }
  .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-cancel {
    padding: 12px 20px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1px;
    color: rgba(255,255,255,0.3);
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.5); }

  .modal-msg {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 1px;
    font-size: 13px;
    font-style: italic;
  }

  .modal-msg.error { background: rgba(139,0,0,0.1); border: 1px solid rgba(139,0,0,0.25); color: #e07070; }
  .modal-msg.success { background: rgba(0,80,50,0.1); border: 1px solid rgba(0,150,80,0.2); color: #70c090; }

  .loading-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.2);
    font-size: 13px;
    font-style: italic;
    padding: 20px 0;
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

  .notif-badge {
    width: 18px;
    height: 18px;
    background: #8b0000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #fff;
    font-family: 'Cinzel', serif;
  }
`;

export default function Dashboard({ user, onLogout, onEnterChat }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchGroups(); fetchUnread(); }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { ok, data } = await apiFetch("/groups/my-groups");
    if (ok) setGroups(data);
    setLoading(false);
  };

  const fetchUnread = async () => {
    const { ok, data } = await apiFetch("/notifications/unread");
    if (ok) setUnreadCount(data.length);
  };

  const fetchMembers = async (groupId) => {
    setMembersLoading(true);
    const { ok, data } = await apiFetch(`/groups/${groupId}/members`);
    if (ok) setMembers(data);
    setMembersLoading(false);
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    fetchMembers(group.id);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { setMsg({ type: "error", text: "Group name is required" }); return; }
    setLoading(true);
    const { ok, data } = await apiFetch("/groups/create", {
      method: "POST",
      body: JSON.stringify({ groupName }),
    });
    if (ok) {
      setGroups((prev) => [data, ...prev]);
      setMsg({ type: "success", text: `Group "${data.groupName}" created!` });
      setGroupName("");
      setTimeout(() => { setShowModal(false); setMsg(null); }, 1500);
    } else {
      setMsg({ type: "error", text: data });
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { setMsg({ type: "error", text: "Invite code is required" }); return; }
    setLoading(true);
    const { ok, data } = await apiFetch("/groups/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
    if (ok) {
      setGroups((prev) => [data, ...prev]);
      setMsg({ type: "success", text: `Joined "${data.groupName}"!` });
      setInviteCode("");
      setTimeout(() => { setShowModal(false); setMsg(null); }, 1500);
    } else {
      setMsg({ type: "error", text: data });
    }
    setLoading(false);
  };

  const openModal = () => {
    setShowModal(true);
    setMsg(null);
    setGroupName("");
    setInviteCode("");
    setModalTab("create");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* Navbar */}
        <nav className="db-nav">
          <div className="nav-brand">
            <div className="nav-brand-dot" />
            Leakly
          </div>
          <div className="nav-right">
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount}</div>
            )}
            <span className="nav-email">{user?.email || "anonymous"}</span>
            <button className="btn-logout" onClick={onLogout}>Sign out</button>
          </div>
        </nav>

        <div className="db-body">

          {/* Sidebar */}
          <aside className="db-sidebar">
            <div className="sidebar-title">Your Circles</div>

            {loading && (
              <div className="loading-row">
                <div className="spinner" /> Loading groups...
              </div>
            )}

            {!loading && groups.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.15)", fontStyle: "italic", marginBottom: 16 }}>
                You haven't joined any circles yet.
              </p>
            )}

            {groups.map((g) => (
              <div
                key={g.id}
                className={`group-card ${selectedGroup?.id === g.id ? "active" : ""}`}
                onClick={() => selectGroup(g)}
              >
                <div className="group-name">{g.groupName}</div>
                <div className="group-meta">
                  <span className="group-code">{g.inviteCode}</span>
                  <span className="group-members">{g.memberCount} members</span>
                </div>
              </div>
            ))}

            <button className="btn-new-group" onClick={openModal}>
              + Create or Join
            </button>
          </aside>

          {/* Main Content */}
          <main className="db-main" style={selectedGroup ? { padding: 0 } : {}}>
            <div className="bg-grid-main" />

            {!selectedGroup ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(139,0,0,0.5)">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <div className="empty-title">No circle selected</div>
                <div className="empty-sub">Choose a circle or create a new one to begin whispering</div>
              </div>
            ) : (
              <GroupOrbitDetail
                group={{
                  ...selectedGroup,
                  name: selectedGroup.groupName,
                  members: membersLoading ? [] : members,
                }}
                onEnterChat={() => onEnterChat && onEnterChat(selectedGroup)}
                onBack={() => setSelectedGroup(null)}
              />
            )}
          </main>
        </div>

        {/* Create / Join Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-corner modal-ctl" />
              <div className="modal-corner modal-ctr" />
              <div className="modal-corner modal-cbl" />
              <div className="modal-corner modal-cbr" />

              <div className="modal-title">Join the whispers</div>

              <div className="modal-tabs">
                <button
                  className={`modal-tab ${modalTab === "create" ? "active" : ""}`}
                  onClick={() => { setModalTab("create"); setMsg(null); }}
                >
                  Create Circle
                </button>
                <button
                  className={`modal-tab ${modalTab === "join" ? "active" : ""}`}
                  onClick={() => { setModalTab("join"); setMsg(null); }}
                >
                  Join Circle
                </button>
              </div>

              {modalTab === "create" ? (
                <>
                  <input
                    className="modal-input"
                    placeholder="Circle name (e.g. CSE-A Rumours)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <div className="modal-actions">
                    <button className="btn-confirm" onClick={handleCreate} disabled={loading}>
                      {loading ? "Creating..." : "Create"}
                    </button>
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    className="modal-input"
                    placeholder="Enter invite code (e.g. AB12CD34)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    style={{ letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}
                  />
                  <div className="modal-actions">
                    <button className="btn-confirm" onClick={handleJoin} disabled={loading}>
                      {loading ? "Joining..." : "Join"}
                    </button>
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </>
              )}

              {msg && <div className={`modal-msg ${msg.type}`}>{msg.text}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, LayoutDashboard, FileWarning, Home, X, AlertTriangle } from "lucide-react";
import { useIssues } from "../context/IssueContext";

export default function Navbar({ page, setPage }) {
  const { notifications, stats } = useIssues();
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nav = [
    { id: "home", label: "Home", icon: Home },
    { id: "report", label: "Report Issue", icon: FileWarning },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled ? "rgba(7,9,18,0.95)" : "rgba(7,9,18,0.7)",
      backdropFilter: "blur(24px)",
      borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#ef4444,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(239,68,68,0.4)" }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.5px", color: "#f1f5f9" }}>
            Relief<span style={{ color: "#ef4444" }}>Link</span>
            <span style={{ fontSize: 11, fontWeight: 600, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginLeft: 4 }}>AI+</span>
          </span>
        </button>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "Inter,sans-serif",
              background: page === id ? "rgba(99,102,241,0.15)" : "transparent",
              color: page === id ? "#818cf8" : "rgba(255,255,255,0.5)",
              transition: "all 0.2s",
            }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {stats.critical > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "4px 12px", animation: "glow-pulse 2s ease-in-out infinite" }}>
              <AlertTriangle size={12} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{stats.critical} Critical</span>
            </div>
          )}

          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(v => !v)} style={{ position: "relative", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", transition: "all 0.2s" }}>
              <Bell size={16} />
              <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {notifications.length}
              </span>
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.18 }}
                  style={{ position: "absolute", top: 46, right: 0, width: 310, background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 999, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>🔔 Alerts</span>
                    <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={14} /></button>
                  </div>
                  {notifications.slice(0, 5).map((n, i) => (
                    <div key={n.id} style={{ padding: "12px 16px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, background: n.level === "critical" ? "#ef4444" : n.level === "resolved" ? "#22c55e" : "#f97316", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{n.msg}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setPage("report")} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
            + Report
          </button>
        </div>
      </div>
    </header>
  );
}

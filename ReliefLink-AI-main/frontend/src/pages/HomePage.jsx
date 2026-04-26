import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Brain, Activity } from "lucide-react";
import { useIssues } from "../context/IssueContext";
import IssueCard from "../components/IssueCard";
import StatsRow from "../components/StatsRow";

const PREDICTIONS = [
  { risk: "Flood Risk", area: "Sectors 12 & 13", prob: 78, icon: "🌊", color: "#3b82f6" },
  { risk: "Food Shortage", area: "Relief Camps A & B", prob: 65, icon: "🍽️", color: "#f97316" },
  { risk: "Disease Outbreak", area: "North District", prob: 42, icon: "🦠", color: "#ec4899" },
];

export default function HomePage({ setPage }) {
  const { issues, stats } = useIssues();
  const urgentIssues = issues.filter(i => i.priority === "High" && i.status !== "Resolved");

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        style={{ padding: "80px 0 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}>LIVE — {stats.active} Active Incidents</span>
        </div>

        <h1 style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 20px" }}>
          Disaster Response,<br />
          <span className="gradient-text">Reimagined by AI</span>
        </h1>

        <p style={{ fontSize: 17, color: "#64748b", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          ReliefLink AI+ classifies community issues instantly, assigns the best volunteers, and predicts crises before they escalate.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="btn-danger" onClick={() => setPage("report")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 32px", fontSize: 15 }}>
            <Zap size={16} /> Report an Issue <ArrowRight size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="btn-ghost" onClick={() => setPage("dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", fontSize: 15 }}>
            <Activity size={16} /> View Dashboard
          </motion.button>
        </div>
      </motion.div>

      {/* STATS */}
      <div style={{ marginBottom: 32 }}>
        <StatsRow stats={stats} />
      </div>

      {/* CRITICAL ALERTS BANNER */}
      {urgentIssues.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.08))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "18px 20px", marginBottom: 28, animation: "glow-pulse 3s ease-in-out infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Shield size={16} color="#ef4444" />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#ef4444", textTransform: "uppercase", letterSpacing: 1 }}>Critical Alerts</span>
            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{urgentIssues.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {urgentIssues.slice(0, 2).map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} compact />
            ))}
          </div>
        </motion.div>
      )}

      {/* BOTTOM GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Live Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" />
              <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>Live Feed</span>
            </div>
            <button onClick={() => setPage("dashboard")} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
              View all →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {issues.slice(0, 4).map((issue, i) => <IssueCard key={issue.id} issue={issue} index={i} compact />)}
          </div>
        </motion.div>

        {/* Risk Predictions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Brain size={16} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>AI Risk Predictions</span>
          </div>
          {PREDICTIONS.map((p, i) => (
            <motion.div key={p.risk} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              style={{ marginBottom: i < PREDICTIONS.length - 1 ? 18 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                  {p.icon} {p.risk}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: p.prob > 70 ? "#ef4444" : p.prob > 50 ? "#f97316" : "#eab308" }}>
                  {p.prob}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>{p.area}</div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.prob}%` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)`, borderRadius: 99 }}
                />
              </div>
            </motion.div>
          ))}

          {/* AI Insight */}
          <div style={{ marginTop: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>🧠 AI Insight</div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              High flood risk in eastern sectors. Recommend pre-positioning relief teams at Sector 12 within 2 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

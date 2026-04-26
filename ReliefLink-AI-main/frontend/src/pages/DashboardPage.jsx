import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Brain, Filter, RefreshCw, Activity, TrendingUp } from "lucide-react";
import { useIssues } from "../context/IssueContext";
import IssueCard from "../components/IssueCard";
import StatsRow from "../components/StatsRow";

const FILTERS = ["All", "High", "Medium", "Low"];
const STATUS_FILTERS = ["All", "Pending", "In Progress", "Resolved"];

const CATEGORY_DIST = [
  { label: "Disaster", value: 40, color: "#3b82f6" },
  { label: "Food", value: 25, color: "#f97316" },
  { label: "Healthcare", value: 20, color: "#ec4899" },
  { label: "Education", value: 15, color: "#a78bfa" },
];

const AI_INSIGHTS = [
  { icon: "🌊", text: "Flood risk elevated in eastern sectors — 3 active reports in last 2 hours.", level: "critical" },
  { icon: "🍽️", text: "Food shortage trend rising. Ration requests up 3× since yesterday.", level: "warning" },
  { icon: "✅", text: "Healthcare response time improved by 18% this week.", level: "positive" },
];

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.value}%</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 80}px` }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" }}
            style={{ width: "100%", background: `linear-gradient(180deg, ${d.color}, ${d.color}55)`, borderRadius: "6px 6px 0 0", minHeight: 4, cursor: "default", position: "relative" }}
            whileHover={{ scale: 1.05 }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "6px 6px 0 0", opacity: 0, transition: "opacity 0.2s" }} />
          </motion.div>
          <span style={{ fontSize: 9, color: "#475569", textAlign: "center", fontWeight: 500 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityStream({ issues }) {
  const [stream, setStream] = useState(issues.slice(0, 5));

  useEffect(() => {
    setStream(issues.slice(0, 8));
  }, [issues]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <AnimatePresence initial={false}>
        {stream.map((issue, i) => {
          const isNew = i === 0 && Date.now() - (issue.ts || 0) < 5000;
          return (
            <motion.div key={issue.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: isNew ? "rgba(99,102,241,0.04)" : "transparent",
              }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: issue.priority === "High" ? "#ef4444" : issue.priority === "Medium" ? "#f97316" : "#22c55e",
                boxShadow: issue.priority === "High" ? "0 0 8px rgba(239,68,68,0.6)" : "none",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.title}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{issue.location} · {issue.status}</div>
              </div>
              {isNew && (
                <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>NEW</span>
              )}
              <span style={{ fontSize: 10, color: "#334155", flexShrink: 0 }}>
                {issue.ts ? (Date.now() - issue.ts < 60000 ? "Just now" : `${Math.floor((Date.now() - issue.ts) / 60000)}m`) : issue.time || ""}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage({ setPage }) {
  const { issues, stats, updateStatus } = useIssues();
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = issues.filter(i =>
    (priorityFilter === "All" || i.priority === priorityFilter) &&
    (statusFilter === "All" || i.status === statusFilter)
  );

  const urgentIssues = issues.filter(i => i.priority === "High" && i.status !== "Resolved");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Operations Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: "#64748b" }}>Live · {issues.length} total issues tracked</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh}
            className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px" }}>
            <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6 }}>
              <RefreshCw size={13} />
            </motion.span>
            Refresh
          </motion.button>
          <button onClick={() => setPage("report")} className="btn-danger" style={{ padding: "9px 18px", fontSize: 13 }}>
            + New Report
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ marginBottom: 24 }}>
        <StatsRow stats={stats} />
      </div>

      {/* Critical Alerts Panel */}
      {urgentIssues.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.1),rgba(249,115,22,0.06))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "18px 20px", marginBottom: 24, animation: "glow-pulse 3s ease-in-out infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Shield size={15} color="#ef4444" />
            <span style={{ fontWeight: 700, fontSize: 12, color: "#ef4444", textTransform: "uppercase", letterSpacing: 1 }}>Critical Alerts</span>
            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>{urgentIssues.length} Active</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {urgentIssues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} compact />
            ))}
          </div>
        </motion.div>
      )}

      {/* Middle row: Chart + AI Insights + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <Activity size={14} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: 12, color: "#e2e8f0" }}>Category Breakdown</span>
          </div>
          <BarChart data={CATEGORY_DIST} />
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Brain size={14} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: 12, color: "#e2e8f0" }}>AI Insights</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AI_INSIGHTS.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: insight.level === "critical" ? "rgba(239,68,68,0.08)" : insight.level === "warning" ? "rgba(249,115,22,0.08)" : "rgba(34,197,94,0.08)",
                  border: `1px solid ${insight.level === "critical" ? "rgba(239,68,68,0.2)" : insight.level === "warning" ? "rgba(249,115,22,0.2)" : "rgba(34,197,94,0.2)"}`,
                }}>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  <span style={{ marginRight: 6 }}>{insight.icon}</span>{insight.text}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Stream */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <span className="live-dot" />
            <span style={{ fontWeight: 700, fontSize: 12, color: "#e2e8f0" }}>Activity Stream</span>
          </div>
          <ActivityStream issues={issues} />
        </motion.div>
      </div>

      {/* Issue Feed with filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={14} color="#64748b" />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>All Issues</span>
            <span style={{ fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20 }}>{filtered.length}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Priority filters */}
            <div style={{ display: "flex", gap: 4 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setPriorityFilter(f)}
                  style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${priorityFilter === f ? "#6366f1" : "rgba(255,255,255,0.07)"}`, background: priorityFilter === f ? "rgba(99,102,241,0.15)" : "transparent", color: priorityFilter === f ? "#818cf8" : "#64748b", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
            {/* Status filters */}
            <div style={{ display: "flex", gap: 4 }}>
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${statusFilter === f ? "#6366f1" : "rgba(255,255,255,0.07)"}`, background: statusFilter === f ? "rgba(99,102,241,0.15)" : "transparent", color: statusFilter === f ? "#818cf8" : "#64748b", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 600 }}>No issues match your filter</div>
              </div>
            ) : (
              filtered.map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { MapPin, Clock, User, Flame, Droplets, Utensils, Heart, BookOpen, ChevronRight } from "lucide-react";

const CATEGORY_META = {
  Disaster: { icon: Droplets, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Food: { icon: Utensils, color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  Healthcare: { icon: Heart, color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  Education: { icon: BookOpen, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  Shelter: { icon: Flame, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const PRIORITY_CLASSES = {
  High: "badge-critical",
  Medium: "badge-medium",
  Low: "badge-low",
};

const STATUS_CLASSES = {
  "Pending": "badge-pending",
  "In Progress": "badge-inprogress",
  "Resolved": "badge-resolved",
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function IssueCard({ issue, index = 0, compact = false }) {
  const meta = CATEGORY_META[issue.category] || CATEGORY_META.Disaster;
  const Icon = meta.icon;
  const isUrgent = issue.priority === "High" && issue.status !== "Resolved";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card"
      style={{
        padding: compact ? "14px 16px" : "20px",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        borderColor: isUrgent ? "rgba(239,68,68,0.2)" : undefined,
      }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      {/* Urgency glow strip */}
      {isUrgent && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#ef4444,#f97316)", borderRadius: "16px 0 0 16px" }} />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Category icon */}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={meta.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: "#f1f5f9", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isUrgent && <span style={{ animation: "blink 1.5s ease-in-out infinite", marginRight: 6 }}>🔴</span>}
              {issue.title}
            </h3>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <span className={PRIORITY_CLASSES[issue.priority]} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                {issue.priority}
              </span>
              <span className={STATUS_CLASSES[issue.status] || "badge-pending"} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                {issue.status}
              </span>
            </div>
          </div>

          {!compact && issue.description && (
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>{issue.description}</p>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={10} color="#475569" /> {issue.location}
            </span>
            {issue.volunteer && (
              <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                <User size={10} color="#475569" /> {issue.volunteer}
              </span>
            )}
            <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
              <Clock size={10} color="#475569" />
              {issue.ts ? timeAgo(issue.ts) : issue.time || ""}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

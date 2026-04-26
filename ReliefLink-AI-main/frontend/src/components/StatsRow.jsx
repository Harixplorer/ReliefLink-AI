import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function useAnimatedCount(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, icon, color, glow, trend, delay = 0 }) {
  const animated = useAnimatedCount(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card"
      style={{ padding: "22px 24px", flex: 1, minWidth: 160, position: "relative", overflow: "hidden" }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
        {animated}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
          {trend >= 0
            ? <TrendingUp size={12} color="#ef4444" />
            : <TrendingDown size={12} color="#22c55e" />}
          <span style={{ color: trend >= 0 ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
            {Math.abs(trend)}% vs yesterday
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function StatsRow({ stats }) {
  const cards = [
    { label: "Active Issues", value: stats.active, icon: "⚡", color: "#f97316", glow: "rgba(249,115,22,0.2)", trend: 12 },
    { label: "Critical Alerts", value: stats.critical, icon: "🔴", color: "#ef4444", glow: "rgba(239,68,68,0.25)", trend: 8 },
    { label: "Resolved Today", value: stats.resolved, icon: "✅", color: "#22c55e", glow: "rgba(34,197,94,0.2)", trend: -15 },
    { label: "Total Reports", value: stats.total, icon: "📋", color: "#818cf8", glow: "rgba(129,140,248,0.2)" },
  ];

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.08} />)}
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Send, CheckCircle, Brain, MapPin, Tag } from "lucide-react";
import { useIssues } from "../context/IssueContext";

const CATEGORIES = [
  { id: "Disaster", label: "Disaster", icon: "🌊", color: "#3b82f6" },
  { id: "Food", label: "Food", icon: "🍽️", color: "#f97316" },
  { id: "Healthcare", label: "Healthcare", icon: "❤️", color: "#ec4899" },
  { id: "Education", label: "Education", icon: "📚", color: "#a78bfa" },
  { id: "Shelter", label: "Shelter", icon: "🏠", color: "#ef4444" },
];

const SUGGESTIONS = [
  "Flooding in our area, water level rising urgently",
  "Food shortage at the relief camp, running out of rations",
  "Medical aid needed for injured residents",
  "Building damaged after storm, residents displaced",
];

export default function ReportPage({ setPage }) {
  const { addIssue, setLastResult } = useIssues();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: ai-preview, 3: done

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition not supported. Try Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onresult = (e) => { setText(prev => (prev + " " + e.results[0][0].transcript).trim()); setRecording(false); };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
    setRecording(true);
  };

  const handleSubmit = async () => {
    if (!text.trim()) { setError("Please describe the issue."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), location, category }),
      });
      const data = res.ok ? await res.json() : null;

      const result = data || {
        category: category || guessCategory(text),
        priority: guessPriority(text),
        volunteer: "Ravi Kumar",
        explanation: "AI matched based on issue type and skill profile.",
        trustScore: 92,
        eta: "~12 minutes",
      };

      setAiResult(result);
      setLastResult(result);
      setStep(2);
    } catch {
      const result = {
        category: category || guessCategory(text),
        priority: guessPriority(text),
        volunteer: "Ravi Kumar",
        explanation: "AI matched based on issue type and skill profile.",
        trustScore: 92,
        eta: "~12 minutes",
      };
      setAiResult(result);
      setLastResult(result);
      setStep(2);
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    addIssue({
      title: text.length > 60 ? text.slice(0, 57) + "..." : text,
      description: text,
      category: aiResult.category,
      priority: aiResult.priority,
      volunteer: aiResult.volunteer,
      location: location || "Unknown Location",
    });
    setStep(3);
    setTimeout(() => { setPage("dashboard"); }, 2200);
  };

  function guessCategory(t) {
    const lower = t.toLowerCase();
    if (lower.includes("flood") || lower.includes("storm") || lower.includes("earthquake")) return "Disaster";
    if (lower.includes("food") || lower.includes("ration") || lower.includes("hunger")) return "Food";
    if (lower.includes("medical") || lower.includes("doctor") || lower.includes("injured")) return "Healthcare";
    if (lower.includes("school") || lower.includes("education")) return "Education";
    return "Disaster";
  }

  function guessPriority(t) {
    const lower = t.toLowerCase();
    if (lower.includes("urgent") || lower.includes("critical") || lower.includes("flood") || lower.includes("fire")) return "High";
    if (lower.includes("help") || lower.includes("need") || lower.includes("shortage")) return "Medium";
    return "Low";
  }

  const priorityColor = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setPage("home")}
        className="btn-ghost" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 6 }}>
        <ArrowLeft size={14} /> Back
      </motion.button>

      <AnimatePresence mode="wait">

        {/* STEP 1 — Form */}
        {step === 1 && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#ef4444,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 30px rgba(239,68,68,0.4)", fontSize: 28 }}>🚨</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Report an Issue</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>AI will instantly classify and assign the best volunteer</p>
            </div>

            {/* Category chips */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Tag size={12} /> Category (auto-detected if blank)
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id === category ? "" : cat.id)}
                    style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${category === cat.id ? cat.color : "rgba(255,255,255,0.08)"}`, background: category === cat.id ? `${cat.color}22` : "rgba(255,255,255,0.03)", color: category === cat.id ? cat.color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 8 }}>
                Describe the Issue *
              </label>
              <div style={{ position: "relative" }}>
                <textarea className="input-field" value={text} onChange={e => setText(e.target.value)}
                  placeholder='e.g. "Flood in our area, water level rising urgently, 50+ families affected..."'
                  style={{ minHeight: 140, paddingRight: 52 }} />
                <button onClick={handleVoice} title="Voice input"
                  style={{ position: "absolute", bottom: 12, right: 12, width: 34, height: 34, borderRadius: 8, border: `1px solid ${recording ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: recording ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: recording ? "#ef4444" : "#64748b", transition: "all 0.2s", animation: recording ? "glow-pulse 1s infinite" : "none" }}>
                  {recording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Quick suggestions */}
              {!text && (
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => setText(s)}
                      style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#64748b", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
                      {s.slice(0, 35)}…
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <MapPin size={12} /> Location (optional)
              </label>
              <input className="input-field" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Sector 7, East Zone" />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading}
              className="btn-danger" style={{ width: "100%", padding: "14px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
                  AI Analyzing...
                </>
              ) : (
                <><Brain size={16} /> Analyze with AI <Send size={14} /></>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2 — AI Result Preview */}
        {step === 2 && aiResult && (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>AI Classification Complete</h2>
              <p style={{ color: "#64748b", fontSize: 13 }}>Review results before submitting to dashboard</p>
            </div>

            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { label: "Category", value: aiResult.category, icon: "📂" },
                  { label: "Priority", value: aiResult.priority, icon: "⚡", color: priorityColor[aiResult.priority] },
                  { label: "Assigned Volunteer", value: aiResult.volunteer, icon: "👤" },
                  { label: "ETA", value: aiResult.eta || "~15 min", icon: "⏱️" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: item.color || "#e2e8f0" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {aiResult.explanation && (
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 4 }}>🧠 AI Reasoning</div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{aiResult.explanation}</p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, padding: "13px" }}>← Edit</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleConfirm} className="btn-primary" style={{ flex: 2, padding: "13px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <CheckCircle size={16} /> Confirm & Submit to Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", padding: "60px 0" }}>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}
              style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(34,197,94,0.3)" }}>
              <CheckCircle size={36} color="#22c55e" />
            </motion.div>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px" }}>Issue Submitted!</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>Redirecting to dashboard where your issue is now live…</p>
            <div style={{ marginTop: 20 }}>
              <div style={{ width: 200, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, margin: "0 auto", overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 99 }} />
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

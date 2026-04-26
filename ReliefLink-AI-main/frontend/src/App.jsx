import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IssueProvider } from "./context/IssueContext";
import Navbar from "./components/Navbar";
import ParticleBackground from "./components/ParticleBackground";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import DashboardPage from "./pages/DashboardPage";
import "./index.css";

function AppShell() {
  const [page, setPage] = useState("home");

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <ParticleBackground />

      {/* Ambient radial glow blobs */}
      <div style={{ position: "fixed", top: "15%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "50%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar page={page} setPage={setPage} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "88px 24px 60px" }}>
        <AnimatePresence mode="wait">
          {page === "home" && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <HomePage setPage={setPage} />
            </motion.div>
          )}
          {page === "report" && (
            <motion.div key="report" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ReportPage setPage={setPage} />
            </motion.div>
          )}
          {page === "dashboard" && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <DashboardPage setPage={setPage} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "20px 24px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "#334155" }}>
          ReliefLink AI+ · Powered by AI · Built for Community Resilience
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <IssueProvider>
      <AppShell />
    </IssueProvider>
  );
}

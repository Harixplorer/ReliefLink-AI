import { createContext, useContext, useState, useCallback } from "react";

const IssueContext = createContext(null);

const SEED_ISSUES = [
  {
    id: 1, title: "Flood in Sector 7", description: "Water level rising rapidly, residents stranded on rooftops.",
    category: "Disaster", priority: "High", status: "In Progress",
    location: "Sector 7, East Zone", volunteer: "Ravi Kumar", ts: Date.now() - 120000,
  },
  {
    id: 2, title: "Food shortage at shelter", description: "Relief camp B running critically low on rations.",
    category: "Food", priority: "Medium", status: "Pending",
    location: "Relief Camp B", volunteer: "Anjali Sharma", ts: Date.now() - 900000,
  },
  {
    id: 3, title: "Medical aid needed urgently", description: "Multiple injured residents require immediate attention.",
    category: "Healthcare", priority: "High", status: "In Progress",
    location: "North District", volunteer: "Dr. Priya", ts: Date.now() - 1920000,
  },
  {
    id: 4, title: "School building damaged", description: "Roof collapsed after storm, classes suspended.",
    category: "Education", priority: "Low", status: "Resolved",
    location: "Village Ramnagar", volunteer: "Mohan Das", ts: Date.now() - 3600000,
  },
  {
    id: 5, title: "Bridge collapse on NH-48", description: "Major arterial route blocked, emergency diversion needed.",
    category: "Disaster", priority: "High", status: "Pending",
    location: "NH-48 Junction", volunteer: "Ravi Kumar", ts: Date.now() - 10800000,
  },
];

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [lastResult, setLastResult] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, msg: "HIGH PRIORITY: Flood in Sector 7", time: "2 min ago", level: "critical" },
    { id: 2, msg: "Bridge collapse reported — NH-48", time: "3 hr ago", level: "high" },
    { id: 3, msg: "Issue #4 resolved by Mohan Das", time: "1 hr ago", level: "resolved" },
  ]);

  const addIssue = useCallback((newIssue) => {
    const issue = {
      id: Date.now(),
      ts: Date.now(),
      status: "Pending",
      location: newIssue.location || "Unknown Location",
      ...newIssue,
    };
    setIssues(prev => [issue, ...prev]);
    setNotifications(prev => [
      { id: Date.now(), msg: `New ${issue.priority} issue: ${issue.title}`, time: "Just now", level: issue.priority === "High" ? "critical" : "high" },
      ...prev.slice(0, 9),
    ]);
    return issue;
  }, []);

  const updateStatus = useCallback((id, status) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }, []);

  const stats = {
    active: issues.filter(i => i.status !== "Resolved").length,
    resolved: issues.filter(i => i.status === "Resolved").length,
    critical: issues.filter(i => i.priority === "High" && i.status !== "Resolved").length,
    total: issues.length,
  };

  return (
    <IssueContext.Provider value={{ issues, addIssue, updateStatus, lastResult, setLastResult, notifications, stats }}>
      {children}
    </IssueContext.Provider>
  );
}

export const useIssues = () => useContext(IssueContext);

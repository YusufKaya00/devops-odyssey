import { useState, useEffect } from 'react';
import {
  roadmapModules,
  devopsBooks,
  devopsTools
} from './data/roadmapData';
import type { ModuleData, Quest } from './data/roadmapData';

interface LevelInfo {
  level: number;
  title: string;
  nextLevelXp: number;
}

interface UserData {
  completedQuests: string[];
  experiencePoints: number;
  streak: number;
  lastActiveDate: string | null;
  levelInfo: LevelInfo;
  hostOS?: string;
  storageMode?: string;
}

// Inline SVG Icon components for zero-dependency high-fidelity renders
const Icons = {
  GitBranch: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
  ),
  Code: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  ),
  Terminal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  ),
  Server: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"></polygon><polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"></polygon><polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12"></polygon></svg>
  ),
  Box: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  ),
  Layers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
  ),
  Activity: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  ),
  Cloud: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Award: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
  ),
  ExternalLink: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
  ),
  BookOpen: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  WindowsLogo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.101zM11.25 1.89l12.75-1.89v11.45h-12.75V1.89zM11.25 12.45H24v11.45l-12.75-1.89v-9.56z"/></svg>
  ),
  LinuxLogo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.08 0-.15.01-.23.03C8.42 2.72 6.88 5.76 6.88 7.37c0 .6.11 1.25.32 1.86-.3.12-.59.27-.85.45-.63.42-1.07 1-1.31 1.69-.32.9-.17 1.89.4 2.7.27.38.61.69.99.92-.02.13-.03.26-.03.39 0 1.27.53 2.5 1.46 3.4.15.15.31.3.48.42-.08.38-.13.78-.13 1.18 0 1.7 1 3.08 2.65 3.53C11.22 23.95 11.61 24 12 24c.39 0 .78-.05 1.14-.15 1.65-.45 2.65-1.83 2.65-3.53 0-.4-.05-.8-.13-1.18.17-.12.33-.27.48-.42.93-.9 1.46-2.13 1.46-3.4 0-.13-.01-.26-.03-.39.38-.23.72-.54.99-.92.57-.81.72-1.8.4-2.7-.24-.69-.68-1.27-1.31-1.69-.26-.18-.55-.33-.85-.45.21-.61.32-1.26.32-1.86 0-1.61-1.54-4.65-4.89-5.34-.08-.02-.15-.03-.23-.03z"/></svg>
  )
};

const renderModuleIcon = (iconName: string) => {
  switch (iconName) {
    case 'git-branch': return <Icons.GitBranch />;
    case 'code': return <Icons.Code />;
    case 'terminal': return <Icons.Terminal />;
    case 'shield': return <Icons.Shield />;
    case 'server': return <Icons.Server />;
    case 'package': return <Icons.Package />;
    case 'box': return <Icons.Box />;
    case 'layers': return <Icons.Layers />;
    case 'activity': return <Icons.Activity />;
    case 'cloud': return <Icons.Cloud />;
    case 'users': return <Icons.Users />;
    default: return <Icons.Code />;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<string | number>('dashboard');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // OS Tab Selection inside Quests panel
  const [selectedOS, setSelectedOS] = useState<'Windows' | 'Linux'>('Windows');

  // Load User Stats & Config
  const loadStatus = async () => {
    try {
      setApiError(null);
      const res = await fetch('http://localhost:5001/api/status');
      if (!res.ok) {
        throw new Error(`Failed to contact local backend server (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setUserData(data);
      
      // Auto-detect OS of backend
      if (data.hostOS) {
        if (data.hostOS === 'win32') {
          setSelectedOS('Windows');
        } else {
          setSelectedOS('Linux');
        }
      }
    } catch (e: any) {
      console.error(e);
      setApiError('Ensure that the Express server is running. Launch via `npm run dev`.');
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const totalQuestsCount = roadmapModules.reduce((acc, mod) => acc + mod.quests.length, 0);
  const completedCount = userData?.completedQuests.length || 0;
  const progressPercent = totalQuestsCount > 0 ? Math.round((completedCount / totalQuestsCount) * 100) : 0;

  // Verify Action
  const handleVerify = async (quest: Quest) => {
    if (!userData) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('http://localhost:5001/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validatorKey: quest.validatorKey,
          difficulty: quest.difficulty
        })
      });
      const result = await res.json();
      setVerifyResult({
        success: result.success,
        message: result.message
      });
      if (result.success && result.data) {
        setUserData(result.data);
      }
    } catch (e: any) {
      setVerifyResult({
        success: false,
        message: 'Could not connect to the verification server. Ensure the backend is active.'
      });
    } finally {
      setVerifying(false);
    }
  };

  // Reset Progress
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all your learning progress? This cannot be undone.")) return;
    try {
      const res = await fetch('http://localhost:5001/api/reset', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setUserData(result.data);
        setActiveQuest(null);
        setVerifyResult(null);
      }
    } catch (e) {
      alert("Error resetting progress.");
    }
  };

  // Module Status
  const getModuleStatus = (module: ModuleData) => {
    if (!userData) return 'NOT_STARTED';
    const moduleQuestKeys = module.quests.map(q => q.validatorKey);
    const completedQuests = moduleQuestKeys.filter(key => userData.completedQuests.includes(key));
    
    if (completedQuests.length === moduleQuestKeys.length) {
      return 'COMPLETED';
    } else if (completedQuests.length > 0) {
      return 'IN_PROGRESS';
    }
    return 'NOT_STARTED';
  };

  // Select Module Action
  const handleModuleClick = (modId: number) => {
    setActiveTab(modId);
    const mod = roadmapModules.find(m => m.id === modId);
    if (mod && mod.quests.length > 0) {
      setActiveQuest(mod.quests[0]);
      setVerifyResult(null);
    } else {
      setActiveQuest(null);
    }
  };

  // Find next recommended quest (First incomplete quest in order)
  const getNextRecommendedQuest = () => {
    if (!userData) return null;
    for (const mod of roadmapModules) {
      for (const quest of mod.quests) {
        if (!userData.completedQuests.includes(quest.validatorKey)) {
          return { module: mod, quest };
        }
      }
    }
    return null; // All completed
  };

  const nextRecommended = getNextRecommendedQuest();

  // Progress metrics by 4 DevOps categories
  const categories = [
    {
      name: "Foundations",
      desc: "Git, Scripting, Linux Basics",
      moduleIds: [1, 2, 3],
      color: "var(--primary)"
    },
    {
      name: "Architecture & Infrastructure",
      desc: "Networking, Web Servers, IaC",
      moduleIds: [4, 5, 8],
      color: "var(--secondary)"
    },
    {
      name: "Containers & Orchestration",
      desc: "Docker, Compose, Kubernetes",
      moduleIds: [6, 7],
      color: "#3b82f6" // Blue
    },
    {
      name: "Operations & Delivery",
      desc: "CI/CD Pipelines, Monitoring, Cloud, Scrum",
      moduleIds: [9, 10, 11, 12],
      color: "var(--success)"
    }
  ];

  const getCategoryProgress = (moduleIds: number[]) => {
    if (!userData) return 0;
    const categoryModules = roadmapModules.filter(m => moduleIds.includes(m.id));
    const categoryQuests = categoryModules.flatMap(m => m.quests);
    const total = categoryQuests.length;
    if (total === 0) return 0;
    const completed = categoryQuests.filter(q => userData.completedQuests.includes(q.validatorKey)).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">Ω</div>
          <div className="logo-text">DevOps Odyssey</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setVerifyResult(null); }}
          >
            <div className="nav-item-left">
              <Icons.Grid />
              <span>Dashboard</span>
            </div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resources'); setVerifyResult(null); }}
          >
            <div className="nav-item-left">
              <Icons.BookOpen />
              <span>Resources Hub</span>
            </div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'burger' ? 'active' : ''}`}
            onClick={() => { setActiveTab('burger'); setVerifyResult(null); }}
          >
            <div className="nav-item-left">
              <Icons.Award />
              <span>DevOps Burger Map</span>
            </div>
          </div>

          <div className="nav-section-title">Roadmap Paths</div>
          
          {roadmapModules.map((mod) => {
            const status = getModuleStatus(mod);
            const isActive = activeTab === mod.id;
            return (
              <div
                key={mod.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleModuleClick(mod.id)}
              >
                <div className="nav-item-left">
                  {renderModuleIcon(mod.icon)}
                  <span>{mod.id}. {mod.title.split(' ')[0]}</span>
                </div>
                <span className={`module-badge ${status === 'COMPLETED' ? 'completed' : ''}`}>
                  {status === 'COMPLETED' ? 'Done' : status === 'IN_PROGRESS' ? '1/2' : '0%'}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary" onClick={loadStatus} style={{ width: '100%' }}>
            <Icons.Refresh /> Refresh Local Check
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset} 
            style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
          >
            Reset Progress
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '40px 60px' }}>
        {apiError && (
          <div className="verify-result error" style={{ margin: 0 }}>
            <Icons.Info />
            <div>
              <strong>Local Server Connection Alert</strong>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="header" style={{ margin: 0 }}>
          <div>
            <h1 className="header-title" style={{ fontSize: '36px' }}>
              {activeTab === 'dashboard' && "Command Center"}
              {activeTab === 'resources' && "Resource Hub"}
              {activeTab === 'burger' && "DevOps Burger Map"}
              {typeof activeTab === 'number' && roadmapModules.find(m => m.id === activeTab)?.title}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'dashboard' && "Track your progress, levels, database syncing, and complete system quests."}
              {activeTab === 'resources' && "A curated collection of industry books, definitions, and web tools."}
              {activeTab === 'burger' && "A delicious layout breaking down DevOps stack layers logically."}
              {typeof activeTab === 'number' && `Module ${activeTab} of 12 • Hands-on Local Sandbox Verification`}
            </p>
          </div>

          {userData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="profile-pill">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{userData.levelInfo.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Level {userData.levelInfo.level} • {userData.experiencePoints} XP
                  </div>
                  <div className="xp-bar-container">
                    <div 
                      className="xp-bar-fill" 
                      style={{ width: `${Math.min(100, (userData.experiencePoints / userData.levelInfo.nextLevelXp) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="streak-counter">
                  <Icons.Flame />
                  <span>{userData.streak} Day Streak</span>
                </div>
              </div>

              {/* Database Status Badge */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: userData.storageMode?.includes('PostgreSQL') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${userData.storageMode?.includes('PostgreSQL') ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-light)'}`
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: userData.storageMode?.includes('PostgreSQL') ? 'var(--success)' : 'var(--primary)'
                }} />
                <span>DB: {userData.storageMode || 'Detecting...'}</span>
              </div>
            </div>
          )}
        </header>

        {/* ------------------- DASHBOARD VIEW (REDESIGNED FOR SPACOUSNESS) ------------------- */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* ROW 1: JOURNEY PROGRESS CHART & NEXT QUEST */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>
              
              {/* Circular Overall Progress Ring */}
              <div className="glass-panel stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: '32px' }}>
                <div>
                  <div className="stat-title" style={{ fontSize: '13px', letterSpacing: '1px' }}>Global Progress</div>
                  <div className="stat-value" style={{ fontSize: '42px', margin: '8px 0' }}>{progressPercent}%</div>
                  <div className="stat-desc" style={{ fontSize: '13px' }}>
                    {completedCount} of {totalQuestsCount} Quests Verified
                  </div>
                </div>
                <div>
                  <svg className="circle-progress-svg" width="130" height="130">
                    <defs>
                      <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                      </linearGradient>
                    </defs>
                    <circle className="circle-progress-bg" cx="65" cy="65" r="52" strokeWidth="10" />
                    <circle 
                      className="circle-progress-bar" 
                      cx="65" 
                      cy="65" 
                      r="52" 
                      strokeWidth="10" 
                      strokeDasharray="326.72"
                      strokeDashoffset={326.72 - (326.72 * progressPercent) / 100}
                      stroke="url(#cyanPurple)"
                    />
                    <text className="circle-progress-text" x="65" y="71" textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: '20px' }}>
                      {progressPercent}%
                    </text>
                  </svg>
                </div>
              </div>

              {/* Recommended Next Step Card */}
              <div className="glass-panel stat-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div>
                  <span style={{
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: 'var(--primary-light)', 
                    background: 'rgba(139, 92, 246, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Next Recommended Target (Sıradaki Öneri)
                  </span>
                  
                  {nextRecommended ? (
                    <div style={{ marginTop: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {nextRecommended.quest.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>Module {nextRecommended.module.id}: {nextRecommended.module.title}</span>
                        <span>•</span>
                        <span className={`quest-diff-badge diff-${nextRecommended.quest.difficulty}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                          {nextRecommended.quest.difficulty}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>
                        Ultimate DevOps Journey Complete! 🎉
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        You have successfully simulated and verified all available roadmap quests.
                      </p>
                    </div>
                  )}
                </div>

                {nextRecommended && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleModuleClick(nextRecommended.module.id)}
                    style={{ alignSelf: 'flex-start', padding: '10px 20px', marginTop: '16px' }}
                  >
                    Start Lab Check
                  </button>
                )}
              </div>

            </div>

            {/* ROW 2: PROGRESS BY 4 DEV-OPS CATEGORIES */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px' }}>Progress Analytics by Sub-discipline</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {categories.map((cat, idx) => {
                  const progress = getCategoryProgress(cat.moduleIds);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{cat.name}</span>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.desc}</p>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: cat.color }}>{progress}%</span>
                      </div>
                      
                      {/* Horizontal progress bar */}
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%', 
                            width: `${progress}%`, 
                            backgroundColor: cat.color,
                            boxShadow: `0 0 10px ${cat.color}`,
                            borderRadius: '4px',
                            transition: 'width 0.8s ease-out'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 3: WHAT I KNOW (KAZANILAN BECERİLER) */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Skills Acquired (Neleri Biliyorum)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Your earned badges based on verified sandbox configurations.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {roadmapModules.map((mod) => {
                  const status = getModuleStatus(mod);
                  const isCompleted = status === 'COMPLETED';
                  const isInProgress = status === 'IN_PROGRESS';
                  
                  if (!isCompleted && !isInProgress) return null;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleModuleClick(mod.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(6, 182, 212, 0.04)',
                        border: `1px ${isCompleted ? 'solid' : 'dashed'} ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        color: isCompleted ? '#a7f3d0' : '#c5f2f7'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {renderModuleIcon(mod.icon)}
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {mod.title.split(' ')[0]} {isCompleted ? 'Expert' : 'Operator'}
                      </span>
                    </div>
                  );
                })}
                
                {completedCount === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px', width: '100%', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '12px' }}>
                    No skills unlocked yet. Initialize your Git Sandbox module to claim your first badge!
                  </div>
                )}
              </div>
            </div>

            {/* ROW 4: SYSTEM MODULES QUICK LINK ACCORDION */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.3px' }}>DevOps Roadmap Modules Quick-Access</h3>
              <div className="modules-grid">
                {roadmapModules.map((mod) => {
                  const status = getModuleStatus(mod);
                  return (
                    <div 
                      key={mod.id} 
                      className="glass-panel module-card"
                      onClick={() => handleModuleClick(mod.id)}
                      style={{ height: '180px', padding: '20px' }}
                    >
                      <div className="module-card-header">
                        <div className="module-card-icon" style={{ width: '36px', height: '36px', borderRadius: '8px', fontSize: '16px' }}>
                          {renderModuleIcon(mod.icon)}
                        </div>
                        <span className={`module-card-status ${
                          status === 'COMPLETED' ? 'status-completed' :
                          status === 'IN_PROGRESS' ? 'status-in-progress' :
                          'status-not-started'
                        }`} style={{ fontSize: '10px', padding: '3px 6px' }}>
                          {status === 'COMPLETED' ? 'Completed' :
                           status === 'IN_PROGRESS' ? 'In Progress' :
                           'Not Started'}
                        </span>
                      </div>

                      <div>
                        <h3 className="module-card-title" style={{ fontSize: '16px', marginTop: '12px' }}>{mod.title}</h3>
                        <p className="module-card-desc" style={{ fontSize: '12px', marginTop: '4px', height: '36px', overflow: 'hidden' }}>{mod.description}</p>
                      </div>

                      <div className="module-card-footer" style={{ fontSize: '11px', marginTop: '8px', paddingTop: '8px' }}>
                        <span>{mod.quests.length} Quest{mod.quests.length > 1 ? 's' : ''}</span>
                        <span>{mod.resources.length} Links</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ------------------- MODULE DETAIL VIEW (INTEGRATING WINDOWS & LINUX COMMANDS TABS) ------------------- */}
        {typeof activeTab === 'number' && (
          (() => {
            const module = roadmapModules.find(m => m.id === activeTab);
            if (!module) return null;
            return (
              <div className="module-view-layout">
                
                {/* LEFT COL: CONTENT THEORY & LAB LIST */}
                <div className="module-detail-left">
                  <div className="glass-panel theory-card">
                    <h2 className="theory-title">Knowledge Base</h2>
                    <p className="theory-text">{module.detailedInfo}</p>
                    
                    <h3 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>Key Reference Links:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {module.resources.map((res, i) => (
                        <a 
                          key={i} 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            textDecoration: 'none',
                            color: 'var(--primary-light)',
                            fontSize: 13,
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icons.ExternalLink /> {res.name}
                          </span>
                          {res.free && <span className="resource-tag" style={{ fontSize: '9px' }}>Free</span>}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 700 }}>Practical Quests</h2>
                    {module.quests.map((q) => {
                      const isCompleted = userData?.completedQuests.includes(q.validatorKey);
                      const isActive = activeQuest?.id === q.id;
                      return (
                        <div
                          key={q.id}
                          className={`quest-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => {
                            setActiveQuest(q);
                            setVerifyResult(null);
                          }}
                        >
                          <div className="quest-meta">
                            <span className="quest-name">
                              {isCompleted && <span style={{ color: 'var(--success)', marginRight: '6px' }}>✓</span>}
                              {q.title}
                            </span>
                            <span className={`quest-diff-badge diff-${q.difficulty}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {isCompleted ? "+ XP Claimed" : `+ ${q.difficulty === 'Beginner' ? '100' : '200'} XP`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT COL: QUEST DETAILS WITH OS SELECTION TABS */}
                <div className="module-detail-right">
                  {activeQuest ? (
                    <div className="glass-panel quest-detail-panel">
                      
                      <div className="quest-detail-title">
                        <Icons.Award />
                        <span>Active Quest: {activeQuest.title}</span>
                      </div>
                      
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        {activeQuest.objective}
                      </p>

                      {/* OS INSTRUCTION TOGGLE TABS */}
                      <div style={{
                        display: 'flex',
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '4px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        marginBottom: '20px'
                      }}>
                        <button
                          onClick={() => setSelectedOS('Windows')}
                          style={{
                            flex: 1,
                            background: selectedOS === 'Windows' ? 'var(--primary)' : 'transparent',
                            color: selectedOS === 'Windows' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <Icons.WindowsLogo /> Windows PowerShell
                        </button>
                        <button
                          onClick={() => setSelectedOS('Linux')}
                          style={{
                            flex: 1,
                            background: selectedOS === 'Linux' ? 'var(--primary)' : 'transparent',
                            color: selectedOS === 'Linux' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <Icons.LinuxLogo /> Linux Bash / Shell
                        </button>
                      </div>

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                        Task Steps ({selectedOS} Instruction):
                      </h4>
                      
                      <div className="step-list">
                        {(selectedOS === 'Windows' ? activeQuest.stepsWindows : activeQuest.stepsLinux).map((step, idx) => (
                          <div key={idx} className="step-item">
                            <div className="step-num">{idx + 1}</div>
                            <div className="step-text" style={{ fontSize: '13.5px' }}>{step}</div>
                          </div>
                        ))}
                      </div>

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                        Local Verification Script:
                      </h4>
                      <div className="terminal-block">
                        <div className="terminal-header">Automated API Check</div>
                        <span className="terminal-prompt">$ </span>
                        <span>{activeQuest.verificationCommand}</span>
                      </div>

                      {activeQuest.hint && (
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#fcd34d',
                          marginBottom: '20px',
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <Icons.Info />
                          <div><strong>Hint:</strong> {activeQuest.hint}</div>
                        </div>
                      )}

                      {userData?.completedQuests.includes(activeQuest.validatorKey) ? (
                        <div style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          color: 'var(--success)', 
                          fontWeight: 700,
                          justifyContent: 'center',
                          padding: '14px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px'
                        }}>
                          <Icons.Check /> QUEST COMPLETED & VERIFIED
                        </div>
                      ) : (
                        <button 
                          className="btn btn-primary pulse-glow" 
                          onClick={() => handleVerify(activeQuest)}
                          disabled={verifying}
                          style={{ width: '100%', padding: '14px' }}
                        >
                          {verifying ? 'Running Verification Check...' : 'VERIFY QUEST'}
                        </button>
                      )}

                      {verifyResult && (
                        <div className={`verify-result ${verifyResult.success ? 'success' : 'error'}`}>
                          {verifyResult.success ? <Icons.Check /> : <Icons.Info />}
                          <div>
                            <strong>{verifyResult.success ? 'Verification Succeeded!' : 'Verification Failed'}</strong>
                            <p>{verifyResult.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Icons.Info />
                      <p style={{ marginTop: '12px' }}>Select a quest on the left to start the simulation.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {/* ------------------- RESOURCES HUB VIEW ------------------- */}
        {activeTab === 'resources' && (
          <div className="resources-grid">
            <div className="glass-panel resource-section-card">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 700 }}>Recommended Reading</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Classic literature to master DevOps culture, engineering practices, and SRE.
              </p>

              {devopsBooks.map((book, i) => (
                <a key={i} href={book.link} target="_blank" rel="noreferrer" className="book-card">
                  <div className="book-cover">{book.title.slice(0, 1)}</div>
                  <div className="book-details">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">By {book.author}</div>
                    <p className="book-desc">{book.description}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="glass-panel resource-section-card">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 700 }}>Tools & Landscape</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Key industry technologies categorized by DevOps stage.
              </p>

              {devopsTools.map((cat, i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {cat.category}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {cat.tools.map((tool, j) => (
                      <span 
                        key={j} 
                        style={{
                          fontSize: '12px',
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '20px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------- BURGER MAP VIEW ------------------- */}
        {activeTab === 'burger' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 20px' }}>
              <strong>DevOps as a Burger (DaaB)</strong> represents the containerized architecture stack layer-by-layer. 
              Click on a layer to jump directly to its roadmap path!
            </p>

            <div className="burger-container">
              {/* Bun Top */}
              <div 
                className="burger-layer burger-bun-top"
                onClick={() => handleModuleClick(12)}
              >
                Top Bun: Agile, SDLC & DevSecOps (Step 12)
              </div>

              {/* Salad */}
              <div 
                className="burger-layer burger-salad"
                onClick={() => handleModuleClick(10)}
              >
                Salad: Monitoring & Observability (Step 10)
              </div>

              {/* Cheese */}
              <div 
                className="burger-layer burger-cheese"
                onClick={() => handleModuleClick(7)}
              >
                Cheese: Container Orchestration / Kubernetes (Step 7)
              </div>

              {/* Patty */}
              <div 
                className="burger-layer burger-patty"
                onClick={() => handleModuleClick(6)}
              >
                Patty: Containers / Docker (Step 6)
              </div>

              {/* Server Web / Network */}
              <div 
                className="burger-layer"
                style={{ background: '#ea580c', border: '2px solid #9a3412', height: 40 }}
                onClick={() => handleModuleClick(5)}
              >
                Sauce: Servers & Networking (Steps 4 & 5)
              </div>

              {/* Bun Bottom */}
              <div 
                className="burger-layer burger-bun-bottom"
                onClick={() => handleModuleClick(1)}
              >
                Bottom Bun: Git & OS Scripting (Steps 1 & 3)
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
              Adapted from milanm/DevOps-Roadmap
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

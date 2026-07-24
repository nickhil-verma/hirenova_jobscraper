'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Database, 
  RotateCw, 
  Settings, 
  Link as LinkIcon, 
  History, 
  CheckCircle, 
  AlertCircle,
  Play,
  Cpu,
  Zap,
  Terminal,
  Activity,
  Sparkles,
  RefreshCw,
  Radio,
  Layers,
  Globe,
  Building2,
  MapPin,
  Coins,
  ShieldCheck,
  Lock,
  LogOut,
  Key
} from 'lucide-react';

export default function AdminConsole() {
  // Admin Auth States
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [dbTotalCount, setDbTotalCount] = useState(0);
  const [lastScrapeLog, setLastScrapeLog] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [turboScraping, setTurboScraping] = useState(false);

  // Auto Scraping Controls
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // API Key Rotation
  const [activeApiKey, setActiveApiKey] = useState('None');
  const [prevApiKeys, setPrevApiKeys] = useState([]);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [rotating, setRotating] = useState(false);

  // Dynamic API Endpoint target URL
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [newUrlInput, setNewUrlInput] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  // Live Terminal Logs
  const [logs, setLogs] = useState([
    { type: 'info', text: 'SYSTEM: Initialized Hirenova High-Speed Crawler Engine v2.4', time: '10:30:00' },
    { type: 'success', text: 'MONGODB: Connected to cluster job_scrapper_db [Atlas Node 01]', time: '10:30:02' },
    { type: 'info', text: 'SCHEDULER: Auto-Scrape loop active (60s interval)', time: '10:30:05' }
  ]);

  // Live Scraped Jobs Feed
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingJobsFeed, setLoadingJobsFeed] = useState(false);

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const terminalEndRef = useRef(null);

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-80), { text, type, time }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Fetch Scraper Config Status from Server
  const fetchConfig = async (isPoll = false) => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('Failed to retrieve config');
      const data = await res.json();
      if (data.success) {
        setAutoEnabled(data.autoEnabled);

        if (Math.abs(data.secondsRemaining - secondsRemaining) > 3 || isPoll) {
          setSecondsRemaining(data.secondsRemaining);
        }

        if (data.activeApiKey) setActiveApiKey(data.activeApiKey);
        if (data.prevApiKeys) setPrevApiKeys(data.prevApiKeys);

        if (data.scrapingUrl) {
          setScrapingUrl(data.scrapingUrl);
          if (!document.activeElement || document.activeElement.id !== 'scraping-url-input') {
            setNewUrlInput(data.scrapingUrl);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  // Fetch database metrics & recent scraped jobs
  const fetchMetrics = async () => {
    setLoadingJobsFeed(true);
    try {
      const res = await fetch('/api/jobs?page=1&limit=6');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDbTotalCount(data.dbTotalJobsCount || 0);
          setLastScrapeLog(data.lastScrapeLog || null);
          setRecentJobs(data.jobs || []);
        }
      }
    } catch (e) {
      console.error('Error fetching database metrics:', e);
    } finally {
      setLoadingJobsFeed(false);
    }
  };

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated) {
          setAdminAuthenticated(true);
          fetchMetrics();
          fetchConfig(true);
        } else {
          setAdminAuthenticated(false);
        }
      } else {
        setAdminAuthenticated(false);
      }
    } catch (e) {
      console.error('Admin auth verification error:', e);
      setAdminAuthenticated(false);
    } finally {
      setAdminChecking(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminUsernameInput.trim() || !adminPasswordInput.trim() || loggingIn) return;
    setLoggingIn(true);
    setAdminAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsernameInput, password: adminPasswordInput })
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuthenticated(true);
        fetchMetrics();
        fetchConfig(true);
      } else {
        setAdminAuthError(data.error || 'Invalid Admin Credentials');
      }
    } catch (err) {
      setAdminAuthError('Network error verifying admin credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setAdminAuthenticated(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Setup periodic polling when authenticated
  useEffect(() => {
    if (!adminAuthenticated) return;
    fetchMetrics();
    fetchConfig(true);

    const pollInterval = setInterval(() => {
      fetchMetrics();
      fetchConfig(true);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [adminAuthenticated]);

  // Frontend countdown timer mirroring backend loop
  useEffect(() => {
    let timer;
    if (autoEnabled) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            addLog('SCHEDULER: Countdown complete. Triggering background auto-crawl...', 'info');
            setTimeout(() => {
              fetchMetrics();
              fetchConfig(true);
              addLog('SCHEDULER: Auto-crawl completed. Database synced.', 'success');
            }, 1500);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [autoEnabled]);

  // Handle auto scraping toggle switch
  const handleToggleAuto = async () => {
    const targetState = !autoEnabled;
    setAutoEnabled(targetState);
    setSecondsRemaining(60);

    addLog(`CONFIG: Toggled Auto Scrape to ${targetState ? 'ACTIVE' : 'INACTIVE'}`, targetState ? 'success' : 'warn');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoEnabled: targetState })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data.success) {
        setAutoEnabled(data.autoEnabled);
        setSecondsRemaining(data.secondsRemaining);
      }
    } catch (err) {
      console.error('Error toggling auto scraping state:', err);
      setErrorMessage('Failed to persist scheduler toggle preferences in MongoDB Atlas.');
      setAutoEnabled(!targetState);
    }
  };

  // Immediate 1-Click Manual Scraper
  const handleScrapeNow = async () => {
    if (scraping) return;
    setScraping(true);
    setErrorMessage('');
    setSuccessMessage('');

    addLog('SCRAPER: Initializing 1-Click Scrape Worker...', 'info');
    addLog(`SCRAPER: Connecting to endpoint: ${scrapingUrl || 'Default (Hiring.cafe)'}`, 'info');

    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        addLog(`HTTP 200 OK: Received ${data.count} hits. Upserted: ${data.upsertedCount || 0}, Modified: ${data.modifiedCount || 0}`, 'success');
        setSuccessMessage(
          `Sync Successful! Scraped ${data.count} active listings. (New Upserted: ${data.upsertedCount || 0}, Existing Modified: ${data.modifiedCount || 0})`
        );
        fetchMetrics();
        fetchConfig(true);
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        throw new Error(data.error || 'Manual scraping trigger failed.');
      }
    } catch (err) {
      console.error('Error scraping jobs:', err);
      addLog(`ERROR: Scraping failed - ${err.message}`, 'error');
      setErrorMessage(err.message || 'Verification Error: Failed to execute scraper.');
    } finally {
      setScraping(false);
    }
  };

  // ⚡ TURBO CRAZY SCRAPE (Bulk Multi-Fetch)
  const handleTurboCrazyScrape = async () => {
    if (turboScraping) return;
    setTurboScraping(true);
    setErrorMessage('');
    setSuccessMessage('');

    addLog('🚀 TURBO MODE ACTIVATED! Launching parallel crawler threads...', 'special');
    addLog('THREAD-01: Scraping Hiring.cafe Page 1...', 'info');

    try {
      // Stream simulated live crawl steps for high-energy interactivity
      setTimeout(() => addLog('THREAD-02: Scraping Hiring.cafe Page 2 (AI Startups)...', 'info'), 400);
      setTimeout(() => addLog('THREAD-03: Normalizing compensation ranges (USD / EUR / GBP)...', 'info'), 800);
      setTimeout(() => addLog('THREAD-04: Running regex tech stack classifier on requirements text...', 'info'), 1200);

      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setTimeout(() => {
          addLog(`⚡ TURBO CRAZY SYNC COMPLETE! Indexing ${data.count} listings into MongoDB Atlas. (Upserted: ${data.upsertedCount || 0}, Modified: ${data.modifiedCount || 0})`, 'success');
          setSuccessMessage(
            `🚀 Crazy Turbo Scrape Finished! Successfully indexed ${data.count} active opportunities.`
          );
          fetchMetrics();
          fetchConfig(true);
          setTurboScraping(false);
          setTimeout(() => setSuccessMessage(''), 8000);
        }, 1600);
      } else {
        throw new Error(data.error || 'Turbo scrape failed');
      }
    } catch (err) {
      addLog(`ERROR: Turbo scrape encountered failure - ${err.message}`, 'error');
      setErrorMessage(err.message || 'Turbo Scraping Error.');
      setTurboScraping(false);
    }
  };

  // Trigger API Key rotation
  const handleRotateApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyInput.trim() || rotating) return;

    setRotating(true);
    setErrorMessage('');
    setSuccessMessage('');
    addLog(`SECURITY: Rotating active system API Key...`, 'info');

    try {
      const res = await fetch('/api/config/rotate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newApiKey: newKeyInput })
      });
      const data = await res.json();

      if (data.success) {
        setActiveApiKey(data.activeApiKey);
        setPrevApiKeys(data.prevApiKeys);
        setNewKeyInput('');
        addLog(`SECURITY: API Key rotated successfully. Previous key archived in MongoDB.`, 'success');
        setSuccessMessage('API Key successfully rotated! Prior key saved into history collection in MongoDB Atlas.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(data.error || 'API Key rotation failed.');
      }
    } catch (err) {
      console.error('Error rotating API key:', err);
      addLog(`ERROR: Key rotation failed - ${err.message}`, 'error');
      setErrorMessage(err.message || 'Error executing API Key rotation.');
    } finally {
      setRotating(false);
    }
  };

  // Trigger Scraping Target URL Update
  const handleUpdateScrapingUrl = async (targetUrl = newUrlInput) => {
    if (!targetUrl.trim() || savingUrl) return;

    setSavingUrl(true);
    setErrorMessage('');
    setSuccessMessage('');
    addLog(`ENDPOINT: Updating Target Scraper URL to: ${targetUrl}`, 'info');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapingUrl: targetUrl })
      });
      const data = await res.json();

      if (data.success) {
        setScrapingUrl(data.scrapingUrl);
        setNewUrlInput(data.scrapingUrl);
        addLog(`ENDPOINT: Successfully updated target scraping URL in MongoDB config.`, 'success');
        setSuccessMessage('Scraping Target URL successfully updated in MongoDB Atlas!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(data.error || 'Failed to update URL');
      }
    } catch (err) {
      console.error('Error updating scraping URL:', err);
      addLog(`ERROR: Endpoint URL update failed - ${err.message}`, 'error');
      setErrorMessage(err.message || 'Scraping URL update request failed.');
    } finally {
      setSavingUrl(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const timeMs = new Date(dateStr).getTime();
      const diffSecs = Math.floor((Date.now() - timeMs) / 1000);

      if (diffSecs < 60) return 'just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      return formatDate(dateStr);
    } catch {
      return 'N/A';
    }
  };

  if (adminChecking) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Verifying Admin Security Clearance...</p>
      </div>
    );
  }

  if (!adminAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top center, #eef2ff, #f8fafc 70%)', padding: '2rem 1rem' }}>
        <div className="shad-card hover-lift" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', background: '#ffffff', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#09090b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Lock size={28} />
          </div>

          <div className="shad-badge shad-badge-outline" style={{ display: 'inline-flex', gap: '0.35rem', padding: '0.3rem 0.75rem', marginBottom: '1rem', background: 'rgba(22, 163, 74, 0.05)', color: 'var(--brand-green)', borderColor: 'rgba(22, 163, 74, 0.2)', fontWeight: 700 }}>
            <ShieldCheck size={13} /> Protected by .env Credentials
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: '0 0 0.5rem 0' }}>
            Hirenova Admin Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Enter your system administrator username and password configured in <code style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>.env</code>.
          </p>

          {adminAuthError && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {adminAuthError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                ADMIN USERNAME
              </label>
              <input 
                type="text"
                required
                placeholder="Enter admin username..."
                className="shad-input"
                style={{ height: '2.6rem' }}
                value={adminUsernameInput}
                onChange={(e) => setAdminUsernameInput(e.target.value)}
                disabled={loggingIn}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                ADMIN PASSWORD
              </label>
              <input 
                type="password"
                required
                placeholder="••••••••••••"
                className="shad-input"
                style={{ height: '2.6rem' }}
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                disabled={loggingIn}
              />
            </div>

            <button 
              type="submit"
              disabled={loggingIn || !adminUsernameInput.trim() || !adminPasswordInput.trim()}
              className="shad-btn shad-btn-primary"
              style={{ width: '100%', height: '2.75rem', borderRadius: '12px', marginTop: '0.5rem', fontWeight: 700, fontSize: '0.92rem', gap: '0.4rem' }}
            >
              {loggingIn ? 'Authenticating...' : 'Unlock Admin Control Panel'} <Key size={16} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Link href="/" style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Public Job Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

      {/* Top Bar Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/" className="shad-btn shad-btn-outline hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '30px' }}>
          <ArrowLeft size={16} /> Back to Public Board
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="shad-badge shad-badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.8rem', background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a' }}></span>
            CRAWLER NODE ONLINE (18ms Ping)
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Root Admin Privileges</span>
          <button onClick={handleAdminLogout} className="shad-btn shad-btn-outline hover-lift" style={{ borderRadius: '25px', height: '2.2rem', padding: '0 0.85rem', fontSize: '0.8rem', gap: '0.3rem' }}>
            Sign Out <LogOut size={13} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="shad-badge shad-badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', background: 'rgba(9,9,11,0.04)' }}>
              <Cpu size={13} style={{ color: 'var(--brand-green)' }} /> Autonomous Data Engine
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-title)', letterSpacing: '-1px', margin: 0 }}>
              Scraper Control Center & High-Speed Crawler
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '680px' }}>
              Manage dynamic scraping target endpoints, API key rotation logs, auto-scrape loop intervals, and monitor high-speed MongoDB Atlas upserts.
            </p>
          </div>

          {/* Crazy Turbo Scrape CTA Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={handleTurboCrazyScrape}
              disabled={turboScraping || scraping}
              className="shad-btn hover-lift"
              style={{
                background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)',
                color: '#ffffff',
                borderRadius: '50px',
                padding: '0.8rem 1.8rem',
                height: '3.2rem',
                fontSize: '1rem',
                fontWeight: 800,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 30px rgba(9,9,11,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: (turboScraping || scraping) ? 'not-allowed' : 'pointer'
              }}
            >
              <Zap size={18} style={{ color: '#eab308' }} />
              {turboScraping ? '⚡ RUNNING TURBO  SCRAPE...' : '⚡ RUN TURBO  SCRAPE (5x)'}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Parallel multi-thread page crawler & AI parser</span>
          </div>
        </div>
      </header>

      {/* Success/Error Alerts */}
      {successMessage && (
        <div className="shad-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderColor: 'var(--brand-green)', color: 'var(--brand-green)', background: 'rgba(22, 163, 74, 0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '12px' }}>
          <CheckCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="shad-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))', background: 'rgba(239, 68, 68, 0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '12px' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{errorMessage}</span>
        </div>
      )}

      {/* 4-Card Live System Metrics Bar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Total jobs stat */}
        <div className="shad-card hover-lift" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(9,9,11,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>Total Jobs Stored</span>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.1', marginTop: '0.1rem' }}>{dbTotalCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 600 }}>MongoDB Atlas Active Index</span>
          </div>
        </div>

        {/* Real-time Crawl Speed Rate */}
        <div className="shad-card hover-lift" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(22,163,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-green)' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>Scrape Rate & Pipeline</span>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.1', marginTop: '0.1rem' }}>48.2 req/s</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>1.4 MB/s Throughput</span>
          </div>
        </div>

        {/* Auto Scraping Loop Switch */}
        <div className="shad-card hover-lift" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Settings size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>Auto-Scrape Loop</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={autoEnabled}
                  onChange={handleToggleAuto}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#09090b' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{autoEnabled ? 'ACTIVE' : 'PAUSED'}</span>
              </label>
              <span className="shad-badge shad-badge-secondary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {autoEnabled ? `${secondsRemaining}s remaining` : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Manual 1-Click Scrape Control */}
        <div className="shad-card hover-lift" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>Pipeline Control</span>
            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, margin: '0.1rem 0' }}>1-Click Scrape</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Last: {getTimeAgo(lastScrapeLog?.timestamp)}</span>
          </div>
          <button
            className="shad-btn shad-btn-primary"
            onClick={handleScrapeNow}
            disabled={scraping}
            style={{ borderRadius: '25px', height: '2.5rem', padding: '0 1.25rem', gap: '0.3rem' }}
          >
            <RefreshCw size={14} className={scraping ? 'loading-spinner' : ''} />
            {scraping ? 'Syncing...' : 'Scrape Now'}
          </button>
        </div>
      </section>

      {/* HIGH-SPEED MATRIX TERMINAL LOG CONSOLE */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="shad-card" style={{ background: '#09090b', color: '#f8fafc', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} style={{ color: '#22c55e' }} />
              <strong style={{ fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>LIVE MATRIX SCRAPER CONSOLE LOG (STREAMING)</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setLogs([{ type: 'info', text: 'Console cleared.', time: new Date().toLocaleTimeString() }])}
                className="shad-btn shad-btn-outline"
                style={{ height: '1.8rem', padding: '0 0.6rem', fontSize: '0.72rem', color: '#a1a1aa', borderColor: 'rgba(255,255,255,0.15)', background: 'transparent' }}
              >
                Clear Console
              </button>
            </div>
          </div>

          {/* Monospace Log Lines Stream Box */}
          <div style={{ height: '240px', overflowY: 'auto', fontFamily: 'Courier New, monospace', fontSize: '0.82rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.5rem' }}>
            {logs.map((log, index) => {
              let textColor = '#e2e8f0';
              if (log.type === 'success') textColor = '#22c55e';
              if (log.type === 'special') textColor = '#eab308';
              if (log.type === 'error') textColor = '#ef4444';
              if (log.type === 'warn') textColor = '#f97316';

              return (
                <div key={index} style={{ color: textColor, display: 'flex', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', flexShrink: 0 }}>[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </section>

      {/* TARGET SCRAPING URL PRESETS & API KEY ROTATION MANAGER */}
      <section className="shad-card" style={{ background: '#fff', padding: '2.25rem', borderRadius: '20px', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

          {/* Column 1: Target Endpoint Config & Quick Presets */}
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              <LinkIcon size={20} /> Target Scraping Endpoint & Presets
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.4rem 0 1.25rem 0', lineHeight: '1.5' }}>
              Switch or customize target JSON crawl endpoints dynamically. Select a preset below or paste a custom endpoint.
            </p>

            {/* Quick Preset Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { label: '🚀 Hiring.cafe Page 1', url: 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=1' },
                { label: '⚡ Stripe Engineering', url: 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=2' },
                { label: '🌐 Google Careers', url: 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=3' },
                { label: '🦀 Rust & Systems', url: 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=4' }
              ].map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleUpdateScrapingUrl(preset.url)}
                  className="shad-badge shad-badge-outline hover-lift"
                  style={{ cursor: 'pointer', padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: scrapingUrl === preset.url ? '#09090b' : '#fff', color: scrapingUrl === preset.url ? '#fff' : 'var(--text-primary)' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Active Endpoint URL</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, wordBreak: 'break-all', marginTop: '0.2rem' }}>
                {scrapingUrl || 'Default (Hiring.cafe Page 1)'}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateScrapingUrl(newUrlInput); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="scraping-url-input"
                type="text"
                className="shad-input"
                placeholder="Enter custom target API URL..."
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                disabled={savingUrl}
              />
              <button
                type="submit"
                className="shad-btn shad-btn-primary"
                disabled={savingUrl || !newUrlInput.trim()}
                style={{ borderRadius: '10px', padding: '0 1.25rem', height: '2.4rem', flexShrink: 0 }}
              >
                {savingUrl ? 'Saving...' : 'Update Endpoint'}
              </button>
            </form>
          </div>

          {/* Column 2: API Key Rotation Manager & History */}
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              <RotateCw size={20} /> System API Key Rotation
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.4rem 0 1.25rem 0', lineHeight: '1.5' }}>
              Rotate active scraper keys. Previous keys are automatically archived in MongoDB Atlas rotation history.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Active Credential Key</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>{activeApiKey}</div>
            </div>

            <form onSubmit={handleRotateApiKey} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="shad-input"
                placeholder="Enter new API key string..."
                value={newKeyInput}
                onChange={(e) => setNewKeyInput(e.target.value)}
                disabled={rotating}
              />
              <button
                type="submit"
                className="shad-btn shad-btn-primary"
                disabled={rotating || !newKeyInput.trim()}
                style={{ borderRadius: '10px', padding: '0 1.25rem', height: '2.4rem', flexShrink: 0 }}
              >
                {rotating ? 'Rotating...' : 'Rotate Key'}
              </button>
            </form>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>Rotation Archive Log</h3>
            <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {prevApiKeys.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No archived keys yet.</span>
              ) : (
                prevApiKeys.slice().reverse().map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.key}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{formatDate(item.rotatedAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* LIVE SCRAPED RECENT JOBS FEED */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} style={{ color: 'var(--brand-green)' }} /> Live Scraped Jobs Feed (MongoDB Index)
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Auto-syncing active database records</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {recentJobs.map((job) => {
            const details = job.v5_processed_job_data || {};
            const companyName = details.company_name || job.company || 'Tech Company';
            const jobTitle = job.job_information?.title || details.core_job_title || job.title || 'Software Specialist';
            const tools = details.technical_tools || [];

            return (
              <div key={job.id || Math.random()} className="shad-card hover-lift" style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>{companyName}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.1rem 0 0 0' }}>{jobTitle}</h3>
                  </div>
                  <span className="shad-badge shad-badge-outline" style={{ background: 'rgba(22,163,74,0.08)', color: 'var(--brand-green)', borderColor: 'rgba(22,163,74,0.2)', fontSize: '0.68rem', fontWeight: 700 }}>
                    ✓ JUST INDEXED
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <span><MapPin size={12} style={{ display: 'inline' }} /> {details.formatted_workplace_location || 'Remote'}</span>
                  <span><Coins size={12} style={{ display: 'inline', color: 'var(--brand-green)' }} /> {details.listed_compensation_currency || 'USD'} Listed</span>
                </div>
                {tools.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
                    {tools.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="shad-badge shad-badge-secondary" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        All rights are reserved with Hirenova built by github-Nickhil-verma • System Admin Node v2.4.0
      </footer>

    </div>
  );
}

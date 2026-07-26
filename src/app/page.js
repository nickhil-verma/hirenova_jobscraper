'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Briefcase, 
  LogOut, 
  Cpu, 
  Database, 
  Search, 
  Lock, 
  MapPin, 
  Globe, 
  Coins, 
  Settings,
  Sparkles,
  Award,
  X,
  AlertCircle,
  UploadCloud,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Star,
  SearchX, 
  Play, 
  Share2, 
  ExternalLink, 
  Mail, 
  ArrowUp, 
  Terminal, 
  FileText,
  Heart,
  BookmarkPlus,
  BookmarkCheck
} from 'lucide-react';

export default function JobBoard() {
  const router = useRouter();

  // Animation Refs & Scroll State
  const macOsWindowRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // State variables
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [dbTotalCount, setDbTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '⚡ All Roles', query: '' },
    { id: 'swe', label: '💻 Software Eng', query: 'Software Engineer' },
    { id: 'frontend', label: '🎨 Frontend & UI', query: 'Frontend React TypeScript' },
    { id: 'backend', label: '⚙️ Backend & API', query: 'Backend Node Go Python' },
    { id: 'ai', label: '🤖 AI & Machine Learning', query: 'AI Machine Learning LLM' },
    { id: 'data', label: '📊 Data Science', query: 'Data Engineer SQL Python' },
    { id: 'devops', label: '🔒 DevOps & Cloud', query: 'DevOps AWS Kubernetes' },
    { id: 'product', label: '📦 Product & Design', query: 'Product Manager UI UX' },
    { id: 'mobile', label: '📱 Mobile Dev', query: 'iOS Android React Native' }
  ];

  const handleCategorySelect = (catId, queryStr) => {
    setSelectedCategory(catId);
    setSearch(queryStr);
    setPage(1);
    fetchData(1, queryStr, false);
  };

  const getPaginationRange = (currentPage, totalPagesCount, delta = 2) => {
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPagesCount; i++) {
      if (
        i === 1 ||
        i === totalPagesCount ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Track page scroll for Framer Motion navbar shrink effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP ScrollTrigger for macOS window coming from right to left
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      if (macOsWindowRef.current) {
        gsap.fromTo(
          macOsWindowRef.current,
          { opacity: 0, x: 220, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: macOsWindowRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }
  }, []);

  // Video Skeleton Loading state
  const [videoLoading, setVideoLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Session & User
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Resume Upload State on Landing Page
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadProgressStage, setUploadProgressStage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Job Detail Slide Drawer & Extension Guide Modal State
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const mockDummyJobs = [
    { id: '1', company: 'Stripe', title: 'Backend Engineer (API Infrastructure)', location: 'San Francisco, CA', source: 'stripe.com', v5_processed_job_data: { technical_tools: ['Ruby', 'Go', 'API Design', 'PostgreSQL'], formatted_workplace_location: 'Remote', requirements_summary: 'Build high-throughput payment infrastructure and distributed API networks.', listed_compensation_currency: 'USD', yearly_min_compensation: 150000, yearly_max_compensation: 195000, listed_compensation_frequency: 'yearly' } },
    { id: '2', company: 'Google', title: 'Senior Software Engineer (React / Next.js)', location: 'Mountain View, CA', source: 'hiring.cafe', v5_processed_job_data: { technical_tools: ['React', 'TypeScript', 'Node.js'], formatted_workplace_location: 'Hybrid', requirements_summary: 'Build high-performance web applications using React, TypeScript, and web standards.', listed_compensation_currency: 'USD', yearly_min_compensation: 165000, yearly_max_compensation: 220000, listed_compensation_frequency: 'yearly' } },
    { id: '3', company: 'Vercel', title: 'Developer Advocate & Systems Engineer', location: 'New York, NY', source: 'vercel.com', v5_processed_job_data: { technical_tools: ['Next.js', 'React', 'Tailwind', 'Rust'], formatted_workplace_location: 'Remote', requirements_summary: 'Create developer documentation, tutorials, and next-gen frontend cloud engines.', listed_compensation_currency: 'USD', yearly_min_compensation: 140000, yearly_max_compensation: 180000, listed_compensation_frequency: 'yearly' } },
    { id: '4', company: 'Linear', title: 'Product Specialist Engineer', location: 'London, UK', source: 'linear.app', v5_processed_job_data: { technical_tools: ['React', 'Node.js', 'GraphQL', 'TypeScript'], formatted_workplace_location: 'Hybrid', requirements_summary: 'Develop real-time collaborative issue tracking software and high-speed UI primitives.', listed_compensation_currency: 'USD', yearly_min_compensation: 130000, yearly_max_compensation: 170000, listed_compensation_frequency: 'yearly' } },
    { id: '5', company: 'Figma', title: 'UI Graphics Systems Specialist', location: 'San Francisco, CA', source: 'hiring.cafe', v5_processed_job_data: { technical_tools: ['C++', 'WASM', 'WebGL', 'TypeScript'], formatted_workplace_location: 'Onsite', requirements_summary: 'Design high-performance 2D graphics engines compiled directly to WebAssembly.', listed_compensation_currency: 'USD', yearly_min_compensation: 175000, yearly_max_compensation: 230000, listed_compensation_frequency: 'yearly' } },
    { id: '6', company: 'Supabase', title: 'Database Realtime Architect', location: 'Singapore', source: 'supabase.io', v5_processed_job_data: { technical_tools: ['PostgreSQL', 'Go', 'Rust', 'Docker'], formatted_workplace_location: 'Remote', requirements_summary: 'Maintain open-source PostgreSQL cloud infrastructure and realtime WebSocket services.', listed_compensation_currency: 'USD', yearly_min_compensation: 145000, yearly_max_compensation: 190000, listed_compensation_frequency: 'yearly' } }
  ];

  // Sync Search Query from URL parameters on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('search') || '';
      if (initialQuery) {
        setSearch(initialQuery);
      }
    }
  }, []);

  // Global Keyboard listener for '/' and 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Liked & Kanban Saved Job States
  const [likedJobIds, setLikedJobIds] = useState([]);
  const [likedJobObjects, setLikedJobObjects] = useState({});
  const [savedKanbanJobIds, setSavedKanbanJobIds] = useState([]);

  // Fetch session on load
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (Array.isArray(data.user.likedJobs)) {
            setLikedJobIds(data.user.likedJobs.map(String));
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session verification failed:', err);
    } finally {
      setCheckingSession(false);
    }
  };

  const toggleLikeJob = async (jobIdRaw, jobData) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const idStr = String(jobIdRaw || '');
    if (!idStr) return;
    const isLiked = likedJobIds.includes(idStr);
    const updated = isLiked ? likedJobIds.filter(id => id !== idStr) : [...likedJobIds, idStr];
    setLikedJobIds(updated);

    if (jobData && !isLiked) {
      setLikedJobObjects(prev => ({ ...prev, [idStr]: jobData }));
    }

    try {
      await fetch('/api/jobs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: idStr, jobData })
      });
    } catch (e) {
      console.error('Failed to toggle like status:', e);
    }
  };

  const saveJobToKanban = async (job) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const idStr = String(job.id);
    setSavedKanbanJobIds(prev => [...prev, idStr]);

    const details = job.v5_processed_job_data || {};
    const companyName = details.company_name || job.company || 'Unknown Company';
    const jobTitle = job.job_information?.title || details.core_job_title || job.title || 'Software Specialist';

    const card = {
      id: idStr,
      company: companyName,
      title: jobTitle,
      location: details.formatted_workplace_location || job.location || 'Remote',
      match: 90,
      stage: 'saved',
      notes: `Saved directly from landing directory. Apply URL: ${job.apply_url || ''}`
    };

    try {
      const getRes = await fetch('/api/kanban');
      let items = [];
      if (getRes.ok) {
        const data = await getRes.json();
        if (data.success && Array.isArray(data.items)) {
          items = data.items;
        }
      }
      if (!items.some(c => String(c.id) === idStr)) {
        items = [...items, card];
        await fetch('/api/kanban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
      }
    } catch (e) {
      console.error('Failed to save job to Kanban:', e);
    }
  };

  // Fetch jobs data
  const fetchData = async (pageNum = page, searchTerm = search, isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetch(`/api/jobs?page=${pageNum}&limit=12&search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to retrieve jobs');
      
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setTotalJobs(data.totalJobs || 0);
        setDbTotalCount(data.dbTotalJobsCount || 0);
        setTotalPages(data.totalPages || 1);
        setErrorMessage('');
      } else {
        throw new Error(data.error || 'Unknown API error');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (!isPoll) setErrorMessage(err.message || 'Error connecting to database');
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    fetchData(page, search, false);

    const pollInterval = setInterval(() => {
      fetchData(page, search, true);
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [page]);

  // Debounced search logic & URL sync
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);

    // Update URL query parameters for sharing/bookmarking
    const newUrl = val.trim() ? `/?search=${encodeURIComponent(val)}` : '/';
    window.history.pushState({ path: newUrl }, '', newUrl);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchData(1, val, false);
    }, 400);
  };

  const handleCollectionSelect = (colId, queryStr) => {
    setSelectedCollection(colId);
    setSearch(queryStr);
    const newUrl = queryStr.trim() ? `/?search=${encodeURIComponent(queryStr)}` : '/';
    window.history.pushState({ path: newUrl }, '', newUrl);
    fetchData(1, queryStr, false);
  };

  const handleLandingResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploadingResume(true);
    setUploadMessage('');
    setUploadProgressStage('Uploading file...');

    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      setTimeout(() => setUploadProgressStage('Extracting Text...'), 400);
      setTimeout(() => setUploadProgressStage('AI Analysis & Vector Scoring...'), 900);
      setTimeout(() => setUploadProgressStage('Saving Candidate Profile...'), 1400);

      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadMessage('Profile generated cleanly! Redirecting to your AI Command Center...');
        await checkSession();
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
      } else {
        setUploadMessage(`Upload notice: ${data.error || 'Parsed with fallback'}`);
      }
    } catch (err) {
      setUploadMessage('Network connection error.');
    } finally {
      setUploadingResume(false);
    }
  };

  const highlightText = (text = '', query = '') => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[^a-zA-Z0-9]/g, '')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="search-highlight">{part}</mark> 
        : part
    );
  };

  const formatCompensation = (details = {}) => {
    const currency = details.listed_compensation_currency || 'USD';
    const minVal = details.yearly_min_compensation || details.monthly_min_compensation;
    const maxVal = details.yearly_max_compensation || details.monthly_max_compensation;

    if (!minVal && !maxVal) return 'Compensation Undisclosed';

    const getSymbol = (cur) => {
      switch (cur.toUpperCase()) {
        case 'USD': return '$';
        case 'INR': return '₹';
        case 'GBP': return '£';
        case 'EUR': return '€';
        default: return cur + ' ';
      }
    };

    const formatNum = (num) => {
      if (!num) return '';
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num.toString();
    };

    const symbol = getSymbol(currency);
    if (minVal && maxVal) {
      return `${symbol}${formatNum(minVal)} - ${symbol}${formatNum(maxVal)} / yr`;
    }
    return `${symbol}${formatNum(minVal || maxVal)} / yr`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGradientForCompany = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #27272a, #3f3f46)',
      'linear-gradient(135deg, #18181b, #27272a)',
      'linear-gradient(135deg, #52525b, #71717a)'
    ];
    let hash = 0;
    const str = String(name);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const openJobDrawer = (job) => {
    setSelectedJobForDrawer(job);
    setIsDrawerOpen(true);
  };

  const getCompanyLogoUrl = (job) => {
    if (!job) return null;
    const details = job.v5_processed_job_data || {};
    if (job.company_logo) return job.company_logo;
    if (job.logo_url) return job.logo_url;
    if (job.logo) return job.logo;
    if (details.company_logo) return details.company_logo;
    if (details.logo_url) return details.logo_url;
    if (details.logo) return details.logo;
    if (job.company_image) return job.company_image;

    const companyName = details.company_name || job.company || '';
    if (!companyName) return null;
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://unavatar.io/${encodeURIComponent(cleanName)}.com?fallback=https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanName)}.com&sz=128`;
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    const newUrl = '/';
    window.history.pushState({ path: newUrl }, '', newUrl);
    fetchData(1, '', false);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    const newUrl = search.trim() ? `/?search=${encodeURIComponent(search)}` : '/';
    window.history.pushState({ path: newUrl }, '', newUrl);
    fetchData(1, search, false);
  };

  const filterJobsList = (list, queryStr) => {
    let filtered = list;

    if (selectedCollection === 'liked') {
      filtered = filtered.filter(job => {
        const jobId = String(job._id || job.id || '');
        return likedJobIds.includes(jobId);
      });
    }

    if (!queryStr || !queryStr.trim()) return filtered;
    const q = queryStr.toLowerCase().trim();
    const tokens = q.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);

    return filtered.filter(job => {
      const details = job.v5_processed_job_data || {};
      const title = (job.job_information?.title || details.core_job_title || job.title || '').toLowerCase();
      const company = (details.company_name || job.company || '').toLowerCase();
      const location = (details.formatted_workplace_location || job.location || '').toLowerCase();
      const summary = (details.requirements_summary || job.job_information?.description || '').toLowerCase();
      const tools = (details.technical_tools || []).map(t => t.toLowerCase()).join(' ');

      const combinedText = `${title} ${company} ${location} ${summary} ${tools}`;

      // Query intent matching
      if (q.includes('remote') && (location.includes('remote') || details.formatted_workplace_location === 'Remote')) return true;
      if ((q.includes('intern') || q.includes('fresher')) && (title.includes('intern') || title.includes('fresher') || title.includes('junior') || summary.includes('fresher') || summary.includes('internship'))) return true;
      if (q.includes('backend') && (title.includes('backend') || tools.includes('go') || tools.includes('ruby') || tools.includes('python') || tools.includes('api'))) return true;

      return tokens.some(token => combinedText.includes(token));
    });
  };

  const baseJobs = user ? jobs : mockDummyJobs;
  let allKnownJobs = [...baseJobs];
  Object.values(likedJobObjects).forEach(lJob => {
    const lId = String(lJob._id || lJob.id || '');
    if (lId && !allKnownJobs.some(j => String(j._id || j.id || '') === lId)) {
      allKnownJobs.push(lJob);
    }
  });

  const displayedJobs = filterJobsList(allKnownJobs, search);

  return (
    <div style={{ background: 'radial-gradient(circle at top center, #eef2ff, #f8fafc 70%)', minHeight: '100vh', marginTop: '-6rem', paddingBottom: '4rem' }}>
      
      {/* 1. FLOATING GLASS NAVBAR WITH FRAMER MOTION SCROLL ANIMATION */}
      <motion.header 
        className="floating-navbar"
        initial={{ width: '90%', maxWidth: '1200px' }}
        animate={{ 
          width: scrolled ? '84%' : '90%',
          maxWidth: scrolled ? '1060px' : '1200px',
          padding: scrolled ? '0.5rem 1.4rem' : '0.75rem 2rem',
          boxShadow: scrolled ? '0 20px 45px rgba(0, 0, 0, 0.14)' : '0 10px 40px rgba(15, 23, 42, 0.06)',
          background: scrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.78)',
          borderRadius: scrolled ? '40px' : '50px'
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}
      >
        <Link href="/" style={{ textDecoration: 'none', fontSize: scrolled ? '1.2rem' : '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'font-size 0.2s ease', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Hirenova
        </Link>

        <div style={{ display: 'flex', gap: scrolled ? '0.75rem' : '1.2rem', alignItems: 'center', fontSize: scrolled ? '0.78rem' : '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s ease', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <a href="#extension-guide" style={{ textDecoration: 'none', color: 'inherit' }}>Extension</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}>How it Works</a>
          <a href="#market-trends" style={{ textDecoration: 'none', color: 'inherit' }}>Market Trends</a>
          <a href="#resume-upload" style={{ textDecoration: 'none', color: 'inherit' }}>Upload Resume</a>
          <a href="#collections" style={{ textDecoration: 'none', color: 'inherit' }}>Job Collections</a>
        </div>
        
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {!checkingSession && (
            user ? (
              <>
                <Link href="/dashboard" className="shad-btn shad-btn-primary" style={{ borderRadius: '25px', display: 'flex', gap: '0.4rem', height: scrolled ? '2rem' : '2.2rem', fontSize: scrolled ? '0.78rem' : '0.83rem', whiteSpace: 'nowrap' }}>
                  AI Command Center <Sparkles size={14} />
                </Link>
                <button onClick={handleLogout} className="shad-btn shad-btn-outline" style={{ borderRadius: '25px', display: 'flex', gap: '0.4rem', height: scrolled ? '2rem' : '2.2rem', fontSize: scrolled ? '0.78rem' : '0.83rem', whiteSpace: 'nowrap' }}>
                  Sign Out <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="shad-btn shad-btn-outline" style={{ borderRadius: '25px', height: scrolled ? '2rem' : '2.2rem', fontSize: scrolled ? '0.78rem' : '0.83rem', whiteSpace: 'nowrap' }}>
                  Log In
                </Link>
                <Link href="/signup" className="shad-btn shad-btn-primary" style={{ borderRadius: '25px', height: scrolled ? '2rem' : '2.2rem', fontSize: scrolled ? '0.78rem' : '0.83rem', whiteSpace: 'nowrap' }}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </motion.header>

      {/* TOP SPACING CONTAINER OFFSET BELOW FLOATING NAVBAR */}
      <div className="container" style={{ paddingTop: '6.5rem' }}>

        {/* 2. AI SEARCH HERO */}
        <section className="hero animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="hero-title-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="shad-badge shad-badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', marginBottom: '1.25rem', background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
              <Sparkles size={13} style={{ color: 'var(--brand-violet)' }} />
              Next-Gen AI Career Platform
            </div>
            <h1 style={{ fontSize: '3.8rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '1.25rem', lineHeight: '1.15', fontFamily: 'var(--font-title)' }}>
              Your Dream Job Exists.<br/>We Have Seen The Internet.
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
              Search millions of indexed opportunities via natural language, test your resume against <strong>6-Second Recruiter Simulators</strong>, and automate applications with our <strong>Journey Kanban</strong>.
            </p>

            {/* Real-Time Functional AI Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
              <div className="search-bar-icon-wrap">
                <Search size={20} />
              </div>
              <input 
                ref={searchInputRef}
                type="text"
                className="search-bar-input"
                placeholder='Search: "High paying backend jobs", "Remote AI internship", "Startups hiring freshers"...'
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <button 
                  type="button" 
                  onClick={handleClearSearch} 
                  className="search-bar-clear-btn"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="search-bar-kbd">/</kbd>
              <button 
                type="submit"
                className="shad-btn shad-btn-primary search-bar-submit-btn"
              >
                Search AI
              </button>
            </form>

            {/* Quick Intent Prompts */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              <span>Try intent queries:</span>
              {[
                "High paying backend jobs",
                "Remote AI internship",
                "Startups hiring freshers",
                "Companies similar to Stripe"
              ].map((promptStr, pIdx) => (
                <button 
                  key={pIdx}
                  onClick={() => { setSearch(promptStr); fetchData(1, promptStr, false); }}
                  className="shad-badge shad-badge-outline hover-lift"
                  style={{ cursor: 'pointer', fontSize: '0.72rem', background: '#fff' }}
                >
                  "{promptStr}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. TRUSTED BY COMPANIES */}
        <section style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Direct Applications & Crawl Index Integrated With Top Tech Engineering Teams
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '1.5rem', opacity: 0.75 }}>
            {['Stripe', 'Google', 'Vercel', 'Linear', 'Supabase', 'Figma', 'OpenAI', 'Microsoft'].map((comp, cIdx) => (
              <span key={cIdx} style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '-0.5px' }}>
                {comp}
              </span>
            ))}
          </div>
        </section>

        {/* 4. RESUME UPLOAD CTA - REDESIGNED PREMIUM GLASSMORPHIC CARD */}
        <section id="resume-upload" className="shad-card hover-lift" style={{ padding: '3.5rem 3rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', borderRadius: '28px', marginBottom: '5rem', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)', border: '1px solid rgba(226, 232, 240, 0.8)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle Ambient Glow Blobs */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(24, 24, 27, 0.06) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(22, 163, 74, 0.06) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div className="shad-badge" style={{ background: 'rgba(9, 9, 11, 0.05)', color: '#09090b', borderColor: 'rgba(9, 9, 11, 0.15)', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                <Zap size={13} style={{ color: 'var(--brand-green)' }} /> INSTANT AI PARSER ENGINE
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-title)', letterSpacing: '-0.8px', margin: '0 0 1rem 0', lineHeight: 1.25, color: '#0f172a' }}>
                Upload Your Resume to Unlock <span style={{ background: 'linear-gradient(135deg, #09090b 0%, #3f3f46 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</span>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.65', margin: '0 0 1.75rem 0' }}>
                Our two-stage regex pre-segregator & Gemini parser extracts skills, YOE, and projects to run <strong>6-Second Recruiter Simulations</strong> and calculate 7-factor ATS match vectors.
              </p>

              {/* Feature Bullet Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {[
                  { text: '7-Factor ATS Match Score', icon: Award },
                  { text: '6-Sec Recruiter Simulator', icon: Sparkles },
                  { text: 'Automated Skill Gap Analysis', icon: CheckCircle2 },
                  { text: '100% Private Local Storage', icon: ShieldCheck }
                ].map((feat, fIdx) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FeatIcon size={13} />
                      </div>
                      <span>{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Drag & Drop Box Card */}
            <form 
              onSubmit={handleLandingResumeUpload}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) setResumeFile(file);
              }}
              style={{ 
                background: isDraggingOver ? 'rgba(244, 244, 245, 0.95)' : '#ffffff', 
                border: isDraggingOver ? '2px dashed #09090b' : '2px dashed rgba(9, 9, 11, 0.18)', 
                borderRadius: '24px', 
                padding: '2.25rem 2rem', 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1rem',
                boxShadow: isDraggingOver ? '0 12px 30px rgba(9, 9, 11, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => {
                const inputEl = document.getElementById('landing-resume-file-input');
                if (inputEl) inputEl.click();
              }}
            >
              <input 
                id="landing-resume-file-input"
                type="file" 
                accept=".pdf,.txt,.doc,.docx" 
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />

              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #09090b, #27272a)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(9, 9, 11, 0.2)', transition: 'transform 0.3s ease' }} className="hover-lift">
                <UploadCloud size={30} />
              </div>

              {!resumeFile ? (
                <>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-title)' }}>
                      Drag & Drop your resume here
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
                      or <span style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline' }}>browse from your PC</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['PDF', 'DOCX', 'TXT'].map((ext, eIdx) => (
                      <span key={eIdx} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(0,0,0,0.05)' }}>
                        {ext}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {resumeFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Parse
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); setUploadMessage(''); }} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!resumeFile || uploadingResume}
                onClick={(e) => e.stopPropagation()}
                className="shad-btn shad-btn-primary" 
                style={{ width: '100%', borderRadius: '12px', height: '2.85rem', fontSize: '0.92rem', fontWeight: 700, background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)', boxShadow: '0 6px 18px rgba(9, 9, 11, 0.18)', transition: 'all 0.2s ease' }}
              >
                {uploadingResume ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <span className="spinner" style={{ width: '16px', height: '16px' }} />
                    {uploadProgressStage || 'Processing Resume...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                    Upload & View Command Center <ArrowRight size={15} />
                  </span>
                )}
              </button>

              {uploadMessage && (
                <div style={{ fontSize: '0.82rem', color: uploadMessage.includes('⚠️') || uploadMessage.includes('Failed') ? '#ef4444' : 'var(--brand-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {uploadMessage.includes('⚠️') ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  {uploadMessage}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* 5. LIVE HIRING ACTIVITY - HIGH TECH RADAR MARQUEE STREAM */}
        <section className="shad-card hover-lift" style={{ padding: '1rem 1.5rem', background: '#09090b', color: '#ffffff', marginBottom: '5rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 15px 40px rgba(9, 9, 11, 0.25)', display: 'flex', alignItems: 'center', gap: '1.5rem', overflow: 'hidden', position: 'relative' }}>
          
          {/* Radar Header Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.5rem 0.9rem', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.15)', flexShrink: 0, zIndex: 2 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 12px #16a34a', display: 'inline-block' }} />
            <strong style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
              LIVE RADAR
            </strong>
          </div>

          {/* Marquee Infinite Ticker Stream */}
          <div style={{ overflow: 'hidden', flexGrow: 1, position: 'relative', maskImage: 'linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)' }}>
            <div className="ticker-track">
              {[
                { icon: Zap, text: 'Stripe posted 3 Senior Backend Engineer roles ($195k)', time: '2m ago', color: '#16a34a' },
                { icon: Sparkles, text: 'Recruiter ran 12 candidate ATS match vector simulations', time: '5m ago', color: '#6366f1' },
                { icon: Globe, text: 'Vercel listed Developer Advocate position (Remote)', time: '12m ago', color: '#38bdf8' },
                { icon: Building2, text: 'Linear hiring Product Engineer in London (Hybrid)', time: '18m ago', color: '#f59e0b' },
                { icon: Database, text: '1,280+ Active Tech Postings Indexed in Real-Time', time: 'Live', color: '#a855f7' },
                { icon: ShieldCheck, text: 'Gemini 1.5 Flash Parser synced 100% private local storage', time: 'Verified', color: '#16a34a' },
                // Duplicated for continuous smooth marquee loop
                { icon: Zap, text: 'Stripe posted 3 Senior Backend Engineer roles ($195k)', time: '2m ago', color: '#16a34a' },
                { icon: Sparkles, text: 'Recruiter ran 12 candidate ATS match vector simulations', time: '5m ago', color: '#6366f1' },
                { icon: Globe, text: 'Vercel listed Developer Advocate position (Remote)', time: '12m ago', color: '#38bdf8' },
                { icon: Building2, text: 'Linear hiring Product Engineer in London (Hybrid)', time: '18m ago', color: '#f59e0b' },
                { icon: Database, text: '1,280+ Active Tech Postings Indexed in Real-Time', time: 'Live', color: '#a855f7' },
                { icon: ShieldCheck, text: 'Gemini 1.5 Flash Parser synced 100% private local storage', time: 'Verified', color: '#16a34a' }
              ].map((evt, eIdx) => {
                const EvtIcon = evt.icon;
                return (
                  <div key={eIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 600 }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: evt.color, flexShrink: 0 }}>
                      <EvtIcon size={12} />
                    </div>
                    <span>{evt.text}</span>
                    <span style={{ fontSize: '0.7rem', color: '#71717a', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {evt.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Counter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, zIndex: 2 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
              1,280+ Active
            </span>
          </div>

        </section>

        {/* 6. FEATURED JOB COLLECTIONS */}
        <section id="collections" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: 0 }}>
              Featured Job Collections
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to filter indexed directory</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'ai', label: 'Top AI Startups', icon: Sparkles, query: 'AI LLM Python' },
              { id: 'remote', label: '100% Remote Roles', icon: Globe, query: 'Remote' },
              { id: 'high_pay', label: 'High Compensation ($150k+)', icon: Coins, query: 'Senior Staff' },
              { id: 'early', label: 'Early Career & Internships', icon: Briefcase, query: 'Intern Junior' },
              { id: 'liked', label: `❤️ Liked Jobs (${likedJobIds.length})`, icon: Heart, query: '' }
            ].map(col => {
              const IconComp = col.icon;
              return (
                <div 
                  key={col.id}
                  onClick={() => {
                    setSelectedCollection(col.id);
                    if (col.id === 'liked') {
                      setSearch('');
                    } else {
                      handleCollectionSelect(col.id, col.query);
                    }
                  }}
                  className="shad-card hover-lift"
                  style={{ 
                    padding: '1.5rem', 
                    background: selectedCollection === col.id ? (col.id === 'liked' ? '#ef4444' : '#09090b') : '#fff', 
                    color: selectedCollection === col.id ? '#fff' : 'var(--text-primary)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '0.6rem',
                    fontWeight: 700
                  }}
                >
                  <IconComp size={18} />
                  <span>{col.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. AI JOB CARDS & CATEGORY DIRECTORY */}
        <section id="job-listings" style={{ marginBottom: '5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: 0 }}>
                Active AI Job Directory ({totalJobs || displayedJobs.length})
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Explore open roles across all tech specializations</span>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-tertiary)', background: '#f1f5f9', padding: '0.35rem 0.8rem', borderRadius: '15px' }}>
              Page {page} of {totalPages || 1}
            </div>
          </div>

          {/* Interactive Job Category Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id, cat.query)}
                className="shad-badge"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRadius: '20px',
                  border: '1px solid',
                  background: selectedCategory === cat.id ? '#09090b' : '#fff',
                  color: selectedCategory === cat.id ? '#fff' : 'var(--text-primary)',
                  borderColor: selectedCategory === cat.id ? '#09090b' : 'hsl(var(--border))',
                  boxShadow: selectedCategory === cat.id ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Skeleton Loaders during search fetching */}
          {loading && user ? (
            <div className="jobs-grid">
              {[1, 2, 3, 4, 5, 6].map(sIdx => (
                <div key={sIdx} className="shad-card" style={{ background: '#fff', padding: '1.5rem', height: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ height: '30px', width: '60%' }} />
                  <div className="skeleton-box" style={{ height: '20px', width: '40%' }} />
                  <div className="skeleton-box" style={{ height: '50px', width: '100%' }} />
                </div>
              ))}
            </div>
          ) : displayedJobs.length === 0 ? (
            /* Elegant Empty State Illustration */
            <div className="shad-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {selectedCollection === 'liked' ? (
                <>
                  <Heart size={48} style={{ color: '#ef4444' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>No Liked Jobs Saved Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '440px', margin: 0 }}>
                    Click the ❤️ heart icon on any job card to save it to your personal Liked Jobs collection.
                  </p>
                  <button 
                    onClick={() => { setSearch(''); setSelectedCollection('all'); setSelectedCategory('all'); fetchData(1, '', false); }}
                    className="shad-btn shad-btn-primary" 
                    style={{ borderRadius: '20px' }}
                  >
                    Explore All Open Jobs
                  </button>
                </>
              ) : (
                <>
                  <SearchX size={48} style={{ color: 'var(--text-tertiary)' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>No Jobs Match Your Query</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '440px', margin: 0 }}>
                    Try searching for broader technical terms like "React", "Python", "Full Stack", or clear your filter parameters.
                  </p>
                  <button 
                    onClick={() => { setSearch(''); setSelectedCollection('all'); setSelectedCategory('all'); fetchData(1, '', false); }}
                    className="shad-btn shad-btn-outline" 
                    style={{ borderRadius: '20px' }}
                  >
                    Clear Search Filter
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{ filter: !user ? 'blur(6px)' : 'none', pointerEvents: !user ? 'none' : 'auto', userSelect: !user ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
              <div className="jobs-grid">
                {displayedJobs.map((job) => {
                  const jobId = String(job._id || job.id || '');
                  const details = job.v5_processed_job_data || {};
                  const skills = details.technical_tools || [];
                  const companyName = details.company_name || job.company || 'Unknown Company';
                  const jobTitle = job.job_information?.title || details.core_job_title || job.title || 'Software Specialist';
                  const compString = formatCompensation(details);
                  const logoUrl = getCompanyLogoUrl(job);
                  const isLiked = likedJobIds.includes(jobId);
                  const isKanbanSaved = savedKanbanJobIds.includes(jobId);

                  return (
                    <div 
                      key={jobId} 
                      onClick={() => openJobDrawer({ ...job, company: companyName, title: jobTitle, requirementsSummary: details.requirements_summary || job.job_information?.description, applyUrl: job.apply_url })} 
                      className="shad-card hover-lift" 
                      style={{ background: '#fff', cursor: 'pointer' }}
                    >
                      <div className="shad-card-header" style={{ padding: 0 }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: getGradientForCompany(companyName), color: '#fff', fontWeight: 700, flexShrink: 0, position: 'relative' }}>
                              {logoUrl ? (
                                <img 
                                  src={logoUrl} 
                                  alt={companyName} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : null}
                              <span style={{ position: logoUrl ? 'absolute' : 'static', zIndex: 0 }}>
                                {companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{highlightText(companyName, search)}</h3>
                              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.1rem' }}>{highlightText(jobTitle, search)}</h2>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLikeJob(jobId, job); }}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                            title={isLiked ? "Unlike job" : "Like job"}
                          >
                            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#a1a1aa'} />
                          </button>
                        </div>
                      </div>

                      <div className="shad-card-content" style={{ padding: 0, marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.5rem 0' }}>
                          <div className="shad-badge shad-badge-secondary" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem' }}>
                            <MapPin size={11} /> {details.formatted_workplace_location || job.location || 'Remote'}
                          </div>
                          <div className="shad-badge shad-badge-outline" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem', color: 'var(--brand-green)' }}>
                            <Coins size={11} /> {compString}
                          </div>
                        </div>

                        {(details.requirements_summary || job.job_information?.description) && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {highlightText(details.requirements_summary || job.job_information?.description, search)}
                          </p>
                        )}

                        {skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                            {skills.slice(0, 4).map((skill, index) => (
                              <span key={index} className="shad-badge shad-badge-outline" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                                {highlightText(skill, search)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shad-card-footer" style={{ padding: '0.75rem 0 0 0', marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); saveJobToKanban(job); }}
                          className="shad-btn shad-btn-outline"
                          style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem', justifyContent: 'center', color: isKanbanSaved ? 'var(--brand-green)' : undefined, borderColor: isKanbanSaved ? 'rgba(22,163,74,0.3)' : undefined }}
                        >
                          {isKanbanSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                          {isKanbanSaved ? 'Saved' : 'Save to Kanban'}
                        </button>
                        <a href={job.apply_url || '#'} target="_blank" rel="noopener noreferrer" className="shad-btn shad-btn-primary" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}>
                          Apply Now
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                  <button 
                    disabled={page === 1}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      fetchData(newPage, search, false);
                      document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="shad-btn shad-btn-outline"
                    style={{ borderRadius: '10px', padding: '0.4rem 0.85rem', fontSize: '0.85rem', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                  >
                    ← Previous
                  </button>

                  {getPaginationRange(page, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} style={{ padding: '0 0.3rem', color: 'var(--text-tertiary)', fontWeight: 700, fontSize: '0.9rem' }}>
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        onClick={() => {
                          setPage(item);
                          fetchData(item, search, false);
                          document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={page === item ? "shad-btn shad-btn-primary" : "shad-btn shad-btn-outline"}
                        style={{ borderRadius: '8px', minWidth: '36px', height: '36px', padding: 0, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {item}
                      </button>
                    );
                  })}

                  <button 
                    disabled={page === totalPages}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchData(newPage, search, false);
                      document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="shad-btn shad-btn-outline"
                    style={{ borderRadius: '10px', padding: '0.4rem 0.85rem', fontSize: '0.85rem', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Auth Blur Lock overlay */}
          {!user && !checkingSession && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10, borderRadius: '24px', paddingTop: '4rem' }}>
              <div className="shad-card" style={{ maxWidth: '480px', width: '90%', padding: '3rem 2rem', textAlign: 'center', background: '#fff', boxShadow: 'var(--shadow-lg)' }}>
                <Lock size={32} style={{ color: 'var(--text-primary)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Unlock Active Job Directory</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Log in to view 1,200+ indexed listings, calculate match scores, and run recruiter simulations.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link href="/login" className="shad-btn shad-btn-primary" style={{ borderRadius: '25px', width: '120px' }}>Log In</Link>
                  <Link href="/signup" className="shad-btn shad-btn-outline" style={{ borderRadius: '25px', width: '120px' }}>Sign Up</Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 8. "HOW HIRENOVA WORKS" - REDESIGNED macOS APPLICATION WINDOW */}
        <section id="how-it-works" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="shad-badge shad-badge-outline" style={{ marginBottom: '0.75rem' }}>
              <Terminal size={12} style={{ marginRight: '0.3rem' }} /> Live System Demo
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: 0 }}>
              How Hirenova Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.4rem', marginBottom: '1.25rem' }}>
              Watch how our AI Command Center parses resumes, calculates ATS vectors, and automates applications.
            </p>
            <button 
              onClick={() => setIsExtensionGuideOpen(true)}
              className="shad-btn shad-btn-primary hover-lift"
              style={{ borderRadius: '25px', padding: '0.6rem 1.4rem', fontSize: '0.9rem', fontWeight: 700, gap: '0.4rem' }}
            >
              <Zap size={16} /> How to Install & Use Extension on PC ↗
            </button>
          </div>

          {/* macOS-Style Window Container with GSAP ScrollTrigger Right to Left Entrance */}
          <div 
            ref={macOsWindowRef} 
            className="macos-window" 
            style={{ maxWidth: '960px', margin: '0 auto', willChange: 'transform, opacity' }}
          >
            {/* Window Title Bar */}
            <div className="macos-titlebar">
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span className="macos-dot macos-dot-red" />
                <span className="macos-dot macos-dot-yellow" />
                <span className="macos-dot macos-dot-green" />
              </div>
              <div style={{ flexGrow: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginRight: '3rem' }}>
                Hirenova Platform Walkthrough.mp4
              </div>
            </div>

            {/* Embedded 16:9 Video Container with Skeleton Placeholder */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#09090b' }}>
              {videoLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '1rem' }}>
                  <div className="loading-spinner"></div>
                  <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Initializing video player...</span>
                </div>
              )}
              <iframe
                src=" https://www.youtube.com/embed/4j6cnYKp5q0?si=UxuZM0AWctNIh9fo"
                title="Hirenova Platform Walkthrough"
                onLoad={() => setVideoLoading(false)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* 9. MARKET TRENDS & SALARY INSIGHTS */}
        <section id="market-trends" className="shad-card hover-lift" style={{ padding: '2.5rem', background: '#fff', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-title)', marginBottom: '1.5rem' }}>
            Real-Time Market Trends & Salary Insights
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.015)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI & LLM Engineering</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-green)', margin: '0.2rem 0' }}>↑ +32%</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Avg Compensation: $168k / yr</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.015)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>React & Next.js Web</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-green)', margin: '0.2rem 0' }}>↑ +14%</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Avg Compensation: $145k / yr</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.015)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rust Systems</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-green)', margin: '0.2rem 0' }}>↑ +22%</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Avg Compensation: $175k / yr</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.015)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cloud & DevOps</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-green)', margin: '0.2rem 0' }}>↑ +18%</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Avg Compensation: $155k / yr</span>
            </div>
          </div>
        </section>

        {/* DEDICATED CHROME EXTENSION INSTALLATION HUB & GUIDE SECTION */}
        <section id="extension-guide" className="shad-card hover-lift" style={{ padding: '4rem 3rem', background: '#09090b', color: '#ffffff', borderRadius: '32px', marginBottom: '5rem', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle Ambient Backlight Glow Blobs */}
          <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(22, 163, 74, 0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '3.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            
            {/* Left Column: Heading & Quick Download Links */}
            <div>
              <div className="shad-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                <Zap size={14} style={{ color: '#16a34a' }} /> BROWSER AGENT MANIFEST V3
              </div>

              <h2 style={{ fontSize: '2.6rem', fontWeight: 800, fontFamily: 'var(--font-title)', letterSpacing: '-1px', margin: '0 0 1.2rem 0', lineHeight: 1.2, color: '#ffffff' }}>
                Install Hirenova Extension on <span style={{ background: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your PC Browser</span>
              </h2>

              <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: '1.7', margin: '0 0 2rem 0' }}>
                Supercharge your job hunt. Automatically autofill profile fields and attach your local resume across <strong>Greenhouse, Lever, Workday, LinkedIn, and Indeed</strong> in 1-click.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <a 
                  href="https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="shad-btn hover-lift" 
                  style={{ background: '#ffffff', color: '#09090b', fontWeight: 800, padding: '0.85rem 1.6rem', borderRadius: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.95rem', boxShadow: '0 8px 24px rgba(255,255,255,0.15)' }}
                >
                  <Globe size={18} /> Open Extension Repository on GitHub ↗
                </a>

                <button 
                  onClick={() => setIsExtensionGuideOpen(true)}
                  className="shad-btn"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.18)', fontWeight: 700, padding: '0.8rem 1.6rem', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                >
                  <Sparkles size={16} style={{ color: '#16a34a' }} /> View Interactive Keyboard Shortcuts
                </button>
              </div>

              {/* Supported Platforms Tag Row */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compatible Browsers:</span>
                {['Google Chrome', 'Brave Browser', 'Microsoft Edge', 'Chromium'].map((bName, bIdx) => (
                  <span key={bIdx} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {bName}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: 4-Step Interactive Pipeline Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Step 1 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.35rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)' }}>
                  01
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-title)' }}>
                    Download or Clone <code>/extension</code> Folder
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    Download the project ZIP from GitHub or run <code>git clone</code>. Locate the <code>/extension</code> subfolder on your PC.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.35rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #09090b, #27272a)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  02
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-title)' }}>
                    Open <code>chrome://extensions</code> & Enable Developer Mode
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    In your browser address bar, type <code>chrome://extensions</code> and turn on the <strong>Developer mode</strong> toggle switch in the top right.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.35rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #09090b, #27272a)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  03
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-title)' }}>
                    Click "Load unpacked" & Select Folder
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    Click <strong>Load unpacked</strong> (top left header) and select the <code>/extension</code> folder containing <code>manifest.json</code>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(22, 163, 74, 0.3)', borderRadius: '18px', padding: '1.35rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)' }}>
                  04
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-title)' }}>
                    Pin Extension & Press <code>Alt + Shift + A</code>
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    Pin 📌 Hirenova Agent to your toolbar. Visit any application form and press <strong><code>Alt + Shift + A</code></strong> for 1-click autofill & resume attaching!
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 10. SUCCESS STORIES & FINAL CTA */}
        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="shad-card" style={{ background: '#09090b', color: '#fff', padding: '4rem 2rem', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>
              Ready to Land Your Dream Job?
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Join thousands of developers using Hirenova's AI Command Center to optimize resumes, run recruiter simulations, and automate applications.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/signup" className="shad-btn shad-btn-primary hover-lift" style={{ background: '#fff', color: '#09090b', borderRadius: '30px', padding: '0 2rem', height: '2.8rem', fontWeight: 700 }}>
                Get Started Free
              </Link>
              <Link href="/dashboard" className="shad-btn shad-btn-outline hover-lift" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '30px', padding: '0 2rem', height: '2.8rem' }}>
                Open AI Command Center
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* REDESIGNED SLEEK DARK GLASS FOOTER WITH TIGHT MARGINS */}
      <footer style={{ background: '#09090b', color: '#ffffff', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2.5rem', paddingBottom: '1.25rem', marginTop: '2.5rem', marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Subtle ambient lighting blob */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }} />
        
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.3fr', gap: '3rem', marginBottom: '2.5rem', paddingTop: 0, paddingBottom: 0 }}>
          
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 10px #16a34a' }} />
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
                Hirenova
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.15)' }}>
                AI Native
              </span>
            </div>
            
            <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: '1.65', margin: '0 0 1.5rem 0', maxWidth: '340px' }}>
              The AI-native career command platform empowering developers to analyze resumes, simulate recruiter scans, and land technical roles faster.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <a href="https://github.com/nickhil-verma/hirenova_jobscraper" target="_blank" rel="noreferrer" className="hover-lift" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="GitHub Repository">
                <Globe size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover-lift" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Twitter / X">
                <Share2 size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover-lift" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="LinkedIn">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#71717a', display: 'block', marginBottom: '1.25rem', fontWeight: 700 }}>
              Product Features
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: '#d4d4d8', transition: 'color 0.2s ease' }} className="hover-text-white">AI Command Center ↗</Link>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: '#d4d4d8', transition: 'color 0.2s ease' }}>Resume Analyzer & Heatmap</Link>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: '#d4d4d8', transition: 'color 0.2s ease' }}>6-Sec Recruiter Simulator</Link>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: '#d4d4d8', transition: 'color 0.2s ease' }}>Application Journey Kanban</Link>
            </div>
          </div>

          {/* Column 3: Platform Resources */}
          <div>
            <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#71717a', display: 'block', marginBottom: '1.25rem', fontWeight: 700 }}>
              Platform Resources
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <a href="#how-it-works" style={{ textDecoration: 'none', color: '#d4d4d8' }}>System Video Demo</a>
              <button onClick={() => setIsExtensionGuideOpen(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#d4d4d8', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: '0.88rem' }}>
                Extension PC Setup Guide ↗
              </button>
              <a href="#market-trends" style={{ textDecoration: 'none', color: '#d4d4d8' }}>Market Trends & Salary Index</a>
              <a href="#resume-upload" style={{ textDecoration: 'none', color: '#d4d4d8' }}>Upload Resume PDF</a>
              <Link href="/admin" className="shad-badge" style={{ textDecoration: 'none', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', width: 'fit-content', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', marginTop: '0.3rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}>
                <ShieldCheck size={14} style={{ color: '#16a34a' }} /> Admin Console ↗
              </Link>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#71717a', display: 'block', marginBottom: '1.25rem', fontWeight: 700 }}>
              Stay Ahead in Tech
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: '1.5', marginBottom: '1rem' }}>
              Weekly tech salary benchmarks, AI application trends, and engineering role alerts.
            </p>
            {newsletterSubscribed ? (
              <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                ✓ Subscribed! You will receive weekly updates.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setNewsletterSubscribed(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="dev@company.com" 
                    className="shad-input" 
                    style={{ fontSize: '0.85rem', height: '2.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '10px' }}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button type="submit" className="shad-btn" style={{ height: '2.4rem', padding: '0 1rem', background: '#ffffff', color: '#09090b', fontWeight: 700, borderRadius: '10px', flexShrink: 0 }}>
                    Subscribe
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#71717a' }}>🔒 Zero spam. Unsubscribe anytime.</span>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', paddingBottom: '1.25rem', marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.82rem', color: '#71717a' }}>
          <div>
            <span>© 2026 Hirenova • Built for Software Engineers by <a href="https://github.com/nickhil-verma" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>Nickhil Verma</a></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(22, 163, 74, 0.2)', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} /> All Systems Operational
            </span>
            <span className="shad-badge" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }}>v2.4.0</span>
            <button onClick={scrollToTop} className="shad-btn" style={{ borderRadius: '20px', height: '2rem', padding: '0 0.8rem', fontSize: '0.78rem', gap: '0.25rem', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              Top <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </footer>

      {/* CHROME EXTENSION INSTALLATION & USAGE MODAL */}
      {isExtensionGuideOpen && (
        <div className="shad-drawer-overlay" onClick={() => setIsExtensionGuideOpen(false)} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="shad-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '740px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 60px rgba(9, 9, 11, 0.25)', position: 'relative' }}>
            <button onClick={() => setIsExtensionGuideOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div className="shad-badge" style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--brand-green)', borderColor: 'rgba(22, 163, 74, 0.2)', fontWeight: 700 }}>
                <Zap size={13} style={{ marginRight: '0.3rem' }} /> CHROME EXTENSION MANIFEST V3
              </div>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: '0 0 0.5rem 0', color: '#09090b' }}>
              Install & Work with Hirenova Extension on PC
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Autofill job applications and auto-attach your PC resume across Greenhouse, Lever, Workday, LinkedIn & Indeed in 1-click.
            </p>

            <a 
              href="https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension" 
              target="_blank" 
              rel="noreferrer" 
              className="shad-btn shad-btn-primary hover-lift" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.75rem 1.25rem', textDecoration: 'none', marginBottom: '1.75rem', fontWeight: 700 }}
            >
              <Globe size={16} /> Open Extension Repository Folder on GitHub ↗
            </a>

            {/* Step-by-Step Installation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>STEP 1</div>
                <strong style={{ fontSize: '0.95rem', color: '#09090b', display: 'block', marginBottom: '0.3rem' }}>Download / Clone Folder</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Download the GitHub ZIP or run <code>git clone</code>. Locate the <code>/extension</code> folder containing <code>manifest.json</code>.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>STEP 2</div>
                <strong style={{ fontSize: '0.95rem', color: '#09090b', display: 'block', marginBottom: '0.3rem' }}>Open Extensions Page</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  In Chrome, Brave, or Edge, visit <code>chrome://extensions</code> and turn on <strong>Developer mode</strong> (top right toggle).
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>STEP 3</div>
                <strong style={{ fontSize: '0.95rem', color: '#09090b', display: 'block', marginBottom: '0.3rem' }}>Click "Load unpacked"</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Click the <strong>Load unpacked</strong> button (top left header) and select your local PC <code>/extension</code> folder.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>STEP 4</div>
                <strong style={{ fontSize: '0.95rem', color: '#09090b', display: 'block', marginBottom: '0.3rem' }}>Pin & 1-Click Autofill</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Pin 📌 the extension icon. Press <strong><code>Alt + Shift + A</code></strong> on any job form to autofill and attach resume!
                </p>
              </div>
            </div>

            {/* Keyboard Shortcuts Table */}
            <div style={{ background: '#09090b', color: '#ffffff', borderRadius: '14px', padding: '1.25rem' }}>
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa', display: 'block', marginBottom: '0.75rem' }}>
                ⚡ Shortcut Reference Legend
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>1-GO Master Autofill & Resume Attach</span>
                  <code style={{ background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: '#fff' }}>Alt + Shift + A</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Cycle Overlay Pill (Expanded / Minimized / Hidden)</span>
                  <code style={{ background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: '#fff' }}>Ctrl + Q</code>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SLIDE-OVER JOB DETAIL DRAWER */}
      {isDrawerOpen && selectedJobForDrawer && (
        <div className="shad-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="shad-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{selectedJobForDrawer.company}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{selectedJobForDrawer.title}</h2>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="shad-btn shad-btn-ghost" style={{ padding: '0.4rem' }}><X size={20} /></button>
            </div>

            <div className="shad-card" style={{ background: '#fff', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recruiter Intelligence</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <div>Hiring Trend: <span style={{ color: 'var(--brand-green)', fontWeight: 700 }}>↑ Active Expansion</span></div>
                <div>Avg Response Time: <strong>5 Days</strong></div>
                <div>Likely Interview Rounds: <strong>3 Rounds</strong></div>
                <div>Questions Asked: <em>Graphs, RAG, Python, System Scale</em></div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Requirements Summary</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '0.4rem' }}>
                {selectedJobForDrawer.requirementsSummary || 'Full stack technical role working with modern cloud services.'}
              </p>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
              <a href={selectedJobForDrawer.applyUrl || '#'} target="_blank" rel="noopener noreferrer" className="shad-btn shad-btn-primary" style={{ width: '100%', height: '2.75rem', justifyContent: 'center', textDecoration: 'none' }}>
                Apply Directly To Position
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

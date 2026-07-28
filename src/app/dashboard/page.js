'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Target,
  Zap,
  Bot,
  Home,
  LogOut,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  BrainCircuit,
  MapPin,
  Trophy,
  FolderGit2,
  Edit2,
  Eye,
  Kanban,
  Sparkles,
  TrendingUp,
  X,
  Search,
  Command,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Wand2,
  Coins,
  CheckCircle2,
  UserCheck,
  Save,
  RotateCcw,
  Globe,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  FileCode,
  Heart,
  BookmarkPlus,
  BookmarkCheck,
  GraduationCap,
  Camera
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();

  // Authentication & Profile States
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Sidebar Layout collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Active Main Section: 'command_center' | 'your_info' | 'resume_mgmt' | 'resume' | 'kanban' | 'matches' | 'coach'
  const [activeSection, setActiveSection] = useState('command_center');

  // Resume Versioning State
  const [activeResumeVersion, setActiveResumeVersion] = useState('v1_default');

  // Interactive Sub-score Modal State
  const [subscoreModal, setSubscoreModal] = useState(null);

  // Recruiter Simulation Mode
  const [isRecruiterView, setIsRecruiterView] = useState(false);
  const [recruiterSimModal, setRecruiterSimModal] = useState(false);
  const [recruiterSimData, setRecruiterSimData] = useState(null);
  const [simulatingRecruiter, setSimulatingRecruiter] = useState(false);

  // Slide Drawer State for Job Details
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Command Palette (Cmd+K)
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [cmdKQuery, setCmdKQuery] = useState('');

  // Dynamic Recommendations & Score State
  const [todoList, setTodoList] = useState([]);
  const [hiringScore, setHiringScore] = useState(86);
  const [percentileText, setPercentileText] = useState('Top 8% of Candidates');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Kanban Application Stages State
  const [kanbanItems, setKanbanItems] = useState([
    { id: '1', company: 'Stripe', title: 'Backend Engineer', location: 'Remote', match: 94, stage: 'applied', notes: 'Applied via direct candidate link.' },
    { id: '2', company: 'Sprinto', title: 'Full Stack Developer', location: 'Hybrid', match: 89, stage: 'interview', notes: 'First phone screen completed.' },
    { id: '3', company: 'Razorpay', title: 'Senior Software Engineer', location: 'Onsite', match: 84, stage: 'oa', notes: 'Online assessment link received.' },
    { id: '4', company: 'Google', title: 'Software Engineer II', location: 'Remote', match: 91, stage: 'saved', notes: 'Saved for resume tailoring.' },
    { id: '5', company: 'Amazon', title: 'Frontend Specialist', location: 'Remote', match: 78, stage: 'offer', notes: 'Offer letter under review.' },
    { id: '6', company: 'Meta', title: 'AI Applications Engineer', location: 'Hybrid', match: 82, stage: 'rejected', notes: 'Closed position.' }
  ]);

  // Kanban Dialog Modal States
  const [kanbanModalOpen, setKanbanModalOpen] = useState(false);
  const [kanbanModalMode, setKanbanModalMode] = useState('add');
  const [editingCard, setEditingCard] = useState({ id: '', company: '', title: '', location: 'Remote', match: 85, stage: 'saved', notes: '' });

  // Dedicated Resume Management Upload states
  const [mgmtFile, setMgmtFile] = useState(null);
  const [mgmtUploading, setMgmtUploading] = useState(false);
  const [mgmtProgressStage, setMgmtProgressStage] = useState('');
  const [mgmtSuccessMsg, setMgmtSuccessMsg] = useState('');
  const [mgmtErrorMsg, setMgmtErrorMsg] = useState('');

  // Job matches & Natural Language Search
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Career Coach Chat States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'coach', text: "Hello! I am your Hirenova AI Command Center Assistant. I've analyzed your candidate profile and active applications. How can I assist you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // "YOUR INFORMATION" PROFILE EDITING STATES
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoName, setInfoName] = useState('');
  const [infoJobTitle, setInfoJobTitle] = useState('');
  const [infoLevel, setInfoLevel] = useState('Mid-Level');
  const [infoDomain, setInfoDomain] = useState('Full Stack');
  const [infoEmail, setInfoEmail] = useState('');
  const [infoPhone, setInfoPhone] = useState('');
  const [infoLinksStr, setInfoLinksStr] = useState('');
  const [infoExperience, setInfoExperience] = useState('');
  const [infoSkills, setInfoSkills] = useState([]);
  const [infoAchievements, setInfoAchievements] = useState([]);
  const [infoProjects, setInfoProjects] = useState([]);

  // Expanded optional profile fields
  const [infoTitle, setInfoTitle] = useState('Mr.');
  const [infoPhoneExtension, setInfoPhoneExtension] = useState('+1');
  const [infoAddressLine1, setInfoAddressLine1] = useState('');
  const [infoAddressLine2, setInfoAddressLine2] = useState('');
  const [infoCity, setInfoCity] = useState('');
  const [infoLinkedin, setInfoLinkedin] = useState('');
  const [infoXTwitter, setInfoXTwitter] = useState('');
  const [infoGithub, setInfoGithub] = useState('');
  const [infoPortfolio, setInfoPortfolio] = useState('');
  const [infoPhotoPath, setInfoPhotoPath] = useState('');
  const [infoPhotoDataUrl, setInfoPhotoDataUrl] = useState('');
  const [infoPhotoFileName, setInfoPhotoFileName] = useState('');
  const [infoGender, setInfoGender] = useState('Male');
  const [infoRace, setInfoRace] = useState('White / Caucasian');
  const [infoDob, setInfoDob] = useState('2000-01-01');
  const [infoAge, setInfoAge] = useState('24');
  const [infoEducations, setInfoEducations] = useState([
    { degree: 'B.S. Computer Science', institution: 'State University', fieldOfStudy: 'Software Engineering', gradYear: '2024', gpa: '3.8 / 4.0' }
  ]);
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduInstitution, setNewEduInstitution] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduYear, setNewEduYear] = useState('');
  const [newEduGpa, setNewEduGpa] = useState('');

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? String(age) : '';
  };

  const [newSkillText, setNewSkillText] = useState('');
  const [newAchievementText, setNewAchievementText] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [saveInfoSuccess, setSaveInfoSuccess] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchKanbanItems = async () => {
    try {
      const res = await fetch('/api/kanban');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setKanbanItems(data.items);
        }
      }
    } catch (e) {
      console.error('Failed to fetch Kanban items from DB:', e);
    }
  };

  const saveKanbanItemsToDb = async (updatedItems) => {
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (e) {
      console.error('Failed to persist Kanban items to DB:', e);
    }
  };

  const [likedJobIds, setLikedJobIds] = useState([]);

  const fetchDynamicRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const res = await fetch('/api/ai/recommendations');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (typeof data.hiringScore === 'number') setHiringScore(data.hiringScore);
          if (data.percentileText) setPercentileText(data.percentileText);
          if (Array.isArray(data.recommendations)) setTodoList(data.recommendations);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dynamic AI recommendations:', e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          populateInfoFields(data.user);
          const firstName = data.user.name ? data.user.name.split(' ')[0] : 'Candidate';
          if (Array.isArray(data.user.chatHistory) && data.user.chatHistory.length > 0) {
            setChatMessages(data.user.chatHistory);
          } else {
            setChatMessages([
              { sender: 'coach', text: `Good day, ${firstName}! I am your Hirenova AI Command Center Assistant. How can I assist you with landing your target software engineering role today?` }
            ]);
          }
          if (Array.isArray(data.user.likedJobs)) {
            setLikedJobIds(data.user.likedJobs.map(String));
          }
          fetchKanbanItems();
          fetchDynamicRecommendations();
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (e) {
      console.error('Session verify failed:', e);
      router.push('/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const toggleLikeJob = async (jobId, jobData) => {
    const idStr = String(jobId);
    const isLiked = likedJobIds.includes(idStr);
    const updated = isLiked ? likedJobIds.filter(id => id !== idStr) : [...likedJobIds, idStr];
    setLikedJobIds(updated);

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
    const idStr = String(job.id || job.jobId || Date.now());

    const newCard = {
      id: idStr,
      company: job.company || 'Tech Company',
      title: job.title || 'Software Specialist',
      location: job.location || 'Remote',
      match: job.matchPercent || 88,
      stage: 'saved',
      notes: `Saved from Match Engine. Requirements: ${job.requirementsSummary || ''}`
    };

    let updatedList = [];
    if (!kanbanItems.some(c => String(c.id) === idStr)) {
      updatedList = [...kanbanItems, newCard];
      setKanbanItems(updatedList);
      await saveKanbanItemsToDb(updatedList);
    }
  };

  const populateInfoFields = (userData) => {
    if (!userData) return;
    setInfoName(userData.name || '');
    setInfoJobTitle(userData.jobTitle || 'Full Stack Engineer');
    setInfoLevel(userData.candidateLevel || 'Mid-Level');
    setInfoDomain(userData.domainOfInterest || 'Full Stack');
    setInfoEmail(userData.contact?.email || userData.email || '');
    setInfoPhone(userData.contact?.phone || userData.phone || '');
    setInfoLinksStr(userData.contact?.links?.join(', ') || '');
    setInfoExperience(userData.experience || '');
    setInfoSkills(userData.skills || []);
    setInfoAchievements(userData.achievements || []);
    setInfoProjects(userData.projects || []);

    setInfoTitle(userData.title || 'Mr.');
    setInfoPhoneExtension(userData.phoneExtension || '+1');
    setInfoAddressLine1(userData.addressLine1 || '');
    setInfoAddressLine2(userData.addressLine2 || '');
    setInfoCity(userData.city || '');
    setInfoLinkedin(userData.linkedin || '');
    setInfoXTwitter(userData.xTwitter || '');
    setInfoGithub(userData.github || '');
    setInfoPortfolio(userData.portfolio || '');
    setInfoPhotoPath(userData.photoPath || '');
    setInfoPhotoDataUrl(userData.photoDataUrl || '');
    setInfoGender(userData.gender || 'Male');
    setInfoRace(userData.race || 'White / Caucasian');
    setInfoDob(userData.dob || '2000-01-01');
    setInfoAge(userData.age || calculateAge(userData.dob || '2000-01-01'));
    if (Array.isArray(userData.educations) && userData.educations.length > 0) {
      setInfoEducations(userData.educations);
    }
  };

  const handlePassportPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInfoPhotoFileName(file.name);
    setInfoPhotoPath(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setInfoPhotoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDobChange = (newDob) => {
    setInfoDob(newDob);
    const computedAge = calculateAge(newDob);
    setInfoAge(computedAge);
  };

  const fetchMatches = async (queryTerm = searchQuery) => {
    setLoadingMatches(true);
    try {
      const url = queryTerm.trim() 
        ? `/api/jobs?search=${encodeURIComponent(queryTerm)}`
        : '/api/jobs/match';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (queryTerm.trim()) {
            const parsed = (data.jobs || []).map(j => {
              const details = j.v5_processed_job_data || {};
              return {
                jobId: j.id,
                title: j.job_information?.title || details.core_job_title || 'Software Specialist',
                company: details.company_name || j.company || 'Unknown Company',
                location: details.formatted_workplace_location || 'Remote / Hybrid',
                matchPercent: Math.floor(Math.random() * 20) + 80,
                matchBreakdown: {
                  overallMatch: 88,
                  technicalSkills: 92,
                  experience: 83,
                  projectsScore: 94,
                  resumeQuality: 79,
                  cultureFit: 85,
                  confidence: 91
                },
                matchedSkills: details.technical_tools?.slice(0, 4) || ['React', 'Node.js', 'TypeScript'],
                missingSkills: ['Kubernetes', 'AWS'],
                requiredSkills: details.technical_tools || [],
                requirementsSummary: details.requirements_summary || j.job_information?.description || '',
                applyUrl: j.apply_url,
                compensation: details
              };
            });
            setMatchedJobs(parsed);
          } else {
            const parsed = (data.matches || []).map(m => ({
              ...m,
              requirementsSummary: m.requirementsSummary || 'Full stack technical role working with modern cloud services.'
            }));
            setMatchedJobs(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Failed to retrieve job matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user && user.skills?.length > 0) {
      fetchMatches();
    }
  }, [user]);

  // Save Permanent Profile Info ("Your Information")
  const handleSaveYourInformation = async (e) => {
    if (e) e.preventDefault();
    setSavingInfo(true);
    setSaveInfoSuccess(false);
    const computedAge = calculateAge(infoDob);

    try {
      const res = await fetch('/api/resume/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: infoName,
          email: infoEmail,
          phone: infoPhone,
          title: infoTitle,
          phoneExtension: infoPhoneExtension,
          addressLine1: infoAddressLine1,
          addressLine2: infoAddressLine2,
          city: infoCity,
          linkedin: infoLinkedin,
          xTwitter: infoXTwitter,
          github: infoGithub,
          portfolio: infoPortfolio,
          photoPath: infoPhotoPath,
          photoDataUrl: infoPhotoDataUrl,
          gender: infoGender,
          race: infoRace,
          dob: infoDob,
          age: computedAge,
          educations: infoEducations,
          jobTitle: infoJobTitle,
          candidateLevel: infoLevel,
          domainOfInterest: infoDomain,
          skills: infoSkills,
          experience: infoExperience,
          contact: {
            email: infoEmail,
            phone: infoPhone,
            links: [infoLinkedin, infoXTwitter, infoGithub, infoPortfolio, ...infoLinksStr.split(',').map(s => s.trim())].filter(Boolean)
          },
          achievements: infoAchievements,
          projects: infoProjects
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingInfo(false);
        setSaveInfoSuccess(true);
        await checkSession();
        setTimeout(() => setSaveInfoSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile information:', err);
    } finally {
      setSavingInfo(false);
    }
  };

  // Dedicated Resume Management Upload & Replace
  const handleMgmtResumeUpload = async (e) => {
    e.preventDefault();
    if (!mgmtFile) return;
    setMgmtUploading(true);
    setMgmtErrorMsg('');
    setMgmtSuccessMsg('');
    setMgmtProgressStage('Uploading file...');

    const formData = new FormData();
    formData.append('resume', mgmtFile);
    try {
      setTimeout(() => setMgmtProgressStage('Extracting Text...'), 400);
      setTimeout(() => setMgmtProgressStage('AI Analysis & Vector Scoring...'), 900);
      setTimeout(() => setMgmtProgressStage('Saving Candidate Profile...'), 1400);

      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMgmtSuccessMsg('✓ Resume replaced & parsed successfully! ATS vectors refreshed.');
        setMgmtFile(null);
        await checkSession();
        fetchMatches();
      } else {
        setMgmtErrorMsg(data.error || 'Upload error.');
      }
    } catch (err) {
      setMgmtErrorMsg('Network upload connection failed.');
    } finally {
      setMgmtUploading(false);
    }
  };

  const handleAddSkillTag = () => {
    if (!newSkillText.trim()) return;
    if (!infoSkills.includes(newSkillText.trim())) {
      setInfoSkills([...infoSkills, newSkillText.trim()]);
    }
    setNewSkillText('');
  };

  const handleRemoveSkillTag = (skillToRemove) => {
    setInfoSkills(infoSkills.filter(s => s !== skillToRemove));
  };

  const handleAddAchievementTag = () => {
    if (!newAchievementText.trim()) return;
    setInfoAchievements([...infoAchievements, newAchievementText.trim()]);
    setNewAchievementText('');
  };

  const handleRemoveAchievementTag = (idx) => {
    setInfoAchievements(infoAchievements.filter((_, i) => i !== idx));
  };

  const handleAddProjectCard = () => {
    setInfoProjects([
      ...infoProjects,
      { title: 'New Highlight Project', date: 'Jan 2024 - Present', description: 'Brief description of system architecture, key features, and tech stack used.' }
    ]);
  };

  const handleRemoveProjectCard = (idx) => {
    setInfoProjects(infoProjects.filter((_, i) => i !== idx));
  };

  const openAddKanbanModal = (stageId = 'saved') => {
    setEditingCard({
      id: String(Date.now()),
      company: '',
      title: '',
      location: 'Remote',
      match: 85,
      stage: stageId,
      notes: ''
    });
    setKanbanModalMode('add');
    setKanbanModalOpen(true);
  };

  const openEditKanbanModal = (item) => {
    setEditingCard({ ...item });
    setKanbanModalMode('edit');
    setKanbanModalOpen(true);
  };

  const handleSaveKanbanCard = async (e) => {
    e.preventDefault();
    if (!editingCard.company.trim() || !editingCard.title.trim()) return;

    let updatedList;
    if (kanbanModalMode === 'add') {
      updatedList = [...kanbanItems, editingCard];
    } else {
      updatedList = kanbanItems.map(item => item.id === editingCard.id ? editingCard : item);
    }
    setKanbanItems(updatedList);
    setKanbanModalOpen(false);
    await saveKanbanItemsToDb(updatedList);
  };

  const handleDeleteKanbanCard = async (id) => {
    const updatedList = kanbanItems.filter(item => item.id !== id);
    setKanbanItems(updatedList);
    setKanbanModalOpen(false);
    await saveKanbanItemsToDb(updatedList);
  };

  const handleRunRecruiterSim = async () => {
    setSimulatingRecruiter(true);
    setRecruiterSimModal(true);
    try {
      const res = await fetch('/api/ai/recruiter-sim', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecruiterSimData(data.evaluation);
        }
      }
    } catch (e) {
      console.error('Recruiter sim error:', e);
    } finally {
      setSimulatingRecruiter(false);
    }
  };

  const handleMoveKanban = async (itemId, newStage) => {
    const updatedList = kanbanItems.map(item => item.id === itemId ? { ...item, stage: newStage } : item);
    setKanbanItems(updatedList);
    await saveKanbanItemsToDb(updatedList);
  };

  const openJobDrawer = (job) => {
    setSelectedJobForDrawer(job);
    setIsDrawerOpen(true);
  };

  const formatChatMessageText = (text) => {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, m => m.replace(/```[a-z]*/gi, '').trim())
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/###?\s*/g, '')
      .replace(/^[\t ]*[*•-][\t ]*/gm, '• ')
      .trim();
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingChat) return;
    const userMsg = inputMessage.trim();
    setInputMessage('');
    setSendingChat(true);
    const updatedHistory = [...chatMessages, { sender: 'user', text: userMsg }];
    setChatMessages(updatedHistory);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, chatHistory: chatMessages.slice(-6) })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { sender: 'coach', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'coach', text: `Coach Error: ${data.error}` }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'coach', text: 'Network connection failed.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
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

  const handleAddEducation = () => {
    if (!newEduDegree.trim() || !newEduInstitution.trim()) return;
    setInfoEducations(prev => [...prev, {
      degree: newEduDegree.trim(),
      institution: newEduInstitution.trim(),
      fieldOfStudy: newEduField.trim(),
      gradYear: newEduYear.trim(),
      gpa: newEduGpa.trim()
    }]);
    setNewEduDegree('');
    setNewEduInstitution('');
    setNewEduField('');
    setNewEduYear('');
    setNewEduGpa('');
  };

  const handleRemoveEducation = (index) => {
    setInfoEducations(prev => prev.filter((_, idx) => idx !== index));
  };

  const getCompanyLogoUrl = (match) => {
    if (!match) return null;
    if (match.company_logo) return match.company_logo;
    if (match.logo_url) return match.logo_url;
    if (match.logo) return match.logo;
    if (match.company_image) return match.company_image;

    const companyName = match.company || '';
    if (!companyName) return null;
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://unavatar.io/${encodeURIComponent(cleanName)}.com?fallback=https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanName)}.com&sz=128`;
  };

  if (authChecking) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Initializing AI Command Center...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at top right, #eef2ff, #f8fafc 60%)', marginTop: '-6rem' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside 
        style={{ 
          width: isCollapsed ? '80px' : '280px', 
          flexShrink: 0, 
          borderRight: '1px solid rgba(0,0,0,0.06)', 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(20px)', 
          padding: isCollapsed ? '2rem 0.6rem' : '2rem 1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'sticky', 
          top: 0, 
          height: '100vh',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          alignItems: isCollapsed ? 'center' : 'stretch',
          zIndex: 100
        }}
      >
        <div>
          {/* Header & Edge Floating Collapse Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: '2.5rem', position: 'relative', width: '100%' }}>
            {!isCollapsed ? (
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
                  Hirenova
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--brand-violet)', fontWeight: 700, letterSpacing: '1px', marginTop: '-0.2rem' }}>
                  <Sparkles size={10} /> AI COMMAND CENTER
                </span>
              </Link>
            ) : (
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }} title="Hirenova Homepage">
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
                  H
                </div>
              </Link>
            )}
            
            {/* Sleek Floating Edge Toggle Arrow Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shad-btn shad-btn-outline"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{ 
                position: 'absolute', 
                right: isCollapsed ? '-20px' : '-27px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                padding: 0, 
                width: '24px', 
                height: '24px', 
                minWidth: '24px', 
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                zIndex: 110
              }}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button 
              onClick={() => setActiveSection('command_center')}
              className={activeSection === 'command_center' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "AI Command Center" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <LayoutDashboard size={18} />
              {!isCollapsed && <span>AI Command Center</span>}
            </button>

            <button 
              onClick={() => setActiveSection('your_info')}
              className={activeSection === 'your_info' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "Your Information" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <UserCheck size={18} />
              {!isCollapsed && <span>Your Information</span>}
            </button>

            <button 
              onClick={() => setActiveSection('resume_mgmt')}
              className={activeSection === 'resume_mgmt' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "Resume Management" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <FolderGit2 size={18} />
              {!isCollapsed && <span>Resume Management</span>}
            </button>

            <button 
              onClick={() => setActiveSection('resume')}
              className={activeSection === 'resume' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "Resume & Heatmap" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <FileText size={18} />
              {!isCollapsed && <span>Resume & Heatmap</span>}
            </button>

            <button 
              onClick={() => setActiveSection('kanban')}
              className={activeSection === 'kanban' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "Application Kanban" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <Kanban size={18} />
              {!isCollapsed && <span>Application Kanban</span>}
            </button>

            <button 
              onClick={() => setActiveSection('matches')}
              className={activeSection === 'matches' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "Match Engine" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <Target size={18} />
              {!isCollapsed && <span>Match Engine</span>}
            </button>

            <button 
              onClick={() => setActiveSection('coach')}
              className={activeSection === 'coach' ? 'shad-btn shad-btn-primary' : 'shad-btn shad-btn-ghost'}
              title={isCollapsed ? "AI Career Coach" : undefined}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%', gap: isCollapsed ? '0' : '0.8rem', padding: '0.6rem 0.8rem' }}
            >
              <Bot size={18} />
              {!isCollapsed && <span>AI Career Coach</span>}
            </button>
          </nav>
        </div>

        {/* SIDEBAR BOTTOM: ASK AI + USER PROFILE (NIKHIL) + LOGOUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', alignItems: isCollapsed ? 'center' : 'stretch', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem', marginTop: 'auto' }}>
          
          {/* Ask AI Command Palette Trigger */}
          <button 
            onClick={() => setIsCmdKOpen(true)} 
            className="shad-btn shad-btn-outline" 
            title="Ask AI Command Palette (⌘K)"
            style={{ fontSize: '0.78rem', justifyContent: isCollapsed ? 'center' : 'space-between', color: 'var(--text-secondary)', padding: '0.55rem 0.75rem', width: '100%' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Search size={14} style={{ color: 'var(--brand-green)' }} /> {!isCollapsed && 'Ask AI...'}</span>
            {!isCollapsed && <kbd style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>⌘K</kbd>}
          </button>

          {/* Integrated User Profile & Logout Bottom Card */}
          <div className="shad-card" style={{ padding: isCollapsed ? '0.5rem' : '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px' }}>
            <div 
              onClick={() => setActiveSection('your_info')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
              title="Click to edit profile"
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #09090b, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(9, 9, 11, 0.2)' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div style={{ overflow: 'hidden', textAlign: 'left', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', margin: 0 }}>
                    {user?.name || 'User Profile'}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.15rem' }}>
                    <span className="shad-badge shad-badge-outline" style={{ fontSize: '0.62rem', padding: '0.05rem 0.35rem', fontWeight: 700 }}>{user?.candidateLevel || 'Mid-Level'}</span>
                    <span className="shad-badge shad-badge-outline" style={{ fontSize: '0.62rem', padding: '0.05rem 0.35rem', color: 'var(--brand-violet)' }}>{user?.domainOfInterest || 'Full Stack'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="shad-btn shad-btn-destructive"
              title="Sign Out of Hirenova"
              style={{ width: '100%', gap: '0.4rem', height: '2.15rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px' }}
            >
              <LogOut size={14} /> {!isCollapsed && <span>Logout</span>}
            </button>
          </div>

        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flexGrow: 1, padding: '2.5rem 3.5rem', overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* ================= 1. AI COMMAND CENTER ================= */}
        {activeSection === 'command_center' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: 0 }}>
                  Good Day, {user?.name?.split(' ')[0] || 'Candidate'} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  What should you do today to get hired? Here is your daily AI action plan.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button onClick={handleRunRecruiterSim} className="shad-btn shad-btn-outline" style={{ gap: '0.4rem', height: '2.4rem' }}>
                  <Eye size={16} style={{ color: 'var(--brand-violet)' }} />
                  <span>Recruiter Simulator</span>
                </button>
                <button onClick={() => setIsRecruiterView(!isRecruiterView)} className={`shad-btn ${isRecruiterView ? 'shad-btn-primary' : 'shad-btn-outline'}`} style={{ gap: '0.4rem', height: '2.4rem' }}>
                  <User size={16} />
                  <span>{isRecruiterView ? '6-Sec Recruiter View Active' : 'View As Recruiter'}</span>
                </button>
              </div>
            </div>

            {/* Daily Hiring Score Hero Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="shad-card" style={{ background: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Hiring Score</span>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                  {hiringScore}<span style={{ fontSize: '1.8rem', color: 'var(--brand-green)' }}>%</span>
                </div>
                <div className="shad-badge shad-badge-outline" style={{ background: 'rgba(22, 163, 74, 0.05)', color: 'var(--brand-green)', borderColor: 'rgba(22, 163, 74, 0.2)', fontWeight: 700 }}>
                  <TrendingUp size={12} style={{ marginRight: '0.25rem' }} /> {percentileText}
                </div>
              </div>

              <div className="shad-card" style={{ background: '#fff', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} style={{ color: 'var(--brand-violet)' }} /> Today's Actionable AI Recommendations
                  </h3>
                  <button 
                    onClick={fetchDynamicRecommendations}
                    disabled={loadingRecommendations}
                    className="shad-btn shad-btn-outline" 
                    style={{ fontSize: '0.75rem', height: '2rem', gap: '0.3rem', padding: '0 0.6rem' }}
                    title="Refresh AI Recommendations"
                  >
                    <RotateCcw size={12} className={loadingRecommendations ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {todoList.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setTodoList(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: task.done ? 'rgba(22, 163, 74, 0.03)' : 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer' }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: task.done ? 'none' : '2px solid hsl(var(--border))', background: task.done ? 'var(--brand-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        {task.done && <CheckCircle size={14} />}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: task.done ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', fontWeight: 500, flexGrow: 1 }}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Job Matches */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>Top Recommended Matches ({matchedJobs.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {matchedJobs.slice(0, 6).map((job, idx) => {
                  const jobId = String(job.jobId || job._id || job.id || idx);
                  const companyName = job.company || 'Tech Leader';
                  const jobTitle = job.title || 'Software Specialist';
                  const location = job.location || 'Remote';
                  const matchPercent = job.matchPercent || 88;
                  const logoUrl = getCompanyLogoUrl(job);
                  const isLiked = likedJobIds.includes(jobId);
                  const isKanbanSaved = kanbanItems.some(c => String(c.id) === jobId);
                  const skills = job.matchedSkills || job.requiredSkills || ['React', 'Node.js', 'TypeScript'];
                  const summaryText = job.requirementsSummary || job.matchReason || '';

                  return (
                    <div
                      key={jobId}
                      onClick={() => openJobDrawer(job)}
                      className="shad-card hover-lift"
                      style={{ background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div className="shad-card-header" style={{ padding: 0 }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
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
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>{companyName}</h3>
                              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</h2>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                            <div className="shad-badge shad-badge-outline" style={{ fontWeight: 700, color: 'var(--brand-green)', fontSize: '0.72rem', padding: '0.15rem 0.4rem' }}>
                              <Award size={12} style={{ marginRight: '0.2rem' }} /> {matchPercent}%
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
                      </div>

                      <div className="shad-card-content" style={{ padding: 0, marginTop: '0.6rem', flexGrow: 1 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.4rem 0' }}>
                          <div className="shad-badge shad-badge-secondary" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem' }}>
                            <MapPin size={11} /> {location}
                          </div>
                          <div className="shad-badge shad-badge-outline" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem', color: 'var(--brand-green)' }}>
                            <Coins size={11} /> Competitive
                          </div>
                        </div>

                        {summaryText && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {summaryText}
                          </p>
                        )}

                        {skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                            {skills.slice(0, 4).map((skill, sIdx) => (
                              <span key={sIdx} className="shad-badge shad-badge-outline" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shad-card-footer" style={{ padding: '0.75rem 0 0 0', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); saveJobToKanban(job); }}
                          className="shad-btn shad-btn-outline"
                          style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem', justifyContent: 'center', color: isKanbanSaved ? 'var(--brand-green)' : undefined, borderColor: isKanbanSaved ? 'rgba(22,163,74,0.3)' : undefined }}
                        >
                          {isKanbanSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                          {isKanbanSaved ? 'Saved' : 'Save to Kanban'}
                        </button>
                        <a href={job.applyUrl || job.apply_url || '#'} target="_blank" rel="noopener noreferrer" className="shad-btn shad-btn-primary" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                          Apply Now
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. "YOUR INFORMATION" PERMANENT PROFILE TAB ================= */}
        {activeSection === 'your_info' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: 0 }}>
                  Your Permanent AI Candidate Profile
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Manage structured personal details, skills, target role, and highlight projects.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {saveInfoSuccess && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--brand-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={16} /> Saved
                  </span>
                )}
                {!isEditingInfo ? (
                  <button 
                    onClick={() => setIsEditingInfo(true)}
                    className="shad-btn shad-btn-primary"
                    style={{ gap: '0.4rem', height: '2.4rem' }}
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditingInfo(false)}
                      className="shad-btn shad-btn-outline"
                      style={{ height: '2.4rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveYourInformation}
                      disabled={savingInfo}
                      className="shad-btn shad-btn-primary"
                      style={{ gap: '0.4rem', height: '2.4rem' }}
                    >
                      <Save size={16} /> {savingInfo ? 'Saving...' : 'Save Profile'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveYourInformation} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Personal & Target Role Card */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={18} style={{ color: 'var(--brand-violet)' }} /> Personal Details & Target Role
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr 1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Title</label>
                    <select 
                      className="shad-input" 
                      disabled={!isEditingInfo}
                      value={infoTitle}
                      onChange={(e) => setInfoTitle(e.target.value)}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      disabled={!isEditingInfo} 
                      value={infoName}
                      onChange={(e) => setInfoName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Target Job Title</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      disabled={!isEditingInfo} 
                      value={infoJobTitle}
                      onChange={(e) => setInfoJobTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Seniority Level</label>
                    <select 
                      className="shad-input" 
                      disabled={!isEditingInfo}
                      value={infoLevel}
                      onChange={(e) => setInfoLevel(e.target.value)}
                    >
                      <option value="Intern">Intern</option>
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead/Architect">Lead/Architect</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 1.3fr', gap: '1.25rem', marginTop: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      className="shad-input" 
                      disabled={!isEditingInfo} 
                      value={infoEmail}
                      onChange={(e) => setInfoEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Phone Extension</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      placeholder="+1, +91, +44"
                      disabled={!isEditingInfo} 
                      value={infoPhoneExtension}
                      onChange={(e) => setInfoPhoneExtension(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Phone Number</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      disabled={!isEditingInfo} 
                      value={infoPhone}
                      onChange={(e) => setInfoPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Demographic & EEO Information Card */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={18} style={{ color: 'var(--brand-violet)' }} /> Demographic & Equal Opportunity (EEO) Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 0.8fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Gender</label>
                    <select 
                      className="shad-input" 
                      disabled={!isEditingInfo}
                      value={infoGender}
                      onChange={(e) => setInfoGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Decline to State">Decline to State</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Race / Ethnicity</label>
                    <select 
                      className="shad-input" 
                      disabled={!isEditingInfo}
                      value={infoRace}
                      onChange={(e) => setInfoRace(e.target.value)}
                    >
                      <option value="White / Caucasian">White / Caucasian</option>
                      <option value="Hispanic, Latino, or Spanish origin">Hispanic, Latino, or Spanish origin</option>
                      <option value="Black or African American">Black or African American</option>
                      <option value="Asian">Asian</option>
                      <option value="Native Hawaiian or other Pacific Islander">Native Hawaiian or other Pacific Islander</option>
                      <option value="Indigenous Peoples, First Nations, Native American, or Alaska Native">Indigenous Peoples, First Nations, Native American, or Alaska Native</option>
                      <option value="Middle Eastern or North African">Middle Eastern or North African</option>
                      <option value="Some other race, ethnicity, or origin">Some other race, ethnicity, or origin</option>
                      <option value="Decline to Self-Identify">Decline to Self-Identify</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Date of Birth (DOB)</label>
                    <input 
                      type="date" 
                      className="shad-input" 
                      disabled={!isEditingInfo}
                      value={infoDob}
                      onChange={(e) => handleDobChange(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Calculated Age</label>
                    <div className="shad-input" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', fontWeight: 800, color: 'var(--brand-violet)' }}>
                      {infoAge ? `${infoAge} years` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Postal Address Card */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={18} style={{ color: 'var(--brand-violet)' }} /> Postal Address Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Address Line 1</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      placeholder="e.g. 123 Tech Boulevard"
                      disabled={!isEditingInfo} 
                      value={infoAddressLine1}
                      onChange={(e) => setInfoAddressLine1(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Address Line 2 (Optional)</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      placeholder="e.g. Apt 4B, Building C"
                      disabled={!isEditingInfo} 
                      value={infoAddressLine2}
                      onChange={(e) => setInfoAddressLine2(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>City / Location</label>
                    <input 
                      type="text" 
                      className="shad-input" 
                      placeholder="e.g. San Francisco, CA"
                      disabled={!isEditingInfo} 
                      value={infoCity}
                      onChange={(e) => setInfoCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Social & Web Profiles Card */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={18} style={{ color: 'var(--brand-violet)' }} /> Social Media & Portfolio Links
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      className="shad-input" 
                      placeholder="https://linkedin.com/in/username"
                      disabled={!isEditingInfo} 
                      value={infoLinkedin}
                      onChange={(e) => setInfoLinkedin(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>X (Twitter) Profile URL</label>
                    <input 
                      type="url" 
                      className="shad-input" 
                      placeholder="https://x.com/username"
                      disabled={!isEditingInfo} 
                      value={infoXTwitter}
                      onChange={(e) => setInfoXTwitter(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>GitHub Profile URL</label>
                    <input 
                      type="url" 
                      className="shad-input" 
                      placeholder="https://github.com/username"
                      disabled={!isEditingInfo} 
                      value={infoGithub}
                      onChange={(e) => setInfoGithub(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Personal Portfolio URL</label>
                    <input 
                      type="url" 
                      className="shad-input" 
                      placeholder="https://myportfolio.dev"
                      disabled={!isEditingInfo} 
                      value={infoPortfolio}
                      onChange={(e) => setInfoPortfolio(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Passport Size Photo Selection (Windows Explorer File Picker) */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={18} style={{ color: 'var(--brand-violet)' }} /> Passport Size Photo (Windows File Explorer Selection)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Select Passport Photo File from your PC</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={!isEditingInfo}
                        onChange={handlePassportPhotoSelect}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', display: 'block' }}>
                      Select photo from your Windows Explorer. Photo is converted to Data URL and synced to your Chrome extension for 1-click ATS application photo attachments.
                    </span>
                  </div>

                  {infoPhotoDataUrl ? (
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={infoPhotoDataUrl} 
                        alt="Passport Photo Preview" 
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-violet)' }} 
                      />
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>✓ Passport Photo Synced</span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ready for 1-Click Extension Attachment</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      No passport photo selected yet
                    </div>
                  )}
                </div>
              </div>

              {/* Education History Card with CGPA / GPA */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GraduationCap size={18} style={{ color: 'var(--brand-violet)' }} /> Education History ({infoEducations.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {infoEducations.map((edu, eIdx) => (
                    <div key={eIdx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{edu.degree}</strong>
                          {edu.gpa && (
                            <span className="shad-badge shad-badge-outline" style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', color: 'var(--brand-green)', borderColor: 'rgba(22,163,74,0.3)' }}>
                              CGPA / GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                          {edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''} {edu.gradYear ? `(${edu.gradYear})` : ''}
                        </span>
                      </div>
                      {isEditingInfo && (
                        <button type="button" onClick={() => handleRemoveEducation(eIdx)} className="shad-btn shad-btn-destructive" style={{ height: '2rem', width: '2rem', padding: 0 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditingInfo && (
                  <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Add New Education Entry</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.6fr 0.8fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input 
                        type="text" 
                        className="shad-input" 
                        placeholder="Degree (e.g. B.S. CS)" 
                        value={newEduDegree} 
                        onChange={(e) => setNewEduDegree(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        className="shad-input" 
                        placeholder="University / College" 
                        value={newEduInstitution} 
                        onChange={(e) => setNewEduInstitution(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        className="shad-input" 
                        placeholder="Major / Field of Study" 
                        value={newEduField} 
                        onChange={(e) => setNewEduField(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        className="shad-input" 
                        placeholder="Grad Year" 
                        value={newEduYear} 
                        onChange={(e) => setNewEduYear(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        className="shad-input" 
                        placeholder="CGPA / GPA (e.g. 3.8)" 
                        value={newEduGpa} 
                        onChange={(e) => setNewEduGpa(e.target.value)} 
                      />
                    </div>
                    <button type="button" onClick={handleAddEducation} className="shad-btn shad-btn-outline" style={{ height: '2.2rem', gap: '0.3rem', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Education Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Skills Builder Card */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={18} style={{ color: 'var(--brand-violet)' }} /> Technical Skills Matrix ({infoSkills.length})
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {infoSkills.map((skill, sIdx) => (
                    <span key={sIdx} className="shad-badge shad-badge-outline" style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem', gap: '0.3rem' }}>
                      {skill}
                      {isEditingInfo && (
                        <button type="button" onClick={() => handleRemoveSkillTag(skill)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditingInfo && (
                  <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                    <input 
                      type="text" 
                      className="shad-input" 
                      placeholder="Type skill (e.g. Docker, Redis) and click +" 
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillTag(); } }}
                    />
                    <button type="button" onClick={handleAddSkillTag} className="shad-btn shad-btn-outline">+</button>
                  </div>
                )}
              </div>

              {/* Work Experience Summary */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={18} style={{ color: 'var(--brand-violet)' }} /> Professional Work History Summary
                </h3>
                <textarea 
                  className="shad-input" 
                  rows={4} 
                  disabled={!isEditingInfo} 
                  value={infoExperience}
                  onChange={(e) => setInfoExperience(e.target.value)}
                  placeholder="Summarize your work history, responsibilities, and latency/throughput metrics..."
                />
              </div>

              {/* Dynamic Highlight Projects */}
              <div className="shad-card" style={{ background: '#fff', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FolderGit2 size={18} style={{ color: 'var(--brand-violet)' }} /> Highlight Projects ({infoProjects.length})
                  </h3>
                  {isEditingInfo && (
                    <button type="button" onClick={handleAddProjectCard} className="shad-btn shad-btn-outline" style={{ gap: '0.3rem', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Project
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {infoProjects.map((proj, pIdx) => (
                    <div key={pIdx} style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                      {isEditingInfo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Project Title</label>
                            <input 
                              type="text" 
                              className="shad-input" 
                              placeholder="Project Title"
                              value={proj.title || ''} 
                              onChange={(e) => {
                                const updated = [...infoProjects];
                                updated[pIdx].title = e.target.value;
                                setInfoProjects(updated);
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Project Date / Duration</label>
                            <input 
                              type="text" 
                              className="shad-input" 
                              placeholder="e.g. Jan 2024 - Mar 2024"
                              value={proj.date || proj.duration || ''} 
                              onChange={(e) => {
                                const updated = [...infoProjects];
                                updated[pIdx].date = e.target.value;
                                setInfoProjects(updated);
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Project Description & Technical Info</label>
                            <textarea 
                              className="shad-input" 
                              rows={3} 
                              placeholder="Key features, tech stack used, latency metrics..."
                              value={proj.description || proj.info || ''} 
                              onChange={(e) => {
                                const updated = [...infoProjects];
                                updated[pIdx].description = e.target.value;
                                setInfoProjects(updated);
                              }}
                            />
                          </div>
                          <button type="button" onClick={() => handleRemoveProjectCard(pIdx)} className="shad-btn shad-btn-destructive" style={{ height: '2rem', fontSize: '0.75rem', alignSelf: 'flex-start', marginTop: '0.2rem' }}>Remove Project</button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{proj.title}</h4>
                            {(proj.date || proj.duration) && (
                              <span className="shad-badge shad-badge-outline" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', color: 'var(--brand-violet)', borderColor: 'rgba(142,68,173,0.3)', flexShrink: 0 }}>
                                <Clock size={10} style={{ marginRight: '0.2rem' }} /> {proj.date || proj.duration}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45', whiteSpace: 'pre-line' }}>{proj.description || proj.info}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </form>
          </div>
        )}

        {/* ================= 3. DEDICATED RESUME MANAGEMENT TAB ================= */}
        {activeSection === 'resume_mgmt' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: 0 }}>
                  Resume Management
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Upload a new resume anytime, replace your current document, or re-run AI parsing.
                </p>
              </div>
            </div>

            {/* Current Active Resume Status Card */}
            <div className="shad-card" style={{ background: '#fff', padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                      {user?.resumeFileName || 'Candidate_Resume.pdf'}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      Last Updated: {user?.resumeUploadDate ? new Date(user.resumeUploadDate).toLocaleDateString() : 'July 23, 2026'}
                    </span>
                  </div>
                </div>

                <div className="shad-badge shad-badge-outline" style={{ color: 'var(--brand-green)', borderColor: 'rgba(22, 163, 74, 0.2)', background: 'rgba(22, 163, 74, 0.05)', fontWeight: 700 }}>
                  <CheckCircle size={13} style={{ marginRight: '0.25rem' }} /> Parsed & Active in Atlas
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => checkSession()}
                  className="shad-btn shad-btn-outline" 
                  style={{ gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <Wand2 size={14} /> Re-run AI Parsing
                </button>
              </div>
            </div>

            {/* Upload / Replace Drag & Drop Box */}
            <div className="shad-card" style={{ background: '#fff', padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Replace Current Resume Document
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Upload a fresh PDF or Text file to re-calculate your 7-factor ATS scores and refresh skills.
              </p>

              <form onSubmit={handleMgmtResumeUpload} style={{ border: '2px dashed hsl(var(--border))', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <UploadCloud size={40} style={{ color: 'var(--brand-violet)' }} />
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={(e) => setMgmtFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '0.88rem' }}
                />
                <button 
                  type="submit" 
                  disabled={!mgmtFile || mgmtUploading}
                  className="shad-btn shad-btn-primary" 
                  style={{ borderRadius: '10px', height: '2.6rem', padding: '0 2rem' }}
                >
                  {mgmtUploading ? mgmtProgressStage || 'Processing...' : 'Upload & Refresh Profile'}
                </button>

                {mgmtSuccessMsg && <span style={{ fontSize: '0.85rem', color: 'var(--brand-green)', fontWeight: 700 }}>{mgmtSuccessMsg}</span>}
                {mgmtErrorMsg && <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>{mgmtErrorMsg}</span>}
              </form>
            </div>
          </div>
        )}

        {/* ================= 4. RESUME & HEATMAP ================= */}
        {activeSection === 'resume' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: 0 }}>
                  Interactive AI Resume & Heatmap
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Click sub-score cards for diagnostic tips, use AI Auto-Fix, or switch target resume versions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', background: '#fff', padding: '0.3rem', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}>
                {['v1_default', 'v2_google', 'v3_amazon', 'v4_startup'].map(ver => (
                  <button 
                    key={ver}
                    onClick={() => setActiveResumeVersion(ver)}
                    className={`shad-tabs-trigger ${activeResumeVersion === ver ? 'shad-tabs-trigger-active' : ''}`}
                    style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}
                  >
                    {ver.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* CLAYMORPHIC BENTO GRID COVERING ALL 7 RESUME ASPECTS */}
            <div className="bento-grid-heatmap">

              {/* CARD 1: HERO ATS COMPATIBILITY (Spans 8 Columns) */}
              <div className="clay-card clay-mint" style={{ gridColumn: 'span 8', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 01 • SCANNER READINESS</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0', fontFamily: 'var(--font-title)' }}>
                      ATS Compatibility & Vector Match (95%)
                    </h3>
                  </div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-green)', background: '#ffffff', padding: '0.4rem 1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)' }}>
                    95/100
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Your resume structure ranks in the <strong>top 5% of scanner compatibility</strong> across Greenhouse, Lever, Workday, and Ashby. All standard section headers and text encodings are cleanly parsed.
                </p>

                {/* Progress Bar */}
                <div style={{ background: 'rgba(22, 163, 74, 0.12)', height: '10px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ width: '95%', height: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: '10px' }} />
                </div>

                {/* Check grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> Standard Section Headings Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> Single-Column Plain Text Layout
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> Zero Parsing Tables or Floating Boxes
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> UTF-8 Readable Font Encoding
                  </div>
                </div>
              </div>

              {/* CARD 2: OVERALL RESUME SCORE (Spans 4 Columns - Clay Dark) */}
              <div className="clay-card clay-dark" style={{ gridColumn: 'span 4', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OVERALL HEALTH</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 1rem 0', fontFamily: 'var(--font-title)' }}>
                    Resume Performance
                  </h3>

                  <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>84</div>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, background: 'rgba(22, 163, 74, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '50px', border: '1px solid rgba(22, 163, 74, 0.3)', display: 'inline-block', marginTop: '0.5rem' }}>
                      🟢 Target Market Ready
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Target Version:</span>
                    <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>{activeResumeVersion}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Last AI Scan:</span>
                    <strong style={{ color: '#ffffff' }}>July 26, 2026</strong>
                  </div>
                </div>
              </div>

              {/* CARD 3: QUANTIFIED IMPACT & METRICS (Spans 4 Columns - Clay Amber) */}
              <div className="clay-card clay-amber" style={{ gridColumn: 'span 4', padding: '1.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 02 • WORK IMPACT</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0 0.75rem 0' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quantified Metrics</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>72%</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '0 0 1rem 0' }}>
                  3 of 5 bullet points contain quantified metrics (% throughput, ms latency, or $ revenue).
                </p>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(217, 119, 6, 0.2)', fontSize: '0.8rem', color: '#92400e' }}>
                  <strong>💡 AI Recommendation:</strong>
                  <div style={{ marginTop: '0.25rem' }}>Replace generic descriptions with numbers (e.g. <em>"Reduced API latency by 45% via Redis"</em>).</div>
                </div>
              </div>

              {/* CARD 4: TECHNICAL KEYWORDS COVERAGE (Spans 4 Columns - Clay Indigo) */}
              <div className="clay-card clay-indigo" style={{ gridColumn: 'span 4', padding: '1.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-violet)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 03 • KEYWORD DENSITY</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0 0.75rem 0' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Skills & Tools Coverage</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-violet)' }}>88%</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'].map((tool, tIdx) => (
                    <span key={tIdx} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#ffffff', color: 'var(--brand-violet)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      ✓ {tool}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                  ⚠️ Missing Keywords: <span style={{ color: '#475569' }}>Docker, AWS, GraphQL</span>
                </div>
              </div>

              {/* CARD 5: 6-SECOND RECRUITER IMPRESSION (Spans 4 Columns - Clay Sky) */}
              <div className="clay-card clay-sky" style={{ gridColumn: 'span 4', padding: '1.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 04 • RECRUITER SCAN</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0 0.75rem 0' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>6-Sec Skimmability</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>91%</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '0 0 1rem 0' }}>
                  Optimal <strong>F-Pattern Visual Flow</strong>. Recruiter eye movement lands cleanly on title and top tech skills within 6 seconds.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '12px' }}>
                  <span>Avg Bullet Length:</span>
                  <span>14 words (Optimal)</span>
                </div>
              </div>

              {/* CARD 6: ENGINEERING PROJECTS PROOF OF WORK (Spans 6 Columns) */}
              <div className="clay-card" style={{ gridColumn: 'span 6', padding: '1.75rem', background: '#ffffff' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-violet)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 05 • PROOF OF WORK</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0 0.75rem 0' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Projects & Live Deployments</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>76%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> GitHub Repository Links Detected
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> Live Vercel Production Demo Included
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: 600 }}>
                    ⚠️ Star / Scale Metrics Missing for Top Project
                  </div>
                </div>
              </div>

              {/* CARD 7: TONE, ACTION VERBS & GRAMMAR (Spans 6 Columns) */}
              <div className="clay-card" style={{ gridColumn: 'span 6', padding: '1.75rem', background: '#ffffff' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASPECT 06 • ACTION VERBS</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0 0.75rem 0' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Power Action Verbs & Grammar</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-green)' }}>94%</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {['Architected', 'Orchestrated', 'Engineered', 'Optimized', 'Deployed'].map((verb, vIdx) => (
                    <span key={vIdx} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--brand-green)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                      ⚡ {verb}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  Zero weak passive verbs detected (e.g. <em>"worked on"</em> or <em>"helped with"</em>).
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= 5. APPLICATION KANBAN ================= */}
        {activeSection === 'kanban' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: 0 }}>
                  Application Journey Kanban
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  Click any card to edit details, or click + Add Card to create new application entries.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => openAddKanbanModal('saved')} className="shad-btn shad-btn-primary" style={{ gap: '0.4rem', height: '2.4rem' }}>
                  <Plus size={16} /> Add Application
                </button>
              </div>
            </div>

            <div className="kanban-grid">
              {[
                { stageId: 'saved', label: 'Saved' },
                { stageId: 'applied', label: 'Applied' },
                { stageId: 'oa', label: 'OA / Assessment' },
                { stageId: 'interview', label: 'Interview' },
                { stageId: 'offer', label: 'Offer Received' },
                { stageId: 'rejected', label: 'Rejected' }
              ].map(column => {
                const stageItems = kanbanItems.filter(item => item.stage === column.stageId);
                return (
                  <div 
                    key={column.stageId} 
                    className="kanban-column"
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const itemId = e.dataTransfer.getData('text/plain');
                      if (itemId) handleMoveKanban(itemId, column.stageId);
                    }}
                  >
                    <div className="kanban-column-header">
                      <span>{column.label}</span>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button onClick={() => openAddKanbanModal(column.stageId)} style={{ border: 'none', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', cursor: 'pointer', padding: '0.1rem 0.35rem', fontSize: '0.75rem', fontWeight: 700 }}>+</button>
                        <span className="shad-badge shad-badge-outline">{stageItems.length}</span>
                      </div>
                    </div>

                    {stageItems.map(item => (
                      <div 
                        key={item.id} 
                        className="kanban-card"
                        draggable={true}
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; }}
                        onClick={() => openEditKanbanModal(item)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.company}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 700 }}>{item.match}%</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.1rem 0' }}>{item.title}</h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}><MapPin size={11} /> {item.location}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 6. MATCH ENGINE ================= */}
        {activeSection === 'matches' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', marginBottom: '1.5rem' }}>
              AI Job Match Engine
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {matchedJobs.map((job, idx) => {
                const jobId = String(job.jobId || job._id || job.id || idx);
                const companyName = job.company || 'Tech Leader';
                const jobTitle = job.title || 'Software Specialist';
                const location = job.location || 'Remote';
                const matchPercent = job.matchPercent || 88;
                const logoUrl = getCompanyLogoUrl(job);
                const isLiked = likedJobIds.includes(jobId);
                const isKanbanSaved = kanbanItems.some(c => String(c.id) === jobId);
                const skills = job.matchedSkills || job.requiredSkills || ['React', 'Node.js', 'TypeScript'];
                const summaryText = job.requirementsSummary || job.matchReason || '';

                return (
                  <div
                    key={jobId}
                    onClick={() => openJobDrawer(job)}
                    className="shad-card hover-lift"
                    style={{ background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div className="shad-card-header" style={{ padding: 0 }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
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
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>{companyName}</h3>
                            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</h2>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <div className="shad-badge shad-badge-outline" style={{ fontWeight: 700, color: 'var(--brand-green)', fontSize: '0.72rem', padding: '0.15rem 0.4rem' }}>
                            <Award size={12} style={{ marginRight: '0.2rem' }} /> {matchPercent}%
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
                    </div>

                    <div className="shad-card-content" style={{ padding: 0, marginTop: '0.6rem', flexGrow: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.4rem 0' }}>
                        <div className="shad-badge shad-badge-secondary" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem' }}>
                          <MapPin size={11} /> {location}
                        </div>
                        <div className="shad-badge shad-badge-outline" style={{ gap: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.78rem', color: 'var(--brand-green)' }}>
                          <Coins size={11} /> Competitive
                        </div>
                      </div>

                      {summaryText && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {summaryText}
                        </p>
                      )}

                      {skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                          {skills.slice(0, 4).map((skill, sIdx) => (
                            <span key={sIdx} className="shad-badge shad-badge-outline" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shad-card-footer" style={{ padding: '0.75rem 0 0 0', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveJobToKanban(job); }}
                        className="shad-btn shad-btn-outline"
                        style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem', justifyContent: 'center', color: isKanbanSaved ? 'var(--brand-green)' : undefined, borderColor: isKanbanSaved ? 'rgba(22,163,74,0.3)' : undefined }}
                      >
                        {isKanbanSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                        {isKanbanSaved ? 'Saved' : 'Save to Kanban'}
                      </button>
                      <a href={job.applyUrl || job.apply_url || '#'} target="_blank" rel="noopener noreferrer" className="shad-btn shad-btn-primary" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                        Apply Now
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 7. AI CAREER COACH ================= */}
        {activeSection === 'coach' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>
              AI Career Coach Assistant
            </h1>
            <div className="shad-card" style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '20px', padding: '1.5rem', height: '100%' }}>
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', padding: '0.85rem 1.25rem', borderRadius: '16px', background: msg.sender === 'user' ? '#09090b' : 'rgba(0,0,0,0.03)', color: msg.sender === 'user' ? '#fff' : '#09090b', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {formatChatMessageText(msg.text)}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <input type="text" className="shad-input" placeholder="Ask AI Coach..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                <button type="submit" className="shad-btn shad-btn-primary">Send</button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ================= SUBSCORE DIAGNOSIS MODAL ================= */}
      {subscoreModal && (
        <div className="shad-dialog-overlay" onClick={() => setSubscoreModal(null)}>
          <div className="shad-dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: subscoreModal.color }}>
                {subscoreModal.title}: {subscoreModal.score}
              </h3>
              <button onClick={() => setSubscoreModal(null)} className="shad-btn shad-btn-ghost" style={{ padding: '0.2rem' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {subscoreModal.detail}
            </p>
          </div>
        </div>
      )}

      {/* ================= KANBAN CARD EDIT / ADD DIALOG ================= */}
      {kanbanModalOpen && (
        <div className="shad-dialog-overlay" onClick={() => setKanbanModalOpen(false)}>
          <div className="shad-dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Kanban size={18} style={{ color: 'var(--brand-violet)' }} />
                {kanbanModalMode === 'add' ? 'Add Application Card' : 'Edit Application Card'}
              </h3>
              <button onClick={() => setKanbanModalOpen(false)} className="shad-btn shad-btn-ghost" style={{ padding: '0.2rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveKanbanCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Company Name *</label>
                <input type="text" className="shad-input" required placeholder="e.g. Stripe, Google" value={editingCard.company} onChange={(e) => setEditingCard({ ...editingCard, company: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Job Title *</label>
                <input type="text" className="shad-input" required placeholder="e.g. Senior Backend Engineer" value={editingCard.title} onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Location</label>
                  <input type="text" className="shad-input" placeholder="Remote / Hybrid" value={editingCard.location} onChange={(e) => setEditingCard({ ...editingCard, location: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Match Score (%)</label>
                  <input type="number" min="0" max="100" className="shad-input" value={editingCard.match} onChange={(e) => setEditingCard({ ...editingCard, match: parseInt(e.target.value, 10) || 0 })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Pipeline Stage</label>
                <select className="shad-input" value={editingCard.stage} onChange={(e) => setEditingCard({ ...editingCard, stage: e.target.value })}>
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="oa">OA / Assessment</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Notes / Follow-up Reminders</label>
                <textarea className="shad-input" rows={3} placeholder="e.g. Recruiter screen scheduled for Thursday..." value={editingCard.notes || ''} onChange={(e) => setEditingCard({ ...editingCard, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
                {kanbanModalMode === 'edit' ? (
                  <button type="button" onClick={() => handleDeleteKanbanCard(editingCard.id)} className="shad-btn shad-btn-destructive" style={{ padding: '0 1rem', height: '2.4rem' }}>
                    Delete Card
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setKanbanModalOpen(false)} className="shad-btn shad-btn-outline" style={{ height: '2.4rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="shad-btn shad-btn-primary" style={{ height: '2.4rem', padding: '0 1.25rem' }}>
                    {kanbanModalMode === 'add' ? 'Add Application' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
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
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedJobForDrawer.requirementsSummary}</p>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe, Cpu, Shield, Zap, Sparkles, ChevronRight, Menu, X, Check,
  BarChart2, Code, Smartphone, Cloud, Bot, ArrowRight, Star, Users,
  CheckCircle, Play, Pause, RefreshCw, Send, Award, PhoneCall, Mail,
  MapPin, Clock, Lock, FileText, ChevronDown, Monitor, Database,
  TrendingUp, Terminal, Layers, Eye, HelpCircle, Activity, Briefcase
} from 'lucide-react';

// ==========================================
// UTILITY & CUSTOM HOOKS FOR SCROLL & ANIM
// ==========================================

// Custom Smooth Scroll & Scroll Position Hook
const useScrollProgress = () => {
  const [scrollData, setScrollData] = useState({
    progress: 0,
    scrollY: 0,
    direction: 'down',
    speed: 0
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTime || 1;
      const dist = Math.abs(currentScrollY - lastScrollY);
      const speed = dist / timeDiff;

      setScrollData({
        progress: Math.min(100, Math.max(0, progress)),
        scrollY: currentScrollY,
        direction: currentScrollY > lastScrollY ? 'down' : 'up',
        speed: speed
      });

      lastScrollY = currentScrollY;
      lastTime = currentTime;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollData;
};

// Intersection Observer Reveal Hook
const useScrollReveal = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, options);

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [options]);

  return [ref, isVisible];
};

// Animated Counter Hook
const AnimatedCounter = ({ end, duration = 2000, suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal();
  const started = useRef(false);

  useEffect(() => {
    if (isVisible && !started.current) {
      started.current = true;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="font-bold text-gradient-gold font-mono">
      {count.toFixed(decimals)}{suffix}
    </span>
  );
};

// ==========================================
// CANVAS / GRAPHICS / BACKGROUND EFFECTS
// ==========================================

// WebGL Interactive Hero Sphere & Particle Mesh with Scroll Morphing
const WebGLHeroCanvas = ({ scrollY }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const numParticles = 80;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 400,
        baseX: (Math.random() - 0.5) * 400,
        baseY: (Math.random() - 0.5) * 400,
        baseZ: (Math.random() - 0.5) * 400,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#D4AF37' : '#FFFFFF'
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Scroll effect morphing: expand & explode sphere as user scrolls
      const scrollFactor = Math.min(1, scrollY / 600);
      const expansion = 1 + scrollFactor * 1.8;
      const scatter = scrollFactor * 150;

      angleX += 0.005;
      angleY += 0.008;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = particles.map((p) => {
        let x = p.baseX * expansion + (Math.sin(p.baseX) * scatter);
        let y = p.baseY * expansion + (Math.cos(p.baseY) * scatter);
        let z = p.baseZ * expansion;

        // 3D Rotations
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;

        let y1 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;

        // Perspective Projection
        const fov = 350;
        const scale = fov / (fov + z2 + 500);
        const projX = x1 * scale + centerX;
        const projY = y1 * scale + centerY;

        return { x: projX, y: projY, scale, color: p.color, z: z2 };
      });

      // Draw Connection Lines based on scroll proximity threshold
      const connectDist = 120 * (1 + scrollFactor * 0.5);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * 0.35 * Math.min(1, projected[i].scale);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach((p) => {
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.scale * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollY]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// Scroll Dynamic Spotlight Mouse Follower
const SpotlightCursor = ({ speed }) => {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const updateMouse = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  const spotSize = 250 + Math.min(150, speed * 120);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
      style={{
        background: `radial-gradient(${spotSize}px circle at ${pos.x}px ${pos.y}px, rgba(212, 175, 55, 0.07), transparent 80%)`
      }}
    />
  );
};

// Dynamic Scroll-Driven Ambient Parallax Geometric Rings
const ParallaxBackground = ({ scrollY }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full border border-yellow-500/10 blur-[1px] transition-transform duration-75"
        style={{ transform: `translate3d(0, ${scrollY * 0.15}px, 0) rotate(${scrollY * 0.05}deg)` }}
      />
      <div
        className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] rounded-full border border-amber-600/10 blur-[2px] transition-transform duration-75"
        style={{ transform: `translate3d(0, ${-scrollY * 0.1}px, 0) rotate(${-scrollY * 0.03}deg)` }}
      />
      <div
        className="absolute top-[75%] right-[10%] w-[400px] h-[400px] rounded-full border border-yellow-400/10 transition-transform duration-75"
        style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0) scale(${1 + (scrollY % 300) / 1000})` }}
      />
    </div>
  );
};

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

const SectionHeader = ({ badge, title, subtitle, centered = true }) => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`mb-12 transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${centered ? 'text-center max-w-3xl mx-auto' : ''}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
        {title}
      </h2>
      {subtitle && <p className="text-gray-400 text-base sm:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );
};

const CardReveal = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollData = useScrollProgress();

  // Data is loaded from and saved to the Express/MongoDB backend.
  const [leads, setLeads] = useState([]);
  const [healthReports, setHealthReports] = useState([]);
  const [jobApps, setJobApps] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leadRes, reportRes, jobsRes] = await Promise.all([
          fetch(`${API_URL}/leads`),
          fetch(`${API_URL}/health-reports`),
          fetch(`${API_URL}/job-applications`),
        ]);
        if (!leadRes.ok || !reportRes.ok || !jobsRes.ok) throw new Error('Unable to load application data');
        const [leadData, reportData, jobsData] = await Promise.all([
          leadRes.json(), reportRes.json(), jobsRes.json(),
        ]);
        setLeads(leadData);
        setHealthReports(reportData);
        setJobApps(jobsData);
      } catch (error) {
        console.error('Backend connection failed. Check that the API and MongoDB are running.', error);
      }
    };
    loadData();
  }, []);

  const saveLead = async (lead) => {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead),
    });
    if (!response.ok) throw new Error('Could not save lead');
    const saved = await response.json();
    setLeads((current) => [saved, ...current]);
  };

  const saveHealthReport = async (report) => {
    const response = await fetch(`${API_URL}/health-reports`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error('Could not save health report');
    const saved = await response.json();
    setHealthReports((current) => [saved, ...current]);
  };

  const saveJobApplication = async (application) => {
    const response = await fetch(`${API_URL}/job-applications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(application),
    });
    if (!response.ok) throw new Error('Could not save job application');
    const saved = await response.json();
    setJobApps((current) => [saved, ...current]);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0b0c10] text-gray-100 min-h-screen font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* 1. Custom Smooth Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-gray-900 z-50">
        <div
          className="h-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-200 transition-all duration-150 ease-out shadow-[0_0_10px_#D4AF37]"
          style={{ width: `${scrollData.progress}%` }}
        />
      </div>

      {/* 2. Interactive Cursor Spotlight */}
      <SpotlightCursor speed={scrollData.speed} />

      {/* 3. Scroll Parallax Background Ambient Shapes */}
      <ParallaxBackground scrollY={scrollData.scrollY} />

      {/* NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-[#0b0c10]/80 border-b border-gray-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3 group text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/30 transition-all">
              <div className="w-full h-full bg-[#0b0c10] rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                RIYADVI
              </span>
              <span className="text-[10px] tracking-widest text-amber-400 font-semibold uppercase">
                Software Tech
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'services', label: 'Services' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'health-check', label: 'Tech Audit' },
              { id: 'lead-magnet', label: 'AI Strategy' },
              { id: 'blog', label: 'Insights' },
              { id: 'about', label: 'Company' },
              { id: 'careers', label: 'Careers' },
              { id: 'contact', label: 'Contact' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => navigateTo(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === link.id
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigateTo('admin')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-gray-400 hover:text-white border border-gray-700/60 hover:border-amber-500/50 transition-all"
            >
              Admin Portal
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="relative group px-5 py-2.5 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0e1017] border-b border-gray-800 px-4 pt-2 pb-6 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'services', label: 'Services' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'health-check', label: 'Tech Audit' },
              { id: 'lead-magnet', label: 'AI Strategy' },
              { id: 'blog', label: 'Insights' },
              { id: 'about', label: 'Company' },
              { id: 'careers', label: 'Careers' },
              { id: 'contact', label: 'Contact' },
              { id: 'admin', label: 'Admin Dashboard' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => navigateTo(link.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
                  activePage === link.id
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* DYNAMIC PAGE CONTENT ROUTER */}
      <main className="pt-20">
        {activePage === 'home' && (
          <HomePage navigateTo={navigateTo} scrollY={scrollData.scrollY} />
        )}
        {activePage === 'services' && <ServicesPage navigateTo={navigateTo} />}
        {activePage === 'portfolio' && <PortfolioPage navigateTo={navigateTo} />}
        {activePage === 'health-check' && (
          <HealthCheckupPage
            onSaveReport={saveHealthReport}
          />
        )}
        {activePage === 'lead-magnet' && (
          <LeadMagnetPage onSaveLead={saveLead} />
        )}
        {activePage === 'about' && <AboutPage navigateTo={navigateTo} />}
        {activePage === 'blog' && <BlogPage />}
        {activePage === 'careers' && (
          <CareersPage onApply={saveJobApplication} />
        )}
        {activePage === 'contact' && (
          <ContactPage onSendMessage={saveLead} />
        )}
        {activePage === 'admin' && (
          <AdminDashboard
            leads={leads}
            healthReports={healthReports}
            jobApps={jobApps}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#07080a] border-t border-gray-800/80 pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px]">
                  <div className="w-full h-full bg-[#0b0c10] rounded-[7px] flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <span className="text-lg font-bold text-white tracking-wider">
                  RIYADVI <span className="text-amber-400 text-xs block">SOFTWARE TECH</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Architecting next-generation enterprise AI software, scalable cloud platforms, and cyber-resilient web applications for global industry leaders.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-xs text-gray-400 hover:text-amber-400 hover:border-amber-400 transition-all"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
                Services
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => navigateTo('services')} className="hover:text-white transition-colors">Enterprise AI & ML</button></li>
                <li><button onClick={() => navigateTo('services')} className="hover:text-white transition-colors">Cloud Architecture</button></li>
                <li><button onClick={() => navigateTo('services')} className="hover:text-white transition-colors">Custom Mobile Apps</button></li>
                <li><button onClick={() => navigateTo('services')} className="hover:text-white transition-colors">Cybersecurity Systems</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
                Interactive Apps
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => navigateTo('health-check')} className="hover:text-amber-400 transition-colors">Tech Health Audit</button></li>
                <li><button onClick={() => navigateTo('lead-magnet')} className="hover:text-amber-400 transition-colors">AI ROI Calculator</button></li>
                <li><button onClick={() => navigateTo('portfolio')} className="hover:text-amber-400 transition-colors">Case Studies</button></li>
                <li><button onClick={() => navigateTo('admin')} className="hover:text-amber-400 transition-colors">Admin Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
                Global HQ
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Riyadvi Tech Tower, Software Park Phase II<br />
                Innovation Corridor, CA 94105<br />
                contact@riyadvi.com
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800/60 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© 2021-2026 Riyadvi Software Technologies Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400">Terms of Service</a>
              <a href="#" className="hover:text-gray-400">Security Architecture</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// HOME PAGE COMPONENT
// ==========================================

function HomePage({ navigateTo, scrollY }) {
  const [activeStep, setActiveStep] = useState(0);

  // Digital Transformation Steps with Scroll-based highlights
  const transformSteps = [
    { title: '1. Discovery & Architecture', desc: 'In-depth assessment of existing tech stack and strategic blueprint definition.', icon: Terminal },
    { title: '2. Agile Sprint Engineering', desc: 'Rapid execution using microservices and AI-driven modular design.', icon: Code },
    { title: '3. Automated CI/CD & Testing', desc: 'Rigorous security penetration testing and automated deployment pipelines.', icon: Zap },
    { title: '4. Enterprise Scale & Cloud Deploy', desc: 'Zero-downtime global multi-region cloud rollout with continuous monitoring.', icon: Cloud },
  ];

  useEffect(() => {
    // Dynamically calculate active timeline step based on scroll position
    const step = Math.min(3, Math.floor((scrollY % 1200) / 300));
    setActiveStep(step);
  }, [scrollY]);

  return (
    <div>
      {/* 4. CINEMATIC HERO SECTION WITH 3D WEBGL HERO CANVAS */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        <WebGLHeroCanvas scrollY={scrollY} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <CardReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Scroll Down to Morph Hero WebGL Particles</span>
            </div>
          </CardReveal>

          <CardReveal delay={150}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Engineering <span className="text-gradient-gold">Intelligent Enterprise</span> Platforms
            </h1>
          </CardReveal>

          <CardReveal delay={300}>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 font-normal">
              Riyadvi Software Technologies delivers high-performance custom cloud applications, autonomous AI integration, and robust enterprise cybersecurity solutions.
            </p>
          </CardReveal>

          <CardReveal delay={450}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigateTo('health-check')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black font-bold text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Start Free Tech Audit <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateTo('portfolio')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900/80 border border-gray-700/80 hover:border-amber-400/60 text-white font-semibold text-base backdrop-blur-md hover:bg-gray-800 transition-all"
              >
                Explore Featured Case Studies
              </button>
            </div>
          </CardReveal>

          {/* 6. SCROLL-TRIGGERED COUNTER METRICS */}
          <div className="mt-20 pt-10 border-t border-gray-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <CardReveal delay={100}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter end={120} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">Enterprise Projects Delivered</div>
            </CardReveal>
            <CardReveal delay={200}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter end={99.8} suffix="%" decimals={1} />
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">Client Satisfaction Score</div>
            </CardReveal>
            <CardReveal delay={300}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter end={45} suffix="M$" />
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">Client ROI Revenue Generated</div>
            </CardReveal>
            <CardReveal delay={400}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter end={24} suffix="/7" />
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">Proactive Cloud Monitoring</div>
            </CardReveal>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / SERVICES SUMMARY */}
      <section className="py-24 bg-[#0e1017]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Core Engineering Focus"
            title="Full-Spectrum Software Solutions"
            subtitle="Custom built from the ground up for unmatched speed, scalability, and airtight security."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: 'Enterprise AI & Agentic Workflows',
                desc: 'Deploy custom LLM agents, automated data parsing, and predictive analytics engines.'
              },
              {
                icon: Cloud,
                title: 'Cloud Native & Microservices',
                desc: 'Scalable Kubernetes setups, serverless architectures, and zero-downtime database migrations.'
              },
              {
                icon: Smartphone,
                title: 'Cross-Platform Mobile Apps',
                desc: 'High-performance iOS & Android applications with native responsiveness and offline synchronization.'
              },
              {
                icon: Shield,
                title: 'Cybersecurity & Compliance',
                desc: 'ISO 27001 & SOC2 compliant security audits, end-to-end encryption, and penetration testing.'
              },
              {
                icon: Database,
                title: 'High-Throughput Data Pipelines',
                desc: 'Real-time telemetry, ETL orchestration, and sub-second analytical dashboard queries.'
              },
              {
                icon: Zap,
                title: 'Legacy Modernization',
                desc: 'Seamlessly transform legacy monolithic backends into modular cloud microservices.'
              }
            ].map((cap, idx) => (
              <CardReveal key={idx} delay={idx * 100}>
                <div className="p-8 rounded-2xl bg-[#12141d] border border-gray-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black transition-all">
                      <cap.icon className="w-6 h-6 text-amber-400 group-hover:text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
                  </div>
                  <button
                    onClick={() => navigateTo('services')}
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-yellow-300"
                  >
                    Learn More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HORIZONTAL / TIMELINE SCROLL DIGITAL TRANSFORMATION PROCESS */}
      <section className="py-24 relative z-10 border-t border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Scrolled Execution Model"
            title="Digital Transformation Roadmap"
            subtitle="Watch your software vision turn into reality step-by-step as you navigate through our delivery methodology."
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative mt-12">
            {transformSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeStep === idx;

              return (
                <CardReveal key={idx} delay={idx * 150}>
                  <div
                    className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-[#181a26] border-amber-400 shadow-lg shadow-amber-500/10 scale-105'
                        : 'bg-[#11131a] border-gray-800/80 opacity-80'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-200" />
                    )}
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-amber-400 mb-4 font-mono font-bold">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </CardReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE CTA BANNER */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-600/10 to-transparent border border-amber-500/30 text-center relative overflow-hidden backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Accelerate Your Technology Stack?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg mb-8">
              Get an instant AI ROI breakdown or run our interactive 2-minute system audit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigateTo('health-check')}
                className="px-8 py-3.5 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-yellow-300 transition-all shadow-lg"
              >
                Run Tech Audit Now
              </button>
              <button
                onClick={() => navigateTo('lead-magnet')}
                className="px-8 py-3.5 rounded-xl bg-gray-900 border border-amber-400/40 text-amber-400 font-semibold text-sm hover:bg-gray-800 transition-all"
              >
                Calculate AI ROI
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// SERVICES PAGE
// ==========================================

function ServicesPage({ navigateTo }) {
  const services = [
    {
      id: 'ai',
      icon: Bot,
      title: 'Enterprise AI & Machine Learning Systems',
      desc: 'Empower your business with custom fine-tuned Large Language Models, agentic automation, and real-time predictive analytics.',
      deliverables: ['Custom RAG Pipelines', 'Autonomous Process Agents', 'Computer Vision & Speech API', 'Model Deployment & Guardrails']
    },
    {
      id: 'cloud',
      icon: Cloud,
      title: 'Cloud Architecture & DevOps Pipelines',
      desc: 'Architect resilient multi-cloud infrastructures with automated CI/CD deployments and proactive disaster recovery.',
      deliverables: ['AWS / Azure / GCP Migration', 'Kubernetes Orchestration', 'Infrastructure as Code (Terraform)', '24/7 SRE Monitoring']
    },
    {
      id: 'mobile',
      icon: Smartphone,
      title: 'Custom Mobile & Web Applications',
      desc: 'High-speed React, React Native, and Flutter applications engineered for flawless user experience across all screen sizes.',
      deliverables: ['Cross-Platform Apps', 'Progressive Web Apps (PWA)', 'Offline-First Storage', 'Biometric & Push Integration']
    },
    {
      id: 'sec',
      icon: Shield,
      title: 'Enterprise Cybersecurity & Penetration Audits',
      desc: 'Identify vulnerability vectors before malicious actors do with comprehensive security testing and compliance implementation.',
      deliverables: ['Penetration Testing', 'SOC2 / GDPR Compliance', 'Zero-Trust Network Setup', 'Encrypted Data Storage']
    }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Engineering Services"
        title="Comprehensive Technology Offerings"
        subtitle="Designed for ambitious enterprises seeking rapid scaling, security, and digital dominance."
      />

      <div className="space-y-12 mt-12">
        {services.map((srv, idx) => {
          const SrvIcon = srv.icon;
          return (
            <CardReveal key={srv.id} delay={idx * 150}>
              <div className="p-8 sm:p-10 rounded-3xl bg-[#12141d] border border-gray-800/80 hover:border-amber-500/40 transition-all grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <SrvIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{srv.title}</h3>
                  <p className="text-gray-400 text-base leading-relaxed">{srv.desc}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {srv.deliverables.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0b0f] border border-gray-800 text-center space-y-4">
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Standard Delivery</div>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">4 - 8 Weeks</div>
                  <button
                    onClick={() => navigateTo('contact')}
                    className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-yellow-300 transition-all"
                  >
                    Request Proposal
                  </button>
                </div>
              </div>
            </CardReveal>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// PORTFOLIO PAGE
// ==========================================

function PortfolioPage({ navigateTo }) {
  const projects = [
    {
      title: 'FinTech Algorithmic Trading Platform',
      category: 'AI & Cloud Platform',
      metric: '3.2ms Latency',
      desc: 'Built low-latency real-time market telemetry ingestion engine processing 1.2M transactions per second.',
      tech: ['React', 'Python', 'Kafka', 'AWS']
    },
    {
      title: 'HealthCare AI Patient Diagnostics',
      category: 'Healthcare Tech',
      metric: '99.4% Precision',
      desc: 'Custom vision model parsing medical scans with automated HIPAA-compliant report synthesis.',
      tech: ['PyTorch', 'FastAPI', 'React Native']
    },
    {
      title: 'Global Supply Chain IoT Telemetry',
      category: 'Enterprise Logistics',
      metric: '40% Cost Savings',
      desc: 'Connected 50,000+ IoT edge devices with live geospatial tracking and predictive maintenance alerts.',
      tech: ['Golang', 'Docker', 'Kubernetes', 'GCP']
    }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Proven Results"
        title="Featured Client Transformations"
        subtitle="Explore how we deliver competitive advantages through cutting-edge software architecture."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {projects.map((proj, idx) => (
          <CardReveal key={idx} delay={idx * 150}>
            <div className="p-8 rounded-2xl bg-[#12141d] border border-gray-800 hover:border-amber-400/50 transition-all flex flex-col justify-between h-full group">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">{proj.category}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{proj.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{proj.desc}</p>
              </div>

              <div>
                <div className="p-3 rounded-xl bg-[#0a0b0f] border border-gray-800/80 mb-6 text-center">
                  <span className="text-xs text-gray-500 block mb-0.5">Key Performance Indicator</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{proj.metric}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {proj.tech.map((t, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 rounded-md bg-gray-800/80 text-gray-300 text-xs font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardReveal>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// HEALTH CHECKUP PAGE
// ==========================================

function HealthCheckupPage({ onSaveReport }) {
  const [answers, setAnswers] = useState({
    cloud: 'AWS',
    ai: 'None',
    cicd: 'Manual',
    security: 'Basic'
  });
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAudit = (e) => {
    e.preventDefault();
    let calculated = 50;
    if (answers.ai !== 'None') calculated += 15;
    if (answers.cicd === 'Automated') calculated += 20;
    if (answers.security === 'Advanced') calculated += 15;

    setScore(calculated);
    setSubmitted(true);

    onSaveReport({
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      answers,
      score: calculated
    });
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Interactive Assessment"
        title="Software System Health Audit"
        subtitle="Evaluate your infrastructure readiness across cloud, AI capability, CI/CD, and security."
      />

      <CardReveal>
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12141d] border border-gray-800">
          {!submitted ? (
            <form onSubmit={handleAudit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Primary Cloud Provider</label>
                <select
                  value={answers.cloud}
                  onChange={(e) => setAnswers({ ...answers, cloud: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                >
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="Azure">Microsoft Azure</option>
                  <option value="GCP">Google Cloud Platform</option>
                  <option value="On-Prem">On-Premises Servers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">AI & Machine Learning Adoption</label>
                <select
                  value={answers.ai}
                  onChange={(e) => setAnswers({ ...answers, ai: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                >
                  <option value="None">No AI Capabilities Integrated</option>
                  <option value="Basic">Basic API / OpenAI Integration</option>
                  <option value="Custom">Custom Fine-Tuned Models & RAG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Deployment & CI/CD Pipelines</label>
                <select
                  value={answers.cicd}
                  onChange={(e) => setAnswers({ ...answers, cicd: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                >
                  <option value="Manual">Manual Deployment Scripts</option>
                  <option value="Semi">Semi-Automated Staging</option>
                  <option value="Automated">Fully Automated CI/CD Pipelines</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-base shadow-lg hover:scale-[1.01] transition-all"
              >
                Generate Audit Score
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl font-extrabold text-amber-400 font-mono">
                {score}/100
              </div>
              <h3 className="text-2xl font-bold text-white">System Architecture Health Rating</h3>
              <p className="text-gray-300 text-sm max-w-lg mx-auto leading-relaxed">
                {score >= 80
                  ? 'Your stack is modernized! You are ready to integrate autonomous agentic AI workflows.'
                  : 'Your infrastructure has key bottlenecks in automation and cloud scaling. A Riyadvi Tech Audit can optimize your stack by up to 40%.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700"
              >
                Re-take Assessment
              </button>
            </div>
          )}
        </div>
      </CardReveal>
    </div>
  );
}

// ==========================================
// LEAD MAGNET PAGE
// ==========================================

function LeadMagnetPage({ onSaveLead }) {
  const [formData, setFormData] = useState({ name: '', email: '', teamSize: '10-50', goal: 'AI Transformation' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveLead({ ...formData, id: Date.now(), timestamp: new Date().toLocaleDateString() });
    setSubmitted(true);
  };

  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Free Technical Blueprint"
        title="2026 AI Enterprise Roadmap"
        subtitle="Download our executive whitepaper on building resilient, scalable multi-agent systems."
      />

      <CardReveal>
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12141d] border border-gray-800">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Work Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-yellow-300 transition-all shadow-lg"
              >
                Instant Access Whitepaper
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="w-16 h-16 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Blueprint Sent!</h3>
              <p className="text-gray-400 text-sm">Check your inbox ({formData.email}) for your download link.</p>
            </div>
          )}
        </div>
      </CardReveal>
    </div>
  );
}

// ==========================================
// ABOUT PAGE
// ==========================================

function AboutPage({ navigateTo }) {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="About Riyadvi"
        title="Engineered for Innovation, Built for Scale"
        subtitle="Founded in 2021, Riyadvi Software Technologies delivers high-impact technology solutions globally."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
        <CardReveal>
          <div className="space-y-6 text-gray-300 text-base leading-relaxed">
            <p>
              At Riyadvi, we bridge the gap between complex emerging software paradigms and practical business value. Our team of senior cloud architects, AI researchers, and full-stack engineers collaborates to solve complex enterprise problems.
            </p>
            <p>
              Whether it is modernizing legacy backends or building autonomous multi-agent artificial intelligence pipelines, we prioritize security, performance, and clean maintainable code.
            </p>
          </div>
        </CardReveal>

        <CardReveal delay={200}>
          <div className="p-8 rounded-3xl bg-[#12141d] border border-gray-800 space-y-6">
            <h4 className="text-xl font-bold text-amber-400">Our Core Principles</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white text-sm">Security-First Engineering</h5>
                  <p className="text-gray-400 text-xs">Airtight encryption and zero-trust policies built directly into every layer.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white text-sm">Agile Sprint Delivery</h5>
                  <p className="text-gray-400 text-xs">Rapid iterative releases with complete transparency and real-time client feedback.</p>
                </div>
              </div>
            </div>
          </div>
        </CardReveal>
      </div>
    </div>
  );
}

// ==========================================
// BLOG PAGE
// ==========================================

function BlogPage() {
  const posts = [
    { title: 'Navigating Multi-Agent Systems in Enterprise Software', date: 'Oct 2026', read: '5 min read' },
    { title: 'Migrating Monoliths to Kubernetes without Downtime', date: 'Sep 2026', read: '8 min read' },
    { title: 'Zero-Trust Architecture for Cloud Native Apps', date: 'Aug 2026', read: '6 min read' }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Thought Leadership"
        title="Insights & Engineering Blog"
        subtitle="Articles and research papers authored by Riyadvi engineers."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {posts.map((post, idx) => (
          <CardReveal key={idx} delay={idx * 150}>
            <div className="p-8 rounded-2xl bg-[#12141d] border border-gray-800 hover:border-amber-400/40 transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>{post.date}</span>
                  <span>{post.read}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 hover:text-amber-400 transition-colors">{post.title}</h3>
              </div>
              <button className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-yellow-300 pt-4">
                Read Full Article <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardReveal>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// CAREERS PAGE
// ==========================================

function CareersPage({ onApply }) {
  const [applied, setApplied] = useState(false);

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Join Our Team"
        title="Careers at Riyadvi Software"
        subtitle="Work with high-caliber software engineers on complex real-world projects."
      />

      <div className="space-y-6 mt-12">
        {[
          { title: 'Senior AI System Architect', dept: 'Engineering', loc: 'Remote / SF' },
          { title: 'Lead Kubernetes SRE Engineer', dept: 'Cloud Ops', loc: 'Remote' },
          { title: 'Senior Full-Stack Developer (React/Node)', dept: 'Product', loc: 'Hybrid' }
        ].map((job, idx) => (
          <CardReveal key={idx} delay={idx * 100}>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#12141d] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>{job.dept}</span>
                  <span>•</span>
                  <span>{job.loc}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onApply({ ...job, id: Date.now() });
                  setApplied(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-yellow-300 transition-all"
              >
                {applied ? 'Application Sent' : 'Apply Now'}
              </button>
            </div>
          </CardReveal>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// CONTACT PAGE
// ==========================================

function ContactPage({ onSendMessage }) {
  const [sent, setSent] = useState(false);

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Get In Touch"
        title="Start Your Project Discussion"
        subtitle="Our engineering consultants respond within 24 hours."
      />

      <CardReveal>
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12141d] border border-gray-800">
          {!sent ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                try {
                  await onSendMessage({
                    name: form.get('name'),
                    email: form.get('email'),
                    message: form.get('message'),
                    timestamp: new Date().toLocaleDateString(),
                    source: 'contact-form',
                  });
                  setSent(true);
                } catch (error) {
                  alert('Unable to send your message. Please check the backend connection and try again.');
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    name="name"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    name="email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Project Overview</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about your technical goals and requirements..."
                  name="message"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-yellow-300 transition-all shadow-lg"
              >
                Send Inquiry
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Message Received!</h3>
              <p className="text-gray-400 text-sm">A senior technical specialist will get in touch shortly.</p>
            </div>
          )}
        </div>
      </CardReveal>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard({ leads, healthReports, jobApps }) {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="Internal Portal"
        title="Admin Management Dashboard"
        subtitle="Real-time analytics and persistence data tracking for leads, health assessments, and job applicants."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[#12141d] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium uppercase mb-1">Captured Leads</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{leads.length}</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#12141d] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium uppercase mb-1">Completed Audits</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{healthReports.length}</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#12141d] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium uppercase mb-1">Job Applicants</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{jobApps.length}</div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-[#12141d] border border-gray-800 space-y-6">
        <h3 className="text-xl font-bold text-white">Recorded Lead Contacts</h3>
        {leads.length === 0 ? (
          <p className="text-gray-500 text-sm">No leads recorded in simulated database yet.</p>
        ) : (
          <div className="space-y-3">
            {leads.map((l, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center text-sm">
                <div>
                  <div className="font-bold text-white">{l.name || 'Anonymous User'}</div>
                  <div className="text-xs text-gray-400">{l.email}</div>
                </div>
                <div className="text-xs text-amber-400 font-mono">{l.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
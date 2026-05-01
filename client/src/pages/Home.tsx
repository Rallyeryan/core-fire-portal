import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, FileText, Shield, Zap, Clock, Users,
  Flame, Bell, Phone, Mail, ExternalLink, ArrowRight, ArrowUpRight,
  BarChart3, Building2, Menu, X, ChevronUp, Star, Award,
  Wrench, Radio, Camera, KeyRound, Lightbulb, Droplets,
  Sun, Moon, Lock, Pen, QrCode, Download, Search, ShoppingCart
} from "lucide-react";
import { Link } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme, switchable } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Services", id: "services" },
    { label: "Why Us", id: "why-us" },
    { label: "About", id: "about" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top announcement bar (Nord ink strip) ─────────────────── */}
      <div className="bg-ink text-ink-foreground">
        <div className="container flex h-8 items-center justify-between text-[11px] font-mono uppercase tracking-widest">
          <span className="opacity-70">Fire &amp; Security Systems — Scotland &amp; UK</span>
          <span className="opacity-70 hidden sm:inline">Trade enquiries: info@corefireprotection.co.uk</span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-all duration-300 ${
          scrolled ? "shadow-lg shadow-black/20" : ""
        }`}
      >
        <div className="container flex h-16 items-center gap-6">
          {/* Logo */}
          <Link href="/" aria-label="Core Fire Protection home">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-[#E8340A]/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-[#E8340A]" />
              </div>
              <span className="font-display text-xl font-bold tracking-[0.15em] uppercase leading-none text-foreground">
                Core
                <span className="ml-1 text-[0.55em] font-mono font-normal tracking-widest align-middle text-ember">
                  FIRE
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2 ml-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="nord-nav-pill"
              >
                {link.label}
              </button>
            ))}
            <Link href="/portal">
              <span className="nord-nav-pill">Client Portal</span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-colors text-foreground/70 hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <Link href="/agreement">
              <Button size="sm" className="fire-gradient fire-glow text-white font-semibold rounded-full">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Start Agreement
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-foreground" />
              ) : (
                <Menu className="h-4 w-4 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/portal">
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Client Portal
                </button>
              </Link>
              <div className="pt-2">
                <Link href="/agreement">
                  <Button
                    className="w-full fire-gradient fire-glow text-white font-semibold rounded-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Start Agreement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main bento-grid layout ────────────────────────────────── */}
      <main className="container py-8">

        {/* ── Hero bento grid ───────────────────────────────────── */}
        <section
          id="home"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6 mb-6"
        >
          {/* Hero card — spans 2 cols × 2 rows */}
          <article className="bento-card md:col-span-2 lg:row-span-2 p-8 lg:p-10 flex flex-col gap-6 min-h-[440px] relative overflow-hidden">
            <AnimatedBackground />
            <div className="relative z-10 flex flex-col gap-6 h-full">
              <div className="nord-tag">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground pulse-signal inline-block" />
                Fire &amp; Security Systems — Scotland
              </div>
              <h1 className="font-display text-7xl lg:text-[9rem] font-bold tracking-tight leading-[0.95] text-balance">
                CORE
                <br />
                <span className="text-xl lg:text-2xl font-semibold tracking-tight block mt-3 text-foreground/80">
                  Protect. Comply. Manage Digitally.
                </span>
              </h1>
              <div className="space-y-3 text-base text-muted-foreground max-w-md text-pretty leading-relaxed">
                <p>
                  Create comprehensive fire and security systems maintenance contracts digitally.
                  Select from 76+ services across 14 categories, sign electronically, and ensure
                  compliance with all applicable British Standards.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-auto">
                <Link href="/agreement">
                  <a className="bento-pill fire-gradient text-white border-0 font-semibold pulse-fire">
                    <FileText className="h-3.5 w-3.5" />
                    Start Agreement
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </Link>
                <Link href="/portal">
                  <a className="bento-pill">
                    <Shield className="h-3.5 w-3.5" />
                    Client Portal
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </Link>
              </div>
            </div>
          </article>

          {/* Stats card */}
          <article className="bento-card p-6 flex flex-col gap-4 justify-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Platform stats
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "76+", label: "Services" },
                { value: "14", label: "Categories" },
                { value: "10+", label: "Yrs Exp." },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold font-display text-ember leading-none">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["BAFE SP203-1", "NSI Gold", "BSI Kitemark"].map((badge) => (
                <span key={badge} className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] border border-white/[0.08] rounded-full text-muted-foreground">
                  {badge}
                </span>
              ))}
            </div>
          </article>

          {/* Quick access card */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Quick access
            </p>
            <div className="space-y-2 flex-1">
              {[
                { icon: FileText, label: "New Agreement", href: "/agreement", desc: "Create a digital service contract" },
                { icon: Shield, label: "Client Portal", href: "/portal", desc: "View your agreements" },
                { icon: BarChart3, label: "Service Dashboard", href: "/dashboard", desc: "Manage all services" },
              ].map(({ icon: Icon, label, href, desc }) => (
                <Link key={href} href={href}>
                  <a className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-ember/10 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-ember transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground leading-none">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </Link>
              ))}
            </div>
          </article>
        </section>

        {/* ── Features bento grid ───────────────────────────────── */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6 mb-6">

          {/* Section label */}
          <div className="lg:col-span-4 flex items-center justify-between pt-4 pb-2">
            <div className="nord-tag">/01 — Features</div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Platform capabilities</h2>
          </div>

          {/* Feature card 1 — Digital Agreements */}
          <article className="bento-card md:col-span-2 p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-ember/10 border border-ember/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-ember" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                /01 — Core feature
              </p>
              <h3 className="font-display text-2xl font-semibold leading-snug mb-3">
                Digital Service Agreements
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create comprehensive fire and security maintenance contracts digitally. Select from
                76+ services across 14 categories, add custom line items, and generate legally-binding
                PDF agreements in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              {["BS 5839-1:2025", "BS EN 12845", "PD 6662", "BAFE SP203-1"].map((std) => (
                <span key={std} className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] border border-white/[0.08] rounded-full text-muted-foreground">
                  {std}
                </span>
              ))}
            </div>
          </article>

          {/* Feature card 2 — Electronic Signatures */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Pen className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                /02 — Signatures
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug mb-2">
                Electronic Signatures
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Legally binding digital signatures. Sign on any device — no printing required.
              </p>
            </div>
            <Link href="/agreement">
              <a className="bento-pill mt-auto self-start">
                <span>Try it</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Link>
          </article>

          {/* Feature card 3 — Client Portal */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Shield className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                /03 — Portal
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug mb-2">
                Client Portal
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clients access all their agreements, compliance documents, and renewal dates in one place.
              </p>
            </div>
            <Link href="/portal">
              <a className="bento-pill mt-auto self-start">
                <span>Access portal</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Link>
          </article>

          {/* Feature card 4 — Instant PDF */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Download className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                /04 — Export
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug mb-2">
                Instant PDF Generation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate professional, BS-compliant PDF agreements instantly. Delivered by email automatically.
              </p>
            </div>
          </article>

          {/* Feature card 5 — AI Assistant */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Zap className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                /05 — AI
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug mb-2">
                Guided Form Assistant
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step guided walkthrough with field highlighting. Complete agreements in minutes, not hours.
              </p>
            </div>
          </article>

          {/* Feature card 6 — QR Codes */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <QrCode className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                /06 — QR
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug mb-2">
                QR Code Access
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each agreement gets a unique QR code linking directly to the client portal view.
              </p>
            </div>
          </article>
        </section>

        {/* ── Services bento grid ───────────────────────────────── */}
        <section id="services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6 mb-6">

          {/* Section label */}
          <div className="lg:col-span-4 flex items-center justify-between pt-4 pb-2">
            <div className="nord-tag">/02 — Services</div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Our service range</h2>
          </div>

          {/* Services grid */}
          {[
            { icon: Bell, label: "Fire Detection & Alarms", count: "BS 5839-1:2025", desc: "Addressable & conventional systems, panels, detectors, call points" },
            { icon: Droplets, label: "Sprinkler Systems", count: "BS EN 12845", desc: "Wet, dry, pre-action and deluge systems for all occupancy types" },
            { icon: Camera, label: "CCTV Systems", count: "BAFE SP203-4", desc: "IP and analogue CCTV, DVR/NVR, remote monitoring integration" },
            { icon: KeyRound, label: "Access Control", count: "BS EN 50133", desc: "Card readers, biometrics, intercoms, door controllers" },
            { icon: Lightbulb, label: "Emergency Lighting", count: "BS 5266-1", desc: "Maintained and non-maintained emergency luminaires and testing" },
            { icon: Radio, label: "Remote Monitoring", count: "BS 5979", desc: "24/7 ARC monitoring, dual-path signalling, BS 8243 compliant" },
          ].map(({ icon: Icon, label, count, desc }) => (
            <article key={label} className="bento-card p-6 flex flex-col gap-3 group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center group-hover:bg-ember/10 group-hover:border-ember/20 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-ember transition-colors" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5">
                  {count}
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-1.5">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}

          {/* CTA card */}
          <article className="bento-card md:col-span-2 p-8 flex flex-col gap-4 justify-between" style={{ background: 'linear-gradient(135deg, #E8340A, #FE7B02 60%, #ff9b35)' }}>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70 mb-3">
                76+ services available
              </p>
              <h3 className="font-display text-3xl font-bold text-white leading-tight mb-3">
                Ready to create your service agreement?
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Select from our full catalogue of fire and security services. Digital signatures, instant PDF, BS compliant.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/agreement">
                <a className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-[#E8340A] text-sm font-bold hover:bg-white/90 transition-colors">
                  <FileText className="h-4 w-4" />
                  Start Agreement
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Link>
              <Link href="/portal">
                <a className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white/20 text-white text-sm font-semibold border border-white/30 hover:bg-white/30 transition-colors">
                  Client Portal
                </a>
              </Link>
            </div>
          </article>
        </section>

        {/* ── Why Us bento grid ─────────────────────────────────── */}
        <section id="why-us" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6 mb-6">

          {/* Section label */}
          <div className="lg:col-span-4 flex items-center justify-between pt-4 pb-2">
            <div className="nord-tag">/03 — Difference</div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Why Core Fire works differently</h2>
          </div>

          {[
            {
              label: "A",
              title: "Specialist focus, narrow choice",
              desc: "We list specialist fire and security solutions where the right choice is already narrow — not endless catalogues of near-identical options.",
              icon: Shield,
            },
            {
              label: "B",
              title: "Built for real work",
              desc: "Services are organised around practical maintenance agreements and clear compliance information so professionals can prepare jobs with confidence.",
              icon: Wrench,
            },
            {
              label: "C",
              title: "Available when you need it",
              desc: "On demand, making it easy to create agreements, check compliance status, and manage your fire safety portfolio whenever work is being planned.",
              icon: Clock,
            },
            {
              label: "D",
              title: "Fully accredited",
              desc: "BAFE SP203-1, NSI Gold, BSI Kitemark. Every agreement is generated to meet the latest British Standards — BS 5839-1:2025, BS EN 12845, PD 6662.",
              icon: Award,
            },
          ].map(({ label, title, desc, icon: Icon }) => (
            <article key={label} className="bento-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-white/[0.06] border border-white/[0.08] rounded-full w-7 h-7 flex items-center justify-center font-bold">
                  {label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </section>

        {/* ── Accreditations marquee ────────────────────────────── */}
        <section className="mb-6 overflow-hidden bento-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 text-center">
            Trusted accreditations
          </p>
          <div className="flex overflow-hidden">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {["BAFE SP203-1", "BAFE SP101", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662", "BS 5266-1", "BS 5979", "BS EN 50133",
                "BAFE SP203-1", "BAFE SP101", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662", "BS 5266-1", "BS 5979", "BS EN 50133"].map((acc, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember/60 shrink-0" />
                  {acc}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── About / Testimonial bento ─────────────────────────── */}
        <section id="about" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6 mb-6">

          {/* Section label */}
          <div className="lg:col-span-4 flex items-center justify-between pt-4 pb-2">
            <div className="nord-tag">/04 — About</div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Core Fire Protection</h2>
          </div>

          {/* About card */}
          <article className="bento-card md:col-span-2 lg:col-span-2 p-8 flex flex-col gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Glasgow, Scotland — Est. 2014
              </p>
              <h3 className="font-display text-3xl font-bold leading-tight mb-4">
                Professional fire &amp; security solutions
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Core Fire Protection Ltd is a Glasgow-based specialist in fire detection, alarm, sprinkler,
                CCTV, and security systems. We serve commercial, industrial, and residential clients across
                Scotland and the UK.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our digital portal makes it simple to create, sign, and manage service agreements — keeping
                your business compliant with the latest British Standards.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              <a href="tel:01414331934" className="bento-pill">
                <Phone className="h-3.5 w-3.5" />
                0141 433 1934
              </a>
              <a href="mailto:info@corefireprotection.co.uk" className="bento-pill">
                <Mail className="h-3.5 w-3.5" />
                Email us
              </a>
              <a href="https://www.corefireprotection.co.uk" target="_blank" rel="noopener noreferrer" className="bento-pill">
                <ExternalLink className="h-3.5 w-3.5" />
                Website
              </a>
            </div>
          </article>

          {/* Testimonial card */}
          <article className="bento-card md:col-span-2 p-8 flex flex-col gap-4 justify-between">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-ember text-ember" />
              ))}
            </div>
            <blockquote className="text-lg font-medium text-foreground leading-relaxed flex-1">
              "Core Fire Protection transformed how we manage our fire safety compliance. The digital agreement
              system saves us hours every month and the client portal keeps everything in one place."
            </blockquote>
            <div>
              <p className="text-sm font-semibold text-foreground">Property Manager</p>
              <p className="text-xs text-muted-foreground">Glasgow Commercial Estate</p>
            </div>
          </article>

          {/* Contact card */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Contact
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:01414331934" className="text-sm font-medium text-foreground hover:text-ember transition-colors">
                  0141 433 1934
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:info@corefireprotection.co.uk" className="text-sm font-medium text-foreground hover:text-ember transition-colors break-all">
                  info@corefireprotection.co.uk
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-muted-foreground">Unit 4, 200 Woodville Street<br />Glasgow, G51 2RL</p>
              </div>
            </div>
          </article>

          {/* Accreditation card */}
          <article className="bento-card p-6 flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Accreditations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["BAFE SP203-1", "BAFE SP101", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662"].map((acc) => (
                <span key={acc} className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] border border-white/[0.08] rounded-full text-muted-foreground">
                  {acc}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-auto">
              Independently assessed and certified to the highest fire protection and security standards in the UK.
            </p>
          </article>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-ink text-ink-foreground mt-8">
        <div className="container py-16">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-[#E8340A]/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-[#E8340A]" />
                </div>
                <span className="font-display text-xl font-bold tracking-[0.15em] uppercase leading-none text-ink-foreground">
                  Core
                  <span className="ml-1 text-[0.55em] font-mono font-normal tracking-widest align-middle text-ember">
                    FIRE
                  </span>
                </span>
              </div>
              <p className="text-sm text-ink-foreground/70 leading-relaxed max-w-xs">
                Professional fire and security systems management. Digital agreements, compliance tracking, and client portal.
              </p>
              <p className="text-[11px] font-mono uppercase tracking-widest text-ember">
                Glasgow · Est. 2014
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-foreground/50 mb-4">
                Services
              </h4>
              <ul className="space-y-2.5">
                {["Fire Detection & Alarms", "Sprinkler Systems", "CCTV & Access Control", "Emergency Lighting", "Portable Fire Equipment", "Remote Monitoring"].map((s) => (
                  <li key={s}>
                    <span className="text-sm text-ink-foreground/70">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portal */}
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-foreground/50 mb-4">
                Portal
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "New Agreement", href: "/agreement" },
                  { label: "Client Portal", href: "/portal" },
                  { label: "Service Dashboard", href: "/dashboard" },
                  { label: "Admin Panel", href: "/admin" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href}>
                      <a className="text-sm text-ink-foreground/70 hover:text-ember transition-colors">
                        {label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-foreground/50 mb-4">
                Contact
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:01414331934" className="flex items-center gap-2 text-sm text-ink-foreground/70 hover:text-ember transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    0141 433 1934
                  </a>
                </li>
                <li>
                  <a href="mailto:info@corefireprotection.co.uk" className="flex items-center gap-2 text-sm text-ink-foreground/70 hover:text-ember transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    info@corefireprotection.co.uk
                  </a>
                </li>
                <li>
                  <a href="https://www.corefireprotection.co.uk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-ink-foreground/70 hover:text-ember transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    corefireprotection.co.uk
                  </a>
                </li>
                <li className="text-sm text-ink-foreground/50 pt-1">
                  Unit 4, 200 Woodville Street<br />Glasgow, G51 2RL
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-foreground/40">
            <p>&copy; 2026 Core Fire Protection Ltd. All rights reserved.</p>
            <p className="text-xs font-mono">BAFE SP203-1 · BAFE SP101 · NSI Gold · BSI Kitemark · BS 5839-1:2025 · BS EN 12845</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-foreground flex items-center justify-center shadow-lg hover:bg-white/20 hover:scale-110 transition-all duration-200 backdrop-blur"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, FileText, Shield, Zap, Clock, Users, ChevronDown,
  Flame, Bell, Phone, Mail, ExternalLink, ArrowRight,
  BarChart3, Building2, Menu, X, ChevronUp, Star, Award,
  Wrench, Radio, Camera, KeyRound, Lightbulb, Droplets,
  Sun, Moon, Lock, Pen, QrCode, Download
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
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Services", id: "services" },
    { label: "Why Us", id: "why-us" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-lg shadow-black/10"
            : "bg-background/85 backdrop-blur-xl border-b border-border/60"
        }`}
      >
        <div className="accent-bar" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/JiTjkhwCQcNFndvg.png"
                alt="Core Fire Protection"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/portal">
                <button className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground">
                  Client Portal
                </button>
              </Link>

              {/* Theme toggle */}
              {switchable && toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}

              <Link href="/agreement">
                <Button size="sm" className="fire-gradient fire-glow text-white font-semibold">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Start Agreement
                </Button>
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-2">
              {switchable && toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-4 border-t border-border/60 pt-4 space-y-1 animate-fade-in">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-[#FF6B35] hover:bg-secondary rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/portal">
                <button
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-[#FF6B35] hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Client Portal
                </button>
              </Link>
              <div className="pt-2">
                <Link href="/agreement">
                  <Button
                    className="w-full fire-gradient fire-glow text-white font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Start Agreement
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-28 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-[#E8340A]/5 pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35] animate-fade-in-up">
                <Zap className="h-4 w-4" />
                Fire &amp; Security Systems Business Service Agreement Portal
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                PROTECT.{" "}
                <span className="fire-gradient-text">COMPLY.</span>
                <br />
                MANAGE{" "}
                <span className="fire-gradient-text">DIGITALLY.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Create comprehensive fire and security systems maintenance contracts digitally.
                Select from 76+ services across 14 categories, sign electronically, and ensure
                compliance with all applicable British Standards.
              </p>
              <div className="grid grid-cols-3 gap-6 py-4 border-y border-border/40 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                {[
                  { value: "76+", label: "Services Available" },
                  { value: "14", label: "Service Categories" },
                  { value: "10+", label: "Years Experience" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-4xl font-bold fire-gradient-text">{value}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
                {["BAFE SP203-1", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662"].map((badge) => (
                  <span key={badge} className="px-3 py-1 text-xs font-medium bg-[#E8340A]/10 border border-[#E8340A]/20 rounded-full text-[#FF6B35]">
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <Link href="/agreement">
                  <Button size="lg" className="fire-gradient fire-glow text-white font-bold text-lg px-8 pulse-fire">
                    <FileText className="mr-2 h-5 w-5" />
                    Start Agreement
                  </Button>
                </Link>
                <Link href="/portal">
                  <Button size="lg" variant="outline" className="border-[#E8340A]/30 hover:bg-[#E8340A]/10 text-lg px-8">
                    <Shield className="mr-2 h-5 w-5" />
                    Client Portal
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8340A]/20 to-[#F5A623]/20 blur-3xl rounded-full scale-75" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/SZeDWIMkEBbvcIZE.png"
                alt="Core Fire Protection AI Robot Assistant with branded service van"
                className="relative z-10 w-full h-[500px] object-contain object-center animate-float"
                loading="eager"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-[#FF6B35]" />
        </div>
      </section>

      {/* Portal Entry Cards */}
      <section className="py-16 px-4 bg-card/30 border-y border-border/60">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35] mb-2">Portal Access</p>
            <h2 className="text-3xl font-bold">Your Fire Safety Hub</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link href="/portal">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10 h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl fire-gradient flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Client Portal</CardTitle>
                  <CardDescription>View your agreements, download PDFs, track renewals, and manage your fire safety compliance in one place.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/agreement">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10 h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl fire-gradient flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Pen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">New Agreement</CardTitle>
                  <CardDescription>Build a comprehensive service agreement with 76+ services, custom sections, and electronic signatures.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/dashboard">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10 h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl fire-gradient flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Service Dashboard</CardTitle>
                  <CardDescription>Monitor all active contracts, upcoming visits, revenue analytics, and service performance metrics.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/admin">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10 h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl fire-gradient flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                  <CardDescription>Full agreement management, QR code generation, email dispatch, and business analytics for administrators.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
              <Zap className="h-4 w-4" />
              PLATFORM FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="fire-gradient-text">Manage Compliance</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A complete digital platform for fire and security service agreement management,
              from creation to signature to ongoing client management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="h-6 w-6 text-[#FF6B35]" />,
                title: "Digital Agreement Builder",
                desc: "Create comprehensive service agreements with 76+ services across 14 categories. Drag-and-drop section reordering, custom sections, and real-time pricing.",
              },
              {
                icon: <Pen className="h-6 w-6 text-[#FF6B35]" />,
                title: "Electronic Signatures",
                desc: "Capture legally binding digital signatures from both client and company representatives directly on screen or via touchscreen devices.",
              },
              {
                icon: <Download className="h-6 w-6 text-[#FF6B35]" />,
                title: "Instant PDF Generation",
                desc: "Generate professionally formatted PDF contracts with your branding, signatures, and full service schedules at the click of a button.",
              },
              {
                icon: <QrCode className="h-6 w-6 text-[#FF6B35]" />,
                title: "QR Code Access",
                desc: "Generate unique QR codes for each agreement so clients can instantly access their portal and view their contract from any device.",
              },
              {
                icon: <Shield className="h-6 w-6 text-[#FF6B35]" />,
                title: "Client Portal",
                desc: "Clients get a secure portal to view all their agreements, track renewal dates, download documents, and manage their compliance.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#FF6B35]" />,
                title: "Analytics & Reporting",
                desc: "Track revenue, monitor contract status, identify upcoming renewals, and get full visibility across your entire client base.",
              },
              {
                icon: <Bell className="h-6 w-6 text-[#FF6B35]" />,
                title: "Renewal Alerts",
                desc: "Automatic notifications for contracts expiring within 30 or 60 days, ensuring you never miss a renewal opportunity.",
              },
              {
                icon: <Users className="h-6 w-6 text-[#FF6B35]" />,
                title: "Multi-Role Access",
                desc: "Separate dashboards for admin, service team, and clients — each with role-appropriate views and permissions.",
              },
              {
                icon: <Clock className="h-6 w-6 text-[#FF6B35]" />,
                title: "Guided Walkthrough",
                desc: "Step-by-step guided mode for creating agreements ensures no field is missed and every contract is complete and compliant.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="stat-card group hover:border-[#E8340A]/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8340A]/10 border border-[#E8340A]/20 flex items-center justify-center mb-4 group-hover:bg-[#E8340A]/15 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-24 px-4 bg-card/20 border-y border-border/60">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/djNeAHXiQcQruXwU.jpg"
                alt="Fire safety compliance analytics dashboard"
                className="relative z-10 w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-[#E8340A]/20 border border-[#E8340A]/20"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35]">
                <Flame className="h-4 w-4" />
                14 SERVICE CATEGORIES
              </div>
              <h2 className="text-4xl font-bold">
                Complete Fire &amp; Security{" "}
                <span className="fire-gradient-text">Systems Coverage</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                From fire detection and sprinkler systems to CCTV, access control and remote monitoring —
                our service agreement covers every aspect of your fire and security compliance obligations.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Bell className="h-3.5 w-3.5" />, label: "Fire Detection & Alarm" },
                  { icon: <Droplets className="h-3.5 w-3.5" />, label: "Sprinkler Systems" },
                  { icon: <Flame className="h-3.5 w-3.5" />, label: "Fire Suppression" },
                  { icon: <Lightbulb className="h-3.5 w-3.5" />, label: "Emergency Lighting" },
                  { icon: <Shield className="h-3.5 w-3.5" />, label: "Passive Fire Protection" },
                  { icon: <Bell className="h-3.5 w-3.5" />, label: "Intruder Alarm" },
                  { icon: <Camera className="h-3.5 w-3.5" />, label: "CCTV & Surveillance" },
                  { icon: <KeyRound className="h-3.5 w-3.5" />, label: "Access Control" },
                  { icon: <Radio className="h-3.5 w-3.5" />, label: "Remote Monitoring" },
                  { icon: <Wrench className="h-3.5 w-3.5" />, label: "Portable Equipment" },
                  { icon: <Zap className="h-3.5 w-3.5" />, label: "Emergency Callout" },
                  { icon: <Building2 className="h-3.5 w-3.5" />, label: "Professional Services" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-[#E8340A]/5 transition-colors">
                    <span className="text-[#FF6B35] flex-shrink-0">{icon}</span>
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <Link href="/agreement">
                <Button className="fire-gradient fire-glow text-white font-semibold mt-4">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Your Agreement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
              <Award className="h-4 w-4" />
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Businesses{" "}
              <span className="fire-gradient-text">Across Scotland</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Core Fire Protection Ltd delivers industry-leading fire and security services backed by
              decades of expertise and the highest accreditations in the industry.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: <Award className="h-8 w-8 text-[#FF6B35]" />, title: "BAFE Accredited", desc: "SP203-1 & SP101 certified. Independently assessed to the highest fire protection standards." },
              { icon: <Star className="h-8 w-8 text-[#FF6B35]" />, title: "NSI Gold", desc: "National Security Inspectorate Gold certification for security systems installation and maintenance." },
              { icon: <Shield className="h-8 w-8 text-[#FF6B35]" />, title: "BSI Kitemark", desc: "British Standards Institution Kitemark holder — the UK's most recognised quality mark." },
              { icon: <CheckCircle2 className="h-8 w-8 text-[#FF6B35]" />, title: "BS 5839-1:2025", desc: "Fully compliant with the latest revision of the UK's primary fire detection and alarm standard." },
            ].map((item) => (
              <div key={item.title} className="stat-card text-center group hover:border-[#E8340A]/30 transition-all">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8340A]/10 border border-[#E8340A]/20 flex items-center justify-center group-hover:bg-[#E8340A]/15 transition-colors">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl border border-[#E8340A]/20 bg-[#E8340A]/5 p-8 md:p-12 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#FF6B35] text-[#FF6B35]" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              "Core Fire Protection transformed how we manage our fire safety compliance. The digital agreement
              system saves us hours every month and the client portal keeps everything in one place."
            </blockquote>
            <p className="text-sm text-muted-foreground">— Property Manager, Glasgow Commercial Estate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden bg-card/20 border-y border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8340A]/10 via-transparent to-[#F5A623]/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 fire-gradient opacity-50" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35] mb-8">
            <Flame className="h-4 w-4" />
            GET STARTED TODAY
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to{" "}
            <span className="fire-gradient-text">Protect</span>
            <br />
            Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create your comprehensive fire and security service agreement in minutes.
            Digital signatures, instant PDF generation, and full BS compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agreement">
              <Button size="lg" className="fire-gradient fire-glow text-white font-bold text-lg px-12 pulse-fire">
                <FileText className="mr-2 h-5 w-5" />
                Start Your Agreement Now
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="lg" variant="outline" className="border-[#E8340A]/30 hover:bg-[#E8340A]/10 text-lg px-8">
                <Shield className="mr-2 h-5 w-5" />
                Access Client Portal
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {[
              "No setup fees",
              "Instant PDF generation",
              "Legally binding signatures",
              "BS compliant documents",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6B35]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-4 border-t border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/JiTjkhwCQcNFndvg.png"
                  alt="Core Fire Protection"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-3">Professional Fire &amp; Security Solutions</p>
              <p className="text-sm text-muted-foreground">Unit 4, 200 Woodville Street</p>
              <p className="text-sm text-muted-foreground">Glasgow, G51 2RL</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["BAFE SP203-1", "BAFE SP101", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845"].map((acc) => (
                  <span key={acc} className="px-2 py-0.5 text-xs bg-[#E8340A]/10 border border-[#E8340A]/20 rounded text-[#FF6B35]">{acc}</span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4 text-[#FF6B35]">Contact</h3>
              <div className="space-y-3">
                <a href="tel:01414331934" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  0141 433 1934
                </a>
                <a href="mailto:info@corefireprotection.co.uk" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  info@corefireprotection.co.uk
                </a>
                <a href="https://www.corefireprotection.co.uk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  www.corefireprotection.co.uk
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold mb-4 text-[#FF6B35]">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Fire Detection &amp; Alarm Systems</li>
                <li>Sprinkler &amp; Suppression Systems</li>
                <li>CCTV &amp; Access Control</li>
                <li>Emergency Lighting</li>
                <li>Portable Fire Equipment</li>
                <li>Remote Monitoring</li>
                <li>Emergency Callout</li>
              </ul>
            </div>

            {/* Portal Links */}
            <div>
              <h3 className="font-bold mb-4 text-[#FF6B35]">Portal</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/portal" className="flex items-center gap-1.5 text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    <ArrowRight className="h-3 w-3" />
                    Client Portal
                  </Link>
                </li>
                <li>
                  <Link href="/agreement" className="flex items-center gap-1.5 text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    <ArrowRight className="h-3 w-3" />
                    New Agreement
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    <ArrowRight className="h-3 w-3" />
                    Service Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    <ArrowRight className="h-3 w-3" />
                    Admin Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 Core Fire Protection Ltd. All rights reserved.</p>
            <p className="text-xs">BAFE SP203-1 | BAFE SP101 | NSI Gold | BSI Kitemark | BS 5839-1:2025 | BS EN 12845 | PD 6662</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full fire-gradient fire-glow text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, FileText, Shield, Zap, Clock, Users, ChevronDown,
  Flame, Lock, Bell, Phone, Mail, MapPin, Star, ArrowRight,
  BarChart3, Building2, ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Home() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
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
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("home")} className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground">
                Home
              </button>
              <button onClick={() => scrollToSection("features")} className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground">
                Features
              </button>
              <button onClick={() => scrollToSection("services")} className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground">
                Services
              </button>
              <Link href="/portal">
                <button className="text-sm hover:text-[#FF6B35] transition-colors font-medium text-muted-foreground">
                  Client Portal
                </button>
              </Link>
              <Link href="/agreement">
                <Button size="sm" className="fire-gradient fire-glow text-white font-semibold">
                  Start Agreement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-28 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
        <AnimatedBackground />

        {/* Video background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/hero-bg-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-[#E8340A]/5 pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35]">
                <Zap className="h-4 w-4" />
                Fire &amp; Security Systems Business Service Agreement Portal
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                PROTECT.{" "}
                <span className="fire-gradient-text">COMPLY.</span>
                <br />
                MANAGE{" "}
                <span className="fire-gradient-text">DIGITALLY.</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Create comprehensive fire and security systems maintenance contracts digitally.
                Select from 76+ services across 14 categories, sign electronically, and ensure
                compliance with all applicable British Standards.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link href="/agreement">
                  <Button size="lg" className="fire-gradient fire-glow text-white font-bold text-lg px-8">
                    <FileText className="mr-2 h-5 w-5" />
                    Start Agreement
                  </Button>
                </Link>
                <Link href="/portal">
                  <Button size="lg" variant="outline" className="border-[#E8340A]/30 hover:bg-[#E8340A]/10 text-lg px-8 hover:border-[#E8340A]/50">
                    <Shield className="mr-2 h-5 w-5" />
                    Client Portal
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                {[
                  { value: "76+", label: "Services Available" },
                  { value: "14",  label: "Service Categories" },
                  { value: "10+", label: "Years Experience" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-4xl font-bold fire-gradient-text">{value}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {/* Compliance badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["BAFE SP203-1", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662"].map((badge) => (
                  <span key={badge} className="px-3 py-1 text-xs font-medium bg-[#E8340A]/10 border border-[#E8340A]/20 rounded-full text-[#FF6B35]">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column - Mascot */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8340A]/20 to-[#F5A623]/20 blur-3xl rounded-full scale-75" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/SZeDWIMkEBbvcIZE.png"
                alt="Core Fire Protection AI Robot Assistant with branded service van"
                className="relative z-10 w-full h-[500px] object-contain object-center animate-float"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-[#FF6B35]" />
        </div>
      </section>

      {/* ── Portal Entry Cards ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-card/30 border-y border-border/60">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35] mb-2">Portal Access</p>
            <h2 className="text-3xl font-bold">Your Fire Safety Hub</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Client Portal */}
            <Link href="/portal">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl fire-gradient flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Client Portal</CardTitle>
                  <CardDescription>
                    View your agreements, download PDFs, track renewals, and manage your fire safety compliance in one place.
                  </CardDescription>
                  <div className="flex items-center gap-1 text-xs text-[#FF6B35] font-semibold mt-2">
                    Access Portal <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {/* New Agreement */}
            <Link href="/agreement">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="h-6 w-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">New Agreement</CardTitle>
                  <CardDescription>
                    Build a fully customised service agreement with digital signatures, pricing calculator, and instant PDF generation.
                  </CardDescription>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-2">
                    Start Now <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {/* Admin */}
            <Link href="/admin">
              <Card className="border-border/60 hover:border-[#E8340A]/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#E8340A]/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage all client agreements, view analytics, track renewals, send emails, and download reports.
                  </CardDescription>
                  <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold mt-2">
                    Admin Access <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8340A]/10 border border-[#E8340A]/30 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
              <CheckCircle2 className="h-4 w-4" />
              PLATFORM FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="fire-gradient-text">Intelligent</span> Fire Safety
              <br />
              Management Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage fire and security compliance — from digital contracts to client portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="h-7 w-7 text-[#FF6B35]" />,
                title: "Digital Signatures",
                desc: "Sign contracts electronically with touch or mouse. Legally binding digital signatures for both client and company representative.",
              },
              {
                icon: <Shield className="h-7 w-7 text-[#FF6B35]" />,
                title: "76+ Services",
                desc: "Full service schedule covering fire detection, sprinklers, suppression, CCTV, access control, emergency lighting and more across 14 categories.",
              },
              {
                icon: <Clock className="h-7 w-7 text-[#FF6B35]" />,
                title: "Instant Processing",
                desc: "Real-time pricing calculations with VAT. Automated compliance checks and instant PDF generation for immediate contract execution.",
              },
              {
                icon: <Users className="h-7 w-7 text-[#FF6B35]" />,
                title: "Client Portal",
                desc: "Dedicated client portal for viewing agreements, downloading documents, tracking renewals, and accessing compliance certificates.",
              },
              {
                icon: <FileText className="h-7 w-7 text-[#FF6B35]" />,
                title: "Smart Documents",
                desc: "Generate professional PDF documents with one click. Editable cover page, service schedule and full T&Cs with drag-and-drop section ordering.",
              },
              {
                icon: <Lock className="h-7 w-7 text-[#FF6B35]" />,
                title: "Standards Compliant",
                desc: "Compliant with BS 5839-1:2025, BS EN 12845, PD 6662, BS 5266-1 and all applicable British Standards. BAFE, NSI Gold and BSI Kitemark accredited.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/60 hover:border-[#E8340A]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#E8340A]/5">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-[#E8340A]/10 flex items-center justify-center mb-4 border border-[#E8340A]/20">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Overview ────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E8340A]/3 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8340A]/10 to-[#F5A623]/10 blur-3xl rounded-full" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/djNeAHXiQcQruXwU.jpg"
                alt="Fire safety compliance analytics dashboard"
                className="relative z-10 w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-[#E8340A]/20 border border-[#E8340A]/20"
              />
            </div>

            {/* Right - Service categories */}
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
                  "Fire Detection & Alarm",
                  "Sprinkler Systems",
                  "Fire Suppression",
                  "Emergency Lighting",
                  "Passive Fire Protection",
                  "Intruder Alarm",
                  "CCTV & Surveillance",
                  "Access Control",
                  "Remote Monitoring",
                  "Portable Equipment",
                  "Emergency Callout",
                  "Professional Services",
                ].map((service) => (
                  <div key={service} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FF6B35] flex-shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
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

      {/* ── CTA Section ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E8340A]/10 to-[#F5A623]/10" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/NoaGItwgwFCzfCoG.png"
              alt="Core Fire Protection"
              className="h-24 w-auto object-contain opacity-90"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <br />
            <span className="fire-gradient-text">Fire Safety Management?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join businesses already using our intelligent platform to manage their fire and security compliance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agreement">
              <Button size="lg" className="fire-gradient fire-glow text-white font-bold text-lg px-12">
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
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 border-t border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/JiTjkhwCQcNFndvg.png"
                  alt="Core Fire Protection"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">Professional Fire &amp; Security Solutions</p>
              <p className="text-sm text-muted-foreground mt-2">Unit 4, 200 Woodville Street</p>
              <p className="text-sm text-muted-foreground">Glasgow, G51 2RL</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-[#FF6B35]">Contact</h3>
              <div className="space-y-2">
                <a href="tel:01414331934" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  0141 433 1934
                </a>
                <a href="mailto:info@corefireprotection.co.uk" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  info@corefireprotection.co.uk
                </a>
                <a href="https://www.corefireprotection.co.uk" target="_blank" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF6B35] transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                  www.corefireprotection.co.uk
                </a>
              </div>
            </div>
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
            <div>
              <h3 className="font-bold mb-4 text-[#FF6B35]">Portal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/portal" className="text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    Client Portal
                  </Link>
                </li>
                <li>
                  <Link href="/agreement" className="text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    New Agreement
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-muted-foreground hover:text-[#FF6B35] transition-colors">
                    Admin Dashboard
                  </Link>
                </li>
              </ul>
              <div className="mt-6">
                <h3 className="font-bold mb-3 text-[#FF6B35]">Accreditations</h3>
                <div className="flex flex-wrap gap-1">
                  {["BAFE", "NSI Gold", "BSI"].map((acc) => (
                    <span key={acc} className="px-2 py-0.5 text-xs bg-[#E8340A]/10 border border-[#E8340A]/20 rounded text-[#FF6B35]">{acc}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/60 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Core Fire Protection Ltd. All rights reserved. | BAFE SP203-1 | BAFE SP101 | NSI Gold | BSI Kitemark | BS 5839-1:2025 | BS EN 12845 | PD 6662</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

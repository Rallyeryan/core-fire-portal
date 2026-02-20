import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Shield, Zap, Clock, Users, ChevronDown, Flame, Lock, Bell } from "lucide-react";
import { Link } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Home() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/20">
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
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("home")} className="text-sm hover:text-primary transition-colors font-medium">
                Home
              </button>
              <button onClick={() => scrollToSection("features")} className="text-sm hover:text-primary transition-colors font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection("services")} className="text-sm hover:text-primary transition-colors font-medium">
                Services
              </button>
              <Link href="/portal">
                <button className="text-sm hover:text-primary transition-colors font-medium">
                  My Portal
                </button>
              </Link>
              <Link href="/agreement">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 btn-pulse btn-hover-scale btn-hover-glow">
                  Start Agreement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-28 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Animated Particles Background */}
        <AnimatedBackground />

        {/* Video Background (subtle overlay) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-bg-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Systems Business Service Agreement Portal
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                THE ULTIMATE{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                  INTELLIGENCE
                </span>
                <br />
                FOR A{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                  DIGITAL
                </span>{" "}
                FUTURE
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Create comprehensive fire and security systems maintenance contracts digitally.
                Select from 76+ services across 14 categories, sign electronically, and ensure
                compliance with all applicable British Standards.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link href="/agreement">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-lg px-8 btn-pulse btn-hover-scale btn-hover-glow">
                    <FileText className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 text-lg px-8 btn-hover-scale hover:border-primary/50"
                  onClick={() => scrollToSection("features")}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold text-primary">76+</div>
                  <div className="text-sm text-muted-foreground">Services Available</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">14</div>
                  <div className="text-sm text-muted-foreground">Service Categories</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>

              {/* Compliance badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["BAFE SP203-1", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025", "BS EN 12845", "PD 6662"].map((badge) => (
                  <span key={badge} className="px-3 py-1 text-xs font-medium bg-primary/10 border border-primary/20 rounded-full text-primary">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column - Branded Mascot Hero */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-400/20 blur-3xl rounded-full scale-75" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/SZeDWIMkEBbvcIZE.png"
                alt="Core Fire Protection AI Robot Assistant with branded service van"
                className="relative z-10 w-full h-[500px] object-contain object-center animate-float"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-primary" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary mb-6">
              <CheckCircle2 className="h-4 w-4" />
              UNLOCK THE POWER
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                INTELLIGENCE
              </span>{" "}
              FOR A
              <br />
              DIGITAL{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                FUTURE
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leap into the future with our AI-powered fire safety management platform.
              Experience seamless digital workflows and intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="h-7 w-7 text-primary" />,
                title: "Digital Signatures",
                desc: "Sign contracts electronically with touch or mouse. Legally binding digital signatures for both client and company representative.",
              },
              {
                icon: <Shield className="h-7 w-7 text-primary" />,
                title: "Systems Management",
                desc: "Full service schedule covering fire detection, sprinklers, suppression, CCTV, access control, emergency lighting and more. 76 services across 14 categories.",
              },
              {
                icon: <Clock className="h-7 w-7 text-primary" />,
                title: "Instant Processing",
                desc: "Real-time pricing calculations with VAT. Automated compliance checks and instant PDF generation for immediate contract execution.",
              },
              {
                icon: <Users className="h-7 w-7 text-primary" />,
                title: "Standards Compliant",
                desc: "Compliant with BS 5839-1:2025, BS EN 12845, PD 6662, BS 5266-1 and all applicable British Standards. BAFE, NSI Gold and BSI Kitemark accredited.",
              },
              {
                icon: <FileText className="h-7 w-7 text-primary" />,
                title: "Smart Documents",
                desc: "Generate professional PDF documents with one click. Editable cover page, introduction letter, service schedule and full T&Cs with drag-and-drop section ordering.",
              },
              {
                icon: <Lock className="h-7 w-7 text-primary" />,
                title: "Secure & Validated",
                desc: "Enterprise-grade security with end-to-end encryption. Smart form validation ensures data accuracy and compliance across all service categories.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="glass-card border-glow hover:glow-green-sm transition-all duration-300">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
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

      {/* Services Overview Section */}
      <section id="services" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - 3D Data Visualization */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-400/10 blur-3xl rounded-full" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/djNeAHXiQcQruXwU.jpg"
                alt="Dynamic data visualization showing fire safety compliance analytics"
                className="relative z-10 w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-primary/20 border border-primary/20"
              />
            </div>

            {/* Right - Service Categories */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary">
                <Flame className="h-4 w-4" />
                14 SERVICE CATEGORIES
              </div>
              <h2 className="text-4xl font-bold">
                Complete Fire &amp; Security{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                  Systems Coverage
                </span>
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
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </div>
                ))}
              </div>
              <Link href="/agreement">
                <Button className="bg-primary hover:bg-primary/90 mt-4 btn-hover-scale btn-hover-glow">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Your Agreement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-400/10" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          {/* Large logo watermark */}
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
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Fire Safety Management?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join businesses already using our intelligent platform to manage their fire and security compliance
          </p>
          <Link href="/agreement">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-lg px-12 btn-pulse btn-hover-scale btn-hover-glow">
              <FileText className="mr-2 h-5 w-5" />
              Start Your Agreement Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-primary/20 bg-card/30 backdrop-blur-sm">
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
              <h3 className="font-bold mb-4 text-primary">Contact</h3>
              <p className="text-sm text-muted-foreground">Tel: 0141 433 1934</p>
              <p className="text-sm text-muted-foreground">Email: service@corefire.co.uk</p>
              <p className="text-sm text-muted-foreground">www.corefire.co.uk</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-primary">Services</h3>
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
              <h3 className="font-bold mb-4 text-primary">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Terms &amp; Conditions</li>
                <li>Privacy Policy</li>
                <li>Service Standards</li>
                <li>Support</li>
              </ul>
              <div className="mt-6">
                <h3 className="font-bold mb-3 text-primary">Accreditations</h3>
                <div className="flex flex-wrap gap-1">
                  {["BAFE", "NSI Gold", "BSI"].map((acc) => (
                    <span key={acc} className="px-2 py-0.5 text-xs bg-primary/10 border border-primary/20 rounded text-primary">{acc}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary/20 text-center text-sm text-muted-foreground">
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

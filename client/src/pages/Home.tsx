import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Shield, Zap, Clock, Users, ChevronDown } from "lucide-react";
import { Link } from "wouter";

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Core Fire
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("home")} className="text-sm hover:text-primary transition-colors font-medium">
                Home
              </button>
              <button onClick={() => scrollToSection("features")} className="text-sm hover:text-primary transition-colors font-medium">
                Features
              </button>
              <Link href="/portal">
                <button className="text-sm hover:text-primary transition-colors font-medium">
                  My Portal
                </button>
              </Link>
              <Link href="/agreement">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Start Agreement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://private-us-east-1.manuscdn.com/sessionFile/hrBnEIOQk2izp2n6q5hcSX/sandbox/aUhAj8nRDCXR1KHTW6BjbP-img-3_1770429556000_na1fn_Y3VydmVkLWxpbmVzLWJn.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaHJCbkVJT1FrMml6cDJuNnE1aGNTWC9zYW5kYm94L2FVaEFqOG5SRENYUjFLSFRXNkJqYlAtaW1nLTNfMTc3MDQyOTU1NjAwMF9uYTFmbl9ZM1Z5ZG1Wa0xXeHBibVZ6TFdKbi5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DbhlRJMmT32a-Uy7uiJUhW89mD4TzW3rsCnKkgH1UW75OKWMRcz2OdokSliDILDtc4-u2q~V4lr8n4KVCqFizXPrxB-BzFtvXI7jnA~gzEkyCOlok5i7tCp5d6fGzZdvzfGStYm6GG9~HWvuIeiTY77pmG5e09nSgF4w9i0TezObYL9S~UFoNO88L3RsHLyD0trZXwCjWi1R0HBnPI3g1G0fCXSGGMo31ZrqR~nt7Yp13rFi6Os~ifGGSvVIGw3J928WJ6fi8Fnhs7vECG4gxmo03fb3AevnIAQJNfr-VNGpxX1~33Ej~~bMMKhXWIs~obzq1FWQKyKuV~dV-tfMKw__"
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
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
                Create comprehensive fire and security systems maintenance contracts digitally. Select from 76+ services across 14 categories, sign electronically, and ensure compliance with all applicable British Standards.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link href="/agreement">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-lg px-8">
                    <FileText className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 text-lg px-8">
                  <Shield className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold text-primary">218K+</div>
                  <div className="text-sm text-muted-foreground">Equipment Inspected</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">100M+</div>
                  <div className="text-sm text-muted-foreground">Digital Signatures</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Right Column - Robot Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-400/20 blur-3xl rounded-full"></div>
              <img 
                src="https://private-us-east-1.manuscdn.com/sessionFile/hrBnEIOQk2izp2n6q5hcSX/sandbox/aUhAj8nRDCXR1KHTW6BjbP-img-1_1770429551000_na1fn_cm9ib3QtaGVybw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaHJCbkVJT1FrMml6cDJuNnE1aGNTWC9zYW5kYm94L2FVaEFqOG5SRENYUjFLSFRXNkJqYlAtaW1nLTFfMTc3MDQyOTU1MTAwMF9uYTFmbl9jbTlpYjNRdGFHVnlidy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=j-cK3eIj2rQMdUgNPiiDBYCgkIfddMzUxlB40BltUaLPhEcrYqPgzqhJo~LOsi39ELf-045TFd-oti6i46nWRIheAubBTAJKW-lCgAcSUjVC7Ph7UwpcZTmj~9IPlSqsIaaL4fXlsXVdz18w~8mmLN6j14bw9ZFSOQLDTza0p7HVG70LwPVK5dK~vkkNB5~0if2UpyFNnNK5OZlPdNDTIE2hX-h~hC764mNW0d860ATGYR124n88Rg2MkoX0GxCUX5WWL-Dg0~S9Jha~twtAeKpxCrnqZIPDwHfJikBldzjzsUlJgj2wxgxbxRlAYAPs6sEvsKUOEa-5HdhascJ~xQ__"
                alt="AI Robot Assistant"
                className="relative z-10 w-full max-w-md mx-auto animate-float"
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
            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Digital Signatures</CardTitle>
                <CardDescription className="text-base">
                  Sign contracts electronically with touch or mouse. Legally binding digital signatures for both client and company representative with blockchain verification.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Systems Management</CardTitle>
                <CardDescription className="text-base">
                  Full service schedule covering fire detection, sprinklers, suppression, CCTV, access control, emergency lighting and more. 76 services across 14 categories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Instant Processing</CardTitle>
                <CardDescription className="text-base">
                  Real-time pricing calculations with VAT. Automated compliance checks and instant PDF generation for immediate contract execution.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Standards Compliant</CardTitle>
                <CardDescription className="text-base">
                  Compliant with BS 5839-1:2025, BS EN 12845, PD 6662, BS 5266-1 and all applicable British Standards. BAFE, NSI Gold and BSI Kitemark accredited.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Documents</CardTitle>
                <CardDescription className="text-base">
                  Generate professional PDF documents with one click. AI-powered document assembly with automatic data population and version control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4 border border-primary/30">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Validated</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade security with end-to-end encryption. Smart form validation ensures data accuracy with AI-powered fraud detection.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-400/10"></div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Fire Safety Management?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of businesses already using our intelligent platform
          </p>
          <Link href="/agreement">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-lg px-12">
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
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-primary">Core Fire</h3>
              </div>
              <p className="text-sm text-muted-foreground">Professional Fire Safety Solutions</p>
              <p className="text-sm text-muted-foreground mt-2">Unit 4 Woodville Park Industrial Estate</p>
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
                <li>Fire Detection & Alarm Systems</li>
                <li>Sprinkler & Suppression Systems</li>
                <li>CCTV & Access Control</li>
                <li>Emergency Lighting</li>
                <li>Portable Fire Equipment</li>
                <li>Emergency Callout</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-primary">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
                <li>Service Standards</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary/20 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Core Fire Protection Ltd. All rights reserved. | BAFE Registered | NSI Gold | BSI Kitemark | BS 5839-1:2025 | BS EN 12845 | PD 6662</p>
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

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Search, Download, FileText, Calendar, PoundSterling, Loader2,
  AlertCircle, CheckCircle2, Shield, Bell, Phone, Mail, MapPin,
  Clock, TrendingUp, ChevronRight, ExternalLink, LogOut,
  Building2, ClipboardList, BarChart3, Settings, Menu, X,
  Flame, Star, AlertTriangle, RefreshCw, Eye
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { Link } from "wouter";

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: "Active",    cls: "status-active" },
    pending:   { label: "Pending",   cls: "status-pending" },
    draft:     { label: "Draft",     cls: "status-draft" },
    cancelled: { label: "Cancelled", cls: "status-cancelled" },
    completed: { label: "Completed", cls: "status-completed" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current blink" />
      {cfg.label}
    </span>
  );
}

function RenewalBanner({ endDate }: { endDate: Date }) {
  const days = differenceInDays(new Date(endDate), new Date());
  if (days < 0) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        Contract expired {Math.abs(days)} days ago
      </div>
    );
  }
  if (days <= 60) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        Renews in {days} days — action required
      </div>
    );
  }
  return null;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ClientPortal() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for agreement ID in URL parameters (from QR code scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agreementId = params.get("agreement");
    if (agreementId) {
      setSelectedAgreementId(parseInt(agreementId));
      setActiveTab("agreements");
    }
  }, []);

  const { data: agreements, isLoading: agreementsLoading } = trpc.agreements.list.useQuery();
  const { data: agreementDetail, isLoading: detailLoading } = trpc.agreements.get.useQuery(
    { id: selectedAgreementId! },
    { enabled: selectedAgreementId !== null }
  );

  const downloadPDF = trpc.agreements.downloadPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("PDF download started");
    },
    onError: () => toast.error("Failed to download PDF"),
  });

  // Filter to user's agreements by email
  const userAgreements = agreements?.filter((a) => {
    if (!user?.email) return false;
    return a.email.toLowerCase() === user.email.toLowerCase();
  }) ?? [];

  const filteredAgreements = userAgreements.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.contractReference.toLowerCase().includes(q) ||
      a.clientName.toLowerCase().includes(q)
    );
  });

  const activeCount    = userAgreements.filter((a) => a.status === "active").length;
  const pendingCount   = userAgreements.filter((a) => a.status === "pending").length;
  const totalValue     = userAgreements.reduce((s, a) => s + parseFloat(a.total.toString()), 0);
  const renewalSoon    = userAgreements.filter((a) => {
    const days = differenceInDays(new Date(a.endDate), new Date());
    return days >= 0 && days <= 60;
  }).length;

  // ── Auth guards ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full fire-gradient flex items-center justify-center mx-auto">
            <Flame className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your portal…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-border/60">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl fire-gradient flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">Client Portal</CardTitle>
            <CardDescription>Sign in to access your Core Fire Protection portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <a href="/api/oauth/login">
              <Button className="w-full fire-gradient fire-glow text-white font-semibold">
                Sign In to Portal
              </Button>
            </a>
            <Link href="/">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  const navItems = [
    { id: "overview",    label: "Overview",    icon: BarChart3 },
    { id: "agreements",  label: "Agreements",  icon: ClipboardList },
    { id: "documents",   label: "Documents",   icon: FileText },
    { id: "contact",     label: "Contact",     icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/60 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Accent bar */}
        <div className="accent-bar" />

        {/* Brand */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl fire-gradient flex items-center justify-center flex-shrink-0">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Core Fire</p>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator />

        {/* User info */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-9 h-9 rounded-full fire-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name ?? "Client"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email ?? ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`portal-nav-item w-full ${activeTab === id ? "active" : ""}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 space-y-1 border-t border-border/60">
          <Link href="/agreement">
            <button className="portal-nav-item w-full">
              <FileText className="h-4 w-4 flex-shrink-0" />
              New Agreement
            </button>
          </Link>
          <a href="/api/auth/logout">
            <button className="portal-nav-item w-full text-red-400 hover:text-red-300">
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign Out
            </button>
          </a>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/60 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold text-sm capitalize">{activeTab}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renewalSoon > 0 && (
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bell className="h-3 w-3" />
                {renewalSoon} renewal{renewalSoon > 1 ? "s" : ""} due
              </div>
            )}
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">

          {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-5xl">
              {/* Welcome */}
              <div className="relative overflow-hidden rounded-2xl p-6 bg-card border border-border/60">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#E8340A] blur-3xl" />
                </div>
                <div className="relative">
                  <p className="text-xs font-semibold text-[#FF6B35] uppercase tracking-widest mb-1">Welcome back</p>
                  <h2 className="text-2xl font-bold mb-1">{user.name ?? "Client"}</h2>
                  <p className="text-muted-foreground text-sm">
                    Your Core Fire Protection service portal — manage agreements, download documents, and track your fire safety compliance.
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Total Agreements</p>
                  <p className="text-3xl font-bold">{userAgreements.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Active Contracts</p>
                  <p className="text-3xl font-bold text-green-400">{activeCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pendingCount} pending</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Total Value</p>
                  <p className="text-3xl font-bold text-[#FF6B35]">£{totalValue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Inc. VAT</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Renewals Due</p>
                  <p className={`text-3xl font-bold ${renewalSoon > 0 ? "text-amber-400" : ""}`}>{renewalSoon}</p>
                  <p className="text-xs text-muted-foreground mt-1">Within 60 days</p>
                </div>
              </div>

              {/* Recent agreements */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Agreements</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#FF6B35]"
                      onClick={() => setActiveTab("agreements")}
                    >
                      View all <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {agreementsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : userAgreements.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No agreements yet</p>
                      <p className="text-xs mt-1">Start your first service agreement below</p>
                      <Link href="/agreement">
                        <Button size="sm" className="mt-4 fire-gradient fire-glow text-white">
                          Start Agreement
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {userAgreements.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => { setSelectedAgreementId(a.id); setActiveTab("agreements"); }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#E8340A]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-[#FF6B35]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{a.clientName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{a.contractReference}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <StatusBadge status={a.status} />
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/agreement">
                  <Card className="border-border/60 hover:border-[#E8340A]/30 transition-colors cursor-pointer group">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl fire-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">New Agreement</p>
                        <p className="text-xs text-muted-foreground">Start a new service contract</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <button onClick={() => setActiveTab("documents")} className="text-left">
                  <Card className="border-border/60 hover:border-[#E8340A]/30 transition-colors cursor-pointer group h-full">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Download className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Documents</p>
                        <p className="text-xs text-muted-foreground">Download PDFs & certificates</p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
                <button onClick={() => setActiveTab("contact")} className="text-left">
                  <Card className="border-border/60 hover:border-[#E8340A]/30 transition-colors cursor-pointer group h-full">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Contact Us</p>
                        <p className="text-xs text-muted-foreground">24/7 emergency support</p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </div>
            </div>
          )}

          {/* ── AGREEMENTS TAB ────────────────────────────────────────── */}
          {activeTab === "agreements" && (
            <div className="space-y-5 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">My Agreements</h2>
                  <p className="text-sm text-muted-foreground">View and manage your service contracts</p>
                </div>
                <Link href="/agreement">
                  <Button size="sm" className="fire-gradient fire-glow text-white font-semibold">
                    + New Agreement
                  </Button>
                </Link>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference or company name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Agreement cards */}
              {agreementsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAgreements.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-25" />
                  <p className="font-medium">No agreements found</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? "Try a different search term" : "Start your first service agreement"}
                  </p>
                  {!searchQuery && (
                    <Link href="/agreement">
                      <Button size="sm" className="mt-4 fire-gradient fire-glow text-white">
                        Start Agreement
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAgreements.map((a) => {
                    const isSelected = selectedAgreementId === a.id;
                    return (
                      <Card
                        key={a.id}
                        className={`border-border/60 transition-all cursor-pointer hover:shadow-md ${
                          isSelected ? "border-[#E8340A]/40 shadow-md" : ""
                        }`}
                        onClick={() => setSelectedAgreementId(isSelected ? null : a.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <CardTitle className="text-base truncate">{a.clientName}</CardTitle>
                              <CardDescription className="font-mono text-xs mt-0.5">
                                {a.contractReference}
                              </CardDescription>
                            </div>
                            <StatusBadge status={a.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-xs">
                                {format(new Date(a.startDate), "dd MMM yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-xs">
                                {format(new Date(a.endDate), "dd MMM yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <PoundSterling className="h-3.5 w-3.5 text-[#FF6B35] flex-shrink-0" />
                              <span className="text-sm font-semibold text-[#FF6B35]">
                                £{parseFloat(a.total.toString()).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-xs truncate">{a.city}</span>
                            </div>
                          </div>

                          <RenewalBanner endDate={a.endDate} />

                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); setSelectedAgreementId(a.id); }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="fire-gradient fire-glow text-white text-xs"
                              onClick={(e) => { e.stopPropagation(); downloadPDF.mutate({ id: a.id }); }}
                              disabled={downloadPDF.isPending}
                            >
                              {downloadPDF.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Agreement detail dialog */}
              <Dialog
                open={selectedAgreementId !== null && activeTab === "agreements"}
                onOpenChange={(open) => { if (!open) setSelectedAgreementId(null); }}
              >
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#FF6B35]" />
                      Agreement Details
                    </DialogTitle>
                    <DialogDescription>
                      {agreementDetail?.agreement.contractReference}
                    </DialogDescription>
                  </DialogHeader>

                  {detailLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : agreementDetail ? (
                    <div className="space-y-5">
                      {/* Status + value */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/60">
                        <StatusBadge status={agreementDetail.agreement.status} />
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Contract Value</p>
                          <p className="text-xl font-bold text-[#FF6B35]">
                            £{parseFloat(agreementDetail.agreement.total.toString()).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">inc. VAT</p>
                        </div>
                      </div>

                      {/* Client info */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Client Information</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ["Company", agreementDetail.agreement.clientName],
                            ["Contact", agreementDetail.agreement.contactName],
                            ["Email", agreementDetail.agreement.email],
                            ["Telephone", agreementDetail.agreement.telephone],
                            ["Site Address", `${agreementDetail.agreement.siteAddress}, ${agreementDetail.agreement.city}, ${agreementDetail.agreement.postcode}`],
                          ].map(([label, value]) => (
                            <div key={label} className={label === "Site Address" ? "col-span-2" : ""}>
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Contract details */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Contract Details</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ["Start Date", format(new Date(agreementDetail.agreement.startDate), "dd MMMM yyyy")],
                            ["End Date", format(new Date(agreementDetail.agreement.endDate), "dd MMMM yyyy")],
                            ["Duration", agreementDetail.agreement.contractDuration],
                            ["Frequency", agreementDetail.agreement.serviceFrequency],
                            ["Payment Terms", agreementDetail.agreement.paymentTerms],
                            ["Billing Cycle", agreementDetail.agreement.billingCycle],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Pricing */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pricing Breakdown</p>
                        <div className="space-y-2 text-sm">
                          {[
                            ["Service Fee", `£${parseFloat(agreementDetail.agreement.serviceFee.toString()).toFixed(2)}`],
                            ["Maintenance Fee", `£${parseFloat(agreementDetail.agreement.maintenanceFee.toString()).toFixed(2)}`],
                            ["Additional Services", `£${parseFloat(agreementDetail.agreement.additionalFee?.toString() ?? "0").toFixed(2)}`],
                            ["Subtotal (Ex. VAT)", `£${parseFloat(agreementDetail.agreement.subtotal.toString()).toFixed(2)}`],
                            ["VAT (20%)", `£${parseFloat(agreementDetail.agreement.vat.toString()).toFixed(2)}`],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total (Inc. VAT)</span>
                            <span className="text-[#FF6B35]">
                              £{parseFloat(agreementDetail.agreement.total.toString()).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Equipment */}
                      {agreementDetail.equipment.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                              Equipment / Services ({agreementDetail.equipment.length} items)
                            </p>
                            <div className="space-y-2">
                              {agreementDetail.equipment.map((eq) => (
                                <div
                                  key={eq.id}
                                  className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-secondary/40"
                                >
                                  <span className="font-medium">{eq.type}</span>
                                  <Badge variant="secondary">Qty: {eq.quantity}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1 fire-gradient fire-glow text-white font-semibold"
                          onClick={() => downloadPDF.mutate({ id: agreementDetail.agreement.id })}
                          disabled={downloadPDF.isPending}
                        >
                          {downloadPDF.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download PDF
                        </Button>
                        <a href="tel:01414331934">
                          <Button variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Us
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ── DOCUMENTS TAB ─────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h2 className="text-lg font-bold">Documents</h2>
                <p className="text-sm text-muted-foreground">Download your service agreements, certificates, and reports</p>
              </div>

              {agreementsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : userAgreements.length === 0 ? (
                <Card className="border-border/60">
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-25" />
                    <p className="font-medium">No documents available</p>
                    <p className="text-sm mt-1">Documents will appear here once you have active agreements</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userAgreements.map((a) => (
                    <Card key={a.id} className="border-border/60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#E8340A]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-[#FF6B35]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                Service Agreement — {a.clientName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">{a.contractReference}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Signed {format(new Date(a.clientSignedAt), "dd MMM yyyy")} · £{parseFloat(a.total.toString()).toFixed(2)} inc. VAT
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={a.status} />
                            <Button
                              size="sm"
                              className="fire-gradient fire-glow text-white text-xs"
                              onClick={() => downloadPDF.mutate({ id: a.id })}
                              disabled={downloadPDF.isPending}
                            >
                              {downloadPDF.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5 mr-1.5" />
                                  PDF
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Compliance info */}
              <Card className="border-[#E8340A]/20 bg-[#E8340A]/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Compliance Documentation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All service agreements and certificates are stored securely. Documents are retained for 7 years in accordance with UK GDPR and BS 5839-1:2025 requirements. Contact us if you need additional compliance documentation.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["BAFE SP203-1", "NSI Gold", "BS 5839-1:2025", "EN 50131"].map((cert) => (
                          <span key={cert} className="text-xs px-2 py-1 rounded-md bg-[#E8340A]/10 text-[#FF6B35] border border-[#E8340A]/20 font-medium">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── CONTACT TAB ───────────────────────────────────────────── */}
          {activeTab === "contact" && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h2 className="text-lg font-bold">Contact Core Fire Protection</h2>
                <p className="text-sm text-muted-foreground">We're here 24/7 for emergencies and during business hours for general enquiries</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emergency */}
                <Card className="border-[#E8340A]/30 bg-[#E8340A]/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl fire-gradient flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Emergency Line</p>
                        <p className="text-xs text-muted-foreground">24/7 · 365 days</p>
                      </div>
                    </div>
                    <a href="tel:01414331934" className="block">
                      <Button className="w-full fire-gradient fire-glow text-white font-bold">
                        0141 433 1934
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Max 4-hour emergency response</p>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Email Support</p>
                        <p className="text-xs text-muted-foreground">Reply within 1 business day</p>
                      </div>
                    </div>
                    <a href="mailto:info@corefireprotection.co.uk" className="block">
                      <Button variant="outline" className="w-full">
                        info@corefireprotection.co.uk
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>

              {/* SLA info */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#FF6B35]" />
                    Service Level Agreement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Emergency Response", value: "Max 4 hours", icon: "🚨" },
                    { label: "Priority Fault Attendance", value: "Next business day", icon: "⚡" },
                    { label: "Routine PPM Notice", value: "5 working days", icon: "📅" },
                    { label: "Service Reports Issued", value: "Within 5 working days", icon: "📋" },
                    { label: "Minor Remedial Works", value: "Same visit (under £250)", icon: "🔧" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>{icon}</span>
                        {label}
                      </span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#F5A623]" />
                    Accreditations & Standards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "BAFE SP203-1", desc: "Fire Detection & Alarm" },
                      { name: "NSI Gold", desc: "Security Systems" },
                      { name: "BS 5839-1:2025", desc: "Fire Alarm Standard" },
                      { name: "EN 50131", desc: "Intruder Alarm Standard" },
                      { name: "BS EN 12845", desc: "Sprinkler Systems" },
                      { name: "BS EN 62676", desc: "CCTV Surveillance" },
                    ].map(({ name, desc }) => (
                      <div key={name} className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/40">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold">{name}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

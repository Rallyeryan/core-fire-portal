import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  Search, Download, FileText, Calendar, PoundSterling, Loader2,
  AlertCircle, CheckCircle2, Shield, Bell, Phone, Mail, MapPin,
  Clock, TrendingUp, ChevronRight, ExternalLink, LogOut,
  Building2, ClipboardList, BarChart3, Settings, Menu, X,
  Flame, AlertTriangle, RefreshCw, Eye, Plus, Filter,
  Users, Activity, Zap, Star, ArrowUpRight, ArrowDownRight,
  FileCheck, Layers, ChevronDown, ChevronUp, Info,
  Bell as BellIcon, Droplets, DoorClosed, ClipboardCheck,
  ShieldAlert, Camera, KeyRound, Radio, Siren, Compass,
  Lightbulb, Flashlight
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from "recharts";
import { SERVICE_SCHEDULE } from "@/lib/serviceSchedule";

// ── Types ─────────────────────────────────────────────────────────────────────
type AgreementStatus = "draft" | "pending" | "active" | "completed" | "cancelled";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function RenewalAlert({ endDate }: { endDate: Date }) {
  const days = differenceInDays(new Date(endDate), new Date());
  if (days < 0) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        Expired {Math.abs(days)}d ago
      </div>
    );
  }
  if (days <= 30) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        Expires in {days}d
      </div>
    );
  }
  if (days <= 60) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        Renews in {days}d
      </div>
    );
  }
  return null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "fire-detection":       <BellIcon className="h-4 w-4" />,
  "sprinkler-systems":    <Droplets className="h-4 w-4" />,
  "fire-suppression":     <Flame className="h-4 w-4" />,
  "fixed-infrastructure": <Building2 className="h-4 w-4" />,
  "portable-equipment":   <Flashlight className="h-4 w-4" />,
  "emergency-lighting":   <Lightbulb className="h-4 w-4" />,
  "passive-fire":         <DoorClosed className="h-4 w-4" />,
  "fire-safety-management": <ClipboardCheck className="h-4 w-4" />,
  "intruder-security":    <ShieldAlert className="h-4 w-4" />,
  "cctv-surveillance":    <Camera className="h-4 w-4" />,
  "access-control":       <KeyRound className="h-4 w-4" />,
  "remote-monitoring":    <Radio className="h-4 w-4" />,
  "reactive-callout":     <Siren className="h-4 w-4" />,
  "professional-services":<Compass className="h-4 w-4" />,
};

const STATUS_OPTIONS: AgreementStatus[] = ["active", "pending", "draft", "completed", "cancelled"];

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon: Icon, trend, trendLabel, color = "fire"
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "fire" | "green" | "amber" | "blue" | "red";
}) {
  const colorMap = {
    fire:  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    green: { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20" },
    amber: { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20" },
    blue:  { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
    red:   { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
  };
  const c = colorMap[color];
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(trend)}% {trendLabel}
        </div>
      )}
    </div>
  );
}

// ── Agreement Detail Dialog ───────────────────────────────────────────────────
function AgreementDetailDialog({
  agreementId,
  open,
  onClose,
  onStatusChange,
}: {
  agreementId: number | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const { data, isLoading } = trpc.agreements.get.useQuery(
    { id: agreementId! },
    { enabled: !!agreementId && open }
  );
  const downloadPDF = trpc.agreements.downloadPDF.useMutation({
    onSuccess: (result) => {
      const link = document.createElement("a");
      link.href = result.url;
      link.download = `Agreement-${data?.agreement.contractReference}.pdf`;
      link.click();
      toast.success("PDF downloaded");
    },
    onError: () => toast.error("Failed to download PDF"),
  });
  const updateStatus = trpc.agreements.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      onStatusChange();
    },
    onError: () => toast.error("Failed to update status"),
  });
  const sendEmails = trpc.agreements.sendEmails.useMutation({
    onSuccess: () => toast.success("Emails sent successfully"),
    onError: () => toast.error("Failed to send emails"),
  });

  if (!data && !isLoading) return null;
  const ag = data?.agreement;
  const eq = data?.equipment ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ag ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold fire-gradient-text">
                    {ag.contractReference}
                  </DialogTitle>
                  <DialogDescription className="mt-1">{ag.clientName}</DialogDescription>
                </div>
                <StatusBadge status={ag.status} />
              </div>
            </DialogHeader>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => downloadPDF.mutate({ id: ag.id })}
                disabled={downloadPDF.isPending}
                className="fire-gradient text-white fire-glow"
              >
                {downloadPDF.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendEmails.mutate({ agreementId: ag.id })}
                disabled={sendEmails.isPending}
              >
                {sendEmails.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Emails
              </Button>
              <Select
                value={ag.status}
                onValueChange={(val) => updateStatus.mutate({ id: ag.id, status: val as AgreementStatus })}
              >
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Client Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{ag.siteAddress}, {ag.city}, {ag.postcode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{ag.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{ag.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{ag.contactName}{ag.position ? ` — ${ag.position}` : ""}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Contract Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{ag.contractDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{format(new Date(ag.startDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{format(new Date(ag.endDate), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium">{ag.serviceFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing</span>
                    <span className="font-medium">{ag.billingCycle}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <PoundSterling className="h-4 w-4 text-primary" /> Pricing Summary
              </h3>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>£{parseFloat(ag.serviceFee as string).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maintenance Fee</span>
                  <span>£{parseFloat(ag.maintenanceFee as string).toFixed(2)}</span>
                </div>
                {parseFloat(ag.additionalFee as string) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Fee</span>
                    <span>£{parseFloat(ag.additionalFee as string).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>£{parseFloat(ag.subtotal as string).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span>£{parseFloat(ag.vat as string).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="fire-gradient-text">£{parseFloat(ag.total as string).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Equipment */}
            {eq.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-primary" /> Equipment ({eq.length} items)
                  </h3>
                  <div className="space-y-1.5">
                    {eq.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm px-3 py-2 rounded-lg bg-secondary/40">
                        <span className="text-foreground">{item.type}</span>
                        <Badge variant="outline" className="text-xs">×{item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Services */}
            {ag.servicesIncluded && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" /> Services Included
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ag.servicesIncluded}</p>
                </div>
              </>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Created: {format(new Date(ag.createdAt), "dd MMM yyyy HH:mm")}</span>
              {ag.emailSentAt && <span>Email sent: {format(new Date(ag.emailSentAt), "dd MMM yyyy")}</span>}
              {ag.pdfUrl && (
                <a href={ag.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  View PDF <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ── Service Catalog Card ──────────────────────────────────────────────────────
function ServiceCatalogCard({ category }: { category: typeof SERVICE_SCHEDULE[0] }) {
  const [expanded, setExpanded] = useState(false);
  const priced = category.services.filter(s => s.unitPrice !== null);
  const avgPrice = priced.length > 0
    ? priced.reduce((sum, s) => sum + (s.unitPrice ?? 0), 0) / priced.length
    : null;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200 hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {CATEGORY_ICONS[category.id] ?? <Shield className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">{category.services.length} services{avgPrice ? ` · avg £${avgPrice.toFixed(0)}/yr` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{category.services.length}</Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="divide-y divide-border">
            {category.services.map((service) => (
              <div key={service.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{service.standard}</span>
                    {!service.isOneOff && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{service.frequencyType}</span>
                    )}
                    {service.isOneOff && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">One-Off</span>
                    )}
                    {service.isReactive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Reactive</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {service.unitPrice !== null ? (
                    <p className="text-sm font-bold text-foreground">£{service.unitPrice.toFixed(0)}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">TBC</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ServiceDashboard() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const listQuery = trpc.agreements.list.useQuery(undefined, { refetchInterval: 30_000 });
  const analyticsQuery = trpc.agreements.getAnalytics.useQuery(undefined, { refetchInterval: 30_000 });
  const utils = trpc.useUtils();

  const agreements = listQuery.data ?? [];
  const analytics = analyticsQuery.data;

  // Filtered agreements
  const filtered = useMemo(() => {
    return agreements.filter(ag => {
      const matchesStatus = statusFilter === "all" || ag.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        ag.clientName.toLowerCase().includes(q) ||
        ag.contractReference.toLowerCase().includes(q) ||
        ag.city.toLowerCase().includes(q) ||
        ag.email.toLowerCase().includes(q) ||
        ag.postcode.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [agreements, statusFilter, searchQuery]);

  // Filtered service catalog
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return SERVICE_SCHEDULE;
    const q = catalogSearch.toLowerCase();
    return SERVICE_SCHEDULE.map(cat => ({
      ...cat,
      services: cat.services.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.standard.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.services.length > 0 || cat.name.toLowerCase().includes(q));
  }, [catalogSearch]);

  const handleViewDetail = useCallback((id: number) => {
    setSelectedId(id);
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(() => {
    utils.agreements.list.invalidate();
    utils.agreements.getAnalytics.invalidate();
    if (selectedId) utils.agreements.get.invalidate({ id: selectedId });
  }, [utils, selectedId]);

  // Renewals due soon
  const renewalsSoon = useMemo(() => {
    return agreements.filter(ag => {
      if (ag.status !== "active" || !ag.endDate) return false;
      const days = differenceInDays(new Date(ag.endDate), new Date());
      return days >= 0 && days <= 60;
    }).sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());
  }, [agreements]);

  // Sidebar navigation
  const navItems = [
    { id: "overview",  label: "Overview",       icon: BarChart3 },
    { id: "agreements",label: "Agreements",      icon: FileText },
    { id: "analytics", label: "Analytics",       icon: TrendingUp },
    { id: "catalog",   label: "Service Catalog", icon: Layers },
    { id: "renewals",  label: "Renewals",        icon: Clock, badge: renewalsSoon.length || undefined },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-card border-r border-border
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl fire-gradient flex items-center justify-center fire-glow">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Core Fire</p>
              <p className="text-xs text-muted-foreground">Service Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`portal-nav-item w-full ${activeTab === item.id ? "active" : ""}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}

          <Separator className="my-3" />

          <Link href="/agreement">
            <a className="portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium">
              <Plus className="h-4 w-4 flex-shrink-0" />
              New Agreement
            </a>
          </Link>
          <Link href="/admin">
            <a className="portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium">
              <Settings className="h-4 w-4 flex-shrink-0" />
              Admin Panel
            </a>
          </Link>
          <Link href="/portal">
            <a className="portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium">
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              Client Portal
            </a>
          </Link>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full fire-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground capitalize">
              {navItems.find(n => n.id === activeTab)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { listQuery.refetch(); analyticsQuery.refetch(); }}
              disabled={listQuery.isFetching || analyticsQuery.isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${listQuery.isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/agreement">
              <Button size="sm" className="fire-gradient text-white fire-glow hidden sm:flex">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Agreement
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Grid */}
              {analyticsQuery.isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="stat-card animate-pulse h-24 bg-secondary/50" />
                  ))}
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Total Agreements"
                    value={analytics.total}
                    subtitle={`${analytics.active} active`}
                    icon={FileText}
                    color="fire"
                  />
                  <KpiCard
                    title="Active Contract Value"
                    value={`£${(analytics.totalValue / 1000).toFixed(1)}k`}
                    subtitle={`avg £${analytics.avgValue.toFixed(0)}/contract`}
                    icon={PoundSterling}
                    color="green"
                  />
                  <KpiCard
                    title="Pending Agreements"
                    value={analytics.pending}
                    subtitle="Awaiting activation"
                    icon={Clock}
                    color="amber"
                  />
                  <KpiCard
                    title="Renewals Due"
                    value={analytics.renewalDue}
                    subtitle="Within 60 days"
                    icon={AlertCircle}
                    color={analytics.renewalDue > 0 ? "red" : "blue"}
                  />
                </div>
              ) : null}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Revenue */}
                <div className="lg:col-span-2 border border-border rounded-xl bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Monthly Contract Value (12 months)
                  </h3>
                  {analytics ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analytics.monthly}>
                        <defs>
                          <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E8340A" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#E8340A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(v: number) => [`£${v.toFixed(0)}`, "Value"]}
                        />
                        <Area type="monotone" dataKey="value" stroke="#E8340A" fill="url(#fireGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
                    </div>
                  )}
                </div>

                {/* Status Breakdown */}
                <div className="border border-border rounded-xl bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Status Breakdown
                  </h3>
                  {analytics && analytics.statusBreakdown.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={analytics.statusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {analytics.statusBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 mt-2">
                        {analytics.statusBreakdown.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                              <span className="text-muted-foreground">{s.name}</span>
                            </div>
                            <span className="font-semibold text-foreground">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      No data yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Agreements */}
              <div className="border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Recent Agreements
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setActiveTab("agreements")} className="text-xs">
                    View all <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                {listQuery.isLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : agreements.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No agreements yet. <Link href="/agreement"><a className="text-primary hover:underline">Create one</a></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {agreements.slice(0, 5).map(ag => (
                      <div
                        key={ag.id}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors"
                        onClick={() => handleViewDetail(ag.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{ag.clientName}</p>
                            <StatusBadge status={ag.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ag.contractReference} · {ag.city}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold fire-gradient-text">£{parseFloat(ag.total as string).toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(ag.createdAt), "dd MMM yy")}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Renewals Alert */}
              {renewalsSoon.length > 0 && (
                <div className="border border-amber-500/30 rounded-xl bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-amber-400">{renewalsSoon.length} Renewal{renewalsSoon.length > 1 ? "s" : ""} Due Soon</h3>
                  </div>
                  <div className="space-y-2">
                    {renewalsSoon.slice(0, 3).map(ag => {
                      const days = differenceInDays(new Date(ag.endDate!), new Date());
                      return (
                        <div
                          key={ag.id}
                          className="flex items-center justify-between cursor-pointer hover:opacity-80"
                          onClick={() => handleViewDetail(ag.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{ag.clientName}</p>
                            <p className="text-xs text-muted-foreground">{ag.contractReference}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-semibold ${days <= 30 ? "text-red-400" : "text-amber-400"}`}>
                              {days === 0 ? "Today" : `${days}d left`}
                            </p>
                            <p className="text-xs text-muted-foreground">{format(new Date(ag.endDate!), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {renewalsSoon.length > 3 && (
                    <Button size="sm" variant="ghost" className="mt-2 text-xs text-amber-400" onClick={() => setActiveTab("renewals")}>
                      View all {renewalsSoon.length} renewals <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── AGREEMENTS TAB ────────────────────────────────────────────── */}
          {activeTab === "agreements" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client, reference, city, email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{filtered.length} of {agreements.length} agreements</span>
                {statusFilter !== "all" && (
                  <button onClick={() => setStatusFilter("all")} className="text-primary hover:underline">Clear filter</button>
                )}
              </div>

              {/* Table */}
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                {listQuery.isLoading ? (
                  <div className="p-12 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No agreements match your search</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-xs font-semibold text-muted-foreground">Client</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground">Value</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">End Date</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map(ag => {
                          const daysLeft = ag.endDate ? differenceInDays(new Date(ag.endDate), new Date()) : null;
                          return (
                            <TableRow
                              key={ag.id}
                              className="border-border cursor-pointer hover:bg-secondary/30 transition-colors"
                              onClick={() => handleViewDetail(ag.id)}
                            >
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{ag.clientName}</p>
                                  <p className="text-xs text-muted-foreground">{ag.city}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                  {ag.contractReference}
                                </code>
                              </TableCell>
                              <TableCell><StatusBadge status={ag.status} /></TableCell>
                              <TableCell>
                                <span className="text-sm font-bold fire-gradient-text">
                                  £{parseFloat(ag.total as string).toFixed(0)}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {ag.endDate ? (
                                  <div>
                                    <p className="text-xs text-foreground">{format(new Date(ag.endDate), "dd MMM yyyy")}</p>
                                    {daysLeft !== null && daysLeft <= 60 && daysLeft >= 0 && (
                                      <p className={`text-xs ${daysLeft <= 30 ? "text-red-400" : "text-amber-400"}`}>
                                        {daysLeft}d left
                                      </p>
                                    )}
                                    {daysLeft !== null && daysLeft < 0 && (
                                      <p className="text-xs text-red-400">Expired</p>
                                    )}
                                  </div>
                                ) : "—"}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                {format(new Date(ag.createdAt), "dd MMM yy")}
                              </TableCell>
                              <TableCell>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {analyticsQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : analytics ? (
                <>
                  {/* Summary KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Total Agreements" value={analytics.total} icon={FileText} color="fire" />
                    <KpiCard title="Active" value={analytics.active} icon={CheckCircle2} color="green" />
                    <KpiCard title="Total Portfolio Value" value={`£${(analytics.totalValue / 1000).toFixed(1)}k`} icon={PoundSterling} color="blue" />
                    <KpiCard title="Average Contract" value={`£${analytics.avgValue.toFixed(0)}`} icon={TrendingUp} color="amber" />
                  </div>

                  {/* Revenue Chart */}
                  <div className="border border-border rounded-xl bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Monthly Contract Value — Last 12 Months
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={analytics.monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(v: number) => [`£${v.toFixed(0)}`, "Value"]}
                        />
                        <Bar dataKey="value" fill="#E8340A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status + Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border border-border rounded-xl bg-card p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Agreement Status Distribution
                      </h3>
                      {analytics.statusBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={analytics.statusBreakdown}
                              cx="50%"
                              cy="50%"
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                              labelLine={false}
                            >
                              {analytics.statusBreakdown.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                      )}
                    </div>

                    <div className="border border-border rounded-xl bg-card p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Portfolio Health
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Active Rate", value: analytics.total > 0 ? Math.round((analytics.active / analytics.total) * 100) : 0, color: "bg-green-500" },
                          { label: "Completion Rate", value: analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0, color: "bg-blue-500" },
                          { label: "Pending Rate", value: analytics.total > 0 ? Math.round((analytics.pending / analytics.total) * 100) : 0, color: "bg-amber-500" },
                          { label: "Cancellation Rate", value: analytics.total > 0 ? Math.round((analytics.cancelled / analytics.total) * 100) : 0, color: "bg-red-500" },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-semibold text-foreground">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-2" />
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Agreements</span>
                          <span className="font-semibold">{analytics.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Portfolio Value</span>
                          <span className="font-semibold fire-gradient-text">£{analytics.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Contract Value</span>
                          <span className="font-semibold">£{analytics.avgValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Renewals Due (60d)</span>
                          <span className={`font-semibold ${analytics.renewalDue > 0 ? "text-amber-400" : "text-green-400"}`}>
                            {analytics.renewalDue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Analytics unavailable</p>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICE CATALOG TAB ───────────────────────────────────────── */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services, standards..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {SERVICE_SCHEDULE.reduce((sum, c) => sum + c.services.length, 0)} services across {SERVICE_SCHEDULE.length} categories
                </div>
              </div>

              {/* Category summary chips */}
              <div className="flex flex-wrap gap-2">
                {SERVICE_SCHEDULE.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCatalogSearch(cat.name.split(" ")[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                  >
                    {CATEGORY_ICONS[cat.id] ?? <Shield className="h-3.5 w-3.5" />}
                    {cat.name.split(" ").slice(0, 2).join(" ")}
                    <span className="ml-1 text-primary">{cat.services.length}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredCatalog.map(cat => (
                  <ServiceCatalogCard key={cat.id} category={cat} />
                ))}
                {filteredCatalog.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No services match "{catalogSearch}"</p>
                    <button onClick={() => setCatalogSearch("")} className="text-primary text-sm hover:underline mt-1">Clear search</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RENEWALS TAB ──────────────────────────────────────────────── */}
          {activeTab === "renewals" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Contract Renewals</h2>
                  <p className="text-xs text-muted-foreground">Agreements expiring within 60 days or already expired</p>
                </div>
              </div>

              {listQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : renewalsSoon.length === 0 ? (
                <div className="border border-border rounded-xl bg-card p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-400 opacity-60" />
                  <p className="text-sm font-medium text-foreground">All clear!</p>
                  <p className="text-xs text-muted-foreground mt-1">No agreements expiring within the next 60 days</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {renewalsSoon.map(ag => {
                    const days = differenceInDays(new Date(ag.endDate!), new Date());
                    const isExpired = days < 0;
                    const isUrgent = days >= 0 && days <= 30;
                    return (
                      <div
                        key={ag.id}
                        className={`border rounded-xl bg-card p-4 cursor-pointer hover:border-primary/30 transition-all ${
                          isExpired ? "border-red-500/30 bg-red-500/5" :
                          isUrgent ? "border-amber-500/30 bg-amber-500/5" :
                          "border-border"
                        }`}
                        onClick={() => handleViewDetail(ag.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-foreground">{ag.clientName}</p>
                              <StatusBadge status={ag.status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{ag.contractReference} · {ag.city}, {ag.postcode}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{ag.telephone}</span>
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{ag.email}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold fire-gradient-text">£{parseFloat(ag.total as string).toFixed(0)}</p>
                            <p className={`text-xs font-semibold mt-1 ${isExpired ? "text-red-400" : isUrgent ? "text-amber-400" : "text-yellow-400"}`}>
                              {isExpired ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`}
                            </p>
                            <p className="text-xs text-muted-foreground">{format(new Date(ag.endDate!), "dd MMM yyyy")}</p>
                          </div>
                        </div>

                        {/* Renewal progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Contract period</span>
                            <span>{isExpired ? "Expired" : `${days}d left`}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isExpired ? "bg-red-500 w-full" : isUrgent ? "bg-amber-500" : "bg-yellow-500"}`}
                              style={{
                                width: isExpired ? "100%" : `${Math.max(5, 100 - (days / 60) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All expired agreements */}
              {(() => {
                const expired = agreements.filter(ag => {
                  if (ag.status !== "active" || !ag.endDate) return false;
                  return differenceInDays(new Date(ag.endDate), new Date()) < 0;
                });
                if (expired.length === 0) return null;
                return (
                  <div className="border border-red-500/20 rounded-xl bg-red-500/5 p-4">
                    <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> {expired.length} Expired Contract{expired.length > 1 ? "s" : ""}
                    </h3>
                    <div className="space-y-2">
                      {expired.map(ag => (
                        <div
                          key={ag.id}
                          className="flex items-center justify-between cursor-pointer hover:opacity-80"
                          onClick={() => handleViewDetail(ag.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{ag.clientName}</p>
                            <p className="text-xs text-muted-foreground">{ag.contractReference}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-red-400 font-semibold">
                              Expired {Math.abs(differenceInDays(new Date(ag.endDate!), new Date()))}d ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* Agreement Detail Dialog */}
      <AgreementDetailDialog
        agreementId={selectedId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

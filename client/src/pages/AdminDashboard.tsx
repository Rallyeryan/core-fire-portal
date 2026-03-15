import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import {
  Search, Eye, FileText, Calendar, PoundSterling, Loader2,
  Download, Mail, QrCode, Shield, Flame, TrendingUp, Users,
  AlertTriangle, CheckCircle2, Clock, BarChart3, RefreshCw,
  Building2, Phone, MapPin, ChevronRight, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import QRCode from "qrcode";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

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
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

const FIRE_COLORS = ["#E8340A", "#FF6B35", "#F5A623", "#22C55E", "#3B82F6"];

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Generate QR code when agreement is selected
  useEffect(() => {
    if (selectedAgreementId) {
      const portalUrl = `${window.location.origin}/portal?agreement=${selectedAgreementId}`;
      QRCode.toDataURL(portalUrl, { width: 200, margin: 2 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [selectedAgreementId]);

  const { data: agreements, isLoading: agreementsLoading, refetch } = trpc.agreements.list.useQuery();
  const { data: agreementDetail, isLoading: detailLoading } = trpc.agreements.get.useQuery(
    { id: selectedAgreementId! },
    { enabled: selectedAgreementId !== null }
  );

  const downloadPDF = trpc.agreements.downloadPDF.useMutation({
    onSuccess: (data) => { window.open(data.url, "_blank"); toast.success("PDF downloaded"); },
    onError: () => toast.error("Failed to download PDF"),
  });

  const sendEmailsMutation = trpc.agreements.sendEmails.useMutation({
    onSuccess: () => toast.success("Confirmation emails sent successfully!"),
    onError: (error) => toast.error(`Failed to send emails: ${error.message}`),
  });

  // ── Analytics ──────────────────────────────────────────────────────────────

  const totalAgreements  = agreements?.length ?? 0;
  const activeCount      = agreements?.filter((a) => a.status === "active").length ?? 0;
  const pendingCount     = agreements?.filter((a) => a.status === "pending").length ?? 0;
  const totalValue       = agreements?.reduce((s, a) => s + parseFloat(a.total.toString()), 0) ?? 0;
  const renewalSoon      = agreements?.filter((a) => {
    const days = differenceInDays(new Date(a.endDate), new Date());
    return days >= 0 && days <= 60;
  }).length ?? 0;
  const expired          = agreements?.filter((a) => {
    return differenceInDays(new Date(a.endDate), new Date()) < 0 && a.status === "active";
  }).length ?? 0;

  // Status distribution for pie chart
  const statusData = ["active", "pending", "draft", "cancelled", "completed"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: agreements?.filter((a) => a.status === s).length ?? 0,
  })).filter((d) => d.value > 0);

  // Monthly value bar chart (last 6 months)
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(d, "MMM yy");
      months[key] = 0;
    }
    agreements?.forEach((a) => {
      const key = format(new Date(a.createdAt), "MMM yy");
      if (key in months) months[key] += parseFloat(a.total.toString());
    });
    return Object.entries(months).map(([month, value]) => ({ month, value: Math.round(value) }));
  })();

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filteredAgreements = agreements?.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      a.clientName.toLowerCase().includes(q) ||
      a.contractReference.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  // ── Auth guards ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full fire-gradient flex items-center justify-center mx-auto">
              <Flame className="h-6 w-6 text-white animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Loading dashboard…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <Card className="border-border/60 max-w-md">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have admin permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg fire-gradient flex items-center justify-center">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground">Core Fire Protection — Agreement Management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            <a href="/agreement" target="_blank">
              <Button size="sm" className="fire-gradient fire-glow text-white text-xs font-semibold">
                + New Agreement
              </Button>
            </a>
          </div>
        </div>

        {/* Alert: renewals & expired */}
        {(renewalSoon > 0 || expired > 0) && (
          <div className="flex flex-wrap gap-3">
            {renewalSoon > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {renewalSoon} contract{renewalSoon > 1 ? "s" : ""} renewing within 60 days
              </div>
            )}
            {expired > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {expired} active contract{expired > 1 ? "s" : ""} past end date
              </div>
            )}
          </div>
        )}

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Agreements", value: totalAgreements, color: "text-foreground", sub: "All time" },
            { label: "Active",           value: activeCount,     color: "text-green-400",  sub: "Live contracts" },
            { label: "Pending",          value: pendingCount,    color: "text-amber-400",  sub: "Awaiting action" },
            { label: "Renewals Due",     value: renewalSoon,     color: "text-amber-400",  sub: "Within 60 days" },
            { label: "Total Value",      value: `£${totalValue.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`, color: "text-[#FF6B35]", sub: "Inc. VAT" },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="stat-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly value bar chart */}
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
                Monthly Contract Value (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A8899" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#7A8899" }} tickFormatter={(v) => `£${v}`} />
                  <Tooltip
                    formatter={(v: number) => [`£${v.toLocaleString()}`, "Value"]}
                    contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    labelStyle={{ color: "#E4ECF4" }}
                  />
                  <Bar dataKey="value" fill="#E8340A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status pie chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#FF6B35]" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={FIRE_COLORS[i % FIRE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "#E4ECF4" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 11, color: "#7A8899" }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, reference, email, or city…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "pending", "draft", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "fire-gradient text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== "all" && agreements && (
                  <span className="ml-1 opacity-70">
                    ({agreements.filter((a) => a.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Agreements Table */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                All Agreements
              </CardTitle>
              <CardDescription>
                {filteredAgreements.length} result{filteredAgreements.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {agreementsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAgreements.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs">Contract Ref</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">City</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Start</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">End</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgreements.map((a) => {
                      const daysToEnd = differenceInDays(new Date(a.endDate), new Date());
                      return (
                        <TableRow
                          key={a.id}
                          className="border-border/60 hover:bg-secondary/30 cursor-pointer"
                          onClick={() => setSelectedAgreementId(a.id)}
                        >
                          <TableCell className="font-mono text-xs text-[#FF6B35]">
                            {a.contractReference}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">{a.clientName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden md:table-cell">{a.email}</TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">{a.city}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            {format(new Date(a.startDate), "dd MMM yy")}
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">
                            <span className={daysToEnd < 0 ? "text-red-400" : daysToEnd <= 60 ? "text-amber-400" : ""}>
                              {format(new Date(a.endDate), "dd MMM yy")}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-sm text-[#FF6B35]">
                            £{parseFloat(a.total.toString()).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={a.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setSelectedAgreementId(a.id)}
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => downloadPDF.mutate({ id: a.id })}
                                disabled={downloadPDF.isPending}
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => sendEmailsMutation.mutate({ agreementId: a.id })}
                                disabled={sendEmailsMutation.isPending || a.status === "draft"}
                                title="Send confirmation emails"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-25" />
                <p className="font-medium">No agreements found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Agreement Detail Dialog ────────────────────────────────────────── */}
      <Dialog open={selectedAgreementId !== null} onOpenChange={() => setSelectedAgreementId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#FF6B35]" />
                  Agreement Details
                </DialogTitle>
                <DialogDescription className="font-mono text-xs mt-0.5">
                  {agreementDetail?.agreement.contractReference}
                </DialogDescription>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedAgreementId && sendEmailsMutation.mutate({ agreementId: selectedAgreementId })}
                  disabled={sendEmailsMutation.isPending}
                  className="text-xs"
                >
                  {sendEmailsMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Send Email
                </Button>
                <Button
                  size="sm"
                  className="fire-gradient fire-glow text-white text-xs"
                  onClick={() => selectedAgreementId && downloadPDF.mutate({ id: selectedAgreementId })}
                  disabled={downloadPDF.isPending}
                >
                  {downloadPDF.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : agreementDetail ? (
            <div className="space-y-5">

              {/* Status banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/60">
                <StatusBadge status={agreementDetail.agreement.status} />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Contract Value</p>
                  <p className="text-2xl font-bold text-[#FF6B35]">
                    £{parseFloat(agreementDetail.agreement.total.toString()).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">inc. VAT</p>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/60">
                  <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 rounded-lg" />
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-[#FF6B35]" />
                      Client Portal QR Code
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scan to open this agreement in the client portal
                    </p>
                    <a
                      href={`/portal?agreement=${selectedAgreementId}`}
                      target="_blank"
                      className="text-xs text-[#FF6B35] flex items-center gap-1 mt-1.5 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open portal link
                    </a>
                  </div>
                </div>
              )}

              {/* Client info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Client Information
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Company", agreementDetail.agreement.clientName],
                    ["Reg. No.", agreementDetail.agreement.companyRegistrationNo ?? "—"],
                    ["Contact", agreementDetail.agreement.contactName],
                    ["Position", agreementDetail.agreement.position ?? "—"],
                    ["Email", agreementDetail.agreement.email],
                    ["Telephone", agreementDetail.agreement.telephone],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Site Address</p>
                    <p className="font-medium">
                      {agreementDetail.agreement.siteAddress}, {agreementDetail.agreement.city}, {agreementDetail.agreement.postcode}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contract details */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Contract Details
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Start Date", format(new Date(agreementDetail.agreement.startDate), "dd MMMM yyyy")],
                    ["End Date", format(new Date(agreementDetail.agreement.endDate), "dd MMMM yyyy")],
                    ["Duration", `${agreementDetail.agreement.contractDuration} months`],
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
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <PoundSterling className="h-3.5 w-3.5" />
                  Pricing Breakdown
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    ["Service Fee", `£${parseFloat(agreementDetail.agreement.serviceFee.toString()).toFixed(2)}`],
                    ["Maintenance Fee", `£${parseFloat(agreementDetail.agreement.maintenanceFee.toString()).toFixed(2)}`],
                    ["Additional Services", `£${parseFloat(agreementDetail.agreement.additionalFee?.toString() ?? "0").toFixed(2)}`],
                    ["Subtotal (Ex. VAT)", `£${parseFloat(agreementDetail.agreement.subtotal.toString()).toFixed(2)}`],
                    ["VAT (20%)", `£${parseFloat(agreementDetail.agreement.vat.toString()).toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-1">
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
                    <div className="rounded-lg border border-border/60 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/60">
                            <TableHead className="text-xs">Qty</TableHead>
                            <TableHead className="text-xs">Service / Equipment Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agreementDetail.equipment.map((item) => (
                            <TableRow key={item.id} className="border-border/60">
                              <TableCell className="font-mono text-sm">{item.quantity}</TableCell>
                              <TableCell className="text-sm">{item.type}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {/* Remedial work options */}
              <Separator />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Remedial Work Authorisation
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Immediate Rectification", active: agreementDetail.agreement.immediateRectification },
                    { label: "On-Site Authorisation", active: agreementDetail.agreement.onSiteAuthorization },
                    { label: "Defect Quotation Required", active: agreementDetail.agreement.defectQuotation },
                  ].map(({ label, active }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        active
                          ? "bg-green-500/10 text-green-400 border-green-500/25"
                          : "bg-secondary/50 text-muted-foreground border-border/60"
                      }`}
                    >
                      {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <Separator />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Signatures
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <p className="text-xs text-muted-foreground mb-1">Client</p>
                    {agreementDetail.agreement.clientSignatureUrl && (
                      <img
                        src={agreementDetail.agreement.clientSignatureUrl}
                        alt="Client signature"
                        className="max-h-16 object-contain mb-1"
                      />
                    )}
                    <p className="text-sm font-semibold">{agreementDetail.agreement.clientPrintName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(agreementDetail.agreement.clientSignedAt), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <p className="text-xs text-muted-foreground mb-1">Core Fire Representative</p>
                    {agreementDetail.agreement.companySignatureUrl && (
                      <img
                        src={agreementDetail.agreement.companySignatureUrl}
                        alt="Company signature"
                        className="max-h-16 object-contain mb-1"
                      />
                    )}
                    <p className="text-sm font-semibold">{agreementDetail.agreement.companyPrintName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(agreementDetail.agreement.companySignedAt), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

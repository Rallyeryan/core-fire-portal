import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Search, Download, FileText, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ClientPortal() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);

  // Check for agreement ID in URL parameters (from QR code scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agreementId = params.get('agreement');
    if (agreementId) {
      setSelectedAgreementId(parseInt(agreementId));
    }
  }, []);

  // Fetch user's agreements
  const { data: agreements, isLoading: agreementsLoading } = trpc.agreements.list.useQuery();
  const { data: agreementDetail } = trpc.agreements.get.useQuery(
    { id: selectedAgreementId! },
    { enabled: selectedAgreementId !== null }
  );

  const downloadPDF = trpc.agreements.downloadPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, '_blank');
      toast.success("PDF download started");
    },
    onError: () => {
      toast.error("Failed to download PDF");
    },
  });

  // Filter agreements by user's email
  const userAgreements = agreements?.filter((agreement) => {
    if (!user?.email) return false;
    return agreement.email.toLowerCase() === user.email.toLowerCase();
  });

  // Search filter
  const filteredAgreements = userAgreements?.filter((agreement) => {
    const query = searchQuery.toLowerCase();
    return (
      agreement.contractReference.toLowerCase().includes(query) ||
      agreement.clientName.toLowerCase().includes(query)
    );
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
      active: { variant: "default", icon: CheckCircle2, label: "Active" },
      pending: { variant: "secondary", icon: AlertCircle, label: "Pending" },
      completed: { variant: "outline", icon: CheckCircle2, label: "Completed" },
      cancelled: { variant: "destructive", icon: AlertCircle, label: "Cancelled" },
      draft: { variant: "outline", icon: AlertCircle, label: "Draft" },
    };
    return configs[status] || configs.draft;
  };

  const getRenewalAlert = (endDate: Date) => {
    const daysUntilRenewal = Math.floor((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilRenewal < 0) {
      return { show: true, message: "Contract expired", variant: "destructive" as const };
    } else if (daysUntilRenewal <= 30) {
      return { show: true, message: `Renews in ${daysUntilRenewal} days`, variant: "secondary" as const };
    }
    return { show: false, message: "", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Agreements</h1>
            <p className="text-slate-600 mt-1">View and manage your service contracts</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Agreements</CardDescription>
              <CardTitle className="text-3xl">{userAgreements?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Contracts</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {userAgreements?.filter((a) => a.status === "active").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                £{userAgreements?.reduce((sum, a) => sum + parseFloat(a.total.toString()), 0).toFixed(2) || "0.00"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by contract reference or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agreements Grid */}
        {agreementsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredAgreements && filteredAgreements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgreements.map((agreement) => {
              const statusConfig = getStatusConfig(agreement.status);
              const renewalAlert = getRenewalAlert(agreement.endDate);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={agreement.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agreement.clientName}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">
                          {agreement.contractReference}
                        </CardDescription>
                      </div>
                      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contract Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {format(new Date(agreement.startDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium">
                          {format(new Date(agreement.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold text-accent">
                          £{parseFloat(agreement.total.toString()).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Renewal Alert */}
                    {renewalAlert.show && (
                      <div className={`text-xs px-3 py-2 rounded-md ${
                        renewalAlert.variant === "destructive" 
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}>
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {renewalAlert.message}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedAgreementId(agreement.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => downloadPDF.mutate({ id: agreement.id })}
                        disabled={downloadPDF.isPending}
                      >
                        {downloadPDF.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No agreements found</p>
              <Link href="/agreement">
                <Button className="mt-4">
                  Create New Agreement
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agreement Detail Dialog */}
      <Dialog open={selectedAgreementId !== null} onOpenChange={() => setSelectedAgreementId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Agreement Details</DialogTitle>
                <DialogDescription>
                  {agreementDetail?.agreement.contractReference}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedAgreementId && downloadPDF.mutate({ id: selectedAgreementId })}
                disabled={downloadPDF.isPending}
              >
                {downloadPDF.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>
            </div>
          </DialogHeader>

          {agreementDetail && (
            <div className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Client Name</div>
                    <div className="font-medium">{agreementDetail.agreement.clientName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Contact Person</div>
                    <div className="font-medium">{agreementDetail.agreement.contactName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{agreementDetail.agreement.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Telephone</div>
                    <div className="font-medium">{agreementDetail.agreement.telephone}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">Site Address</div>
                    <div className="font-medium">
                      {agreementDetail.agreement.siteAddress}, {agreementDetail.agreement.city},{" "}
                      {agreementDetail.agreement.postcode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Contract Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Start Date</div>
                    <div className="font-medium">
                      {format(new Date(agreementDetail.agreement.startDate), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">End Date</div>
                    <div className="font-medium">
                      {format(new Date(agreementDetail.agreement.endDate), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">{agreementDetail.agreement.contractDuration} months</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Service Frequency</div>
                    <div className="font-medium">{agreementDetail.agreement.serviceFrequency}</div>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Equipment Schedule</h3>
                <div className="space-y-2">
                  {agreementDetail.equipment.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="font-semibold text-muted-foreground">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      £{parseFloat(agreementDetail.agreement.subtotal.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (20%)</span>
                    <span className="font-medium">
                      £{parseFloat(agreementDetail.agreement.vat.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">
                      £{parseFloat(agreementDetail.agreement.total.toString()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

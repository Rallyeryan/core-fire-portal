import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Eye, FileText, Calendar, DollarSign, Loader2, Download, Mail, QrCode } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import QRCode from "qrcode";
import { useEffect, useState as useReactState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Generate QR code when agreement is selected
  useEffect(() => {
    if (selectedAgreementId) {
      const portalUrl = `${window.location.origin}/portal?agreement=${selectedAgreementId}`;
      QRCode.toDataURL(portalUrl, { width: 200, margin: 2 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [selectedAgreementId]);

  const { data: agreements, isLoading: agreementsLoading } = trpc.agreements.list.useQuery();
  const { data: agreementDetail } = trpc.agreements.get.useQuery(
    { id: selectedAgreementId! },
    { enabled: selectedAgreementId !== null }
  );

  const downloadPDF = trpc.agreements.downloadPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, '_blank');
    },
  });

  const sendEmailsMutation = trpc.agreements.sendEmails.useMutation({
    onSuccess: () => {
      toast.success("Confirmation emails sent successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to send emails: ${error.message}`);
    },
  });

  const filteredAgreements = agreements?.filter((agreement) => {
    const query = searchQuery.toLowerCase();
    return (
      agreement.clientName.toLowerCase().includes(query) ||
      agreement.contractReference.toLowerCase().includes(query) ||
      agreement.email.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Service Agreements</h1>
          <p className="text-muted-foreground">Manage and view all service agreements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agreements?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {agreements?.filter((a) => a.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {agreements?.filter((a) => a.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £
                {agreements
                  ?.reduce((sum, a) => sum + parseFloat(a.total.toString()), 0)
                  .toFixed(2) || "0.00"}
              </div>
            </CardContent>
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
                placeholder="Search by client name, contract reference, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agreements Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Agreements</CardTitle>
            <CardDescription>
              {filteredAgreements?.length || 0} agreement(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {agreementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredAgreements && filteredAgreements.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Ref</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgreements.map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell className="font-mono text-sm">
                          {agreement.contractReference}
                        </TableCell>
                        <TableCell className="font-medium">{agreement.clientName}</TableCell>
                        <TableCell className="text-muted-foreground">{agreement.email}</TableCell>
                        <TableCell>
                          {format(new Date(agreement.startDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          £{parseFloat(agreement.total.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(agreement.status)}>
                            {agreement.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgreementId(agreement.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendEmailsMutation.mutate({ agreementId: agreement.id })}
                  disabled={sendEmailsMutation.isPending || agreement.status === "draft"}
                  title="Send confirmation emails"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No agreements found
              </div>
            )}
          </CardContent>
        </Card>
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
              {/* QR Code Section */}
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <QrCode className="h-4 w-4" />
                      Scan to Access Portal
                    </div>
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                    <p className="text-xs text-muted-foreground">Scan this code to view agreement in client portal</p>
                  </div>
                </div>
              )}

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
                  {agreementDetail.agreement.companyRegistrationNo && (
                    <div>
                      <div className="text-muted-foreground">Company Registration No.</div>
                      <div className="font-medium">{agreementDetail.agreement.companyRegistrationNo}</div>
                    </div>
                  )}
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Qty</TableHead>
                        <TableHead>SERVICE/EQUIPMENT TYPE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agreementDetail.equipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">
                      £{parseFloat(agreementDetail.agreement.serviceFee.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance Fee</span>
                    <span className="font-medium">
                      £{parseFloat(agreementDetail.agreement.maintenanceFee.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Services</span>
                    <span className="font-medium">
                      £{parseFloat(agreementDetail.agreement.additionalFee.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
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
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Payment Schedule</span>
                    <span className="font-medium capitalize">
                      {agreementDetail.agreement.paymentSchedule}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Signatures</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Client Signature</div>
                    <img
                      src={agreementDetail.agreement.clientSignatureUrl}
                      alt="Client Signature"
                      className="border rounded-lg p-2 bg-background w-full h-32 object-contain"
                    />
                    <div className="text-sm font-medium mt-2">
                      {agreementDetail.agreement.clientPrintName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(agreementDetail.agreement.clientSignedAt), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Company Signature</div>
                    <img
                      src={agreementDetail.agreement.companySignatureUrl}
                      alt="Company Signature"
                      className="border rounded-lg p-2 bg-background w-full h-32 object-contain"
                    />
                    <div className="text-sm font-medium mt-2">
                      {agreementDetail.agreement.companyPrintName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(agreementDetail.agreement.companySignedAt), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

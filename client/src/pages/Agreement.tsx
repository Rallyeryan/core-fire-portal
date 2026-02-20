import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import {
  Plus, X, Printer, Send, Loader2, Shield, CheckCircle2, Download, Save,
  Navigation, ChevronDown, ChevronUp, Bell, Droplets, Flame, Building2,
  Flashlight, Lightbulb, DoorClosed, ClipboardCheck, ShieldAlert,
  Camera, KeyRound, Radio, Siren, Compass, Info
} from "lucide-react";
import { GuidedWalkthrough } from "@/components/GuidedWalkthrough";
import { getGuidedFields } from "@/lib/guidedFields";
import { nanoid } from "nanoid";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import jsPDF from "jspdf";
import {
  SERVICE_SCHEDULE,
  getVisitOptions,
  getFrequencyLabel,
  type ServiceItem,
  type ServiceCategory,
} from "@/lib/serviceSchedule";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedService {
  serviceId: string;
  categoryId: string;
  visits: number;       // 0 = ONE-OFF / reactive (included / not included)
  unitPrice: number;    // override or from schedule
  included: boolean;
}

// ─── Category icon mapping ─────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "fire-detection": <Bell className="h-5 w-5" />,
  "sprinkler-systems": <Droplets className="h-5 w-5" />,
  "fire-suppression": <Flame className="h-5 w-5" />,
  "fixed-infrastructure": <Building2 className="h-5 w-5" />,
  "portable-equipment": <Flashlight className="h-5 w-5" />,
  "emergency-lighting": <Lightbulb className="h-5 w-5" />,
  "passive-fire": <DoorClosed className="h-5 w-5" />,
  "fire-safety-management": <ClipboardCheck className="h-5 w-5" />,
  "intruder-security": <ShieldAlert className="h-5 w-5" />,
  "cctv-surveillance": <Camera className="h-5 w-5" />,
  "access-control": <KeyRound className="h-5 w-5" />,
  "remote-monitoring": <Radio className="h-5 w-5" />,
  "reactive-callout": <Siren className="h-5 w-5" />,
  "professional-services": <Compass className="h-5 w-5" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialSelections(): SelectedService[] {
  const out: SelectedService[] = [];
  for (const cat of SERVICE_SCHEDULE) {
    for (const svc of cat.services) {
      out.push({
        serviceId: svc.id,
        categoryId: cat.id,
        visits: svc.isOneOff || svc.isReactive ? 0 : 1,
        unitPrice: svc.unitPrice ?? 0,
        included: false,
      });
    }
  }
  return out;
}

function calcAnnualCost(sel: SelectedService, svc: ServiceItem): number {
  if (!sel.included) return 0;
  if (svc.isOneOff || svc.isReactive) return sel.unitPrice;
  return sel.visits * sel.unitPrice;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Agreement() {
  // Guided Mode
  const [isGuidedMode, setIsGuidedMode] = useState(false);

  // Client Information
  const [clientName, setClientName] = useState("");
  const [companyRegistrationNo, setCompanyRegistrationNo] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [contactName, setContactName] = useState("");
  const [position, setPosition] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [registeredAt, setRegisteredAt] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");

  // Contract Details
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRollingContract, setIsRollingContract] = useState(false);
  const [contractDuration, setContractDuration] = useState("12");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [billingCycle, setBillingCycle] = useState("annually");
  const [accessRequirements, setAccessRequirements] = useState("");

  // Service Schedule selections
  const [selections, setSelections] = useState<SelectedService[]>(buildInitialSelections);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["fire-detection"]));
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Remedial Work Authorization
  const [immediateRectification, setImmediateRectification] = useState(false);
  const [onSiteAuthorization, setOnSiteAuthorization] = useState(false);
  const [defectQuotation, setDefectQuotation] = useState(false);

  // Pricing
  const [discount, setDiscount] = useState(0);

  // Proposal Letter
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");

  // Terms & Signatures
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [clientPrintName, setClientPrintName] = useState("");
  const [clientDate, setClientDate] = useState("");
  const [companyPrintName, setCompanyPrintName] = useState("Core Fire Protection Representative");
  const [companyDate, setCompanyDate] = useState("");

  // Signature canvases
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const companyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isClientDrawing, setIsClientDrawing] = useState(false);
  const [isCompanyDrawing, setIsCompanyDrawing] = useState(false);
  const [clientHasSignature, setClientHasSignature] = useState(false);
  const [companyHasSignature, setCompanyHasSignature] = useState(false);

  // Draft functionality
  const [draftToken, setDraftToken] = useState<string>("");
  const [isDraft, setIsDraft] = useState(false);

  // Check for draft token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("draft");
    if (token) {
      setDraftToken(token);
      setIsDraft(true);
    } else {
      setDraftToken(nanoid(16));
    }
  }, []);

  // Load draft
  const { data: draftData } = trpc.agreements.getDraft.useQuery(
    { token: draftToken },
    { enabled: isDraft && draftToken.length > 0 }
  );

  useEffect(() => {
    if (!draftData) return;
    const { draft } = draftData;
    if (draft.clientName) setClientName(draft.clientName);
    if (draft.siteAddress) setSiteAddress(draft.siteAddress);
    if (draft.city) setCity(draft.city);
    if (draft.postcode) setPostcode(draft.postcode);
    if (draft.contactName) setContactName(draft.contactName);
    if (draft.position) setPosition(draft.position);
    if (draft.telephone) setTelephone(draft.telephone);
    if (draft.email) setEmail(draft.email);
    if (draft.startDate) setStartDate(new Date(draft.startDate).toISOString().split("T")[0]);
    if (draft.contractDuration) setContractDuration(draft.contractDuration);
    if (draft.paymentTerms) setPaymentTerms(draft.paymentTerms);
    if (draft.billingCycle) setBillingCycle(draft.billingCycle);
    toast.success("Draft loaded successfully");
  }, [draftData]);

  // ── Pricing calculations ──────────────────────────────────────────────────

  const scheduledSubtotal = (() => {
    let total = 0;
    for (const cat of SERVICE_SCHEDULE) {
      for (const svc of cat.services) {
        const sel = selections.find((s) => s.serviceId === svc.id);
        if (sel) total += calcAnnualCost(sel, svc);
      }
    }
    return total;
  })();

  const netTotal = scheduledSubtotal - discount;
  const vatAmount = netTotal * 0.2;
  const grandTotal = netTotal + vatAmount;

  const selectedCount = selections.filter((s) => s.included).length;

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleIncluded = (serviceId: string) => {
    setSelections((prev) =>
      prev.map((s) => (s.serviceId === serviceId ? { ...s, included: !s.included } : s))
    );
  };

  const updateVisits = (serviceId: string, visits: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.serviceId === serviceId ? { ...s, visits } : s))
    );
  };

  const updateUnitPrice = (serviceId: string, price: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.serviceId === serviceId ? { ...s, unitPrice: price } : s))
    );
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleAllInCategory = (cat: ServiceCategory, include: boolean) => {
    const ids = new Set(cat.services.map((s) => s.id));
    setSelections((prev) =>
      prev.map((s) => (ids.has(s.serviceId) ? { ...s, included: include } : s))
    );
  };

  const categorySubtotal = (cat: ServiceCategory): number => {
    let total = 0;
    for (const svc of cat.services) {
      const sel = selections.find((s) => s.serviceId === svc.id);
      if (sel) total += calcAnnualCost(sel, svc);
    }
    return total;
  };

  const categorySelectedCount = (cat: ServiceCategory): number =>
    cat.services.filter((svc) => selections.find((s) => s.serviceId === svc.id)?.included).length;

  // ── End date auto-calculation ─────────────────────────────────────────────

  useEffect(() => {
    if (startDate && contractDuration && !isRollingContract) {
      const start = new Date(startDate);
      const months = parseInt(contractDuration);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [startDate, contractDuration, isRollingContract]);

  // ── Signature canvas ──────────────────────────────────────────────────────

  useEffect(() => {
    const setupCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    setupCanvas(clientCanvasRef.current);
    setupCanvas(companyCanvasRef.current);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width / 2),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height / 2),
      };
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width / 2),
      y: (e.clientY - rect.top) * (canvas.height / rect.height / 2),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent, isClient: boolean) => {
    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (isClient) { setIsClientDrawing(true); setClientHasSignature(true); }
    else { setIsCompanyDrawing(true); setCompanyHasSignature(true); }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent, isClient: boolean) => {
    if (isClient && !isClientDrawing) return;
    if (!isClient && !isCompanyDrawing) return;
    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (isClient: boolean) => {
    if (isClient) setIsClientDrawing(false);
    else setIsCompanyDrawing(false);
  };

  const clearSignature = (isClient: boolean) => {
    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isClient) setClientHasSignature(false);
    else setCompanyHasSignature(false);
  };

  // ── tRPC mutations ────────────────────────────────────────────────────────

  const submitMutation = trpc.agreements.submit.useMutation({
    onSuccess: (data) => {
      toast.success(`Agreement submitted! Reference: ${data.contractReference}`);
    },
    onError: (err) => {
      toast.error(`Submission failed: ${err.message}`);
    },
  });

  const saveDraftMutation = trpc.agreements.saveDraft.useMutation({
    onSuccess: () => {
      setIsDraft(true);
      toast.success("Draft saved successfully");
    },
  });

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      draftToken,
      clientName,
      siteAddress,
      city,
      postcode,
      contactName,
      position,
      telephone,
      email,
      startDate: startDate ? new Date(startDate) : undefined,
      contractDuration,
      paymentTerms,
      billingCycle,
    });
  };

  const handleSubmit = () => {
    if (!clientName || !siteAddress || !city || !postcode || !contactName || !telephone || !email) {
      toast.error("Please fill in all required client information fields");
      return;
    }
    if (!startDate) {
      toast.error("Please enter a contract start date");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    if (!clientHasSignature) {
      toast.error("Please provide a client signature");
      return;
    }
    if (!companyHasSignature) {
      toast.error("Please provide a company representative signature");
      return;
    }

    const clientSig = clientCanvasRef.current?.toDataURL("image/png") ?? "";
    const companySig = companyCanvasRef.current?.toDataURL("image/png") ?? "";

    const includedServices = selections
      .filter((s) => s.included)
      .map((s) => {
        const svc = SERVICE_SCHEDULE.flatMap((c) => c.services).find((sv) => sv.id === s.serviceId);
        return svc ? `${svc.name} (${svc.isOneOff ? "ONE-OFF" : svc.isReactive ? "Per Event" : getFrequencyLabel(s.visits)})` : s.serviceId;
      })
      .join("; ");

    submitMutation.mutate({
      clientName,
      companyRegistrationNo,
      siteAddress,
      city,
      postcode,
      contactName,
      position,
      telephone,
      email,
      startDate: new Date(startDate),
      endDate: isRollingContract ? new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 99)) : new Date(endDate || startDate),
      contractDuration,
      serviceFrequency: "various",
      paymentTerms,
      billingCycle,
      accessRequirements,
      servicesIncluded: includedServices,
      specialRequirements,
      immediateRectification,
      onSiteAuthorization,
      defectQuotation,
      serviceFee: scheduledSubtotal,
      maintenanceFee: 0,
      additionalFee: 0,
      subtotal: netTotal,
      vat: vatAmount,
      total: grandTotal,
      paymentSchedule: billingCycle,
      equipment: [],
      clientSignature: clientSig,
      clientPrintName,
      companySignature: companySig,
      companyPrintName,
    });
  };

  // ── PDF generation ────────────────────────────────────────────────────────

  const handlePrint = () => {
    const { jsPDF: JsPDF } = require("jspdf");
    const doc = new JsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const checkPage = (needed = 10) => {
      if (yPos + needed > pageHeight - 15) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Core Fire Protection Ltd", margin, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Unit 4, 200 Woodville Street, Glasgow, G51 2RL  |  Tel: 0141 433 1934  |  service@corefire.co.uk", margin, yPos);
    yPos += 5;
    doc.setFontSize(8);
    doc.text(`Contract Reference: CFP-SYS-${Date.now().toString().slice(-6)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 8;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Fire & Security Systems Service Agreement", pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Systems Maintenance & Inspection Contract", pageWidth / 2, yPos, { align: "center" });
    yPos += 12;

    // Client Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("1. Client Details", margin, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Company: ${clientName || "N/A"}`, margin, yPos); yPos += 5;
    doc.text(`Site Address: ${siteAddress || "N/A"}, ${city || ""}, ${postcode || ""}`, margin, yPos); yPos += 5;
    doc.text(`Contact: ${contactName || "N/A"} (${position || "N/A"})`, margin, yPos); yPos += 5;
    doc.text(`Tel: ${telephone || "N/A"}  |  Email: ${email || "N/A"}`, margin, yPos); yPos += 10;

    // Contract Details
    checkPage(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("2. Contract Details", margin, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Start Date: ${startDate || "N/A"}  |  Duration: ${isRollingContract ? "Rolling" : contractDuration + " months"}`, margin, yPos); yPos += 5;
    doc.text(`Payment Terms: Net ${paymentTerms} Days  |  Billing: ${billingCycle}`, margin, yPos); yPos += 10;

    // Service Schedule
    checkPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("3. Service Schedule", margin, yPos);
    yPos += 7;

    for (const cat of SERVICE_SCHEDULE) {
      const includedInCat = cat.services.filter((svc) => selections.find((s) => s.serviceId === svc.id)?.included);
      if (includedInCat.length === 0) continue;

      checkPage(12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(cat.name, margin, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      for (const svc of includedInCat) {
        checkPage(8);
        const sel = selections.find((s) => s.serviceId === svc.id)!;
        const freq = svc.isOneOff ? "ONE-OFF" : svc.isReactive ? "Per Event" : getFrequencyLabel(sel.visits);
        const price = sel.unitPrice > 0 ? `£${sel.unitPrice.toFixed(2)}` : "TBC";
        const annual = calcAnnualCost(sel, svc) > 0 ? `£${calcAnnualCost(sel, svc).toFixed(2)} p.a.` : "TBC";
        const line = `  • ${svc.name}  |  ${freq}  |  Unit: ${price}  |  Annual: ${annual}`;
        const lines = doc.splitTextToSize(line, contentWidth - 5);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 4.5 + 1;
      }
      yPos += 3;
    }

    // Pricing Summary
    checkPage(30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("4. Pricing Summary", margin, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Scheduled Services Subtotal: £${scheduledSubtotal.toFixed(2)}`, margin, yPos); yPos += 5;
    doc.text(`Discount: £${discount.toFixed(2)}`, margin, yPos); yPos += 5;
    doc.text(`Net Total: £${netTotal.toFixed(2)}`, margin, yPos); yPos += 5;
    doc.text(`VAT (20%): £${vatAmount.toFixed(2)}`, margin, yPos); yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Annual Contract Value (inc. VAT): £${grandTotal.toFixed(2)}`, margin, yPos);
    yPos += 12;

    // Remedial Work
    checkPage(25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("5. Remedial Work Authorisation", margin, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (immediateRectification) { doc.text("☑ Immediate Rectification", margin, yPos); yPos += 5; }
    if (onSiteAuthorization) { doc.text("☑ On-Site Authorisation", margin, yPos); yPos += 5; }
    if (defectQuotation) { doc.text("☑ Defect Quotation", margin, yPos); yPos += 5; }
    yPos += 5;

    // Signatures
    checkPage(50);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("6. Signatures", margin, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    if (clientCanvasRef.current && clientHasSignature) {
      doc.addImage(clientCanvasRef.current.toDataURL("image/png"), "PNG", margin, yPos, 60, 20);
    }
    yPos += 22;
    doc.text(`Client: ${clientPrintName || "N/A"}  |  Date: ${clientDate || "N/A"}`, margin, yPos);
    yPos += 12;

    if (companyCanvasRef.current && companyHasSignature) {
      doc.addImage(companyCanvasRef.current.toDataURL("image/png"), "PNG", margin, yPos, 60, 20);
    }
    yPos += 22;
    doc.text(`Company Representative: ${companyPrintName}  |  Date: ${companyDate || "N/A"}`, margin, yPos);
    yPos += 12;

    // Compliance footer
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("✓ BAFE Registered  ✓ NSI Gold  ✓ BSI Kitemark  ✓ BS 5839-1:2025  ✓ BS EN 12845  ✓ PD 6662", margin, yPos);

    doc.save(`CoreFire-Systems-Agreement-${Date.now()}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Video */}
      <video
        autoPlay loop muted playsInline
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-10"
      >
        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/BiKovLyLozMEjPBA.mp4" type="video/mp4" />
      </video>

      {/* Watermark */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/yQArWlsWOllKvZBA.png)",
          backgroundSize: "300px 150px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-black backdrop-blur supports-[backdrop-filter]:bg-black/95">
          <div className="container flex h-24 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/NmCmIuyeVycFeWJg.png"
                alt="Core Fire Protection"
                className="h-16 w-auto"
              />
              <span className="font-bold text-2xl text-white">Core Fire Protection</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setIsGuidedMode(true)} className="text-white hover:bg-white/10">
                <Navigation className="h-4 w-4 mr-2" />
                Guided Mode
              </Button>
              <Button variant="ghost" onClick={handlePrint} className="text-white hover:bg-white/10">
                <Printer className="h-4 w-4 mr-2" />
                Print / PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl py-8 space-y-8">

          {/* Document Header Card */}
          <Card className="overflow-hidden border-primary/20">
            <div
              className="relative bg-cover bg-center text-white"
              style={{
                backgroundImage: "url(https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/jnRWkvMhjhxhyVCB.jpg)",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
              <CardHeader className="relative z-10 text-center space-y-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-left">
                    <h1 className="text-2xl font-bold drop-shadow-lg">Core Fire Protection Ltd</h1>
                    <p className="text-sm opacity-90 drop-shadow">Professional Fire & Security Solutions</p>
                    <p className="text-xs opacity-75 mt-1">Unit 4, 200 Woodville Street, Glasgow, G51 2RL</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="opacity-75 uppercase tracking-wide text-xs drop-shadow">Contract Reference</p>
                    <p className="font-semibold text-base drop-shadow-lg">CFP-SYS-{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>
                <Separator className="bg-white/20" />
                <CardTitle className="text-3xl pt-4 drop-shadow-lg">
                  Fire & Security Systems Service Agreement
                </CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Systems Maintenance & Inspection Contract — All services subject to site-specific scope confirmation
                </CardDescription>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["BAFE SP203-1", "BAFE SP101", "NSI Gold", "BSI Kitemark", "BS 5839-1:2025"].map((badge) => (
                    <Badge key={badge} variant="outline" className="border-white/30 text-white/80 text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </div>
          </Card>

          {/* ── Section 1: Service Schedule ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">1</div>
                <div>
                  <CardTitle>Service Schedule</CardTitle>
                  <CardDescription>
                    Select the services to be included in this agreement. Prices shown exclude VAT. "TBC" items require site-specific pricing.
                  </CardDescription>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold text-primary">£{scheduledSubtotal.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{selectedCount} service{selectedCount !== 1 ? "s" : ""} selected</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              {SERVICE_SCHEDULE.map((cat) => {
                const isExpanded = expandedCategories.has(cat.id);
                const catSelected = categorySelectedCount(cat);
                const catTotal = categorySubtotal(cat);

                return (
                  <div key={cat.id} className="border-b last:border-b-0">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {CATEGORY_ICONS[cat.id] || <Shield className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{cat.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {cat.services.length} services
                          {catSelected > 0 && (
                            <span className="ml-2 text-primary font-medium">
                              · {catSelected} selected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {catTotal > 0 && (
                          <span className="text-sm font-semibold text-primary">
                            £{catTotal.toFixed(2)} p.a.
                          </span>
                        )}
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={(e) => { e.stopPropagation(); toggleAllInCategory(cat, true); }}
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); toggleAllInCategory(cat, false); }}
                          >
                            None
                          </Button>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Service Items */}
                    {isExpanded && (
                      <div className="bg-muted/10">
                        {/* Table Header */}
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-6 py-2 border-b bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <div className="w-5"></div>
                          <div>Service</div>
                          <div className="w-36 text-center">Visits / Year</div>
                          <div className="w-28 text-right">Unit Price (£)</div>
                          <div className="w-28 text-right">Annual (£)</div>
                        </div>

                        {cat.services.map((svc) => {
                          const sel = selections.find((s) => s.serviceId === svc.id)!;
                          const visitOpts = getVisitOptions(svc.visitOptions);
                          const annualCost = calcAnnualCost(sel, svc);

                          return (
                            <div
                              key={svc.id}
                              className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-6 py-3 border-b last:border-b-0 items-start transition-colors ${sel.included ? "bg-primary/5" : "hover:bg-muted/20"}`}
                            >
                              {/* Checkbox */}
                              <div className="pt-0.5">
                                <Checkbox
                                  checked={sel.included}
                                  onCheckedChange={() => toggleIncluded(svc.id)}
                                />
                              </div>

                              {/* Service Name + Description */}
                              <div className="min-w-0">
                                <div className="text-sm font-medium leading-snug">{svc.name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                  {svc.description}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                    {svc.standard}
                                  </Badge>
                                  {svc.isOneOff && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                      One-Off
                                    </Badge>
                                  )}
                                  {svc.isReactive && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                      Per Event
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Visits selector */}
                              <div className="w-36">
                                {!svc.isOneOff && !svc.isReactive && visitOpts.length > 1 ? (
                                  <Select
                                    value={sel.visits.toString()}
                                    onValueChange={(v) => updateVisits(svc.id, parseInt(v))}
                                    disabled={!sel.included}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {visitOpts.map((v) => (
                                        <SelectItem key={v} value={v.toString()}>
                                          {getFrequencyLabel(v)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="text-xs text-muted-foreground text-center pt-1.5">
                                    {svc.isOneOff ? "One-Off" : svc.isReactive ? "Per Event" : getFrequencyLabel(visitOpts[0] || 1)}
                                  </div>
                                )}
                              </div>

                              {/* Unit Price */}
                              <div className="w-28">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={sel.unitPrice || ""}
                                  onChange={(e) => updateUnitPrice(svc.id, parseFloat(e.target.value) || 0)}
                                  placeholder="TBC"
                                  disabled={!sel.included}
                                  className="h-8 text-xs text-right"
                                />
                              </div>

                              {/* Annual Cost */}
                              <div className="w-28 text-right pt-1.5">
                                {sel.included && annualCost > 0 ? (
                                  <span className="text-sm font-semibold text-primary">
                                    £{annualCost.toFixed(2)}
                                  </span>
                                ) : sel.included ? (
                                  <span className="text-xs text-amber-600">TBC</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ── Section 2: Pricing Summary ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">2</div>
                <CardTitle>Pricing Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-primary mb-3">Annual Contract Value Breakdown</h4>

                  {/* Per-category breakdown */}
                  {SERVICE_SCHEDULE.map((cat) => {
                    const total = categorySubtotal(cat);
                    if (total === 0) return null;
                    return (
                      <div key={cat.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate pr-4">{cat.name}</span>
                        <span className="font-medium whitespace-nowrap">£{total.toFixed(2)}</span>
                      </div>
                    );
                  })}

                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled Services Subtotal</span>
                    <span className="font-medium">£{scheduledSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Discount</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 h-8 text-right"
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold pt-2">
                    <span>Net Total</span>
                    <span>£{netTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (20%)</span>
                    <span className="font-medium">£{vatAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-accent/10 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Annual Contract Value</div>
                  <div className="text-4xl font-bold text-accent mb-2">£{grandTotal.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Including VAT @ 20%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedCount} service{selectedCount !== 1 ? "s" : ""} included
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 3: Agreement Overview ───────────────────────────────── */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="bg-destructive/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-semibold">3</div>
                <CardTitle className="text-destructive">Agreement Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Parties */}
              <div className="border-l-4 border-destructive pl-4 space-y-4">
                <p className="text-sm">
                  This following is a proposed mutual agreement between Core Fire Ltd T/A Core Fire Protection ("Core") and{" "}
                  <span className="font-semibold">{clientName || "[Client Company Name]"}</span>
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div id="field-clientName" className="space-y-2">
                    <Label htmlFor="clientName">Company / Client Name *</Label>
                    <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter company or client name" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradingName">Trading Name</Label>
                    <Input id="tradingName" value={tradingName} onChange={(e) => setTradingName(e.target.value)} placeholder="If different from company name" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyRegistrationNo">Company Registration No.</Label>
                  <Input id="companyRegistrationNo" value={companyRegistrationNo} onChange={(e) => setCompanyRegistrationNo(e.target.value)} placeholder="e.g. SC123456" className="bg-background" />
                </div>

                <div id="field-siteAddress" className="space-y-2">
                  <Label htmlFor="siteAddress">Site Address *</Label>
                  <Input id="siteAddress" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="Street address" className="bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div id="field-city" className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="bg-background" />
                  </div>
                  <div id="field-postcode" className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredAddress">Registered Address (if different)</Label>
                  <Input id="registeredAddress" value={registeredAddress} onChange={(e) => setRegisteredAddress(e.target.value)} placeholder="Registered address" className="bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div id="field-contactName" className="space-y-2">
                    <Label htmlFor="contactName">Contact Person Name *</Label>
                    <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position / Title</Label>
                    <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" className="bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div id="field-telephone" className="space-y-2">
                    <Label htmlFor="telephone">Telephone *</Label>
                    <Input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Phone number" className="bg-background" />
                  </div>
                  <div id="field-email" className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="bg-background" />
                  </div>
                </div>

                <p className="text-sm italic">
                  (defined as "The Customer") for the Inspection and Maintenance of Systems listed within this agreement.
                </p>
                <p className="text-sm">
                  This Fire & Security Systems Maintenance Agreement (the "Agreement") is entered into by and between Core Fire Ltd T/A Core Fire Protection and the Customer, collectively referred to as the "Parties."
                </p>
              </div>

              <Separator className="bg-destructive/20" />

              {/* Services Provided */}
              <div className="border-l-4 border-destructive pl-4">
                <h3 className="text-destructive font-semibold mb-3">SERVICES PROVIDED</h3>
                <p className="text-sm">
                  The Service Provider will perform maintenance services at{" "}
                  <span className="font-semibold">
                    {siteAddress ? `${siteAddress}${city ? ", " + city : ""}${postcode ? ", " + postcode : ""}` : "[Site Location]"}
                  </span>{" "}
                  in accordance with the schedule of rates. These services include, but are not limited to, PPM Test & Inspections, System Support and Service and necessary repairs or replacements in accordance with the service schedule.
                </p>
              </div>

              <Separator className="bg-destructive/20" />

              {/* Contract Details */}
              <div className="border-l-4 border-destructive pl-4 space-y-4">
                <h3 className="text-destructive font-semibold mb-3">CONTRACT DETAILS</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div id="field-startDate" className="space-y-2">
                    <Label htmlFor="startDate">Contract Start Date *</Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background" />
                  </div>
                  <div id="field-endDate" className="space-y-2">
                    <Label htmlFor="endDate">Contract End Date</Label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="rollingContract"
                        checked={isRollingContract}
                        onChange={(e) => { setIsRollingContract(e.target.checked); if (e.target.checked) setEndDate(""); }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="rollingContract" className="font-normal cursor-pointer text-sm">Rolling Contract</Label>
                    </div>
                    {!isRollingContract && (
                      <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background" />
                    )}
                    {isRollingContract && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">Continues until terminated by either party</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractDuration">Contract Duration</Label>
                    <Select value={contractDuration} onValueChange={setContractDuration}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                        <SelectItem value="36">36 Months</SelectItem>
                        <SelectItem value="60">60 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Net 30 Days</SelectItem>
                        <SelectItem value="14">Net 14 Days</SelectItem>
                        <SelectItem value="oncompletion">On Completion</SelectItem>
                        <SelectItem value="advance">Payment in Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <Select value={billingCycle} onValueChange={setBillingCycle}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessRequirements">Access Requirements / Special Instructions</Label>
                  <Textarea
                    id="accessRequirements"
                    value={accessRequirements}
                    onChange={(e) => setAccessRequirements(e.target.value)}
                    placeholder="e.g. key holder contact, access restrictions, permit-to-work requirements..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator className="bg-destructive/20" />

              {/* Duration */}
              <div className="border-l-4 border-destructive pl-4">
                <h3 className="text-destructive font-semibold mb-3">DURATION OF AGREEMENT</h3>
                <p className="text-sm">
                  The term of this Agreement shall commence and is effective for an initial term of{" "}
                  <span className="font-semibold">{contractDuration || "[X]"} months</span> from the date of acceptance.
                  {isRollingContract ? (
                    <span> This is a <span className="font-semibold">rolling contract</span> that will automatically renew for subsequent {contractDuration || "12"}-month terms.</span>
                  ) : (
                    <span> Upon expiration, the Agreement will automatically renew for subsequent {contractDuration || "12"}-month terms.</span>
                  )}
                </p>
              </div>

              <Separator className="bg-destructive/20" />

              {/* Client Acceptance */}
              <div className="border-l-4 border-destructive pl-4">
                <h3 className="text-destructive font-semibold mb-3">CLIENT ACCEPTANCE</h3>
                <p className="text-sm">
                  I, the Customer accept/s the above Agreement for the provision of the Services at the Sites subject to the following Terms and Conditions:{" "}
                  <a
                    href="https://www.corefireprotection.co.uk/wp-content/uploads/2020/01/Core-Fire-Protection-Fire-Extinguisher-Maintenance-Terms-and-Conditions-2020.doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-destructive hover:text-destructive/80 underline font-semibold"
                  >
                    Core Fire Ltd Service and Maintenance Terms and Conditions 2023
                  </a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 4: Service Scope Notes & Remedial Work ──────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">4</div>
                <CardTitle>Service Scope Notes & Remedial Work Authorisation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements / Additional Notes</Label>
                <Textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Enter any special requirements, site-specific conditions, or additional scope notes..."
                  rows={4}
                />
              </div>

              <div className="border-t pt-4">
                <Label className="mb-3 block font-semibold">Remedial Work Authorisation</Label>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="immediateRectification" checked={immediateRectification} onCheckedChange={(c) => setImmediateRectification(c as boolean)} />
                    <label htmlFor="immediateRectification" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-medium">Immediate Rectification:</span> Remedial works to be completed during attendance at current equipment rates.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="onSiteAuthorization" checked={onSiteAuthorization} onCheckedChange={(c) => setOnSiteAuthorization(c as boolean)} />
                    <label htmlFor="onSiteAuthorization" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-medium">On-Site Authorisation:</span> Remedial works to be approved by site personnel with appropriate capacity at time of attendance.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="defectQuotation" checked={defectQuotation} onCheckedChange={(c) => setDefectQuotation(c as boolean)} />
                    <label htmlFor="defectQuotation" className="text-sm leading-relaxed cursor-pointer">
                      <span className="font-medium">Defect Quotation:</span> Remedial works to be issued via quotation for client approval.
                    </label>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> Compliance with applicable laws and regulations will remain breached until reported corrective actions are closed out and certified by a competent person.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 5: Signatures ────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">5</div>
                <CardTitle>Signatures</CardTitle>
              </div>
              <CardDescription>Please sign below to confirm your agreement to the terms and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Client Signature */}
                <div id="field-clientSignature" className="space-y-3">
                  <Label>Client Signature *</Label>
                  <div className="relative">
                    <canvas
                      ref={clientCanvasRef}
                      onMouseDown={(e) => startDrawing(e, true)}
                      onMouseMove={(e) => draw(e, true)}
                      onMouseUp={() => stopDrawing(true)}
                      onMouseLeave={() => stopDrawing(true)}
                      onTouchStart={(e) => startDrawing(e, true)}
                      onTouchMove={(e) => draw(e, true)}
                      onTouchEnd={() => stopDrawing(true)}
                      className="w-full h-40 border-2 border-dashed rounded-lg bg-muted/30 cursor-crosshair touch-none"
                    />
                    {!clientHasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">Sign here</div>
                    )}
                    {clientHasSignature && (
                      <Button variant="ghost" size="sm" onClick={() => clearSignature(true)} className="absolute top-2 right-2">Clear</Button>
                    )}
                  </div>
                  <div id="field-clientPrintName" className="space-y-2">
                    <Label htmlFor="clientPrintName">Print Name *</Label>
                    <Input id="clientPrintName" value={clientPrintName} onChange={(e) => setClientPrintName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientDate">Date</Label>
                    <Input id="clientDate" type="date" value={clientDate} onChange={(e) => setClientDate(e.target.value)} />
                  </div>
                </div>

                {/* Company Signature */}
                <div id="field-companySignature" className="space-y-3">
                  <Label>Company Representative Signature *</Label>
                  <div className="relative">
                    <canvas
                      ref={companyCanvasRef}
                      onMouseDown={(e) => startDrawing(e, false)}
                      onMouseMove={(e) => draw(e, false)}
                      onMouseUp={() => stopDrawing(false)}
                      onMouseLeave={() => stopDrawing(false)}
                      onTouchStart={(e) => startDrawing(e, false)}
                      onTouchMove={(e) => draw(e, false)}
                      onTouchEnd={() => stopDrawing(false)}
                      className="w-full h-40 border-2 border-dashed rounded-lg bg-muted/30 cursor-crosshair touch-none"
                    />
                    {!companyHasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">Sign here</div>
                    )}
                    {companyHasSignature && (
                      <Button variant="ghost" size="sm" onClick={() => clearSignature(false)} className="absolute top-2 right-2">Clear</Button>
                    )}
                  </div>
                  <div id="field-companyPrintName" className="space-y-2">
                    <Label htmlFor="companyPrintName">Print Name *</Label>
                    <Input id="companyPrintName" value={companyPrintName} onChange={(e) => setCompanyPrintName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDate">Date</Label>
                    <Input id="companyDate" type="date" value={companyDate} onChange={(e) => setCompanyDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 6: Terms & Conditions ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">6</div>
                <CardTitle>Terms & Conditions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6 space-y-4 text-sm max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-semibold mb-2">1. Service Standards</h4>
                  <p className="text-muted-foreground">All services will be carried out in accordance with applicable British Standards (including BS 5839-1:2025, BS EN 12845, PD 6662, BS 5306-3:2017 and others as applicable) and by competent, trained engineers holding relevant qualifications and certifications.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Access & Scheduling</h4>
                  <p className="text-muted-foreground">The Client agrees to provide reasonable access to all systems and equipment during normal working hours. Service visits will be scheduled in advance with a minimum of 5 working days' notice. Emergency call-outs are available at additional cost as per the schedule of rates.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Equipment & System Condition</h4>
                  <p className="text-muted-foreground">This agreement covers routine inspection and servicing only. Additional charges may apply for replacement of defective parts, equipment requiring extended service or refurbishment, and any equipment found to be beyond economical repair. All defects will be reported and quoted separately.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4. Payment Terms</h4>
                  <p className="text-muted-foreground">Payment is due as per the selected payment terms. Late payments may incur interest charges at 8% above Bank of England base rate. Core Fire Protection reserves the right to suspend services for accounts overdue by more than 30 days.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5. Liability & Insurance</h4>
                  <p className="text-muted-foreground">Core Fire Protection maintains full Public Liability Insurance (£5,000,000) and Professional Indemnity Insurance (£2,000,000). Our liability is limited to the annual contract value except in cases of proven negligence.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">6. Contract Duration & Cancellation</h4>
                  <p className="text-muted-foreground">This agreement is for the duration specified above. Either party may terminate with 30 days' written notice. Early termination by the Client may result in charges for services already provided plus a cancellation fee of 25% of the remaining contract value.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">7. Compliance & Regulatory</h4>
                  <p className="text-muted-foreground">The Client is responsible for ensuring all systems are maintained in accordance with applicable legislation including the Regulatory Reform (Fire Safety) Order 2005, Fire (Scotland) Act 2005, and any other relevant statutory requirements. Core Fire Protection will provide documentation to support compliance but cannot accept responsibility for pre-existing non-compliances.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">8. Subcontracting</h4>
                  <p className="text-muted-foreground">Core Fire Protection reserves the right to subcontract specialist works to approved, accredited subcontractors. All subcontracted works will be managed and warranted by Core Fire Protection.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c as boolean)}
                />
                <label id="field-termsAccepted" htmlFor="terms" className="text-sm flex items-start gap-2 cursor-pointer">
                  I have read and agree to the{" "}
                  <a
                    href="https://www.corefireprotection.co.uk/wp-content/uploads/2020/01/Core-Fire-Protection-Fire-Extinguisher-Maintenance-Terms-and-Conditions-2020.doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-medium"
                  >
                    Terms and Conditions
                  </a>
                  {" "}and confirm that the information provided is accurate.
                </label>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {[
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "BAFE SP203-1" },
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "BAFE SP101" },
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "NSI Fire Gold" },
                  { icon: <Shield className="h-3 w-3" />, label: "BSI Kitemark" },
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "BS 5839-1:2025" },
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "BS EN 12845" },
                  { icon: <CheckCircle2 className="h-3 w-3" />, label: "PD 6662" },
                ].map((b) => (
                  <div key={b.label} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
                    {b.icon}
                    {b.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Action Buttons ───────────────────────────────────────────────── */}
          <div className="flex justify-between items-center pb-8">
            <div>
              {isDraft && (
                <p className="text-sm text-muted-foreground">
                  <Save className="h-4 w-4 inline mr-1" />
                  Draft saved — you can return to this URL anytime
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="lg" onClick={handleSaveDraft} disabled={saveDraftMutation.isPending}>
                {saveDraftMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Draft</>}
              </Button>
              <Button variant="outline" size="lg" onClick={handlePrint}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {submitMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit Agreement</>}
              </Button>
            </div>
          </div>

        </main>
      </div>

      {/* Guided Mode */}
      {isGuidedMode && (
        <GuidedWalkthrough
          fields={getGuidedFields()}
          onClose={() => setIsGuidedMode(false)}
        />
      )}
    </div>
  );
}

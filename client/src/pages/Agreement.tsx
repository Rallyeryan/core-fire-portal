import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Plus, X, Printer, Send, Loader2, Shield, CheckCircle2, Download, Save, Navigation } from "lucide-react";
import { GuidedWalkthrough } from "@/components/GuidedWalkthrough";
import { getGuidedFields } from "@/lib/guidedFields";
import { nanoid } from "nanoid";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import jsPDF from "jspdf";

interface EquipmentRow {
  id: string;
  type: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ServiceItem {
  id: string;
  label: string;
  checked: boolean;
}

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
  
  // Contract Details
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRollingContract, setIsRollingContract] = useState(false);
  const [contractDuration, setContractDuration] = useState("12");
  const [serviceFrequency, setServiceFrequency] = useState("annual");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [billingCycle, setBillingCycle] = useState("annually");
  
  // Equipment
  const [equipment, setEquipment] = useState<EquipmentRow[]>([
    { id: "1", type: "", quantity: 1, unitPrice: 0, subtotal: 0 }
  ]);
  
  // Service Scope
  const [services, setServices] = useState<ServiceItem[]>([
    { id: "1", label: "Annual inspection & service (BS 5306-3)", checked: true },
    { id: "2", label: "Visual inspection & weight check", checked: true },
    { id: "3", label: "Pressure gauge testing", checked: true },
    { id: "4", label: "Safety pin & tamper seal check", checked: true },
    { id: "5", label: "Service labels & certification", checked: true },
    { id: "6", label: "Asset register update", checked: true },
    { id: "7", label: "Extended discharge testing", checked: false },
    { id: "8", label: "Refurbishment works (additional cost)", checked: false },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // Remedial Work Authorization
  const [immediateRectification, setImmediateRectification] = useState(false);
  const [onSiteAuthorization, setOnSiteAuthorization] = useState(false);
  const [defectQuotation, setDefectQuotation] = useState(false);
  
  // Pricing
  const [discount, setDiscount] = useState(0);
  
  // Agreement Overview (optional fields)
  const [tradingName, setTradingName] = useState("");
  const [registeredAt, setRegisteredAt] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  
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
    const token = params.get('draft');
    if (token) {
      setDraftToken(token);
      setIsDraft(true);
    } else {
      // Generate new draft token
      setDraftToken(nanoid(16));
    }
  }, []);
  
  // Load draft using tRPC query
  const { data: draftData } = trpc.agreements.getDraft.useQuery(
    { token: draftToken },
    { enabled: isDraft && draftToken.length > 0 }
  );
  
  // Populate form when draft data loads
  useEffect(() => {
    if (!draftData) return;
    
    const { draft, equipment: draftEquipment } = draftData;
    
    if (draft.clientName) setClientName(draft.clientName);
    if (draft.siteAddress) setSiteAddress(draft.siteAddress);
    if (draft.city) setCity(draft.city);
    if (draft.postcode) setPostcode(draft.postcode);
    if (draft.contactName) setContactName(draft.contactName);
    if (draft.position) setPosition(draft.position);
    if (draft.telephone) setTelephone(draft.telephone);
    if (draft.email) setEmail(draft.email);
    if (draft.startDate) setStartDate(new Date(draft.startDate).toISOString().split('T')[0]);
    if (draft.contractDuration) setContractDuration(draft.contractDuration);
    if (draft.serviceFrequency) setServiceFrequency(draft.serviceFrequency);
    if (draft.paymentTerms) setPaymentTerms(draft.paymentTerms);
    if (draft.billingCycle) setBillingCycle(draft.billingCycle);
    
    if (draftEquipment && draftEquipment.length > 0) {
      setEquipment(draftEquipment.map((e: any) => ({
        id: e.id.toString(),
        type: e.type,
        quantity: e.quantity,
        unitPrice: 0,
        subtotal: 0,
      })));
    }
    
    toast.success("Draft loaded successfully");
  }, [draftData]);

  // Calculate pricing
  const equipmentSubtotal = equipment.reduce((sum, item) => sum + item.subtotal, 0);
  const netTotal = equipmentSubtotal - discount;
  const vatAmount = netTotal * 0.2;
  const grandTotal = netTotal + vatAmount;

  // Equipment management
  const addEquipment = () => {
    setEquipment([...equipment, { 
      id: Date.now().toString(), 
      type: "",
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    }]);
  };

  const removeEquipment = (id: string) => {
    if (equipment.length > 1) {
      setEquipment(equipment.filter(e => e.id !== id));
    }
  };

  // Equipment presets with standard prices
  const equipmentPresets: Record<string, { label: string; price: number }> = {
    "co2-2kg": { label: "CO2 Extinguisher 2kg", price: 15.50 },
    "co2-5kg": { label: "CO2 Extinguisher 5kg", price: 22.00 },
    "foam-6l": { label: "Foam Extinguisher 6L", price: 18.50 },
    "foam-9l": { label: "Foam Extinguisher 9L", price: 24.00 },
    "powder-2kg": { label: "Dry Powder Extinguisher 2kg", price: 16.00 },
    "powder-6kg": { label: "Dry Powder Extinguisher 6kg", price: 20.50 },
    "powder-9kg": { label: "Dry Powder Extinguisher 9kg", price: 26.00 },
    "water-6l": { label: "Water Extinguisher 6L", price: 17.00 },
    "water-9l": { label: "Water Extinguisher 9L", price: 22.50 },
    "watermist-6l": { label: "Water Mist Extinguisher 6L", price: 28.00 },
    "wetchemical-2l": { label: "Wet Chemical Extinguisher 2L", price: 24.50 },
    "wetchemical-6l": { label: "Wet Chemical Extinguisher 6L", price: 32.00 },
    "blanket-1.2m": { label: "Fire Blanket 1.2m x 1.2m", price: 12.00 },
    "blanket-1.8m": { label: "Fire Blanket 1.8m x 1.8m", price: 18.00 },
    "hose-reel": { label: "Fire Hose Reel Service", price: 45.00 },
    "attendance": { label: "Attendance Charge", price: 75.00 },
    "custom": { label: "Custom Equipment (enter details)", price: 0 }
  };

  const updateEquipment = (id: string, field: keyof EquipmentRow, value: string | number) => {
    setEquipment(equipment.map(e => {
      if (e.id === id) {
        const updated = { ...e, [field]: value };
        
        // Auto-fill price when equipment type is selected
        if (field === "type" && typeof value === "string" && equipmentPresets[value]) {
          updated.unitPrice = equipmentPresets[value].price;
        }
        
        // Recalculate subtotal
        if (field === "quantity" || field === "unitPrice" || field === "type") {
          updated.subtotal = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return e;
    }));
  };

  const toggleService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, checked: !s.checked } : s
    ));
  };

  // Update end date when duration changes
  useEffect(() => {
    if (startDate && contractDuration) {
      const start = new Date(startDate);
      const months = parseInt(contractDuration);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, contractDuration]);

  // Signature canvas setup
  useEffect(() => {
    const setupCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      
      // Set drawing style
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    setupCanvas(clientCanvasRef.current);
    setupCanvas(companyCanvasRef.current);
  }, []);

  // Signature drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isClient: boolean) => {
    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isClient) {
      setIsClientDrawing(true);
      setClientHasSignature(true);
    } else {
      setIsCompanyDrawing(true);
      setCompanyHasSignature(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isClient: boolean) => {
    const isDrawing = isClient ? isClientDrawing : isCompanyDrawing;
    if (!isDrawing) return;

    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (isClient: boolean) => {
    if (isClient) {
      setIsClientDrawing(false);
    } else {
      setIsCompanyDrawing(false);
    }
  };

  const clearSignature = (isClient: boolean) => {
    const canvas = isClient ? clientCanvasRef.current : companyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isClient) {
      setClientHasSignature(false);
    } else {
      setCompanyHasSignature(false);
    }
  };

  // Submit mutation
  const saveDraftMutation = trpc.agreements.saveDraft.useMutation({
    onSuccess: (data) => {
      toast.success("Draft saved successfully!");
      // Update URL with draft token if not already there
      if (!isDraft) {
        window.history.pushState({}, '', `/agreement?draft=${draftToken}`);
        setIsDraft(true);
      }
    },
    onError: (error) => {
      toast.error(`Failed to save draft: ${error.message}`);
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
      serviceFrequency,
      paymentTerms,
      billingCycle,
      equipmentData: JSON.stringify(equipment),
    });
  };

  const sendEmailsMutation = trpc.agreements.sendEmails.useMutation({
    onSuccess: () => {
      toast.success("Confirmation emails sent to both parties!");
    },
    onError: (error) => {
      toast.error(`Email delivery failed: ${error.message}`);
    },
  });

  const submitMutation = trpc.agreements.submit.useMutation({
    onSuccess: (data) => {
      toast.success(`Agreement submitted successfully! Contract Reference: ${data.contractReference}`);
      // Send confirmation emails
      if (data.agreementId) {
        sendEmailsMutation.mutate({ agreementId: data.agreementId });
      }
      // Reset form or redirect
    },
    onError: (error) => {
      toast.error(`Failed to submit agreement: ${error.message}`);
    }
  });

  const handleSubmit = async () => {
    // Validation
    if (!clientName || !siteAddress || !contactName || !email) {
      toast.error("Please fill in all required client information fields");
      return;
    }

    if (!startDate) {
      toast.error("Please select contract start date");
      return;
    }

    if (!isRollingContract && !endDate) {
      toast.error("Please select contract end date or enable rolling contract");
      return;
    }

    if (equipment.length === 0 || equipment.some(e => !e.type)) {
      toast.error("Please add at least one equipment item");
      return;
    }

    if (!clientHasSignature || !companyHasSignature) {
      toast.error("Both client and company signatures are required");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!clientPrintName || !companyPrintName) {
      toast.error("Please provide printed names for both signatures");
      return;
    }

    // Get signature data
    const clientSignature = clientCanvasRef.current?.toDataURL() || "";
    const companySignature = companyCanvasRef.current?.toDataURL() || "";

    // Submit
    await submitMutation.mutateAsync({
      clientName,
      companyRegistrationNo: companyRegistrationNo || undefined,
      siteAddress,
      city,
      postcode,
      contactName,
      position: position || "",
      telephone,
      email,
      startDate: new Date(startDate),
      endDate: isRollingContract ? new Date("2099-12-31") : new Date(endDate),
      contractDuration,
      serviceFrequency,
      paymentTerms,
      billingCycle,
      accessRequirements: additionalNotes,
      servicesIncluded: services.filter(s => s.checked).map(s => s.label).join(", "),
      specialRequirements: additionalNotes,
      immediateRectification,
      onSiteAuthorization,
      defectQuotation,
      serviceFee: equipmentSubtotal,
      maintenanceFee: 0,
      additionalFee: discount,
      subtotal: netTotal,
      vat: vatAmount,
      total: grandTotal,
      paymentSchedule: billingCycle,
      equipment: equipment.map(e => ({
        id: e.id,
        quantity: e.quantity,
        type: e.type,
      })),
      clientSignature,
      clientPrintName,
      companySignature,
      companyPrintName,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Add watermark pattern to all pages
    const addWatermark = () => {
      const logoUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/yQArWlsWOllKvZBA.png';
      const logoWidth = 50;
      const logoHeight = 25;
      const spacing = 60;
      
      // Save current graphics state
      doc.saveGraphicsState();
      doc.setGState({ opacity: 0.03 });
      
      for (let x = 0; x < pageWidth; x += spacing) {
        for (let y = 0; y < pageHeight; y += spacing) {
          doc.addImage(logoUrl, 'PNG', x, y, logoWidth, logoHeight, undefined, 'NONE');
        }
      }
      
      // Restore graphics state
      doc.restoreGraphicsState();
    };
    
    addWatermark();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Core Fire Protection Ltd", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Fire Safety Solutions", margin, yPos);
    
    // Contract Reference
    doc.setFontSize(9);
    doc.text(`Contract Reference: CFP-PFE-${Date.now().toString().slice(-6)}`, pageWidth - margin - 60, 20, { align: "right" });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Portable Fire Equipment Service Agreement", pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Annual Maintenance & Inspection Contract", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Proposal Letter
    if (recipientName) {
      doc.setFontSize(10);
      doc.text(`Dear ${recipientName},`, margin, yPos);
      yPos += 10;
    }

    // Equipment Schedule
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. Equipment Schedule", margin, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    equipment.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${item.type || 'N/A'} - Qty: ${item.quantity} - £${item.unitPrice.toFixed(2)} - Subtotal: £${item.subtotal.toFixed(2)}`, margin, yPos);
      yPos += 6;
    });
    yPos += 5;

    // Pricing Summary
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. Pricing Summary", margin, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Annual Equipment Service Subtotal: £${equipmentSubtotal.toFixed(2)}`, margin, yPos);
    yPos += 6;
    doc.text(`Discount: £${discount.toFixed(2)}`, margin, yPos);
    yPos += 6;
    doc.text(`Net Total: £${netTotal.toFixed(2)}`, margin, yPos);
    yPos += 6;
    doc.text(`VAT (20%): £${vatAmount.toFixed(2)}`, margin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Annual Contract Value: £${grandTotal.toFixed(2)}`, margin, yPos);
    yPos += 10;

    // Agreement Overview
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. Agreement Overview", margin, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Company/Client Name: ${clientName || 'N/A'}`, margin, yPos);
    yPos += 6;
    if (tradingName) {
      doc.text(`Trading Name: ${tradingName}`, margin, yPos);
      yPos += 6;
    }
    doc.text(`Address: ${siteAddress || 'N/A'}, ${city || ''}, ${postcode || ''}`, margin, yPos);
    yPos += 6;
    doc.text(`Contact: ${contactName || 'N/A'} (${position || 'N/A'})`, margin, yPos);
    yPos += 6;
    doc.text(`Email: ${email || 'N/A'} | Phone: ${telephone || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Contract Start: ${startDate || 'N/A'} | Duration: ${contractDuration} months`, margin, yPos);
    yPos += 6;
    doc.text(`Service Frequency: ${serviceFrequency} | Payment Terms: ${paymentTerms}`, margin, yPos);
    yPos += 10;

    // Signatures
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. Signatures", margin, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Client Signature
    if (clientCanvasRef.current && clientHasSignature) {
      const clientSigData = clientCanvasRef.current.toDataURL('image/png');
      doc.addImage(clientSigData, 'PNG', margin, yPos, 60, 20);
    }
    yPos += 25;
    doc.text(`Client: ${clientPrintName || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${clientDate || 'N/A'}`, margin, yPos);
    yPos += 15;

    // Company Signature
    if (companyCanvasRef.current && companyHasSignature) {
      const companySigData = companyCanvasRef.current.toDataURL('image/png');
      doc.addImage(companySigData, 'PNG', margin, yPos, 60, 20);
    }
    yPos += 25;
    doc.text(`Company Representative: ${companyPrintName}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${companyDate || 'N/A'}`, margin, yPos);
    yPos += 15;

    // Terms & Conditions
    if (yPos > 200) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. Terms & Conditions", margin, yPos);
    yPos += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    const terms = [
      { title: "1. Service Standards", text: "All services will be carried out in accordance with BS 5306-3:2017 (Code of practice for commissioning and maintenance of portable fire extinguishers) and by competent, trained engineers." },
      { title: "2. Access & Scheduling", text: "The Client agrees to provide reasonable access to all equipment during normal working hours. Service visits will be scheduled in advance with a minimum of 5 working days' notice. Emergency call-outs are available at additional cost." },
      { title: "3. Equipment Condition", text: "This agreement covers routine inspection and servicing only. Additional charges may apply for replacement of defective parts, equipment requiring extended service or refurbishment, and any equipment found to be beyond economical repair." },
      { title: "4. Payment Terms", text: "Payment is due as per the selected payment terms. Late payments may incur interest charges at 8% above Bank of England base rate. Core Fire Protection reserves the right to suspend services for accounts overdue by more than 30 days." },
      { title: "5. Liability & Insurance", text: "Core Fire Protection maintains full Public Liability Insurance (£5,000,000) and Professional Indemnity Insurance (£2,000,000). Our liability is limited to the annual contract value except in cases of proven negligence." },
      { title: "6. Contract Duration & Cancellation", text: "This agreement is for the duration specified above. Either party may terminate with 30 days' written notice. Early termination by the Client may result in charges for services already provided plus a cancellation fee of 25% of the remaining contract value." }
    ];

    terms.forEach((term) => {
      if (yPos > 270) {
        doc.addPage();
        addWatermark();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(term.title, margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(term.text, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * 4) + 3;
    });

    // Compliance Badges
    yPos += 5;
    if (yPos > 260) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("✓ BS EN 3 Compliant  ✓ BS 5306-3:2017  ✓ BAFE Certified", margin, yPos);

    // Save PDF
    doc.save(`Core-Fire-Agreement-${Date.now()}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-10"
      >
        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/BiKovLyLozMEjPBA.mp4" type="video/mp4" />
      </video>
      
      {/* Watermark Pattern Overlay */}
      <div 
        className="fixed inset-0 z-[5] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url(https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/yQArWlsWOllKvZBA.png)',
          backgroundSize: '300px 150px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
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
            <Button 
              variant="ghost" 
              onClick={() => setIsGuidedMode(true)} 
              className="text-white hover:bg-white/10"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Guided Mode
            </Button>
            <Button variant="ghost" onClick={handlePrint} className="text-white hover:bg-white/10">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-8 space-y-8">
        {/* Document Header */}
        <Card className="overflow-hidden border-primary/20">
          <div 
            className="relative bg-cover bg-center text-white"
            style={{
              backgroundImage: 'url(https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/jnRWkvMhjhxhyVCB.jpg)',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
            
            <CardHeader className="relative z-10 text-center space-y-2">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <h1 className="text-2xl font-bold drop-shadow-lg">Core Fire Protection Ltd</h1>
                  <p className="text-sm opacity-90 drop-shadow">Professional Fire Safety Solutions</p>
                </div>
                <div className="text-right text-sm">
                  <p className="opacity-75 uppercase tracking-wide text-xs drop-shadow">Contract Reference</p>
                  <p className="font-semibold text-base drop-shadow-lg">CFP-PFE-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              <Separator className="bg-white/20" />
              <CardTitle className="text-3xl pt-4 drop-shadow-lg">Portable Fire Equipment Service Agreement</CardTitle>
              <CardDescription className="text-white/90 drop-shadow">
                Annual Maintenance & Inspection Contract
              </CardDescription>
            </CardHeader>
          </div>
        </Card>

        {/* Section 1: Client Information */}
        <Card>
          <CardContent className="space-y-6">
            {/* Proposal Letter */}
            <div className="max-w-3xl mx-auto space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Label htmlFor="recipientName" className="whitespace-nowrap">Dear</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="flex-1 max-w-md"
                />
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  On behalf of Core Fire Protection, I am pleased to present our service agreement proposal for the planned preventative maintenance of Fire, Security, and Safety systems.
                </p>
                
                <p>
                  This agreement is proposed between Core Fire Ltd T/A Core Fire Protection ("The Service Provider") and{" "}
                  <span className="font-semibold text-foreground">{clientName || "[Customer Company Name]"}</span>{" "}
                  ("the Customer") for the service and maintenance of the systems specified within this document.
                </p>
                
                <p>
                  Our proposal includes scheduled preventative maintenance visits per annum, in line with the recommendations set out in the latest British Standards in accordance to the provided schedule of rates that presents the frequency of visits and associated annual costs.
                </p>
                
                <p>
                  This agreement provides a structured service framework that outlines expectations and service delivery programs for both parties. It is intended as a working document that may evolve to accommodate changing needs.
                </p>
                
                <p>
                  The agreement covers a 12 month period from the date of acceptance on a rolling basis. Our estimate assumes unrestricted access to all relevant areas for our engineers, ensuring continuous and uninterrupted work. We will make every effort to coordinate with other suppliers and trades; any delays or disruptions caused by third parties may result in additional charges.
                </p>
                
                <p>
                  Unless otherwise agreed, all work will be carried out during our standard business hours. Any services required outside these hours, including overtime, weekends, or bank holidays, can be arranged but may be subject to additional costs.
                </p>
                
                <p>
                  This document and its terms are directly linked to the systems covered under this agreement, incorporating the relevant terms and conditions for the duration of the Service Level Agreement.
                </p>
                
                <p>
                  Should you require any further information or clarification, please do not hesitate to contact me.
                </p>
                
                <p>Yours sincerely,</p>
                
                <div className="space-y-1">
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your Name"
                    className="max-w-xs border-b border-t-0 border-x-0 rounded-none px-0"
                  />
                  <p className="text-xs text-muted-foreground">Core Fire Protection</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Equipment Schedule */}
        <Card id="equipment-section">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <CardTitle>Equipment Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">SERVICE/EQUIPMENT TYPE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Unit Price (£)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Subtotal</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-muted/30">
                    {equipment.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          <Select
                            value={item.type}
                            onValueChange={(value) => updateEquipment(item.id, "type", value)}
                          >
                            <SelectTrigger className="border-0 bg-transparent">
                              <SelectValue placeholder="Select equipment type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="co2-2kg">{equipmentPresets["co2-2kg"].label}</SelectItem>
                              <SelectItem value="co2-5kg">{equipmentPresets["co2-5kg"].label}</SelectItem>
                              <SelectItem value="foam-6l">{equipmentPresets["foam-6l"].label}</SelectItem>
                              <SelectItem value="foam-9l">{equipmentPresets["foam-9l"].label}</SelectItem>
                              <SelectItem value="powder-2kg">{equipmentPresets["powder-2kg"].label}</SelectItem>
                              <SelectItem value="powder-6kg">{equipmentPresets["powder-6kg"].label}</SelectItem>
                              <SelectItem value="powder-9kg">{equipmentPresets["powder-9kg"].label}</SelectItem>
                              <SelectItem value="water-6l">{equipmentPresets["water-6l"].label}</SelectItem>
                              <SelectItem value="water-9l">{equipmentPresets["water-9l"].label}</SelectItem>
                              <SelectItem value="watermist-6l">{equipmentPresets["watermist-6l"].label}</SelectItem>
                              <SelectItem value="wetchemical-2l">{equipmentPresets["wetchemical-2l"].label}</SelectItem>
                              <SelectItem value="wetchemical-6l">{equipmentPresets["wetchemical-6l"].label}</SelectItem>
                              <SelectItem value="blanket-1.2m">{equipmentPresets["blanket-1.2m"].label}</SelectItem>
                              <SelectItem value="blanket-1.8m">{equipmentPresets["blanket-1.8m"].label}</SelectItem>
                              <SelectItem value="hose-reel">{equipmentPresets["hose-reel"].label}</SelectItem>
                              <SelectItem value="attendance">{equipmentPresets["attendance"].label}</SelectItem>
                              <SelectItem value="custom">{equipmentPresets["custom"].label}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateEquipment(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="border-0 bg-transparent w-20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateEquipment(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="border-0 bg-transparent w-24"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">
                          £{item.subtotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEquipment(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t">
                <Button
                  variant="ghost"
                  onClick={addEquipment}
                  className="w-full py-3 text-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Service Scope */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <CardTitle>Service Scope</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Services Included</Label>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={service.checked}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <label
                      htmlFor={service.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes / Special Requirements</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Enter any special requirements, access restrictions, or additional notes..."
                rows={4}
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <Label className="mb-3 block font-semibold">Remedial Work Authorization</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="immediateRectification"
                    checked={immediateRectification}
                    onCheckedChange={(checked) => setImmediateRectification(checked as boolean)}
                  />
                  <label
                    htmlFor="immediateRectification"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="font-medium">Immediate Rectification:</span> Remedial works to be completed during attendance at current equipment rates.
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="onSiteAuthorization"
                    checked={onSiteAuthorization}
                    onCheckedChange={(checked) => setOnSiteAuthorization(checked as boolean)}
                  />
                  <label
                    htmlFor="onSiteAuthorization"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="font-medium">On-Site Authorization:</span> Remedial works to be approved by site personnel with appropriate capacity at time of attendance (at current equipment rates).
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="defectQuotation"
                    checked={defectQuotation}
                    onCheckedChange={(checked) => setDefectQuotation(checked as boolean)}
                  />
                  <label
                    htmlFor="defectQuotation"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
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

        {/* Section 2: Pricing Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <CardTitle>Pricing Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-primary mb-3">Contract Value Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Equipment Service Subtotal</span>
                    <span className="font-medium">£{equipmentSubtotal.toFixed(2)}</span>
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
              </div>
              <div className="bg-accent/10 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Annual Contract Value
                </div>
                <div className="text-4xl font-bold text-accent mb-2">
                  £{grandTotal.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Including VAT @ 20%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Agreement Overview */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="bg-destructive/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <CardTitle className="text-destructive">AGREEMENT OVERVIEW</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Agreement Parties */}
            <div className="border-l-4 border-destructive pl-4 space-y-4">
              <div className="space-y-4">
                <p className="text-sm">
                  This following is a proposed mutual agreement between Core Fire Ltd T/A Core Fire Protection ("Core") and{" "}
                  <span className="font-semibold text-foreground">{clientName || "[Client Company Name]"}</span> T/A
                </p>
                
                <div id="field-clientName" className="space-y-2">
                  <Label htmlFor="clientName">Company / Client Name *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter company or client name"
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tradingName">Trading Name</Label>
                  <Input
                    id="tradingName"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    placeholder="Enter trading name if different from company name"
                    className="bg-background"
                  />
                </div>

                <div id="field-siteAddress" className="space-y-2">
                  <Label htmlFor="siteAddress">Site Address *</Label>
                  <Input
                    id="siteAddress"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    placeholder="Street address"
                    className="bg-background"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div id="field-city" className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="bg-background"
                    />
                  </div>
                  <div id="field-postcode" className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="Postcode"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overviewCompanyNo">Company No.</Label>
                    <Input
                      id="overviewCompanyNo"
                      value={companyRegistrationNo}
                      onChange={(e) => setCompanyRegistrationNo(e.target.value)}
                      placeholder="Enter company registration number"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registeredAt">Registered at</Label>
                    <Input
                      id="registeredAt"
                      value={registeredAt}
                      onChange={(e) => setRegisteredAt(e.target.value)}
                      placeholder="e.g., Companies House"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredAddress">Registered Address</Label>
                  <Input
                    id="registeredAddress"
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="Enter registered address if different from site address"
                    className="bg-background"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div id="field-contactName" className="space-y-2">
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Contact name"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position / Title</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Position"
                      className="bg-background"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div id="field-telephone" className="space-y-2">
                  <Label htmlFor="telephone">Telephone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Phone number"
                      className="bg-background"
                    />
                  </div>
                <div id="field-email" className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="bg-background"
                    />
                  </div>
                </div>

                <p className="text-sm italic">
                  (defined as "The Customer") for the Inspection and Maintenance of Systems listed within this agreement.
                </p>

                <p className="text-sm">
                  This Fire & Security Systems Maintenance Agreement (the "Agreement") is entered into by and between and Core Fire Ltd T/A Core Fire Protection collectively referred to as the "Parties."
                </p>
              </div>
            </div>

            <Separator className="bg-destructive/20" />

            {/* Services Provided */}
            <div className="border-l-4 border-destructive pl-4">
              <h3 className="text-destructive font-semibold mb-3">SERVICES PROVIDED</h3>
              <p className="text-sm">
                The Service Provider will perform maintenance services at{" "}
                <span className="font-semibold text-foreground">
                  {siteAddress ? `${siteAddress}${city ? ', ' + city : ''}${postcode ? ', ' + postcode : ''}` : "[Site Location]"}
                </span>{" "}
                in accordance to the schedule of rates. These services include, but are not limited to, PPM Test & Inspections, System Support and Service and necessary repairs or replacements in accordance to service schedule.
              </p>
            </div>

            <Separator className="bg-destructive/20" />
            
            {/* Contract Details */}
            <div className="border-l-4 border-destructive pl-4 space-y-4">
              <h3 className="text-destructive font-semibold mb-3">CONTRACT DETAILS</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div id="field-startDate" className="space-y-2">
                  <Label htmlFor="startDate">Contract Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div id="field-endDate" className="space-y-2">
                  <Label htmlFor="endDate">Contract End Date</Label>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="rollingContract"
                      checked={isRollingContract}
                      onChange={(e) => {
                        setIsRollingContract(e.target.checked);
                        if (e.target.checked) {
                          setEndDate("");
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="rollingContract" className="font-normal cursor-pointer text-sm">
                      Rolling Contract (No fixed end date)
                    </Label>
                  </div>
                  {!isRollingContract && (
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-background"
                    />
                  )}
                  {isRollingContract && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                      This contract will continue indefinitely until terminated by either party
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Contract Duration</Label>
                  <Select value={contractDuration} onValueChange={setContractDuration}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                      <SelectItem value="60">60 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceFrequency">Service Frequency</Label>
                  <Select value={serviceFrequency} onValueChange={setServiceFrequency}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="biannual">Bi-Annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-destructive/20" />

            {/* Duration of Agreement */}
            <div className="border-l-4 border-destructive pl-4">
              <h3 className="text-destructive font-semibold mb-3">DURATION OF AGREEMENT</h3>
              <p className="text-sm">
                The term of this Agreement shall commence is effective for an initial term of{" "}
                <span className="font-semibold text-foreground">{contractDuration || "[X]"} months</span> from the date of acceptance.
                {isRollingContract ? (
                  <span> This is a <span className="font-semibold text-foreground">rolling contract</span> that will automatically renew for subsequent {contractDuration || "12"}-month terms.</span>
                ) : (
                  <span> Upon expiration, the Agreement will automatically renew for subsequent {contractDuration || "12"}-month terms.</span>
                )}
                {" "}To terminate, either party must provide written notice of cancellation to the other party at least ninety (90) days before the end of the current term. This Agreement may be renewed upon mutual written agreement of the Parties.
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

        {/* Section 4: Signatures */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <CardTitle>Signatures</CardTitle>
            </div>
            <CardDescription>
              Please sign below to confirm your agreement to the terms and conditions
            </CardDescription>
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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">
                      Sign here
                    </div>
                  )}
                  {clientHasSignature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSignature(true)}
                      className="absolute top-2 right-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div id="field-clientPrintName" className="space-y-2">
                  <Label htmlFor="clientPrintName">Print Name *</Label>
                  <Input
                    id="clientPrintName"
                    value={clientPrintName}
                    onChange={(e) => setClientPrintName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientDate">Date</Label>
                  <Input
                    id="clientDate"
                    type="date"
                    value={clientDate}
                    onChange={(e) => setClientDate(e.target.value)}
                  />
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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">
                      Sign here
                    </div>
                  )}
                  {companyHasSignature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSignature(false)}
                      className="absolute top-2 right-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div id="field-companyPrintName" className="space-y-2">
                  <Label htmlFor="companyPrintName">Print Name *</Label>
                  <Input
                    id="companyPrintName"
                    value={companyPrintName}
                    onChange={(e) => setCompanyPrintName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDate">Date</Label>
                  <Input
                    id="companyDate"
                    type="date"
                    value={companyDate}
                    onChange={(e) => setCompanyDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Terms & Conditions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                5
              </div>
              <CardTitle>Terms & Conditions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 space-y-4 text-sm max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">1. Service Standards</h4>
                <p className="text-muted-foreground">
                  All services will be carried out in accordance with BS 5306-3:2017 (Code of practice for commissioning and maintenance of portable fire extinguishers) and by competent, trained engineers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Access & Scheduling</h4>
                <p className="text-muted-foreground">
                  The Client agrees to provide reasonable access to all equipment during normal working hours. Service visits will be scheduled in advance with a minimum of 5 working days' notice. Emergency call-outs are available at additional cost.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Equipment Condition</h4>
                <p className="text-muted-foreground">
                  This agreement covers routine inspection and servicing only. Additional charges may apply for replacement of defective parts, equipment requiring extended service or refurbishment, and any equipment found to be beyond economical repair.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Payment Terms</h4>
                <p className="text-muted-foreground">
                  Payment is due as per the selected payment terms. Late payments may incur interest charges at 8% above Bank of England base rate. Core Fire Protection reserves the right to suspend services for accounts overdue by more than 30 days.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5. Liability & Insurance</h4>
                <p className="text-muted-foreground">
                  Core Fire Protection maintains full Public Liability Insurance (£5,000,000) and Professional Indemnity Insurance (£2,000,000). Our liability is limited to the annual contract value except in cases of proven negligence.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">6. Contract Duration & Cancellation</h4>
                <p className="text-muted-foreground">
                  This agreement is for the duration specified above. Either party may terminate with 30 days' written notice. Early termination by the Client may result in charges for services already provided plus a cancellation fee of 25% of the remaining contract value.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                id="field-termsAccepted"
                htmlFor="terms"
                className="text-sm flex items-start gap-2 cursor-pointer"
              >
                I have read and agree to the{" "}
                <a
                  href="/CoreFireProtectionFireExtinguisherMaintenanceTermsandConditions2020.doc"
                  download
                  className="text-accent hover:underline font-medium"
                >
                  Terms and Conditions
                </a>
                {" "}and confirm that the information provided is accurate.
              </label>
            </div>

            {/* Compliance Badges */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                BS EN 3 Compliant
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                BS 5306-3:2017
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
                <Shield className="h-3 w-3" />
                BAFE Certified
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {isDraft && (
              <p className="text-sm text-muted-foreground">
                <Save className="h-4 w-4 inline mr-1" />
                Draft saved - You can return to this URL anytime
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={handleSaveDraft} disabled={saveDraftMutation.isPending}>
              {saveDraftMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
            <Button variant="outline" size="lg" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Agreement
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      </div>
      
      {/* Guided Walkthrough */}
      <GuidedWalkthrough
        isActive={isGuidedMode}
        onClose={() => setIsGuidedMode(false)}
        fields={getGuidedFields({
          clientName,
          siteAddress,
          city,
          postcode,
          contactName,
          telephone,
          email,
          startDate,
          endDate,
          isRollingContract,
          equipment,
          clientHasSignature,
          companyHasSignature,
          clientPrintName,
          companyPrintName,
          termsAccepted,
        })}
      />
    </div>
  );
}

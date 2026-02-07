export interface FormField {
  id: string;
  label: string;
  instruction: string;
  section: string;
  required: boolean;
  validate?: () => boolean;
}

export const getGuidedFields = (formData: {
  clientName: string;
  siteAddress: string;
  city: string;
  postcode: string;
  contactName: string;
  telephone: string;
  email: string;
  startDate: string;
  endDate: string;
  isRollingContract: boolean;
  equipment: any[];
  clientHasSignature: boolean;
  companyHasSignature: boolean;
  clientPrintName: string;
  companyPrintName: string;
  termsAccepted: boolean;
}): FormField[] => [
  {
    id: "field-clientName",
    label: "Client Name",
    instruction: "Enter the full legal name of the client or company. This will appear on the service agreement and all official documentation.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.clientName.trim().length > 0,
  },
  {
    id: "field-siteAddress",
    label: "Site Address",
    instruction: "Enter the complete address where fire equipment is installed and service will be performed.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.siteAddress.trim().length > 0,
  },
  {
    id: "field-city",
    label: "City",
    instruction: "Enter the city or town name for the service location.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.city.trim().length > 0,
  },
  {
    id: "field-postcode",
    label: "Postcode",
    instruction: "Enter the UK postcode for the service address (e.g., SW1A 1AA).",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.postcode.trim().length > 0,
  },
  {
    id: "field-contactName",
    label: "Contact Person Name",
    instruction: "Enter the name of the primary contact person for this agreement.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.contactName.trim().length > 0,
  },
  {
    id: "field-telephone",
    label: "Telephone",
    instruction: "Enter a contact telephone number including area code.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => formData.telephone.trim().length > 0,
  },
  {
    id: "field-email",
    label: "Email Address",
    instruction: "Enter a valid email address for agreement confirmation and service notifications.",
    section: "Section 1: Client Information",
    required: true,
    validate: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
  },
  {
    id: "field-startDate",
    label: "Contract Start Date",
    instruction: "Select the date when this service agreement becomes effective.",
    section: "Section 2: Contract Details",
    required: true,
    validate: () => formData.startDate.length > 0,
  },
  {
    id: "field-endDate",
    label: "Contract End Date",
    instruction: "Select the contract end date, or enable rolling contract for automatic renewal.",
    section: "Section 2: Contract Details",
    required: false,
    validate: () => formData.isRollingContract || formData.endDate.length > 0,
  },
  {
    id: "equipment-section",
    label: "Equipment Schedule",
    instruction: "Add all fire safety equipment that will be serviced. Select equipment type from dropdown to auto-fill standard prices. Include quantity for each item.",
    section: "Section 3: Equipment Schedule",
    required: true,
    validate: () => formData.equipment.length > 0 && formData.equipment.every(e => e.type),
  },
  {
    id: "field-clientSignature",
    label: "Client Signature",
    instruction: "Draw your signature in the box using mouse or touch. This represents your agreement to the terms and conditions.",
    section: "Section 4: Signatures",
    required: true,
    validate: () => formData.clientHasSignature,
  },
  {
    id: "field-clientPrintName",
    label: "Client Print Name",
    instruction: "Type your full name as it should appear below the signature.",
    section: "Section 4: Signatures",
    required: true,
    validate: () => formData.clientPrintName.trim().length > 0,
  },
  {
    id: "field-companySignature",
    label: "Company Representative Signature",
    instruction: "Core Fire Protection representative should sign here to authorize the agreement.",
    section: "Section 4: Signatures",
    required: true,
    validate: () => formData.companyHasSignature,
  },
  {
    id: "field-companyPrintName",
    label: "Company Representative Name",
    instruction: "Type the full name of the Core Fire Protection representative signing this agreement.",
    section: "Section 4: Signatures",
    required: true,
    validate: () => formData.companyPrintName.trim().length > 0,
  },
  {
    id: "field-termsAccepted",
    label: "Accept Terms & Conditions",
    instruction: "Review and check the box to accept all terms and conditions of this service agreement.",
    section: "Section 5: Terms & Conditions",
    required: true,
    validate: () => formData.termsAccepted,
  },
];

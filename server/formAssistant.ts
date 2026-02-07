import { invokeLLM } from "./_core/llm";

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface FormContext {
  currentSection?: string;
  completedFields?: string[];
  formData?: Record<string, any>;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for Core Fire Protection's service agreement form. Your role is to:

1. Guide users through filling out the fire equipment service agreement form step-by-step
2. Provide suggestions and examples for each field
3. Validate user input and suggest corrections
4. Answer questions about fire safety regulations and equipment types
5. Help users understand what information is needed

The form has 5 main sections:
- Section 1: Equipment Schedule (types, quantities, locations)
- Section 2: Pricing Summary (service fees, VAT, totals)
- Section 3: Agreement Overview (client info, contract details, services)
- Section 4: Signatures (client and company signatures)
- Section 5: Terms & Conditions

Be friendly, professional, and concise. Provide specific examples when helpful. If a user asks about equipment types, mention options like CO2 extinguishers, foam, powder, water mist, etc.`;

export async function getAssistantResponse(
  messages: AssistantMessage[],
  context?: FormContext
): Promise<string> {
  try {
    // Build context-aware system message
    let systemMessage = SYSTEM_PROMPT;
    
    if (context?.currentSection) {
      systemMessage += `\n\nThe user is currently on: ${context.currentSection}`;
    }
    
    if (context?.completedFields && context.completedFields.length > 0) {
      systemMessage += `\n\nCompleted fields: ${context.completedFields.join(", ")}`;
    }

    // Prepare messages for LLM
    const llmMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.content
      }))
    ];

    // Call LLM
    const response = await invokeLLM({
      messages: llmMessages,
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === 'string') {
      return content;
    }
    return "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("[FormAssistant] Error:", error);
    return "I'm having trouble responding right now. Please try again.";
  }
}

export function getFieldGuidance(fieldName: string): string {
  const guidance: Record<string, string> = {
    clientName: "Enter the full legal name of the client organization or business.",
    companyRegistrationNo: "Provide the Companies House registration number if applicable (e.g., 12345678).",
    siteAddress: "Enter the full address where fire equipment is installed and will be serviced.",
    city: "Enter the city or town name.",
    postcode: "Enter the UK postcode (e.g., G51 2RL).",
    contactName: "Full name of the primary contact person at the client organization.",
    position: "Job title or position of the contact person (e.g., Facilities Manager, Safety Officer).",
    telephone: "Contact telephone number including area code (e.g., 0141 433 xxxx).",
    email: "Email address for contract correspondence and notifications.",
    startDate: "The date when the service agreement begins.",
    endDate: "The date when the agreement ends, or select rolling contract for ongoing service.",
    contractDuration: "Total length of the contract (e.g., 12 months, 24 months).",
    serviceFrequency: "How often service visits occur (e.g., annually, quarterly, monthly).",
    paymentTerms: "Payment terms such as 'Net 30 days' or 'Payment on completion'.",
    billingCycle: "How often invoices are issued (e.g., annually, quarterly, monthly).",
  };

  return guidance[fieldName] || "Please fill in this field with accurate information.";
}

# Core Fire Protection - Service Agreement Portal TODO

## Database & Backend
- [x] Design database schema for agreements, equipment, and signatures
- [x] Create tRPC procedures for agreement submission
- [x] Implement signature storage (S3 integration)
- [x] Create admin procedures for viewing agreements
- [x] Add filtering and search capabilities

## Landing Page
- [x] Professional hero section with Core Fire branding
- [x] Features showcase section (6 feature cards)
- [x] Smooth scroll navigation
- [x] Responsive design for mobile/tablet
- [ ] Scroll-to-top button

## Interactive Agreement Form
- [x] Client information section
- [x] Contract details section (dates, duration, frequency)
- [x] Dynamic equipment table with add/remove rows
- [x] Services and requirements textarea
- [x] Real-time pricing calculator with VAT
- [x] Payment schedule radio options
- [x] Terms & Conditions checkbox with hyperlink
- [x] Digital signature canvas (client)
- [x] Digital signature canvas (company representative)
- [x] Form validation
- [x] Print/PDF export functionality

## Admin Dashboard
- [x] Dashboard layout with sidebar navigation
- [x] Agreements list view with table
- [x] Search and filter functionality
- [x] Agreement detail view
- [x] Signature display
- [x] Equipment list display
- [ ] Export capabilities

## Design & Styling
- [x] Dark theme with green/red accents
- [x] Core Fire Protection logo integration
- [ ] Animated background effects
- [x] Hover and transition effects
- [x] Professional typography
- [x] Print-optimized styles

## Testing & Deployment
- [x] Test form submission flow
- [ ] Test signature capture on touch devices
- [x] Test admin dashboard functionality
- [x] Test responsive design
- [x] Create checkpoint for deployment

## Content Matching from Original Agreement
- [x] Add company tagline field "Professional Fire Safety Solutions"
- [x] Update contract reference format to CFP-PFE-XXX
- [x] Add "Annual Maintenance & Inspection Contract" subtitle
- [x] Add site access requirements field
- [x] Add emergency contact information section
- [x] Add service schedule details section
- [x] Add pricing breakdown (service fee, maintenance fee, additional services)
- [x] Add payment terms section with schedule options
- [x] Add cancellation policy section
- [x] Add liability and insurance section
- [x] Add data protection and confidentiality section
- [x] Add dispute resolution section
- [x] Add force majeure clause
- [x] Add compliance badges (BS EN 3, BS 5306-3, BAFE)
- [x] Update signature section with print name and date fields
- [x] Add terms acceptance checkbox with link to T&C document

## Equipment Table Updates
- [x] Change heading from "Equipment Type" to "SERVICE/EQUIPMENT TYPE"
- [x] Add "Attendance Charge" to equipment type dropdown
- [x] Remove "Size / Rating" column
- [x] Remove "Location" column
- [x] Update database schema to remove size and location fields
- [x] Update backend to handle new structure

## Rolling Contract Feature
- [x] Add checkbox/toggle for "Rolling Contract" option
- [x] Make end date field optional when rolling contract is selected
- [x] Update validation to handle rolling contracts
- [x] Update database to store rolling contract flag (uses far future date)
- [x] Update backend to handle rolling contract submissions

## Remedial Work Authorization Options (Section 4)
- [x] Add "Immediate Rectification" checkbox option
- [x] Add "On-Site Authorization" checkbox option
- [x] Add "Defect Quotation" checkbox option
- [x] Add compliance note about breach until certification
- [x] Update database schema to store remedial work preferences
- [x] Update backend to handle remedial work options

## Remove Call-Out Fee Field
- [x] Remove call-out fee input from Section 5
- [x] Update pricing calculations to exclude call-out fee
- [x] Update state variables to remove calloutFee

## Update Subtotal Label
- [x] Change "Equipment Service Subtotal" to "Annual Equipment Service Subtotal"

## Add Company Registration Number Field
- [x] Add "Company Registration No." input field to Section 1
- [x] Add state variable for company registration number
- [x] Update database schema to store registration number
- [x] Update backend to handle registration number
- [x] Update admin dashboard to display registration number

## Add Agreement Overview Section
- [x] Add new section between Section 6 and Section 7
- [x] Add "Client Company Name" field (auto-populated from Section 1)
- [x] Add "Trading Name" field (optional input)
- [x] Add "Full Address" field (auto-populated from Section 1)
- [x] Add "Company No." field (auto-populated from Section 1)
- [x] Add "Registered at" field (optional input)
- [x] Add "Registered Address" field (optional input)
- [x] Add "Site Location" field in Services Provided section (auto-populated from Section 1)
- [x] Add "Duration of Agreement" section with contract terms (auto-populated from Section 2)
- [x] Add "Client Acceptance" section with T&C link
- [x] Style section with red border and dark background matching design

## Restructure Section 1 - Add Proposal Letter
- [x] Remove "Company Registration No." field from Section 1
- [x] Move "Company Registration No." to Agreement Overview section as editable field
- [x] Add "Recipient Name" field to Section 1 (Dear [Recipient Name])
- [x] Add formal proposal letter text with multiple paragraphs
- [x] Add "Customer Company Name" placeholder in letter text (auto-populated)
- [x] Add "Your Name" signature field at bottom of letter
- [x] Add "Core Fire Protection" label under signature
- [x] Update state variables for new fields (recipientName, senderName)

## Apply Visual Editor Changes to Section 1
- [x] Change Section 1 title to "FIRE EQUIPMENT SERVICE AGREEMENT"
- [x] Center Section 1 header (number and title)
- [x] Center proposal letter content box
- [x] Move all client information fields to Agreement Overview section
- [x] Move all contact fields to Agreement Overview section
- [x] Keep only proposal letter in Section 1

## Move Contract Details to Agreement Overview
- [x] Remove Section 2 (Contract Details) entirely
- [x] Move Contract Start Date field to Agreement Overview
- [x] Move Rolling Contract checkbox to Agreement Overview
- [x] Move Contract End Date field to Agreement Overview
- [x] Move Contract Duration dropdown to Agreement Overview
- [x] Move Service Frequency dropdown to Agreement Overview
- [x] Move Payment Terms dropdown to Agreement Overview
- [x] Move Billing Cycle dropdown to Agreement Overview
- [x] Renumber sections: Equipment Schedule becomes Section 2, Pricing becomes Section 3, Terms becomes Section 4, Signatures becomes Section 5

## Renumber Sections and Add Service Scope
- [x] Add new "Service Scope" section between Equipment Schedule and Pricing
- [x] Renumber Equipment Schedule to Section 1
- [x] Renumber Service Scope to Section 2 (new section)
- [x] Renumber Pricing Summary to Section 3
- [x] Renumber Agreement Overview to Section 4
- [x] Renumber Terms & Conditions to Section 5
- [x] Renumber Signatures to Section 6

## Apply Green Neon EXIT Theme
- [x] Upload background image (green neon EXIT signs) to project
- [x] Update theme colors from red to green neon (#00ff00, #00cc00)
- [x] Update CSS variables for primary, destructive, and accent colors
- [x] Apply background image to Agreement page
- [x] Update border colors to green neon theme
- [x] Test theme consistency across all sections

## Update Proposal Letter Layout and Remove Service Scope
- [x] Remove section number badge (1) from FIRE EQUIPMENT SERVICE AGREEMENT header
- [x] Align "Dear" label and "Recipient Name" input horizontally on same line
- [x] Remove Section 2 (Service Scope) entirely
- [x] Renumber Equipment Schedule to Section 1
- [x] Renumber Pricing Summary to Section 2
- [x] Renumber Agreement Overview to Section 3
- [x] Renumber Terms & Conditions to Section 4
- [x] Renumber Signatures to Section 5

## Add PDF Export Functionality
- [x] Install PDF generation library (jsPDF or pdfkit)
- [x] Add Core Fire Protection company logo to project assets
- [x] Create backend tRPC procedure for PDF generation
- [x] Format agreement data for PDF (header with logo, sections, signatures)
- [x] Add "Download as PDF" button to Agreement page (after submission)
- [x] Add "Download PDF" button to Admin dashboard for each agreement
- [x] Style PDF with proper formatting, spacing, and branding
- [x] Test PDF generation with sample agreement data

## Complete Design Overhaul - Futuristic AI/Robotics Theme
- [x] Generate 3D robot mascot imagery for hero sections
- [x] Generate fire safety equipment 3D renders (extinguishers, alarms, EXIT signs)
- [x] Update theme colors to dark teal/cyan (#0a4a4a, #14b8a6, #06b6d4)
- [x] Replace green neon with cyan/teal gradient theme
- [x] Add curved flowing line decorative elements
- [ ] Update typography to modern sans-serif (Inter, Space Grotesk)
- [x] Redesign homepage hero section with 3D robot and large typography
- [x] Add feature cards with icons and hover effects
- [x] Add statistics section with animated numbers
- [ ] Add FAQ section with expandable accordions
- [ ] Add testimonials section with client reviews
- [ ] Redesign agreement form with glassmorphism cards
- [ ] Add floating labels and smooth transitions to form inputs
- [ ] Update admin dashboard with modern card grid layout
- [ ] Add data visualization charts to dashboard
- [ ] Implement smooth scroll animations and transitions

## Replace Agreement Form Header Banner
- [x] Upload new Core Fire Protection branded banner image
- [x] Update Agreement page to use new banner with logo, company name, and contract reference
- [x] Ensure banner is responsive and displays correctly on all screen sizes

## Remove Banner Image from Agreement Form
- [x] Remove banner image from Agreement page header
- [x] Keep CardHeader structure for potential future use

## Create Banner with Ocean Wave Background
- [x] Generate new banner image combining text layout with ocean wave background
- [x] Upload new banner to S3
- [x] Add banner to Agreement page header
- [x] Ensure text is readable over ocean wave background

## Reorder Sections - Move Terms After Signatures
- [x] Move Section 5 (Signatures) to appear before Section 4 (Terms & Conditions)
- [x] Update section numbers: Signatures becomes Section 4, Terms becomes Section 5
- [x] Ensure form flow is: Equipment → Pricing → Agreement Overview → Signatures → Terms

## Add Dedicated PDF Download Button
- [x] Add jsPDF library import to Agreement.tsx
- [x] Create generatePDF function that creates PDF from form data
- [x] Add "Download PDF" button alongside existing Print button
- [x] Include all sections: header, equipment, pricing, agreement overview, signatures
- [x] Test PDF generation with sample data

## Replace Background with Animated Video
- [x] Upload motion graphic video to S3
- [x] Replace static background image with video element
- [x] Configure video to autoplay, loop, and mute
- [x] Ensure video doesn't interfere with form usability
- [x] Test video performance and loading

## Add Logo Watermark Pattern
- [x] Upload Core Fire Protection logo to S3
- [x] Create repeating watermark pattern overlay
- [x] Set watermark opacity to very light (3-5%)
- [x] Ensure watermarks don't interfere with form readability
- [x] Test watermark visibility across different sections

## Enhance PDF Export with Watermark and Complete Content
- [x] Add repeating logo watermark pattern to PDF
- [x] Include Terms & Conditions section in PDF
- [x] Add service items/additional services to PDF
- [x] Improve PDF formatting and layout
- [x] Test PDF with all form sections populated

## Email Delivery System
- [x] Extend database schema to store email delivery status
- [x] Create email template for client confirmation
- [x] Create email template for company notification
- [x] Implement PDF generation for email attachment
- [x] Add email sending functionality after form submission
- [x] Test email delivery with both templates

## Draft Save Functionality
- [x] Extend database schema for draft agreements
- [x] Add "Save Draft" button to agreement form
- [x] Generate unique URLs for draft access
- [x] Implement draft loading from unique URL
- [x] Add draft status indicator to form
- [x] Test draft save and resume workflow

## Admin Dashboard
- [x] Create admin dashboard page with authentication
- [x] Display all submitted agreements in table format
- [x] Add filtering by status, date range, client name
- [x] Implement search functionality
- [x] Add export to CSV/Excel functionality
- [x] Create agreement detail view page
- [x] Add email sending button to admin dashboard
- [ ] Add contract renewal tracking (future enhancement)
- [ ] Implement automated reminder notifications (future enhancement)
- [x] Test all dashboard features

## Client Portal
- [x] Create ClientPortal page component
- [x] Add user authentication check
- [x] Display user's agreements in card grid layout
- [x] Show agreement status badges (active, pending, completed)
- [x] Add agreement details modal/page
- [x] Implement PDF download button for each agreement
- [x] Add search and filter functionality
- [x] Show contract renewal dates and alerts
- [x] Add route to App.tsx for /portal
- [x] Test portal with multiple agreements

## Update Agreement Header
- [x] Upload Core Fire Protection logo to S3
- [x] Increase header height to h-24
- [x] Add logo at top left alignment with h-16 size
- [x] Ensure header is responsive
- [x] Test header appearance

## Equipment Type Dropdown Presets
- [x] Define common fire equipment types with standard prices
- [x] Replace text input with Select dropdown for equipment type
- [x] Auto-fill unit price when equipment type is selected
- [x] Include equipment types: CO2, Foam, Powder, Water Mist, etc.
- [x] Allow custom equipment type entry
- [x] Test preset selection and price auto-fill

## Remove Prices from Equipment Dropdown Display
- [x] Remove price display from dropdown options
- [x] Keep equipment labels only in dropdown
- [x] Maintain auto-fill price functionality
- [x] Test dropdown appearance and auto-fill behavior

## QR Code Generation for Agreements
- [x] Install qrcode library for QR code generation
- [x] Generate unique QR code for each agreement linking to portal
- [x] Display QR code in admin dashboard for each agreement
- [x] Add URL parameter handling in client portal for QR navigation
- [ ] Include QR code in PDF exports (future enhancement)
- [x] Test QR code scanning and portal navigation

## Fix Agreement Submission Error
- [x] Investigate database schema mismatch error
- [x] Review agreements table schema in drizzle/schema.ts
- [x] Check submit procedure in server/routers.ts
- [x] Fix default values and field mappings (handle optional fields as undefined)
- [x] Test agreement submission with all fields

## AI Form Assistant
- [x] Create AI assistant component with chat interface
- [x] Integrate LLM for intelligent field suggestions
- [x] Add step-by-step guidance through form sections
- [x] Implement field validation and error correction
- [x] Add contextual help for each form field
- [x] Create assistant toggle button in agreement form
- [x] Add assistant chat history and conversation state
- [x] Test assistant with various user queries

## Adobe Sign-Style Step-by-Step Pointer
- [x] Remove chat assistant, create guided walkthrough component
- [x] Define ordered list of all form fields with instructions
- [x] Add field highlighting with spotlight effect
- [x] Create instruction tooltip/popover for current field
- [x] Add Next/Previous/Skip navigation buttons
- [x] Implement progress indicator showing X of Y fields
- [x] Add "Start Guided Mode" toggle button in header
- [x] Auto-scroll to current field
- [x] Validate current field before allowing next
- [x] Test complete walkthrough flow

## Keyboard Shortcuts for Guided Mode
- [x] Add keyboard event listener to GuidedWalkthrough component
- [x] Implement Right Arrow (→) or Enter key to advance to next field
- [x] Implement Left Arrow (←) to go to previous field
- [x] Implement Escape key to exit guided mode
- [x] Add visual indicator showing available keyboard shortcuts
- [x] Test keyboard navigation with all fields

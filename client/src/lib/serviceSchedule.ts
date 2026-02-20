/**
 * Core Fire Protection Ltd – Service Schedule
 * All services reviewed against applicable British Standards.
 * Frequencies and pricing sourced from CoreFire_Service_Schedule_Reviewed.xlsx
 */

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  standard: string;
  frequencyType: string;
  visitOptions: string; // e.g. "1", "1 OR 2", "1,2 OR 4", "ONE-OFF", "N/A"
  unitPrice: number | null; // null = TBC
  isOneOff: boolean;
  isReactive: boolean; // reactive/callout – priced per event, not per year
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  services: ServiceItem[];
}

export const SERVICE_SCHEDULE: ServiceCategory[] = [
  {
    id: "fire-detection",
    name: "Fire Detection, Alarm & Warning Systems",
    icon: "bell-ring",
    services: [
      {
        id: "fda-takeover",
        name: "Fire Detection & Alarm System Takeover / Special Inspection",
        description:
          "Review all existing documentation, certificates, drawings, logbooks and commissioning records. Test compliance against employer requirements; document defects and corrective actions.",
        standard: "BS 5839-1:2025",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: 250,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "fda-maintenance",
        name: "Inspection & Maintenance of Fire Detection & Alarm System",
        description:
          "Planned Preventative Maintenance in accordance with BS 5839-1. Includes asset register, defect reports, cause & effect verification, audibility checks, standby capacity and fault monitoring.",
        standard: "BS 5839-1:2025",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: 750,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "disabled-refuge",
        name: "Inspection & Maintenance of Disabled Refuge System",
        description:
          "Planned Preventative Maintenance of outstation network, control equipment, power supplies and fault monitoring.",
        standard: "BS 5839-9:2021",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "voice-alarm",
        name: "Inspection & Maintenance of Voice Alarm System",
        description:
          "Annual and periodic maintenance of voice alarm system. Includes loudspeakers, microphone stations, zone functionality, message clarity, battery standby and fire alarm integration.",
        standard: "BS 5839-8:2023",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "asd-maintenance",
        name: "Aspirating Smoke Detection (ASD) System Maintenance",
        description:
          "Annual maintenance of ASD systems. Includes filter replacement, pipe network inspection, air flow verification, sensitivity testing and detector calibration.",
        standard: "BS 5839-1:2025",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "sprinkler-systems",
    name: "Fire Sprinkler Systems",
    icon: "droplets",
    services: [
      {
        id: "sprinkler-major-pump",
        name: "Sprinkler System: Major Pump Service",
        description:
          "Complete inspection and functional testing of pump assembly including motor/engine, bearings, seals and couplings. Oil/lubrication checks, strainer cleaning, flow test and pressure verification.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: 100,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-minor-pump",
        name: "Sprinkler System: Minor Pump Service",
        description:
          "General inspection of pump and driver. Lubrication check, operational test run, alignment inspection, couplings and gland seals.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-wet",
        name: "Sprinkler System: Wet Systems Service",
        description:
          "Inspection of pipework, valves, gauges and alarms. Hydrostatic pressure test (if required). Alarm and flow switch testing. Drain, clean and refill as necessary.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-dry",
        name: "Sprinkler System: Dry Systems Service",
        description:
          "Inspection of pipework integrity and dry pipe valve functionality. Air compressor and pressure switch testing. Trip test of dry pipe valve.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-foam",
        name: "Sprinkler System: Foam System Service",
        description:
          "Inspection of foam proportioning equipment, valves and piping. Foam concentrate quality and level checks. Discharge and proportioning accuracy testing.",
        standard: "BS EN 13565-2:2009",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-deluge",
        name: "Sprinkler System: Deluge System Service",
        description:
          "Inspection of deluge valve, detection system and nozzles. Functional testing of deluge valve and associated detection. Pipe integrity and drainage checks.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-quarterly",
        name: "Sprinkler System Quarterly Inspection",
        description:
          "Quarterly visual inspection of sprinkler heads, pipework, valves and alarm components. Water supply check and pressure gauge verification.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-flow-test",
        name: "Sprinkler System Annual Flow Test",
        description:
          "Annual full flow test of sprinkler system. Verification of water supply adequacy, pressure and flow rate. Documentation and certification.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "sprinkler-5year",
        name: "Sprinkler System 5-Year Internal Inspection",
        description:
          "Five-yearly internal inspection of pipework for corrosion, scale and blockage. Sprinkler head replacement programme review. Comprehensive system condition report.",
        standard: "BS EN 12845:2015",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "sprinkler-preaction",
        name: "Pre-Action Sprinkler System Maintenance",
        description:
          "Inspection and testing of pre-action valve, detection system, air supply and supervisory devices. Functional test of pre-action valve and associated controls.",
        standard: "BS EN 12845:2015",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "fire-suppression",
    name: "Fire Suppression Systems",
    icon: "flame-kindling",
    services: [
      {
        id: "gas-suppression",
        name: "Inspection & Maintenance of Gas Fire Suppression System",
        description:
          "Six-monthly inspection and annual maintenance of total flooding gas suppression systems. Cylinder weight/pressure checks, nozzle inspection, detection and control panel testing.",
        standard: "ISO 14520 / BS EN 15004",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "watermist-suppression",
        name: "Inspection & Maintenance of Watermist Fire Suppression System",
        description:
          "Inspection of watermist nozzles, pipework, pump unit, control panel and detection interface. Functional test and pressure verification.",
        standard: "BS 8458 / BS 8489",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "kitchen-suppression",
        name: "Kitchen Fire Suppression System Maintenance",
        description:
          "Inspection and maintenance of kitchen hood suppression system. Nozzle check, agent container inspection, fusible link replacement and fuel shut-off valve test.",
        standard: "BS EN 15614",
        frequencyType: "Annual, Bi-Annual & Quarterly",
        visitOptions: "1,2 OR 4",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "co2-suppression",
        name: "CO2 Fire Suppression System Maintenance",
        description:
          "Inspection of CO2 cylinders, manifold, pipework and nozzles. Cylinder weight check, pressure test and detection/control system functional test.",
        standard: "ISO 14520 / BS EN 15004",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "inert-gas-suppression",
        name: "Inert Gas Fire Suppression System Maintenance",
        description:
          "Inspection of inert gas cylinders, pressure gauges, pipework and discharge nozzles. Pressure verification, detection system test and control panel check.",
        standard: "ISO 14520 / BS EN 15004",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fm200-suppression",
        name: "FM-200 / Novec 1230 Clean Agent System Maintenance",
        description:
          "Inspection of clean agent cylinders, actuation devices, nozzles and pipework. Agent quantity verification, detection system test and room integrity assessment.",
        standard: "ISO 14520 / BS EN 15004",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "fixed-infrastructure",
    name: "Fixed Fire Fighting Infrastructure",
    icon: "pipe-valve",
    services: [
      {
        id: "risers",
        name: "Inspection & Maintenance of Dry & Wet Risers",
        description:
          "Inspection and testing of dry and wet riser systems including inlet/outlet valves, landing valves, pressure testing and flow test. Compliance with BS 9990.",
        standard: "BS 9990:2015",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "hydrants",
        name: "Inspection & Maintenance of Fire Hydrants",
        description:
          "Annual inspection and flow testing of underground and surface fire hydrants. Valve operation, outlet condition and flow rate verification.",
        standard: "BS 750:2012",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "hose-reels",
        name: "Fire Hose Reel Inspection & Maintenance",
        description:
          "Annual inspection of hose reel installation including hose condition, reel operation, valve function and water supply adequacy.",
        standard: "BS 5306-1:2006",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "portable-equipment",
    name: "Portable Fire Fighting Equipment",
    icon: "fire-extinguisher",
    services: [
      {
        id: "extinguishers",
        name: "Inspection & Maintenance of Portable Fire Extinguishers",
        description:
          "Annual inspection and service of all portable fire extinguishers. Includes visual inspection, weight/pressure check, safety pin and tamper seal verification, service label and certification.",
        standard: "BS 5306-3:2017",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-blankets",
        name: "Fire Blanket Inspection & Supply",
        description:
          "Annual inspection of fire blankets for condition and compliance. Replacement supply where required.",
        standard: "BS EN 1869:2019",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-signage",
        name: "Fire Safety Signage & Wayfinding",
        description:
          "Supply and installation of fire safety signage including fire action notices, extinguisher identification signs, escape route signs and photoluminescent wayfinding.",
        standard: "BS ISO 7010",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "extinguisher-training",
        name: "Fire Extinguisher Training",
        description:
          "Practical fire extinguisher training for staff. Covers fire types, extinguisher selection, safe operation and evacuation procedures.",
        standard: "BS 5306-3:2017",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "emergency-lighting",
    name: "Emergency Lighting",
    icon: "lightbulb",
    services: [
      {
        id: "emergency-lighting-annual",
        name: "Inspection & Maintenance of Emergency Lighting",
        description:
          "Annual full duration test and inspection of emergency lighting system. Includes lamp replacement, battery testing, luminaire condition check and certification.",
        standard: "BS 5266-1:2023",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "emergency-lighting-6monthly",
        name: "Emergency Lighting 6-Monthly Functional Test",
        description:
          "Six-monthly functional test of emergency lighting as required by BS 5266-1 Cl. 12.4.2. Short duration test of all luminaires and exit signs.",
        standard: "BS 5266-1:2023",
        frequencyType: "Bi-Annual",
        visitOptions: "2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "central-battery",
        name: "Central Battery System Maintenance",
        description:
          "Annual inspection and maintenance of central battery emergency lighting system. Battery condition, charger function, distribution wiring and luminaire testing.",
        standard: "BS 5266-1:2023",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "passive-fire",
    name: "Passive Fire Protection",
    icon: "door-closed",
    services: [
      {
        id: "fire-curtains",
        name: "Fire Curtain Inspection & Maintenance",
        description:
          "Six-monthly inspection and annual maintenance of fire curtains. Includes fabric condition, motor operation, release mechanism, control panel and compliance certification.",
        standard: "BS 8524-1:2013",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: 100,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-doors",
        name: "Fire Door Inspection & Maintenance",
        description:
          "Annual inspection of fire doors including door leaf, frame, intumescent seals, cold smoke seals, ironmongery, closers and signage. Remedial works report.",
        standard: "BS 8214:2016",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-dampers",
        name: "Fire Damper Inspection & Testing",
        description:
          "Annual inspection and drop test of fire dampers. Includes access, blade condition, fusible link check, reset and documentation.",
        standard: "BS 9999:2017",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "smoke-control",
        name: "Smoke Control System Testing",
        description:
          "Six-monthly inspection and testing of smoke control systems including AOVs, pressurisation systems, smoke shafts and associated controls.",
        standard: "BS EN 12101-6",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "fire-safety-management",
    name: "Fire Safety Management & Compliance",
    icon: "clipboard-check",
    services: [
      {
        id: "fire-risk-assessment",
        name: "Fire Risk Assessment",
        description:
          "Comprehensive fire risk assessment in accordance with the Regulatory Reform (Fire Safety) Order 2005. Identifies hazards, evaluates risks and provides prioritised action plan.",
        standard: "RRO 2005 / PAS 79-1:2020",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-strategy",
        name: "Fire Strategy & Design Consultancy",
        description:
          "Fire engineering consultancy for new build or refurbishment projects. Fire strategy document, means of escape design, compartmentation strategy and liaison with building control.",
        standard: "BS 9999:2017",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "compliance-audit",
        name: "Fire Safety Compliance Audit",
        description:
          "Detailed audit of fire safety management arrangements, documentation, training records, maintenance logs and physical fire precautions.",
        standard: "RRO 2005",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "fire-marshal-training",
        name: "Fire Marshal & Fire Warden Training",
        description:
          "Accredited fire marshal and fire warden training. Covers fire prevention, evacuation procedures, use of extinguishers and responsibilities under fire safety legislation.",
        standard: "RRO 2005",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "evacuation-drill",
        name: "Fire Evacuation Drill & Planning",
        description:
          "Facilitation of fire evacuation drill. Pre-drill briefing, drill observation, post-drill debrief and written report with recommendations.",
        standard: "RRO 2005",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "intruder-security",
    name: "Intruder Alarm & Security Systems",
    icon: "shield-alert",
    services: [
      {
        id: "intruder-takeover",
        name: "Intruder Alarm System Takeover / Special Inspection",
        description:
          "Review of existing intruder alarm system documentation, certificates and commissioning records. Test compliance against current standards; document defects.",
        standard: "PD 6662 / EN 50131",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "intruder-maintenance",
        name: "Inspection & Maintenance of Intruder Detection & Alarm System",
        description:
          "Planned Preventative Maintenance of intruder alarm system. Detector testing, control panel check, battery condition, communication path test and certification.",
        standard: "PD 6662 / EN 50131",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "alarm-monitoring",
        name: "Fire & Intruder Alarm Monitoring",
        description:
          "24/7 alarm receiving centre (ARC) monitoring of fire and intruder alarm signals. Police and fire service URN registration and key holder notification.",
        standard: "BS 5979:2007",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "intruder-design",
        name: "Intruder Alarm System Design",
        description:
          "Site survey and design of intruder alarm system to meet insurance and police requirements. Risk assessment, system specification and installation drawings.",
        standard: "PD 6662 / EN 50131",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "intruder-upgrade",
        name: "Intruder Alarm System Upgrade",
        description:
          "Upgrade of existing intruder alarm system to current standards. Panel replacement, detector upgrade, communication module installation and re-commissioning.",
        standard: "PD 6662 / EN 50131",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "perimeter-detection",
        name: "Perimeter Intruder Detection System Installation",
        description:
          "Supply and installation of perimeter intruder detection system. Includes fence-mounted sensors, buried cable, microwave or active infrared barriers.",
        standard: "EN 50131",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
    ],
  },
  {
    id: "cctv-surveillance",
    name: "CCTV & Surveillance Systems",
    icon: "cctv",
    services: [
      {
        id: "cctv-maintenance",
        name: "Inspection & Maintenance of CCTV System",
        description:
          "Six-monthly inspection and annual maintenance of CCTV system. Camera alignment, image quality check, recording system verification, storage capacity and cabling inspection.",
        standard: "BS EN 62676",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "cctv-design",
        name: "CCTV System Design",
        description:
          "Site survey and design of CCTV system. Camera placement, field of view analysis, lighting assessment, recording and storage specification.",
        standard: "BS EN 62676",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "cctv-4k-upgrade",
        name: "CCTV System Upgrade to 4K",
        description:
          "Upgrade of existing CCTV system to 4K resolution. Camera replacement, NVR/DVR upgrade, cabling assessment and recommissioning.",
        standard: "BS EN 62676",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "cctv-analytics",
        name: "CCTV Analytics & AI Integration",
        description:
          "Integration of AI-powered video analytics including facial recognition, crowd detection, object detection and behaviour analysis.",
        standard: "BS EN 62676",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "anpr",
        name: "Automatic Number Plate Recognition (ANPR) System Installation",
        description:
          "Supply and installation of ANPR system for vehicle access control and monitoring. Camera installation, software configuration and integration with access control.",
        standard: "BS EN 62676",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
    ],
  },
  {
    id: "access-control",
    name: "Access Control & Life Safety Systems",
    icon: "key-round",
    services: [
      {
        id: "access-control-maintenance",
        name: "Inspection & Maintenance of Access Control System",
        description:
          "Six-monthly inspection and annual maintenance of access control system. Reader testing, door hardware check, controller verification, database audit and certification.",
        standard: "BS EN 60839-11",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "disabled-call-system",
        name: "Inspection & Maintenance of Disabled Persons Call System",
        description:
          "Annual inspection and maintenance of disabled persons call system. Pull cord testing, call point operation, indicator panel check and battery condition.",
        standard: "BS 8300:2018",
        frequencyType: "Annual, Bi-Annual",
        visitOptions: "1 OR 2",
        unitPrice: null,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "disabled-toilet-alarm",
        name: "Inspection & Maintenance of Disabled Toilet Alarm",
        description:
          "Annual inspection of disabled toilet alarm. Pull cord, reset button, indicator light and audible/visual alert testing.",
        standard: "BS 8300:2018",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: 100,
        isOneOff: false,
        isReactive: false,
      },
      {
        id: "access-design",
        name: "Access Control System Design",
        description:
          "Site survey and design of access control system. Door schedule, reader specification, controller design and integration with fire alarm for door release.",
        standard: "BS EN 60839-11",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "mobile-access",
        name: "Mobile Access Control System Installation",
        description:
          "Supply and installation of mobile/smartphone-based access control system. App configuration, credential provisioning and system commissioning.",
        standard: "BS EN 60839-11",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "visitor-management",
        name: "Visitor Management System",
        description:
          "Supply and installation of visitor management system. Kiosk or tablet-based sign-in, badge printing, host notification and visitor tracking.",
        standard: "N/A",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "time-attendance",
        name: "Time & Attendance System",
        description:
          "Supply and installation of time and attendance system integrated with access control. Clocking terminals, software configuration and payroll export.",
        standard: "N/A",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "security-fencing",
        name: "Security Fencing & Gates",
        description:
          "Supply and installation of security fencing and automated gates. Includes electric gate operators, safety devices, intercom and access control integration.",
        standard: "BS EN 13241",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
    ],
  },
  {
    id: "remote-monitoring",
    name: "Remote Services & Monitoring",
    icon: "radio",
    services: [
      {
        id: "arc-takeover",
        name: "Initial ARC Takeover & Setup (incl. Police & Fire Connection)",
        description:
          "Initial setup and takeover of alarm receiving centre monitoring. Includes police and fire service URN registration, key holder database setup and signal path testing.",
        standard: "BS 5979:2007",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "remote-controls",
        name: "Remote Diagnostics – Operator Controls System",
        description:
          "Remote operator intervention to control fire alarm system. Includes remote access, system control and event logging.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 32.5,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "remote-silence",
        name: "Remote Diagnostics – Operator Silences Fire Alarm",
        description:
          "Remote operator intervention to silence fire alarm activation. Includes remote access, silence command and event logging.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 32.5,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "remote-reset-code",
        name: "Remote Diagnostics – Operator Generates Reset Code",
        description:
          "Remote generation of system reset code for authorised personnel. Includes identity verification and event logging.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 25,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "remote-telephone",
        name: "Remote Diagnostics – Engineer Telephone Advice",
        description:
          "Remote engineer telephone support for fire and security system faults. Includes fault diagnosis, guidance and event logging.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 32.5,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "lone-worker",
        name: "Lone Worker Protection System",
        description:
          "Supply and configuration of lone worker protection system. GPS tracking, check-in alerts, man-down detection and 24/7 monitoring centre connection.",
        standard: "BS 8484:2022",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "bms-integration",
        name: "Building Management System (BMS) Integration",
        description:
          "Integration of fire and security systems with building management system. Protocol mapping, gateway configuration and unified monitoring dashboard.",
        standard: "BS 7273",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "nimbus-monitoring",
        name: "Nimbus Fire Alarm Remote Management & Monitoring",
        description:
          "Annual subscription to Nimbus remote fire alarm management and monitoring platform. Real-time event monitoring, remote diagnostics and compliance reporting.",
        standard: "BS 5839-1:2025",
        frequencyType: "Annual",
        visitOptions: "1",
        unitPrice: 100,
        isOneOff: false,
        isReactive: false,
      },
    ],
  },
  {
    id: "reactive-callout",
    name: "Reactive & Emergency Callout Services",
    icon: "siren",
    services: [
      {
        id: "emergency-callout",
        name: "Emergency Callout – 24/7 365 Days (Out of Hours)",
        description:
          "Emergency attendance charge for out-of-hours callout. Covers engineer mobilisation and travel to site. Engineer time on-site charged separately.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 195,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "engineer-time-emergency",
        name: "Engineer Time On-Site (Emergency – Per Hour)",
        description:
          "Hourly rate for engineer time on-site during emergency callout. Charged in addition to the emergency attendance charge.",
        standard: "N/A",
        frequencyType: "Per Hour",
        visitOptions: "N/A",
        unitPrice: 140,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "adhoc-attendance",
        name: "Planned Ad Hoc Service – Attendance Charge",
        description:
          "Attendance charge for planned ad hoc service visits outside of contract. Covers engineer mobilisation and travel to site.",
        standard: "N/A",
        frequencyType: "Per Event",
        visitOptions: "N/A",
        unitPrice: 150,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "engineer-time-adhoc",
        name: "Engineer Time On-Site (Ad Hoc – Per Hour)",
        description:
          "Hourly rate for engineer time on-site during planned ad hoc service visits. Charged in addition to the attendance charge.",
        standard: "N/A",
        frequencyType: "Per Hour",
        visitOptions: "N/A",
        unitPrice: 95,
        isOneOff: false,
        isReactive: true,
      },
      {
        id: "out-of-hours-maintenance",
        name: "Out of Hours Maintenance & Repairs",
        description:
          "Scheduled maintenance and repair works conducted outside normal business hours to minimise operational disruption.",
        standard: "Various",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
    ],
  },
  {
    id: "professional-services",
    name: "Professional & Design Services",
    icon: "drafting-compass",
    services: [
      {
        id: "system-integration",
        name: "Fire & Security System Integration",
        description:
          "Integration of fire alarm, intruder alarm, CCTV and access control. Unified control platform, cross-system automation, consolidated reporting and single-point monitoring.",
        standard: "BS 7273",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "system-documentation",
        name: "System Documentation & As-Built Drawings",
        description:
          "Comprehensive system documentation including as-built drawings, O&M manuals, test certificates, commissioning records and handover documentation.",
        standard: "BS 5839-1 / BS EN 12845",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "cybersecurity-assessment",
        name: "Cybersecurity Assessment for Fire & Security Systems",
        description:
          "Cybersecurity assessment and hardening of networked fire and security systems. Vulnerability scanning, network segmentation, password policy, firmware updates and recommendations.",
        standard: "IEC 62443",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
      {
        id: "decommissioning",
        name: "System Decommissioning & Removal",
        description:
          "Safe decommissioning and removal of redundant fire and security systems. Isolation, disconnection, equipment removal, making good and disposal/recycling.",
        standard: "BS 7671",
        frequencyType: "One-Off",
        visitOptions: "ONE-OFF",
        unitPrice: null,
        isOneOff: true,
        isReactive: false,
      },
    ],
  },
];

/**
 * Get all service items as a flat list
 */
export function getAllServices(): ServiceItem[] {
  return SERVICE_SCHEDULE.flatMap((cat) => cat.services);
}

/**
 * Get a service item by ID
 */
export function getServiceById(id: string): ServiceItem | undefined {
  return getAllServices().find((s) => s.id === id);
}

/**
 * Get visit count options for a service
 */
export function getVisitOptions(visitOptions: string): number[] {
  if (visitOptions === "ONE-OFF" || visitOptions === "N/A") return [];
  if (visitOptions === "1") return [1];
  if (visitOptions === "1 OR 2") return [1, 2];
  if (visitOptions === "1,2 OR 4") return [1, 2, 4];
  if (visitOptions === "2") return [2];
  if (visitOptions === "12") return [12];
  return [1];
}

/**
 * Get frequency label for visit count
 */
export function getFrequencyLabel(visits: number): string {
  switch (visits) {
    case 1: return "Annual";
    case 2: return "Bi-Annual (6-monthly)";
    case 4: return "Quarterly";
    case 12: return "Monthly";
    default: return `${visits}x per year`;
  }
}

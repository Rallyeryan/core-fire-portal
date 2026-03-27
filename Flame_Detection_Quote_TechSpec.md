# Fire Alarm System Modification: Quote and Technical Specification

**Project:** Addition of Flame Detection for Robotic Machine  
**Environment:** Steel Frame Building (Ground and 1st Floor Operational Areas)  
**Standard Compliance:** BS 5839-1:2025  
**Date:** March 27, 2026  
**Prepared by:** Core Fire Protection Engineering Team

---

## 1. Executive Summary

This document outlines the comprehensive technical specification and commercial quotation for the modification of the existing fire alarm system at your facility. The primary objective of this modification is to introduce specialized, high-speed visual flame detection specifically designed to protect the robotic machine located within the steel-framed building. 

Given the operational nature of the ground and first-floor areas, the proposed solution integrates the highly advanced **Micropack FDS300 Intelligent Visual Flame Detector** with the existing infrastructure using **EMS FireCell wireless technology**. This hybrid approach ensures rapid response to fire events, high reliability in industrial environments, minimal disruption during installation, and strict compliance with the latest BS 5839-1:2025 standards [1].

---

## 2. Technical Specification & System Architecture

### 2.1 System Design Overview
The system modification leverages a hybrid architecture, combining robust hardwired power and detection for the high-risk robotic area with seamless wireless integration into the main fire alarm control panel. 

1. **Primary Flame Detection:** The core of the protection strategy is the **Micropack FDS300 Intelligent Visual Flame Detector**. It utilizes intelligent visual flame detection (iVFD) algorithms to process live video, ensuring maximum false alarm immunity even in the presence of modulated sunlight, arc welding, or black body heat [2]. It provides an expansive 120° horizontal by 80° vertical field of view, ensuring comprehensive coverage of the robotic machine from a single vantage point.
2. **Wireless Integration:** To minimize cabling and operational disruption within the facility, **EMS FireCell Wireless Dual Input and Output (I/O) units (FC-610-001)** will be utilized. These units will interface the FDS300's hardwired alarm and fault relays directly into the existing wireless fire alarm network.
3. **Supplementary Area Detection:** **EMS FireCell Wireless Multisensor Detectors (FCX-174-001)** and an **Optical Smoke Detector (FCX-177-001)** will be strategically placed across the ground and 1st-floor areas. This provides general area protection, complementing the point-specific flame detection of the robotic cell.
4. **Manual Intervention:** Additional **EMS FireCell Wireless Manual Call Points (FC-200-003)** will be installed at key egress routes within the operational areas.
5. **Audible and Visual Alarms:** **EMS FireCell Wireless Visual Sounder & Detector Bases (FCX-191-200)** will ensure that any activation provides clear, unambiguous audible and visual warnings throughout the potentially noisy operational environment.

### 2.2 Equipment Specifications

| Component | Description | Key Technical Features |
| :--- | :--- | :--- |
| **Micropack FDS300** | Intelligent Visual Flame Detector | 120°x80° FOV, <7s response time, IP66 / NEMA 4X, Explosion proof (Copper free aluminum/316 SS), -60°C to +85°C operating temp, FM 3260 certified [2]. |
| **NORD 24V 3A PSU** | Weatherproof Power Supply | IP65 rated, built-in battery charging, fault relay, LED indication. Provides dedicated 24Vdc power to the FDS300. |
| **FC-610-001** | EMS FireCell Wireless Dual I/O | Integrates hardwired relays into the wireless network. Powered by 6x AA batteries. |
| **FCX-174-001** | EMS FireCell Multisensor Detector | Combines heat and smoke detection for general area coverage, reducing false alarms. |
| **FCX-177-001** | EMS FireCell Optical Smoke Detector | Provides early warning for smouldering fires in designated safe zones. |
| **FC-200-003** | EMS FireCell Wireless Call Point | Apollo front, transparent protective cover, wireless transmission. |
| **FCX-191-200** | EMS FireCell Visual Sounder Base | Red visual indicator combined with high-output sounder. |

---

## 3. BS 5839-1:2025 Compliance Statement

This system modification has been designed in strict accordance with the **BS 5839-1:2025 Code of Practice** [1]. Key compliance areas include:

- **Clause 21.7 (Siting of Flame Detectors):** The FDS300 will be positioned to maintain a clear, unobstructed line of sight to the robotic machine hazard at all times. Spacing and coverage are within the manufacturer's maximum limits.
- **Clause 19 (Manual Call Points):** Call points will be distributed such that no person needs to travel more than 45m to reach the nearest manual call point. They will be fixed at a height of 1.4m (+0.2m/-0.3m) above finished floor level.
- **Clause 46 (Modifications):** The integration will be fully tested to ensure no adverse effects on the existing system. This includes testing at least one other device on the modified circuit and validating any cause-and-effect programming changes. An extensions/modifications certificate will be issued upon completion.
- **Section 3 (Limitation of False Alarms):** The industrial steel-frame environment presents unique challenges. The FDS300's iVFD technology and the use of multisensor detectors are specifically chosen to mitigate false alarms caused by environmental factors, complying with the requirement to minimize unwanted fire alarm signals.
- **Clause 26 (Radio-Linked Systems):** All EMS FireCell components comply with BS EN 54-25. A comprehensive radio survey will be conducted prior to installation to ensure adequate signal strength in the steel-framed environment.

---

## 4. Method Statement and Commissioning Plan

### 4.1 Pre-Installation
1. **Radio Survey:** Conduct a full radio signal strength survey across the ground and 1st floor to verify EMS FireCell communication paths within the steel structure.
2. **Risk Assessment:** Complete site-specific RAMS (Risk Assessment and Method Statement), particularly focusing on working at height and near the robotic machinery.

### 4.2 Installation
1. **Power Supply:** Install the NORD IP65 24V PSU in a safe, accessible location. Run standard fire-resisting cable to the FDS300 location.
2. **Flame Detector:** Mount the Micropack FDS300 using the appropriate mounting bracket, ensuring the 120°x80° FOV perfectly covers the robotic cell.
3. **Wireless Devices:** Install the FC-610-001 Dual I/O unit adjacent to the FDS300/PSU. Mount all wireless bases, sounders, call points, and multisensors in their designated locations.
4. **Integration:** Wire the FDS300 alarm and fault relays into the FC-610-001 inputs.

### 4.3 Commissioning
1. **Device Enrollment:** Log all new wireless devices onto the existing EMS FireCell Hub/Control Panel.
2. **Functional Testing:** Perform a simulated flame test using the manufacturer-approved flame simulator (FS301) to verify FDS300 activation and subsequent wireless transmission.
3. **Cause and Effect:** Verify that the activation triggers the correct evacuation or alert protocols as per the building's fire strategy.
4. **Handover:** Provide updated zone plans, logbook entries, and the BS 5839-1:2025 Modification Certificate.

---

## 5. Commercial Quotation

### 5.1 Parts & Materials

| Part Code | Description | Qty | Unit Price (£) | Total Price (£) |
| :--- | :--- | :--- | :--- | :--- |
| NORD FDS300 | Intelligent Visual Flame Detector | 1.00 | 1,850.00* | 1,850.00* |
| FC-610-001 | EMS FireCell Wireless Dual Input and Output | 2.00 | 224.70 | 449.40 |
| NORD IP65 24V | Weatherproof PSU C.W Battery Charging | 1.00 | 145.00* | 145.00* |
| FC-200-003 | EMS Firecell Wireless Manual Call Point | 2.00 | 155.15 | 310.30 |
| FCX-191-200 | EMS FireCell Visual Sounder & Detector Base | 2.00 | 286.75 | 573.50 |
| FCX-174-001 | EMS FireCell Wireless Multisensor Detector | 2.00 | 48.15 | 96.30 |
| FCX-170-001 | FireCell Wireless Detector Base Only | 2.00 | 131.50 | 263.00 |
| FCX-177-001 | EMS FireCell Optical Smoke Detector Only | 1.00 | 37.45 | 37.45 |
| **Subtotal (Materials)** | | | | **£3,724.95** |

*\*Note: NORD and Micropack pricing are estimated based on standard trade rates. Final pricing subject to supplier confirmation.*

### 5.2 Labour & Commissioning

| Description | Hours/Days | Rate (£) | Total Price (£) |
| :--- | :--- | :--- | :--- |
| **Pre-Installation Radio Survey** | 0.5 Days | 450.00/day | 225.00 |
| **Mechanical & Electrical Installation** (2 Engineers) | 2.0 Days | 750.00/day | 1,500.00 |
| **System Commissioning & Certification** | 1.0 Days | 550.00/day | 550.00 |
| **Subtotal (Labour)** | | | **£2,275.00** |

### 5.3 Quotation Summary

| Item | Amount (£) |
| :--- | :--- |
| Total Materials | 3,724.95 |
| Total Labour | 2,275.00 |
| **Total Project Cost (Excl. VAT)** | **£5,999.95** |

*Validity: This quotation is valid for 30 days from the date of issue.*

---

## References
[1] BSI, *BS 5839-1:2025 Fire detection and fire alarm systems for buildings - Part 1: Code of practice*.
[2] Micropack, *FDS300 Intelligent Visual Flame Detector Data Sheet (Doc Ref: 2401.6001 Rev 2.8)*.

# ATO + RPOC Submission Package — Master Index

## Secure Runtime Environment (SRE) Platform

> **This is the master checklist for the complete ATO and RAISE 2.0 RPOC submission package.**
> Documents marked with a human icon require manual action that cannot be automated.

---

## Package Status Summary

| Category | Documents | Ready | Needs Human |
|----------|-----------|-------|-------------|
| Core ATO Documents | 3 | 2 | 1 |
| Supporting Documents | 11 | 9 | 2 |
| RAISE RPOC Documents | 4 | 3 | 1 |
| App Owner Templates | 5 | 5 | 0 |
| Quarterly Review Templates | 7 | 7 | 0 |
| **TOTAL** | **30** | **26** | **4** |

---

## THINGS ONLY A HUMAN CAN DO

These items cannot be completed by automation. They require real people, real signatures, and real government systems.

### 1. GET eMASSS ACCESS AND REGISTER THE SYSTEM
- **Who:** ISSM or designated IAM
- **What:** Log into NISP eMASS (https://emass-nisp.csd.disa.mil/) with CAC, create system registration using the pre-filled data in `emass-registration-guide.md`
- **Why:** eMASS requires CAC authentication and is the official DoD system of record
- **Guide:** `emass-registration-guide.md` has every field pre-filled — just copy-paste

### 2. GET THE SCA TO ASSESS YOUR CONTROLS
- **Who:** Security Controls Assessor (independent — cannot be your own team)
- **What:** SCA independently evaluates each NIST 800-53 control, produces the Security Assessment Report (SAR)
- **Why:** DoD requires independent assessment — you cannot self-assess
- **Output:** SAR document (SCA creates this, not you)
- **Timeline:** Allow 8-12 weeks for assessment

### 3. GET THE AO TO SIGN THE ATO
- **Who:** Authorizing Official
- **What:** AO reviews SSP + SAR + POA&M and makes risk-based authorization decision
- **Why:** Only the AO has authority to grant ATO
- **Prerequisite:** SCA assessment must be complete, POA&M must address all findings

### 4. SIGN THE DOCUMENTS
- **Who:** System Owner, ISSM, AO (various documents need various signatures)
- **What:** Physical or digital signatures on:
  - CI/CD Tools Certification (System Owner + ISSM + TA)
  - SLA templates (RPOC Owner + App Owner for each tenant)
  - Rules of Behavior (each user)
  - ATO authorization letter (AO)

### 5. REGISTER IN DITPR AND PPSM
- **Who:** ISSM or designated personnel
- **What:** Register system in DITPR (https://ditpr.dod.mil), register all ports/protocols in PPSM (https://cyber.mil/connect/ppsm/)
- **Why:** Required for DoD system tracking and network authorization

### 6. FILL IN ORGANIZATION-SPECIFIC DETAILS
- **Who:** ISSM / System Owner
- **What:** Replace all `_[PLACEHOLDER]_` fields in documents with real names, dates, org info
- **Every document has placeholders marked clearly**

---

## COMPLETE DOCUMENT INVENTORY

### Core ATO Documents (The "Big Three")

| # | Document | File | Status | Notes |
|---|----------|------|--------|-------|
| 1 | **System Security Plan (SSP)** | `emass-registration-guide.md` + eMASS entries | READY (content) | SSP is built IN eMASS. Control descriptions are in the ATO Controls Tracker. Copy each into eMASS. |
| 2 | **Security Assessment Report (SAR)** | _SCA produces this_ | HUMAN REQUIRED | You cannot create this — the independent SCA creates it after assessing your controls. |
| 3 | **Plan of Action & Milestones (POA&M)** | `poam-template.md` | READY | Fill in after SCA assessment identifies findings. |

### Supporting Documents

| # | Document | File | Status | Notes |
|---|----------|------|--------|-------|
| 4 | **Risk Assessment Report** | `risk-assessment-report.md` | READY | 15+ risks identified with mitigations. Fill in org details. |
| 5 | **Authorization Boundary** | `authorization-boundary.md` | READY | Full boundary definition, data flows, PPSM table, HW inventory. Fill in node specs. |
| 6 | **Hardware/Software Inventory** | `quarterly-review/QREV-1-security-plan.md` | READY | All 16 platform components + CI/CD tools with versions. |
| 7 | **PPSM Registration** | `authorization-boundary.md` (Section 2.5) | READY (data) | Ports/protocols listed — must be registered in PPSM by human. |
| 8 | **Contingency Plan** | `contingency-plan.md` | READY | RTO/RPO, backup strategy, 4 recovery scenarios, test schedule. |
| 9 | **Incident Response Plan** | `incident-response-plan.md` | READY | NIST 800-61 format, 5 playbooks, severity levels, escalation chain. |
| 10 | **Configuration Management Plan** | `configuration-management-plan.md` | READY | GitOps CM strategy, change control, patch management, baselines. |
| 11 | **Continuous Monitoring Plan** | `continuous-monitoring-plan.md` | READY | ISCM per NIST 800-137, monitoring sources, metrics, dashboards. |
| 12 | **Privacy Impact Assessment** | `quarterly-review/QREV-3-privacy-impact-assessment.md` | READY | Platform-level PIA (SRE doesn't collect PII). |
| 13 | **Security Categorization** | `security-categorization.md` | READY | FIPS 199 Moderate-Moderate-Moderate with justification. |
| 14 | **Rules of Behavior** | `rules-of-behavior.md` | READY | User acknowledgment form. Each user must sign. |

### RAISE 2.0 RPOC Documents

| # | Document | File | Status | Notes |
|---|----------|------|--------|-------|
| 15 | **CI/CD Tools Certification** | `cicd-tools-certification-submission.md` | READY | Formal memo for TA. Fill in org details, print, sign, submit. |
| 16 | **Service Level Agreement** | `sla-template.md` | READY | One per tenant. Fill in app-specific details, get signatures. |
| 17 | **eMASS Registration Guide** | `emass-registration-guide.md` | READY | Step-by-step with pre-filled fields. Human must enter into eMASS. |
| 18 | **RAISE Compliance Overview** | `README.md` | READY | Directory overview and process map. |

### App Owner Package (Templates — Ready for Tenants)

| # | Document | File | Status |
|---|----------|------|--------|
| 19 | Vulnerability Management Plan | `app-owner-package/vulnerability-management-plan-template.md` | READY |
| 20 | Mitigation Statement Template | `app-owner-package/mitigation-statement-template.md` | READY |
| 21 | App STIG Checklist | `app-owner-package/app-stig-checklist-template.md` | READY |
| 22 | Changelog Template | `app-owner-package/changelog-template.md` | READY |
| 23 | Application Architecture Template | `app-owner-package/application-architecture-template.md` | READY |

### Quarterly Review Templates (QREV 1-7)

| # | Document | File | Status |
|---|----------|------|--------|
| 24 | Security Plan | `quarterly-review/QREV-1-security-plan.md` | READY |
| 25 | Security Assessment Plan | `quarterly-review/QREV-2-security-assessment-plan.md` | READY |
| 26 | Privacy Impact Assessment | `quarterly-review/QREV-3-privacy-impact-assessment.md` | READY |
| 27 | POA&M Summary | `quarterly-review/QREV-4-poam.md` | READY |
| 28 | Application Report | `quarterly-review/QREV-5-application-report.md` | READY |
| 29 | Vulnerability Report | `quarterly-review/QREV-6-vulnerability-report.md` | READY |
| 30 | Deployment Artifacts | `quarterly-review/QREV-7-deployment-artifacts.md` | READY |

---

## INTERACTIVE TOOLS

These HTML pages help you navigate the process and track progress:

| Page | File | Purpose |
|------|------|---------|
| RAISE 2.0 Tracker | `raise-tracker.html` | Track all 51 RAISE requirements (24 RPOC + 8 Gates + 19 APPO) |
| RAISE 2.0 Walkthrough Guide | `raise-guide.html` | Step-by-step guide through the DSOP → RPOC journey |
| Pipeline Dashboard | `pipeline-dashboard.html` | Visual CI/CD security gate pipeline with simulations |
| ATO Controls Tracker | `ato-controls-tracker.html` | All ~325 NIST 800-53 Moderate controls with status tracking |
| eMASS Guide | `emass-guide.html` | Interactive eMASS registration walkthrough |
| CI/CD Certification | `cicd-certification.html` | Interactive + printable TA submission package |

---

## SUBMISSION ORDER

### Phase 1: Prepare (Do These First)
1. Fill in all placeholder fields across all documents (org name, ISSM, dates)
2. Register in DITPR → get DITPR ID
3. Register in eMASS → get eMASS ID (use `emass-registration-guide.md`)
4. Register ports in PPSM (use `authorization-boundary.md` Section 2.5)
5. Upload SSP control descriptions to eMASS (use ATO Controls Tracker)

### Phase 2: Submit CI/CD Certification to TA
1. Print `cicd-tools-certification-submission.md`
2. Sign it (System Owner + ISSM)
3. Run a demo pipeline with sample app to generate evidence artifacts
4. Submit to Technical Authority with evidence package

### Phase 3: Request SCA Assessment
1. Package: SSP (in eMASS), RAR, POA&M, all supporting docs
2. Submit to SCA for independent assessment
3. Allow 8-12 weeks
4. SCA produces SAR

### Phase 4: Remediate and Request ATO
1. Address SAR findings → update POA&M
2. Present to AO: SSP + SAR + POA&M + all supporting docs
3. AO issues ATO (or IATT, or DATO)

### Phase 5: RPOC Designation
1. With ATO in hand, request RPOC designation from AO
2. Mark inheritable controls in eMASS
3. Begin onboarding applications with signed SLAs
4. Schedule first quarterly review

---

## DIRECTORY STRUCTURE

```
compliance/raise/
├── ATO-PACKAGE-INDEX.md                    ◄── YOU ARE HERE
├── README.md                               Overview and process map
├── emass-registration-guide.md             eMASS registration step-by-step
├── security-categorization.md              FIPS 199 M-M-M
├── authorization-boundary.md               System boundary + data flows + PPSM
├── risk-assessment-report.md               Risk assessment (NIST 800-30)
├── incident-response-plan.md               IR plan (NIST 800-61)
├── contingency-plan.md                     DR/BCP (NIST 800-34)
├── configuration-management-plan.md        CM plan (NIST 800-128)
├── continuous-monitoring-plan.md           ISCM plan (NIST 800-137)
├── rules-of-behavior.md                    User acknowledgment
├── poam-template.md                        POA&M tracking
├── sla-template.md                         RPOC ↔ App Owner SLA
├── cicd-tools-certification.md             CI/CD cert (original)
├── cicd-tools-certification-submission.md  CI/CD cert (formal memo)
├── quarterly-review/
│   ├── QREV-1-security-plan.md
│   ├── QREV-2-security-assessment-plan.md
│   ├── QREV-3-privacy-impact-assessment.md
│   ├── QREV-4-poam.md
│   ├── QREV-5-application-report.md
│   ├── QREV-6-vulnerability-report.md
│   └── QREV-7-deployment-artifacts.md
└── app-owner-package/
    ├── vulnerability-management-plan-template.md
    ├── mitigation-statement-template.md
    ├── app-stig-checklist-template.md
    ├── changelog-template.md
    └── application-architecture-template.md
```

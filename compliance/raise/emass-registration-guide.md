# eMASS Registration & RMF Package Guide

## For RAISE 2.0 RPOC Designation — Secure Runtime Environment

> This guide walks you through registering the SRE platform in eMASS and building
> the RMF authorization package required for RPOC designation and ATO.

---

## Table of Contents

1. [Prerequisites — Before You Start](#1-prerequisites)
2. [The 7 RMF Steps](#2-the-7-rmf-steps)
3. [eMASS Registration — Step by Step](#3-emass-registration)
4. [ATO Package — Required Documents](#4-ato-package)
5. [Control Inheritance — Reducing Your Workload](#5-control-inheritance)
6. [eMASS Control Validation](#6-emass-control-validation)
7. [Automation — SAF CLI & eMASS API](#7-automation)
8. [Timeline & Cost Expectations](#8-timeline)
9. [Practitioner Tips](#9-tips)
10. [Reference Documents](#10-references)

---

## 1. Prerequisites

### eMASS Account Access

Before you can register a system, you need an eMASS account:

| Requirement | Details |
|-------------|---------|
| **CAC/PKI** | DoD PKI certificate on ECA medium or Common Access Card (CAC) |
| **Training** | Complete the DoD Cyber Awareness Challenge |
| **eMASS URL** | NISP: https://emass-nisp.csd.disa.mil/ (CAC required) |
| **Role** | IAM (Information Assurance Manager) role for system registration |
| **CAGE Code** | Your organization must have an assigned CAGE code under DCSA |
| **Account Guide** | [NISP eMASS User Account Request Guide v3](https://www.dcsa.mil/Portals/128/Documents/CTP/tools/NISP%20eMASS%20User%20Account%20Request%20Guide%20Version%203.pdf) |

> **IMPORTANT**: Getting eMASS access can take weeks. Start this process immediately.

### Key Personnel Required

Identify these people before starting — their names go into eMASS registration:

| Role | Responsibility |
|------|---------------|
| **System Owner** | Ultimately responsible for the system's security posture |
| **ISSM** | Information Systems Security Manager — manages the RMF package |
| **ISSO** | Information Systems Security Officer — day-to-day security operations |
| **AO** | Authorizing Official — makes the risk-based ATO decision |
| **SCA** | Security Controls Assessor — independently evaluates controls |

---

## 2. The 7 RMF Steps (NIST 800-37 Rev 2)

The Risk Management Framework is a 7-step process. Here's what each requires and where SRE stands:

### Step 0: PREPARE

| Task | Status |
|------|--------|
| Establish risk management strategy | Document in SSP |
| Define authorization boundary | SRE platform + CI/CD tools |
| Register system in eMASS | **TO DO** — See Section 3 |
| Identify key roles (SO, ISSO, ISSM, AO, SCA) | **TO DO** — Fill in names |
| Identify common controls for inheritance | See Section 5 |

### Step 1: CATEGORIZE

| Task | Status |
|------|--------|
| FIPS 199 classification (C-I-A levels) | **DONE** — Moderate-Moderate-Moderate |
| NIST SP 800-60 information types | **DONE** — See `security-categorization.md` |
| Document categorization justification | **DONE** |

**SRE Categorization: SC = {(C, MODERATE), (I, MODERATE), (A, MODERATE)}**

### Step 2: SELECT

| Task | Status |
|------|--------|
| Select NIST 800-53 Rev 5 control baseline | Moderate (~325 controls) |
| Apply DoD overlays (CNSSI 1253) | Apply during eMASS registration |
| Tailor controls (scope, compensating) | During eMASS control management |
| Identify inheritable controls | See Section 5 — ~40-60% can be inherited |

### Step 3: IMPLEMENT

| Task | Status |
|------|--------|
| Implement selected controls | **DONE** — 47 controls mapped to platform components |
| Document implementation in SSP | **PARTIALLY DONE** — OSCAL SSP exists, needs eMASS format |
| Map controls to components | **DONE** — See `compliance-mapping.md` |

### Step 4: ASSESS

| Task | Status |
|------|--------|
| Independent SCA evaluates controls | **TO DO** — Schedule with SCA |
| Each control rated: Compliant/Non-Compliant/N/A | SCA produces this |
| Security Assessment Report (SAR) produced | SCA produces this |
| Non-compliant findings → POA&M | **TEMPLATE READY** — `poam-template.md` |

### Step 5: AUTHORIZE

| Task | Status |
|------|--------|
| AO reviews SSP + SAR + POA&M | **TO DO** — After assessment |
| AO issues: ATO, DATO, or IATT | AO decision |
| Authorization document uploaded to eMASS | After AO decision |

### Step 6: MONITOR

| Task | Status |
|------|--------|
| Continuous monitoring per ISCM plan | **DONE** — Prometheus, Grafana, NeuVector |
| Ongoing vulnerability scanning | **DONE** — Trivy, NeuVector, Kyverno |
| POA&M updates | **TEMPLATE READY** |
| Quarterly reviews | **TEMPLATES READY** — QREV 1-7 |

---

## 3. eMASS Registration — Step by Step

Registration in eMASS has 5 sub-steps. Here's exactly what to enter:

### Registration Step 1: System Profile

| Field | What to Enter |
|-------|---------------|
| **System Name** | `Secure Runtime Environment Platform` |
| **System Acronym** | `SRE` |
| **System Type** | `IS Enclave` (required — DSS-specific types are not available in eMASS) |
| **System Description** | _A Kubernetes-based DevSecOps platform providing a hardened, compliant runtime for deploying containerized applications. Built on RKE2 with FIPS 140-2 compliance, DISA STIG hardening, and all 8 RAISE 2.0 security gates implemented in the CI/CD pipeline. The platform provides inheritable security controls for hosted applications under RAISE RPOC designation._ |
| **DITPR ID** | _[Your DITPR registration ID — register at https://ditpr.dod.mil if not yet done]_ |
| **Authorization Boundary** | _The SRE platform including: RKE2 Kubernetes cluster, Flux CD GitOps engine, Istio service mesh, Kyverno policy engine, Harbor container registry, CI/CD pipeline tools (Semgrep, Syft, Gitleaks, Trivy, OWASP ZAP, Cosign), monitoring stack (Prometheus, Grafana, Loki, Tempo), secrets management (OpenBao, ESO), runtime security (NeuVector), identity provider (Keycloak), and backup (Velero). Does NOT include the hosted tenant applications themselves — each application has its own RMF package._ |

### Registration Step 2a: Security Impact Levels

| Security Objective | Impact Level | Justification |
|-------------------|-------------|---------------|
| **Confidentiality** | MODERATE | Platform hosts CUI. Unauthorized disclosure could have serious adverse effects on organizational operations. |
| **Integrity** | MODERATE | Unauthorized modification of platform configuration or application deployments could have serious adverse effects on mission operations. |
| **Availability** | MODERATE | Disruption of platform services could have serious adverse effects but would not cause catastrophic mission failure. |

eMASS will auto-populate the NIST 800-53 Moderate baseline (~325 controls) based on these selections.

### Registration Step 2b: Manage Controls

After the baseline is populated, you need to mark each control:

| Action | When |
|--------|------|
| **Applicable** | Control is implemented by the SRE platform |
| **Not Applicable** | Control does not apply (document justification) |
| **Inherited** | Control is satisfied by infrastructure provider (cloud, physical facility) |

> **TIP**: Start with inherited controls first — this immediately reduces your workload by 40-60%.

For each **Applicable** control, you'll need to enter:
- Implementation description (how the control is met)
- Responsible entity (who maintains it)
- Evidence/artifacts

### Registration Step 3: Inheritance

Link to your infrastructure provider's authorization:
- If on AWS GovCloud: Link to AWS FedRAMP authorization
- If on-premises: Link to the facility's physical security authorization
- The SRE platform itself becomes a Common Control Provider (CCP) for tenant apps

### Registration Step 4: Assign Roles

| Role | Name | Email |
|------|------|-------|
| System Owner | _________________ | _________________ |
| ISSM | _________________ | _________________ |
| ISSO | _________________ | _________________ |

### Registration Step 5: Review and Submit

- Review all entered information
- Verify all required fields (marked with red stars) are complete
- Click "Submit System" to complete registration
- System appears in available systems list

---

## 4. ATO Package — Required Documents

### The "Big Three" (Required)

| # | Document | Description | SRE Status |
|---|----------|-------------|------------|
| 1 | **System Security Plan (SSP)** | System description, boundary, architecture, complete control implementation descriptions | OSCAL SSP exists — needs eMASS format |
| 2 | **Security Assessment Report (SAR)** | Results of independent control assessment by SCA | TO DO — SCA produces this |
| 3 | **Plan of Action & Milestones (POA&M)** | Response to each SAR finding with remediation plan | Template ready |

### Supporting Documents

| # | Document | Description | SRE Status |
|---|----------|-------------|------------|
| 4 | **Risk Assessment Report (RAR)** | Identifies risks, likelihood, impact, mitigation | TO DO |
| 5 | **Authorization Boundary Diagram** | Architecture diagrams (DoDAF OV-1, SV-6 recommended) | Partial — `docs/architecture.md` |
| 6 | **Hardware/Software List** | Inventory of all components with versions | DONE — QREV-1 has this |
| 7 | **PPSM Registration** | All ports/protocols registered per DoDI 8551.01 | Partial — QREV-1 has ports table |
| 8 | **Network Architecture Diagram** | Data flows, interfaces, external connections | TO DO — formal diagram needed |
| 9 | **Contingency Plan** | Disaster recovery procedures | Partial — Velero backup docs |
| 10 | **Incident Response Plan** | Per DAAPM Appendix Q requirements | TO DO |
| 11 | **Configuration Management Plan** | How changes are controlled | DONE — GitOps + Flux CD |
| 12 | **Continuous Monitoring Plan** | ISCM strategy | DONE — Prometheus/Grafana/NeuVector |
| 13 | **Privacy Impact Assessment (PIA)** | If PII is processed | DONE — QREV-3 template |
| 14 | **Interconnection Security Agreements** | For external system connections | If applicable |

### What the SSP Must Contain

The SSP is built IN eMASS (no longer a separate Word document). For each control:

```
Control: AC-2 Account Management
Implementation Status: Implemented
Implementation Description:
  Account management is handled by Keycloak (v24.8.1) as the centralized
  identity provider. All platform access requires SSO authentication via OIDC.
  User accounts are organized into groups (sre-admins, sre-viewers, developers)
  mapped to Kubernetes RBAC ClusterRoles. Account creation requires approval
  from the platform ISSM. Deprovisioning is automated when users are removed
  from Keycloak groups.
Responsible Entity: Platform Team
Evidence: Keycloak configuration export, RBAC role definitions, account audit log
```

---

## 5. Control Inheritance — Reducing Your Workload

This is the most important optimization. A Moderate baseline has ~325 controls. You do NOT implement all of them from scratch.

### Inheritance Sources

| Source | Controls Inherited | Examples |
|--------|-------------------|----------|
| **Cloud Provider (FedRAMP)** | ~100-130 controls | PE (Physical), some AC, some SC, some MP |
| **Facility Security** | ~20-30 controls | PE-1 through PE-20 (physical access, environmental) |
| **Existing Network Authorization** | ~15-20 controls | Network-layer SC controls |

### Controls SRE Implements Directly

After inheritance, SRE implements ~120-150 controls across these families:

| Family | # Controls | Primary SRE Components |
|--------|-----------|----------------------|
| AC (Access Control) | ~18 | Keycloak, Kubernetes RBAC, Istio, Kyverno |
| AU (Audit) | ~12 | Loki, Prometheus, K8s audit log, OpenBao audit |
| CA (Assessment) | ~8 | Kyverno PolicyReports, NeuVector, compliance scanner |
| CM (Configuration Mgmt) | ~12 | Flux CD (GitOps), Kyverno, Ansible STIGs |
| IA (Identification/Auth) | ~10 | Keycloak, Istio mTLS, cert-manager, OpenBao |
| IR (Incident Response) | ~8 | AlertManager, NeuVector, Grafana alerting |
| RA (Risk Assessment) | ~6 | Trivy, NeuVector, Kyverno violation reports |
| SA (System Acquisition) | ~10 | SBOM (Syft), Cosign, Harbor, CI/CD pipeline |
| SC (System/Comms) | ~15 | Istio mTLS, FIPS crypto, TLS, NetworkPolicies |
| SI (System Integrity) | ~12 | NeuVector, Cosign signing, Kyverno admission |

### SRE as Common Control Provider (CCP)

Once SRE has an ATO, tenant applications inherit YOUR controls:

```
Tenant App inherits from SRE RPOC:
  - SC-8 (Transmission Confidentiality) → Istio mTLS
  - CM-7 (Least Functionality) → Kyverno policies
  - SI-7 (Software Integrity) → Cosign + Kyverno verification
  - AU-2 (Audit Events) → Loki + Prometheus
  - RA-5 (Vulnerability Scanning) → Trivy + NeuVector
  - AC-4 (Information Flow Enforcement) → NetworkPolicies + Istio
  ... and ~40 more controls
```

This is the whole point of RPOC — apps deploy faster because they inherit your controls.

---

## 6. eMASS Control Validation

Validating security controls in eMASS is a 3-step process:

### Step 1: Test Assessment Procedures
- All Assessment Procedures (APs/CCIs) assigned to each control must be tested
- Results recorded per AP: Satisfied, Other Than Satisfied, Not Applicable

### Step 2: Industry/Organization Review
- ISSO/ISSM reviews the package
- Verifies all controls have implementation descriptions
- Verifies evidence is attached
- Submits to SCA

### Step 3: SCA Validation
- Independent SCA reviews and validates each control
- Issues SAR with findings
- Non-compliant controls go to POA&M

### Uploading Evidence
- Click "Add Artifact" per control/AP association
- Upload individual files or .zip bundles (use `isBulk=true` for bulk)
- Category defaults to "Evidence"
- eMASS supports bulk export/import of CCI test results via templates

---

## 7. Automation — SAF CLI & eMASS API

The MITRE Security Automation Framework (SAF) CLI integrates with the eMASS REST API, enabling automated evidence upload from your CI/CD pipeline.

### SAF CLI (eMASS Integration)

GitHub: [mitre/saf](https://github.com/mitre/saf) and [mitre/emass_client](https://github.com/mitre/emass_client)

Available API endpoints:
- **Controls**: View, add, update control implementation descriptions
- **Test Results**: View, add test results for assessment procedures
- **Artifacts**: View, add, update, remove evidence artifacts
- **POA&M**: View, add, update POA&M items
- **System**: View system details

### Automated Evidence Pipeline

```
CI/CD Pipeline produces artifacts
    │
    ├── Semgrep SARIF → SAF CLI → eMASS (SA-11 evidence)
    ├── Trivy SARIF → SAF CLI → eMASS (RA-5 evidence)
    ├── Gitleaks JSON → SAF CLI → eMASS (IA-5 evidence)
    ├── SBOM (SPDX) → SAF CLI → eMASS (CM-8 evidence)
    ├── Cosign verify → SAF CLI → eMASS (SI-7 evidence)
    ├── Kyverno reports → SAF CLI → eMASS (CM-7 evidence)
    └── NeuVector scans → SAF CLI → eMASS (SI-4 evidence)
```

### OSCAL Integration

OSCAL (Open Security Controls Assessment Language) is the machine-readable format for compliance:
- FedRAMP will require OSCAL after September 2026
- DoD is moving in the same direction
- SRE already has an OSCAL SSP at `compliance/oscal/ssp.json`
- FedRAMP provides templates: [FedRAMP OSCAL Resources](https://www.fedramp.gov/using-the-fedramp-oscal-resources-and-templates/)

---

## 8. Timeline & Cost Expectations

| Metric | Typical | With DevSecOps/cATO |
|--------|---------|-------------------|
| **Timeline** | 12-18 months | 6-9 months |
| **Cost** | $1M-$3M+ | Reduced via automation |
| **Control burden** | ~325 (Moderate) | ~120-150 after inheritance |

### Key Milestones

| Milestone | Target |
|-----------|--------|
| Get eMASS access | Week 1-3 |
| Register system | Week 3-4 |
| Complete SSP (control descriptions) | Week 4-12 |
| Submit to SCA (90 days before need) | Week 12 |
| SCA assessment | Week 12-20 |
| Remediate findings, update POA&M | Week 20-24 |
| AO review and decision | Week 24-28 |
| RPOC designation (after ATO) | Week 28-30 |

> **DCSA recommends**: Submit complete security plan at least **90 days before need date**.

---

## 9. Practitioner Tips

### DO

- **Start eMASS access NOW** — account creation takes weeks
- **Define a narrow authorization boundary** — include only what is essential. Every external API, library that "phones home", or third-party service extends your boundary
- **Maximize control inheritance** — inherit from cloud provider FedRAMP authorization, facility security, network authorization. You can potentially inherit 40-60% of Moderate controls
- **Automate evidence collection** — use SAF CLI, OSCAL, pipeline-generated artifacts. Your CI/CD pipeline already produces most of the evidence
- **Use OSCAL format** — machine-readable compliance artifacts will be required soon
- **Submit 90+ days early** — DCSA needs time for thorough review
- **Register in DITPR** first — you'll need the DITPR ID for eMASS registration
- **Register ports in PPSM** — all ports/protocols must be registered per DoDI 8551.01 at [cyber.mil/connect/ppsm](https://www.cyber.mil/connect/ppsm/)
- **Pursue cATO** if your system supports it — your DevSecOps pipeline and automated monitoring make you a strong candidate

### DO NOT

- **Attempt all ~325 controls from scratch** — leverage inheritance aggressively
- **Submit incomplete packages** — this is the #1 cause of delays and rejections
- **Default to legacy RMF** — pursue cATO with your DevSecOps pipeline
- **Forget the PPSM registration** — commonly missed, causes delays
- **Wait until the end to engage the AO** — keep them informed throughout
- **Ignore the POA&M** — overdue items are the second biggest cause of ATO denial

---

## 10. Reference Documents

### eMASS Guides (CAC may be required for some)

| Document | Link |
|----------|------|
| NISP eMASS Industry Operation Guide v1.1 | [DCSA](https://www.dcsa.mil/Portals/91/Documents/CTP/tools/NISP%20eMASS%20Industry%20Operation%20Guide%20Version%201.1.pdf) |
| NISP eMASS Job Aid | [DCSA](https://www.dcsa.mil/Portals/69/documents/io/rmf/NISP-eMASS%20Job%20Aid.pdf) |
| eMASS Step-by-Step Instructions | [DISA](https://s3.us-gov-west-1.amazonaws.com/sepub-demo-0001-124733793621-us-gov-west-1/s3fs-public/documents/eMASS+STEPbySTEP.pdf) |
| NISP eMASS Account Request Guide v3 | [DCSA](https://www.dcsa.mil/Portals/128/Documents/CTP/tools/NISP%20eMASS%20User%20Account%20Request%20Guide%20Version%203.pdf) |
| DCSA A&A Process Manual (DAAPM) v2.2 | [DCSA](https://www.dcsa.mil/Portals/91/Documents/CTP/tools/DCSA%20Assessment%20and%20Authorization%20Process%20Manual%20Version%202.2.pdf) |

### RMF & NIST Standards

| Document | Link |
|----------|------|
| NIST SP 800-37 Rev 2 (RMF) | [NIST](https://csrc.nist.gov/pubs/sp/800/37/r2/final) |
| NIST SP 800-53 Rev 5 (Security Controls) | [NIST](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) |
| FIPS 199 (Security Categorization) | [NIST](https://csrc.nist.gov/pubs/fips/199/final) |
| NIST SP 800-60 (Information Types) | [NIST](https://csrc.nist.gov/pubs/sp/800/60/v1/r1/final) |

### DoD DevSecOps & cATO

| Document | Link |
|----------|------|
| DoD cATO Implementation Guide | [DoD CIO](https://dodcio.defense.gov/Portals/0/Documents/Library/DoDCIO-ContinuousAuthorizationImplementationGuide.pdf) |
| cATO Evaluation Criteria | [DoD CIO](https://dodcio.defense.gov/Portals/0/Documents/Library/cATO-EvaluationCriteria.pdf) |
| DoD DevSecOps Reference Design v2.0 | [DoD CIO](https://dodcio.defense.gov/Portals/0/Documents/Library/DevSecOpsReferenceDesign.pdf) |
| DoD Cybersecurity Reciprocity Playbook | [DoD CIO](https://dodcio.defense.gov/Portals/0/Documents/Library/(U)%202024-01-02%20DoD%20Cybersecurity%20Reciprocity%20Playbook.pdf) |

### Automation Tools

| Tool | Link |
|------|------|
| MITRE SAF CLI (eMASS integration) | [GitHub](https://github.com/mitre/saf) |
| MITRE eMASS Client API | [GitHub](https://github.com/mitre/emass_client) |
| FedRAMP OSCAL Templates | [FedRAMP](https://www.fedramp.gov/using-the-fedramp-oscal-resources-and-templates/) |
| DISA PPSM Resources | [Cyber.mil](https://www.cyber.mil/connect/ppsm/) |

### Helpful Articles

| Article | Link |
|---------|------|
| What is Required in an ATO Package | [Rise8](https://www.rise8.us/resources/what-is-required-in-an-ato-package) |
| How Long Does the ATO Process Take | [Rise8](https://www.rise8.us/resources/how-long-does-the-ato-process-take) |
| ATO Checklist | [Rise8](https://www.rise8.us/resources/authorization-to-operate-checklist) |
| 7 Common Mistakes in DoD ATO | [Second Front](https://www.secondfront.com/resources/blog/7-common-and-costly-mistakes-to-avoid-in-your-dod-ato-process/) |
| Maximize Control Inheritance | [Second Front](https://www.secondfront.com/resources/blog/how-to-maximize-control-inheritance-a-guide-to-reducing-your-nist-800-53-workload/) |

---

## Quick Start Checklist

Use this to track your immediate next steps:

- [ ] **Get eMASS account** — Request CAC/PKI access, complete Cyber Awareness training
- [ ] **Identify key personnel** — System Owner, ISSM, ISSO, AO, SCA
- [ ] **Register in DITPR** — Get DITPR ID before eMASS registration
- [ ] **Register in eMASS** — Use the Step 1-5 guide above
- [ ] **Register ports in PPSM** — Per DoDI 8551.01
- [ ] **Complete control descriptions** — Map each NIST 800-53 control to SRE components
- [ ] **Identify inherited controls** — Link to cloud provider / facility authorizations
- [ ] **Create authorization boundary diagram** — Formal DoDAF diagram
- [ ] **Create incident response plan** — Per DAAPM Appendix Q
- [ ] **Submit CI/CD Tools Certification** — To Technical Authority (see `cicd-tools-certification-submission.md`)
- [ ] **Schedule SCA assessment** — 90 days before target ATO date
- [ ] **Engage AO early** — Brief them on the platform and RPOC intent

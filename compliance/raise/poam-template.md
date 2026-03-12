# Plan of Action & Milestones (POA&M)

## RPOC: Secure Runtime Environment (SRE)

**eMASS/MCAST ID:** _[TO BE ASSIGNED]_
**Last Updated:** _[DATE]_
**RPOC ISSM:** _[NAME]_

---

## Instructions

This POA&M tracks all known findings, vulnerabilities, and deficiencies for the RPOC and hosted applications. Update this document as findings are discovered, remediated, or mitigated.

**Automated sources:**
- Trivy container scan reports (Harbor)
- Semgrep SAST findings (CI/CD pipeline)
- OWASP ZAP DAST findings (CI/CD pipeline)
- Gitleaks secret detection findings (CI/CD pipeline)
- NeuVector runtime findings (cluster)
- Kyverno policy violations (cluster)

Run `scripts/compliance-report.sh --json` to auto-generate POA&M entries from live cluster data.

---

## Findings Register

### Format

Each finding follows this structure:

| Field | Description |
|-------|-------------|
| POA&M ID | Unique identifier (e.g., POAM-2026-001) |
| Finding Source | Tool that discovered it (Trivy, Semgrep, ZAP, NeuVector, Manual) |
| CVE/CWE | CVE ID or CWE category if applicable |
| Severity | CRITICAL / HIGH / MEDIUM / LOW |
| Description | What the finding is |
| Affected Asset | Application, image, or component affected |
| NIST Controls | Related NIST 800-53 controls |
| Discovery Date | When the finding was identified |
| Due Date | Remediation deadline per SLA |
| Status | Open / In Progress / Mitigated / Remediated / Risk Accepted |
| Responsible Party | Application Owner or Platform Team |
| Remediation Plan | What will be done to fix it |
| Milestones | Key dates and checkpoints |
| Mitigation Statement | If mitigated (not remediated), document the compensating control |
| Completion Date | When remediation/mitigation was completed |
| Validated By | Who verified the fix |

---

## Active Findings

### POAM-YYYY-NNN: _[Finding Title]_

| Field | Value |
|-------|-------|
| **Source** | _[Trivy / Semgrep / ZAP / NeuVector / Manual]_ |
| **CVE/CWE** | _[e.g., CVE-2024-12345]_ |
| **Severity** | _[CRITICAL / HIGH / MEDIUM / LOW]_ |
| **Description** | _[Description of the vulnerability or finding]_ |
| **Affected Asset** | _[e.g., harbor.sre.internal/team-alpha/my-app:v1.2.3]_ |
| **NIST Controls** | _[e.g., RA-5, SI-2]_ |
| **Discovery Date** | _[YYYY-MM-DD]_ |
| **Due Date** | _[YYYY-MM-DD per SLA timeline]_ |
| **Status** | _[Open]_ |
| **Responsible** | _[Application Owner / Platform Team]_ |
| **Remediation Plan** | _[Upgrade base image / patch library / apply config change]_ |
| **Milestones** | _[Day 7: assess impact, Day 14: patch ready, Day 21: deployed]_ |

---

## Platform-Level Findings

_Track findings that affect the RPOC platform itself (not specific applications)._

| POA&M ID | Severity | Description | Status | Due Date |
|----------|----------|-------------|--------|----------|
| | | | | |

---

## Application Findings Summary

_Aggregate view of findings per hosted application._

| Application | Team | CRITICAL | HIGH | MEDIUM | LOW | Oldest Open |
|-------------|------|----------|------|--------|-----|-------------|
| | | | | | | |

---

## Closed Findings

_Move findings here when remediated or mitigated with AO acceptance._

| POA&M ID | Severity | Description | Resolution | Closed Date | Validated By |
|----------|----------|-------------|------------|-------------|--------------|
| | | | | | |

---

## Risk Acceptance Register

_Findings accepted by the AO as residual risk (must not exceed Moderate)._

| POA&M ID | Severity | Description | Justification | Accepted By | Expiration |
|----------|----------|-------------|---------------|-------------|------------|
| | | | | | |

---

## Remediation Timelines (per RAISE 2.0)

| Severity | Timeline | Escalation Path |
|----------|----------|-----------------|
| CRITICAL | 7 calendar days | ISSM immediate, AO at day 7 |
| HIGH | 21 calendar days | ISSM at day 14, isolate workload at day 21 |
| MEDIUM | 60 calendar days | Review at quarterly |
| LOW | 90 calendar days | Track in POA&M |

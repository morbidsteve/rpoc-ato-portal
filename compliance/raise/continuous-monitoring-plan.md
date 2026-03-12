# Information Security Continuous Monitoring (ISCM) Plan

**System Name:** Secure Runtime Environment (SRE) Platform
**Document Version:** 1.0
**Date:** 2026-03-11
**Classification:** CUI // SP-ISCM
**NIST Reference:** SP 800-137, *Information Security Continuous Monitoring (ISCM) for Federal Information Systems and Organizations*
**NIST Controls:** CA-7, PM-6, PM-14, SI-4, RA-5

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [ISCM Strategy](#2-iscm-strategy)
3. [Monitoring Sources and Frequency](#3-monitoring-sources-and-frequency)
4. [Security Control Assessment Schedule](#4-security-control-assessment-schedule)
5. [Metrics and Reporting](#5-metrics-and-reporting)
6. [Dashboards and Alerting](#6-dashboards-and-alerting)
7. [Response Procedures for Monitoring Findings](#7-response-procedures-for-monitoring-findings)
8. [Quarterly Review (QREV) Integration](#8-quarterly-review-qrev-integration)
9. [Plan Maintenance and Review](#9-plan-maintenance-and-review)

---

## 1. Purpose and Scope

### 1.1 Purpose

This Information Security Continuous Monitoring (ISCM) Plan establishes the strategy, processes, and tools for maintaining ongoing awareness of the SRE platform's security posture. It defines what is monitored, how frequently, by what tools, and what actions are taken when monitoring detects anomalies, vulnerabilities, or compliance deviations.

This plan implements the requirements of NIST SP 800-137 and provides the operational framework for maintaining the system's Authorization to Operate (ATO) through continuous evidence collection rather than point-in-time assessments.

**NIST 800-53 Rev 5 controls addressed:**

| Control | Description | Implementation |
|---------|-------------|---------------|
| CA-7 | Continuous Monitoring | This plan; all monitoring tools and processes |
| CA-7(1) | Independent Assessment | Annual SCA engagement (Section 4) |
| PM-6 | Measures of Performance | Security metrics (Section 5) |
| PM-14 | Testing, Training, and Monitoring | Monitoring frequency and coverage (Section 3) |
| SI-4 | System Monitoring | Real-time monitoring tools (Section 3.1) |
| SI-4(2) | Automated Tools and Mechanisms for Real-Time Analysis | Prometheus, NeuVector, Kyverno (Section 3.1) |
| SI-4(5) | System-Generated Alerts | AlertManager routing (Section 6.2) |
| RA-5 | Vulnerability Monitoring and Scanning | Trivy, NeuVector scanning (Section 3.4) |

### 1.2 Scope

This plan covers continuous monitoring of:

- **Security controls:** Ongoing assessment of NIST 800-53 controls implemented by the platform
- **Vulnerability management:** Container image scanning, OS vulnerability monitoring, runtime threat detection
- **Configuration compliance:** Drift detection, policy enforcement, baseline adherence
- **Operational health:** Cluster availability, service health, resource utilization
- **Audit and accountability:** Log collection, audit trail integrity, access monitoring

### 1.3 ISCM Objectives

1. Maintain near-real-time visibility into the platform security posture
2. Detect and respond to security events within defined SLAs
3. Provide continuous compliance evidence for the Authorizing Official (AO)
4. Identify vulnerabilities before they are exploited
5. Detect configuration drift and unauthorized changes
6. Support the Quarterly Review (QREV) process with automated evidence

---

## 2. ISCM Strategy

### 2.1 Strategy Overview

The SRE platform ISCM strategy is built on three pillars aligned with NIST SP 800-137:

**Pillar 1: Automated Continuous Assessment**
Security controls that can be verified programmatically are assessed continuously through automated tools. Kyverno policies enforce and report on Kubernetes security controls. Trivy scans container images for vulnerabilities. NeuVector monitors runtime behavior against baselines.

**Pillar 2: GitOps as Continuous Compliance**
Because all platform configuration is stored in Git and reconciled by Flux CD, the Git repository serves as a continuously auditable record of the system's intended state. Every change is tracked, reviewed, and attributable. Drift from the approved baseline is detected and corrected automatically.

**Pillar 3: Structured Periodic Review**
Controls that cannot be fully automated (e.g., access reviews, risk assessments, policy adequacy) are assessed on defined schedules and documented in the QREV artifact package for AO review.

### 2.2 Monitoring Tiers

| Tier | Frequency | Scope | Primary Tool |
|------|-----------|-------|-------------|
| Real-time | Continuous (<1 minute) | Runtime security, policy enforcement, metrics | Prometheus, NeuVector, Kyverno |
| Near-real-time | Every 10 minutes | Configuration drift, GitOps reconciliation | Flux CD |
| Periodic-short | Hourly to daily | Vulnerability scanning, secrets sync, compliance checks | Trivy, ESO, CronJob scanner |
| Periodic-medium | Weekly to monthly | Vulnerability summaries, trend analysis | Grafana reports |
| Periodic-long | Quarterly to annually | Full control assessment, QREV package, SCA | Manual + automated |

### 2.3 Defense in Depth Monitoring Model

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Compliance & Governance                       │
│  Quarterly: QREV artifacts, AO review, SCA             │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Application Security                          │
│  Daily: Harbor+Trivy image scanning, SBOM analysis      │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Kubernetes Security                           │
│  Continuous: Kyverno policy enforcement, RBAC audit     │
│  Every 10 min: Flux drift detection                     │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Runtime Security                              │
│  Continuous: NeuVector process/network/file monitoring   │
│  Continuous: Istio mTLS + AuthorizationPolicy           │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Infrastructure Security                       │
│  Continuous: Prometheus node metrics, SELinux enforcing  │
│  Weekly: Ansible STIG compliance check                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Monitoring Sources and Frequency

### 3.1 Real-Time Monitoring (Continuous)

| Source | Tool | What It Monitors | Alert Threshold |
|--------|------|-----------------|-----------------|
| Kubernetes metrics | Prometheus + kube-state-metrics | Pod status, node health, resource usage, HPA state | Pod crash loops, node NotReady, resource exhaustion |
| Node metrics | Prometheus + node-exporter | CPU, memory, disk, network, filesystem | >85% utilization sustained 5 min |
| Service mesh traffic | Istio + Prometheus | Request rates, error rates, latencies per service | 5xx rate >1%, p99 latency >5s |
| Policy enforcement | Kyverno | Admission decisions (allow/deny) for all resource mutations | Any Enforce-mode denial |
| Runtime threats | NeuVector | Container processes, file access, network connections | Any deviation from learned baseline |
| mTLS compliance | Istio PeerAuthentication | Unencrypted pod-to-pod traffic | Any PERMISSIVE or DISABLE mode |
| Certificate status | cert-manager + Prometheus | Certificate expiry, renewal failures | <30 days to expiry, renewal failure |

### 3.2 Near-Real-Time Monitoring (Every 10 Minutes)

| Source | Tool | What It Monitors | Alert Threshold |
|--------|------|-----------------|-----------------|
| GitOps reconciliation | Flux CD | Drift between Git and cluster state | Reconciliation failure or suspension >1 hour |
| HelmRelease health | Flux CD | Helm deployment status for all platform services | Any HelmRelease not Ready |
| Kustomization health | Flux CD | Kustomization reconciliation for all components | Any Kustomization not Ready |

### 3.3 Periodic Monitoring (Hourly)

| Source | Tool | What It Monitors | Alert Threshold |
|--------|------|-----------------|-----------------|
| Secrets synchronization | External Secrets Operator | Sync status from OpenBao to K8s Secrets | Any ExternalSecret not synced |
| OpenBao health | Prometheus | Vault seal status, storage backend health | Sealed state, leader loss |
| etcd snapshots | RKE2 | Automatic etcd snapshot creation | Snapshot older than 2 hours |

### 3.4 Periodic Monitoring (Daily)

| Source | Tool | What It Monitors | Alert Threshold |
|--------|------|-----------------|-----------------|
| Compliance scanner | CronJob (8 checks) | STIG compliance, CIS benchmark, policy coverage | Any check failure |
| Image vulnerability scan | Harbor + Trivy | All stored images re-scanned for new CVEs | New CRITICAL or HIGH vulnerability |
| Velero backup verification | Prometheus | Backup completion status | Failed or missing backup |
| Kyverno background scan | Kyverno PolicyReports | Existing resources checked against current policies | New policy violations on existing resources |
| OpenBao audit log review | Loki queries | Authentication attempts, secret access patterns | Unusual access patterns (>2 std dev) |
| Log ingestion health | Prometheus | Loki ingestion rate, Alloy collection status | Ingestion drop >10%, Alloy pod not running |

### 3.5 Periodic Monitoring (Weekly)

| Source | Tool | Deliverable |
|--------|------|-------------|
| Vulnerability summary | Grafana scheduled report | Trivy scan results aggregated by severity, namespace, and image |
| Patch compliance | Grafana scheduled report | Outstanding vulnerabilities vs. SLA timelines |
| Access review (automated) | Script + Keycloak API | Users in groups, last login times, dormant accounts |
| Flux reconciliation summary | Grafana scheduled report | Reconciliation success rates, drift events, remediation actions |

### 3.6 Periodic Monitoring (Monthly)

| Activity | Responsible | Deliverable |
|----------|-------------|-------------|
| Full NIST control assessment review | ISSO + Security Engineer | Control status spreadsheet (pass/fail/partial per control family) |
| POA&M status update | ISSO | Updated POA&M with remediation progress |
| Velero restore test | Backup Administrator | Restore test report (pass/fail) |
| NeuVector baseline review | Security Engineer | Review and promote learned behaviors to enforcement |
| Keycloak access review | ISSO | Verified user/group assignments, disabled inactive accounts |

### 3.7 Periodic Monitoring (Quarterly)

| Activity | Responsible | Deliverable |
|----------|-------------|-------------|
| QREV artifact package | ISSO + Platform Lead | QREV 1-7 documents updated and submitted to AO |
| Risk assessment update | ISSO | Updated risk register with new threats/vulnerabilities |
| CM baseline review | Configuration Manager | Verified baseline matches deployed state |
| Penetration test scope review | Security Engineer | Updated scope for next assessment |
| Policy effectiveness review | ISSO | Kyverno policy tuning recommendations |
| Contingency plan review | CPC | Updated contingency plan if changes occurred |

### 3.8 Periodic Monitoring (Annual)

| Activity | Responsible | Deliverable |
|----------|-------------|-------------|
| Full Security Control Assessment (SCA) | Independent assessor (3PAO or internal) | SAR (Security Assessment Report) |
| Contingency plan full exercise | Contingency team | Exercise report with RTO/RPO measurements |
| ATO reauthorization package | ISSO + AO | Complete ATO package with updated SSP |
| STIG update review | Platform Lead | Apply new STIG versions, update Ansible roles |

---

## 4. Security Control Assessment Schedule

### 4.1 Automated Controls (Continuous Assessment)

These controls are assessed automatically and continuously by platform tooling:

| Control Family | Controls | Assessment Tool | Evidence Location |
|---------------|----------|----------------|-------------------|
| AC (Access Control) | AC-3, AC-4, AC-6, AC-14 | Kyverno, Istio, K8s RBAC | Kyverno PolicyReports, Istio logs |
| AU (Audit) | AU-2, AU-3, AU-8, AU-12 | Loki, Alloy, Prometheus | Loki log queries, Grafana dashboards |
| CM (Config Mgmt) | CM-2, CM-3, CM-6, CM-7 | Flux CD, Kyverno, Ansible | Flux status, PolicyReports, Git history |
| IA (Identification) | IA-3 | Istio mTLS | PeerAuthentication status, Istio metrics |
| RA (Risk Assessment) | RA-5 | Harbor + Trivy, NeuVector | Trivy scan reports, NeuVector dashboard |
| SC (System Comms) | SC-7, SC-8, SC-13 | Istio, NetworkPolicies | NetworkPolicy audit, mTLS metrics |
| SI (Sys Integrity) | SI-3, SI-4, SI-7 | NeuVector, Cosign/Kyverno | NeuVector alerts, image verification logs |

### 4.2 Semi-Automated Controls (Periodic Assessment)

These controls require scheduled automated checks with human review:

| Control Family | Controls | Assessment Method | Frequency |
|---------------|----------|-------------------|-----------|
| AC (Access Control) | AC-2 | Keycloak user/group audit script + human review | Monthly |
| AU (Audit) | AU-4, AU-5, AU-9 | Log storage capacity monitoring + retention verification | Weekly |
| CA (Assessment) | CA-7, CA-8 | This plan + vulnerability scanning | Continuous / Quarterly |
| CM (Config Mgmt) | CM-8, CM-10, CM-11 | Component inventory verification + license audit | Quarterly |
| IA (Identification) | IA-2, IA-5 | Keycloak MFA verification + password policy audit | Monthly |
| SC (System Comms) | SC-12, SC-28 | Certificate inventory + encryption verification | Monthly |

### 4.3 Manual Controls (Scheduled Assessment)

These controls require human judgment and cannot be fully automated:

| Control Family | Controls | Assessment Method | Frequency |
|---------------|----------|-------------------|-----------|
| AC (Access Control) | AC-2(review), AC-17 | Formal access review with managers | Quarterly |
| CA (Assessment) | CA-7(1) | Independent security assessment | Annual |
| CP (Contingency) | CP-2, CP-4 | Contingency plan review + tabletop exercise | Quarterly / Annual |
| IR (Incident Response) | IR-4, IR-5, IR-6 | Incident response procedure review + drill | Semi-annual |
| PL (Planning) | PL-2 | SSP review and update | Annual |
| PM (Program Mgmt) | PM-6, PM-14 | Security metrics program review | Annual |

---

## 5. Metrics and Reporting

### 5.1 Key Security Metrics

#### 5.1.1 Policy Compliance

| Metric | Target | Source | Alert |
|--------|--------|--------|-------|
| Kyverno Enforce-mode violations (blocked) | 0 per day (indicates attempted unauthorized action) | Kyverno admission logs | Any violation triggers SEV-3 investigation |
| Kyverno Audit-mode violations | Trending to 0 | Kyverno PolicyReports | >10 new violations in 24h triggers review |
| Resources passing all policies | 100% | Kyverno background scan | <100% triggers remediation |
| Namespaces with default-deny NetworkPolicy | 100% | Kyverno `require-network-policies` | Any namespace without triggers alert |

#### 5.1.2 Vulnerability Management

| Metric | Target | Source | Alert |
|--------|--------|--------|-------|
| Critical vulnerabilities in deployed images | 0 | Harbor + Trivy | New CRITICAL triggers immediate triage |
| High vulnerabilities in deployed images | <5 total | Harbor + Trivy | New HIGH generates ticket within 24h |
| Mean time to remediate (CRITICAL) | <7 days | Tracking spreadsheet / Grafana | >5 days triggers escalation |
| Mean time to remediate (HIGH) | <21 days | Tracking spreadsheet / Grafana | >14 days triggers escalation |
| Images with valid Cosign signature | 100% (in audit scope) | Kyverno verify-image-signatures | Unsigned image in audit report triggers review |
| Harbor scan coverage | 100% of images scanned | Harbor API | Unscanned image triggers alert |

#### 5.1.3 Configuration Compliance

| Metric | Target | Source | Alert |
|--------|--------|--------|-------|
| Flux reconciliation success rate | >99.9% | Prometheus (gotk_reconcile_condition) | Any failure triggers SEV-2 |
| Configuration drift events (auto-corrected) | <5 per week | Flux event logs in Loki | >10/week indicates unauthorized change attempts |
| OS STIG compliance score | >95% | Compliance scanner CronJob | Score drop triggers investigation |
| RKE2 CIS benchmark pass rate | >95% | CIS benchmark scan | Score drop triggers investigation |

#### 5.1.4 Operational Availability

| Metric | Target | Source | Alert |
|--------|--------|--------|-------|
| Cluster uptime | >99.9% (43 min downtime/month) | Prometheus up metric | Any node NotReady >5 min |
| Platform service availability | >99.9% per service | Flux HelmRelease status + Prometheus | HelmRelease not Ready >10 min |
| Istio mTLS coverage | 100% of meshed traffic | Istio telemetry | Any non-mTLS traffic detected |
| Certificate expiry (minimum) | >30 days for all certs | cert-manager + Prometheus | <30 days triggers renewal investigation |

#### 5.1.5 Access Control

| Metric | Target | Source | Alert |
|--------|--------|--------|-------|
| Users with appropriate group membership | 100% | Keycloak monthly audit | Discrepancy triggers access review |
| Dormant accounts (no login >90 days) | 0 | Keycloak last-login audit | Dormant account triggers disable action |
| Failed authentication attempts | <10/hour per user | Keycloak event logs in Loki | >10/hour triggers account lockout investigation |
| RBAC compliance (users in correct K8s roles) | 100% | K8s RBAC audit | Discrepancy triggers remediation |

### 5.2 Reporting Schedule

| Report | Frequency | Audience | Delivery | Content |
|--------|-----------|----------|----------|---------|
| Security Dashboard | Real-time | Platform team | Grafana (always available) | All metrics on live dashboards |
| Weekly Security Digest | Weekly (Monday) | ISSO, Platform Lead | Email (auto-generated from Grafana) | Vulnerability summary, policy violations, drift events |
| Monthly Security Report | Monthly (1st) | ISSO, AO representative | PDF export from Grafana | Trend analysis, SLA compliance, POA&M status |
| QREV Package | Quarterly | AO | Formal submission | QREV 1-7 artifacts with supporting evidence |
| Annual Security Assessment | Annual | AO, CISO | SAR document | Full SCA results, risk posture, recommendations |

---

## 6. Dashboards and Alerting

### 6.1 Grafana Dashboards

The platform maintains 10 Grafana dashboards providing continuous visibility:

| Dashboard | Purpose | Key Panels |
|-----------|---------|------------|
| **Cluster Overview** | Overall cluster health and resource utilization | Node status, pod counts, CPU/memory/disk usage, HPA status |
| **Istio Service Mesh** | Service mesh traffic and security | Request rates, error rates, latency histograms, mTLS status |
| **Kyverno Policy** | Policy enforcement and compliance | Violations by policy, violations by namespace, admission decisions timeline |
| **NeuVector Security** | Runtime security events | Process alerts, network violations, vulnerability findings, DLP events |
| **Flux GitOps** | Reconciliation status and history | HelmRelease status, Kustomization status, reconciliation duration, drift events |
| **Certificate Management** | TLS certificate lifecycle | Certificate inventory, expiry timeline, renewal status, CA chain health |
| **Vulnerability Management** | Image vulnerability tracking | CVE counts by severity/namespace/image, remediation SLA tracking |
| **Logging Overview** | Log pipeline health and search | Ingestion rates, log volume by namespace, error log highlights |
| **Backup Status** | Velero backup health | Last backup time, backup size, restore test results |
| **SRE Compliance** | Aggregate compliance posture | Control family coverage, STIG scores, overall compliance percentage |

### 6.2 AlertManager Configuration

Alerts are routed through Prometheus AlertManager to appropriate channels based on severity:

| Channel | Alert Types | Notification Method | Response SLA |
|---------|-------------|--------------------|--------------|
| **PagerDuty** (SEV-1) | Cluster down, full node failure, security breach indicators, OpenBao sealed | PagerDuty integration (auto-page on-call) | 15 minutes |
| **Slack #sre-security** (SEV-2) | Policy violations, unauthorized change attempts, new CRITICAL CVEs, NeuVector alerts | Slack webhook | 1 hour |
| **Slack #sre-platform** (SEV-3) | Flux reconciliation failures, certificate expiry warnings, backup failures, resource pressure | Slack webhook | 4 hours |
| **Email (weekly digest)** | Vulnerability summaries, compliance trends, patch status | SMTP (scheduled) | Informational |

### 6.3 Alert Definitions

**SEV-1 (Critical -- Immediate Response):**

| Alert | Condition | Action |
|-------|-----------|--------|
| `ClusterNodeDown` | Any node NotReady >5 minutes | Page on-call, initiate contingency procedure |
| `OpenBaoSealed` | OpenBao in sealed state >5 minutes | Page on-call, unseal immediately |
| `SecurityBreach` | NeuVector critical process/network alert | Page on-call + ISSO, initiate IR procedures |
| `CertificateExpired` | Any certificate past expiry | Page on-call, emergency cert renewal |
| `EtcdQuotaExceeded` | etcd storage >90% capacity | Page on-call, compact etcd or expand |

**SEV-2 (High -- Urgent Response):**

| Alert | Condition | Action |
|-------|-----------|--------|
| `KyvernoPolicyViolation` | Enforce-mode denial detected | Investigate source of unauthorized change attempt |
| `FluxReconciliationFailed` | Any HelmRelease/Kustomization failed | Investigate and remediate within 1 hour |
| `CriticalVulnerabilityFound` | Trivy finds CRITICAL CVE in deployed image | Begin patching process per SLA (7 days) |
| `NeuVectorRuntimeAlert` | Process or network anomaly detected | Investigate, determine if malicious |
| `IstioMTLSDisabled` | Any namespace with PERMISSIVE mTLS | Re-enforce STRICT mTLS |
| `UnauthorizedImageDetected` | Image from non-approved registry attempted | Block + investigate source |

**SEV-3 (Medium -- Business Hours Response):**

| Alert | Condition | Action |
|-------|-----------|--------|
| `CertificateExpirySoon` | Certificate expiring within 30 days | Verify cert-manager renewal is scheduled |
| `BackupFailed` | Velero daily backup did not complete | Investigate storage/connectivity issues |
| `HighVulnerabilityFound` | Trivy finds HIGH CVE in deployed image | Queue for patching per SLA (21 days) |
| `ResourcePressure` | CPU/memory/disk >85% sustained | Scale or optimize affected workloads |
| `FluxSuspended` | Any reconciliation suspended >1 hour | Verify intentional, resume if not |
| `ExternalSecretSyncFailed` | ESO failed to sync from OpenBao | Check OpenBao connectivity and auth |

### 6.4 Alert Runbooks

Every alert links to a runbook in Grafana annotations. Runbooks follow a standard format:

```
1. Alert description and severity
2. Impact assessment (what breaks if this isn't fixed)
3. Diagnostic steps (commands to run, logs to check)
4. Remediation steps (how to fix)
5. Escalation path (who to contact if remediation fails)
6. Post-incident (documentation requirements)
```

---

## 7. Response Procedures for Monitoring Findings

### 7.1 Finding Classification

When monitoring detects an issue, it is classified as one of:

| Classification | Description | Examples | Response |
|---------------|-------------|----------|----------|
| **Security Event** | Potential security incident requiring investigation | NeuVector alert, policy violation, unauthorized access attempt | IR procedure + ISSO notification |
| **Vulnerability** | Discovered weakness requiring remediation | Trivy CRITICAL/HIGH CVE, STIG finding | Patch per SLA, update POA&M |
| **Configuration Drift** | Deviation from approved baseline | Flux drift event, manual kubectl change detected | Auto-corrected by Flux + investigate source |
| **Compliance Gap** | Missing or failing control implementation | STIG check failure, policy coverage gap | Document in POA&M, remediate per plan |
| **Operational Issue** | Non-security service degradation | Resource exhaustion, backup failure, certificate warning | Standard operational response |

### 7.2 Security Event Response

```
Detection (automated)
    |
    v
Triage (on-call engineer, <15 minutes for SEV-1)
    |
    v
Classification: Is this a security incident?
    |
    ├── YES → Activate Incident Response procedure
    │         - Contain (isolate affected namespace/service)
    │         - Notify ISSO within 1 hour
    │         - Preserve evidence (Loki logs, NeuVector captures)
    │         - Eradicate threat
    │         - Recover service
    │         - Post-incident report
    │
    └── NO → Standard operational response
              - Remediate issue
              - Document in operational log
              - Update monitoring if false positive
```

### 7.3 Vulnerability Response

```
Discovery (Trivy scan or NeuVector)
    |
    v
Classify severity (CVSS score):
    |
    ├── CRITICAL (≥9.0) → 7-day SLA
    │   - Immediate notification to ISSO
    │   - Emergency change process if exploit in the wild
    │   - Track in POA&M immediately
    │
    ├── HIGH (7.0-8.9) → 21-day SLA
    │   - Create remediation ticket
    │   - Track in weekly vulnerability report
    │   - Add to POA&M if SLA will be missed
    │
    ├── MEDIUM (4.0-6.9) → 60-day SLA
    │   - Queue for next patch cycle
    │   - Track in monthly report
    │
    └── LOW (<4.0) → 90-day SLA
        - Queue for next patch cycle
        - Track in quarterly report
```

### 7.4 Configuration Drift Response

```
Drift detected (Flux reconciliation or Kyverno)
    |
    v
Automatic correction by Flux (within 10 minutes)
    |
    v
Investigate source:
    |
    ├── Authorized change not yet in Git
    │   → Remind team of GitOps-only change process
    │   → No further action if drift was corrected
    │
    ├── Unauthorized manual change (kubectl)
    │   → Investigate who made the change (K8s audit log)
    │   → Determine if malicious or accidental
    │   → Retrain if accidental, escalate if malicious
    │   → Document in security event log
    │
    └── Flux or Kyverno malfunction
        → Investigate Flux/Kyverno logs
        → Remediate tool issue
        → Verify drift was corrected after fix
```

### 7.5 Compliance Gap Response

```
Gap identified (compliance scanner, QREV review, or SCA)
    |
    v
Assess impact:
    |
    ├── Control fully missing → Add to POA&M as CAT I
    │   - Define compensating controls
    │   - Set remediation milestone
    │   - ISSO approval required for risk acceptance
    │
    ├── Control partially implemented → Add to POA&M as CAT II
    │   - Document what is implemented
    │   - Define gap closure plan
    │   - Track remediation progress monthly
    │
    └── Control documentation gap → Add to POA&M as CAT III
        - Update documentation
        - No technical change required
        - Close at next review cycle
```

---

## 8. Quarterly Review (QREV) Integration

### 8.1 QREV Artifact Mapping

The ISCM program produces evidence that feeds directly into the quarterly QREV package submitted to the Authorizing Official:

| QREV Artifact | ISCM Data Sources | Update Process |
|---------------|-------------------|---------------|
| QREV-1: Security Plan | System inventory, control implementation status | Update component versions, new controls |
| QREV-2: Security Assessment Plan | Assessment schedule, automated test coverage | Update scope, add new automated tests |
| QREV-3: Privacy Impact Assessment | Data flow monitoring, access logs | Update data handling if changes occurred |
| QREV-4: POA&M | Vulnerability findings, compliance gaps, drift events | Update status, add new items, close remediated |
| QREV-5: Application Report | Deployment metrics, tenant onboarding, resource usage | Update with current operational data |
| QREV-6: Vulnerability Report | Trivy scans, NeuVector findings, patch compliance | Export current vulnerability data from Grafana |
| QREV-7: Deployment Artifacts | Flux status, Git changelog, infrastructure changes | Export deployment history for the quarter |

### 8.2 QREV Evidence Collection

Evidence for each quarterly review is collected from:

| Evidence Type | Collection Method | Retention |
|--------------|-------------------|-----------|
| Grafana dashboard snapshots | Scheduled export (PDF) | 3 years |
| Kyverno PolicyReports | `kubectl get policyreport -A -o json` | 3 years |
| Trivy scan summaries | Harbor API export | 3 years |
| Flux reconciliation logs | Loki query export | 3 years |
| NeuVector security events | NeuVector API export | 3 years |
| Git changelog | `git log --since` for the quarter | Permanent (Git) |
| OpenBao audit logs | Loki query export | 3 years |
| Velero backup reports | `velero backup get -o json` | 3 years |

### 8.3 Quarterly Timeline

| Week | Activity | Owner |
|------|----------|-------|
| Week 1-2 | Collect automated evidence from monitoring tools | Platform Lead |
| Week 2-3 | Update QREV documents (1-7) with current data | ISSO + Platform Lead |
| Week 3 | ISSO review and sign-off | ISSO |
| Week 4 | Submit QREV package to AO | ISSO |
| Post-submission | AO review meeting (if requested) | ISSO + Platform Lead + AO |

---

## 9. Plan Maintenance and Review

### 9.1 Review Schedule

| Review Type | Frequency | Trigger | Responsible |
|-------------|-----------|---------|-------------|
| Full ISCM plan review | Annually | Calendar | ISSO |
| Metrics review | Quarterly | QREV cycle | ISSO + Platform Lead |
| Alert threshold tuning | Monthly | Operational experience | Platform Lead |
| Dashboard review | Quarterly | New components or metrics needs | Platform Lead |
| Tool assessment | Annually | New tools available or current tools end-of-life | Platform Lead + Security |
| Post-incident review | As needed | After any security incident | ISSO + IR team |

### 9.2 Plan Update Triggers

This plan must be reviewed and updated when:

- New platform components are added or removed
- New NIST controls are brought into scope
- Monitoring tools are replaced or upgraded
- AO provides feedback or directs changes
- A security incident reveals monitoring gaps
- NIST SP 800-137 is updated
- Organizational risk tolerance changes

### 9.3 Continuous Improvement Process

```
Monitor → Detect → Respond → Learn → Improve → Monitor
```

After each quarterly review cycle:

1. Analyze metrics trends (improving or degrading?)
2. Review alert noise (too many false positives? missed events?)
3. Assess tool effectiveness (are tools providing actionable data?)
4. Update thresholds and policies based on operational experience
5. Identify new monitoring needs (new threats, new components)
6. Document improvements in next ISCM plan revision

### 9.4 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-11 | [PLACEHOLDER] | Initial plan |

### 9.5 Related Documents

| Document | Location |
|----------|----------|
| Contingency Plan | `compliance/raise/contingency-plan.md` |
| Configuration Management Plan | `compliance/raise/configuration-management-plan.md` |
| System Security Plan (QREV-1) | `compliance/raise/quarterly-review/QREV-1-security-plan.md` |
| Security Assessment Plan (QREV-2) | `compliance/raise/quarterly-review/QREV-2-security-assessment-plan.md` |
| POA&M (QREV-4) | `compliance/raise/quarterly-review/QREV-4-poam.md` |
| Vulnerability Report (QREV-6) | `compliance/raise/quarterly-review/QREV-6-vulnerability-report.md` |
| Security Categorization | `compliance/raise/security-categorization.md` |
| SLA Template | `compliance/raise/sla-template.md` |
| Architecture | `docs/architecture.md` |
| Compliance Mapping | `docs/agent-docs/compliance-mapping.md` |

### 9.6 Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Information System Security Officer | [PLACEHOLDER] | _____________ | ______ |
| Authorizing Official | [PLACEHOLDER] | _____________ | ______ |
| Platform Lead Engineer | [PLACEHOLDER] | _____________ | ______ |

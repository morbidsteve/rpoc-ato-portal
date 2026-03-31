# Configuration Management Plan

**System Name:** Secure Runtime Environment (SRE) Platform
**Document Version:** 1.0
**Date:** 2026-03-11
**Classification:** CUI // SP-CMP
**NIST Reference:** SP 800-128, *Guide for Security-Focused Configuration Management of Information Systems*
**NIST Controls:** CM-1, CM-2, CM-3, CM-4, CM-5, CM-6, CM-7, CM-8, CM-9, CM-10, CM-11

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [CM Roles and Responsibilities](#2-cm-roles-and-responsibilities)
3. [Configuration Identification](#3-configuration-identification)
4. [Configuration Change Control](#4-configuration-change-control)
5. [Configuration Monitoring](#5-configuration-monitoring)
6. [Baseline Management](#6-baseline-management)
7. [Patch Management](#7-patch-management)
8. [CM Tools and Automation](#8-cm-tools-and-automation)
9. [Plan Maintenance](#9-plan-maintenance)

---

## 1. Purpose and Scope

### 1.1 Purpose

This Configuration Management Plan (CMP) establishes the policies, processes, and procedures for managing the configuration of the Secure Runtime Environment (SRE) platform throughout its lifecycle. It defines how configuration items are identified, controlled, monitored, and audited to maintain the security posture required for Authorization to Operate (ATO) at the Moderate impact level.

This plan implements the requirements of NIST SP 800-128 and satisfies the following NIST 800-53 Rev 5 controls:

| Control | Description | Implementation |
|---------|-------------|---------------|
| CM-1 | Policy and Procedures | This document |
| CM-2 | Baseline Configuration | Git main branch + tagged releases (Section 6) |
| CM-3 | Configuration Change Control | Git pull request workflow + Flux reconciliation (Section 4) |
| CM-4 | Impact Analysis | PR review process + Flux dry-run (Section 4.4) |
| CM-5 | Access Restrictions for Change | Branch protection + RBAC + Kyverno (Section 4.5) |
| CM-6 | Configuration Settings | Ansible STIG roles + RKE2 CIS profile + Kyverno (Section 6) |
| CM-7 | Least Functionality | Kyverno policies restrict capabilities, volumes, host access (Section 6.4) |
| CM-8 | System Component Inventory | Flux tracks all components + Harbor tracks images (Section 3) |
| CM-9 | Configuration Management Plan | This document |
| CM-10 | Software Usage Restrictions | Kyverno image registry restriction + license tracking (Section 3.5) |
| CM-11 | User-Installed Software | Kyverno blocks images not from Harbor + image signature verification (Section 4.6) |

### 1.2 Scope

This plan covers all configuration items within the SRE platform:

- **Infrastructure configuration:** OpenTofu modules, Ansible roles and playbooks, Packer image definitions
- **Kubernetes cluster configuration:** RKE2 settings, node configurations, RBAC definitions
- **Platform service configuration:** Flux HelmRelease manifests, Helm chart values, Kustomizations
- **Security policy configuration:** Kyverno policies, NetworkPolicies, Istio AuthorizationPolicies
- **Application deployment configuration:** Helm chart templates, tenant deployment manifests
- **Compliance configuration:** OSCAL artifacts, STIG checklists, policy mappings

### 1.3 Configuration Management Principles

The SRE platform follows these foundational CM principles:

1. **GitOps as the single source of truth.** The Git repository defines the desired state of the entire platform. No manual changes are permitted.
2. **Infrastructure as Code.** All infrastructure is defined declaratively in OpenTofu HCL and Ansible YAML.
3. **Immutable infrastructure.** Nodes are provisioned from pre-hardened Packer images. Configuration drift is corrected by reprovisioning, not patching in place.
4. **Policy as Code.** All security and compliance policies are defined as Kyverno YAML manifests, version-controlled and testable.
5. **Continuous reconciliation.** Flux CD continuously reconciles the cluster state to match the Git repository, detecting and correcting drift automatically.

---

## 2. CM Roles and Responsibilities

### 2.1 Configuration Management Board (CMB)

The CMB reviews and approves significant configuration changes that affect the platform security posture or compliance status.

| Role | Name | Responsibility |
|------|------|---------------|
| CMB Chair | [PLACEHOLDER -- ISSO Name] | Chairs CMB meetings, final approval authority for security-impacting changes |
| Platform Lead | [PLACEHOLDER -- PLE Name] | Presents technical changes, assesses impact, implements approved changes |
| Security Engineer | [PLACEHOLDER -- SE Name] | Reviews security implications, validates compliance impact |
| Authorizing Official Representative | [PLACEHOLDER -- AOR Name] | Represents AO interests, approves changes affecting authorization boundary |

**CMB meeting schedule:** Monthly, or ad-hoc for emergency changes.

### 2.2 Operational CM Roles

| Role | Responsibility | CM Activities |
|------|---------------|---------------|
| Configuration Manager | Maintains CM plan, tracks configuration items, manages baselines | Baseline tagging, inventory updates, CM audits |
| Platform Engineers | Implement approved changes via Git pull requests | Author PRs, run validations, deploy changes |
| Security Auditor | Reviews changes for compliance impact | PR reviews for security-relevant changes, policy audits |
| Release Manager | Coordinates platform releases and version tagging | Version bumps, release notes, deployment coordination |
| Tenant Teams | Deploy applications within platform constraints | Submit app deployment PRs, manage tenant-scoped config |

### 2.3 Segregation of Duties

| Action | Who Can Perform | Who Approves | Enforced By |
|--------|----------------|-------------|-------------|
| Modify platform manifests | Platform Engineers | CMB (via PR review) | Git branch protection |
| Modify security policies | Security Engineer | ISSO (via PR review) | Git CODEOWNERS |
| Deploy to cluster | Flux CD (automated) | N/A (auto-reconcile from approved Git state) | Flux RBAC |
| Direct kubectl changes | Nobody (prohibited) | N/A | Kyverno policy |
| Modify infrastructure code | Platform Engineers | Platform Lead + Security (via PR review) | Git branch protection |
| Onboard new tenant | Platform Engineers | Platform Lead | Onboarding script + PR |

---

## 3. Configuration Identification

### 3.1 Configuration Item Categories

All configuration items (CIs) in the SRE platform are organized into these categories:

| Category | CI Type | Storage Location | Tracking Method |
|----------|---------|-----------------|-----------------|
| Infrastructure | OpenTofu modules, Ansible roles, Packer templates | `tofu/`, `ansible/`, `packer/` | Git version control |
| Cluster | RKE2 configuration, node specs | `ansible/roles/rke2-*`, `tofu/modules/` | Git + Ansible facts |
| Platform Services | HelmRelease manifests, Helm values | `platform/core/`, `platform/addons/` | Git + Flux CRDs |
| Security Policies | Kyverno policies, NetworkPolicies | `policies/`, `platform/core/*/network-policies/` | Git + Kyverno PolicyReports |
| App Templates | Helm charts for tenant use | `apps/templates/` | Git + Helm chart versions |
| Tenant Config | Per-team deployment manifests | `apps/tenants/` | Git + Flux CRDs |
| Compliance | OSCAL, STIGs, NIST mappings | `compliance/` | Git version control |

### 3.2 Platform Service Inventory

All platform services are tracked as Flux HelmRelease custom resources with pinned chart versions:

| Service | App Version | Namespace | Flux HelmRelease | NIST Controls |
|---------|------------|-----------|------------------|---------------|
| Istio | 1.25.2 | istio-system | istio | SC-8, AC-4, IA-3 |
| Kyverno | 1.13.4 | kyverno | kyverno | AC-6, CM-6, CM-7 |
| cert-manager | 1.14.4 | cert-manager | cert-manager | SC-12, IA-5 |
| Prometheus | 3.4.0 | monitoring | monitoring | AU-6, SI-4, CA-7 |
| Grafana | 11.6.0 | monitoring | monitoring | AU-6, CA-7 |
| Loki | 1.30.2 | logging | loki | AU-2, AU-4, AU-12 |
| Alloy | 1.x | logging | alloy | AU-2, AU-12 |
| Tempo | 2.7.1 | tracing | tempo | AU-2, SI-4 |
| OpenBao | 2.2.0 | openbao | openbao | SC-12, SC-28, IA-5 |
| ESO | 0.9.13 | external-secrets | external-secrets | SC-28 |
| Harbor | 2.12.3 | harbor | harbor | CM-8, SI-7, RA-5 |
| NeuVector | 5.4.3 | neuvector | neuvector | SI-3, SI-4, IR-4 |
| Keycloak | 26.3.2 | keycloak | keycloak | AC-2, IA-2, IA-8 |
| Velero | 1.17.1 | velero | velero | CP-9, CP-10 |
| MetalLB | 0.14.9 | metallb-system | metallb | SC-7 |
| CloudNativePG | 1.25.0 | cnpg-system | cloudnative-pg | CM-6, CP-9 |

**Version pinning policy:** All HelmRelease manifests specify exact chart versions. Range specifiers (`*`, `>=`, `~`) are prohibited. Version changes require a pull request with impact assessment.

### 3.3 Infrastructure Inventory

| Component | Version | Configuration Source |
|-----------|---------|---------------------|
| Proxmox VE | Current | Manual (hypervisor layer, out of scope for GitOps) |
| Rocky Linux | 9.7 (Blue Onyx) | Packer image + Ansible STIG hardening, kernel 5.14.0-611.36.1.el9_7 |
| RKE2 | v1.34.4+rke2r1 | Ansible roles: rke2-server, rke2-agent (DISA STIG-certified, FIPS 140-2) |
| containerd | 2.1.5-k3s1 | Embedded in RKE2 distribution |
| Flux CD | v1.8.0 | `platform/flux-system/gotk-components.yaml` |
| SELinux | Enforcing | Ansible os-hardening role |
| FIPS mode | Enabled | Ansible os-hardening role + RKE2 BoringCrypto |

### 3.4 Hardware Inventory

Reference: QREV-1 (System Security Plan) for authoritative hardware inventory.

| Asset | Specification | IP Address | Role |
|-------|--------------|------------|------|
| sre-lab-rke2-server-0 | 4 vCPU, 15.4 GiB RAM, 100 GB storage | 192.168.2.104 | RKE2 server (control plane + etcd) |
| sre-lab-rke2-agent-0 | 4 vCPU, 15.4 GiB RAM, 100 GB storage | 192.168.2.103 | RKE2 agent (worker) |
| sre-lab-rke2-agent-1 | 4 vCPU, 15.4 GiB RAM, 100 GB storage | 192.168.2.102 | RKE2 agent (worker) |
| MetalLB IP pool | Virtual IPs for LoadBalancer services | 192.168.2.200-210 | Ingress load balancing (Istio gateway on .200) |
| Network switch | _[Model TBD]_ | 192.168.2.1 | Layer 2/3 switching |
| Backup storage | _[Model/Capacity TBD]_ | 192.168.2.x | S3-compatible, Velero target |

### 3.5 Software License Inventory

All platform components are open-source with the following licenses:

| Component | License | Restrictions |
|-----------|---------|-------------|
| RKE2 | Apache 2.0 | None |
| Flux CD | Apache 2.0 | None |
| Istio | Apache 2.0 | None |
| Kyverno | Apache 2.0 | None |
| cert-manager | Apache 2.0 | None |
| Prometheus | Apache 2.0 | None |
| Grafana | AGPL 3.0 | Must share modifications if distributed as SaaS |
| Loki | AGPL 3.0 | Must share modifications if distributed as SaaS |
| Tempo | AGPL 3.0 | Must share modifications if distributed as SaaS |
| OpenBao | MPL 2.0 | None |
| Harbor | Apache 2.0 | None |
| NeuVector | Apache 2.0 | None |
| Keycloak | Apache 2.0 | None |
| Velero | Apache 2.0 | None |
| MetalLB | Apache 2.0 | None |
| OpenTofu | MPL 2.0 | None |

**Policy:** Only open-source software with OSI-approved licenses is used. No proprietary or BSL-licensed components are included without explicit CMB approval and AO notification.

---

## 4. Configuration Change Control

### 4.1 Change Classification

| Change Type | Examples | Approval Required | Lead Time |
|-------------|---------|-------------------|-----------|
| **Standard** | Helm chart version bump, new tenant onboarding, dashboard update | 1 PR reviewer | Same day |
| **Significant** | New platform component, Kyverno policy change, infrastructure change | 2 PR reviewers + Security | 3 business days |
| **Emergency** | Critical vulnerability patch, security incident remediation | Platform Lead verbal + post-hoc PR | Immediate |
| **Security-impacting** | RBAC changes, network policy changes, authentication changes | CMB approval + ISSO sign-off | 5 business days |

### 4.2 Change Request Process

All changes follow the Git pull request workflow:

```
1. Create feature branch (feat/, fix/, docs/, refactor/ prefix)
        |
2. Make changes, commit with conventional commit messages
        |
3. Open pull request against main branch
        |
4. Automated checks run:
   - YAML/HCL linting (task lint)
   - Kyverno policy tests (task validate)
   - Helm chart validation (helm lint)
   - OpenTofu format check (tofu fmt -check)
        |
5. Human review (per change classification):
   - Code review by qualified reviewer
   - Security review for security-impacting changes
   - ISSO approval for policy changes
        |
6. Merge to main branch
        |
7. Flux CD auto-detects change (within 10 minutes)
        |
8. Flux reconciles cluster state to match new Git state
        |
9. Health checks confirm successful deployment
        |
10. Change documented in Git history (commit log)
```

### 4.3 Conventional Commit Standards

All commits follow the Conventional Commits specification:

```
<type>(<scope>): <description>

Types: feat, fix, docs, refactor, test, chore
Scope: component name (istio, kyverno, monitoring, etc.)

Examples:
  feat(harbor): add vulnerability scan webhook notification
  fix(kyverno): correct image registry pattern matching
  docs(monitoring): update Grafana dashboard runbook
  refactor(tofu): extract common tags to locals
```

### 4.4 Impact Analysis

Before approving any change, reviewers must assess:

| Assessment Area | Method | Documented In |
|----------------|--------|--------------|
| Security impact | Review against NIST control mapping | PR description |
| Compliance impact | Check affected Kyverno policies and STIG controls | PR description |
| Availability impact | Review PodDisruptionBudgets and dependency chain | PR description |
| Rollback plan | Verify Git revert is sufficient or Velero restore needed | PR description |

**Flux dry-run for impact assessment:**
```bash
flux diff kustomization sre-core --path platform/core/<component>
```

### 4.5 Access Restrictions for Change

| Resource | Access Control | Enforcement Mechanism |
|----------|---------------|----------------------|
| Git main branch | Direct push prohibited; PR + review required | Git branch protection rules |
| Platform namespaces | Only Flux service accounts can modify | Kyverno policy (block manual kubectl) |
| Security policies | CODEOWNERS requires Security Engineer review | Git CODEOWNERS file |
| Infrastructure code | CODEOWNERS requires Platform Lead review | Git CODEOWNERS file |
| Tenant namespaces | Tenant team can modify own namespace only | Kubernetes RBAC + Kyverno |
| Cluster-admin operations | Platform Engineers only | Kubernetes RBAC (ClusterRole binding) |

### 4.6 Unauthorized Change Prevention

Multiple layers prevent unauthorized configuration changes:

1. **Git branch protection:** No direct pushes to `main`. All changes require a PR with at least one approval.

2. **Kyverno policy enforcement:** Platform resources cannot be modified via `kubectl`. Kyverno policies block creation or modification of resources in platform namespaces by non-Flux service accounts.

3. **Image registry restriction:** Kyverno policy `restrict-image-registries` ensures only images from the internal Harbor registry (`harbor.sre.internal`) can be deployed. This prevents pulling unauthorized images from public registries.

4. **Image signature verification:** Kyverno policy `verify-image-signatures` validates Cosign signatures on all container images before admission.

5. **Flux drift correction:** If someone bypasses Kyverno (e.g., with admin credentials), Flux detects the drift within 10 minutes and reverts the cluster state to match Git.

6. **Audit trail:** All Kubernetes API calls are logged via the audit policy and forwarded to Loki. All Git changes are tracked in commit history.

### 4.7 Emergency Change Process

For critical vulnerabilities or active security incidents:

1. Platform Lead or ISSO verbally approves the emergency change
2. Engineer implements the fix on an `emergency/` branch
3. PR is created with `[EMERGENCY]` prefix in the title
4. Single reviewer approves (can be the approving Lead/ISSO)
5. Merge to main; Flux deploys immediately
6. Post-hoc documentation within 24 hours:
   - Full PR description with justification
   - Impact assessment
   - CMB notification at next meeting
   - Update POA&M if applicable

---

## 5. Configuration Monitoring

### 5.1 Continuous Drift Detection

| Monitoring Layer | Tool | Frequency | Action on Drift |
|-----------------|------|-----------|-----------------|
| Kubernetes resources | Flux CD | Every 10 minutes | Auto-corrects to match Git |
| HelmRelease values | Flux CD | Every 10 minutes | Re-applies Helm values from Git |
| OS configuration | Ansible (scheduled) | Weekly | Alerts on deviation; manual re-apply |
| Security policies | Kyverno background scan | Continuous | PolicyReport updated; alert on violation |
| Runtime behavior | NeuVector | Continuous | Alerts on process/network anomalies |
| Resource configuration | Prometheus + alerts | Continuous | Alerts on unexpected changes |

### 5.2 Flux Reconciliation Monitoring

Flux reconciliation status is monitored via Prometheus metrics and Grafana dashboards:

**Key metrics:**
- `gotk_reconcile_condition` -- Reconciliation success/failure per resource
- `gotk_reconcile_duration_seconds` -- Time to reconcile each resource
- `gotk_suspend_status` -- Whether any reconciliation is suspended

**Alerts:**
- `FluxReconciliationFailure` -- Any Kustomization or HelmRelease fails to reconcile (SEV-2)
- `FluxReconciliationSuspended` -- Any resource has been suspended for >1 hour (SEV-3)
- `FluxDriftDetected` -- Cluster state differs from Git state after reconciliation (SEV-2)

### 5.3 Kyverno Policy Monitoring

Kyverno operates in two modes across the platform:

| Policy Set | Mode | Scope |
|-----------|------|-------|
| 19 ClusterPolicies | Enforce/Audit | Cluster-wide (active blocking and compliance reporting) |

**Monitoring:**
- PolicyReports are generated for all resources (including existing ones via `background: true`)
- Prometheus metrics from Kyverno Reporter track violation counts by policy, namespace, and severity
- Grafana dashboard displays real-time policy compliance status
- Alerts fire when new violations are detected in Enforce mode (indicates attempted unauthorized change)

### 5.4 NeuVector Behavioral Monitoring

NeuVector monitors runtime behavior against learned baselines:

- **Process monitoring:** Alerts when containers execute unexpected processes
- **File system monitoring:** Alerts when containers write to unexpected paths
- **Network monitoring:** Alerts when containers make unexpected network connections
- **DLP/WAF:** Detects sensitive data in network traffic (PII patterns)

All NeuVector events are forwarded to Loki via SYSLOG for centralized correlation and retention.

### 5.5 Configuration Change Audit Trail

Every configuration change produces audit records in multiple systems:

| Change Type | Audit Source | Retention |
|-------------|-------------|-----------|
| Git commit | Git history | Permanent |
| Kubernetes API call | K8s audit log in Loki | 90 days |
| Flux reconciliation | Flux events in Loki | 90 days |
| Kyverno admission | Kyverno admission log in Loki | 90 days |
| NeuVector detection | NeuVector SYSLOG in Loki | 90 days |
| OpenBao secret access | OpenBao audit log in Loki | 90 days |

---

## 6. Baseline Management

### 6.1 Platform Baseline Definition

The platform baseline is defined by the `main` branch of the Git repository. The `main` branch represents the approved, tested, and deployed configuration at all times.

**Baseline components:**

| Baseline Layer | Definition Source | Validation Method |
|---------------|------------------|-------------------|
| OS baseline | Ansible os-hardening role (DISA STIG for RHEL 9) | Compliance scanner CronJob (daily) |
| Kubernetes baseline | RKE2 CIS benchmark profile (enabled by default) | CIS benchmark scan |
| Network baseline | Istio mTLS STRICT + default-deny NetworkPolicies | Kyverno `require-network-policies` |
| Security context baseline | Kyverno `require-security-context` policy | Kyverno Enforce mode |
| Image baseline | Only `harbor.sre.internal` images, Cosign signed | Kyverno image policies |
| RBAC baseline | Keycloak groups mapped to K8s ClusterRoles | Quarterly access review |

### 6.2 Baseline Tagging

Platform releases are tagged in Git using semantic versioning:

```
v1.0.0 — Initial ATO baseline
v1.1.0 — Added new platform component
v1.0.1 — Security patch
```

**Tagging rules:**
- Major version: Breaking changes or architecture changes (CMB approval required)
- Minor version: New components or features (Standard change process)
- Patch version: Bug fixes, security patches, version bumps (Standard or Emergency)

### 6.3 OS Baseline (DISA STIG)

Rocky Linux 9.7 is hardened per the DISA STIG for RHEL 9 using the Ansible `os-hardening` role. Key hardening areas:

| Area | Configuration | STIG Reference |
|------|--------------|----------------|
| SSHD | Key-only auth, no root login, max 3 auth tries | V-257844, V-257845 |
| Audit | auditd enabled, 25 MB max log, email on space exhaustion | V-257940, V-257941 |
| Filesystem | noexec/nosuid on /tmp, /var/tmp, /dev/shm | V-257780, V-257781 |
| Kernel | IP forwarding (for K8s), ASLR, core dumps disabled | V-257900 |
| Crypto | FIPS mode enabled, FUTURE crypto policy | V-257800 |
| SELinux | Enforcing mode, targeted policy | V-257777 |
| AIDE | File integrity monitoring, daily check | V-257815 |

### 6.4 Kubernetes Baseline (Kyverno Policies)

Nineteen ClusterPolicies enforce the Kubernetes security baseline across three tiers:

**Custom Policies (SRE-specific):**

| Policy | Mode | Controls Enforced |
|--------|------|-------------------|
| `require-labels` | Enforce | CM-8 |
| `require-resource-limits` | Enforce | SC-6, CM-6 |
| `require-probes` | Enforce | SI-4, SC-5 |
| `require-security-context` | Enforce | AC-6, CM-7 |
| `require-security-categorization` | Enforce | RA-2, SC-2 |
| `require-network-policies` | Enforce | SC-7, AC-4 |
| `require-istio-sidecar` | Enforce | SC-8, AC-4 |
| `restrict-image-registries` | Enforce | CM-11, SA-10 |
| `disallow-latest-tag` | Enforce | CM-2, SI-7 |
| `verify-image-signatures` | Enforce | SI-7, SA-10 |

**Pod Security Standards — Baseline (cluster-wide):**

| Policy | Mode | Controls Enforced |
|--------|------|-------------------|
| `disallow-privileged-containers` | Enforce | AC-6, CM-7 |
| `disallow-host-namespaces` | Enforce | AC-6, SC-7 |
| `disallow-host-ports` | Enforce | AC-6, SC-7 |
| `restrict-unsafe-sysctls` | Enforce | CM-6, CM-7 |

**Pod Security Standards — Restricted (tenant namespaces):**

| Policy | Mode | Controls Enforced |
|--------|------|-------------------|
| `require-run-as-nonroot` | Enforce | AC-6, AC-6(10) |
| `require-drop-all-capabilities` | Enforce | AC-6, CM-7 |
| `restrict-volume-types` | Enforce | AC-6, CM-7 |
| `disallow-privilege-escalation` | Enforce | AC-6, AC-6(10) |

### 6.5 Deviation Management

Any deviation from the established baseline must be:

1. Documented with justification
2. Approved by the ISSO
3. Tracked in the POA&M (`compliance/raise/quarterly-review/QREV-4-poam.md`)
4. Time-limited with a remediation plan
5. Reviewed at each quarterly assessment

**Known deviations:**

| Component | Deviation | Justification | POA&M Item |
|-----------|-----------|---------------|------------|
| NeuVector | Requires privileged DaemonSet | Runtime security requires host access for process/network monitoring | Documented exception |
| Velero | Requires privileged access | Backup requires host filesystem and PV access | Documented exception |
| MetalLB | Speaker requires hostNetwork + NET_RAW | Layer 2 ARP advertisement requires host networking | Documented exception |

---

## 7. Patch Management

### 7.1 Patch Classification and SLA

| Severity | Description | Remediation SLA | Process |
|----------|-------------|-----------------|---------|
| Critical (CVSS >= 9.0) | Active exploitation or trivial exploit available | 7 calendar days | Emergency change |
| High (CVSS 7.0-8.9) | Significant vulnerability, exploit likely | 21 calendar days | Significant change |
| Medium (CVSS 4.0-6.9) | Moderate risk, exploit possible | 60 calendar days | Standard change |
| Low (CVSS < 4.0) | Minimal risk | 90 calendar days | Standard change |

### 7.2 Patch Sources and Monitoring

| Component | Vulnerability Source | Monitoring Method |
|-----------|---------------------|-------------------|
| OS packages | Rocky Linux OVAL, DISA STIG updates | Ansible `dnf check-update` (weekly) |
| Container images | Harbor + Trivy scanning | Daily re-scan of all images |
| Helm charts | Upstream release notes, GitHub advisories | Renovate Bot or manual tracking |
| Kubernetes (RKE2) | Rancher security advisories, K8s CVEs | Mailing list subscription |
| Platform components | Component-specific advisories | GitHub watch + RSS feeds |

### 7.3 OS Patch Process

```
1. Weekly: Ansible checks for available updates (dnf check-update)
2. Evaluate updates against STIG requirements
3. Test on dev environment:
   - Apply patches via Ansible playbook
   - Run compliance scanner
   - Verify RKE2 node health
4. Create PR with Ansible changes (if playbook changes needed)
5. Apply to production:
   - Rolling update: one node at a time
   - Cordon node → drain pods → patch → uncordon → verify
   - Wait for pod rescheduling before proceeding to next node
6. Verify post-patch:
   - All nodes Ready
   - Compliance scanner passes
   - Monitoring shows normal metrics
```

### 7.4 Container Image Patch Process

```
1. Harbor + Trivy identifies vulnerability in image
2. Prometheus alert fires based on severity
3. Determine fix:
   a. If upstream base image has a fix → rebuild application image with updated base
   b. If application dependency has a fix → update dependency and rebuild
   c. If no fix available → document in POA&M with compensating controls
4. Build new image → Trivy scan in CI → Cosign sign → push to Harbor
5. Update image tag in Git (apps/tenants/<team>/values.yaml)
6. Flux deploys updated image automatically
7. Verify via Harbor that new image passes scan gate
```

### 7.5 Helm Chart Version Update Process

```
1. Monitor upstream chart releases for security fixes
2. Review changelog for breaking changes
3. Test new version on dev:
   - Update chart version in HelmRelease manifest
   - Commit to feature branch
   - Flux deploys to dev
   - Validate functionality and compliance
4. Create PR to promote to main
5. Flux deploys to production
6. Monitor Grafana dashboards for anomalies post-update
```

### 7.6 Patch Reporting

Monthly patch compliance reports include:

- Number of outstanding vulnerabilities by severity
- Mean time to remediate by severity (tracked against SLA)
- Patch compliance percentage (target: 100% within SLA)
- POA&M items for vulnerabilities exceeding SLA

Reports are generated from Grafana dashboards and included in the Quarterly Review artifacts (QREV-6).

---

## 8. CM Tools and Automation

### 8.1 Tool Inventory

| Tool | Purpose | Version | Configuration Location |
|------|---------|---------|----------------------|
| Git | Version control for all configuration (github.com/morbidsteve/sre-platform) | Current | `.gitignore`, `.gitattributes` |
| Flux CD | GitOps reconciliation engine | v1.8.0 | `platform/flux-system/` |
| OpenTofu | Infrastructure provisioning | Pinned | `tofu/environments/*/versions.tf` |
| Ansible | OS hardening and RKE2 installation | Current | `ansible/ansible.cfg` |
| Packer | Immutable VM image builds | Current | `packer/` |
| Kyverno | Policy enforcement and compliance | Current | `policies/` |
| Helm | Application packaging and templating | Current | `apps/templates/` |
| Trivy | Vulnerability scanning | Current (via Harbor) | Harbor configuration |
| Cosign | Image signing and verification | Current | `scripts/generate-cosign-keypair.sh` |
| yamllint | YAML linting | Current | `.yamllint.yml` |
| ansible-lint | Ansible linting | Current | `.ansible-lint` |
| kyverno CLI | Policy testing | Current | `policies/tests/` |

### 8.2 Automation Pipeline

```
Developer pushes code
        |
        v
Git branch protection checks:
  ├── YAML lint (yamllint)
  ├── HCL format check (tofu fmt -check)
  ├── Ansible lint (ansible-lint)
  ├── Helm lint (helm lint)
  ├── Kyverno policy tests (kyverno test)
  └── Helm schema validation (helm template --validate)
        |
        v
Human review + approval
        |
        v
Merge to main
        |
        v
Flux CD detects change (within 10 minutes):
  ├── Fetches updated Git repo
  ├── Computes diff between desired and actual state
  ├── Applies changes in dependency order
  ├── Runs health checks on deployed resources
  └── Reports status via Prometheus metrics
        |
        v
Kyverno validates all new/modified resources:
  ├── Security context enforcement
  ├── Image registry restriction
  ├── Label requirements
  └── Image signature verification (audit)
        |
        v
Monitoring confirms healthy state:
  ├── Prometheus scrapes new endpoints
  ├── Grafana dashboards update
  └── AlertManager evaluates rules
```

### 8.3 Validation Commands

```bash
# Full lint suite
task lint

# Full validation suite
task validate

# Flux dry-run (show what would change)
flux diff kustomization sre-core --path platform/core/<component>

# Kyverno policy tests
kyverno test policies/tests/

# Helm chart validation
helm lint apps/templates/<chart>/
helm template test apps/templates/<chart>/ --validate

# OpenTofu plan (show infrastructure changes)
task infra-plan ENV=dev

# Compliance scan
task validate
```

---

## 9. Plan Maintenance

### 9.1 Review Schedule

| Review Activity | Frequency | Responsible | Output |
|----------------|-----------|-------------|--------|
| CMP full review | Annually | Configuration Manager + ISSO | Updated CMP document |
| Component inventory update | Quarterly | Platform Lead | Updated Section 3.2 |
| Baseline review | After each release tag | Configuration Manager | Updated Section 6 |
| Patch SLA compliance review | Monthly | Security Engineer | Patch compliance report |
| Tool version review | Quarterly | Platform Lead | Updated Section 8.1 |
| Deviation review | Quarterly | ISSO | Updated POA&M |

### 9.2 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-11 | _[NAME]_ | Initial plan |
| 1.1 | 2026-03-30 | _[NAME]_ | Updated with live platform data: real component versions, node inventory, Flux CD v1.8.0, 19 Kyverno policies, repository reference (morbidsteve/sre-platform) |

### 9.3 Related Documents

| Document | Location |
|----------|----------|
| Contingency Plan | `compliance/raise/contingency-plan.md` |
| Continuous Monitoring Plan | `compliance/raise/continuous-monitoring-plan.md` |
| System Security Plan (QREV-1) | `compliance/raise/quarterly-review/QREV-1-security-plan.md` |
| POA&M (QREV-4) | `compliance/raise/quarterly-review/QREV-4-poam.md` |
| Vulnerability Report (QREV-6) | `compliance/raise/quarterly-review/QREV-6-vulnerability-report.md` |
| Security Categorization | `compliance/raise/security-categorization.md` |
| Architecture | `docs/architecture.md` |
| NIST 800-53 Compliance Mapping | `docs/agent-docs/compliance-mapping.md` |

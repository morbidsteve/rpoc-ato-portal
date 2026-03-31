# Information System Contingency Plan (ISCP)

**System Name:** Secure Runtime Environment (SRE) Platform
**Document Version:** 1.0
**Date:** 2026-03-11
**Classification:** CUI // SP-ISCP
**NIST Reference:** SP 800-34 Rev 1, *Contingency Planning Guide for Federal Information Systems*
**NIST Controls:** CP-1, CP-2, CP-3, CP-4, CP-6, CP-7, CP-9, CP-10

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [System Description and Criticality Assessment](#2-system-description-and-criticality-assessment)
3. [Recovery Objectives](#3-recovery-objectives)
4. [Roles and Responsibilities](#4-roles-and-responsibilities)
5. [Backup Strategy](#5-backup-strategy)
6. [Recovery Procedures](#6-recovery-procedures)
7. [Alternate Processing Site](#7-alternate-processing-site)
8. [Plan Testing Schedule](#8-plan-testing-schedule)
9. [Plan Maintenance](#9-plan-maintenance)
10. [Appendices](#10-appendices)

---

## 1. Purpose and Scope

### 1.1 Purpose

This Information System Contingency Plan (ISCP) establishes procedures to recover the Secure Runtime Environment (SRE) platform following a disruption. The plan provides a coordinated strategy for restoring platform services, tenant applications, and associated data to maintain continuity of operations in accordance with NIST SP 800-34 Rev 1.

This plan satisfies the following NIST 800-53 Rev 5 controls:

| Control | Description |
|---------|-------------|
| CP-1 | Policy and Procedures |
| CP-2 | Contingency Plan |
| CP-3 | Contingency Training |
| CP-4 | Contingency Plan Testing |
| CP-6 | Alternate Storage Site |
| CP-7 | Alternate Processing Site |
| CP-9 | System Backup |
| CP-10 | System Recovery and Reconstitution |

### 1.2 Scope

This plan covers the complete SRE platform, including:

- **Infrastructure layer:** Proxmox VE hypervisor hosts, Rocky Linux 9.7 virtual machines, networking
- **Kubernetes layer:** RKE2 v1.34.4+rke2r1 cluster (1 server node, 2 agent nodes), containerd v2.1.5-k3s1
- **Platform services:** Istio v1.25.2, Kyverno v1.13.4, cert-manager v1.14.4, Prometheus v3.4.0/Grafana v11.6.0/Loki v1.30.2/Tempo v2.7.1, OpenBao v2.2.0, Harbor v2.12.3, NeuVector v5.4.3, Keycloak v26.3.2, Velero v1.17.1, MetalLB v0.14.9, External Secrets Operator v0.9.13, CloudNativePG v1.25.0, Flux CD v1.8.0
- **Tenant workloads:** All applications deployed via Flux CD GitOps
- **Data stores:** Persistent volumes, etcd cluster state, secrets vault, container registry

This plan does not cover:

- External systems that consume SRE platform APIs
- Upstream source code repositories hosted by third parties
- End-user workstations or client-side configurations

### 1.3 Applicability

This plan applies to all personnel responsible for operating, maintaining, or using the SRE platform. All team members with contingency roles must be familiar with this document and participate in testing exercises per the schedule defined in Section 8.

---

## 2. System Description and Criticality Assessment

### 2.1 System Overview

The Secure Runtime Environment (SRE) is a Kubernetes-based platform providing a hardened, compliance-ready runtime for deploying containerized applications. It is built on RKE2 (the only DISA STIG-certified Kubernetes distribution), deployed on STIG-hardened Rocky Linux 9.7 virtual machines, and managed entirely through GitOps using Flux CD.

**Deployment topology:**

| Node | Role | IP Address | Specs | Proxmox Host |
|------|------|------------|-------|--------------|
| sre-lab-rke2-server-0 | RKE2 server (control plane + etcd) | 192.168.2.104 | 4 vCPU, 15.4 GiB RAM, 100 GB | pve-node-1 |
| sre-lab-rke2-agent-0 | RKE2 agent (workload) | 192.168.2.103 | 4 vCPU, 15.4 GiB RAM, 100 GB | pve-node-2 |
| sre-lab-rke2-agent-1 | RKE2 agent (workload) | 192.168.2.102 | 4 vCPU, 15.4 GiB RAM, 100 GB | pve-node-3 |

**MetalLB IP pool:** 192.168.2.200-210
**Istio ingress gateway:** 192.168.2.200

### 2.2 Platform Components

| Component | Version | Function | Data Persistence |
|-----------|---------|----------|-----------------|
| RKE2 | v1.34.4+rke2r1 | Kubernetes distribution (DISA STIG-certified, FIPS 140-2) | etcd (embedded) |
| containerd | 2.1.5-k3s1 | Container runtime | None (stateless) |
| Flux CD | v1.8.0 | GitOps reconciliation (26 Kustomizations, 16+ HelmReleases) | Git repository (external, github.com/morbidsteve/sre-platform) |
| Istio | 1.25.2 | Service mesh, mTLS STRICT | None (stateless) |
| Kyverno | 1.13.4 | Policy enforcement (19 ClusterPolicies) | PolicyReports (in etcd) |
| cert-manager | 1.14.4 | Certificate management (internal CA) | Certificates (in etcd) |
| Prometheus | 3.4.0 | Metrics collection (26 ServiceMonitors, 15s scrape) | Persistent volume (15d) |
| Grafana | 11.6.0 | Dashboards and visualization | Persistent volume |
| Loki | 1.30.2 | Log aggregation | Persistent volume (90d) |
| Alloy | 1.x | Log collection (3 DaemonSet pods) | None (stateless) |
| Tempo | 2.7.1 | Distributed tracing | Persistent volume |
| OpenBao | 2.2.0 | Secrets management | Raft storage (persistent volume) |
| ESO | 0.9.13 | External Secrets Operator | None (syncs from OpenBao) |
| Harbor | 2.12.3 | Container registry with Trivy scanning | Persistent volume |
| NeuVector | 5.4.3 | Runtime security (3 controllers, 3 enforcers, 3 scanners) | Persistent volume |
| Keycloak | 26.3.2 | Identity and SSO (OIDC, SAML) | PostgreSQL via CloudNativePG (persistent volume) |
| CloudNativePG | 1.25.0 | PostgreSQL database operator | Persistent volume |
| Velero | 1.17.1 | Backup and restore (3 schedules: daily/weekly/monthly) | S3-compatible storage (external) |
| MetalLB | 0.14.9 | Load balancer (IP pool: 192.168.2.200-210) | None (stateless) |

### 2.3 FIPS 140-2 Impact

The system operates with FIPS 140-2 validated cryptographic modules at both the OS level (Rocky Linux 9 FIPS mode) and the Kubernetes level (RKE2 BoringCrypto). All cryptographic operations for data in transit (Istio mTLS) and data at rest (etcd encryption, OpenBao sealed storage) use FIPS-validated algorithms. Recovery procedures must preserve FIPS compliance.

### 2.4 Security Categorization

Per FIPS 199 and the system's Security Categorization (reference: `compliance/raise/security-categorization.md`):

**Overall Impact Level: MODERATE**

| Security Objective | Impact Level | Justification |
|-------------------|-------------|---------------|
| Confidentiality | Moderate | Platform processes CUI; compromise could cause serious adverse effect |
| Integrity | Moderate | Unauthorized modification of platform config could impact all tenants |
| Availability | Moderate | Extended outage disrupts mission operations but does not endanger life |

### 2.5 Critical Assets (Priority Order)

1. **etcd cluster state** -- Contains all Kubernetes resource definitions, secrets, and cluster configuration
2. **OpenBao secrets vault** -- Contains all application and platform credentials
3. **Git repository** -- Single source of truth for all platform and application configuration
4. **Harbor container registry** -- Stores all container images and SBOMs
5. **Keycloak identity database** -- User accounts, groups, OIDC client configurations
6. **Prometheus/Loki data** -- Metrics and audit logs required for compliance evidence
7. **Tenant application data** -- Persistent volumes used by deployed applications

---

## 3. Recovery Objectives

### 3.1 Recovery Time Objective (RTO)

| Tier | RTO | Components |
|------|-----|------------|
| Tier 1 -- Critical | 1 hour | RKE2 cluster, Istio, Kyverno, cert-manager |
| Tier 2 -- Essential | 2 hours | OpenBao, Keycloak, MetalLB, Flux CD |
| Tier 3 -- Supporting | 4 hours | Monitoring (Prometheus/Grafana/Loki/Tempo), NeuVector, Harbor |
| Tier 4 -- Tenant | 4 hours | Tenant applications (auto-deployed by Flux after platform services) |

**Overall RTO: 4 hours** from declaration of contingency event to full platform operational capability.

**Note on storage:** The current 3-node cluster uses local-path-provisioner for persistent volume storage. This means PV data is node-local and not replicated across nodes. If the node hosting a PV fails, that data is unavailable until the node is recovered or the PV is restored from Velero backup. This is a known limitation of the current topology and is documented in the POA&M with a recommendation to implement distributed storage (e.g., Longhorn or Rook-Ceph) for production.

### 3.2 Recovery Point Objective (RPO)

| Data Type | RPO | Justification |
|-----------|-----|---------------|
| Platform configuration | 0 (zero data loss) | All configuration stored in Git; Flux reconciles from Git as source of truth |
| Application manifests | 0 (zero data loss) | All deployment definitions stored in Git |
| Kubernetes secrets | 1 hour | OpenBao auto-backup runs hourly; ESO re-syncs on schedule |
| Persistent volume data | 1 hour | Velero scheduled backups; daily minimum, hourly for critical |
| etcd snapshots | 1 hour | RKE2 automatic snapshots every hour |
| Metrics and logs | 24 hours | Acceptable loss for observability data; compliance logs backed up daily |

### 3.3 Maximum Tolerable Downtime (MTD)

**MTD: 8 hours.** Beyond 8 hours, the disruption causes unacceptable impact to mission operations and tenant SLAs.

---

## 4. Roles and Responsibilities

### 4.1 Contingency Planning Team

| Role | Name | Contact | Responsibilities |
|------|------|---------|-----------------|
| Contingency Plan Coordinator | [PLACEHOLDER -- CPC Name] | [email] / [phone] | Maintains plan, coordinates testing, declares contingency events |
| Information System Security Officer (ISSO) | [PLACEHOLDER -- ISSO Name] | [email] / [phone] | Ensures security controls maintained during recovery, authorizes deviations |
| Platform Lead Engineer | [PLACEHOLDER -- PLE Name] | [email] / [phone] | Executes infrastructure and Kubernetes recovery procedures |
| Backup Administrator | [PLACEHOLDER -- BA Name] | [email] / [phone] | Manages Velero backups, validates restore integrity |
| Application Team Lead | [PLACEHOLDER -- ATL Name] | [email] / [phone] | Coordinates tenant application recovery validation |
| Authorizing Official (AO) | [PLACEHOLDER -- AO Name] | [email] / [phone] | Approves plan activation, authorizes alternate site usage |

### 4.2 Notification Procedures

**Severity Levels:**

| Level | Criteria | Notification Chain | Response Time |
|-------|----------|-------------------|---------------|
| SEV-1 | Full cluster loss, data breach | AO -> ISSO -> CPC -> All team | Immediate (15 min) |
| SEV-2 | Single node failure, service degradation | CPC -> PLE -> BA | 30 minutes |
| SEV-3 | Non-critical service failure | PLE -> BA | 2 hours |

**Communication channels:**

- Primary: Secure messaging platform (Slack security channel)
- Secondary: Encrypted email distribution list
- Tertiary: Phone tree (maintained by CPC)
- PagerDuty: SEV-1 alerts auto-page on-call engineer

### 4.3 Contingency Declaration Authority

The Contingency Plan Coordinator (CPC), in consultation with the ISSO, has authority to declare a contingency event and activate this plan. In the absence of the CPC, the Platform Lead Engineer assumes declaration authority. The AO must be notified within 1 hour of any declaration.

---

## 5. Backup Strategy

### 5.1 Velero Cluster Backups

Velero provides Kubernetes resource and persistent volume backup to S3-compatible storage.

**Backup schedules:**

| Schedule | Frequency | Retention | Scope |
|----------|-----------|-----------|-------|
| Daily | Every 24 hours (02:00 UTC) | 7 days | All namespaces except kube-system, flux-system |
| Weekly | Every Sunday (03:00 UTC) | 4 weeks | All namespaces except kube-system, flux-system |
| Monthly | 1st of month (04:00 UTC) | 3 months | All namespaces except kube-system, flux-system |

**Exclusions:** `kube-system` and `flux-system` are excluded because they are fully reconstructable from code. Flux CD re-creates all platform resources from the Git repository.

**Volume snapshots:** Velero uses CSI volume snapshots to capture persistent volume data at the time of backup.

### 5.2 Git Repository (Configuration as Code)

The Git repository is the authoritative source of truth for all platform state:

| Content | Repository Path | Recovery Method |
|---------|----------------|-----------------|
| Flux CD manifests | `platform/flux-system/` | Git clone + `flux bootstrap` |
| Platform services | `platform/core/` | Flux auto-reconciles from Git |
| Platform addons | `platform/addons/` | Flux auto-reconciles from Git |
| Kyverno policies | `policies/` | Flux auto-reconciles from Git |
| App templates | `apps/templates/` | Flux auto-reconciles from Git |
| Tenant configs | `apps/tenants/` | Flux auto-reconciles from Git |
| Infrastructure code | `tofu/`, `ansible/`, `packer/` | Manual execution during recovery |

**Git backup strategy:**

- Primary: Remote Git hosting service with branch protection on `main`
- Secondary: Scheduled mirror to alternate Git hosting provider (daily)
- Tertiary: Local clone on backup storage (weekly archive)
- All branches and tags preserved in backups

**RPO for Git: 0.** Since all changes flow through pull requests to the remote repository, the Git remote itself serves as the primary backup. The cluster state is derived from Git, not the other way around.

### 5.3 OpenBao Secrets Backup

| Item | Method | Frequency | Retention | Storage |
|------|--------|-----------|-----------|---------|
| Raft snapshots | `bao operator raft snapshot save` | Hourly | 7 days | S3-compatible storage (encrypted) |
| Unseal keys | Stored in `openbao-init-keys` Kubernetes Secret | On init | Permanent | Velero backup + offline copy |
| Root token | Stored in `openbao-init-keys` Kubernetes Secret | On init | Permanent | Velero backup + offline copy |

**Critical note:** OpenBao unseal keys and root token are stored as a Kubernetes Secret (`openbao-init-keys` in the `openbao` namespace). These are captured by Velero backups. An offline copy must also be maintained in a secure, physically separate location (e.g., encrypted USB drive in a safe).

### 5.4 etcd Snapshots (RKE2)

RKE2 automatically creates etcd snapshots:

| Setting | Value |
|---------|-------|
| Snapshot interval | 1 hour |
| Snapshot retention | 5 snapshots |
| Snapshot location | `/var/lib/rancher/rke2/server/db/snapshots/` on server node |
| Off-node backup | Copied to S3-compatible storage via CronJob |

etcd snapshots capture the complete Kubernetes cluster state, including all resource definitions, ConfigMaps, Secrets (encrypted at rest), and custom resources.

### 5.5 Harbor Registry Backup

| Item | Method | Frequency | Notes |
|------|--------|-----------|-------|
| Image data | Velero PV snapshot | Daily | All container images and layers |
| Database | PostgreSQL dump via CronJob | Daily | Harbor metadata, users, projects |
| Replication config | Stored in Git (HelmRelease values) | Continuous | Can re-replicate from upstream |

### 5.6 Backup Validation

| Validation Activity | Frequency | Responsible |
|---------------------|-----------|-------------|
| Velero backup completion check | Daily (automated) | Prometheus alert on failure |
| Velero restore test to isolated namespace | Monthly | Backup Administrator |
| etcd snapshot integrity verification | Weekly | Platform Lead Engineer |
| OpenBao snapshot restore test | Quarterly | Platform Lead Engineer |
| Git clone from backup source | Monthly | Backup Administrator |
| Full recovery drill | Annually | Contingency Planning Team |

---

## 6. Recovery Procedures

### 6.1 Scenario 1: Single Node Failure

**Trigger:** One RKE2 node (server or agent) becomes unavailable due to hardware failure, OS crash, or network partition.

**Impact:** Reduced cluster capacity. Pods from failed node are rescheduled to surviving nodes. If the server node fails, the Kubernetes API is unavailable until recovery.

**Procedure:**

1. **Detection** (automated, <5 minutes)
   - Prometheus node-exporter alerts on node unreachable
   - RKE2 marks node as `NotReady` after 40 seconds
   - PagerDuty SEV-2 alert fires

2. **Assessment** (manual, 15 minutes)
   - Verify node status: `kubectl get nodes`
   - Check Proxmox host health via web UI or `pvesh`
   - Determine if VM or hypervisor is the failure point

3. **Automatic Recovery** (Kubernetes-native)
   - Pod rescheduling: Kubernetes automatically reschedules pods from the failed node to healthy nodes (after 5-minute toleration)
   - PodDisruptionBudgets ensure minimum availability during rescheduling
   - Istio service mesh routes traffic away from unhealthy endpoints

4. **Node Recovery** (manual, 30-60 minutes)

   **If VM is recoverable:**
   ```bash
   # Restart VM on Proxmox
   qm start <VMID>
   # Wait for RKE2 to rejoin cluster
   kubectl get nodes --watch
   ```

   **If VM is not recoverable:**
   ```bash
   # Re-provision VM from hardened Packer image
   cd tofu/environments/dev
   tofu apply -target=module.compute.proxmox_vm_qemu.rke2_node["<node-name>"]

   # Re-apply OS hardening
   ansible-playbook -i inventory/dev/hosts.yml playbooks/harden-os.yml --limit <node-name>

   # Rejoin RKE2 cluster
   ansible-playbook -i inventory/dev/hosts.yml playbooks/install-rke2.yml --limit <node-name>
   ```

5. **Validation**
   - Confirm node is `Ready`: `kubectl get nodes`
   - Confirm all pods are running: `kubectl get pods -A | grep -v Running`
   - Confirm Flux reconciliation is healthy: `flux get kustomizations -A`
   - Confirm monitoring is receiving metrics from recovered node

**RTO for this scenario: 1 hour**

### 6.2 Scenario 2: Full Cluster Loss

**Trigger:** Complete loss of all cluster nodes due to catastrophic infrastructure failure, Proxmox host failure across all nodes, or irrecoverable cluster corruption.

**Impact:** Total platform outage. All services unavailable. Tenant applications offline.

**Procedure:**

1. **Declaration** (immediate)
   - CPC declares contingency event (SEV-1)
   - Notify AO within 1 hour
   - Activate contingency team via PagerDuty + phone tree

2. **Infrastructure Provisioning** (1-2 hours)
   ```bash
   # Provision new VMs from hardened Packer images
   cd tofu/environments/dev
   tofu apply

   # Apply OS hardening (STIG, FIPS, SELinux)
   ansible-playbook -i inventory/dev/hosts.yml playbooks/harden-os.yml

   # Install RKE2 cluster
   ansible-playbook -i inventory/dev/hosts.yml playbooks/install-rke2.yml
   ```

3. **Flux CD Bootstrap** (15 minutes)
   ```bash
   # Bootstrap Flux CD pointing to Git repository
   flux bootstrap github \
     --owner=<org> \
     --repository=sre-platform \
     --branch=main \
     --path=platform/flux-system \
     --personal

   # Verify Flux is reconciling
   flux get kustomizations -A
   ```

4. **Platform Service Recovery** (1-2 hours)

   Flux CD automatically deploys all platform services in dependency order:
   - Istio (service mesh + mTLS)
   - cert-manager (TLS certificates)
   - Kyverno (policy enforcement)
   - Monitoring stack (Prometheus, Grafana, Loki, Tempo)
   - OpenBao (secrets management)
   - External Secrets Operator
   - Harbor (container registry)
   - NeuVector (runtime security)
   - Keycloak (identity/SSO)
   - MetalLB (load balancer)
   - Velero (backup)

   Monitor progress:
   ```bash
   flux get helmreleases -A --watch
   kubectl get pods -A --watch
   ```

5. **OpenBao Recovery** (30 minutes)
   ```bash
   # Initialize OpenBao (if new install)
   kubectl exec -n openbao openbao-0 -- bao operator init

   # OR restore from Raft snapshot (if restoring data)
   kubectl exec -n openbao openbao-0 -- bao operator raft snapshot restore /path/to/snapshot

   # Unseal using saved keys
   kubectl exec -n openbao openbao-0 -- bao operator unseal <key1>
   kubectl exec -n openbao openbao-0 -- bao operator unseal <key2>
   kubectl exec -n openbao openbao-0 -- bao operator unseal <key3>
   ```

6. **Persistent Volume Data Restore** (30-60 minutes)
   ```bash
   # Restore Velero backups for stateful services
   velero restore create full-restore --from-backup <latest-daily-backup>

   # Monitor restore progress
   velero restore describe full-restore
   ```

7. **Tenant Application Recovery** (automatic)
   - Flux automatically deploys all tenant applications from `apps/tenants/`
   - External Secrets Operator syncs secrets from OpenBao
   - Applications start with restored persistent volume data

8. **Validation Checklist**
   - [ ] All nodes `Ready`: `kubectl get nodes`
   - [ ] All HelmReleases `Ready`: `flux get helmreleases -A`
   - [ ] All Kustomizations `Ready`: `flux get kustomizations -A`
   - [ ] Istio mTLS STRICT enforced: `kubectl get peerauthentication -A`
   - [ ] Kyverno policies enforcing: `kubectl get clusterpolicy`
   - [ ] OpenBao unsealed and operational: `kubectl exec -n openbao openbao-0 -- bao status`
   - [ ] Monitoring dashboards accessible via Grafana
   - [ ] Keycloak SSO functional (test login)
   - [ ] Harbor registry accessible (test image pull)
   - [ ] Tenant applications healthy (check per-tenant)
   - [ ] Compliance scanner CronJob runs successfully

**RTO for this scenario: 4 hours**

### 6.3 Scenario 3: Data Corruption

**Trigger:** Persistent volume data corrupted due to storage failure, application bug, or malicious action. Cluster infrastructure is healthy.

**Impact:** Affected service operates with corrupted data. May impact dependent services.

**Procedure:**

1. **Isolate the affected service** (immediate)
   ```bash
   # Suspend Flux reconciliation for the affected component
   flux suspend helmrelease <component> -n <namespace>

   # Scale down to prevent further corruption
   kubectl scale deployment <deployment> -n <namespace> --replicas=0
   ```

2. **Assess corruption scope** (15-30 minutes)
   - Review Loki logs for the affected service
   - Check NeuVector alerts for suspicious activity
   - Identify the point-in-time when corruption began

3. **Restore from Velero backup** (30-60 minutes)
   ```bash
   # List available backups
   velero backup get

   # Restore specific namespace to point-in-time before corruption
   velero restore create <restore-name> \
     --from-backup <backup-before-corruption> \
     --include-namespaces <namespace> \
     --restore-volumes=true

   # Monitor restore
   velero restore describe <restore-name>
   ```

4. **Resume service** (15 minutes)
   ```bash
   # Resume Flux reconciliation
   flux resume helmrelease <component> -n <namespace>

   # Verify pods are running with restored data
   kubectl get pods -n <namespace>
   ```

5. **Root cause analysis**
   - Collect Loki logs spanning the corruption window
   - Review NeuVector process and file activity reports
   - Review Kyverno PolicyReports for violations
   - Document findings in incident report

**RTO for this scenario: 2 hours**

### 6.4 Scenario 4: GitOps Repository Compromise

**Trigger:** Unauthorized modification of the Git repository (compromised credentials, malicious pull request merged, or repository hosting compromise).

**Impact:** Flux CD may deploy unauthorized changes to the cluster. Supply chain integrity compromised.

**Procedure:**

1. **Immediate containment** (within 15 minutes)
   ```bash
   # Suspend ALL Flux reconciliation immediately
   flux suspend kustomization --all -n flux-system

   # Verify no reconciliation is occurring
   flux get kustomizations -A
   ```

2. **Assess the compromise** (30-60 minutes)
   - Review Git commit history for unauthorized changes
   - Check Kyverno image verification logs (unauthorized images would be blocked)
   - Review Flux event logs: `kubectl get events -n flux-system`
   - Identify all commits made by the compromised actor

3. **Remediate Git repository** (30-60 minutes)
   ```bash
   # Revert unauthorized commits
   git revert <compromised-commit-range>

   # If full repository compromised, restore from backup
   git clone <backup-repository-url> sre-platform-restored
   # Compare and verify integrity
   ```

4. **Rotate credentials** (30 minutes)
   - Rotate Git deploy keys used by Flux
   - Rotate Cosign signing keys if image signing was compromised
   - Rotate OpenBao root token and unseal keys if vault policies were modified
   - Rotate Keycloak OIDC client secrets
   - Update all affected ExternalSecrets

5. **Re-sign container images** (if Cosign keys compromised)
   ```bash
   # Generate new Cosign keypair
   cosign generate-key-pair

   # Re-sign all images in Harbor
   scripts/generate-cosign-keypair.sh

   # Update Kyverno image verification policy with new public key
   ```

6. **Resume reconciliation** (15 minutes)
   ```bash
   # Resume Flux with verified clean repository
   flux resume kustomization --all -n flux-system

   # Force reconciliation to apply clean state
   flux reconcile kustomization sre-core -n flux-system

   # Verify cluster matches clean Git state
   flux get kustomizations -A
   flux get helmreleases -A
   ```

7. **Post-incident**
   - Enable Git repository audit logging if not already active
   - Review and tighten branch protection rules
   - Require additional code review approvals
   - File incident report per IR-6

**RTO for this scenario: 3 hours**

---

## 7. Alternate Processing Site

### 7.1 Current Configuration

The SRE platform currently operates on a 3-node Proxmox VE cluster at the primary site. The following alternate processing options are available:

| Option | Type | Activation Time | Notes |
|--------|------|-----------------|-------|
| Secondary Proxmox cluster | Warm standby | 2 hours | Requires infrastructure at alternate site |
| Cloud deployment (AWS/Azure) | Cold standby | 4 hours | OpenTofu modules support AWS and Azure |
| Air-gapped portable | Cold standby | 6 hours | Pre-built images on portable media |

### 7.2 Alternate Site Requirements

Any alternate processing site must provide:

- Minimum 3 VMs: 4 vCPU, 16 GiB RAM, 100 GB storage each (matching current node specs)
- Network connectivity with static IPs for MetalLB
- Access to S3-compatible storage for Velero backup retrieval
- Access to Git repository (primary or backup mirror)
- FIPS 140-2 compliant cryptographic modules
- Physical security controls commensurate with Moderate impact level

### 7.3 Alternate Site Activation

1. Provision infrastructure using OpenTofu (target alternate provider module)
2. Apply OS hardening via Ansible
3. Install RKE2 cluster
4. Bootstrap Flux CD from Git repository
5. Restore persistent data from Velero backups (stored on S3)
6. Update DNS / network routing to point to alternate site
7. Validate all services per Section 6.2 checklist

---

## 8. Plan Testing Schedule

### 8.1 Testing Calendar

| Test Type | Frequency | Scope | Participants | Duration |
|-----------|-----------|-------|-------------|----------|
| Tabletop exercise | Quarterly | Walk through scenarios verbally | All contingency roles | 2 hours |
| Component restore test | Monthly | Velero restore to test namespace | Backup Administrator | 1 hour |
| Backup validation | Weekly | Verify backup completion and integrity | Automated (Prometheus) | N/A |
| Partial recovery drill | Semi-annually | Recover single service from backup | PLE + BA | 4 hours |
| Full recovery drill | Annually | Complete cluster rebuild from scratch | Full contingency team | 8 hours |
| Alternate site drill | Annually | Deploy platform to alternate infrastructure | Full contingency team | 8 hours |

### 8.2 Tabletop Exercise Scenarios

Rotate through these scenarios across quarterly exercises:

1. **Q1:** Single node hardware failure during business hours
2. **Q2:** Full cluster loss with Velero backup restore
3. **Q3:** GitOps repository compromise with unauthorized deployments
4. **Q4:** Combined scenario: data corruption + network partition

### 8.3 Test Reporting

After each test:

1. Document test date, participants, and scenario
2. Record time to complete each recovery step
3. Compare actual recovery times against RTO/RPO targets
4. Identify gaps or failures in procedures
5. Update this plan based on lessons learned
6. File test report as evidence for CP-4 control (retain for 3 years)

### 8.4 Automated Restore Testing

Velero includes a restore testing CronJob that runs monthly:

1. Restores the latest daily backup to an isolated `test-restore` namespace
2. Validates that key resources exist and are healthy
3. Cleans up the test namespace
4. Reports results to Prometheus (alert on failure)

---

## 9. Plan Maintenance

### 9.1 Review Schedule

| Review Type | Frequency | Trigger | Responsible |
|-------------|-----------|---------|-------------|
| Scheduled review | Annually | Calendar | CPC |
| Post-incident review | As needed | After any contingency event | CPC + ISSO |
| Post-change review | As needed | Major platform changes (new components, architecture changes) | CPC + PLE |
| Post-test review | After each test | Test completion | CPC |

### 9.2 Change Triggers

This plan must be reviewed and updated when any of the following occur:

- Addition or removal of platform components
- Change in infrastructure topology (nodes, networking, storage)
- Change in backup strategy or retention policies
- Change in RTO/RPO requirements
- Personnel changes in contingency roles
- Lessons learned from testing or actual contingency events
- Changes to security categorization or impact level

### 9.3 Distribution

This plan is maintained in the SRE platform Git repository at `compliance/raise/contingency-plan.md`. Updates follow the standard Git pull request workflow with review by the ISSO.

Distribution list:

- Contingency Plan Coordinator
- Information System Security Officer
- Platform Lead Engineer
- Backup Administrator
- Application Team Lead
- Authorizing Official

All recipients must acknowledge receipt within 5 business days. Acknowledgment is tracked in the compliance management system.

### 9.4 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-11 | _[NAME]_ | Initial plan |
| 1.1 | 2026-03-30 | _[NAME]_ | Updated with live platform data: real node hostnames/IPs/specs (3 nodes, 4 vCPU/15.4 GiB each), Velero v1.17.1 (3 schedules), all component versions, local-path-provisioner storage note, Flux CD v1.8.0 |

---

## 10. Appendices

### Appendix A: Contact Information

*Maintained separately in a controlled-access document. Reference: [PLACEHOLDER -- contact roster location]*

### Appendix B: Backup Storage Locations

| Backup Type | Primary Location | Secondary Location |
|-------------|-----------------|-------------------|
| Velero backups | S3-compatible storage (primary) | Replicated to alternate region |
| Git repository | github.com/morbidsteve/sre-platform | _[mirror host TBD]_ |
| OpenBao snapshots | S3-compatible storage (encrypted) | Offline copy in secure storage |
| etcd snapshots | Server node local + S3 copy | Alternate storage site |
| Packer images | [PLACEHOLDER -- image registry] | Portable media (air-gap) |

### Appendix C: Recovery Runbook Quick Reference

**Single node failure:**
```
1. Check: kubectl get nodes
2. Fix VM: qm start <VMID> OR re-provision via tofu apply
3. Rejoin: ansible-playbook install-rke2.yml --limit <node>
4. Verify: kubectl get nodes && flux get helmreleases -A
```

**Full cluster rebuild:**
```
1. Provision: tofu apply
2. Harden: ansible-playbook harden-os.yml
3. Install: ansible-playbook install-rke2.yml
4. Bootstrap: flux bootstrap github ...
5. Unseal: bao operator unseal (3 keys)
6. Restore: velero restore create --from-backup <latest>
7. Validate: kubectl get pods -A && flux get kustomizations -A
```

### Appendix D: Related Documents

| Document | Location |
|----------|----------|
| Security Categorization | `compliance/raise/security-categorization.md` |
| System Security Plan (QREV-1) | `compliance/raise/quarterly-review/QREV-1-security-plan.md` |
| POA&M (QREV-4) | `compliance/raise/quarterly-review/QREV-4-poam.md` |
| Vulnerability Report (QREV-6) | `compliance/raise/quarterly-review/QREV-6-vulnerability-report.md` |
| SLA Template | `compliance/raise/sla-template.md` |
| Architecture | `docs/architecture.md` |

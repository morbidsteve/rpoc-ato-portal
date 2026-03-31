# Authorization Boundary Definition

## Secure Runtime Environment (SRE) Platform

**Document Version:** 1.1
**Date:** 2026-03-30
**System Owner:** _[NAME / ORGANIZATION]_
**eMASS ID:** _[TO BE ASSIGNED]_

---

## 1. System Description

The Secure Runtime Environment (SRE) is a Kubernetes-based DevSecOps platform that provides a hardened, compliant runtime for deploying containerized applications. It implements all 8 RAISE 2.0 security gates and seeks RPOC designation to enable rapid application deployment under the platform's ATO.

## 2. Authorization Boundary

The authorization boundary encompasses the following components. Everything INSIDE the boundary is covered by this ATO. Everything OUTSIDE is either inherited from another authorization or out of scope.

### 2.1 INSIDE the Boundary

#### Infrastructure Layer

| Component | Version | Description | Nodes |
|-----------|---------|-------------|-------|
| Rocky Linux 9 | 9.7 | STIG-hardened base OS, SELinux enforcing, FIPS enabled | All nodes |
| RKE2 | 1.34.4 | DISA STIG-certified Kubernetes distribution, FIPS 140-2 | All nodes |
| etcd | Embedded | Encrypted key-value store (part of RKE2) | Server nodes |
| MetalLB | 0.14.9 | Bare-metal LoadBalancer (IP pool: 192.168.2.200-210) | All nodes |

#### Platform Services (Deployed via Flux CD)

| Component | Version | Namespace | Purpose | NIST Controls |
|-----------|---------|-----------|---------|---------------|
| Flux CD | 1.8.0 | flux-system | GitOps continuous deployment | CM-2, CM-3, SA-10 |
| Istio | 1.25.2 | istio-system | Service mesh, mTLS STRICT, traffic management | SC-8, AC-4, AU-2 |
| Kyverno | 1.13.4 | kyverno | Policy engine, admission control (19 ClusterPolicies) | CM-7, SI-7, AC-6 |
| cert-manager | 1.14.4 | cert-manager | TLS certificate lifecycle (internal CA) | SC-12, IA-5 |
| Prometheus | 3.4.0 | monitoring | Metrics collection and alerting (26 ServiceMonitors) | SI-4, AU-6 |
| Grafana | 11.6.0 | monitoring | Observability dashboards | AU-6, CA-7 |
| AlertManager | 0.27.x | monitoring | Alert routing and notification | IR-4, SI-5 |
| Loki | 1.30.2 | logging | Log aggregation (90-day retention) | AU-4, AU-9 |
| Alloy | 1.x | logging | Log collection (3 DaemonSet pods) | AU-12, AU-3 |
| Tempo | 2.7.1 | tracing | Distributed trace storage | AU-2 |
| OpenBao | 2.2.0 | openbao | Secrets management (HA, Raft storage) | SC-28, IA-5 |
| External Secrets Operator | 0.9.13 | external-secrets | Sync secrets from OpenBao → K8s | SC-28 |
| Harbor | 2.12.3 | harbor | Container registry, Trivy scanning | CM-8, SI-7, RA-5 |
| NeuVector | 5.4.3 | neuvector | Runtime security, DLP, admission (3 controllers, 3 enforcers, 3 scanners) | SI-3, SI-4, SC-7 |
| Keycloak | 26.3.2 | keycloak | SSO/OIDC/SAML identity provider | IA-2, AC-2, AC-17 |
| Velero | 1.17.1 | velero | Backup and disaster recovery (3 schedules) | CP-9, CP-10 |
| CloudNativePG | 1.25.0 | cnpg-system | PostgreSQL database operator | CM-6, CP-9 |

#### CI/CD Pipeline Tools

| Component | Version | Location | Purpose | RAISE Gate |
|-----------|---------|----------|---------|------------|
| Semgrep | 1.102.0 | CI runner | SAST scanning | GATE 1 |
| Syft | 1.18.1 | CI runner | SBOM generation | GATE 2 |
| Gitleaks | 8.22.1 | CI runner | Secrets detection | GATE 3 |
| Trivy | 0.58.2 | CI runner + Harbor | Container vulnerability scanning | GATE 4 |
| OWASP ZAP | Latest stable | CI runner | DAST scanning | GATE 5 |
| GitHub Environments | SaaS | GitHub | ISSM manual approval gate | GATE 6 |
| Cosign | 3.8.0 | CI runner | Image signing and attestation | GATE 7 |
| GitHub Actions | SaaS | GitHub | Pipeline orchestration (SHA-pinned actions) | Supporting |
| Kaniko | 1.23.2 | CI runner | Container image builds | Supporting |

#### Data Stores

| Store | Location | Encryption | Contents |
|-------|----------|------------|----------|
| etcd | RKE2 server node | AES-CBC at rest | Kubernetes state, Secrets |
| OpenBao Raft | openbao namespace PV | AES-GCM at rest | Platform and app secrets |
| Harbor PostgreSQL | harbor namespace PV | TLS in transit | Registry metadata, scan results |
| Keycloak PostgreSQL | keycloak namespace PV | TLS in transit | Identity, SSO sessions |
| Loki Object Storage | S3-compatible / local PV | Encrypted at rest | Platform and audit logs |
| Velero Backup | S3-compatible / local PV | Encrypted at rest | Cluster state backups |
| Prometheus TSDB | monitoring namespace PV | Filesystem encryption | Metrics (15d retention) |

### 2.2 OUTSIDE the Boundary (Inherited or Out of Scope)

| Component | Responsibility | Authorization |
|-----------|---------------|---------------|
| **Physical facility** | Facility operator | Inherited — facility security authorization |
| **Proxmox VE hypervisor** | Infrastructure team | Inherited — hypervisor authorization |
| **Physical network** | Network team | Inherited — network authorization |
| **DNS infrastructure** | Network team | Inherited — network authorization |
| **GitHub (SaaS)** | GitHub Inc. | FedRAMP authorized (GitHub Enterprise) |
| **Tenant applications** | Application Owners | Separate RMF packages per RAISE |

### 2.3 Data Flows

```
                    ┌─────────────────────────────────────────────────┐
                    │           AUTHORIZATION BOUNDARY                 │
                    │                                                   │
  Developer ───────►│  GitHub ──► CI/CD Pipeline ──► Harbor            │
  (External)        │    │         (8 RAISE Gates)     │               │
                    │    │                              │               │
                    │    └──► Flux CD ◄────────────────┘               │
                    │           │                                       │
                    │           ▼                                       │
  End Users ───────►│  Istio Gateway ──► App Pods ◄── Kyverno         │
  (External)        │    (TLS)           (mTLS)        (Admission)     │
                    │    │                  │                           │
                    │    ▼                  ▼                           │
                    │  Keycloak          OpenBao                       │
                    │  (AuthN)           (Secrets)                     │
                    │    │                  │                           │
                    │    ▼                  ▼                           │
                    │  Prometheus ◄─── All Services ───► Loki          │
                    │  Grafana          (Telemetry)       (Logs)       │
                    │  AlertManager                       Tempo        │
                    │    │                                (Traces)      │
                    │    ▼                                              │
                    │  NeuVector (Runtime Security)                     │
                    │  Velero (Backup → S3)                             │
                    │                                                   │
                    └─────────────────────────────────────────────────┘
                              │                    │
                    ┌─────────┘                    └─────────┐
                    ▼                                        ▼
            Physical Facility                          Network Infra
            (INHERITED)                                (INHERITED)
```

### 2.4 External Interfaces

| Interface | Direction | Protocol | Port | Purpose | Protection |
|-----------|-----------|----------|------|---------|------------|
| HTTPS Ingress | Inbound | TLS 1.2+ | 443 | User access to apps and dashboards | Istio gateway, Keycloak SSO |
| HTTP Redirect | Inbound | HTTP | 80 | Redirect to HTTPS | Istio gateway (301 redirect) |
| Kubernetes API | Inbound | TLS 1.2+ | 6443 | Cluster management (kubectl, Flux) | RBAC, audit logging |
| SSH | Inbound | SSH | 22 | Node maintenance | Key-based auth, audit logged |
| GitHub API | Outbound | TLS 1.2+ | 443 | Git clone, CI/CD webhooks | Token auth, TLS |
| Container Pulls | Outbound | TLS 1.2+ | 443 | Upstream image replication to Harbor | Harbor replication policy |
| NTP | Outbound | NTP | 123 | Time synchronization | Standard NTP |
| DNS | Outbound | DNS/TLS | 53/853 | Name resolution | CoreDNS |

### 2.5 Ports, Protocols, and Services (PPSM)

All ports/protocols listed above must be registered in the PPSM registry per DoDI 8551.01.

| Service | Protocol | Port | Justification | PPSM Status |
|---------|----------|------|---------------|-------------|
| HTTPS | TCP | 443 | Platform and application access | _[TO REGISTER]_ |
| HTTP | TCP | 80 | HTTPS redirect only | _[TO REGISTER]_ |
| K8s API | TCP | 6443 | Kubernetes management | _[TO REGISTER]_ |
| SSH | TCP | 22 | OS-level node management | _[TO REGISTER]_ |
| etcd | TCP | 2379-2380 | Cluster state (internal only) | _[TO REGISTER]_ |
| Kubelet | TCP | 10250 | Node agent (internal only) | _[TO REGISTER]_ |
| NodePort range | TCP | 30000-32767 | K8s NodePort services (internal only) | _[TO REGISTER]_ |
| NTP | UDP | 123 | Time synchronization | _[TO REGISTER]_ |
| DNS | UDP/TCP | 53 | Name resolution | _[TO REGISTER]_ |
| Istio Pilot | TCP | 15010-15014 | Service mesh control plane (internal only) | _[TO REGISTER]_ |
| Envoy sidecar | TCP | 15001, 15006 | Istio data plane (internal only) | _[TO REGISTER]_ |

---

## 3. Hardware Inventory

| Hostname | IP Address | Role | CPU | RAM | Storage | OS | Kernel |
|----------|-----------|------|-----|-----|---------|-----|--------|
| sre-lab-rke2-server-0 | 192.168.2.104 | RKE2 Server (control plane + etcd) | 4 vCPU | 15.4 GiB | 100 GB | Rocky Linux 9.7 (Blue Onyx) | 5.14.0-611.36.1.el9_7 |
| sre-lab-rke2-agent-0 | 192.168.2.103 | RKE2 Agent (worker) | 4 vCPU | 15.4 GiB | 100 GB | Rocky Linux 9.7 (Blue Onyx) | 5.14.0-611.36.1.el9_7 |
| sre-lab-rke2-agent-1 | 192.168.2.102 | RKE2 Agent (worker) | 4 vCPU | 15.4 GiB | 100 GB | Rocky Linux 9.7 (Blue Onyx) | 5.14.0-611.36.1.el9_7 |

**Total Cluster Resources:** 12 vCPU, 46.2 GiB RAM
**Container Runtime:** containerd v2.1.5-k3s1
**Kubernetes Version:** RKE2 v1.34.4+rke2r1

---

## 4. Accreditation Boundary Justification

The boundary is drawn to encompass all components that the platform team directly controls and maintains. The boundary specifically:

1. **Includes** all Kubernetes cluster components, platform services, CI/CD pipeline tools, and data stores that the platform team operates
2. **Excludes** the physical facility and hypervisor layer, which are managed by a separate team and have their own security authorization
3. **Excludes** tenant applications, which each have their own RMF package per RAISE 2.0 — they inherit platform controls via the RPOC designation
4. **Includes** the CI/CD pipeline as a component because it implements the 8 RAISE security gates that are required for RPOC designation

This boundary aligns with the RAISE 2.0 Implementation Guide's definition of a DSOP/RPOC authorization boundary.

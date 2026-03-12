# Authorization Boundary Definition

## Secure Runtime Environment (SRE) Platform

**Document Version:** 1.0
**Date:** _____________
**System Owner:** _____________
**eMASS ID:** _____________

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
| Flux CD | 2.8.1 | flux-system | GitOps continuous deployment | CM-2, CM-3, SA-10 |
| Istio | 1.24.x | istio-system | Service mesh, mTLS, traffic management | SC-8, AC-4, AU-2 |
| Kyverno | 3.x | kyverno | Policy engine, admission control | CM-7, SI-7, AC-6 |
| cert-manager | 1.x | cert-manager | TLS certificate lifecycle | SC-12, IA-5 |
| Prometheus | 2.x | monitoring | Metrics collection and alerting | SI-4, AU-6 |
| Grafana | 11.x | monitoring | Observability dashboards | AU-6, CA-7 |
| AlertManager | 0.27.x | monitoring | Alert routing and notification | IR-4, SI-5 |
| Loki | 3.x | logging | Log aggregation | AU-4, AU-9 |
| Alloy | 1.x | logging | Log collection (DaemonSet) | AU-12, AU-3 |
| Tempo | 2.x | tracing | Distributed trace storage | AU-2 |
| OpenBao | 2.x | openbao | Secrets management (HA, Raft storage) | SC-28, IA-5 |
| External Secrets Operator | 0.x | external-secrets | Sync secrets from OpenBao → K8s | SC-28 |
| Harbor | 1.16.3 | harbor | Container registry, Trivy scanning | CM-8, SI-7, RA-5 |
| NeuVector | 5.x | neuvector | Runtime security, DLP, admission | SI-3, SI-4, SC-7 |
| Keycloak | 24.8.1 | keycloak | SSO/OIDC identity provider | IA-2, AC-2, AC-17 |
| Velero | 1.x | velero | Backup and disaster recovery | CP-9, CP-10 |

#### CI/CD Pipeline Tools

| Component | Version | Location | Purpose | RAISE Gate |
|-----------|---------|----------|---------|------------|
| Semgrep | 1.102.0 | CI runner | SAST scanning | GATE 1 |
| Syft | 1.18.1 | CI runner | SBOM generation | GATE 2 |
| Gitleaks | 8.21.2 | CI runner | Secrets detection | GATE 3 |
| Trivy | 0.58.2 | CI runner + Harbor | Container vulnerability scanning | GATE 4 |
| OWASP ZAP | 2.15.0 | CI runner | DAST scanning | GATE 5 |
| GitHub Environments | SaaS | GitHub | ISSM manual approval gate | GATE 6 |
| Cosign | 2.4.1 | CI runner | Image signing and attestation | GATE 7 |
| GitHub Actions | SaaS | GitHub | Pipeline orchestration | Supporting |
| Docker Buildx | 0.18.x | CI runner | Container image builds | Supporting |

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

| Hostname | IP Address | Role | CPU | RAM | Storage | OS |
|----------|-----------|------|-----|-----|---------|-----|
| sre-cp-1 | 192.168.2.10 | RKE2 Server (control plane) | _[SPEC]_ | _[SPEC]_ | _[SPEC]_ | Rocky Linux 9.7 |
| sre-worker-1 | 192.168.2.11 | RKE2 Agent (worker) | _[SPEC]_ | _[SPEC]_ | _[SPEC]_ | Rocky Linux 9.7 |
| sre-worker-2 | 192.168.2.12 | RKE2 Agent (worker) | _[SPEC]_ | _[SPEC]_ | _[SPEC]_ | Rocky Linux 9.7 |

---

## 4. Accreditation Boundary Justification

The boundary is drawn to encompass all components that the platform team directly controls and maintains. The boundary specifically:

1. **Includes** all Kubernetes cluster components, platform services, CI/CD pipeline tools, and data stores that the platform team operates
2. **Excludes** the physical facility and hypervisor layer, which are managed by a separate team and have their own security authorization
3. **Excludes** tenant applications, which each have their own RMF package per RAISE 2.0 — they inherit platform controls via the RPOC designation
4. **Includes** the CI/CD pipeline as a component because it implements the 8 RAISE security gates that are required for RPOC designation

This boundary aligns with the RAISE 2.0 Implementation Guide's definition of a DSOP/RPOC authorization boundary.

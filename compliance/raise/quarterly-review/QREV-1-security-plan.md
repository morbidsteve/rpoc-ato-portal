# QREV-1: Security Plan

## RPOC Quarterly Review Artifact

**Review Period:** _[Q1/Q2/Q3/Q4 YYYY]_
**RPOC:** Secure Runtime Environment (SRE)
**ISSM:** _[NAME]_
**Date Prepared:** _[DATE]_

---

## System Description

The Secure Runtime Environment (SRE) is a Kubernetes-based DevSecOps platform providing a hardened, compliant runtime for deploying containerized applications. It is designated as a RAISE Platform of Choice (RPOC) under eMASS/MCAST ID _[ID]_.

## Software List

### Platform Components

| Component | Version | Chart Version | Purpose |
|-----------|---------|---------------|---------|
| RKE2 | 1.34.4 | N/A | Kubernetes distribution (DISA STIG-certified) |
| Istio | 1.24.x | N/A | Service mesh (mTLS, traffic management) |
| Kyverno | 3.x | N/A | Policy engine (admission control) |
| Prometheus + Grafana | kube-prometheus-stack | N/A | Monitoring and dashboards |
| Loki + Alloy | N/A | N/A | Log aggregation and collection |
| Tempo | N/A | N/A | Distributed tracing |
| cert-manager | N/A | N/A | TLS certificate management |
| OpenBao | N/A | N/A | Secrets management |
| External Secrets Operator | N/A | N/A | Kubernetes secret sync |
| Harbor | 1.16.3 | N/A | Container registry + Trivy scanning |
| NeuVector | 5.x | N/A | Runtime security |
| Keycloak | 24.8.1 | N/A | Identity and SSO |
| Velero | N/A | N/A | Backup and disaster recovery |
| MetalLB | 0.14.9 | N/A | Bare metal load balancer |
| Flux CD | 2.8.1 | N/A | GitOps engine |
| OAuth2 Proxy | N/A | N/A | SSO gateway |

### CI/CD Pipeline Tools

| Tool | Version | RAISE Gate |
|------|---------|------------|
| Semgrep | 1.102.0 | GATE 1 (SAST) |
| Syft | 1.18.1 | GATE 2 (SBOM) |
| Gitleaks | 8.21.2 | GATE 3 (Secrets) |
| Trivy | 0.58.2 | GATE 4 (CSS) |
| OWASP ZAP | 2.15.0 | GATE 5 (DAST) |
| Cosign | 2.4.1 | GATE 7 (Signing) |

## Architectural Diagrams

Refer to:
- `docs/architecture.md` — Full architecture specification
- Network diagram: _[Attach or reference Visio/Draw.io file]_
- Data flow diagram: `compliance/oscal/ssp.json` (data-flow section)

## Ports, Protocols, and Services Management (PPSM)

| Port | Protocol | Service | Direction | Source | Destination |
|------|----------|---------|-----------|--------|-------------|
| 443 | TCP/TLS | HTTPS Ingress | Inbound | External clients | Istio Gateway (MetalLB VIP) |
| 80 | TCP | HTTP Redirect | Inbound | External clients | Istio Gateway (redirect to 443) |
| 6443 | TCP/TLS | Kubernetes API | Inbound | Admin workstations | RKE2 API server |
| 9345 | TCP/TLS | RKE2 Join | Internal | Worker nodes | Control plane |
| 10250 | TCP/TLS | Kubelet API | Internal | Control plane | Worker nodes |
| 2379-2380 | TCP/TLS | etcd | Internal | Control plane | Control plane |
| 15012 | TCP/mTLS | Istio xDS | Internal | Sidecars | istiod |
| 15017 | TCP/TLS | Istio Webhook | Internal | API server | istiod |

All internal service-to-service communication is encrypted via Istio mTLS STRICT mode.

## Changes Since Last Review

_[Document any changes to the platform architecture, components, or configuration since the last quarterly review.]_

| Change | Date | Description | Impact |
|--------|------|-------------|--------|
| | | | |

# Application STIG Checklist

## Per RAISE 2.0 — APPO-10

**Application:** _[APPLICATION NAME]_
**Team:** _[TEAM NAME]_
**Version:** _[VERSION]_
**Date:** _[DATE]_

---

## Instructions

Complete this checklist for each application deployed on the SRE RPOC. Items marked "Platform" are inherited from the RPOC and do not require application-level action. Items marked "Application" must be addressed by the Application Owner.

## Container Security (NIST SP 800-190)

### Image Hardening

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 1 | Base image from approved registry (Harbor) | Platform (Kyverno enforces) | [ ] Pass | |
| 2 | No :latest tags — pinned versions only | Platform (Kyverno enforces) | [ ] Pass | |
| 3 | Image signed with Cosign | Platform (CI/CD pipeline) | [ ] Pass | |
| 4 | Image scanned with Trivy (no CRITICAL) | Platform (CI/CD pipeline) | [ ] Pass | |
| 5 | SBOM generated and attached | Platform (CI/CD pipeline) | [ ] Pass | |
| 6 | Minimal base image (distroless/alpine) | Application | [ ] | Base image: _[IMAGE]_ |
| 7 | No unnecessary packages installed | Application | [ ] | |
| 8 | No secrets baked into image | Platform (Gitleaks) + Application | [ ] | |

### Runtime Security Context

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 9 | runAsNonRoot: true | Platform (Kyverno enforces) | [ ] Pass | |
| 10 | allowPrivilegeEscalation: false | Platform (Kyverno enforces) | [ ] Pass | |
| 11 | readOnlyRootFilesystem: true | Application (recommended) | [ ] | |
| 12 | capabilities: drop ALL | Platform (Kyverno enforces) | [ ] Pass | |
| 13 | automountServiceAccountToken: false | Application (Helm chart default) | [ ] | |
| 14 | seccompProfile: RuntimeDefault | Application (Helm chart default) | [ ] | |

### Network Security

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 15 | NetworkPolicy: default deny all | Platform (tenant onboarding) | [ ] Pass | |
| 16 | Explicit ingress/egress rules | Application | [ ] | |
| 17 | Istio sidecar injection enabled | Platform (namespace label) | [ ] Pass | |
| 18 | mTLS STRICT mode | Platform (PeerAuthentication) | [ ] Pass | |
| 19 | AuthorizationPolicy (if API) | Application (if applicable) | [ ] | |

### Secrets Management

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 20 | Secrets via ExternalSecret (OpenBao) | Application | [ ] | |
| 21 | No secrets in environment variables | Application | [ ] | |
| 22 | No secrets in ConfigMaps | Application | [ ] | |
| 23 | Secret rotation configured | Application | [ ] | Interval: _[TIME]_ |

### Monitoring and Logging

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 24 | Structured JSON logs to stdout/stderr | Application | [ ] | |
| 25 | ServiceMonitor for Prometheus | Application (Helm chart) | [ ] | Metrics path: _[PATH]_ |
| 26 | Liveness probe configured | Application | [ ] | Path: _[PATH]_ |
| 27 | Readiness probe configured | Application | [ ] | Path: _[PATH]_ |

### Availability

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 28 | Resource requests and limits set | Platform (Kyverno enforces) | [ ] Pass | |
| 29 | HorizontalPodAutoscaler configured | Application (Helm chart) | [ ] | Min: _[N]_ Max: _[N]_ |
| 30 | PodDisruptionBudget configured | Application (Helm chart) | [ ] | minAvailable: _[N]_ |
| 31 | Multiple replicas (no single point of failure) | Application | [ ] | Replicas: _[N]_ |

### Labels and Metadata

| # | Requirement | Responsibility | Status | Notes |
|---|------------|----------------|--------|-------|
| 32 | app.kubernetes.io/name | Platform (Kyverno enforces) | [ ] Pass | |
| 33 | app.kubernetes.io/part-of | Platform (Kyverno enforces) | [ ] Pass | |
| 34 | sre.io/team | Platform (Kyverno enforces) | [ ] Pass | |

---

## Summary

| Category | Total | Pass | Fail | N/A |
|----------|-------|------|------|-----|
| Image Hardening | 8 | | | |
| Runtime Security | 6 | | | |
| Network Security | 5 | | | |
| Secrets Management | 4 | | | |
| Monitoring/Logging | 4 | | | |
| Availability | 4 | | | |
| Labels/Metadata | 3 | | | |
| **Total** | **34** | | | |

---

**Completed By:** _[NAME]_ **Date:** _[DATE]_
**Reviewed By (ISSM):** _[NAME]_ **Date:** _[DATE]_

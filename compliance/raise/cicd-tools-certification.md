# CI/CD Pipeline Tools Certification Request

## Per RAISE 2.0 Implementation Guide, Appendix D

---

**From:** _[ORGANIZATION NAME]_
**To:** _[ORGANIZATION NAME]_ Technical Authority
**Cc:** _[AUTHORIZING OFFICIAL]_

**Subj:** Secure Runtime Environment (SRE) with _[eMASS/MCAST ID]_ is requesting certification for usability and functional capability of their Continuous Integration / Continuous Delivery (CI/CD) pipeline tools.

**Ref:**
- (a) Rapid Assess and Incorporate for Software Engineering (RAISE) Platform of Choice (RPOC) Guidance
- (b) Navy Risk Management Framework (RMF) Process Guide

---

### 1. RPOC Information

In accordance with references (a) and (b), _[ORGANIZATION NAME]_ requests the Secure Runtime Environment (SRE) to become a RAISE Platform of Choice.

#### a) Authorization Status

SRE has an _[active / seeking]_ _[eMASS/MCAST ID]_ authorization with security category impact levels of **Moderate-Moderate-Moderate** for Confidentiality, Integrity, and Availability, respectively; and at a classification level of up to and including **Unclassified** as described in the Security Plan.

#### b) RPOC Components

The SRE platform seeking to become an RPOC is comprised of the following authorized components:

| Component | eMASS/MCAST ID | Description |
|-----------|----------------|-------------|
| SRE Production Environment | _[ID]_ | Production Kubernetes cluster (RKE2) |
| SRE Staging Environment | _[ID]_ | Pre-production validation environment |
| SRE Development Environment | _[ID]_ | Development and testing environment |
| SRE CI/CD Tools | _[ID]_ | Pipeline tools and artifact storage |

#### c) CI/CD Pipeline Tools

SRE with _[eMASS/MCAST ID]_ is seeking certification for usability and functionality of the CI/CD pipeline tools listed below:

| # | Tool | Version | RAISE Gate | Purpose |
|---|------|---------|------------|---------|
| 1 | Semgrep | 1.102.0 | GATE 1 (SAST) | Static application security testing for source code |
| 2 | Syft | 1.18.1 | GATE 2 (SBOM) | Software Bill of Materials generation (SPDX + CycloneDX) |
| 3 | Gitleaks | 8.22.1 | GATE 3 (Secrets) | Secrets and credential detection in source code |
| 4 | Trivy | 0.58.2 | GATE 4 (CSS) | Container image vulnerability scanning |
| 5 | OWASP ZAP | Latest stable | GATE 5 (DAST) | Dynamic application security testing |
| 6 | GitHub Environments | N/A | GATE 6 (ISSM Review) | Manual approval gate with required reviewers |
| 7 | Cosign (Sigstore) | 3.8.0 | GATE 7 (Signing) | Container image signing with key-based verification |
| 8 | Harbor | 2.12.3 | GATE 8 (Artifact Repo) | OCI-compliant container registry with Trivy scanning |

### Supporting Tools and Services

| # | Tool/Service | Version | Purpose |
|---|-------------|---------|---------|
| 9 | GitHub Actions | N/A | CI/CD pipeline orchestration (reusable workflows, SHA-pinned actions) |
| 10 | GitLab CI | N/A | Alternative CI/CD pipeline orchestration |
| 11 | Flux CD | 1.8.0 | GitOps continuous deployment |
| 12 | Kyverno | 1.13.4 | Admission control — image signature verification (19 ClusterPolicies) |
| 13 | NeuVector | 5.4.3 | Runtime container security scanning (3 controllers, 3 enforcers, 3 scanners) |
| 14 | Kaniko | 1.23.2 | Container image builds |

---

### 2. Security Gate Mapping

| RAISE Gate | Tool | Input | Output | Fail Criteria |
|------------|------|-------|--------|---------------|
| GATE 1: SAST | Semgrep | Application source code | SARIF report | ERROR-level findings |
| GATE 2: SBOM | Syft | Container image | SPDX JSON, CycloneDX JSON | Generation failure |
| GATE 3: Secrets | Gitleaks | Git repository + working tree | JSON report | Any secret detected |
| GATE 4: CSS | Trivy | Container image | SARIF report, JSON report | CRITICAL findings (configurable) |
| GATE 5: DAST | OWASP ZAP | Running application URL | HTML + JSON report | HIGH-risk alerts |
| GATE 6: ISSM Review | GitHub Environment | All scan artifacts | Manual approval | ISSM rejects |
| GATE 7: Signing | Cosign | Container image in registry | Cosign signature + attestations | Signing failure |
| GATE 8: Storage | Harbor | Signed container image | OCI artifact in registry | Push failure |

---

### 3. Pipeline Flow

```
Developer pushes version tag (e.g., v1.2.3)
    |
    v
[GATE 3] Gitleaks: Scan for leaked secrets
    |
    v
[GATE 1] Semgrep: SAST scan of source code
    |
    v
[Build] Kaniko: Build container image
    |
    v
[GATE 4] Trivy: Container vulnerability scan
    |
    v
[GATE 2] Syft: Generate SBOM (SPDX + CycloneDX)
    |
    v
[GATE 6] ISSM Review: Manual approval gate
    |                   (pipeline pauses here)
    v
[GATE 8] Harbor: Push image to registry
    |
    v
[GATE 7] Cosign: Sign image + attach SBOM attestation
    |
    v
[Deploy] Flux CD: GitOps deployment to cluster
    |
    v
[GATE 5] OWASP ZAP: DAST scan against deployed app
```

---

### 4. Attestations and Artifacts

Each release produces the following compliance artifacts:

| Artifact | Format | Storage | Retention |
|----------|--------|---------|-----------|
| SAST Report | SARIF JSON | GitHub Security tab | 90 days |
| Secrets Scan Report | JSON | CI/CD artifacts | 90 days |
| Container Scan Report | SARIF JSON | GitHub Security tab + Harbor | 90 days |
| SBOM | SPDX JSON + CycloneDX JSON | Harbor (OCI artifact) | Image lifetime |
| DAST Report | HTML + JSON | CI/CD artifacts | 90 days |
| Image Signature | Cosign signature | Harbor (OCI artifact) | Image lifetime |
| SBOM Attestation | Cosign attestation | Harbor (OCI artifact) | Image lifetime |
| SLSA Provenance | In-toto v0.1 / SLSA v0.2 | Harbor (OCI artifact) | Image lifetime |

---

__________________
_[First Name / Last Name]_

___________________
_[Date]_

_[ORGANIZATION NAME]_ Secure Runtime Environment (SRE)
Information Systems Security Manager (ISSM)

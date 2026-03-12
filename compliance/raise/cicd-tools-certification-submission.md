# CI/CD Pipeline Tools Certification Submission Package

## RAISE 2.0 — Appendix D Certification Request

> **This document is the formal submission package for Technical Authority (TA) review.**
> Print, sign, and submit along with the attached evidence artifacts.

---

**MEMORANDUM**

**From:** _______________________________ (RPOC System Owner / Organization)
**To:** _______________________________ (Technical Authority)
**Via:** _______________________________ (Authorizing Official)
**Date:** _______________________________

**Subj:** REQUEST FOR CI/CD PIPELINE TOOLS CERTIFICATION — SECURE RUNTIME ENVIRONMENT (SRE) — eMASS ID: ___________

**Ref:**
- (a) Rapid Assess and Incorporate for Software Engineering (RAISE) Implementation Guide, 1 November 2022
- (b) Navy Risk Management Framework (RMF) Process Guide
- (c) DoD Enterprise DevSecOps Fundamentals, Version 2.5, 16 October 2024
- (d) NIST SP 800-53 Rev 5, Security and Privacy Controls
- (e) DISA STIG for Kubernetes, Version 2 Release 2

**Encl:**
- (1) CI/CD Pipeline Architecture Diagram
- (2) Security Gate Evidence Package
- (3) Tool Configuration and Version Inventory
- (4) Sample Pipeline Run — Full Artifact Set
- (5) Kyverno Admission Control Policy Configuration

---

### 1. PURPOSE

In accordance with reference (a), Appendix D, this memorandum requests certification of the Secure Runtime Environment (SRE) CI/CD pipeline tools for usability and functional capability. Upon certification, SRE will meet the requirements for designation as a RAISE Platform of Choice (RPOC).

### 2. RPOC IDENTIFICATION

| Field | Value |
|-------|-------|
| **System Name** | Secure Runtime Environment (SRE) |
| **eMASS/MCAST ID** | _________________ |
| **Security Category** | Moderate-Moderate-Moderate (FIPS 199) |
| **Classification** | Unclassified / CUI |
| **System Owner** | _________________________________ |
| **ISSM** | _________________________________ |
| **ISSO** | _________________________________ |
| **AO** | _________________________________ |

### 3. RPOC COMPONENTS

The SRE platform consists of the following authorized components:

| # | Component | eMASS ID | Environment | Description |
|---|-----------|----------|-------------|-------------|
| 1 | SRE Production | _______ | Production | RKE2 Kubernetes cluster hosting tenant applications |
| 2 | SRE Staging | _______ | Staging | Pre-production validation environment |
| 3 | SRE Development | _______ | Development | Development and testing environment |
| 4 | SRE CI/CD Tools | _______ | Shared | Pipeline tools, artifact storage, signing infrastructure |

**Kubernetes Distribution:** RKE2 v1.34.4 (DISA STIG-certified, FIPS 140-2 compliant)
**Operating System:** Rocky Linux 9.7 (DISA STIG-hardened, SELinux enforcing, FIPS enabled)
**GitOps Engine:** Flux CD v2.8.1

### 4. CI/CD PIPELINE TOOLS — CERTIFICATION REQUEST

Per reference (a), Section 3.2, the following tools implement the 8 required RAISE security gates:

#### 4a. Security Gate Tools

| Gate | Tool | Version | License | Source | NIST 800-53 Controls |
|------|------|---------|---------|--------|---------------------|
| **GATE 1: SAST** | Semgrep OSS | 1.102.0 | LGPL-2.1 | github.com/semgrep/semgrep | SA-11, SA-15 |
| **GATE 2: SBOM** | Syft | 1.18.1 | Apache-2.0 | github.com/anchore/syft | CM-2, CM-8, SA-17 |
| **GATE 3: Secrets Detection** | Gitleaks | 8.21.2 | MIT | github.com/gitleaks/gitleaks | IA-5, SC-28 |
| **GATE 4: Container Security Scan** | Trivy | 0.58.2 | Apache-2.0 | github.com/aquasecurity/trivy | RA-5, SI-2 |
| **GATE 5: DAST** | OWASP ZAP | 2.15.0 | Apache-2.0 | github.com/zaproxy/zaproxy | SA-11, SI-10 |
| **GATE 6: ISSM Review** | GitHub Environments | N/A | SaaS | github.com | CA-2, CA-7 |
| **GATE 7: Image Signing** | Cosign (Sigstore) | 2.4.1 | Apache-2.0 | github.com/sigstore/cosign | SI-7, SA-10 |
| **GATE 8: Artifact Repository** | Harbor | 1.16.3 | Apache-2.0 | github.com/goharbor/harbor | CM-8, SI-7 |

#### 4b. Supporting Infrastructure

| Tool | Version | Purpose | NIST Controls |
|------|---------|---------|---------------|
| GitHub Actions | SaaS | CI/CD pipeline orchestration (primary) | SA-10, AU-2 |
| GitLab CI | SaaS | CI/CD pipeline orchestration (alternative) | SA-10, AU-2 |
| Flux CD | 2.8.1 | GitOps continuous deployment engine | CM-2, CM-3, SA-10 |
| Kyverno | 3.x | Kubernetes admission control — signature verification | SI-7, CM-7 |
| NeuVector | 5.x | Runtime container security monitoring | SI-3, SI-4, IR-4 |
| Docker Buildx | 0.18.x | Multi-platform container image builds | SA-10 |

### 5. PIPELINE ARCHITECTURE

The CI/CD pipeline implements all 8 RAISE security gates in the following sequence:

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: BUILD & SCAN (Automated — CI Runner)                  │
│                                                                   │
│  Developer pushes version tag (v1.2.3)                           │
│      │                                                            │
│      ├──► [GATE 3] Gitleaks: Scan full git history + workdir     │
│      │         Output: secrets-report.json                        │
│      │         Fail: Any secret detected → pipeline stops         │
│      │                                                            │
│      ├──► [GATE 1] Semgrep: SAST scan of source code             │
│      │         Rulesets: p/owasp-top-ten, p/security-audit        │
│      │         Output: semgrep.sarif → GitHub Security tab        │
│      │         Fail: ERROR-level findings → pipeline stops        │
│      │                                                            │
│      ├──► [Build] Docker Buildx: Build container image            │
│      │                                                            │
│      ├──► [GATE 4] Trivy: Container vulnerability scan            │
│      │         Output: trivy.sarif → GitHub Security tab          │
│      │         Fail: CRITICAL findings → pipeline stops           │
│      │                                                            │
│      └──► [GATE 2] Syft: Generate SBOM                           │
│               Output: sbom-spdx.json + sbom-cyclonedx.json       │
│               Fail: Generation failure → pipeline stops           │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: ISSM REVIEW (Manual — Human Approval)                 │
│                                                                   │
│      [GATE 6] ISSM reviews all Phase 1 scan artifacts            │
│               Environment: issm-review (GitHub Environment)       │
│               Required Reviewers: ISSM + Security Team           │
│               Fail: ISSM rejects → pipeline stops                │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: SIGN & PUSH (Automated — Post-Approval)               │
│                                                                   │
│      ├──► [GATE 8] Harbor: Push image to OCI registry             │
│      │         Trivy re-scan on push (Harbor-side verification)   │
│      │                                                            │
│      ├──► [GATE 7] Cosign: Sign image with private key            │
│      │         Attach SBOM attestation (in-toto format)           │
│      │         Attach SLSA provenance attestation                 │
│      │                                                            │
│      └──► Flux CD: Update GitOps repo → auto-deploy              │
│               Kyverno verifies Cosign signature at admission      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 4: POST-DEPLOY (Automated — Against Running App)          │
│                                                                   │
│      [GATE 5] OWASP ZAP: DAST baseline scan                      │
│               Output: zap-report.html + zap-report.json           │
│               Fail: HIGH-risk alerts flagged for remediation      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6. ADMISSION CONTROL — SUPPLY CHAIN VERIFICATION

After the CI/CD pipeline produces a signed image, the Kubernetes cluster enforces supply chain integrity at admission:

1. **Kyverno `verify-image-signatures` ClusterPolicy** — Verifies every pod's image has a valid Cosign signature from the pipeline's signing key before allowing creation
2. **Kyverno `restrict-image-registries` ClusterPolicy** — Only images from `harbor.sre.internal` are permitted
3. **Kyverno `disallow-latest-tag` ClusterPolicy** — All images must use pinned version tags
4. **Harbor Trivy scan** — Images are re-scanned on push as a second layer of verification

This ensures that **only images that passed all 8 security gates can run on the platform**.

### 7. ARTIFACTS PRODUCED PER RELEASE

| Artifact | Format | Storage Location | Retention |
|----------|--------|-----------------|-----------|
| SAST Report | SARIF JSON | GitHub Security tab | 90 days |
| Secrets Scan | JSON | CI/CD artifacts | 90 days |
| Container Scan | SARIF JSON | GitHub Security + Harbor | 90 days |
| SBOM (SPDX) | SPDX 2.3 JSON | Harbor OCI artifact | Image lifetime |
| SBOM (CycloneDX) | CycloneDX 1.5 JSON | Harbor OCI artifact | Image lifetime |
| DAST Report | HTML + JSON | CI/CD artifacts | 90 days |
| Image Signature | Cosign OCI signature | Harbor OCI artifact | Image lifetime |
| SBOM Attestation | In-toto / Cosign attestation | Harbor OCI artifact | Image lifetime |
| SLSA Provenance | SLSA v0.2 / In-toto v0.1 | Harbor OCI artifact | Image lifetime |
| ISSM Approval Record | GitHub Environment log | GitHub audit log | Indefinite |
| Pipeline Run Log | GitHub Actions log | GitHub | 90 days |

### 8. FAIL CRITERIA AND ENFORCEMENT

| Gate | Fail Condition | Enforcement |
|------|---------------|-------------|
| GATE 1 | Semgrep ERROR findings | Pipeline aborts, no image built |
| GATE 2 | SBOM generation fails | Pipeline aborts, no image pushed |
| GATE 3 | Any secret detected | Pipeline aborts, credential rotation required |
| GATE 4 | CRITICAL CVE in image | Pipeline aborts, base image update required |
| GATE 5 | HIGH-risk DAST alerts | Finding tracked, remediation required per SLA |
| GATE 6 | ISSM rejects | Pipeline aborts, developer fixes and resubmits |
| GATE 7 | Signing failure | Image not deployable (Kyverno blocks unsigned) |
| GATE 8 | Push failure | Image not available for deployment |

### 9. EVIDENCE PACKAGE (ENCLOSURES)

The following evidence is attached or available upon request:

#### Enclosure (1): Pipeline Architecture
- Pipeline workflow files: `ci/github-actions/build-scan-deploy.yaml`
- GitLab CI equivalent: `ci/gitlab-ci/build-scan-deploy.gitlab-ci.yml`
- DAST workflow: `ci/github-actions/dast-scan.yaml`
- GitOps update workflow: `ci/github-actions/update-gitops.yaml`

#### Enclosure (2): Security Gate Evidence
- [ ] Sample SAST report (Semgrep SARIF output)
- [ ] Sample secrets scan report (Gitleaks JSON output)
- [ ] Sample container scan report (Trivy SARIF output)
- [ ] Sample SBOM (SPDX JSON + CycloneDX JSON)
- [ ] Sample DAST report (OWASP ZAP HTML output)
- [ ] Sample ISSM approval log (GitHub Environment deployment log)
- [ ] Sample signed image verification (`cosign verify` output)

#### Enclosure (3): Tool Inventory
- Complete tool listing with versions, licenses, and download sources (Section 4 above)
- Tool update and patching process documentation

#### Enclosure (4): Sample Pipeline Run
- [ ] Complete CI/CD run log showing all 8 gates passing
- [ ] Artifact download links for all outputs
- [ ] Timeline showing gate execution sequence

#### Enclosure (5): Admission Control Configuration
- Kyverno `verify-image-signatures` policy YAML
- Kyverno `restrict-image-registries` policy YAML
- Harbor project configuration with Trivy scanning enabled
- `cosign verify` command demonstrating signature validation

### 10. POINT OF CONTACT

| Role | Name | Email | Phone |
|------|------|-------|-------|
| System Owner | _________________ | _________________ | _________________ |
| ISSM | _________________ | _________________ | _________________ |
| ISSO | _________________ | _________________ | _________________ |
| Lead Engineer | _________________ | _________________ | _________________ |

### 11. CERTIFICATION REQUEST

I certify that the CI/CD pipeline tools listed in Section 4 have been configured, tested, and validated to implement all 8 RAISE security gates as defined in reference (a). The pipeline enforces automated security scanning, manual ISSM review, cryptographic image signing, and admission control verification for all container images deployed to the SRE platform.

I request the Technical Authority review and certify these tools for use in the SRE RPOC.

---

**RPOC System Owner / ISSM:**

Signature: _________________________________

Printed Name: _________________________________

Title: _________________________________

Date: _________________________________

Organization: _________________________________

---

**Technical Authority Disposition:**

[ ] **CERTIFIED** — CI/CD pipeline tools meet RAISE requirements
[ ] **CERTIFIED WITH CONDITIONS** — See comments below
[ ] **NOT CERTIFIED** — See deficiencies below

Comments: _________________________________

Signature: _________________________________

Printed Name: _________________________________

Title: _________________________________

Date: _________________________________

---

## APPENDIX A: HOW TO GENERATE EVIDENCE

Run these commands to collect evidence artifacts for the submission package:

```bash
# 1. Run a complete pipeline (triggers all 8 gates)
git tag v1.0.0-cert && git push origin v1.0.0-cert

# 2. After pipeline completes, download artifacts from GitHub Actions run

# 3. Verify image signature
cosign verify --key cosign.pub harbor.sre.internal/team-alpha/demo-app:v1.0.0-cert

# 4. Verify SBOM attestation
cosign verify-attestation --key cosign.pub \
  --type spdxjson harbor.sre.internal/team-alpha/demo-app:v1.0.0-cert

# 5. Verify SLSA provenance
cosign verify-attestation --key cosign.pub \
  --type slsaprovenance harbor.sre.internal/team-alpha/demo-app:v1.0.0-cert

# 6. Show Kyverno admission policy
kubectl get clusterpolicy verify-image-signatures -o yaml

# 7. Show image registry restriction
kubectl get clusterpolicy restrict-image-registries -o yaml

# 8. Export Harbor scan results
# Harbor UI > Project > Repository > Artifacts > View scan results

# 9. Export Kyverno policy reports
kubectl get policyreport -A -o yaml > kyverno-policy-reports.yaml
kubectl get clusterpolicyreport -o yaml > kyverno-cluster-policy-reports.yaml
```

## APPENDIX B: TOOL UPDATE PROCESS

When a CI/CD tool requires a version update:

1. Test updated tool in the development environment pipeline
2. Verify all 8 gates still function correctly with the new version
3. Update version pin in pipeline workflow files
4. Document the change in the CHANGELOG
5. Notify the ISSM of the tool version change
6. If a tool is being **replaced** (not just updated), coordinate with the SCA and AO per SLA Section 16

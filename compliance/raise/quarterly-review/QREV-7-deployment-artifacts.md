# QREV-7: Application Deployment Artifacts

## RPOC Quarterly Review Artifact

**Review Period:** _[Q1/Q2/Q3/Q4 YYYY]_

---

## Instructions

For each application deployed via the RAISE process this quarter, provide the following artifacts. These are generated automatically by the CI/CD pipeline and stored in Harbor and GitHub/GitLab.

## Per-Application Artifact Checklist

### Application: _[NAME]_

**Team:** _[TEAM]_
**Version Deployed:** _[TAG]_
**Deploy Date:** _[DATE]_

| # | Artifact | Required? | Provided? | Location |
|---|----------|-----------|-----------|----------|
| 1 | SRG/STIG Checklist | Yes | [ ] | `compliance/raise/app-owner-package/` |
| 2 | SAST Report (Semgrep) | Yes (custom code) | [ ] | GitHub Security tab / CI artifacts |
| 3 | DAST Report (ZAP) | Yes | [ ] | CI artifacts |
| 4 | Container Security Scan (Trivy) | Yes | [ ] | Harbor scan results / CI artifacts |
| 5 | SBOM (SPDX + CycloneDX) | Yes | [ ] | Harbor OCI artifact (Cosign attestation) |
| 6 | Image Signature | Yes | [ ] | Harbor OCI artifact (Cosign signature) |
| 7 | SLSA Provenance | Yes | [ ] | Harbor OCI artifact (Cosign attestation) |
| 8 | ISSM Review Approval | Yes | [ ] | GitHub Environment approval log |
| 9 | Mitigation Statements | If findings exist | [ ] | Per POA&M |
| 10 | README | Yes | [ ] | Application code repository |
| 11 | CHANGELOG | Yes | [ ] | Application code repository |
| 12 | Architecture Diagram | Yes | [ ] | Provided by App Owner |

## How to Retrieve Artifacts

### SAST Report
```bash
# GitHub: Settings > Security > Code scanning alerts
# Or download from CI workflow run artifacts
```

### Container Scan Report
```bash
# Harbor UI: Projects > [team] > [image] > [tag] > Vulnerabilities
# Or via API:
curl -u admin:Harbor12345 \
  "https://harbor.apps.sre.example.com/api/v2.0/projects/team-alpha/repositories/my-app/artifacts/v1.2.3/additions/vulnerabilities"
```

### SBOM
```bash
# Retrieve from Harbor via Cosign:
cosign verify-attestation --type spdxjson \
  --key cosign.pub \
  harbor.sre.internal/team-alpha/my-app:v1.2.3
```

### Image Signature Verification
```bash
cosign verify --key cosign.pub \
  harbor.sre.internal/team-alpha/my-app:v1.2.3
```

### ISSM Approval Record
```bash
# GitHub: Actions > [workflow run] > issm-review job > Environment approval log
# GitLab: CI/CD > Pipelines > [pipeline] > issm-approval manual job
```

## Consolidated Artifact Matrix

_Fill in for all applications deployed this quarter._

| Application | Version | SAST | DAST | CSS | SBOM | Signed | ISSM | STIG |
|-------------|---------|------|------|-----|------|--------|------|------|
| | | | | | | | | |

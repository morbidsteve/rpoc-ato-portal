# RAISE 2.0 RPOC Compliance Package

This directory contains all documents and templates required for the SRE platform to achieve and maintain **RAISE Platform of Choice (RPOC)** designation per the RAISE 2.0 Implementation Guide.

## Directory Structure

```
compliance/raise/
├── README.md                          # This file
├── sla-template.md                    # SLA template (RAISE Appendix C)
├── poam-template.md                   # POA&M tracking template
├── cicd-tools-certification.md        # TA certification request (RAISE Appendix D)
├── security-categorization.md         # FIPS 199 security categorization
├── incident-response-plan.md         # IRP per NIST SP 800-61 / DAAPM Appendix Q
├── quarterly-review/                  # Quarterly review artifacts (QREV 1-7)
│   ├── QREV-1-security-plan.md
│   ├── QREV-2-security-assessment-plan.md
│   ├── QREV-3-privacy-impact-assessment.md
│   ├── QREV-4-poam.md
│   ├── QREV-5-application-report.md
│   ├── QREV-6-vulnerability-report.md
│   └── QREV-7-deployment-artifacts.md
└── app-owner-package/                 # Templates for application owners
    ├── vulnerability-management-plan-template.md
    ├── mitigation-statement-template.md
    ├── app-stig-checklist-template.md
    ├── changelog-template.md
    └── application-architecture-template.md
```

## RPOC Designation Process

```
1. Complete all 8 Security Gates in CI/CD pipeline     ✅ Done
2. Fill out CI/CD Tools Certification Request           → cicd-tools-certification.md
3. Submit to Technical Authority (TA) for assessment    → Send to TA
4. Mark inheritable controls in RMF package             → eMASS/MCAST
5. AO reviews and approves RPOC designation             → AO meeting
6. Schedule first quarterly review                      → QREV templates
```

## Security Gates (All 8 Implemented)

| Gate | Tool | Pipeline Location |
|------|------|-------------------|
| GATE 1: SAST | Semgrep | ci/github-actions/build-scan-deploy.yaml |
| GATE 2: SBOM | Syft | ci/github-actions/build-scan-deploy.yaml |
| GATE 3: Secrets | Gitleaks | ci/github-actions/build-scan-deploy.yaml |
| GATE 4: CSS | Trivy | ci/github-actions/build-scan-deploy.yaml |
| GATE 5: DAST | OWASP ZAP | ci/github-actions/dast-scan.yaml |
| GATE 6: ISSM Review | GitHub Environment | ci/github-actions/build-scan-deploy.yaml |
| GATE 7: Signing | Cosign | ci/github-actions/build-scan-deploy.yaml |
| GATE 8: Storage | Harbor | ci/github-actions/build-scan-deploy.yaml |

## Onboarding a New Application

1. Run `scripts/onboard-tenant.sh <team-name>` to create namespace and infra
2. Have the Application Owner complete the templates in `app-owner-package/`
3. Sign the SLA (`sla-template.md`)
4. Application Owner sets up CI/CD pipeline using `ci/github-actions/example-caller.yaml`
5. First release goes through all 8 gates including ISSM review
6. Track findings in POA&M (`poam-template.md`)

## Quarterly Review Preparation

14 days before each quarterly review:

1. Update QREV-1 through QREV-7 templates
2. Run `scripts/compliance-report.sh` for automated control assessment
3. Export vulnerability dashboards from Grafana
4. Review POA&M for overdue items
5. Prepare consolidated vulnerability report from Harbor and NeuVector
6. Submit to SCA for SAR review (7 days before AO meeting)

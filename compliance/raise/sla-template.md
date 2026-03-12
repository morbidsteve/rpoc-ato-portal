# Service Level Agreement (SLA)

## Between RPOC Owner and Application Owner

**Based on RAISE 2.0 Implementation Guide, Appendix C**

---

**RPOC Name:** Secure Runtime Environment (SRE)
**RPOC eMASS/MCAST ID:** _[TO BE ASSIGNED]_
**Application Name:** _[APPLICATION NAME]_
**Application Owner:** _[NAME / ORGANIZATION]_
**RPOC ISSM:** _[NAME]_
**Date:** _[DATE]_
**SLA Version:** 1.0

---

## 1. Lifecycle Responsibility

The Application Owner is responsible for the full lifecycle of the software application from inception to decommissioning from the RPOC.

## 2. Residual Risk

Applications that do not meet the residual risk criteria as outlined in the RAISE Implementation Guide are not allowed to be deployed in, or could be removed from, production environments. **All findings must be mitigated to a residual risk not exceeding Moderate.**

## 3. System Registration

Application Owner must register their containerized software application in DADMS and DITPRDON (or equivalent system tracking ID for higher classification).

- DADMS ID: _[TO BE PROVIDED]_
- DITPRDON ID: _[TO BE PROVIDED]_

## 4. System Tracking IDs

Application Owner must provide the RPOC ISSM with the DADMS and DITPRDON information upon registration.

## 5. Security Categorization Form (SCF)

Application Owner must provide Security Categorization Form (where applicable).

- Security Category: _[e.g., Moderate-Moderate-Moderate]_
- SCF Provided: [ ] Yes [ ] N/A

## 6. Privacy Impact Assessment (PIA)

Application Owner must provide a Privacy Impact Assessment (PIA) Form.

- Handles PII: [ ] Yes [ ] No
- PIA Provided: [ ] Yes [ ] N/A

## 7. Vulnerability Reporting

Application Owner will receive **weekly** vulnerability reports or access to the monitoring dashboard from the RPOC.

- Dashboard access: Grafana (https://grafana.apps.sre.example.com)
- Harbor scan reports: https://harbor.apps.sre.example.com
- Notification channel: _[Slack channel / email distribution list]_

## 8. Vulnerability Remediation

Application Owner must review, remediate, and mitigate all findings listed in the RPOC vulnerability reports per the following timelines:

| Severity | Remediation Timeline | Escalation |
|----------|---------------------|------------|
| CRITICAL | 7 calendar days | ISSM notified immediately, AO notified at day 7 |
| HIGH | 21 calendar days | ISSM notified at day 14, workload isolated at day 21 |
| MEDIUM | 60 calendar days | ISSM review at quarterly review |
| LOW | 90 calendar days | Tracked in POA&M |

**If an exception is required for HIGH or above findings exceeding 21 days, the AO must be notified.**

## 9. Mitigation Statements

Application Owner must provide clear remediation/mitigation information for all findings to the RPOC ISSM to track in the POA&M. Use the mitigation statement template in `compliance/raise/app-owner-package/mitigation-statement-template.md`.

## 10. CI/CD Pipeline Security Gates

All application changes must pass the CI/CD pipeline security gates before deployment to production:

| Gate | Tool | Requirement |
|------|------|-------------|
| GATE 1: SAST | Semgrep | No ERROR-level findings |
| GATE 2: SBOM | Syft | SPDX JSON generated |
| GATE 3: Secrets | Gitleaks | No secrets detected |
| GATE 4: Container Scan | Trivy | No CRITICAL findings |
| GATE 5: DAST | OWASP ZAP | No HIGH-risk alerts |
| GATE 6: ISSM Review | Manual | ISSM approves release |
| GATE 7: Image Signing | Cosign | Image signed |
| GATE 8: Artifact Storage | Harbor | Image stored with SBOM |

If all tests pass, the application is placed in the Harbor artifact repository awaiting deployment via Flux CD.

## 11. STIG Compliance

Application Owner must provide and continuously maintain a complete Security Requirements Guide (SRG) and Security Technical Implementation Guide (STIG) to the RPOC ISSM. Use the template in `compliance/raise/app-owner-package/app-stig-checklist-template.md`.

## 12. Change Notification

Application Owner must notify the RPOC ISSM when new application features and major updates are implemented, including:

- Use of a new programming language or framework
- Additional services or microservices
- New external interfaces or API endpoints
- Changes to data handling or classification
- Changes to authentication/authorization methods

## 13. Response to Notifications

Application Owner must respond to all notifications from the RPOC within:

| Notification Type | Response Time |
|-------------------|---------------|
| Critical vulnerability | 4 hours (business hours) |
| High vulnerability | 24 hours |
| Compliance finding | 48 hours |
| Information request | 5 business days |

## 14. CI/CD Pipeline Coordination

Application Owner must coordinate with the RPOC ISSM to implement the CI/CD pipeline requirements. The SRE platform provides reusable pipeline templates at `ci/github-actions/` and `ci/gitlab-ci/`.

## 15. Pipeline Responsibility

It is the responsibility of the Application Owner to configure their specific pipeline using the RPOC-provided templates. The RPOC Owner provides the shared infrastructure (Harbor, Cosign keys, scanning tools).

## 16. New Tools

The addition of new tools must be coordinated with the RPOC ISSM when existing tools are unable to meet requirements. Replacement of any RPOC tools must be coordinated with the SCA and AO.

## 17. Required Documentation

Application Owner must build and maintain the following documentation:

- [ ] **Vulnerability Management Plan** — Strategy for managing application vulnerabilities (use template in `compliance/raise/app-owner-package/vulnerability-management-plan-template.md`)
- [ ] **Release Plan** — Frequency and processes for deployments
- [ ] **README** — Build and test procedures for the application
- [ ] **Application Architecture** — High-level diagram of components, connections, and data flows
- [ ] **CHANGELOG** — Historical record of all changes deployed to production
- [ ] **Aggregated Scan Results** — Per-release: SAST, DAST, Container Scan, SBOM

## 18. Documentation Delivery

Application Owner must provide the required documentation to the RPOC ISSM:

| Document | Delivery Schedule |
|----------|------------------|
| Vulnerability Management Plan | Initial onboarding + annual update |
| README | Every release |
| Architecture Diagram | Initial + on major changes |
| CHANGELOG | Every release |
| Scan Results | Automated per CI/CD pipeline run |
| Mitigation Statements | Within remediation timeline |
| STIG Checklist | Initial + quarterly updates |

## 19. Signed Agreement

This SLA must be signed by both the RPOC Owner and the Application Owner.

## 20. Pipeline Compliance

Application Owner must ensure every release candidate container passes the CI/CD pipeline successfully. The Kyverno admission policy `verify-image-signatures` blocks deployment of unsigned images.

## 21. Deployment Restriction

Application Owner will not be allowed to deploy to production if the SLA requirements are not met. The RPOC ISSM has authority to isolate or remove non-compliant workloads.

---

## Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| RPOC Owner | | | |
| RPOC ISSM | | | |
| Application Owner | | | |
| Application PM | | | |

---

## Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | _[DATE]_ | Initial SLA | |

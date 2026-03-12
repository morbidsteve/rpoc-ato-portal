# QREV-2: Security Assessment Plan (SAP)

## RPOC Quarterly Review Artifact

**Review Period:** _[Q1/Q2/Q3/Q4 YYYY]_
**RPOC:** Secure Runtime Environment (SRE)
**ISSM:** _[NAME]_

---

## Purpose

This Security Assessment Plan describes the approach for assessing the security controls of the SRE RPOC and its hosted applications during the current review period.

## Assessment Scope

### In Scope
- All platform components listed in QREV-1 Security Plan
- All applications onboarded via the RAISE process since last review
- CI/CD pipeline security gates (GATE 1-8)
- Continuous monitoring effectiveness
- POA&M progress

### Out of Scope
- Cloud provider infrastructure (covered under separate ATO)
- DNS and NTP services (external dependencies)

## Assessment Methodology

### Automated Assessment (Continuous)

| Control Area | Assessment Tool | Frequency | Evidence Location |
|-------------|----------------|-----------|-------------------|
| Vulnerability scanning | Trivy + NeuVector | Every image push + daily runtime | Harbor scan reports, NeuVector dashboard |
| Policy compliance | Kyverno | Continuous (admission control) | PolicyReport CRDs, Grafana dashboard |
| Configuration baseline | Flux CD | Every 10 minutes (drift detection) | Flux reconciliation status |
| Access control | Keycloak audit logs | Continuous | Loki log store |
| Network segmentation | Istio + NetworkPolicies | Continuous | Kiali service mesh dashboard |
| STIG compliance | compliance-report.sh | On-demand / daily CronJob | compliance/ artifacts |

### Manual Assessment (Quarterly)

| Assessment Activity | Assessor | Method |
|--------------------|----------|--------|
| Review POA&M progress | ISSM + SCA | Document review |
| Review new application onboardings | ISSM | Pipeline artifact review |
| Review vulnerability remediation | ISSM + App Owners | Dashboard review + mitigation statements |
| Verify CI/CD gate enforcement | ISSM | Pipeline run inspection |
| Review access control changes | ISSM | Keycloak audit log review |

## Assessment Schedule

| Activity | Date | Participants |
|----------|------|-------------|
| ISSM prepares quarterly artifacts | _[DATE - 14 days]_ | ISSM |
| SCA reviews RMF package deltas | _[DATE - 7 days]_ | SCA |
| SCA signs SAR | _[DATE - 3 days]_ | SCA |
| Quarterly review meeting with AO | _[DATE]_ | AO, SCA, ISSM |
| Next quarterly review scheduled | _[DATE + 90 days]_ | AO determines |

## Security Assessment Report (SAR) Notes

_The SCA will document findings and sign the SAR prior to the AO meeting. The SAR can be signed with open action items that require further review._

## Open Action Items from Previous Review

| Item | Description | Status | Due Date |
|------|-------------|--------|----------|
| | | | |

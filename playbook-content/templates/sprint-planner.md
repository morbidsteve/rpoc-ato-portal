---
title: 90-Day cATO Sprint Planner
description: Complete project plan for achieving continuous authorization
published: true
tags: project-management, sprint, ato, planning, milestones
editor: markdown
---

# 90-Day cATO Sprint Planner

A complete project management toolkit for achieving Kubernetes platform authorization in 90 days. Use these templates to plan, track, and communicate progress.

---

## Sprint Overview

| Phase | Weeks | Focus | Exit Criteria |
|-------|-------|-------|---------------|
| **Foundation** | 1-4 | Platform hardening, baseline docs | CIS clean, SSP structure approved |
| **Automation** | 5-8 | Evidence pipelines, OSCAL | 100% automated, validation passes |
| **Authorization** | 9-12 | Assessment, remediation, decision | ATO granted |

---

## Master Checklist

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Platform Baseline
- [ ] Deploy Kubernetes cluster with hardened configuration
- [ ] Apply CIS benchmark hardening
- [ ] Apply DISA STIG configurations (if DoD)
- [ ] Implement Pod Security Standards (restricted profile)
- [ ] Configure RBAC with least-privilege defaults
- [ ] Enable API server audit logging
- [ ] Establish GitOps repository structure
- [ ] Run initial CIS benchmark scan
- [ ] **EXIT: Cluster passes CIS scan with no critical findings**

#### Week 2: Security Controls
- [ ] Deploy admission controller (Gatekeeper or Kyverno)
- [ ] Implement Pod Security Standards policies
- [ ] Create default-deny NetworkPolicies for all namespaces
- [ ] Configure secrets encryption with KMS
- [ ] Deploy container image scanning
- [ ] Configure image admission policies (signed images, approved registries)
- [ ] Establish secure image registry
- [ ] Test admission controller with non-compliant workloads
- [ ] **EXIT: Admission controller blocks non-compliant workloads**

#### Week 3: Observability Infrastructure
- [ ] Deploy centralized logging (Fluent Bit/Fluentd)
- [ ] Configure immutable log storage (S3 Object Lock)
- [ ] Set up audit log pipeline to SIEM
- [ ] Deploy runtime security monitoring (Falco)
- [ ] Configure security event alerting
- [ ] Build initial compliance dashboard
- [ ] Test alert pipeline end-to-end
- [ ] **EXIT: Security events generate alerts within 5 minutes**

#### Week 4: Documentation Foundation
- [ ] Define system authorization boundary
- [ ] Create architecture diagrams
- [ ] Create data flow diagrams
- [ ] Initialize OSCAL SSP structure
- [ ] Document system characteristics
- [ ] Complete control-to-Kubernetes mapping
- [ ] Identify inherited controls (document inheritance)
- [ ] Set up evidence repository with retention policies
- [ ] Schedule ISSM review meeting
- [ ] **EXIT: SSP structure reviewed and approved by ISSM**

---

### Phase 2: Automation (Weeks 5-8)

#### Week 5: Evidence Pipeline
- [ ] Deploy RBAC evidence collector CronJob
- [ ] Deploy NetworkPolicy evidence collector
- [ ] Deploy admission policy evidence collector
- [ ] Configure audit log streaming to immutable storage
- [ ] Set up evidence index/catalog
- [ ] Validate evidence storage immutability
- [ ] Test evidence retrieval for sample control
- [ ] Set up evidence freshness alerting
- [ ] **EXIT: All 25 checklist items collecting automatically**

#### Week 6: Control Implementation Documentation
- [ ] Complete AC family implementation statements
- [ ] Complete AU family implementation statements
- [ ] Complete CM family implementation statements
- [ ] Complete SC family implementation statements
- [ ] Complete SI family implementation statements
- [ ] Link implementations to components
- [ ] Link implementations to evidence artifacts
- [ ] Document compensating controls (if any)
- [ ] Create POA&M for planned implementations
- [ ] Run OSCAL validation
- [ ] **EXIT: OSCAL validation passes; all controls addressed**

#### Week 7: Continuous Compliance
- [ ] Deploy policy-as-code for continuous verification
- [ ] Implement compliance scoring metrics
- [ ] Build compliance trending dashboard
- [ ] Configure control deviation alerts
- [ ] Implement automated remediation for common drift
- [ ] Document remediation runbooks
- [ ] Test compliance recovery procedures
- [ ] Train team on dashboard interpretation
- [ ] **EXIT: Dashboard shows real-time status for 100% of controls**

#### Week 8: Assessment Preparation
- [ ] Conduct internal readiness review
- [ ] Generate complete evidence package
- [ ] Review evidence package completeness
- [ ] Prepare technical demonstration environment
- [ ] Create demo scripts for key controls
- [ ] Brief platform team on assessment protocols
- [ ] Remediate findings from internal review
- [ ] Schedule assessor kickoff meeting
- [ ] **EXIT: Internal review shows no critical gaps**

---

### Phase 3: Authorization (Weeks 9-12)

#### Week 9: Assessor Engagement
- [ ] Conduct kickoff meeting with assessors
- [ ] Provide assessor access to evidence repository
- [ ] Provide assessor access to compliance dashboards
- [ ] Conduct system overview briefing
- [ ] Execute control implementation interviews
- [ ] Address assessor documentation questions
- [ ] Provide additional evidence as requested
- [ ] Daily check-ins with assessment team
- [ ] **EXIT: Assessors confirm documentation completeness**

#### Week 10: Technical Validation
- [ ] Support assessor technical testing
- [ ] Provide live demo of security controls
- [ ] Support vulnerability scanning activities
- [ ] Support penetration testing (if required)
- [ ] Document and triage findings in real-time
- [ ] Begin remediation of critical findings immediately
- [ ] Update evidence package with new artifacts
- [ ] Daily findings review with team
- [ ] **EXIT: Technical testing complete; no critical findings open**

#### Week 11: Remediation and Documentation
- [ ] Complete remediation of critical findings
- [ ] Complete remediation of high findings
- [ ] Document POA&M for moderate/low findings
- [ ] Finalize risk assessment
- [ ] Document residual risk characterization
- [ ] Compile Security Assessment Report inputs
- [ ] Prepare authorization briefing deck
- [ ] Rehearse briefing with ISSM
- [ ] **EXIT: All critical/high findings resolved**

#### Week 12: Authorization Decision
- [ ] Conduct authorization briefing with AO
- [ ] Present residual risk assessment
- [ ] Present risk acceptance recommendations
- [ ] Address AO questions
- [ ] Obtain formal authorization decision
- [ ] Document authorization terms and conditions
- [ ] Establish continuous monitoring schedule
- [ ] Celebrate! 🎉
- [ ] **EXIT: ATO/cATO granted; ConMon operational**

---

## Weekly Status Report Template

```markdown
# Weekly Status Report: [PROJECT NAME]
## Week [X] of 12 | [DATE]

### Sprint Phase: [Foundation/Automation/Authorization]

### Overall Status: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

---

### This Week's Accomplishments
- [ ] [Completed item 1]
- [ ] [Completed item 2]
- [ ] [Completed item 3]

### Next Week's Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

### Blockers & Risks
| Issue | Impact | Owner | ETA |
|-------|--------|-------|-----|
| [Blocker 1] | [High/Med/Low] | [Name] | [Date] |

### Metrics
- Controls Documented: [X] / [Total] ([X]%)
- Evidence Automation: [X] / 25 items ([X]%)
- Open Findings: [Critical: X] [High: X] [Med: X] [Low: X]

### Key Decisions Needed
- [ ] [Decision 1]
- [ ] [Decision 2]

### Next Milestone
**[Milestone Name]** - Due: [Date]
- [Criteria 1]
- [Criteria 2]
```

---

## RACI Matrix

| Activity | Platform Eng | Security | Compliance | ISSM | AO |
|----------|--------------|----------|------------|------|-----|
| Platform hardening | **R/A** | C | I | I | I |
| Security controls deployment | **R/A** | C | I | I | I |
| Evidence automation | **R/A** | C | I | I | I |
| SSP documentation | C | **R** | **A** | C | I |
| Control mapping | C | **R/A** | C | C | I |
| Internal readiness review | C | **R/A** | C | C | I |
| Assessor coordination | I | C | **R/A** | C | I |
| Findings remediation | **R** | C | **A** | C | I |
| Authorization briefing | C | C | **R** | **A** | I |
| Authorization decision | I | I | I | R | **A** |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | Assessor availability delays timeline | Medium | High | Engage assessors in Week 1, confirm availability | Compliance Lead |
| R2 | Critical vulnerability discovered during assessment | Medium | High | Pre-assessment vuln scan in Week 8, remediation buffer | Platform Lead |
| R3 | Scope creep extends timeline | High | High | Strict boundary definition, change control process | Project Sponsor |
| R4 | Key personnel unavailable | Medium | Medium | Cross-training, documented runbooks | Project Manager |
| R5 | Evidence automation gaps discovered late | Medium | High | Internal review in Week 8, checklist validation | Security Lead |
| R6 | OSCAL validation failures | Low | Medium | Continuous validation in CI, early assessor review | Compliance Lead |
| R7 | Cloud provider changes affect inherited controls | Low | High | Monitor provider announcements, maintain contact | Platform Lead |
| R8 | AO requests additional documentation | Medium | Medium | Executive summary prep, leave-behind materials | Compliance Lead |

---

## Phase Gate Review Checklist

### Phase 1 → Phase 2 Gate Review

**Date:** _____________ **Attendees:** _____________

#### Technical Readiness
- [ ] CIS benchmark scan shows no critical findings
- [ ] Pod Security Standards enforced cluster-wide
- [ ] Admission controller operational and tested
- [ ] Default-deny NetworkPolicies in all namespaces
- [ ] Audit logging streaming to immutable storage
- [ ] Runtime security monitoring operational

#### Documentation Readiness
- [ ] Authorization boundary defined and diagrammed
- [ ] OSCAL SSP structure initialized
- [ ] Control mapping complete for all families
- [ ] Inherited controls documented
- [ ] Evidence repository established

#### Approval
- [ ] ISSM approves SSP structure
- [ ] Platform Lead confirms technical readiness
- [ ] Security Lead confirms control implementation

**Gate Decision:** ☐ Pass ☐ Conditional Pass ☐ Fail

**Notes:** _____________________________________________

---

### Phase 2 → Phase 3 Gate Review

**Date:** _____________ **Attendees:** _____________

#### Automation Readiness
- [ ] All 25 evidence items collecting automatically
- [ ] Evidence storage immutability verified
- [ ] Evidence freshness alerting operational
- [ ] Compliance dashboard shows 100% coverage

#### Documentation Readiness
- [ ] OSCAL SSP validates without errors
- [ ] All control implementations documented
- [ ] POA&M created for any gaps
- [ ] Evidence index links controls to artifacts

#### Assessment Readiness
- [ ] Internal readiness review complete
- [ ] No critical gaps identified
- [ ] Assessor kickoff scheduled
- [ ] Team briefed on assessment protocols

**Gate Decision:** ☐ Pass ☐ Conditional Pass ☐ Fail

**Notes:** _____________________________________________

---

## Velocity Tracking

Track these metrics weekly to ensure you're on pace:

| Week | Controls Documented | Evidence Automated | Findings Open | Findings Closed |
|------|--------------------|--------------------|---------------|-----------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |

**Targets:**
- End of Week 4: 30% of controls documented
- End of Week 6: 100% of controls documented
- End of Week 5: 100% of evidence automated
- End of Week 11: 0 critical/high findings open

---

## Communication Plan

| Audience | Frequency | Format | Owner |
|----------|-----------|--------|-------|
| Executive Sponsor | Weekly | Email summary | Project Manager |
| Steering Committee | Bi-weekly | 30-min meeting | Project Manager |
| Platform Team | Daily | Standup | Platform Lead |
| Security Team | Daily | Standup | Security Lead |
| ISSM | Weekly | Status meeting | Compliance Lead |
| Assessors (Phase 3) | Daily | Check-in call | Compliance Lead |

---

## Download Formats

- [Notion Template](https://notion.so/template/cato-sprint) — Import directly to Notion
- [Asana Project](https://asana.com/template/cato-sprint) — Pre-built Asana project
- [Monday.com Board](https://monday.com/template/cato-sprint) — Monday.com workspace
- [Microsoft Project](./downloads/cato-sprint.mpp) — MS Project file
- [Excel Spreadsheet](./downloads/cato-sprint.xlsx) — Standalone Excel tracker

---

**[← Back to Templates](/ato-ebook/templates)** | **[Next: Briefing Deck →](/ato-ebook/templates/briefing-deck)**

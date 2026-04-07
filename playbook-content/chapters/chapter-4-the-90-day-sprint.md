# Chapter 4: The 90-Day Sprint
## A Phased Roadmap from First Cluster to Full Authority

---

### Why 90 Days Changes Everything

Traditional ATO timelines stretch beyond a year because work expands to fill available time. When teams have 18 months, they spend 12 months "preparing" and compress actual authorization work into a frantic final push. Documentation drifts from reality. Scope creeps. Key personnel rotate off the project. By the time assessors arrive, the system they evaluate barely resembles the system that was designed.

The 90-day sprint inverts this dynamic. Compressed timelines force disciplined scope, parallel workstreams, and continuous integration of compliance activities. There is no time for drift because assessment follows implementation by days, not months. The system assessors evaluate is the system you just built.

This timeline is aggressive but achievable. Organizations across the federal space—DoD programs, civilian agencies, and government contractors—have demonstrated that well-architected Kubernetes platforms can move from initial deployment to full authorization within this window. The key is treating authorization not as a phase that follows engineering but as a workstream that runs parallel to it.

---

### The Three Phases

The 90-day sprint divides into three phases, each with distinct objectives and exit criteria.

**Phase 1: Foundation (Days 1-30)**
Objective: Establish a hardened platform with baseline compliance infrastructure.

**Phase 2: Automation (Days 31-60)**
Objective: Implement automated evidence collection and continuous compliance verification.

**Phase 3: Authorization (Days 61-90)**
Objective: Execute assessment activities and obtain authorization decision.

Each phase builds on the previous. Skipping ahead without completing phase exit criteria creates downstream failures that extend timelines far beyond 90 days.

---

### Phase 1: Foundation (Days 1-30)

The first month establishes the technical and organizational foundation for everything that follows.

#### Week 1: Platform Baseline
- Deploy Kubernetes cluster with hardened configuration (CIS benchmarks, DISA STIGs)
- Implement Pod Security Standards at "restricted" profile
- Configure RBAC with least-privilege defaults
- Enable API server audit logging with appropriate verbosity
- Establish GitOps repository structure for all platform configurations
- **Exit Criterion:** Cluster passes automated CIS benchmark scan with no critical findings

#### Week 2: Security Controls
- Deploy admission controller (Gatekeeper or Kyverno) with initial policy set
- Implement Network Policies with default-deny baseline
- Configure secrets encryption with customer-managed keys
- Deploy container image scanning and admission policies
- Establish secure image registry with signing requirements
- **Exit Criterion:** Admission controller blocks non-compliant workloads in test scenarios

#### Week 3: Observability Infrastructure
- Deploy centralized logging with immutable storage backend
- Configure audit log pipeline from cluster to SIEM
- Implement runtime security monitoring (Falco or equivalent)
- Establish alerting for security-relevant events
- Build initial compliance dashboard showing control status
- **Exit Criterion:** Security events generate alerts within 5 minutes of occurrence

#### Week 4: Documentation Foundation
- Complete system boundary definition and architecture diagrams
- Initialize OSCAL SSP structure with system characteristics
- Complete control-to-Kubernetes mapping for applicable controls
- Identify inherited controls and document inheritance chain
- Establish evidence repository with retention policies
- **Exit Criterion:** SSP structure reviewed and approved by ISSM

---

### Phase 2: Automation (Days 31-60)

The second month transforms manual compliance activities into automated, continuous processes.

#### Week 5: Evidence Pipeline
- Implement automated collection for all configuration evidence
- Deploy scheduled jobs for RBAC, Network Policy, and policy exports
- Configure behavioral evidence streaming (audit logs, admission decisions)
- Build evidence indexing system linking artifacts to controls
- Validate evidence storage immutability and retention
- **Exit Criterion:** All 25 checklist evidence items collecting automatically

#### Week 6: Control Implementation Documentation
- Complete OSCAL implementation statements for all applicable controls
- Link each implementation to specific components and evidence
- Document compensating controls where standard implementations don't apply
- Complete POA&M for any controls with planned implementations
- Validate OSCAL SSP with automated tooling
- **Exit Criterion:** OSCAL validation passes with no errors; all controls addressed

#### Week 7: Continuous Compliance
- Deploy policy-as-code for continuous control verification
- Implement automated compliance scoring and trending
- Build control deviation alerting with response workflows
- Configure automated remediation for common compliance drift
- Test compliance recovery procedures
- **Exit Criterion:** Compliance dashboard shows real-time status for 100% of controls

#### Week 8: Assessment Preparation
- Conduct internal readiness review against assessment procedures
- Generate complete evidence package for assessor review
- Prepare technical demonstration environments and access
- Brief platform team on assessment protocols and expectations
- Remediate any findings from internal review
- **Exit Criterion:** Internal review identifies no critical gaps; minor findings remediated

---

### Phase 3: Authorization (Days 61-90)

The final month executes formal assessment activities and obtains authorization.

#### Week 9: Assessor Engagement
- Conduct kickoff meeting with assessor organization
- Provide assessor access to evidence repository and documentation
- Execute technical assessment interviews with platform SMEs
- Support assessor review of control implementations
- Address assessor questions with evidence references
- **Exit Criterion:** Assessors confirm documentation completeness

#### Week 10: Technical Validation
- Support assessor technical testing and verification
- Provide access to compliance dashboards and automation
- Execute penetration testing if required by assessment scope
- Document and address any findings in real-time
- Update evidence package with assessment-generated artifacts
- **Exit Criterion:** Technical testing complete; no critical findings open

#### Week 11: Remediation and Documentation
- Remediate any findings requiring immediate resolution
- Document POA&M items for findings requiring extended remediation
- Finalize risk assessment with residual risk characterization
- Complete Security Assessment Report inputs
- Prepare authorization recommendation briefing
- **Exit Criterion:** All critical/high findings resolved; POA&M documented for moderate/low

#### Week 12: Authorization Decision
- Conduct authorization briefing with Authorizing Official
- Present residual risk and risk acceptance recommendations
- Address AO questions with evidence and SME input
- Obtain formal authorization decision
- Establish continuous monitoring procedures for ongoing authorization
- **Exit Criterion:** ATO or cATO granted; continuous monitoring operational

---

### Critical Success Factors

Organizations that achieve 90-day authorization share common characteristics.

**Executive sponsorship is non-negotiable.** The sprint requires resources, decisions, and priority conflicts resolved in days, not weeks. Without an executive empowered to clear blockers immediately, the timeline slips.

**Parallel workstreams require coordination.** Engineering, security, and compliance teams must work simultaneously, not sequentially. Daily standups focused on blockers, shared visibility into progress, and clear ownership prevent workstreams from diverging.

**Scope discipline preserves velocity.** The 90-day target applies to a defined system boundary. Expanding scope mid-sprint—adding applications, extending boundaries, incorporating new requirements—breaks the timeline. Defer scope expansion to post-authorization phases.

**Assessor relationships accelerate outcomes.** Engage your assessor organization before the sprint begins. Share your timeline, automation approach, and evidence strategy. Assessors who understand your methodology can prepare appropriately and avoid delays during the formal assessment window.

---

### Practical Tips

**Build the assessment checklist early.** Obtain your assessor's specific evidence requirements and assessment procedures during Phase 1. Different assessor organizations emphasize different areas. Knowing their focus allows you to prioritize appropriately.

**Use the sprint for first authorization only.** The 90-day model achieves initial ATO. Subsequent reauthorizations, leveraging continuous compliance infrastructure, should require far less effort. If reauthorization takes 90 days, your continuous monitoring has failed.

**Establish velocity metrics.** Track controls documented per week, evidence automation percentage, and findings remediation time. Publish these metrics to stakeholders. Visible progress builds confidence; visible blockers attract help.

**Plan for the day after.** Authorization is not the finish line. Before the sprint ends, document the operational procedures for maintaining continuous authorization: who monitors compliance dashboards, how findings are triaged, when POA&Ms are reviewed. The sprint builds the system; operations sustains it.

---

### Your Next Step

Adapt the phase structure to your specific context. Identify your target authorization date and work backward to establish phase boundaries. Staff each workstream with named owners. Create a shared tracking mechanism—whether a project board, spreadsheet, or dedicated tool—that provides daily visibility into progress against the 90-day plan. The sprint begins when you commit to the timeline publicly.

---

## Free Resource: Plan Your Sprint

**The 90-Day cATO Sprint Planner**

Get the complete project management toolkit used by teams that have achieved authorization in record time.

**What's included:**
- Editable Gantt chart with all 12 weeks pre-populated
- Weekly status report template for stakeholder updates
- Phase gate review checklist with exit criteria
- RACI matrix for role assignments across workstreams
- Risk register template with common ATO risks pre-loaded
- Velocity tracking spreadsheet for controls and evidence

**Available formats:** Notion, Asana, Monday.com, Microsoft Project, and Excel

**[Download the Sprint Planner]**

*Enter your email to get instant access. You'll also receive practical tips for accelerating your ATO delivered weekly.*

→ [Get the Planner](https://yoursite.com/sprint-planner)

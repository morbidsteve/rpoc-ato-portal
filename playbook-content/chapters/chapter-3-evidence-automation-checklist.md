# Chapter 3: Evidence on Autopilot
## The Evidence Automation Checklist for Kubernetes Compliance

---

### The Evidence Problem

Every authorization tells the same story. The platform team builds a secure, compliant Kubernetes environment. The security team documents controls in the SSP. Then assessment begins, and everything grinds to a halt. Assessors request evidence. Engineers scramble to produce screenshots, export configurations, and compile logs. Documents are emailed back and forth. Versions proliferate. By the time evidence is assembled, configurations have changed and the evidence no longer reflects reality.

This evidence scramble is not merely inefficient—it actively undermines continuous authorization. If producing evidence requires manual effort, you cannot demonstrate compliance continuously. You can only demonstrate it periodically, at great cost, with decreasing accuracy as time passes.

The solution is automation. Every piece of evidence your assessor requires should be generated automatically, stored immutably, timestamped cryptographically, and retrievable on demand. When an auditor asks "show me your RBAC configuration," the answer should be a URL to your evidence repository, not a fire drill.

The Evidence Automation Checklist provides a systematic approach to achieving this goal. It catalogs the evidence types federal assessors commonly request, maps them to collection mechanisms, and defines storage requirements that satisfy audit expectations.

---

### Categories of Evidence

Evidence for Kubernetes authorization falls into four categories, each requiring different collection approaches.

**Configuration Evidence:** Point-in-time snapshots of how your system is configured. This includes Kubernetes manifests, Helm values, Terraform state, policy definitions, and RBAC bindings. Configuration evidence proves that security controls are implemented as documented.

**Behavioral Evidence:** Logs and records of system activity over time. API audit logs, authentication events, admission controller decisions, and network flow logs fall into this category. Behavioral evidence proves that controls function as intended during actual operation.

**Validation Evidence:** Results of automated checks that verify compliance. Vulnerability scan reports, CIS benchmark assessments, policy violation summaries, and compliance dashboard exports demonstrate ongoing verification rather than mere implementation.

**Attestation Evidence:** Human assertions that automated systems cannot capture. Risk acceptance memos, training completion records, and incident response documentation require human input but can still be managed through automated workflows.

---

### The Checklist: Top 25 Evidence Items

The following checklist covers evidence items that appear in virtually every federal Kubernetes assessment. For each item, automate collection before your first assessment.

#### Configuration Evidence

| Item | Collection Method | Frequency |
|------|------------------|-----------|
| RBAC Roles and Bindings | `kubectl get roles,rolebindings,clusterroles,clusterrolebindings -A -o yaml` | Daily |
| Network Policies | `kubectl get networkpolicies -A -o yaml` | Daily |
| Pod Security Standards/Policies | Export admission controller constraints (Gatekeeper/Kyverno) | Daily |
| Secrets encryption configuration | Export KMS configuration and API server encryption config | Weekly |
| Service mesh mTLS settings | Export Istio PeerAuthentication/DestinationRules or Linkerd config | Daily |
| Ingress and WAF rules | Export ingress controller and WAF configurations | Daily |
| Node hardening configuration | Export kubelet configs, OS hardening scripts, AMI build logs | Weekly |
| Container image policies | Export allowed registries, signing policies, admission rules | Daily |

#### Behavioral Evidence

| Item | Collection Method | Frequency |
|------|------------------|-----------|
| Kubernetes API audit logs | Stream to immutable storage (S3 Object Lock, WORM storage) | Continuous |
| Authentication/authorization events | Filter and index API audit logs for auth events | Continuous |
| Admission controller decisions | Log all admit/deny decisions with policy references | Continuous |
| Network flow logs | VPC Flow Logs or CNI-level flow capture | Continuous |
| Container runtime events | Falco, Sysdig, or runtime security tool logs | Continuous |
| Secret access logs | Filter API audit logs for Secret read operations | Continuous |

#### Validation Evidence

| Item | Collection Method | Frequency |
|------|------------------|-----------|
| Container vulnerability scans | Trivy, Grype, or registry-integrated scanning | On every image push |
| CIS Kubernetes Benchmark results | kube-bench scheduled scans | Weekly |
| Policy compliance reports | Gatekeeper audit results, Kyverno policy reports | Daily |
| STIG compliance scans | OpenSCAP or STIG-specific tooling | Weekly |
| Penetration test results | Scheduled or triggered security assessments | Quarterly |
| Dependency vulnerability reports | SBOM generation and analysis | On every build |

#### Attestation Evidence

| Item | Collection Method | Frequency |
|------|------------------|-----------|
| Security training records | Pull from LMS via API, store in evidence repo | Monthly |
| Access review certifications | Workflow system exports | Quarterly |
| Incident response records | Ticketing system API integration | On occurrence |
| Change approval records | Git commit signatures, PR approval logs | On occurrence |
| Risk acceptance documentation | Document management system integration | On occurrence |

---

### Building the Automation Pipeline

Evidence automation requires three components working together: collection, storage, and retrieval.

**Collection Layer:** Schedule evidence gathering jobs using Kubernetes CronJobs, CI/CD pipelines, or dedicated compliance tooling. Each job should execute the collection command, validate the output, add metadata (timestamp, cluster ID, collector version), and push to storage. Treat collection jobs as production workloads—monitor them, alert on failures, and version the collection scripts.

**Storage Layer:** Evidence must be immutable and tamper-evident. Use object storage with write-once-read-many (WORM) policies. S3 Object Lock in Governance or Compliance mode, Azure Immutable Blob Storage, or GCS retention policies all satisfy this requirement. Organize evidence by date, control family, and evidence type. Retain evidence for the period your authorization requires—typically three to seven years for federal systems.

**Retrieval Layer:** Build an index that maps evidence artifacts to controls. When an assessor requests AC-6 evidence, your system should return all relevant artifacts: RBAC exports, policy reports, access review certifications. A simple database or even a well-structured Git repository can serve as this index. More mature organizations deploy compliance platforms that provide search, visualization, and direct assessor access.

---

### Lessons from Automated Evidence Programs

**Start collecting before you need it.** Begin evidence automation on day one of platform operations, not when an assessment is imminent. Historical evidence demonstrates sustained compliance, which is far more compelling than point-in-time snapshots produced under deadline pressure.

**Validate evidence integrity.** Generate cryptographic hashes for every evidence artifact and store hashes separately from artifacts. This allows you to prove evidence has not been modified since collection. Some organizations use blockchain or transparency logs for hash publication, though simpler approaches like signed Git commits also work.

**Test evidence retrieval regularly.** Run mock evidence requests monthly. Ask your own team to produce all evidence for a randomly selected control family within four hours. If they cannot, your automation has gaps. Treat retrieval failures as incidents requiring remediation.

**Involve assessors in format decisions.** Different assessors prefer different evidence formats. Some want raw YAML; others want formatted reports. Some require PDF exports; others accept repository access. Ask your assessor organization what they need and automate output in those formats specifically.

---

### Practical Tips

**Use Git as your evidence format.** Store evidence artifacts in Git repositories with enforced commit signing. Git provides built-in versioning, tamper evidence (commit hashes), and access logging. Many assessors are comfortable reviewing Git repositories directly.

**Correlate evidence across sources.** When an audit log shows a security event, your evidence system should surface the corresponding RBAC configuration, policy definition, and alert acknowledgment. Cross-referencing evidence demonstrates not just that controls exist but that they function as an integrated system.

**Automate evidence freshness checks.** Build alerts that fire when evidence collection falls behind schedule. If your daily RBAC export hasn't run in 48 hours, something is broken. Stale evidence is nearly as problematic as missing evidence.

---

### Your Next Step

Review the checklist above and inventory your current evidence collection. For each item, document whether collection is manual, partially automated, or fully automated. Prioritize automating the items you currently collect manually, especially those in the Configuration and Behavioral categories. Set a goal: within 30 days, every item on this checklist should have an automated collection mechanism producing evidence without human intervention.

---

## Free Resource: Automate Today

**Evidence Automation Scripts for Kubernetes**

Stop spending hours collecting evidence manually. Get production-ready scripts that automate evidence collection for every item on the checklist.

**What's included:**
- Kubernetes CronJob manifests for scheduled evidence collection
- Shell scripts for RBAC, NetworkPolicy, and admission controller exports
- S3 lifecycle policies for immutable evidence storage
- Terraform module for the complete evidence pipeline
- Alerting rules for collection failures
- Evidence index template for control-to-artifact mapping

**[Download the Automation Scripts]**

*Enter your email to get instant access. You'll also receive practical tips for accelerating your ATO delivered weekly.*

→ [Get the Scripts](https://yoursite.com/evidence-scripts)

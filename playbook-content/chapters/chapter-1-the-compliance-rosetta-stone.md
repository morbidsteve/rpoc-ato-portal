# Chapter 1: The Compliance Rosetta Stone
## Control-to-Kubernetes Mapping Matrix

---

### Why Mapping Matters

The single greatest time sink in federal Kubernetes authorization isn't technical implementation—it's translation. Security teams speak in NIST 800-53 control families. Platform engineers speak in pods, namespaces, and admission controllers. Authorizing Officials speak in risk. Without a shared language, these groups spend months in circular conversations, each struggling to understand how the other's work satisfies compliance requirements.

The Control-to-Kubernetes Mapping Matrix eliminates this friction. It serves as a definitive reference that answers the question every compliance conversation eventually reaches: "How does this Kubernetes capability satisfy that security control?"

A well-constructed matrix does three things. First, it accelerates initial authorization by giving assessors immediate visibility into how your platform addresses each control. Second, it reduces documentation burden by connecting technical configurations directly to SSP language. Third, it enables automation by defining exactly which cluster resources, configurations, and events constitute evidence for each control requirement.

Organizations that invest in building this matrix upfront consistently report 40-60% reductions in assessment timelines. The effort pays for itself within the first authorization cycle.

---

### Anatomy of an Effective Mapping

A useful mapping matrix contains more than just control IDs matched to Kubernetes features. Each entry should include five elements:

**Control ID and Title:** The specific NIST 800-53 control (e.g., AC-6, Least Privilege).

**Control Requirement Summary:** A plain-language description of what the control demands, extracted from the actual control text.

**Kubernetes Implementation:** The specific primitives, configurations, or tools that satisfy the requirement. This should be concrete enough that an engineer can implement it and an assessor can verify it.

**Evidence Artifacts:** What proof demonstrates ongoing satisfaction? This might include configuration files, audit logs, policy definitions, or dashboard screenshots.

**Responsibility:** Is this a platform-level control inherited by all workloads, or must each application team address it individually?

---

### Mapping Examples in Practice

The following examples demonstrate how to translate abstract control requirements into concrete Kubernetes implementations.

#### Example 1: AC-6 — Least Privilege

**Requirement:** The system enforces the most restrictive set of rights and privileges needed by users and processes.

**Kubernetes Implementation:** Role-Based Access Control (RBAC) serves as the primary mechanism. Create namespace-scoped Roles rather than cluster-wide ClusterRoles whenever possible. Bind service accounts to specific roles rather than granting broad permissions. Avoid the use of `cluster-admin` except for platform operators, and audit any bindings to privileged roles.

For workload-level enforcement, implement Pod Security Standards at the "restricted" profile. This prevents containers from running as root, blocks privilege escalation, and drops all unnecessary Linux capabilities. Use admission controllers like Gatekeeper or Kyverno to enforce these standards consistently.

**Evidence Artifacts:** Export all RoleBindings and ClusterRoleBindings via `kubectl get rolebindings,clusterrolebindings -A -o yaml`. Capture Gatekeeper ConstraintTemplates and Constraints that enforce Pod Security Standards. Pull audit logs showing denied requests for privilege escalation.

**Practical Tip:** Create a "break-glass" process for emergency cluster-admin access rather than granting standing privileges. This satisfies both AC-6 and provides clear audit trails for any elevated access.

#### Example 2: AU-2 — Event Logging

**Requirement:** The system generates audit records for defined events including authentication, access control decisions, and administrative actions.

**Kubernetes Implementation:** Enable the Kubernetes Audit Logging feature at the API server level. Configure an audit policy that captures authentication events, RBAC decisions, pod creation and deletion, secret access, and any changes to security-sensitive resources like NetworkPolicies or PodSecurityPolicies.

Ship audit logs to immutable storage outside the cluster—an S3 bucket with object lock, a SIEM, or a dedicated logging cluster. The separation ensures that a compromised cluster cannot tamper with its own audit trail.

**Evidence Artifacts:** The audit policy YAML file demonstrates what events are captured. Log storage configurations prove immutability. Sample queries showing authentication failures and administrative actions demonstrate the logs contain required content.

**Practical Tip:** Start with a restrictive audit policy that logs metadata for all requests and full request/response bodies only for sensitive operations. Logging everything at the highest verbosity generates enormous volumes and makes finding relevant events nearly impossible.

#### Example 3: SC-7 — Boundary Protection

**Requirement:** The system monitors and controls communications at external and key internal boundaries.

**Kubernetes Implementation:** Network Policies serve as the internal boundary mechanism. Implement a default-deny policy in every namespace that blocks all ingress and egress traffic, then explicitly allow only required communication paths. This creates microsegmentation by default.

For external boundaries, use an ingress controller with Web Application Firewall capabilities. All traffic entering the cluster should pass through defined ingress points with TLS termination, rate limiting, and request inspection.

Service mesh implementations like Istio or Linkerd add mutual TLS between all services, providing encryption and authentication for internal traffic that would otherwise traverse the network boundary unprotected.

**Evidence Artifacts:** Export NetworkPolicies from all namespaces. Capture ingress controller configurations and WAF rule sets. For service mesh deployments, export the mesh configuration showing mTLS enforcement.

**Practical Tip:** Label namespaces by trust level (e.g., `trust-level: restricted`, `trust-level: privileged`) and use these labels in NetworkPolicy selectors. This makes policies more readable and allows broad rules that automatically apply to new namespaces.

---

### Lessons from the Field

Organizations that have built and operationalized these matrices share consistent lessons.

**Start with high-impact controls.** Not all 800+ NIST controls apply equally to a Kubernetes platform. Begin with AC (Access Control), AU (Audit), CM (Configuration Management), SC (System and Communications Protection), and SI (System and Information Integrity). These five families cover approximately 70% of relevant platform controls.

**Involve assessors early.** Share your draft matrix with your assessor organization before you finalize it. Their input on what evidence they need to see—and in what format—prevents rework during the actual assessment.

**Treat the matrix as living documentation.** Store it in Git alongside your platform code. When configurations change, update the corresponding matrix entries in the same pull request. This prevents drift between what you claim and what actually exists.

**Automate evidence collection from day one.** If your matrix says "export all RoleBindings" as evidence, write the script that does this automatically and stores the output in your evidence repository. Manual evidence gathering is the enemy of continuous authorization.

---

### Your Next Step

Download the starter matrix template that accompanies this ebook. Customize it to your environment by removing controls satisfied entirely by your cloud provider and adding any agency-specific requirements from your authorization baseline. Then pick five controls and complete the full mapping—implementation, evidence, and responsibility. That exercise alone will surface gaps in your current platform and clarify your path to continuous compliance.

---

## Free Resource: Go Deeper

**The Complete NIST 800-53 to Kubernetes Mapping Matrix**

Want the full picture? Get the complete spreadsheet mapping 50+ controls to specific Kubernetes implementations, ready-to-use kubectl commands, and assessor-approved evidence formats.

**What's included:**
- Full mapping for AC, AU, CM, SC, and SI control families
- Copy-paste kubectl commands for evidence collection
- Gatekeeper/Kyverno policy examples for each control
- Responsibility assignment matrix (platform vs. application)
- Assessor-friendly formatting ready for your SSP

**[Download the Complete Mapping Matrix]**

*Enter your email to get instant access. You'll also receive practical tips for accelerating your ATO delivered weekly.*

→ [Get the Matrix](https://yoursite.com/mapping-matrix)

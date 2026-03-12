# Incident Response Plan (IRP) — Secure Runtime Environment (SRE)

## Per NIST SP 800-61 Rev 2 and DAAPM Appendix Q

---

| Field | Value |
|-------|-------|
| Document Title | Incident Response Plan |
| System Name | Secure Runtime Environment (SRE) |
| System Type | RAISE Platform of Choice (RPOC) — Kubernetes DevSecOps Platform |
| Security Categorization | MODERATE (C:M / I:M / A:M) |
| eMASS/MCAST ID | _[TO BE ASSIGNED]_ |
| Version | 1.0 |
| Date | _[DATE]_ |
| Classification | CUI // SP-NOFORN (adjust per environment) |
| Prepared By | _[NAME / ORGANIZATION]_ |
| Approved By | _[AUTHORIZING OFFICIAL NAME]_ |

---

## Document Control

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | _[DATE]_ | _[NAME]_ | Initial IRP for ATO package submission |

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Roles and Responsibilities](#2-roles-and-responsibilities)
3. [Incident Categories and Severity Levels](#3-incident-categories-and-severity-levels)
4. [Detection and Analysis](#4-detection-and-analysis)
5. [Containment, Eradication, and Recovery](#5-containment-eradication-and-recovery)
6. [Post-Incident Activities](#6-post-incident-activities)
7. [Communication Plan](#7-communication-plan)
8. [Incident Response Playbooks](#8-incident-response-playbooks)
9. [Plan Maintenance](#9-plan-maintenance)
10. [Appendices](#10-appendices)

---

## 1. Purpose and Scope

### 1.1 Purpose

This Incident Response Plan (IRP) establishes the policies, procedures, and organizational structure for detecting, analyzing, containing, eradicating, and recovering from cybersecurity incidents affecting the Secure Runtime Environment (SRE) platform. This plan satisfies the requirements of:

- **NIST SP 800-61 Rev 2** — Computer Security Incident Handling Guide
- **NIST SP 800-53 Rev 5** — IR control family (IR-1 through IR-10)
- **DAAPM Appendix Q** — Incident Response Plan requirements for DoD ATO
- **CJCSM 6510.01B** — Cyber Incident Handling Program
- **DoDI 8500.01** — Cybersecurity
- **DoDI 8530.01** — Cybersecurity Activities Support to DoD Information Network Operations

### 1.2 Scope

This plan covers all components within the SRE authorization boundary:

| Layer | Components |
|-------|-----------|
| **Infrastructure** | RKE2 Kubernetes cluster (control plane + worker nodes), Rocky Linux 9 hardened OS, network infrastructure |
| **Platform Services** | Istio (service mesh), Kyverno (policy engine), Prometheus/Grafana/AlertManager (monitoring), Loki/Alloy (logging), Tempo (tracing), cert-manager (certificates), OpenBao (secrets), NeuVector (runtime security), Harbor (container registry), Keycloak (identity/SSO), Velero (backup) |
| **GitOps Engine** | Flux CD (reconciliation, drift detection, deployment automation) |
| **Tenant Workloads** | All applications deployed within tenant namespaces on the SRE RPOC |

### 1.3 Authorization Boundary

The SRE authorization boundary encompasses:

- All Kubernetes nodes (control plane and worker) and their underlying operating systems
- All container workloads running within the cluster
- All platform service components listed above
- Network traffic within the cluster (east-west, managed by Istio mTLS)
- Ingress/egress traffic at the Istio gateway boundary
- The Git repository used by Flux CD for cluster state reconciliation
- External integrations: DNS, NTP, object storage (S3-compatible), KMS

The following are **outside** the authorization boundary and covered by their own ATOs:

- Cloud provider infrastructure (AWS GovCloud / Azure Gov / on-premises hypervisor)
- External identity providers federated through Keycloak (e.g., Active Directory, DoD CAC/PKI)
- Upstream container registries replicated into Harbor
- Developer workstations and CI/CD runners (covered by CI/CD Tools Certification)

### 1.4 Applicability

This IRP applies to all personnel who administer, operate, develop for, or use the SRE platform, including:

- Platform operators and administrators
- Application development teams (tenants)
- Security personnel (ISSM, ISSO, SCA)
- Authorizing Official (AO) and their staff
- Contractor personnel with system access

---

## 2. Roles and Responsibilities

### 2.1 Incident Response Team (IRT) Composition

| Role | Name | Organization | Contact | Alternate |
|------|------|-------------|---------|-----------|
| IRT Lead | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |
| Platform Engineer (Senior) | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |
| Platform Engineer | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |
| Security Analyst | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |
| Network Analyst | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |
| Communications Lead | _[NAME]_ | _[ORG]_ | _[PHONE / EMAIL]_ | _[NAME]_ |

### 2.2 Key Stakeholder Roles

#### Information System Security Manager (ISSM)

- Overall responsibility for the security posture of the SRE platform
- Approves incident severity classification and escalation decisions
- Ensures compliance with DoD incident reporting timelines
- Coordinates with the Authorizing Official on incidents affecting the ATO
- Reviews and approves updates to this IRP
- Contact: _[NAME]_ / _[PHONE]_ / _[EMAIL]_

#### Information System Security Officer (ISSO)

- Day-to-day security monitoring and initial incident triage
- Maintains incident tracking in eMASS/MCAST
- Ensures all incidents are documented per DAAPM requirements
- Updates POA&M entries resulting from incidents
- Conducts initial analysis and determines if an event qualifies as an incident
- Contact: _[NAME]_ / _[PHONE]_ / _[EMAIL]_

#### System Owner

- Authorizes containment actions that may impact system availability
- Approves resource allocation for incident response activities
- Coordinates with mission partners on service disruptions
- Ensures business continuity during incident response
- Contact: _[NAME]_ / _[PHONE]_ / _[EMAIL]_

#### Authorizing Official (AO)

- Receives notification of all SEV-1 and SEV-2 incidents
- May revoke or suspend the ATO based on incident severity and impact
- Approves risk acceptance for residual findings after incident resolution
- Contact: _[NAME]_ / _[PHONE]_ / _[EMAIL]_

#### Security Control Assessor (SCA)

- Validates the effectiveness of corrective actions post-incident
- May conduct ad-hoc assessments following significant incidents
- Reviews updated control implementations resulting from incidents
- Contact: _[NAME]_ / _[PHONE]_ / _[EMAIL]_

### 2.3 Escalation Chain

```
Level 0: Automated Detection (NeuVector, Kyverno, Prometheus, AlertManager)
    ↓
Level 1: ISSO / On-call Platform Engineer (initial triage, 15 min)
    ↓
Level 2: IRT Lead + ISSM (severity determination, 30 min for SEV-1/2)
    ↓
Level 3: System Owner + AO Staff (impact assessment, 1 hour for SEV-1)
    ↓
Level 4: Authorizing Official (ATO impact decision)
    ↓
Level 5: External Reporting (US-CERT, DISA, chain of command per timelines)
```

### 2.4 External Reporting Requirements

| Entity | When to Report | Timeline | Method |
|--------|---------------|----------|--------|
| **US-CERT** | All confirmed incidents involving federal systems | Within 1 hour of determination (SEV-1), 72 hours (SEV-2/3) | US-CERT portal / hotline (888-282-0870) |
| **DISA** | Incidents affecting DoD information or systems | Within 1 hour of SEV-1 determination | DISA Global Service Desk (844-347-2457) |
| **Component CISO** | All confirmed incidents | Per component-specific timelines | _[REPORTING METHOD]_ |
| **AO** | SEV-1 and SEV-2 incidents; any incident affecting ATO status | Within 1 hour (SEV-1), 4 hours (SEV-2) | Direct notification + eMASS update |
| **Law Enforcement (DCIO/OSI/NCIS)** | Suspected criminal activity, data breach involving PII | Immediately upon determination | _[CONTACT INFO]_ |
| **Privacy Office** | PII/PHI breach | Within 24 hours of determination | _[CONTACT INFO]_ |

---

## 3. Incident Categories and Severity Levels

### 3.1 Incident Categories (per US-CERT)

| Category | Description | SRE Examples |
|----------|-------------|-------------|
| **CAT 1** — Unauthorized Access | Successful unauthorized access to system | Container escape to node, API server compromise, OpenBao vault breach |
| **CAT 2** — Denial of Service | Successful DoS/DDoS affecting availability | Resource exhaustion attack, control plane overload, etcd corruption |
| **CAT 3** — Malicious Code | Installation of malware/rootkit | Cryptominer in container, webshell, backdoored image |
| **CAT 4** — Improper Usage | Violation of acceptable use policies | Unauthorized namespace creation, policy bypass attempt |
| **CAT 5** — Scans/Probes/Attempted Access | Unsuccessful access attempts | Repeated failed API auth, port scanning from pod, brute-force against Keycloak |
| **CAT 6** — Investigation | Unconfirmed incidents under analysis | Anomalous NeuVector alert, suspicious audit log pattern |

### 3.2 Severity Levels

#### SEV-1: Critical

**Definition:** Active exploitation confirmed, data breach in progress, or complete loss of a critical security control.

| Attribute | Requirement |
|-----------|-------------|
| **Response Time** | Acknowledge within 15 minutes, IRT assembled within 30 minutes |
| **Initial Containment** | Within 1 hour of determination |
| **Status Updates** | Every 30 minutes until contained, then every 2 hours |
| **AO Notification** | Within 1 hour |
| **External Reporting** | US-CERT within 1 hour |
| **Resolution Target** | 24 hours (containment), 72 hours (eradication) |

**Examples:**
- Container escape to host node confirmed
- Active data exfiltration from tenant namespace
- RKE2 API server compromised (unauthorized cluster-admin access)
- OpenBao unsealed by unauthorized party; secrets exposed
- Istio mTLS bypassed; unencrypted traffic observed cluster-wide
- Supply chain attack: malicious image running in production
- Keycloak admin account compromised
- etcd data breach (secrets, configs exposed)

#### SEV-2: High

**Definition:** CRITICAL vulnerability actively exploitable in production, confirmed unauthorized access attempt, or significant degradation of a security control.

| Attribute | Requirement |
|-----------|-------------|
| **Response Time** | Acknowledge within 30 minutes, IRT assembled within 1 hour |
| **Initial Containment** | Within 4 hours of determination |
| **Status Updates** | Every 2 hours until contained, then every 4 hours |
| **AO Notification** | Within 4 hours |
| **External Reporting** | US-CERT within 72 hours |
| **Resolution Target** | 48 hours (containment), 7 days (eradication) |

**Examples:**
- CRITICAL CVE (CVSS 9.0+) in a running production image with known exploit
- NeuVector detects process execution anomaly (e.g., shell spawned in application container)
- Confirmed unauthorized access attempt against Keycloak (successful credential stuffing)
- Kyverno policy engine failure (policies not enforcing)
- Harbor registry compromise (unauthorized image push)
- Flux CD reconciliation hijacked (unauthorized Git commit deployed)
- Certificate chain compromise (rogue cert issued by internal CA)

#### SEV-3: Medium

**Definition:** Policy violation detected and confirmed, suspicious activity requiring investigation, or non-critical vulnerability with active exploitation elsewhere.

| Attribute | Requirement |
|-----------|-------------|
| **Response Time** | Acknowledge within 2 hours, assigned within 4 hours |
| **Initial Assessment** | Within 8 hours |
| **Status Updates** | Daily until resolved |
| **AO Notification** | Weekly summary (unless escalated) |
| **Resolution Target** | 30 days |

**Examples:**
- Kyverno Enforce-mode violation blocked (privileged pod attempt)
- NeuVector network anomaly (unexpected outbound connection from pod)
- Failed image signature verification (Cosign) blocked by Kyverno
- HIGH CVE (CVSS 7.0-8.9) in production image without known exploit
- Unauthorized ServiceAccount token usage in audit logs
- OpenBao audit log shows unusual secret access pattern
- Tenant accessing secrets outside their authorized path
- RBAC misconfiguration allowing cross-namespace access

#### SEV-4: Low / Informational

**Definition:** Informational event, failed scan, minor misconfiguration, or routine policy violation in Audit mode.

| Attribute | Requirement |
|-----------|-------------|
| **Response Time** | Acknowledge within 1 business day |
| **Assessment** | Within 5 business days |
| **Status Updates** | Weekly during resolution |
| **Resolution Target** | 90 days (or next scheduled maintenance window) |

**Examples:**
- Kyverno Audit-mode policy violation (non-blocking)
- MEDIUM/LOW CVE in non-production image
- Failed login attempts below brute-force threshold
- Minor NeuVector informational alerts
- Certificate approaching expiration (>30 days)
- Routine scan failure (connectivity issue, not security-related)
- Non-compliance with labeling or resource limit policies

### 3.3 Response Time SLA Summary

| Severity | Acknowledge | Contain | Eradicate | Resolve | AO Notify | US-CERT |
|----------|------------|---------|-----------|---------|-----------|---------|
| SEV-1 | 15 min | 1 hr | 72 hr | 7 days | 1 hr | 1 hr |
| SEV-2 | 30 min | 4 hr | 7 days | 14 days | 4 hr | 72 hr |
| SEV-3 | 2 hr | 8 hr | 30 days | 30 days | Weekly | As needed |
| SEV-4 | 1 bus. day | N/A | 90 days | 90 days | Quarterly | N/A |

---

## 4. Detection and Analysis

### 4.1 Detection Sources

The SRE platform provides multiple layers of automated detection:

| Source | What It Detects | Alert Destination | Relevant Dashboards |
|--------|----------------|-------------------|-------------------|
| **NeuVector** | Runtime anomalies (process, network, file), container vulnerabilities, CIS benchmark violations | Prometheus via SYSLOG, AlertManager | Grafana: NeuVector Security Overview |
| **Kyverno Policy Reports** | Pod security violations, image registry restrictions, missing labels, unsigned images, privilege escalation attempts | Prometheus metrics (kyverno_policy_results_total), Grafana | Grafana: Kyverno Policy Violations |
| **Prometheus / AlertManager** | Resource exhaustion, component health, SLO violations, certificate expiry, Flux reconciliation failures | Slack, PagerDuty, email (per AlertManager config) | Grafana: Platform Health, SRE Alerts |
| **Loki (via Alloy)** | Kubernetes API audit logs, application logs, authentication events, error patterns | Grafana alerting rules on log queries | Grafana: Audit Logs, Authentication Events |
| **Istio Access Logs** | Unauthorized service-to-service communication, mTLS failures, abnormal traffic patterns | Loki (collected by Alloy), Prometheus (Istio metrics) | Grafana: Istio Service Mesh |
| **Harbor / Trivy** | Image vulnerabilities (CRITICAL/HIGH/MEDIUM/LOW), scan failures, unsigned images | Webhook to AlertManager (CRITICAL/HIGH) | Harbor UI, Grafana: Vulnerability Overview |
| **OpenBao Audit Log** | Secret access, authentication events, policy violations, token creation/revocation | Loki (forwarded by Alloy) | Grafana: OpenBao Audit |
| **Keycloak Events** | Failed logins, brute-force attempts, unauthorized client registration, token theft | Loki (forwarded by Alloy) | Grafana: Authentication Events |
| **Flux CD** | Reconciliation failures, drift detection, unauthorized Git commits | Prometheus (flux_* metrics), AlertManager | Grafana: Flux CD Overview |
| **RKE2 Audit Logs** | API server requests, RBAC denials, resource creation/deletion | Loki (collected by Alloy from node journals) | Grafana: Kubernetes Audit |

### 4.2 Indicators of Compromise (IOCs) — Kubernetes-Specific

#### 4.2.1 Container and Pod Anomalies

| IOC | Detection Method | Severity |
|-----|-----------------|----------|
| Pod running with `privileged: true` bypassing Kyverno | Kyverno Enforce violation + NeuVector alert | SEV-1 |
| Unexpected shell process in application container (e.g., `/bin/sh`, `/bin/bash`) | NeuVector process profile alert | SEV-2 |
| Container with `hostPID`, `hostNetwork`, or `hostIPC` enabled | Kyverno policy violation | SEV-2 |
| Pod running as root (`runAsUser: 0`) | Kyverno policy violation, NeuVector | SEV-3 |
| Container writing to normally read-only filesystem | NeuVector file access alert | SEV-2 |
| Unexpected binary execution (not in process profile baseline) | NeuVector process alert | SEV-2 |
| Container with capabilities beyond `NET_BIND_SERVICE` | Kyverno policy violation | SEV-3 |
| Pod using `latest` tag or unsigned image | Kyverno imageVerify failure | SEV-3 |

#### 4.2.2 Network Anomalies

| IOC | Detection Method | Severity |
|-----|-----------------|----------|
| Pod communicating with external IP not in egress allow-list | NeuVector network alert, Istio access log | SEV-2 |
| DNS queries to known malicious domains | NeuVector DLP/network sensor | SEV-1 |
| Unexpected lateral movement between namespaces | Istio access log + NetworkPolicy deny log | SEV-2 |
| mTLS failure (plaintext traffic within mesh) | Istio PeerAuthentication violation, Prometheus `istio_requests_total{security_policy="unknown"}` | SEV-1 |
| High volume of denied network connections (scanning behavior) | NetworkPolicy deny logs in Loki | SEV-3 |
| Traffic to cryptocurrency mining pools | NeuVector DLP, DNS query analysis in Loki | SEV-1 |

#### 4.2.3 Authentication and Authorization Anomalies

| IOC | Detection Method | Severity |
|-----|-----------------|----------|
| Multiple failed API server authentication attempts | Kubernetes audit log in Loki | SEV-3 |
| Service account token used from unexpected pod/namespace | Kubernetes audit log correlation | SEV-2 |
| Keycloak brute-force detection triggered | Keycloak event log in Loki | SEV-2 |
| New ClusterRoleBinding granting cluster-admin | Kubernetes audit log alert | SEV-1 |
| ServiceAccount created in platform namespace by non-Flux actor | Kubernetes audit log alert | SEV-2 |
| OpenBao token created with broad policy access | OpenBao audit log in Loki | SEV-2 |
| JWT token replay or use after revocation | Istio RequestAuthentication failure log | SEV-2 |

#### 4.2.4 Supply Chain and Registry Anomalies

| IOC | Detection Method | Severity |
|-----|-----------------|----------|
| Image pushed to Harbor without passing Trivy scan gate | Harbor webhook, audit log | SEV-2 |
| Image signature verification failure on deployment | Kyverno imageVerify policy violation | SEV-2 |
| Image pulled from non-approved registry | Kyverno restrict-image-registries violation | SEV-2 |
| Unexpected replication policy in Harbor | Harbor audit log | SEV-3 |
| SBOM shows known-compromised dependency (e.g., log4j) | Harbor SBOM query, Trivy results | SEV-2 |

#### 4.2.5 Platform and GitOps Anomalies

| IOC | Detection Method | Severity |
|-----|-----------------|----------|
| Flux reconciliation of unauthorized Git commit | Flux event log, Git audit trail | SEV-1 |
| Manual `kubectl` modification of Flux-managed resources (drift) | Flux drift detection, Kyverno mutation log | SEV-3 |
| Unauthorized namespace creation | Kubernetes audit log, Kyverno policy | SEV-2 |
| etcd snapshot accessed or exported | Node audit log (auditd) | SEV-1 |
| Secrets accessed in bulk via API server | Kubernetes audit log, rate analysis | SEV-1 |
| CronJob or Job created in platform namespace by non-Flux actor | Kubernetes audit log | SEV-2 |

### 4.3 Analysis Procedures

#### Step 1: Initial Triage (ISSO / On-call Engineer)

1. Review the alert in Grafana / AlertManager / PagerDuty
2. Determine if the event is a true positive or false positive
3. Cross-reference with known maintenance windows and change requests
4. Check for correlated alerts across detection sources
5. Assign initial severity per Section 3.2

#### Step 2: Scope Assessment (IRT)

1. Identify all affected namespaces, pods, nodes, and services
2. Query Loki for related log entries across the time window:
   ```
   {namespace="<affected>"} |= "error" | json | line_format "{{.msg}}"
   ```
3. Review Istio access logs for the affected workload:
   ```
   {app="istio-proxy", namespace="<affected>"} | json | downstream_remote_address != ""
   ```
4. Check NeuVector for related security events on the same node
5. Review OpenBao audit log for secret access from affected identities
6. Check Kubernetes audit log for RBAC actions by affected service accounts
7. Determine blast radius: single pod, namespace, node, or cluster-wide

#### Step 3: Evidence Preservation

Before any containment actions, preserve evidence:

1. Export relevant Loki logs to durable storage:
   ```bash
   # Export logs for affected namespace for the past 24 hours
   logcli query '{namespace="<affected>"}' --from="24h" --output=jsonl > evidence/logs-<incident-id>.jsonl
   ```
2. Capture NeuVector security events and network activity
3. Export Kyverno PolicyReports for affected namespace
4. Snapshot the current state of affected resources:
   ```bash
   kubectl get all,networkpolicies,serviceaccounts -n <namespace> -o yaml > evidence/state-<incident-id>.yaml
   ```
5. If node compromise suspected, capture node forensics before containment:
   ```bash
   # Capture running processes, network connections, loaded modules
   ssh <node> "ps auxf; ss -tulnp; lsmod; last -50" > evidence/node-<incident-id>.txt
   ```
6. Store all evidence in a secured, access-controlled location with chain-of-custody documentation

---

## 5. Containment, Eradication, and Recovery

### 5.1 Containment Procedures

Containment aims to limit the blast radius while preserving evidence. Select containment actions based on the scope of the incident.

#### 5.1.1 Isolate a Namespace

Apply an emergency deny-all NetworkPolicy to isolate the compromised namespace from all traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-isolate
  namespace: <compromised-namespace>
  labels:
    sre.io/incident: "<incident-id>"
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

Apply:
```bash
kubectl apply -f emergency-isolate.yaml
kubectl annotate namespace <namespace> sre.io/incident-id="<incident-id>" sre.io/isolated="true"
```

#### 5.1.2 Scale Down Compromised Workload

```bash
# Scale deployment to zero replicas
kubectl scale deployment <name> -n <namespace> --replicas=0

# Or suspend the Flux HelmRelease to prevent reconciliation from scaling back up
flux suspend helmrelease <name> -n <namespace>
```

#### 5.1.3 Revoke Credentials

**OpenBao:**
```bash
# Revoke all tokens for the affected auth method/role
vault token revoke -accessor <accessor>

# Rotate the affected secret
vault kv put sre/<team>/<secret-name> value="<new-value>"

# Revoke dynamic credentials (database, PKI)
vault lease revoke -prefix sre/<team>/
```

**Keycloak:**
```bash
# Disable compromised user
# Via Keycloak Admin API or admin console:
# Users → select user → toggle "Enabled" to OFF

# Revoke all active sessions for user
# Users → select user → Sessions tab → "Logout all sessions"

# Rotate client secret for compromised OIDC client
# Clients → select client → Credentials → Regenerate Secret
```

**Kubernetes:**
```bash
# Delete and recreate ServiceAccount (invalidates all tokens)
kubectl delete serviceaccount <sa-name> -n <namespace>
kubectl create serviceaccount <sa-name> -n <namespace>

# Delete specific secret
kubectl delete secret <secret-name> -n <namespace>
```

#### 5.1.4 Block Image in Harbor

```bash
# Tag the image as quarantined (prevents new pulls via Kyverno label policy)
# In Harbor UI: select image → Labels → add "quarantined"

# Or use Harbor API:
curl -X POST "https://harbor.sre.internal/api/v2.0/projects/<project>/repositories/<repo>/artifacts/<digest>/labels" \
  -H "Authorization: Basic <credentials>" \
  -d '{"name": "quarantined"}'
```

#### 5.1.5 Cordon and Drain Compromised Node

If node-level compromise is suspected:

```bash
# Prevent new pods from scheduling
kubectl cordon <node-name>

# Drain existing pods to healthy nodes
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --grace-period=30

# If active exploitation, isolate at network level (firewall/security group)
# [Execute per infrastructure provider procedures]
```

#### 5.1.6 Emergency Kyverno Policy

Deploy an emergency policy to block specific images or patterns:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: emergency-block-<incident-id>
  labels:
    sre.io/incident: "<incident-id>"
  annotations:
    sre.io/nist-controls: "IR-4, SI-3"
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: block-compromised-image
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Image blocked due to active security incident <incident-id>."
        pattern:
          spec:
            containers:
              - image: "!<compromised-image-pattern>*"
```

### 5.2 Eradication Procedures

Eradication removes the root cause and all traces of the compromise.

#### 5.2.1 Remove Compromised Workloads

```bash
# Delete the compromised resources
kubectl delete deployment,service,configmap,secret -n <namespace> -l app=<compromised-app>

# If Flux-managed, ensure the Git source is clean first
# Then force reconciliation from known-good state
flux reconcile kustomization sre-core --with-source
```

#### 5.2.2 Rotate All Affected Credentials

| Credential Type | Rotation Method |
|----------------|----------------|
| Kubernetes ServiceAccount tokens | Delete and recreate ServiceAccount |
| OpenBao secrets | `vault kv put` with new values; ESO auto-syncs |
| Keycloak client secrets | Regenerate in admin console; update ESO ExternalSecret |
| TLS certificates | Trigger cert-manager renewal: `kubectl delete certificate <name>` |
| Harbor robot accounts | Delete and recreate robot account |
| Database credentials | Rotate via OpenBao dynamic credentials |
| SSH keys (node access) | Rotate via Ansible: `ansible-playbook playbooks/rotate-ssh-keys.yml` |

#### 5.2.3 Patch Vulnerabilities

```bash
# Update base images in Helm values (apps/tenants/<team>/values.yaml)
# Commit to Git; Flux auto-deploys

# For platform components, update HelmRelease chart version
# in platform/core/<component>/helmrelease.yaml

# Run full vulnerability scan on all running images
# Harbor: Projects → select project → Repositories → Scan All

# NeuVector: scan all running containers
# Assets → Containers → Scan All
```

#### 5.2.4 Full Security Scan

After eradication, run comprehensive scans:

```bash
# Trivy scan of all images in affected namespaces
for image in $(kubectl get pods -n <namespace> -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u); do
  trivy image --severity CRITICAL,HIGH "$image"
done

# Kyverno background scan (verify all policies pass)
kubectl get policyreport -n <namespace> -o yaml

# NeuVector CIS benchmark rescan
# Security → CIS Benchmark → Run

# Verify image signatures
# Kyverno will automatically verify on next pod creation
```

### 5.3 Recovery Procedures

Recovery restores normal operations from a known-good state.

#### 5.3.1 Redeploy from Known-Good Git State

Flux CD provides the recovery mechanism. The Git repository IS the source of truth:

```bash
# Verify Git history for unauthorized commits
git log --oneline --since="<incident-start-time>" -- platform/ apps/

# If unauthorized commits found, revert them
git revert <commit-hash>
git push

# Force full reconciliation from Git
flux reconcile source git sre-platform
flux reconcile kustomization sre-core --with-source
```

#### 5.3.2 Verify Image Signatures Post-Recovery

```bash
# Verify all running images are signed
for pod in $(kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name}{"\n"}{end}'); do
  ns=$(echo $pod | cut -d/ -f1)
  name=$(echo $pod | cut -d/ -f2)
  images=$(kubectl get pod $name -n $ns -o jsonpath='{.spec.containers[*].image}')
  for img in $images; do
    cosign verify --key cosign.pub "$img" 2>/dev/null || echo "UNSIGNED: $img in $pod"
  done
done
```

#### 5.3.3 Restore from Velero Backup (if needed)

Use Velero backup restoration only when Git-based recovery is insufficient (e.g., data loss in stateful services):

```bash
# List available backups
velero backup get

# Restore specific namespace
velero restore create --from-backup <backup-name> --include-namespaces <namespace>

# Restore specific resources
velero restore create --from-backup <backup-name> --include-resources deployments,services

# Verify restore
velero restore describe <restore-name>
kubectl get all -n <namespace>
```

#### 5.3.4 Post-Recovery Verification Checklist

| Check | Command | Expected Result |
|-------|---------|----------------|
| All Flux Kustomizations healthy | `flux get kustomizations -A` | All show `Ready: True` |
| All HelmReleases healthy | `flux get helmreleases -A` | All show `Ready: True` |
| Kyverno policies enforcing | `kubectl get cpol -o wide` | All show `READY: true`, `ACTION: Enforce` |
| No policy violations in affected namespace | `kubectl get policyreport -n <ns>` | Zero `fail` results |
| Istio mTLS STRICT active | `kubectl get peerauthentication -A` | STRICT mode in all namespaces |
| NeuVector scanner healthy | NeuVector UI: Assets → Overview | All scanners connected |
| No CRITICAL/HIGH CVEs in running images | Harbor: scan results | Clean scan or accepted risk |
| OpenBao sealed status | `vault status` | Sealed: false, HA: active |
| Certificate chain valid | `kubectl get certificates -A` | All show `READY: True` |
| AlertManager routing functional | Send test alert | Alert received in Slack/PagerDuty |

---

## 6. Post-Incident Activities

### 6.1 Lessons Learned Meeting

A formal lessons learned meeting shall be conducted within **5 business days** of incident closure.

**Required Attendees:**
- IRT Lead and all responding team members
- ISSM and ISSO
- System Owner
- Affected application team representatives (if tenant workload was involved)
- AO representative (for SEV-1/SEV-2 incidents)

**Agenda:**

1. **Timeline Review** — Walk through the incident chronologically using preserved evidence
2. **Detection Assessment** — How was the incident detected? Could we have detected it sooner?
3. **Response Assessment** — Were containment/eradication/recovery procedures effective?
4. **Root Cause Analysis** — What was the root cause? Was it a known vulnerability, misconfiguration, or novel attack?
5. **Control Gap Analysis** — Which NIST 800-53 controls failed or were insufficient?
6. **Improvement Actions** — Specific, assigned, time-bound actions to prevent recurrence

### 6.2 Documentation Requirements

The following artifacts must be produced for every confirmed incident:

| Artifact | Owner | Timeline | Storage |
|----------|-------|----------|---------|
| Incident Report (final) | IRT Lead | 10 business days after closure | eMASS + SharePoint |
| Lessons Learned Report | IRT Lead | 5 business days after LL meeting | SharePoint |
| Updated POA&M entries | ISSO | 5 business days after closure | eMASS |
| Evidence package | Security Analyst | Preserved at time of incident | Secured storage |
| Updated detection rules | Security Analyst | 10 business days after closure | Git repo (policies/) |
| Updated IRP (if needed) | ISSM | 30 days after closure | Git repo (compliance/raise/) |

### 6.3 Update POA&M

For every incident that reveals a security control weakness:

1. Create or update a POA&M entry in eMASS/MCAST
2. Map the finding to the specific NIST 800-53 control(s) that failed
3. Document the planned corrective action with milestones
4. Assign a responsible party and target completion date
5. Track through the next quarterly review (QREV)

### 6.4 Update Detection and Prevention

Based on lessons learned, update:

- **Kyverno Policies** — Add new policies or tighten existing ones in `policies/`
- **NeuVector Rules** — Update process profiles, network rules, or DLP sensors
- **Prometheus Alert Rules** — Add or refine PrometheusRules for better detection
- **Grafana Dashboards** — Add new panels for newly identified IOCs
- **Loki Alert Rules** — Add log-based alerting for newly identified patterns
- **NetworkPolicies** — Tighten egress rules based on observed attack patterns

All detection updates must:
- Be committed to the Git repository with a reference to the incident ID
- Include corresponding Kyverno policy tests (for new policies)
- Be reviewed and approved via pull request
- Map to NIST 800-53 controls via `sre.io/nist-controls` annotation

### 6.5 Evidence Preservation

Evidence must be preserved for the following durations:

| Evidence Type | Retention Period | Storage |
|---------------|-----------------|---------|
| Loki logs related to incident | 3 years minimum | Object storage (encrypted) |
| NeuVector security events | 3 years minimum | Export to object storage |
| Kubernetes resource state snapshots | 3 years minimum | Secured file storage |
| Network captures (if taken) | 3 years minimum | Secured file storage |
| Incident reports and LL docs | Life of the system + 3 years | eMASS + SharePoint |
| Git history (commits, PRs) | Life of the system | Git repository |

Evidence must be:
- Encrypted at rest (AES-256 or equivalent)
- Access-controlled (IRT + ISSM + legal only)
- Tamper-evident (checksums/signatures)
- Documented with chain-of-custody records

---

## 7. Communication Plan

### 7.1 Internal Notification Matrix

| Severity | Notify Immediately | Notify Within 1 Hour | Notify Within 4 Hours | Include in Daily/Weekly Report |
|----------|--------------------|----------------------|-----------------------|-------------------------------|
| **SEV-1** | On-call Engineer, IRT Lead, ISSM | ISSO, System Owner, AO | All IRT members, affected tenant teams | All stakeholders |
| **SEV-2** | On-call Engineer, IRT Lead | ISSM, ISSO, System Owner | AO, affected tenant teams | All stakeholders |
| **SEV-3** | On-call Engineer | IRT Lead, ISSO | ISSM | Weekly security report |
| **SEV-4** | — | On-call Engineer | ISSO | Monthly security report |

### 7.2 Notification Methods

| Method | Use For | Details |
|--------|---------|---------|
| **PagerDuty** | SEV-1/SEV-2 on-call escalation | _[PagerDuty service URL]_ |
| **Slack: #sre-incidents** | All severities — real-time coordination | AlertManager auto-posts SEV-1/2/3 |
| **Slack: #sre-security** | Security-specific alerts and analysis | NeuVector, Kyverno, vulnerability alerts |
| **Email: sre-irt@_[DOMAIN]_** | Formal notifications, evidence sharing | All IRT members |
| **Phone** | SEV-1 escalation when Slack/PagerDuty unresponsive | See contact list in Section 2 |
| **eMASS** | Official incident tracking and POA&M | _[eMASS SYSTEM ID]_ |

### 7.3 External Communication

#### 7.3.1 US-CERT Reporting

| Severity | Reporting Timeline | Report Type |
|----------|-------------------|-------------|
| SEV-1 (CAT 1-3) | Within 1 hour of determination | Initial report via US-CERT portal |
| SEV-2 (CAT 1-4) | Within 72 hours of determination | Standard incident report |
| SEV-3 (CAT 4-6) | As required | Standard incident report |
| All confirmed | Within 7 days of closure | Final incident report with lessons learned |

#### 7.3.2 AO Notification

The Authorizing Official must be notified:
- **Immediately (within 1 hour)** for any SEV-1 incident
- **Within 4 hours** for any SEV-2 incident
- **Within 24 hours** if any incident may affect the ATO status
- **At the next quarterly review** for SEV-3/SEV-4 incidents (summarized)

The AO notification must include:
1. Incident summary (what happened, when, how detected)
2. Current scope and impact assessment
3. Containment actions taken
4. Potential impact on ATO (risk to confidentiality, integrity, availability)
5. Recommended course of action

#### 7.3.3 Tenant Notification

If a tenant workload is affected:
1. Notify the tenant Application Owner within the severity-defined timeline
2. Provide guidance on any actions required by the tenant team
3. Coordinate remediation actions (image updates, credential rotation)
4. Provide post-incident summary to tenant for their own compliance records

### 7.4 Communication Templates

#### SEV-1 Initial Notification Template

```
SUBJECT: [SEV-1 INCIDENT] <Brief Description> — <Incident ID>

CLASSIFICATION: CUI // SP-NOFORN

INCIDENT ID: INC-<YYYY>-<NNN>
SEVERITY: SEV-1 (Critical)
STATUS: Active / Contained / Eradicated / Resolved
DETECTION TIME: <YYYY-MM-DD HH:MM UTC>
DETERMINATION TIME: <YYYY-MM-DD HH:MM UTC>

SUMMARY:
<2-3 sentence description of what happened>

AFFECTED SYSTEMS:
- Namespace(s): <list>
- Node(s): <list>
- Service(s): <list>

IMPACT:
- Confidentiality: <None / Low / Moderate / High>
- Integrity: <None / Low / Moderate / High>
- Availability: <None / Low / Moderate / High>

CONTAINMENT ACTIONS TAKEN:
1. <action>
2. <action>

NEXT STEPS:
1. <action>
2. <action>

IRT LEAD: <Name> / <Contact>
NEXT UPDATE: <Time>
```

---

## 8. Incident Response Playbooks

The following playbooks provide step-by-step procedures for the most common incident scenarios on the SRE platform.

---

### Playbook 1: Compromised Container

**Trigger:** NeuVector process anomaly alert, unexpected shell execution, cryptominer detection, or confirmed container escape.

**Severity:** SEV-1 (container escape) or SEV-2 (compromise within container boundary)

#### Detection

- NeuVector alert: process not in learned profile (e.g., `/bin/sh`, `curl`, `wget`, cryptominer binary)
- NeuVector alert: file system modification in read-only container
- NeuVector alert: unexpected network connection (C2, mining pool, data exfiltration)
- Prometheus alert: unusual CPU/memory spike in container

#### Immediate Actions (First 15 Minutes)

1. **Verify the alert is not a false positive**
   ```bash
   # Check NeuVector security events for the pod
   # NeuVector UI: Notifications → Security Events → filter by pod name

   # Check pod details
   kubectl describe pod <pod-name> -n <namespace>
   kubectl logs <pod-name> -n <namespace> --tail=100
   ```

2. **Preserve evidence BEFORE containment**
   ```bash
   # Capture pod state
   kubectl get pod <pod-name> -n <namespace> -o yaml > evidence/pod-state-<incident-id>.yaml

   # Capture pod logs
   kubectl logs <pod-name> -n <namespace> --all-containers > evidence/pod-logs-<incident-id>.txt

   # Capture network connections from sidecar
   kubectl exec <pod-name> -n <namespace> -c istio-proxy -- ss -tulnp > evidence/netstat-<incident-id>.txt

   # Export NeuVector events for this container
   # NeuVector UI: Notifications → Security Events → Export CSV
   ```

3. **Isolate the namespace**
   ```bash
   kubectl apply -f - <<EOF
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: emergency-isolate
     namespace: <namespace>
     labels:
       sre.io/incident: "<incident-id>"
   spec:
     podSelector: {}
     policyTypes:
       - Ingress
       - Egress
   EOF
   ```

4. **Scale down the compromised workload**
   ```bash
   # Suspend Flux to prevent reconciliation
   flux suspend helmrelease <release-name> -n <namespace>

   # Scale to zero
   kubectl scale deployment <deployment-name> -n <namespace> --replicas=0
   ```

5. **If container escape is confirmed (SEV-1), cordon the node**
   ```bash
   kubectl cordon <node-name>
   kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --grace-period=60
   ```

#### Eradication

6. **Identify the root cause**
   - Was the image compromised at build time (supply chain)?
   - Was the running container exploited via a vulnerability?
   - Was there a misconfiguration allowing the compromise?

7. **Block the compromised image**
   ```bash
   # Quarantine in Harbor
   # Harbor UI: Projects → <project> → <repository> → select artifact → Add Label: quarantined

   # Deploy emergency Kyverno policy to block the image
   kubectl apply -f - <<EOF
   apiVersion: kyverno.io/v1
   kind: ClusterPolicy
   metadata:
     name: emergency-block-<incident-id>
   spec:
     validationFailureAction: Enforce
     rules:
       - name: block-compromised-image
         match:
           any:
             - resources:
                 kinds:
                   - Pod
         validate:
           message: "Image blocked: incident <incident-id>"
           deny:
             conditions:
               any:
                 - key: "{{ request.object.spec.containers[].image }}"
                   operator: AnyIn
                   value:
                     - "<compromised-image:tag>"
   EOF
   ```

8. **Rotate all credentials accessible to the compromised workload**
   - ServiceAccount tokens (delete and recreate SA)
   - OpenBao secrets (rotate via `vault kv put`)
   - Database credentials (rotate via OpenBao dynamic secrets)
   - Any secrets mounted as volumes or environment variables

9. **Scan all images on the affected node**
   ```bash
   # Full NeuVector scan
   # NeuVector UI: Assets → select node → Scan
   ```

#### Recovery

10. **Deploy patched version from known-good Git state**
    ```bash
    # Update the image tag in Git (apps/tenants/<team>/values.yaml)
    # Commit and push

    # Resume Flux reconciliation
    flux resume helmrelease <release-name> -n <namespace>

    # Remove emergency isolation
    kubectl delete networkpolicy emergency-isolate -n <namespace>
    ```

11. **Verify recovery** — Run the post-recovery checklist from Section 5.3.4

---

### Playbook 2: Credential Leak (Gitleaks Detection)

**Trigger:** Gitleaks CI gate failure, manual discovery of credentials in Git, or external notification of leaked credentials.

**Severity:** SEV-2 (confirmed credential in public/shared repo) or SEV-3 (credential in private repo, not confirmed exposed)

#### Detection

- Gitleaks security gate failure in CI/CD pipeline
- GitHub secret scanning alert
- External notification (HaveIBeenPwned, vendor notification)
- Manual discovery during code review

#### Immediate Actions (First 30 Minutes)

1. **Identify all leaked credentials**
   ```bash
   # Run Gitleaks against the repository
   gitleaks detect --source=<repo-path> --report-format=json --report-path=evidence/gitleaks-<incident-id>.json

   # Identify what types of credentials were leaked
   # (API keys, passwords, tokens, certificates, etc.)
   ```

2. **Determine exposure scope**
   - Is the repository public or private?
   - How long has the credential been in the commit history?
   - Who has access to the repository?
   - Has the credential been used since the commit?

3. **Immediately rotate ALL leaked credentials**

   | Credential Type | Rotation Procedure |
   |----------------|-------------------|
   | OpenBao token | `vault token revoke <token>` → generate new token |
   | Keycloak client secret | Regenerate in admin console → update ESO |
   | Harbor robot account | Delete robot → create new robot → update CI/CD |
   | Database password | Rotate via OpenBao dynamic credentials |
   | SSH key | Regenerate key pair → update Ansible inventory → redeploy |
   | API key | Revoke at provider → generate new key → update ESO |
   | TLS private key | `kubectl delete certificate <name>` → cert-manager reissues |

4. **Check for unauthorized use of leaked credentials**
   ```bash
   # OpenBao audit log
   # Query Loki: {app="openbao"} |= "<credential-identifier>"

   # Keycloak event log
   # Query Loki: {app="keycloak"} |= "LOGIN" |= "<client-id>"

   # Kubernetes audit log
   # Query Loki: {source="kubernetes-audit"} |= "<service-account>"
   ```

#### Eradication

5. **Remove credentials from Git history**
   ```bash
   # Use git-filter-repo to remove the file/secret from history
   # WARNING: This rewrites history — coordinate with all contributors
   git filter-repo --path <file-with-secret> --invert-paths

   # Or use BFG Repo Cleaner for specific strings
   bfg --replace-text passwords.txt <repo>

   # Force push the cleaned history (requires approval from System Owner)
   git push --force-with-lease
   ```

6. **Add prevention measures**
   - Verify Gitleaks pre-commit hook is installed for all contributors
   - Add the credential pattern to `.gitleaksignore` if it is a false positive
   - Update `.gitleaks.toml` if custom patterns are needed

#### Recovery

7. **Update all systems using the rotated credentials**
   - Update ExternalSecrets in OpenBao
   - Verify ESO syncs new secrets to Kubernetes
   - Restart affected pods to pick up new credentials
   - Verify all services are healthy

8. **Document the incident** — Include how the credential entered the repo and prevention measures taken

---

### Playbook 3: Critical CVE in Production

**Trigger:** Harbor/Trivy scan finds CRITICAL CVE (CVSS 9.0+) in an image running in production, or external advisory (NVD, vendor, US-CERT) identifies a critical vulnerability affecting a running component.

**Severity:** SEV-2 (CRITICAL CVE with known exploit), SEV-3 (CRITICAL CVE without known exploit)

#### Detection

- Harbor webhook: CRITICAL vulnerability found in scan
- NeuVector vulnerability scan alert
- Prometheus alert: `HarborCriticalVulnerability` firing
- External advisory (NVD, vendor, US-CERT alert)

#### Immediate Actions (First 1 Hour)

1. **Identify all affected images and pods**
   ```bash
   # Find all pods running the affected image
   kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name} {.spec.containers[*].image}{"\n"}{end}' | grep "<affected-image>"

   # Check Harbor for all projects containing the affected image
   # Harbor UI: search by CVE ID
   ```

2. **Assess exploitability**
   - Is there a public exploit available? (Check NVD, Exploit-DB, GitHub advisories)
   - Is the vulnerable component reachable from the network?
   - Are mitigating controls in place? (NetworkPolicy, Istio AuthorizationPolicy, NeuVector rules)
   - What is the attack vector? (Network, Local, Physical)

3. **Apply mitigating controls if a patch is not immediately available**
   ```bash
   # Tighten NetworkPolicy to limit attack surface
   # Add Istio AuthorizationPolicy to restrict access
   # Enable NeuVector protection mode for affected containers

   # Example: restrict ingress to only required sources
   kubectl apply -f - <<EOF
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: cve-mitigation-<CVE-ID>
     namespace: <namespace>
   spec:
     podSelector:
       matchLabels:
         app: <affected-app>
     policyTypes:
       - Ingress
     ingress:
       - from:
           - namespaceSelector:
               matchLabels:
                 kubernetes.io/metadata.name: istio-system
         ports:
           - port: <app-port>
   EOF
   ```

#### Eradication

4. **Patch the vulnerability**

   **For platform components:**
   ```bash
   # Check if a patched chart version is available
   helm search repo <chart-name> --versions

   # Update HelmRelease in platform/core/<component>/helmrelease.yaml
   # Change spec.chart.spec.version to patched version
   # Commit and push — Flux auto-deploys
   ```

   **For tenant applications:**
   ```bash
   # Notify tenant team with:
   # - CVE ID and severity
   # - Affected image and tag
   # - Recommended base image update
   # - Deadline for remediation (per SLA)

   # Update image tag in apps/tenants/<team>/values.yaml
   # Commit and push — Flux auto-deploys
   ```

5. **Verify the fix**
   ```bash
   # Trigger rescan in Harbor
   # Harbor UI: select artifact → Scan

   # Verify the CVE is no longer present
   trivy image <patched-image:tag> | grep <CVE-ID>
   ```

#### Recovery

6. **Verify all instances are patched**
   ```bash
   # Confirm no pods running the old image
   kubectl get pods -A -o jsonpath='{range .items[*]}{.spec.containers[*].image}{"\n"}{end}' | sort -u | grep "<affected-image>"
   ```

7. **Update POA&M** if the vulnerability cannot be immediately patched (document the mitigating controls and target remediation date)

---

### Playbook 4: Unauthorized Access

**Trigger:** Kubernetes audit log shows unauthorized API server access, Keycloak detects brute-force attack, or NeuVector detects unauthorized service-to-service communication.

**Severity:** SEV-1 (confirmed unauthorized access to cluster-admin or secrets), SEV-2 (confirmed unauthorized access attempt), SEV-3 (failed access attempts)

#### Detection

- Kubernetes audit log: successful authentication with unknown identity
- Kubernetes audit log: RBAC escalation (new ClusterRoleBinding)
- Keycloak: brute-force detection triggered
- Keycloak: login from unusual location/IP
- Istio: AuthorizationPolicy DENY with suspicious pattern
- NeuVector: unauthorized network connection between namespaces

#### Immediate Actions (First 15-30 Minutes)

1. **Determine what access was gained**
   ```bash
   # Review Kubernetes audit log for the identity
   # Query Loki: {source="kubernetes-audit"} |= "<username-or-sa>" | json

   # Check what the identity accessed
   # Query Loki: {source="kubernetes-audit"} | json | user_username="<identity>" | line_format "{{.verb}} {{.objectRef_resource}}/{{.objectRef_name}} {{.objectRef_namespace}}"

   # Check for RBAC changes
   kubectl get clusterrolebindings -o json | jq '.items[] | select(.subjects[]?.name == "<identity>")'
   ```

2. **Revoke the compromised identity immediately**
   ```bash
   # For Keycloak user:
   # Disable user + revoke sessions (see Section 5.1.3)

   # For ServiceAccount:
   kubectl delete serviceaccount <sa-name> -n <namespace>

   # For kubeconfig/token:
   # Rotate the affected certificate/token
   # If RKE2 admin kubeconfig is compromised: rotate API server certificates
   ```

3. **Check for persistence mechanisms**
   ```bash
   # Look for new ServiceAccounts
   kubectl get serviceaccounts -A --sort-by=.metadata.creationTimestamp | tail -20

   # Look for new ClusterRoleBindings
   kubectl get clusterrolebindings --sort-by=.metadata.creationTimestamp | tail -20

   # Look for new CronJobs (persistence via scheduled execution)
   kubectl get cronjobs -A --sort-by=.metadata.creationTimestamp | tail -20

   # Look for new Secrets (potential backdoor tokens)
   kubectl get secrets -A --sort-by=.metadata.creationTimestamp --field-selector type=kubernetes.io/service-account-token | tail -20

   # Look for webhook configurations (potential intercept)
   kubectl get mutatingwebhookconfigurations,validatingwebhookconfigurations
   ```

4. **Isolate affected namespaces** (see Section 5.1.1)

#### Eradication

5. **Remove all unauthorized resources**
   ```bash
   # Delete unauthorized RBAC bindings
   kubectl delete clusterrolebinding <unauthorized-binding>

   # Delete unauthorized ServiceAccounts
   kubectl delete serviceaccount <unauthorized-sa> -n <namespace>

   # Delete any backdoor CronJobs, Deployments, or Pods
   kubectl delete <resource> <name> -n <namespace>
   ```

6. **Rotate all credentials that may have been accessed** (see Section 5.2.2)

7. **Review and harden RBAC configuration**
   - Audit all ClusterRoleBindings and RoleBindings
   - Ensure least privilege principle is applied
   - Verify Keycloak group-to-role mappings are correct

#### Recovery

8. **Restore RBAC to known-good state from Git**
   ```bash
   flux reconcile kustomization sre-core --with-source
   ```

9. **Enable enhanced monitoring for the affected identity/namespace**
   - Add specific Loki alert rules for the compromised identity pattern
   - Enable NeuVector protection mode for affected namespaces

---

### Playbook 5: Supply Chain Attack (Unsigned/Tampered Image)

**Trigger:** Kyverno imageVerify policy blocks an unsigned image, Harbor detects an image pushed without passing the Trivy scan gate, or NeuVector detects unexpected content in a container image.

**Severity:** SEV-1 (tampered image running in production), SEV-2 (unsigned image blocked before deployment), SEV-3 (unsigned image in registry but not deployed)

#### Detection

- Kyverno: `verify-image-signatures` policy violation
- Kyverno: `restrict-image-registries` policy violation (image from unapproved source)
- Harbor: image pushed without Cosign signature
- Harbor: image scan reveals embedded malware or backdoor
- NeuVector: container runtime behavior does not match expected baseline

#### Immediate Actions

1. **Determine if the unsigned/tampered image is running**
   ```bash
   # Check if any pods are running the suspect image
   kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name} {.spec.containers[*].image}{"\n"}{end}' | grep "<suspect-image>"
   ```

2. **If the image is running (SEV-1):**
   - Follow Playbook 1 (Compromised Container) for containment
   - Treat all data processed by the container as potentially compromised
   - Notify all tenant teams whose traffic may have been intercepted

3. **If the image was blocked by Kyverno (SEV-2):**
   - The containment is already in place (admission denied)
   - Focus on investigating how the unsigned image entered the pipeline

4. **Investigate the supply chain**
   ```bash
   # Check Harbor audit log for who pushed the image
   # Harbor UI: Logs → filter by repository

   # Verify CI/CD pipeline logs
   # Did the image pass all 8 security gates?

   # Check the image SBOM for unexpected dependencies
   # Harbor UI: select artifact → Accessories → SBOM

   # Verify the image layers
   trivy image --list-all-pkgs <suspect-image:tag>

   # Compare against known-good image
   cosign triangulate <suspect-image:tag>
   ```

5. **Quarantine the image in Harbor**
   ```bash
   # Add quarantine label
   # Harbor UI: select artifact → Labels → quarantined

   # Disable the robot account that pushed the image (if compromised)
   # Harbor UI: Robot Accounts → disable
   ```

#### Eradication

6. **Identify and fix the pipeline compromise**
   - Was the CI/CD runner compromised?
   - Was the base image tampered with upstream?
   - Was the Cosign signing key compromised?
   - Was the Harbor robot account credential leaked?

7. **If the signing key is compromised, rotate immediately**
   ```bash
   # Generate new Cosign key pair
   cosign generate-key-pair

   # Update the Kyverno imageVerify policy with the new public key
   # Update CI/CD pipeline with the new private key (stored in OpenBao)

   # Re-sign all legitimate images with the new key
   # This requires rebuilding and re-signing all production images
   ```

8. **Rebuild affected images from source**
   ```bash
   # Do NOT re-tag the suspect image — rebuild from source
   # Trigger full CI/CD pipeline with all 8 security gates
   # Verify the new image is signed with the correct key
   ```

#### Recovery

9. **Deploy verified images**
    ```bash
    # Update image tags in Git to the verified rebuilt images
    # Commit and push — Flux auto-deploys

    # Verify all running images are signed
    cosign verify --key cosign.pub <image:tag>
    ```

10. **Strengthen supply chain controls**
    - Review and tighten Harbor replication policies
    - Enable Trivy scanning on all pull operations (not just push)
    - Review CI/CD pipeline permissions and credentials
    - Consider image allowlisting in Kyverno (specific digests, not just signatures)

---

## 9. Plan Maintenance

### 9.1 Review Schedule

| Review Type | Frequency | Trigger | Responsible |
|-------------|-----------|---------|-------------|
| **Scheduled Review** | Annually (minimum) | Calendar | ISSM |
| **Post-Incident Review** | After every SEV-1 or SEV-2 incident | Incident closure | IRT Lead |
| **Change-Triggered Review** | When platform components change significantly | Major platform upgrade | ISSO |
| **ATO Review** | At each ATO renewal or continuous monitoring review | ATO lifecycle | ISSM + AO |
| **Regulation Update** | When NIST, DISA, or DoD guidance changes | Publication of new guidance | ISSM |

### 9.2 Testing Schedule

| Test Type | Frequency | Participants | Description |
|-----------|-----------|-------------|-------------|
| **Tabletop Exercise** | Quarterly | Full IRT + ISSM + System Owner | Walk through a scenario using this IRP without executing actions. Verify contact information, escalation paths, and decision-making. |
| **Technical Drill** | Semi-annually | IRT (technical members) | Execute containment and recovery procedures in a non-production environment. Test isolation, credential rotation, and Flux recovery. |
| **Full Exercise** | Annually | All stakeholders including AO | Simulated incident from detection through post-incident activities. Tests all communication channels and external reporting. |
| **Contact Verification** | Monthly | ISSO | Verify all phone numbers, email addresses, and escalation paths are current. |

#### Tabletop Exercise Scenarios (Rotate Quarterly)

1. **Q1:** Cryptominer detected in tenant namespace (Playbook 1)
2. **Q2:** GitHub secret scanning detects OpenBao root token in public repo (Playbook 2)
3. **Q3:** Critical RCE CVE in Istio proxy affecting all pods (Playbook 3)
4. **Q4:** Unauthorized cluster-admin access via compromised Keycloak account (Playbook 4)

### 9.3 Training Requirements

| Role | Training | Frequency | Delivery |
|------|----------|-----------|----------|
| All IRT members | NIST SP 800-61 incident handling | Annually | Self-study + assessment |
| All IRT members | SRE platform incident response procedures (this IRP) | Annually + on update | Instructor-led |
| All IRT members | Kubernetes security incident response | Annually | Hands-on lab |
| Platform Engineers | NeuVector, Kyverno, and Istio incident investigation | Semi-annually | Hands-on lab |
| ISSO/ISSM | DoD incident reporting requirements (CJCSM 6510.01B) | Annually | Self-study + assessment |
| All platform users | Security awareness and incident reporting | Annually | CBT |
| New IRT members | IRP orientation + shadow on-call rotation | On onboarding | Mentorship |

### 9.4 Plan Distribution

This IRP is maintained in the SRE platform Git repository at `compliance/raise/incident-response-plan.md` and is subject to the same change control as all platform configuration (Git PR workflow, conventional commits, review and approval).

Distribution list:
- All IRT members (Git access)
- ISSM and ISSO (Git access + offline copy)
- System Owner (offline copy)
- Authorizing Official (offline copy in ATO package)
- SCA (offline copy for assessment)

---

## 10. Appendices

### Appendix A: Incident Report Template

```
INCIDENT REPORT
===============

Incident ID:        INC-<YYYY>-<NNN>
Classification:     CUI // SP-NOFORN
Date of Report:     <YYYY-MM-DD>

1. INCIDENT SUMMARY
   Date/Time Detected:    <YYYY-MM-DD HH:MM UTC>
   Date/Time Determined:  <YYYY-MM-DD HH:MM UTC>
   Date/Time Contained:   <YYYY-MM-DD HH:MM UTC>
   Date/Time Eradicated:  <YYYY-MM-DD HH:MM UTC>
   Date/Time Resolved:    <YYYY-MM-DD HH:MM UTC>

   Severity:              SEV-<1/2/3/4>
   Category (US-CERT):    CAT <1-6>

   Summary:
   <Narrative description of the incident>

2. AFFECTED SYSTEMS
   Namespaces:    <list>
   Nodes:         <list>
   Pods:          <list>
   Services:      <list>
   Users:         <list>

3. IMPACT ASSESSMENT
   Confidentiality: <None / Low / Moderate / High>
   Integrity:       <None / Low / Moderate / High>
   Availability:    <None / Low / Moderate / High>

   Data Compromised: <Yes/No — if yes, describe type and volume>
   PII Involved:     <Yes/No — if yes, number of records>

4. ROOT CAUSE ANALYSIS
   <Description of root cause>

5. ACTIONS TAKEN
   Detection:     <How was the incident detected?>
   Containment:   <What containment actions were taken?>
   Eradication:   <How was the threat removed?>
   Recovery:      <How were systems restored?>

6. EVIDENCE PRESERVED
   <List of evidence artifacts and storage locations>

7. NIST 800-53 CONTROLS AFFECTED
   <List of controls that failed or were insufficient>

8. CORRECTIVE ACTIONS
   | Action | Owner | Due Date | Status |
   |--------|-------|----------|--------|
   |        |       |          |        |

9. LESSONS LEARNED
   <Key findings from lessons learned meeting>

10. EXTERNAL REPORTING
    US-CERT Report ID:    <if applicable>
    AO Notified:          <date/time>
    Other Notifications:  <list>

Prepared By:  <Name / Title>
Reviewed By:  <ISSM Name>
Approved By:  <System Owner Name>
```

### Appendix B: Evidence Collection Checklist

| Evidence Item | Command / Location | Collected? |
|--------------|-------------------|------------|
| Pod YAML definition | `kubectl get pod <name> -n <ns> -o yaml` | [ ] |
| Pod logs (all containers) | `kubectl logs <name> -n <ns> --all-containers` | [ ] |
| Previous pod logs | `kubectl logs <name> -n <ns> --previous` | [ ] |
| NeuVector security events | NeuVector UI: Export CSV | [ ] |
| NeuVector network activity | NeuVector UI: Network Activity → Export | [ ] |
| Kubernetes audit log (Loki) | `logcli query '{source="kubernetes-audit"}'` | [ ] |
| Istio access logs (Loki) | `logcli query '{app="istio-proxy"}'` | [ ] |
| Application logs (Loki) | `logcli query '{namespace="<ns>"}'` | [ ] |
| OpenBao audit log (Loki) | `logcli query '{app="openbao"}'` | [ ] |
| Keycloak event log (Loki) | `logcli query '{app="keycloak"}'` | [ ] |
| NetworkPolicy state | `kubectl get networkpolicies -n <ns> -o yaml` | [ ] |
| RBAC bindings | `kubectl get rolebindings,clusterrolebindings -o yaml` | [ ] |
| Kyverno policy reports | `kubectl get policyreport -n <ns> -o yaml` | [ ] |
| Node process list | `ssh <node> "ps auxf"` | [ ] |
| Node network connections | `ssh <node> "ss -tulnp"` | [ ] |
| Node auditd log | `ssh <node> "ausearch -ts <time>"` | [ ] |
| Harbor scan results | Harbor UI: artifact scan report | [ ] |
| Git commit history | `git log --since="<time>" -- platform/ apps/` | [ ] |

### Appendix C: Quick Reference — Emergency Commands

```bash
# === CONTAINMENT ===

# Isolate namespace (deny all traffic)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-isolate
  namespace: <NAMESPACE>
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
EOF

# Kill a compromised pod immediately
kubectl delete pod <POD> -n <NAMESPACE> --grace-period=0 --force

# Scale workload to zero
kubectl scale deployment <NAME> -n <NAMESPACE> --replicas=0

# Suspend Flux reconciliation (prevent auto-healing)
flux suspend helmrelease <NAME> -n <NAMESPACE>
flux suspend kustomization <NAME> -n flux-system

# Cordon a node (no new pods scheduled)
kubectl cordon <NODE>

# Drain a node (evacuate pods)
kubectl drain <NODE> --ignore-daemonsets --delete-emptydir-data

# === INVESTIGATION ===

# Find pods running a specific image
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name} {.spec.containers[*].image}{"\n"}{end}' | grep "<IMAGE>"

# Check recent RBAC changes
kubectl get events -A --field-selector reason=Created --sort-by=.lastTimestamp | grep -i "rolebinding\|clusterrolebinding"

# List recently created resources
kubectl get all -A --sort-by=.metadata.creationTimestamp | tail -30

# Check Flux status
flux get all -A

# Check Kyverno violations
kubectl get policyreport -A -o wide

# === RECOVERY ===

# Force Flux reconciliation from Git
flux reconcile source git sre-platform
flux reconcile kustomization sre-core --with-source

# Resume Flux after suspension
flux resume helmrelease <NAME> -n <NAMESPACE>

# Restore from Velero backup
velero restore create --from-backup <BACKUP> --include-namespaces <NAMESPACE>
```

### Appendix D: NIST 800-53 Control Mapping

This IRP satisfies the following NIST SP 800-53 Rev 5 controls:

| Control | Title | IRP Section |
|---------|-------|-------------|
| IR-1 | Incident Response Policy and Procedures | Sections 1, 9 |
| IR-2 | Incident Response Training | Section 9.3 |
| IR-3 | Incident Response Testing | Section 9.2 |
| IR-4 | Incident Handling | Sections 4, 5, 8 |
| IR-5 | Incident Monitoring | Section 4 |
| IR-6 | Incident Reporting | Section 7 |
| IR-7 | Incident Response Assistance | Section 2 |
| IR-8 | Incident Response Plan | All sections |
| IR-9 | Information Spillage Response | Playbook 2 |
| IR-10 | Integrated Information Security Analysis Team | Section 2 |
| AU-6 | Audit Review, Analysis, and Reporting | Section 4 |
| SI-4 | System Monitoring | Section 4.1 |
| SI-5 | Security Alerts, Advisories, and Directives | Section 7 |

### Appendix E: Glossary

| Term | Definition |
|------|-----------|
| **AO** | Authorizing Official — Senior official who accepts the risk of operating the system |
| **ATO** | Authority to Operate — Formal authorization to operate an information system |
| **C2** | Command and Control — Infrastructure used by attackers to communicate with compromised systems |
| **CAT** | Category — US-CERT incident classification |
| **CUI** | Controlled Unclassified Information |
| **CVE** | Common Vulnerabilities and Exposures |
| **CVSS** | Common Vulnerability Scoring System |
| **DAAPM** | DoD Assessment and Authorization Process Manual |
| **eMASS** | Enterprise Mission Assurance Support Service |
| **ESO** | External Secrets Operator |
| **IOC** | Indicator of Compromise |
| **IRP** | Incident Response Plan |
| **IRT** | Incident Response Team |
| **ISSM** | Information System Security Manager |
| **ISSO** | Information System Security Officer |
| **MCAST** | Mission Cyberspace Assessment Tool |
| **mTLS** | Mutual Transport Layer Security |
| **NVD** | National Vulnerability Database |
| **OSCAL** | Open Security Controls Assessment Language |
| **PII** | Personally Identifiable Information |
| **POA&M** | Plan of Action and Milestones |
| **QREV** | Quarterly Review |
| **RBAC** | Role-Based Access Control |
| **RMF** | Risk Management Framework |
| **RPOC** | RAISE Platform of Choice |
| **SCA** | Security Control Assessor |
| **SEV** | Severity |
| **SLA** | Service Level Agreement |
| **SPIFFE** | Secure Production Identity Framework for Everyone |
| **SSP** | System Security Plan |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| System Owner | _[NAME]_ | _________________ | _[DATE]_ |
| ISSM | _[NAME]_ | _________________ | _[DATE]_ |
| ISSO | _[NAME]_ | _________________ | _[DATE]_ |
| Authorizing Official | _[NAME]_ | _________________ | _[DATE]_ |

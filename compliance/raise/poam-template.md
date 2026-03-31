# Plan of Action & Milestones (POA&M)

## RPOC: Secure Runtime Environment (SRE)

**eMASS/MCAST ID:** _[TO BE ASSIGNED]_
**Last Updated:** 2026-03-30
**RPOC ISSM:** _[NAME]_

---

## Instructions

This POA&M tracks all known findings, vulnerabilities, and deficiencies for the RPOC and hosted applications. Update this document as findings are discovered, remediated, or mitigated.

**Automated sources:**
- Trivy container scan reports (Harbor)
- Semgrep SAST findings (CI/CD pipeline)
- OWASP ZAP DAST findings (CI/CD pipeline)
- Gitleaks secret detection findings (CI/CD pipeline)
- NeuVector runtime findings (cluster)
- Kyverno policy violations (cluster)

Run `scripts/compliance-report.sh --json` to auto-generate POA&M entries from live cluster data.

---

## Findings Register

### Format

Each finding follows this structure:

| Field | Description |
|-------|-------------|
| POA&M ID | Unique identifier (e.g., POAM-2026-001) |
| Finding Source | Tool that discovered it (Trivy, Semgrep, ZAP, NeuVector, Manual) |
| CVE/CWE | CVE ID or CWE category if applicable |
| Severity | CRITICAL / HIGH / MEDIUM / LOW |
| Description | What the finding is |
| Affected Asset | Application, image, or component affected |
| NIST Controls | Related NIST 800-53 controls |
| Discovery Date | When the finding was identified |
| Due Date | Remediation deadline per SLA |
| Status | Open / In Progress / Mitigated / Remediated / Risk Accepted |
| Responsible Party | Application Owner or Platform Team |
| Remediation Plan | What will be done to fix it |
| Milestones | Key dates and checkpoints |
| Mitigation Statement | If mitigated (not remediated), document the compensating control |
| Completion Date | When remediation/mitigation was completed |
| Validated By | Who verified the fix |

---

## Active Findings

### POAM-004: Velero backup storage backend not configured for production

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | MEDIUM |
| **Description** | Velero backup storage backend not configured for production. Backups are scheduled but stored locally with no off-cluster replication. A node failure could lose all backup data. |
| **Affected Asset** | Platform: Velero (velero namespace) |
| **NIST Controls** | CP-9, CP-10 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-05-23 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Provision S3-compatible storage (MinIO or AWS S3) for off-cluster backups. Update Velero BackupStorageLocation CRD. |
| **Milestones** | Day 14: Evaluate S3 options (MinIO on-prem vs cloud). Day 30: Deploy storage backend. Day 45: Migrate backup schedule. Day 55: Validate restore from S3. |

---

### POAM-005: NeuVector OIDC integration not configured

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | MEDIUM |
| **Description** | NeuVector uses local authentication (admin/admin) instead of Keycloak SSO. Users must maintain separate credentials. Audit trail for NeuVector actions is not correlated with SSO identity. |
| **Affected Asset** | Platform: NeuVector (neuvector namespace), Keycloak (keycloak namespace) |
| **NIST Controls** | IA-2, AC-2 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-05-23 |
| **Status** | Open |
| **Responsible** | Security Team |
| **Remediation Plan** | Configure NeuVector Settings > OpenID Connect with Keycloak SRE realm. Client ID: neuvector, Issuer: https://keycloak.apps.sre.example.com/realms/sre. Map Keycloak groups to NeuVector roles. |
| **Milestones** | Day 14: Configure OIDC in NeuVector UI. Day 21: Map groups to roles. Day 30: Test SSO login flow. Day 45: Disable local admin password. |

---

### POAM-006: Kyverno generate-sso-resources policy lacks Istio CRD permissions

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | MEDIUM |
| **Description** | Kyverno generate-sso-resources policy fails to create Istio RequestAuthentication and AuthorizationPolicy resources for new tenants because the Kyverno ServiceAccount lacks RBAC permissions for security.istio.io CRDs. |
| **Affected Asset** | Platform: Kyverno (kyverno namespace), Istio CRDs |
| **NIST Controls** | CM-6, AC-3 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-05-23 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Create ClusterRole granting Kyverno SA create/update/delete on security.istio.io/requestauthentications and security.istio.io/authorizationpolicies. Bind to kyverno ServiceAccount. |
| **Milestones** | Day 7: Draft ClusterRole YAML. Day 14: Test in dev. Day 21: Deploy via Flux. |

---

### POAM-007: Self-signed TLS certificates (not from public CA)

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | LOW |
| **Description** | All platform TLS certificates are self-signed via cert-manager internal CA. Browsers show certificate warnings. Not acceptable for production or user-facing government deployments. |
| **Affected Asset** | Platform: cert-manager (cert-manager namespace), all Istio gateway TLS termination |
| **NIST Controls** | SC-8, SC-12, IA-5 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-06-22 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Acceptable for lab environment. For production: configure cert-manager ClusterIssuer with Let's Encrypt (commercial) or DoD PKI CA chain (government). |
| **Milestones** | Day 30: Document current CA hierarchy. Day 60: Configure Let's Encrypt staging. Day 75: Switch to production issuer. Day 85: Validate certificate chain. |

---

### POAM-008: Helm chart test pods reference nonexistent image

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | LOW |
| **Description** | Helm chart test pods (test-connection.yaml) reference harbor.sre.internal/library/busybox which does not exist in Harbor. Chart tests fail with ImagePullBackOff. |
| **Affected Asset** | apps/templates/ Helm charts (sre-web-app, sre-worker, sre-cronjob) |
| **NIST Controls** | SA-11 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-06-22 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Either pull busybox into Harbor (harbor.sre.internal/library/busybox) via replication policy, or update test image references to an available image, or disable chart tests in HelmRelease. |
| **Milestones** | Day 14: Decide approach. Day 30: Implement fix. Day 45: Validate chart tests pass. |

---

### POAM-010: App contract schema requires harbor.* prefix for local testing

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 4 E2E) |
| **CVE/CWE** | N/A |
| **Severity** | LOW |
| **Description** | The values.schema.json in app template charts enforces that image.repository must match ^harbor\\.sre\\.internal/. This prevents developers from testing locally with images from Docker Hub or local registries. |
| **Affected Asset** | apps/templates/*/values.schema.json |
| **NIST Controls** | CM-11, SA-10 |
| **Discovery Date** | 2026-03-24 |
| **Due Date** | 2026-06-22 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | By design for production security (restrict-image-registries Kyverno policy). Document workaround: use --no-verify flag for local Helm testing, or add dev-mode exception in values.schema.json. |
| **Milestones** | Day 14: Document workaround in developer guide. Day 30: Evaluate dev-mode schema override. |

---

### POAM-011: No MySQL/MariaDB service available

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 1-3) |
| **CVE/CWE** | N/A |
| **Severity** | MEDIUM |
| **Description** | Platform provides PostgreSQL via CloudNativePG operator but no MySQL/MariaDB. Applications requiring MySQL must bring their own database, adding operational complexity for tenant teams. |
| **Affected Asset** | Platform: Database services |
| **NIST Controls** | SA-8 |
| **Discovery Date** | 2026-03-15 |
| **Due Date** | 2026-05-14 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Documented "bring your own database" pattern. Consider adding MySQL operator (Percona XtraDB or Oracle MySQL Operator) as platform addon. |
| **Milestones** | Day 14: Document BYO-DB pattern. Day 30: Evaluate MySQL operators. Day 45: Decision on operator inclusion. Day 55: Deploy if approved. |

---

### POAM-012: No GPU workload support

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 1-3) |
| **CVE/CWE** | N/A |
| **Severity** | LOW |
| **Description** | Platform has no GPU device plugin or scheduling support. Workloads requiring GPU acceleration (ML inference, video processing) cannot run on the cluster. |
| **Affected Asset** | Platform: Kubernetes node configuration |
| **NIST Controls** | SA-8 |
| **Discovery Date** | 2026-03-15 |
| **Due Date** | 2026-06-13 |
| **Status** | Open |
| **Responsible** | Infrastructure Team |
| **Remediation Plan** | Requires NVIDIA device plugin DaemonSet, gpu-operator Helm chart, and nodes with NVIDIA GPUs. Not needed for current lab but documented for future capability. |
| **Milestones** | Day 30: Document GPU requirements. Day 60: Provision GPU node (if hardware available). Day 75: Deploy NVIDIA device plugin. |

---

### POAM-013: No distributed StatefulSet chart for multi-replica databases

| Field | Value |
|-------|-------|
| **Source** | Integration Testing (Round 1-3) |
| **CVE/CWE** | N/A |
| **Severity** | LOW |
| **Description** | No dedicated Helm chart template for StatefulSet workloads (multi-replica databases, distributed caches). The sre-worker chart is used as a workaround but lacks StatefulSet-specific features (stable network identities, ordered deployment, persistent volumes per replica). |
| **Affected Asset** | apps/templates/ (missing sre-statefulset chart) |
| **NIST Controls** | SA-8, CP-10 |
| **Discovery Date** | 2026-03-15 |
| **Due Date** | 2026-06-13 |
| **Status** | Open |
| **Responsible** | Platform Team |
| **Remediation Plan** | Create sre-statefulset Helm chart with PVC templates, headless service, ordered pod management, and pod disruption budget. |
| **Milestones** | Day 30: Design chart spec. Day 45: Implement chart. Day 60: Add values.schema.json and tests. Day 75: Document in developer guide. |

---

## Platform-Level Findings

_Track findings that affect the RPOC platform itself (not specific applications)._

| POA&M ID | Severity | Description | Status | Due Date |
|----------|----------|-------------|--------|----------|
| POAM-004 | MEDIUM | Velero backup storage backend not configured for production | Open | 2026-05-23 |
| POAM-005 | MEDIUM | NeuVector OIDC integration not configured (uses local auth) | Open | 2026-05-23 |
| POAM-006 | MEDIUM | Kyverno generate-sso-resources policy fails (needs Istio CRD permissions) | Open | 2026-05-23 |
| POAM-007 | LOW | Self-signed TLS certificates (not from public CA) | Open | 2026-06-22 |
| POAM-008 | LOW | Helm chart test pods use nonexistent harbor.sre.internal/library/busybox | Open | 2026-06-22 |
| POAM-010 | LOW | App contract schema requires harbor.* prefix — blocks local testing | Open | 2026-06-22 |
| POAM-011 | MEDIUM | No MySQL/MariaDB service (only PostgreSQL via CNPG) | Open | 2026-05-14 |
| POAM-012 | LOW | No GPU workload support | Open | 2026-06-13 |
| POAM-013 | LOW | No distributed StatefulSet chart for multi-replica databases | Open | 2026-06-13 |

---

## Application Findings Summary

_Aggregate view of findings per hosted application._

| Application | Team | CRITICAL | HIGH | MEDIUM | LOW | Oldest Open |
|-------------|------|----------|------|--------|-----|-------------|
| SRE Platform | Platform Team | 0 | 0 | 4 | 5 | 2026-03-15 |

---

## Closed Findings

_Move findings here when remediated or mitigated with AO acceptance._

| POA&M ID | Severity | Description | Resolution | Closed Date | Validated By |
|----------|----------|-------------|------------|-------------|--------------|
| POAM-001 | HIGH | Kyverno require-security-context blocks all root containers with no automated exception path | Deploy script now auto-generates PolicyExceptions (PR #43) | 2026-03-26 | Platform Team (E2E Round 4) |
| POAM-002 | HIGH | NetworkPolicy default-deny breaks Istio sidecar (missing ports 15017, 443) | Added required Istio ports to tenant _base template (PR #43) | 2026-03-26 | Platform Team (E2E Round 4) |
| POAM-003 | HIGH | OAuth2 proxy hardcoded redirect URL prevents tenant app SSO | Changed to dynamic redirect via oauth2.SRE_DOMAIN env var (PR #44) | 2026-03-26 | Platform Team (E2E Round 4) |
| POAM-009 | MEDIUM | Platform UI VirtualServices missing /oauth2/ route for SSO | Added /oauth2/ prefix routes to dashboard, portal, DSOP wizard VirtualServices | 2026-03-26 | Platform Team (E2E Round 4) |

---

## Risk Acceptance Register

_Findings accepted by the AO as residual risk (must not exceed Moderate)._

| POA&M ID | Severity | Description | Justification | Accepted By | Expiration |
|----------|----------|-------------|---------------|-------------|------------|
| | | | | | |

---

## Remediation Timelines (per RAISE 2.0)

| Severity | Timeline | Escalation Path |
|----------|----------|-----------------|
| CRITICAL | 7 calendar days | ISSM immediate, AO at day 7 |
| HIGH | 21 calendar days | ISSM at day 14, isolate workload at day 21 |
| MEDIUM | 60 calendar days | Review at quarterly |
| LOW | 90 calendar days | Track in POA&M |

---
title: NIST 800-53 to Kubernetes Mapping Matrix
description: Complete control mapping for Kubernetes platforms
published: true
tags: nist, kubernetes, controls, mapping, compliance
editor: markdown
---

# NIST 800-53 to Kubernetes Mapping Matrix

This matrix maps NIST 800-53 Rev 5 controls to specific Kubernetes implementations, evidence collection methods, and responsibility assignments. Use this as a starting point and customize for your environment.

---

## How to Use This Matrix

1. **Filter by applicability:** Remove controls your cloud provider fully satisfies
2. **Add agency requirements:** Include any additional controls from your baseline
3. **Assign ownership:** Mark each control as Platform, Application, or Shared
4. **Link to evidence:** Connect each control to your automated evidence collection
5. **Review with assessors:** Validate the mapping before your assessment

---

## Access Control (AC)

| Control ID | Control Title | Kubernetes Implementation | Evidence Collection | Owner |
|------------|---------------|---------------------------|---------------------|-------|
| AC-2 | Account Management | RBAC ServiceAccounts, Azure AD/Okta integration for user accounts | `kubectl get serviceaccounts -A -o yaml` | Platform |
| AC-2(1) | Automated Account Management | OIDC integration with IdP, automated SA creation via Helm/Kustomize | IdP audit logs, GitOps repo history | Platform |
| AC-3 | Access Enforcement | RBAC Roles/ClusterRoles, Namespace isolation | `kubectl get roles,clusterroles -A -o yaml` | Platform |
| AC-4 | Information Flow Enforcement | NetworkPolicies, Service Mesh authorization policies | `kubectl get networkpolicies -A -o yaml` | Shared |
| AC-5 | Separation of Duties | Distinct Roles for dev/ops/security, namespace boundaries | RBAC exports, namespace list with labels | Platform |
| AC-6 | Least Privilege | Minimal RBAC bindings, Pod Security Standards "restricted" | RoleBindings export, PSS audit results | Platform |
| AC-6(1) | Authorize Access to Security Functions | Dedicated security-admin ClusterRole, limited bindings | ClusterRoleBindings for security roles | Platform |
| AC-6(9) | Log Use of Privileged Functions | API server audit logging for privileged operations | Audit logs filtered for privileged actions | Platform |
| AC-6(10) | Prohibit Non-Privileged Users from Executing Privileged Functions | Pod Security Standards, admission controller policies | Gatekeeper/Kyverno constraint exports | Platform |
| AC-14 | Permitted Actions Without Identification | No anonymous access to API server | API server config (`--anonymous-auth=false`) | Platform |
| AC-17 | Remote Access | Private API endpoint, VPN/bastion requirements | API server endpoint config, network architecture | Platform |
| AC-17(2) | Protection of Confidentiality/Integrity Using Encryption | TLS for all API communication, mTLS in service mesh | TLS cert configs, mesh mTLS policy | Platform |

---

## Audit and Accountability (AU)

| Control ID | Control Title | Kubernetes Implementation | Evidence Collection | Owner |
|------------|---------------|---------------------------|---------------------|-------|
| AU-2 | Event Logging | API server audit policy configured for required events | Audit policy YAML, sample audit logs | Platform |
| AU-3 | Content of Audit Records | Audit policy at RequestResponse level for sensitive resources | Audit policy config, log samples | Platform |
| AU-3(1) | Additional Audit Information | Include user, source IP, timestamps in audit records | Sample audit log entries | Platform |
| AU-4 | Audit Log Storage Capacity | Dedicated log storage with retention policies | Storage config, retention policy | Platform |
| AU-5 | Response to Audit Logging Process Failures | Alerting on audit log pipeline failures | Alert rules, incident examples | Platform |
| AU-6 | Audit Record Review, Analysis, and Reporting | SIEM integration, compliance dashboards | Dashboard screenshots, SIEM config | Platform |
| AU-8 | Time Stamps | NTP synchronization across all nodes | Node time config, NTP server settings | Platform |
| AU-9 | Protection of Audit Information | Immutable log storage (S3 Object Lock, WORM) | Storage policy config, access logs | Platform |
| AU-9(4) | Access by Subset of Privileged Users | Separate RBAC for log access | RBAC for logging namespace | Platform |
| AU-11 | Audit Record Retention | 1+ year retention in immutable storage | Retention policy, storage lifecycle | Platform |
| AU-12 | Audit Record Generation | Audit logging enabled at API server, container runtime | Audit policy, Falco/runtime config | Platform |

---

## Configuration Management (CM)

| Control ID | Control Title | Kubernetes Implementation | Evidence Collection | Owner |
|------------|---------------|---------------------------|---------------------|-------|
| CM-2 | Baseline Configuration | GitOps repo with all platform manifests | Git repo export, branch protection rules | Platform |
| CM-2(2) | Automation Support for Accuracy/Currency | ArgoCD/Flux continuous reconciliation | GitOps tool config, sync status | Platform |
| CM-3 | Configuration Change Control | PR-based changes, required reviews | Git history, PR approval logs | Platform |
| CM-4 | Impact Analyses | Staging environment testing, policy dry-run | Pipeline logs, test results | Shared |
| CM-5 | Access Restrictions for Change | RBAC for GitOps repos, signed commits | Repo access logs, GPG key list | Platform |
| CM-6 | Configuration Settings | CIS benchmarks, DISA STIGs applied | kube-bench results, STIG scan | Platform |
| CM-7 | Least Functionality | Minimal base images, unused services disabled | Image scan results, node config | Shared |
| CM-7(1) | Periodic Review | Monthly CIS benchmark scans | Historical scan results | Platform |
| CM-7(2) | Prevent Program Execution | Pod Security Standards, read-only root filesystem | PSS config, admission policies | Platform |
| CM-8 | System Component Inventory | GitOps manifests as source of truth | Namespace/workload inventory export | Platform |
| CM-11 | User-Installed Software | Admission policies block unauthorized images | Image allowlist policy, admission logs | Platform |

---

## System and Communications Protection (SC)

| Control ID | Control Title | Kubernetes Implementation | Evidence Collection | Owner |
|------------|---------------|---------------------------|---------------------|-------|
| SC-2 | Separation of System and User Functionality | Dedicated system namespaces (kube-system, etc.) | Namespace list with labels | Platform |
| SC-3 | Security Function Isolation | Security tools in dedicated namespace with NetworkPolicies | Security namespace config | Platform |
| SC-4 | Information in Shared System Resources | Resource quotas, memory limits, no shared volumes | ResourceQuota exports, PV config | Shared |
| SC-5 | Denial of Service Protection | Resource limits, rate limiting at ingress | LimitRange exports, ingress config | Platform |
| SC-7 | Boundary Protection | NetworkPolicies (default-deny), ingress controller with WAF | NetworkPolicy exports, WAF rules | Platform |
| SC-7(3) | Access Points | Single ingress point, no NodePort services | Service exports, ingress config | Platform |
| SC-7(4) | External Telecommunications Services | Managed cloud provider networking | Cloud network architecture docs | Platform |
| SC-7(5) | Deny by Default | Default-deny NetworkPolicies in all namespaces | NetworkPolicy audit, policy reports | Platform |
| SC-8 | Transmission Confidentiality and Integrity | TLS everywhere, service mesh mTLS | Cert inventory, mesh config | Platform |
| SC-8(1) | Cryptographic Protection | TLS 1.2+ enforced, strong cipher suites | TLS config, cipher suite list | Platform |
| SC-10 | Network Disconnect | Session timeout configuration | Ingress timeout config | Platform |
| SC-12 | Cryptographic Key Establishment and Management | External KMS for secrets encryption | KMS config, key rotation logs | Platform |
| SC-13 | Cryptographic Protection | FIPS-validated crypto modules where required | Crypto module documentation | Platform |
| SC-23 | Session Authenticity | Token-based authentication with expiration | OIDC config, token lifetime settings | Platform |
| SC-28 | Protection of Information at Rest | etcd encryption, encrypted PersistentVolumes | Encryption config, storage class | Platform |
| SC-28(1) | Cryptographic Protection | KMS-backed encryption for secrets | KMS integration config | Platform |

---

## System and Information Integrity (SI)

| Control ID | Control Title | Kubernetes Implementation | Evidence Collection | Owner |
|------------|---------------|---------------------------|---------------------|-------|
| SI-2 | Flaw Remediation | Automated image scanning, patch management | Vuln scan results, patching SLAs | Shared |
| SI-2(2) | Automated Flaw Remediation Status | Dashboard showing vuln status across images | Vulnerability dashboard export | Platform |
| SI-3 | Malicious Code Protection | Runtime security (Falco, etc.), image scanning | Runtime alerts, scan results | Platform |
| SI-4 | System Monitoring | Centralized logging, SIEM integration, alerting | SIEM config, alert rules | Platform |
| SI-4(2) | Automated Tools for Real-Time Analysis | Runtime security, anomaly detection | Tool config, alert examples | Platform |
| SI-4(4) | Inbound and Outbound Communications Traffic | Network flow logging, egress controls | Flow logs, egress NetworkPolicies | Platform |
| SI-4(5) | System-Generated Alerts | Alerting rules for security events | Alert rule exports, PagerDuty/Slack config | Platform |
| SI-5 | Security Alerts and Advisories | CVE monitoring, automated notifications | CVE feed config, notification examples | Platform |
| SI-6 | Security Functionality Verification | Admission controller testing, policy audits | Test results, audit reports | Platform |
| SI-7 | Software, Firmware, and Information Integrity | Image signing, admission policies for signatures | Signing config, admission policies | Shared |
| SI-7(1) | Integrity Checks | Container image digest verification | Image pull policy config | Platform |
| SI-10 | Information Input Validation | Application-level validation, WAF rules | WAF config, app security tests | Application |
| SI-16 | Memory Protection | Seccomp profiles, no privileged containers | Security context configs | Platform |

---

## Quick Reference: Evidence Collection Commands

```bash
# AC Controls - RBAC
kubectl get serviceaccounts -A -o yaml > evidence/ac-2-serviceaccounts.yaml
kubectl get roles,rolebindings -A -o yaml > evidence/ac-3-roles.yaml
kubectl get clusterroles,clusterrolebindings -o yaml > evidence/ac-3-clusterroles.yaml

# AC Controls - Network
kubectl get networkpolicies -A -o yaml > evidence/ac-4-networkpolicies.yaml

# AU Controls - Audit
kubectl get pods -n kube-system -l component=kube-apiserver -o yaml > evidence/au-2-apiserver.yaml
# Audit policy typically at /etc/kubernetes/audit-policy.yaml on control plane

# CM Controls - Configuration
kubectl get namespaces -o yaml > evidence/cm-8-namespaces.yaml
kubectl get deployments,statefulsets,daemonsets -A -o yaml > evidence/cm-8-workloads.yaml

# SC Controls - Security
kubectl get ingress -A -o yaml > evidence/sc-7-ingress.yaml
kubectl get services -A -o yaml > evidence/sc-7-services.yaml

# SI Controls - Integrity
kubectl get constraints -A -o yaml > evidence/si-6-constraints.yaml  # Gatekeeper
kubectl get clusterpolicies -A -o yaml > evidence/si-6-policies.yaml  # Kyverno
```

---

## Responsibility Key

| Code | Meaning | Description |
|------|---------|-------------|
| **Platform** | Platform Team | Control fully satisfied by platform configuration |
| **Application** | Application Team | Control must be implemented by each application |
| **Shared** | Both Teams | Platform provides capability; application must use correctly |

---

## Customization Checklist

- [ ] Review each control against your authorization baseline
- [ ] Remove controls satisfied by cloud provider (mark as inherited)
- [ ] Add any agency-specific controls not listed
- [ ] Validate Kubernetes implementations match your actual configuration
- [ ] Update evidence collection commands for your environment
- [ ] Assign clear ownership for shared controls
- [ ] Review with your assessor organization

---

## Download Options

- [CSV Format](/ato-ebook/templates/mapping-matrix.csv) - For spreadsheet editing
- [JSON Format](/ato-ebook/templates/mapping-matrix.json) - For programmatic access
- [Excel Template](/ato-ebook/templates/mapping-matrix.xlsx) - With formatting and filters

---

**[← Back to Templates](/ato-ebook/templates)** | **[Next: OSCAL SSP Template →](/ato-ebook/templates/oscal-ssp)**

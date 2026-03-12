# QREV-3: Privacy Impact Assessment (PIA)

## RPOC Quarterly Review Artifact

**RPOC:** Secure Runtime Environment (SRE)
**Date:** _[DATE]_

---

## System Privacy Profile

### Does the SRE platform itself collect PII?

**No.** The SRE platform is infrastructure — it hosts containerized applications but does not itself collect, store, or process Personally Identifiable Information (PII).

### Do hosted applications collect PII?

**Possibly.** Individual applications deployed on the RPOC may collect, store, or process PII. Each Application Owner is responsible for their own PIA per the SLA (APPO-6).

## Platform Data Collection

The SRE platform collects the following operational data:

| Data Type | Purpose | Contains PII? | Retention |
|-----------|---------|---------------|-----------|
| Application logs | Troubleshooting, audit | Possible (app-dependent) | 90 days |
| Kubernetes audit logs | Security audit trail | No (system accounts) | 90 days |
| Metrics (Prometheus) | Performance monitoring | No | 15 days in-cluster |
| Traces (Tempo) | Request tracing | No | 7 days |
| Access logs (Istio) | Traffic audit | Possible (IP addresses) | 90 days |
| Authentication logs (Keycloak) | Access audit | Yes (usernames, IPs) | 90 days |

## PII Handling Controls

For applications that handle PII, the SRE platform provides:

| Control | Implementation |
|---------|---------------|
| Encryption in transit | Istio mTLS STRICT (all traffic encrypted) |
| Encryption at rest | RKE2 etcd encryption, OpenBao encrypted storage |
| Access control | Keycloak SSO + RBAC + namespace isolation |
| Audit logging | All access logged to Loki (90-day retention) |
| Data loss prevention | NeuVector DLP sensors |
| Network segmentation | NetworkPolicies + Istio AuthorizationPolicy |

## Application PIAs

_Each application that handles PII must provide its own PIA. Track status below._

| Application | Team | Handles PII? | PIA Provided? | Date |
|-------------|------|-------------|---------------|------|
| | | | | |

## Changes Since Last Review

_Document any changes to data handling, new PII-handling applications, or privacy incidents._

| Change | Date | Description |
|--------|------|-------------|
| | | |

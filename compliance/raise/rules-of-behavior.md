# Rules of Behavior

## Secure Runtime Environment (SRE) Platform

**Document Version:** 1.0
**Date:** _____________
**System Owner:** _____________
**ISSM:** _____________

---

## 1. Purpose

This document establishes the Rules of Behavior (RoB) for all users of the Secure Runtime Environment (SRE) platform. All users must read, acknowledge, and sign this document before being granted access.

## 2. Applicability

These rules apply to all personnel who access, administer, or deploy applications on the SRE platform, including:
- Platform administrators
- Application developers
- Application owners
- Security personnel (ISSM, ISSO)
- Auditors and assessors

## 3. General Rules

### 3.1 Authorized Use

- The SRE platform is a U.S. Government information system (or government-contracted system) intended for authorized use only
- Users may only perform actions within the scope of their assigned role and authorized access level
- All activity on this system is subject to monitoring, recording, and auditing
- Users consent to monitoring by accessing this system

### 3.2 Account Management

- Users must access the platform exclusively through their assigned Keycloak SSO account
- Sharing of credentials, tokens, or session cookies is strictly prohibited
- Users must report lost or compromised credentials immediately to the ISSM
- Multi-factor authentication (MFA) must be enabled and used for all access
- Users must lock their workstation when unattended

### 3.3 Data Handling

- Users must handle all data in accordance with its classification and sensitivity markings
- The SRE platform is authorized for data up to and including **CUI (Controlled Unclassified Information)** at the **MODERATE** impact level
- Users must not store, process, or transmit data above the platform's authorized classification level
- Users must not store Personally Identifiable Information (PII) without a documented Privacy Impact Assessment

### 3.4 Software and Containers

- All container images deployed to the platform must originate from the Harbor registry (`harbor.sre.internal`)
- All container images must pass the CI/CD pipeline security gates (GATE 1-8) before deployment
- Users must not bypass image signature verification or deploy unsigned images
- Users must not use the `:latest` image tag — all images must have pinned version tags
- Users must not deploy containers with privileged access, host networking, or elevated capabilities unless explicitly authorized by the ISSM

### 3.5 Secrets and Credentials

- All application secrets must be stored in OpenBao and synced via External Secrets Operator
- Users must never embed secrets, tokens, API keys, or credentials in source code, container images, environment variables in Git, or Helm values files
- Users must never commit secrets to Git repositories
- Users must rotate credentials immediately if exposure is suspected

### 3.6 Change Management

- All changes to platform configuration must be made through the GitOps workflow (Git pull request → review → merge → Flux CD reconciliation)
- Direct modification of cluster resources via `kubectl` is prohibited for platform namespaces
- All changes must follow conventional commit format and include a description of the change
- Emergency changes require ISSM notification within 4 hours

## 4. Platform Administrator Rules

In addition to the general rules above:

- Administrators must not disable or weaken Kyverno security policies without ISSM approval
- Administrators must not disable Istio mTLS STRICT mode
- Administrators must not modify audit logging configuration to reduce coverage
- Administrators must apply security patches within the SLA timelines:
  - CRITICAL: 7 calendar days
  - HIGH: 21 calendar days
  - MEDIUM: 60 calendar days
- Administrators must maintain backup schedules (Velero) and verify restore capability quarterly
- Administrators must report all security incidents per the Incident Response Plan

## 5. Application Developer Rules

In addition to the general rules above:

- Developers must use the SRE CI/CD pipeline templates for all deployments
- Developers must remediate security findings within the SLA timelines
- Developers must provide mitigation statements for any findings that cannot be immediately remediated
- Developers must maintain their application's STIG checklist and vulnerability management plan
- Developers must not introduce dependencies from unauthorized registries

## 6. Prohibited Activities

The following activities are explicitly prohibited:

- Attempting to access systems, data, or namespaces beyond authorized access level
- Disabling, circumventing, or modifying security controls (Kyverno, NeuVector, Istio mTLS)
- Conducting vulnerability scanning or penetration testing without explicit authorization
- Installing unauthorized software, tools, or backdoors
- Exfiltrating data from the platform
- Using the platform for personal or non-mission purposes
- Sharing access credentials or tokens with unauthorized individuals
- Connecting unauthorized devices to the platform network

## 7. Incident Reporting

Users must immediately report the following to the ISSM:

- Suspected or confirmed security incidents
- Unauthorized access attempts (successful or unsuccessful)
- Lost or compromised credentials
- Malware or suspicious activity
- Policy violations observed
- Vulnerabilities discovered in platform or application code

**ISSM Contact:** _____________
**ISSO Contact:** _____________
**Security Incident Email:** _____________
**After-Hours Emergency:** _____________

## 8. Consequences of Violations

Violation of these Rules of Behavior may result in:

- Immediate suspension of platform access
- Revocation of credentials
- Removal of application from the platform
- Administrative or disciplinary action
- Referral for criminal investigation (in cases of malicious activity)

## 9. Acknowledgment

By signing below, I acknowledge that I have read, understand, and agree to comply with these Rules of Behavior. I understand that my activity on this system is subject to monitoring and that violations may result in disciplinary action.

| Field | Value |
|-------|-------|
| **Printed Name** | _________________________________ |
| **Signature** | _________________________________ |
| **Organization** | _________________________________ |
| **Role** | _________________________________ |
| **Date** | _________________________________ |

---

## 10. Document Maintenance

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | _____________ | Initial Rules of Behavior | _____________ |

**Review Schedule:** Annually and upon significant platform changes.

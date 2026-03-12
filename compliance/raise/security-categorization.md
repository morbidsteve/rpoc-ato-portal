# Security Categorization — Secure Runtime Environment (SRE)

## Per FIPS 199 / NIST SP 800-60

---

## System Identification

| Field | Value |
|-------|-------|
| System Name | Secure Runtime Environment (SRE) |
| System Type | RAISE Platform of Choice (RPOC) |
| eMASS/MCAST ID | _[TO BE ASSIGNED]_ |
| System Owner | _[NAME / ORGANIZATION]_ |
| ISSM | _[NAME]_ |

## Security Categorization

The SRE platform is categorized as **MODERATE** based on FIPS 199 and CNSSI 1253:

| Impact Area | Level | Justification |
|-------------|-------|---------------|
| **Confidentiality** | MODERATE | Platform hosts Controlled Unclassified Information (CUI). Unauthorized disclosure could have serious adverse effects on organizational operations. |
| **Integrity** | MODERATE | Unauthorized modification of platform configuration or application deployments could have serious adverse effects on mission operations. |
| **Availability** | MODERATE | Disruption of platform services could have serious adverse effects but would not cause catastrophic mission failure. |

**Overall Security Category: SC = {(confidentiality, MODERATE), (integrity, MODERATE), (availability, MODERATE)}**

## Information Types (per NIST SP 800-60)

| Information Type | C | I | A |
|------------------|---|---|---|
| System Development (C.3.5.1) | M | M | M |
| Information Security (C.3.5.2) | M | M | M |
| IT Infrastructure Management (C.3.5.3) | M | M | M |

## Implications for Hosted Applications

Applications deployed on the SRE RPOC:

1. **Must be categorized at MODERATE or below** — The RPOC cannot host applications with a higher categorization than its own
2. **Must provide their own SCF** — Each application must document its security categorization
3. **Inherit platform controls** — Applications inherit the RPOC's inheritable security controls (network, IAM, monitoring, etc.)
4. **Application-specific controls** — Applications are responsible for controls specific to their data handling and business logic

## Namespace Labels

All tenant namespaces are labeled with the security categorization:

```yaml
metadata:
  labels:
    sre.io/security-categorization: "moderate"
    sre.io/data-classification: "cui"
```

The Kyverno policy `require-security-categorization` ensures all tenant namespaces have this label.

## Control Baseline

The MODERATE categorization requires implementation of NIST SP 800-53 Rev 5 Moderate baseline controls. The SRE platform implements **47 controls** across 11 control families. See `compliance/nist-800-53-mappings/control-mapping.json` for the full mapping.

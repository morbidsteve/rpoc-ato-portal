# Mitigation Statement

## Per RAISE 2.0 — APPO-8

Submit this to the RPOC ISSM for each finding that requires mitigation (not full remediation).

---

**POA&M ID:** _[e.g., POAM-2026-001]_
**Application:** _[APPLICATION NAME]_
**Team:** _[TEAM NAME]_
**Date:** _[DATE]_
**Submitted By:** _[NAME]_

---

## Finding Details

| Field | Value |
|-------|-------|
| CVE/CWE | _[e.g., CVE-2024-12345 or CWE-79]_ |
| Severity | _[CRITICAL / HIGH / MEDIUM / LOW]_ |
| Source | _[Trivy / Semgrep / ZAP / NeuVector / Manual]_ |
| Affected Component | _[e.g., libssl 3.0.2 in base image, or src/api/handler.go:42]_ |
| Discovery Date | _[YYYY-MM-DD]_ |

## Description

_[Describe the vulnerability in plain language. What is the risk?]_

## Applicability Assessment

_[Is this vulnerability exploitable in your application's context? Explain why or why not.]_

- [ ] The vulnerable component is reachable from user input
- [ ] The vulnerable code path is executed at runtime
- [ ] The vulnerability requires specific conditions not present in our deployment
- [ ] The vulnerability is in a dependency we do not directly use

## Mitigation (Compensating Controls)

_[Describe what controls are in place that reduce the risk to Moderate or below.]_

| Compensating Control | How It Mitigates |
|---------------------|------------------|
| _[e.g., Istio mTLS]_ | _[e.g., Prevents network-based exploitation]_ |
| _[e.g., NetworkPolicy]_ | _[e.g., Limits attack surface to authorized callers]_ |
| _[e.g., Read-only rootfs]_ | _[e.g., Prevents persistent malware installation]_ |
| _[e.g., Non-root container]_ | _[e.g., Limits privilege escalation impact]_ |

## Residual Risk Assessment

After applying compensating controls, the residual risk is: _[LOW / MODERATE]_

**Justification:** _[Explain why the residual risk is at or below Moderate]_

## Remediation Plan

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| _[e.g., Base image update]_ | _[YYYY-MM-DD]_ | _[Upgrade to patched image]_ |
| _[e.g., Dependency update]_ | _[YYYY-MM-DD]_ | _[Update library to fixed version]_ |
| _[e.g., Retest]_ | _[YYYY-MM-DD]_ | _[Verify fix via pipeline]_ |

## ISSM Review

| Field | Value |
|-------|-------|
| Reviewed By | _[ISSM NAME]_ |
| Review Date | _[DATE]_ |
| Accepted? | [ ] Yes [ ] No — requires further action |
| Notes | |

# QREV-5: Application Deployment Report

## RPOC Quarterly Review Artifact

**Review Period:** _[Q1/Q2/Q3/Q4 YYYY]_

---

## Applications Onboarded This Quarter (via RAISE Process)

| # | Application | Team | Onboarded Date | DADMS ID | SLA Signed? | All Gates Passed? |
|---|-------------|------|----------------|----------|-------------|-------------------|
| | | | | | | |

## Applications Offboarded This Quarter

| # | Application | Team | Offboarded Date | Reason | Data Disposition |
|---|-------------|------|-----------------|--------|------------------|
| | | | | | |

## Current Application Inventory

| Application | Team | Namespace | Current Version | Last Deploy | SLA Status |
|-------------|------|-----------|-----------------|-------------|------------|
| | | | | | |

## Application Health Summary

_Pull from Grafana dashboards and Flux status._

```bash
# Generate this data:
flux get helmreleases -A
kubectl get pods -A --field-selector=status.phase!=Running
```

| Application | Pods Running | HelmRelease Status | Last Reconciled |
|-------------|-------------|-------------------|-----------------|
| | | | |

## Changes to Existing Applications

_Major updates or feature changes reported by Application Owners (per APPO-11)._

| Application | Change Description | Date | ISSM Notified? |
|-------------|-------------------|------|----------------|
| | | | |

# Application Architecture — _[APPLICATION NAME]_

## Per RAISE 2.0 — APPO-16b

**Team:** _[TEAM NAME]_
**Version:** _[VERSION]_
**Date:** _[DATE]_

---

## Overview

_[1-2 paragraph description of what the application does and its key components.]_

## Architecture Diagram

_[Include or reference a diagram showing:]_
- Application components (containers/microservices)
- External system connections
- Data flows (user → app → database, etc.)
- Network boundaries

```
                    ┌──────────────────────────────────────────────┐
                    │              SRE Platform (RPOC)             │
                    │                                              │
  Users ──HTTPS──▶  │  Istio GW ──▶ [App Frontend] ──▶ [App API] │
                    │                                     │       │
                    │                              [Database Pod]  │
                    │                                              │
                    └──────────────────────────────────────────────┘
```

## Components

| Component | Image | Port | Purpose |
|-----------|-------|------|---------|
| _[e.g., frontend]_ | harbor.sre.internal/_[team]_/_[app]_-frontend:v1.0.0 | 8080 | Web UI |
| _[e.g., api]_ | harbor.sre.internal/_[team]_/_[app]_-api:v1.0.0 | 8080 | REST API |
| _[e.g., worker]_ | harbor.sre.internal/_[team]_/_[app]_-worker:v1.0.0 | N/A | Background processor |

## External Connections

| External System | Protocol | Port | Direction | Purpose |
|----------------|----------|------|-----------|---------|
| _[e.g., External API]_ | HTTPS | 443 | Egress | _[Purpose]_ |

## Data Flows

| # | From | To | Protocol | Data Type | Classification |
|---|------|-----|----------|-----------|----------------|
| 1 | User browser | Istio Gateway | HTTPS/TLS | User requests | _[CUI / Public]_ |
| 2 | Istio Gateway | App Frontend | mTLS | User requests | _[CUI / Public]_ |
| 3 | App Frontend | App API | mTLS | API calls | _[CUI / Public]_ |
| 4 | App API | Database | mTLS | Queries | _[CUI / Public]_ |

## Security Controls (Application-Specific)

| Control | Implementation |
|---------|---------------|
| Authentication | _[e.g., Keycloak SSO via OAuth2 Proxy, or app-level JWT]_ |
| Authorization | _[e.g., RBAC roles in app, Istio AuthorizationPolicy]_ |
| Input validation | _[e.g., Server-side validation on all endpoints]_ |
| Data encryption | _[e.g., All data encrypted via Istio mTLS + DB encryption]_ |
| Secrets | _[e.g., All secrets from OpenBao via ExternalSecret]_ |

## Resource Requirements

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|------------|-----------|----------------|--------------|
| | | | | |

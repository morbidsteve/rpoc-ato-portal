---
title: OSCAL SSP Starter Template
description: Machine-readable System Security Plan for Kubernetes platforms
published: true
tags: oscal, ssp, nist, compliance, yaml
editor: markdown
---

# OSCAL SSP Starter Template

This template provides the structural scaffolding for an OSCAL-formatted System Security Plan specifically designed for Kubernetes platforms. Copy this template, replace placeholders with your system details, and customize for your authorization baseline.

---

## Quick Start

1. Copy the YAML below into your repository
2. Replace all `[PLACEHOLDER]` values with your system information
3. Add additional components for your specific architecture
4. Complete implementation statements for each applicable control
5. Validate with OSCAL tooling before submission

---

## Complete OSCAL SSP Template

```yaml
system-security-plan:
  uuid: [GENERATE-UUID]  # Use: uuidgen or online generator

  metadata:
    title: "[SYSTEM NAME] System Security Plan"
    version: "1.0.0"
    oscal-version: "1.1.2"
    last-modified: "[YYYY-MM-DDTHH:MM:SSZ]"

    roles:
      - id: system-owner
        title: System Owner
        description: Individual responsible for the overall operation of the system

      - id: authorizing-official
        title: Authorizing Official
        description: Senior official with authority to authorize system operation

      - id: isso
        title: Information System Security Officer
        description: Individual responsible for system security posture

      - id: issm
        title: Information System Security Manager
        description: Individual responsible for security program management

      - id: platform-engineer
        title: Platform Engineer
        description: Technical staff responsible for platform operation

    parties:
      - uuid: [GENERATE-UUID]
        type: organization
        name: "[YOUR ORGANIZATION NAME]"
        short-name: "[ORG-SHORT]"

      - uuid: [GENERATE-UUID]
        type: person
        name: "[SYSTEM OWNER NAME]"
        email-addresses:
          - "[email@domain.gov]"
        member-of-organizations:
          - "[ORG-UUID]"

      - uuid: [GENERATE-UUID]
        type: person
        name: "[ISSO NAME]"
        email-addresses:
          - "[email@domain.gov]"
        member-of-organizations:
          - "[ORG-UUID]"

    responsible-parties:
      - role-id: system-owner
        party-uuids:
          - "[SYSTEM-OWNER-UUID]"

      - role-id: isso
        party-uuids:
          - "[ISSO-UUID]"

  import-profile:
    href: "https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/yaml/NIST_SP-800-53_rev5_MODERATE-baseline_profile.yaml"
    # Alternative baselines:
    # LOW: NIST_SP-800-53_rev5_LOW-baseline_profile.yaml
    # HIGH: NIST_SP-800-53_rev5_HIGH-baseline_profile.yaml
    # FedRAMP: Use FedRAMP-specific profiles

  system-characteristics:
    system-ids:
      - id: "[SYSTEM-ID]"
        identifier-type: "https://ietf.org/rfc/rfc4122"

    system-name: "[FULL SYSTEM NAME]"
    system-name-short: "[SHORT-NAME]"
    description: |
      [SYSTEM DESCRIPTION]

      This Kubernetes-based platform provides container orchestration services
      for [MISSION DESCRIPTION]. The platform enables rapid deployment of
      mission applications while maintaining continuous compliance with
      federal security requirements.

    security-sensitivity-level: moderate  # low, moderate, high

    system-information:
      information-types:
        - uuid: [GENERATE-UUID]
          title: "[INFORMATION TYPE 1]"
          description: "[Description of data processed]"
          categorizations:
            - system: "https://doi.org/10.6028/NIST.SP.800-60v2r1"
              information-type-ids:
                - "[NIST SP 800-60 ID]"
          confidentiality-impact:
            base: moderate
          integrity-impact:
            base: moderate
          availability-impact:
            base: moderate

    security-impact-level:
      security-objective-confidentiality: moderate
      security-objective-integrity: moderate
      security-objective-availability: moderate

    status:
      state: operational  # operational, under-development, under-major-modification, disposition, other

    authorization-boundary:
      description: |
        The authorization boundary encompasses:

        INCLUDED:
        - Kubernetes control plane components (API server, etcd, controller-manager, scheduler)
        - Worker nodes and container runtime
        - Platform services (ingress controller, service mesh, logging, monitoring)
        - GitOps tooling (ArgoCD/Flux)
        - Security tooling (Gatekeeper/Kyverno, Falco, image scanning)

        EXCLUDED (inherited from cloud provider):
        - Underlying cloud infrastructure (compute, storage, networking)
        - Managed Kubernetes control plane (if using EKS, AKS, GKE)
        - Cloud provider IAM and KMS services

        EXCLUDED (separate authorization):
        - Mission applications deployed on the platform (separate ATOs)
        - External identity providers
        - External CI/CD pipelines

      diagrams:
        - uuid: [GENERATE-UUID]
          description: "System Authorization Boundary Diagram"
          links:
            - href: "./diagrams/authorization-boundary.png"
              rel: diagram

    network-architecture:
      description: |
        The platform operates within a dedicated VPC with the following architecture:

        - Private subnets for Kubernetes nodes (no direct internet access)
        - Public subnets for load balancers and NAT gateways
        - VPC endpoints for AWS service access
        - Transit gateway connection to agency network

      diagrams:
        - uuid: [GENERATE-UUID]
          description: "Network Architecture Diagram"
          links:
            - href: "./diagrams/network-architecture.png"
              rel: diagram

    data-flow:
      description: |
        Data flows through the system as follows:

        1. Users authenticate via OIDC to external IdP
        2. Requests enter through Application Load Balancer
        3. Ingress controller routes to appropriate services
        4. Service mesh provides mTLS between all services
        5. Applications access databases via private endpoints
        6. All data encrypted in transit (TLS 1.2+) and at rest (AES-256)

      diagrams:
        - uuid: [GENERATE-UUID]
          description: "Data Flow Diagram"
          links:
            - href: "./diagrams/data-flow.png"
              rel: diagram

  system-implementation:
    users:
      - uuid: [GENERATE-UUID]
        title: Platform Administrators
        description: Personnel responsible for platform operation and maintenance
        role-ids:
          - platform-engineer
        authorized-privileges:
          - title: Cluster Administration
            functions-performed:
              - Manage cluster configuration
              - Deploy platform services
              - Respond to security alerts

      - uuid: [GENERATE-UUID]
        title: Application Developers
        description: Personnel who deploy and manage applications on the platform
        authorized-privileges:
          - title: Namespace Administration
            functions-performed:
              - Deploy applications to assigned namespaces
              - View application logs and metrics
              - Manage application configurations

      - uuid: [GENERATE-UUID]
        title: Security Operators
        description: Personnel responsible for security monitoring and response
        role-ids:
          - isso
        authorized-privileges:
          - title: Security Administration
            functions-performed:
              - Review security alerts and audit logs
              - Manage security policies
              - Conduct security assessments

    components:
      # ============================================
      # KUBERNETES CLUSTER
      # ============================================
      - uuid: comp-k8s-cluster-001
        type: service
        title: Production Kubernetes Cluster
        description: |
          Amazon EKS cluster providing container orchestration for mission
          applications. Cluster runs Kubernetes [VERSION] with managed
          node groups in private subnets.
        status:
          state: operational
        props:
          - name: vendor
            value: Amazon Web Services
          - name: service
            value: Elastic Kubernetes Service (EKS)
          - name: kubernetes-version
            value: "[1.28]"
          - name: region
            value: "[us-gov-west-1]"
          - name: endpoint-access
            value: private
        responsible-roles:
          - role-id: platform-engineer
            party-uuids:
              - "[PLATFORM-TEAM-UUID]"

      # ============================================
      # INGRESS CONTROLLER
      # ============================================
      - uuid: comp-ingress-001
        type: service
        title: NGINX Ingress Controller
        description: |
          Ingress controller managing external access to cluster services.
          Provides TLS termination, rate limiting, and WAF integration.
        status:
          state: operational
        props:
          - name: software-name
            value: NGINX Ingress Controller
          - name: software-version
            value: "[VERSION]"
          - name: namespace
            value: ingress-nginx
        responsible-roles:
          - role-id: platform-engineer

      # ============================================
      # SERVICE MESH
      # ============================================
      - uuid: comp-mesh-001
        type: service
        title: Istio Service Mesh
        description: |
          Service mesh providing mTLS between all services, traffic management,
          and observability. Enforces zero-trust networking within the cluster.
        status:
          state: operational
        props:
          - name: software-name
            value: Istio
          - name: software-version
            value: "[VERSION]"
          - name: mtls-mode
            value: STRICT
        responsible-roles:
          - role-id: platform-engineer

      # ============================================
      # POLICY ENGINE
      # ============================================
      - uuid: comp-policy-001
        type: service
        title: Gatekeeper Policy Engine
        description: |
          OPA Gatekeeper providing admission control and policy enforcement.
          Enforces Pod Security Standards, image policies, and custom
          organizational policies.
        status:
          state: operational
        props:
          - name: software-name
            value: OPA Gatekeeper
          - name: software-version
            value: "[VERSION]"
          - name: namespace
            value: gatekeeper-system
        responsible-roles:
          - role-id: platform-engineer

      # ============================================
      # LOGGING PIPELINE
      # ============================================
      - uuid: comp-logging-001
        type: service
        title: Centralized Logging Pipeline
        description: |
          Fluent Bit collectors streaming logs to CloudWatch Logs and S3
          for long-term retention. Audit logs stored in immutable S3
          bucket with Object Lock enabled.
        status:
          state: operational
        props:
          - name: collector
            value: Fluent Bit
          - name: storage
            value: S3 with Object Lock
          - name: retention-days
            value: "365"
        responsible-roles:
          - role-id: platform-engineer

      # ============================================
      # RUNTIME SECURITY
      # ============================================
      - uuid: comp-runtime-001
        type: service
        title: Falco Runtime Security
        description: |
          Runtime threat detection monitoring container and host activity.
          Alerts on suspicious behavior, policy violations, and potential
          compromises.
        status:
          state: operational
        props:
          - name: software-name
            value: Falco
          - name: software-version
            value: "[VERSION]"
          - name: namespace
            value: falco-system
        responsible-roles:
          - role-id: platform-engineer

      # ============================================
      # IMAGE SCANNING
      # ============================================
      - uuid: comp-scanning-001
        type: service
        title: Container Image Scanning
        description: |
          Trivy-based image scanning integrated into CI/CD pipeline and
          admission controller. Blocks deployment of images with critical
          vulnerabilities.
        status:
          state: operational
        props:
          - name: software-name
            value: Trivy
          - name: integration
            value: CI/CD and Admission
        responsible-roles:
          - role-id: platform-engineer

  control-implementation:
    description: |
      This section describes how the platform implements each applicable
      security control from NIST SP 800-53 Rev 5 Moderate baseline.

    implemented-requirements:
      # ============================================
      # ACCESS CONTROL (AC)
      # ============================================
      - uuid: impl-ac-2-001
        control-id: ac-2
        statements:
          - statement-id: ac-2_stmt
            uuid: stmt-ac-2-001
            description: |
              The platform implements account management through:

              a. Kubernetes ServiceAccounts for workload identity, managed
                 through GitOps with all changes tracked in version control.

              b. Human user accounts managed through [IdP NAME] with OIDC
                 integration to the Kubernetes API server.

              c. Account provisioning requires approval workflow in [SYSTEM].

              d. Accounts are reviewed quarterly with automated reporting.

              e. Inactive accounts disabled after 90 days via IdP policy.
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-ac-2-001
                description: |
                  Kubernetes RBAC provides authorization for all accounts.
                  ServiceAccount creation tracked in GitOps repository.
                implementation-status:
                  state: implemented

      - uuid: impl-ac-3-001
        control-id: ac-3
        statements:
          - statement-id: ac-3_stmt
            uuid: stmt-ac-3-001
            description: |
              Access enforcement is implemented through Kubernetes RBAC:

              - ClusterRoles define cluster-wide permissions (minimal use)
              - Roles define namespace-scoped permissions (preferred)
              - RoleBindings associate users/groups with Roles
              - All RBAC configuration managed through GitOps
              - Changes require PR approval from security team
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-ac-3-001
                description: |
                  RBAC enforced by Kubernetes API server for all requests.
                  Anonymous access disabled. All requests authenticated
                  and authorized.
                implementation-status:
                  state: implemented

      - uuid: impl-ac-4-001
        control-id: ac-4
        statements:
          - statement-id: ac-4_stmt
            uuid: stmt-ac-4-001
            description: |
              Information flow enforcement implemented through:

              a. NetworkPolicies enforce namespace isolation with default-deny
              b. Service mesh authorization policies control service-to-service
              c. Egress controls restrict outbound traffic to approved destinations
              d. All internal traffic encrypted via service mesh mTLS
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-ac-4-001
                description: NetworkPolicy enforcement via Calico CNI
                implementation-status:
                  state: implemented
              - component-uuid: comp-mesh-001
                uuid: by-comp-ac-4-002
                description: Service mesh authorization policies
                implementation-status:
                  state: implemented

      - uuid: impl-ac-6-001
        control-id: ac-6
        statements:
          - statement-id: ac-6_stmt
            uuid: stmt-ac-6-001
            description: |
              Least privilege enforced through:

              a. RBAC roles scoped to minimum necessary permissions
              b. Pod Security Standards at "restricted" profile
              c. No cluster-admin bindings except break-glass accounts
              d. Service accounts limited to specific namespace operations
              e. Containers run as non-root with minimal capabilities
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-ac-6-001
                description: RBAC with minimal permissions
                implementation-status:
                  state: implemented
              - component-uuid: comp-policy-001
                uuid: by-comp-ac-6-002
                description: |
                  Gatekeeper policies enforce Pod Security Standards,
                  blocking privileged containers and requiring non-root.
                implementation-status:
                  state: implemented

      # ============================================
      # AUDIT AND ACCOUNTABILITY (AU)
      # ============================================
      - uuid: impl-au-2-001
        control-id: au-2
        statements:
          - statement-id: au-2_stmt
            uuid: stmt-au-2-001
            description: |
              The platform logs the following auditable events:

              a. Authentication successes and failures
              b. Authorization decisions (RBAC allow/deny)
              c. Resource creation, modification, and deletion
              d. Security policy violations (admission denials)
              e. Container runtime security events
              f. Secret access events

              Audit policy configured to capture RequestResponse level
              for sensitive resources and Metadata for all others.
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-au-2-001
                description: |
                  API server audit logging with comprehensive policy.
                  Audit logs streamed to centralized logging.
                implementation-status:
                  state: implemented
              - component-uuid: comp-logging-001
                uuid: by-comp-au-2-002
                description: Log aggregation and retention
                implementation-status:
                  state: implemented

      - uuid: impl-au-9-001
        control-id: au-9
        statements:
          - statement-id: au-9_stmt
            uuid: stmt-au-9-001
            description: |
              Audit information protected through:

              a. Logs stored in S3 with Object Lock (WORM)
              b. Separate IAM roles for log write vs. read access
              c. Encryption at rest using KMS customer-managed keys
              d. Access to logs restricted to security team
              e. Log deletion not possible during retention period
            by-components:
              - component-uuid: comp-logging-001
                uuid: by-comp-au-9-001
                description: Immutable storage with Object Lock
                implementation-status:
                  state: implemented

      # ============================================
      # SYSTEM AND COMMUNICATIONS PROTECTION (SC)
      # ============================================
      - uuid: impl-sc-7-001
        control-id: sc-7
        statements:
          - statement-id: sc-7_stmt
            uuid: stmt-sc-7-001
            description: |
              Boundary protection implemented through:

              a. All namespaces have default-deny NetworkPolicies
              b. Ingress controller is single entry point for external traffic
              c. WAF rules protect against OWASP Top 10
              d. No NodePort or LoadBalancer services except ingress
              e. Egress restricted to approved destinations via NetworkPolicy
              f. VPC security groups provide additional network controls
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-sc-7-001
                description: NetworkPolicy default-deny baseline
                implementation-status:
                  state: implemented
              - component-uuid: comp-ingress-001
                uuid: by-comp-sc-7-002
                description: Single ingress point with WAF
                implementation-status:
                  state: implemented

      - uuid: impl-sc-8-001
        control-id: sc-8
        statements:
          - statement-id: sc-8_stmt
            uuid: stmt-sc-8-001
            description: |
              Transmission confidentiality and integrity protected through:

              a. TLS 1.2+ required for all external connections
              b. Service mesh mTLS (STRICT mode) for all internal traffic
              c. Certificate rotation automated via cert-manager
              d. Strong cipher suites only (no weak algorithms)
            by-components:
              - component-uuid: comp-ingress-001
                uuid: by-comp-sc-8-001
                description: TLS termination with modern configuration
                implementation-status:
                  state: implemented
              - component-uuid: comp-mesh-001
                uuid: by-comp-sc-8-002
                description: mTLS STRICT mode for service-to-service
                implementation-status:
                  state: implemented

      - uuid: impl-sc-28-001
        control-id: sc-28
        statements:
          - statement-id: sc-28_stmt
            uuid: stmt-sc-28-001
            description: |
              Protection of information at rest implemented through:

              a. etcd data encrypted using AWS KMS customer-managed key
              b. Kubernetes Secrets encrypted at rest in etcd
              c. PersistentVolumes use encrypted EBS with KMS
              d. S3 buckets encrypted with SSE-KMS
            by-components:
              - component-uuid: comp-k8s-cluster-001
                uuid: by-comp-sc-28-001
                description: etcd and secrets encryption via KMS
                implementation-status:
                  state: implemented

      # ============================================
      # SYSTEM AND INFORMATION INTEGRITY (SI)
      # ============================================
      - uuid: impl-si-2-001
        control-id: si-2
        statements:
          - statement-id: si-2_stmt
            uuid: stmt-si-2-001
            description: |
              Flaw remediation implemented through:

              a. Automated image scanning in CI/CD pipeline
              b. Admission policies block critical vulnerabilities
              c. Weekly scanning of running images
              d. SLA: Critical (24h), High (7d), Medium (30d)
              e. Exception process requires security team approval
            by-components:
              - component-uuid: comp-scanning-001
                uuid: by-comp-si-2-001
                description: Trivy scanning in pipeline and runtime
                implementation-status:
                  state: implemented
              - component-uuid: comp-policy-001
                uuid: by-comp-si-2-002
                description: Admission policies enforce scan requirements
                implementation-status:
                  state: implemented

      - uuid: impl-si-4-001
        control-id: si-4
        statements:
          - statement-id: si-4_stmt
            uuid: stmt-si-4-001
            description: |
              System monitoring implemented through:

              a. Centralized logging of all container and platform logs
              b. SIEM integration for security event correlation
              c. Runtime security monitoring via Falco
              d. Alerting to security team for high-priority events
              e. Dashboard visibility into security posture
            by-components:
              - component-uuid: comp-logging-001
                uuid: by-comp-si-4-001
                description: Log aggregation and SIEM integration
                implementation-status:
                  state: implemented
              - component-uuid: comp-runtime-001
                uuid: by-comp-si-4-002
                description: Runtime threat detection
                implementation-status:
                  state: implemented

  back-matter:
    resources:
      - uuid: [GENERATE-UUID]
        title: Authorization Boundary Diagram
        rlinks:
          - href: "./diagrams/authorization-boundary.png"
            media-type: image/png

      - uuid: [GENERATE-UUID]
        title: Network Architecture Diagram
        rlinks:
          - href: "./diagrams/network-architecture.png"
            media-type: image/png

      - uuid: [GENERATE-UUID]
        title: Data Flow Diagram
        rlinks:
          - href: "./diagrams/data-flow.png"
            media-type: image/png

      - uuid: [GENERATE-UUID]
        title: Platform GitOps Repository
        rlinks:
          - href: "https://[GIT-URL]/platform-config"

      - uuid: [GENERATE-UUID]
        title: Evidence Repository
        rlinks:
          - href: "https://[EVIDENCE-REPO-URL]"
```

---

## Validation

Validate your SSP using OSCAL tools:

```bash
# Install oscal-cli
brew install oscal-cli  # macOS
# or download from https://github.com/metaschema-framework/oscal-cli

# Validate SSP
oscal-cli ssp validate system-security-plan.yaml

# Convert to JSON if needed
oscal-cli ssp convert system-security-plan.yaml -o system-security-plan.json
```

---

## Customization Guide

### Step 1: Replace Placeholders
Search for `[` in the document and replace all placeholder values with your actual system information.

### Step 2: Generate UUIDs
Generate unique UUIDs for all `uuid` fields:
```bash
# Generate UUIDs
uuidgen  # macOS/Linux
# Or use: https://www.uuidgenerator.net/
```

### Step 3: Add Your Components
Add additional components for your specific architecture. Copy the component template structure and modify.

### Step 4: Complete Control Implementations
Add implementation statements for all controls in your baseline. The template includes examples for high-priority controls.

### Step 5: Link Evidence
Ensure each implementation statement references the component that satisfies it and points to evidence artifacts.

---

**[← Back to Templates](/ato-ebook/templates)** | **[Next: Evidence Scripts →](/ato-ebook/templates/evidence-scripts)**

---
title: Evidence Automation Scripts
description: Production-ready scripts for automated compliance evidence collection
published: true
tags: automation, evidence, kubernetes, compliance, scripts
editor: markdown
---

# Evidence Automation Scripts

Production-ready scripts and Kubernetes manifests for automating evidence collection. Deploy these to start collecting compliance evidence automatically.

---

## Quick Start

1. Clone the scripts to your platform repository
2. Customize the S3 bucket and namespace values
3. Apply the Kubernetes manifests
4. Verify evidence collection in your storage

---

## Directory Structure

```
evidence-automation/
├── cronjobs/
│   ├── rbac-collector.yaml
│   ├── network-policy-collector.yaml
│   ├── admission-policy-collector.yaml
│   └── cis-benchmark.yaml
├── scripts/
│   ├── collect-rbac.sh
│   ├── collect-network-policies.sh
│   ├── collect-admission-policies.sh
│   └── upload-evidence.sh
├── terraform/
│   └── evidence-storage/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── alerting/
    └── evidence-freshness-alerts.yaml
```

---

## Evidence Collection Scripts

### RBAC Evidence Collector

```bash
#!/bin/bash
# collect-rbac.sh
# Collects all RBAC configuration as evidence for AC controls

set -euo pipefail

# Configuration
EVIDENCE_DIR="${EVIDENCE_DIR:-/tmp/evidence}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_PATH=$(date -u +"%Y/%m/%d")
CLUSTER_NAME="${CLUSTER_NAME:-unknown}"

# Create evidence directory
mkdir -p "${EVIDENCE_DIR}/rbac/${DATE_PATH}"

echo "Collecting RBAC evidence at ${TIMESTAMP}"

# Collect ServiceAccounts
echo "Collecting ServiceAccounts..."
kubectl get serviceaccounts -A -o yaml > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/serviceaccounts.yaml"

# Collect Roles
echo "Collecting Roles..."
kubectl get roles -A -o yaml > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/roles.yaml"

# Collect RoleBindings
echo "Collecting RoleBindings..."
kubectl get rolebindings -A -o yaml > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/rolebindings.yaml"

# Collect ClusterRoles
echo "Collecting ClusterRoles..."
kubectl get clusterroles -o yaml > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/clusterroles.yaml"

# Collect ClusterRoleBindings
echo "Collecting ClusterRoleBindings..."
kubectl get clusterrolebindings -o yaml > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/clusterrolebindings.yaml"

# Generate summary report
echo "Generating RBAC summary..."
cat > "${EVIDENCE_DIR}/rbac/${DATE_PATH}/summary.json" <<EOF
{
  "collection_timestamp": "${TIMESTAMP}",
  "cluster": "${CLUSTER_NAME}",
  "counts": {
    "serviceaccounts": $(kubectl get serviceaccounts -A --no-headers | wc -l),
    "roles": $(kubectl get roles -A --no-headers | wc -l),
    "rolebindings": $(kubectl get rolebindings -A --no-headers | wc -l),
    "clusterroles": $(kubectl get clusterroles --no-headers | wc -l),
    "clusterrolebindings": $(kubectl get clusterrolebindings --no-headers | wc -l)
  },
  "privileged_bindings": [
    $(kubectl get clusterrolebindings -o json | jq -c '[.items[] | select(.roleRef.name == "cluster-admin") | {name: .metadata.name, subjects: .subjects}]')
  ]
}
EOF

# Generate SHA256 checksums
echo "Generating checksums..."
cd "${EVIDENCE_DIR}/rbac/${DATE_PATH}"
sha256sum *.yaml > checksums.sha256

echo "RBAC evidence collection complete"
echo "Files saved to: ${EVIDENCE_DIR}/rbac/${DATE_PATH}"
```

### Network Policy Collector

```bash
#!/bin/bash
# collect-network-policies.sh
# Collects NetworkPolicy configurations for SC-7 evidence

set -euo pipefail

EVIDENCE_DIR="${EVIDENCE_DIR:-/tmp/evidence}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_PATH=$(date -u +"%Y/%m/%d")
CLUSTER_NAME="${CLUSTER_NAME:-unknown}"

mkdir -p "${EVIDENCE_DIR}/network/${DATE_PATH}"

echo "Collecting NetworkPolicy evidence at ${TIMESTAMP}"

# Collect NetworkPolicies
echo "Collecting NetworkPolicies..."
kubectl get networkpolicies -A -o yaml > "${EVIDENCE_DIR}/network/${DATE_PATH}/networkpolicies.yaml"

# Collect Services (for boundary documentation)
echo "Collecting Services..."
kubectl get services -A -o yaml > "${EVIDENCE_DIR}/network/${DATE_PATH}/services.yaml"

# Collect Ingress resources
echo "Collecting Ingress..."
kubectl get ingress -A -o yaml > "${EVIDENCE_DIR}/network/${DATE_PATH}/ingress.yaml"

# Check for namespaces without NetworkPolicies (compliance gap)
echo "Checking for namespaces without NetworkPolicies..."
cat > "${EVIDENCE_DIR}/network/${DATE_PATH}/coverage-report.json" <<EOF
{
  "collection_timestamp": "${TIMESTAMP}",
  "cluster": "${CLUSTER_NAME}",
  "total_namespaces": $(kubectl get namespaces --no-headers | wc -l),
  "namespaces_with_policies": $(kubectl get networkpolicies -A --no-headers | awk '{print $1}' | sort -u | wc -l),
  "namespaces_without_policies": [
    $(comm -23 <(kubectl get namespaces -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | sort) <(kubectl get networkpolicies -A --no-headers | awk '{print $1}' | sort -u) | jq -R . | jq -s .)
  ],
  "default_deny_count": $(kubectl get networkpolicies -A -o json | jq '[.items[] | select(.spec.podSelector == {} and .spec.policyTypes == ["Ingress", "Egress"] and .spec.ingress == null and .spec.egress == null)] | length'),
  "external_services": [
    $(kubectl get services -A -o json | jq -c '[.items[] | select(.spec.type == "LoadBalancer" or .spec.type == "NodePort") | {namespace: .metadata.namespace, name: .metadata.name, type: .spec.type}]')
  ]
}
EOF

# Generate checksums
cd "${EVIDENCE_DIR}/network/${DATE_PATH}"
sha256sum *.yaml > checksums.sha256

echo "NetworkPolicy evidence collection complete"
```

### Admission Policy Collector

```bash
#!/bin/bash
# collect-admission-policies.sh
# Collects Gatekeeper/Kyverno policies for CM and SI controls

set -euo pipefail

EVIDENCE_DIR="${EVIDENCE_DIR:-/tmp/evidence}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_PATH=$(date -u +"%Y/%m/%d")
CLUSTER_NAME="${CLUSTER_NAME:-unknown}"

mkdir -p "${EVIDENCE_DIR}/admission/${DATE_PATH}"

echo "Collecting admission policy evidence at ${TIMESTAMP}"

# Detect policy engine
if kubectl api-resources | grep -q "constraints.gatekeeper.sh"; then
  POLICY_ENGINE="gatekeeper"
elif kubectl api-resources | grep -q "policies.kyverno.io"; then
  POLICY_ENGINE="kyverno"
else
  echo "No supported policy engine detected"
  exit 1
fi

echo "Detected policy engine: ${POLICY_ENGINE}"

if [ "$POLICY_ENGINE" = "gatekeeper" ]; then
  # Collect Gatekeeper resources
  echo "Collecting ConstraintTemplates..."
  kubectl get constrainttemplates -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/constrainttemplates.yaml"

  echo "Collecting Constraints..."
  kubectl get constraints -A -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/constraints.yaml"

  echo "Collecting Config..."
  kubectl get config.config.gatekeeper.sh -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/config.yaml" 2>/dev/null || echo "No config found"

  # Generate audit report
  echo "Generating audit report..."
  cat > "${EVIDENCE_DIR}/admission/${DATE_PATH}/audit-report.json" <<EOF
{
  "collection_timestamp": "${TIMESTAMP}",
  "cluster": "${CLUSTER_NAME}",
  "policy_engine": "gatekeeper",
  "constraint_templates": $(kubectl get constrainttemplates --no-headers | wc -l),
  "total_constraints": $(kubectl get constraints -A --no-headers 2>/dev/null | wc -l || echo 0),
  "violations": $(kubectl get constraints -A -o json | jq '[.items[].status.totalViolations // 0] | add'),
  "constraints_by_enforcement": {
    "deny": $(kubectl get constraints -A -o json | jq '[.items[] | select(.spec.enforcementAction == "deny" or .spec.enforcementAction == null)] | length'),
    "dryrun": $(kubectl get constraints -A -o json | jq '[.items[] | select(.spec.enforcementAction == "dryrun")] | length'),
    "warn": $(kubectl get constraints -A -o json | jq '[.items[] | select(.spec.enforcementAction == "warn")] | length')
  }
}
EOF

elif [ "$POLICY_ENGINE" = "kyverno" ]; then
  # Collect Kyverno resources
  echo "Collecting ClusterPolicies..."
  kubectl get clusterpolicies -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/clusterpolicies.yaml"

  echo "Collecting Policies..."
  kubectl get policies -A -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/policies.yaml"

  echo "Collecting PolicyReports..."
  kubectl get policyreports -A -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/policyreports.yaml"

  echo "Collecting ClusterPolicyReports..."
  kubectl get clusterpolicyreports -o yaml > "${EVIDENCE_DIR}/admission/${DATE_PATH}/clusterpolicyreports.yaml"

  # Generate audit report
  cat > "${EVIDENCE_DIR}/admission/${DATE_PATH}/audit-report.json" <<EOF
{
  "collection_timestamp": "${TIMESTAMP}",
  "cluster": "${CLUSTER_NAME}",
  "policy_engine": "kyverno",
  "cluster_policies": $(kubectl get clusterpolicies --no-headers | wc -l),
  "namespace_policies": $(kubectl get policies -A --no-headers | wc -l),
  "policy_report_summary": $(kubectl get policyreports -A -o json | jq '{pass: [.items[].summary.pass // 0] | add, fail: [.items[].summary.fail // 0] | add, warn: [.items[].summary.warn // 0] | add}')
}
EOF
fi

# Generate checksums
cd "${EVIDENCE_DIR}/admission/${DATE_PATH}"
sha256sum *.yaml > checksums.sha256 2>/dev/null || true

echo "Admission policy evidence collection complete"
```

### S3 Upload Script

```bash
#!/bin/bash
# upload-evidence.sh
# Uploads collected evidence to S3 with integrity verification

set -euo pipefail

EVIDENCE_DIR="${EVIDENCE_DIR:-/tmp/evidence}"
S3_BUCKET="${S3_BUCKET:-my-evidence-bucket}"
S3_PREFIX="${S3_PREFIX:-compliance-evidence}"
CLUSTER_NAME="${CLUSTER_NAME:-unknown}"

echo "Uploading evidence to s3://${S3_BUCKET}/${S3_PREFIX}/${CLUSTER_NAME}/"

# Upload with server-side encryption and metadata
aws s3 sync "${EVIDENCE_DIR}/" "s3://${S3_BUCKET}/${S3_PREFIX}/${CLUSTER_NAME}/" \
  --sse aws:kms \
  --sse-kms-key-id "${KMS_KEY_ID}" \
  --metadata "cluster=${CLUSTER_NAME},collected=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --only-show-errors

echo "Evidence upload complete"

# Verify upload integrity
echo "Verifying upload integrity..."
for checksum_file in $(find "${EVIDENCE_DIR}" -name "checksums.sha256"); do
  dir=$(dirname "$checksum_file")
  relative_path=${dir#${EVIDENCE_DIR}/}

  echo "Verifying ${relative_path}..."

  # Download and compare checksums
  aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${CLUSTER_NAME}/${relative_path}/checksums.sha256" /tmp/remote-checksums.sha256

  if diff -q "$checksum_file" /tmp/remote-checksums.sha256 > /dev/null; then
    echo "✓ ${relative_path} verified"
  else
    echo "✗ ${relative_path} FAILED verification"
    exit 1
  fi
done

echo "All evidence verified successfully"
```

---

## Kubernetes CronJob Manifests

### RBAC Collector CronJob

```yaml
# cronjobs/rbac-collector.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: evidence-rbac-collector
  namespace: compliance-automation
  labels:
    app: evidence-collector
    evidence-type: rbac
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM UTC
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 7
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      backoffLimit: 3
      template:
        metadata:
          labels:
            app: evidence-collector
            evidence-type: rbac
        spec:
          serviceAccountName: evidence-collector
          restartPolicy: OnFailure
          containers:
            - name: collector
              image: bitnami/kubectl:1.28
              command:
                - /bin/bash
                - -c
                - |
                  /scripts/collect-rbac.sh && /scripts/upload-evidence.sh
              env:
                - name: CLUSTER_NAME
                  valueFrom:
                    configMapKeyRef:
                      name: evidence-config
                      key: cluster-name
                - name: S3_BUCKET
                  valueFrom:
                    configMapKeyRef:
                      name: evidence-config
                      key: s3-bucket
                - name: KMS_KEY_ID
                  valueFrom:
                    secretKeyRef:
                      name: evidence-secrets
                      key: kms-key-id
                - name: AWS_REGION
                  value: "us-gov-west-1"
              volumeMounts:
                - name: scripts
                  mountPath: /scripts
                - name: evidence
                  mountPath: /tmp/evidence
              resources:
                requests:
                  cpu: 100m
                  memory: 256Mi
                limits:
                  cpu: 500m
                  memory: 512Mi
          volumes:
            - name: scripts
              configMap:
                name: evidence-scripts
                defaultMode: 0755
            - name: evidence
              emptyDir: {}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: evidence-collector
  namespace: compliance-automation
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: evidence-collector
rules:
  - apiGroups: [""]
    resources: ["serviceaccounts", "namespaces", "services"]
    verbs: ["get", "list"]
  - apiGroups: ["rbac.authorization.k8s.io"]
    resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]
    verbs: ["get", "list"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["networkpolicies", "ingresses"]
    verbs: ["get", "list"]
  - apiGroups: ["constraints.gatekeeper.sh"]
    resources: ["*"]
    verbs: ["get", "list"]
  - apiGroups: ["templates.gatekeeper.sh"]
    resources: ["constrainttemplates"]
    verbs: ["get", "list"]
  - apiGroups: ["config.gatekeeper.sh"]
    resources: ["configs"]
    verbs: ["get", "list"]
  - apiGroups: ["kyverno.io"]
    resources: ["clusterpolicies", "policies", "policyreports", "clusterpolicyreports"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: evidence-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: evidence-collector
subjects:
  - kind: ServiceAccount
    name: evidence-collector
    namespace: compliance-automation
```

### Configuration and Scripts ConfigMap

```yaml
# cronjobs/evidence-config.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: compliance-automation
  labels:
    app.kubernetes.io/name: compliance-automation
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: evidence-config
  namespace: compliance-automation
data:
  cluster-name: "production-eks-cluster"
  s3-bucket: "my-org-compliance-evidence"
  s3-prefix: "kubernetes"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: evidence-scripts
  namespace: compliance-automation
data:
  collect-rbac.sh: |
    #!/bin/bash
    # [Insert collect-rbac.sh content here]

  collect-network-policies.sh: |
    #!/bin/bash
    # [Insert collect-network-policies.sh content here]

  collect-admission-policies.sh: |
    #!/bin/bash
    # [Insert collect-admission-policies.sh content here]

  upload-evidence.sh: |
    #!/bin/bash
    # [Insert upload-evidence.sh content here]
```

---

## Terraform Module: Evidence Storage

```hcl
# terraform/evidence-storage/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# KMS key for evidence encryption
resource "aws_kms_key" "evidence" {
  description             = "KMS key for compliance evidence encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = var.tags
}

resource "aws_kms_alias" "evidence" {
  name          = "alias/${var.project_name}-evidence"
  target_key_id = aws_kms_key.evidence.key_id
}

# S3 bucket for evidence storage
resource "aws_s3_bucket" "evidence" {
  bucket = "${var.project_name}-compliance-evidence"

  tags = var.tags
}

# Enable versioning
resource "aws_s3_bucket_versioning" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.evidence.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# Object Lock configuration (WORM)
resource "aws_s3_bucket_object_lock_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  rule {
    default_retention {
      mode = "GOVERNANCE"  # Use COMPLIANCE for stricter retention
      days = var.retention_days
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rules
resource "aws_s3_bucket_lifecycle_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }
}

# Bucket policy
resource "aws_s3_bucket_policy" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnforceTLS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.evidence.arn,
          "${aws_s3_bucket.evidence.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
      {
        Sid       = "EnforceKMSEncryption"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.evidence.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      }
    ]
  })
}

# IAM role for evidence collector
resource "aws_iam_role" "evidence_collector" {
  name = "${var.project_name}-evidence-collector"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${var.oidc_provider}:sub" = "system:serviceaccount:compliance-automation:evidence-collector"
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "evidence_collector" {
  name = "evidence-access"
  role = aws_iam_role.evidence_collector.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.evidence.arn,
          "${aws_s3_bucket.evidence.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.evidence.arn
      }
    ]
  })
}
```

```hcl
# terraform/evidence-storage/variables.tf

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "retention_days" {
  description = "Evidence retention period in days"
  type        = number
  default     = 2555  # 7 years
}

variable "oidc_provider_arn" {
  description = "ARN of the OIDC provider for IRSA"
  type        = string
}

variable "oidc_provider" {
  description = "OIDC provider URL (without https://)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
```

```hcl
# terraform/evidence-storage/outputs.tf

output "bucket_name" {
  description = "Evidence S3 bucket name"
  value       = aws_s3_bucket.evidence.id
}

output "bucket_arn" {
  description = "Evidence S3 bucket ARN"
  value       = aws_s3_bucket.evidence.arn
}

output "kms_key_id" {
  description = "KMS key ID for evidence encryption"
  value       = aws_kms_key.evidence.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for evidence encryption"
  value       = aws_kms_key.evidence.arn
}

output "collector_role_arn" {
  description = "IAM role ARN for evidence collector"
  value       = aws_iam_role.evidence_collector.arn
}
```

---

## Alerting: Evidence Freshness

```yaml
# alerting/evidence-freshness-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: evidence-freshness
  namespace: monitoring
spec:
  groups:
    - name: evidence-collection
      rules:
        - alert: EvidenceCollectionFailed
          expr: |
            kube_job_status_failed{namespace="compliance-automation", job_name=~"evidence-.*"} > 0
          for: 5m
          labels:
            severity: warning
            compliance: true
          annotations:
            summary: "Evidence collection job failed"
            description: "Job {{ $labels.job_name }} has failed. Evidence may be stale."

        - alert: EvidenceCollectionMissing
          expr: |
            time() - kube_job_status_completion_time{namespace="compliance-automation", job_name=~"evidence-.*"} > 172800
          for: 1h
          labels:
            severity: critical
            compliance: true
          annotations:
            summary: "Evidence collection overdue"
            description: "Job {{ $labels.job_name }} has not completed in over 48 hours."

        - alert: EvidenceStorageError
          expr: |
            increase(evidence_upload_errors_total[1h]) > 0
          for: 5m
          labels:
            severity: critical
            compliance: true
          annotations:
            summary: "Evidence upload failing"
            description: "Evidence uploads to S3 are failing. Check collector logs."
```

---

## Deployment Instructions

### 1. Create the namespace and configuration

```bash
kubectl apply -f cronjobs/evidence-config.yaml
```

### 2. Create the secrets

```bash
kubectl create secret generic evidence-secrets \
  --namespace compliance-automation \
  --from-literal=kms-key-id=alias/my-evidence-key
```

### 3. Deploy the CronJobs

```bash
kubectl apply -f cronjobs/rbac-collector.yaml
```

### 4. Verify deployment

```bash
# Check CronJob status
kubectl get cronjobs -n compliance-automation

# Run a manual job to test
kubectl create job --from=cronjob/evidence-rbac-collector test-rbac -n compliance-automation

# Check job logs
kubectl logs -n compliance-automation job/test-rbac
```

---

**[← Back to Templates](/ato-ebook/templates)** | **[Next: Sprint Planner →](/ato-ebook/templates/sprint-planner)**

---
cards-deck: AWS Exams::Cheat Sheets::Systems Manager Automation
---
# What is AWS Systems Manager  #card

AWS Systems Manager centralizes operational data and automates tasks across AWS resources.

## SM Features #card

- Create logical resource groups.
- View API activity, resource changes, notifications, alerts, inventory, and compliance.
- Automate IT operations.
- Provides interactive shell & CLI for Windows/Linux EC2 instances without SSH/bastion hosts.
- Ensures software is updated and compliant.
- Schedules maintenance tasks.
- Uses SSM Agent for processing requests (pre-installed on newer AMIs, manual install for older versions).

## Capabilities

### SM Automation #card

- Automates repetitive IT operations.
- Uses Automation Documents (run as full execution or step-by-step).
- Supports scheduling document execution.
- Limits simultaneous executions (excess ones are queued).

### SM Resource Groups #card

- Logical collection of AWS resources in the same region.
- Used for monitoring and executing management tasks.

### SM Inventory Manager #card

- Collects software inventory from managed instances.
- Customizable metadata collection and scheduling.

### SM Configuration Compliance #card

- Scans instances for patch compliance and configuration consistency.
- Tracks compliance via AWS Config.

### SM Run Command #card

- Remotely and securely configure instances.
- Works with both EC2 and on-premises servers.

### SM Session Manager #card

- Secure shell access to instances without SSH.
- Supports tunneling for SSH/SCP traffic.

### SM Patch Manager #card

- Automates patching of managed instances.
- Uses Patch Baselines for auto-approvals.
- Supports Microsoft application patching.

### SM Maintenance Window #card

- Schedules tasks such as patching without downtime.
- Supports four task types:
    1. Run Command
    2. Automation Workflows
    3. Lambda Functions
    4. Step Functions

## Key Components

### SM SSM Documents (SSM) #card

- JSON/YAML definitions for tasks.
- Versions and tagging supported.

### SM State Manager #card

- Maintains instances in a defined state.
- Uses associations to apply configurations.

### SM Parameter Store #card

- Secure hierarchical storage for configurations and secrets.
- Supports plaintext and SecureString.

### SM OpsCenter #card

- Centralized view for operational issues.
- Aggregates AWS Config, CloudTrail, and CloudWatch data.

### SM Change Manager #card

- Framework for managing application configuration changes.
- Supports multi-account and multi-region management.

### SM Incident Manager #card

- Incident response automation.
- Phases:
    1. Alerting & Engagement
    2. Triage
    3. Investigation & Mitigation
    4. Post-Incident Analysis

### SM Explorer #card

- Customizable operations dashboard.
- Supports multi-account and multi-region views.

### SM AppConfig #card

- Manages and deploys application configurations.
- Supports validation and monitoring.

### SM Application Manager #card

- Investigates and remediates AWS resource issues.

### SM Fleet Manager #card

- Monitors and manages EC2/on-premises instances.
- Displays health and performance metrics.

### SM Compliance #card

- Scans managed nodes for patching/config inconsistencies.
- Generates reports for compliance auditing.

## Monitoring & Security

### AWS Systems Manager Monitoring #card

- SSM Agent logs activities/errors.
- Logs sent to CloudWatch for real-time monitoring.
- Supports EventBridge for automation.
- Uses Amazon SNS for notifications.

### AWS Systems Manager Security #card

- Uses IAM for access control.
- Supports encryption via AWS KMS for logs and data.
- Supports fine-grained access policies for Data Catalog.

## SM Pricing #card

- Charged based on:
    - Automation steps
    - OpsItems and runbooks
    - Configuration requests
    - Advanced parameters stored
    - Number of activated instances

## References

- [AWS Systems Manager Docs](https://docs.aws.amazon.com/systems-manager/latest/userguide)
- [AWS Systems Manager Pricing](https://aws.amazon.com/systems-manager/pricing/)
---
cards-deck: AWS Exams::Cheat Sheets::Detective
---
# Amazon Detective Cheat Sheet

Amazon Detective **automates security investigations** by collecting log data from AWS resources and applying **machine learning, statistical analysis, and graph theory**.

---

## Detective Key Features #card

- **Integrates with AWS Security Services** – Works with **GuardDuty, Macie, Security Hub**, and partner security tools
- **Analyzes Trillions of Events** – Uses **VPC Flow Logs, CloudTrail, and GuardDuty** findings
- **Builds Behavior Graphs** – Maps resource, user, and entity relationships over time
- **Interactive Visualizations** – Provides linked security data for efficient investigations
- **Prebuilt Data Aggregations** – Summarizes security issues for quick analysis

---

## Detective Concepts

### Detective Investigation #card

- The process of **triaging security issues**, **determining scope**, and **identifying root causes**

### Detective Behavior Graph #card

- A **linked dataset** of findings, entities, and relationships generated from logs
- Each behavior graph is linked to **one or more AWS accounts**

### Detective Management Account #card

- **Owns and manages the behavior graph**
- Invites **member accounts** to contribute data
- **Can disable and delete** behavior graphs

### Detective Member Account #card

- **Contributes data** to a behavior graph
- Can **accept or leave invitations** from a management account

### Detective Finding #card

- **Security issues** detected by Amazon GuardDuty

### Detective Entity #card

- An **extracted item** from log data (e.g., IP addresses, EC2 instances, AWS users)

### Detective Relationship #card

- **Connections between entities** (e.g., IP address connecting to an EC2 instance)

### Detective Profile #card

- **Visualization of findings or entities**
- Helps analysts **assess genuine threats vs false positives**

### Detective Scope Time #card

- Defines the **time window** for investigation
- **Finding profiles** – Defaults to the **first and last** observed suspicious activity
- **Entity profiles** – Defaults to the **previous 24 hours**

---

## Detective Deployment #card

- **Enabled per AWS region**
- **Multi-account service** – Aggregates data under a **single management account**
- Supports **cross-account roles** for different AWS security services
- **Automatically ingests 2 weeks of GuardDuty data** upon activation

---

## Detective IAM Role Sessions #card

- Processes **VPC flow logs & CloudTrail** management events
- **Collates IAM role activities** into session data for visualization

---

## Detective vs GuardDuty vs Security Hub #card

| Feature | Amazon GuardDuty | AWS Security Hub | Amazon Detective |
|---------|------------------|------------------|------------------|
| **Function** | Threat detection | Security alert aggregation | Security investigation |
| **Data Sources** | VPC Flow Logs, DNS, CloudTrail | GuardDuty, Inspector, Macie, Partner tools | GuardDuty, VPC Flow Logs, CloudTrail |
| **Outcome** | Identifies potential threats | Centralized security view | Simplifies root cause analysis |

---

## Detective Limits #card

- Stores up to **1 year** of aggregated findings for analysis

---

## Detective Use Cases #card

- **Triage security findings**
- **Incident investigation**
- **Hunting for hidden security threats**

---

## References

- [AWS Detective Docs](https://docs.aws.amazon.com/detective/latest/userguide/)
- [AWS Detective Overview](https://aws.amazon.com/detective/)

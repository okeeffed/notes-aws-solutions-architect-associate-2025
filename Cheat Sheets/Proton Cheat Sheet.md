---
cards-deck: AWS Exams::Cheat Sheets::Proton
---
# AWS Proton #card

AWS Proton is a **managed delivery service** for deploying **container and serverless applications**.

---

## Proton Concepts

### Proton Templates #card

- **Infrastructure as Code (IaC)** to manage and provision resources
- **Environment Template** – Shared infrastructure used by multiple applications
  - **Standard Environment Template** – AWS Proton provisions infrastructure
  - **Customer-managed Environment Template** – You provision shared resources
- **Service Template** – Defines infrastructure for an application or microservice
- Supports **AWS CloudFormation** and **Terraform**
- **Template Bundles** – IaC file with:
  - **Manifest YAML** file
  - **Schema YAML** for input parameter definitions

### Proton Template Versions #card

- **Minor Version** – Supports **backward compatibility**
- **Major Version** – Does **not** support backward compatibility
- Compatibility is determined based on **schema**

### Proton Template Sync #card

- **Syncs templates from Git repositories**
- Detects template changes and **creates new versions**

---

## Proton Environments #card

- Represents **shared resources & policies** for AWS Proton services
- Contains shared **VPCs, Clusters, Load Balancers, API Gateways**

### Proton Environment Provisioning Options #card

- **AWS-managed provisioning**
- **AWS-managed to another account**
- **Self-managed provisioning** (via environment account connections)

---

## Proton Services #card

- **Service** – Instantiation of a **service template**, including:
  - **Service instances** (AWS infrastructure resources for apps)
  - **Service pipelines** (optional for automation)
- **Service Instance** – Collection of AWS resources in an environment
- **Requires at least one service instance**

---

## Proton Components #card

- Defines **additional AWS infrastructure** beyond environment & service instance
- **Directly defined components** – Provision additional resources

### Proton Component States #card

- **Attached** – Extends infrastructure of a service instance
  - Associated with a **service instance & environment**
- **Detached** – Maintains component infra **independent of service instance**
  - Associated with an **environment**

---

## Proton Repositories #card

- **Repository Link** – Defines properties for AWS Proton to connect to a repository

### Proton Repository Types #card

- **Code Repository** – Stores **application code** for deployments
- **Template Repository** – Stores **template bundles** for sync
- **Infrastructure Repository** – Hosts **rendered infrastructure templates**
  - Used for **self-managed provisioning**
- **Pipeline Repository** – Stores pipelines for self-managed provisioning
- **Amazon S3** can also store templates accessible via **AWS Proton API**

---

## Proton Monitoring #card

- Uses **Amazon EventBridge** to track AWS Proton workflow state changes
- **Event Rule** captures status changes for Proton services
- **Events contain:**
  - **Event Pattern** – Includes source, type, and targets
  - **Targets** – Trigger notifications, actions, or automated workflows

---

## Proton Pricing #card

- **Charges apply to AWS resources** created for storage and running applications

---

## References

- [AWS Proton Docs](https://aws.amazon.com/proton/)
- [AWS Proton User Guide](https://docs.aws.amazon.com/proton/latest/userguide/Welcome.html)

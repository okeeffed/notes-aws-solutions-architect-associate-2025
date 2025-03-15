---
cards-deck: AWS Exams::Cheat Sheets::Fargate
---
# What is AWS Fargate? #card

AWS Fargate is a serverless compute engine for containers that allows you to run containers without managing EC2 instances.

---

## How It Works #card

- **AWS Fargate** is a managed service that removes the need to provision and manage EC2 instances.
- It integrates with **Amazon ECS** to run containers at scale.
- It provides **automatic scaling**, **built-in security**, and **isolation between tasks**.

---

## Use Case #card

- **Run containers without EC2 management**.
- **Best for microservices and batch jobs**.
- **Works with ECS or EKS** for orchestrating containers.

---

## Configurations

### Task Definition Requirements #card

- **CPU and memory** must be specified at the **task level**.
- **Supports `ulimits`** for defining resource limits per container.
- **Supported Log Drivers**:
  - `awslogs`, `splunk`, `firelens`, `fluentd`

### Storage Allocation #card

- **Each Fargate task receives:**
  - **10 GB** of **Docker layer storage**.
  - **4 GB** for **volume mounts**.
  - **Storage is ephemeral** (deleted when the task stops).

### Platform Version Updates #card

- **To update the platform version:**
  - Update the service and **force a new deployment**.
  - New tasks **without updates** get the **current platform version**.

### ECS Exec #card

- **ECS Exec** allows you to **execute commands inside a running container**.
- Works on both **EC2** and **Fargate** tasks.

---

## AWS Fargate Network

### Networking Mode #card

- **Fargate requires** `awsvpc` **network mode**.
- **Each task gets its own** **Elastic Network Interface (ENI)**.
- Provides **enhanced network isolation**.

---

## AWS Fargate Compliance #card

- **Certifications & Compliance Standards:**
  - **PCI DSS Level 1**
  - **ISO 9001, ISO 27001, ISO 27017, ISO 27018**
  - **SOC 1, SOC 2, SOC 3**
  - **HIPAA Compliance**

---

## AWS Fargate Pricing #card

- **You pay only for the vCPU and memory used**.
- **No additional fees for provisioning**.

---

## References

- [AWS Fargate Overview](https://aws.amazon.com/fargate/)
- [AWS Fargate FAQs](https://aws.amazon.com/fargate/faqs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [AWS Blog on Fargate](https://aws.amazon.com/blogs/aws/aws-fargate/)

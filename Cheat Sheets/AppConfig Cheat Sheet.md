---
cards-deck: AWS Exams::Cheat Sheets::AppConfig
---
# AppConfig Cheat Sheet #card

AWS AppConfig allows developers to **adjust application behaviour** in production environments **without deploying code**. It enhances **release frequency, application resilience, and rapid issue response**.

---

## AppConfig Key Features #card

- **Feature Flags** – Gradually release new capabilities and measure impact before full deployment
- **Dynamic Configurations** – Update block lists, allow lists, throttling limits, logging verbosity, and more in production
- **Validators** – Ensure configuration data is **syntactically and semantically correct** before deployment
- **Deployment Strategies** – Roll out changes **gradually** over minutes or hours
- **Monitoring & Automatic Rollback** – Integrates with **Amazon CloudWatch** to monitor changes and rollback on issues

---

## AppConfig Benefits #card

- **Reduces unexpected downtime** – Enforces validation rules to prevent faulty configurations
- **Quickly deploy changes across targets** – Deploys configurations from a centralized location
- **Updates applications without interruptions** – Applies changes live, avoiding complex rebuilds
- **Controls deployment risk** – Uses deployment strategies to **gradually introduce changes** and revert on issues

---

## AppConfig Validation #card

- **Syntactic Validation** – Uses **JSON Schema** to enforce structure compliance
- **Semantic Validation** – Calls an **AWS Lambda function** to validate configuration logic

---

## AppConfig Supported Targets #card

- **AWS EC2 Instances**
- **AWS Lambda Functions**
- **Containers**
- **Mobile Applications**
- **IoT Devices**

---

## AppConfig Configuration Stores #card

- **AppConfig Hosted Configuration Store**
- **AWS Systems Manager Parameter Store**
- **AWS Systems Manager (SSM) Documents**
- **Amazon S3**

---

## AppConfig Pricing #card

- Charged based on:
  - **Configuration items logged**
  - **Active AWS Config rule assessments**
  - **Conformance pack evaluations**
- **AWS Pricing Calculator** available for cost estimation

---

## References

- [AWS AppConfig Docs](https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html)

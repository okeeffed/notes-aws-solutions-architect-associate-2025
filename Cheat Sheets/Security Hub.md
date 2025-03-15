---
cards-deck: AWS Exams::Cheat Sheets::Security Hub
---
# What is AWS Security Hub #card

AWS Security Hub provides a **comprehensive view of security posture** across AWS accounts, integrating findings from **multiple AWS services and third-party tools**.

---

## Security Hub Features #card

- **Aggregates, organizes, and prioritizes** security alerts (findings)
- **Integrates with AWS services** like GuardDuty, Inspector, Macie, IAM Access Analyzer, Firewall Manager, and Audit Manager
- **Works with AWS Organizations** for multi-account security management
- **Automated compliance checks** based on security standards (e.g., CIS AWS Foundations Benchmark)
- **Findings stored for at least 90 days**
- **Integrates with Amazon CloudWatch Events** for automation and notifications

---

## Security Hub Concepts

### SH Finding Format #card

- **Standardized format** for security findings from AWS services and partners

### SH Control #card

- **Security safeguard** for protecting data **confidentiality, integrity, and availability**
- **Security standards consist of multiple controls**

### SH Custom Action #card

- **Sends selected findings** to **CloudWatch Events** for automated responses

### SH Finding #card

- **Security or compliance issue detection record**

### SH Insight #card

- **Collection of related findings** requiring attention
- **Uses aggregation statements and optional filters**

### SH Compliance Standards #card

- **Sets of controls** based on industry regulations or best practices
- **Examples:** CIS AWS Foundations Benchmark, PCI DSS, NIST
- **Disable specific compliance controls** if irrelevant to workloads

### SH Compliance Checks #card

- **Security Hub evaluates controls** using AWS Config
- **Each check evaluates a rule against a resource**

---

## Security Hub How It Works #card

1. **Findings are collected in the same AWS Region where Security Hub is enabled**
2. **Findings are standardized and aggregated**
3. **Automated security checks run continuously**
4. **Insights and dashboards help prioritize threats**
5. **Findings can be forwarded to CloudWatch Events for automation**

---

## Security Hub Pricing #card

- **Pricing based on:**
  - **Number of compliance checks**
  - **Number of security findings ingested**
- **Charged per account per region monthly**

---

## References

- [AWS Security Hub Overview](https://aws.amazon.com/security-hub/)
- [AWS Security Hub Documentation](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html)
- [AWS Security Hub FAQs](https://aws.amazon.com/security-hub/faqs/)

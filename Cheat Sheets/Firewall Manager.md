---
cards-deck: AWS Exams::Cheat Sheets::Firewall Manager
---
# What is AWS Firewall Manager #card

AWS Firewall Manager **simplifies AWS WAF administration** across multiple accounts and resources.

---

## Firewall Manager Features #card

- **Centralized WAF rule management** across AWS accounts
- **Integrates with AWS Organizations** to apply protections across accounts
- **Supports Managed Rules** for AWS WAF from AWS Marketplace
- **Allows hierarchical policy enforcement** (application-specific rules with central control)
- **Auto-applies protection policies** to new accounts in an organization
- **Configures logging centrally** for WAF Web ACLs
- **Manages security groups** for:
  - **Application Load Balancers (ALB)**
  - **Classic Load Balancers (CLB)**
  - **EC2 instances & ENIs**
- **Pre-configured rules for auditing VPC security groups**

---

## Firewall Manager Concepts

### FM Rule Group #card

- **Set of rules** added to **Web ACL or Firewall Manager policy**
- **Types:**
  - **Custom rule groups**
  - **AWS Marketplace managed rule groups**

### FM Policy #card

- **Contains rule groups** applied to resources
- **Auto-applies to new accounts in AWS Organizations**
- **Region-specific protection policies**

### FM Logging #card

- **Centrally configure logging** for **AWS WAF Web ACLs**

### FM Security Group Management #card

- **Manages security groups** across multiple accounts for:
  - **Load Balancers (ALB & CLB)**
  - **EC2 instances & ENIs**

---

## Firewall Manager Pricing #card

- **Shield Advanced customers** – Firewall Manager **included at no extra cost**
- **WAF & Shield Standard customers:**
  - **Firewall Manager Protection Policy** – Monthly per Region
  - **WAF Web ACLs & Rules** – Charged per standard WAF pricing
  - **AWS Config Rules** – Charged per AWS Config pricing

---

## References

- [AWS Firewall Manager Overview](https://aws.amazon.com/firewall-manager/)
- [AWS Firewall Manager Documentation](https://docs.aws.amazon.com/waf/latest/developerguide/firewall-manager.html)
- [AWS Firewall Manager Pricing](https://aws.amazon.com/firewall-manager/pricing/)

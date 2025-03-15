---
cards-deck: AWS Exams::Cheat Sheets::RAM
---
# What is AWS Resource Access Manager (RAM) #card

AWS Resource Access Manager (RAM) **enables secure resource sharing** across AWS accounts and AWS Organizations.

---

## RAM Features #card

- **Share AWS resources** across accounts, Organizational Units (OUs), or entire Organizations
- **No need for duplicate resources** – centralize resource management
- **Cross-account sharing**:
  - **Within AWS Organizations** – No invitation required
  - **Outside AWS Organizations** – Invitation required for acceptance
- **Only the master account** can enable sharing with AWS Organizations
- **Organizations must have all features enabled** for sharing

---

## RAM Resource Sharing Steps #card

1. **Create a Resource Share**
2. **Specify resources** to share
3. **Specify AWS accounts or Organizations** to share with

- **Stop sharing** by deleting the resource share in AWS RAM

---

## AWS Services Supported by RAM #card

| Service | Resource |
|---------|----------|
| Amazon Aurora | DB Clusters |
| AWS CodeBuild | Projects, Report Groups |
| Amazon EC2 | Capacity Reservations, Dedicated Hosts, Subnets, Traffic Mirror Targets, Transit Gateways |
| Amazon EC2 Image Builder | Components, Images (AMI), Image Recipes |
| AWS License Manager | License Configurations |
| AWS Resource Groups | Resource Groups |
| Amazon Route 53 | Forwarding Rules |

---

## RAM Security #card

- **Use IAM policies** to control access to shared resources
- **Grant permissions** to specify who can share or receive resources

---

## RAM Pricing #card

- **No additional cost** for using AWS RAM

---

## References

- [AWS RAM Overview](https://aws.amazon.com/ram/)
- [AWS RAM FAQs](https://aws.amazon.com/ram/faqs/)
- [AWS RAM Documentation](https://docs.aws.amazon.com/ram/latest/userguide/what-is.html)
- [AWS RAM Blog](https://aws.amazon.com/blogs/aws/new-aws-resource-access-manager-cross-account-resource-sharing/)

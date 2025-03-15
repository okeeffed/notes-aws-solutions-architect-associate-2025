---
cards-deck: AWS Exams::Cheat Sheets::ECR
---
# Elastic Container Registry (ECR) #card

Amazon ECR is a **managed AWS Docker registry service** for storing, managing, and deploying container images.

---

## ECR Features #card

- **Regional service** for storing Docker images
- **Supports Docker Registry HTTP API V2** for seamless CLI integration
- **Stores images in Amazon S3**
- **Supports repository organization** via **namespaces**
- **Transfers images securely via HTTPS**

---

## ECR Components

### ECR Registry #card

- **Each AWS account has a registry**
- **Create image repositories** within the registry
- **Registry URL format:** `https://aws_account_id.dkr.ecr.region.amazonaws.com`
- **Authentication required** before use

### ECR Authorization Token #card

- **Required for Docker client authentication**
- **AWS CLI** `get-login` command provides credentials for authentication

### ECR Repository #card

- **Stores Docker images**
- **Uses resource-based permissions** for access control
- **Supports lifecycle policies** for automatic image cleanup

### ECR Repository Policy #card

- **Controls access** to repositories and stored images

### ECR Image #card

- **Push and pull** Docker images
- **Use images in ECS task definitions**
- **Supports cross-region replication** of private repository images

---

## ECR Security #card

- **IAM users have no default permissions**
- **Use IAM policies** to grant or deny access
- **Partially supports resource-level permissions**
- **Supports AWS KMS CMK encryption** for securing container images

---

## ECR Pricing #card

- **Pay only for storage and data transfer**

---

## References

- [AWS ECR Docs](https://docs.aws.amazon.com/AmazonECR/latest/userguide/)
- [AWS ECR Features](https://aws.amazon.com/ecr/features/)
- [AWS ECR Pricing](https://aws.amazon.com/ecr/pricing/)
- [AWS ECR FAQs](https://aws.amazon.com/ecr/faqs/)

---
cards-deck: AWS Exams::Cheat Sheets::Storage Gateway
---
# AWS Storage Gateway Cheat Sheet #card

AWS Storage Gateway enables **hybrid storage** between on-premises environments and the AWS Cloud. It integrates on-premises enterprise applications with AWS storage services using industry-standard protocols.

---

## Storage Solutions #card

- **File Gateway** – File-based interface to Amazon S3
- **Volume Gateway** – Cloud-backed storage volumes mounted as iSCSI devices
  - **Cached Volumes** – Frequently accessed data stored locally, bulk data in S3
  - **Stored Volumes** – All data stored on-premises, backed up to S3
- **Tape Gateway** – Virtual tape library (VTL) for archiving backups in Amazon Glacier

---

## SG File Gateway #card

Provides a **file interface** into S3, combining a service with a virtual appliance.

- Deployable as a **VM** (VMware ESXi, Microsoft Hyper-V) or on AWS
- Supports:
  - **S3 Standard**
  - **S3 Standard – Infrequent Access (IA)**
  - **S3 One Zone – IA**

### SG File Storage Features #card

- Supports **NFS v3/v4.1** and **SMB v2/v3**
- Data is directly accessible in S3
- Supports **S3 Object Lock** for WORM storage
- Local cache supports up to **64 TB**
- Modifications are stored as **new object versions**
- Manage data with **lifecycle policies, versioning, and cross-region replication**

---

## SG Volume Gateway #card

Provides **iSCSI storage** volumes for on-premises applications.

### SG Cached Volumes #card

- Data stored in **S3**, frequently accessed data cached locally
- Volume size: **1 GiB – 32 TiB** (rounded to the nearest GiB)
- Each gateway supports **up to 32 volumes**

### SG Stored Volumes #card

- **Entire dataset stored locally**, backups asynchronously sent to S3
- Volume size: **1 GiB – 16 TiB** (rounded to the nearest GiB)
- Each gateway supports **up to 32 volumes**

### SG Volume Migration #card

- Volumes can be detached and re-attached to **refresh hardware** or **switch virtual machines**
- Move volumes between on-premises and **Amazon EC2 instances**

---

## SG Tape Gateway #card

Provides **long-term archival storage** using a virtual tape library (VTL).

- Deployable **on-premises** or as an **EC2 instance**
- Stores data in **Amazon S3 Glacier** or **S3 Glacier Deep Archive**
- Enables **Write-Once-Read-Many (WORM)** and **Tape Retention Lock**
- Reduces storage costs **by up to 75%** when moving from Glacier to Glacier Deep Archive

---

## Hosting Options #card

- **VM on VMware ESXi, Microsoft Hyper-V** (on-premises)
- **VM in VMware Cloud on AWS**
- **Hardware appliance** (on-premises)
- **Amazon EC2 AMI**

---

## File Gateway File Shares #card

- Create **NFS** or **SMB** file shares via the AWS Management Console or API
- Access objects in an S3 bucket from **another AWS account**
- Supports **Access Control Lists (ACLs)** on SMB shares

---

## Security #card

- **AWS KMS** encrypts data stored in virtual tapes
- Uses **CHAP (Challenge-Handshake Authentication Protocol)** for iSCSI authentication
- **IAM authentication and access control**

---

## Compliance #card

- **HIPAA eligible**
- **PCI DSS compliant**

---

## Pricing #card

- Charges based on:
  - **Storage used** (file, volume, tape)
  - **Requests made**
  - **Data transfer out of AWS**
- Tape Gateway charges only for **written data**, not tape capacity

---

## References

- [AWS Storage Gateway Docs](https://docs.aws.amazon.com/storagegateway/latest/userguide/)
- [AWS Storage Gateway Features](https://aws.amazon.com/storagegateway/features/)
- [AWS Storage Gateway Pricing](https://aws.amazon.com/storagegateway/pricing/)
- [AWS Storage Gateway FAQs](https://aws.amazon.com/storagegateway/faqs/)

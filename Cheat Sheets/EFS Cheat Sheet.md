---
cards-deck: AWS Exams::Cheat Sheets::EFS
---
# Amazon EFS Cheat Sheet

## What is EFS? #card

A fully-managed file storage service that makes it easy to set up and scale file storage in the Amazon Cloud.

## Features

### What does EFS manage? #card

- Manages all file storage infrastructure.
- Avoids complexity of deploying, patching, and maintaining file system configurations.

### What protocols does EFS support? #card

- Supports **Network File System (NFS) version 4** protocol.

### What OS can mount EFS? #card

- Linux and macOS Big Sur.
- **Windows is not supported.**

### What services can mount EFS? #card

- EC2 instances.
- ECS tasks.
- EKS pods.
- Lambda functions.

### Multiple EC2 instances access to EFS FS? #card

- Yes, multiple EC2 instances can **concurrently** access an EFS file system.

### How does EFS store data? #card

- Stores **data and metadata across multiple Availability Zones** in an AWS Region.
- Can scale to **petabyte** levels.

### What are some notable features of EFS? #card

- Supports **file system access semantics**, strong data consistency, and file locking.
- Uses **POSIX permissions** for access control.
- AWS **DataSync** enables simple data movement to/from EFS.
- Supports **automatic incremental backups** using the **EFS-to-EFS Backup** solution.
- Supports **EFS Infrequent Access (EFS IA)** to optimize costs for rarely accessed files.
- Lifecycle Management **moves files** not accessed for 30+ days to **EFS IA storage class**.

## Performance Modes

### What are the performance modes of EFS? #card

- **General Purpose Mode (default):**
  - Ideal for latency-sensitive use cases.
- **Max I/O Mode:**
  - Scales to higher throughput with **slightly higher latencies**.

## Throughput Modes

### What are the throughput modes of EFS? #card

- **Bursting Throughput Mode (default):**
  - Throughput scales **as the file system grows**.
- **Provisioned Throughput Mode:**
  - Throughput is **specified independently** of stored data.

## Mount Targets

### What is a mount target in EFS? #card

- Provides an **IP address** for an **NFSv4 endpoint** in a VPC.

### How many mount targets can you create per AZ? #card

- **One** mount target per Availability Zone.

### What is the format of an EFS mount target DNS name? #card

```
file-system-id.efs.aws-region.amazonaws.com
```

## Access Points

### What are EFS Access Points? #card

- Simplifies application access to **shared data sets**.
- Works with **AWS IAM** to enforce user/group access.

## Components of a File System

### What are the key components of an EFS file system? #card

- **ID**
- **Creation token**
- **Creation time**
- **File system size (in bytes)**
- **Number of mount targets**
- **File system state**

## Data Consistency

### What consistency does EFS provide? #card

- **Open-after-close** consistency semantics.
- **Read-after-write** consistency for synchronous data access.

## Managing File Systems

### Does EFS support encryption? #card

- Yes, supports **encryption in transit and at rest**.

### How is network accessibility managed? #card

- By managing **mount targets**.
- Creating and deleting mount targets.
- Updating mount target configuration.

### Metered data size for different FS objects? #card

- **Regular files:** Logical size rounded to **4 KiB**.
- **Sparse files:** Metered size is **actual storage used**.
- **Directories:** Rounded to **next 4 KiB increment**.
- **Symbolic links & special files:** Always **4 KiB**.

### Can you restore an EFS file system after deletion? #card

- **No**, file system deletion is **permanent**.

### What tool can copy data between EFS resources? #card

- **AWS DataSync**.

## Mounting File Systems

### How do you mount an EFS file system to EC2? #card

- Use the **mount helper** in `amazon-efs-utils` package.

### How do you mount EFS in an on-premises data center? #card

- Use **AWS Direct Connect** or **VPN**.

### How do you mount EFS on reboot? #card

- Use `fstab` to auto-mount the file system.

## Lifecycle Management

### What are the EFS lifecycle management policies? #card

- You can choose from five EFS Lifecycle Management policies (7, 14, 30, 60, or 90 days) to automatically move files into the EFS Infrequent Access (EFS IA) storage class and save up to 85% in cost.

## Monitoring File Systems

### What AWS services monitor EFS? #card

- Amazon CloudWatch Alarms
- Amazon CloudWatch Logs
- Amazon CloudWatch Events
- AWS CloudTrail Log Monitoring
- Log files on your file system
## Security

### What credentials are required to make EFS API requests? #card

- **AWS IAM permissions**.

### What is the default root directory in an EFS file system? #card

- `/` with **root user (UID 0) access** only.

### How can NFS access be managed securely? #card

- Use **IAM roles and policies**.
- Specify **security groups** for EC2 instances and EFS mount targets.

## Pricing

### How is Amazon EFS priced? #card

- **Pay only for storage used**.
- Costs for **Provisioned Throughput** depend on the specified throughput.

## EFS vs. EBS vs. S3

### How does EFS compare to EBS and S3? #card

| Feature          | Amazon EFS         | Amazon EBS Provisioned IOPS | Amazon S3 |
|-----------------|--------------------|----------------------------|-----------|
| **Latency**    | Low, consistent    | Lowest, consistent        | Low       |
| **Throughput** | Multiple GB/s       | Single GB/s               | Multiple GB/s |
| **Availability** | Multi-AZ           | Single AZ                 | Multi-AZ  |
| **Use Cases**   | Analytics, media, web apps | Databases, boot volumes | Content management, backups |

## Validate Your Knowledge

### What is the best storage service for POSIX-compliant HPC workloads? #card

- **Amazon Elastic File System (EFS)**

### How to reduce costs for EFS batch job storage? #card

- **Use Spot Instances** and enable **EFS Infrequent Access**.

## References
- [Amazon EFS Documentation](https://docs.aws.amazon.com/efs/latest/ug/)
- [Amazon EFS Pricing](https://aws.amazon.com/efs/pricing/)
- [Amazon EFS FAQ](https://aws.amazon.com/efs/faq/)
- [Amazon EFS Features](https://aws.amazon.com/efs/features/)
- [When to Use Amazon EFS](https://aws.amazon.com/efs/when-to-choose-efs/)

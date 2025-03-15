---
cards-deck: AWS Exams::Cheat Sheets::FSx
---
## AWS FSx

### ExampleAWS FSx? #card

Amazon FSx is a fully managed third-party file system solution. It uses SSD storage to provide fast performance with low latency.

## Available FSx Solutions #card

- FSx for Windows File Server
- FSx for Lustre
- FSx for NetApp ONTAP
- FSx for OpenZFS

---

## FSx for Windows File Server #card

A fully managed native Microsoft Windows file system with full support for:
- SMB protocol
- Windows NTFS
- Microsoft Active Directory (AD) integration

### Windows File Server Common Use Cases #card

- File systems accessible by multiple users with permissions at file/folder level
- Application workloads using Windows-based file systems (NTFS) and SMB protocol
- Media workflows (transcoding, processing, streaming)
- Data-intensive analytics workloads
- Content management and web-serving applications (e.g., IIS)

### WFS Supported Compute Services #card

- Amazon EC2
- Amazon Workspaces instances
- Amazon AppStream 2.0 instances
- VMs in VMware Cloud on AWS Environments

### WFS Active Directory Integration #card

Works with Microsoft AD to integrate your file system into existing Windows environments.

### WFS On-Premises Access #card

Supports AWS Direct Connect or AWS VPN to access file systems from on-premises compute instances.

### Microsoft Windows File Share #card

A specific folder in your file system accessible via the SMB protocol.

- Default share: `share`
- Managed using Windows GUI tool **Shared Folders**
- Accessible via **Map Network Drive** functionality

### WFS Storage Features #card

- **User Storage Quotas**: Limits user storage consumption and tracks quota status.
- **DFS Namespaces**: Groups file shares from multiple file systems into a unified folder structure.
- **Data Deduplication**: Reduces storage costs by eliminating redundant data.

### WFS Performance Metrics #card

- Uses SSD storage
- Supports up to **64 TB per file system**
- Provides up to **2 GB/s throughput**
- Supports DFS Namespaces to scale storage to **hundreds of petabytes**

### WFS Migration to FSx #card

Use **RoboCopy** to migrate data, including metadata such as ownership and ACLs.

### WFS FSx Limits #card

| Resource | Default Limit | Max Limit |
|----------|--------------|-----------|
| File systems | 100 | Thousands |
| Total storage | 512 TiB | Multiple PiBs |
| Throughput capacity | 10 GBps | Hundreds of GBps |
| Backups | 500 | Thousands |

---

## FSx for Lustre #card

A high-performance file system optimized for fast processing of workloads. Lustre is an open-source parallel file system.

### Lustre Key Features #card

- Supports **SSD and HDD** storage options
- Reduces costs by **up to 80%** for throughput-intensive workloads
- Provides **POSIX-compliant** file system interface
- Supports concurrent access to files from **thousands of compute instances**

### Lustre S3 Integration #card

- **Hot storage**: FSx for Lustre
- **Cold storage**: Amazon S3
- **Linked S3 bucket**: FSx transparently presents S3 objects as files
- **Write results**: Saves computation results back to S3

### Lustre Performance Metrics #card

- Provides **sub-millisecond latency**
- **Hundreds of GB/s throughput** and **millions of IOPS**
- **200 MB/s per TB** of provisioned storage

---

## FSx for NetApp ONTAP #card

A high-performance shared file storage solution supporting:
- **NFS, SMB, and iSCSI**
- **SSD storage with sub-millisecond latency**
- **Multi-protocol access from Linux, Windows, macOS**

### ONTAP Components #card

- **Storage Virtual Machines (SVMs)**
- **Volumes**

### ONTAP Endpoints #card

- **Management**: NetApp ONTAP CLI (SSH) or REST API
- **Intercluster**: NetApp SnapMirror replication or NetApp FlexCache caching

### ONTAP Automatic Tiering #card

Moves data between storage tiers based on access patterns:

- **Auto**: Moves cold data (user & snapshot) to capacity tier
- **Snapshot-only**: Moves snapshots only
- **All**: Moves all user data
- **None**: Keeps all data in the primary storage tier

---

## FSx for OpenZFS #card

A file storage service with **up to 1 million IOPS** and **hundreds of microseconds latency**.

### OpenZFS Key Features #card

- **Compatible with ZFS**: Migrate on-prem ZFS data without modifying applications
- **Runs on AWS Graviton processors**
- **Supports NFS for Linux, Windows, macOS**
- **Advanced data management**:
  - Z-Standard compression
  - Instant point-in-time snapshots
  - Data cloning
  - Backup to S3 with cross-region copies

### OpenZFS Storage Features #card

- **Multiple volumes per file system**
- **Thin provisioning**
- **User and group quotas**

---

## FSx HA & Durability #card

- Replicates data within the **same AZ**
- Supports **single-AZ** and **multi-AZ** deployments
- Uses **VSS (Volume Shadow Copy Service)** for automatic **daily backups to S3**
- Supports **restoring files and folders** using Windows shadow copies
- Default **backup retention period**: **7 days**

---

## FSx Security #card

- **Identity-based authentication** via Microsoft Active Directory
- **At-rest encryption**: AWS KMS
- **In-transit encryption**: SMB Kerberos session keys
- **Compliance**: ISO, PCI-DSS, SOC, HIPAA
- **AWS CloudTrail integration**: Logs API calls

---

## FSx Pricing #card

- **Hourly billing** based on:
  - Storage capacity (per GB-month)
  - Throughput capacity (per MBps-month)
  - Backup storage (per GB-month)
- **Data deduplication** reduces storage costs by eliminating redundant data

---

## References

- [AWS FSx Windows](https://aws.amazon.com/fsx/windows/?nc=sn&loc=2)
- [AWS FSx Windows Docs](https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html)
- [AWS FSx Lustre](https://aws.amazon.com/fsx/lustre/?nc=sn&loc=3)
- [AWS FSx Lustre Docs](https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html)
- [Comparison: FSx vs EFS vs Lustre](https://tutorialsdojo.com/amazon-efs-vs-amazon-fsx-for-windows-vs-amazon-fsx-for-lustre/)

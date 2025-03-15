---
cards-deck: AWS Exams::Cheat Sheets::EBS
---
## An overview of EBS #card

- Block-level storage volumes for use with EC2 instances.
- Suitable for file systems, databases, and applications requiring fine granular updates.
- Supports random and sequential reads/writes.
- New EBS volumes achieve maximum performance instantly. Restored snapshots require initialisation.
- Termination protection is off by default.
- Default limits: 5,000 EBS volumes and 10,000 snapshots per account.

## Features of EBS

### Main features of Amazon EBS? #card

- Multiple storage types: `gp2`, `gp3`, `io1`, `io2`, `st1`, `sc1`.
- Multi-Attach available for `io1` and `io2` volumes.
- Volumes exist within a specific AZ and require snapshots for cross-AZ movement.
- Snapshots are stored in S3 and can be copied across regions.
- Performance metrics are available in Amazon CloudWatch.
- AWS Backup integration for automated and centralized backup management.
- Elastic Volumes allow resizing and performance adjustments without detachment.

## Types of EBS Volumes

### General Purpose SSD gp3 #card

- Baseline: 3,000 IOPS and 125 MiB/s throughput.
- Can provision up to 16,000 IOPS and 1,000 MiB/s.
- IOPS-to-size ratio: 500 IOPS per GiB.

### General Purpose SSD gp2 #card

- Base: 3 IOPS/GiB, burstable to 3,000 IOPS.
- Maximum: 16,000 IOPS and 250 MB/s throughput.
- Burst duration depends on volume size and credit balance.

### Provisioned IOPS SSD io1 + io2 #card

- Designed for I/O-intensive applications.
- `io2` offers 99.999% durability and up to 500 IOPS per GiB.
- `io2 Block Express` supports up to 256,000 IOPS.

### Throughput Optimized HDD st1 #card

- Designed for sequential workloads (e.g., big data, log processing).
- Maximum throughput: 500 MiB/s.

### Cold HDD sc1 #card

- Low-cost storage for infrequently accessed data.
- Maximum throughput: 250 MiB/s.

## Encryption

### How does EBS encryption work? #card

- Encrypts data at rest, in transit, and snapshots.
- Uses AWS Key Management Service (KMS).
- All encrypted snapshots create encrypted volumes.
- Cannot remove encryption from an existing encrypted volume.
- Encryption is enabled by default at the account level.

## Amazon EBS Monitoring

### CloudWatch monitoring types for EBS? #card

- **Basic monitoring:** Default, updates every 5 minutes.
- **Detailed monitoring:** Optional, updates every minute.

### Possible EBS volume statuses? #card

- **OK**: Normal operation.
- **Warning**: Degraded volume.
- **Impaired**: Stalled volume.
- **Insufficient-data**: Monitoring issue.

### Possible EBS volume events? #card

- **Enable IO**: Occurs when I/O operations are enabled on a volume that was previously disabled.
- **IO Auto-Enabled**: Amazon automatically enables I/O after a system check deems the volume healthy.
- **Normal**: The volume is operating without issues.
- **Degraded**: The volume is experiencing performance issues but is still operational.
- **Severely Degraded**: The volume is heavily impacted and may have high latency or reduced IOPS.
- **Stalled**: The volume is not responding to I/O requests and is considered unavailable.

## Modifying EBS Volumes

### Changing EBS volume properties? #card

- Yes, for current-generation EBS volumes attached to modern EC2 instances.
- Can increase size, change type, or adjust IOPS for `io1` volumes.
- Decreasing volume size is not supported.

### Tools used to expand partitions? #card

- **Linux**: `parted`, `gdisk`.
- **Filesystem-specific commands:**
    - `resize2fs` for ext2, ext3, ext4.
    - `xfs_growfs` for XFS.

## EBS Snapshots

### How EBS snapshots work? #card

- Stored in Amazon S3 as incremental backups.
- Deleting a snapshot only removes unique data.
- Snapshots are region-bound but can be copied to other regions.
- Encrypted snapshots require a customer-managed key (CMK) to share.

### Sharing snapshots across accounts? #card

- Yes, by modifying access permissions.
- Shared snapshots must be encrypted with a custom CMK.

## Amazon EBS–Optimized Instances

### EBS optimized instances? #card

- EC2 instances with dedicated bandwidth for EBS volumes.
- Provides bandwidth from 500 Mbps to 60,000 Mbps.
- Some instance types are EBS-optimized by default.

## Amazon EBS Pricing

### Pricing considerations for EBS? #card

- Charged per GB provisioned per month.
- `io1` volumes also incur an IOPS charge.
- Snapshot storage billed based on used space in S3.
- Cross-region snapshot copies incur additional costs.
- EBS-optimized instances may have an extra hourly charge.

## Improving Performance

### Optimizing EBS performance? #card

- Use EBS-optimized instances.
- Understand workload patterns and optimize accordingly.
- Initialize volumes from snapshots to avoid I/O latency.
- Use `st1` and `sc1` for high-throughput workloads.
- Use RAID 0 for performance maximization.
- Track performance using Amazon CloudWatch.

## Amazon EBS Cheat Sheet Resources

- [Amazon EBS User Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AmazonEBS.html)
- [Amazon EBS FAQs](https://aws.amazon.com/ebs/faqs/)
- [AWS Training – Amazon EBS](https://www.youtube.com/user/AmazonWebServices/search?query=ebs)

For more AWS practice exam questions, visit [Tutorials Dojo](https://tutorialsdojo.com/).
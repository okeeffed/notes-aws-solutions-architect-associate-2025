---
cards-deck: AWS Exams::Solutions Architect::Associate::FSx
---
## What is AWS FSx? #card 

- Fully managed **native Windows** file servers/shares.
- Designed for integration with Windows environments.
- Integrates with Directory Service or Self-Managed AD
- Single or Multi-AZ within a VPC
- On-demand and schedule backups
- Accessible using **VPC**, **Peering**, **VPN** or **Direct Connect**

![[fsx-windows-server.png]]

https://aws.amazon.com/fsx/windows/

### What are FSx key features and benefits? #card

- VSS - User-Driven Restores
- Native file system accessible over SMB
- Windows permission model
- Supports DFS (disk file system) ... scale-out file share structure
- Managed - no file server admin
- Integrates with DS AND your own directory

## What is FSx for Lustre? #card 

This is a file system designed for various high-performance compute and workloads. It's a relatively niche product, but you should know the difference with other FSx offerings.

- Supports Linux Clients and POSIX.
- Machine Learning, Big Data, Financial Modelling
- Scales to 100s GB/s throughput and sub-millisecond latency
- Deployment types:
	- **Scratch**: Highly optimised for short term. No replication & fast.
	- **Persistent**: Longer term, HA (in one AZ), self-healing.
- Accessible over **VPN** or **Direct Connect**.
- Data is *lazy loaded* from the S3 Linked Repository into the file system as needed for processing.
	- Data can then be **exported** back to S3 at any point using **hsm_archive**.
- Metadata is stored on **metadata targets (MST)**
- Objects are stored on called **object storage targets (OSTs)**
- Baseline performance based on size.
	- Minimum 1.2TiB then increments of 2.4TiB.
- From **Scratch** - base 200 MB/s per TiB of storage. It is designed for **pure performance** and should be used for short term/temp workloads. No high availability, no replication.
- Persistent offers replication within one AZ and offers per TiB:
	- 50MB/s
	- 100MB/s
	- 200MB/s
- Persistent auto-heals when hardware failure occurs.
- Both types can burst up to 1,300MB/s per TiB (credit system)
- You can backup to S3 with both (manual or auto 0-35 day retention)

![[fsx-for-lustre.png]]

## Exam tips

- If you see Windows/SMB, it will be FSx for Windows
- Any mention of Linux, HPC, Machine Learning, Big Data, Lustre, POSIX etc. it will be FSx for Lustre. Could also be Lustre for anything related to SageMaker with HPC.
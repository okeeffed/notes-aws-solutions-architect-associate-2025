---
cards-deck: AWS Exams::Cheat Sheets::ParallelCluster
---
# AWS ParallelCluster #card

AWS ParallelCluster is an **open-source cluster management tool** for deploying and managing **High-Performance Computing (HPC) clusters** on AWS.

---

## ParallelCluster Key Features #card

- Automates **HPC cluster deployment** using a **simple text-based configuration file**
- Provisions:
  - **Master instance** for build and control
  - **Compute cluster**
  - **Shared filesystem**
  - **Batch scheduler**
- Supports **pre-install and post-install** bootstrap actions for customization

---

## ParallelCluster Supported Schedulers #card

- **SGE** (Son of Grid Engine)
- **Torque**
- **Slurm**
- **AWS Batch**

---

## ParallelCluster Instance Types #card

- **On-Demand Instances**
- **Reserved Instances**
- **Spot Instances**

---

## ParallelCluster Networking #card

- Uses **Amazon VPC** for networking
- Requires **DNS Resolution = Yes**, **DNS Hostnames = Yes**, and **DHCP options** configured correctly

### ParallelCluster Subnet Configurations #card

- **Single Subnet** – Master and compute instances in the same subnet
- **Dual Subnet** – Master in a public subnet, compute instances in a private subnet
- Supports deployment using an **HTTP Proxy** for AWS requests

---

## ParallelCluster Storage #card

- Default **15GB Elastic Block Storage (EBS)** volume for master node, shared via **NFS**
- Supports:
  - **Amazon Elastic File System (EFS)**
  - **RAID** configurations
  - **Amazon FSx for Lustre**
  - **Amazon S3** for job input and output storage

---

## ParallelCluster Configuration #card

- Default configuration file: `~/.parallelcluster/config`
- Can specify a **custom configuration file** using `-c` or `--config` CLI option
- Required sections:
  - **[global]**
  - **[aws]**
  - **[cluster]**
  - **[vpc]**

---

## ParallelCluster Processes #card

- **Jobwatcher** – Monitors the scheduler (SGE, Slurm, or Torque) to **scale up** compute nodes
- **Sqswatcher** – Listens for **Amazon SQS messages** from Auto Scaling to track cluster state changes
- **Nodewatcher** – Runs on each **compute node** to terminate idle instances

---

## ParallelCluster Pricing #card

- **No additional charge** for using AWS ParallelCluster
- Pay only for the **AWS resources** used (compute, storage, networking, etc.)

---

## ParallelCluster Limitations #card

- **Does not support Windows clusters**
- **Does not support mixed instance types** within a cluster (master and compute nodes must have distinct types)

---

## References

- [AWS ParallelCluster Overview](https://aws.amazon.com/hpc/parallelcluster/)
- [AWS ParallelCluster Documentation](https://docs.aws.amazon.com/parallelcluster/latest/ug/what-is-aws-parallelcluster.html)
- [AWS HPC FAQs](https://aws.amazon.com/hpc/faqs/)
- [AWS Open Source Blog on ParallelCluster](https://aws.amazon.com/blogs/opensource/aws-parallelcluster/)

---
cards-deck: AWS Exams::Cheat Sheets::Elastic Fabric Adapter
---
# Elastic Fabric Adapter (EFA) #card

Elastic Fabric Adapter (EFA) is a **network device** that attaches to **Amazon EC2 instances** to accelerate **High-Performance Computing (HPC) and machine learning (ML) applications**.

---

## EFA Key Features #card

- **OS-bypass functionality** – Enables low-latency, high-throughput networking
- **Accelerates HPC applications** – Supports MPI-based workloads
- **Integrates with ML frameworks** – Supports **NCCL for ML applications**

---

## EFA How It Works #card

- **EFA is an enhanced Elastic Network Adapter (ENA)** with additional OS-bypass functionality
- Uses **Libfabric 1.9.0** and supports:
  - **Open MPI 4.0.2**
  - **Intel MPI 2019 Update 6**
  - **Nvidia NCCL** for ML applications
- **Bypasses OS Kernel** – HPC applications communicate directly with the EFA device

---

## EFA Supported Operating Systems #card

- **Amazon Linux 2**
- **RHEL 7 & 8**
- **CentOS 7**
- **Rocky Linux 8 & 9**
- **OpenSUSE Leap 15.4+**
- **SUSE Linux Enterprise 15 SP2+**
- **Ubuntu 18.04, 20.04, 22.04**

---

## EFA HPC Application Examples #card

- **Computational Fluid Dynamics (CFD)**
- **Crash Simulations**
- **Weather Simulations**

---

## EFA Limitations #card

- **One EFA per instance** unless the instance supports **multiple network cards**
- **Instances supporting multiple EFAs** – `c6in.32xlarge`, `dl1.24xlarge`, `hpc6id.32xlarge`
- **OS-bypass traffic limited to a single subnet**
- **EFA traffic cannot be routed between subnets**
- **Not supported on AWS Outposts**
- **EFA must be in a security group allowing all inbound/outbound traffic to itself**

---

## EFA Pricing #card

- **No additional cost** – Available as an **optional EC2 networking feature**

---

## References

- [AWS EFA Overview](https://aws.amazon.com/hpc/efa/)
- [AWS HPC FAQs](https://aws.amazon.com/hpc/faqs/)
- [AWS EFA Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/efa.html)
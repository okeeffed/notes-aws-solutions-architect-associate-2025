---
cards-deck: AWS Exams::Solutions Architect::Associate::Tutorials Dojo::AWS EC2
---
## Types of EC2 Instances

### Explain General Purpose instances #card

**General Purpose** instances provide a **balance** of compute, memory, and networking resources. They can be used for a variety of **diverse workloads**. Instances under the **T-family** have **burstable performance capabilities**, which provide higher CPU performance during high loads in exchange for **CPU credits**. Once the credits run out, your instance will not be able to burst anymore. More credits can be earned at a certain rate per hour depending on the **instance size**.

### Explain Compute Optimized instances? #card

**Compute Optimized** instances are ideal for **compute-bound applications** that benefit from **high-performance processors**. These instances are well-suited for:
- **Batch processing workloads**
- **Media transcoding**
- **High-performance web servers**
- **High-performance computing**
- **Scientific modeling**
- **Dedicated gaming servers**
- **Ad server engines**
- **Machine learning inference**
- Other **compute-intensive applications**

### Explain Memory Optimized instances? #card

**Memory Optimized** instances are designed to deliver **fast performance** for workloads that process **large data sets in memory**.

### Explain Accelerated Computing instances? #card

**Accelerated Computing** instances use **hardware accelerators** or **co-processors** to efficiently perform tasks like:
- **Floating-point number calculations**
- **Graphics processing**
- **Data pattern matching**

### Explain Storage Optimized instances? #card 

**Storage Optimized** instances are designed for workloads that require **high, sequential read and write access** to very large data sets on local storage. They are optimized to deliver:
- **Tens of thousands of low-latency, random I/O operations per second (IOPS)**

### Explain Nitro-based instances? #card 

**Nitro-based** instances provide **bare metal capabilities** that eliminate virtualization overhead and support workloads requiring **full access to host hardware**. With **EBS Provisioned IOPS volumes** on Nitro-based instances, you can provision:
- From **100 IOPS up to 64,000 IOPS per volume** (compared to just up to 32,000 on other instances)

### What is the best IOPS solution for EC2 data that needs to persist? #card

**Amazon EBS Provisioned IOPS volumes** are the highest performing EBS volumes for I/O intensive applications that require low latency and persist even after shutdowns or reboots. You can also create snapshots and copy them over to other instances.

### What is the best IOPS solution for EC2 data that does not to persist? #card

**Instance stores on a specific instance type** might be more preferable than EBS Provisioned IOPS volumes. 

EBS volumes are attached to EC2 instances virtually, so there can still be some latency there.

Instance store volumes can come in HDD, SDD or NVME SDD depending on the instance type. Store size also depends on instance type.

### References

- [AWS EC2 Instance Types Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html)
- [Amazon Elastic Compute Cloud (Amazon EC2) Tutorials Dojo](https://tutorialsdojo.com/amazon-elastic-compute-cloud-amazon-ec2/)

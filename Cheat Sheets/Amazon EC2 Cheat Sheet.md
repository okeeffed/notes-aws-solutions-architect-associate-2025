---
cards-deck: AWS Exams::Cheat Sheets::EC2
---
The following is a summary made from the [Tutorials Dojo cheat sheet](https://tutorialsdojo.com/amazon-elastic-compute-cloud-amazon-ec2/).

## What is EC2 #card 

A Linux-based/Windows-based/Mac-based virtual server that you can provision.

### EC2 limits you should know #card

- Limited to running On-Demand Instances per vCPU-based On-Demand Instance limit.
- Purchase up to 20 Reserved Instances.
- Request Spot Instances per dynamic Spot limit per region.

## Amazon EC2 Features

### What is the AWS Nitro System? #card

The AWS Nitro System is the underlying platform of next-generation EC2 instances. It offloads functions traditionally handled by hypervisors to dedicated hardware and software, reducing costs and improving performance.

Think of Nitro as a superhero taking off it's "handy cap" to improve their ability.

### What are EC2 instances? #card

Server environments in EC2 are called **instances**.

### What is an Amazon Machine Image (AMI)? #card

An Amazon Machine Image (AMI) is a reusable template that includes an operating system and additional software for launching EC2 instances.

### What are instance types? #card

EC2 instances come in various configurations based on CPU, memory, storage, and networking:

- **General Purpose**: `t-type`, `m-type`
- **Compute Optimized**: `c-type`
- **Memory Optimized**: `r-type`, `x-type`, `z-type`
- **Storage Optimized**: `d-type`, `h-type`, `i-type`
- **Accelerated Computing**: `f-type`, `g-type`, `p-type`

### What are the general purpose instance types? #card

🧑‍💻 **"Tiny Machines"**

- **T** for **Tiny** (small workloads, burstable performance)
- **M** for **Machines** (balanced, general-purpose)

### What are the compute instance types? #card

⚡ **"Cheetah"**

- **C** for **Cheetah** (fast and CPU-heavy)

### What are the Memory Optimized instance types? #card

🧠 **"Really eXtreme Zeal"**

- **R** for **Really** (RAM-heavy)
- **X** for **eXtreme** (high-memory workloads)
- **Z** for **Zeal** (high-performance memory)

### What are the Storage Optimized instance types? #card

💾 **"Disk Hoarder Inventory"**

- **D** for **Disk** (dense storage)
- **H** for **Hoarder** (high-capacity storage)
- **I** for **Inventory** (I/O-optimized storage)

### What are the Accelerated Computing? #card

🚀 **"Fast GPU Power"**

- **F** for **Fast** (FPGA acceleration)
- **G** for **GPU** (graphics & ML)
- **P** for **Power** (powerful parallel computing)

### What is a key pair in EC2? #card

A key pair consists of a public and private key used for secure login to EC2 instances.

**Key pairs** in Amazon EC2 are primarily used for **SSH authentication** to securely access instances.

### How Key Pairs Work with EC2 #card

- When launching an EC2 instance, you can **create or use an existing key pair**.
- The **private key (.pem file)** is stored **locally on your computer**.
- The **public key** is automatically added to the EC2 instance (inside `~/.ssh/authorized_keys`).
- When you **SSH into the instance**, the private key is used to prove your identity.

**Analogy: "Accessing an always-locked 24 hour gym" 🔑🚪**

Imagine your EC2 instance is **a self-service, always locked 24 hour gym**:

- You (the user) **hold a unique passkey** (the private key).
- The facility **recognises only pre-approved passkeys** (public key stored on the instance).
- When you **use your passkey**, the door unlocks, allowing secure access (SSH login).

Just like **losing your house key means you can’t enter**, if you lose your **private key**, you can’t SSH into the EC2 instance. 

### EC2 Key pair summary Summary

✅ **Key pairs are used for SSH access** to EC2 instances.  
✅ **You must keep the private key safe** (Amazon does not store it).  
✅ **The public key is stored on the EC2 instance** for authentication.

### What is an instance store volume? #card

Instance store volumes provide temporary storage that is deleted when the instance is **stopped** or **terminated**.

### What is Elastic Block Store (EBS)? #card

Elastic Block Store (EBS) provides persistent storage volumes for EC2 instances.

### What are regions and Availability Zones? #card

AWS provides multiple **regions** that contain multiple **Availability Zones** for deploying resources like EC2 instances and EBS volumes.

### What are security groups in EC2? #card

Security groups act as **firewalls**, specifying allowed **protocols, ports, and source IP ranges** for EC2 instances. 

Security groups also allow other security groups as a rule.

### What are Elastic IP addresses? #card

Elastic IP addresses are **static IPv4 addresses** that can be associated with EC2 instances for dynamic cloud computing.

The "elasticity" is it's flexibility to be assigned to other EC2 instances.

### What is user data in EC2? #card

User data is a script executed when an instance boots.

### What is Host Recovery? #card

Host Recovery automatically restarts instances on a new host in case of unexpected hardware failures.

### What is EC2 Hibernation? #card

EC2 Hibernation allows an instance to save its in-memory state to disk and resume later. It requires **encrypted EBS-backed instances**.

### What is the difference between stopping and terminating an EC2 instance? #card

- **Stop**: Shuts down the instance but retains attached **EBS volumes**.
- **Terminate**: Deletes the instance, and the **root volume is deleted by default**.

### How can you prevent accidental termination of an EC2 instance? #card

Enable **termination protection**.

## Root Device Volumes

### What are the types of root device volumes? #card

1. **Instance Store-backed**: Data is **lost** when the instance is stopped or terminated.
2. **Amazon EBS-backed**: Can be stopped and restarted **without data loss**.

### How can you replace the root volume of an EC2 instance? #card

By using:

- **Initial launch state**
- **Snapshot**
- **AMI**

### More information on replacing the root volume

- **Initial Launch State** – If you want to reset the instance back to the way it was when you first launched it, you can **terminate and relaunch** the instance using the original Amazon Machine Image (AMI).
    
- **Snapshot** – If you previously created an **EBS snapshot** of the root volume, you can restore the volume from that snapshot, effectively rolling back to an earlier state.
    
- **AMI (Amazon Machine Image)** – If you have an AMI that includes the desired OS and configuration, you can detach the current root volume and attach a new volume created from that AMI.

#### Steps to Replace a Root Volume Using a Snapshot:

1. Stop the EC2 instance.
2. Detach the current root volume.
3. Create a new EBS volume from an existing snapshot.
4. Attach the new volume to the instance as the root volume (`/dev/xvda` or `/dev/sda1`).
5. Start the instance.

#### Steps to Replace a Root Volume Using an AMI:

1. Stop the instance.
2. Launch a **new instance** from the AMI.
3. Detach the root volume from the new instance.
4. Attach it to the existing instance.
5. Start the original instance.

## Amazon EC2 – AMI

### What is included in an Amazon Machine Image (AMI)? #card

1. A template for the **root volume** (OS, application server, apps)
2. **Launch permissions**
3. A **block device mapping**

### What are the differences between EBS-backed and Instance Store-backed AMIs? #card

|Feature|EBS-backed AMI|Instance Store-backed AMI|
|---|---|---|
|Boot Time|< 1 min|~5 min|
|Root Device Volume|EBS Volume|Instance Store|
|Data Persistence|Root volume is deleted on termination; other volumes persist|Data lost on termination|
|Can Be Stopped|Yes|No|
|Modifications|Can modify instance attributes|Fixed|

### What is the Recycle Bin for AMIs? #card

The **Recycle Bin** allows you to restore deleted AMIs and set lock retention rules for protection.

### What is Amazon EC2 Image Builder? #card

A fully managed service to automate the creation, management, and deployment of AMIs.

## Amazon EC2 Pricing

### What are the EC2 pricing options? #card

1. **On-Demand**: Pay per second with no commitments.
2. **Reserved Instances (RI)**: Pay upfront for 1 or 3 years.
    - **Standard RI**: Higher discounts, fewer modifications.
    - **Convertible RI**: Lower discounts but can be exchanged. Cannot be resold on the market place.
3. **Spot Instances**: Unused EC2 capacity at up to **90% discount**.
4. **Dedicated Hosts**: Pay for a physical host.
5. **Dedicated Instances**: Pay by the hour for single-tenant hardware.
6. **On-Demand Capacity Reservations**: Reserve capacity without long-term commitments.

### Dedicated Hosts vs Dedicated Instances #card 

If you require visibility and control over instance placement and more comprehensive BYOL support, consider using a Dedicated Host instead. Dedicated Instances and Dedicated Hosts can both be used to launch Amazon EC2 instances onto dedicated physical servers. There are **no performance, security, or physical differences** between Dedicated Instances and instances on Dedicated Hosts. However, there are some key differences between them. 

The following table highlights some of the key differences between Dedicated Instances and Dedicated Hosts:

|                                               | Dedicated Host                                                                                                                                                | Dedicated Instance                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Dedicated physical server**                 | Physical server with instance capacity fully dedicated to your use.                                                                                           | Physical server that's dedicated to a single customer account. |
| **Instance capacity sharing**                 | Can share instance capacity with other accounts.                                                                                                              | Not supported                                                  |
| **Billing**                                   | Per-host billing                                                                                                                                              | Per-instance billing                                           |
| **Visibility of sockets, cores, and host ID** | Provides visibility of the number of sockets and physical cores                                                                                               | No visibility                                                  |
| **Host and instance affinity**                | Allows you to consistently deploy your instances to the same physical server over time                                                                        | Not supported                                                  |
| **Targeted instance placement**               | Provides additional visibility and control over how instances are placed on a physical server                                                                 | Not supported                                                  |
| **Automatic instance recovery**               | Supported. For more information, see [Amazon EC2 Dedicated Host recovery](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-recovery.html). | Supported                                                      |
| **Bring Your Own License (BYOL)**             | Supported                                                                                                                                                     | Partial support *                                              |
| **Capacity Reservations**                     | Not supported                                                                                                                                                 | Supported                                                      |

### What are Spot Instances? #card

Spot Instances allow you to request unused EC2 capacity at **discounted rates**.

### What are the allocation strategies for Spot Instances? #card

1. **LowestPrice** – Chooses the cheapest Spot pool.
2. **Diversified** – Spreads across all pools.
3. **CapacityOptimized** – Chooses the pool with the best capacity.

In this context, **"pools"** refer to groups of available Spot Instances that share the same **instance type, operating system, Availability Zone, and network platform**.

## Amazon EC2 Security

### How does IAM secure EC2 instances? #card

- **IAM Policies**: Define access rules.
- **IAM Roles**: Assign permissions to instances.
- **Security Groups**: Act as virtual firewalls.
- **Disable password-based logins** to prevent brute-force attacks.

### What is an Elastic IP address used for? #card

Elastic IP addresses allow dynamic reassignment of static IPv4 addresses to different instances.

### What are the default security group rules? #card

- **Inbound**: Allows all traffic from instances in the **same security group**.
- **Outbound**: Allows **all** traffic.

## Amazon EC2 Monitoring

### What are EC2 monitoring options? #card

1. **CloudWatch Metrics**: CPU, network, disk performance.
2. **CloudWatch Logs**: Store and analyse logs.
3. **CloudWatch Alarms**: Trigger actions on metric thresholds.
4. **Instance & System Status Checks**: Detect issues.

## Placement Groups

### What are EC2 placement groups? #card

Depending on the type of workload, you can create a placement group using one of the following placement strategies:

- **Cluster** – Packs instances close together inside an Availability Zone. This strategy enables workloads to achieve the low-latency network performance necessary for tightly-coupled node-to-node communication that is typical of high-performance computing (HPC) applications.
- **Partition** – Spreads your instances across logical partitions such that groups of instances in one partition do not share the underlying hardware with groups of instances in different partitions. This strategy is typically used by large distributed and replicated workloads, such as Hadoop, Cassandra, and Kafka.
- **Spread** – Strictly places a small group of instances across distinct underlying hardware to reduce correlated failures.

Placement groups are optional. If you don't launch your instances into a placement group, EC2 tries to place the instances in such a way that all of your instances are spread out across the underlying hardware to minimise correlated failures.

**Mnemonic: CuPS**

You place the CuPS around the table with different strategies.

## Amazon EC2 Storage

### What is the difference between EBS and Instance Store? #card

- **EBS**: Persistent storage.
- **Instance Store**: Temporary storage lost on stop/termination.

### What is Amazon FSx? #card

Amazon FSx provides fully-managed file storage solutions:

- **FSx for Windows**: Windows-based storage.
- **FSx for Lustre**: High-performance computing.
- **FSx for NetApp ONTAP**: Shared storage with NetApp’s ONTAP.
- **FSx for OpenZFS**: Shared storage based on OpenZFS.
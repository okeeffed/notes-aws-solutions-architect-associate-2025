---
cards-deck: AWS Exams::Cheat Sheets::Batch
---
# What is AWS Batch #card

AWS Batch enables you to run batch computing workloads on the AWS Cloud. It is a **regional service** that simplifies running batch jobs across multiple AZs within a region.

---

## AWS Batch Features #card

- **Manages compute environments and job queues** to run thousands of jobs of any scale using EC2 and EC2 Spot
- **Dynamically provisions AWS capacity** as needed
- **Monitors job progress** and removes unneeded capacity
- **Supports job dependencies** for complex workflows

---

## AWS Batch Components #card

### AB Jobs
- A **unit of work** such as a shell script, executable, or Docker container
- **Job types:**
  - **Single** – A standalone job
  - **Array** – Runs up to **10,000** jobs concurrently
  - **Multi-node parallel** – Runs distributed workloads across EC2 instances
- **Dependencies:**
  - Each job may have **up to 20 dependencies**
  - **Sequential dependencies** ensure child jobs wait for sibling jobs

### AB Job States
- **SUBMITTED** – Added to the queue
- **PENDING** – Waiting for dependencies or resources
- **RUNNABLE** – Ready for scheduling
- **STARTING** – Preparing to run
- **RUNNING** – Actively executing
- **SUCCEEDED** – Completed successfully
- **FAILED** – Exhausted retries or exceeded timeout

### AB Job Definitions
- Specifies **how jobs should run**
- Includes **IAM role, CPU/memory, container settings, and environment variables**

### AB Job Queues
- Holds jobs until scheduled
- Can be associated with **multiple compute environments**
- Supports **priority-based scheduling**

### AB Compute Environments
- **Managed** – AWS Batch provisions and scales EC2/Spot instances
- **Unmanaged** – User manages EC2 instance lifecycle manually
- ECS container instances are launched in **user-specified VPC and subnets**

---

## AWS Batch Security #card

- **IAM policies** control access to Batch resources
- Supports **tag-based access control**
- Uses **CloudTrail** for API call logging

---

## AWS Batch Monitoring #card

- **AWS Batch event stream for CloudWatch** provides near real-time notifications
- **CloudTrail logs all API calls**

---

## AWS Batch Pricing #card

- **No additional charge for AWS Batch**
- **You pay for EC2, EBS, and networking resources used**

---

## References

- [AWS Batch Documentation](https://docs.aws.amazon.com/batch/latest/userguide/)
- [AWS Batch Features](https://aws.amazon.com/batch/features/)
- [AWS Batch Pricing](https://aws.amazon.com/batch/pricing/)
- [AWS Batch FAQs](https://aws.amazon.com/batch/faqs/)
---
cards-deck: AWS Exams::Cheat Sheets::ECS
---
# Elastic Container Service (ECS) #card

Amazon ECS is a **container management service** for running, stopping, and managing **Docker containers** on AWS.

---

## ECS Features #card

- **Regional service** for managing **containers at scale**
- **Deploy ECS clusters** in a **new or existing VPC**
- **Define task definitions and services** to run containers
- **ECS Exec** enables interactive shell or command access in running containers
- **99.99% Monthly Uptime SLA**

---

## ECS Components

### ECS Containers & Images #card

- **Containers** run application components with dependencies (code, runtime, system libraries, etc.)
- **Images** are built from a **Dockerfile** and stored in a **container registry** (e.g., **ECR**)
- **Docker Volumes**:
  - **Local instance store**
  - **EBS volume**
  - **EFS volume**

### ECS Task Components #card

- **Task Definition** – JSON file defining:
  - **Task family** – Named group of task revisions
  - **IAM Task Role** – Permissions for containers
  - **Network mode** – Determines container networking
  - **Container definitions** – Image, CPU, memory, ports, etc.
  - **Volumes** – Data sharing across containers
  - **Task placement constraints** – Custom task placement rules
  - **Launch types** – Determines underlying infrastructure

### ECS Tasks & Scheduling #card

- **Tasks** – Instances of a **task definition**
- **Fargate Tasks** – Each task runs in isolation, without shared kernel or resources
- **Scheduling Options**:
  - **REPLICA** – Maintains desired number of tasks across cluster
  - **DAEMON** – Runs one task per container instance
- **Rolling Updates** – Deploy updated images automatically

---

## ECS Clusters #card

- **Logical grouping of tasks**
- **Region-specific**
- **Supports both Fargate and EC2 launch types**
- **Fargate manages cluster resources automatically**
- **EC2 clusters require user management**
- **Clusters support ECS Auto Scaling**
- **Cluster deletion requires removing all tasks and services**

---

## ECS Services #card

- **Maintains desired number of task instances**
- **Can run behind a Load Balancer**
- **Deployment Strategies**:
  - **Rolling Update** – Replaces running tasks with updated versions
  - **Blue/Green Deployment** – Uses AWS CodeDeploy for staged rollouts

### ECS Service Load Balancing #card

- **Supports**:
  - **Application Load Balancer (ALB)** – HTTP/HTTPS (Layer 7)
  - **Network Load Balancer (NLB)** – TCP/UDP (Layer 4)
  - **Classic Load Balancer (CLB)** – TCP traffic
- **ALB supports dynamic port mapping**
- **CLB requires static port mapping**
- **Tasks failing health checks restart automatically**

---

## AWS Fargate #card

- **Serverless container runtime** – No EC2 instance management
- **Supports only ECR and Docker Hub container images**
- **Requires awsvpc network mode**
- **Requires explicit CPU and memory allocation**
- **Supports Amazon CloudWatch Logs**
- **Ephemeral storage** – Data is lost after task termination
- **Supports Amazon EFS for persistent storage**

---

## ECS EC2 Launch Type #card

- **EC2-hosted containers** require user-managed infrastructure
- **Supports private repositories**
- **Task Definitions**:
  - **Docker volumes, bind mounts**
  - **EC2-specific storage types**

---

## ECS Monitoring #card

- **CloudWatch Logs** – Monitor container logs
- **CloudWatch Alarms** – Set alerts for container performance
- **CloudTrail** – Audit ECS API actions

---

## ECS Tagging #card

- **Resources (tasks, services, clusters) have ARNs & IDs**
- **Tags help organize and manage ECS resources**

---

## ECS Pricing #card

- **Fargate:** Pay for **vCPU & memory** used per task
- **EC2 Launch Type:** No ECS charge, pay for **EC2 & EBS** resources used

---

## References

- [AWS ECS Docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [AWS ECS Features](https://aws.amazon.com/ecs/features/)
- [AWS ECS Pricing](https://aws.amazon.com/ecs/pricing/)
- [AWS ECS FAQs](https://aws.amazon.com/ecs/faqs/)

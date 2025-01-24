---
cards-deck: AWS Exams::Solutions Architect::Associate::Tutorials Dojo::AWS ECS
---
### Amazon Elastic Container Service (ECS) #card

- **Description**: A highly scalable and high-performance container orchestration service for Docker containers, eliminating the need to manage your own container orchestration software.

### ECS Key Features #card

- **Cluster Management**:
  - Easily install, operate, and scale your container cluster management infrastructure.
  - Tasks are defined in a **task definition**, which can run individually or as part of a **service**.

- **Compute Options**:
  - **AWS Fargate**: Serverless compute engine to run ECS tasks and services without managing servers.
  - **Amazon EC2**: Fully accessible and manageable instances for running ECS tasks.

- **Security**:
  - Assign **IAM roles** to tasks for secure access to AWS resources.

- **Docker Integration**:
  - Build Docker images and store them in **Amazon Elastic Container Registry (ECR)**.

### ECS Integration with AWS Services #card

- **Storage**:
  - Use **Amazon EFS** or **Amazon FSx** to store container data.
- **Communication Between Tasks**:
  - Integrate tasks using services like:
    - **Amazon SQS**: Message queues.
    - **Amazon Kinesis Data Stream**: Stream processing.
    - Other AWS integration services.
- **Scaling**:
  - Use **Amazon ECS Service Auto Scaling** to dynamically adjust the number of ECS tasks based on demand.

### ECS Container Instance Role #card

- **Purpose**: Enables the Amazon ECS container agent running on container instances to call ECS API actions on your behalf.
- **Key Features**:
  - Required for ECS clusters using EC2 launch types.
  - Attaches the `ecsInstanceRole` IAM policy to container instances.
- **Use Case**: Grants the container agent permissions to manage ECS resources such as registering and deregistering tasks.

### ECS Task Execution Role #card

- **Purpose**: Provides permissions for tasks to perform actions required during execution.
- **Key Features**:
  - Allows tasks to:
    - Pull Docker images from Amazon ECR.
    - Publish container logs to Amazon CloudWatch.
  - Defined within the **task definition**.
- **Use Case**: Ensures tasks can operate smoothly by accessing necessary AWS services like ECR and CloudWatch.

### ECS Task Role #card

- **Purpose**: Grants permissions to containers running within ECS tasks to make API calls to AWS services.
- **Key Features**:
  - Assigned on a per-task basis.
  - Optional but useful for tasks needing specific API permissions (e.g., accessing an S3 bucket or DynamoDB table).
  - Requires IAM users to have `iam:PassRole` permissions to assign task roles.
- **Use Case**: Enables containers in a task to interact with authorized AWS services independently.

**ECS Workflow Key Steps**

1. **Create an ECS Cluster**:
   - Define:
     - Underlying infrastructure (on-demand or spot instances).
     - Instance configurations (AMI, type, size, volumes, key pair).
     - Cluster network and container instance role.

2. **Define a Task Definition**:
   - Specify parameters such as:
     - Docker image for containers.
     - CPU and memory allocation.
     - Launch type (EC2 or Fargate).
     - Docker networking mode (bridge, host, `awsvpc`, or none).
     - Logging configuration.
     - Task execution role.

3. **Assign Roles as Needed**:
   - **Container Instance Role**: For ECS agent API calls.
   - **Task Execution Role**: For pulling images and publishing logs.
   - **Task Role**: For granting API permissions to the containers themselves.

### ECS Network Mode Comparison #card


Amazon ECS supports **EC2** and **Fargate** launch types, allowing you to manage your containers and define configurations like networking mode in the ECS Task Definition. ECS supports four networking modes: **Bridge**, **Host**, **awsvpc**, and **None**, each suited for different use cases.

### Bridge Network Mode (Default) #card

- **Description**: Default mode for Linux containers (or NAT for Windows containers).
- **Key Features**:
  - Uses Docker's built-in virtual network within each container.
  - Containers on the same bridge network can communicate with each other.
  - Provides isolation from containers on different bridge networks.
  - Allows dynamic host port mappings (e.g., multiple containers using port 80 mapped to unique host ports).
- **Performance**:
  - Networking is virtualized, which may result in reduced performance compared to other modes.
- **Use Case**:
  - Useful for scenarios requiring port mapping or container isolation via Docker's internal network.

![[bridge-network-mode.png]]
### Host Network Mode #card

- **Description**: Maps container ports directly to the EC2 instance's network interface.
- **Key Features**:
  - Containers share the same IP address as the host EC2 instance.
  - Port conflicts occur if multiple containers use the same port.
- **Performance**:
  - Faster than Bridge mode as it bypasses Docker's virtual network and uses the EC2 network stack directly.
- **Use Case**:
  - Ideal for high-performance networking requirements where port conflicts are not an issue.

![[host-network-mode.png]]

### awsvpc Mode #card

- **Description**: Assigns an Elastic Network Interface (ENI) to each task.
- **Key Features**:
  - Each task gets its own ENI and IP address from the VPC subnet.
  - Offers isolation and better network performance as tasks act like independent EC2 instances within the VPC.
  - Recommended for ECS clusters with multiple tasks and containers.
  - The only network mode supported by **ECS Fargate**.
- **Performance**:
  - Faster than Bridge mode, using the EC2 network stack.
- **Use Case**:
  - Best for large-scale container deployments or when using ECS Fargate.

![[aws-vpc-mode.png]]

### None Network Mode #card

- **Description**: Disables the networking stack inside ECS tasks.
- **Key Features**:
  - Only the loopback interface is present inside the container.
  - No external connectivity; port mappings cannot be specified.
  - Containers are accessible only from the EC2 host using Docker commands.
- **Use Case**:
  - Suitable for scenarios
  
![[none-network-mode.png]]
## ECS Task Placement Strategies #card

- **Task Placement Strategy**: An algorithm used to select instances for task placement or tasks for termination.
  - Placement is determined based on requirements from the task definition (e.g., CPU, memory).
- **Task Placement Constraint**: A rule applied during task placement to meet specific conditions.
  - Examples:
    - Place tasks in a specific **Availability Zone** or on a particular **instance type**.
    - Use **attributes** (name/value pairs) on container instances to guide placement.

### ECS Task Placement Strategy Types #card

**Binpack**

- **Description**: Places tasks based on the least available CPU or memory.
- **Purpose**: Minimizes the number of instances used, optimizing cost-efficiency.
- **Example**:
  - For tasks on `c5.2xlarge` instances with high CPU usage but low memory usage, Binpack places tasks on instances with unused memory before launching new instances.

![[ecs-task-binpack.png]]

**Random**
- **Description**: Places tasks randomly across the cluster.
- **Purpose**: Used when placement or termination order does not matter.

![[ecs-task-random.png]]

**Spread**
- **Description**: Places tasks evenly across specified values.
- **Accepted Values**: Attribute key-value pairs, `instanceId`, or `host`.
- **Purpose**: Ensures high availability by distributing tasks across instances or Availability Zones.
- **Default for Services**: Spreads tasks across multiple Availability Zones and instances.

![[ecs-task-spread.png]]

### What is the ECS Default Task Placement Behaviour? #card

- **Fargate Tasks**: Automatically spread across Availability Zones.
- **EC2 Launch Type**:
  - **RunTask API Action**: Tasks are placed randomly in the cluster.
  - **CreateService API Action**: Tasks are spread across Availability Zones and instances within the zones.

### ECS Combination of Strategies #card

Multiple strategies can be combined to meet application needs.

### ECS Best Effort means what? #card

**Best Effort**: Task placement strategies work on a best-effort basis, aiming to optimise placement but not guaranteeing perfect results.

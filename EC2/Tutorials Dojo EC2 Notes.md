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

## What are the different instance purchasing options for EC2? #card 

1. **On-Demand instances**
2. **Savings Plans**
3. **Reserved Instances (RI)**
4. **Spot instances**
5. **Dedicated hosts**
6. **Dedicated instances**

### On-Demand Instances #card

- **Description**: You pay by the hour or the second for each running instance.
- **Details**:
  - No charges are incurred if instances are in a stopped state.
  - No long-term commitments.

### Savings Plans #card

- **Description**: Receive discounts on EC2 costs by committing to a consistent amount of usage (in USD per hour) for a term of 1 or 3 years.
- **Payment Options**:
  - Higher discounts are available with partial or full upfront payments.
- **Types of Savings Plans**:
  - **Compute Savings Plans**:
    - Offer the most flexibility.
    - Discounts automatically apply regardless of instance family, size, Availability Zone (AZ), region, OS, or tenancy.
    - Also applies to **Fargate** and **Lambda** usage.
  - **EC2 Instance Savings Plans**:
    - Provide the lowest prices but require commitment to specific instance families within a region.
    - Discounts apply to the selected instance family in a region, regardless of AZ, size, OS, or tenancy.
    - Allows free modification of instance sizes within the instance family in that region without losing the discount.

### Reserved Instances (RI) #card

- **Description**: Similar to Savings Plans but less flexible since you commit to a consistent instance configuration (including instance type and Region) for a term of 1 or 3 years. Payment options include partial upfront or full upfront for higher discount rates.
- **Attributes that determine price**:
  1. Instance type
  2. Region
  3. Tenancy - shared (default) or single-tenant (dedicated) hardware
  4. Platform or OS
- **Application**: Reserved Instances are automatically applied to running On-Demand Instances if the specifications match.
- **Benefits**:
  - Unused Standard Reserved Instances can be sold in the AWS Marketplace.
- **Types of Reserved Instances**:
  - **Standard RIs**: Provide the most significant discount rates, ideal for steady-state usage.
  - **Convertible RIs**: Offer a discount and the flexibility to change attributes of the RI as long as the resulting RI is of equal or greater value.
  - **Scheduled RIs**: Allow capacity reservation for predictable recurring schedules (e.g., a fraction of a day, week, or month).

### Spot Instances #card

- **Description**: Unused EC2 instances available at significantly reduced costs.
- **Pricing**:
  - The hourly price, called the *Spot price*, is determined by Amazon EC2 and adjusts based on the long-term supply and demand for Spot Instances.
- **Operation**:
  - Your Spot Instance runs when capacity is available, and your maximum price per hour exceeds the Spot price.
  - If the Spot price exceeds your specified price, your Spot Instance will be stopped or terminated after a two-minute warning.
- **Use Case**: Suitable for workloads that can be interrupted.

### Dedicated Hosts #card

- **Description**: You pay for a physical host fully dedicated to running your instances.
- **Benefits**:
  - Allows the use of existing per-socket, per-core, or per-VM software licenses to reduce costs.
  - Supports multiple instance sizes on the same Dedicated Host for the following instance families: `c5`, `m5`, `r5`, `c5n`, `i5n`, and `m5n`.
  - Offers upfront payment options for higher discounts.

### Dedicated Instances #card

- **Description**: Pay by the hour for instances running on single-tenant hardware.
- **Benefits**:
  - Provides physical isolation at the hardware level for instances that belong to different AWS accounts.
  - Ensures that only your compute nodes run on single-tenant hardware.

## Comparing EC2 Health Checks

### EC2 Instance Health Check #card

- **Description**: Amazon EC2 automatically performs health checks on every running instance to identify hardware and software issues.
- **Key Features**:
  - Status checks are performed every minute, returning a pass or fail status:
    - **OK**: All checks pass.
    - **Impaired**: One or more checks fail.
  - Status checks cannot be disabled or deleted.
  - You can create or delete alarms triggered by status check results.
- **Types of Status Checks**:
  - **System Status Checks**:
    - Detect underlying problems requiring AWS involvement.
    - Options: Wait for AWS to fix the issue or resolve it yourself.
  - **Instance Status Checks**:
    - Monitor the software and network configuration of the instance.
    - Performed by sending an ARP request to the ENI.
    - Detect problems requiring user intervention.

### Elastic Load Balancer (ELB) Health Check #card

- **Description**: The load balancer periodically checks the availability of registered EC2 instances using pings, connection attempts, or requests.
- **Key Features**:
  - **Instance Status**:
    - **InService**: Instance is healthy.
    - **OutOfService**: Instance is unhealthy.
  - **Health Check Configuration**:
    - Port and protocol (HTTP, HTTPS, TCP, SSL).
      - HTTP/HTTPS: Requires a 200 response code within the health check interval.
      - TCP: Requires a successful connection.
      - SSL: Requires a successful handshake.
    - Ping path.
    - WebSockets are not supported.
  - Load balancer only routes requests to healthy instances.
  - **Network Load Balancers**:
    - Use active and passive health checks.
      - **Active Health Checks**: Periodic requests to targets.
      - **Passive Health Checks**: Observes responses to detect unhealthy targets early (cannot be disabled or configured).
  - **Gateway Load Balancers**:
    - Support HTTP, HTTPS, and TCP protocols (default: TCP).

### Auto Scaling and Custom Health Checks #card

- **Description**: Monitors instance health within an Auto Scaling group, replacing unhealthy instances as needed.
- **Key Features**:
  - All instances start in a healthy state unless flagged as unhealthy by:
    - Amazon EC2 (default).
    - Elastic Load Balancing.
    - Custom health checks.
  - **Unhealthy Instances**:
    - Replaced if marked unhealthy by Auto Scaling.
    - To prevent replacement, suspend health check processes for the group.
  - **Health Check Grace Period**:
    - Starts after lifecycle hook actions are completed and the instance enters the InService state.
    - Ensure it covers your application’s startup time.
  - If an instance is not running or system status is impaired, it is marked unhealthy and replaced.
  - **Custom Health Checks**:
    - You can send health information directly to Auto Scaling for custom logic.

## EC2 Placement Groups

### Cluster Placement Group #card
- **Description**: Instances are placed close together within an Availability Zone.
- **Key Features**:
  - Can span peered VPCs within the same AWS Region.
  - Enables low-latency and high-throughput network performance.
- **Use Case**: Suitable for workloads requiring tight network performance, such as HPC (High-Performance Computing) applications.

### Partition Placement Group #card

- **Description**: Instances are spread across logical partitions, ensuring no shared underlying hardware between partitions.
- **Key Features**:
  - Partitions can span multiple Availability Zones in the same Region.
  - Maximum of seven partitions per Availability Zone.
  - Reduces the likelihood of correlated hardware failures.
- **Use Case**: Ideal for large distributed and replicated workloads, such as Hadoop or Cassandra.

### Spread Placement Group #card

- **Description**: Instances are placed across distinct hardware racks to reduce correlated failures.
- **Key Features**:
  - Each rack has independent network and power sources.
  - Can span multiple Availability Zones in the same Region.
  - Maximum of seven running EC2 instances per AZ per group.
- **Use Case**: Best for critical applications requiring isolation from failures, such as small databases or replicated systems.

### EC2 Placement Group Limitations and Notes #card

- **Capacity Issues**:
  - Adding instances to a placement group or launching multiple instance types may result in an insufficient capacity error.
  - Stopped instances retain their placement group but might fail to start if capacity is insufficient.
  - Solution: Retry the launch until successful.
- **Merging**:
  - Placement groups cannot be merged.

## Security Groups and Network ACLs

### Security Groups #card

- **Description**: Operate on the instance layer as virtual firewalls to control inbound and outbound traffic to your VPC resources.
- **Key Features**:
  - Applied to instances and other server-related AWS resources.
  - Not all AWS services support security groups, but they are commonly used with services involving servers or EC2 instances.
- **Examples of Services That Support Security Groups**:
  1. Amazon EC2
  2. AWS Elastic Beanstalk
  3. Amazon Elastic Load Balancing
  4. Amazon RDS
  5. Amazon EFS
  6. Amazon EMR
  7. Amazon Redshift
  8. Amazon ElastiCache

One thing to remember is, when you are adding rules to allow communication between two VPC instances, **you should enter the private IP address of those instances** and not their public IP or Elastic IP address.

![[security-group.png]]
### Network ACLs (NACLs) #card

- **Description**: Operate on the subnet layer, protecting entire subnets rather than individual instances.
- **Key Features**:
  - Traffic is managed using rules, each consisting of:
    - Rule number
    - Traffic type
    - Protocol
    - Port range
    - Source (inbound) or destination (outbound)
    - Allow or deny setting
  - **Rule Evaluation**:
    - Rules are evaluated in ascending order based on rule numbers.
    - The first matching rule is applied, regardless of subsequent conflicting rules.
  - **Allow and Deny Rules**:
    - Unlike security groups, NACLs support both allow and deny rules.
    - Example: Allow HTTP access for all (`0.0.0.0/0`) but deny specific malicious IPs.
  - **Default Deny**:
    - If no rule matches, the traffic is automatically denied.

- **Stateless**:
  - Both inbound and outbound rules must explicitly allow traffic for communication to succeed.

- **Default and Custom NACLs**:
  - Every VPC includes a default NACL that allows all inbound and outbound traffic.
  - Custom NACLs deny all traffic by default until rules are added.
  - Subnet Association:
    - Each subnet must be associated with one NACL.
    - A NACL can be associated with multiple subnets, but each subnet can only have one NACL.

- **Ephemeral Ports**:
  - For subnets handling public network connections, ensure ephemeral ports are allowed.
  - Example: A NAT gateway uses ports `1024-65535`.

- **Use Case Example**:
  - Allow HTTP access for public users but block specific malicious IPs using both allow and deny rules.

![[nacl-inbound.png]]
![[nacl-outbound.png]]

## EC2 Auto Scaling

### Amazon EC2 Auto Scaling Overview #card

- **Description**: Helps ensure the right number of EC2 instances are available to handle application load through horizontal scaling (scaling out or scaling in).
- **Key Features**:
  - Dynamically launches or terminates EC2 instances.
  - Organises EC2 instances into logical units called **Auto Scaling Groups**.

### EC2 Auto Scaling Components #card

1. **Auto Scaling Group**:
   - A logical unit for scaling and management.
   - Requires the following settings:
     - **Minimum** number of instances.
     - **Maximum** number of instances.
     - **Desired** number of instances.
   
2. **Configuration Templates**:
   - Used to define how new EC2 instances are launched and configured.
   - Two types:
     - **Launch Templates** (recommended): Support advanced features and customisation.
     - **Launch Configurations**: Offer limited features.
   - Contains:
     - AMI ID
     - Instance type
     - Key pair
     - Security groups
     - Block device mapping, etc.

3. **Scaling Options**:
   - Configures scaling behavior:
     - **Dynamic Scaling**: Based on conditions like CPU utilisation.
     - **Predictive Scaling**: Anticipates future needs.
     - **Scheduled Scaling**: Based on specific dates and times.

### EC2 ASG: Instance Warm-Up and Cool Down #card

1. **Instance Warm-Up**:
   - The time required to prepare new instances for live traffic.
   - Includes:
     - Fetching the AMI.
     - Configuring the instance.
     - Running user data and installing custom applications.

2. **Cool Down**:
   - The interval (in seconds) between two scaling actions.
   - Prevents conflicts such as simultaneous scaling in and scaling out.
   - Ensures scaling activities do not overlap.

### EC2 ASG: Termination Policies #card

- Control which instances are terminated first during a scale-in event.
- Examples of termination priorities:
  - Oldest launch template or configuration.
  - Closest to billing hour expiration.
  - Least loaded AZ.

### EC2 ASG: Lifecycle Hooks #card

- **Description**: Allow specific actions to be taken during scale-in or scale-out events.
- **Capabilities**:
  - Suspend or resume scaling processes.
  - Perform tasks before instances transition to the next state.
  - Example actions:
    - Sending application logs.
    - Performing system health checks.
    - Executing custom scripts.
- **Use Case**: Adds flexibility and control over the scaling process.

## Components of an EC2 Autoscaling Group

### Launch Configuration #card

- **Description**: A template for launching EC2 instances within an Auto Scaling group, similar to manually launching an EC2 instance.
- **Key Features**:
  - Uniquely identified by a name.
  - Includes settings such as:
    - **AMI**: Specifies the Amazon Machine Image to launch instances.
    - **Instance Type and Size**: Defines the type and size of EC2 instances.
    - **Purchase Option**: Choose between Spot Instances or standard On-Demand Instances.
    - **Instance Profile**: Grants permissions to interact with other AWS services.
- **Limitations**:
  - Does not support versioning.
  - Limited to a single instance type and purchase option per configuration.

### Launch Template #card

- **Description**: An advanced alternative to launch configurations with added flexibility and features.
- **Key Features**:
  - Supports **multiple versions** of the template.
  - Allows Auto Scaling Groups to:
    - Use **multiple instance types**.
    - Combine **purchase options** (e.g., Spot and On-Demand Instances).
- **Advantages Over Launch Configurations**:
  - Greater customisation and scalability.
  - Recommended for modern deployments.

## Types of EC2 Auto Scaling Policies

### Simple Scaling #card

- **Description**: Relies on a metric as the basis for scaling actions.
- **How It Works**:
  - CloudWatch alarms trigger scaling based on thresholds.
  - Example:
    - **Scale Out**: Add 20% more capacity when CPU utilization exceeds 80%.
    - **Scale In**: Reduce 20% of capacity when CPU utilization drops below 30%.
- **Limitations**:
  - Provides no fine-grained control over scaling actions.
  - Must wait for health checks and cooldowns before responding to additional alarms.
- **Historical Context**: The original scaling policy supported by EC2 Auto Scaling.

### Target Tracking #card

- **Description**: Automatically maintains a scaling metric at a specified target value.
- **How It Works**:
  - Define a **scaling metric** and **metric value** (e.g., maintain average CPU utilization at 80%).
  - CloudWatch adjusts capacity to keep the metric within the target range:
    - **Scale Out**: Increases capacity when metric exceeds the target.
    - **Scale In**: Reduces capacity when metric falls below the target.
- **Key Features**:
  - Proportional scaling based on the metric value.
  - AWS predefined metrics include:
    - `ASGAverageCPUUtilization`
    - `ASGAverageNetworkIn`
    - `ASGAverageNetworkOut`
    - `ALBRequestCountPerTarget` (for ALB target groups).
  - Supports custom CloudWatch metrics.
- **Limitations**:
  - Cannot scale out when the metric is below the target.
  - Scales out quickly but scales in gradually.

### Step Scaling #card

- **Description**: Enhances simple scaling by introducing "step adjustments."
- **How It Works**:
  - Applies multiple scaling actions based on the size of the alarm breach.
  - Example: Different actions for CPU utilization exceeding 80% vs. 90%.
- **Advantages Over Simple Scaling**:
  - Responds to additional alarms during scaling events without waiting for cooldowns.
  - Reduces delays in capacity increases during sudden traffic surges.

## EC2 Auto Scaling Lifecycle Hooks

### Auto Scaling Lifecycle Hooks #card

- **Description**: Allow custom actions to be performed during scale-out and scale-in events in an Auto Scaling Group (ASG).
- **Use Cases**:
  - **Scale-Out Event**: Ensure new EC2 instances are fully configured before accepting traffic, such as:
    - Downloading the latest codebase.
    - Completing user data scripts.
    - Passing load balancer health checks.
  - **Scale-In Event**: Delay termination to allow actions like:
    - Uploading data logs to S3.
    - Finalizing critical operations.

![[asg-process.png]]
### Lifecycle Hook Process #card

1. **Scale-Out Event**:
   - Auto Scaling group provisions a new EC2 instance.
   - Instance enters `Pending:Wait` state, pausing the launch process.
     - Actions can be performed, such as downloading packages or running scripts.
     - Use the `CompleteLifecycleAction` operation to transition the instance to the next state, or wait for the default timeout (3600 seconds).
   - Instance transitions to the `InService` state:
     - If a load balancer is configured, the instance is added as a target and health checks begin.
     - Once health checks pass, the instance starts receiving traffic.

2. **Scale-In Event**:
   - Auto Scaling group begins terminating an instance.
   - Instance is removed from the load balancer targets and enters `Terminating:Wait` state.
     - Actions can be performed, such as uploading data to S3 or running cleanup scripts.
     - After the timeout, the instance transitions to the termination state.
   - Instance termination is completed by the Auto Scaling group.

### Additional ASG Lifecycle Hook Features #card

- **CloudWatch Events (Amazon EventBridge)**:
  - Captures scaling actions during the paused state.
  - Define targets, such as invoking a Lambda function, to perform pre-configured tasks.

- **Notification Targets**:
  - Configure lifecycle hooks to send messages when scaling events occur.

- **Timeouts**:
  - Default wait time is 3600 seconds, adjustable per lifecycle hook.
  - Ensures sufficient time for custom tasks or configurations during scaling events.

### Suspending and Resuming Scaling Processes #card

- **Description**: Amazon EC2 Auto Scaling provides process types that can be suspended or resumed based on your requirements, such as troubleshooting scaling events or avoiding disruptions to system performance.

### What are the primary ASG Process Types? #card

- **Primary Process Types**:
  - **Launch**: Adds a new EC2 instance to the Auto Scaling group.
  - **Terminate**: Removes an EC2 instance from the Auto Scaling group.

### Other ASG Process Types #card

1. **AddToLoadBalancer**:
   - Adds instances to the attached load balancer or target group when they are launched.

2. **AlarmNotification**:
   - Processes notifications from CloudWatch alarms associated with the group's scaling policies.

3. **AZRebalance**:
   - Ensures instances are evenly distributed across specified Availability Zones when the group becomes unbalanced.

4. **HealthCheck**:
   - Monitors instance health and marks instances as unhealthy when notified by EC2 or Elastic Load Balancing.

5. **ReplaceUnhealthy**:
   - Terminates unhealthy instances and launches new instances to replace them.

6. **ScheduledActions**:
   - Executes scheduled scaling actions, including those created by predictive scaling.

### Use Cases for Suspension and Resumption #card

- **When to Suspend**:
  - Troubleshooting a scaling event.
  - Preventing disruptions or performance impacts during maintenance.
- **Considerations**:
  - Suspending a primary process type (Launch or Terminate) may affect the functioning of related process types.

### Limitations of Amazon EC2 Auto Scaling Groups #card

- **Regional Scope**:
  - Auto Scaling Groups are regional services and do not span multiple AWS Regions.
  - **Solution for Multi-Region Scaling**:
    - Use separate Auto Scaling Groups in each Region.
    - Recreate launch configurations and templates in the desired target Region.

- **Multi-AZ Support**:
  - Auto Scaling Groups can span multiple Availability Zones to achieve high availability and fault tolerance.

- **Cluster Placement Groups**:
  - Cannot be used with Auto Scaling Groups that span multiple Availability Zones, as cluster placement groups are restricted to a single Availability Zone.

- **Launch Configurations and Templates**:
  - Exist only within the Region where they were created.
  - To use them in another Region, they must be recreated in the target Region.

### References

- [AWS EC2 Instance Types Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html)
- [Amazon Elastic Compute Cloud (Amazon EC2) Tutorials Dojo](https://tutorialsdojo.com/amazon-elastic-compute-cloud-amazon-ec2/)

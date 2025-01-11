---
cards-deck: AWS Exams::Solutions Architect::Associate::Practice Exams::Udemy 1
---
> This note set only contains some explanations of answers, and is not a direct representations of the exam. It mainly covers things that I wish to review.

## Attempt 1 - Weak points

- AWS Global Accelerator
- RDS specifics
	- Learn more about Global Aurora clusters.
	- How does failover election work i.e. understand priority tiers, election within tiers.
	- Read up on Amazon RDS for Oracle and Amazon RDS Custom for Oracle.
- EC2 instance types and their differences
	- Understand that spot blocks can only run for up to 6 hours. AWS has also stopped offering this. Learn spot blocks vs spot instances more.
	- Re-learn the mnemonic for the different EC2 instance types.
	- Understand the difference between creating an AMI, creating a snapshot and running instances from the snapshot.
	- Learn about auto-scaling for ECS instance states (i.e. `Standby`) and learn about process types (like `ReplaceUnhealthy`)
- EFS vs EBS vs FSx etc, instance stores
- Cost specifics for storage alternatives (S3 vs EBS vs EFS)
- S3 tier comparisons
	- Learn minimum time storage requirements.
	- Learn about protection of objects more (not just versioning, but understand you can do MFA for object deletion, etc)
	- Learn more on S3 transfer acceleration and any costs that may be involved (you only pay for what is accelerated).
- What is FSx for Lustre vs Amazon FSx for Windows File Server.
- Snow family
	- Edge Storage Optimised devices + AWS Site-to-Site VPN
- VPN -- learn more.
- Understand the term "masking an instance failure" -- I think it just means redistributing traffic away from a failed instance, but it threw me. Was thinking about masking bits or something.
- Amazon WAF
	- Learn about blocking countries using it.
- Read up on what AWS GuardDuty does.
- AWS Kinesis Firehose
	- Read up on destinations https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html (note that DynamoDB is not one of them)
- Review API Gateway, mainly destinations that I am unfamiliar with.

### S3 Specifics

Use the comparison chart to see differences between the tiers:

![[s3-comparison.png]]

Some extra caveats:

* * S3 Intelligent-Tiering charges a small monitoring and automation charge, and has a minimum eligible object size of 128KB for auto-tiering. Smaller objects may be stored, but will always be charged at the Frequent Access tier rates, and are not charged the monitoring and automation charge. See the [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/) for more information. Standard retrievals in archive access tier and deep archive access tier are free. Using the S3 console, you can pay for expedited retrievals if you need faster access to your data from the archive access tiers. S3 Intelligent-Tiering first byte latency for frequent and infrequent access tier is milliseconds access time, and the archive access and deep archive access tiers first byte latency is minutes or hours.
- ** In the unlikely case of the loss or damage to all or part of an AWS Availability Zone, data in a One Zone storage class may be lost. For example, events like fire and water damage could result in data loss. Apart from these types of events, our One Zone storage classes use similar engineering designs as our Regional storage classes to protect objects from independent disk, host, and rack-level failures, and each are designed to deliver 99.999999999% data durability.

- *** S3 Glacier Flexible Retrieval and S3 Glacier Deep Archive require 40 KB of additional metadata for each archived object. This includes 32 KB of metadata charged at the S3 Glacier Flexible Retrieval rate required to identify and retrieve your data. And, an additional 8 KB data charged at the S3 Standard rate which is required to maintain the user-defined name and metadata for objects archived to S3 Glacier Flexible Retrieval.

#### Explain the differences and use cases for different S3 storage tiers? #card

![[s3-comparison.png]]
## Focus questions

The following are a list of questions that I had trouble with that should have some better understanding.

### When setting retention periods for S3 bucket object versions, what should you know? #card 

**When you apply a retention period to an object version explicitly, you specify a Retain Until Date for the object version.**

You can place a retention period on an object version either explicitly or through a bucket default setting. When you apply a retention period to an object version explicitly, you specify a `Retain Until Date` for the object version. Amazon S3 stores the Retain Until Date setting in the object version's metadata and protects the object version until the retention period expires.

**Like all other Object Lock settings, retention periods apply to individual object versions. Different versions of a single object can have different retention modes and periods.**

For example, suppose that you have an object that is 15 days into a 30-day retention period, and you PUT an object into Amazon S3 with the same name and a 60-day retention period. In this case, your PUT succeeds, and Amazon S3 creates a new version of the object with a 60-day retention period. The older version maintains its original retention period and becomes deletable in 15 days.

**Things to know:**

1. When you use bucket default settings, you don't specify a Retain Until Date. Instead, you specify a duration, in either days or years, for which every object version placed in the bucket should be protected.
2. You can place a retention period on an object version either explicitly or through a bucket default setting.
3. If your request to place an object version in a bucket contains an explicit retention mode and period, those settings override any bucket default settings for that object version.

### What is the MOST cost-optimal and resource-efficient solution to build a fleet of Amazon EC2 instances that must deliver high random I/O performance and have data replicated across the instances by the application itself? #card

**Use Instance Store based Amazon EC2 instances**

An instance store provides temporary block-level storage for your instance. This storage is located on disks that are physically attached to the host instance. Instance store is ideal for the temporary storage of information that changes frequently such as buffers, caches, scratch data, and other temporary content, or for data that is replicated across a fleet of instances, such as a load-balanced pool of web servers. Instance store volumes are included as part of the instance's usage cost.

As Instance Store based volumes provide high random I/O performance at low cost (as the storage is part of the instance's usage cost) and the resilient architecture can adjust for the loss of any instance, therefore you should use Instance Store based Amazon EC2 instances for this use-case.

![[instance-store-ec2-overview.png]]
[https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html)

### What is the most cost-efficient way to ingest data and slice it so that you only store parts of the data? #card 

**Ingest the data in Amazon Kinesis Data Firehose and use an intermediary AWS Lambda function to filter and transform the incoming stream before the output is dumped on Amazon S3**

Amazon Kinesis Data Firehose is the easiest way to load streaming data into data stores and analytics tools. It can capture, transform, and load streaming data into Amazon S3, Amazon Redshift, Amazon OpenSearch Service, and Splunk, enabling near real-time analytics with existing business intelligence tools and dashboards you’re already using today. It is a fully managed service that automatically scales to match the throughput of your data and requires no ongoing administration. It can also batch, compress, and encrypt the data before loading it, minimising the amount of storage used at the destination and increasing security.

![[firehose-overview.png]]

https://aws.amazon.com/kinesis/data-firehose/

**Other things to note:**

- It cannot be Kinesis Data Analytics as that cannot consume directly from a source.
- Kinesis Data Streams cannot output to S3.
- EMR would require managing the underlying infrastructure so it's also ruled out.

### What's the difference between the replication capabilities for Amazon RDS Multi-AZ deployment as well as Amazon RDS Read-replicas? #card

**Multi-AZ follows synchronous replication and spans at least two Availability Zones (AZs) within a single region. Read replicas follow asynchronous replication and can be within an Availability Zone (AZ), Cross-AZ, or Cross-Region**

Amazon RDS Multi-AZ deployments provide enhanced availability and durability for RDS database (DB) instances, making them a natural fit for production database workloads. When you provision a Multi-AZ DB Instance, Amazon RDS automatically creates a primary DB Instance and synchronously replicates the data to a standby instance in a different Availability Zone (AZ). Multi-AZ spans at least two Availability Zones (AZs) within a single region.

Amazon RDS Read Replicas provide enhanced performance and durability for RDS database (DB) instances. They make it easy to elastically scale out beyond the capacity constraints of a single DB instance for read-heavy database workloads. For the MySQL, MariaDB, PostgreSQL, Oracle, and SQL Server database engines, Amazon RDS creates a second DB instance using a snapshot of the source DB instance. It then uses the engines' native asynchronous replication to update the read replica whenever there is a change to the source DB instance.

Amazon RDS replicates all databases in the source DB instance. Read replicas can be within an Availability Zone (AZ), Cross-AZ, or Cross-Region.

[https://aws.amazon.com/rds/features/multi-az/](https://aws.amazon.com/rds/features/multi-az/)

### How you can you enable faster S3 bucket upload times across regions? #card 

**Use Amazon S3 Transfer Acceleration (Amazon S3TA) to enable faster file uploads into the destination S3 bucket**

Amazon S3 Transfer Acceleration enables fast, easy, and secure transfers of files over long distances between your client and an S3 bucket. Amazon S3TA takes advantage of Amazon CloudFront’s globally distributed edge locations. As the data arrives at an edge location, data is routed to Amazon S3 over an optimized network path.

**Use multipart uploads for faster file uploads into the destination Amazon S3 bucket**

Multipart upload allows you to upload a single object as a set of parts. Each part is a contiguous portion of the object's data. You can upload these object parts independently and in any order. If transmission of any part fails, you can retransmit that part without affecting other parts. After all parts of your object are uploaded, Amazon S3 assembles these parts and creates the object. In general, when your object size reaches 100 MB, you should consider using multipart uploads instead of uploading the object in a single operation. Multipart upload provides improved throughput, therefore it facilitates faster file uploads.

[https://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html)

[https://docs.aws.amazon.com/AmazonS3/latest/dev/uploadobjusingmpu.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/uploadobjusingmpu.html)

### How can I process SQS messages in order and at high rates? #card 

**Use Amazon SQS FIFO (First-In-First-Out) queue in batch mode of 4 messages per operation to process the messages at the peak rate**

Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications. SQS offers two types of message queues - Standard queues vs FIFO queues.

For FIFO queues, the order in which messages are sent and received is strictly preserved (i.e. First-In-First-Out). On the other hand, the standard SQS queues offer best-effort ordering. This means that occasionally, messages might be delivered in an order different from which they were sent.

By default, FIFO queues support up to 300 messages per second (300 send, receive, or delete operations per second). When you batch 10 messages per operation (maximum), FIFO queues can support up to 3,000 messages per second. Therefore you need to process 4 messages per operation so that the FIFO queue can support up to 1200 messages per second, which is well within the peak rate.

[https://aws.amazon.com/sqs/](https://aws.amazon.com/sqs/)

[https://aws.amazon.com/sqs/features/](https://aws.amazon.com/sqs/features/)

### What are some import req/s rates you should know for S3? #card 

Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance. Your applications can easily achieve thousands of transactions per second in request performance when uploading and retrieving storage from Amazon S3. Amazon S3 automatically scales to high request rates. For example, your application can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per prefix in a bucket.

There are no limits to the number of prefixes in a bucket. You can increase your read or write performance by parallelising reads. For example, if you create 10 prefixes in an Amazon S3 bucket to parallelise reads, you could scale your read performance to 55,000 read requests per second. Please see this example for more clarity on prefixes: if you have a file f1 stored in an S3 object path like so `s3://your_bucket_name/folder1/sub_folder_1/f1`, then `/folder1/sub_folder_1/` becomes the prefix for file f1.

Some data lake applications on Amazon S3 scan millions or billions of objects for queries that run over petabytes of data. These data lake applications achieve single-instance transfer rates that maximise the network interface used for their Amazon EC2 instance, which can be up to 100 Gb/s on a single instance. These applications then aggregate throughput across multiple instances to get multiple terabits per second. 

[https://docs.aws.amazon.com/AmazonS3/latest/dev/optimizing-performance.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/optimizing-performance.html)

### How can I remove all the data found by Amazon GuardDuty? #card 

Amazon GuardDuty offers threat detection that enables you to continuously monitor and protect your AWS accounts, workloads, and data stored in Amazon S3. GuardDuty analyses continuous streams of meta-data generated from your account and network activity found in AWS CloudTrail Events, Amazon VPC Flow Logs, and DNS Logs. It also uses integrated threat intelligence such as known malicious IP addresses, anomaly detection, and machine learning to identify threats more accurately.

**Disable the service in the general settings**

Disabling the service will delete all remaining data, including your findings and configurations before relinquishing the service permissions and resetting the service. So, this is the correct option for our use case.

[https://aws.amazon.com/guardduty/faqs/](https://aws.amazon.com/guardduty/faqs/)

### What service can process and store data quickly for both hot and cold data at low cost? #card 

Correct option:

**Amazon FSx for Lustre**

Amazon FSx for Lustre makes it easy and cost-effective to launch and run the world’s most popular high-performance file system. It is used for workloads such as machine learning, high-performance computing (HPC), video processing, and financial modeling. The open-source Lustre file system is designed for applications that require fast storage – where you want your storage to keep up with your compute. FSx for Lustre integrates with Amazon S3, making it easy to process data sets with the Lustre file system. When linked to an S3 bucket, an FSx for Lustre file system transparently presents S3 objects as files and allows you to write changed data back to S3.

FSx for Lustre provides the ability to both process the 'hot data' in a parallel and distributed fashion as well as easily store the 'cold data' on Amazon S3. Therefore this option is the BEST fit for the given problem statement.

Incorrect options:

**Amazon FSx for Windows File Server** - Amazon FSx for Windows File Server provides fully managed, highly reliable file storage that is accessible over the industry-standard Service Message Block (SMB) protocol. It is built on Windows Server, delivering a wide range of administrative features such as user quotas, end-user file restore, and Microsoft Active Directory (AD) integration. FSx for Windows does not allow you to present S3 objects as files and does not allow you to write changed data back to S3. Therefore you cannot reference the "cold data" with quick access for reads and updates at low cost. Hence this option is not correct.

**Amazon EMR** - Amazon EMR is the industry-leading cloud big data platform for processing vast amounts of data using open source tools such as Apache Spark, Apache Hive, Apache HBase, Apache Flink, Apache Hudi, and Presto. Amazon EMR uses Hadoop, an open-source framework, to distribute your data and processing across a resizable cluster of Amazon EC2 instances. EMR does not offer the same storage and processing speed as FSx for Lustre. So it is not the right fit for the given high-performance workflow scenario.

**AWS Glue** - AWS Glue is a fully managed extract, transform, and load (ETL) service that makes it easy for customers to prepare and load their data for analytics. AWS Glue job is meant to be used for batch ETL data processing. AWS Glue does not offer the same storage and processing speed as FSx for Lustre. So it is not the right fit for the given high-performance workflow scenario.

### How does Amazon RDS Aurora promote a read-replica in the instance of a failover? #card 

For Amazon Aurora, each Read Replica is associated with a priority tier (0-15). In the event of a failover, Amazon Aurora will promote the Read Replica that has the highest priority (the lowest numbered tier). If two or more Aurora Replicas share the same priority, then Amazon RDS promotes the replica that is largest in size. If two or more Aurora Replicas share the same priority and size, then Amazon Aurora promotes an arbitrary replica in the same promotion tier.

### A company has a web application that runs 24/7 in the production environment. The development team at the company runs a clone of the same application in the dev environment for up to 8 hours every day. The company wants to build the MOST cost-optimal solution by deploying these applications using the best-fit pricing options for Amazon Elastic Compute Cloud (Amazon EC2) instances. What would you recommend? #card

For the given use case, you can use Amazon EC2 Reserved Instances for the production application as it is run 24/7. This way you can get a 72% discount if you avail a 3-year term. You can use on-demand instances for the dev application since it is only used for up to 8 hours per day. On-demand offers the flexibility to only pay for the Amazon EC2 instance when it is being used (0 to 8 hours for the given use case).

Incorrect options:

**Use Amazon EC2 reserved instance (RI) for the production application and spot block instances for the dev application** - Spot blocks can only be used for a span of up to 6 hours, so this option does not meet the requirements of the given use case where the dev application can be up and running up to 8 hours. You should also note that AWS has stopped offering Spot blocks to new customers.

[https://aws.amazon.com/ec2/pricing/](https://aws.amazon.com/ec2/pricing/)
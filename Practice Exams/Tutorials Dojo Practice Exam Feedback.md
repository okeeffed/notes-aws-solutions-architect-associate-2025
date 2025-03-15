The following is a list of areas that I wish to improve upon based on how I've done for the review sets.

## High priority

### EC2 CloudWatch Agent vs Detailed Enhanced Monitoring

The [CloudWatch Agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) is installed onto instances to collect more detailed metrics.

There are no "enhanced metrics" in EC2. [According to the docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-basic-detailed.html):

_In different AWS services, detailed monitoring also has different names. For example, in Amazon EC2 it is called detailed monitoring, in AWS Elastic Beanstalk it is called enhanced monitoring, and in Amazon S3 it is called request metrics._

A [full list of CloudWatch-monitored services](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/aws-services-cloudwatch-metrics.html). For more details:

- [ECS Container Insights extras](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-metrics-ECS.html)

Other links:

- [Tutorials Dojo | CloudWatch](https://tutorialsdojo.com/amazon-cloudwatch/)


- Region limits:
	- vCPU-based On-Demand Instance limit per region
- EBS Encryption rules
- EBS Volume Types
- AWS Well Architected Tool
- AWS Trusted Advisor
- ENI limits within a subnet
- AWS Simple Workflow
- ECS auto-scaling keywords and metrics
- AWS GuardDuty and use cases
- FSx products, comparisons, key details, persistent/scratch
- EC2 lifecycle and billing
- Direct Connect features (like Gateway) and how it differs from the connection
- CloudFormation lifecycle and cfn-signal
- Refresher on route tables, analogy etc.
- Elastic Fabric Adapter (EFA) and other components that I don't know of
- Glacier retrieval options
- S3 Lifecycle restrictions
- RDS auto-scaling on different instances
- AWS Backup -- when to use it vs alternatives
- EC2 vCPU based limits (and other default account limits)
- VPC block sizes, prefix lists
- VPC gateway endpoints vs interface endpoints
- Important outbound IP addresses to remember
- AWS Compute Optimizer
- Lake Formation, Apache Ranger, blueprints
- AWS Proton crash course
- CloudTrail Lake
- Customer vs AWS managed KMS keys

### Lower priority

- Egress-only Internet Gateway vs Internet Gateway vs Network Address Translation Gateway
- NAT Gateway types
- DAX
- API Gateway caching
- SQS keywords and key metrics
- EC2 RI vs flexible RI for changing instance
- AWS Glue features
- Reader endpoint vs cluster endpoint
- Active-Active, Active-Passive etc
- What is Server Name Indication (SNI)?
- Origin access identity (OAI)
- Review snow family changes
- ASG Termination policies
- ALB sticky sessions
- AWS Transfer Family destionations
- Server access logging
- CloudFront geographic restrictions

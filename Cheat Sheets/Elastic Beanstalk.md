---
cards-deck: AWS Exams::Cheat Sheets::Elastic Beanstalk
---
# What is AWS Elastic Beanstalk (EB)? #card

Amazon Elastic Beanstalk (EB) is a Platform-as-a-Service (PaaS) that allows developers to quickly deploy and manage applications in the AWS Cloud without managing the underlying infrastructure.

---

## EB Features #card

- **Managed deployment:** Automatically handles capacity provisioning, load balancing, scaling, and monitoring.
- **Supports multiple languages:** Go, Java, .NET, Node.js, PHP, Python, Ruby.
- **Supports web containers:** Tomcat, Passenger, Puma.
- **Docker support:** Can run Docker containers.
- **Auto Scaling:** Load-balanced environments scale automatically.
- **Integrated monitoring:** Includes health checks and CloudWatch integration.
- **Custom domains:** Apps are available at `subdomain.region.elasticbeanstalk.com`.

---

## EB Workflow #card

1. Upload application code.
2. Elastic Beanstalk provisions and configures AWS resources.
3. Application is deployed and monitored.
4. Auto Scaling adjusts capacity as needed.

---

## EB Concepts

### Application #card
A logical collection of EB components, including environments, versions, and configurations.

### Application Version #card
A specific, labeled iteration of deployable code. Stored in Amazon S3.

### Environment #card
An isolated runtime that hosts an application version. It can be **Web Server** (handles HTTP requests) or **Worker** (processes background tasks).

### Environment Configuration #card
A collection of settings defining how an environment and its resources behave.

### Saved Configuration #card
A stored set of environment configurations used for deploying consistent setups.

### Platform #card
A combination of OS, language runtime, web/application server, and EB components.

### Environment Types #card
- **Load-balanced, Auto Scaling:** Scales based on demand.
- **Single-instance:** A single EC2 instance with an Elastic IP.

---

## EB Deployment Policies #card

- **All at once:** Deploys new version to all instances simultaneously.
- **Rolling:** Deploys in batches.
- **Rolling with additional batch:** Deploys new version in batches with extra instances.
- **Immutable:** Deploys to new set of instances before switching.
- **Traffic splitting:** Deploys to new instances and temporarily splits incoming traffic.

---

## EB Environment Pages

### Configuration #card
Shows provisioned resources and lets you modify settings.

### Health #card
Displays status and detailed health information for running EC2 instances.

### Monitoring #card
Shows environment statistics like latency and CPU utilization.

### Events #card
Displays logs from EB-related services.

### Tags #card
Shows key-value pairs applied to environment resources.

---

## EB Scaling & Load Balancing

### Auto Scaling #card
Automatically adjusts capacity based on demand. Can maintain a minimum number of instances.

### Load Balancing #card
Uses Elastic Load Balancer (ALB, NLB, CLB) to distribute traffic among instances.

### RDS Integration #card
Can create or connect to an existing Amazon RDS database (MySQL, PostgreSQL, Oracle, SQL Server).

### Environment Properties #card
Used to pass secrets, endpoints, and configuration variables to applications.

---

## EB Monitoring

### Health Reporting #card
Determines application health based on request responses.

### Enhanced Health Reporting #card
Provides additional environment insights and troubleshooting help.

### CloudWatch Metrics #card
Creates alarms and monitors environment changes.

### Logs #card
Collects EC2 instance logs for debugging.

---

## EB Security

### Service Role #card
Assumed by EB to use AWS services on your behalf.

### Instance Profile #card
Grants EC2 instances permissions to access AWS resources (e.g., S3, CloudWatch).

### User Policies #card
Define user permissions for creating and managing EB applications.

---

## EB Pricing #card

- **No additional cost** for Elastic Beanstalk itself.
- **Pay only for AWS resources** consumed by your application.

---

## References
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg)
- [AWS Elastic Beanstalk Pricing](https://aws.amazon.com/elasticbeanstalk/pricing/)
- [AWS Elastic Beanstalk FAQs](https://aws.amazon.com/elasticbeanstalk/faqs/)
---
cards-deck: AWS Exams::Solutions Architect::Associate::CloudWatch
---

## What is CloudWatch?

CloudWatch is a service which collects and manages operational data.

### The three main jobs of CloudWatch? #card

- **Metrics** - AWS Products, Apps, on-premises. Some of this will be out-of-the-box, while others may require the CloudWatch agent.
- **CloudWatch Logs** 
- **CloudWatch Events** - This can generates events like services and schedules.

![[cloud-watch-metrics.png]]

### What are CloudWatch Namespaces? #card

- A "container" for CloudWatch data.
- AWS/service e.g. AWS/EC2 - the namespace for default metrics for a service. Reserved for AWS.
- You can create a namespace to be whatever you want (with a few exceptions).

### What is a CloudWatch datapoint? #card

- A datapoint consists of a timestamp and a value, which is used to help measure a metric.
- A dimensions could be EC2 instances "A", "B" and "C". 
- Dimensions separate datapoints for different "things" or "perspectives" within the same metric. This could be things like instance name, instance id etc.

### What are CloudWatch alarms? #card

- Alarms are based of metrics and can either be OK or in an "ALARM" state. 
- In the ALARM state, we can take an action.

### What are CloudWatch Logs? #card 

- A **public service** available from AWS or on-prem.
- **Store, monitor and access** logging data.
- Can generate **metrics** based on logs - a **metric filter**.
	- These can be used to create alarms.
### How can we use CloudWatch Logs? #card 

- Many built-in integrations with AWS services.
	- Security for this provided through IAM.
- For anything that does not use it out of the box, we can use the AWS CloudWatch Agent.

### How are logs grouped? #card 

- A **log source** is, as the name implies, any source.
- **Log events** are individual events that come from a **log source**.
- **Log streams** are a collection of log events from any given log source.
	- This can change based on things such as new deployments, etc.
- **Log groups** are the collection of **log streams**.
- **Metric filters** create **metrics** which feeds into **alarms** from these events.

![[cloudwatch-logs.png]]
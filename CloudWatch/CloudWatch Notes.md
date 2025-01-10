---
cards-deck: AWS Exams::Solutions Architect::Associate::CloudWatch
---

## Raw Notes

CloudWatch collects and managers operational data.

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


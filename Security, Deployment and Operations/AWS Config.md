---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Config
---
## What is AWS Config? #card 

AWS Config is a service that enables you to assess, audit, and evaluate the configurations of your AWS resources.

- Record configuration changes over time on resources. Great for auditing of changes and compliance with standards.
	- It **does not prevent changes from happening**.
	- It is a regional service but supports cross-region and account aggregation.
- Can generate SNS notifications and near-realtime events via EventBridge & Lambda.
 ![[aws-config.png]]

https://aws.amazon.com/config/
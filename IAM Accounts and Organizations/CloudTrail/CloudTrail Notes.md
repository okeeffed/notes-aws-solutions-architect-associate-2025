---
cards-deck: AWS Exams::Solutions Architect::Associate::CloudTrail
---
## What is CloudTrail? #card

**CloudTrail** Is a product which logs API calls and account events.

It's very often used to diagnose security or performance issues, or to provide quality account level traceability.

It is enabled by default in AWS accounts and logs free information with a **90 day retention**.

It can be configured to store data indefinitely in S3 or CloudWatch Logs.

It is **not real-time**. This is important to know.

![[created-trail.png]]
### What are management events? #card

- Provide information about management operations that are performed on resources.
	- Also known as **control plane operations**.
- Only these are logged by default.

### What are data events? #card

- Data events contain that information about operations performed on or in AWS services.
- Not enabled by default.

### What are CloudTrail units? #card

- **Trails** are a unit of configuration within the CloudTrail product.
- Logs events for the region that it's created in.
- You can create one-region trail or all-region trail.
	- All-region trails are automatically added for new regions.
	- A small number of services are "global" e.g. IAM, STS, CloudFront (as opposed to regional) and log all events to **us-east-1**.

### Where can you store CloudTrail data? #card

- S3 buckets.
	- S3 isn't enabled by default for CloudTrail. This needs to configured via trails.
- CloudWatch logs.

You can put the data into both in order to get the benefit of both.

### What is an organizational trail? #card

If you create a trail from the management account of an organisation, you can aggregate and store all information from all AWS Organizations accounts.

## UI for creating a trail

![[create-trail-action.png]]![[enable-trail-for-all-accounts.png]]![[trail-config-3.png]]![[trail-config-4.png]]![[trail-config-5.png]]
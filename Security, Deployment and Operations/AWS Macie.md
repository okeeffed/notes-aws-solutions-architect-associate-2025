---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Macie
---
## What is AWS Macie? #card 

Amazon Macie discovers sensitive data using machine learning and pattern matching, provides visibility into data security risks, and enables automated protection against those risks.

- This protects the data added to S3 buckets.
- Automated discovery of PII, PHI, Finance.
- There are two data identifiers:
	- Managed: Built in ML/Patterns.
	- Custom: Proprietary, regex based.
- Integrates with security hub and "finding events" to EventBridge.
- Centrally managed either via AWS ORG or one Macie account explicitly inviting another.

![[macie-architecture.png]]
 
https://aws.amazon.com/macie/

---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Inspector
---
## What is Amazon Inspector? #card 

Amazon Inspector automatically discovers workloads, such as Amazon EC2 instances, containers, and Lambda functions, and scans them for software vulnerabilities and unintended network exposure.

- Scans EC2 instances and the instance OS.
- Also containers.
- Checks for vulnerabilities and deviations against best practice.
- Reports can be generated and order by priority at chosen internals.
- Two different assessments:
	- Network Assessment (agentless)
	- Network and Host Assessment (agent)
- Rules packages determine what is checked.
- Network reachability (no agent required).
- Check reachability end-to-end. 
	- #todo  Check what this means.
- Package check will check for CVEs.
- Center for Internet Security (CIS) benchmarks.
- **Security best practices** for Amazon Inspector.

https://aws.amazon.com/inspector/
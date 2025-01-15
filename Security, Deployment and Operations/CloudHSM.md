---
cards-deck: AWS Exams::Solutions Architect::Associate::CloudHSM
---
## What is CloudHSM? #card 

AWS CloudHSM lets you manage and access your keys on FIPS-validated hardware, protected with customer-owned, single-tenant HSM instances that run in your own Virtual Private Cloud (VPC).

https://aws.amazon.com/cloudhsm/

## What are the key differences with AWS KMS? #card

- AWS KMS is used for encryption within AWS, but it is also a **shared service**.
	- Managed by AWS. Behind the scenes uses a HSM.
	- KMS is **FIPS 140-2 L2 overall, L3 for some**.
	- Integrated with IAM.
	- KMS can use **CloudHSM** as a **custom key store**.
- AWS CloudHSM can be used for a true "Single Tenant" Hardware Security Module (HSM)
	- AWS provisioned, fully customer managed.
	- **Fully FIPS 140-2 Level 3**.
	- Integrated using industry standard APIs:
		- PCKS#11
		- Java Cryptography Extensions (JCE)
		- Microsoft CryptoNG (CNG) libraries

## What does CloudHSM look architecturally? #card 

- It uses the AWS CloudHSM VPC.
- Not HA by default. 
- A client needs to be installed for instances wanting to interact with CloudHSM.
- Only you have the ability to interact with the secure area of the HSM devices.
 
![[cloud-hsm.png]]

## What are some CloudHSM use cases? #card 

- No native AWS integration e.g. no S3 SSE.
- Offload the SSL/TLS processing for Web Servers. More efficient than on a general purpose EC2 instance.
- Enable Transparent Data Encryption (TDE) for Oracle Databases.
- Protect the Private Keys for an Issuing Certificate Authority (CA).
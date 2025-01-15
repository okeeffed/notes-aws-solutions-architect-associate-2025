---
cards-deck: AWS Exams::Solutions Architect::Associate::Transfer Family
---
## What is AWS Transfer Family? #card 

- Managed file transfer service - **supports transferring to or from S3 and EFS**.
- Provides managed "servers" which support protocols.
	- **File Transfer Protocol (FTP)** - Unencrypted file transfer
	- **File Transfer Protocol Secure (FTPS)** - File transfer with TLS encryption
	- **Secure Shell (SSH) File Transfer Protocol (SFTP)** - File transfer over SSH
	- **Applicability Statement 2 (AS2)** - Structured B2B Data
- Supports a number of identity providers:
	- Service managed, directory service, customer Lambda/APIGW.
	- Managed file transfer workflows (MFTW) - serverless file workflow engine.
- It is Multi-AZ
- Provisioned server per hour + data transferred
- FTP and FTPS - Directory service of Custom IDP only
- FTP - VPC only (cannot be public)
- AS2 VPC Internet/Internal only

![[transfer-family-architecture.png]]

https://aws.amazon.com/aws-transfer-family/
## What are the AWS Transfer Family endpoint types? #card 

- Public (over the public internet)
- VPC Internet
- VPC Internal

![[transfer-family-endpoint-types.png]]

https://repost.aws/knowledge-center/aws-sftp-endpoint-type
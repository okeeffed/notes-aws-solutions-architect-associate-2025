---
cards-deck: AWS Exams::Solutions Architect::Associate::Tutorials Dojo::AWS EFS
---
## What is AWS EFS? #card 

Amazon Elastic File System is a scalable shared file storage solution.

- It provides a POSIX-compliant shared file system that can be simultaneously accessed by multiple Linux EC2 instances across different AZs.
- Uses Network File System protocol or NFS. You hace to mount the EFS file system to Linux EC2 instances or your on-prem servers (just like regular network file share).
- Only support Linux servers and can't be used with Windows-based servers.

### What storage classes are available for AWS EFS? #card 

1. Standard: Best for active file system workflows
2. Infrequent: Cost-optimised for infrequently accessed files.

Similar to Amazon S3, you can also use a lifecycle policy to automatically move your data from the Standard class to the IA storage class.

### What is an EFS file system composed of? #card 

- Unique identifier
- Creation token
- Creation time
- File system size in bytes
- Number of mount targets created for the file system
- File system lifecycle state

### How to access your EFS from a Linux EC2 instance, ECS container or lambda function? #card 

Create mount targets in your VPC. When creating a mount target, you must indicate the AZ at which the mount target will be created and add security groups to control access to your file system.

After, you will be provided with an UP address and DNS name which you can use in your mount commands.

### What is the EFS Access Point? #aws

An access point applies to an OS user, group and file system path to any file system request made using the access point.

Access points ensure that an app always uses the correct OS identity and the correct directory when reading from or writing to the file system.

> Think of it like a directory where you requests are router to, which enforces specific access permissions similar to any Linux subdirectory.

### How to mount to an EFS system #card 

1. You can mount your target as is after you SSH into your instance using the mount command.
2. You can mount your target with a TLS parameter to enable encryption in-transit.
3. You can mount your target with IAM authorisation (instance profile or named profile).
4. You can specify an EFS access point in your mount parameters.

### How to copy data across regions with EFS? #card 

You will need the help of other AWS services.

- If the goal is to recreate an entire file system in another region. you can use **AWS Backup** to backup the EFS volume and copy the backup over.
	- This can backup any storage class, but restoring the backup happens to the general storage class.
- If the goal it to migrate or replicate data, then you can use AWS DataSync for that purpose.
	- One advantage of this is that you can copy data over on a private network.

### What is the EFS Storage Lifecycle? #card 

- It's not cheap.
- Use storage classes to help with pricing.
- Storage lifecycle policies can migrate data from general to IA.
	- Policy can be None, 7 days since last access, 14 days, 30 days, 60 days, 90 days.
- For IA, files must be at least 128KB in size.
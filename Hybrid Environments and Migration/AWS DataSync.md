---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS DataSync
---
## What is AWS DataSync? #card

A data transfer service to move data **INTO** or **OUT OF** AWS.

- DataSync is a process that manages the process AWS.
- Manages migrations, data processing transfers, archival/cost effective storage or disaster recovery.
- Design to work at huge scale.
- Keeps metadata (e.g. permissions/timestamps).
- Built-in data validation.

https://aws.amazon.com/datasync/
### What are the key features of AWS DataSync #card 

- Scalable: 10Gbps per agent (~100TB per day)
- Bandwidth limiters (avoid link saturation)
- Incremental and scheduled transfer options
- Compression and encryption
- Automatic recovery from transit errors
- Pay as you use (per GB cost for data moved)
- AWS Service integration: S3, EFS, FSx.

https://aws.amazon.com/datasync/

### AWS DataSync architecture #card 

- Be aware that the agent needs to be installed on-prem.
- It talks with NFS/SMB
- Destinations that it needs to integrate with
- Bidirectional, incremental transfer

![[datasync.png]]

### What are the DataSync components? #card 

- **Task**: A 'job' within DataSync. 
	- Defines what is being synced, how quickly, where from and where to.
- **Agent**: Software used to read/write to on-prem data stores using **NFS** or **SMB**.
- **Location**: Every task has two locations FROM and TO. e.g. Network File System (NFS), Server Message Block (SMB), Amazon EFS, Amazon FSx and Amazon S3.

## Exam tips

- If you need to use an electronic method, Snow family is out.
- Likely to be DataSync if:
	- If you need movement in and out.
	- If you need to support schedules, bandwidth throttling, retries, compression and cop with huge-scale transfers with AWS and file transfer protocols.
---
cards-deck: AWS Exams::Solutions Architect::Associate::Storage Gateway
---
## What is the AWS Storage Gateway? #card 

- Virtual machine or hardware appliance (rarely)
- Presents storage using **iSCSI, NFS** or **SMB**
- Integrates with **EBS**, **S3** and **Glacier** within AWS.
- Migrations into AWS, Extensions of data centres into AWS, Storage Tiering, DR
and replacement of backups systems.

For the exam, you will need to pick the correct mode to use for the storage gateway.

- https://aws.amazon.com/storagegateway

## What is the Volume Stored Storage Gateway #card

- A storage gateway VM normally is something running on premises with Network Attached Stores and local servers with their own local disks.
- Normally they will use the **iSCSI protocol** to represent these disks as blocks.

It works in two different modes:

1. Stored mode
2. Cached mode

 - https://aws.amazon.com/storagegateway/volume/
- https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html

### Volume Stored mode for Storage Gateway #card

When using Volume stored mode, everything is stored **locally** on premises on **local storage**.

It is then also stored onto the **upload buffer** which uploads the data through the **AWS Storage Gateway Endpoint onto EBS snapshots**.

- Great for **full-disk backups of servers**.
- Assists with disaster recovery - create EBS volumes in AWS.
- This mode **does not extend your data centre capacity**.

![[volume-stored-storage-gateway.png]]

Some key stats to know:

- 32 Volumes per gateway
- 16TB per volume
- 512TB per Gateway

You won't need to know these for the exam exactly.

- https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html

### Volume Cached mode for Storage Gateway #card

The architecture is still very similar to the stored mode, but the primary location for the storage of data in this mode is now AWS S3 (an AWS Storage Gateway managed area of S3, so it won't be visible through AWS S3).

Instead of **local storage**, the on-prem storage gateway has a **cache storage**.

You can still use this to create **EBS snapshots**.

This mode enables for an architecture known as **data center extension**. This is great for a future scenario of needing to migrate towards something like AWS. The storage "appears" to be on-prem, but is in fact on S3.

![[storage-gateway-volume-cached.png]]

In cached mode, a single gateway can handle:

- 32TB per volume
- 32 volumes per gateway
- 1PB per gateway

- https://aws.amazon.com/storagegateway/volume/
- https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html

## Similarities between volume stored/cached modes within Storage Gateway #card

- Both work with volumes. Raw block storage.
- Both provides AWS backups.
- Both allow you to make EBS snapshots.

- https://aws.amazon.com/storagegateway/volume/
- https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.

## What is Storage Gateway Tape VTL mode? #card

- VTL = Virtual Tape Library.
- On-prem, the storage gateway has an **upload buffer** and **local cache**.
- The VTL (backed by S3) and the tape shelf (VTS, backed by S3 glacier) are running in AWS which the storage gateway uses.
- A virtual tape is 100GiB to 5TiB.
	- 5TiB
- VTL can handle 1PB of data across 1500 virtual tapes.
	- When not used, they can be exported. This means physical ejection and moving of the tape.
	
![[storage-gateway-vtl.png]]

https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html

### What is a Tape? #card 

Most backups run in one of three ways:

1. Backup to tape.
2. Backup to disk.
3. Offsite backup to a remote facility over a network link.

- There are different types of tapes.
	- One is LTO: LTO-9 media can hold 24TB raw data.
		- Up to 60TB compressed.
	- 1 Tape Drive can use 1 tape at a time.
		- Writes to type are sequential and not random-access like other memory types.
		- Not easy to modify data stored on tape, you need to write over.
	- **Loaders** (robots) can swap tapes (also known as a media changer).
- A library is 1+ drive(s), , 1+ loader(s) and slots.
- There are a number of components:
	- Drive
	- Library
	- Shelf (anywhere that's not the library)

### How does traditional tape backup operate? #card

![[traditional-tape-backup.png]]

## What is Storage Gateway File mode? #card

- Feature-rich mode.
- Bridges on-premises file storage and S3.
- Mount Points (shares) available via NFS or SMB.
- Map directly onto an S3 bucket.
	- Files stored into a mount point, are visible as objects in an S3 bucket.
- **Read and Write Caching** ensure LAN-like performance.
- A bucket share = AWS S3 bucket.
- File gateway also supports lifecycle rules for changing the price of storage.

![[storage-gateway-file.png]]

## Explain multiple contributors and replication for the Storage File Gateway #card

- You can also have multi-on-prem configurations within multiple File Gateways.
- There is a feature called **NotifyWhenUploaded** using CloudWatch events to notify other gateways when objects are changes.
- File Gateway **does not support Object locking**. Use **read-only mode** only other shares or tightly control file access.
- We can introduce multi-region DR with object replication into another backup bucket.

![[storage-gateway-file-multi-contributors.png]]

## Exam tips

- For the exam, if you see volumes, tapes or files mentioned, then you should default to the specific mode.
	


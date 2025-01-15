---
cards-deck: AWS Exams::Solutions Architect::Associate::Snow Family
---
**Warning:** The course video may be out-of-date. Ensure to cross-check with the official AWS documentation.

Snowmobile is now discontinued, as well as Snowcone and previous gen Snowball devices. 

As far as I could see, only new-gen devices are available.
## What are the key concepts you need to know about the Snow Family devices? #card 

- Move large amounts of data IN and OUT of AWS
- Physical storage: suitcase or truck
- Ordered from AWS 
	- Can be empty, Load up, Return
	- Can come with data, empty & Return
- For the exam, know which option to use

## What is AWS Snowball? #card 

- Ordered AWS.
	- Log a job and the device is delivered (not instant).
- Data encryption uses KMS.
- 50TB or 80TB capacity
- 1 Gbps (RJ45 1GBase-TX) or 10Gbps (LR/SR) Network
- 10 TB to 10PB economical range (multiple devices)
- Multiple devices to multiple premises 
- Only storage, no compute capability

https://aws.amazon.com/snowball/

## What is AWS Snowball Edge? #card 

> The following looks to be outdated for what it can support now. See the link https://docs.aws.amazon.com/snowball/latest/developer-guide/device-differences.html#sbe-specifications

- Similar concept to Snowball, but comes with **storage** and **compute**.
- Larger capacity vs Snowball.
- 10 Gbps (RJ45), 10/25 (SFP), 45/50/100 Gbps (QSFP+)

There are three different types:

1. Storage optimised (with EC2) - 80 TB, 24 vCPU, 32 GiB RAM, 1 TB SSD
2. Compute optimised - 100 TB + 7.69 NVME, 52 vCPU and 208 GiB RAM
3. Compute with GPU - As above but with a GPU.

If you need to do any data processing on ingestion, use Edge.

https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html

## What is AWS Snowmobile? #card 

> Note: This is now discontinued!

- A portable data centre with a shipping container on a truck. Literally.
- Special order.
- Ideal for single location when 10+ PB is required.
- Up to 100PB per snowmobile.
- **Not economical** for multi-site or sub 10PB.

## Links

- https://tutorialsdojo.com/aws-snowball-edge/
- https://aws.amazon.com/blogs/storage/aws-snow-device-updates/
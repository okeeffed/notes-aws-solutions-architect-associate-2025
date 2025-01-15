---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS VPC Basics
---
## What is a VPC? #card 

- Create a virtual network in the cloud dedicated to your AWS account where you can launch AWS resources
- Amazon VPC is the networking layer of [Amazon EC2](https://tutorialsdojo.com/amazon-elastic-compute-cloud-amazon-ec2/)
- A VPC spans all the Availability Zones in the region. After creating a VPC, you can add one or more subnets in each Availability Zone.

**Key Concepts**

- A **virtual private cloud** (VPC) allows you to specify an IP address range for the VPC, add subnets, associate security groups, and configure route tables.
- A **subnet** is a range of IP addresses in your VPC. You can launch AWS resources into a specified subnet. Use a **public subnet** for resources that must be connected to the internet, and a **private subnet** for resources that won’t be connected to the internet.
- To protect the AWS resources in each subnet, use **security groups** and **network access control lists (ACLs)**.
- Expand your VPC by adding secondary IP ranges.

https://tutorialsdojo.com/amazon-vpc/

## VPC Sizing and Structure

### VPC Considerations #card

- What **size** should the VPC be?
- Are there any Networks **we can't use**?
- Be mindful of ranges that other VPCs, Cloud, On-Prem, Partners, Vendors use.
- Try to predict the future.
- VPC **structure**
	- Tiers & Resiliency (Availability) Zones
- VPC minimum **/28** (16 IPs)
- VPC maximum **/16** (65536 IPs)
- Avoid common ranges
- Reserve 2+ networks per region being used per account
- The preference is 10.x.y.z according to Cantrill

### An example of a global architecture implementing with considerations

![[global-vpc-architecture.png]]

Say we've identified the networks to avoid:

![[example-ip-ranges-to-avoid.png]]

So for the VPC, we would need to avoid why these network ranges cannot be used.

Also noticeably, the default VPC range is what **Azure** uses.

## VPC Sizing

- Ask how many **subnets** will you need?
- How many **IPs total**? How many **per subnet**?

![[vpc-sizing-chart.png]]

## VPC Structure

If we have a `/16` network and we want to add 16 subnets, then each subnet results in the `/20` range.

![[vpc-planning.png]]![[vpc-proposal.png]]

## What's an example of building a custom VPC? #card 

- VPCs are regionally-isolated and operates from all AZs in the region.
- Isolated network.
- Nothing IN or OUT without explicit configuration.
- Flexible configuration - single or multi-tier.
- Hybrid networking support - other cloud & on-prem.
- **Default** or **dedicated** tenancy.
	- If you pick **dedicated tenancy** at the VPC-level, you can only use **dedicated**.
- IPv4 Private CIDR Blocks & Public IPs
- 1 Primary Private IPv4 CIDR Block
	- Minimum `/28` (16 IP), max `/16` (65536 IPs).
- Optional secondary IPv4 blocks.
- Optional single **assigned** IPv6 `/56` CIDR block.

![[custom-vpc-design.png]]

- Please note that a **bastion** is frowned upon and not a good idea for connecting to a VPC.

### DNS in a VPC #card 

- Provided by Route53
- VPC `Base IP + 2` address
- `enableDnsHostnames` allows instances with assigned public IPs to have corresponding DNS hostnames in the `<region>.compute.amazonaws.com` domain.
- `enableDnsSupport` enables DNS resolution within the VPC, meaning your instances can resolve the DNS names of other instances.

## VPC Subnets #card
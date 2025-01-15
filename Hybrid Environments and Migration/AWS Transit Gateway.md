---
cards-deck: AWS Exams::Solutions Architect::Associate::Transit Gateway
---
## What is the AWS Transit Gateway? #card

- A **network transit hub** to connect VPCs to on premises networks.
- Significantly **reduces** network complexity
- Single network object - HA and Scalable
- Attachments to other network types
	- Valid attachments include: VPC, Site-to-Site VPN & Direct Connect Gateway

It solves the problem of complicated network setups for high availability.

![[wo-transit-gateway.png]]

With the transit gateway:

![[transit-gateway.png]]

https://aws.amazon.com/transit-gateway/

## What are some considerations with the Transit Gateway? #card 

- Supports **transitive routing**.
- Can be used to create global networks
- Share **between accounts** using AWS RAM
- Peer with **different regions** ... same or cross account
- Less complexity vs w/o TGW
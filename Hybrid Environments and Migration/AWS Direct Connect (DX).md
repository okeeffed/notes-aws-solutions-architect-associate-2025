---
cards-deck: AWS Exams::Solutions Architect::Associate::Direct Connect
---
## Concepts

### What is Direct Connect? #card 

- A physical connection (1, 10 or 100 Gbps).
- The connection is between a business premises, a DX location and a AWS region.
	- Think of these three locations.
- When you order DX, you are basically ordering a **Port Allocation** at a **DX Location**.
	- It's up to you to connect to this directly.
- Cost consists of Port hourly cost & outbound data transfer.
- The provisioning time and physical cables take time.
	- This could be weeks or months.
	- There is no physical resilience for the physical cables if they get cut.
- Low & consistent latency + high speeds.
- Can be used to access AWS Private Services (within a VPC) and AWS Public Services. There is no direct public internet access.

![[dx-concepts.png]]

https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html

## What are VIFs (Virtual Interfaces)? #card 

- Virtual VIFs
- Public VIFs
- Private VIFs

https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html

## What is the connection between Direct Connect, resilience and high-availability #card 

There are 3 major components:

1. The **AWS region**.
2. The **Direct Connect location**.
3. The **Customer Premises**.

- AWS regions are connected to the AWS router within the DX location via redundant, high speed connections.
- Within the DX location, the AWS router *by default* uses a **single cross-connect link** from **a DX port on the AWS DX router** to **the customer or provider router.**
- You extend the DX from the **customer/provider route** back to the **customer premises router** with a physical cable.

The points of failure:

- DX location.
- DX router.
- Cross connect cable.
- Customer DX router.
- Extension.
- Customer premises & customer router.

However, it's a flexible service that can have resilience improved.

- Use multiple DX routers.
- Use multiple cross-connects.
- Use multiple customer prem routers.
- Use multiple customer prem locations.
- Use multiple DX locations.

> There could be a hidden worry where the telco uses the same cable path in, where something like roadworks could still be a single point of failure.

![[dx-resilience.png]]

## Public VIF + VPN with DX #card

- Using a VPN gives you an encrypted and authenticated tunnel.
- Low latency & consistent latency.
- Uses a Public VIF + VGW/TGW public endpoints.
- Transit agnostic (DX/public internet).
- This is end-to-end.
	- CGW to TGW/VGW - MACsec is single hop based.
- VPNs have wider vendor support.
- VPN has more cryptographic overhead vs MACsec.
- Can be used while DX is provisioned and/or as a DX backup.

![[dx-public-vif-vpn.png]]
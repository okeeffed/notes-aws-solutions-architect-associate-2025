---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Site-to-Site VPN
---
## What is a site-to-site VPN? #card

- A logical connection between a VPC and on-prem network, encrypted with IPSec and running over the public internet**.
- Full high-availability if you design and implement it.
- Quick to provision, less than an hour.
- Things to know:
	- Virtual Private Gateway (VGW) is a type of logical gateway object that can be targeted by a route table.
	- Customer Gateway (CGW) can mean two things:
		- Logical piece of configuration within AWS.
		- What that configuration represents (a physical device).
	- VPN connection between the VGW and CGW.

## Explain a simple site-to-site VPN architecture #card

What you need to get first: 

- The IP range of the VPC network.
- You need the IP range of the on-prem network
- The IP address of the physical router on the premises.

With this, we can create the **Virtual Private Gateway** and attach it to the VPC. This is a highly-available object.

Within the on-prem env, we will add a **Customer Gateway (CGW)** using the public IP address so that the virtual CGW address matches the physical router.

Next, we need to create a VPN connection and link it to a **Virtual Private Gateway**. That VPN can use both the endpoints of the VGW which link to the CGW.

> In the above, we are assuming it's a static VPN.

We need to configure both the cloud and on-prem network to know each others IP address range.

As things are, we are not truly highly available as the customer router is the **single point of failure**. This is known as **partial HA** because it's only HA on the AWS side.

![[vpn-site-to-site-partial-ha.png]]

To modify this design to be highly available, we add another on-prem customer router (preferably within another building). We create another **CGW** with this.

![[vpn-site-to-site-ha.png]]
## Static vs Dynamic VPN #card

- Dynamic VPNs used BGP.
	- If the customer router does not support BGP, then you cannot use dynamic VPNs.
- The main difference is how routes are communicated.
	- Routes for the remote Cloud side are added to route tables as **static routes**.
	- For static: Networks for mote side between VGW and CGW configured on the VPN connection. No load balancing or multi-connection failover.
	- For dynamic: thanks the BGP, we create a BGP relationship between the VGW and the CGW using **ASNs (autonomous system numbers)**. Multiple VPN connections provide HA and traffic distribution. You can still add routes to the route tables to be static, or you can use **route propagation** to have them automatically added onto the route tables.

## Considerations for VPNs #card 

- Speed limitations from AWS is ~1.25Gbps. This is important for deciding between VPNs and something else.
- There is a cap for the VGW which is also ~1.25Gbps.
- Latency considerations - inconsistent and uses the public internet. If the application is latency sensitive, you may want to look at alternatives (like direct connect).
- Cost - AWS hourly cost, GB out cost, data cap (on premises).
- One of the major benefits: it is very quick to setup as it's software based (hours).
- This can also be used as a backup for Direct Connect (DX).
- Can also be used with Direct Connect (DX).
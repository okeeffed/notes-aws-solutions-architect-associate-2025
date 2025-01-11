---
cards-deck: AWS Exams::Solutions Architect::Associate::Border Gateway Protocol
---
Border Gateway Protocol (BGP): The Internet GPS.
## Explain the core concept of the Border Gateway Protocol #card

Think of BGP as the postal service of the internet. Just like how postal services coordinate between different countries to deliver mail, BGP coordinates between different networks to deliver data. 

It's not concerned with local delivery (like how a mail carrier works within a neighbourhood), but rather with the high-level routing between major network `countries`.

A concrete example is to think of a hybrid environment: you may use external BGP to exchange information between both autonomous systems. Within an autonomous system, it may use internal BGP along with other communication protocols determine routing and traffic flow.

![[bgp-visual.png]]

![[bgp-representation.webp]]

## Explain Autonomous Systems AS #card

- Think of an AS as a country in the internet world
	- Each `country` (AS) manages its internal affairs independently
	- Has its own `postal service` (internal routing)
	- Needs to coordinate with other `countries` to send/receive data internationally
- Every AS has a unique ID (ASN - autonomous system number) assigned by IANA
	- Public ASNs: 0 - 65535 (like official country codes)
	- Private ASNs: 64512 - 65534 (like internal organizational divisions)
	- Extended ASNs: 32-bit numbers for even more uniqueness

Some examples of some concrete examples:

1. Internet Service Providers.
2. Cloud providers.
3. Universities and large enterprises.

## How BGP Works #card

- Operates over TCP port 179
	- Mnemonic: BGP is like a diplomatic call (179) between network nations
	- TCP ensures reliable communication, like certified mail
- Requires manual peering
	- Like establishing diplomatic relations between countries
	- Networks must explicitly agree to exchange routing information

## Path Vector Protocol #card

- BGP cares about the journey, not the speed
	- Like choosing a route based on which countries you trust to handle your mail
	- Routes are selected based on policies and relationships, not just distance
- ASPATH: The routing passport
	- Records the sequence of AS numbers a route has traversed
	- Prevents routing loops (like a passport's visa stamps showing your travel history)

## Types of BGP #card

- iBGP (Internal BGP)
	- Like domestic mail service within a country
	- Handles routing within your own AS
	- Like long-distance delivery between your own company.
- eBGP (External BGP)
	- Like international mail service
	- Handles routing between different ASs
	- Think of this like delivery between entirely different companies.

## Real-world AWS Applications #card

- AWS Direct Connect
	- Like establishing a private diplomatic channel between your network and AWS
- Dynamic Site-to-Site VPNs
	- Similar to creating secure diplomatic pouches between networks

## Key BGP Attributes #card

- **NEXT_HOP**: The next router in the path
- **LOCAL_PREF**: Priority for outbound traffic
- **MED** (Multi-Exit Discriminator): Suggests preferred entry points to an AS
- **COMMUNITY**: Tags for routing policies (like postal service handling instructions)

## BGP Best Path Selection #card

1. Highest **LOCAL_PREF**
2. Shortest **AS_PATH**
3. Lowest **MED**
4. Prefer eBGP over iBGP
 
Think of it like choosing a shipping route:

- First, check preferred partners (**LOCAL_PREF**)
- Then, count countries crossed (**AS_PATH**)
- Consider partner preferences (**MED**)
- Prefer international over domestic routes when equal

## Course notes: What is the Border Gateway Protocol?

It is a routing protocol. Used for how data flows between point A, B, C to D.

It is used by services such as AWS Direct Connect and Dynamic Site-to-Site VPNs.

- Made up of a number of self-managing networks know as Autonomous Systems (AS)
	- Routers controlled by one single entity. From the viewpoint of BGP, it is seen as a black box abstracted away from the detail. It just needs to know about the network as a whole.
	
- `ASN`  are unique and allocated by IANA(the Internal Assigned Network authority): 0 - 2^16 where 64512 - 65534 are private.
	- Note that 32 bit ASNs do exist.
	- This is how BGP can distinguish between different networks.
- BGP operates over tcp/179 - it is reliable.
	- Not automatic - peering is manually configure the BGP relationship between two different **autonomous systems**.
- BGP is a path-vector protocol. It exchanges the best path to a destination between peers called the **ASPATH**.
	- Focuses on paths, not speed. Makes decision based on network topography.

You may see these terms as well:

- iBGP: Internal BGP - routing WITHIN an AS.
- eBGP: External BGP - routing BETWEEN ASs.

## Demonstration of the Border Gateway Protocol

The demo explanations showed Australia routers with a route table that includes the `ASPATH` value for each destination.

Each destination will exchange values with other routers to find the best path for each ASN.

![[bgp-visual.png]]

> By default, BGP will always use the shortest `ASPATH`. You can use `ASPATH` prepending to make the slow connections appear longer, and thus use another route.
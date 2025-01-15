---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Shield
---
## What is AWS Shield? #card 

- Provides DDoS protection.
	- Network volumetric attacks (L3) - Saturate capacity
	- Network protocol attacks (L4) - TCP SYN flood
	- Application layer attacks (L7) e.g. web request floods
- Comes in two forms:
	- Standard (free)
		- Protection at the perimeter (region/VPC or edge)
		- Best protection using R53, CloudFront,  Global Accelerator
	- Advanced with costs
		- USD$3,000 per month + 1 year commitment
		- Covers the same as standard and anything associated with EIPs (EC2), ALBs, CLBs, NLBs.
		- Not automatic - must be explicitly enabled.
		- Cost protection (i.e. EC2 scaling) for unmitigated attacks.
		- Proactive engagement & AWS Shield Response Team (SRT).
		- Includes WAF integration - basic WAF fees.
		- Layer 7 DDoS protection with WAF.
		- Advanced real-time visibility of DDoS events and attacks.
		- Health-based detection - application specific health checks, used by proactive engagement team.
		- Protection groups.

https://aws.amazon.com/shield/
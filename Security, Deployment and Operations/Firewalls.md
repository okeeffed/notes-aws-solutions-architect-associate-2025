---
cards-deck: AWS Exams::Solutions Architect::Associate::Firewalls
---
## Application Layer L7 Firewall #card

- Normal firewalls operate at Layers 3, 4 and 5.
	- For layer 3 and 4, Request and response are different and unrelated.
	- For layer 5, it considers request and response to be part of the same context.
- Layer 7 data like headers etc. are opaque to the layers below, so it gets around those other firewalls.
	- For this firewall, the layer 7 can understand all of the lower layers.
	- Layer 7 firewalls can understand layer 7 protocols i.e. HTTP.
	- Can identify normal or abnormal requests for protocol specific attacks.
	- L7 firewall decrypts and creates a new encrypted connection.
	
![[l7-firewalls.png]]

## Web Application Firewalls (WAF), WEBACLs, Rule groups and Rules

### What is a WAF? #card 

- This is AWS' Layer 7 firewall.
- Supported by certain services:
	- CloudFront
	- ALB
	- AppSync
	- API Gateway
- WAF output logs. Destinations include:
	- S3 (per 5 min)
	- CW Logs
	- Firehose

![[waf.png]]

### What is a WEB ACL? #card

- **WEB ACLs** house **Rule Groups** which in turn house **Rules**.
- Rules can be AWS managed rules, allow/deny lists, SQL injection, XSS, HTTP flood, IP reputation, bots etc.
- Default action (ALLOW/BLOCK) is non-matching by the rule.
- Resource type
	- CloudFront
	- Regional Service (ALB, API GW, AppSync)
- Add **Rule Groups** or **Rules** processed in order.
- Web ACL Capacity Units (WCU) - default 1500.
	- Increasable via support ticket.
- WEBACLs are associated with resources (this can take time).
	- Adjusting a WEBACL takes less time than associating one.
- One WEBACL can be used for many services, but you can't mix regional and global.

### What are Rule Groups #card 

- Contain rules.
- Don't have default actions. That's defined when groups or rules are added to WEB ACLs.
- Managed, Yours, Service-owned.
- Rule groups can be referenced by multiple WEBACL.
- Have a WCU capacity (defined upfront with a max of 1500).
- Defined as type, statement, action.
	- Type: regular or rate-based.
	- Statement: **What to match** or **count all** or **what & count**.
		- An example X SSH connections within a 5 minute period.
		- Criteria is that you can match against certain values but **only for the first 8192 bytes**.
		- Can have multiple statements will boolean logic.
	- Action: Allow, block, Count, Captcha etc.
		- Can also have an action to give a custom response (custom header only `x-amzn-waf-`), label etc.
		- Labels can be referenced later.
		- Allow and block stop processing, count/captcha actions continue.


## WAF Pricing #card

Depends on the region, but...

| Resource Type                 | Price                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Web ACL                       | $5.00 per month (prorated hourly)                                                    |
| Rule                          | $1.00 per month (prorated hourly)                                                    |
| Request                       | $0.60 per 1 million requests (for inspection up to 1500 WCUs and default body size*) |
| Bot Control and Fraud Control | Additional cost as per tabs above                                                    |

![[waf-pricing.png]]

https://aws.amazon.com/waf/pricing/

There are also additional security purchases you can make with **Intelligent Thread Mitigation**.

- Bot Control - ($10 /month*) & ($1 /1 mil requests*)
- Captcha - ($0.40 /1,000 challenge attempts*)
- Fraud Control/Account Takeover ($10 /month* & $1 /1,000 login attempts*)
- Marketplace Rule Groups - Extra costs
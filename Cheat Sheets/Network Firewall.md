---
cards-deck: AWS Exams::Cheat Sheets::Network Firewall
---
# What is AWS Network Firewall? #card

AWS Network Firewall is a **managed service** that provides **network protections for Amazon VPCs** with fine-grained traffic control and intrusion prevention.

---

## Network Firewall Features #card

- **Scales automatically** based on traffic load
- **Supports inbound & outbound web filtering** for unencrypted traffic
- **Intrusion Prevention System (IPS)** matches traffic patterns against known threat signatures
- **Centralized security policies** via AWS Firewall Manager
- **Integrates with AWS partner intelligence feeds**

---

## Network Firewall Concepts

### NF Firewall #card

- **Traffic filtering logic** for VPC subnets
- **Endpoints are located in specified AZs and subnets**
- **Stateless rules apply to all packets, stateful rules apply only to new traffic flows**
- **Delete protection available** to prevent accidental removal

### NF Firewall Policies #card

- Defines **rules and settings** for filtering traffic
- **Can associate with multiple firewalls**
- Supports **stateless & stateful rule groups**
- **Handles default actions** for unmatched packets:
  - **Stateless default actions** – applied to unmatched packets
  - **Stateful default actions** – applied to unmatched traffic flows
- **Rule order configuration is set during policy creation**

### NF Rule Groups #card

- **Set of rules** for **matching VPC traffic**
- **Custom or AWS-managed rule groups**
- **Types:**
  - **Stateless rules** – inspect individual packets
  - **Stateful rules** – track packets in context of the traffic flow

### NF Firewall Subnet #card

- **Dedicated subnet** for firewall endpoints

### NF Regional Endpoint #card

- API requests are made to:
  - `https://network-firewall.<region>.amazonaws.com`

### NF Resource Sharing #card

- Share **firewall policies & rule groups** with:
  - **AWS accounts** (inside or outside the organization)
  - **Organizational units**
  - **Entire AWS Organization**

---

## Network Firewall Monitoring #card

- **Supports monitoring via:**
  - **Amazon CloudWatch**
  - **Amazon CloudWatch Logs**
  - **AWS CloudTrail**
  - **AWS Config**
- **Firewall logging only for stateful rule engine traffic**
- **Log types:**
  - **Flow logs** – standard network traffic logs
  - **Alert logs** – report traffic matching stateful rules
- **Log information includes:**
  - `firewall_name`
  - `availability_zone`
  - `event_timestamp`
  - `event`
- **Log destinations:**
  - **Amazon S3**
  - **CloudWatch Logs**
  - **AWS Data Firehose**
- **KMS Key Policy required** for logging to encrypted destinations
- **Supports tagging** for firewalls, firewall policies, and rule groups

---

## Network Firewall Pricing #card

- **Charged per firewall endpoint per hour**
- **Traffic billed per GB processed**
- **Standard AWS data transfer fees apply**
- **No additional NAT Gateway hourly charge if firewall is provisioned**
- **Avoid NAT Gateway charges by using Gateway VPC endpoints for S3**

---

## References

- [AWS Network Firewall Overview](https://aws.amazon.com/network-firewall/)
- [AWS Network Firewall Documentation](https://docs.aws.amazon.com/network-firewall/latest/developerguide/)
- [AWS Network Firewall Pricing](https://aws.amazon.com/network-firewall/pricing/)

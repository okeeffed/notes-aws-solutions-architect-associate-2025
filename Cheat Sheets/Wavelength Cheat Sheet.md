---
cards-deck: AWS Exams::Cheat Sheets::Wavelength
---
# AWS Wavelength #card

AWS Wavelength allows developers to **create applications with ultra-low latencies** for mobile devices and end users by extending **Amazon VPC** into **Wavelength Zones (WZs)**.

---

## Wavelength Features #card

- **Supports general purpose, gaming, and ML inference compute instances**
- **Persistent block storage** with snapshot, encryption, and restore capabilities
- **Connectivity to 5G networks** using **VPC & Carrier Gateway**
- **AWS management & monitoring tools** for workloads in WZs

---

## Wavelength Use Cases #card

- **AR/VR applications & HD live video streaming**
- **AI/ML-powered video & image analytics** for medical diagnostics, retail, and smart manufacturing
- **Near-real-time vehicle-to-cloud communication** for autonomous driving & in-vehicle experiences

---

## Wavelength Concepts

### Wavelength Infrastructure #card

- AWS **infrastructure for ultra-low latency** workloads over mobile networks

### Wavelength Zone (WZ) #card

- **Logical extension** of an AWS Region
- **Managed by the region’s control plane**
- **Supports ultra-low latency applications** for 5G mobile networks
- **Recommended to use a hub-and-spoke model** for edge applications
- **Multiple WZs needed for latency-sensitive applications**
- **Use AWS Cloud Map** to discover the closest WZ endpoint
- **Replication recommended** to another AZ in a different Region for failover

### Wavelength Application #card

- Any application running on an AWS resource inside a **Wavelength Zone**

---

## Carrier Gateway #card

- **Provides connectivity** between Wavelength Zones and carrier networks
- **Enables inbound & outbound** traffic to carrier networks & the internet
- **Supports IPv4 traffic** only
- **Only available for VPCs with WZ subnets**
- **Requires Carrier IP address** from the **network border group**

---

## Wavelength Networking Requirements #card

- **AWS Compute, Storage, and Carrier Gateways** in WZs
- **VPC, Subnet, & Network Border Group** for leveraging 5G edge computing

---

## Wavelength Management Interfaces #card

- **AWS Management Console**
- **AWS CLI**
- **AWS SDKs**

---

## Wavelength Pricing #card

- **Prices in WZs differ** from the parent region
- **Only On-Demand EC2 instances** available in WZs
- **Compatible with Instance Savings Plan**

---

## References

- [AWS Wavelength Overview](https://aws.amazon.com/wavelength/)
- [AWS Wavelength Documentation](https://docs.aws.amazon.com/wavelength/latest/developerguide/what-is-wavelength.html)

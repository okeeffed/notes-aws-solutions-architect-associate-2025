---
cards-deck: AWS Exams::Cheat Sheets::Lightsail
---
# What is Amazon Lightsail #card

Amazon Lightsail is a **cloud-based virtual private server (VPS) solution** providing an easy way to deploy websites and applications.

---

## Lightsail Features #card

- **Includes** VM (Linux/Windows), SSD storage, data transfer, DNS management, static IP
- **Automatic/manual snapshots** for instances and volumes
- **Integrated load balancers** with round-robin traffic distribution
- **Free SSL/TLS certificates** for load balancers
- **Managed databases** for MySQL and PostgreSQL
- **IPv4 & IPv6 support** for instances, containers, load balancers, and CDNs
- **Content Delivery Network (CDN)** backed by Amazon CloudFront
- **Pre-configured app stacks**: WordPress, Magento, Drupal, Joomla, GitLab, LAMP, MEAN, etc.

---

## Lightsail Networking & Security #card

- **Static IP**: Free when attached to an instance
- **Built-in firewall** to restrict traffic to instances
- **Integrated DNS management**
- **Session persistence** support for load balancers
- **Built-in monitoring tools** for server health

---

## Lightsail Supported OS & Apps #card

### **Operating Systems**
- Ubuntu, Debian, FreeBSD, OpenSUSE, CentOS, Windows Server

### **Pre-configured Application Stacks**
- WordPress, Magento, Drupal, Joomla, Ghost, Redmine
- Plesk, cPanel & WHM, Django

### **Development Stacks**
- Node.js, GitLab, LAMP, MEAN, Nginx

---

## Lightsail Pricing #card

- **Instances charged only when running or stopped**
- **Outbound data beyond plan limits incurs extra cost**
- **Load balancer costs are fixed per month**
- **Additional SSD storage available at $0.10/GB per month**
- **Point-in-time snapshots cost $0.05/GB per month**

### **Linux Plans**
| Package | Memory | vCPUs | SSD | Data Transfer |
|---------|--------|-------|-----|---------------|
| 1 | 512MB | 1 | 20GB | 1TB |
| 2 | 1GB | 1 | 40GB | 2TB |
| 3 | 2GB | 1 | 60GB | 3TB |
| 4 | 4GB | 2 | 80GB | 4TB |
| 5 | 8GB | 2 | 160GB | 5TB |
| 6 | 16GB | 4 | 320GB | 6TB |
| 7 | 32GB | 8 | 640GB | 7TB |

### **Windows Plans**
| Package | Memory | vCPUs | SSD | Data Transfer |
|---------|--------|-------|-----|---------------|
| 1 | 512MB | 1 | 30GB | 1TB |
| 2 | 1GB | 1 | 40GB | 2TB |
| 3 | 2GB | 1 | 60GB | 3TB |
| 4 | 4GB | 2 | 80GB | 4TB |
| 5 | 8GB | 2 | 160GB | 5TB |
| 6 | 16GB | 4 | 320GB | 6TB |
| 7 | 32GB | 8 | 640GB | 7TB |

### **Managed Database Pricing**
| Package | Memory | vCPUs | SSD | Data Transfer | Encrypted |
|---------|--------|-------|-----|---------------|-----------|
| 1 | 1GB | 1 | 40GB | 100GB | No |
| 2 | 2GB | 1 | 80GB | 100GB | Yes |
| 3 | 4GB | 2 | 120GB | 100GB | Yes |
| 4 | 8GB | 2 | 240GB | 200GB | Yes |

---

## Lightsail Limits #card

- **Instances:** 20 per account
- **Static IPs:** 5 per account
- **DNS Zones:** 3 per account
- **Attached block storage:** 20TB
- **Load balancers:** 5 per account
- **Certificates:** 20 per calendar year

---

## References

- [Amazon Lightsail Overview](https://aws.amazon.com/lightsail/)
- [Lightsail Pricing](https://aws.amazon.com/lightsail/pricing/)
- [Lightsail Documentation](https://docs.aws.amazon.com/lightsail/latest/userguide/)

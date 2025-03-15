---
cards-deck: AWS Exams::Cheat Sheets::Workspaces
---
# Amazon WorkSpaces #card

Amazon WorkSpaces is a **fully managed, secure cloud desktop service**.

---

## WS Features #card

- Integrates with **Active Directory (AD)** or provides a standalone, managed directory
- Provides a **persistent cloud desktop** experience
- Offers **bundles** with different hardware/software configurations
- Supports **Windows 7 and Windows 10** desktop licenses on dedicated hardware
- Supports **HIPAA, SOC, FedRAMP, and PCI compliance**
- Provides SSD storage backed up to **Amazon S3**
- Uses **PC-over-IP (PCoIP)** technology for secure remote access
- Supports **image sharing** across AWS accounts
- Uses **Amazon WorkDocs Drive** for document storage
- Deploy & manage apps via **Amazon WorkSpaces Application Manager**

---

## WS AD Integration #card

- Can use **on-premises Microsoft AD** for user management
- Users can log in with **existing corporate credentials**

---

## WS Storage #card

- Provides **persistent SSD volumes**
- User volume is **automatically backed up every 12 hours**
- **Cannot decrease volume size** after launch, but can **increase** it anytime

---

## WS User Management #card

- Each user must exist in a **directory** (AWS-managed or AD-integrated)
- Users are **local administrators** by default
- Users can **customize settings** (wallpaper, icons, shortcuts, etc.)
- Admins can **lock down WorkSpaces** to restrict user modifications

---

## WS Bundles #card

A **bundle** is a combination of:
- **Image** (OS and software)
- **Hardware** (CPU, RAM, and storage)

Users select bundles to match their **compute and application needs**.

---

## WS Pricing #card

- **Charged per bundle type** and **number of WorkSpaces launched**
- Supports **monthly** and **hourly billing**
  - **Monthly billing**: Fixed monthly fee, best for full-time users
  - **Hourly billing**: Low monthly fee + pay per hour used

---

## References

- [AWS WorkSpaces Docs](https://docs.aws.amazon.com/workspaces/latest/adminguide/)
- [AWS WorkSpaces Pricing](https://aws.amazon.com/workspaces/pricing/)
- [AWS WorkSpaces FAQs](https://aws.amazon.com/workspaces/faqs/)

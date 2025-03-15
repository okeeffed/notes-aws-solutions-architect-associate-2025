---
cards-deck: AWS Exams::Solutions Architect::Associate::Concepts::Disaster Recovery
---

## **Summary of AWS Disaster Recovery Strategies**

### Disaster Recovery (DR) in AWS revolves around two key metrics #card

- **RTO (Recovery Time Objective)**: How long it takes to restore operations after a failure.
- **RPO (Recovery Point Objective)**: The maximum acceptable amount of data loss before the disaster event.

### Different AWS DR strategies #card

AWS provides multiple DR strategies, each balancing cost and recovery speed.

1. **Backup and Restore** (Lowest Cost, Highest RTO)
    
    - Data is stored in **S3, Glacier, or Storage Gateway**.
    - Recovery requires spinning up infrastructure and restoring data.

2. **Pilot Light** (Medium Cost, Faster RTO)
    
    - Core system components (like databases) are always running in AWS.
    - Compute resources (EC2 instances, application servers) are launched when needed.

3. **Warm Standby** (Higher Cost, Lower RTO)
    
    - A **scaled-down version** of the full production system is always running.
    - Can be scaled up quickly in case of failure.

4. **Multi-Site (Active-Active)** (Highest Cost, Lowest RTO)
    
    - Fully functional **duplicate environments in multiple AWS regions**.
    - Traffic is actively distributed using **Route 53 and Elastic Load Balancing (ELB)**.

### AWS services that support DR

- **Storage**: S3, Glacier, Storage Gateway
- **Migration**: Server Migration Service, Database Migration Service
- **Networking**: VPC, Direct Connect, Route 53, Elastic IP
- **Compute & Databases**: EC2, RDS, DynamoDB, Redshift
- **Infrastructure as Code**: CloudFormation, Elastic Beanstalk, OpsWorks

---

### **Analogy: The Restaurant Business Continuity Plan** #card

Imagine you own a popular **restaurant** that must stay operational even if a disaster strikes:

1. **Backup and Restore → Recipe Book in a Safe**
    
    - You store **all your recipes and supplier contacts** in a safe place.
    - If your restaurant burns down, you can **rebuild everything** from scratch, but it will take time.

2. **Pilot Light → Essential Ingredients Always Stocked**
    
    - Your **kitchen is mostly off**, but you keep **the most critical ingredients (database, core apps) always stocked**.
    - If a disaster happens, you **turn on the stove and start cooking**—faster than starting from zero.

3. **Warm Standby → A Small Food Truck Nearby**
    
    - You **run a smaller version** of your restaurant as a food truck.
    - It can **serve customers**, but it’s **not as fast** as your full restaurant.
    - If the main restaurant is lost, you can **expand the food truck** into a full restaurant.

4. **Multi-Site → A Chain of Restaurants**
    
    - You have **identical restaurants in multiple locations**.
    - If one closes, customers automatically go to another with **zero downtime**.

### High availability vs Disaster Recovery #card

- **Availability vs. Disaster Recovery: Different Scopes**

    - **Availability** ensures **components** of a workload remain operational (Multi-AZ setup).
    - **Disaster Recovery** ensures **entire workloads** can be restored (Multi-Region setup).

- **Different Objectives**
    
    - **Availability → Handles localized failures** (e.g., AZ outage, single-instance failure).
    - **Disaster Recovery → Handles large-scale disasters** (e.g., region-wide failure, cyberattacks).

- **Availability Comes First**
    
    - You should **first design for high availability** (e.g., Multi-AZ setup).
    - Then, **layer disaster recovery on top** by replicating workloads across **multiple regions**.

- **Failover Mechanisms Differ**
    
    - **Availability Failover**: Auto-failover within the same region (e.g., RDS Multi-AZ).
    - **Disaster Recovery Failover**: Traffic is rerouted to a **discrete copy** of the workload in another region.

- **Data Protection is Different**
    
    - **Availability ensures real-time replication** but does not necessarily protect against data corruption or deletion (since replication can propagate these issues).
    - **Disaster Recovery includes point-in-time backups** to restore clean versions of data if corruption or deletion occurs.

### Analogy: High Availability vs Disaster Recovery #card

Think of **availability** and **disaster recovery** like **protecting a castle**:

- **High Availability (Multi-AZ) = Fortified Castle with Inner Defenses**
    
    - Your castle has **multiple gates, walls, and towers** (multiple AZs).
    - If one **wall gets breached**, other walls keep intruders out.
    - The **castle remains functional** despite localized damage.
- **Disaster Recovery (Multi-Region) = A Backup Castle in Another Kingdom**
    
    - If an **earthquake destroys the entire castle**, it’s **not enough** to have strong walls.
    - You need a **backup castle in another region**.
    - People **evacuate and move operations** to the other castle.

This aligns with AWS' explanation: You **first** build a strong castle (HA), then you **prepare for total failure** (DR).

## Conclusion

Just like running a restaurant, AWS DR planning balances **cost vs. speed**. A fully redundant system (**multi-site**) ensures business continuity, but is expensive, while a **backup-only** approach is cheaper but much slower.


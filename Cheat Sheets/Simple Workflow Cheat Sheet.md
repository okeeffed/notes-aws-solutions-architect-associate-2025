---
cards-deck: AWS Exams::Cheat Sheets::Simple Workflow
---
# Amazon Simple Workflow (SWF) #card

Amazon SWF is a **fully managed state tracker and task coordinator** in the cloud.

---

## SWF Features #card

- Separates **workflow control flow** from actual task execution
- Manages **workflow execution history** across 3 Availability Zones
- Supports **any programming language**, running in the cloud or on-premises
- **Scalable**, with control over **workers** and **deciders**
- Provides **AWS Flow Framework** for asynchronous programming

---

## SWF Concepts

### SWF Workflow #card

- A **set of activities** with logic that coordinates execution
- Supports **sequential and parallel processing**
- Runs within an AWS **domain** (scope control)
- **Multiple workflows per domain**, but domains are isolated
- **Activity registration** includes name, version, and timeout values

### SWF Activity Task #card

- Tells an **activity worker** to perform a function
- SWF **assigns, tracks, and maintains** task state
- Tasks can run **synchronously or asynchronously** across multiple locations
- Activity tasks appear on an **activity task list**

### SWF Lambda Task #card

- Executes a **Lambda function** instead of a traditional SWF activity

### SWF Decision Task #card

- Notifies a **decider** of a workflow execution state change
- Deciders determine **next steps** in the workflow
- **One active decision task at a time** per workflow execution

### SWF Workflow Starter #card

- Any application that **initiates workflow executions**

### SWF Activity Worker #card

- A program that **receives, performs, and returns results** for tasks
- Can run **on-premises or in the cloud**
- Supports **multiple languages and OS**
- **Task routing** allows specific workers to handle specific tasks

### SWF Decider #card

- Software that **coordinates** workflow tasks
- Schedules tasks, provides inputs, processes events, and ends workflows
- Receives tasks via **long polling**

### SWF Workflow Execution History #card

- A record of **all significant workflow execution events**
- Included with **each decision task** to inform deciders of state

### SWF Polling #card

- **Deciders and activity workers** use **long polling** to communicate with SWF

---

## SWF Execution #card

1. Write **activity workers** to process workflow steps
2. Write a **decider** to implement coordination logic
3. Register activities and workflows with SWF
4. Start **activity workers and deciders**
5. Initiate **workflow executions** (each runs independently with unique inputs)
6. SWF schedules an **initial decision task**
7. The **decider** generates decisions and initiates activity tasks
8. Workflow continues until **decider completes execution**
9. Monitor and filter execution history

---

## SWF Endpoints #card

- SWF provides **regional endpoints** to reduce latency and meet data residency requirements
- **Workflows, activities, and domains** are region-specific

---

## AWS Flow Framework #card

- Enhanced SDK for **distributed, asynchronous programs**
- Available for **Java and Ruby**
- Simplifies **complex workflow development**

---

## SWF Pricing #card

- Pay per **workflow execution** (first 24 hours free)
- Additional charges for:
  - **Markers** (custom log entries)
  - **Start timers, signals, and tasks**
- **Data transfer within a region** is free
- **Cross-region transfers** are charged at standard AWS rates (first 1GB free)

---

## SQS vs SWF #card

| Feature | SQS | SWF |
|---------|-----|-----|
| Message vs Task | **Message-oriented** | **Task-oriented** |
| Tracking | **No tracking** | **Tracks all tasks & events** |
| Features | Simple queuing | Workflow execution, signaling, data passing |

---

## SWF Limits #card

| Limit | Value |
|-----------------------------|---------------|
| Max registered domains | 100 |
| Max workflow & activity types | 10,000 per domain |
| Max open workflow executions | 100,000 per domain |
| Max open activity tasks | 1,000 per workflow execution |
| Max workflow execution time | 1 year |
| Max workflow execution history | 25,000 events |
| Max task execution time | 1 year |
| Max scheduled activities per decision | 100 |
| Max execution history retention | 90 days |

---

## References

- [AWS SWF Docs](https://docs.aws.amazon.com/amazonswf/latest/developerguide/)
- [AWS SWF FAQs](https://aws.amazon.com/swf/faqs/)
- [AWS SWF Pricing](https://aws.amazon.com/swf/pricing/)

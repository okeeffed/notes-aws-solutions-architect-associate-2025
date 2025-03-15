---
cards-deck: AWS Exams::Cheat Sheets::EventBridge
---
# What is Amazon EventBridge #card

Amazon EventBridge is a **serverless event bus** that enables applications to communicate with each other using real-time data from various sources. It centralizes event ingestion and directs them to appropriate applications and services.

## Concepts

### EB What is an Event? #card

An **event** in Amazon EventBridge represents a **state change** or occurrence of an incident within a system. Events are JSON objects containing details like **timestamps, event types, and resource IDs**.

### EB What is an Event Pattern? #card

**Event patterns** allow filtering and matching specific fields and values in event payloads. Users define patterns that should match incoming events using JSON structures.

### EB What is an Event Bus? #card

An **event bus** is the event ingestion and delivery mechanism in EventBridge.

### EB Types of Event Buses #card

- **Default Event Bus:** Every AWS account has a default event bus receiving events from AWS services.
- **Custom Event Bus:** Users can create custom event buses to receive events from custom applications or third-party services.

### EB Cross-Account Event Buses #card

Users can send and receive EventBridge events across AWS accounts by configuring **IAM policies** and **event rules**.

### EB What is an Event Rule? #card

An **EventBridge rule** listens for specific events and routes them to targets for processing.

### EB Types of Event Rules #card

- **Event Pattern Rule:** Matches events based on patterns (e.g., EC2 state changes to "running").
- **Schedule Rule:** Triggers targets on a scheduled frequency (e.g., hourly execution).

### EB What are Global Endpoints? #card

Global Endpoints allow routing events across **multiple AWS regions**, increasing **resilience and availability**.

### EB What are Archives and Replays? #card

- **Archives:** Store past events for a configurable period.
- **Replays:** Resend past events to targets for **testing or failure recovery**.

## Security

### EB How does EventBridge enforce security? #card

EventBridge uses **identity-based and resource-based IAM policies** to control access. For example:

- A rule triggering a **Lambda function** must have `lambda:InvokeFunction` permissions.
- A rule publishing to an **SNS topic** requires `sns:Publish` permissions.

## Features

### EB What is EventBridge Pipes? #card

**EventBridge Pipes** enables direct connections between event sources and targets without writing custom code.

### EB What is a Pipe? #card

A **pipe** is a direct integration between a single **source** and a single **target**, with optional filtering and enrichment.

### EB Common Sources for EventBridge Pipes #card

- Amazon SQS
- Amazon Kinesis
- DynamoDB Streams
- Amazon Managed Streaming Kafka
- Amazon MQ
- Custom applications

### EB Common Targets for EventBridge Pipes #card

- Amazon SQS
- AWS Step Functions
- Amazon Kinesis Data Streams
- Amazon SNS
- API Destination

### EB What is EventBridge Scheduler? #card

**EventBridge Scheduler** is a **serverless scheduling service** for triggering AWS services at specific intervals, **without requiring an event bus or rule**.

### EB How is EventBridge Scheduler better than Scheduled Rules? #card

- **Independent schedules** without event buses or rules.
- **Supports time zones, scaling, and custom payloads.**
- **Enhanced monitoring and access controls.**

### EB What is a Schema Registry? #card

A **schema registry** stores JSON schemas that define the structure of events for validation and code generation.

### EB Types of Schema Registries #card

- **AWS Event Schema Registry:** Contains predefined schemas for AWS events.
- **Discovered Schema Registry:** Stores schemas discovered from event buses.
- **Custom Registries:** Organize user-defined schemas.

## Additional Information

### EB Common Event Sources #card

- **AWS Services:** API calls, database changes, CloudWatch Logs, etc.
- **Third-party software and custom applications.**

### EB Debugging EventBridge Events #card

- Monitor **latency and errors** using **CloudWatch Metrics**.
- Use **Dead-letter queues (DLQs)** for failed event deliveries.

### EB What is API Destinations? #card

API Destinations allow secure integration with **third-party SaaS applications** by sending events externally.

## Use Cases

### EB How can EventBridge be used for Application Integration? #card

EventBridge connects applications **in real time** by routing events between them, enabling **event-driven architectures**.

### EB How does EventBridge help in Serverless Applications? #card

**Event-driven serverless applications** use EventBridge to trigger **AWS Lambda** functions in response to events.

### EB How does EventBridge automate workflows? #card

Automates AWS tasks by triggering services like **EC2 start/stop based on S3 file uploads**.

### EB How does EventBridge process data? #card

Routes **real-time streaming data** (e.g., **Kinesis Data Streams** to **Kinesis Data Analytics**) for processing.

### EB How does EventBridge improve Application Monitoring? #card

**CloudWatch Logs** events can be routed to **Step Functions** for alert orchestration.

### EB How does EventBridge integrate with Third-Party Apps? #card

**API Destinations** enable secure **bi-directional event integration** with external applications.

## Best Practices

### EB How to improve EventBridge Availability? #card

Enable **event replication across AWS regions** to prevent data loss.

### EB How to optimize EventBridge rules? #card

- Define **adequate rules and targets** to handle expected event throughput.
- Use **filters** to reduce unnecessary event processing.

### EB How to handle Event Failures? #card

- Use **Dead-letter queues (DLQs)** to capture failed events.
- Configure **retry policies** to automatically reprocess failures.

### EB How to Structure Event Data? #card

- Use **JSON schema standards** for validation.
- Include **timestamps, metadata, and context** in events.

## Pricing

### How is Amazon EventBridge pricing structured? #card

- **Events:** Charged per **million events** ingested.
- **Schema Discovery & Registry:** Charged per **million API calls**.
- **EventBridge Pipes:** Priced based on **data processed**.
- **EventBridge Scheduler:** Costs based on **scheduled invocations**.

## References

- [AWS EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- [AWS EventBridge](https://aws.amazon.com/eventbridge/)
- [AWS Pricing](https://aws.amazon.com/eventbridge/pricing/)
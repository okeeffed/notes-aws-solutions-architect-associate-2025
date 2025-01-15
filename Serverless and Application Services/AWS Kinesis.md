---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Kinesis
---
## What is Kinesis? #card 

Kinesis is a group of services related to scalable data streaming.

| **PRODUCT**                                                                                                           | **DESCRIPTION**                                                                                                                                         | **PRODUCT PRICING**                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **[Amazon Kinesis Video Streams](https://aws.amazon.com/kinesis/video-streams?p=pm&c=aa&pd=kinesis&z=4)**             | Easy to securely stream video from connected devices to AWS for analytics, machine learning (ML), and other processing.                                 | [AWS Kinesis Video Streams pricing](https://aws.amazon.com/kinesis/video-streams/pricing?p=pm&c=aa&pd=kinesis&z=4)                |
| **[Amazon Kinesis Data Streams](https://aws.amazon.com/kinesis/data-streams?p=pm&c=aa&pd=kinesis&z=4)  <br>**         | Scalable and durable real-time data streaming service that can continuously capture gigabytes of data per second from hundreds of thousands of sources. | [Amazon Kinesis Data Streams pricing](https://aws.amazon.com/kinesis/data-streams/pricing?p=pm&c=aa&pd=kinesis&z=4)               |
| [**Amazon Data Firehose**](https://aws.amazon.com/kinesis/data-firehose?p=pm&c=aa&pd=kinesis&z=4)                     | Capture, transform, and load data streams into AWS data stores for near real-time analytics with existing business intelligence tools.                  | [Amazon Data Firehose pricing](https://aws.amazon.com/kinesis/data-firehose/pricing?p=pm&c=aa&pd=kinesis&z=4)                     |
| [**Amazon Managed Service for Apache Flink**](https://aws.amazon.com/kinesis/data-analytics?p=pm&c=aa&pd=kinesis&z=4) | Process data streams in real time with SQL or Apache Flink without having to learn new programming languages or processing frameworks.                  | [Amazon Managed Service for Apache Flink pricing](https://aws.amazon.com/kinesis/data-analytics/pricing?p=pm&c=aa&pd=kinesis&z=4) |

https://aws.amazon.com/pm/kinesis/
### What are Kinesis Data Streams? #card

You can use **Kinesis Data Streams** for **rapid and continuous data intake and aggregation**. The type of data used can include IT infrastructure log data, application logs, social media, market data feeds, and web clickstream data. Because the response time for the data intake and processing is in real time, the processing is typically lightweight.

- Kinesis is a **scalable streaming** service designed to ingest heaps of data.
- Producers send data into a kinesis stream.
- Streams can scale from low to near infinite data rates.
- Public service & highly available by design.
- Streams store a 24-hour moving window of data by default.
	- However much you ingest in that period, storage is included.
	- Can be increased to a maximum of 365 days (additional cost).
- Multiple consumers access data from anywhere within that moving window.
	- Great for analytics and dashboards.

https://docs.aws.amazon.com/streams/latest/dev/introduction.html

### What is Kinesis Data Firehose? #card 

Amazon Data Firehose is a fully managed service for delivering real-time [streaming data](http://aws.amazon.com/streaming-data/) to destinations such as Amazon Simple Storage Service (Amazon S3), Amazon Redshift, Amazon OpenSearch Service, Amazon OpenSearch Serverless, Splunk, Apache Iceberg Tables, and any custom HTTP endpoint or HTTP endpoints owned by supported third-party service providers, including Datadog, Dynatrace, LogicMonitor, MongoDB, New Relic, Coralogix, and Elastic. With Amazon Data Firehose, you don't need to write applications or manage resources. You configure your data producers to send data to Amazon Data Firehose, and it automatically delivers the data to the destination that you specified. You can also configure Amazon Data Firehose to transform your data before delivering it.

- **Fully managed service** to load data for data lakes, data stores and analytics services.
- Automatic scaling ... fully serverless ..resilient.
- Near Real Time delivery **(~60 seconds)**.
- Supports transformation of data on the fly (lambda).
- Billing - **volume** through Firehose.

![[kinesis-firehose.png]]

An example of Firehose delivering transformed and raw source data to two different buckets:

![A diagram showing the Amazon Data Firehose data flow for Amazon S3.](https://docs.aws.amazon.com/images/firehose/latest/dev/images/fh-flow-s3.png)

https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
### Kinesis Architecture #card 

- Shards
	- Each shard provides it's own capacity.
	- 1MB Ingestion, 2MB Consumption.
	- More shards = more price = more power.
- Price is also affected by the 24 hour window.
- Data is stored as Kinesis data records (1MB in size).
	- Data records are stored across shards.
- A related product Kinesis Firehose connects to a Kinesis Stream and can move the data that enters a stream on mass into another AWS Service.

![[kinesis-architecture.png]]

### SQS vs Kinesis #card 

A common area of confusion.

- Use this lens: 
	- If it's about ingestion of data, a question will be about Kinesis.
	- If it's about the worker pools, decoupling or async communications, then **assume SQS first** but change your mind if something changes your mind to do so.
- Normally SQS has one production group, one consumption group.
	- SQS is used for **decoupling** and **asynchronous** communications.
	- **No persistence** of messages, **no window**.
- Kinesis is designed for **huge scale ingestion**, multiple consumers, rolling windows.
	- Designed for data **ingestion**, **analytics**, **monitoring**, **app clicks**.

### What is Kinesis Data Analytics? #card 

> **Note:** This product is being discontinued and likely will not show up on the exam.

- Real-time data processing product using **SQL**.
- Ingests from **Kinesis Data Streams** or **Firehose**
- Destinations
	- Firehose (near real-time)
	- AWS Lambda (real-time)
	- Kinesis Data Stream (real-time)
- Not cheap
- Use cases:
	- Streaming data that needs **real-time SQL processing**
	- **Time-series analytics** - elections, e-sports
	- **Real-time dashboards** - leaderboards for games
	- **Real-time metrics** - security and response teams
	
![[kinesis-data-analytics.png]]

https://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html

### What is Amazon Kinesis Video Streams? #card

- Ingest **live video data** from producers.
- **Security cameras, smartphones, cars, drones**, time-serialised **audio**, **thermal**, **depth** and **RADAR** data.
- Consumers can access data **frame-by-frame**, or as **needed**.
- Can **persist** and **encrypt** (in-transit and at rest) data.
	- Can't access directly via storage, only via APIs.
- Integrates with other AWS services e.g. **Rekognition** and **Connect**.

![[aws-kinesis-video-streams.png]]

https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/what-is-kinesis-video.html
## Data Streams vs Firehose

Amazon Kinesis offers two primary services for handling real-time streaming data: Kinesis Data Streams and Kinesis Data Firehose. While both facilitate the ingestion and processing of streaming data, they serve distinct purposes and offer different features.

**Kinesis Data Streams (KDS):**

- **Purpose:** Designed for real-time data streaming, KDS allows you to collect and process large streams of data records continuously. It's ideal for applications requiring low-latency processing and real-time analytics.
    
- **Data Delivery:** KDS doesn't natively deliver data to destinations like Amazon S3 or Redshift. Instead, it serves as a data source that can be integrated with other AWS services or custom applications for processing and storage. For instance, you can use AWS Lambda to process data from KDS and then store the results in S3.
    
    [AWS Documentation](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html?utm_source=chatgpt.com)
    
- **Data Storage:** Data in KDS is stored for a default retention period of 24 hours, which can be extended up to 7 days for an additional cost.
    
    [Whizlabs](https://www.whizlabs.com/blog/aws-kinesis-data-streams-vs-aws-kinesis-data-firehose/?utm_source=chatgpt.com)
    
- **Scaling:** Scaling in KDS is managed by adjusting the number of shards, which requires manual intervention. Each shard provides a fixed capacity, and you must monitor and adjust the number of shards based on your data throughput needs.
    
    [Whizlabs](https://www.whizlabs.com/blog/aws-kinesis-data-streams-vs-aws-kinesis-data-firehose/?utm_source=chatgpt.com)
    

**Kinesis Data Firehose:**

- **Purpose:** Firehose is a fully managed service designed to capture, transform, and load streaming data directly into AWS data stores such as Amazon S3, Redshift, and Elasticsearch Service. It's optimized for delivering data to these destinations with minimal setup.
    
- **Data Delivery:** Firehose automatically delivers data to specified destinations without the need for custom applications. It supports near real-time data delivery, with a minimum buffer time of 60 seconds.
    
    [Whizlabs](https://www.whizlabs.com/blog/aws-kinesis-data-streams-vs-aws-kinesis-data-firehose/?utm_source=chatgpt.com)
    
- **Data Storage:** Unlike KDS, Firehose doesn't store data; it delivers data directly to the configured destinations. If you need to store data temporarily before processing, you would need to configure the destination service (e.g., S3) to handle the storage.
    
- **Scaling:** Firehose automatically scales to match the throughput of your data, handling scaling without manual intervention. This makes it easier to manage varying data volumes without worrying about provisioning resources.
    
    [Whizlabs](https://www.whizlabs.com/blog/aws-kinesis-data-streams-vs-aws-kinesis-data-firehose/?utm_source=chatgpt.com)
    

**Integration Between KDS and Firehose:**

Kinesis Data Streams can serve as a source for Kinesis Data Firehose. This means you can use KDS to collect and process data in real-time and then use Firehose to deliver that processed data to destinations like S3 or Redshift. This integration allows you to combine the real-time processing capabilities of KDS with the delivery and storage capabilities of Firehose.

[AWS Documentation](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html?utm_source=chatgpt.com)

**Summary:**

- **Kinesis Data Streams:** Best suited for real-time data streaming and processing, requiring manual scaling and integration with other services for data delivery.
    
- **Kinesis Data Firehose:** Ideal for straightforward data delivery to AWS data stores, offering automatic scaling and minimal setup.
    

In essence, if your use case involves complex, real-time data processing with custom applications, KDS is the appropriate choice. If you need a simple, fully managed service to deliver streaming data to AWS destinations, Firehose is more suitable.
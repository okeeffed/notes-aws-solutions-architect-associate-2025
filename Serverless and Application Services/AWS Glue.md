---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Glue
---
## What is AWS Glue? #card 

AWS Glue is a serverless data integration service that makes it easy for analytics users to discover, prepare, move, and integrate data from multiple sources. You can use it for analytics, machine learning, and application development. 

It also includes additional productivity and data ops tooling for authoring, running jobs, and implementing business workflows.

- It operates as a serverless ETL.
	- There is another ETL product Data Pipeline, but that uses in-account compute with EMR clusters.
- Moves and transforms data between **source** and **destination**.
- **Crawls** data sources and generates the **AWS Glue Data catalog**.
- Data sources:
	- Stores: S3, RDS, JDBC (Java Database Connectivity) compatible and DynamoDB.
	- Streams: Kinesis Data Stream & Apache Kafka
- Data targets:
	- S3, RDS, JDBC databases.

![[glue.png]]

https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html

### What is a Glue Data Catalog? #card 

- Persistent metadata about data sources in region.
- One catalog per region per account.
- Avoids data silos and helps visibility of data across the organisation.
- Amazon Athena, Redshift Spectrum, EMR & AWS Lake Formations all use Data Catalog by configuring crawlers and letting them get to work.

https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html

## Exam tips

- Normally questions would only have Data Pipeline.
- If you see both services, look for keywords like cost-effective, serverless.
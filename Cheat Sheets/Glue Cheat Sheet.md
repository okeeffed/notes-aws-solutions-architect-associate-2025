---
cards-deck: AWS Exams::Cheat Sheets::Glue
---
# What is AWS Glue #card

AWS Glue is a fully managed service for **extracting, transforming, and loading (ETL)** data for analytics.

---

## AWS Glue Components #card

- **Data Catalog** – Centralized metadata repository.
- **ETL Engine** – Executes transformation scripts.
- **Scheduler** – Manages job execution timing.

---

## AWS Glue Use Cases #card

- **Query S3 Data Lake** – Discover and transform data.
- **Analyze Logs in Warehouse** – Flatten and enrich data.
- **Event-driven ETL Pipelines** – Trigger jobs from S3 with AWS Lambda.
- **Unified Data View** – Centralized metadata management across data stores.

---

## AWS Glue Data Catalog #card

- Persistent **metadata store**.
- One **Data Catalog per AWS region**.
- Can be used as the **Hive metastore**.

---

## AWS Glue Database #card

- Logical grouping of **tables**.
- Deleting a database **deletes all tables**.
- Supports **resource links** for shared access.

---

## AWS Glue Tables #card

- **Metadata definitions** for structured/unstructured data.
- Sources: **JSON, CSV, Parquet, Avro, XML**.
- Can be manually created or inferred via **crawlers**.

---

## AWS Glue Crawlers #card

- **Discovers schema** and populates the Data Catalog.
- Supports **S3, JDBC, DynamoDB, MongoDB**.
- Can run **on-demand or scheduled**.
- **Incremental crawls** reduce reprocessing.

---

## AWS Glue Jobs #card

- **Executes ETL workloads**.
- Types:
  - **Spark (Scala/PySpark)**
  - **Streaming ETL**
  - **Python Shell**
- **Worker Types**:
  - **Standard**
  - **G.1X (Memory-intensive)**
  - **G.2X (ML transforms)**
- **Job Properties**:
  - **Bookmarks** – Prevent duplicate processing.
  - **Timeouts** – Limit execution duration.
  - **Retries** – Auto-retry failed jobs.

---

## AWS Glue Security #card

- **IAM Policies** control access.
- Supports **cross-account Data Catalog sharing**.
- **Data encryption**:
  - **S3 (SSE-S3, SSE-KMS)**
  - **CloudWatch Logs**
  - **Job Bookmarks**
- **SSL encryption** for data in transit.

---

## AWS Glue Schema Registry #card

- **Manages data schemas across streaming applications**.
- Supports **Avro, JSON, and other formats**.
- **10 registries per AWS account per region**.
- **1000 schema versions per region**.

---

## AWS Glue DataBrew #card

- **Visual data preparation tool**.
- **250+ transformations** for cleaning and normalizing data.
- Auto-generates **40+ data quality statistics**.

---

## AWS Glue Flex #card

- **Optimizes cost** for non-urgent workloads.
- **Runs on spare compute capacity**.
- **35% cost savings** over standard jobs.

---

## AWS Glue Data Quality #card

- **Built on DeeQu** for data quality monitoring.
- **25+ predefined rules** for validation.
- **Data Quality Score** to assess data health.
- **Pay-as-you-go pricing**.

---

## AWS Glue Sensitive Data Detection #card

- **Detects PII** (Personal Identifiable Information).
- Uses **pattern matching and ML**.
- Supports **custom PII patterns**.
- **Redact or mask sensitive data** before storage.

---

## AWS Glue for Ray #card

- **Distributed Python processing framework**.
- Supports **Apache Arrow-based datasets**.
- **Works with Glue Studio Notebooks, SageMaker, and local IDEs**.

---

## AWS Glue Monitoring #card

- **CloudTrail** logs API calls.
- **CloudWatch Events** automate actions.
- **CloudWatch Logs** store execution details.
- **Apache Spark UI** for debugging.

---

## AWS Glue Pricing #card

- **Charged hourly** based on Data Processing Units (DPUs):
  - **ETL Jobs**
  - **Crawlers**
  - **Data Catalog Storage & Requests**

---

## References

- [AWS Glue Documentation](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html)
- [AWS Glue Pricing](https://aws.amazon.com/glue/pricing/)
- [AWS Glue FAQs](https://aws.amazon.com/glue/faqs/)

---
cards-deck: AWS Exams::Cheat Sheets::CloudWatch
---
# Amazon CloudWatch Cheat Sheet

## What is Amazon CloudWatch? #card

- CloudWatch is a monitoring tool for AWS resources and applications.
- It collects, stores, and analyzes metrics, allowing for the creation of alarms.
- CloudWatch does not aggregate data across regions; each region is independent.
- Metrics from AWS services are automatically sent to CloudWatch, but custom metrics can also be added.

## CloudWatch Concepts

### Namespace in CloudWatch? #card

- A **namespace** is a container for CloudWatch metrics.
- There is no default namespace.
- AWS service namespaces follow the `AWS/service` naming convention.

### What are CloudWatch Metrics? #card

- Metrics represent a time-ordered set of data points.
- Exist only in the region where they are created.
- Cannot be deleted but expire after 15 months if no new data is received.
- Timestamping: Data points can be up to 2 weeks old or 2 hours into the future.
- Some AWS services provide free metrics; others require enabling detailed monitoring.
- Metric math allows combining multiple metrics with expressions.

### EC2 Metrics CloudWatch agent provides? #card 

- Memory utilization and disk space usage for EC2 require installing CloudWatch Agent.

### What are Dimensions in CloudWatch? #card

- **Dimensions** are name/value pairs that uniquely identify a metric.
- Up to 10 dimensions can be assigned per metric.
- Adding a unique dimension creates a new variation of that metric.

### What is Resolution in CloudWatch? #card

- **Standard Resolution:** 1-minute granularity (default AWS service metrics).
- **High Resolution:** 1-second granularity (provides deeper insights).

### What are Statistics in CloudWatch? #card

- **Statistics** aggregate metric data over specified periods.

Key statistics include:

- **Minimum:** Lowest value observed.
- **Maximum:** Highest value observed.
- **Sum:** Total of all values.
- **Average:** Sum / SampleCount.
- **SampleCount:** Number of data points used in the calculation.
- **Percentiles:** Distribution of metric data (e.g., p95.45).

### What are Percentiles in CloudWatch? #card

- Percentiles indicate the relative standing of a value in a dataset.
- Used to analyze distribution and variability of metric data.

## CloudWatch Alarms

### What is a CloudWatch Alarm? #card

- Watches a single metric over time and performs an action based on threshold breaches.
- Can be used for CPU monitoring, instance management, or billing alerts.
- Dashboards display alarms with colour coded states.

### What are the Alarm States in CloudWatch? #card

- **OK**: Metric is within the defined threshold.
- **ALARM**: Metric is outside the defined threshold.
- **INSUFFICIENT_DATA**: The alarm has just started, data is missing, or unavailable.

### How does CloudWatch handle missing data in alarms? #card

- **Missing:** Ignores missing data (default behaviour).
- **NotBreaching:** Treats missing data as within threshold.
- **Breaching:** Treats missing data as breaching threshold.
- **Ignore:** Maintains the current state.

### How do you configure CloudWatch Alarms? #card

- **Period:** Time length for evaluating the metric.
- **Evaluation Period:** Number of periods to assess before changing alarm state.
- **Datapoints to Alarm:** Number of breaching data points required to trigger an alarm.

## CloudWatch Dashboards

### What is a CloudWatch Dashboard? #card

- Customizable home page for monitoring AWS resources across regions.
- No limit on the number of dashboards.
- Dashboards are global, not region-specific.

Users can share dashboards in three ways:

- **Specific users with email and password.**
- **Public link sharing.**
- **SSO integration via Amazon Cognito.**

## CloudWatch Events (Amazon EventBridge)

### What is Amazon EventBridge? #card

- Event-driven service for responding to AWS environment changes.
- Routes system events to processing targets based on rules.
- Enhances CloudWatch Events by allowing third-party and SaaS integration.

### What are the key concepts in EventBridge? #card

- **Events:** Indicate a change in the AWS environment.
- **Targets:** Process events e.g., Lambda, SNS, SQS, Step Functions.
- **Rules:** Match incoming events and route them to targets.

## CloudWatch Logs

### What are CW Logs? #card

- Stores and analyzes logs from AWS services and applications.
- Logs are retained indefinitely by default.
- Allows monitoring of EC2 instance logs, CloudTrail logs, and Route 53 DNS queries.

### CW Logs Insights? #card

- Interactive querying and analysis of logs using structured queries.
- Provides quick filtering and searching for patterns in log data.

### Metric Filters in CW Logs? #card

- Metric filters define patterns in logs and publish them as CloudWatch metrics.
- Filters only apply to new data, not retroactively.

Key filter concepts

- **Filter Pattern:** Defines search criteria in logs.
- **Metric Name:** Name of the metric receiving log information.
- **Namespace:** Destination namespace for the new metric.
- **Default Value:** Value reported if no matching logs are found.

## CloudWatch Agent

### What is the CW Agent? #card

- Collects logs and system metrics from EC2 and on-premises servers.
- Needs to be installed manually.
- Uses `CWAgent` as the default namespace for collected metrics.
- Supports **StatsD** and **collectd** for custom application metrics.

## CloudWatch Metric Streams

### CW Metric Streams? #card

- Provides near real-time metric streams to third-party services.
- Supports Datadog, New Relic, Splunk, Dynatrace, Sumo Logic, and S3 as destinations.

## CloudWatch Application Insights

### CW Application Insights? #card

- Provides observability for applications and AWS infrastructure.
- Automates the detection of performance issues.

### How does CW Application Insights work? #card

- **Discovery:** Scans resources and recommends key metrics/logs.
- **Preprocessing:** Analyzes data for anomalies and errors.
- **Detection:** Uses classification algorithms to identify problems.
- **Alerts:** Generates CloudWatch Events when problems are detected.

### Retention period for CW Application Insights data? #card

- **Problems:** Retained for 55 days.
- **Observations:** Retained for 60 days.

## CloudWatch Pricing

### What are the pricing factors for CloudWatch? #card

- Metrics are billed per month.
- API calls are charged per 1,000 requests.
- Dashboards are billed per month.
- Alarms incur charges per standard/high-resolution metrics.
- Logs are charged per GB stored and analyzed.
- Data Transfer **IN** is free; **OUT** incurs charges.
- **Metric Streams:** Billed per 1 million events.
- **Logs Insights:** Charged based on log data scanned per query.

---

## Amazon CloudWatch Cheat Sheet Resources

- [Amazon CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [Amazon CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
- [AWS Training – Amazon CloudWatch](https://www.youtube.com/user/AmazonWebServices/search?query=cloudwatch)
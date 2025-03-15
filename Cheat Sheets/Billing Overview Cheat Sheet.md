# AWS Billing and Cost Management Cheat Sheet

AWS Billing and Cost Management provides tools to **track, analyze, and optimize** your AWS usage and costs.

---

## AWS Cost Explorer #card

- **Tracks and analyzes AWS usage** (free for all accounts)
- **Provides reports** for up to **12 months of past data**
- **Forecasts** spending for the next **3 months**
- **Identifies top cost-accruing AWS services**
- **Must be enabled** before use (root credentials required)
- **Linked accounts** in an organization automatically inherit Cost Explorer access

---

## AWS Budgets #card

- **Set custom budgets** for cost and usage
- **Monitor RI and Savings Plans utilization**
- **Alerts via email or SNS topic** when usage exceeds budgeted amount
- **Updated up to 3 times a day**
- **Types of budgets:**
  - Cost budgets – Plan AWS spending
  - Usage budgets – Track service usage
  - RI utilization budgets – Alert when RI usage is low
  - RI coverage budgets – Alert when RI coverage falls below threshold
- **First two budgets are free**

---

## AWS Cost and Usage Reports #card

- **Provides detailed cost and usage breakdown** in **CSV format**
- **Stored in Amazon S3**
- **Supports tracking RI utilization, charges, and allocations**
- **Time granularity options:**
  - Hourly
  - Daily
  - Monthly
- **Reports can be uploaded to AWS Redshift and QuickSight**

---

## AWS Free Tier #card

- **Automatically included for 12 months** after account creation
- **Usage limits apply** (exceeding limits incurs charges)
- **Use AWS Budgets to track Free Tier usage**

---

## AWS Cost Anomaly Detection #card

- **Uses machine learning** to detect and alert on **anomalous spend patterns**
- **Custom alert thresholds** via SNS and email notifications
- **Weekly, monthly, or custom timeframes** for evaluation

---

## AWS Billing Conductor #card

- **Customizable pricing and cost visibility**
- **Aggregated view of costs across AWS accounts**
- **Uses Billing Groups** to organize cost tracking

---

## AWS Billing and Cost Management Features #card

- **Bills:** See details about your **current charges**
- **Payment History:** Track **past payments**
- **Cost Allocation Tags:** Track AWS costs on a **detailed level**
  - **AWS-generated tags**
  - **User-defined tags**
- **Billing Period Closure:** AWS **closes the billing period at midnight** on the last day of each month
- **Invoices available as downloadable PDFs**

---

## AWS CloudWatch Billing Alerts #card

- **Set up billing alerts** to notify when AWS usage exceeds thresholds
- **Uses CloudWatch for automated cost monitoring**

---

## References

- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)
- [AWS Cost and Usage Reports](https://aws.amazon.com/aws-cost-management/aws-cost-and-usage-reporting/)
- [AWS Billing FAQs](https://aws.amazon.com/aws-cost-management/faqs/)
- [AWS Billing Documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2)

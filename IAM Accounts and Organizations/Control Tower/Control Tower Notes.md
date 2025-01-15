---
cards-deck: AWS Exams::Solutions Architect::Associate::Control Tower
---
## What is AWS Control Tower? #card

- It has one job: allowing quick and easy setup of multi-account environments.
- It orchestrates the AWS services to provide this functionality (including AWS Organizations).
- It uses Organizations, IAM Identity Center, CloudFormation, Config and more.

It comprises of a few parts parts:

1. Landing Zone
2. Guard Rails
3. Account Factory
4. Dashboard

![[control-tower.png]]
https://aws.amazon.com/controltower/

### What is the Landing Zone within Control Tower? #card

**A landing zone is a well-architected, multi-account AWS environment based on security and  compliance best practices**. AWS Control Tower automates the setup of a new landing zone using best-practices blueprints for identity, federated access, and account structure.

Examples of blueprints that are automatically implemented in your landing zone include the following:

- Create a multi-account environment using AWS Organizations.
- Provide identity management using the default directory found within AWS IAM Identity Center.
- Provide federated access to accounts using IAM Identity Center.
- Centralise logging from AWS CloudTrail and AWS Config stored in Amazon Simple Storage Service (Amazon S3).
- Enable cross-account [security audits](https://docs.aws.amazon.com/general/latest/gr/aws-security-audit-guide.html) using IAM Identity Center.

Within your landing zone you can optionally configure log retention, AWS CloudTrail trails, AWS KMS Keys, and AWS account access. The landing zone set up by AWS Control Tower is managed using a set of mandatory and optional controls. Mandatory controls are always applied on your behalf by AWS Control Tower, while optional controls can be self-selected based on your unique needs to ensure accounts and configurations comply with your policies.

https://aws.amazon.com/controltower/features/

### What are the the Guard Rails/Comprehensive Controls Management within Control Tower? #card

Comprehensive controls management in AWS Control Tower **helps you reduce the time it takes to define, map, and manage the controls required to meet your most common control objectives such as enforcing least privilege, restricting network access, and enforcing data encryption**.

Controls are prepackaged governance rules for security, operations, and compliance that you can select and apply enterprise-wide or to specific groups of accounts. A control is expressed in plain English and enforces a specific governance policy for your AWS environment that can be enabled within an AWS Organizations organizational unit (OU). Controls can be detective, preventive, or proactive and can be either mandatory or optional.

Detective controls (for example, Detect whether public read access to Amazon S3 buckets is allowed) continuously monitor deployed resources for nonconformance. Preventive controls establish intent and prevent deployment of resources that don’t conform to your policies (for example, Enable AWS CloudTrail in all accounts). Proactive control capabilities use [AWS CloudFormation Hooks](https://aws.amazon.com/blogs/mt/proactively-keep-resources-secure-and-compliant-with-aws-cloudformation-hooks/) to proactively identify and block the CloudFormation deployment of resources that are not compliant with the controls you have enabled. You can disallow actions that lead to policy violations and detect noncompliance of resources at scale. In addition, you get updated configurations and technical documentation so you can more quickly benefit from AWS services and features.

Note: This may have been renamed from **Guard Rails** to **Comprehensive Controls Management**. See the link for more info https://aws.amazon.com/controltower/features/

### What is the the Account Factory within Control Tower? #card

The **account factory automates provisioning of new accounts in your organization**. As a configurable account template, it helps you standardise provisioning of new accounts by using the AWS Control Tower predefined account blueprint with default resources, configurations, or VPC settings. 

You can also define and implement your own custom account resources and requirements in addition to the pre-approved account configurations. By configuring your account factory with pre-approved network configuration and AWS Region selections, you enable self-service for your builders to configure and provision new accounts. Additionally, you can take advantage of AWS Control Tower solutions, such as Account Factory for Terraform, to automate the provisioning and customisation of an account managed by AWS Control Tower in Terraform that meets your business and security policies, before delivering it to end users.

https://aws.amazon.com/controltower/features/


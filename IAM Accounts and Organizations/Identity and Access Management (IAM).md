---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS IAM
---
## Links and resources

- https://tutorialsdojo.com/aws-identity-and-access-management-iam/

## What are IAM identity policies? #card 

IAM policies are a type of policy the either allow or deny access to AWS resources.

- A set of security statements.
- Allows or denies access AWS services.
- Allow or deny is derived from all policy statements that apply for user, their role and service policies combined.
- Implicitly denies access. You must explicitly allow. An explicit deny will override everything.

![[iam-policy-document.png]]
## What is an IAM Policy Document made up of? #card

- Sid = Statement ID. 
- Effect is either **Allow** or **Deny**.
- Action is an action for an AWS service actions that the statement applies to.
- The **Resource** array contains a list of resource IDs for what the statement affects.
- For overlap statements, there are different priorities:
	- Explicit **Deny** will overrule any other statements.
	- Explicit **Allow** will lose out to an explicit deny.
	- Implicit **Deny** is the fallback.

![[iam-policy-document.png]]

## What are IAM Users? #card 

An _IAM user_ is an entity that you create in your AWS account. The IAM user represents the human user or workload who uses the IAM user to interact with AWS resources. An IAM user consists of a name and credentials.

- IAM users are an identity used for anything requiring long-term AWS access i.e. humans, applications or service accounts.

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html

## What is a Principal (in relation to IAM)? #card 

- **Principal** represents an entity trying to access an AWS account.
	- Could be a person or application.
- Once a **principal** is **authenticated** using something like access keys/username and password etc., it becomes an **authenticated identity**.

![[iam-users-principal-auth.png]]

## What are ARNs? #card

- Stands for **Amazon Resource Name**.
- Uniquely identifies resources within any AWS account.
	- `arn:partition:service:region:account-id:resource-id`
	- `arn:partition:service:region:account-id:resource-type:resource-id`
	- `arn:partition:service:region:account-id:resource-type/resource-id`
- Some examples:
	- `arn:aws:s3:::catgifs` - refers to a bucket.
	- `arn:aws:s3:::catgifs/*` - refers to all objects within a bucket.
- If you have missing fields like above, it means it's omitted. S3 is global so you don't need it.

## IAM stats you need to know #card 

- 5000 IAM users per account is the limit.
- An IAM user can be a member of 10 groups. 
- This has system design impacts.
- Internet-scale applications and large orgs + org merges need to work around this limit.

## What are IAM groups? #card 

- They are **containers** for IAM Users.
- Users can be a part of multiple groups.
- There is no default group that contains all users.
- No nesting.
- 300 groups max.
- Groups can't be referenced as a **principal** in a policy.
	- It's easy to overestimate the features that groups provides.

![[iam-groups.png]]

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html

## IAM Roles #card

- A type of identity that belongs to an account.
- A role does not have any credentials associated with it.
- An IAM user can assume a role to temporarily take on different permissions for a specific task. A role can be assigned to a federated user who signs in by using an external identity provider instead of IAM. They get **temporary credentials** to enable them to access what is specified within the **permissions policy**.
- **AWS service role** is a role that a service assumes to perform actions in your account on your behalf. This service role must include all the permissions required for the service to access the AWS resources that it needs.
    - **AWS service role for an EC2 instance** is a special type of service role that a service assumes to launch an EC2 instance that runs your application. This role is assigned to the EC2 instance when it is launched.
    - **AWS service-linked role** is a unique type of service role that is linked directly to an AWS service. Service-linked roles are predefined by the service and include all the permissions that the service requires to call other AWS services on your behalf.
- An instance profile is a container for an IAM role that you can use to pass role information to an EC2 instance when the instance starts.
- Roles are assume using the **STS service**.

![[iam-roles.png]]

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html

## Explain the difference between a Permission Policy and Trust Policy #card 

- The trust policy controls which identities can **assume the role**.
- Permissions policies specify which services can be accessed using this role.

![[iam-roles-policies.png]]

### When to use IAM Roles

An example they give is assigning a role for AWS Lambda.

![[when-to-use-iam-roles.png]]

Other examples:

- Elevate for a break-glass situation.
- Identity federated which works around the hard 5000 IAM user limit.
- Working in a multi-account environment. You can assume a role to access another AWS account.

### What are Service-Linked Roles? #card

- **Definition**: Predefined IAM permissions that allow **IAM Identity Center** to delegate and enforce single sign-on (SSO) access for users to specific AWS accounts within an AWS Organization.
- **Functionality**:
    - Provisioned in every AWS account in the organization.
    - Enable other AWS services (e.g., IAM Identity Center) to leverage these roles for service-related tasks.

You can't delete a service-linked role until it is no longer required.

### IAM Identity Center and Service-Linked Roles #card

- When **IAM Identity Center** is enabled:
    - A **service-linked role** is created in all accounts within the AWS Organization.
    - The same role is automatically created in any **new accounts** added to the organization.
    - **Purpose**: Allows IAM Identity Center to access resources in each account **on your behalf**.

### Naming of Service-Linked Roles #card

- **Default Name**: `AWSServiceRoleForSSO`
- **Purpose**: Standardised naming for ease of identification and management.

## What is a PassRole? #card 

-  **iam:PassRole** is a special permission within IAM that enables you to associate an IAM role with a specific resource. 
 - **Passing a role** refers to the process of linking an IAM role to a resource, which in turn dictates the actions the resource can perform on other AWS services.  
 - Although **PassRole** is classified as a WRITE operation, it’s not an action that can be invoked through API/CLI calls. As a result, you can’t directly audit it in CloudTrail

### Practical Scenarios for **Service-Linked Roles**

1. **IAM Identity Center**: Automatically provisioning the `AWSServiceRoleForSSO` role in all AWS accounts to enable single sign-on (SSO).
2. **AWS Config**: Automatically creating a service-linked role to record and evaluate compliance of resources against AWS Config rules.
3. **Amazon ECS**: Using a service-linked role to allow ECS to manage clusters and tasks within your AWS account automatically.

### Practical Scenarios for **PassRole**

1. **Lambda Launching EC2**: A Lambda function passes an IAM role to an EC2 instance to allow it access to S3 for data processing.
2. **CodePipeline Deployments**: CodePipeline passes an IAM role to CodeDeploy for deploying applications to EC2 instances.
3. **Batch Job Execution**: An AWS Batch job passes an IAM role to a compute environment, enabling it to write logs to CloudWatch or access specific S3 buckets.



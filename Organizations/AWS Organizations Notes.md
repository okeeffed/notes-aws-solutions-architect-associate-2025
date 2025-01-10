---
cards-deck: AWS Exams::Solutions Architect::Associate::Organizations
---

## What are AWS Organizations? #card

- It's a product that allows larger business to manage multiple accounts with little-to-no overhead.
- Without organizations, business would need to manage many accounts by themselves.
- It works by taking a single AWS account to create a AWS organisation.
	- You USE the account to create the organisation.
	- It's called the **management account** (previously **master account**, also known as **payer account**).
- Using a **management account**, you can invite other accounts into the organisation.
	- When joining an **organisation**, the accounts become a **member account**.
	- Individual billing methods are removed from those accounts and moved to the **management account**
- If you create an account within the organization, it becomes a **member account** by default.
- If using federation, we can use "role switch" in order to switch into different accounts within an **organization**.
	- If you invite an account into the organization, this needs to be done manually.
	- This is automatic for accounts created from the **management account**.
	- The standard name when creating a role for another account is **OrganizationAccountAccessRole**.

## What is the organizational root? #card

- The **organization root** is a container that contains member accounts, and can also contain other containers call **organizational units** (OU).
	- The **organization root** is just the root of the tree.

## What are Service Control Policies (SCP)? #card 

- A feature of **AWS Organizations**.
- The SCP is a JSON policy document that can attached to organizations either via a "container" like the **organizational root**, or a **organizational unit OU**, or **directly to one or more accounts**.
	- The **management account** is **exempt** from service control policies. This also is a good take away that you shouldn't use AWS services within the **management account**.
- SCPs limit what the account can do (including the root user), but they do not grant permissions. They just enable boundaries or what is or isn't allowed within accounts.
- Explicit Deny **allows wins**.

## SCP example: Full AWS Access #card

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": "*",
			"Resource": "*"
		}
	]
}
```

## SCP Example: Denying S3 and EC2 #card

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Deny",
			"Action": ["s3:*", "ec2:*"],
			"Resource": "*"
		}
	]
}
```

## What is the link between SCPs and Identity Policies within accounts? #card

You can think of IAM and SCP as a Venn diagram, with any given identity having access based on both the IAM policy allowing so and the SCP policy allowing that service.

## Links and further reading

- https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html
- https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html
- https://constructs.dev/packages/@pepperize/cdk-organizations/v/0.7.978?lang=typescript

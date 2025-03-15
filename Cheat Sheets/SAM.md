---
cards-deck: AWS Exams::Cheat Sheets::SAM
---
# What is Serverless Application Model (SAM)? #card

AWS Serverless Application Model (SAM) is an **open-source framework** for building and deploying **serverless applications**.

---

## What is AWS SAM? #card

AWS SAM is an open-source framework that provides **shorthand syntax** to define AWS serverless applications, which are then expanded into **AWS CloudFormation templates**.

---

## How SAM Works #card

- You **define** your application in a YAML or JSON template.
- SAM **transforms** this template into an **AWS CloudFormation** template.
- You **deploy** your serverless application using AWS CloudFormation.
- The **SAM CLI** allows local testing and debugging of your functions.

---

## SAM CLI Features #card

- **Build** serverless applications locally.
- **Validate** your SAM templates.
- **Invoke** Lambda functions locally.
- **Deploy** applications to AWS Cloud.
- **Fetch logs** from AWS CloudWatch.

---

## Template Anatomy #card

### Transform Section #card

- Required when writing **AWS SAM templates**.
- Defines the version of **AWS SAM syntax**.
- Example:
  ```yaml
  Transform: AWS::Serverless-2016-10-31
  ```

### Globals Section #card

- Defines **common properties** for all AWS SAM resources.
- Used to **avoid repetition** across the template.

### Resources Section #card

- Defines AWS **CloudFormation resources** and **SAM resources**.

---

## AWS SAM Resources #card

### `AWS::Serverless::Api` #card

- Defines an **API Gateway** resource.
- Allows full control over API configuration.

### `AWS::Serverless::Application` #card

- Embeds **nested serverless applications** from AWS **Serverless Application Repository** or **S3**.

### `AWS::Serverless::Function` #card

- Defines an **AWS Lambda** function.
- Can include **event sources** like:
  - **S3**
  - **DynamoDB Streams**
  - **Kinesis Data Streams**

### `AWS::Serverless::LayerVersion` #card

- Defines a **Lambda layer**.
- Used to **share libraries** between Lambda functions.

### `AWS::Serverless::SimpleTable` #card

- Provides a **simplified way** to define **DynamoDB tables**.

---

## Common SAM CLI Commands #card

### `sam init` #card

- Generates **pre-configured** AWS SAM templates.

### `sam local invoke` #card

- **Runs** a Lambda function locally.

### `sam local start-api` #card

- **Starts** a local API Gateway instance.

### `sam validate` #card

- **Validates** the AWS SAM template.

### `sam build` #card

- **Builds** Lambda functions with dependencies.

### `sam deploy` #card

- **Deploys** an AWS SAM application.

### `sam logs` #card

- Fetches **CloudWatch logs** for a Lambda function.

---

## Controlling API Access #card

### Lambda Authorizers #card

- **Custom authorization** logic using AWS Lambda.
- Supports **two types**:
  - **Token-based** (e.g., JWT, OAuth token).
  - **Request parameter-based** (e.g., headers, query strings).

### Amazon Cognito User Pools #card

- Provides **built-in user authentication** for APIs.
- Uses **access tokens** to authorize API requests.

---

## AWS SAM Pricing #card

- **AWS SAM is free** to use.
- You pay for **AWS resources** provisioned by the **CloudFormation stack**.

---

## References

- [AWS SAM Overview](https://aws.amazon.com/serverless/sam/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [AWS CloudFormation Transform Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

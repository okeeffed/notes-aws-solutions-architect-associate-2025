---
cards-deck: AWS Exams::Cheat Sheets::Cognito Cheat Sheet
---
# What is Amazon Cognito #card

Amazon Cognito is a **user management and authentication service** that integrates with web and mobile applications.

---

## Cognito Features #card

- **User authentication and authorization** for web and mobile apps
- **Supports external identity providers** (SAML, OpenID Connect, Google, Facebook, Apple, etc.)
- **Provides temporary AWS credentials** via Identity Pools
- **Uses JSON Web Tokens (JWTs)** for token authentication

---

## Cognito User Pools

### CG User Pools #card

- **User directories** that handle sign-up and sign-in
- **Supports federation** with external IdPs (third-party providers)
- **Alias-based sign-ins** (email, phone number, or username)
- **Stores user profile data in a single AWS Region**

### CG User Pool Tokens #card

- **Access tokens** – Grant access to protected resources
- **Refresh tokens** – Obtain new access or ID tokens
- **Configurable expiration times** (5 minutes to 24 hours for access tokens, up to 10 years for refresh tokens)

### CG User Management #card

- Users can sign up via:
  - **App registration**
  - **Admin-created accounts**
  - **Bulk import**
- Supports **user groups** to manage permissions via IAM roles

---

## Cognito Identity Pools

### CG Identity Pools #card

- **Provides AWS resource access** via temporary credentials
- **Supports anonymous guest users**
- **Federates access via:**
  - Cognito User Pools
  - Social sign-in (Google, Facebook, Amazon)
  - OpenID Connect & SAML providers
  - Developer authenticated identities

### CG Temporary AWS Credentials #card

- Uses **IAM roles** to control permissions
- Uses **AssumeRoleWithWebIdentity** to obtain temporary AWS credentials

---

## Common Cognito Use Cases

### CG Authenticate Users #card

- **Use User Pools** to manage authentication
- **Tokens validate user access** to APIs and resources

### CG Secure API Access #card

- **Use API Gateway + Lambda** with Cognito for authentication
- **API Gateway validates Cognito tokens** before granting access

### CG AWS Service Access #card

- **Use Identity Pools** to grant temporary AWS credentials

### CG AWS AppSync Integration #card

- **Use Cognito authentication for GraphQL APIs**

---

## Cognito Sync

### CG Data Synchronization #card

- Syncs data **across devices** using Cognito Sync
- Supports **up to 20MB per user**
- Uses **Kinesis Streams** for pushing sync store data

---

## Cognito Security Features

### CG Advanced Security #card

- **Detects unusual sign-in activity**
- **Assigns risk scores** and prompts for MFA verification
- **Identifies compromised credentials** and enforces password resets

---

## Cognito Lambda Integration

### CG Lambda Triggers #card

- **Trigger custom logic** during user sign-up, sign-in, and authentication events
- **Lambda execution timeout: 5 seconds**
- **Max retries: 3 attempts**

---

## Cognito Pricing #card

- **User Pool pricing** – Based on **Monthly Active Users (MAUs)**
- **Free tier:**
  - **50,000 MAUs** for direct sign-in & social login
  - **50 MAUs** for SAML identity federation
- **Advanced security features** incur additional charges
- **SMS MFA verification uses Amazon SNS** (additional costs apply)

---

## References

- [Amazon Cognito Overview](https://aws.amazon.com/cognito/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [Amazon Cognito FAQs](https://aws.amazon.com/cognito/faqs/)

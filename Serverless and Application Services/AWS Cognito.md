---
cards-deck: AWS Exams::Solutions Architect::Associate::AWS Cognito
---
## What is Amazon Cognito? #card 

Implement secure, frictionless customer identity and access management that scales.

It provides authentication, Authorisation and user management for web/mobile apps.

It provided two pieces of functionality:

1. User Pools.
2. Identity Pools.

**Please note:** Identity Pools and User Pools can work together.

https://aws.amazon.com/pm/cognito

### What are Cognito User Pools? #card

**User Pools**: Goal is to sign-in and get a JSON web token. They **do not provide access to AWS services**. 

An Amazon Cognito user pool is a user directory for web and mobile app authentication and authorisation. From the perspective of your app, an Amazon Cognito user pool is an OpenID Connect (OIDC) identity provider (IdP). A user pool adds layers of additional features for security, identity federation, app integration, and customisation of the user experience.

You can, for example, verify that your users’ sessions are from trusted sources. You can combine the Amazon Cognito directory with an external identity provider. With your preferred AWS SDK, you can choose the API authorisation model that works best for your app. And you can add AWS Lambda functions that modify or overhaul the default behaviour of Amazon Cognito.

Think of a database of users when talking about user pools.

https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html

![[cognito-user-pools.png]]
### What are Cognito Identity Pools #card 

**Identity Pools**: Exchanges an external identity for **temporary AWS Credentials**.

Identity pools generate temporary AWS credentials for the users of your app, whether they’ve signed in or you haven’t identified them yet. With AWS Identity and Access Management (IAM) roles and policies, you can choose the level of permission that you want to grant to your users. Users can start out as guests and retrieve assets that you keep in AWS services. Then they can sign in with a third-party identity provider to unlock access to assets that you make available to registered members. 

The third-party identity provider can be a consumer (social) OAuth 2.0 provider like Apple or Google, a custom SAML or OIDC identity provider, or a custom authentication scheme, also called a _developer provider_, of your own design.

![[cognito-identity-pools.png]]

https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html

### What are the features of Cognito Identity Pools #card 

**Sign requests for AWS services**

[Sign API requests](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html) to AWS services like Amazon Simple Storage Service (Amazon S3) and Amazon DynamoDB. Analyse user activity with services like Amazon Pinpoint and Amazon CloudWatch.

**Filter requests with resource-based policies**

Exercise granular control over user access to your resources. Transform user claims into [IAM session tags](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html), and build IAM policies that grant resource access to distinct subsets of your users.

**Assign guest access**

For your users who haven’t signed in yet, configure your identity pool to generate AWS credentials with a narrow scope of access. Authenticate users through a single sign-on provider to elevate their access.

**Assign IAM roles based on user characteristics**

Assign a single IAM role to all of your authenticated users, or choose the role based on the claims of each user.

**Accept a variety of identity providers**

Exchange an ID or access token, a user pool token, a SAML assertion, or a social-provider OAuth token for AWS credentials.

**Validate your own identities**

Perform your own user validation and use your developer AWS credentials to issue credentials for your users.

### How do User Pools and Identity Pools work together? #card 

- Starting with a user pool, the identity authenticated is a **Cognito User Pool user with a JWT token**. Now we have one **user store** to manage (Cognito User Pool).
- The application can pass the **user pool token** into the **identity pool** to obtain **temporary credentials**.
- This is great for web scale identities that gets around the 5000 IAM user limit.

![[cognito-user-pool-identity-pool-together.png]]
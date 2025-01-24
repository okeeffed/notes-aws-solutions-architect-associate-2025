---
cards-deck: AWS Exams::Solutions Architect::Associate::Tutorials Dojo::AWS Storage Gateway
---
### AWS Storage Gateway #card

AWS Storage Gateway is a hybrid cloud storage service that bridges on-premises storage with AWS Cloud storage. It enables seamless integration between local and cloud systems through a gateway, which can be a virtual machine or a physical appliance.

### Types of Storage Gateway #card

1. File gateway
2. Volume gateway
3. Tape gateway

### File Gateway #card

- **Purpose**: Provides access to Amazon S3 through a file interface using SMB or NFS protocols.
- **Features**:
  - Allows integration with **Microsoft Active Directory** (on-premises or AWS-hosted).
  - Supports S3 storage classes: **Standard**, **Standard-IA**, **One Zone-IA**.
  - Files can be moved to **S3 Glacier** or **S3 Glacier Deep Archive** using lifecycle policies.
- **Use Case**: Access S3 as if it were a mountable file share.

### Volume Gateway #card 

- **Purpose**: Offers block storage to on-premises applications via iSCSI.
- **Modes**:
  - **Cached Mode**: Stores primary data in S3, with frequently accessed data cached locally.
  - **Stored Mode**: Stores the entire dataset locally, asynchronously backing up to S3.
- **Features**:
  - Creates **EBS snapshots** for use with EC2.
- **Use Case**: Applications needing block storage with backup to AWS.

### Tape Gateway #card 

- **Purpose**: Provides a cloud-based Virtual Tape Library (VTL) for archival.
- **Features**:
  - Uses Amazon S3 for virtual tapes.
  - Tapes can be archived to **S3 Glacier** or **S3 Glacier Deep Archive**.
  - Supports iSCSI devices for integration with on-premises backup applications.
- **Use Case**: Replacing physical backup tapes while preserving existing workflows.

### Data Movement to Amazon S3 Glacier #card

- **File Gateway**:
  - Files stored in S3 can be transitioned to Glacier using **lifecycle policies**.
  - Files in Glacier are not directly accessible via File Gateway; they must be restored first.

- **Tape Gateway**:
  - Data on virtual tapes is stored in S3 Standard during backup.
  - Archived tapes are moved to Glacier or Deep Archive after ejection from the backup application.

### Integration with Active Directory #card

- **File Gateway SMB File Share**:
  - Can authenticate users via **Microsoft Active Directory** or guest access.

- **Setup Steps**:
    1. Go to the Active Directory settings of the SMB file share.
    2. Enter the domain name for the gateway to join.
    3. Provide domain credentials with permissions to join a server to the domain.
    4. Optionally specify an organizational unit or domain controllers.
    5. Save the settings.
- **Benefits**:
    - Allows users to authenticate with AD before accessing the file share.
    - Enables administrators to set access permissions for AD users and groups.

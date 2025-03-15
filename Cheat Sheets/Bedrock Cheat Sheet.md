---
cards-deck: AWS Exams::Cheat Sheets::Bedrock
---
# What is Amazon Bedrock? #card

Amazon Bedrock enables you to **build and scale generative AI applications** to generate text, images, audio, and artificial data based on prompts.

---

## Bedrock Features #card

- **Model Choice** – Access foundation models from AI21 Labs, Anthropic, Cohere, Meta, Stability AI, and Amazon.
- **Customization** – Fine-tune models with your data using techniques like Retrieval Augmented Generation (RAG).
- **Agents** – Automate tasks across enterprise systems and data sources.
- **Serverless** – No infrastructure management required.
- **Integration** – Securely integrate generative AI into AWS services.

---

## Bedrock Additional Capabilities

### BD Playgrounds #card

- **Experiment with text, image, and chat models** before using them in applications.

### BD Example Library #card

- **AWS SDK code examples** available in the AWS Doc SDK Examples GitHub repo.

### BD API #card

- **Amazon Bedrock API** provides access to model actions and parameters.

### BD Embeddings #card

- **Generates vector representations** of text and images for unstructured data processing.

### BD Agents #card

- **AI-powered assistants** built on Bedrock models for multi-step task execution.

### BD Knowledge Base #card

- **Centralized data repository** for enhanced retrieval augmented generation (RAG).

### BD Provisioned Throughput #card

- **Fixed-cost model throughput** for Amazon and third-party base models.

### BD Fine-Tuning #card

- **Train and customize foundation models** with proprietary unlabeled data.

### BD Model Invocation Logging #card

- **Optional logging feature** to track model input/output in AWS.

### BD Model Versioning #card

- **Manage and use different versions** of a model for version control.

---

## Bedrock Pricing

### BD On-Demand #card

- **Pay-per-use pricing** based on tokens processed or images generated.
- **Text-generation models** – Charged per input and output token.
- **Embedding models** – Charged per input token.
- **Image-generation models** – Charged per image.
- **No additional cross-region inference costs**.

### BD Batch Processing #card

- **Submit multiple prompts** at once for batch inference.
- **50% discount compared to On-Demand pricing** for selected models.

### BD Provisioned Throughput #card

- **Guaranteed throughput for high-volume inference** workloads.
- **Available in 1-month or 6-month commitment terms**.
- **Custom models require this pricing plan**.

### BD Model Customization #card

- **Training costs based on token processing and model storage**.
- **Inference for custom models is charged under Provisioned Throughput**.
- **First model unit available without commitment**.

### BD Model Evaluation #card

- **Automatic evaluations are billed per inference**.
- **Human-based evaluations** – $0.21 per completed task.
- **AWS-managed evaluations** – Custom pricing.

---

## References

- [Amazon Bedrock Overview](https://aws.amazon.com/bedrock/)
- [Amazon Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)

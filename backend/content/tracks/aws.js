module.exports = {
  slug: 'aws',
  title: 'AWS & Cloud',
  subtitle: 'Compute, storage, networking, IAM',
  description: 'AWS/cloud interview questions: core services (EC2, S3, RDS, Lambda, DynamoDB), VPC networking, IAM, high availability, cost optimization and architecture scenarios.',
  category: 'devops',
  roles: ['devops', 'backend', 'fullstack'],
  icon: 'cloud',
  color: '#FF9900',
  order: 55,
  topics: [
    {
      slug: 'core-services',
      title: 'Core Services',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain IaaS, PaaS, SaaS and serverless with AWS examples.',
          e: `
- **IaaS (Infrastructure as a Service):** raw compute, storage, networking; you manage OS and up. *EC2, EBS, VPC.*
- **PaaS (Platform as a Service):** you deploy code; platform manages servers/runtime. *Elastic Beanstalk, App Runner, RDS (managed DB).*
- **SaaS:** complete software used by end users. *Gmail, Slack (on AWS: WorkMail, QuickSight).*
- **Serverless / FaaS:** run functions or use services billed per use with no servers to manage. *Lambda, DynamoDB, S3, API Gateway, SQS, Fargate (serverless containers).*`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which AWS service is object storage with 11 nines of durability?',
          o: ['EBS', 'S3', 'EFS', 'Glacier only'],
          a: 1,
          e: 'S3 stores objects in buckets; storage classes (Standard, IA, Glacier) trade access speed for cost. EBS is block storage for EC2; EFS is a shared file system.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which service runs code in response to events without managing servers?',
          o: ['EC2', 'AWS Lambda', 'RDS', 'Route 53'],
          a: 1,
          e: 'Lambda is triggered by API Gateway, S3 events, SQS, EventBridge schedules, DynamoDB streams, etc. Max 15 minutes per invocation.',
        },
        {
          t: 'qa', l: 2,
          q: 'When would you use RDS, Aurora, DynamoDB or ElastiCache?',
          e: `
- **RDS:** managed relational DB (Postgres, MySQL, SQL Server...) – automated backups, Multi-AZ failover, read replicas.
- **Aurora:** AWS-built MySQL/Postgres-compatible DB with distributed storage (6 copies across 3 AZs), faster failover, up to 15 low-lag replicas, Serverless v2.
- **DynamoDB:** serverless key-value/document NoSQL; single-digit ms latency at any scale; design around access patterns (partition key/sort key, GSIs); on-demand or provisioned capacity.
- **ElastiCache (Redis/Valkey, Memcached):** in-memory caching, sessions, leaderboards, pub/sub.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between SQS and SNS?',
          o: ['Identical', 'SQS is a pull-based queue (one consumer per message); SNS is push-based pub/sub fan-out to many subscribers', 'SNS stores messages for 14 days', 'SQS sends SMS'],
          a: 1,
          e: 'A common pattern: SNS topic fanning out to multiple SQS queues so each service processes independently. EventBridge adds rich event routing.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which compute option runs containers without managing EC2 instances?',
          o: ['EC2 Auto Scaling', 'AWS Fargate (with ECS or EKS)', 'Lightsail', 'Elastic IP'],
          a: 1,
          e: 'Fargate is serverless compute for containers; you specify CPU/memory per task/pod.',
        },
      ],
    },
    {
      slug: 'networking-security',
      title: 'VPC, Networking & IAM',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain a typical VPC setup with public and private subnets.',
          e: `
- **VPC:** isolated virtual network (e.g. \`10.0.0.0/16\`) in a region.
- **Subnets** per Availability Zone:
  - **Public subnets:** route \`0.0.0.0/0\` to an **Internet Gateway**; hold load balancers, NAT gateways, bastions.
  - **Private subnets:** no direct internet; app servers and databases live here. Outbound internet via a **NAT Gateway** in a public subnet.
- **Route tables** control routing per subnet.
- **Security groups:** stateful firewalls on instances/ENIs (allow rules only).
- **NACLs:** stateless subnet-level allow/deny rules.
- **VPC endpoints** to reach S3/DynamoDB and other services privately without NAT.

Typical: ALB in public subnets -> app (ECS/EKS/EC2) in private subnets -> RDS in isolated DB subnets, spread across 2-3 AZs.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Security group vs Network ACL?',
          o: ['Same thing', 'Security groups are stateful and attached to resources (allow rules only); NACLs are stateless, at subnet level, with allow and deny rules', 'NACLs are stateful', 'Security groups work at the subnet level'],
          a: 1,
          e: 'Stateful means return traffic is automatically allowed.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are IAM users, groups, roles and policies? What is least privilege?',
          e: `
- **Policy:** JSON document defining allowed/denied actions on resources (\`s3:GetObject\` on \`arn:aws:s3:::bucket/*\`).
- **User:** identity for a person/app with long-term credentials (avoid for apps).
- **Group:** collection of users sharing policies.
- **Role:** identity with **temporary credentials** assumed by services (EC2 instance profile, Lambda execution role, EKS IRSA/Pod Identity), federated users or other accounts.

**Least privilege:** grant only the permissions needed, scoped to specific resources; use roles instead of access keys, enable MFA, use SSO (IAM Identity Center), review with Access Analyzer.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How should an application on EC2 access S3 securely?',
          o: ['Hard-code access keys in the code', 'Attach an IAM role (instance profile) with a least-privilege policy; the SDK gets temporary credentials automatically', 'Make the bucket public', 'Store keys in environment variables in git'],
          a: 1,
          e: 'Roles rotate credentials automatically and avoid leaked long-lived keys.',
        },
      ],
    },
    {
      slug: 'architecture-cost',
      title: 'High Availability & Cost',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Regions vs Availability Zones vs Edge locations?',
          e: `
- **Region:** geographic area (us-east-1, eu-west-1) with multiple AZs; data stays in the region unless you replicate it.
- **Availability Zone:** one or more isolated data centers within a region with independent power/network, connected by low-latency links. Deploy across **≥ 2 AZs** for high availability.
- **Edge locations / PoPs:** used by CloudFront (CDN), Route 53 and Global Accelerator to serve users with low latency.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Design a highly available, scalable web application on AWS.',
          e: `
~~~
Route 53 (DNS, health checks) -> CloudFront (CDN, WAF, Shield)
   -> ALB (multi-AZ, public subnets)
      -> ECS Fargate / EKS / EC2 Auto Scaling Group (private subnets, ≥ 2 AZs)
          -> ElastiCache Redis (Multi-AZ)
          -> Aurora/RDS Multi-AZ + read replicas (DB subnets)
          -> S3 for files (served via CloudFront)
          -> SQS/SNS/EventBridge + Lambda/workers for async jobs
Observability: CloudWatch metrics/logs/alarms, X-Ray tracing
Security: IAM roles, Secrets Manager, KMS encryption, security groups
IaC: Terraform/CDK, CI/CD pipeline
~~~
**DR:** automated backups, cross-region snapshot copy or Aurora Global Database for multi-region.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you reduce AWS costs?',
          e: `
- **Right-size** instances based on metrics (Compute Optimizer)
- **Savings Plans / Reserved Instances** for steady workloads; **Spot instances** for fault-tolerant/batch workloads (up to 90% off)
- **Auto scaling** and scale to zero for non-prod (schedules)
- **S3 lifecycle policies** & Intelligent-Tiering; delete old snapshots/logs
- Use **Graviton (ARM)** instances
- Reduce **data transfer**: CloudFront, VPC endpoints instead of NAT Gateway for S3/DynamoDB
- Serverless for spiky low-volume workloads
- Tagging + **Cost Explorer / Budgets / anomaly detection** for visibility`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which purchasing option is best for a fault-tolerant batch job that can be interrupted?',
          o: ['On-Demand', 'Spot Instances', 'Dedicated Hosts', 'Reserved Instances for 3 years'],
          a: 1,
          e: 'Spot uses spare capacity at large discounts but can be reclaimed with a 2-minute warning.',
        },
      ],
    },
  ],
};

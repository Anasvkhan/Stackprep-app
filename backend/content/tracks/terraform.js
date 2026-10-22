module.exports = {
  slug: 'terraform',
  title: 'Terraform & IaC',
  subtitle: 'State, modules, workflows',
  description: 'Terraform interview questions: providers, resources, state management, modules, workspaces, plan/apply workflow, drift and best practices.',
  category: 'devops',
  roles: ['devops'],
  icon: 'settings',
  color: '#7B42BC',
  order: 56,
  topics: [
    {
      slug: 'basics',
      title: 'Core Concepts',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Terraform and how does it work?',
          e: `
**Terraform** is a declarative Infrastructure as Code tool. You describe the desired infrastructure in **HCL**, and Terraform figures out how to reach it.

**Workflow**
~~~bash
terraform init      # download providers, configure backend
terraform fmt / validate
terraform plan      # show changes (diff between config, state and real infra)
terraform apply     # make the changes
terraform destroy   # tear down
~~~
**Building blocks:** providers (AWS, GCP, Kubernetes...), resources, data sources, variables, outputs, modules, and the **state** file mapping config to real resources.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the purpose of the Terraform state file?',
          o: ['It stores the provider binaries', 'It maps resources in your configuration to real-world infrastructure and tracks metadata so Terraform can compute changes', 'It stores logs', 'It is a backup of your code'],
          a: 1,
          e: 'State may contain secrets, so store it securely in a remote backend.',
        },
        {
          t: 'qa', l: 2,
          q: 'How should Terraform state be managed in a team?',
          e: `
- Use a **remote backend**: S3 (+ native lockfile / DynamoDB lock), GCS, Azure Storage, or Terraform Cloud/HCP.
- Enable **state locking** to prevent concurrent applies corrupting state.
- **Encrypt** state at rest and restrict access (it can contain secrets).
- Enable **versioning** on the bucket for recovery.
- Split state by environment/component (smaller blast radius, faster plans).
- Never edit state by hand; use \`terraform state mv/rm\`, \`import\` blocks, \`moved\` blocks for refactors.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does "terraform plan" do?',
          o: ['Applies changes immediately', 'Shows the execution plan: which resources will be created, changed or destroyed, without making changes', 'Deletes the state', 'Formats code'],
          a: 1,
          e: 'Save plans with -out and apply that exact plan in CI for safety.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a data source in Terraform?',
          o: ['A resource that creates databases', 'A read-only lookup of existing information (e.g. latest AMI, existing VPC) for use in configuration', 'A variable file', 'A backend'],
          a: 1,
          e: 'data "aws_ami" "ubuntu" { most_recent = true ... }',
        },
      ],
    },
    {
      slug: 'advanced',
      title: 'Modules, Environments & Best Practices',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are Terraform modules and why use them?',
          e: `
A **module** is a reusable container of Terraform resources with input variables and outputs (e.g. a "vpc" or "ecs-service" module).

~~~hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "prod"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b"]
}
~~~
**Benefits:** DRY code, consistency across environments, encapsulation, versioning. Pin module and provider versions.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which is a common way to manage dev, staging and prod with Terraform?',
          o: ['One state file for everything', 'Separate directories/state per environment reusing shared modules (or workspaces / Terragrunt), with environment-specific variables', 'Copy-pasting resources manually', 'Running apply from laptops only'],
          a: 1,
          e: 'Separate state isolates environments; shared modules keep them consistent.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is configuration drift?',
          o: ['A Terraform syntax error', 'When real infrastructure differs from what is defined in code (e.g. manual console changes)', 'Slow plans', 'Provider version mismatch'],
          a: 1,
          e: 'terraform plan reveals drift; schedule drift detection in CI and avoid manual changes.',
        },
        {
          t: 'mcq', l: 3,
          q: 'How do you bring an existing manually-created resource under Terraform management?',
          o: ['Delete and recreate it', 'Use terraform import (or an import block) and write matching configuration', 'Edit the state file by hand', 'It is not possible'],
          a: 1,
          e: 'Terraform 1.5+ import blocks can even generate configuration with plan -generate-config-out.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Design a safe Terraform workflow for a team of 10 engineers.',
          e: `
- Code in Git; changes via **pull requests**.
- CI runs \`fmt -check\`, \`validate\`, \`tflint\`, security scanning (\`checkov\`/\`tfsec\`/\`trivy\`) and posts \`terraform plan\` output on the PR (Atlantis, Terraform Cloud, GitHub Actions).
- Reviewers approve the plan; **apply happens from CI** (not laptops) using an OIDC-assumed role with least privilege.
- Remote state with locking, per environment; production applies require extra approval.
- Pinned provider/module versions; reusable modules in a registry.
- Scheduled drift detection; policy as code (OPA/Sentinel) for guardrails (no public S3 buckets, required tags).`,
        },
      ],
    },
  ],
};

module.exports = {
  slug: 'ci-cd',
  title: 'CI/CD & DevOps Practices',
  subtitle: 'Pipelines, deployments, GitOps',
  description: 'CI/CD interview questions: continuous integration, delivery vs deployment, pipeline design, deployment strategies, GitOps, DevOps metrics and incident practices.',
  category: 'devops',
  roles: ['devops', 'backend', 'fullstack', 'mobile'],
  icon: 'loop',
  color: '#7C3AED',
  order: 54,
  topics: [
    {
      slug: 'fundamentals',
      title: 'CI/CD Fundamentals',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is the difference between Continuous Integration, Continuous Delivery and Continuous Deployment?',
          e: `
- **Continuous Integration (CI):** developers merge to the main branch frequently; every push triggers an automated **build + tests** to catch issues early.
- **Continuous Delivery:** every change that passes the pipeline is **deployable** to production at any time; the actual release is a **manual approval**.
- **Continuous Deployment:** every passing change is **automatically deployed** to production – no manual step.

Goal: small, frequent, low-risk releases with fast feedback.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What stages would you include in a CI/CD pipeline for a web API?',
          e: `
1. **Trigger** on PR / push to main
2. **Install & cache dependencies**
3. **Lint & format check, type check**
4. **Unit tests** (+ coverage threshold)
5. **Security scans:** dependency audit (SCA), SAST, secret scanning
6. **Build** artifact / Docker image (tagged with commit SHA), image vulnerability scan
7. **Integration tests** (Testcontainers / docker-compose services)
8. **Push image** to registry
9. **Deploy to staging** -> smoke tests / E2E
10. **Approval** (delivery) or automatic (deployment)
11. **Deploy to production** with a safe strategy (rolling/canary/blue-green) + DB migrations
12. **Post-deploy checks**, monitoring, automatic rollback on SLO breach
13. **Notify** (Slack)`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which of these is a CI/CD tool?',
          o: ['Jira', 'GitHub Actions / GitLab CI / Jenkins', 'Figma', 'Postman'],
          a: 1,
          e: 'Others: CircleCI, Azure DevOps, Bitbucket Pipelines, Argo CD (CD/GitOps), Tekton.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why tag Docker images with the git commit SHA instead of only "latest"?',
          o: ['It looks better', 'Immutable, traceable versions make deployments reproducible and rollbacks reliable', '"latest" is not allowed', 'SHA tags are smaller'],
          a: 1,
          e: '"latest" is mutable and ambiguous; you cannot tell which code is running or roll back precisely.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should secrets used by a CI pipeline (e.g. registry password) be stored?',
          o: ['Committed in the pipeline YAML', 'In the CI system\'s encrypted secrets store or via OIDC federation to the cloud (no long-lived keys)', 'In a README', 'In the Docker image'],
          a: 1,
          e: 'GitHub Actions OIDC lets workflows assume an AWS/GCP role with short-lived credentials.',
        },
      ],
    },
    {
      slug: 'deployment-strategies',
      title: 'Deployment Strategies',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain blue-green, canary, rolling and feature-flag deployments.',
          e: `
- **Rolling:** replace instances gradually (Kubernetes default). Low cost; old and new versions run together briefly.
- **Blue-green:** two identical environments; deploy to green, test, then **switch traffic** at once. Instant rollback by switching back. Costs double capacity during release.
- **Canary:** release to a **small % of users** (1% -> 10% -> 50% -> 100%) while monitoring error rates/latency; roll back automatically if metrics degrade.
- **Feature flags:** deploy code dark and **enable features at runtime** for specific users/percentages; decouples deploy from release; kill switch for bad features.
- **Shadow (dark launch):** mirror production traffic to the new version without returning its responses.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which strategy exposes a new version to a small percentage of real traffic first?',
          o: ['Big bang', 'Canary release', 'Recreate', 'Blue-green with 100% switch'],
          a: 1,
          e: 'Canary limits blast radius and validates with real production signals.',
        },
        {
          t: 'qa', l: 3,
          q: 'How do you handle database migrations with zero-downtime deployments?',
          e: `
During a rolling/blue-green deploy, **old and new code run at the same time**, so schema changes must be backward compatible. Use **expand-and-contract**:

1. **Expand:** add new columns/tables (nullable or with defaults); don't remove or rename anything yet.
2. Deploy code that **writes to both** old and new structures and reads from the old (or new with fallback).
3. **Backfill** existing data in batches.
4. Deploy code that **reads from the new** structure.
5. **Contract:** after all old code is gone, drop the old column.

Also: avoid long table locks (\`CREATE INDEX CONCURRENTLY\`, online schema change tools like gh-ost), run migrations as a separate pipeline step, and make them idempotent.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is GitOps?',
          o: ['Using Git only for docs', 'Using a Git repository as the single source of truth for declarative infrastructure/app config, with an agent (Argo CD/Flux) continuously reconciling the cluster to match Git', 'Running Git on Kubernetes', 'A Git hosting provider'],
          a: 1,
          e: 'Changes happen via pull requests; rollback = git revert; drift is detected and corrected automatically.',
        },
      ],
    },
    {
      slug: 'devops-culture',
      title: 'DevOps Metrics & Reliability',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are the DORA metrics?',
          e: `
Four key metrics of software delivery performance (from the DORA research / "Accelerate"):
1. **Deployment frequency** – how often you deploy to production
2. **Lead time for changes** – commit to production time
3. **Change failure rate** – % of deployments causing incidents/rollbacks
4. **Time to restore service (MTTR)** – how fast you recover from failures

Elite teams deploy on demand (multiple times/day) with lead time < 1 day, low failure rates and recovery in < 1 hour. A fifth metric, reliability, is often added.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the purpose of a blameless post-mortem?',
          o: ['Find who to fire', 'Understand the root causes and systemic factors of an incident and create action items to prevent recurrence, without blaming individuals', 'Delay the next release', 'Write marketing copy'],
          a: 1,
          e: 'Blameless culture encourages honesty, so real causes (missing tests, alerts, runbooks) get fixed.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is Infrastructure as Code (IaC)?',
          o: ['Writing apps in assembly', 'Managing infrastructure through versioned, declarative config files (Terraform, CloudFormation, Pulumi) instead of manual console clicks', 'Running code on servers', 'Documenting servers in Word'],
          a: 1,
          e: 'Benefits: reproducibility, code review, automation, drift detection and disaster recovery.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your CI pipeline takes 45 minutes and developers are frustrated. How do you speed it up?',
          e: `
- **Measure** each stage to find the slowest.
- **Cache** dependencies (npm/gradle/pip), Docker layers (BuildKit cache, registry cache), build outputs (Nx/Turborepo remote cache).
- **Parallelize** jobs (lint, unit, integration in parallel) and **shard tests** across runners.
- **Run only what changed:** affected-project detection in monorepos, path filters.
- Move slow E2E tests to post-merge or nightly; keep a fast smoke suite on PRs.
- Use **faster runners** (more CPU, self-hosted, ARM), smaller base images.
- Fix **flaky tests** that cause reruns.
- Fail fast: run cheap checks first.`,
        },
      ],
    },
  ],
};

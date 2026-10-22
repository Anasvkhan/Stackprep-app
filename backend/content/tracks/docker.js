module.exports = {
  slug: 'docker',
  title: 'Docker',
  subtitle: 'Images, containers, Compose',
  description: 'Docker interview questions: containers vs VMs, images and layers, Dockerfile best practices, multi-stage builds, networking, volumes, Compose and security.',
  category: 'devops',
  roles: ['backend', 'fullstack', 'devops', 'software-engineer'],
  icon: 'sailing',
  color: '#2496ED',
  order: 52,
  topics: [
    {
      slug: 'basics',
      title: 'Containers & Images',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Docker? Container vs virtual machine?',
          e: `
**Docker** packages an application with its dependencies into a portable **container** that runs the same everywhere.

| | Container | Virtual Machine |
|---|---|---|
| Isolation | Process-level (namespaces, cgroups), **shares host kernel** | Full guest OS on a hypervisor |
| Size | MBs | GBs |
| Startup | Milliseconds-seconds | Minutes |
| Overhead | Very low | Higher |
| Security isolation | Weaker (shared kernel) | Stronger |

Containers solve "works on my machine", speed up CI/CD and enable microservices and orchestration (Kubernetes).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between an image and a container?',
          o: ['They are the same', 'An image is a read-only template; a container is a running (or stopped) instance of an image with a writable layer', 'A container is a stored template', 'Images run processes'],
          a: 1,
          e: 'Like a class (image) and an object (container).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do Docker image layers and build caching work?',
          e: `
Each Dockerfile instruction (\`FROM\`, \`RUN\`, \`COPY\`...) creates a **read-only layer**. Layers are cached and shared between images.

If a layer changes, **all layers after it are rebuilt**. So order instructions from least to most frequently changing:
~~~dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./        # changes rarely
RUN npm ci --omit=dev        # cached unless dependencies change
COPY . .                     # source changes often
CMD ["node", "server.js"]
~~~
Copying the source before \`npm ci\` would reinstall dependencies on every code change.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between CMD and ENTRYPOINT?',
          o: ['No difference', 'ENTRYPOINT sets the executable that always runs; CMD provides default arguments (or default command) that can be overridden at docker run', 'CMD runs at build time', 'ENTRYPOINT is only for Windows'],
          a: 1,
          e: 'Use exec form (JSON array) so the process is PID 1 and receives signals like SIGTERM.',
        },
        {
          t: 'mcq', l: 2,
          q: 'COPY vs ADD in a Dockerfile?',
          o: ['Identical', 'COPY copies local files; ADD can also extract local tar archives and fetch URLs – prefer COPY for clarity', 'ADD is faster', 'COPY can download URLs'],
          a: 1,
          e: 'Docker best practice is COPY unless you need ADD\'s tar auto-extraction.',
        },
      ],
    },
    {
      slug: 'dockerfile-best-practices',
      title: 'Dockerfile Best Practices',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is a multi-stage build and why use it?',
          e: `
Multi-stage builds use multiple \`FROM\` stages; the final image copies only the needed artifacts, leaving build tools behind.

~~~dockerfile
# build stage
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# runtime stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
~~~
**Benefits:** much smaller images (faster pulls/deploys), smaller attack surface, no compilers/secrets in production images.`,
        },
        {
          t: 'qa', l: 2,
          q: 'List Dockerfile best practices for production.',
          e: `
- Use **small, official base images** (alpine/slim/distroless) and **pin versions** (\`node:22.11-alpine\`, or digest)
- **Multi-stage builds**
- Order layers for **cache efficiency**; combine related \`RUN\` steps and clean package caches
- **.dockerignore** (node_modules, .git, .env, logs)
- Run as a **non-root user** (\`USER node\`)
- **No secrets** in images (use build secrets / runtime env / secret managers)
- **Exec form** CMD/ENTRYPOINT for proper signal handling; one main process per container
- Add a **HEALTHCHECK** (or rely on orchestrator probes)
- Scan images (Trivy, Docker Scout) and rebuild regularly for patches`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should containers not run as root?',
          o: ['Root is slower', 'If the app is compromised, root in the container increases the risk of escaping to or damaging the host', 'Root cannot open ports', 'Docker forbids root'],
          a: 1,
          e: 'Least privilege: use USER, drop capabilities, read-only filesystems where possible.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is .dockerignore used for?',
          o: ['Ignoring containers', 'Excluding files from the build context sent to the Docker daemon (smaller, faster, no secrets)', 'Ignoring errors', 'Hiding images'],
          a: 1,
          e: 'Exclude node_modules, .git, build outputs, .env, etc.',
        },
      ],
    },
    {
      slug: 'networking-storage-compose',
      title: 'Networking, Volumes & Compose',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain Docker volumes vs bind mounts.',
          e: `
Container filesystems are **ephemeral** – data is lost when the container is removed.

- **Volumes:** managed by Docker (\`/var/lib/docker/volumes\`), portable, best for persistent data (databases). \`-v pgdata:/var/lib/postgresql/data\`
- **Bind mounts:** map a specific host path into the container. Great for **development** (live code reload). \`-v $(pwd):/app\`
- **tmpfs:** in-memory, for sensitive/temporary data.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'In Docker Compose, how does the api service connect to the postgres service named "db"?',
          o: ['Using localhost:5432', 'Using the service name as hostname: db:5432 on the shared Compose network', 'Using the host machine IP only', 'Containers cannot talk to each other'],
          a: 1,
          e: 'Compose creates a user-defined network with built-in DNS; service names resolve to container IPs. localhost inside a container refers to the container itself.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does depends_on in Docker Compose guarantee by default?',
          o: ['The dependency is fully ready to accept connections', 'Only start order; use healthchecks with condition: service_healthy to wait for readiness', 'Automatic retries', 'Shared memory'],
          a: 1,
          e: 'Your app should also retry connections on startup.',
        },
        {
          t: 'qa', l: 1,
          q: 'Write a docker-compose.yml for a Node API with MongoDB and Redis.',
          e: `
~~~yaml
services:
  api:
    build: .
    ports: ["5000:5000"]
    environment:
      MONGODB_URI: mongodb://mongo:27017/app
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo: { condition: service_healthy }
      redis: { condition: service_started }
  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
  redis:
    image: redis:7-alpine
volumes:
  mongo-data:
~~~`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your container works locally but exits immediately in production with code 137. What does it mean and how do you debug?',
          e: `
**Exit code 137 = 128 + 9 (SIGKILL)** – usually the **OOM killer** (memory limit exceeded) or a forced stop.

**Debug**
- \`docker inspect <id>\` -> \`State.OOMKilled: true\`?
- Kubernetes: \`kubectl describe pod\` shows \`OOMKilled\`; check memory limits vs actual usage.
- Check app memory: Node heap size defaults vs container limit (\`--max-old-space-size\`), memory leaks, large in-memory data.

**Fix**
- Raise memory limits appropriately, fix leaks, stream large data, tune runtime memory settings.
- Other codes: 1 = app error, 126/127 = command not executable/not found, 143 = SIGTERM (graceful stop).`,
        },
      ],
    },
  ],
};

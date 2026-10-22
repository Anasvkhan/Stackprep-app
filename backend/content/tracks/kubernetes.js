module.exports = {
  slug: 'kubernetes',
  title: 'Kubernetes',
  subtitle: 'Pods, deployments, services, scaling',
  description: 'Kubernetes interview questions: architecture, pods, deployments, services, ingress, config & secrets, probes, autoscaling, storage, troubleshooting and security.',
  category: 'devops',
  roles: ['devops', 'backend', 'fullstack'],
  icon: 'hub',
  color: '#326CE5',
  order: 53,
  topics: [
    {
      slug: 'architecture',
      title: 'Architecture & Core Objects',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Kubernetes and what problems does it solve?',
          e: `
**Kubernetes (K8s)** is a container orchestration platform that automates deploying, scaling and managing containerized applications.

**Solves**
- Scheduling containers across a cluster of machines
- **Self-healing:** restarts failed containers, replaces pods on dead nodes
- **Scaling:** manual or automatic (HPA)
- **Service discovery & load balancing**
- **Rolling updates and rollbacks** with zero downtime
- Config and secret management, storage orchestration
- Declarative desired state (YAML) reconciled continuously`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the Kubernetes architecture (control plane and nodes).',
          e: `
**Control plane**
- **kube-apiserver:** front door; all components talk through it (REST)
- **etcd:** consistent key-value store holding the cluster state
- **kube-scheduler:** assigns pods to nodes based on resources, affinity, taints
- **kube-controller-manager:** runs controllers (Deployment, ReplicaSet, Node...) that reconcile actual vs desired state
- **cloud-controller-manager:** integrates with cloud APIs (load balancers, volumes)

**Worker nodes**
- **kubelet:** agent that ensures containers in assigned pods are running and healthy
- **kube-proxy:** programs networking rules for Services (iptables/IPVS) – or eBPF via Cilium
- **Container runtime:** containerd/CRI-O`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is a Pod?',
          o: ['A physical server', 'The smallest deployable unit: one or more containers sharing network namespace (IP) and storage volumes', 'A Docker image', 'A load balancer'],
          a: 1,
          e: 'Containers in a pod communicate via localhost. Sidecars (proxies, log shippers) run alongside the main container.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Deployment vs StatefulSet vs DaemonSet?',
          o: ['They are identical', 'Deployment: stateless replicas; StatefulSet: stable identities and storage per pod (databases); DaemonSet: one pod per node (log/monitoring agents)', 'DaemonSet is for databases', 'StatefulSet is for stateless apps'],
          a: 1,
          e: 'Jobs/CronJobs run to completion (batch, scheduled tasks).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which component stores the entire cluster state?',
          o: ['kubelet', 'etcd', 'kube-proxy', 'CoreDNS'],
          a: 1,
          e: 'Back up etcd regularly; losing it means losing cluster state.',
        },
      ],
    },
    {
      slug: 'networking',
      title: 'Services, Ingress & Networking',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain Service types: ClusterIP, NodePort, LoadBalancer and Ingress.',
          e: `
Pods are ephemeral with changing IPs; a **Service** gives a stable virtual IP/DNS name and load balances to matching pods (via label selectors).

- **ClusterIP** (default): reachable only inside the cluster – service-to-service traffic.
- **NodePort:** exposes the service on a static port (30000-32767) on every node.
- **LoadBalancer:** provisions a cloud load balancer with an external IP.
- **ExternalName:** DNS alias to an external host.

**Ingress** (not a Service type): L7 HTTP routing (host/path rules, TLS) to many services through one entry point, implemented by an ingress controller (NGINX, Traefik, AWS ALB). The newer **Gateway API** is its successor.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How does a Service know which pods to send traffic to?',
          o: ['By pod names', 'By label selectors matching pod labels (endpoints only include ready pods)', 'By IP whitelist', 'Randomly'],
          a: 1,
          e: 'Pods failing readiness probes are removed from Service endpoints.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does a NetworkPolicy do?',
          o: ['Configures DNS', 'Restricts which pods/namespaces/IPs can communicate with selected pods (firewall rules at L3/L4)', 'Creates load balancers', 'Encrypts traffic automatically'],
          a: 1,
          e: 'By default all pods can talk to each other; NetworkPolicies (enforced by the CNI, e.g. Calico/Cilium) implement zero-trust segmentation.',
        },
      ],
    },
    {
      slug: 'operations',
      title: 'Config, Probes, Scaling & Deployments',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain liveness, readiness and startup probes.',
          e: `
- **Liveness probe:** "is the container alive?" Failure -> kubelet **restarts** the container. Use for deadlocks/hung processes.
- **Readiness probe:** "can it serve traffic?" Failure -> pod removed from Service endpoints (no restart). Use during startup warm-up, dependency outages, or overload.
- **Startup probe:** for slow-starting apps; disables liveness/readiness until it succeeds, so the app isn't killed while booting.

~~~yaml
readinessProbe:
  httpGet: { path: /ready, port: 3000 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /health, port: 3000 }
  initialDelaySeconds: 10
  failureThreshold: 3
~~~
Don't make liveness depend on downstream services (DB) – a DB blip would restart every pod.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'ConfigMap vs Secret?',
          o: ['Identical', 'ConfigMap holds non-sensitive config; Secret holds sensitive data (base64-encoded, can be encrypted at rest and access-restricted with RBAC)', 'Secrets are encrypted by default with no setup', 'ConfigMaps are only for files'],
          a: 1,
          e: 'Secrets are only base64 by default – enable etcd encryption at rest and consider external secret managers (Vault, AWS Secrets Manager via External Secrets Operator).',
        },
        {
          t: 'qa', l: 2,
          q: 'What are resource requests and limits?',
          e: `
- **Requests:** guaranteed resources used by the **scheduler** to place pods (\`cpu: 250m\`, \`memory: 256Mi\`).
- **Limits:** maximum the container may use.
  - CPU over limit -> **throttled**
  - Memory over limit -> **OOMKilled**

**QoS classes:** Guaranteed (requests = limits), Burstable, BestEffort (none) – BestEffort pods are evicted first under pressure.

Set requests based on real usage (metrics), memory limit ≈ request to avoid noisy neighbors; many teams avoid CPU limits to prevent throttling.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the Horizontal Pod Autoscaler (HPA) do?',
          o: ['Adds nodes to the cluster', 'Adjusts the number of pod replicas based on metrics like CPU, memory or custom metrics', 'Increases pod CPU limits', 'Restarts pods'],
          a: 1,
          e: 'VPA adjusts requests/limits; Cluster Autoscaler/Karpenter adds/removes nodes; KEDA scales on event sources like queue length.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do rolling updates and rollbacks work in a Deployment?',
          e: `
A Deployment manages ReplicaSets. On a new image version it creates a new ReplicaSet and gradually shifts pods:
~~~yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # extra pods allowed during update
    maxUnavailable: 0  # never drop below desired capacity
~~~
New pods must pass readiness before old ones are terminated.

~~~bash
kubectl set image deploy/api api=myapp:v2
kubectl rollout status deploy/api
kubectl rollout undo deploy/api          # rollback
kubectl rollout history deploy/api
~~~
Other strategies: Recreate, blue-green and canary (Argo Rollouts, Flagger, service mesh).`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: A pod is stuck in CrashLoopBackOff. How do you troubleshoot?',
          e: `
1. \`kubectl get pods\` – restart count, status.
2. \`kubectl describe pod <pod>\` – events: image pull errors, OOMKilled, failing probes, missing ConfigMap/Secret, scheduling issues.
3. \`kubectl logs <pod> --previous\` – logs of the crashed container.
4. Common causes:
   - App error at startup (bad config/env var, can't reach DB)
   - **Liveness probe** too aggressive (killing a slow-starting app) -> add startup probe
   - OOMKilled -> raise memory limit / fix leak
   - Wrong command/entrypoint, missing file, permissions (non-root user)
5. Debug interactively: \`kubectl debug\` with an ephemeral container, or run the image locally with the same env.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'A pod is stuck in Pending. What is the most likely reason?',
          o: ['The app crashed', 'The scheduler cannot place it: insufficient CPU/memory on nodes, unsatisfied node selectors/affinity/taints, or unbound PersistentVolumeClaims', 'The image is too small', 'The Service is missing'],
          a: 1,
          e: 'kubectl describe pod shows FailedScheduling events with the reason.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What is Helm?',
          o: ['A container runtime', 'A package manager for Kubernetes that templates manifests into versioned, configurable charts', 'A monitoring tool', 'A CNI plugin'],
          a: 1,
          e: 'Alternatives/complements: Kustomize (overlays), and GitOps tools like Argo CD/Flux to sync manifests from Git.',
        },
      ],
    },
  ],
};

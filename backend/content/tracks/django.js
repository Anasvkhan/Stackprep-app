module.exports = {
  slug: 'django',
  title: 'Django',
  subtitle: 'MVT, ORM, DRF, security',
  description: 'Django interview questions: MVT architecture, ORM and query optimization, migrations, middleware, Django REST Framework, authentication and security.',
  category: 'frameworks',
  roles: ['backend'],
  icon: 'code',
  color: '#092E20',
  order: 35,
  topics: [
    {
      slug: 'core',
      title: 'Architecture & ORM',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain Django\'s MVT architecture and request lifecycle.',
          e: `
**MVT = Model, View, Template**
- **Model:** data and business rules, mapped to DB tables by the ORM
- **View:** receives a request, uses models, returns a response (like a controller)
- **Template:** HTML presentation

**Lifecycle:** request -> WSGI/ASGI server -> **middleware** (request phase) -> **URL resolver** (\`urls.py\`) -> **view** -> model/ORM -> template or JSON -> middleware (response phase) -> client.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What is the difference between select_related and prefetch_related?',
          e: `
Both prevent the **N+1 query problem**.

- **select_related:** SQL **JOIN** in a single query. For **ForeignKey / OneToOne** (forward relations).
~~~python
Order.objects.select_related("customer")
~~~
- **prefetch_related:** a **separate query** per relation, joined in Python. For **ManyToMany and reverse ForeignKey**.
~~~python
Author.objects.prefetch_related("books")
~~~
Inspect queries with Django Debug Toolbar or \`connection.queries\`.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When is a Django QuerySet actually executed against the database?',
          o: ['When it is defined', 'Lazily, when it is evaluated: iterated, sliced with a step, len(), list(), bool(), or printed', 'At server start', 'Never'],
          a: 1,
          e: 'Chaining filter()/exclude() just builds the query. Evaluated querysets are cached on that object.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you update a counter safely without race conditions in Django?',
          o: ['obj.count += 1; obj.save()', 'Use F() expressions: Post.objects.filter(id=pk).update(views=F("views") + 1)', 'Use a global variable', 'Use time.sleep'],
          a: 1,
          e: 'F() performs the increment in SQL atomically. select_for_update() inside a transaction is another option.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What do makemigrations and migrate do?',
          o: ['Same thing', 'makemigrations creates migration files from model changes; migrate applies them to the database', 'migrate creates models', 'They back up the database'],
          a: 1,
          e: 'Commit migration files to version control and run migrate during deployment.',
        },
      ],
    },
    {
      slug: 'drf-security',
      title: 'DRF, Middleware & Security',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are the main components of Django REST Framework?',
          e: `
- **Serializers:** convert models to JSON and validate input (\`ModelSerializer\`)
- **Views:** \`APIView\`, generic views, **ViewSets** with **Routers** for CRUD URLs
- **Authentication:** session, token, JWT (simplejwt)
- **Permissions:** \`IsAuthenticated\`, \`IsAdminUser\`, custom object-level permissions
- **Throttling, pagination, filtering** (django-filter)
- Browsable API and schema generation (drf-spectacular)

~~~python
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related("user")
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is Django middleware?',
          o: ['A database driver', 'Hooks that process every request/response globally (security, sessions, auth, CSRF, custom logging)', 'A template engine', 'A migration tool'],
          a: 1,
          e: 'Configured in the MIDDLEWARE setting; order matters.',
        },
        {
          t: 'qa', l: 2,
          q: 'Which security protections does Django provide out of the box?',
          e: `
- **CSRF protection** (CsrfViewMiddleware + \`{% csrf_token %}\`)
- **XSS protection:** templates auto-escape output
- **SQL injection protection:** the ORM parameterizes queries (be careful with \`raw()\`/\`extra()\`)
- **Clickjacking:** X-Frame-Options middleware
- **Password hashing** (PBKDF2 by default, Argon2 supported)
- Security settings: \`SECURE_SSL_REDIRECT\`, \`SESSION_COOKIE_SECURE\`, HSTS, \`ALLOWED_HOSTS\`
- Run \`python manage.py check --deploy\` before going to production. Never run with \`DEBUG=True\` in production.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What are Django signals and a caution about them?',
          o: ['HTTP status codes', 'Decoupled hooks (post_save, pre_delete) that fire on events; overusing them hides control flow and makes debugging harder', 'Database indexes', 'Cron jobs'],
          a: 1,
          e: 'Prefer explicit service functions for business logic; use Celery for slow side effects.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you run background tasks (emails, reports) in a Django app?',
          o: ['Inside the view with time.sleep', 'With a task queue like Celery (Redis/RabbitMQ broker) or RQ/Dramatiq', 'Using middleware', 'Using templates'],
          a: 1,
          e: 'Celery Beat handles periodic tasks.',
        },
      ],
    },
  ],
};

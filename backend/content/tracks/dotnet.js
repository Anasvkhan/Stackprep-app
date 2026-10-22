module.exports = {
  slug: 'dotnet',
  title: 'ASP.NET Core',
  subtitle: 'Middleware, DI, EF Core, APIs',
  description: 'ASP.NET Core interview questions: request pipeline and middleware, DI lifetimes, minimal APIs vs controllers, Entity Framework Core, authentication and performance.',
  category: 'frameworks',
  roles: ['backend', 'software-engineer'],
  icon: 'layers',
  color: '#512BD4',
  order: 34,
  topics: [
    {
      slug: 'pipeline-di',
      title: 'Pipeline, Middleware & DI',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the ASP.NET Core request pipeline and middleware.',
          e: `
The pipeline is a sequence of **middleware** components configured in \`Program.cs\`. Each one can handle the request, call the next, and act on the response.

~~~csharp
var app = builder.Build();
app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
~~~
**Order matters**: authentication before authorization, exception handling first. Custom middleware: \`app.Use(async (ctx, next) => { ...; await next(); })\`.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What are the DI service lifetimes in ASP.NET Core?',
          e: `
- **Transient** (\`AddTransient\`): new instance every time it is requested
- **Scoped** (\`AddScoped\`): one instance per HTTP request, e.g. \`DbContext\`
- **Singleton** (\`AddSingleton\`): one instance for the app lifetime, e.g. caches

**Captive dependency bug:** injecting a scoped service (DbContext) into a singleton keeps it alive forever, causing threading issues and stale data. Scope validation catches this in Development.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which lifetime should EF Core DbContext normally have?',
          o: ['Singleton', 'Scoped', 'Transient only', 'Static'],
          a: 1,
          e: 'DbContext is not thread-safe and tracks entities per unit of work (request). AddDbContext registers it as scoped.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why use IHttpClientFactory instead of new HttpClient() per request?',
          o: ['It is required by C#', 'Creating/disposing HttpClient per request can exhaust sockets; the factory pools handlers and respects DNS changes', 'It is shorter to type', 'It disables TLS'],
          a: 1,
          e: 'Typed clients via AddHttpClient<T>() also integrate with resilience policies (retries, circuit breakers).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Minimal APIs vs controllers?',
          o: ['Minimal APIs cannot use DI', 'Minimal APIs define endpoints with lambdas for lightweight services; controllers give a structured MVC model with filters and conventions. Both are fully supported', 'Controllers are deprecated', 'Minimal APIs only work on Azure'],
          a: 1,
          e: 'app.MapGet("/users/{id}", async (int id, AppDb db) => await db.Users.FindAsync(id));',
        },
      ],
    },
    {
      slug: 'efcore-security',
      title: 'EF Core, Auth & Performance',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are common EF Core performance tips?',
          e: `
- \`AsNoTracking()\` for read-only queries
- **Project** to DTOs with \`Select\` instead of loading full entities
- Avoid **N+1**: \`Include\`/\`ThenInclude\` or projections; split queries for big includes
- Filter and paginate **in the database** (keep IQueryable until the end)
- Add proper **indexes** through migrations
- \`ExecuteUpdate\`/\`ExecuteDelete\` for bulk operations, compiled queries for hot paths
- Async APIs and pooled contexts (\`AddDbContextPool\`)
- Log the generated SQL`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you apply database schema changes with EF Core?',
          o: ['Edit the database manually', 'Migrations: dotnet ef migrations add <Name>, then apply with dotnet ef database update (or SQL scripts/bundles in CI)', 'Drop and recreate the database', 'EF Core cannot change schemas'],
          a: 1,
          e: 'In production, generate idempotent SQL scripts or migration bundles and run them in the deployment pipeline.',
        },
        {
          t: 'qa', l: 2,
          q: 'How is JWT authentication configured in ASP.NET Core?',
          e: `
~~~csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => {
        o.Authority = "https://login.example.com";  // OIDC provider, signing keys fetched automatically
        o.Audience = "orders-api";
    });
builder.Services.AddAuthorization(o => o.AddPolicy("Admin", p => p.RequireRole("admin")));

app.UseAuthentication();
app.UseAuthorization();
app.MapDelete("/orders/{id}", DeleteOrder).RequireAuthorization("Admin");
~~~
Controllers use \`[Authorize]\` or \`[Authorize(Policy = "...")]\`; requirement handlers support resource-based authorization.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which built-in features help with resilience and performance in modern ASP.NET Core?',
          o: ['None', 'Output caching, response compression, rate limiting middleware, health checks and HybridCache', 'Only IIS settings', 'Global static variables'],
          a: 1,
          e: 'app.UseRateLimiter(), AddOutputCache() and AddHealthChecks() are built in.',
        },
      ],
    },
  ],
};

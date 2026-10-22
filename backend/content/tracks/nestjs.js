module.exports = {
  slug: 'nestjs',
  title: 'NestJS',
  subtitle: 'Modules, DI, guards, pipes',
  description: 'NestJS interview questions: modules, dependency injection, providers, controllers, guards, pipes, interceptors, exception filters, microservices and testing.',
  category: 'frameworks',
  roles: ['backend', 'fullstack'],
  icon: 'extension',
  color: '#E0234E',
  order: 32,
  topics: [
    {
      slug: 'core-concepts',
      title: 'Core Concepts & DI',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is NestJS and why use it over plain Express?',
          e: `
**NestJS** is a progressive Node.js framework written in TypeScript, inspired by Angular. It runs on Express (default) or Fastify.

**Why**
- **Opinionated architecture:** modules, controllers, providers -> consistent large codebases
- **Dependency injection** built-in -> loose coupling, easy testing
- **Decorators** for routing, validation, guards
- First-class support for **GraphQL, WebSockets, microservices, queues, CQRS**
- Great **testing utilities** and CLI scaffolding

Plain Express is minimal and flexible; Nest adds structure that scales with teams.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What are the three main building blocks of a NestJS application?',
          o: ['Routes, views, models', 'Modules, controllers, providers', 'Components, services, pipes', 'Actions, reducers, stores'],
          a: 1,
          e: 'Modules organize features, controllers handle requests, providers (services, repositories) contain injectable logic.',
        },
        {
          t: 'qa', l: 2,
          q: 'How does dependency injection work in NestJS?',
          e: `
- Classes decorated with \`@Injectable()\` are **providers**.
- They are registered in a module's \`providers\` array.
- Nest's **IoC container** creates instances and injects them via **constructor parameters** (resolved by TypeScript metadata).

~~~ts
@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get(':id') find(@Param('id') id: string) { return this.users.findOne(id); }
}

@Module({ controllers: [UsersController], providers: [UsersService, UsersRepository], exports: [UsersService] })
export class UsersModule {}
~~~
Custom providers: \`useClass\`, \`useValue\`, \`useFactory\` (async config), \`useExisting\`, with injection tokens.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the default scope of providers in NestJS?',
          o: ['Request scope', 'Singleton (one instance shared across the app)', 'Transient', 'Per module call'],
          a: 1,
          e: 'Singleton is default and best for performance. REQUEST scope creates an instance per request (and bubbles up the injection chain), TRANSIENT gives each consumer its own instance.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you use a service from UsersModule inside OrdersModule?',
          o: ['Import the file directly and call new UsersService()', 'Export UsersService from UsersModule and import UsersModule in OrdersModule', 'Declare it as global in main.ts', 'Use require()'],
          a: 1,
          e: 'Providers are module-scoped. Export them and import the module. @Global() modules exist but should be used sparingly.',
        },
        {
          t: 'mcq', l: 3,
          q: 'How do you resolve a circular dependency between two providers in NestJS?',
          o: ['It is impossible', 'Use forwardRef(() => OtherService) in @Inject (and forwardRef for modules), or better, refactor to remove the cycle', 'Make both REQUEST scoped', 'Use process.nextTick'],
          a: 1,
          e: 'forwardRef works but circular deps often indicate a design issue. Extracting shared logic into a third provider is cleaner.',
        },
      ],
    },
    {
      slug: 'request-lifecycle',
      title: 'Guards, Pipes, Interceptors & Filters',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain the NestJS request lifecycle.',
          e: `
Order of execution for an incoming request:

1. **Middleware** (global, then module-bound)
2. **Guards** – authorization: can this request proceed? (\`canActivate\`)
3. **Interceptors (before)** – logging, caching, transforming input
4. **Pipes** – validation and transformation of params/body
5. **Controller handler -> Service**
6. **Interceptors (after)** – transform response, map errors, timing
7. **Exception filters** – catch thrown exceptions and format the response

Mnemonic: **M-G-I-P-H-I-F**.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which NestJS component is best suited for role-based authorization?',
          o: ['Pipe', 'Guard', 'Interceptor', 'Exception filter'],
          a: 1,
          e: 'Guards decide whether a request is allowed (e.g. JwtAuthGuard + RolesGuard reading @Roles() metadata via Reflector).',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which component validates and transforms incoming DTOs?',
          o: ['Guard', 'Pipe (e.g. ValidationPipe with class-validator)', 'Middleware only', 'Module'],
          a: 1,
          e: 'app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) validates DTOs decorated with class-validator.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which component would you use to wrap all responses in { data, meta } and measure execution time?',
          o: ['Guard', 'Pipe', 'Interceptor', 'Filter'],
          a: 2,
          e: 'Interceptors wrap the handler using RxJS (next.handle().pipe(map(...))), so they can act before and after execution.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you implement a custom roles guard?',
          e: `
~~~ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.includes(user?.role);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
remove(@Param('id') id: string) { ... }
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does an exception filter do?',
          o: ['Validates input', 'Catches exceptions thrown during request handling and controls the error response format', 'Encrypts responses', 'Schedules jobs'],
          a: 1,
          e: 'Built-in HttpException subclasses (NotFoundException etc.) are handled automatically; custom @Catch() filters can map domain or DB errors to HTTP responses.',
        },
      ],
    },
    {
      slug: 'advanced',
      title: 'Database, Microservices & Testing',
      questions: [
        {
          t: 'mcq', l: 2,
          q: 'Which ORMs/ODMs are commonly integrated with NestJS?',
          o: ['Only Sequelize', 'TypeORM, Prisma, Mongoose, MikroORM, Drizzle', 'Hibernate', 'Entity Framework'],
          a: 1,
          e: 'Nest has official @nestjs/typeorm and @nestjs/mongoose packages; Prisma and others integrate via providers.',
        },
        {
          t: 'qa', l: 3,
          q: 'How does NestJS support microservices?',
          e: `
\`@nestjs/microservices\` provides transport-agnostic messaging:
- **Transports:** TCP, Redis, NATS, MQTT, RabbitMQ, Kafka, gRPC
- **Patterns:**
  - Request-response: \`@MessagePattern('get_user')\` + \`client.send()\`
  - Event-based: \`@EventPattern('user_created')\` + \`client.emit()\`
- A **hybrid app** can serve HTTP and listen to a message broker at the same time.

~~~ts
@Controller()
export class OrdersController {
  @EventPattern('order_placed')
  handle(@Payload() data: OrderPlacedEvent) { return this.service.reserveStock(data); }
}
~~~
Combine with outbox pattern and idempotent consumers for reliability.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you unit test a NestJS service with mocked dependencies?',
          e: `
~~~ts
describe('UsersService', () => {
  let service: UsersService;
  const repo = { findOne: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: repo }],
    }).compile();
    service = module.get(UsersService);
  });

  it('throws when user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
~~~
For e2e tests, create the full app with \`Test.createTestingModule({ imports: [AppModule] })\` and use supertest, overriding providers (\`overrideProvider\`) for external services.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which package handles configuration and environment variables in NestJS?',
          o: ['@nestjs/env', '@nestjs/config (ConfigModule + ConfigService)', 'dotenv only', '@nestjs/settings'],
          a: 1,
          e: 'ConfigModule.forRoot({ isGlobal: true, validationSchema }) loads .env files and validates them; ConfigService is injected where needed.',
        },
      ],
    },
  ],
};

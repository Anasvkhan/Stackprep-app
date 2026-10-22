module.exports = {
  slug: 'spring-boot',
  title: 'Spring Boot',
  subtitle: 'IoC, REST, JPA, security',
  description: 'Spring Boot interview questions: IoC/DI, beans and scopes, auto-configuration, REST controllers, Spring Data JPA, transactions, Spring Security, testing and production readiness.',
  category: 'frameworks',
  roles: ['backend', 'software-engineer'],
  icon: 'coffee',
  color: '#6DB33F',
  order: 33,
  topics: [
    {
      slug: 'core',
      title: 'IoC, Beans & Auto-configuration',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Spring Boot and how is it different from Spring Framework?',
          e: `
**Spring Framework** provides IoC/DI, MVC, data access, transactions and security, but historically needed lots of configuration.

**Spring Boot** builds on Spring to make apps production-ready quickly:
- **Auto-configuration** based on classpath and properties
- **Starter dependencies** (\`spring-boot-starter-web\`, \`-data-jpa\`, \`-security\`)
- **Embedded server** (Tomcat/Jetty/Undertow), run as a JAR
- **Externalized configuration** (\`application.yml\`, profiles, env vars)
- **Actuator** for health checks and metrics`,
        },
        {
          t: 'qa', l: 2,
          q: 'What is Inversion of Control and dependency injection in Spring?',
          e: `
**IoC:** the framework (the **ApplicationContext**) creates and wires objects (**beans**) instead of your code calling \`new\`.

**Injection styles**
- **Constructor injection** (recommended): immutable, required dependencies, easy to test
- Setter injection: optional dependencies
- Field injection (\`@Autowired\` on fields): discouraged, hides dependencies

~~~java
@Service
public class OrderService {
    private final PaymentClient payments;
    public OrderService(PaymentClient payments) { this.payments = payments; }
}
~~~
Stereotypes: \`@Component\`, \`@Service\`, \`@Repository\`, \`@RestController\`; \`@Bean\` methods inside \`@Configuration\` classes.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the default scope of a Spring bean?',
          o: ['prototype', 'singleton', 'request', 'session'],
          a: 1,
          e: 'One instance per ApplicationContext. Singleton beans must be thread-safe (avoid mutable instance state).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Two beans implement the same interface. How do you choose which one is injected?',
          o: ['Spring picks randomly', 'Use @Primary on one or @Qualifier("name") at the injection point', 'Delete one bean', 'Use static methods'],
          a: 1,
          e: 'Otherwise Spring throws NoUniqueBeanDefinitionException.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does @SpringBootApplication combine?',
          o: ['@Entity and @Table', '@Configuration, @EnableAutoConfiguration and @ComponentScan', '@Service and @Repository', '@RestController and @RequestMapping'],
          a: 1,
          e: 'Component scanning starts from the package of the main class.',
        },
      ],
    },
    {
      slug: 'web-data',
      title: 'REST, JPA & Transactions',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'How do you build a REST endpoint with validation and error handling in Spring Boot?',
          e: `
~~~java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@Valid @RequestBody CreateUserRequest req) { return service.create(req); }

    @GetMapping("/{id}")
    public UserDto get(@PathVariable Long id) { return service.get(id); }
}

public record CreateUserRequest(@NotBlank String name, @Email String email) {}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<ProblemDetail> notFound(UserNotFoundException e) {
        return ResponseEntity.status(404)
            .body(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage()));
    }
}
~~~`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the N+1 problem in JPA/Hibernate and how to fix it.',
          e: `
Loading a list of entities with **lazy** associations and then touching the association for each entity triggers **1 query for the list + N queries** for the children.

**Fixes**
- \`JOIN FETCH\` in JPQL: \`SELECT o FROM Order o JOIN FETCH o.items\`
- \`@EntityGraph(attributePaths = "items")\` on repository methods
- Batch fetching (\`hibernate.default_batch_fetch_size\`)
- DTO projections selecting only needed columns
- Turn on SQL logging in development to spot it`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why might @Transactional on a private method or a method called from the same class not work?',
          o: ['Transactions are disabled by default', 'Spring applies @Transactional through proxies, so self-invocation and private methods bypass the proxy', 'It only works on interfaces', 'It requires XML config'],
          a: 1,
          e: 'Call the method through another bean, or restructure the code.',
        },
        {
          t: 'mcq', l: 2,
          q: 'By default, which exceptions cause a @Transactional method to roll back?',
          o: ['All exceptions', 'Unchecked exceptions (RuntimeException) and Errors; checked exceptions do not unless configured with rollbackFor', 'Only checked exceptions', 'None'],
          a: 1,
          e: '@Transactional(rollbackFor = Exception.class) changes this.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does propagation = REQUIRES_NEW do?',
          o: ['Joins the existing transaction', 'Suspends the current transaction and starts a new independent one', 'Runs without a transaction', 'Throws if a transaction exists'],
          a: 1,
          e: 'Useful for audit logs that must commit even if the outer transaction rolls back. The default is REQUIRED.',
        },
      ],
    },
    {
      slug: 'security-production',
      title: 'Security, Testing & Production',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does Spring Security work at a high level?',
          e: `
- A chain of **servlet filters** (\`SecurityFilterChain\`) intercepts every request.
- **Authentication:** filters extract credentials (form login, basic, JWT bearer, OAuth2); an \`AuthenticationManager\` validates them and the result goes into the \`SecurityContext\`.
- **Authorization:** URL rules (\`authorizeHttpRequests\`) and method rules (\`@PreAuthorize("hasRole('ADMIN')")\`).

~~~java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())   // stateless JWT API
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.requestMatchers("/api/public/**").permitAll()
                                     .anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which annotation loads only the web layer for fast controller tests?',
          o: ['@SpringBootTest', '@WebMvcTest', '@DataJpaTest', '@Test only'],
          a: 1,
          e: '@WebMvcTest + MockMvc with mocked services. @DataJpaTest tests repositories; @SpringBootTest loads the full context (often with Testcontainers).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does Spring Boot Actuator provide?',
          o: ['A frontend framework', 'Production endpoints like /actuator/health, /metrics, /info and Micrometer/Prometheus integration', 'A database', 'Code generation'],
          a: 1,
          e: 'Expose only needed endpoints and secure them. Health groups map to Kubernetes liveness/readiness probes.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you manage environment-specific configuration?',
          o: ['Separate code branches', 'Profiles (application-dev.yml, application-prod.yml) plus environment variables/secret stores, with @ConfigurationProperties for typed config', 'Hard-coded constants', 'Comments in code'],
          a: 1,
          e: 'Activate with spring.profiles.active=prod; environment variables override properties (12-factor).',
        },
      ],
    },
  ],
};

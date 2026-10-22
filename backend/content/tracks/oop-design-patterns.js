module.exports = {
  slug: 'oop-design-patterns',
  title: 'OOP, SOLID & Design Patterns',
  subtitle: 'Principles, GoF patterns, LLD',
  description: 'Object-oriented programming, SOLID principles, Gang of Four design patterns and low level design questions (parking lot, etc.).',
  category: 'fundamentals',
  roles: ['software-engineer', 'backend', 'fullstack', 'mobile', 'frontend'],
  icon: 'schema',
  color: '#6366F1',
  order: 61,
  topics: [
    {
      slug: 'oop',
      title: 'OOP Principles',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the four pillars of OOP.',
          e: `
1. **Encapsulation:** bundle data and methods together and hide internal state behind a public interface (private fields, getters/setters).
2. **Abstraction:** expose only essential behavior and hide complexity (interfaces, abstract classes). *A car's steering wheel hides the mechanics.*
3. **Inheritance:** a class derives properties/behavior from a parent class (*Dog extends Animal*) – code reuse, "is-a" relationship.
4. **Polymorphism:** one interface, many implementations – method **overriding** (runtime) and **overloading** (compile-time in Java/C#). *\`shape.area()\` works for Circle and Square.*`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is method overriding?',
          o: ['Defining multiple methods with the same name but different parameters in one class', 'A subclass providing its own implementation of a method defined in its parent class', 'Calling a private method', 'Deleting a method'],
          a: 1,
          e: 'Overloading = same name, different parameters (compile-time). Overriding = subclass redefines inherited behavior (runtime polymorphism).',
        },
        {
          t: 'qa', l: 2,
          q: 'Abstract class vs interface?',
          e: `
| | Abstract class | Interface |
|---|---|---|
| Implementation | Can have state (fields) and implemented methods | Contract only (Java 8+/C# 8+ allow default methods) |
| Inheritance | A class extends **one** abstract class | A class implements **many** interfaces |
| Constructor | Yes | No |
| Use when | Sharing common code among closely related classes | Defining a capability across unrelated classes (\`Comparable\`, \`Serializable\`) |`,
        },
        {
          t: 'qa', l: 2,
          q: 'Why "composition over inheritance"?',
          e: `
**Inheritance** creates tight coupling: subclasses depend on parent internals (fragile base class problem), deep hierarchies get rigid, and you can't change behavior at runtime.

**Composition** builds objects from smaller objects ("has-a") and delegates to them:
~~~ts
class Car {
  constructor(private engine: Engine, private gps: Navigation) {}
  start() { this.engine.start(); }
}
~~~
- ✅ Flexible – swap components (ElectricEngine vs PetrolEngine), even at runtime
- ✅ Easier testing (inject mocks)
- ✅ Avoids huge class hierarchies

Use inheritance for true "is-a" relationships with stable behavior; prefer composition otherwise.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between association, aggregation and composition?',
          o: ['They are the same', 'Association: general relationship; aggregation: "has-a" where the part can exist independently; composition: strong ownership where the part dies with the whole', 'Composition is weaker than aggregation', 'Aggregation means inheritance'],
          a: 1,
          e: 'Team has Players (aggregation – players exist without the team). House has Rooms (composition – rooms do not exist without the house).',
        },
      ],
    },
    {
      slug: 'solid',
      title: 'SOLID & Clean Code',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the SOLID principles with examples.',
          e: `
- **S – Single Responsibility:** a class should have one reason to change. *Split \`UserService\` (business rules) from \`EmailSender\` and \`UserRepository\`.*
- **O – Open/Closed:** open for extension, closed for modification. *Add a new \`PaymentMethod\` class instead of editing a giant switch.*
- **L – Liskov Substitution:** subtypes must be usable wherever the base type is expected without breaking behavior. *A \`Square\` that breaks \`Rectangle.setWidth\` expectations violates LSP.*
- **I – Interface Segregation:** many small, specific interfaces beat one fat interface. *\`Printer\`, \`Scanner\` instead of \`MultiFunctionDevice\` forcing fax methods.*
- **D – Dependency Inversion:** depend on abstractions, not concretions; high-level modules shouldn't depend on low-level details. *\`OrderService\` depends on \`PaymentGateway\` interface; Stripe/PayPal adapters implement it (enables DI and testing).*`,
        },
        {
          t: 'mcq', l: 2,
          q: 'A function with a growing if/else chain for each new payment type violates which principle most directly?',
          o: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation'],
          a: 1,
          e: 'Every new type requires modifying existing code. Use polymorphism (strategy pattern) to extend without modification.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What do DRY, KISS and YAGNI stand for?',
          o: ['Database rules', "Don't Repeat Yourself, Keep It Simple Stupid, You Aren't Gonna Need It", 'Testing frameworks', 'Agile ceremonies'],
          a: 1,
          e: 'Avoid duplication of knowledge, prefer simple solutions, and don\'t build features before they are needed.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is dependency injection?',
          o: ['Injecting SQL into queries', 'Providing an object\'s dependencies from outside (constructor/params/container) instead of the object creating them itself', 'A security vulnerability', 'Importing npm packages'],
          a: 1,
          e: 'DI implements dependency inversion and makes code testable (inject mocks) and configurable.',
        },
      ],
    },
    {
      slug: 'design-patterns',
      title: 'Design Patterns',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are the categories of Gang of Four design patterns? Name important ones.',
          e: `
**Creational** – object creation
- **Singleton**, **Factory Method**, **Abstract Factory**, **Builder**, **Prototype**

**Structural** – composing objects
- **Adapter**, **Decorator**, **Facade**, **Proxy**, **Composite**, Bridge, Flyweight

**Behavioral** – communication between objects
- **Observer**, **Strategy**, **Command**, **State**, **Template Method**, **Iterator**, **Chain of Responsibility**, Mediator, Visitor, Memento`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which pattern ensures a class has only one instance with a global access point?',
          o: ['Factory', 'Singleton', 'Observer', 'Adapter'],
          a: 1,
          e: 'Common for config, logger, DB connection pool. Downsides: hidden global state, harder testing – prefer DI-managed singletons.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Express/Koa middleware chains are an example of which pattern?',
          o: ['Singleton', 'Chain of Responsibility', 'Builder', 'Flyweight'],
          a: 1,
          e: 'Each handler processes the request and decides whether to pass it to the next.',
        },
        {
          t: 'mcq', l: 2,
          q: 'You need to plug a third-party payment SDK with a different interface into your PaymentGateway interface. Which pattern?',
          o: ['Adapter', 'Observer', 'Singleton', 'Prototype'],
          a: 0,
          e: 'Adapter converts one interface into another that clients expect.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the Strategy pattern with an example.',
          e: `
**Strategy** defines a family of interchangeable algorithms behind a common interface and selects one at runtime.

~~~ts
interface ShippingStrategy { cost(order: Order): number }
class StandardShipping implements ShippingStrategy { cost(o) { return 5; } }
class ExpressShipping  implements ShippingStrategy { cost(o) { return 15 + o.weight * 2; } }

class Checkout {
  constructor(private shipping: ShippingStrategy) {}
  total(o: Order) { return o.subtotal + this.shipping.cost(o); }
}
new Checkout(new ExpressShipping()).total(order);
~~~
Removes if/else chains, follows Open/Closed. Real uses: payment methods, sorting/compression algorithms, pricing rules, auth strategies (Passport.js).`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the Observer pattern and where it is used.',
          e: `
**Observer** (pub/sub): a subject maintains a list of observers and notifies them automatically when its state changes.

~~~js
class Subject {
  #observers = new Set();
  subscribe(fn) { this.#observers.add(fn); return () => this.#observers.delete(fn); }
  notify(data) { this.#observers.forEach((fn) => fn(data)); }
}
~~~
**Used in:** DOM events, Node EventEmitter, RxJS Observables, React state libraries (Redux subscribe), MVC views updating on model changes, message brokers (distributed version).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which pattern adds behavior to an object dynamically without changing its class (e.g. adding caching or logging around a service)?',
          o: ['Decorator', 'Factory', 'Singleton', 'Iterator'],
          a: 0,
          e: 'Decorators wrap an object with the same interface and add behavior before/after delegating (e.g. CachedRepository wrapping Repository).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which pattern constructs complex objects step by step (e.g. query builders, HTTP request builders)?',
          o: ['Builder', 'Adapter', 'Observer', 'Command'],
          a: 0,
          e: 'Builder gives readable, fluent construction: new QueryBuilder().select("*").from("users").where(...).build().',
        },
        {
          t: 'scenario', l: 3,
          q: 'Low level design: Design a parking lot system.',
          e: `
**Requirements:** multiple floors, spot types (motorcycle, compact, large, EV), vehicles of different sizes, entry/exit gates with tickets, payment by duration, show availability.

**Classes**
~~~
ParkingLot (singleton-ish): floors[], entryGates[], exitGates[], findSpot(vehicle)
ParkingFloor: spots[], displayBoard
ParkingSpot (abstract): id, type, isFree, vehicle -> CompactSpot, LargeSpot, MotorbikeSpot, EVSpot
Vehicle (abstract): plate, type -> Car, Truck, Motorcycle
Ticket: id, vehicle, spot, entryTime, exitTime, status
EntryGate: issueTicket(vehicle)   ExitGate: processExit(ticket)
PricingStrategy (interface): calculate(ticket) -> HourlyPricing, WeekendPricing
Payment: amount, method (Cash/Card - strategy), status
SpotAllocationStrategy: nearest-first, by floor
~~~
**Key decisions**
- Strategy pattern for pricing and spot allocation; Factory for creating spots/vehicles.
- Concurrency: two gates assigning the same spot – lock/atomic reservation per spot.
- Observer to update display boards when spots change.
- Extensible to new vehicle/spot types without modifying existing code (Open/Closed).`,
        },
      ],
    },
  ],
};

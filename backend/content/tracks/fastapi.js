module.exports = {
  slug: 'fastapi',
  title: 'FastAPI',
  subtitle: 'Async APIs, Pydantic, DI',
  description: 'FastAPI interview questions: async endpoints, Pydantic validation, dependency injection, authentication, background tasks, testing and deployment.',
  category: 'frameworks',
  roles: ['backend'],
  icon: 'bolt',
  color: '#009688',
  order: 36,
  topics: [
    {
      slug: 'core',
      title: 'Core Concepts',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is FastAPI and why is it popular?',
          e: `
**FastAPI** is a modern Python web framework for building APIs, built on **Starlette** (ASGI) and **Pydantic**.

- High performance with async support
- **Type hints drive everything:** validation, serialization, editor support
- **Automatic OpenAPI docs** (Swagger UI at \`/docs\`, ReDoc at \`/redoc\`)
- Built-in **dependency injection**
- Less boilerplate than Flask/Django REST for APIs

~~~python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserIn(BaseModel):
    name: str
    email: EmailStr

@app.post("/users", status_code=201)
async def create_user(user: UserIn):
    return {"id": 1, **user.model_dump()}
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When should a FastAPI endpoint be "async def" vs "def"?',
          o: ['Always async', 'async def when you await async libraries (httpx, asyncpg); plain def for blocking code, which FastAPI runs in a threadpool', 'Always def', 'It makes no difference'],
          a: 1,
          e: 'Calling blocking code (requests, time.sleep, sync DB drivers) inside async def blocks the event loop for all requests.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What does Pydantic do in FastAPI?',
          o: ['Database migrations', 'Validates and parses request data and serializes responses based on type-annotated models', 'Handles routing', 'Runs the server'],
          a: 1,
          e: 'Invalid input automatically returns 422 with detailed field errors.',
        },
        {
          t: 'qa', l: 2,
          q: 'How does dependency injection work in FastAPI?',
          e: `
Declare dependencies with \`Depends()\`; FastAPI resolves them per request (and caches within the request).

~~~python
async def get_db():
    async with SessionLocal() as session:
        yield session            # cleanup runs after the response

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    user = await verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.get("/me")
async def me(user=Depends(get_current_user)):
    return user
~~~
Used for DB sessions, auth, pagination params and settings. Override dependencies in tests with \`app.dependency_overrides\`.`,
        },
      ],
    },
    {
      slug: 'production',
      title: 'Auth, Tasks, Testing & Deployment',
      questions: [
        {
          t: 'mcq', l: 2,
          q: 'What are FastAPI BackgroundTasks suitable for?',
          o: ['Hours-long video encoding', 'Small fire-and-forget work after the response (send an email, write a log); use Celery/ARQ for heavy or durable jobs', 'Database migrations', 'Load balancing'],
          a: 1,
          e: 'BackgroundTasks run in the same process; if it crashes, the task is lost.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you test FastAPI endpoints?',
          o: ['Only manually through /docs', 'With TestClient (or httpx.AsyncClient) and pytest, overriding dependencies such as the DB', 'Using Selenium', 'It is not testable'],
          a: 1,
          e: 'client = TestClient(app); assert client.get("/health").status_code == 200.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you deploy FastAPI in production?',
          e: `
- Run with an ASGI server: **Uvicorn** (multiple workers) or Gunicorn with Uvicorn workers
- Containerize with Docker; one process per container and scale with replicas in Kubernetes
- Put **Nginx or a load balancer** in front for TLS and buffering
- Configuration with **pydantic-settings** from environment variables
- Use async DB drivers (asyncpg, SQLAlchemy 2.0 async) with connection pooling
- Add health endpoints, structured logging, metrics (prometheus instrumentator) and tracing (OpenTelemetry)
- Set CORS, rate limiting and request size limits`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which protocol does FastAPI use, enabling WebSockets and async?',
          o: ['WSGI', 'ASGI', 'CGI', 'FTP'],
          a: 1,
          e: 'ASGI is the async successor of WSGI.',
        },
      ],
    },
  ],
};

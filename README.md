# StackPrep

Interview preparation app for software engineers. Users sign up, pick their designation (Frontend, Backend, Full Stack, Software Engineer, Mobile, DevOps) and get tracks for their stack, filtered by experience level (Junior / Mid / Senior). Answers stay hidden until the user reveals them, and MCQ quizzes can be practiced anytime.

```
backend/   Node.js + Express + MongoDB API, content and seeder
app/       Flutter app (Android, iOS, Web, Windows)
```

## Features

- Sign up / login, then pick a designation (changeable anytime); progress is saved to the account
- Fast startup: designations are bundled and the signed-in user is cached, so the app opens without waiting for the server
- 44 tracks, about 980 questions: System Design (34 topics plus case studies), languages, frameworks, databases, DevOps and CS fundamentals, split by role (for example JavaScript Frontend and JavaScript Backend are separate tracks)
- Question types: MCQ, Q&A and scenario-based, each tagged Junior / Mid / Senior
- Study mode: swipe through questions, reveal answers, mark "I knew it" / "Need revision"
- Quiz mode: level, count and mode (mixed / unseen only / my mistakes), timer, results with review
- Progress per track, accuracy, daily streak, bookmarks, search
- Light and dark theme, responsive layout (bottom nav on phones, side rail on wide screens)

## Running the backend

```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI and JWT_SECRET
npm run seed              # loads content/ into MongoDB
npm run dev               # http://localhost:5000/api
```

`npm run seed -- --check` validates the content files without touching the database.

## Running the app

```bash
cd app
flutter pub get
flutter run -d chrome                     # web
flutter run                               # connected device / emulator
flutter run --dart-define=API_URL=https://your-api.example.com/api
```

Default API URL: `http://10.0.2.2:5000/api` on the Android emulator, `http://localhost:5000/api` elsewhere. On a physical phone, pass your computer's LAN IP with `--dart-define=API_URL=http://192.168.x.x:5000/api`.

## UI tests (Maestro)

End-to-end flows live in `app/.maestro/`:

| Flow | Covers |
|---|---|
| `01_onboarding` | Sign up, pick designation, name shown on home |
| `02_study_reveal_bookmark` | Track -> topic -> reveal answer, self-assessment, MCQ, bookmark, Saved tab |
| `03_quiz` | Quick practice: 10 MCQs, results, review mistakes |
| `04_search` | Search and open a result |
| `05_profile_preferences` | Dark theme, change designation and level, Explore updates |
| `06_account` | Log out and log back in |

Run with the backend up and the debug APK installed on an emulator:

```bash
cd app
flutter build apk --debug && adb install -r build/app/outputs/flutter-apk/app-debug.apk
maestro test .maestro/
```

Flutter merges a card's texts into one accessibility node (`"Title\nSubtitle"`), so selectors use `(?s)` regexes. MCQ options expose `id: option_0`, `option_1`, and so on.

## Adding or editing questions

Each track is a file in `backend/content/tracks/` (System Design is split into `system-design/part1.js` to `part7.js`). A question looks like this:

```js
{ t: 'mcq', l: 2, q: 'Question text', c: 'optional code', o: ['A', 'B', 'C', 'D'], a: 1, e: 'Explanation (markdown)' }
{ t: 'qa',  l: 1, q: 'Question text', e: `Answer in markdown` }
{ t: 'scenario', l: 3, q: 'Scenario text', e: `Model approach` }
```

`t` is the type, `l` the level (1 Junior, 2 Mid, 3 Senior), `a` the index of the correct option. After editing, run `npm run seed`. New questions are added, edited ones are updated, and questions removed from the files are deleted from the database.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/users/me` | Update designation, level, name |
| DELETE | `/api/users/me/progress` | Reset progress |
| GET | `/api/meta` | Designations, levels, categories |
| GET | `/api/tracks?role=` | Tracks for a designation (`role=all` for everything) |
| GET | `/api/tracks/:slug` | Track with topics and progress |
| GET | `/api/questions?track=&topic=&level=&type=&q=&page=` | Questions list / search |
| POST | `/api/questions/:id/attempt` | Record an MCQ answer or self-assessment |
| GET | `/api/practice/quiz?track=&topic=&level=&count=&mode=` | Random MCQ quiz |
| POST | `/api/practice/sessions` | Save quiz result |
| GET / POST | `/api/bookmarks`, `/api/bookmarks/:questionId` | List / toggle bookmarks |
| GET | `/api/progress` | Stats, per-track progress, recent quizzes |

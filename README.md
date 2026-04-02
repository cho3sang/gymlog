# GymLog — Workout Tracker MVP

A mobile-first workout tracker built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

---

## PostgreSQL Setup (macOS / Homebrew)

```bash
# 1. Install PostgreSQL 16
brew install postgresql@16

# 2. Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. Start the service
brew services start postgresql@16

# 4. Create the database
createdb gymlog

# 5. (Optional) Verify connection
psql -d gymlog -c "SELECT version();"
```

---

## App Setup

```bash
# 1. Clone / enter project
cd gymlog

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env — replace <your_user> with your macOS username (run `whoami`)

# 4. Run Prisma migrations
npx prisma migrate dev --name init

# 5. Seed the demo user
npx prisma db seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

---

## .env

```
DATABASE_URL="postgresql://<your_user>@localhost:5432/gymlog"
```

Replace `<your_user>` with your macOS username (`whoami` in terminal).

---

## Tech Stack

| Layer      | Tech                         |
|------------|------------------------------|
| Framework  | Next.js 14 (App Router)      |
| Language   | TypeScript                   |
| Styles     | Tailwind CSS                 |
| ORM        | Prisma                       |
| Database   | PostgreSQL 16                |
| Auth       | None (demo user hardcoded)   |

---

## File Tree

```
gymlog/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx          ← Root layout + bottom nav
    │   ├── page.tsx            ← Home
    │   ├── log/
    │   │   └── page.tsx        ← Active workout logger
    │   ├── history/
    │   │   ├── page.tsx        ← Finished sessions list
    │   │   └── [id]/
    │   │       └── page.tsx    ← Session detail
    │   └── progress/
    │       └── page.tsx        ← Exercise progress + 1RM
    ├── components/
    │   ├── BottomNav.tsx
    │   └── PageHeader.tsx
    ├── lib/
    │   └── prisma.ts
    └── actions/
        └── workout.ts          ← All server actions
```

# GymLog

GymLog is a mobile-first workout tracker for logging lifting sessions, reviewing workout history, and tracking exercise progress over time.

It is built with Next.js, TypeScript, Prisma, and PostgreSQL, with a simple demo-user flow so you can run it locally without setting up auth first.

## Features

- Start and continue an active workout session
- Add exercises while you train
- Log sets with weight and reps
- Delete sets if you make a mistake
- Finish workouts and save them to history
- Review completed sessions with exercise count, set count, and total volume
- Open a workout to see the full exercise-by-exercise set breakdown
- Track progress for individual exercises
- See best set, best estimated 1RM, and best estimated 1RM in the last 30 days
- Use a mobile-first interface designed for quick logging during training

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## Local Setup

Recommended runtime: Node.js 20 LTS.

This repo includes an `.nvmrc` file, so if you use `nvm`:

```bash
nvm install 20
nvm use 20
```

Then install dependencies:

```bash
npm install
```

## PostgreSQL Setup

Example setup on macOS with Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb gymlog
```

## Environment Variables

Create a local env file:

```bash
cp .env.example .env
```

Default local database connection:

```env
DATABASE_URL="postgresql://<your_user>@localhost:5432/gymlog"
```

Replace `<your_user>` with your macOS username.

## Run The App

Apply the database schema and seed the demo user:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Use It On Your Phone

If your phone and laptop are on the same Wi-Fi network, you can open the app from your phone browser.

Start the dev server so it listens on your network:

```bash
npm run dev -- --hostname 0.0.0.0
```

Then find your laptop's local IP address:

```bash
ipconfig getifaddr en0
```

On your phone, open:

```text
http://YOUR_LOCAL_IP:3000
```

If you want it to feel more app-like, add it to your home screen from Safari or Chrome.

## Project Notes

- The current app uses a hardcoded demo user instead of authentication.
- Workout data is stored in PostgreSQL through Prisma.
- Prisma migrations are stored in `prisma/migrations`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```


# Fullstack studying project

In this project, i try to create a fullstack application with it own server and client, that fetching data from him.


## Tech Stack of project ( at this moment )

**Client:** TypeScript, React, TanStack, Zod, Tailwind CSS

**Server:** Node.js + Express, PostgreSQL + Drizzle ORM ,Swagger UI for REST API, JWT Auth, Docker, Redis, BullMQ

**Deploy\CD** Railway (backend) \ Vercel (frontend)

**Testing\CI** Vitest, React testing library, Github Actions

## How to run

```
  (in 1 cmd, from root dir)
  cd backend
  npm install
  npm run docker:build
  npm run docker:up
```
   
```
  (in 2 cmd, from root dir)
  cd frontend
  npm install
  npm run dev
```

## Server with bun ( for faster deps uploading )

```
  cd backend
  bun install
  bun run docker:build
  bun run docker:up
```

then, switch to root dir and run project

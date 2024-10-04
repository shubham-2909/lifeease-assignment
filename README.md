# Turborepo

### Note you need bun to run it locally if you have not installed please do so

```sh
npm install -g bun #(The last npm command you'll ever need)
```

This is an official Turborepo.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `admin panel`: a [Next.js](https://nextjs.org/) app
- `web`: a [Express](https://expressjs.com/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/common`: `common type`s used throughout the monorepo
- `@repo/db`: `Prisma client` used throughout the monorepo

  Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Develop (only frontend) (for quick setup)

I've already deployed backend through EC2 CI-CD Applied at [Here](https://lifease.webdevka14.in) You can access it

To run frontend locally clone the repo and visit root directory

Run `bun install `
Visit the admin-panel directory and run

```sh
cd apps/admin-panel
bun dev
```

And you will have your frontend running and already the data will be dynamic

### Develop (both backend and frontend)

If you want to develop both backend and frontend locally follow this:

- Clone the repo and run `bun install` in the root
- go to packages/db and first copy the contents of .env.example to .env and fill in required variables then run

```sh
 cd packages/db
 bunx prisma generate
 bunx prisma db seed
 cd ../../
```

- Run

```sh
bun dev in root of the turborepo and both your applications will start locally
```

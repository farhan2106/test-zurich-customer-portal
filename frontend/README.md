This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

This project uses the following environment variables. Copy `.env.sample` to `.env.local` and fill in your values.

> **Note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All other variables are only available on the server side.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001/api` | Base URL of the backend API. Used by the API client and pages to make requests. |
| `NODE_ENV` | No | `development` | Node environment. Controls Redux DevTools enablement among other things. |

### Setup

```bash
# Copy the sample env file
cp .env.sample .env.local

# Edit .env.local with your values
# Example:
#   NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### `.env.sample`

```env
# Base URL of the backend API
NEXT_PUBLIC_API_URL=<your-backend-api-url>
```

### Where Variables Are Used

| Variable | File(s) |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `src/services/api-client.ts`, `src/app/page.tsx`, `src/app/page.test.tsx` |
| `NODE_ENV` | `src/store/index.ts` |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

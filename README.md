# Console Shop — Customer Storefront

Customer-facing web app for the Console Shop platform, built with Next.js.

## Live URL

**[https://console-shop-web.lboevset.com](https://console-shop-web.lboevset.com)**

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data fetching:** TanStack Query
- **Payments:** Omise.js
- **Realtime:** Socket.IO client
- **Deployment:** GKE (Google Kubernetes Engine), standalone output

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3022](http://localhost:3022).

Requires a `.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:3012/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3012
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_...
```

## Deployment

Pushing to the `dev` branch triggers GitHub Actions to build and deploy to GKE automatically.

See `console-shop-backend-config` for all Kubernetes manifests and the full deployment guide.

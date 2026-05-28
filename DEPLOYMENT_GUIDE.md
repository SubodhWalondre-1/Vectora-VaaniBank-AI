# VaaniBank AI — Genuinely Free, Low-Latency Production Deployment Guide
This guide walks you through deploying the VaaniBank AI application (FastAPI WebSockets backend, PostgreSQL database, Redis cache, and React frontends) entirely on **genuinely free tiers** that do not require a credit card, support WebSockets, and run 24/7/365 in the cloud independent of your local machine.

---

## Architecture Blueprint

```mermaid
graph TD
    NetlifyCustomer[Customer Panel <br/> netlify.app] <-->|Secure WebSockets wss://| HF[Hugging Face Space <br/> API Backend - Docker]
    NetlifyStaff[Staff Panel <br/> netlify.app] <-->|Secure WebSockets wss://| HF
    HF <-->|Async Queries asyncpg| Neon[Neon.tech <br/> Serverless PostgreSQL]
    HF <-->|Caching & Rate Limits TCP| Upstash[Upstash Redis <br/> Serverless Redis]
    UptimeRobot[UptimeRobot / Cron-Job] -->|GET /health once a day| HF
    
    style UptimeRobot fill:#22C55E,stroke:#15803D,stroke-width:2px,color:#fff
```

---

## Step 1: Set Up Neon.tech (Free Serverless PostgreSQL)
Neon offers a fully managed serverless PostgreSQL database with 0.5 GiB of storage and instant auto-resume. It is completely free and requires **no credit card**.

1. Go to [neon.tech](https://neon.tech) and sign up (using Google or GitHub).
2. Create a new project named `vaanibank-db`.
3. Select **PostgreSQL 16** (default) and select a region close to your target (e.g., **Singapore** or **Europe** for low latency).
4. Copy the connection URI from the dashboard (make sure the selector is on **Connection String** -> **psycopg2** or raw URI).
5. **CRITICAL FOR FASTAPI**: 
   The copied connection string starts with `postgresql://`. You **MUST** change the prefix to `postgresql+asyncpg://` so that FastAPI's async ORM functions correctly.
   * *Example*: `postgresql+asyncpg://neondb_owner:pass@ep-hostname.ap-southeast-1.neon.tech/neondb?sslmode=require`

---

## Step 2: Set Up Upstash Redis (Free Serverless Redis)
Upstash offers serverless Redis with 10,000 free commands/day, which is plenty for caching speech responses, rate-limiting, and managing active teller sessions. It requires **no credit card**.

1. Go to [upstash.com](https://upstash.com) and log in (Google or GitHub sign-in).
2. Click **Create Database**.
3. Name: `vaanibank-redis`.
4. Region: Choose **Singapore** or **Europe** (match your database region).
5. Scroll down to the **Rediss URL** section under the Node.js/Python tab and copy the connection endpoint.
   * It will look like: `rediss://default:your_token@shared-redis-hostname.upstash.io:6379`
   * *Note*: Ensure it starts with `rediss://` (secure Redis over TLS) to encrypt WebSocket session state in transit.

---

## Step 3: Create a Hugging Face Space (Free Backend Host)
Hugging Face Spaces allows you to run custom Docker containers for free. The CPU basic tier provides **16 GB RAM and 2 vCPUs**, which is extremely fast and robust for our banking pipeline. It requires **no credit card**.

1. Go to [huggingface.co](https://huggingface.co) and register or log in.
2. Click on your profile picture in the top right and click **New Space**.
3. Configure the Space:
   * **Space Name**: `vaanibank-api`
   * **License**: `mit`
   * **SDK**: **Docker** (Do NOT choose Streamlit/Gradio)
   * **Docker Template**: **Blank**
   * **Space Visibility**: **Public** (required for the frontend to fetch it)
4. Click **Create Space**.

---

## Step 4: Configure Hugging Face Space Environment Variables (Secrets)
Do not hardcode secrets. Add them in the Hugging Face Settings dashboard so they are loaded securely at startup.

1. In your newly created Hugging Face Space, click on the **Settings** tab.
2. Scroll down to the **Variables and secrets** section.
3. Click **New secret** to add your keys. Create the following Secrets (values must match your active credentials):
   * `DATABASE_URL`: Your modified Neon URI (`postgresql+asyncpg://...`)
   * `REDIS_URL`: Your Upstash Redis URL (`rediss://...`)
   * `CELERY_BROKER_URL`: Same as `REDIS_URL`
   * `SARVAM_API_KEY`: Your Sarvam AI key (leave blank if running offline demo mode)
   * `GROQ_API_KEY`: Your Groq API key
   * `GEMINI_API_KEY`: Your Google Gemini API key
   * `REVERIE_APP_ID`: Your Reverie App ID (if active)
   * `REVERIE_API_KEY`: Your Reverie API Key (if active)
   * `JWT_SECRET_KEY`: A random strong string (e.g. `vaanibank-prod-secure-token-2026`)
   * `APP_ENV`: `production`
   * `ALLOWED_ORIGINS`: `https://vaanibank-customer.netlify.app,https://vaanibank-staff.netlify.app` *(Replace with your exact Netlify frontend URLs)*

---

## Step 5: Deploy the Backend Code via Git Subtree
Since our repository contains both the frontend and the backend, we will push only the `/backend` folder directly to the root of the Hugging Face Space.

1. Open your terminal on your local machine and navigate to your project root (`VaaniBank-AI`).
2. Add the Hugging Face Space as a git remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_HF_USERNAME/vaanibank-api
   ```
3. Push only the `/backend` folder to the Space's `main` branch:
   ```bash
   git subtree push --prefix backend hf main
   ```
   * *How this works*: This command extracts the contents of the `backend` folder (including our `Dockerfile`, `main.py`, and `start.sh`) and pushes it directly as the root directory of the Hugging Face Space.
4. Hugging Face will automatically detect the `Dockerfile` and begin building the container. You can monitor the build logs on the Space dashboard!

---

## Step 6: Update Netlify Frontend Environment Variables
Now that your API backend is running, hook your React panels up to the new URL.

1. Go to your [Netlify Dashboard](https://app.netlify.com).
2. For both the **Customer Panel** and **Staff Panel** deployments, navigate to **Site configuration** -> **Environment variables**.
3. Update (or add) the following variable:
   * `VITE_API_BASE_URL`: `https://YOUR_HF_USERNAME-vaanibank-api.hf.space` *(Note: replace `YOUR_HF_USERNAME` and do not add a trailing slash)*
4. Go to the **Deploys** tab and click **Trigger deploy** -> **Clear cache and deploy site** to build the frontend with the new production URL.

---

## Step 7: Keep the Server Awake 24/7 (No-Card Keep-Alive)
Hugging Face Spaces automatically pause after **48 hours** of zero traffic to conserve resources. Setting up a free external ping service guarantees **zero cold starts**.

1. Go to [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) (both are free, no credit card).
2. Add a new **HTTPS Monitor**:
   * **URL**: `https://YOUR_HF_USERNAME-vaanibank-api.hf.space/health`
   * **Interval**: Every **30 minutes** or **24 hours** (any ping resets the 48-hour idle timer).
3. Save the monitor. This will send a lightweight ping to your backend `/health` endpoint, keeping it permanently active and responsive.

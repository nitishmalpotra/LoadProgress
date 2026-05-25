# Deploying LoadProgress to Vercel

This guide explains how to publish the LoadProgress Web PWA on Vercel.

Vercel is a hosting platform for web apps. It is a good fit for LoadProgress because the app builds
into static files, loads quickly from Vercel's global network, and can be hosted on Vercel's free
plan for personal projects. LoadProgress is also local-first: workout data stays in the user's
browser with IndexedDB, so there is no server database to configure.

## Prerequisites

Before deploying, make sure you have:

- A free Vercel account: <https://vercel.com/signup>
- Git installed on your computer
- The LoadProgress project pushed to a public GitHub repository
- Node.js and npm installed locally so you can test the production build first

Run this from the project root before deploying:

```bash
npm install
npm run build
```

The build should finish successfully and create a `dist` folder. That is the folder Vercel serves to
visitors.

## Deploy with the Vercel Dashboard

This is the easiest option if you are new to deployment.

1. Go to <https://vercel.com/dashboard>.
2. Select **Add New...** and then **Project**.
3. Connect your GitHub account if you have not already done that.
4. Find your LoadProgress GitHub repository and select **Import**.
5. On the project setup screen, review the build settings.

Use these settings:

| Setting              | Value                                   |
| -------------------- | --------------------------------------- |
| Framework Preset     | `Vite` or `Other`                       |
| Install Command      | `npm install`                           |
| Build Command        | `npm run build`                         |
| Output Directory     | `dist`                                  |
| Environment Variables | None                                    |

Vercel usually detects Vite automatically. If it does, you can keep the detected `Vite` preset. If
you choose `Other`, make sure the commands above are still filled in exactly.

No environment variables are needed. LoadProgress stores workout data locally in each user's browser
with IndexedDB, so there is no hosted database, API key, or secret value to add.

Select **Deploy**. Vercel will install dependencies, run `npm run build`, and publish the generated
`dist` folder. When the deployment finishes, Vercel shows a live URL such as:

```text
https://your-project-name.vercel.app
```

## Deploy with the Vercel CLI

The Vercel CLI is useful if you prefer deploying from the terminal.

Install the CLI globally:

```bash
npm install -g vercel
```

Log in to your Vercel account:

```bash
vercel login
```

From the LoadProgress project root, create a preview deployment:

```bash
vercel
```

Follow the prompts. For a first deployment, Vercel may ask whether to link the folder to a new
project. Accept the default options unless you already have a Vercel project for this repository.

Deploy the production version:

```bash
vercel --prod
```

Production deployments are the public version you share with users.

## Why `vercel.json` Matters

LoadProgress uses client-side HTML5 history routing. In simpler terms, routes such as `/records`,
`/analytics`, and `/exercises` are handled by React in the browser.

Without a rewrite rule, refreshing one of those pages on Vercel can produce a `404` error because
Vercel looks for a real file at that path. The `vercel.json` file fixes this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This sends all navigation requests back to `index.html`, then React displays the correct screen. Keep
this file in the repository before deploying.

## Verify the PWA

After opening the deployed URL, check that the app behaves like a PWA:

1. Open the deployed site in Chrome, Edge, or another browser with PWA support.
2. Look for the install icon in the address bar. It may look like a small computer, phone, or plus
   symbol depending on the browser.
3. Select the install icon and install LoadProgress.
4. Open the installed app once while online so the browser can save the app files for offline use.
5. Turn off the network connection or use browser developer tools to switch to offline mode.
6. Reopen or refresh LoadProgress. The app shell should still load after it has been visited once.

Workout data is saved in the browser where it was entered. Installing the PWA or opening it on a
different device does not automatically sync data between browsers.

## Add a Vercel Deploy Badge to `README.md`

A deploy badge gives visitors a quick link to the live Vercel app. You can also use a status-style
badge that checks whether the deployed site is reachable.

Add a badge near the top of the root `README.md`, under the project title:

```markdown
[![Vercel Deploy Status](https://img.shields.io/badge/Vercel-Deployed-111827?style=for-the-badge&logo=vercel&logoColor=white)](https://your-project-name.vercel.app)
```

Or use a live website status badge:

```markdown
[![Vercel Deploy Status](https://img.shields.io/website?url=https%3A%2F%2Fyour-project-name.vercel.app&label=Vercel&style=for-the-badge&logo=vercel)](https://your-project-name.vercel.app)
```

Replace `https://your-project-name.vercel.app` with your real Vercel production URL. In the live
status badge, also replace the encoded URL after `url=`. For example,
`https://loadprogress.vercel.app` becomes `https%3A%2F%2Floadprogress.vercel.app`.

If you want the badge text to say something else, change only the label portion of the Shields URL.
The link target should still point to the deployed app.

## Troubleshooting

If deployment fails, check these common issues first:

- `npm run build` fails locally: fix the local build error before trying Vercel again.
- The deployed app shows a `404` after refreshing a route: make sure `vercel.json` is committed and
  contains the rewrite to `/index.html`.
- The install icon does not appear: open the production URL, wait for the page to finish loading, and
  check that the browser supports PWA installation.
- Offline mode does not work on the first visit: load the app once while online first, then test
  offline behavior.

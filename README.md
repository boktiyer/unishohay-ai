# UnishohayAI

UnishohayAI is a bilingual (Bangla and English) admission assistant for **Port City International University (PCIU)**, Chattogram, built for the PCIU Computer Club Hackathon.

Students can ask about departments, fees, eligibility, the admission procedure and scholarships. Answers come only from the official admission dataset in `data/admission-info.json`. If a value is missing, the assistant says so and points the student to the PCIU Admission Office. It never guesses.

## Features

- **AI chat** (`/chat`): streaming answers powered by Google Gemini, with Markdown rendering, copy and regenerate buttons, and a stop button. It also has:
  - chat history in localStorage, with rename and delete
  - New Chat and Clear Conversation buttons
  - voice input through the Web Speech API
  - suggested questions
  - follow-up understanding, so "what about the fee for that one?" works
- **Grounded answers**: before each Gemini call, the server picks the relevant sections of the dataset using Bangla and English keyword matching and program matching. Answers built from the dataset show a *Source: Official Admission Data* badge. Answers about fees or eligibility also show a *Please confirm with the Admission Office* note.
- **Same-language replies**: the assistant answers in Bangla if the student writes in Bangla, and in English otherwise.
- **Admission Guide** (`/admission-guide`): admission steps, eligibility, fees and important information, all read from the JSON file.
- **Tools** (`/tools`): these are calculated from the JSON with plain rules, not by the AI.
  - Eligibility checker, including the direct-admission rule (combined GPA of 7.00, or 8.00 for LL.B.)
  - Fee calculator
  - Program comparison
  - Admission checklist with a progress bar
- **Interface**: light and dark mode, a বাংলা / EN language toggle, a responsive layout, glassmorphism styling and framer-motion animations.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `@google/genai`, framer-motion, next-themes, lucide-react, react-markdown. There is no database, and every tool used is free.

## Project structure

```
app/
  page.tsx                 Landing page
  chat/page.tsx            AI chat
  admission-guide/page.tsx Admission guide
  tools/page.tsx           Eligibility checker, fee calculator, comparison, checklist
  api/chat/route.ts        Streaming Gemini endpoint (server-only, holds the API key)
  icon.svg, opengraph-image.tsx
components/                Navbar, Footer, ChatWindow, ChatInput, MessageBubble, Sidebar, AdmissionChecklist, ...
data/admission-info.json   Official admission dataset (edit this to update the bot)
lib/admission-data.ts      Data access, retrieval (BN+EN keyword matching), eligibility rules
lib/gemini.ts              Gemini client and system instruction
lib/i18n.ts                UI strings (Bangla / English) and suggested questions
types/index.ts             Shared types
```

## 1. Get a Gemini API key (free)

1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key** and copy the key.
3. Open `.env.local` in the project root and fill in the values:
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```
   `GEMINI_MODEL` can be any Gemini Flash model that has a free tier, for example `gemini-3.8-flash` or `gemini-flash-latest`. The key is read only on the server. It is never sent to the browser.

## 2. Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. To make a production build, run `npm run build` and then `npm start`.

## 3. Upload to GitHub

```bash
git init
git add .
git commit -m "UnishohayAI: PCIU admission assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/unishohay-ai.git
git push -u origin main
```

`.env.local` is listed in `.gitignore`, so your API key will not be uploaded.

## 4. Deploy to Vercel (free)

1. Sign in at https://vercel.com with GitHub and click **Add New → Project**.
2. Import the repository. Vercel detects Next.js automatically.
3. Under **Environment Variables**, add `GEMINI_API_KEY` and `GEMINI_MODEL`. You can also add `NEXT_PUBLIC_SITE_URL` with your Vercel URL so the Open Graph image links are correct.
4. Click **Deploy**. Whenever you change environment variables later, redeploy.

## Admission data: maintenance note

`data/admission-info.json` was built from official PCIU pages at https://www.portcity.edu.bd. Each section has a `source_url` and a `last_verified` date.

- **Fees and dates change every semester.** Before the demo, replace or update this file with the organizer's official dataset. You do not need to change any code.
- Any field set to `null` means **not available**. The chatbot will say the information is not available and refer the student to the Admission Office. Fill in a field, such as `admission_dates.application_deadline` or `required_documents.list`, and the bot starts using it immediately.
- `demo_data` is a top-level flag. If it is set to `true`, the Admission Guide shows a "Demo data" notice.
- To add a program, add an entry to `departments.programs` with its Bangla and English `keywords`, then add matching entries under `eligibility.by_program` and `tuition_fees.by_program`.

## Safety rules built into the bot

- The bot answers only from the dataset. It never invents fees, GPA requirements, dates, scholarship amounts or department details.
- Per-semester and per-year fees are not calculated, because they are not in the official data.
- The bot never says a student is eligible unless the published requirements support it.
- The friendly error messages for an empty message, a missing API key, rate limits (429) and network problems are shown in the student's language.

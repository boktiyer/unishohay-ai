# UnishohayAI

UnishohayAI is a bilingual (Bangla and English) admission assistant for **Port City International University (PCIU)**, Chattogram, built for the PCIU Computer Club Hackathon.

Students can ask about departments, fees, eligibility, the admission procedure and scholarships. Answers come only from the official admission dataset in `data/admission-info.json`. If a value is missing, the assistant says so and points the student to the PCIU Admission Office. It never guesses.

## Features

- **AI chat** (`/chat`): streaming answers powered by open-source models (gpt-oss, Llama, DeepSeek) via Vercel AI Gateway, with Markdown rendering, copy and regenerate buttons, and a stop button. It also has:
  - chat history in localStorage, with rename and delete
  - New Chat and Clear Conversation buttons
  - voice input through the Web Speech API
  - suggested questions
  - follow-up understanding, so "what about the fee for that one?" works
- **Grounded answers**: before each AI call, the server picks the relevant sections of the dataset using Bangla and English keyword matching and program matching. Answers built from the dataset show a *Source: Official Admission Data* badge. Answers about fees or eligibility also show a *Please confirm with the Admission Office* note.
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
  api/chat/route.ts        Streaming AI endpoint (server-only)
  icon.svg, opengraph-image.tsx
components/                Navbar, Footer, ChatWindow, ChatInput, MessageBubble, Sidebar, AdmissionChecklist, ...
data/admission-info.json   Official admission dataset (edit this to update the bot)
lib/admission-data.ts      Data access, retrieval (BN+EN keyword matching), eligibility rules
lib/ai.ts                  Model list and system instruction
lib/i18n.ts                UI strings (Bangla / English) and suggested questions
types/index.ts             Shared types
```

## 1. AI model (open-source, no API key)

The chat runs on open-weight models (`openai/gpt-oss-120b`, with `meta/llama-4-maverick` and `deepseek/deepseek-v4-flash` as automatic fallbacks) through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). On Vercel, authentication is automatic, so no API key is needed. AI Gateway includes free monthly credits, which cover a lot of usage with these low-cost models.

To change models, set `AI_MODELS` to a comma-separated list (first = primary). For local development outside Vercel, run `vercel env pull` or set `AI_GATEWAY_API_KEY`.

If every model is unavailable, the app still answers directly from the official dataset.

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
3. Optionally, under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` with your Vercel URL so the Open Graph image links are correct.
4. Click **Deploy**. Whenever you change environment variables later, redeploy.

## Admission data: maintenance note

`data/admission-info.json` was built from official PCIU pages at https://www.portcity.edu.bd. Each section has a `source_url` and a `last_verified` date.

- **Fees and dates change every semester.** Before the demo, replace or update this file with the organizer's official dataset. You do not need to change any code.
- Any field set to `null` means **not available**. The chatbot will say the information is not available and refer the student to the Admission Office. Fill in a field, such as `university.phone` or `admission_dates.bachelors.orientation`, and the bot starts using it immediately. The current file covers the January 2027 intake (schedule, documents, payment policy, scholarships, bachelor's and master's fees).
- `demo_data` is a top-level flag. If it is set to `true`, the Admission Guide shows a "Demo data" notice.
- To add a program, add an entry to `departments.programs` with its Bangla and English `keywords`, then add matching entries under `eligibility.by_program` and `tuition_fees.by_program`.

## Safety rules built into the bot

- The bot answers only from the dataset. It never invents fees, GPA requirements, dates, scholarship amounts or department details.
- Per-semester and per-year fees are not calculated, because they are not in the official data.
- The bot never says a student is eligible unless the published requirements support it.
- The friendly error messages for an empty message, a missing API key, rate limits (429) and network problems are shown in the student's language.

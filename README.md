# এইচএসসি বিজ্ঞান প্ল্যাটফর্ম — HSC Science Platform

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styled-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-বাংলা_%2F_English-F97316?style=flat-square)
![Free](https://img.shields.io/badge/বিনামূল্যে-Free-brightgreen?style=flat-square)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

> A free, bilingual, full-stack educational platform covering all HSC subjects — built for Bangladeshi students, in their language.

🌐 **Live:** [hscscienceplatform.vercel.app](https://hscscienceplatform.vercel.app)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Why I Built This](#-why-i-built-this)
- [Live Preview](#-live-preview)
- [Subjects Covered](#-subjects-covered)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Features](#-features)
- [Internationalization](#-internationalization-i18n)
- [Database](#-database)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📖 Overview

**HSC Science Platform** (এইচএসসি বিজ্ঞান প্ল্যাটফর্ম) is a free, full-stack bilingual web application built for **Higher Secondary Certificate (HSC) students in Bangladesh**. It organizes every major HSC subject — science, language, and technology — into a clean, navigable interface that students can actually use without getting lost.

Built with **Next.js App Router**, **TypeScript**, **Supabase**, and **Tailwind CSS**, and deployed live on **Vercel** — it's production-grade, fast, and completely free for students.

---

## 💭 Why I Built This

HSC in Bangladesh is brutal. Physics, Chemistry, Biology, Higher Math — all at once, on top of Bengali and English papers, with an ICT exam thrown in for good measure. The resources that exist are scattered, poorly organized, and half of them assume you're comfortable reading in English.

I built this because I wanted one place where a student could open their browser, pick their subject, and just start learning — in Bengali if that's what they prefer, in English if they want to switch. No hunting through PDFs, no YouTube rabbit holes. Just structured, accessible content, for free.

---

## 🖥️ Live Preview

The platform is live at **[hscscienceplatform.vercel.app](https://hscscienceplatform.vercel.app)**

Here's what you'll find when you land on it:

- A bold dark-themed homepage with subject cards organized by category
- Full **Bengali/English language toggle** in the navbar — switch at any time
- **Light/Dark mode toggle** for comfortable reading in any environment
- A **Graph** section for visual learners
- User **login** functionality
- Footer with quick links to every subject

---

## 📚 Subjects Covered

The platform covers the complete HSC curriculum across three categories:

### 🔬 Science Subjects (বিজ্ঞান বিষয়সমূহ)
| Subject | Papers |
|---|---|
| ⚛️ পদার্থবিজ্ঞান (Physics) | Paper 1 & 2 |
| 🧪 রসায়ন (Chemistry) | Paper 1 & 2 |
| 🧬 জীববিজ্ঞান (Biology) | Paper 1 & 2 |
| ∫ উচ্চতর গণিত (Higher Math) | Paper 1 & 2 |

### 🗣️ Language Subjects (ভাষা বিষয়সমূহ)
| Subject | Papers |
|---|---|
| 📖 বাংলা (Bangla) | Paper 1 & 2 |
| 🔤 ইংরেজি (English) | Paper 1 & 2 |

### 💻 Technology Subjects (প্রযুক্তি বিষয়সমূহ)
| Subject | Papers |
|---|---|
| 💻 তথ্য ও যোগাযোগ প্রযুক্তি (ICT) | Paper 1 |

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **Next.js 14 (App Router)** | Full-stack React framework — routing, SSR, server components |
| **TypeScript** | Strict type safety across the entire codebase |
| **Supabase** | PostgreSQL database + authentication + realtime |
| **Tailwind CSS** | Utility-first styling — fast, consistent, responsive |
| **PLpgSQL** | Database migration logic in `supabase/migrations/` |
| **next-intl / i18n** | Bilingual support — Bengali (`bn.json`) and English (`en.json`) |
| **Vercel** | Zero-config deployment, live at production |

**Why this stack?** Next.js App Router and Supabase are a natural fit — server components talk directly to the database without an extra API layer, which keeps things lean and fast. Tailwind means the UI is consistent without a massive CSS file to maintain. TypeScript keeps the whole thing honest. And i18n wasn't optional — the primary audience speaks Bengali.

---

## 📁 Project Structure

```
hsc-science-platform-main/
│
├── messages/                        # i18n translation files
│   ├── bn.json                      # বাংলা translations
│   └── en.json                      # English translations
│
├── public/                          # Static assets
│   ├── favicon.svg
│   └── robots.txt
│
├── src/
│   ├── app/                         # Next.js App Router — pages & layouts
│   ├── components/                  # Reusable React components
│   ├── i18n/                        # i18n config, locale helpers
│   └── lib/                         # Supabase client, utilities
│
├── supabase/
│   └── migrations/
│       └── 001_init.sql             # Initial DB schema (PLpgSQL)
│
├── next.config.js                   # Next.js config
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── tsconfig.json                    # TypeScript config
└── vercel.json                      # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account (free tier is enough)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/RuHRabin/Codes.git
cd Codes/hsc-science-platform-main
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up Supabase**

Create a new project at [supabase.com](https://supabase.com), then run the initial migration:

```bash
# Using Supabase CLI
supabase db push

# Or paste the contents of supabase/migrations/001_init.sql
# directly into the Supabase SQL editor
```

**4. Configure environment variables**

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in your Supabase dashboard under **Project Settings → API**.

**5. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're live. ✅

---

## ✨ Features

- 🆓 **Completely Free** — বিনামূল্যে. No paywalls, no sign-up required to browse
- 🌐 **Bilingual Interface** — switch between বাংলা and English instantly from the navbar
- 🌙 **Dark / Light Mode** — toggle between themes for comfortable reading day or night
- 📚 **All HSC Subjects** — Science, Language, and ICT, all in one place
- 📊 **Graph Section** — visual representations to support conceptual understanding
- 🔐 **User Authentication** — login system backed by Supabase Auth
- ⚡ **Fast by Default** — Next.js App Router with server-side rendering
- 📱 **Fully Responsive** — works on phones, tablets, and desktops
- 🔒 **Type-Safe End-to-End** — TypeScript from UI components down to DB queries

---

## 🌍 Internationalization (i18n)

The platform fully supports **Bengali (bn)** and **English (en)**. All UI strings live in `messages/`:

```
messages/
├── bn.json    # বাংলা — default language
└── en.json    # English
```

The `src/i18n/` directory handles locale detection, routing, and translation helpers. Switching language in the navbar instantly re-renders all UI text without a page reload.

To add a new language: create a new JSON file in `messages/` (e.g., `hi.json`) and register the locale in the i18n config inside `src/i18n/`.

---

## 🗄️ Database

Database schema is managed via Supabase migrations in `supabase/migrations/`. The initial migration `001_init.sql` sets up the core tables using PLpgSQL.

To create a new migration:

```bash
supabase migration new migration_name
# Edit the generated SQL file, then:
supabase db push
```

---

## 🚢 Deployment

This project deploys to **Vercel** out of the box via `vercel.json`.

```bash
# One-time setup
npm i -g vercel
vercel
```

Or connect the GitHub repo to Vercel — every push to `main` deploys automatically. Add your Supabase environment variables under **Vercel → Project Settings → Environment Variables**.

---

## 🤝 Contributing

This project is open for contributions. If you want to add content, fix a bug, improve the UI, or help with translations — go for it.

```bash
# Fork, then clone your fork
git clone https://github.com/YOUR_USERNAME/Codes.git

# Create a branch
git checkout -b feature/your-feature-name

# Commit with a clear message
git commit -m "feat: what you added and why"

# Push and open a PR
git push origin feature/your-feature-name
```

**Before submitting a PR:**
- One focused change per PR — easier to review, easier to merge
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- If it's a bug fix, explain how to reproduce the bug
- If it's a new subject or content, follow the existing structure

Every contribution counts — from fixing a typo to adding a whole new subject. 🙌

---

## 📄 License

Open source. Use it, learn from it, build on it. If you're doing something significant with it, a mention would be appreciated — but it's not required.

---

## 👨‍💻 Author

**RuHRabin**

Built this because the HSC grind is real and students in Bangladesh deserve better tools — in their own language, for free, that actually work.

- 🐙 GitHub: [@RuHRabin](https://github.com/RuHRabin)
- Facebook: [Rabin](https://www.facebook.com/M.RakibUlHasanRabin)
- 🌐 Live Project: [hscscienceplatform.vercel.app](https://hscscienceplatform.vercel.app)

---

<div align="center">

If this helped you, inspired you, or saved you some time —
a ⭐ on the repo means a lot and helps other students find it.

**পড়া শুরু করুন। Build something great. 🚀**

</div>

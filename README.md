# Aura: Student Mental Wellness Tracker

Aura is a Generative AI-powered wellness digital companion designed to help students monitor, manage, and improve their mental well-being during high-stakes board exams and competitive entrance tests (e.g., NEET, JEE, UPSC, GATE, CAT, CUET).

Students preparing for these career-defining milestones often face severe stress, burnout, and self-doubt. Aura leverages GenAI client-side to analyze open-ended daily journaling, track emotional trends, uncover hidden stress triggers, and provide hyper-personalized, context-aware coping strategies and mindfulness exercises.

---

## 🚀 Key Features

### 1. Daily Wellness Journal & AI Pattern Analyzer
- **Open-Ended Journaling**: Distraction-free writing environment where students can log their study progress, test anxiety, or parental pressure.
- **GenAI Pattern Audit**: Integrates with Gemini 1.5 Flash to automatically extract:
  - **Inferred Stress Quotient** (Rating from 1 to 10).
  - **Core Emotions** (e.g., anxiety, fatigue, self-doubt, determination).
  - **Academic Stress Triggers** (e.g., mock test scores, time management, syllabus backlog).
  - **Cognitive Distortions** (e.g., catastrophizing, should statements, all-or-nothing thinking) with CBT-based reframing guidance.
  - **Empathetic Companion Messages & Actionable Tips** suited to their stress triggers.

### 2. Aura: Always-Available Companion Chat
- Employs a specialized, empathetic counselor persona.
- Contextualized to understand competitive exam syllabus loads and academic pressure.
- Quick-reply triggers for immediate anxiety situations.

### 3. Mindfulness & Coping Center
- **Interactive Breathing Guide**: Visual animations supporting:
    - *Box Breathing* (4-4-4-4) for focus.
    - *4-7-8 Technique* for anxiety relief.
    - *Equal Breathing* (4-4) for calming heart rates.
- **Academic Coping Library**: Diagnostic strategies for Mock Test Panic, Study Burnout, and Syllabus Backlogs.

### 4. Paced Study Timer
- Pomodoro-inspired study intervals (25m Focus, 5m Break, 15m Long Break).
- **Forced Mindfulness Breaks**: Actively guides students toward deep rest, stretching, and breathing during break periods, preventing screen-time fatigue.

---

## 🛠️ Tech Stack & Design Principles

- **Framework**: React 18, TypeScript, Vite.
- **Styling**: Vanilla CSS (Custom tokens, glassmorphism, responsive grids, and native transitions).
- **Icons**: Lucide React.
- **GenAI Interface**: `@google/generative-ai` SDK.
- **Visuals**: Custom SVG-drawn progress gauges, mood line charts, and breathing circles for zero external dependency bloat.

---

## 🛡️ Hackathon Scoring Parameters Alignment

### 1. Code Quality (High)
Strict type-checking using TypeScript. Modular, component-driven structure. Zero-warning compilation build.

### 2. Problem Statement Alignment (High)
Addresses severe exam stress. Employs crisis safety hotlines (Tele-MANAS, Vandrevala Foundation) in the footer. 

### 3. Security (Medium)
Client-side-only execution. Personal journals and API keys are stored strictly inside the browser (`localStorage`). Pre-configured API keys can be bound to Vercel/Netlify environment variables (`VITE_GEMINI_API_KEY`) to hide them from the public repository.

### 4. Efficiency (Medium)
No heavy visualization libraries or visual frameworks. Production bundle compiles to under **290 kB** total assets.

### 5. Testing (Low)
Includes automated unit tests built with **Vitest**. Supports a **Demo Mode** fallback to allow judges to test features instantly without setting up API keys.

### 6. Accessibility (Low)
Fully responsive on mobile, high-contrast readable color palette (calming indigo dark mode), and proper ARIA labels.

---

## 💻 Local Setup & Development

1. Clone the repository:
   ```bash
   git clone <your-repo-link>
   cd mental-wellness-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Run unit tests:
   ```bash
   npm test
   ```
6. Build for production:
   ```bash
   npm run build
   ```

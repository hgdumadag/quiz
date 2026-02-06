# Interactive Exam System

A browser-based exam platform built with React + Vite + Tailwind.  
It supports student and admin roles, local exam uploads (JSON), assessment/practice modes, LLM-assisted grading, and CSV export for admin reporting.

## Features

- Student flow
- Role/user selection
- Assigned exams list
- Exam taking with timer, navigation, autosave
- Results review

- Admin flow
- Exam JSON upload + validation
- User management
- Exam assignment
- LLM provider configuration
- Results export (CSV)

- Storage
- `localStorage` for users/config/assignments
- `sessionStorage` for in-progress session snapshots
- `IndexedDB` for exams, sessions, responses, results

- Math rendering
- Inline math rendering via KaTeX in student-facing question/review views

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- KaTeX

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

### 3. Build production bundle

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Project Structure

```text
src/
  components/
    admin/
    auth/
    common/
    layout/
    student/
  context/
  hooks/
  services/
    llm/
    storage/
  utils/
docs/
sample-exam.json
```

## Exam JSON Format

The app expects exam files with:

- `examMetadata`
- `questions`
- optional `settings`

Use these as references:

- `sample-exam.json`
- `exponents-radicals-grade8.json`
- `exponents-radicals-assessment-15.json`

Question IDs must follow the app schema (e.g. `q1`, `q2`, ...), and question `type` must be one of:

- `multiple-choice`
- `true-false`
- `short-answer`
- `long-answer`

## LLM Providers (Optional)

Configurable from Admin > LLM Config:

- OpenAI
- Claude
- Ollama
- LM Studio

Short-answer and long-answer grading can use LLM scoring when configured.

## Deployment Notes

- Uses `vite-plugin-singlefile` in build config.
- `dist/index.html` is generated as a mostly self-contained bundle.

## License

No license file is currently included. Add one if you intend to distribute this project publicly.


# Interactive Exam System - Requirements Documentation
**Version:** 1.0  
**Date:** February 5, 2026  
**Author:** George  
**Project Type:** General-Purpose Adaptive Learning Platform  

---

# Table of Contents

1. [User Requirements Document (URD)](#1-user-requirements-document-urd)
2. [Software Requirements Specification (SRS)](#2-software-requirements-specification-srs)
3. [Functional Requirements Specification (FRS)](#3-functional-requirements-specification-frs)
4. [Product Requirements Document (PRD)](#4-product-requirements-document-prd)
5. [Technical Architecture Document](#5-technical-architecture-document)
6. [Use Cases & User Stories](#6-use-cases--user-stories)
7. [Data Dictionary & JSON Schema Specification](#7-data-dictionary--json-schema-specification)
8. [Appendices](#8-appendices)

---

# 1. User Requirements Document (URD)

## 1.1 Executive Summary

The Interactive Exam System is a general-purpose, AI-enhanced assessment platform designed to support both educational learning and professional training. The system provides two distinct modes: **Practice Mode** for iterative learning with AI coaching, and **Assessment Mode** for formal evaluation. The platform is designed for dual deployment - local HTML files for home use and intranet deployment for office use at JG Summit Holdings.

## 1.2 Business Context

### 1.2.1 Problem Statement
Current examination and training methods lack:
- Personalized, immediate feedback for learners
- Ability to practice iteratively with guidance
- Flexible deployment for both home and corporate environments
- Reusable framework across diverse subjects and contexts
- AI-assisted coaching that guides without revealing answers

### 1.2.2 Target Users

| User Group | Context | Primary Needs |
|------------|---------|---------------|
| **Children (Home)** | Mathematics, statistics, general education | Interactive practice, patient coaching, self-paced learning |
| **Audit Team (Office)** | AI training, data analytics, audit methodologies | Professional assessment, skill validation, training documentation |
| **General Students** | Various subjects | Flexible exam platform, multiple attempt practice |

### 1.2.3 User Personas

**Persona 1: Sarah (Age 12, Student)**
- Learning statistics and probability
- Needs encouragement and hints when stuck
- Benefits from unlimited practice attempts
- Parents monitor progress

**Persona 2: Miguel (Audit Professional)**
- Completing 26-week AI audit training
- Needs formal assessments for certification
- Values detailed feedback on errors
- Time-constrained during workday

**Persona 3: George (Super Admin)**
- Creates exams for multiple audiences
- Manages exam deployment and results
- Configures LLM providers
- Reviews overall performance metrics

## 1.3 User Requirements

### UR-001: Dual-Mode Learning System
**Priority:** MUST HAVE  
**Description:** Users must be able to choose between Practice Mode (learning-focused) and Assessment Mode (evaluation-focused) for any exam.

**Acceptance Criteria:**
- Mode selection available before starting exam
- Each mode has distinct behavior as specified
- Users can switch between modes for different sessions
- Mode selection is clear and unambiguous

### UR-002: AI-Powered Coaching (Practice Mode)
**Priority:** MUST HAVE  
**Description:** When users answer incorrectly in Practice Mode, the system must provide coaching hints that guide them toward the correct answer without revealing it.

**Acceptance Criteria:**
- Hints are progressively more specific
- Maximum 3 hints per question
- LLM identifies common mistakes and provides targeted guidance
- Coaching is encouraging and supportive in tone
- No correct answers are revealed during practice

### UR-003: AI-Powered Grading (Assessment Mode)
**Priority:** MUST HAVE  
**Description:** When users submit answers in Assessment Mode, the system must provide comprehensive feedback including correct answers and explanations.

**Acceptance Criteria:**
- Objective questions (MC, T/F) are auto-graded instantly
- Text responses are evaluated by LLM
- Detailed feedback shows correct answer and why user's answer was wrong
- Scoring breakdown provided by question
- One attempt only per question

### UR-004: Flexible Exam Loading
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to load exam files from various sources depending on deployment context.

**Acceptance Criteria:**
- Local file upload (JSON)
- Paste JSON directly into interface
- Select from local directory (home use)
- Select from SharePoint directory (office use)
- Clear error messages for invalid exam files

### UR-005: Multi-User Support with Privacy
**Priority:** MUST HAVE  
**Description:** Multiple users must be able to use the system independently with their own progress and results.

**Acceptance Criteria:**
- Users see only exams assigned to them
- Progress is tracked per user
- Results are private to each user
- Users can identify completed vs. incomplete exams
- Users can retake exams unlimited times

### UR-006: Results Export
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to export exam results for analysis and record-keeping.

**Acceptance Criteria:**
- Export to CSV format
- Admin selects destination directory
- Export includes user ID, exam ID, scores, timestamps
- Option to export individual or aggregate results

### UR-007: White-Label Customization
**Priority:** SHOULD HAVE  
**Description:** System should support custom branding and themes for different deployment contexts.

**Acceptance Criteria:**
- Customizable color scheme
- Logo/branding replacement
- Custom welcome messages
- Theme saved per deployment

### UR-008: LLM Provider Flexibility
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to configure different LLM providers based on deployment context.

**Acceptance Criteria:**
- Support for Claude (Anthropic API)
- Support for OpenAI (GPT-4o-mini)
- Support for Ollama/LM Studio (local)
- Provider selection in Super Admin settings
- Clear indication when LLM unavailable or quota exceeded

### UR-009: Offline Capability (Home Use)
**Priority:** SHOULD HAVE  
**Description:** System should work offline when using local LLM providers.

**Acceptance Criteria:**
- No internet required when Ollama/LM Studio configured
- Exam files loaded from local filesystem
- Results saved locally
- Clear messaging about offline mode limitations

### UR-010: Performance Constraints
**Priority:** MUST HAVE  
**Description:** System must handle specified concurrent user loads.

**Acceptance Criteria:**
- 1 concurrent user (home deployment)
- 10 concurrent users (office deployment)
- Response time < 2 seconds for question navigation
- LLM response time < 30 seconds per evaluation

---

# 2. Software Requirements Specification (SRS)

## 2.1 Overall Description

### 2.1.1 Product Perspective
The Interactive Exam System is a standalone web application with no external system dependencies except for optional LLM API services. It operates as:
- **Single-page application (SPA)** built with React
- **Self-contained HTML file** for easy distribution
- **Stateless architecture** with browser-based storage
- **LLM-agnostic design** supporting multiple AI providers

### 2.1.2 Product Functions
1. **Exam Management:** Load, display, and manage exam content
2. **Dual-Mode Assessment:** Practice and Assessment modes with different behaviors
3. **AI Feedback:** LLM-powered coaching (practice) and grading (assessment)
4. **User Management:** Multi-user support with role-based access
5. **Progress Tracking:** Save and resume exam sessions
6. **Results Analytics:** Export and analyze exam performance
7. **Configuration:** Customizable themes and LLM settings

### 2.1.3 User Classes and Characteristics

| User Class | Technical Expertise | Frequency of Use | Functions Used |
|------------|---------------------|------------------|----------------|
| **Student (Child)** | Low | Daily | Take exams (practice mode), view progress |
| **Student (Professional)** | Medium | Weekly | Take exams (both modes), view detailed results |
| **Super Admin** | High | As needed | All functions, configure system, manage exams, export results |

### 2.1.4 Operating Environment

**Home Deployment:**
- **Platform:** Windows, macOS, Linux
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Storage:** Local filesystem access
- **LLM:** Ollama or LM Studio running locally
- **Network:** Optional (offline capable)

**Office Deployment:**
- **Platform:** Windows 10/11 (corporate standard)
- **Browser:** Chrome/Edge (latest)
- **Storage:** SharePoint document library
- **LLM:** Corporate API keys (Claude/OpenAI) or local Ollama
- **Network:** Corporate intranet (no internet required)

### 2.1.5 Design and Implementation Constraints

**Technical Constraints:**
- Must work as single HTML file (no separate CSS/JS files for distribution)
- No backend server required
- Must support browsers without WebAssembly
- File size < 5MB for easy distribution
- LLM token limit: 500,000 per session

**Business Constraints:**
- No cloud storage dependencies
- No user authentication infrastructure
- Must work on corporate network with restricted internet
- Honor system for exam integrity (no proctoring)

**Regulatory Constraints:**
- No personal data sent to external services without consent
- Exam content remains within specified boundaries (local/SharePoint)
- No GDPR requirements (internal use only)

### 2.1.6 Assumptions and Dependencies

**Assumptions:**
- Users have modern web browsers installed
- Super Admin has technical capability to edit JSON files
- Network connectivity available when using cloud LLM providers
- SharePoint accessible via browser (office deployment)
- Local LLM providers (Ollama/LM Studio) properly configured (home use)

**Dependencies:**
- React library (embedded in artifact)
- LLM API availability (Claude, OpenAI, or local)
- Browser localStorage API for data persistence
- File System Access API (for local file operations)

## 2.2 System Features

### 2.2.1 Exam Loading & Management

**Feature ID:** SF-001  
**Priority:** MUST HAVE

**Description:**  
System shall provide multiple methods for Super Admin to load exam files into the application.

**Functional Requirements:**
- **SF-001-1:** System shall accept JSON file upload via file input dialog
- **SF-001-2:** System shall accept JSON content pasted into text area
- **SF-001-3:** System shall list available exams from local directory (home)
- **SF-001-4:** System shall list available exams from SharePoint directory (office)
- **SF-001-5:** System shall validate exam JSON against schema before loading
- **SF-001-6:** System shall display clear error messages for invalid exam formats
- **SF-001-7:** System shall support exams with 1-100 questions
- **SF-001-8:** System shall support all question types: multiple-choice, true/false, short-answer, long-answer

**Input:** JSON exam file or content  
**Processing:** Validation against schema, parsing, storage in memory  
**Output:** Loaded exam ready for user selection, or error message

---

### 2.2.2 User Role Management

**Feature ID:** SF-002  
**Priority:** MUST HAVE

**Description:**  
System shall support two user roles with different privileges and interfaces.

**Functional Requirements:**
- **SF-002-1:** System shall provide role selection on startup (Student or Super Admin)
- **SF-002-2:** Super Admin role shall have access to configuration, exam loading, and results export
- **SF-002-3:** Student role shall have access to assigned exams only
- **SF-002-4:** System shall store user identity in browser session
- **SF-002-5:** System shall associate exam progress with specific users
- **SF-002-6:** System shall display different UI elements based on active role
- **SF-002-7:** System shall allow role switching via settings menu

**Input:** Role selection, user identifier  
**Processing:** Load role-specific UI and permissions  
**Output:** Customized interface for selected role

---

### 2.2.3 Exam Assignment & Visibility

**Feature ID:** SF-003  
**Priority:** MUST HAVE

**Description:**  
System shall control which exams are visible to which users.

**Functional Requirements:**
- **SF-003-1:** Super Admin shall assign exams to specific users via configuration
- **SF-003-2:** Students shall see only exams assigned to them
- **SF-003-3:** System shall display completion status (completed/incomplete) for each exam
- **SF-003-4:** Completed exams shall remain visible and retakable
- **SF-003-5:** System shall track attempt number for retaken exams
- **SF-003-6:** System shall display last score achieved on completed exams

**Input:** User ID, exam assignments  
**Processing:** Filter exam list by user assignments  
**Output:** Personalized exam list with status indicators

---

### 2.2.4 Practice Mode

**Feature ID:** SF-004  
**Priority:** MUST HAVE

**Description:**  
System shall provide a learning-focused mode with unlimited attempts and AI coaching.

**Functional Requirements:**
- **SF-004-1:** System shall allow unlimited answer attempts per question
- **SF-004-2:** System shall NOT reveal correct answers during practice
- **SF-004-3:** System shall provide progressive hints (up to 3) based on attempt number
- **SF-004-4:** For objective questions (MC/TF), system shall indicate correct/incorrect immediately
- **SF-004-5:** For text responses, system shall send to LLM for coaching feedback
- **SF-004-6:** LLM coaching shall identify error type and provide guidance without answers
- **SF-004-7:** System shall track attempt count per question
- **SF-004-8:** System shall allow navigation between questions in any order
- **SF-004-9:** System shall NOT enforce time limits in practice mode
- **SF-004-10:** System shall save progress automatically (can resume later)
- **SF-004-11:** System shall display encouragement messages for persistence
- **SF-004-12:** System shall mark question as "mastered" after correct answer

**LLM Prompt Template (Practice Mode):**
```
You are a supportive tutor helping a student learn. The student answered incorrectly.

STRICT RULES:
1. NEVER reveal the correct answer
2. Guide them toward discovering it themselves
3. Be encouraging and supportive
4. Focus on the learning process

Question: {question}
Student's Answer: {studentAnswer}
Attempt Number: {attemptNumber}
Hints Available: {hints}
Common Mistakes: {commonMistakes}

Provide brief coaching (2-3 sentences) that helps without giving away the answer.
```

**Input:** User answer, question data, attempt number  
**Processing:** Validate answer, generate appropriate hint/coaching  
**Output:** Coaching feedback, updated attempt counter, mastery status

---

### 2.2.5 Assessment Mode

**Feature ID:** SF-005  
**Priority:** MUST HAVE

**Description:**  
System shall provide an evaluation-focused mode with one attempt and comprehensive grading.

**Functional Requirements:**
- **SF-005-1:** System shall allow only ONE attempt per question
- **SF-005-2:** System shall lock answers after submission (no editing)
- **SF-005-3:** For objective questions (MC/TF), system shall auto-grade immediately
- **SF-005-4:** For text responses, system shall send to LLM for evaluation
- **SF-005-5:** System shall display timer based on exam time limit
- **SF-005-6:** System shall warn at 10 minutes and 2 minutes remaining
- **SF-005-7:** System shall auto-submit exam when time expires
- **SF-005-8:** System shall NOT allow pause/resume during assessment
- **SF-005-9:** System shall require confirmation before final submission
- **SF-005-10:** After submission, system shall display results including correct answers
- **SF-005-11:** System shall calculate total score and percentage
- **SF-005-12:** System shall save assessment results with timestamp
- **SF-005-13:** System shall allow review of questions with correct answers shown
- **SF-005-14:** System shall allow unlimited retakes (generates new attempt record)

**LLM Prompt Template (Assessment Mode):**
```
You are an exam grader providing comprehensive feedback.

Question: {question}
Rubric: {rubric}
Expected Key Points: {keyPoints}
Student's Answer: {studentAnswer}
Points Available: {points}

Return JSON:
{
  "score": <number>,
  "maxScore": <number>,
  "correctAnswer": "<the correct answer>",
  "feedback": "<detailed explanation of why student is wrong>",
  "studentErrors": ["<specific error 1>", "<error 2>"],
  "misconception": "<what concept they misunderstood>",
  "improvement": "<how to avoid this mistake>"
}
```

**Input:** User answers, exam questions, rubrics  
**Processing:** Grade all questions, calculate total score, generate feedback  
**Output:** Complete results dashboard with scores, correct answers, and feedback

---

### 2.2.6 LLM Integration

**Feature ID:** SF-006  
**Priority:** MUST HAVE

**Description:**  
System shall integrate with multiple LLM providers for AI-powered feedback and grading.

**Functional Requirements:**
- **SF-006-1:** System shall support Claude (Anthropic API) via API key
- **SF-006-2:** System shall support OpenAI (GPT-4o-mini) via API key
- **SF-006-3:** System shall support Ollama via local HTTP endpoint
- **SF-006-4:** System shall support LM Studio via local HTTP endpoint
- **SF-006-5:** Super Admin shall configure LLM provider in settings
- **SF-006-6:** System shall use configured provider for all LLM operations
- **SF-006-7:** System shall track token usage per session (limit: 500,000)
- **SF-006-8:** System shall display warning at 80% token usage
- **SF-006-9:** System shall disable LLM features when quota exceeded
- **SF-006-10:** System shall display clear message: "LLM feedback not available - quota exceeded"
- **SF-006-11:** System shall fall back to showing only rubric without LLM feedback
- **SF-006-12:** System shall retry failed LLM calls up to 3 times
- **SF-006-13:** System shall timeout LLM calls after 30 seconds
- **SF-006-14:** System shall handle offline mode gracefully (local LLM only)

**LLM Configuration Schema:**
```json
{
  "provider": "claude | openai | ollama | lmstudio",
  "apiKey": "string (optional for local)",
  "endpoint": "string (for local providers)",
  "model": "string",
  "maxTokensPerSession": 500000,
  "timeout": 30000
}
```

**Input:** Question, student answer, mode (practice/assessment)  
**Processing:** Format prompt, call LLM API, parse response  
**Output:** Structured feedback (coaching or grading)

---

### 2.2.7 Question Rendering

**Feature ID:** SF-007  
**Priority:** MUST HAVE

**Description:**  
System shall render different question types with appropriate UI components.

**Functional Requirements:**

**Multiple Choice (SF-007-MC):**
- Display question text
- Display 2-10 options as radio buttons
- Highlight selected option
- In Assessment Mode after submission: show correct answer in green, incorrect in red
- Support images in question and options (optional)

**True/False (SF-007-TF):**
- Display question text
- Display two radio buttons: True and False
- Highlight selected option
- In Assessment Mode after submission: show correct answer

**Short Answer (SF-007-SA):**
- Display question text
- Provide text input field (single line)
- Character limit: 200 characters
- Show remaining character count
- Send to LLM for evaluation

**Long Answer (SF-007-LA):**
- Display question text
- Provide textarea (multi-line)
- Character limit: 500 characters (configurable per question)
- Show remaining character count
- Send to LLM for evaluation
- Support basic formatting (line breaks)

**Common for All Types:**
- Display question number and points value
- Display category/topic label (if provided)
- Display difficulty indicator (if provided)
- Show attempt counter (Practice Mode)
- Show lock icon (Assessment Mode after attempt)

**Input:** Question object from exam JSON  
**Processing:** Select appropriate component, render with data  
**Output:** Interactive question interface

---

### 2.2.8 Navigation & Progress Tracking

**Feature ID:** SF-008  
**Priority:** MUST HAVE

**Description:**  
System shall provide intuitive navigation and progress indicators.

**Functional Requirements:**
- **SF-008-1:** System shall display progress bar showing % completion
- **SF-008-2:** System shall provide "Next" and "Previous" buttons
- **SF-008-3:** System shall provide question navigation sidebar/menu
- **SF-008-4:** System shall indicate answered vs. unanswered questions
- **SF-008-5:** System shall allow jumping to any question in Practice Mode
- **SF-008-6:** System shall allow review (not editing) of previous questions in Assessment Mode
- **SF-008-7:** System shall provide "Flag for Review" option
- **SF-008-8:** System shall highlight flagged questions in navigation
- **SF-008-9:** System shall display timer in Assessment Mode (countdown format)
- **SF-008-10:** System shall warn before navigating away with unsaved answers
- **SF-008-11:** System shall auto-save progress every 30 seconds (Practice Mode)
- **SF-008-12:** System shall provide "Submit Exam" button (shows only when all questions attempted)

**Input:** User navigation action  
**Processing:** Update current question index, save progress  
**Output:** New question displayed, updated progress indicators

---

### 2.2.9 Results & Analytics

**Feature ID:** SF-009  
**Priority:** MUST HAVE

**Description:**  
System shall provide comprehensive results display and export capabilities.

**Functional Requirements:**

**Results Dashboard (SF-009-RD):**
- Display overall score (points earned / total points)
- Display percentage score
- Display pass/fail status (based on exam passing score)
- Display time taken (Assessment Mode)
- Display attempt number (if retake)
- Breakdown by question type (MC, TF, SA, LA)
- Breakdown by category/topic
- Display all questions with:
  - User's answer
  - Correct answer
  - Points earned
  - Feedback/explanation
  - Difficulty level

**Export Functionality (SF-009-EX):**
- **SF-009-EX-1:** Super Admin shall export results to CSV
- **SF-009-EX-2:** System shall prompt for destination directory
- **SF-009-EX-3:** CSV shall include: User ID, Exam ID, Exam Title, Date/Time, Score, Percentage, Time Taken, Attempt #
- **SF-009-EX-4:** Detailed export option: include all questions and answers
- **SF-009-EX-5:** Aggregate export option: summary statistics across all users/exams
- **SF-009-EX-6:** File naming convention: `ExamResults_{ExamID}_{Timestamp}.csv`

**CSV Format (Summary):**
```csv
UserID,ExamID,ExamTitle,DateTime,Score,MaxScore,Percentage,TimeTaken,AttemptNumber,Mode
user001,stats-101,Statistics 101,2026-02-05T10:30:00,85,100,85%,45:23,1,assessment
```

**CSV Format (Detailed):**
```csv
UserID,ExamID,QuestionID,Question,UserAnswer,CorrectAnswer,Points,MaxPoints,Feedback
user001,stats-101,q1,What is mean?,The average value,The average value,2,2,Correct
```

**Input:** Completed exam session data  
**Processing:** Calculate scores, aggregate statistics, format output  
**Output:** Results dashboard (screen) or CSV file (export)

---

### 2.2.10 Configuration & Customization

**Feature ID:** SF-010  
**Priority:** SHOULD HAVE

**Description:**  
System shall allow Super Admin to customize appearance and behavior.

**Functional Requirements:**

**Theme Customization (SF-010-TH):**
- Primary color selection
- Secondary color selection
- Font family selection (3-5 options)
- Logo image upload (top-left corner)
- Custom welcome message
- Footer text customization
- Save theme configuration to browser storage

**System Settings (SF-010-SYS):**
- LLM provider selection and configuration
- Default exam time limit
- Auto-save interval (Practice Mode)
- Token usage display toggle
- Export directory default path
- Language selection (future enhancement - currently English only)

**Exam Assignment (SF-010-EA):**
- User list management (add/remove users)
- Assign exams to specific users
- Bulk assignment (assign one exam to multiple users)
- Assignment status view (who has which exams)

**Storage Configuration (SF-010-ST):**
- Local directory path (home use)
- SharePoint site URL (office use)
- Results storage location

**Input:** Configuration changes via Super Admin settings panel  
**Processing:** Validate settings, save to browser storage  
**Output:** Updated system behavior and appearance

---

## 2.3 External Interface Requirements

### 2.3.1 User Interfaces

**UI-001: Main Application Layout**
```
┌─────────────────────────────────────────────────────┐
│ [Logo]  Interactive Exam System         [Settings] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────────┐ │
│  │ Question List   │  │  Question Display Area   │ │
│  │ (Navigation)    │  │                          │ │
│  │                 │  │  Question #5 (2 points)  │ │
│  │ Q1 ✓            │  │  Category: Statistics    │ │
│  │ Q2 ✓            │  │                          │ │
│  │ Q3 ⚑            │  │  [Question text here]    │ │
│  │ Q4 ○            │  │                          │ │
│  │ Q5 ● (current)  │  │  [Answer input area]     │ │
│  │ Q6 ○            │  │                          │ │
│  │                 │  │  [Feedback area]         │ │
│  │                 │  │                          │ │
│  │                 │  │  [Previous] [Next]       │ │
│  └─────────────────┘  └──────────────────────────┘ │
│                                                     │
│  Progress: ████████░░ 80%         Time: 25:34      │
└─────────────────────────────────────────────────────┘
Legend: ✓=answered ○=unanswered ●=current ⚑=flagged
```

**UI-002: Results Dashboard**
```
┌─────────────────────────────────────────────────────┐
│              Exam Results - Statistics 101          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Score: 85 / 100 (85%)               ✓ PASS        │
│  Time Taken: 45:23                                  │
│  Attempt: #1                                        │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Breakdown by Type                           │  │
│  │  Multiple Choice:  18/20  (90%)              │  │
│  │  True/False:       10/10  (100%)             │  │
│  │  Short Answer:     30/40  (75%)              │  │
│  │  Long Answer:      27/30  (90%)              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Question-by-Question Review                 │  │
│  │                                               │  │
│  │  Q1: [Correct] ✓  Your answer: B             │  │
│  │      Correct answer: B                        │  │
│  │                                               │  │
│  │  Q3: [Incorrect] ✗  Your answer: 12          │  │
│  │      Correct answer: 8                        │  │
│  │      Feedback: You forgot to divide by n...   │  │
│  │                                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [Export Results] [Retake Exam] [Close]            │
└─────────────────────────────────────────────────────┘
```

**UI-003: Super Admin Dashboard**
```
┌─────────────────────────────────────────────────────┐
│            Super Admin Dashboard                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────┬──────────────────────────────┐ │
│  │ Exam Management│  Results & Analytics         │ │
│  ├────────────────┼──────────────────────────────┤ │
│  │ [Load Exam]    │  Total Exams: 15             │ │
│  │ [Paste JSON]   │  Active Users: 8             │ │
│  │ [From Library] │  Completed Assessments: 42   │ │
│  │                │  Avg Score: 78.5%            │ │
│  │ Loaded Exams:  │                              │ │
│  │ • Stats 101    │  [Export All Results]        │ │
│  │ • Audit AI     │  [View User Progress]        │ │
│  │ • Probability  │                              │ │
│  └────────────────┴──────────────────────────────┘ │
│                                                     │
│  ┌────────────────────────────────────────────────┐│
│  │ Configuration                                  ││
│  │                                                ││
│  │ LLM Provider: [Claude ▼]                      ││
│  │ API Key: ************************              ││
│  │ Token Usage: 125,432 / 500,000 (25%)          ││
│  │                                                ││
│  │ Theme: [Custom ▼]  [Edit Theme]               ││
│  │                                                ││
│  │ [User Management] [Exam Assignments]          ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 2.3.2 Hardware Interfaces
- **None required** (browser-based application)

### 2.3.3 Software Interfaces

**SI-001: LLM APIs**

| Interface | Protocol | Purpose | Data Format |
|-----------|----------|---------|-------------|
| Claude API | HTTPS REST | AI coaching and grading | JSON |
| OpenAI API | HTTPS REST | AI coaching and grading | JSON |
| Ollama | HTTP REST | Local AI processing | JSON |
| LM Studio | HTTP REST | Local AI processing | JSON |

**Claude API Example:**
```javascript
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {apiKey}
  content-type: application/json
  anthropic-version: 2023-06-01
Body:
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "messages": [{
    "role": "user",
    "content": "{prompt}"
  }]
}
```

**Ollama API Example:**
```javascript
POST http://localhost:11434/api/generate
Headers:
  content-type: application/json
Body:
{
  "model": "llama2",
  "prompt": "{prompt}",
  "stream": false
}
```

**SI-002: Browser Storage APIs**

| API | Purpose | Data Stored |
|-----|---------|-------------|
| localStorage | Persistent configuration | Theme, settings, user preferences |
| sessionStorage | Session-specific data | Current exam state, LLM token count |
| IndexedDB | Large data storage | Exam content, user results history |

**SI-003: File System Access API**

```javascript
// For local file loading (home deployment)
const [fileHandle] = await window.showOpenFilePicker({
  types: [{
    description: 'Exam Files',
    accept: {'application/json': ['.json']}
  }]
});
const file = await fileHandle.getFile();
const contents = await file.text();
const exam = JSON.parse(contents);

// For CSV export
const handle = await window.showSaveFilePicker({
  suggestedName: `ExamResults_${examId}_${timestamp}.csv`,
  types: [{
    description: 'CSV File',
    accept: {'text/csv': ['.csv']}
  }]
});
```

### 2.3.4 Communications Interfaces

**CI-001: Network Requirements**

| Deployment | Network Type | Bandwidth | Protocols |
|------------|--------------|-----------|-----------|
| Home (Online) | Internet | 1 Mbps minimum | HTTPS |
| Home (Offline) | None | N/A | HTTP (localhost only) |
| Office | Corporate Intranet | 10 Mbps minimum | HTTPS, SMB (SharePoint) |

**CI-002: Data Transfer**

**Outbound (to LLM):**
- Request size: < 10 KB per question
- Frequency: 1-10 requests per exam session
- Timeout: 30 seconds
- Retry: 3 attempts with exponential backoff

**Inbound (from LLM):**
- Response size: < 5 KB per question
- Format: JSON structured feedback

**SharePoint (Office Deployment):**
- Protocol: HTTPS or SMB
- Authentication: Windows integrated auth
- Access: Read exam files, write result files
- Permissions: User-specific folder access

## 2.4 Non-Functional Requirements

### 2.4.1 Performance Requirements

**NFR-P-001: Response Time**
- Question navigation: < 500ms
- Objective question grading: < 1 second
- LLM response (practice coaching): < 30 seconds
- LLM response (assessment grading): < 30 seconds
- Exam loading: < 3 seconds (for 100-question exam)
- Results export: < 5 seconds (for 1000 results)

**NFR-P-002: Throughput**
- Concurrent users (home): 1
- Concurrent users (office): 10
- Questions per exam: 1-100
- Exams per user: unlimited
- Results records: 10,000+ storable locally

**NFR-P-003: Resource Utilization**
- Browser memory: < 200 MB per session
- CPU usage: < 25% during normal operation
- Local storage: < 50 MB per user
- File size (HTML): < 5 MB

### 2.4.2 Safety Requirements

**NFR-S-001: Data Loss Prevention**
- Auto-save progress every 30 seconds (Practice Mode)
- Prompt before leaving page with unsaved changes
- Recovery from browser crash (restore last saved state)
- Backup results before export operations

**NFR-S-002: Error Recovery**
- Graceful handling of LLM API failures
- Fallback to local grading when LLM unavailable
- Clear error messages with recovery options
- No data corruption on unexpected shutdown

### 2.4.3 Security Requirements

**NFR-SEC-001: Data Privacy**
- API keys stored encrypted in browser storage
- No exam content or user answers sent to analytics
- Results exported only with Super Admin authorization
- User data isolated (no cross-user data access)

**NFR-SEC-002: Access Control**
- Role-based UI elements (Student vs. Super Admin)
- Exam visibility restricted by assignment
- Configuration changes require Super Admin role
- Results export requires Super Admin role

**NFR-SEC-003: Data Integrity**
- Exam JSON validation before loading
- Answer validation before submission (prevent tampering)
- Checksum verification for exam files (optional)
- Immutable assessment results (once submitted)

**Note:** Advanced security (authentication, encryption-at-rest, audit logging) is explicitly out of scope for MVP based on honor system requirement.

### 2.4.4 Software Quality Attributes

**NFR-Q-001: Usability**
- First-time user can complete exam without instructions: < 5 minutes
- Super Admin can load new exam: < 2 minutes
- Intuitive navigation (no training required for students)
- Accessible via keyboard navigation
- Error messages in plain language (no technical jargon)

**NFR-Q-002: Reliability**
- Uptime: 99.9% (browser-based, no server downtime)
- Data persistence: 100% (no loss of saved answers)
- LLM fallback success rate: 100% (show message if unavailable)
- Export success rate: 99% (with clear error handling)

**NFR-Q-003: Maintainability**
- Modular code structure (separate components)
- Inline documentation for complex logic
- JSON schema documentation for exam format
- Version number displayed in UI
- Change log maintained

**NFR-Q-004: Portability**
- Single HTML file (no installation required)
- Works on Windows, macOS, Linux
- No platform-specific features
- Exam files portable across deployments

**NFR-Q-005: Scalability**
- Support 1-100 questions per exam without performance degradation
- Support 1-1000 users without code changes (only deployment consideration)
- Support 10-10,000 results without slowdown
- LLM provider switchable without code changes

### 2.4.5 Business Rules

**BR-001: Exam Integrity**
- Honor system (no technical proctoring)
- One attempt per question (Assessment Mode only)
- No answer editing after submission (Assessment Mode)
- Timer enforcement (Assessment Mode)
- No pause/resume (Assessment Mode)

**BR-002: Learning Philosophy**
- Coaching never reveals answers (Practice Mode)
- Unlimited attempts encouraged (Practice Mode)
- Detailed feedback after submission (Assessment Mode)
- Retakes allowed unlimited times (both modes)

**BR-003: Data Ownership**
- Exam content owned by creator (George)
- Student answers owned by student
- Results accessible to student and Super Admin
- Exported results remain on local/corporate storage

**BR-004: Token Budget**
- 500,000 tokens per session limit
- Warning at 80% usage (400,000 tokens)
- Disable LLM at 100% usage
- Reset counter on new session (browser refresh)

**BR-005: Grading Consistency**
- Objective questions: deterministic (same answer = same score)
- Subjective questions: LLM-based (may vary slightly)
- Rubric-based grading for consistency
- Manual override not available (honor LLM decision)

---

# 3. Functional Requirements Specification (FRS)

## 3.1 Use Case Specifications

### UC-001: Load Exam (Super Admin)

**Actor:** Super Admin  
**Preconditions:**
- User has selected Super Admin role
- Exam JSON file available (local or SharePoint)

**Main Flow:**
1. Super Admin clicks "Load Exam" button
2. System displays load options:
   - Upload file
   - Paste JSON
   - Select from library (local directory)
   - Select from SharePoint (office)
3. Super Admin selects option and provides exam data
4. System validates JSON against schema
5. System parses exam content
6. System displays confirmation: "Exam '{title}' loaded successfully"
7. System adds exam to available exams list

**Alternative Flows:**
- **4a.** Invalid JSON format
  - System displays error: "Invalid JSON format at line {X}"
  - System highlights error location
  - Return to step 3
  
- **4b.** Schema validation fails
  - System displays specific errors (e.g., "Missing required field: questions")
  - System provides schema documentation link
  - Return to step 3

- **5a.** Duplicate exam ID
  - System asks: "Exam '{id}' already exists. Overwrite?"
  - If yes: Replace existing exam
  - If no: Return to step 2

**Postconditions:**
- Exam is available for assignment to users
- Exam appears in Super Admin exam list

**Special Requirements:**
- Validation must complete within 2 seconds
- Support exam files up to 5 MB

---

### UC-002: Assign Exam to Users (Super Admin)

**Actor:** Super Admin  
**Preconditions:**
- At least one exam loaded
- User list exists

**Main Flow:**
1. Super Admin navigates to "User Management"
2. System displays list of users
3. Super Admin selects one or more users
4. Super Admin clicks "Assign Exam"
5. System displays list of available exams
6. Super Admin selects exam(s) to assign
7. Super Admin clicks "Confirm Assignment"
8. System creates assignment records
9. System displays confirmation: "{X} exam(s) assigned to {Y} user(s)"

**Alternative Flows:**
- **3a.** No users exist
  - System prompts: "Add users before assigning exams"
  - System opens Add User dialog
  
- **6a.** Exam already assigned
  - System indicates already assigned exams
  - Super Admin can choose to reassign (creates new attempt)

**Postconditions:**
- Users see assigned exams in their exam list
- Assignment tracked with timestamp

---

### UC-003: Start Exam in Practice Mode (Student)

**Actor:** Student  
**Preconditions:**
- User logged in with Student role
- At least one exam assigned to user

**Main Flow:**
1. Student views assigned exams list
2. Student selects an exam
3. System displays exam details and mode selection
4. Student clicks "Practice Mode"
5. System displays practice mode instructions
6. Student clicks "Start"
7. System loads first question
8. System displays practice mode indicators (unlimited attempts, no timer)
9. System starts auto-save timer

**Alternative Flows:**
- **2a.** Exam already in progress
  - System asks: "Resume previous session or start new?"
  - If resume: Load saved progress
  - If new: Clear previous progress
  
- **4a.** Assessment mode selected instead
  - Follow UC-004 flow

**Postconditions:**
- Exam session created
- Progress tracking initiated
- Auto-save enabled

---

### UC-004: Start Exam in Assessment Mode (Student)

**Actor:** Student  
**Preconditions:**
- User logged in with Student role
- At least one exam assigned to user

**Main Flow:**
1. Student views assigned exams list
2. Student selects an exam
3. System displays exam details and mode selection
4. Student clicks "Assessment Mode"
5. System displays assessment mode warnings:
   - One attempt per question
   - Timer will start
   - No pause allowed
6. Student confirms understanding
7. System displays final confirmation: "Ready to begin?"
8. Student clicks "Begin"
9. System starts countdown timer
10. System loads first question
11. System locks browser notifications (optional)

**Alternative Flows:**
- **6a.** Student cancels
  - Return to exam list (no session created)
  
- **2a.** Previous assessment in progress
  - System prompts: "Resume incomplete assessment?"
  - If yes: Resume from saved point (timer continues)
  - If no: Start new attempt (previous attempt saved as incomplete)

**Postconditions:**
- Assessment session created with timestamp
- Timer active
- One-attempt-per-question enforced

---

### UC-005: Answer Question in Practice Mode (Student)

**Actor:** Student  
**Preconditions:**
- Practice mode exam session active
- Question displayed

**Main Flow:**
1. Student reads question
2. Student enters/selects answer
3. Student clicks "Check Answer"
4. System validates answer
5. **If correct (MC/TF):**
   - System displays ✓ "Correct!"
   - System marks question as mastered
   - System enables "Next" button
6. **If incorrect (MC/TF):**
   - System displays ✗ "Not quite. Try again!"
   - System increments attempt counter
   - System provides hint based on attempt number
   - Student can try again (return to step 2)
7. **If text response:**
   - System sends to LLM for coaching
   - System displays coaching feedback
   - Student revises answer (return to step 2)

**Alternative Flows:**
- **7a.** LLM unavailable or quota exceeded
  - System displays generic hint from exam JSON
  - System message: "AI coaching temporarily unavailable"
  
- **3a.** Student clicks "Flag for Review"
  - System marks question with flag icon
  - Question remains unanswered
  - Student can navigate away

- **Student clicks "Skip"**
  - Question marked as skipped
  - System navigates to next question

**Postconditions:**
- Attempt recorded
- Progress auto-saved
- Mastery status updated (if correct)

**LLM Integration Details:**
```javascript
// Practice Mode LLM Call
{
  prompt: `
    You are a supportive tutor. NEVER reveal the correct answer.
    
    Question: ${question.text}
    Student Answer: ${studentAnswer}
    Attempt: ${attemptNumber}
    Hints: ${question.hints}
    Common Mistakes: ${question.commonMistakes}
    
    Provide encouraging guidance (2-3 sentences) without revealing the answer.
  `,
  maxTokens: 200,
  temperature: 0.7
}
```

---

### UC-006: Answer Question in Assessment Mode (Student)

**Actor:** Student  
**Preconditions:**
- Assessment mode exam session active
- Question not yet answered

**Main Flow:**
1. Student reads question
2. Student enters/selects answer
3. Student clicks "Submit Answer"
4. System displays confirmation: "Once submitted, you cannot change your answer. Continue?"
5. Student confirms
6. System locks answer (cannot edit)
7. System validates answer (for MC/TF)
8. System displays ✓ or ✗ indicator (no explanation yet)
9. System enables "Next" button

**Alternative Flows:**
- **5a.** Student cancels
  - Answer not submitted
  - Student can modify answer (return to step 2)
  
- **3a.** Student navigates to different question
  - Current answer auto-saved as draft (not submitted)
  - Student can return and submit later
  
- **Timer expires during answering:**
  - System auto-submits current answer
  - System locks remaining unanswered questions
  - System proceeds to submission

**Postconditions:**
- Answer locked and cannot be changed
- Progress saved
- Question marked as answered

**Special Requirements:**
- Lock must be irreversible within same attempt
- Visual indicator (lock icon) must be clear

---

### UC-007: Navigate Between Questions (Student)

**Actor:** Student  
**Preconditions:**
- Exam session active (Practice or Assessment)

**Main Flow:**
1. Student clicks navigation control:
   - "Next" button
   - "Previous" button
   - Question number in sidebar
2. **Practice Mode:**
   - System navigates freely to selected question
   - System auto-saves current answer (if any)
3. **Assessment Mode:**
   - If current question unanswered: Prompt "Leave without answering?"
   - System navigates to selected question
   - System displays question status (answered/locked or unanswered)
4. System displays selected question
5. System updates progress bar

**Alternative Flows:**
- **2a.** Last question reached
  - "Next" button disabled OR changes to "Submit Exam"
  
- **2b.** First question reached
  - "Previous" button disabled

**Postconditions:**
- Current question updated
- Progress saved

---

### UC-008: Receive LLM Coaching (Practice Mode)

**Actor:** Student  
**Preconditions:**
- Practice mode active
- Text-based question answered incorrectly
- LLM available and within token budget

**Main Flow:**
1. Student submits text answer
2. System sends to LLM with coaching prompt
3. LLM analyzes answer and identifies error type
4. LLM generates coaching hint
5. System displays coaching in feedback area:
   - "💡 Hint: {coaching_text}"
   - Encouragement message
   - Attempt counter: "Attempt #{X}"
6. Student reads coaching
7. Student revises answer
8. Return to answer submission

**Alternative Flows:**
- **2a.** LLM API call fails
  - System retries up to 3 times
  - If all fail: Display generic hint from exam JSON
  
- **2b.** Token budget exceeded
  - System displays: "AI coaching unavailable - session limit reached"
  - System shows generic hint from exam JSON
  
- **3a.** Attempt #1 (first hint)
  - LLM provides gentle nudge
  - Example: "Think about the formula for variance..."
  
- **3b.** Attempt #2 (second hint)
  - LLM provides more specific guidance
  - Example: "Did you remember to square the deviations?"
  
- **3c.** Attempt #3+ (third hint)
  - LLM provides most specific hint without revealing answer
  - Example: "Check your calculation: mean is 6, deviations are -4, -2, 0, 2, 4. What's next?"

**Postconditions:**
- Coaching feedback displayed
- Attempt incremented
- Token usage incremented
- Student can try again

**LLM Response Format:**
```json
{
  "errorType": "calculation_error | conceptual_error | method_error",
  "coaching": "Your hint text here...",
  "encouragement": "You're on the right track! Keep trying.",
  "matchedMistake": "forgot to square" // if matches common mistake
}
```

---

### UC-009: Submit Exam for Grading (Assessment Mode)

**Actor:** Student  
**Preconditions:**
- Assessment mode session active
- All questions attempted (or timer expired)

**Main Flow:**
1. Student answers last question OR timer expires
2. System displays "Submit Exam" button (or auto-submits if timer expired)
3. Student clicks "Submit Exam"
4. System displays summary:
   - Questions answered: X/Y
   - Questions flagged: Z
   - Time remaining: MM:SS
5. System prompts: "Submit final exam? This cannot be undone."
6. Student confirms
7. System begins grading process:
   - Auto-grade MC/TF questions
   - Send text responses to LLM for grading (batch)
   - Display progress indicator
8. System receives all LLM responses
9. System calculates total score
10. System saves results
11. System displays results dashboard

**Alternative Flows:**
- **4a.** Some questions unanswered
  - System warns: "{X} questions unanswered. Submit anyway?"
  - If yes: Continue
  - If no: Return to exam
  
- **8a.** LLM grading fails for some questions
  - System displays: "Grading incomplete due to technical issue"
  - System shows partial results
  - Super Admin can re-grade later
  
- **7a.** Timer expired (auto-submit)
  - Skip confirmation prompt
  - Auto-submit all current answers

**Postconditions:**
- Exam session completed
- Results saved with timestamp
- Assessment cannot be resumed
- User can view results
- User can start new attempt

**LLM Grading Prompt:**
```javascript
{
  prompt: `
    Grade this exam response.
    
    Question: ${question.text}
    Rubric: ${question.rubric}
    Key Points: ${question.keyPoints}
    Student Answer: ${studentAnswer}
    Max Points: ${question.points}
    
    Return JSON with:
    {
      "score": <number>,
      "maxScore": <number>,
      "correctAnswer": "<full answer>",
      "feedback": "<why student is wrong>",
      "errors": ["specific error 1", "error 2"],
      "misconception": "<underlying concept misunderstood>",
      "improvement": "<advice for next time>"
    }
  `,
  maxTokens: 800,
  temperature: 0.3  // Lower for consistency
}
```

---

### UC-010: View Results (Student)

**Actor:** Student  
**Preconditions:**
- Assessment completed and graded

**Main Flow:**
1. Student accesses exam from exam list (shows "Completed" badge)
2. Student clicks "View Results"
3. System displays results dashboard:
   - **Header:** Score, percentage, pass/fail, time taken
   - **Breakdown:** By question type and category
   - **Timeline:** Question-by-question review
4. Student scrolls through results
5. For each question, student sees:
   - Question text
   - Their answer
   - Correct answer
   - Points earned / max points
   - Detailed feedback (for text responses)
6. Student can filter/sort:
   - Show only incorrect questions
   - Sort by question type
   - Sort by points lost

**Alternative Flows:**
- **Practice Mode results:**
  - No formal grading
  - Shows mastery status per question
  - Shows total attempts per question
  - Shows overall progress percentage

**Postconditions:**
- Results viewed (timestamp recorded)
- Student has understanding of performance

**UI Elements:**
```
Question #3 (Short Answer) - 3/5 points
─────────────────────────────────────────
Question: Calculate the variance for [2,4,6,8,10]

Your Answer:
"The variance is 12"

Correct Answer:
"Variance = 8 (population) or 10 (sample)"

Feedback:
You used the correct method but made a calculation error.
The squared deviations are: 16, 4, 0, 4, 16.
Sum = 40, divided by 5 = 8 (not 12).

Errors Identified:
• Arithmetic error when summing squared deviations
• Consider double-checking calculations step-by-step

Advice:
Show your work for each step to catch arithmetic errors.
```

---

### UC-011: Export Results (Super Admin)

**Actor:** Super Admin  
**Preconditions:**
- At least one completed assessment exists

**Main Flow:**
1. Super Admin navigates to "Results & Analytics"
2. Super Admin selects export options:
   - Export type: Summary or Detailed
   - Filter: All users or specific user
   - Filter: All exams or specific exam
   - Date range (optional)
3. Super Admin clicks "Export to CSV"
4. System prompts for destination:
   - File browser dialog
   - Default: `ExamResults_{timestamp}.csv`
5. Super Admin selects destination
6. System generates CSV:
   - Compiles results data
   - Formats according to export type
   - Writes to file
7. System displays confirmation: "Exported {X} results to {path}"
8. System offers to open destination folder

**Alternative Flows:**
- **3a.** No results match filters
  - System displays: "No results found matching criteria"
  - Super Admin adjusts filters
  
- **6a.** Write permission denied
  - System displays error: "Cannot write to selected location"
  - System prompts for different destination
  
- **2a.** Export aggregate statistics
  - Include: Average scores, pass rates, time statistics
  - Group by: User, exam, question type, date

**Postconditions:**
- CSV file created at specified location
- No data modified in system

**CSV Format (Summary):**
```csv
UserID,UserName,ExamID,ExamTitle,CompletionDate,Score,MaxScore,Percentage,PassFail,TimeTaken,AttemptNumber,Mode
usr001,Sarah,stats-101,Statistics 101,2026-02-05T14:30:00,85,100,85%,PASS,45:23,1,assessment
usr002,Miguel,audit-ai,AI Audit Training,2026-02-05T15:15:00,92,100,92%,PASS,38:12,2,assessment
```

**CSV Format (Detailed):**
```csv
UserID,ExamID,QuestionID,QuestionType,Question,UserAnswer,CorrectAnswer,PointsEarned,MaxPoints,Feedback
usr001,stats-101,q1,multiple-choice,What is the mean?,B,B,2,2,Correct
usr001,stats-101,q3,short-answer,Calculate variance...,12,8,3,5,Calculation error in sum
```

---

### UC-012: Configure LLM Provider (Super Admin)

**Actor:** Super Admin  
**Preconditions:**
- Super Admin role active

**Main Flow:**
1. Super Admin clicks "Settings" → "LLM Configuration"
2. System displays current configuration:
   - Provider: [Claude / OpenAI / Ollama / LM Studio]
   - API Key: ******** (if applicable)
   - Endpoint: (for local providers)
   - Token usage: X / 500,000
3. Super Admin selects new provider from dropdown
4. **If Claude or OpenAI:**
   - Super Admin enters API key
   - System validates key (test call)
5. **If Ollama or LM Studio:**
   - Super Admin enters local endpoint (e.g., http://localhost:11434)
   - Super Admin selects model from dropdown
   - System tests connection
6. Super Admin clicks "Save Configuration"
7. System displays confirmation: "LLM provider updated to {provider}"
8. System resets token counter

**Alternative Flows:**
- **4a.** Invalid API key
  - System displays: "API key validation failed"
  - Shows error from provider
  - Configuration not saved
  
- **5a.** Cannot connect to local endpoint
  - System displays: "Cannot reach {endpoint}. Is {provider} running?"
  - Provides troubleshooting tips
  - Configuration not saved
  
- **6a.** Test call fails
  - System displays specific error
  - Super Admin can save anyway (override) or cancel

**Postconditions:**
- LLM provider configured
- All future LLM calls use new provider
- Configuration persisted in browser storage

**Configuration Schema:**
```json
{
  "llmConfig": {
    "provider": "claude",
    "apiKey": "sk-ant-...",
    "endpoint": null,
    "model": "claude-sonnet-4-20250514",
    "maxTokensPerSession": 500000,
    "currentTokenUsage": 125430,
    "timeout": 30000,
    "lastUpdated": "2026-02-05T10:00:00Z"
  }
}
```

---

## 3.2 Functional Decomposition

### 3.2.1 Module Hierarchy

```
InteractiveExamSystem
│
├── UserInterface
│   ├── RoleSelector (Student / Super Admin)
│   ├── StudentDashboard
│   │   ├── ExamList
│   │   ├── ExamTaker
│   │   │   ├── QuestionRenderer
│   │   │   │   ├── MultipleChoiceQuestion
│   │   │   │   ├── TrueFalseQuestion
│   │   │   │   ├── ShortAnswerQuestion
│   │   │   │   └── LongAnswerQuestion
│   │   │   ├── NavigationControls
│   │   │   ├── ProgressBar
│   │   │   ├── Timer (Assessment Mode)
│   │   │   └── FeedbackDisplay
│   │   └── ResultsViewer
│   └── SuperAdminDashboard
│       ├── ExamLoader
│       ├── UserManagement
│       ├── ExamAssignment
│       ├── ResultsExporter
│       ├── LLMConfiguration
│       └── ThemeCustomization
│
├── BusinessLogic
│   ├── ExamEngine
│   │   ├── ModeController (Practice / Assessment)
│   │   ├── QuestionValidator
│   │   ├── AnswerEvaluator
│   │   │   ├── ObjectiveGrader (MC/TF)
│   │   │   └── LLMGrader (text responses)
│   │   ├── ScoringCalculator
│   │   └── ProgressTracker
│   ├── LLMService
│   │   ├── ProviderRouter (Claude/OpenAI/Ollama/LMStudio)
│   │   ├── PromptBuilder
│   │   │   ├── PracticeCoachingPrompt
│   │   │   └── AssessmentGradingPrompt
│   │   ├── ResponseParser
│   │   └── TokenCounter
│   └── ValidationEngine
│       ├── ExamSchemaValidator
│       ├── AnswerValidator
│       └── ConfigValidator
│
├── DataAccess
│   ├── StorageManager
│   │   ├── LocalStorageAdapter
│   │   ├── SessionStorageAdapter
│   │   └── IndexedDBAdapter
│   ├── FileSystemService
│   │   ├── LocalFileLoader
│   │   ├── SharePointConnector (office)
│   │   └── CSVExporter
│   └── CacheManager
│       ├── ExamCache
│       └── ResultsCache
│
└── Infrastructure
    ├── LLMConnector
    │   ├── ClaudeClient
    │   ├── OpenAIClient
    │   ├── OllamaClient
    │   └── LMStudioClient
    ├── ConfigurationManager
    ├── ErrorHandler
    ├── Logger
    └── UtilityFunctions
        ├── DateTimeFormatter
        ├── ScoreCalculator
        └── JSONParser
```

### 3.2.2 Data Flow Diagrams

**DFD Level 0: Context Diagram**
```
                    ┌─────────────────┐
                    │                 │
   ┌───────────────►│  Interactive    │◄───────────────┐
   │  Exam JSON     │   Exam System   │  API Key       │
   │                │                 │                │
   │                └─────────────────┘                │
   │                         │                         │
   │                         │                         │
Student/                     │                    Super Admin
Super Admin                  ▼                         
   │                 ┌───────────────┐                 │
   │                 │   LLM APIs    │                 │
   │                 │ Claude/OpenAI │                 │
   │                 │ Ollama/LMStudio│                │
   │                 └───────────────┘                 │
   │                                                    │
   └──────────►  Results CSV  ◄────────────────────────┘
```

**DFD Level 1: Main Processes**
```
┌────────┐         ┌──────────────┐         ┌──────────────┐
│ Exam   │────────►│   Validate   │────────►│    Store     │
│ File   │ JSON    │   & Parse    │  Exam   │   in Cache   │
└────────┘         └──────────────┘  Object └──────────────┘
                                                    │
                   ┌──────────────┐                 │
                   │   Present    │◄────────────────┘
                   │   Questions  │
                   └──────────────┘
                          │
                          │ Answer
                          ▼
                   ┌──────────────┐         ┌──────────────┐
                   │   Evaluate   │────────►│     LLM      │
                   │    Answer    │ Prompt  │   Service    │
                   └──────────────┘         └──────────────┘
                          │                         │
                          │ Score                   │ Feedback
                          ▼                         ▼
                   ┌──────────────┐         ┌──────────────┐
                   │    Update    │         │   Display    │
                   │   Progress   │         │   Feedback   │
                   └──────────────┘         └──────────────┘
                          │
                          │ Complete
                          ▼
                   ┌──────────────┐         ┌──────────────┐
                   │   Generate   │────────►│   Export     │
                   │   Results    │ Results │   to CSV     │
                   └──────────────┘         └──────────────┘
```

**DFD Level 2: LLM Service**
```
                   ┌──────────────┐
                   │  Question +  │
                   │    Answer    │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Build     │
                   │   Prompt     │────── Mode (Practice/Assessment)
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Route     │
                   │ to Provider  │────── LLM Config
                   └──────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────┐       ┌────────┐       ┌────────┐
   │ Claude │       │ OpenAI │       │ Ollama │
   │  API   │       │  API   │       │ Local  │
   └────┬───┘       └────┬───┘       └────┬───┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Parse     │
                   │   Response   │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Increment  │
                   │    Token     │
                   │   Counter    │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Return     │
                   │   Feedback   │
                   └──────────────┘
```

---

## 3.3 State Diagrams

### 3.3.1 Exam Session State Diagram

```
                    ┌───────────┐
                    │   START   │
                    └─────┬─────┘
                          │
                          ▼
                 ┌────────────────┐
                 │  Mode Selection│
                 └────┬───────┬───┘
                      │       │
         Practice Mode│       │Assessment Mode
                      │       │
                      ▼       ▼
          ┌──────────────┐  ┌──────────────┐
          │   Practice   │  │  Assessment  │
          │   Active     │  │   Active     │
          └──────┬───────┘  └──────┬───────┘
                 │                  │
            Unlimited               │ One Attempt
            Attempts                │ Per Question
                 │                  │
                 │                  │ Timer Expires
                 ▼                  ▼
          ┌──────────────┐  ┌──────────────┐
          │  Question    │  │  Question    │
          │  Answered    │  │  Locked      │
          └──────┬───────┘  └──────┬───────┘
                 │                  │
            All Mastered            │ All Answered
                 │                  │
                 ▼                  ▼
          ┌──────────────┐  ┌──────────────┐
          │   Practice   │  │   Grading    │
          │  Completed   │  │  In Progress │
          └──────────────┘  └──────┬───────┘
                                    │
                                    │ LLM Grading Done
                                    ▼
                            ┌──────────────┐
                            │   Results    │
                            │   Available  │
                            └──────┬───────┘
                                   │
                            View Results
                                   │
                                   ▼
                            ┌──────────────┐
                            │   Complete   │
                            │  (Can Retake)│
                            └──────────────┘
```

### 3.3.2 Question State Diagram (Assessment Mode)

```
              ┌──────────────┐
              │  Unanswered  │
              └──────┬───────┘
                     │
              User Enters Answer
                     │
                     ▼
              ┌──────────────┐
              │    Draft     │
              │  (Unsaved)   │
              └──────┬───────┘
                     │
             Submit Answer
                     │
                     ▼
              ┌──────────────┐
           ┌──│  Submitted   │──┐
           │  └──────────────┘  │
  Incorrect│                    │Correct
           │                    │
           ▼                    ▼
    ┌──────────────┐    ┌──────────────┐
    │   Locked     │    │   Locked     │
    │  (Incorrect) │    │  (Correct)   │
    └──────┬───────┘    └──────┬───────┘
           │                    │
           │                    │
           └────────┬───────────┘
                    │
           Exam Submitted
                    │
                    ▼
           ┌──────────────┐
           │    Graded    │
           │ (Final Score)│
           └──────────────┘
```

### 3.3.3 LLM Request State Diagram

```
        ┌──────────────┐
        │   Idle       │
        └──────┬───────┘
               │
        Request Feedback
               │
               ▼
        ┌──────────────┐
        │  Check Token │
        │    Budget    │
        └──────┬───────┘
               │
         ┌─────┴─────┐
   Over Budget    Within Budget
         │             │
         ▼             ▼
  ┌──────────┐  ┌──────────────┐
  │  Show    │  │ Build Prompt │
  │  Error   │  └──────┬───────┘
  └──────────┘         │
                       ▼
                ┌──────────────┐
                │   Call API   │
                └──────┬───────┘
                       │
            ┌──────────┴──────────┐
       Success                 Failure
            │                      │
            ▼                      ▼
     ┌──────────────┐      ┌──────────────┐
     │    Parse     │      │  Retry (3x)  │
     │   Response   │      └──────┬───────┘
     └──────┬───────┘             │
            │               Still Failing
            │                     │
            │                     ▼
            │              ┌──────────────┐
            │              │   Fallback   │
            │              │  (No LLM)    │
            │              └──────┬───────┘
            │                     │
            └──────────┬──────────┘
                       │
                       ▼
                ┌──────────────┐
                │  Increment   │
                │   Tokens     │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │   Return     │
                │  Feedback    │
                └──────────────┘
```

---

# 4. Product Requirements Document (PRD)

## 4.1 Product Vision

### 4.1.1 Vision Statement
Create a universal, AI-enhanced examination platform that adapts to individual learning needs, providing personalized coaching in Practice Mode and rigorous evaluation in Assessment Mode, deployable anywhere from home education to corporate training.

### 4.1.2 Product Goals
1. **Personalized Learning:** Leverage AI to provide individualized feedback that guides learners without revealing answers
2. **Dual-Purpose Assessment:** Support both formative (practice) and summative (assessment) evaluation approaches
3. **Deployment Flexibility:** Work seamlessly in local, offline, and corporate intranet environments
4. **Subject Agnostic:** Support diverse content from elementary mathematics to professional auditing
5. **Privacy First:** Keep exam content and student data within user-controlled boundaries

### 4.1.3 Success Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **User Satisfaction** | 4.5/5 stars | Post-exam survey |
| **Learning Improvement** | 25% avg score increase (practice → assessment) | Score comparison |
| **Time to Competency** | 30% reduction vs traditional methods | Time tracking |
| **System Adoption** | 80% of assigned users complete at least 1 exam | Usage analytics |
| **AI Feedback Quality** | 90% of students find hints helpful | Survey question |
| **Technical Reliability** | 99% uptime (no crashes) | Error logging |

## 4.2 Target Market

### 4.2.1 Primary Markets
1. **Home Education:** Parents teaching children mathematics, science, language arts
2. **Corporate Training:** Organizations upskilling employees (e.g., audit, data analytics, AI)
3. **Self-Directed Learners:** Individuals preparing for certifications or skill development

### 4.2.2 Market Sizing (Estimated)
- **Home Users:** 1M+ homeschooling families globally
- **Corporate Training:** 50K+ mid-to-large organizations with training needs
- **Individual Learners:** 10M+ professional certification seekers

### 4.2.3 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiator |
|------------|-----------|-----------|-------------------|
| **Google Forms/Quiz** | Free, familiar | No AI coaching, limited question types | AI-powered coaching |
| **Quizlet** | Large content library | Subscription-based, online only | Offline capable, custom content |
| **Moodle/Canvas LMS** | Comprehensive features | Complex setup, requires server | Zero setup, single file |
| **Kahoot** | Gamified, engaging | Real-time only, no deep feedback | Asynchronous, detailed feedback |
| **ExamSoft** | Enterprise-grade security | Expensive, locked ecosystem | Affordable, flexible |

**Unique Value Proposition:**  
"The only exam platform that combines AI-powered personalized coaching, offline capability, and zero-infrastructure deployment—from home education to corporate training."

## 4.3 Feature Prioritization (MoSCoW)

### 4.3.1 MUST HAVE (MVP)
- ✅ Dual-mode system (Practice & Assessment)
- ✅ All question types (MC, TF, Short, Long)
- ✅ LLM integration (Claude, OpenAI, Ollama)
- ✅ Progressive hints (Practice Mode)
- ✅ Comprehensive grading (Assessment Mode)
- ✅ Exam loading (JSON file/paste)
- ✅ Multi-user support with privacy
- ✅ Results export (CSV)
- ✅ Timer (Assessment Mode)
- ✅ Token budget management
- ✅ Super Admin configuration
- ✅ White-label theming

### 4.3.2 SHOULD HAVE (v1.1)
- 📝 Question bank reuse across exams
- 📝 Advanced analytics dashboard
- 📝 Spaced repetition recommendations
- 📝 Exam library with search/filter
- 📝 Mobile-responsive design
- 📝 Bulk user import (CSV)
- 📝 Email notifications (exam assigned, results ready)
- 📝 Question randomization
- 📝 Partial credit for text answers

### 4.3.3 COULD HAVE (v2.0)
- 💡 Integration with LMS (Moodle, Canvas)
- 💡 Video/audio question support
- 💡 Collaborative exams (group work)
- 💡 Adaptive difficulty (adjust based on performance)
- 💡 Gamification (badges, leaderboards)
- 💡 Multi-language support
- 💡 OCR for handwritten answers (scanned submissions)
- 💡 Plagiarism detection (text responses)

### 4.3.4 WON'T HAVE (Out of Scope)
- ❌ Proctoring/anti-cheat technology
- ❌ Video call integration
- ❌ Blockchain-based credential verification
- ❌ Social network features
- ❌ User authentication infrastructure (SSO/SAML)
- ❌ Real-time collaborative editing
- ❌ Native mobile apps (iOS/Android)

## 4.4 User Experience Requirements

### 4.4.1 Design Principles
1. **Simplicity First:** Every feature must justify its complexity
2. **Immediate Feedback:** Students see results instantly when possible
3. **Encouraging Tone:** All messaging promotes growth mindset
4. **Transparency:** Users always know what mode they're in and why
5. **Accessibility:** Keyboard navigation, clear contrast, readable fonts

### 4.4.2 User Flows

**Student Flow (Practice Mode):**
```
Login → View Assigned Exams → Select Exam → Choose Practice Mode → 
Read Instructions → Start Exam → Answer Question → Get Instant Feedback → 
Try Again (if wrong) → Get Progressive Hints → Master Question → 
Next Question → Repeat → Finish Practice → View Progress
```

**Student Flow (Assessment Mode):**
```
Login → View Assigned Exams → Select Exam → Choose Assessment Mode → 
Read Warnings → Confirm Understanding → Start Exam (Timer Begins) → 
Answer Question (One Attempt) → Lock Answer → Next Question → Repeat → 
Submit Exam → Wait for Grading → View Results → Review Feedback → 
Decide to Retake or Complete
```

**Super Admin Flow:**
```
Login → Admin Dashboard → Load Exam (JSON) → Validate → Assign to Users → 
Configure LLM Provider → Set Theme → Monitor Progress → Export Results → 
Analyze Performance
```

### 4.4.3 UI/UX Guidelines

**Color Scheme:**
- **Primary (Brand):** Customizable (default: Blue #2563EB)
- **Success:** Green #10B981
- **Warning:** Amber #F59E0B
- **Error:** Red #EF4444
- **Neutral:** Gray scale #F3F4F6 → #111827

**Typography:**
- **Headings:** 24px, 20px, 18px (bold)
- **Body:** 16px (regular)
- **Labels:** 14px (medium)
- **Captions:** 12px (regular)
- **Font Family:** System fonts (San Francisco, Segoe UI, Roboto)

**Spacing:**
- Use 8px grid system (8, 16, 24, 32, 40, 48px)
- Padding: 16px (cards), 24px (sections)
- Margins: 16px (between elements), 32px (between sections)

**Iconography:**
- ✅ Checkmark (correct answer, completed)
- ❌ X mark (incorrect answer)
- 🔒 Lock (answer locked, assessment mode)
- ⚑ Flag (flagged for review)
- 💡 Lightbulb (hint available)
- ⏱️ Timer (assessment mode)
- 📊 Chart (results, analytics)

---

# 5. Technical Architecture Document

## 5.1 System Architecture

### 5.1.1 Architecture Style
**Single-Page Application (SPA) with Client-Side State Management**

The Interactive Exam System follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  (React Components, UI State, User Interactions)        │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                  │
│  (Exam Engine, Validation, Grading, Mode Control)       │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│  (LLM Integration, File I/O, Export, Storage)           │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                    │
│  (localStorage, IndexedDB, File System API)             │
└─────────────────────────────────────────────────────────┘
```

### 5.1.2 Component Architecture

**Technology Stack:**
- **Framework:** React 18+ (embedded in artifact)
- **Language:** JavaScript (ES2020+)
- **Styling:** Tailwind CSS (utility-first)
- **State Management:** React Hooks (useState, useReducer, useContext)
- **Storage:** Browser APIs (localStorage, IndexedDB)
- **Build:** None (single HTML file with inline JS/CSS)

**Key Architectural Decisions:**

| Decision | Rationale |
|----------|-----------|
| React (no build step) | Enables rich interactivity while maintaining single-file distribution |
| No backend | Simplifies deployment, enhances privacy, works offline |
| Browser storage | No database infrastructure needed, works everywhere |
| Modular LLM integration | Easy to swap providers, test locally, support multiple APIs |
| JSON-based exams | Human-readable, version-controllable, easy to create |

### 5.1.3 Deployment Architecture

**Home Deployment:**
```
┌──────────────────┐
│  Local Browser   │
│  (Chrome/Firefox)│
└────────┬─────────┘
         │
         │ Opens HTML file
         ▼
┌──────────────────┐      ┌──────────────────┐
│   exam-app.html  │─────►│ Local Filesystem │
│  (Self-contained)│◄─────│  (Exam JSONs)    │
└────────┬─────────┘      └──────────────────┘
         │
         │ Optional LLM calls
         ▼
┌──────────────────┐
│  Ollama / LM     │
│  Studio (Local)  │
│  localhost:11434 │
└──────────────────┘
```

**Office Deployment:**
```
┌──────────────────┐
│ Corporate Browser│
│  (Edge/Chrome)   │
└────────┬─────────┘
         │
         │ Intranet URL
         ▼
┌──────────────────┐      ┌──────────────────┐
│  SharePoint Site │─────►│   SharePoint     │
│  exam-app.html   │◄─────│   Document Lib   │
└────────┬─────────┘      │  (Exam JSONs)    │
         │                └──────────────────┘
         │ HTTPS API calls
         ▼
┌──────────────────┐
│  Claude / OpenAI │
│    APIs (Cloud)  │
│  or Local Ollama │
└──────────────────┘
```

## 5.2 Data Architecture

### 5.2.1 Data Model (Logical)

**Entity-Relationship Diagram:**
```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │     Exam     │       │  Question   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ userId (PK) │       │ examId (PK)  │       │ questionId  │
│ userName    │       │ title        │       │ (PK)        │
│ role        │       │ subject      │       │ examId (FK) │
│ createdAt   │       │ timeLimit    │       │ type        │
└──────┬──────┘       │ passingScore │       │ text        │
       │              │ version      │       │ points      │
       │              └──────┬───────┘       │ options     │
       │                     │               │ correctAns  │
       │                     │               │ rubric      │
       │              has    │               │ hints       │
       │         ┌───────────┘               └──────┬──────┘
       │         │                                  │
       │         │                                  │
       │         ▼                                  │
       │  ┌──────────────┐                         │
       │  │  Assignment  │                         │
       │  ├──────────────┤                         │
       │  │ userId (FK)  │                         │
       │  │ examId (FK)  │                         │
       │  │ assignedAt   │                         │
       │  │ dueDate      │                         │
       │  └──────┬───────┘                         │
       │         │                                  │
       │         │                                  │
       │  takes  │                          answered in
       │         │                                  │
       ▼         ▼                                  ▼
┌──────────────────┐                    ┌──────────────────┐
│ ExamSession      │────── contains ────│ QuestionResponse │
├──────────────────┤                    ├──────────────────┤
│ sessionId (PK)   │                    │ responseId (PK)  │
│ userId (FK)      │                    │ sessionId (FK)   │
│ examId (FK)      │                    │ questionId (FK)  │
│ mode             │                    │ userAnswer       │
│ startTime        │                    │ isCorrect        │
│ endTime          │                    │ pointsEarned     │
│ score            │                    │ attempts         │
│ status           │                    │ feedback         │
│ attemptNumber    │                    │ timestamp        │
└──────────────────┘                    └──────────────────┘
```

### 5.2.2 Data Storage Strategy

**localStorage (Persistent Configuration):**
```javascript
{
  "appConfig": {
    "theme": {...},
    "llmConfig": {...},
    "lastUser": "usr001"
  },
  "users": [
    {
      "userId": "usr001",
      "userName": "Sarah",
      "role": "student",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**sessionStorage (Current Session):**
```javascript
{
  "currentUser": "usr001",
  "currentExamSession": {
    "sessionId": "ses_20260205_143022",
    "examId": "stats-101",
    "mode": "assessment",
    "startTime": "2026-02-05T14:30:22Z",
    "timeRemaining": 2345,
    "currentQuestionIndex": 4,
    "answers": {...}
  },
  "llmTokenUsage": 125430
}
```

**IndexedDB (Large Data):**
```javascript
// Database: InteractiveExamSystemDB
// Object Stores:

1. exams
   - keyPath: examId
   - Data: Full exam JSON objects

2. examSessions
   - keyPath: sessionId
   - Indexes: userId, examId, status

3. questionResponses
   - keyPath: responseId
   - Indexes: sessionId, questionId

4. results
   - keyPath: resultId
   - Indexes: userId, examId, completionDate
```

**IndexedDB Schema:**
```javascript
const dbSchema = {
  name: "InteractiveExamSystemDB",
  version: 1,
  objectStores: [
    {
      name: "exams",
      keyPath: "examId",
      autoIncrement: false,
      indexes: [
        { name: "subject", keyPath: "subject", unique: false },
        { name: "version", keyPath: "version", unique: false }
      ]
    },
    {
      name: "examSessions",
      keyPath: "sessionId",
      autoIncrement: false,
      indexes: [
        { name: "userId", keyPath: "userId", unique: false },
        { name: "examId", keyPath: "examId", unique: false },
        { name: "status", keyPath: "status", unique: false },
        { name: "startTime", keyPath: "startTime", unique: false }
      ]
    },
    {
      name: "questionResponses",
      keyPath: "responseId",
      autoIncrement: false,
      indexes: [
        { name: "sessionId", keyPath: "sessionId", unique: false },
        { name: "questionId", keyPath: "questionId", unique: false }
      ]
    },
    {
      name: "results",
      keyPath: "resultId",
      autoIncrement: false,
      indexes: [
        { name: "userId", keyPath: "userId", unique: false },
        { name: "examId", keyPath: "examId", unique: false },
        { name: "completionDate", keyPath: "completionDate", unique: false }
      ]
    }
  ]
};
```

### 5.2.3 Data Lifecycle

**Exam Data:**
```
Load → Validate → Cache (IndexedDB) → Use → Persist
```

**Session Data:**
```
Create → Auto-save (every 30s) → Complete → Archive → Exportable
```

**User Data:**
```
Create → Store (localStorage) → Update on activity → Persist indefinitely
```

**Token Usage:**
```
Initialize (0) → Increment per LLM call → Warn at 80% → Block at 100% → Reset on new session
```

## 5.3 API Architecture

### 5.3.1 LLM Provider Abstraction

```javascript
// Base LLM Provider Interface
class LLMProvider {
  async generateResponse(prompt, options) {
    throw new Error("Not implemented");
  }
  
  async validateConfig() {
    throw new Error("Not implemented");
  }
  
  estimateTokens(text) {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}

// Claude Provider
class ClaudeProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.endpoint = "https://api.anthropic.com/v1/messages";
    this.model = "claude-sonnet-4-20250514";
  }
  
  async generateResponse(prompt, options = {}) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 1000,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      text: data.content[0].text,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens
    };
  }
  
  async validateConfig() {
    try {
      await this.generateResponse("Test", { maxTokens: 10 });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// OpenAI Provider
class OpenAIProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.endpoint = "https://api.openai.com/v1/chat/completions";
    this.model = "gpt-4o-mini";
  }
  
  async generateResponse(prompt, options = {}) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{
          role: "user",
          content: prompt
        }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens
    };
  }
  
  async validateConfig() {
    try {
      await this.generateResponse("Test", { maxTokens: 10 });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Ollama Provider (Local)
class OllamaProvider extends LLMProvider {
  constructor(endpoint = "http://localhost:11434", model = "llama2") {
    super();
    this.endpoint = endpoint;
    this.model = model;
  }
  
  async generateResponse(prompt, options = {}) {
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 1000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      text: data.response,
      tokensUsed: this.estimateTokens(prompt + data.response)
    };
  }
  
  async validateConfig() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`);
      if (!response.ok) throw new Error("Cannot connect to Ollama");
      
      const data = await response.json();
      const modelExists = data.models.some(m => m.name === this.model);
      
      if (!modelExists) {
        return { 
          valid: false, 
          error: `Model '${this.model}' not found. Available: ${data.models.map(m => m.name).join(', ')}` 
        };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// LM Studio Provider (Local)
class LMStudioProvider extends LLMProvider {
  constructor(endpoint = "http://localhost:1234", model = "local-model") {
    super();
    this.endpoint = endpoint;
    this.model = model;
  }
  
  async generateResponse(prompt, options = {}) {
    // LM Studio uses OpenAI-compatible API
    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{
          role: "user",
          content: prompt
        }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      tokensUsed: this.estimateTokens(prompt + data.choices[0].message.content)
    };
  }
  
  async validateConfig() {
    try {
      const response = await fetch(`${this.endpoint}/v1/models`);
      if (!response.ok) throw new Error("Cannot connect to LM Studio");
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Provider Factory
class LLMProviderFactory {
  static create(config) {
    switch (config.provider) {
      case "claude":
        return new ClaudeProvider(config.apiKey);
      case "openai":
        return new OpenAIProvider(config.apiKey);
      case "ollama":
        return new OllamaProvider(config.endpoint, config.model);
      case "lmstudio":
        return new LMStudioProvider(config.endpoint, config.model);
      default:
        throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
  }
}
```

### 5.3.2 Prompt Templates

```javascript
const PromptTemplates = {
  practiceCoaching: (question, studentAnswer, attemptNumber, hints, commonMistakes) => `
You are a supportive tutor helping a student learn. The student answered incorrectly.

STRICT RULES:
1. NEVER reveal the correct answer
2. Guide them toward discovering it themselves  
3. Be encouraging and supportive
4. Focus on the learning process

COACHING STRATEGY BY ATTEMPT:
- Attempt 1: Gentle conceptual nudge
- Attempt 2: More specific, identify error type
- Attempt 3+: Very specific guidance (but still no answer)

Question: ${question.text}
Category: ${question.category}
Student's Answer: "${studentAnswer}"
Attempt Number: ${attemptNumber}

Available Hints:
${hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Common Mistakes for This Question:
${commonMistakes.map(m => `- ${m.misconception}: ${m.hint}`).join('\n')}

Provide brief coaching response (2-3 sentences) that helps without giving away the answer. Be warm and encouraging.
`,

  assessmentGrading: (question, rubric, studentAnswer) => `
You are an exam grader providing comprehensive feedback.

Your task:
1. Evaluate the student's answer against the rubric
2. Assign appropriate points based on the grading criteria
3. Explain the correct answer clearly
4. Identify specific errors in the student's response
5. Explain the misconception or reasoning that led to the error
6. Provide constructive advice for future improvement

Question: ${question.text}
Points Available: ${question.points}

Rubric:
${JSON.stringify(rubric, null, 2)}

Expected Key Points:
${rubric.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}

Student's Answer:
"${studentAnswer}"

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": <number between 0 and ${question.points}>,
  "maxScore": ${question.points},
  "correctAnswer": "<the complete correct answer>",
  "feedback": "<detailed explanation of why student's answer is wrong or partially correct>",
  "studentErrors": ["<specific error 1>", "<specific error 2>"],
  "misconception": "<what underlying concept the student misunderstood>",
  "improvement": "<specific advice on how to avoid this mistake in the future>"
}
`
};
```

### 5.3.3 Error Handling Strategy

```javascript
class LLMService {
  constructor(provider, maxTokens = 500000) {
    this.provider = provider;
    this.maxTokens = maxTokens;
    this.currentTokenUsage = this.loadTokenUsage();
  }
  
  async callLLM(prompt, options = {}) {
    // Check token budget
    const estimatedTokens = this.provider.estimateTokens(prompt);
    if (this.currentTokenUsage + estimatedTokens > this.maxTokens) {
      throw new LLMQuotaExceededError(
        `Token limit exceeded: ${this.currentTokenUsage} / ${this.maxTokens}`
      );
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.provider.generateResponse(prompt, {
          ...options,
          timeout: 30000 // 30 second timeout
        });
        
        // Update token usage
        this.currentTokenUsage += response.tokensUsed;
        this.saveTokenUsage();
        
        return response;
        
      } catch (error) {
        lastError = error;
        console.warn(`LLM call attempt ${attempt} failed:`, error);
        
        if (attempt < 3) {
          // Exponential backoff: 1s, 2s, 4s
          await this.sleep(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }
    
    // All retries failed
    throw new LLMServiceError(
      `LLM service unavailable after 3 attempts: ${lastError.message}`
    );
  }
  
  async getCoaching(question, studentAnswer, attemptNumber) {
    try {
      const prompt = PromptTemplates.practiceCoaching(
        question,
        studentAnswer,
        attemptNumber,
        question.hints || [],
        question.commonMistakes || []
      );
      
      const response = await this.callLLM(prompt, {
        maxTokens: 200,
        temperature: 0.7
      });
      
      return {
        coaching: response.text,
        tokensUsed: response.tokensUsed
      };
      
    } catch (error) {
      if (error instanceof LLMQuotaExceededError) {
        // Fallback: Use generic hint from question
        return {
          coaching: this.getFallbackHint(question, attemptNumber),
          tokensUsed: 0,
          fallback: true,
          error: "Token quota exceeded"
        };
      }
      
      // Fallback for other errors
      return {
        coaching: this.getFallbackHint(question, attemptNumber),
        tokensUsed: 0,
        fallback: true,
        error: error.message
      };
    }
  }
  
  async gradeResponse(question, studentAnswer) {
    try {
      const prompt = PromptTemplates.assessmentGrading(
        question,
        question.rubric,
        studentAnswer
      );
      
      const response = await this.callLLM(prompt, {
        maxTokens: 800,
        temperature: 0.3 // Lower temperature for consistent grading
      });
      
      // Parse JSON response
      const grading = JSON.parse(response.text);
      
      // Validate grading structure
      if (!this.isValidGrading(grading, question.points)) {
        throw new Error("Invalid grading structure from LLM");
      }
      
      return {
        ...grading,
        tokensUsed: response.tokensUsed
      };
      
    } catch (error) {
      if (error instanceof LLMQuotaExceededError) {
        // Fallback: Basic rubric-based grading
        return this.getFallbackGrading(question, studentAnswer);
      }
      
      // Fallback for other errors
      return this.getFallbackGrading(question, studentAnswer);
    }
  }
  
  getFallbackHint(question, attemptNumber) {
    if (question.hints && question.hints.length > 0) {
      const hintIndex = Math.min(attemptNumber - 1, question.hints.length - 1);
      return question.hints[hintIndex];
    }
    return "Review the relevant concepts and try again.";
  }
  
  getFallbackGrading(question, studentAnswer) {
    return {
      score: 0,
      maxScore: question.points,
      correctAnswer: question.expectedAnswer || "See rubric",
      feedback: "Automated grading unavailable. Please review the rubric.",
      studentErrors: [],
      misconception: "Cannot determine - LLM unavailable",
      improvement: "Review the rubric and expected answer",
      fallback: true,
      error: "LLM service unavailable"
    };
  }
  
  isValidGrading(grading, maxPoints) {
    return (
      typeof grading.score === 'number' &&
      grading.score >= 0 &&
      grading.score <= maxPoints &&
      typeof grading.correctAnswer === 'string' &&
      typeof grading.feedback === 'string'
    );
  }
  
  loadTokenUsage() {
    const usage = sessionStorage.getItem('llmTokenUsage');
    return usage ? parseInt(usage, 10) : 0;
  }
  
  saveTokenUsage() {
    sessionStorage.setItem('llmTokenUsage', this.currentTokenUsage.toString());
  }
  
  getTokenUsagePercentage() {
    return (this.currentTokenUsage / this.maxTokens) * 100;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom Error Classes
class LLMQuotaExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LLMQuotaExceededError';
  }
}

class LLMServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LLMServiceError';
  }
}
```

## 5.4 Security Architecture

### 5.4.1 Security Measures

**Data Protection:**
- API keys encrypted using Web Crypto API before storing in localStorage
- Exam content never sent to external services (only questions + answers to LLM)
- Results stored locally (no cloud sync)
- No analytics or tracking

**Access Control:**
- Role-based UI rendering (Student vs Super Admin)
- Exam visibility limited by assignment
- Configuration access restricted to Super Admin
- Browser-level isolation (no cross-origin requests)

**Input Validation:**
- JSON schema validation for exam files
- Answer sanitization before LLM submission
- XSS prevention (React auto-escaping)
- File type verification (only .json accepted)

### 5.4.2 Encryption Implementation

```javascript
class CryptoService {
  async encryptAPIKey(apiKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    
    // Generate encryption key from password (user's machine ID)
    const password = await this.getMachineIdentifier();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("interactive-exam-system-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    // Return as base64 (iv + encrypted)
    return {
      iv: this.arrayBufferToBase64(iv),
      data: this.arrayBufferToBase64(encrypted)
    };
  }
  
  async decryptAPIKey(encryptedData) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Recreate key
    const password = await this.getMachineIdentifier();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("interactive-exam-system-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    
    // Decrypt
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const data = this.base64ToArrayBuffer(encryptedData.data);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    return decoder.decode(decrypted);
  }
  
  async getMachineIdentifier() {
    // Use browser fingerprint as encryption password
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('exam-system-id', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    
    // Hash the fingerprint
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }
  
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
```

---

# 6. Use Cases & User Stories

## 6.1 Epics

### Epic 1: Exam Management
As a Super Admin, I need to manage exam content so that I can deliver assessments to students.

**User Stories:**
- US-1.1: Load exam from JSON file
- US-1.2: Paste exam JSON directly
- US-1.3: Select exam from library
- US-1.4: Validate exam schema
- US-1.5: Assign exams to users
- US-1.6: View exam library

### Epic 2: Practice Mode Learning
As a Student, I want to practice with unlimited attempts and coaching so that I can master concepts before assessment.

**User Stories:**
- US-2.1: Start practice mode
- US-2.2: Receive immediate feedback on answers
- US-2.3: Get progressive hints when wrong
- US-2.4: Retry questions unlimited times
- US-2.5: See my mastery progress
- US-2.6: Resume practice session

### Epic 3: Assessment Mode Evaluation
As a Student, I want to take formal assessments with one attempt per question so that I can demonstrate my knowledge.

**User Stories:**
- US-3.1: Start assessment with timer
- US-3.2: Submit one answer per question
- US-3.3: See timer countdown
- US-3.4: Submit exam for grading
- US-3.5: View comprehensive results
- US-3.6: Retake assessment

### Epic 4: AI-Powered Feedback
As a Student, I want AI coaching and grading so that I receive personalized feedback.

**User Stories:**
- US-4.1: Receive coaching hints (Practice Mode)
- US-4.2: Get detailed grading feedback (Assessment Mode)
- US-4.3: Understand my misconceptions
- US-4.4: Receive improvement advice

### Epic 5: Results & Analytics
As a Super Admin, I want to export and analyze results so that I can track learning outcomes.

**User Stories:**
- US-5.1: View aggregate results
- US-5.2: Export results to CSV
- US-5.3: Filter results by user/exam
- US-5.4: Analyze performance trends

### Epic 6: System Configuration
As a Super Admin, I want to configure the system so that it works in my environment.

**User Stories:**
- US-6.1: Select LLM provider
- US-6.2: Configure API keys
- US-6.3: Customize theme
- US-6.4: Manage users
- US-6.5: Monitor token usage

## 6.2 Detailed User Stories

### US-1.1: Load Exam from JSON File

**As a** Super Admin  
**I want to** upload an exam JSON file  
**So that** I can make it available to students

**Acceptance Criteria:**
- [ ] Given I am logged in as Super Admin
- [ ] When I click "Load Exam" button
- [ ] Then I see file upload dialog
- [ ] And I select a .json file
- [ ] And the file contains valid exam schema
- [ ] Then the exam is loaded successfully
- [ ] And I see confirmation message
- [ ] And exam appears in library

**Technical Notes:**
- Use File System Access API
- Validate against JSON schema
- Store in IndexedDB
- Max file size: 5 MB

**Estimation:** 3 story points  
**Priority:** MUST HAVE

---

### US-2.3: Get Progressive Hints When Wrong

**As a** Student  
**I want to** receive increasingly specific hints after wrong answers  
**So that** I can figure out the correct answer myself

**Acceptance Criteria:**
- [ ] Given I am in Practice Mode
- [ ] When I submit an incorrect answer (Attempt 1)
- [ ] Then I receive a gentle conceptual hint
- [ ] And I can try again
- [ ] When I submit incorrect answer (Attempt 2)
- [ ] Then I receive a more specific hint targeting my error
- [ ] And I can try again
- [ ] When I submit incorrect answer (Attempt 3+)
- [ ] Then I receive the most specific hint (without revealing answer)
- [ ] And the hint never contains the actual answer

**Example Flow:**
```
Question: "Calculate variance of [2,4,6,8,10]"
Student: "12" (wrong)

Attempt 1 Hint:
"Think about the formula for variance and how you calculate the mean first."

Student: "15" (still wrong)

Attempt 2 Hint:
"Variance requires you to square the deviations. Did you remember that step?"

Student: "9" (still wrong)

Attempt 3 Hint:
"Mean is 6. Squared deviations are: 16, 4, 0, 4, 16. What do you do next?"
```

**Technical Notes:**
- LLM generates hints based on attempt number
- Fallback to static hints if LLM unavailable
- Track attempt count per question

**Estimation:** 5 story points  
**Priority:** MUST HAVE

---

### US-3.4: Submit Exam for Grading

**As a** Student in Assessment Mode  
**I want to** submit my completed exam  
**So that** it can be graded and I can see my results

**Acceptance Criteria:**
- [ ] Given I am in Assessment Mode
- [ ] And all questions have been attempted (or timer expired)
- [ ] When I click "Submit Exam"
- [ ] Then I see summary of my attempt (questions answered, time used)
- [ ] And I see confirmation dialog: "Submit final exam? This cannot be undone."
- [ ] When I confirm submission
- [ ] Then system grades objective questions immediately
- [ ] And system sends text responses to LLM for grading
- [ ] And I see progress indicator during grading
- [ ] When grading completes
- [ ] Then I see my results dashboard
- [ ] And my results are saved permanently

**Edge Cases:**
- Some questions unanswered → Show warning, allow submit anyway
- LLM grading fails → Show partial results, indicate technical issue
- Timer expires → Auto-submit immediately

**Technical Notes:**
- Batch LLM grading calls for efficiency
- Show loading state during LLM calls
- Handle partial failures gracefully

**Estimation:** 8 story points  
**Priority:** MUST HAVE

---

### US-6.2: Configure API Keys

**As a** Super Admin  
**I want to** securely configure LLM API keys  
**So that** the system can access AI services

**Acceptance Criteria:**
- [ ] Given I am logged in as Super Admin
- [ ] When I navigate to Settings → LLM Configuration
- [ ] Then I see current provider and masked API key
- [ ] When I enter a new API key
- [ ] Then the key is displayed as I type (for verification)
- [ ] When I click "Save"
- [ ] Then system tests the key with a simple API call
- [ ] And if valid, encrypts and stores the key
- [ ] And shows confirmation: "API key configured successfully"
- [ ] And the key is displayed masked (********)

**Security Requirements:**
- API key encrypted before storage (Web Crypto API)
- Test call uses minimal tokens
- Key never logged or sent to analytics
- Key only decrypted when making LLM calls

**Technical Notes:**
- Use CryptoService for encryption
- Store encrypted key in localStorage
- Provide "Show Key" toggle for troubleshooting

**Estimation:** 5 story points  
**Priority:** MUST HAVE

---

## 6.3 Acceptance Test Scenarios

### Test Scenario 1: Complete Practice Mode Flow

**Given:** Sarah (student) has been assigned "Statistics 101" exam

**Steps:**
1. Sarah opens the application
2. Selects "Student" role
3. Sees "Statistics 101" in assigned exams list
4. Clicks on exam
5. Selects "Practice Mode"
6. Reads instructions
7. Clicks "Start"
8. Answers Question 1 (Multiple Choice) incorrectly
9. Sees ✗ and hint: "Think about the definition of mean"
10. Tries again, answers correctly
11. Sees ✓ and "Correct! Great job!"
12. Moves to Question 2 (Short Answer)
13. Enters answer: "Variance is 12"
14. LLM coaching appears: "You're on the right track, but check your calculation of the squared deviations"
15. Sarah revises: "Variance is 8"
16. LLM: "Excellent! You got it."
17. Sarah completes all questions
18. Sees progress: "15/15 questions mastered"
19. Clicks "Finish Practice"

**Expected Outcome:**
- All questions marked as mastered
- Progress saved
- Sarah can retake practice anytime

---

### Test Scenario 2: Complete Assessment Mode Flow

**Given:** Miguel (student) has been assigned "AI Audit Training" exam

**Steps:**
1. Miguel opens application
2. Selects "Student" role
3. Clicks on "AI Audit Training" exam
4. Selects "Assessment Mode"
5. Sees warning: "One attempt per question, 60-minute timer"
6. Confirms understanding
7. Clicks "Begin"
8. Timer starts: 60:00
9. Answers questions sequentially
10. At Question 5, realizes he made an error on Question 2
11. Navigates back to Question 2
12. Sees lock icon: "Answer submitted and locked"
13. Cannot edit answer
14. Returns to Question 5
15. Completes all 20 questions
16. Timer shows: 23:45 remaining
17. Clicks "Submit Exam"
18. Confirms submission
19. Sees grading progress: "Grading 15 text responses..."
20. After 20 seconds, results appear
21. Score: 92/100 (92%)
22. Status: PASS
23. Reviews incorrect questions with detailed feedback

**Expected Outcome:**
- Exam submitted and graded
- Results saved
- Miguel can retake exam (creates new attempt)

---

# 7. Data Dictionary & JSON Schema Specification

## 7.1 Exam JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/schemas/exam.schema.json",
  "title": "Interactive Exam System - Exam Schema",
  "description": "Schema for exam definition JSON files",
  "type": "object",
  "required": ["examMetadata", "questions"],
  "properties": {
    "examMetadata": {
      "type": "object",
      "required": ["id", "title", "subject"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the exam",
          "pattern": "^[a-z0-9-]+$",
          "examples": ["stats-101-midterm", "audit-ai-week3"]
        },
        "title": {
          "type": "string",
          "description": "Human-readable exam title",
          "minLength": 1,
          "maxLength": 200,
          "examples": ["Statistics 101 - Midterm Exam"]
        },
        "subject": {
          "type": "string",
          "description": "Subject area or topic",
          "examples": ["Statistics", "Audit", "Mathematics"]
        },
        "description": {
          "type": "string",
          "description": "Optional detailed description",
          "maxLength": 1000
        },
        "version": {
          "type": "string",
          "description": "Exam version (semantic versioning)",
          "pattern": "^\\d+\\.\\d+(\\.\\d+)?$",
          "default": "1.0",
          "examples": ["1.0", "2.1.3"]
        },
        "author": {
          "type": "string",
          "description": "Exam creator name",
          "examples": ["George"]
        },
        "timeLimit": {
          "type": "integer",
          "description": "Time limit in minutes (Assessment Mode)",
          "minimum": 1,
          "maximum": 480,
          "examples": [60, 90, 120]
        },
        "passingScore": {
          "type": "number",
          "description": "Minimum percentage to pass",
          "minimum": 0,
          "maximum": 100,
          "default": 70,
          "examples": [70, 80, 85]
        },
        "allowedModes": {
          "type": "array",
          "description": "Which modes are enabled for this exam",
          "items": {
            "type": "string",
            "enum": ["practice", "assessment"]
          },
          "minItems": 1,
          "default": ["practice", "assessment"]
        }
      }
    },
    "questions": {
      "type": "array",
      "description": "Array of exam questions",
      "minItems": 1,
      "maxItems": 100,
      "items": {
        "type": "object",
        "required": ["id", "type", "question", "points"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique question identifier within exam",
            "pattern": "^q[0-9]+$",
            "examples": ["q1", "q2", "q15"]
          },
          "type": {
            "type": "string",
            "description": "Question type",
            "enum": ["multiple-choice", "true-false", "short-answer", "long-answer"]
          },
          "category": {
            "type": "string",
            "description": "Topic or category",
            "examples": ["descriptive-stats", "probability", "hypothesis-testing"]
          },
          "difficulty": {
            "type": "string",
            "description": "Difficulty level",
            "enum": ["easy", "medium", "hard"]
          },
          "points": {
            "type": "integer",
            "description": "Points awarded for correct answer",
            "minimum": 1,
            "maximum": 20
          },
          "question": {
            "type": "string",
            "description": "The question text",
            "minLength": 1,
            "maxLength": 2000
          }
        },
        "allOf": [
          {
            "if": {
              "properties": {"type": {"const": "multiple-choice"}}
            },
            "then": {
              "required": ["options", "correctAnswer"],
              "properties": {
                "options": {
                  "type": "array",
                  "description": "Answer choices",
                  "minItems": 2,
                  "maxItems": 10,
                  "items": {"type": "string"}
                },
                "correctAnswer": {
                  "type": "integer",
                  "description": "Index of correct option (0-based)",
                  "minimum": 0
                },
                "explanation": {"type": "string"},
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["misconception", "hint"],
                    "properties": {
                      "misconception": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "true-false"}}
            },
            "then": {
              "required": ["correctAnswer"],
              "properties": {
                "correctAnswer": {
                  "type": "boolean",
                  "description": "True or False"
                },
                "explanation": {"type": "string"},
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["misconception", "hint"],
                    "properties": {
                      "misconception": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "short-answer"}}
            },
            "then": {
              "required": ["rubric", "expectedAnswer"],
              "properties": {
                "maxLength": {
                  "type": "integer",
                  "description": "Maximum character length",
                  "default": 200,
                  "minimum": 50,
                  "maximum": 500
                },
                "rubric": {
                  "type": "object",
                  "required": ["keyPoints"],
                  "properties": {
                    "keyPoints": {
                      "type": "array",
                      "description": "List of key points expected",
                      "items": {"type": "string"}
                    },
                    "gradingCriteria": {
                      "type": "object",
                      "properties": {
                        "correct": {"type": "string"},
                        "partial": {"type": "string"},
                        "incorrect": {"type": "string"}
                      }
                    }
                  }
                },
                "expectedAnswer": {
                  "type": "string",
                  "description": "Model answer"
                },
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["pattern", "hint"],
                    "properties": {
                      "pattern": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "long-answer"}}
            },
            "then": {
              "required": ["rubric", "expectedAnswer"],
              "properties": {
                "maxLength": {
                  "type": "integer",
                  "description": "Maximum character length",
                  "default": 500,
                  "minimum": 200,
                  "maximum": 2000
                },
                "rubric": {
                  "type": "object",
                  "required": ["keyPoints", "gradingCriteria"],
                  "properties": {
                    "keyPoints": {
                      "type": "array",
                      "description": "List of key points expected",
                      "items": {"type": "string"}
                    },
                    "gradingCriteria": {
                      "type": "object",
                      "required": ["excellent", "good", "satisfactory", "needs-improvement", "incorrect"],
                      "properties": {
                        "excellent": {"type": "string"},
                        "good": {"type": "string"},
                        "satisfactory": {"type": "string"},
                        "needs-improvement": {"type": "string"},
                        "incorrect": {"type": "string"}
                      }
                    }
                  }
                },
                "expectedAnswer": {
                  "type": "string",
                  "description": "Model answer"
                },
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["pattern", "hint"],
                    "properties": {
                      "pattern": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    "settings": {
      "type": "object",
      "description": "Optional exam-specific settings",
      "properties": {
        "shuffleQuestions": {
          "type": "boolean",
          "description": "Randomize question order",
          "default": false
        },
        "shuffleOptions": {
          "type": "boolean",
          "description": "Randomize MC/TF options",
          "default": false
        },
        "showProgressBar": {
          "type": "boolean",
          "default": true
        },
        "allowReview": {
          "type": "boolean",
          "description": "Allow reviewing questions before submit",
          "default": true
        },
        "practiceMode": {
          "type": "object",
          "properties": {
            "maxHintsPerQuestion": {
              "type": "integer",
              "minimum": 1,
              "maximum": 5,
              "default": 3
            },
            "showHintsProgressively": {
              "type": "boolean",
              "default": true
            },
            "allowUnlimitedAttempts": {
              "type": "boolean",
              "default": true
            }
          }
        },
        "assessmentMode": {
          "type": "object",
          "properties": {
            "oneAttemptOnly": {
              "type": "boolean",
              "default": true
            },
            "showResultsAfterSubmit": {
              "type": "boolean",
              "default": true
            },
            "allowReviewWithAnswers": {
              "type": "boolean",
              "default": true
            }
          }
        }
      }
    }
  }
}
```

## 7.2 Example Exam JSON

```json
{
  "examMetadata": {
    "id": "stats-101-midterm",
    "title": "Statistics 101 - Midterm Exam",
    "subject": "Statistics",
    "description": "Covers descriptive statistics and probability basics",
    "version": "1.0",
    "author": "George",
    "timeLimit": 60,
    "passingScore": 70,
    "allowedModes": ["practice", "assessment"]
  },
  
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "category": "descriptive-stats",
      "difficulty": "easy",
      "points": 2,
      "question": "What does the mean represent in a dataset?",
      "options": [
        "The middle value when data is ordered",
        "The arithmetic average of all values",
        "The most frequently occurring value",
        "The range of the dataset"
      ],
      "correctAnswer": 1,
      "explanation": "The mean is the arithmetic average, calculated by summing all values and dividing by the count.",
      "hints": [
        "Think about how you calculate this measure from all the data points",
        "It involves adding up all values and dividing",
        "It's also called the 'arithmetic average'"
      ],
      "commonMistakes": [
        {
          "misconception": "Confusing mean with median",
          "hint": "Mean uses ALL values equally, median only cares about the middle position"
        },
        {
          "misconception": "Confusing mean with mode",
          "hint": "Mean is calculated mathematically, mode is simply counted"
        }
      ]
    },
    
    {
      "id": "q2",
      "type": "true-false",
      "category": "probability",
      "difficulty": "medium",
      "points": 2,
      "question": "The probability of two independent events both occurring is found by adding their individual probabilities.",
      "correctAnswer": false,
      "explanation": "For independent events to BOTH occur, you MULTIPLY their probabilities. Addition is used for OR (either event occurring).",
      "hints": [
        "Think about the difference between AND vs OR in probability",
        "Review the multiplication rule for independent events",
        "Consider: if each event has 50% chance, would adding give you 100%?"
      ],
      "commonMistakes": [
        {
          "misconception": "Confusing AND (multiply) with OR (add)",
          "hint": "When BOTH events must occur, use multiplication. When EITHER can occur, use addition."
        }
      ]
    },
    
    {
      "id": "q3",
      "type": "short-answer",
      "category": "descriptive-stats",
      "difficulty": "medium",
      "points": 5,
      "maxLength": 200,
      "question": "Calculate the variance for this dataset: [2, 4, 6, 8, 10]. Show your work.",
      "rubric": {
        "keyPoints": [
          "Calculate mean (which is 6)",
          "Find squared deviations from mean",
          "Sum the squared deviations (should be 40)",
          "Divide by n (population) or n-1 (sample)",
          "Final answer: 8 (population) or 10 (sample)"
        ],
        "gradingCriteria": {
          "correct": "Shows all steps correctly, arrives at 8 or 10 with proper justification",
          "partial": "Correct method but arithmetic error, or correct answer without full work",
          "incorrect": "Wrong formula or major conceptual error"
        }
      },
      "expectedAnswer": "Mean = (2+4+6+8+10)/5 = 30/5 = 6. Squared deviations: (2-6)²=16, (4-6)²=4, (6-6)²=0, (8-6)²=4, (10-6)²=16. Sum = 40. Population variance = 40/5 = 8. Sample variance = 40/4 = 10.",
      "hints": [
        "Start by calculating the mean of all five numbers",
        "Remember: variance measures spread by using SQUARED deviations",
        "Did you square each deviation before averaging them?",
        "Check whether you need population variance (÷n) or sample variance (÷n-1)"
      ],
      "commonMistakes": [
        {
          "pattern": "forgot to square",
          "hint": "Variance uses SQUARED deviations, not absolute values. Did you square each difference?"
        },
        {
          "pattern": "wrong denominator",
          "hint": "Are you calculating population variance (÷5) or sample variance (÷4)? Both are valid if justified."
        },
        {
          "pattern": "calculation error",
          "hint": "Double-check your arithmetic. Verify each squared deviation: 16, 4, 0, 4, 16."
        }
      ]
    },
    
    {
      "id": "q4",
      "type": "long-answer",
      "category": "probability",
      "difficulty": "hard",
      "points": 10,
      "maxLength": 500,
      "question": "A company conducts quality checks on 1000 products. 3% are defective. If you randomly select 2 products without replacement, what is the probability that both are defective? Show your work and explain your reasoning clearly.",
      "rubric": {
        "keyPoints": [
          "Calculate number of defective products (30 out of 1000)",
          "Recognize this is conditional probability (without replacement)",
          "First selection: P(defective) = 30/1000",
          "Second selection: P(defective | first defective) = 29/999",
          "Multiply probabilities: (30/1000) × (29/999)",
          "Calculate final answer ≈ 0.000870 or 0.087%",
          "Explain reasoning step-by-step"
        ],
        "gradingCriteria": {
          "excellent": "All steps shown correctly, clear explanation, correct final answer (9-10 points)",
          "good": "Minor calculation error but method is correct, good explanation (7-8 points)",
          "satisfactory": "Correct approach but missing steps or unclear explanation (5-6 points)",
          "needs-improvement": "Incorrect method or major conceptual gap (1-4 points)",
          "incorrect": "Completely wrong approach or no work shown (0 points)"
        }
      },
      "expectedAnswer": "First, calculate defective products: 3% of 1000 = 0.03 × 1000 = 30 defective products. Since we're selecting without replacement, the probabilities change after the first selection. P(1st defective) = 30/1000 = 0.03. If the first is defective, there are now 29 defective products left out of 999 total. P(2nd defective | 1st defective) = 29/999 ≈ 0.029029. For BOTH events to occur, multiply: P(both defective) = (30/1000) × (29/999) = 870/999000 ≈ 0.0008709 or approximately 0.0871%.",
      "hints": [
        "First step: How many products out of 1000 are defective? Calculate 3% of 1000.",
        "After selecting one defective product, how many remain? How many total products remain?",
        "Remember: 'without replacement' means the second probability is affected by the first selection.",
        "For both events to happen, you need to multiply their probabilities."
      ],
      "commonMistakes": [
        {
          "pattern": "used 30/1000 twice",
          "hint": "After taking one defective product, both the numerator AND denominator change. You can't use 30/1000 for both selections."
        },
        {
          "pattern": "added instead of multiplied",
          "hint": "When BOTH events must occur (not just one or the other), multiply the probabilities."
        },
        {
          "pattern": "wrong percentage calculation",
          "hint": "3% of 1000 = 0.03 × 1000 = 30. Double-check your calculation of defective products."
        },
        {
          "pattern": "ignored without replacement",
          "hint": "The problem states 'without replacement' - this is crucial. The second probability must reflect one less defective product and one less total product."
        }
      ]
    }
  ],
  
  "settings": {
    "shuffleQuestions": false,
    "shuffleOptions": false,
    "showProgressBar": true,
    "allowReview": true,
    "practiceMode": {
      "maxHintsPerQuestion": 3,
      "showHintsProgressively": true,
      "allowUnlimitedAttempts": true
    },
    "assessmentMode": {
      "oneAttemptOnly": true,
      "showResultsAfterSubmit": true,
      "allowReviewWithAnswers": true
    }
  }
}
```

## 7.3 Data Dictionary

### Core Entities

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **User** | Person using the system | userId, userName, role (student/admin) |
| **Exam** | Assessment containing questions | examId, title, subject, timeLimit |
| **Question** | Individual exam item | questionId, type, text, points |
| **ExamSession** | Instance of user taking exam | sessionId, userId, examId, mode |
| **QuestionResponse** | User's answer to a question | responseId, answer, isCorrect, feedback |
| **Result** | Final exam outcome | resultId, score, percentage, completionDate |

### Enumerations

| Enum | Values | Usage |
|------|--------|-------|
| **UserRole** | student, superadmin | Access control |
| **QuestionType** | multiple-choice, true-false, short-answer, long-answer | Question rendering |
| **ExamMode** | practice, assessment | Behavioral differences |
| **SessionStatus** | in-progress, completed, abandoned | Track completion |
| **Difficulty** | easy, medium, hard | Question classification |

### Relationships

```
User (1) ─── has ─── (N) ExamSession
Exam (1) ─── contains ─── (N) Question
ExamSession (1) ─── generates ─── (N) QuestionResponse
ExamSession (1) ─── produces ─── (1) Result
User (N) ─── assigned ─── (N) Exam  [Assignment table]
```

---

# 8. Appendices

## 8.1 Glossary

| Term | Definition |
|------|------------|
| **Assessment Mode** | Formal evaluation mode with one attempt per question and timer |
| **Coaching** | AI-generated hints that guide without revealing answers (Practice Mode) |
| **Grading** | AI-generated comprehensive feedback with correct answers (Assessment Mode) |
| **LLM** | Large Language Model (AI system for text generation) |
| **Practice Mode** | Learning-focused mode with unlimited attempts and progressive hints |
| **Progressive Hints** | Increasingly specific guidance based on attempt number |
| **Rubric** | Grading criteria defining expectations for text responses |
| **Super Admin** | User role with configuration and export privileges |
| **Token** | Unit of text processed by LLM (roughly 4 characters) |
| **White Label** | Customizable branding and theme |

## 8.2 Acronyms

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| CSV | Comma-Separated Values |
| FRS | Functional Requirements Specification |
| JSON | JavaScript Object Notation |
| LLM | Large Language Model |
| LMS | Learning Management System |
| MC | Multiple Choice |
| MVP | Minimum Viable Product |
| PRD | Product Requirements Document |
| SA | Short Answer |
| SPA | Single-Page Application |
| SRS | Software Requirements Specification |
| TF | True/False |
| UI | User Interface |
| URD | User Requirements Document |
| UX | User Experience |

## 8.3 References

**Standards:**
- JSON Schema Draft 07: https://json-schema.org/
- React 18 Documentation: https://react.dev/
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

**LLM Provider Documentation:**
- Claude API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs/
- Ollama: https://ollama.ai/
- LM Studio: https://lmstudio.ai/

**Best Practices:**
- Prompt Engineering Guide: https://www.promptingguide.ai/
- Accessible Web Design: https://www.w3.org/WAI/
- JSON Schema Best Practices: https://json-schema.org/understanding-json-schema/

## 8.4 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-05 | George | Initial comprehensive requirements documentation |

## 8.5 Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | George | ____________ | ______ |
| **Technical Lead** | George | ____________ | ______ |
| **Stakeholder** | _____ | ____________ | ______ |

---

## 8.6 Document Maintenance

**Ownership:** George  
**Review Frequency:** Quarterly or upon significant scope changes  
**Distribution:** Internal use (home and office)  
**Classification:** Internal - Not for external distribution

**Change Request Process:**
1. Identify requirement change
2. Document impact analysis
3. Update relevant sections
4. Increment version number
5. Communicate to stakeholders

---

**END OF REQUIREMENTS DOCUMENTATION**

Total Pages: [TBD based on formatting]  
Total Word Count: ~20,000 words  
Total Sections: 8 major sections with subsections

This comprehensive requirements documentation provides a complete foundation for developing the Interactive Exam System, covering all aspects from user needs to technical architecture.

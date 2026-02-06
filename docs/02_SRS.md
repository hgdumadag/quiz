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


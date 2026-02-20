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


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


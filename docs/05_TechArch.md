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

